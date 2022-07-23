import { readdirSync, readJSONSync } from 'fs-extra-promise';
import { join, parse } from 'path';
import * as _ from 'lodash';
import * as yaml from 'js-yaml';
import { existsSync, readFileSync, statSync } from 'fs';
import { ConfigModule } from '@nestjs/config';

export class MyAppParser {
  private static __instance: MyAppParser = null;
  private __baseResourcePath: string = null;
  private __baseModulePath: string = null;
  private __config: any = {};
  private __environment: string = null;
  private __nestModuleMap: Map<string, any> = null;

  private constructor() {
    this.__environment = this.__parseEnvironment();
    this.__baseResourcePath = join(
      process.cwd(),
      'resources',
      this.__environment,
    );
    this.__baseModulePath = join(process.cwd(), 'dist', 'modules');
    this.__nestModuleMap = new Map<string, any>();
    this.__parseApplicationConfig(this.__baseResourcePath);
    this.__loadModules();
  }

  static getInstance(): MyAppParser {
    if (MyAppParser.__instance === null) {
      MyAppParser.__instance = new MyAppParser();
      Object.freeze(MyAppParser.__instance);
    }
    return MyAppParser.__instance;
  }

  get config() {
    return this.__config;
  }

  private __parseEnvironment(): string {
    let env = 'dev';
    process.argv.forEach((value, index) => {
      if (index === 2) {
        try {
          env = value.split('=')[1];
        } catch (err) {
          console.error(err);
        }
      }
    });
    return env;
  }

  private __parseApplicationConfig(resourceFolder: string) {
    this.__parseConfig(resourceFolder);
    this.__parseModules();
  }

  private __parseConfig(resourceFolder: string) {
    const configFiles: string[] = readdirSync(resourceFolder).filter((file) => {
      return file.match(
        new RegExp(`(\\w+\\.(?:config\\.(yaml|yml|json)))`, 'gi'),
      );
    });
    configFiles.map((file) => {
      let fileObject = {};
      _.merge(fileObject, this.__parseFileObjects(join(resourceFolder, file)));
      this.__config[
        file
          .split('.')[0]
          .replace(/[\-\_]/gi, '')
          .toLowerCase()
      ] = fileObject;
    });
  }

  private __parseFileObjects(file: string) {
    if (file.endsWith('yml') || file.endsWith('yaml'))
      return yaml.load(readFileSync(file, 'utf-8'));
    else return readJSONSync(file);
  }

  private __parseModules() {
    const folderList: string[] = readdirSync(this.__baseModulePath).filter(
      (folder: any) => {
        return statSync(join(this.__baseModulePath, folder)).isDirectory();
      },
    );

    folderList.map((folder) => {
      const moduleConfig = this.__parseModule(this.__baseModulePath, folder);
      if (moduleConfig) {
        this.__nestModuleMap.set(moduleConfig.moduleName, moduleConfig.module);
      }
    });
  }

  private __parseModule(path: string, folder: string): any {
    const filesList: string[] = readdirSync(join(path, folder)).filter((e) =>
      e.match(
        new RegExp(
          `(\\w+\\.(?:(module.js|config.json|config.yaml|config.yml)$))`,
          'i',
        ),
      ),
    );

    let configObject: any = null;
    filesList.map((file) => {
      const fileName = join(path, folder, file);
      if (existsSync(`${fileName}`)) {
        const moduleName = file
          .split('.')[0]
          .replace(/[\-\_]/gi, '')
          .toLocaleLowerCase();
        try {
          const className = this.__parseFile(fileName).match(
            new RegExp(`(?<==\\s*class\\s+).*?(?=\\s+{.*})`, 'gs'),
          )[0];
          const modulePath = join(
            process.cwd(),
            'dist',
            'modules',
            folder,
            `${parse(file).name}.js`,
          );
          const module = require(modulePath)[className];
          configObject = {
            moduleName: moduleName,
            module: module,
            className: className,
            path: fileName,
            fileName: file,
            folderName: folder,
          };
        } catch (err) {
          console.error(
            'class is not configured properly for module: ',
            moduleName,
          );
        }
      }
      return configObject;
    });
    return configObject;
  }

  private __parseFile(fileName: string): any {
    if (existsSync(`${fileName}`)) {
      return readFileSync(`${fileName}`, 'utf8');
    } else {
      return null;
    }
  }

  private __loadModules(): any {
    this.__config.modules = [
      ConfigModule.forRoot({
        cache: true,
        isGlobal: true,
        load: [
          () => {
            return this.__config;
          },
        ],
      }),
    ];

    Object.values(this.__config.application.modules).map((module: any) => {
      if (module.active) {
        let moduleConfig = {
          active: module['active'],
          name: module['name'],
          module: this.__nestModuleMap.get(module['name'].toLowerCase()),
        };
        this.__config.modules.push(moduleConfig['module']);
      }
    });
  }
}
