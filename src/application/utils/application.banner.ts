import * as figlet from 'figlet';
import { MyApp } from '../application.context';

export class MyAppBanner {
  static load() {
    figlet(MyApp.appConfig.name, function (err: any, data: any) {
      console.log();
      if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
      }
      console.log(data);
    });
  }
}
