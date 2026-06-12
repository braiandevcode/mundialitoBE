import { NestFactory } from "@nestjs/core"
import { SeedService } from "./core/database/seed/seed.service"
import { SeedModule } from "./core/database/seed/seed.module";
import { INestApplicationContext } from "@nestjs/common";

async function run() {
  const appContext: INestApplicationContext = await NestFactory.createApplicationContext(SeedModule);
  const seeder: SeedService = appContext.get(SeedService);
  await seeder.seed();
  appContext.close();
  process.exit(0)
}
run()