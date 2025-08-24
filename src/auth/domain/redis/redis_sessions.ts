import Redis from "ioredis";
import { Inject, Injectable } from '@nestjs/common';
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";
import { ActiveSession, SessionData } from "../entity/session_entity";
import { randomUUID } from "crypto";

@Injectable()
export class RedisSessionCreation {
    MAX_SESSIONS = {
        'auctioneer': 2,
        'admin': 2,
        'bidder': 5,
    };

    constructor(
        @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
        private readonly logger: ApplicationLogger,
    ) { }

    /**
     * Get session data by session ID
     */
    async getSessionById(session_id: string): Promise<{ valid: boolean; session?: SessionData; message?: string }> {
        try {
            const session_data = await this.redisClient.hget(`global_session:${session_id}`, 'data');
            
            if (!session_data) {
                this.logger.error(`Invalid session id ${session_id}`);
                return { valid: false, message: 'Session not found' };
            }

            const sessionObj: SessionData = JSON.parse(session_data);
            
            // Update last activity
            sessionObj.last_activity = Date.now();
            await this.redisClient.hset(`global_session:${session_id}`, 'data', JSON.stringify(sessionObj));
            
            return { valid: true, session: sessionObj };
        } catch (error) {
            this.logger.error(`Error getting session ${session_id}:`, error.stack);
            return { valid: false, message: 'Session validation failed' };
        }
    }

    /**
     * Get all active sessions for a specific user
     */
    async getAllSessionsByUser(user_id: string, user_role: string): Promise<ActiveSession[]> {
        try {
            const userSessionsKey = `user_sessions:${user_role}:${user_id}`;
            const sessions = await this.redisClient.hgetall(userSessionsKey);
            
            const activeSessions: ActiveSession[] = [];
            
            for (const [sessionId, sessionData] of Object.entries(sessions)) {
                try {
                    const session = JSON.parse(sessionData);
                    if (session.status === 'active') {
                        activeSessions.push({
                            sessionId: sessionId,
                            ...session
                        });
                    }
                } catch (parseError) {
                    this.logger.warn(`Failed to parse session data for ${sessionId}:`, parseError);
                }
            }
            
            return activeSessions;
        } catch (error) {
            this.logger.error(`Error getting sessions for user ${user_id}:`, error.stack);
            return [];
        }
    }

    /**
     * Create a new session with proper session limit management
     */
    async createSession(
        user_id: string,
        user_role: string,
        account_type: string,
        browser_info: string,
        location: SessionData["location"],
        ip_address: string
    ): Promise<{ session_id: string; session_data: SessionData }> {
        try {
            // Generate a unique session ID
            const timestamp = Date.now();
            const session_id = `session:${user_id}:${timestamp}:${randomUUID()}`;

            const maxSessions: number = Number(this.MAX_SESSIONS[user_role] || 5);

            // Check current active sessions for this user
            const activeSessionsKey = `active_sessions:${user_role}:${user_id}`;
            const currentSessions = await this.redisClient.smembers(activeSessionsKey);

            // If we exceed max sessions, remove the oldest one
            if (currentSessions.length >= maxSessions) {
                await this._removeOldestSession(user_id, user_role, currentSessions);
            }

            // Build session data
            const session_data: SessionData = {
                user_id,
                user_role,
                account_type,
                ip_address,
                browser_info,
                created_at: timestamp,
                last_activity: timestamp,
                status: "active",
                location,
            };

            // Store session data in multiple places for efficient access
            
            // 1. User-specific sessions (Hash)
            const userSessionsKey = `user_sessions:${user_role}:${user_id}`;
            await this.redisClient.hset(userSessionsKey, session_id, JSON.stringify(session_data));
            
            // 2. Active sessions tracking (Set)
            await this.redisClient.sadd(activeSessionsKey, session_id);
            
            // 3. Global session lookup (Hash)
            await this.redisClient.hset(`global_session:${session_id}`, 'data', JSON.stringify(session_data));

            // Set expiry for global session (24 hours)
            await this.redisClient.expire(`global_session:${session_id}`, 24 * 60 * 60);
            
            // Set expiry for user sessions (24 hours)
            await this.redisClient.expire(userSessionsKey, 24 * 60 * 60);
            
            // Set expiry for active sessions set (24 hours)
            await this.redisClient.expire(activeSessionsKey, 24 * 60 * 60);

            this.logger.log(`Session created successfully for user_id: ${user_id}, session_id: ${session_id}`);

            return { session_id, session_data };
        } catch (error) {
            this.logger.error(`Failed to create session for user_id: ${user_id}`, error.stack);
            throw error;
        }
    }

