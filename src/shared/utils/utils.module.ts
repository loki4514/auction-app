import { Module } from '@nestjs/common';
import { ApplicationLogger } from '../infrastructure/logger/application.logger';
import { TransporterService } from '../infrastructure/mailServices/mail.service';
import { TokenService } from './token.service';
import { PasswordHasher } from './password.hasher';

@Module({
    providers: [ApplicationLogger,TransporterService,TokenService, PasswordHasher],
    exports: [ApplicationLogger,TransporterService,TokenService, PasswordHasher],
})
export class UtilsModule {}
