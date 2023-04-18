import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { IonContent, ModalController, Platform } from '@ionic/angular';
import { EntityStatus } from '@movieset/core/enums/state.enum';
import { gotToTop, trackById } from '@movieset/core/functions/common.functions';
import { NotificationService } from '@movieset/core/notification';
import { Movie, MovieService } from '@movieset/features/movie';
import { Serie } from '@movieset/features/serie';
import { ItemDetailModalComponent } from '@movieset/ui/item-detail-modal';
import { catchError, of, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { MoviesByTypePageComponentState } from '../models/movies-by-type-page.models';

@Component({
  selector: 'app-movie',
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

          <ng-container *ngIf="$any(info)?.movies?.length > 0; else noData">
            <ng-container *ngFor="let movie of $any(info)?.movies">

              <app-item-card
                [item]="movie"
                (openModal)="openDetail($event)">
              </app-item-card>

            </ng-container>

            <app-infinite-scroll
              [slice]="$any(info)?.movies?.length|| 0"
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
  styleUrls: ['./movies-by-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoviesByTypeComponent {

  gotToTop = gotToTop;
  trackById = trackById;
  @ViewChild(IonContent, {static: true}) content!: IonContent;
  EntityStatus = EntityStatus;
  showButton: boolean = false;
  title!: string;
  search = new FormControl(null);
  status: EntityStatus = EntityStatus.Initial;
  componentState!: MoviesByTypePageComponentState;
  triggerLoad = new EventEmitter<MoviesByTypePageComponentState>();

  info$ = this.triggerLoad.pipe(
    switchMap((data) => {
      this.status = EntityStatus.Pending;
      this.cdRef.detectChanges();

      const { type = 'popular', page, search = null } = data || {};

      const service$ = search
                      ? this.movieService.getBySearch(search, page)
                      : this.movieService.getByType(type, page);

      return service$.pipe(
        map(response => {
          this.status = EntityStatus.Loaded;
          const { movies } = response || {};

          this.componentState = {
            ...this.componentState,
            cachedMovies: [
              ...(page >= 1
                    ? [
                      ...(this.componentState?.cachedMovies ?? []),
                      ...(movies ?? [])
                    ]
                    : [
                      ...(movies ?? [])
                    ]
                  )
            ]
          };

          return {
            ...response,
            movies: [
              ...( this.componentState?.cachedMovies ?? []),
            ]
          }
        }),
        catchError(() => {
          this.status = EntityStatus.Error;
          this.notificationService.notificationFailure('ERRORS.ERROR_LOAD_MOVIES')
          return of({})
        })
      )
    })
  );


  constructor(
    private platform: Platform,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private movieService: MovieService,
    private modalController: ModalController,
    private notificationService: NotificationService,
  ) {
    const { params } = (this.route.snapshot.paramMap as any) || {}
    const { typeMovie: type } = params || {};

    this.title = type === 'popular' ? 'COMMON.MOVIE_POPULAR'
               : type === 'top_rated' ? 'COMMON.MOVIE_TOP_RATED'
               : type === 'upcoming' ? 'COMMON.MOVIE_UPCOMING'
               : 'COMMON.MOVIES';
  }


  ionViewWillEnter(): void {
    this.content.scrollToTop();
    this.search.reset();

    this.componentState = {
      type: 'popular',
      page: 1,
      cachedMovies: []
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

  changeComponentState(search: string | null = null): MoviesByTypePageComponentState {
    return {
      ...this.componentState,
      page: 1,
      search,
      cachedMovies:[]
    }
  }

  async openDetail(item: Movie | Serie): Promise<any>  {
    const modal = await this.modalController.create({
      component: ItemDetailModalComponent,
      componentProps:{
        item: {
          ...item,
          option: this.route.snapshot?.data?.['router']
        },
      }
    });

    return await modal.present();
  }

  // SCROLL
  logScrolling({detail:{scrollTop = 0}}): void {
    this.showButton = scrollTop >= 300;
  }

}
