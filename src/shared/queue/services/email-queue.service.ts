import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { VerificationEmailJob } from '../interface/email-job.interface';


@Injectable()
export class EmailQueueService {
    constructor(
        @InjectQueue('email') private emailQueue: Queue
    ) { }

    async addVerificationEmailJob(jobData: VerificationEmailJob): Promise<void> {
        await this.emailQueue.add('send-verification-email', jobData, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
            removeOnComplete: 10,
            removeOnFail: 5,
        });
    }

    async addPasswordResetEmailJob(email: string, resetToken: string, fullName: string): Promise<void> {
        await this.emailQueue.add('send-password-reset-email', {
            email,
            resetToken,
            fullName,
        }, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
            removeOnComplete: 10,
            removeOnFail: 5,
        });
    }
}