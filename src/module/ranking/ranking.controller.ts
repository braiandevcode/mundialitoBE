import { Controller, Get, Logger } from '@nestjs/common';
import { RankingService } from './ranking.service';

@Controller('ranking')
export class RankingController {
  private readonly logger = new Logger(RankingController.name);

  constructor(private readonly rankingService: RankingService) {}

  @Get()
  async getRanking() {
    try {
      return await this.rankingService.getRanking();
    } catch (err) {
      this.logger.error(`Error en GET /api/ranking: ${err}`);
      throw err;
    }
  }
}
