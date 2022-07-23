import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MyApp } from './application/application.context';
import { MyAppBanner } from './application/utils/application.banner';

async function bootstrap() {
  try {
    await MyAppBanner.load();
  } catch (err) {
    console.log(err);
  }
  const app = await NestFactory.create(AppModule);
  await app.listen(MyApp.appConfig.port, () => {
    console.log('Application is up and running at port:', MyApp.appConfig.port);
    MyApp.modules.forEach((module: any) => {
      if (module.name) console.log(module.name);
    });
  });
}
bootstrap();
