import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';
import { ResponseTransformInterceptor } from './core/interceptors/response-transform.interceptor';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';
import { GlobalValidationPipe } from './core/pipes/validation.pipe';
import helmet from 'helmet';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  logger.log('Iniciando NestFactory.create(AppModule)...');
  const app = await NestFactory.create(AppModule);
  logger.log('NestFactory.create completado');

  app.use(helmet());

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

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
