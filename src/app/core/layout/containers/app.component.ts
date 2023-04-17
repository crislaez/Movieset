import { Location } from "@angular/common";
import { Component } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { ModalController, Platform } from '@ionic/angular';
import { trackById } from '@movieset/core/functions/common.functions';
import { FooterLinks } from '@movieset/core/models/footer.models';
import { NotificationModalComponent } from '@movieset/ui/notification-modal';
import { filter, map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: `
    <ion-app>
    <!-- HEADER  -->
    <ion-header class="ion-no-border" >    <!-- collapse="condense"  -->
      <ion-toolbar *ngIf="(currentSection$ | async) as currentSection">
        <!-- nav icon  -->
        <!-- <ion-menu-button *ngIf="!['pokemon','buildItem','battleItem']?.includes(currentSection?.route)" fill="clear" size="small" slot="start" (click)="open()" class="text-color-light"></ion-menu-button> -->
        <!-- back button  -->

        <!-- class="text-color-light" -->
        <ion-back-button
          *ngIf="!['home']?.includes(currentSection?.route!)"
          class="text-color-light"
          slot="start"
          [defaultHref]="redirectoTo(currentSection)"
          [text]="''">
        </ion-back-button>

        <!-- title  -->
        <!-- class="text-color-light" -->
        <ion-title class="text-color-light text-center">
          {{ currentSection?.label! | translate }}
        </ion-title>

        <!-- class="text-color" -->
        <ion-icon
          class="text-color-light"
          slot="end"
          name="ellipsis-horizontal-outline"
          (click)="presentModal()">
        </ion-icon>
      </ion-toolbar>
    </ion-header>


    <!-- MENU LATERAL  -->
    <!-- <ion-menu side="start" menuId="first" contentId="main">
      <ion-header  class="ion-no-border menu-header">
        <ion-toolbar >
          <ion-title class="text-color-light" >{{ 'COMMON.MENU' | translate}}</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content >
        <ng-container *ngFor="let item of links; trackBy: trackById" >
          <ion-item detail class="text-color-light" [disabled]="item?.disabled" [routerLink]="['/'+item?.link]" (click)="openEnd()">{{ item?.text | translate }}</ion-item>
        </ng-container>
      </ion-content >
    </ion-menu> -->


    <!-- RUTER  -->
    <ion-router-outlet id="main"></ion-router-outlet>


    <!-- TAB FOOTER  -->
    <ion-tabs *ngIf="currentSection$ | async as currentSection">
      <ion-tab-bar [translucent]="true" slot="bottom">
        <ion-tab-button
          *ngFor="let itemLink of itemLinks"
          [ngClass]="{ 'active-class': $any(itemLink?.link)?.includes(currentSection?.route) }"
          class="text-color-light"
          [routerLink]="[itemLink?.link]">
          <ion-icon [name]="itemLink?.icon"></ion-icon>
          <ion-label>{{ $any(itemLink)?.title | translate }}</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-app>
  `,
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  trackById = trackById;
  currentSection$ = this.router.events.pipe(
    filter((event: any) => event instanceof NavigationStart),
    map((event: NavigationEnd) => {
      const { url = ''} = event || {};
      const [, route = 'home', params = null ] = url?.split('/') || [];
      // console.log(route, params)
      return {
        'home':{route, label: 'COMMON.TITLE'},
        'movie':{route, label: 'COMMON.TITLE'},
        'serie':{route, label: 'COMMON.TITLE'},
        'actor':{route, label: 'COMMON.TITLE'},
      }?.[route] || {route: 'home', label:'COMMON.TITLE'};
    }),
    // tap(d => console.log('roter => ',d)),
    shareReplay(1)
  );

  itemLinks: FooterLinks[] = [
    { id:1, link:'home', icon:'home-outline', title:'COMMON.HOME' },
    { id:2, link:'actor', icon:'person-outline', title:'COMMON.ACTORS' },
    { id:3, link:'movie', icon:'videocam-outline', title:'COMMON.MOVIES' },
    { id:4, link:'serie', icon:'tv-outline', title:'COMMON.TVS' },
  ]


  constructor(
    private router: Router,
    private location: Location,
    private platform: Platform,
    private modalController: ModalController
  ) {
    if(!this.platform.is('mobileweb')){
      this.lockAppOrientation();
    }
  }


  redirectoTo(currentSection: any): string{
    // this.location.back();
    const { route = null } = currentSection || {};
    const redirectTo: {[key:string]: string} = {
      'home':'/home',
      'movie':'/home',
      'serie':'/home',
      'actor':'/home',
    };
    return redirectTo?.[route] || '/home';
  }

  // OPEN FILTER MODAL
  async presentModal() {
    const modal = await this.modalController.create({
      component: NotificationModalComponent,
    });

    modal.present();
    await modal.onDidDismiss();
  }

  async lockAppOrientation(): Promise<any> {
    await ScreenOrientation.lock({orientation: 'portrait'})
  }

}
