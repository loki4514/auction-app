import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { UserJwtEntity } from 'src/auth/domain/types/user-entity.type';

@Injectable()
export class TokenService {
    private readonly secretKey: string;
    private readonly jwtSecret: string;

    constructor(private configService: ConfigService) {
        this.secretKey = this.configService.get<string>('TOKEN_SECRET')!;
        this.jwtSecret = this.configService.get<string>('JWT_SECRET')!;

        if (!this.jwtSecret) {
            throw new Error('❌ JWT_SECRET is missing in TokenService!');
        }
        if (!this.secretKey) {
            throw new Error('❌ TOKEN_SECRET is missing in TokenService!');
        }
    }

    generateVerificationToken(length = 32): string {
        return crypto.randomBytes(length).toString('hex');
    }

    hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    generateTimedToken(userId: string): string {
        try {
            const timestamp = Date.now().toString(); // Add timestamp to make it unique
            const randomSalt = crypto.randomBytes(16).toString('hex'); // Add randomness
            const payload = `${userId}.${timestamp}.${randomSalt}`;
            
            return crypto.createHmac('sha256', this.secretKey).update(payload).digest('hex');
        } catch (error) {
            throw new Error('Error generating timed token');
        }
    }

    verifyTimedToken(token: string): boolean {
        try {
            const [hash, payload] = token.split('.');
            const expectedHash = crypto.createHmac('sha256', this.secretKey).update(payload).digest('hex');
            const [userId, expiry] = payload.split('.');

            if (expectedHash !== hash) return false;
            if (Date.now() > parseInt(expiry)) return false;

            return true;
        } catch (error) {
            return false;
        }
    }

    generateJwtToken(payload: object, expiresIn = '10d'): string {
        console.log('✅ Generating JWT with secret:', this.jwtSecret);
        try {
            return jwt.sign(payload, this.jwtSecret, { expiresIn });
        } catch (error) {
            throw new Error('Error generating JWT token');
        }
    }

    verifyJwtToken(token: string) {
        try {
            const decoded  = jwt.verify(token, this.jwtSecret) as jwt.JwtPayload;
            if (!decoded || !decoded.user_id || !decoded.email) {
                return { flag: false, reason: "Invalid token payload." };
            }
    
            // ✅ Convert JwtPayload to UserJwtEntity
            const userData: UserJwtEntity = {
                user_id: decoded.user_id,
                email: decoded.email,
                account_status: decoded.account_status || "active",
                user_role: decoded.user_role || "bidder",
            };

            return { flag: true, decoded: userData };
     // ✅ Token is valid
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return { flag: false, reason: 'Your session has expired. Please log in again.' };  
            }
            if (error.name === 'JsonWebTokenError') {
                return { flag: false, reason: 'Invalid authentication token. Please provide a valid token.' };  
            }
            return { flag: false, reason: 'Unable to verify authentication. Please try again later.' };  
        }
    }
    
}
