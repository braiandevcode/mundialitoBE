import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, IsNull, Not, In } from 'typeorm';
import { Match } from './match.entity';
import { Team } from '../teams/team.entity';
import { UpdateMatchDto } from './dto/update-match.dto';
import { IMatch } from '../../shared/contracts/entities';
import { PredictionsService } from '../predictions/predictions.service';
import { RankingService } from '../ranking/ranking.service';
import { BracketMatchup, BracketSlotRef, BRACKET_ROUNDS } from '../../shared/constants/bracket-structure';

interface GroupStanding {
  groupId: string;
  teamId: string;
  points: number;
  gd: number;
  goals: number;
  position: number;
}

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    private readonly predictionsService: PredictionsService,
    private readonly rankingService: RankingService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<IMatch[]> {
    const matches = await this.matchRepository.find({
      order: { matchNumber: 'ASC' },
    });
    return matches.map(this.toIMatch);
  }

  async findByGroup(groupId: string): Promise<IMatch[]> {
    const matches = await this.matchRepository.find({
      where: { groupId },
      order: { matchNumber: 'ASC' },
    });
    return matches.map(this.toIMatch);
  }

  async findBracket(): Promise<IMatch[]> {
    const matches = await this.matchRepository.find({
      where: { groupId: IsNull() },
      order: { matchNumber: 'ASC' },
    });
    return matches.map(this.toIMatch);
  }

  async findById(id: string): Promise<IMatch | null> {
    const match = await this.matchRepository.findOne({ where: { id } });
    return match ? this.toIMatch(match) : null;
  }

  async updateResult(matchId: string, dto: UpdateMatchDto): Promise<IMatch> {
    const match = await this.matchRepository.findOne({ where: { id: matchId } });
    if (!match) throw new NotFoundException(`Match ${matchId} not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (dto.homeScore !== undefined) match.homeScore = dto.homeScore;
      if (dto.awayScore !== undefined) match.awayScore = dto.awayScore;
      if (dto.extraHomeScore !== undefined) match.extraHomeScore = dto.extraHomeScore;
      if (dto.extraAwayScore !== undefined) match.extraAwayScore = dto.extraAwayScore;
      if (dto.penaltyHomeScore !== undefined) match.penaltyHomeScore = dto.penaltyHomeScore;
      if (dto.penaltyAwayScore !== undefined) match.penaltyAwayScore = dto.penaltyAwayScore;
      if (dto.status !== undefined) match.status = dto.status;

      await queryRunner.manager.save(match);
      this.logger.log(`Match ${matchId} updated: status=${match.status}, score=${match.homeScore}-${match.awayScore}`);

      if (
        match.status === 'finished' &&
        match.homeScore !== null &&
        match.awayScore !== null
      ) {
        await this.predictionsService.evaluateMatch(matchId);
        this.logger.log(`Match ${matchId}: predictions evaluated`);
      }

      await queryRunner.commitTransaction();

      if (match.status === 'finished') {
        await this.rankingService.tryRecalculateAffected(match.date);
      }

      return this.toIMatch(match);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ── KO BRACKET GENERATION ──

  async generateNextRound(): Promise<IMatch[] | { message: string }> {
    const existingKo = await this.matchRepository.find({
      where: { groupId: IsNull() },
      order: { matchNumber: 'ASC' },
    });
    const existingIds = new Set(existingKo.map((m) => m.id));

    const currentIdx = BRACKET_ROUNDS.findIndex((r) =>
      r.matchups.some((m) => existingIds.has(m.matchId)),
    );
    const nextIdx = currentIdx === -1 ? 0 : currentIdx + 1;

    if (nextIdx >= BRACKET_ROUNDS.length) {
      return { message: 'Todas las rondas KO ya han sido generadas' };
    }

    const nextRound = BRACKET_ROUNDS[nextIdx];
    const roundNames: Record<string, string> = {
      R32: '16avos', R16: '8vos', QF: '4tos', SF: 'semifinales', Final: 'Final', '3rd': 'tercer puesto',
    };
    const nextName = roundNames[nextRound.round] || nextRound.round;
    this.logger.log(`Generating ${nextRound.round} round...`);

    const prevRound = nextIdx > 0 ? BRACKET_ROUNDS[nextIdx - 1] : null;

    if (!prevRound) {
      const unfinished = await this.matchRepository.count({
        where: { groupId: Not(IsNull()), status: Not('finished') },
      });
      if (unfinished > 0) {
        return { message: `Aún no se ha definido la llave de ${nextName}. Faltan ${unfinished} partidos de grupo por finalizar.` };
      }
    } else {
      const prevNames: Record<string, string> = {
        R32: '16avos', R16: '8vos', QF: '4tos', SF: 'semifinales', Final: 'la Final',
      };
      const prevName = prevNames[prevRound.round] || prevRound.round;
      const prevIds = prevRound.matchups.map((m) => m.matchId);
      const prevMatches = await this.matchRepository.find({
        where: { id: In(prevIds) },
      });
      const unfinished = prevMatches.filter((m) => m.status !== 'finished');
      if (unfinished.length > 0) {
        return { message: `Aún no se ha definido la llave de ${nextName}. Faltan ${unfinished.length} partidos de ${prevName} por finalizar.` };
      }
    }

    const existingNext = await this.matchRepository.count({
      where: { id: In(nextRound.matchups.map((m) => m.matchId)) },
    });
    if (existingNext > 0) {
      throw new BadRequestException(
        `La ronda de ${nextName} ya existe. Elimínala antes de regenerar.`,
      );
    }

    const resolved = await this.resolveMatchups(nextRound.matchups);
    return this.createKoMatches(resolved, nextRound);
  }

  async deleteRound(round: string): Promise<void> {
    const bracketRound = BRACKET_ROUNDS.find((r) => r.round === round);
    if (!bracketRound) throw new BadRequestException(`Unknown round: ${round}`);

    const ids = bracketRound.matchups.map((m) => m.matchId);
    await this.matchRepository.delete({ id: In(ids) });
    this.logger.log(`Deleted ${round} round (${ids.length} matches)`);
  }

  // ── PRIVATE HELPERS ──

  private async resolveMatchups(
    matchups: BracketMatchup[],
  ): Promise<Array<{ id: string; homeTeamId: string; awayTeamId: string }>> {
    if (matchups[0]?.round === 'R32') {
      const allGroupMatches = await this.matchRepository.find({
        where: { groupId: Not(IsNull()), status: 'finished' },
      });
      const teams = await this.teamRepository.find();
      const standings = this.calculateGroupStandings(allGroupMatches, teams);
      const bestThird = this.pickBestThirdPlace(standings);
      const usedThird = new Set<string>();

      return matchups.map((m) => ({
        id: m.matchId,
        homeTeamId: this.resolveR32Slot(m.home, standings, bestThird, usedThird),
        awayTeamId: this.resolveR32Slot(m.away, standings, bestThird, usedThird),
      }));
    }

    return Promise.all(
      matchups.map(async (m) => ({
        id: m.matchId,
        homeTeamId: await this.resolveKoSlot(m.home),
        awayTeamId: await this.resolveKoSlot(m.away),
      })),
    );
  }

  private async createKoMatches(
    resolved: Array<{ id: string; homeTeamId: string; awayTeamId: string }>,
    round: typeof BRACKET_ROUNDS[number],
  ): Promise<IMatch[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const created: IMatch[] = [];
      for (const r of resolved) {
        const matchup = round.matchups.find((m) => m.matchId === r.id)!;
        const match = this.matchRepository.create({
          id: r.id,
          groupId: null,
          round: matchup.round,
          matchNumber: matchup.matchNumber,
          homeTeamId: r.homeTeamId,
          awayTeamId: r.awayTeamId,
          date: matchup.date,
          status: 'scheduled',
          homeScore: null,
          awayScore: null,
          extraHomeScore: null,
          extraAwayScore: null,
          penaltyHomeScore: null,
          penaltyAwayScore: null,
        });
        const saved = await queryRunner.manager.save(match);
        created.push(this.toIMatch(saved));
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Generated ${round.round} round: ${created.length} matches`);
      return created;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ── STANDINGS ──

  private calculateGroupStandings(matches: Match[], teams: Team[]): GroupStanding[] {
    const groupTeams = new Map<string, string[]>();
    for (const t of teams) {
      const list = groupTeams.get(t.groupId) || [];
      list.push(t.id);
      groupTeams.set(t.groupId, list);
    }

    const standings: GroupStanding[] = [];

    for (const [groupId, teamIds] of groupTeams) {
      const groupMatches = matches.filter((m) => m.groupId === groupId);
      const stats = new Map<string, { pts: number; gd: number; gf: number }>();

      for (const tid of teamIds) stats.set(tid, { pts: 0, gd: 0, gf: 0 });

      for (const m of groupMatches) {
        if (m.homeScore === null || m.awayScore === null) continue;
        const home = stats.get(m.homeTeamId)!;
        const away = stats.get(m.awayTeamId)!;
        home.gf += m.homeScore;
        away.gf += m.awayScore;
        home.gd += m.homeScore - m.awayScore;
        away.gd += m.awayScore - m.homeScore;
        if (m.homeScore > m.awayScore) home.pts += 3;
        else if (m.awayScore > m.homeScore) away.pts += 3;
        else { home.pts += 1; away.pts += 1; }
      }

      const sorted = teamIds
        .map((tid) => ({ teamId: tid, ...stats.get(tid)! }))
        .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);

      sorted.forEach((s, i) => {
        standings.push({
          groupId, teamId: s.teamId,
          points: s.pts, gd: s.gd, goals: s.gf,
          position: i + 1,
        });
      });
    }

    return standings;
  }

  private pickBestThirdPlace(standings: GroupStanding[]): GroupStanding[] {
    return standings
      .filter((s) => s.position === 3)
      .sort((a, b) => b.points - a.points || b.gd - a.gd || b.goals - a.goals)
      .slice(0, 8);
  }

  private resolveR32Slot(
    ref: BracketSlotRef,
    standings: GroupStanding[],
    bestThird: GroupStanding[],
    usedThird: Set<string>,
  ): string {
    if (ref.type === 'group_pos') {
      const entry = standings.find(
        (s) => s.groupId === ref.group && s.position === (ref.position === '1st' ? 1 : 2),
      );
      if (!entry) throw new BadRequestException(
        `Cannot determine ${ref.position} place in Group ${ref.group}`,
      );
      return entry.teamId;
    }

    if (ref.type === 'third_pos') {
      for (const candidate of ref.candidates) {
        if (usedThird.has(candidate)) continue;
        const entry = bestThird.find((s) => s.groupId === candidate);
        if (entry) {
          usedThird.add(candidate);
          return entry.teamId;
        }
      }
      throw new BadRequestException(
        `No available third-place team from [${ref.candidates.join(',')}]`,
      );
    }

    throw new BadRequestException(`Unexpected slot type for R32: ${ref.type}`);
  }

  private async resolveKoSlot(ref: BracketSlotRef): Promise<string> {
    if (ref.type === 'winner_of' || ref.type === 'loser_of') {
      const match = await this.matchRepository.findOne({ where: { id: ref.matchId } });
      if (!match) throw new NotFoundException(`Match ${ref.matchId} not found`);
      if (match.homeScore === null || match.awayScore === null) {
        throw new BadRequestException(`Match ${ref.matchId} has no result yet`);
      }
      return ref.type === 'winner_of'
        ? this.determineWinner(match)
        : this.determineLoser(match);
    }
    throw new BadRequestException(`Unexpected slot type for KO: ${ref.type}`);
  }

  private determineWinner(match: Match): string {
    if (match.homeScore === null || match.awayScore === null) {
      throw new BadRequestException(`Cannot determine winner: match ${match.id} has no score`);
    }
    if (match.homeScore !== match.awayScore) {
      return match.homeScore > match.awayScore ? match.homeTeamId : match.awayTeamId;
    }
    if (match.extraHomeScore != null && match.extraAwayScore != null) {
      if (match.extraHomeScore !== match.extraAwayScore) {
        return match.extraHomeScore > match.extraAwayScore ? match.homeTeamId : match.awayTeamId;
      }
    }
    if (match.penaltyHomeScore != null && match.penaltyAwayScore != null) {
      return match.penaltyHomeScore > match.penaltyAwayScore ? match.homeTeamId : match.awayTeamId;
    }
    throw new BadRequestException(`Cannot determine winner: match ${match.id} ended in a draw`);
  }

  private determineLoser(match: Match): string {
    const winner = this.determineWinner(match);
    return winner === match.homeTeamId ? match.awayTeamId : match.homeTeamId;
  }

  private toIMatch(match: Match): IMatch {
    return {
      id: match.id,
      groupId: match.groupId ?? null,
      round: match.round ?? null,
      matchNumber: match.matchNumber,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      date: match.date,
      status: match.status as IMatch['status'],
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      extraHomeScore: match.extraHomeScore,
      extraAwayScore: match.extraAwayScore,
      penaltyHomeScore: match.penaltyHomeScore,
      penaltyAwayScore: match.penaltyAwayScore,
    };
  }
}
