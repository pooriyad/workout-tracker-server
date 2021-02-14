import * as Joi from '@hapi/joi';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { WeightsModule } from './modules/weights/weights.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        ALLOWED_ORIGIN: Joi.string().required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        PORT: Joi.number().required(),
        NODE_ENV: Joi.valid('production', 'development').required(),
        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
      }),
      validationOptions: {
        // Todo: `stripUnkown: true` throws
        // error because of some
        // node_modules pacakges, so stripUnkown is
        // enabled insetad. fix that by finding a
        // way to use allowUnknown.
        // allowUnknown: true,
        stripUnkown: true,
        abortEarly: true,
      },
    }),
    UsersModule,
    AuthModule,
    SchedulesModule,
    WeightsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
