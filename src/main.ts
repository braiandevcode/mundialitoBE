import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';
import { ResponseTransformInterceptor } from './core/interceptors/response-transform.interceptor';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';
import { GlobalValidationPipe } from './core/pipes/validation.pipe';
import helmet from 'helmet';

// function parseCorsOrigins(origin: string | undefined): string | string[] {
//   const fallbackOrigin = 'http://localhost:5173';
//   const rawOrigin = origin || fallbackOrigin;
//   const origins = rawOrigin
//     .split(',')
//     .map((value) => value.trim().replace(/\/+$/, ''))
//     .filter(Boolean);

//   return origins.length === 1 ? origins[0] : origins;
// }

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.enableCors({
    origin: 'https://mundialito-fe.vercel.app', 
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

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
