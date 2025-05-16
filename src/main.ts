import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './shared/infrastructure/interceptors/response.intercetor';
import { HttpExceptionFilter } from './shared/infrastructure/filters/http.filter';
import { ApplicationLogger } from './shared/infrastructure/logger/application.logger';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new ApplicationLogger();
    app.useLogger(logger);
  app.useGlobalInterceptors(new ResponseInterceptor() )
  app.useGlobalFilters(new HttpExceptionFilter())

  const config = new DocumentBuilder()
    .setTitle('Auction API')
    .setDescription('API for managing auctions')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
