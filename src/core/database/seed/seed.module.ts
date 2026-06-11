import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from '../../../module/teams/team.entity';
import { Match } from '../../../module/matches/match.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Team, Match])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
