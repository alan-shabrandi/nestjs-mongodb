import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import cookieParser from 'cookie-parser';
import { SeedService } from './seed/seed.service';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global middlewares & Pips
  setupGlobalPipes(app);
  setupGlobalFilters(app);
  app.use(cookieParser());

  // Swagger documentation
  setupSwagger(app);

  // Seed data
  await runSeed(app);

  // Start server
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Server is running on Port ${port}`);
}

const setupGlobalPipes = (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
};

const setupGlobalFilters = (app: INestApplication) => {
  app.useGlobalFilters(new AllExceptionsFilter());
};

const runSeed = async (app: INestApplication) => {
  const args = process.argv.slice(2);
  const shouldSeed = args.includes('--seed');

  if (process.env.NODE_ENV !== 'development' && shouldSeed)
    return console.log('Seed is disabled in non-development environment');
  if (!shouldSeed)
    return console.log('Development mode: Use --seed to seed data');

  console.log('Running seed service...');
  const seedService = app.get(SeedService);
  await seedService.seedUsers(500_000, 10);
  console.log('Seed completed!');
};

bootstrap();
