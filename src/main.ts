import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as CookieParser from 'cookie-parser';
import { setupSwagger } from './setup-swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get('ALLOWED_ORIGIN'),
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.use(CookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // swagger
  if (configService.get('NODE_ENV') !== 'production') {
    setupSwagger(app);
  }

  await app.listen(configService.get('PORT'));
}
bootstrap();
