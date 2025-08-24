import { Injectable, UnauthorizedException, InternalServerErrorException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { RedisSessionCreation } from "src/auth/domain/redis/redis_sessions";
import { login_response } from "src/auth/domain/types/login.type";
import { UserJwtEntity, LoginUserJwtEntity } from "src/auth/domain/types/user-entity.type";
import { LoginUser } from "src/auth/infrastructure/persistance/prisma/loginPrisma.repository";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";
import { PasswordHasher } from "src/shared/utils/password.hasher";
import { RequestInfoService } from "src/shared/utils/request_meta_data";
import { TokenService } from "src/shared/utils/token.service";
import { Request } from "express"

// Extended interface to include session info

@Injectable()
export class LoginUserUsecase {
    constructor(
        private readonly logger: ApplicationLogger,
        private readonly tokenService: TokenService,
        private readonly loginService: LoginUser,
        private readonly decrypt: PasswordHasher,
        private readonly redisSessions: RedisSessionCreation,
        private readonly requestMeta: RequestInfoService
    ) { }

    async login(request: Request, email: string, password: string): Promise<login_response<string | null, LoginUserJwtEntity | null>> {
        try {
            const user = await this.loginService.getUser(email);

            // Always handle failure the same way
            if (!user.success || !user.data) {
                // Don't reveal if email exists or not
                throw new UnauthorizedException('Invalid email or password.');
            }

            const { user_id, email: userEmail, password: hashedPassword, account_status, user_role, full_name } = user.data;

            // Validate password
            const isPasswordValid = await this.decrypt.compare(password, hashedPassword);
            if (!isPasswordValid) {
                // Same error for wrong password
                throw new UnauthorizedException('Invalid email or password.');
            }

            // Check account status
            if (account_status !== 'active') {
                throw new ForbiddenException('Account is not active. Please contact support.');
            }

            // Check session limits before creating new session
            const current_sessions = await this.redisSessions.checkSessionLimit(user_id, user_role);
            if (!current_sessions.withinLimit) {
                throw new ForbiddenException(
                    `Maximum session limit reached (${current_sessions.maxAllowed}). Please logout from another device.`
                );
            }

            // Extract request metadata
            const requestInfo = await this.requestMeta.extractRequestInfo(request);

            // Determine account_type based on user_role
            const account_type = this.mapUserRoleToAccountType(user_role);

            // Create new session
            const sessionResult = await this.redisSessions.createSession(
                user_id,
                user_role,
                account_type,
                requestInfo.userAgent,
                requestInfo.location,
                requestInfo.ip
            );

            // Prepare JWT payload with session info
            const jwtUserData: LoginUserJwtEntity = {
                user_id,
                email: userEmail,
                account_status,
                user_role,
                full_name,
                session_id: sessionResult.session_id
            };

            // Generate JWT token
            const token = this.tokenService.generateJwtToken(jwtUserData);

            this.logger.log(`User ${userEmail} logged in successfully with session ${sessionResult.session_id}`);

            return {
                success: true,
                status: 200,
                message: "User logged in successfully",
                token,
                data: jwtUserData
            };

        } catch (error) {
            this.logger.error(`Error during user login: ${error.message}`, error);
            
            // Re-throw known exceptions
            if (error instanceof UnauthorizedException || 
                error instanceof ForbiddenException || 
                error instanceof NotFoundException) {
                throw error;
            }
            
            // Handle unexpected errors
            throw new InternalServerErrorException('Internal server error. Please try again later.');
        }
    }

    /**
     * Map user role to account type based on business logic
     * admin/auctioneer -> auctioneer
     * bidder -> bidder
     */
    private mapUserRoleToAccountType(user_role: string): string {
        switch (user_role.toLowerCase()) {
            case 'admin':
            case 'auctioneer':
                return 'auctioneer';
            case 'bidder':
                return 'bidder';
            default:
                // Default to bidder if role is not recognized
                this.logger.warn(`Unknown user role: ${user_role}, defaulting to bidder account type`);
                return 'bidder';
        }
    }

    /**
     * Logout user by destroying the session
     */
    async logout(session_id: string, user_id: string, user_role: string): Promise<{ success: boolean; message: string }> {
        try {
            const result = await this.redisSessions.destroySession(session_id, user_id, user_role);
            
            if (result.success) {
                this.logger.log(`User ${user_id} logged out successfully from session ${session_id}`);
            }
            
            return result;
        } catch (error) {
            this.logger.error(`Error during logout for user ${user_id}:`, error);
            throw new InternalServerErrorException('Logout failed. Please try again.');
        }
    }

    /**
     * Get all active sessions for a user (useful for account management)
     */
    async getUserActiveSessions(user_id: string, user_role: string) {
        try {
            const sessions = await this.redisSessions.getAllSessionsByUser(user_id, user_role);
            return {
                success: true,
                data: sessions,
                message: 'Active sessions retrieved successfully'
            };
        } catch (error) {
            this.logger.error(`Error fetching active sessions for user ${user_id}:`, error);
            throw new InternalServerErrorException('Failed to retrieve active sessions');
        }
    }

    /**
     * Force logout from a specific session
     */
    async forceLogoutFromSession(session_id: string, user_id: string, user_role: string) {
        try {
            const result = await this.redisSessions.destroySession(session_id, user_id, user_role);
            
            if (result.success) {
                this.logger.log(`Force logout successful for user ${user_id} from session ${session_id}`);
            }
            
            return result;
        } catch (error) {
            this.logger.error(`Error during force logout for user ${user_id}:`, error);
            throw new InternalServerErrorException('Force logout failed');
        }
    }
}