import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";
import { PasswordResetInterface, verifyAndUpdatePassword } from "src/users/domain/repository/password-functionality.repository";
import { TokenService } from "src/shared/utils/token.service";
import { EmailQueueService } from "src/shared/queue/services/email-queue.service";

interface PasswordResetResponse {
    success: boolean;
    message: string;
    status: number;
    data?: any;
}

@Injectable()
export class PasswordResetUsecase {
    private readonly expiry_seconds: number;

    constructor(
        private readonly logger: ApplicationLogger,
        private readonly passwordResetService: PasswordResetInterface,
        private readonly storeNewPasswordService: verifyAndUpdatePassword,
        private readonly passwordToken: TokenService,
        private readonly emailQueueService: EmailQueueService
    ) {
        this.expiry_seconds = Number(process.env.VERIFICATION_LINK_EXPIRES_SECONDS) || 3600; // Default to 1 hour
    }

    async findAndSendMail(email: string): Promise<PasswordResetResponse> {
        try {
            this.logger.log(`Attempting to send password reset email for: ${email}`);

            // 1. Find user by email
            const user = await this.passwordResetService.findByEmail(email);
            if (!user) {
                this.logger.warn(`Password reset attempted for non-existent email: ${email}`);
                return { 
                    success: false, 
                    message: "User not found with the provided email", 
                    status: 400 
                };
            }

            // 2. Validate user has required data
            if (!user) {
                this.logger.error(`User missing full_name for password reset: ${email}`);
                return {
                    success: false,
                    message: "User data is incomplete",
                    status: 400
                };
            }

            // 3. Generate password reset token
            const resetToken = this.passwordToken.generateTimedToken(email);

            // 4. Calculate expiry time
            const expiry_time = this.calculateExpiryTime();

            // 5. Queue password reset email
            try {
                await this.emailQueueService.addPasswordResetEmailJob(
                    email, 
                    resetToken, 
                );
                
                this.logger.log(`Password reset email queued successfully for: ${email}`);
            } catch (emailError) {
                this.logger.error(`Failed to queue password reset email for ${email}:`, emailError);
                return {
                    success: false,
                    message: "Failed to queue password reset email",
                    status: 500
                };
            }

            // 6. Save password reset token to database
            const savePassword = await this.passwordResetService.savePasswordResetToken(
                email, 
                resetToken, 
                expiry_time
            );

            if (!savePassword) {
                this.logger.error(`Failed to save password reset token for: ${email}`);
                return { 
                    success: false, 
                    message: "Failed to save password reset token, please try again later", 
                    status: 500 
                };
            }

            this.logger.log(`Password reset process initiated successfully for: ${email}`);
            return { 
                success: true, 
                message: "Password reset email sent successfully", 
                status: 200 
            };

        } catch (error) {
            this.logger.error(`Error in password reset process for ${email}:`, error);
            return { 
                success: false, 
                message: "Failed to send password reset email", 
                status: 500 
            };
        }
    }

    async resetPassword(email: string, password: string, token: string): Promise<PasswordResetResponse> {
        try {
            this.logger.log(`Attempting password reset for: ${email}`);

            // 1. Validate input parameters
            if (!email || !password || !token) {
                return {
                    success: false,
                    message: "Email, password, and token are required",
                    status: 400
                };
            }

            if (password.length < 8) {
                return {
                    success: false,
                    message: "Password must be at least 8 characters long",
                    status: 400
                };
            }

            // 2. Verify password reset token
            const validateToken = await this.storeNewPasswordService.verifyPasswordToken(email, token);
            
            if (!validateToken.success) {
                this.logger.warn(`Invalid password reset token for: ${email}`);
                return validateToken;
            }

            // 3. Check token expiry
            const expiresAt = validateToken.data?.expiresAt;
            if (!expiresAt) {
                this.logger.error(`Token expiry date not found for: ${email}`);
                return { 
                    success: false, 
                    message: "Token expiry date not found", 
                    status: 400 
                };
            }

            if (this.isTokenExpired(expiresAt)) {
                this.logger.warn(`Expired password reset token used for: ${email}`);
                return { 
                    success: false, 
                    message: "Password reset token has expired", 
                    status: 400 
                };
            }

            // 4. Hash new password
            const saltRounds = Number(process.env.BCRYPT_SALT) || 12;
            const cryptedPassword = await bcrypt.hash(password, saltRounds);

            // 5. Update password in database
            const savedPassword = await this.storeNewPasswordService.updatePassword(email, cryptedPassword);

            if (!savedPassword.success) {
                this.logger.error(`Failed to update password for: ${email}`);
                return savedPassword;
            }

            this.logger.log(`Password reset completed successfully for: ${email}`);
            return {
                success: true,
                message: "Password reset successfully",
                status: 200
            };

        } catch (error) {
            this.logger.error(`Error resetting password for ${email}:`, error);
            return { 
                success: false, 
                message: "Failed to reset password", 
                status: 500 
            };
        }
    }

    /**
     * Calculate expiry time using native Date
     */
    private calculateExpiryTime(): string {
        const now = new Date();
        const expiryDate = new Date(now.getTime() + (this.expiry_seconds * 1000));
        return expiryDate.toISOString();
    }

    /**
     * Check if token has expired using native Date comparison
     */
    private isTokenExpired(expiresAt: string | Date): boolean {
        const currentTime = new Date();
        const tokenExpiryTime = new Date(expiresAt);
        return currentTime > tokenExpiryTime;
    }
}