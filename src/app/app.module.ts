import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment';
import * as appConfig from './app-config';
import { AppRoutingModule } from './app-routing.module';
import { CoreConfigService } from './core/config/core-config.service';
import { ENVIRONMENT, Environment } from './core/environments/environment.token';
import { DynamicLocaleId, appInitTranslations, createTranslateLoader } from './core/i18n';
import { HttpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { AppComponent } from './core/layout/containers/app.component';
import { NotificationModalComponent } from './ui/notification-modal';

export function appInitializerFactory(translate: TranslateService, coreConfig: CoreConfigService): Function {
  coreConfig.importConfig(appConfig);
  return () => appInitTranslations(translate, appConfig.Languages, appConfig.DefaultLang);
};

export function localeIdFactory(translate: TranslateService): DynamicLocaleId {
  return new DynamicLocaleId(translate);
}

@NgModule({
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient, ENVIRONMENT]
        }
    }),
    NotificationModalComponent,
    RouterModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    },
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [TranslateService, CoreConfigService],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    },
    {
      provide: ENVIRONMENT,
      useValue: new Environment(environment, window)
    },
    {
      provide: LOCALE_ID,
      useClass: DynamicLocaleId,
      deps: [TranslateService]
    }
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
