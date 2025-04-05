import { Injectable } from "@nestjs/common";
import * as moment from 'moment-timezone';
import * as bcrypt from 'bcrypt';
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";
import { MailService } from "src/users/infrastructure/persistance/mail/mail.service";
import { PasswordResetInterface, verifyAndUpdatePassword } from "src/users/domain/repository/password-functionality.repository";
import { TokenService } from "src/shared/utils/token.service";

@Injectable()
export class PasswordResetUsecase {
    private expiry_seconds = Number(process.env.VERIFICATION_LINK_EXPIRES_SECONDS);
    private timezone = process.env.CURRENT_TIME_ZONE_MOMENT_PKG || "Asia/Kolkata";

    constructor(
        private readonly logger: ApplicationLogger,
        private readonly sendPasswordResetMail: MailService,
        private readonly passwordResetService: PasswordResetInterface,
        private readonly storeNewPasswordService : verifyAndUpdatePassword,
        private readonly passwordToken: TokenService
    ) { }

    async findAndSendMail(email: string) {
        try {
            const findByUser = await this.passwordResetService.findByEmail(email);
            if (!findByUser) {
                return { success: false, message: "User not found with the provided email", status: 400 };
            }

            // Generate password reset token
            const generatePasswordToken = this.passwordToken.generateTimedToken(email);

            // Send password reset email
            const sentMailRes = await this.sendPasswordResetMail.sendPasswordResetEmail(email, generatePasswordToken);
            if (!sentMailRes.status) {
                this.logger.error(`Password reset email fail to sent: ${email}`, sentMailRes?.error)
                return { success: false, message: sentMailRes.message, status: 500 };
            }

            const expiry_time = moment().tz(this.timezone).add(this.expiry_seconds, "seconds").format("YYYY-MM-DD HH:mm:ss");

            const savePassword = await this.passwordResetService.savePasswordResetToken(email, generatePasswordToken, expiry_time)

            if(!savePassword){
                return {success : false, message : "Failed to save password please try again later", status : 500}
            }

            // Log success and return response
            this.logger.log(`Password reset email sent successfully to: ${email}`);
            return { success: true, message: "Password reset email sent", status: 200 };
        } catch (error) {
            this.logger.error(`Error sending password reset mail to ${email}: ${error.message}`, error.stack);
            return { success: false, message: "Failed to send password reset email", status: 500 };
        }
    }


    async resetPassword(email: string, password: string, token: string) {
        try {
            const validateToken = await this.storeNewPasswordService.verifyPasswordToken(email, token);
    
            if (!validateToken.success) {
                return validateToken; // Return error if token verification fails
            }
    
            const expiresAt = validateToken.data?.expiresAt;
            if (!expiresAt) {
                return { success: false, message: "Token expiry date not found", status: 400 };
            }
    
            const currentTime = moment().tz(this.timezone);
            const tokenExpiryTime = moment(expiresAt).tz(this.timezone);
    
            if (currentTime.isAfter(tokenExpiryTime)) {
                return { success: false, message: "Password reset token has expired", status: 400 };
            }
    
            // Hash new password
            const cryptedPassword = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT));
    
            // Update password in database
            const savedPassword = await this.storeNewPasswordService.updatePassword(email, cryptedPassword);
    
            if (!savedPassword.success) {
                return savedPassword;
            }
    
            this.logger.log(`Password reset successfully for: ${email}`);
            return savedPassword;
        } catch (error) {
            this.logger.error(`Error resetting password for ${email}: ${error.message}`, error.stack);
            return { success: false, message: "Failed to reset password", status: 500 };
        }
    }
}