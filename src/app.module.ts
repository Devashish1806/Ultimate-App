import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MyApp } from './application/application.context';

@Module({
  imports: MyApp.modules,
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
