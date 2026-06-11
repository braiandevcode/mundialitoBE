import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { User } from '../users/user.entity';
import { Match } from '../matches/match.entity';

@Entity('predictions')
@Unique(['userId', 'matchId'])
export class Prediction {
  @PrimaryColumn({ name: 'id', length: 40 })
  id!: string;

  @Column({ name: 'user_id', length: 128 })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'match_id', length: 20 })
  matchId!: string;

  @ManyToOne(() => Match)
  @JoinColumn({ name: 'match_id' })
  match!: Match;

  @Column({ name: 'home_score', type: 'int' })
  homeScore!: number;

  @Column({ name: 'away_score', type: 'int' })
  awayScore!: number;

  @Column({ name: 'extra_home_score', type: 'int', nullable: true })
  extraHomeScore?: number;

  @Column({ name: 'extra_away_score', type: 'int', nullable: true })
  extraAwayScore?: number;

  @Column({ name: 'penalty_winner', length: 4, nullable: true })
  penaltyWinner?: string;

  @Column({ name: 'points', type: 'int', nullable: true })
  points?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
