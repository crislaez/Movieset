import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { EntityStatus } from '@movieset/core/enums/state.enum';
import { errorImage, getSliderConfig, sliceText, textFormat, trackById } from '@movieset/core/functions/common.functions';
import { Actor } from '@movieset/features/actor';
import { Movie } from '@movieset/features/movie';
import { Serie } from '@movieset/features/serie';
import { TranslateModule } from '@ngx-translate/core';
import SwiperCore, { Navigation, Pagination } from 'swiper';
import { SwiperModule } from 'swiper/angular';
import { ItemCardComponent } from '../item-card';
import { ItemCardSkeletonComponent } from '../item-card-skeleton';
import { NoDataComponent } from '../no-data';

SwiperCore.use([Pagination, Navigation]);

@Component({
  selector: 'app-swiper',
  template: `
  <div class="header" no-border>
    <div class="div-center">
      <h2 class="text-color-light">{{ textFormat(title) | translate }}</h2>
      <span class="ion-activatable ripple-parent font-medium"
        *ngIf="showMore && !['pending','error']?.includes(status)"
        (click)="redirectTo()">
        {{ 'COMMON.SHEE_MORE' | translate }}
        <!-- RIPLE EFFECT  -->
        <ion-ripple-effect></ion-ripple-effect>
      </span>
    </div>
  </div>

  <ng-container *ngIf="status === 'loaded'">
    <ng-container *ngIf="$any(items)?.length > 0; else noData">
      <swiper #swiper effect="fade" [config]="getSliderConfig(items)" >
        <ng-template swiperSlide *ngFor="let item of items; trackBy: trackById" >
          <app-item-card
            [item]="item"
            [showStars]="showStars"
            (openModal)="openModal.next($event)">
          </app-item-card>
        </ng-template>
      </swiper>
    </ng-container>
  </ng-container>

  <ng-container *ngIf="status === 'pending'">
    <swiper #swiper effect="fade" [config]="getSliderConfig([0,1,2])">
      <ng-template swiperSlide *ngFor="let item of [0,1,2]">
        <app-item-card-skeleton>
        </app-item-card-skeleton>
      </ng-template>
    </swiper>
  </ng-container>

  <!-- IS ERROR -->
  <ng-container *ngIf="status === 'error'">
    <app-no-data [title]="'COMMON.ERROR'" [image]="imageError" [top]="'3vh'"></app-no-data>
  </ng-container>

  <!-- IS NO DATA  -->
  <ng-template #noData>
    <app-no-data [title]="'COMMON.NORESULT'" [image]="imageEmpty" [top]="'15vh'"></app-no-data>
  </ng-template>
  `,
  styleUrls: ['./swiper.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    SwiperModule,
    TranslateModule,
    NoDataComponent,
    ItemCardComponent,
    ItemCardSkeletonComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwiperComponent {

  sliceText = sliceText;
  trackById = trackById;
  textFormat = textFormat;
  errorImage = errorImage;
  getSliderConfig = getSliderConfig;

  @Input() title!: string;
  @Input() hash!: string;
  @Input() items!: any[];
  @Input() status!: EntityStatus;
  @Input() showMore!: boolean;
  @Input() showStars: boolean = true;
  @Output() openModal = new EventEmitter<Movie | Serie | Actor>();
  @Output() closeModal = new EventEmitter<void>();
  imageError: string = 'assets/images/error.png';
  imageEmpty: string = 'assets/images/empty.png';


  constructor(
    private router: Router,
  ){ }


  // CLOSE MODAL
  redirectTo() {
    if(!this.hash) return;
    this.closeModal.next();
    // console.log(this.hash)
    this.router.navigate([this.hash]);
  }

}
