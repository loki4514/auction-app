import * as moment from "moment-timezone";
import { Injectable } from "@nestjs/common";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";
import { ResendVerifyToken } from "src/users/domain/repository/resend-verify-token.repository";
import { TokenService } from "src/shared/utils/token.service";
import { MailService } from "src/users/infrastructure/persistance/mail/mail.service";

@Injectable()
export class ResendUserVerificationToken {
    private expiry_seconds: number;
    private timezone: string;

    constructor(
        private readonly logger: ApplicationLogger,
        private readonly resendCreateVerification: ResendVerifyToken,
        private readonly verificationToken: TokenService,
        private readonly sendMailService: MailService
    ) {
        this.expiry_seconds = Number(process.env.VERIFICATION_LINK_EXPIRES_SECONDS) || 3600; // Default to 1 hour if undefined
        this.timezone = process.env.CURRENT_TIME_ZONE_MOMENT_PKG || "Asia/Kolkata";
    }

    async findandResendToken(email: string): Promise<{ success: boolean; message: string; status: number }> {
        const verify_res = await this.resendCreateVerification.findUserByEmail(email);

        if (!verify_res.success) {
            return { success: false, message: verify_res.message, status: verify_res.status };
        }

        if (verify_res.data?.is_verified) {
            return { success: true, message: `User already verified`, status: 200 };
        }

        const token = this.verificationToken.generateTimedToken(email);
        const expiry_time = moment()
            .tz(this.timezone)
            .add(this.expiry_seconds, "seconds")
            .toISOString(); // ✅ Converts to ISO-8601

        let sentMail = { status : false , message: "Email not sent"}; // Default value
        console.log(verify_res, "this is the verify res", email, token, verify_res?.data?.email);

        if (verify_res?.data?.full_name) {
            sentMail = await this.sendMailService.sendVerificationEmail(email, token, verify_res.data?.full_name );
        }

        if (!sentMail.status) {
            return { success: false, message: sentMail.message, status: 500 };
        }

        const savedToken = await this.resendCreateVerification.resendVerifyToken(email, token, expiry_time);

        return { success: savedToken.success, message: savedToken.message, status: savedToken.status };
    }
}
