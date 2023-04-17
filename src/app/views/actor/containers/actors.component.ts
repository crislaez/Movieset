import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Keyboard } from '@capacitor/keyboard';
import { IonContent, ModalController, Platform } from '@ionic/angular';
import { EntityStatus } from '@movieset/core/enums/state.enum';
import { gotToTop, trackById } from '@movieset/core/functions/common.functions';
import { NotificationService } from '@movieset/core/notification';
import { Actor, ActorService } from '@movieset/features/actor';
import { Movie } from '@movieset/features/movie';
import { Serie } from '@movieset/features/serie';
import { ActorDetailModalComponent } from '@movieset/ui/actor-detail-modal';
import { catchError, map, of, switchMap } from 'rxjs';
import { ActorsPageComponentState } from '../models/actors-page.models';

@Component({
  selector: 'app-actors',
  template: `
  <ion-content [fullscreen]="true" [scrollEvents]="true" (ionScroll)="logScrolling($any($event))">

    <div class="empty-header components-background-dark">
    </div>

    <div class="container components-background-dark">
      <h1 class="text-color-gradient">{{ 'COMMON.ACTORS' | translate }}</h1>

      <div class="empty-div"></div>

      <div class="displays-center width-max heigth-min">
        <!-- FORM  -->
        <form (submit)="searchSubmit($event)" *ngIf="['loaded']?.includes(status)">
          <ion-searchbar [placeholder]="'FILTERS.BY_NAME' | translate" [formControl]="search" (ionClear)="clearSearch($event)"></ion-searchbar>
        </form>
      </div>

      <div class="empty-div"></div>

      <!-- LOADER  -->
      <ng-container *ngIf="status === EntityStatus.Pending && $any(componentState)?.page === 1">
        <app-item-card-skeleton *ngFor="let item of [1,2,3,4,5,6,7,8,9,10,11,12]; trackBy: trackById"></app-item-card-skeleton>
      </ng-container>

      <ng-container *ngIf="(info$ | async) as info">
        <ng-container *ngIf="status !== EntityStatus.Error; else serverError">

          <ng-container *ngIf="$any(info)?.actors?.length > 0; else noData">
            <ng-container *ngFor="let actor of $any(info)?.actors">

              <app-item-card
                [item]="actor"
                [showStars]="false"
                (openModal)="openActorDetail($event)">
              </app-item-card>

            </ng-container>

            <app-infinite-scroll
              [slice]="$any(info)?.actors?.length|| 0"
              [status]="status|| EntityStatus.Loaded"
              [total]="$any(info)?.total_results || 0"
              (loadDataTrigger)="loadData($event)">
            </app-infinite-scroll>
          </ng-container>

        </ng-container>
      </ng-container>

      <!-- REFRESH -->
      <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- IS ERROR -->
      <ng-template #serverError>
        <app-no-data [title]="'COMMON.ERROR'" [image]="'assets/images/error.png'" [top]="'20vh'"></app-no-data>
      </ng-template>

      <!-- IS NO DATA  -->
      <ng-template #noData>
        <app-no-data [title]="'COMMON.NORESULT'" [image]="'assets/images/empty.png'" [top]="'20vh'"></app-no-data>
      </ng-template>
    </div>

    <!-- TO TOP BUTTON  -->
    <ion-fab *ngIf="showButton" vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button class="color-button-text" (click)="gotToTop(content)"> <ion-icon name="arrow-up-circle-outline"></ion-icon></ion-fab-button>
    </ion-fab>
  </ion-content>
  `,
  styleUrls: ['./actors.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActorsComponent {
  trackById = trackById;
  gotToTop = gotToTop;
  @ViewChild(IonContent, {static: true}) content!: IonContent;
  EntityStatus = EntityStatus;
  showButton: boolean = false;
  status: EntityStatus = EntityStatus.Initial;
  search = new FormControl(null);
  componentState: ActorsPageComponentState = {
    page: 1,
    cachedActors: []
  };

  triggerLoad = new EventEmitter<ActorsPageComponentState>();
  info$ = this.triggerLoad.pipe(
    switchMap(({ page, search }) => {
      this.status = EntityStatus.Pending;
      this.cdRef.detectChanges();

      const endpoint$ = search
                      ? this.actoreService.getBySearch(page, search)
                      : this.actoreService.getAllPopular(page);

      return endpoint$.pipe(
        map((response) => {
          this.status = EntityStatus.Loaded;
          const { actors } = response || {};

          this.componentState = {
            ...this.componentState,
            cachedActors: [
              ...(page >= 1
                  ? [
                    ...(this.componentState?.cachedActors ?? []),
                    ...(actors ?? [])
                  ]
                  : [
                    ...(actors ?? [])
                  ]
                )
            ]
          };

          return {
            ...response,
            actors: [
              ...(this.componentState?.cachedActors ?? [])
            ]
          }
        }),
        catchError(() => {
          this.status = EntityStatus.Error;
          this.notificationService.notificationFailure('ERRORS.ERROR_LOAD_ACTORS')
          return of({})
        })
      )
    })
  );


  constructor(
    private platform: Platform,
    private cdRef: ChangeDetectorRef,
    private actoreService: ActorService,
    private modalController: ModalController,
    private notificationService: NotificationService,
  ) { }


  ionViewWillEnter(): void {
    this.triggerLoad.next(this.componentState);
  }

  // SEARCH
  searchSubmit(event: Event): void {
    event.preventDefault();
    if(!this.platform.is('mobileweb')) Keyboard.hide();
    this.componentState = this.changeComponentState( (this.search.value ?? '') );

    this.triggerLoad.next(this.componentState);
  }

  // DELETE SEARCH
  clearSearch(event: any): void{
    if(!this.platform.is('mobileweb')) Keyboard.hide();
    this.search.reset();
    this.componentState = this.changeComponentState();

    this.triggerLoad.next(this.componentState);
  }

  // REFRESH
  doRefresh(event: any): void {
    setTimeout(() => {
      this.search.reset();
      this.componentState = this.changeComponentState();

      this.triggerLoad.next(this.componentState);
      event.target.complete();
    }, 500);
  }

  // INIFINITE SCROLL
  loadData(data: {event: any, total: number}): void {
    const { event } = data || {};
    this.componentState = {
      ...this.componentState,
      page: (this.componentState.page as number) + 1,
    };

    this.triggerLoad.next(this.componentState);
    event.target.complete();
  }

  async openActorDetail(actor: Movie | Serie | Actor): Promise<any> {
    const modal = await this.modalController.create({
      component: ActorDetailModalComponent,
      componentProps:{
        actor
      }
    });

    return await modal.present();
  }

  changeComponentState(search: string = ''): ActorsPageComponentState {
    return {
      ...this.componentState,
      page: 1,
      search,
      cachedActors:[]
    }
  }

  // SCROLL
  logScrolling({detail:{scrollTop = 0}}): void {
    this.showButton = scrollTop >= 300;
  }


}
