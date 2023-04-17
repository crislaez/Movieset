import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Input, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { IonContent, IonicModule, ModalController } from '@ionic/angular';
import { EntityStatus } from '@movieset/core/enums/state.enum';
import { ENVIRONMENT, Environment } from '@movieset/core/environments/environment.token';
import { errorImage, gotToTop, isNotEmptyObject, sliceText, trackById } from '@movieset/core/functions/common.functions';
import { TypeOption } from '@movieset/core/models/common-type.models';
import { Genre } from '@movieset/core/models/genres.models';
import { Review } from '@movieset/core/models/reviews.models';
import { NotificationService } from '@movieset/core/notification';
import { ActorService } from '@movieset/features/actor';
import { Actor } from '@movieset/features/actor/models/actor.model';
import { MovieService } from '@movieset/features/movie';
import { Movie } from '@movieset/features/movie/models/movie.models';
import { Serie, SerieService } from '@movieset/features/serie';
import { SwiperComponent } from '@movieset/ui/swiper/swiper.component';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { ActorDetailModalComponent } from '../actor-detail-modal';
import { NoDataComponent } from '../no-data';
import { ReviewCardComponent } from '../review-card';
import { SpinnerComponent } from '../spinner';

@Component({
  selector: 'app-item-detail-modal',
  template: `
  <ion-header class="ion-no-border" >
    <ion-toolbar >
      <ion-title class="text-color-light">{{ name }}</ion-title>
      <ion-buttons class="text-color-light" slot="end">
        <ion-button class="ion-button-close" (click)="dismiss()"><ion-icon fill="clear" class="text-color-light" name="close-outline"></ion-icon></ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content [fullscreen]="true" [scrollEvents]="true" (ionScroll)="logScrolling($any($event))">
    <ng-container *ngIf="isNotEmptyObject(item); else noData">

      <div class="container components-color-second container-top-radius">
        <ion-card class="fade-in-card banner-card card-card">
          <ion-img
            loading="lazy"
            [src]="$any(env)?.imageBase + $any(item)?.poster_path"
            [alt]="$any(item)?.poster_path"
            (ionError)="errorImage($event)">
          </ion-img>
        </ion-card>

        <!-- INFO  -->
        <div class="div-center radius-25">
          <h2 class="text-color-light">{{ name }}</h2>
        </div>

        <!-- LOADER  -->
        <ng-container *ngIf="status === EntityStatus.Pending;">
          <app-spinner [top]="'30%'"></app-spinner>
        </ng-container>

        <ng-container *ngIf="info$ | async as info">
          <ng-container *ngIf="status !== EntityStatus.Error; else serverError">

            <ng-container *ngIf="$any(info)?.detail?.genres?.length > 0">
              <div class="width-max margin-auto margin-top-10 margin-bottom-10">
                <ion-chip *ngFor="let genre of $any(info)?.detail?.genres; trackBy: trackById">
                  <ion-label class="text-color-light">{{ genre?.name }}</ion-label>
                </ion-chip>
              </div>
            </ng-container>

            <ng-container *ngIf="item?.overview as overview">
              <div class="div-center">
                <h2 class="text-color-light">{{ 'COMMON.OVERVIEW' | translate }}</h2>
              </div>
              <div class="card text-color-light margin-bottom-20" >
                {{ overview }}
              </div>
            </ng-container>

            <div class="div-center">
              <h2 class="text-color-light">{{ 'COMMON.INFORMATION_DATA' | translate }}</h2>
            </div>

            <div class="card text-color-light margin-bottom-20" >
              <div class="div-center">
                <ng-container *ngFor="let item of infoData; trackBy: trackById">
                  <div>{{ $any(item)?.label | translate }}</div>
                  <div *ngIf="!['homepage']?.includes($any(item)?.field)" class="displays-end">{{ $any(info)?.detail?.[$any(item)?.field] ?? '-' }}</div>
                  <div *ngIf="['homepage']?.includes($any(item)?.field)" class="displays-end">
                    <a [href]="$any(info)?.detail?.[$any(item)?.field]">{{ commonFunctionSliceText($any(info)?.detail?.[$any(item)?.field], 20) }}</a>
                  </div>
                </ng-container>
              </div>
            </div>

            <app-swiper
              *ngIf="$any(info)?.actors?.length > 0"
              [title]="'COMMON.ACTORS'"
              [hash]="'/actor/'+ $any(item)?.option +'/'+ $any(item)?.id"
              [items]="$any(info)?.actors"
              [status]="status"
              [showMore]="true"
              [showStars]="false"
              (openModal)="openActorDetail($event)"
              (closeModal)="dismiss()">
            </app-swiper>

            <!-- <app-swiper
              *ngIf="$any(info)?.crews?.length > 0"
              [title]="'COMMON.CREWS'"
              [hash]="'/crew/' + $any(info)?.option+'/'+ $any(item)?.id"
              [items]="$any(info)?.crews"
              [status]="status"
              [showMore]="true"
              [showStars]="false"
              (openModal)="openDetail($event)"
              (closeModal)="dismiss()">
            </app-swiper> -->

            <ng-container *ngIf="$any(info)?.trailer as trailer">
              <div class="div-center">
                <h2 class="text-color-light">{{ 'COMMON.TRAILER' | translate }}</h2>
              </div>

              <iframe width="560" height="315"
                [src]="getVideo(trailer?.key)"
                allowfullscreen>
              </iframe>
            </ng-container>

            <ng-container *ngIf="$any(info)?.reviews?.length > 0">
              <div class="div-center">
                <h2 class="text-color-light">{{ 'COMMON.REVIEWS' | translate }}</h2>
                <app-review-card
                  *ngFor="let review of $any(info)?.reviews; let i = index; trackBy: trackById"
                  [review]="review"
                  [i]="i"
                  [sliceText]="sliceText"
                  (sliceTextChange)="sliceTextChange($event)">
                </app-review-card>
              </div>
            </ng-container>

          </ng-container>
        </ng-container>
      </div>
    </ng-container>

    <!-- REFRESH -->
    <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
      <ion-refresher-content></ion-refresher-content>
    </ion-refresher>

    <!-- IS NO DATA  -->
    <ng-template #noData>
      <app-no-data [title]="'COMMON.NORESULT'" [image]="'assets/images/empty.png'" [top]="'30vh'"></app-no-data>
    </ng-template>

    <!-- IS ERROR -->
    <ng-template #serverError>
      <app-no-data [title]="'COMMON.ERROR'" [image]="'assets/images/error.png'" [top]="'15vh'"></app-no-data>
    </ng-template>

    <!-- TO TOP BUTTON  -->
    <ion-fab *ngIf="showButton" vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button class="color-button-text" (click)="gotToTop(content)"> <ion-icon name="arrow-up-circle-outline"></ion-icon></ion-fab-button>
    </ion-fab>
  </ion-content>
  `,
  styleUrls: ['./item-detail-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    SwiperComponent,
    TranslateModule,
    NoDataComponent,
    SpinnerComponent,
    ReviewCardComponent,
    ActorDetailModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemDetailModalComponent {

  gotToTop = gotToTop;
  commonFunctionSliceText = sliceText;
  trackById = trackById;
  errorImage = errorImage;
  EntityStatus = EntityStatus;
  isNotEmptyObject = isNotEmptyObject;
  @ViewChild(IonContent, {static: true}) content!: IonContent;
  @Input() item!: Movie | Serie;
  infoData: {id:number, label:string, field:string}[] = [
    {id:1, label:'COMMON.RELEASE_DATE', field: 'release_date'},
    {id:2, label:'COMMON.HOMEPAGE', field: 'homepage'},
  ];
  status: EntityStatus = EntityStatus.Initial;
  showButton: boolean = false;
  sliceText: {[key: string]: boolean} = {};
  triggerLoad = new EventEmitter<{ id:string, option:TypeOption }>();

  info$ = this.triggerLoad.pipe(
    switchMap(({id, option}) => {
      this.status = EntityStatus.Pending;
      this.cdRef.detectChanges();

      return forkJoin({
        detail: this.getServices('detail', option, id).pipe(catchError(() => of({}))),
        reviews: this.getServices('review', option, id).pipe(catchError(() => of({}))),
        trailers: this.getServices('trailer', option, id).pipe(catchError(() => of({}))),
        actorAndCrews: this.actorService.getByMovieOrSerie(option, +id).pipe(catchError(() => of({})))
      }).pipe(
        map(response => {
          const { detail, reviews, trailers, actorAndCrews } = response || {};

          const { actors = [], crews = [] } = (actorAndCrews as any) || {};
          this.status = EntityStatus.Loaded;
          this.sliceText = this.fillSliceTextItems(reviews);
          const [ trailer = null ] = trailers?.slice(-1) || [];

          return {
            detail,
            trailer,
            reviews,
            actors: actors?.slice(0, 7),
            crews: crews?.slice(0, 7),
          };
        }),
        catchError(() => {
          this.status = EntityStatus.Error;
          this.notificationService.notificationFailure('ERRORS.ERROR_LOAD');
          return of({actors:[], crews:[]})
        })
        // ,tap(d => console.log(d))
      )
    })
  );


  constructor(
    private sanitizer: DomSanitizer,
    private cdRef: ChangeDetectorRef,
    private serieService: SerieService,
    private movieService: MovieService,
    private actorService: ActorService,
    private modalController: ModalController,
    @Inject(ENVIRONMENT) public env: Environment,
    private notificationService: NotificationService,
  ) { }


  ionViewWillEnter(): void {
    const { option, id } = (this.item as any) || {};
    if(!id && id !== 0) return;
    this.triggerLoad.next({id, option});
  }

  // CLOSE MODAL
  dismiss() {
    this.modalController.dismiss({
      'dismissed': true
    });
  }

  get name() {
    return (this.item as Movie)?.original_title ?? (this.item as Serie)?.original_name
  }

  async openActorDetail(actor: Movie | Serie | Actor): Promise<any> {
    this.dismiss();

    const modal = await this.modalController.create({
      component: ActorDetailModalComponent,
      componentProps:{
        actor
      }
    });

    return await modal.present();
  }

  filterGernres(allGenres: any[]): Genre[] {
    return (allGenres || [])?.reduce((acc, item) => {
      const { id } = (item as any) || {};
      const allAccIds = (acc || [])?.map((el: Genre) => el?.id);
      return [
        ...acc,
        ...(!allAccIds?.includes(id)
            ? [ item ]
            : []
          )
      ]
    },[])
  }

  fillSliceTextItems(reviews: Review[]): {[key:string]: boolean} {
    const reviewsIndex = new Array(reviews?.length)?.fill(0)?.map((_,index) => index);
    return {
      ...reviewsIndex?.reduce((acc, idx) => ({...acc, [idx]: true}) ,{})
    };
  }

  getServices(type: 'detail' | 'review' | 'trailer', option: TypeOption, id: string): Observable<any> {
    return {
      'detail':{
        'serie': this.serieService.getDetail(id),
        'movie': this.movieService.getDetail(id)
      },
      'review':{
        'serie': this.serieService.getReviews(id),
        'movie': this.movieService.getReviews(id)
      },
      'trailer':{
        'serie': this.serieService.getVideos(id),
        'movie': this.movieService.getVideos(id)
      }
    }?.[type]?.[option] || of(null)
  }

  sliceTextChange(data:{index:number, value: boolean}): void {
    const { index, value } = data || {};
    this.sliceText = {
      ...this.sliceText,
      [index]: value
    };
  }

  doRefresh(event: any) {
    setTimeout(() => {
      const { option, id } = (this.item as any) || {};
      if(!id && id !== 0) return;
      this.triggerLoad.next({id, option});
      event.target.complete();
    }, 500);
  }

  getVideo(key: string): any {
    if(!key) return
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${key}?autoplay=1`);
  }

  logScrolling({detail:{scrollTop = 0}}): void{
    this.showButton = scrollTop >= 300;
  }

}
