import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { IonContent, ModalController, Platform } from '@ionic/angular';
import { EntityStatus } from '@movieset/core/enums/state.enum';
import { gotToTop, trackById } from '@movieset/core/functions/common.functions';
import { NotificationService } from '@movieset/core/notification';
import { Movie } from '@movieset/features/movie';
import { Serie, SerieService } from '@movieset/features/serie';
import { ItemDetailModalComponent } from '@movieset/ui/item-detail-modal';
import { catchError, map, of, switchMap } from 'rxjs';
import { SeriesByTypePageComponentState } from '../models/series-by-type-page.models';

@Component({
  selector: 'app-serie',
  template: `
  <ion-content [fullscreen]="true" [scrollEvents]="true" (ionScroll)="logScrolling($any($event))">

    <div class="empty-header components-background-dark">
    </div>

    <div class="container components-background-dark">
      <h1 class="text-color-gradient">{{ title | translate }}</h1>

      <!-- <div class="empty-div"></div> -->

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

          <ng-container *ngIf="$any(info)?.series?.length > 0; else noData">
            <ng-container *ngFor="let movie of $any(info)?.series">

              <app-item-card
                [item]="movie"
                (openModal)="openDetail($event)">
              </app-item-card>

            </ng-container>

            <app-infinite-scroll
              [slice]="$any(info)?.series?.length|| 0"
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
  styleUrls: ['./series-by-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeriesByTypeComponent {
  trackById = trackById;
  gotToTop = gotToTop;
  @ViewChild(IonContent, {static: true}) content!: IonContent;
  EntityStatus = EntityStatus;
  showButton: boolean = false;
  title!: string;
  search = new FormControl(null);
  status: EntityStatus = EntityStatus.Initial;
  componentState!: SeriesByTypePageComponentState;

  triggerLoad = new EventEmitter<SeriesByTypePageComponentState>();
  info$ = this.triggerLoad.pipe(
    switchMap((data) => {
      this.status = EntityStatus.Pending;
      this.cdRef.detectChanges();

      const { type = 'popular', page, search = null } = data || {};

      const service$ = search
                      ? this.serieService.getBySearch(search, page)
                      : this.serieService.getByType(type, page);

      return service$.pipe(
        map(response => {
          this.status = EntityStatus.Loaded;
          const { series } = response || {};

          this.componentState = {
            ...this.componentState,
            cachedSeries: [
              ...(page >= 1
                  ? [
                    ...(this.componentState?.cachedSeries ?? []),
                    ...(series ?? [])
                  ]
                  : [
                    ...(series ?? [])
                  ]
                )
            ]
          };

          return {
            ...response,
            series: [
              ...(this.componentState ?.cachedSeries ?? []),
            ]
          }
        }),
        catchError(() => {
          this.status = EntityStatus.Error;
          this.notificationService.notificationFailure('ERRORS.ERROR_LOAD_TVS')
          return of({})
        })
      )
    })
  );


  constructor(
    private platform: Platform,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private serieService: SerieService,
    private modalController: ModalController,
    private notificationService: NotificationService,
  ) {
    const { params } = (this.route.snapshot.paramMap as any) || {}
    const { typeSerie } = params || {};
    this.title = typeSerie === 'popular' ? 'COMMON.SERIE_POPULAR'
               : typeSerie === 'top_rated' ? 'COMMON.SERIE_TOP_RATED'
               : typeSerie === 'on_the_air' ? 'COMMON.SERIE_ON_THE_AIR'
               : 'COMMON.TVS';
  }

  ionViewWillEnter(): void {
    this.content.scrollToTop();
    this.search.reset();

    this.componentState = {
      type: 'popular',
      page: 1,
      cachedSeries: []
    };

    this.triggerLoad.next(this.componentState);
  }

  // SEARCH
  searchSubmit(event: Event): void {
    event.preventDefault();
    if(!this.platform.is('mobileweb')) Keyboard.hide();
    this.componentState = this.changeComponentState(this.search.value);

    this.triggerLoad.next(this.componentState);
  }

  // DELETE SEARCH
  clearSearch(event: any): void{
    if(!this.platform.is('mobileweb')) Keyboard.hide();
    this.search.reset();
    this.componentState = this.changeComponentState();

    this.triggerLoad.next(this.componentState);
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

  // REFRESH
  doRefresh(event: any): void {
    setTimeout(() => {
      this.search.reset();
      this.componentState = this.changeComponentState();

      this.triggerLoad.next(this.componentState);
      event.target.complete();
    }, 500);
  }

  changeComponentState(search: string | null = null): SeriesByTypePageComponentState {
    return {
      ...this.componentState,
      page: 1,
      search,
      cachedSeries:[]
    }
  }

  // SCROLL
  logScrolling({detail:{scrollTop = 0}}): void {
    this.showButton = scrollTop >= 300;
  }

  async openDetail(item: Movie | Serie): Promise<any>  {
    const modal = await this.modalController.create({
      component: ItemDetailModalComponent,
      componentProps:{
        item: {
          ...item,
          option: this.route.snapshot?.data?.['router']
        }
      }
    });

    return await modal.present();
  }

}
