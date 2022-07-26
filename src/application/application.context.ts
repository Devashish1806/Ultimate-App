import { MyAppParser } from './application.parser';

export class MyApp {
  private static __instance: MyApp = null;
  private __config: any = null;

  private constructor() {
    this.__config = MyAppParser.getInstance().config;
  }

  static getInstance(): MyApp {
    if (MyApp.__instance === null) {
      MyApp.__instance = new MyApp();
      Object.freeze(MyApp.__instance);
    }
    return MyApp.__instance;
  }

  static get appConfig() {
    return this.getInstance().__config.application;
  }

  static get modules() {
    return this.getInstance().__config.modules;
  }
}
