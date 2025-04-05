import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { ApplicationLogger } from "../logger/application.logger";
import { MailFuncResponse, MailPayload } from "src/shared/types/mails.types";

@Injectable()
export class TransporterService {
    private transporter: nodemailer.Transporter;

    constructor(private readonly logger: ApplicationLogger) {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false, // ⚠️ Use `true` for port 465 if needed
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendMail(mailPayload: MailPayload): Promise<MailFuncResponse> {
        try {
            console.log("📧 Sending Mail:", mailPayload);

            const mailOptions = {
                from: process.env.SENDER_MAIL,
                to: mailPayload.to,
                subject: mailPayload.subject,
                html: mailPayload.body,  // ✅ FIXED: Use `html` instead of `body`
            };

            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`✅ Email sent successfully: ${info.messageId}`);

            return { status: true, message: "Email sent successfully" };
        } catch (error) {
            this.logger.error(`❌ Email sending failed: ${error.message}`);
            return { status: false, message: "Email sending failed", error: error.message };
        }
    }
}
