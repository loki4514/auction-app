import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { MailService } from 'src/users/infrastructure/persistance/mail/mail.service';
import { ApplicationLogger } from 'src/shared/infrastructure/logger/application.logger';
import { VerificationEmailJob } from '../interface/email-job.interface';

@Processor('email')
@Injectable()
export class EmailProcessor {
    constructor(
        private readonly mailService: MailService,
        private readonly logger: ApplicationLogger,
    ) { }

    @Process('send-verification-email')
    async handleVerificationEmail(job: Job<VerificationEmailJob>) {
        const { email, verificationToken, fullName } = job.data;

        try {
            this.logger.log(`Processing verification email for: ${email}`);

            const mailResponse = await this.mailService.sendVerificationEmail(
                email,
                verificationToken,
                fullName
            );

            if (!mailResponse.status) {
                this.logger.error(`Verification email failed for ${email}: ${mailResponse.error}`);
                throw new Error(`Email send failed: ${mailResponse.error}`);
            }

            this.logger.log(`Verification email sent successfully to: ${email}`);
            return { success: true, email };

        } catch (error) {
            this.logger.error(`Failed to process verification email for ${email}`, error);
            throw error; // This will trigger retry logic
        }
    }

    @Process('send-password-reset-email')
    async handlePasswordResetEmail(job: Job<any>) {
        const { email, resetToken, fullName } = job.data;

        try {
            this.logger.log(`Processing password reset email for: ${email}`);

            // Assuming you have a sendPasswordResetEmail method
            const mailResponse = await this.mailService.sendPasswordResetEmail(
                email,
                resetToken
            );

            if (!mailResponse.status) {
                this.logger.error(`Password reset email failed for ${email}: ${mailResponse.error}`);
                throw new Error(`Email send failed: ${mailResponse.error}`);
            }

            this.logger.log(`Password reset email sent successfully to: ${email}`);
            return { success: true, email };

        } catch (error) {
            this.logger.error(`Failed to process password reset email for ${email}`, error);
            throw error;
        }
    }
}