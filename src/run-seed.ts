import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SeedModule } from './core/database/seed/seed.module';
import { SeedService } from './core/database/seed/seed.service';

async function run() {
  const appContext: INestApplicationContext =
    await NestFactory.createApplicationContext(SeedModule);

  try {
    const seeder: SeedService = appContext.get(SeedService);
    await seeder.seed();
  } finally {
    await appContext.close();
  }
}

run().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
