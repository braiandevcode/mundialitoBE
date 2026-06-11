import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { Match } from './match.entity';
import { Team } from '../teams/team.entity';
import { PredictionsModule } from '../predictions/predictions.module';
import { RankingModule } from '../ranking/ranking.module';

@Module({
  imports: [TypeOrmModule.forFeature([Match, Team]), PredictionsModule, RankingModule],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
