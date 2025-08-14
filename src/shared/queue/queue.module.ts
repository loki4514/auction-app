import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EmailProcessor } from './processors/email.processor';
import { EmailQueueService } from './services/email-queue.service';
import { MailService } from 'src/users/infrastructure/persistance/mail/mail.service';
import { ApplicationLogger } from '../infrastructure/logger/application.logger';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'email',
            redis: {
                host: 'localhost',
                port: 6379,
            },
        }),
    ],
    providers: [
        EmailProcessor,
        EmailQueueService,
        MailService, // Make sure this is provided
        ApplicationLogger,
    ],
    exports: [EmailQueueService, BullModule],
})
export class QueueModule { }