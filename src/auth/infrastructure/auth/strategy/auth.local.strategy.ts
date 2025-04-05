import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';  // ✅ Use the correct strategy
import { LoginUserUsecase } from 'src/auth/application/usecase/auth.use-case';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {  // ✅ Fix here
    constructor(private readonly loginUseCase: LoginUserUsecase) {
        super({ usernameField: 'email' }); // ✅ Ensure login is done via email
    }

    async validate(email: string, password: string) {
        const user = await this.loginUseCase.login(email, password);
        if (!user.success) {
            throw new UnauthorizedException('Invalid email or password');
        }
        return user.data; // ✅ Return validated user
    }
}
