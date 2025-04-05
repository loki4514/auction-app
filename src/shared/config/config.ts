import { ConfigModule } from '@nestjs/config';

export const AppConfig = ConfigModule.forRoot({
    isGlobal: true, // Makes environment variables globally accessible
    envFilePath: '.env', // Path to the .env file
});
