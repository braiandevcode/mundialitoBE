import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('teams')
export class Team {
  @PrimaryColumn({ name: 'id', length: 5 })
  id: string;

  @Column({ name: 'name', length: 50 })
  name: string;

  @Column({ name: 'country_code', length: 5 })
  countryCode: string;

  @Column({ name: 'group_id', length: 2 })
  groupId: string;
}
