import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';
import { ResponseTransformInterceptor } from './core/interceptors/response-transform.interceptor';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';
import { GlobalValidationPipe } from './core/pipes/validation.pipe';
import helmet from 'helmet';
import type { NextFunction, Request, Response } from 'express';

const logger = new Logger('Bootstrap');

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION — proceso terminará:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('UNHANDLED REJECTION:', reason);
});

async function bootstrap() {
  logger.log('Iniciando NestFactory.create(AppModule)...');
  const app = await NestFactory.create(AppModule);
  logger.log('NestFactory.create completado');

  app.enableCors({
    origin: ['https://mundialito-fe.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }

    next();
  });

  app.use(helmet());

  app.useGlobalPipes(GlobalValidationPipe);
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    new ResponseTransformInterceptor(),
    new LoggingInterceptor(),
  );

  const port = process.env.PORT || 3000;
  const host = process.env.HOST || '0.0.0.0';

  app.setGlobalPrefix('api');
  
  logger.log(`Intentando app.listen(${port}, ${host})...`);
  try {
    await app.listen(port, host);
    logger.log(`✓ App escuchando en ${host}:${port}`);
  } catch (err) {
    logger.error(`✗ app.listen() lanzó error:`, err);
  }
}
bootstrap();
