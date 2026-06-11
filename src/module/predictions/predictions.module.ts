import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';
import { Prediction } from './prediction.entity';
import { Match } from '../matches/match.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prediction, Match, User])],
  controllers: [PredictionsController],
  providers: [PredictionsService],
  exports: [PredictionsService],
})
export class PredictionsModule {}
