import { InjectionToken } from '@angular/core';
import { EnvironmentApp } from '../models/environment.models'


export const ENVIRONMENT = new InjectionToken<Environment>('environment');

export class Environment {
  private readonly env: EnvironmentApp;
  private readonly window: Window;


  constructor(env: EnvironmentApp, window: Window) {
    this.env = env;
    this.window = window;
  }

  get currentEnv(): EnvironmentApp {
    return this.env;
  }

  get baseEndpoint(): string {
    return this.env.baseEndpoint
  }

  get imageBase(): string {
    return this.env.imageBase
  }

  get apiKey(): string {
    return this.env.apiKey;
  }

  get perPage(): number {
    return this.env.perPage;
  }

  // get currentApp(): string {
  //   return this.env?.configuration?.clientID;
  // }

  // get api(): string {
  //   return this.env?.api;
  // }

  // get apiPublic(): string {
  //   return this.env?.apiPublic;
  // }

  // get webPrefix(): string {
  //   return this.env?.webPrefix;
  // }

  // private get window(): Window {
  //   return window as Window;
  // }

  // get windowConfigPath(): string {
  //   return `${this.applicationName}_environment`;
  // }

  // get environment(): T {
  //   return this.window[this.windowConfigPath]
  //     ? (this.window[this.windowConfigPath] as T)
  //     : this.defaultEnvironment;
  // }
}
