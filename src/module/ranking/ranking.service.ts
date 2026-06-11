import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { Prediction } from '../predictions/prediction.entity';
import { User } from '../users/user.entity';
import { Match } from '../matches/match.entity';
import { RankingEntry } from './ranking.entity';
import { IRankingEntry, IRankingRound } from '../../shared/contracts/entities';
import { UserRole } from '../../shared/constants/enums';

interface IGlobalPhase {
  round: string;
  matchRange: [number, number];
}

@Injectable()
export class RankingService {
  private readonly logger = new Logger(RankingService.name);

  private readonly globalPhases: IGlobalPhase[] = [
    { round: 'Group Stage', matchRange: [1, 72] },
    { round: 'R32', matchRange: [73, 88] },
    { round: 'R16', matchRange: [89, 96] },
    { round: 'QF', matchRange: [97, 100] },
    { round: 'SF', matchRange: [101, 102] },
    { round: 'Final', matchRange: [103, 104] },
  ];

  constructor(
    @InjectRepository(Prediction)
    private readonly predictionRepository: Repository<Prediction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(RankingEntry)
    private readonly rankingEntryRepository: Repository<RankingEntry>,
  ) {}

  async getRanking(): Promise<IRankingRound[]> {
    const allEntries = await this.rankingEntryRepository.find({
      order: { roundId: 'ASC', position: 'ASC' },
    });

    const roundMap = new Map<string, IRankingEntry[]>();
    const labelMap = new Map<string, string>();

    for (const e of allEntries) {
      const entries = roundMap.get(e.roundId) || [];
      entries.push({
        userId: e.userId,
        userName: e.userName,
        avatar: e.avatar,
        totalPoints: e.totalPoints,
        predictionsCount: e.predictionsCount,
        exactScores: e.exactScores,
        successRate: e.successRate,
      });
      roundMap.set(e.roundId, entries);
      labelMap.set(e.roundId, e.roundLabel);
    }

    const results: IRankingRound[] = [];
    for (const [roundId, entries] of roundMap) {
      if (entries.length === 0) continue;
      results.push({ id: roundId, label: labelMap.get(roundId) || '', entries });
    }

    results.sort((a, b) => {
      if (a.id === 'global') return 1;
      if (b.id === 'global') return -1;
      return a.id.localeCompare(b.id);
    });

    this.logger.log(`getRanking: ${results.length} rounds with data`);
    return results;
  }

  async tryRecalculateAffected(matchDate: Date | string): Promise<void> {
    const day = this.getDayKey(matchDate);
    this.logger.log(`tryRecalculateAffected: matchDate=${matchDate}, day=${day}`);
    await this.maybeRecalculateDaily(day);
    await this.maybeRecalculateGlobal();
  }

  private async maybeRecalculateDaily(day: string): Promise<void> {
    const allMatches = await this.matchRepository.find();
    const dayMatches = allMatches.filter((m) => this.getDayKey(m.date) === day);
    if (dayMatches.length === 0) return;

    const finished = dayMatches.filter((m) => m.status === 'finished');
    this.logger.log(`maybeRecalculateDaily: day=${day}, total=${dayMatches.length}, finished=${finished.length}`);

    if (finished.length === dayMatches.length) {
      const roundId = `day-${day}`;
      const label = this.formatDayLabel(day);
      await this.recalculateAndPersist(roundId, label, day, false);
    }
  }

  private async maybeRecalculateGlobal(): Promise<void> {
    const completed = await this.countCompletedPhases();
    this.logger.log(`maybeRecalculateGlobal: completed phases=${completed}`);
    if (completed === 0) return;

    const lastMatchNumber = this.globalPhases[completed - 1].matchRange[1];
    const matches = await this.matchRepository.find({
      where: { matchNumber: Between(1, lastMatchNumber) },
    });
    const matchIds = matches.map((m) => m.id);
    if (matchIds.length === 0) return;

    await this.recalculateAndPersist('global', 'Global', null, true, matchIds);
  }

