import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SponsorsController } from './sponsors.controller';
import { SponsorsService } from './sponsors.service';
import { Sponsor } from './sponsor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sponsor])],
  controllers: [SponsorsController],
  providers: [SponsorsService],
})
export class SponsorsModule {}
