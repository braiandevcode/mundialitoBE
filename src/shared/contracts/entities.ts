import {
  TGroupId,
  TMatchStatus,
  TKnockoutRound,
  TPenaltyWinner,
} from './types';

export interface IUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  totalPoints: number;
  rank: number;
}

export interface ITeam {
  id: string;
  name: string;
  countryCode: string;
  groupId: TGroupId;
}

export interface IGroup {
  id: TGroupId;
  name: string;
  teams: ITeam[];
  matches: IMatch[];
}

export interface IMatch {
  id: string;
  groupId: string | null;
  round: string | null;
  matchNumber: number;
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  status: TMatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  extraHomeScore: number | null;
  extraAwayScore: number | null;
  penaltyHomeScore: number | null;
  penaltyAwayScore: number | null;
}

export interface IPrediction {
  id: string;
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  extraHomeScore?: number;
  extraAwayScore?: number;
  penaltyWinner?: TPenaltyWinner;
  points: number | null;
  createdAt: string;
}

export interface IRankingEntry {
  userId: string;
  userName: string;
  avatar?: string;
  totalPoints: number;
  predictionsCount: number;
  exactScores: number;
  successRate: number;
}

export interface IRankingRound {
  id: string;
  label: string;
  entries: IRankingEntry[];
}
