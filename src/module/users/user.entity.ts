import { Entity, PrimaryColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { UserRole } from '../../shared/constants/enums';

@Entity('users')
export class User {
  @PrimaryColumn({ name: 'id' })
  id!: string;

  @Column({ name: 'name' })
  name!: string;

  @Column({ name: 'email', unique: true })
  email!: string;

  @Column({ name: 'avatar', nullable: true })
  avatar?: string;

  @Column({ name: 'role', type: 'varchar', length: 10, default: UserRole.USER })
  role!: UserRole;

  @Column({ name: 'total_points', default: 0 })
  totalPoints!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt?: Date;
}
