import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './team.entity';
import { ITeam } from '../../shared/contracts/entities';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  // Retorna los 48 equipos ordenados por grupo y nombre
  async findAll(): Promise<ITeam[]> {
    const teams = await this.teamRepository.find({
      order: { groupId: 'ASC', name: 'ASC' },
    });
    return teams.map(this.toITeam);
  }

  async findById(id: string): Promise<ITeam | null> {
    const team = await this.teamRepository.findOne({ where: { id } });
    return team ? this.toITeam(team) : null;
  }

  // Transformo la entidad Team al contrato ITeam que espera el frontend
  private toITeam(team: Team): ITeam {
    return {
      id: team.id,
      name: team.name,
      countryCode: team.countryCode,
      groupId: team.groupId as ITeam['groupId'],
    };
  }
}
