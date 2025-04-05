import { Injectable } from "@nestjs/common";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";
import { MailTemplateServices } from "./mail.template.service";
import { TransporterService } from "src/shared/infrastructure/mailServices/mail.service";
import { MailFuncResponse } from "src/shared/types/mails.types";


@Injectable()
export class MailService {
    constructor(
        private readonly mailTemplateService: MailTemplateServices,
        private readonly transporterService: TransporterService,
        private readonly logger: ApplicationLogger
    ) {}

    async sendVerificationEmail(email: string, token: string, name: string): Promise<MailFuncResponse> {
        const mailContent = this.mailTemplateService.generateVerificationEmail(email, token, name);

       
        if (!mailContent) {
            this.logger.warn(`Failed to generate email content for verification email to ${email}`);
            return { status: false, message: 'Failed to generate email content.' };
        }

        const response = await this.transporterService.sendMail(mailContent);

        if (!response.status) {
            this.logger.error(`Failed to send verification email to ${email}. Error: ${response.error}`);
            return { status: false, message: `Failed to send verification email.`, error: response.error };
        }

        this.logger.log(`Verification email sent successfully to ${email}`);
        return { status: true, message: 'Verification email sent successfully.' };
    }

    async sendPasswordResetEmail(email: string, token: string): Promise<MailFuncResponse> {
        const mailContent = this.mailTemplateService.generatePasswordResetEmail(email, token);

        if (!mailContent) {
            this.logger.warn(`Failed to generate email content for password reset to ${email}`);
            return { status: false, message: 'Failed to generate email content.' };
        }

        const response = await this.transporterService.sendMail(mailContent);

        if (!response.status) {
            this.logger.error(`Failed to send password reset email to ${email}. Error: ${response.error}`);
            return { status: false, message: `Failed to send password reset email.`, error: response.error };
        }

        this.logger.log(`Password reset email sent successfully to ${email}`);
        return { status: true, message: 'Password reset email sent successfully.' };
    }
}
