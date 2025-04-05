import {
    Controller,
    Post,
    Body,
    UsePipes,
    HttpException,
    HttpStatus
} from "@nestjs/common";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";
import { ZodValidationPipe } from "src/shared/pipes/zod-validation.pipe";
import { PasswordResetUsecase } from "src/users/application/use-cases/reset-password.use-case";
import { PasswordReseSchema, PasswordResetDTO } from "../dtos/reset-password.dto";
import { CreateUserSchema } from "../dtos/user.dto";

// ✅ Pick only the email field for validation
const EmailSchema = CreateUserSchema.pick({ email: true });

@Controller('password')
export class PasswordResetControllers {
    constructor(
        private readonly logger: ApplicationLogger,
        private readonly passwordResetService: PasswordResetUsecase
    ) { }

    @Post('request-PasswordReset')
    @UsePipes(new ZodValidationPipe(EmailSchema))
    async requestPasswordReset(@Body() body: { email: string }) {
        try {
            const passwordToken = await this.passwordResetService.findAndSendMail(body.email);
            return passwordToken;
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: "Could not process password reset request. Please try again later.",
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('resetPassword')
    @UsePipes(new ZodValidationPipe(PasswordReseSchema))
    async resetPassword(@Body() body: PasswordResetDTO) {
        try {
            const resetPassword = await this.passwordResetService.resetPassword(body.email, body.password, body.token);
            return resetPassword;
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: "Unable to reset password. Please try again later.",
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
