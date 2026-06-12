import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../../../module/teams/team.entity';
import { Match } from '../../../module/matches/match.entity';

const TEAMS: Array<{ id: string; name: string; countryCode: string; groupId: string }> = [
  // Group A
  { id: 'MX',  name: 'Mexico',         countryCode: 'MX',  groupId: 'A' },
  { id: 'CA',  name: 'Canada',         countryCode: 'CA',  groupId: 'A' },
  { id: 'NZ',  name: 'New Zealand',    countryCode: 'NZ',  groupId: 'A' },
  { id: 'MA',  name: 'Morocco',        countryCode: 'MA',  groupId: 'A' },
  // Group B
  { id: 'AR',  name: 'Argentina',      countryCode: 'AR',  groupId: 'B' },
  { id: 'SA',  name: 'Saudi Arabia',   countryCode: 'SA',  groupId: 'B' },
  { id: 'UA',  name: 'Ukraine',        countryCode: 'UA',  groupId: 'B' },
  { id: 'SN',  name: 'Senegal',        countryCode: 'SN',  groupId: 'B' },
  // Group C
  { id: 'BR',  name: 'Brazil',         countryCode: 'BR',  groupId: 'C' },
  { id: 'KR',  name: 'South Korea',    countryCode: 'KR',  groupId: 'C' },
  { id: 'NG',  name: 'Nigeria',        countryCode: 'NG',  groupId: 'C' },
  { id: 'AU',  name: 'Australia',      countryCode: 'AU',  groupId: 'C' },
  // Group D
  { id: 'FR',  name: 'France',         countryCode: 'FR',  groupId: 'D' },
  { id: 'JP',  name: 'Japan',          countryCode: 'JP',  groupId: 'D' },
  { id: 'GH',  name: 'Ghana',          countryCode: 'GH',  groupId: 'D' },
  { id: 'EC',  name: 'Ecuador',        countryCode: 'EC',  groupId: 'D' },
  // Group E
  { id: 'EN',  name: 'England',        countryCode: 'GB', groupId: 'E' },
  { id: 'IR',  name: 'Iran',           countryCode: 'IR',  groupId: 'E' },
  { id: 'TN',  name: 'Tunisia',        countryCode: 'TN',  groupId: 'E' },
  { id: 'CR',  name: 'Costa Rica',     countryCode: 'CR',  groupId: 'E' },
  // Group F
  { id: 'ES',  name: 'Spain',          countryCode: 'ES',  groupId: 'F' },
  { id: 'US',  name: 'United States',  countryCode: 'US',  groupId: 'F' },
  { id: 'CM',  name: 'Cameroon',       countryCode: 'CM',  groupId: 'F' },
  { id: 'IQ',  name: 'Iraq',           countryCode: 'IQ',  groupId: 'F' },
  // Group G
  { id: 'DE',  name: 'Germany',        countryCode: 'DE',  groupId: 'G' },
  { id: 'UZ',  name: 'Uzbekistan',     countryCode: 'UZ',  groupId: 'G' },
  { id: 'CI',  name: 'Ivory Coast',    countryCode: 'CI',  groupId: 'G' },
  { id: 'PA',  name: 'Panama',         countryCode: 'PA',  groupId: 'G' },
  // Group H
  { id: 'PT',  name: 'Portugal',       countryCode: 'PT',  groupId: 'H' },
  { id: 'QA',  name: 'Qatar',          countryCode: 'QA',  groupId: 'H' },
  { id: 'EG',  name: 'Egypt',          countryCode: 'EG',  groupId: 'H' },
  { id: 'BO',  name: 'Bolivia',        countryCode: 'BO',  groupId: 'H' },
  // Group I
  { id: 'NL',  name: 'Netherlands',    countryCode: 'NL',  groupId: 'I' },
  { id: 'JO',  name: 'Jordan',         countryCode: 'JO',  groupId: 'I' },
  { id: 'ML',  name: 'Mali',           countryCode: 'ML',  groupId: 'I' },
  { id: 'HN',  name: 'Honduras',       countryCode: 'HN',  groupId: 'I' },
  // Group J
  { id: 'IT',  name: 'Italy',          countryCode: 'IT',  groupId: 'J' },
  { id: 'OM',  name: 'Oman',           countryCode: 'OM',  groupId: 'J' },
  { id: 'BF',  name: 'Burkina Faso',   countryCode: 'BF',  groupId: 'J' },
  { id: 'PY',  name: 'Paraguay',       countryCode: 'PY',  groupId: 'J' },
  // Group K
  { id: 'HR',  name: 'Croatia',        countryCode: 'HR',  groupId: 'K' },
  { id: 'AE',  name: 'United Arab Emirates', countryCode: 'AE', groupId: 'K' },
  { id: 'ZA',  name: 'South Africa',   countryCode: 'ZA',  groupId: 'K' },
  { id: 'VE',  name: 'Venezuela',      countryCode: 'VE',  groupId: 'K' },
  // Group L
  { id: 'BE',  name: 'Belgium',        countryCode: 'BE',  groupId: 'L' },
  { id: 'CN',  name: 'China',          countryCode: 'CN',  groupId: 'L' },
  { id: 'CD',  name: 'DR Congo',       countryCode: 'CD',  groupId: 'L' },
  { id: 'CL',  name: 'Chile',          countryCode: 'CL',  groupId: 'L' },
];

