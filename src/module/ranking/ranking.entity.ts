import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('ranking_entries')
@Unique(['roundId', 'userId'])
export class RankingEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'round_id' })
  roundId: string;

  @Column({ name: 'round_label' })
  roundLabel: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'user_name' })
  userName: string;

  @Column({ name: 'avatar', nullable: true })
  avatar?: string;

  @Column({ name: 'total_points', type: 'int' })
  totalPoints: number;

  @Column({ name: 'predictions_count', type: 'int' })
  predictionsCount: number;

  @Column({ name: 'exact_scores', type: 'int' })
  exactScores: number;

  @Column({ name: 'success_rate', type: 'int' })
  successRate: number;

  @Column({ name: 'position', type: 'int' })
  position: number;
}
