import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from '../../../module/teams/team.entity';
import { Match } from '../../../module/matches/match.entity';
import { DatabaseModule } from '../database.module';
import envConfig from '../../config/env.config';
import { envValidationSchema } from '../../config/env-validation.schema';
import { SeedService } from './seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local.production', '.env'],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
      load: [envConfig],
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([Team, Match]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