/**
 * Fechas reales FIFA 2026 para los 72 partidos de grupo (A–L, 6 por grupo).
 * Orden: MD1×2, MD2×2, MD3×2 — corresponde a los pairings round-robin.
 * Horarios en Eastern Time (ET).
 */
const GROUP_MATCH_DATES: Record<string, string[]> = {
  A: [
    '2026-06-11T15:00:00-04:00',
    '2026-06-11T22:00:00-04:00',
    '2026-06-18T12:00:00-04:00',
    '2026-06-18T21:00:00-04:00',
    '2026-06-24T21:00:00-04:00',
    '2026-06-24T21:00:00-04:00',
  ],
  B: [
    '2026-06-12T15:00:00-04:00',
    '2026-06-13T15:00:00-04:00',
    '2026-06-18T15:00:00-04:00',
    '2026-06-18T18:00:00-04:00',
    '2026-06-24T15:00:00-04:00',
    '2026-06-24T15:00:00-04:00',
  ],
  C: [
    '2026-06-13T18:00:00-04:00',
    '2026-06-13T21:00:00-04:00',
    '2026-06-19T18:00:00-04:00',
    '2026-06-19T20:30:00-04:00',
    '2026-06-24T18:00:00-04:00',
    '2026-06-24T18:00:00-04:00',
  ],
  D: [
    '2026-06-12T21:00:00-04:00',
    '2026-06-14T00:00:00-04:00',
    '2026-06-19T15:00:00-04:00',
    '2026-06-19T23:00:00-04:00',
    '2026-06-25T22:00:00-04:00',
    '2026-06-25T22:00:00-04:00',
  ],
  E: [
    '2026-06-14T13:00:00-04:00',
    '2026-06-14T19:00:00-04:00',
    '2026-06-20T16:00:00-04:00',
    '2026-06-20T20:00:00-04:00',
    '2026-06-25T16:00:00-04:00',
    '2026-06-25T16:00:00-04:00',
  ],
  F: [
    '2026-06-14T16:00:00-04:00',
    '2026-06-14T22:00:00-04:00',
    '2026-06-20T13:00:00-04:00',
    '2026-06-21T00:00:00-04:00',
    '2026-06-25T19:00:00-04:00',
    '2026-06-25T19:00:00-04:00',
  ],
  G: [
    '2026-06-15T15:00:00-04:00',
    '2026-06-15T21:00:00-04:00',
    '2026-06-21T15:00:00-04:00',
    '2026-06-21T21:00:00-04:00',
    '2026-06-26T23:00:00-04:00',
    '2026-06-26T23:00:00-04:00',
  ],
  H: [
    '2026-06-15T12:00:00-04:00',
    '2026-06-15T18:00:00-04:00',
    '2026-06-21T12:00:00-04:00',
    '2026-06-21T18:00:00-04:00',
    '2026-06-26T20:00:00-04:00',
    '2026-06-26T20:00:00-04:00',
  ],
  I: [
    '2026-06-16T15:00:00-04:00',
    '2026-06-16T18:00:00-04:00',
    '2026-06-22T17:00:00-04:00',
    '2026-06-22T20:00:00-04:00',
    '2026-06-26T15:00:00-04:00',
    '2026-06-26T15:00:00-04:00',
  ],
  J: [
    '2026-06-16T21:00:00-04:00',
    '2026-06-17T00:00:00-04:00',
    '2026-06-22T13:00:00-04:00',
    '2026-06-22T23:00:00-04:00',
    '2026-06-27T22:00:00-04:00',
    '2026-06-27T22:00:00-04:00',
  ],
  K: [
    '2026-06-17T13:00:00-04:00',
    '2026-06-17T22:00:00-04:00',
    '2026-06-23T13:00:00-04:00',
    '2026-06-23T22:00:00-04:00',
    '2026-06-27T19:30:00-04:00',
    '2026-06-27T19:30:00-04:00',
  ],
  L: [
    '2026-06-17T16:00:00-04:00',
    '2026-06-17T19:00:00-04:00',
    '2026-06-23T16:00:00-04:00',
    '2026-06-23T19:00:00-04:00',
    '2026-06-27T17:00:00-04:00',
    '2026-06-27T17:00:00-04:00',
  ],
};

