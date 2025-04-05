import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserJwtEntity } from 'src/auth/domain/types/user-entity.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
        const jwtSecret = configService.get<string>('JWT_SECRET');


        if (!jwtSecret) {
            throw new Error('❌ JWT_SECRET is missing in JwtStrategy!');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtSecret,  // 🔥 Ensure this is set
        });
    }

    async validate(payload: UserJwtEntity) {
        return { 
            user_id: payload.user_id, 
            email: payload.email, 
            account_status: payload.account_status, 
            user_role: payload.user_role 
        };
    }
}
