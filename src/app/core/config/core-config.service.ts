import { Injectable } from '@angular/core';

export interface CoreConfig {
  langs: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CoreConfigService {

  protected _config!: CoreConfig;


  constructor() { }


  importConfig(coreConfigRaw: any): void {
    this._config = {
      langs: coreConfigRaw.Languages
    } as CoreConfig;
  }

}
