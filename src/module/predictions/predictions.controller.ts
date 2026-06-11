import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { FirebaseAuthGuard } from '../../core/guards/firebase-auth.guard';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { ParseMatchIdPipe } from '../../core/pipes/parse-match-id.pipe';

@Controller('predictions')
@UseGuards(FirebaseAuthGuard)
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Post()
  async upsert(@Body() dto: CreatePredictionDto) {
    return this.predictionsService.upsert(dto);
  }

  @Get()
  async findByUser(@Query('userId') userId: string) {
    return this.predictionsService.findByUser(userId);
  }

  @Get(':userId/:matchId')
  async findByUserAndMatch(
    @Param('userId') userId: string,
    @Param('matchId', ParseMatchIdPipe) matchId: string,
  ) {
    return this.predictionsService.findByUserAndMatch(userId, matchId);
  }
}
