import { Module } from '@nestjs/common';
import { AuthController } from './interface/controllers/auth.controller';
import { LoginUserUsecase } from './application/usecase/auth.use-case';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TokenService } from 'src/shared/utils/token.service';
import { LocalStrategy } from './infrastructure/auth/strategy/auth.local.strategy';
import { JwtStrategy } from './infrastructure/auth/strategy/auth.jwt.strategy';
import { LoginRepository } from './domain/repository/login.repository';
import { LoginUser } from './infrastructure/persistance/prisma/loginPrisma.repository';
import { ApplicationLogger } from 'src/shared/infrastructure/logger/application.logger';
import { PrismaService } from 'src/shared/infrastructure/database/prisma/prisma.service';
import { GetUserMappers } from './infrastructure/persistance/mappers/get-users.mappers';
import { UtilsModule } from 'src/shared/utils/utils.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuctionGuard } from './infrastructure/auth/guard/rabc.guard';
import { GetUserRepository } from './infrastructure/persistance/prisma/user-info.prisma.repository';
import { IUserDetailsInterface } from './domain/repository/get-user-detials.repository';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }), // 🔥 Load first
        PassportModule,
        UtilsModule,

        JwtModule.registerAsync({
            imports: [ConfigModule], // Ensure ConfigModule is loaded
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '10d' },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [
        LoginUserUsecase,
        LocalStrategy,
        JwtStrategy, // 🔥 Make sure it's after ConfigModule
        ApplicationLogger,
        TokenService,
        PrismaService,
        GetUserMappers,
        LoginUser,
        GetUserRepository,
        AuctionGuard,
        {
            provide: LoginRepository,
            useClass: LoginUser, 
        },
        {
            provide : IUserDetailsInterface,
            useClass : GetUserRepository,
        }
    ],
    exports: [LoginUserUsecase, LocalStrategy, JwtStrategy, AuctionGuard, TokenService, ApplicationLogger,GetUserRepository],
})
export class AuthModule {}
