import { Injectable, UnauthorizedException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { login_response } from "src/auth/domain/types/login.type";
import { UserJwtEntity } from "src/auth/domain/types/user-entity.type";
import { LoginUser } from "src/auth/infrastructure/persistance/prisma/loginPrisma.repository";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";
import { PasswordHasher } from "src/shared/utils/password.hasher";
import { TokenService } from "src/shared/utils/token.service";

@Injectable()
export class LoginUserUsecase {
    constructor(
        private readonly logger: ApplicationLogger,
        private readonly tokenService: TokenService,
        private readonly loginService: LoginUser,
        private readonly decrypt: PasswordHasher
    ) {}

    async login(email: string, password: string): Promise<login_response<string | null, UserJwtEntity | null>> {
        try {
            const user = await this.loginService.getUser(email);
    
            if (!user.success) {
                if (user.status === 404) {
                    throw new NotFoundException(user.message || "User not found");
                }
                throw new InternalServerErrorException(user.message || "Database error");
            }
    
            if (!user.data) {
                throw new InternalServerErrorException("User data missing from database");
            }
    
            const { user_id, email: userEmail, password: hashedPassword, account_status, user_role } = user.data;
    
            const isPasswordValid = await this.decrypt.compare(password, hashedPassword);
            if (!isPasswordValid) {
                throw new UnauthorizedException("Invalid credentials. Please check your email and password.");
            }
    
            const jwtUserData: UserJwtEntity = {
                user_id,
                email: userEmail,
                account_status,
                user_role
            };
    
            const token = this.tokenService.generateJwtToken(jwtUserData);
    
            return {
                success: true,
                status: 200,
                message: "User logged in successfully",
                token,
                data: jwtUserData
            };
    
        } catch (error) {
            this.logger.error(`Error during user login: ${error.message}`, error);
            console.log(error);
    
            // ❌ Don't return an object, instead throw the actual exception
            if (error instanceof UnauthorizedException || error instanceof NotFoundException) {
                throw error;  // 🚀 This makes NestJS handle the error properly
            }
    
            throw new InternalServerErrorException("Internal server error. Please try again later.");
        }
    }
    
}