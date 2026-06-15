import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import envConfig from './config/env.config';
import { envValidationSchema } from './config/env-validation.schema';
import { UsersModule } from '../module/users/users.module';
import { AuthModule } from '../module/auth/auth.module';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';

const isProduction =
  process.env.NODE_ENV === 'production' || Boolean(process.env.RAILWAY_ENVIRONMENT);

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: isProduction,
      envFilePath: isProduction ? [] : ['.env.local.development', '.env'],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
      load: [envConfig],
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('env.throttle.ttl') || 60000,
          limit: config.get<number>('env.throttle.limit') || 30,
        },
      ],
    }),
    UsersModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    FirebaseAuthGuard,
  ],
  exports: [ConfigModule, FirebaseAuthGuard],
})
export class CoreModule {}
