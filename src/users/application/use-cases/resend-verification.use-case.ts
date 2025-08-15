import { Injectable } from "@nestjs/common";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";
import { ResendVerifyToken } from "src/users/domain/repository/resend-verify-token.repository";
import { TokenService } from "src/shared/utils/token.service";
import { EmailQueueService } from "src/shared/queue/services/email-queue.service";

interface ResendTokenResponse {
    success: boolean;
    message: string;
    status: number;
}

@Injectable()
export class ResendUserVerificationToken {
    private readonly expiry_seconds: number;

    constructor(
        private readonly logger: ApplicationLogger,
        private readonly resendCreateVerification: ResendVerifyToken,
        private readonly verificationToken: TokenService,
        private readonly emailQueueService: EmailQueueService
    ) {
        this.expiry_seconds = Number(process.env.VERIFICATION_LINK_EXPIRES_SECONDS) || 3600; // Default to 1 hour
    }

    async findandResendToken(email: string): Promise<ResendTokenResponse> {
        try {
            this.logger.log(`Attempting to resend verification token for email: ${email}`);

            // 1. Find user by email
            const userResult = await this.resendCreateVerification.findUserByEmail(email);
            
            if (!userResult.success) {
                this.logger.warn(`User not found for email: ${email}`);
                return { 
                    success: false, 
                    message: userResult.message, 
                    status: userResult.status 
                };
            }

            // 2. Check if user is already verified
            if (userResult.data?.is_verified) {
                this.logger.log(`User already verified for email: ${email}`);
                return { 
                    success: true, 
                    message: "User is already verified", 
                    status: 200 
                };
            }

            // 3. Validate user data
            if (!userResult.data?.full_name) {
                this.logger.error(`User data incomplete for email: ${email}`);
                return {
                    success: false,
                    message: "User data is incomplete",
                    status: 400
                };
            }

            // 4. Generate token and expiry time
            const token = this.verificationToken.generateTimedToken(email);
            const expiry_time = this.calculateExpiryTime();

            // 5. Queue verification email
            try {
                await this.emailQueueService.addVerificationEmailJob({
                    email: email,
                    verificationToken: token,
                    fullName: userResult.data.full_name
                });
                
                this.logger.log(`Verification email queued successfully for: ${email}`);
            } catch (emailError) {
                this.logger.error(`Failed to queue verification email for ${email}:`, emailError);
                return {
                    success: false,
                    message: "Failed to queue verification email",
                    status: 500
                };
            }

            // 6. Save token to database
            const savedToken = await this.resendCreateVerification.resendVerifyToken(
                email, 
                token, 
                expiry_time
            );

            if (savedToken.success) {
                this.logger.log(`Verification token resent successfully for: ${email}`);
            } else {
                this.logger.error(`Failed to save verification token for ${email}: ${savedToken.message}`);
            }

            return {
                success: savedToken.success,
                message: savedToken.success 
                    ? "Verification email sent successfully" 
                    : savedToken.message,
                status: savedToken.status
            };

        } catch (error) {
            this.logger.error(`Unexpected error in resend verification for ${email}:`, error);
            return {
                success: false,
                message: "An unexpected error occurred",
                status: 500
            };
        }
    }

    /**
     * Calculate expiry time using native Date instead of moment
     */
    private calculateExpiryTime(): string {
        const now = new Date();
        const expiryDate = new Date(now.getTime() + (this.expiry_seconds * 1000));
        return expiryDate.toISOString();
    }
}