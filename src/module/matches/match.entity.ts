import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Team } from '../teams/team.entity';

@Entity('matches')
export class Match {
  @PrimaryColumn({ name: 'id', length: 20 })
  id: string;

  @Column({ name: 'group_id', type: 'varchar', length: 2, nullable: true })
  groupId: string | null;

  @Column({ name: 'round', type: 'varchar', length: 10, nullable: true })
  round: string | null;

  @Column({ name: 'match_number', type: 'int' })
  matchNumber: number;

  @Column({ name: 'home_team_id', length: 5 })
  homeTeamId: string;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'home_team_id' })
  homeTeam: Team;

  @Column({ name: 'away_team_id', length: 5 })
  awayTeamId: string;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'away_team_id' })
  awayTeam: Team;

  @Column({ name: 'date', type: 'datetime' })
  date: string;

  @Column({ name: 'status', length: 15, default: 'scheduled' })
  status: string;

  @Column({ name: 'home_score', type: 'int', nullable: true })
  homeScore: number | null;

  @Column({ name: 'away_score', type: 'int', nullable: true })
  awayScore: number | null;

  @Column({ name: 'extra_home_score', type: 'int', nullable: true })
  extraHomeScore: number | null;

  @Column({ name: 'extra_away_score', type: 'int', nullable: true })
  extraAwayScore: number | null;

  @Column({ name: 'penalty_home_score', type: 'int', nullable: true })
  penaltyHomeScore: number | null;

  @Column({ name: 'penalty_away_score', type: 'int', nullable: true })
  penaltyAwayScore: number | null;
}