  private async recalculateAndPersist(
    roundId: string,
    roundLabel: string,
    dayFilter: string | null,
    isGlobal: boolean,
    globalMatchIds?: string[],
  ): Promise<void> {
    this.logger.log(`recalculateAndPersist: roundId=${roundId}, isGlobal=${isGlobal}`);

    const entries = (isGlobal && globalMatchIds)
      ? await this.calculateEntries(globalMatchIds)
      : await this.calculateDailyEntries(dayFilter!);

    this.logger.log(`recalculateAndPersist: computed ${entries.length} entries`);

    await this.rankingEntryRepository.delete({ roundId });
    this.logger.log(`recalculateAndPersist: deleted old entries for ${roundId}`);

    if (entries.length > 0) {
      const rankingEntries = entries.map((e, i) => {
        const re = new RankingEntry();
        re.roundId = roundId;
        re.roundLabel = roundLabel;
        re.userId = e.userId;
        re.userName = e.userName;
        re.avatar = e.avatar;
        re.totalPoints = e.totalPoints;
        re.predictionsCount = e.predictionsCount;
        re.exactScores = e.exactScores;
        re.successRate = e.successRate;
        re.position = i + 1;
        return re;
      });
      await this.rankingEntryRepository.save(rankingEntries);
      this.logger.log(`recalculateAndPersist: saved ${rankingEntries.length} entries for ${roundId}`);
    } else {
      this.logger.log(`recalculateAndPersist: no entries to persist for ${roundId}`);
    }
  }

  private async calculateDailyEntries(day: string): Promise<IRankingEntry[]> {
    const allMatches = await this.matchRepository.find();
    const matches = allMatches.filter((m) => this.getDayKey(m.date) === day);
    this.logger.log(`calculateDailyEntries: day=${day}, matches=${matches.length}`);
    const matchIds = matches.map((m) => m.id);
    return this.calculateEntries(matchIds);
  }

  private async calculateEntries(matchIds: string[]): Promise<IRankingEntry[]> {
    if (matchIds.length === 0) return [];

    const users = await this.userRepository.find({
      where: { role: UserRole.USER },
    });
    const predictions = await this.predictionRepository.find({
      where: { matchId: In(matchIds) },
    });

    this.logger.log(`calculateEntries: matchIds=${matchIds.length}, users=${users.length}, predictions=${predictions.length}`);

    const userPredictions = new Map<string, Prediction[]>();
    for (const pred of predictions) {
      const existing = userPredictions.get(pred.userId) || [];
      existing.push(pred);
      userPredictions.set(pred.userId, existing);
    }

    const entries: IRankingEntry[] = [];
    for (const user of users) {
      const userPreds = userPredictions.get(user.id) || [];
      const finishedPreds = userPreds.filter((p) => p.points !== null);
      const predictionsCount = finishedPreds.length;
      const exactScores = finishedPreds.filter((p) => (p.points ?? 0) > 0).length;
      const totalPoints = finishedPreds.reduce((sum, p) => sum + (p.points ?? 0), 0);
      const successRate = predictionsCount > 0
        ? Math.round((exactScores / predictionsCount) * 100)
        : 0;
      entries.push({
        userId: user.id,
        userName: user.name,
        avatar: user.avatar,
        totalPoints,
        predictionsCount,
        exactScores,
        successRate,
      });
    }

    entries.sort((a, b) => b.totalPoints - a.totalPoints);
    return entries;
  }

  private async countCompletedPhases(): Promise<number> {
    let count = 0;
    for (const phase of this.globalPhases) {
      const [min, max] = phase.matchRange;
      const total = await this.matchRepository.count({
        where: { matchNumber: Between(min, max) },
      });
      if (total === 0) break;
      const finished = await this.matchRepository.count({
        where: { matchNumber: Between(min, max), status: 'finished' },
      });
      if (finished < total) break;
      count++;
    }
    return count;
  }

  private getDayKey(d: Date | string): string {
    if (typeof d === 'string') return d.split('T')[0];
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private formatDayLabel(isoDay: string): string {
    const parts = isoDay.split('-');
    const day = parseInt(parts[2], 10);
    const month = parts[1] === '06' ? 'Jun' : 'Jul';
    return `${day} ${month}`;
  }
}
