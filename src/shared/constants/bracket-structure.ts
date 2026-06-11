export type BracketSlotRef =
  | { type: 'group_pos'; group: string; position: '1st' | '2nd' }
  | { type: 'third_pos'; candidates: string[] }
  | { type: 'winner_of'; matchId: string }
  | { type: 'loser_of'; matchId: string };

export interface BracketMatchup {
  matchId: string;       // ej: "R32-1", "R16-3"
  matchNumber: number;   // 73–104
  round: string;         // R32, R16, QF, SF, 3rd, Final
  date: string;          // ISO 8601 con timezone (FIFA match time ET)
  home: BracketSlotRef;
  away: BracketSlotRef;
}

export interface BracketRound {
  round: string;
  matchCount: number;
  startMatchNumber: number;
  matchups: BracketMatchup[];
}

const R32_SLOTS: BracketMatchup[] = [
  { matchId: 'R32-1',  matchNumber: 73,  round: 'R32', date: '2026-06-28T15:00:00-04:00', home: { type: 'group_pos', group: 'A', position: '2nd' }, away: { type: 'group_pos', group: 'B', position: '2nd' } },
  { matchId: 'R32-2',  matchNumber: 74,  round: 'R32', date: '2026-06-29T16:30:00-04:00', home: { type: 'group_pos', group: 'E', position: '1st' }, away: { type: 'third_pos', candidates: ['A','B','C','D','F'] } },
  { matchId: 'R32-3',  matchNumber: 75,  round: 'R32', date: '2026-06-29T21:00:00-04:00', home: { type: 'group_pos', group: 'F', position: '1st' }, away: { type: 'group_pos', group: 'C', position: '2nd' } },
  { matchId: 'R32-4',  matchNumber: 76,  round: 'R32', date: '2026-06-29T13:00:00-04:00', home: { type: 'group_pos', group: 'C', position: '1st' }, away: { type: 'group_pos', group: 'F', position: '2nd' } },
  { matchId: 'R32-5',  matchNumber: 77,  round: 'R32', date: '2026-06-30T17:00:00-04:00', home: { type: 'group_pos', group: 'I', position: '1st' }, away: { type: 'third_pos', candidates: ['C','D','F','G','H'] } },
  { matchId: 'R32-6',  matchNumber: 78,  round: 'R32', date: '2026-06-30T13:00:00-04:00', home: { type: 'group_pos', group: 'E', position: '2nd' }, away: { type: 'group_pos', group: 'I', position: '2nd' } },
  { matchId: 'R32-7',  matchNumber: 79,  round: 'R32', date: '2026-06-30T21:00:00-04:00', home: { type: 'group_pos', group: 'A', position: '1st' }, away: { type: 'third_pos', candidates: ['C','E','F','H','I'] } },
  { matchId: 'R32-8',  matchNumber: 80,  round: 'R32', date: '2026-07-01T12:00:00-04:00', home: { type: 'group_pos', group: 'L', position: '1st' }, away: { type: 'third_pos', candidates: ['E','H','I','J','K'] } },
  { matchId: 'R32-9',  matchNumber: 81,  round: 'R32', date: '2026-07-01T20:00:00-04:00', home: { type: 'group_pos', group: 'D', position: '1st' }, away: { type: 'third_pos', candidates: ['B','E','F','I','J'] } },
  { matchId: 'R32-10', matchNumber: 82,  round: 'R32', date: '2026-07-01T16:00:00-04:00', home: { type: 'group_pos', group: 'G', position: '1st' }, away: { type: 'third_pos', candidates: ['A','E','H','I','J'] } },
  { matchId: 'R32-11', matchNumber: 83,  round: 'R32', date: '2026-07-02T19:00:00-04:00', home: { type: 'group_pos', group: 'K', position: '2nd' }, away: { type: 'group_pos', group: 'L', position: '2nd' } },
  { matchId: 'R32-12', matchNumber: 84,  round: 'R32', date: '2026-07-02T15:00:00-04:00', home: { type: 'group_pos', group: 'H', position: '1st' }, away: { type: 'group_pos', group: 'J', position: '2nd' } },
  { matchId: 'R32-13', matchNumber: 85,  round: 'R32', date: '2026-07-02T23:00:00-04:00', home: { type: 'group_pos', group: 'B', position: '1st' }, away: { type: 'third_pos', candidates: ['E','F','G','I','J'] } },
  { matchId: 'R32-14', matchNumber: 86,  round: 'R32', date: '2026-07-03T18:00:00-04:00', home: { type: 'group_pos', group: 'J', position: '1st' }, away: { type: 'group_pos', group: 'H', position: '2nd' } },
  { matchId: 'R32-15', matchNumber: 87,  round: 'R32', date: '2026-07-03T21:30:00-04:00', home: { type: 'group_pos', group: 'K', position: '1st' }, away: { type: 'third_pos', candidates: ['D','E','I','J','L'] } },
  { matchId: 'R32-16', matchNumber: 88,  round: 'R32', date: '2026-07-03T14:00:00-04:00', home: { type: 'group_pos', group: 'D', position: '2nd' }, away: { type: 'group_pos', group: 'G', position: '2nd' } },
];

