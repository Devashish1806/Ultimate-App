import * as figlet from 'figlet';
import { MyApp } from '../application.context';

export class MyAppBanner {
  static async load() {
    return new Promise(async (resolve, reject) => {
      figlet(MyApp.appConfig.name, function (err: any, data: any) {
        console.log();
        if (err) {
          console.log('Something went wrong... ', err);
          reject(err);
        }
        console.log(data);
        resolve(data);
      });
    });
  }
}
