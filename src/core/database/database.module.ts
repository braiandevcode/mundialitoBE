import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DatabaseConnectionLogger } from './database-logger.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('env.db.host'),
        port: configService.get<number>('env.db.port'),
        username: configService.get<string>('env.db.user'),
        password: configService.get<string>('env.db.pass'),
        database: configService.get<string>('env.db.name'),
        entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('env.nodeEnv') === 'development',
        logging: configService.get<string>('env.nodeEnv') === 'development',
        retryAttempts: 2,
        retryDelay: 1000,
        poolSize: 5,
        extra: {
          connectionLimit: 5,
          connectTimeout: 5000,
        },
      }),
    }),
  ],
  providers: [DatabaseConnectionLogger],
})
export class DatabaseModule {}
