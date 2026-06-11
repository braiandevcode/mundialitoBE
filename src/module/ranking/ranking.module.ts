import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';
import { RankingEntry } from './ranking.entity';
import { Prediction } from '../predictions/prediction.entity';
import { User } from '../users/user.entity';
import { Match } from '../matches/match.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prediction, User, Match, RankingEntry])],
  controllers: [RankingController],
  providers: [RankingService],
  exports: [RankingService],
})
export class RankingModule {}