    /**
     * Remove the oldest session when limit is exceeded
     */
    private async _removeOldestSession(user_id: string, user_role: string, currentSessions: string[]): Promise<void> {
        try {
            let oldestSession: string | null = null;
            let oldestTimestamp = Infinity;

            // Find the oldest session by parsing timestamps
            for (const sessionId of currentSessions) {
                const parts = sessionId.split(':');
                if (parts.length >= 3) {
                    const timestamp = parseInt(parts[2]);
                    if (!isNaN(timestamp) && timestamp < oldestTimestamp) {
                        oldestTimestamp = timestamp;
                        oldestSession = sessionId;
                    }
                }
            }

            if (oldestSession) {
                await this.destroySession(oldestSession, user_id, user_role);
                this.logger.log(`Removed oldest session ${oldestSession} for user ${user_id}`);
            }
        } catch (error) {
            this.logger.error(`Error removing oldest session for user ${user_id}:`, error.stack);
        }
    }

    /**
     * Destroy a specific session
     */
    async destroySession(session_id: string, user_id: string, user_role: string): Promise<{ success: boolean; message: string }> {
        try {
            // Remove from user sessions
            await this.redisClient.hdel(`user_sessions:${user_role}:${user_id}`, session_id);
            
            // Remove from active sessions set
            await this.redisClient.srem(`active_sessions:${user_role}:${user_id}`, session_id);
            
            // Remove global session
            await this.redisClient.del(`global_session:${session_id}`);

            this.logger.log(`Session ${session_id} destroyed successfully for user ${user_id}`);
            return { success: true, message: 'Session destroyed successfully' };
        } catch (error) {
            this.logger.error(`Session destruction failed for ${session_id}:`, error.stack);
            throw error;
        }
    }

    /**
     * Check current session count and limits for a user
     */
    async checkSessionLimit(user_id: string, user_role: string): Promise<{
        withinLimit: boolean;
        currentCount: number;
        maxAllowed: number;
    }> {
        try {
            const maxSessions = this.MAX_SESSIONS[user_role] || 5;
            const activeSessionsKey = `active_sessions:${user_role}:${user_id}`;
            const currentCount = await this.redisClient.scard(activeSessionsKey);

            return {
                withinLimit: currentCount < maxSessions,
                currentCount: currentCount,
                maxAllowed: maxSessions
            };
        } catch (error) {
            this.logger.error(`Error checking session limit for user ${user_id}:`, error.stack);
            return {
                withinLimit: false,
                currentCount: 0,
                maxAllowed: this.MAX_SESSIONS[user_role] || 5
            };
        }
    }

    /**
     * Update session activity timestamp
     */
    async updateSessionActivity(session_id: string): Promise<boolean> {
        try {
            const sessionData = await this.redisClient.hget(`global_session:${session_id}`, 'data');
            
            if (!sessionData) {
                return false;
            }

            const session: SessionData = JSON.parse(sessionData);
            session.last_activity = Date.now();

            await this.redisClient.hset(`global_session:${session_id}`, 'data', JSON.stringify(session));
            return true;
        } catch (error) {
            this.logger.error(`Error updating session activity for ${session_id}:`, error.stack);
            return false;
        }
    }

    /**
     * Deactivate a session without fully destroying it
     */
    async deactivateSession(session_id: string, user_id: string, user_role: string): Promise<{ success: boolean; message: string }> {
        try {
            // Get session data
            const sessionData = await this.redisClient.hget(`global_session:${session_id}`, 'data');
            
            if (!sessionData) {
                return { success: false, message: 'Session not found' };
            }

            const session: SessionData = JSON.parse(sessionData);
            session.status = 'inactive';
            session.last_activity = Date.now();

            // Update session data
            await this.redisClient.hset(`global_session:${session_id}`, 'data', JSON.stringify(session));
            await this.redisClient.hset(`user_sessions:${user_role}:${user_id}`, session_id, JSON.stringify(session));
            
            // Remove from active sessions set
            await this.redisClient.srem(`active_sessions:${user_role}:${user_id}`, session_id);

            this.logger.log(`Session ${session_id} deactivated for user ${user_id}`);
            return { success: true, message: 'Session deactivated successfully' };
        } catch (error) {
            this.logger.error(`Error deactivating session ${session_id}:`, error.stack);
            return { success: false, message: 'Failed to deactivate session' };
        }
    }

    /**
     * Clean up expired sessions (should be called periodically)
     */
    async cleanupExpiredSessions(): Promise<void> {
        try {
            const pattern = 'global_session:*';
            const sessionKeys = await this.redisClient.keys(pattern);

            for (const sessionKey of sessionKeys) {
                const ttl = await this.redisClient.ttl(sessionKey);
                
                if (ttl === -2) { // Session expired
                    const sessionId = sessionKey.replace('global_session:', '');
                    
                    // Get session data to extract user info for cleanup
                    const sessionData = await this.redisClient.hget(sessionKey, 'data');
                    if (sessionData) {
                        const session: SessionData = JSON.parse(sessionData);
                        await this.destroySession(sessionId, session.user_id, session.user_role);
                    }
                }
            }

            this.logger.log('Session cleanup completed');
        } catch (error) {
            this.logger.error('Session cleanup failed:', error.stack);
        }
    }
}