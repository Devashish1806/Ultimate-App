import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MyApp } from './application/application.context';
import { MyAppBanner } from './application/utils/application.banner';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(MyApp.appConfig.port, () => {
    try {
      console.log(
        'Application is up and running at port:',
        MyApp.appConfig.port,
      );
      MyAppBanner.load();
    } catch (err) {
      console.log(err);
    }
  });
}
bootstrap();
