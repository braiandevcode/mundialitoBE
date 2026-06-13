import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseConnectionLogger implements OnModuleInit {
  private readonly logger = new Logger('Database');

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const host = this.configService.get<string>('env.db.host');
    const port = this.configService.get<number>('env.db.port');
    const database = this.configService.get<string>('env.db.name');
    const user = this.configService.get<string>('env.db.user');

    if (this.dataSource.isInitialized) {
      this.logger.log('=== Conexión MySQL: EXITOSA ===');
      this.logger.log(`Host: ${host}`);
      this.logger.log(`Puerto: ${port}`);
      this.logger.log(`Base de datos: ${database}`);
      this.logger.log(`Usuario: ${user}`);
      this.logger.log(`Pool size: 5`);

      try {
        const [row] = await this.dataSource.query('SELECT 1 as conectado');
        this.logger.log(`Test query: ${JSON.stringify(row)}`);
        this.logger.log('✓ Conexión operativa');
      } catch (err) {
        this.logger.error('✗ Test query falló:', err);
      }
    } else {
      this.logger.error('=== Conexión MySQL: FALLÓ ===');
      this.logger.error(`Intentado: ${host}:${port}/${database} como ${user}`);
      this.logger.error('Verifica: host, puerto, credenciales, o si el servidor MySQL está reachable');
    }

    // Nota: TypeORM 1.0.0+ no expone eventos de conexión vía DataSource.on()
    // Los errores runtime se ven en los logs de TypeORM internamente
  }
}
