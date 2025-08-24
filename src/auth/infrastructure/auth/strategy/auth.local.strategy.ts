import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { LoginUserUsecase } from 'src/auth/application/usecase/auth.use-case';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
    constructor(private readonly loginUseCase: LoginUserUsecase) {
        super({ 
            usernameField: 'email',
            passReqToCallback: true // ✅ This allows us to access the request object
        });
    }

    // ✅ Fixed signature: request is passed as first parameter when passReqToCallback: true
    async validate(request: any, email: string, password: string) {
        try {
            const user = await this.loginUseCase.login(request, email, password);
            
            if (!user.success || !user.data) {
                throw new UnauthorizedException('Invalid email or password');
            }
            
            return user.data; // This will be attached to request.user
        } catch (error) {
            // Re-throw the error so Passport handles it properly
            throw error;
        }
    }
}