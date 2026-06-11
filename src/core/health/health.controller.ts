import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  async check() {
    let dbConnected = false;
    try {
      await this.dataSource.query('SELECT 1');
      dbConnected = true;
    } catch {}

    return {
      status: 'ok',
      uptime: process.uptime(),
      dbConnected,
      timestamp: new Date().toISOString(),
    };
  }
}
