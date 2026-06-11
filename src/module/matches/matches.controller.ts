import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseEnumPipe,
  UseGuards,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { UpdateMatchDto } from './dto/update-match.dto';
import { GroupId, UserRole, KnockoutRound } from '../../shared/constants/enums';
import { FirebaseAuthGuard } from '../../core/guards/firebase-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ParseMatchIdPipe } from '../../core/pipes/parse-match-id.pipe';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  async findAll() {
    return this.matchesService.findAll();
  }

  @Get('groups/:groupId')
  async findByGroup(
    @Param('groupId', new ParseEnumPipe(GroupId)) groupId: GroupId,
  ) {
    return this.matchesService.findByGroup(groupId);
  }

  @Get('bracket')
  async findBracket() {
    return this.matchesService.findBracket();
  }

  @Post('generate-next-round')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async generateNextRound() {
    return this.matchesService.generateNextRound();
  }

  @Delete('round/:round')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteRound(
    @Param('round') round: string,
  ) {
    await this.matchesService.deleteRound(round);
    return { message: `${round} round deleted` };
  }

  @Patch(':matchId')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateResult(
    @Param('matchId', ParseMatchIdPipe) matchId: string,
    @Body() dto: UpdateMatchDto,
  ) {
    return this.matchesService.updateResult(matchId, dto);
  }
}
