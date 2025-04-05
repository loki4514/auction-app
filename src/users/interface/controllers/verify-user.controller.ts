import {
    Controller,
    Post,
    Body,
    UsePipes,
    HttpException,
    HttpStatus,
    Query
} from "@nestjs/common";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";
import { ZodValidationPipe } from "src/shared/pipes/zod-validation.pipe";
import { CreateUserSchema } from "../dtos/user.dto";
import { VerifyUserUseCase } from "src/users/application/use-cases/verify-user.use-case";
import { ResendUserVerificationToken } from "src/users/application/use-cases/resend-verification.use-case";
import { VerifyAccountDTO, VerifyAccountSchema } from "../dtos/verify-user.dto";


// ✅ Pick only the email field for validation
const EmailSchema = CreateUserSchema.pick({ email: true });

@Controller('users')
export class VerifyUserController {
    constructor(

        private readonly verifyUserUseCase: VerifyUserUseCase,
        private readonly resendUserToken: ResendUserVerificationToken
    ) { }

    @Post('verify-account')
    @UsePipes(new ZodValidationPipe(VerifyAccountSchema))
    async verifyAccount(
        @Query() query: VerifyAccountDTO       // Capture email & token from body
    ) {
        try {
            const { email, token } = query;

            if (!email || !token) {
                throw new HttpException({
                    success: false,
                    message: "Email and token are required.",
                    status: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            }

            const verifyRes = await this.verifyUserUseCase.verifyAccount(email, token);
            console.log(verifyRes);

            if (!verifyRes.success) {
                throw new HttpException({
                    success: false,
                    message: verifyRes.message,
                    status: HttpStatus.BAD_REQUEST,
                    error: verifyRes?.debug,
                }, verifyRes.status);
            }

            return {
                success: verifyRes.success,
                message: verifyRes.message,
                status: verifyRes.status,
            };
        } catch (error) {
            throw new HttpException({
                success: false,
                message: "Verification failed. Please check your token or request a new one.",
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('resend-user-verification')
    @UsePipes(new ZodValidationPipe(EmailSchema))
    async resendUserVerification(@Body() body: { email: string }) {
        try {
            const resendToken = await this.resendUserToken.findandResendToken(body.email);
            if (!resendToken.success) {
                throw new HttpException({
                    success: false,
                    message: resendToken.message,
                    status: resendToken.status
                },
                    resendToken.status,
                )
            }
            console.log(resendToken, "thi is sres")
            return resendToken;
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: "Could not resend verification email. Please try again later.",
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
