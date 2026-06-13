import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';
import { ResponseTransformInterceptor } from './core/interceptors/response-transform.interceptor';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';
import { GlobalValidationPipe } from './core/pipes/validation.pipe';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.enableCors({
    // origin: process.env.CORS_ORIGIN, (NOTA REVERTIRLO AL ENCONTRAR PROBLEMA EN ORIGEN)
    origin:"*",
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
  
  await app.listen(port, host); // '0.0.0.0' necesario para que escuche fuera del contenedor
  console.log(`Aplicación escuchando en ${host}:${port}`);
}
bootstrap();
