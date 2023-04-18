import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, ViewChild } from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular';
import { EntityStatus } from '@movieset/core/enums/state.enum';
import { gotToTop, trackById } from '@movieset/core/functions/common.functions';
import { TypeOption } from '@movieset/core/models/common-type.models';
import { NotificationService } from '@movieset/core/notification';
import { Movie, MovieService } from '@movieset/features/movie';
import { Serie, SerieService } from '@movieset/features/serie';
import { ItemDetailModalComponent } from '@movieset/ui/item-detail-modal';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-home',
  template: `
  <ion-content [fullscreen]="true" [scrollEvents]="true" (ionScroll)="logScrolling($any($event))">

    <div class="empty-header components-background-dark">
    </div>

    <div class="container components-background-dark">
      <h1 class="text-color-gradient">{{ 'COMMON.HOME' | translate }}</h1>

      <!-- <div class="empty-div"></div> -->

      <!-- LOADER  -->
      <ng-container *ngIf="status === EntityStatus.Pending">
        <app-spinner [top]="'70%'"></app-spinner>
      </ng-container>

      <ng-container *ngIf="(info$ | async) as info">
        <ng-container *ngIf="status !== EntityStatus.Error; else serverError">
          <ng-container *ngIf="info?.length > 0; else noData">

            <ng-container *ngFor="let item of info; trackBy: trackById">

              <app-swiper
                [title]="$any(item)?.title + ' ' + $any(item)?.subTitle"
                [hash]="$any(item)?.url"
                [items]="$any(item)?.items"
                [status]="EntityStatus.Loaded"
                [showMore]="true"
                (openModal)="openDetail($event, $any(item)?.title)">
              </app-swiper>

            </ng-container>
          </ng-container>
        </ng-container>
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
        <app-no-data [title]="'COMMON.ERROR'" [image]="'assets/images/error.png'" [top]="'30vh'"></app-no-data>
      </ng-template>
    </div>

    <!-- TO TOP BUTTON  -->
    <ion-fab *ngIf="showButton" vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button class="color-button-text" (click)="gotToTop(content)"> <ion-icon name="arrow-up-circle-outline"></ion-icon></ion-fab-button>
    </ion-fab>
  </ion-content>
  `,
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

  gotToTop = gotToTop;
  trackById = trackById;
  EntityStatus = EntityStatus;
  @ViewChild(IonContent, {static: true}) content!: IonContent;
  showButton: boolean = false;
  status: EntityStatus = EntityStatus.Initial;
  triggerLoad = new EventEmitter<boolean>();

  info$: Observable<any> = this.triggerLoad.pipe(
    switchMap((reload) => {
      this.status = EntityStatus.Pending;
      this.cdRef.detectChanges();

      return forkJoin({
        movies: this.movieService.getHomeCarrusel(reload).pipe(catchError(() => of({}))),
        series: this.serieService.getHomeCarrusel(reload).pipe(catchError(() => of({})))
      }).pipe(
        map(responses => {
          this.status = EntityStatus.Loaded;
          const { movies, series } = responses || {};

          return [
            ...Object.values(movies || {}),
            ...Object.values(series || {})
          ]
        }),
        catchError(() => {
          this.status = EntityStatus.Error;
          this.notificationService.notificationFailure('ERROR')
          return of({})
        })
      )
    })
  );


  constructor(
    private cdRef: ChangeDetectorRef,
    private movieService: MovieService,
    private serieService: SerieService,
    private modalController: ModalController,
    private notificationService: NotificationService,
  ) { }


  ionViewWillEnter(): void{
    this.triggerLoad.next(false);
  }

  doRefresh(event: any) {
    setTimeout(() => {
      this.triggerLoad.next(true);
      event.target.complete();
    }, 500);
  }

  async openDetail(item: Movie | Serie, option: TypeOption): Promise<any> {
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
