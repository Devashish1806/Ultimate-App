import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MyApp } from './application/application.context';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  MyApp.getInstance();
  await app.listen(3000);
}
bootstrap();
