import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { IonContent, ModalController, Platform } from '@ionic/angular';
import { EntityStatus } from '@movieset/core/enums/state.enum';
import { ENVIRONMENT, Environment } from '@movieset/core/environments/environment.token';
import { gotToTop, trackById } from '@movieset/core/functions/common.functions';
import { NotificationService } from '@movieset/core/notification';
import { Actor, ActorService } from '@movieset/features/actor';
import { Movie } from '@movieset/features/movie';
import { Serie } from '@movieset/features/serie';
import { ItemDetailModalComponent } from '@movieset/ui/item-detail-modal';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { MoviesByActorPageComponentState, MoviesByActorPageInfo } from '../models/movies-by-actor-page.models';

@Component({
  selector: 'app-movie-by-actor',
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
      <ng-container *ngIf="status === EntityStatus.Pending">
        <app-item-card-skeleton *ngFor="let item of [1,2,3,4,5,6,7,8,9,10,11,12]; trackBy: trackById"></app-item-card-skeleton>
      </ng-container>

      <ng-container *ngIf="(info$ | async) as info">
        <ng-container *ngIf="status !== EntityStatus.Error; else serverError">

          <ng-container *ngIf="$any(info)?.movies?.length > 0; else noData">
            <ng-container *ngFor="let movie of $any(info)?.movies; trackBy: trackById">

              <app-item-card
                [item]="movie"
                (openModal)="openDetail($event)">
              </app-item-card>

            </ng-container>

            <app-infinite-scroll
              [slice]="$any(info)?.movies?.length|| 0"
              [status]="status|| EntityStatus.Loaded"
              [total]="$any(info)?.total || 0"
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
  styleUrls: ['./movies-by-actor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoviesByActorComponent {

  gotToTop = gotToTop;
  trackById = trackById;
  EntityStatus = EntityStatus;
  @ViewChild(IonContent, {static: true}) content!: IonContent;
  showButton: boolean = false;
  title: string = '';
  slice!: number;
  search = new FormControl(null);
  status: EntityStatus =  EntityStatus.Initial;
  componentState!: MoviesByActorPageComponentState;
  triggerLoad = new EventEmitter<MoviesByActorPageComponentState>()
  cacheInfo!: MoviesByActorPageInfo;

  info$ = this.triggerLoad.pipe(
    switchMap(({idActor, slice, search, reload}) => {
      this.status = EntityStatus.Pending;
      this.cdRef.detectChanges();

      const { detail, movies } = this.cacheInfo || {};

      const services$ = {
        responseDetail: !reload ? of(detail) : this.actorService.getDetail(idActor).pipe(catchError(() => of({}))),
        responseMovies: !reload ? of(movies) : this.actorService.getMovies(idActor).pipe(catchError(() => of([])))
      };

      return forkJoin(
        services$
      ).pipe(
        map((response) => {
          const { responseDetail: detail, responseMovies: movies } = response || {};

          this.status = EntityStatus.Loaded;
          this.title = (detail as Actor)?.name || '';

          this.cacheInfo = {
            detail,
            movies
          };

          const filterMovies = search
                              ? movies?.filter(({original_title}) => original_title?.toLocaleLowerCase()?.includes(search?.toLocaleLowerCase()))
                              : movies;

          return {
            detail,
            movies: filterMovies?.slice(0, slice),
            total: filterMovies?.length
          }
        }),
        catchError(() => {
          this.status = EntityStatus.Error;
          this.notificationService.notificationFailure('ERRORS.MOVIES');
          return of({detail:{}, movies:[], total:0})
        })
      )
    })
    // ,tap(d => console.log(d))
  )

  constructor(
    private platform: Platform,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private actorService: ActorService,
    private modalController: ModalController,
    @Inject(ENVIRONMENT) public env: Environment,
    private notificationService: NotificationService,
  ) {
    this.slice = this.env.perPage ?? 21;
  }


  ionViewWillEnter(): void {
    this.content.scrollToTop();
    this.search.reset();

    const { paramMap, data } = this.route.snapshot || {};
    const { params } = (paramMap as any) || {};
    const { router: type } = data || {};
    const { idActor } = params || {};

    this.componentState = {
      idActor: idActor,
      slice: this.slice,
      type,
      search: '',
      reload: true,
    };

    this.triggerLoad.next(this.componentState);
  }

  // SEARCH
  searchSubmit(event: Event): void {
    event.preventDefault();
    if(!this.platform.is('mobileweb')) Keyboard.hide();
    this.componentState = this.changeComponentState(this.search.value!);

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
      slice: (this.componentState.slice as number) + this.slice,
      reload: false
    };

    this.triggerLoad.next(this.componentState);
    event.target.complete();
  }

  // REFRESH
  doRefresh(event: any): void {
    setTimeout(() => {
      this.search.reset();
      this.componentState = this.changeComponentState('', true);

      this.triggerLoad.next(this.componentState);
      event.target.complete();
    }, 500);
  }

  async openDetail(item: Movie | Serie): Promise<any>  {
    const modal = await this.modalController.create({
      component: ItemDetailModalComponent,
      componentProps:{
        item: {
          ...item,
          option: this.componentState?.type
        },
      }
    });

    return await modal.present();
  }

  changeComponentState(search?: string, reload: boolean = false): MoviesByActorPageComponentState{
    return {
      ...this.componentState,
      slice: this.slice,
      search,
      reload
    };
  }

  // SCROLL
  logScrolling({detail:{scrollTop = 0}}): void {
    this.showButton = scrollTop >= 300;
  }

}
