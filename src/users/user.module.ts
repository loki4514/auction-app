import { Module } from '@nestjs/common';
import { UtilsModule } from 'src/shared/utils/utils.module';
import { PrismaService } from 'src/shared/infrastructure/database/prisma/prisma.service';

// Use Cases
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { ResendUserVerificationToken } from './application/use-cases/resend-verification.use-case';
import { PasswordResetUsecase } from './application/use-cases/reset-password.use-case';
import { VerifyUserUseCase } from './application/use-cases/verify-user.use-case';

// Controllers
import { UserController } from './interface/controllers/user.controller';
import { VerifyUserController } from './interface/controllers/verify-user.controller';
import { PasswordResetControllers } from './interface/controllers/reset-password.controller';

// Repositories (Interfaces & Implementations)
import { UserRepository } from './domain/repository/user.repository';
import { UserPrismaRepository } from './infrastructure/persistance/prisma/prisma-user.repository';
import { VerifyUserRepository } from './domain/repository/verify-user.repository';
import { VerifyUserPrismaRepository } from './infrastructure/persistance/prisma/primsa-verify-user.repository';

import { PasswordResetPrismaRepository, VerifyAndUpdatePasswordPrismaRepository } from './infrastructure/persistance/prisma/prisma-password-reset.repository';
import { ResendVerifyToken } from './domain/repository/resend-verify-token.repository';
import { ResendVerifyTokenPrismaRepository } from './infrastructure/persistance/prisma/prisma-resend-verify-token.repository';
import { PasswordResetInterface, verifyAndUpdatePassword } from './domain/repository/password-functionality.repository';
import { MailService } from './infrastructure/persistance/mail/mail.service';
import { MailTemplateServices } from './infrastructure/persistance/mail/mail.template.service';
import { VerifyUserMapper } from './infrastructure/persistance/mappers/verify-user.mapper';
import { VerifyPasswordMapper } from './infrastructure/persistance/mappers/verify-password.mapper';

@Module({
    imports: [UtilsModule],
    controllers: [UserController, VerifyUserController, PasswordResetControllers],
    providers: [
        UtilsModule,
        MailTemplateServices,
        MailService,
        VerifyPasswordMapper,
        PrismaService,
        CreateUserUseCase,
        ResendUserVerificationToken,
        PasswordResetUsecase,
        VerifyUserUseCase,
        VerifyUserMapper,
        {
            provide: UserRepository,
            useClass: UserPrismaRepository,
        },
        {
            provide: VerifyUserRepository,
            useClass: VerifyUserPrismaRepository,
        },
        {
            provide: PasswordResetInterface,
            useClass: PasswordResetPrismaRepository,
        },
        {
            provide: ResendVerifyToken,
            useClass: ResendVerifyTokenPrismaRepository,
        },
        {
            provide: verifyAndUpdatePassword,
            useClass : VerifyAndUpdatePasswordPrismaRepository
        }
    ],
    exports: [
        MailTemplateServices,
        UtilsModule,
        MailService,
        VerifyUserMapper,
        VerifyPasswordMapper,
        CreateUserUseCase,
        ResendUserVerificationToken,
        PasswordResetUsecase,
        VerifyUserUseCase,
    ],
})
export class UserModule {}