const R16_SLOTS: BracketMatchup[] = [
  { matchId: 'R16-1', matchNumber: 89, round: 'R16', date: '2026-07-04T17:00:00-04:00', home: { type: 'winner_of', matchId: 'R32-2' }, away: { type: 'winner_of', matchId: 'R32-5' } },
  { matchId: 'R16-2', matchNumber: 90, round: 'R16', date: '2026-07-04T13:00:00-04:00', home: { type: 'winner_of', matchId: 'R32-1' }, away: { type: 'winner_of', matchId: 'R32-3' } },
  { matchId: 'R16-3', matchNumber: 91, round: 'R16', date: '2026-07-05T16:00:00-04:00', home: { type: 'winner_of', matchId: 'R32-4' }, away: { type: 'winner_of', matchId: 'R32-6' } },
  { matchId: 'R16-4', matchNumber: 92, round: 'R16', date: '2026-07-05T20:00:00-04:00', home: { type: 'winner_of', matchId: 'R32-7' }, away: { type: 'winner_of', matchId: 'R32-8' } },
  { matchId: 'R16-5', matchNumber: 93, round: 'R16', date: '2026-07-06T15:00:00-04:00', home: { type: 'winner_of', matchId: 'R32-11' }, away: { type: 'winner_of', matchId: 'R32-12' } },
  { matchId: 'R16-6', matchNumber: 94, round: 'R16', date: '2026-07-06T20:00:00-04:00', home: { type: 'winner_of', matchId: 'R32-9' }, away: { type: 'winner_of', matchId: 'R32-10' } },
  { matchId: 'R16-7', matchNumber: 95, round: 'R16', date: '2026-07-07T12:00:00-04:00', home: { type: 'winner_of', matchId: 'R32-14' }, away: { type: 'winner_of', matchId: 'R32-16' } },
  { matchId: 'R16-8', matchNumber: 96, round: 'R16', date: '2026-07-07T16:00:00-04:00', home: { type: 'winner_of', matchId: 'R32-13' }, away: { type: 'winner_of', matchId: 'R32-15' } },
];

const QF_SLOTS: BracketMatchup[] = [
  { matchId: 'QF-1', matchNumber: 97,  round: 'QF', date: '2026-07-09T16:00:00-04:00', home: { type: 'winner_of', matchId: 'R16-1' }, away: { type: 'winner_of', matchId: 'R16-2' } },
  { matchId: 'QF-2', matchNumber: 98,  round: 'QF', date: '2026-07-10T15:00:00-04:00', home: { type: 'winner_of', matchId: 'R16-5' }, away: { type: 'winner_of', matchId: 'R16-6' } },
  { matchId: 'QF-3', matchNumber: 99,  round: 'QF', date: '2026-07-11T17:00:00-04:00', home: { type: 'winner_of', matchId: 'R16-3' }, away: { type: 'winner_of', matchId: 'R16-4' } },
  { matchId: 'QF-4', matchNumber: 100, round: 'QF', date: '2026-07-11T21:00:00-04:00', home: { type: 'winner_of', matchId: 'R16-7' }, away: { type: 'winner_of', matchId: 'R16-8' } },
];

const SF_SLOTS: BracketMatchup[] = [
  { matchId: 'SF-1', matchNumber: 101, round: 'SF', date: '2026-07-14T15:00:00-04:00', home: { type: 'winner_of', matchId: 'QF-1' }, away: { type: 'winner_of', matchId: 'QF-2' } },
  { matchId: 'SF-2', matchNumber: 102, round: 'SF', date: '2026-07-15T15:00:00-04:00', home: { type: 'winner_of', matchId: 'QF-3' }, away: { type: 'winner_of', matchId: 'QF-4' } },
];

const FINAL_SLOTS: BracketMatchup[] = [
  { matchId: '3RD',   matchNumber: 103, round: '3rd',   date: '2026-07-18T17:00:00-04:00', home: { type: 'loser_of', matchId: 'SF-1' }, away: { type: 'loser_of', matchId: 'SF-2' } },
  { matchId: 'FINAL', matchNumber: 104, round: 'Final', date: '2026-07-19T15:00:00-04:00', home: { type: 'winner_of', matchId: 'SF-1' }, away: { type: 'winner_of', matchId: 'SF-2' } },
];

export const BRACKET_ROUNDS: BracketRound[] = [
  { round: 'R32',   matchCount: 16, startMatchNumber: 73,  matchups: R32_SLOTS },
  { round: 'R16',   matchCount: 8,  startMatchNumber: 89,  matchups: R16_SLOTS },
  { round: 'QF',    matchCount: 4,  startMatchNumber: 97,  matchups: QF_SLOTS },
  { round: 'SF',    matchCount: 2,  startMatchNumber: 101, matchups: SF_SLOTS },
  { round: 'Final', matchCount: 2, startMatchNumber: 103, matchups: FINAL_SLOTS },
];
