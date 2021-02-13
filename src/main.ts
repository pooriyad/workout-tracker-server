import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as CookieParser from 'cookie-parser';
import { setupSwagger } from './setup-swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: 'http://localhost:8080',
      credentials: true,
    },
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
  if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app);
  }
  await app.listen(3000);
}
bootstrap();
