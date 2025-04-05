import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './users/user.module';
import { UserController } from './users/interface/controllers/user.controller';
import { PasswordResetControllers } from './users/interface/controllers/reset-password.controller';
import { VerifyUserController } from './users/interface/controllers/verify-user.controller';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/interface/controllers/auth.controller';
import { AppConfig } from './shared/config/config';
import { CreateAuctionController } from './auctions/interface/controllers/create-auction.controller';
import { AuctionModule } from './auctions/auctions.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available throughout the app
      envFilePath: '.env'
      // validationOptions: {
      //   allowUnknown: false, // Prevents unexpected .env variables
      //   abortEarly: true, // Stops validation on the first error
      // },
    }),
    AuctionModule,
    UserModule,
  AuthModule], // ✅ Import UserModule here
  controllers: [AppController, UserController, PasswordResetControllers, VerifyUserController, AuthController, CreateAuctionController],
  providers: [AppService],
})
export class AppModule {}
