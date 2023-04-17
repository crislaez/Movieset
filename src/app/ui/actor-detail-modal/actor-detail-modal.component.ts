import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Input, ViewChild } from '@angular/core';
import { IonContent, IonicModule, ModalController } from '@ionic/angular';
import { EntityStatus } from '@movieset/core/enums/state.enum';
import { ENVIRONMENT, Environment } from '@movieset/core/environments/environment.token';
import { errorImage, gotToTop, isNotEmptyObject, trackById } from '@movieset/core/functions/common.functions';
import { TypeOption } from '@movieset/core/models/common-type.models';
import { NotificationService } from '@movieset/core/notification';
import { Actor, ActorService } from '@movieset/features/actor';
import { Movie } from '@movieset/features/movie';
import { Serie } from '@movieset/features/serie';
import { SwiperComponent } from '@movieset/ui/swiper/swiper.component';
import { TranslateModule } from '@ngx-translate/core';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { ItemDetailModalComponent } from '../item-detail-modal';
import { NoDataComponent } from '../no-data';
import { SpinnerComponent } from '../spinner';

@Component({
  selector: 'app-actor-detail-modal',
  template: `
  <ion-header class="ion-no-border" >
    <ion-toolbar >
      <ion-title class="text-color-light">{{ $any(actor)?.name }}</ion-title>
      <ion-buttons class="text-color-light" slot="end">
        <ion-button class="ion-button-close" (click)="dismiss()"><ion-icon fill="clear" class="text-color-light" name="close-outline"></ion-icon></ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content [fullscreen]="true" [scrollEvents]="true" (ionScroll)="logScrolling($any($event))">
    <ng-container *ngIf="isNotEmptyObject(actor); else noData">

      <div class="container components-color-second container-top-radius">
        <ion-card class="fade-in-card banner-card card-card">
          <ion-img
            loading="lazy"
            [src]="$any(env)?.imageBase + $any(actor)?.profile_path"
            [alt]="$any(actor)?.profile_path"
            (ionError)="errorImage($event)">
          </ion-img>
        </ion-card>

        <!-- INFO  -->
        <div class="div-center radius-25">
          <h2 class="text-color-light">{{ $any(actor)?.name }}</h2>
        </div>

        <!-- LOADER  -->
        <ng-container *ngIf="status === EntityStatus.Pending;">
          <app-spinner [top]="'30%'"></app-spinner>
        </ng-container>

        <ng-container *ngIf="(info$ | async) as info">
          <ng-container *ngIf="status !== EntityStatus.Error; else serverError">

            <ng-container *ngIf="$any(info)?.detail?.biography as biography">
              <div class="div-center">
                <h2 class="text-color-light">{{ 'COMMON.BIOGRAPHY' | translate }}</h2>
              </div>

              <div class="card text-color-light margin-bottom-20" >
                {{ sliceDescription(biography) }}

                <div class="width-max displays-end">
                  <ion-button *ngIf="!showMoreDescription"
                    class="read-moore-button"
                    (click)="showMoreDescription = true">{{ 'COMMON.READ_MORE'| translate }}
                  </ion-button>
                </div>
              </div>
            </ng-container>

            <div class="div-center">
              <h2 class="text-color-light">{{ 'COMMON.PERSONAL_DATA' | translate }}</h2>
            </div>

            <div class="card text-color-light margin-bottom-20" >
              <div class="div-center">
                <ng-container *ngFor="let item of personalData; trackBy: trackById">
                  <div>{{ $any(item)?.label | translate }}</div>
                  <div class="displays-end">{{ $any(info)?.detail?.[$any(item)?.field] ?? '-' }}</div>
                </ng-container>
              </div>
            </div>

            <app-swiper
              *ngIf="$any(info)?.movies?.length > 0"
              [title]="'COMMON.MOVIES'"
              [hash]="'/movie/actor/'+ $any(actor)?.id"
              [items]="$any(info)?.movies"
              [status]="status"
              [showMore]="true"
              [showStars]="false"
              (openModal)="openDetail($event, 'movie')"
              (closeModal)="dismiss()">
            </app-swiper>

            <app-swiper
              *ngIf="$any(info)?.series?.length > 0"
              [title]="'COMMON.TVS'"
              [hash]="'/serie/actor/'+ $any(actor)?.id"
              [items]="$any(info)?.series"
              [status]="status"
              [showMore]="true"
              [showStars]="false"
              (openModal)="openDetail($event, 'serie')"
              (closeModal)="dismiss()">
            </app-swiper>

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
  styleUrls: ['./actor-detail-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    SwiperComponent,
    TranslateModule,
    NoDataComponent,
    SpinnerComponent,
    // ReviewCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActorDetailModalComponent {

  gotToTop = gotToTop;
  trackById = trackById;
  errorImage = errorImage;
  isNotEmptyObject = isNotEmptyObject;
  EntityStatus = EntityStatus;
  @ViewChild(IonContent, {static: true}) content!: IonContent;
  @Input() actor!: Actor;
  showMoreDescription: boolean = false;
  showButton: boolean = false;
  personalData: {id:number, label:string, field:string}[] = [
    {id:1, label:'COMMON.BIRTHDAY', field: 'birthday'},
    {id:12, label:'COMMON.PLACE_OF_BIRTH', field: 'place_of_birth'}
  ];
  status: EntityStatus = EntityStatus.Initial;
  triggerLoad = new EventEmitter<number>();

  info$ = this.triggerLoad.pipe(
    switchMap((id) => {
      this.status = EntityStatus.Pending;
      this.cdRef.detectChanges();

      return forkJoin({
        detail: this.actorService.getDetail(id).pipe(catchError(() => of({}))),
        movies: this.actorService.getMovies(id).pipe(catchError(() => of([]))),
        series: this.actorService.getSeries(id).pipe(catchError(() => of([])))
      }).pipe(
        map((response) => {
          const { detail, movies, series } = response || {};
          this.status = EntityStatus.Loaded;

          return {
            detail,
            movies: (movies || [])?.slice(0, 7),
            series: (series || [])?.slice(0, 7),
          }
        }),
        catchError(() => {
          this.status = EntityStatus.Error;
          this.notificationService.notificationFailure('ERRORS.ERROR_LOAD');
          return of({actors:[], crews:[]})
        }),
      )
    })
  );


  constructor(
    private cdRef: ChangeDetectorRef,
    private actorService: ActorService,
    private modalController: ModalController,
    @Inject(ENVIRONMENT) public env: Environment,
    private notificationService: NotificationService,
  ) { }


  ionViewWillEnter(): void {
    const { id } = this.actor || {};
    this.triggerLoad.next(id);
  }

  // CLOSE MODAL
  dismiss() {
    this.modalController.dismiss({
      'dismissed': true
    });
  }

  doRefresh(event: any) {
    setTimeout(() => {
      const { id } = this.actor || {};
      this.triggerLoad.next(id);
      event.target.complete();
    }, 500);
  }

  sliceDescription(description: string): string {
    return description?.length > 150 && !this.showMoreDescription
          ? description?.slice(0, 150) + '...'
          : description
  }

  async openDetail(item: Movie | Serie, option: TypeOption): Promise<any> {
    this.dismiss();

    const modal = await this.modalController.create({
      component: ItemDetailModalComponent,
      componentProps:{
        item: {
          ...item,
          option
        }
      }
    });

    return await modal.present();
  }

  logScrolling({detail:{scrollTop = 0}}): void{
    this.showButton = scrollTop >= 300;
  }


}
