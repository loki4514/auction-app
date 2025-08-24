import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { LoginUserJwtEntity } from 'src/auth/domain/types/user-entity.type';
import { RedisSessionCreation } from 'src/auth/domain/redis/redis_sessions';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly sessionLogin: RedisSessionCreation
    ) {
        const jwtSecret = configService.get<string>('JWT_SECRET');

        if (!jwtSecret) {
            throw new Error('❌ JWT_SECRET is missing in JwtStrategy!');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtSecret,
        });
    }

    async validate(payload: LoginUserJwtEntity) {
        try {
            // Validate that the session exists and is active
            const sessionResult = await this.sessionLogin.getSessionById(payload.session_id);
            
            if (!sessionResult.valid || !sessionResult.session) {
                throw new UnauthorizedException('Invalid or expired session');
            }

            const session = sessionResult.session;

            // Additional session validations
            if (session.status !== 'active') {
                throw new UnauthorizedException('Session is not active');
            }

            // Validate that the session belongs to the JWT user
            if (session.user_id !== payload.user_id) {
                throw new UnauthorizedException('Session user mismatch');
            }

            // Check if session has expired (optional - if you want additional time-based validation)
            const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            const isSessionExpired = (Date.now() - session.last_activity) > SESSION_TIMEOUT;
            
            if (isSessionExpired) {
                // Clean up expired session
                await this.sessionLogin.destroySession(payload.session_id, payload.user_id, payload.user_role);
                throw new UnauthorizedException('Session has expired');
            }

            // Return the validated user data that will be available in request.user
            return {
                id: payload.user_id,
                email: payload.email,
                account_status: payload.account_status,
                user_role: payload.user_role,
                full_name: payload.full_name,
                session_id: payload.session_id,
                session_data: session // Optional: include session data if needed
            };

        } catch (error) {
            // Log the error for debugging
            console.error('JWT validation error:', error.message);
            
            // If it's already an UnauthorizedException, re-throw it
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            
            // For any other error, throw a generic unauthorized exception
            throw new UnauthorizedException('Authentication failed');
        }
    }
}