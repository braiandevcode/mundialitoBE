import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
// import { DatabaseModule } from './core/database/database.module';
import { HealthModule } from './core/health/health.module';
import { AuthModule } from './module/auth/auth.module';
import { UsersModule } from './module/users/users.module';
import { TeamsModule } from './module/teams/teams.module';
import { MatchesModule } from './module/matches/matches.module';
import { PredictionsModule } from './module/predictions/predictions.module';
import { RankingModule } from './module/ranking/ranking.module';
import { SponsorsModule } from './module/sponsors/sponsors.module';

@Module({
  imports: [
    CoreModule,
    // DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    TeamsModule,
    MatchesModule,
    PredictionsModule,
    RankingModule,
    SponsorsModule,
  ],
})
export class AppModule {}
