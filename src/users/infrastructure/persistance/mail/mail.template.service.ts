import { Injectable } from "@nestjs/common";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";
import { verifyAccountTemplate } from "./mailtemplates/acount-verify.template";
import { resetPasswordTemplate } from "./mailtemplates/reset-password.template";




@Injectable()
export class MailTemplateServices {
    constructor(

        private readonly logger: ApplicationLogger
    ) { }

    generateVerificationEmail(to: string, token: string, name: string) {
        try {
            const verificationLink = `${process.env.VERIFICATION_LINK}?token=${token}&${to}`;
            const craftedEmail = verifyAccountTemplate(name, verificationLink);

            

            const mailResponse = { to, subject: craftedEmail.subject, body: craftedEmail.body };


            return mailResponse;
        } catch (error) {
            this.logger.error(`Failed to send account verification mail to ${to}`, error.stack);
            console.log(error)
            return null
        }
    }

    generatePasswordResetEmail(to: string, token: string) {
        try {
            const resetLink = `${process.env.RESET_PASSWORD_LINK}?token=${token}&${to}`;
            const craftedEmail = resetPasswordTemplate(resetLink);

            const mailResponse = { to, subject: craftedEmail.subject, body: craftedEmail.body };
            return mailResponse
        } catch (error) {
            this.logger.error(`Failed to send password reset mail to ${to}`, error.stack);
            return null
        }
    }
}
