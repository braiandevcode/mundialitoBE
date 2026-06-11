import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sponsor } from './sponsor.entity';

@Injectable()
export class SponsorsService {
  constructor(
    @InjectRepository(Sponsor)
    private readonly sponsorRepository: Repository<Sponsor>,
  ) {}

  async findAllActive(): Promise<Sponsor[]> {
    return this.sponsorRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }

  async findAll(): Promise<Sponsor[]> {
    return this.sponsorRepository.find({ order: { displayOrder: 'ASC' } });
  }

  async create(data: Partial<Sponsor>): Promise<Sponsor> {
    const sponsor = this.sponsorRepository.create(data);
    return this.sponsorRepository.save(sponsor);
  }

  async update(id: string, data: Partial<Sponsor>): Promise<Sponsor | null> {
    await this.sponsorRepository.update(id, data);
    return this.sponsorRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.sponsorRepository.delete(id);
  }
}