/**
 * Construye los 72 partidos de grupos (A–L, 6 partidos por grupo).
 * matchNumber 1–72.
 */
function buildGroupMatches(): Partial<Match>[] {
  const matches: Partial<Match>[] = [];
  let matchNumber = 1;

  const groups = 'ABCDEFGHIJKL'.split('');
  for (const g of groups) {
    const grp = TEAMS.filter((t) => t.groupId === g);
    if (grp.length !== 4) continue;
    const dates = GROUP_MATCH_DATES[g];
    if (!dates) continue;

    // Cada grupo: enfrentamientos round-robin
    const pairings = [
      [grp[0].id, grp[1].id],
      [grp[2].id, grp[3].id],
      [grp[0].id, grp[2].id],
      [grp[1].id, grp[3].id],
      [grp[0].id, grp[3].id],
      [grp[1].id, grp[2].id],
    ];

    for (let i = 0; i < pairings.length; i++) {
      matches.push({
        id: `${g}${i + 1}`,
        groupId: g,
        round: null,
        matchNumber: matchNumber++,
        homeTeamId: pairings[i][0],
        awayTeamId: pairings[i][1],
        date: dates[i],
        status: 'scheduled',
        homeScore: null,
        awayScore: null,
        extraHomeScore: null,
        extraAwayScore: null,
        penaltyHomeScore: null,
        penaltyAwayScore: null,
      });
    }
  }
  return matches;
}

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Team) private readonly teamRepository: Repository<Team>,
    @InjectRepository(Match) private readonly matchRepository: Repository<Match>,
  ) {}

  // async onModuleInit(): Promise<void> {
  //   await this.seed();
  // }

  async seed(): Promise<void> {
    const teamCount = await this.teamRepository.count();
    const matchCount = await this.matchRepository.count();

    if (teamCount > 0 && matchCount >= 72) {
      this.logger.log(`Seed skipped — DB already has ${teamCount} teams and ${matchCount} matches`);
      return;
    }

    this.logger.log('Seeding database with 48 teams and 72 group matches...');

    // Seed teams
    await this.teamRepository.save(TEAMS.map((t) => {
      const team = new Team();
      team.id = t.id;
      team.name = t.name;
      team.countryCode = t.countryCode;
      team.groupId = t.groupId;
      return team;
    }));
    this.logger.log(`Inserted ${TEAMS.length} teams`);

    // Seed group matches only (KO rounds generated on demand by admin)
    const groupMatches = buildGroupMatches();

    await this.matchRepository.save(groupMatches.map((m) => {
      const match = new Match();
      match.id = m.id!;
      match.groupId = m.groupId ?? null;
      match.round = m.round ?? null;
      match.matchNumber = m.matchNumber!;
      match.homeTeamId = m.homeTeamId!;
      match.awayTeamId = m.awayTeamId!;
      match.date = m.date!;
      match.status = m.status!;
      match.homeScore = m.homeScore ?? null;
      match.awayScore = m.awayScore ?? null;
      match.extraHomeScore = m.extraHomeScore ?? null;
      match.extraAwayScore = m.extraAwayScore ?? null;
      match.penaltyHomeScore = m.penaltyHomeScore ?? null;
      match.penaltyAwayScore = m.penaltyAwayScore ?? null;
      return match;
    }));
    this.logger.log(`Inserted ${groupMatches.length} group matches`);
    this.logger.log('Seed completed successfully');
  }
}
