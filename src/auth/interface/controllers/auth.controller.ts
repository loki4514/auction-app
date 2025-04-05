import { Controller, Post, Req, UseGuards, UsePipes, Body, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { LoginUserUsecase } from 'src/auth/application/usecase/auth.use-case';
import { JwtAuthGuard } from 'src/auth/infrastructure/auth/guard/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/infrastructure/auth/guard/login-auth.guard';
import { ZodValidationPipe } from 'src/shared/pipes/zod-validation.pipe';
import { AuthDtoType, LoginAuthDto } from '../dto/login.dto';
import { AdminOnly, AuctionGuard } from 'src/auth/infrastructure/auth/guard/rabc.guard';

@Controller('user/auth')
export class AuthController {
    constructor(private readonly loginUsecase: LoginUserUsecase) { }

    // 🔐 Login route using Local Strategy

    @Post('login')
    @UsePipes(new ZodValidationPipe(LoginAuthDto)) // Ensure Zod runs first
    async login(@Body() body: AuthDtoType) {
        try {
            console.log("\n🔥 Login Attempt Received!");
            console.log("🔹 Received Body:", body);

            const { email, password } = body;
            const result = await this.loginUsecase.login(email, password);

            console.log("🔹 Login Result:", result);

            if (!result.success) {
                throw new HttpException(
                    {
                        ...result
                    },
                    result.status || HttpStatus.UNAUTHORIZED
                );
            }

            return {
                success: true,
                message: 'Login successful!',
                status: HttpStatus.OK,
                data: result.data,
                token: result.token // Include token or user details
            };
        } catch (error) {
            console.log("❌ Login Error:", error.message);

            throw new HttpException(
                {
                    success: false,
                    message: error.message || 'Internal Server Error',
                    status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    error: error.response || 'Unexpected error occurred',
                },
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // 🔒 Protected route using JWT Authentication
    @UseGuards(JwtAuthGuard)
    @Post('test/protected')
    async protectedRoute(@Req() req: Request) {
        try {
            return { message: 'You have accessed a protected route!', user: { id: 12 } };
        } catch (error) {
            throw new HttpException('Failed to access protected route', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('test/auction')
    @UseGuards(AuctionGuard)
    @AdminOnly()
    async testAuctonRoute(@Req() req: Request) {
        try {
            return { message: 'You have accessed a protected route!', user: { id: 12 } };
        } catch (error) {
            throw new HttpException('Failed to access protected route', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
