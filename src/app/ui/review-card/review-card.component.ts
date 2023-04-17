import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { Review } from '@movieset/core/models/reviews.models';
import { ENVIRONMENT, Environment } from '@movieset/core/environments/environment.token';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { errorImage } from '@movieset/core/functions/common.functions';

@Component({
  selector: 'app-review-card',
  template:`
  <div class="card text-color-light margin-bottom-20">
    <div class="review displays-between">
      <div
        *ngIf="(review?.author_details?.avatar_path || 'null') as avatar"
        class="displays-start">
        <img
          class="card-image"
          loading="lazy"
          [src]="$any(env)?.imageBase + avatar"
          [alt]="avatar"
          (error)="errorImage($event)"
        />
        <div>
          {{ $any(review)?.author_details?.username }}
          <ng-container *ngIf="review?.author_details?.name as name">
            ({{ name }})
          </ng-container>
        </div>
      </div>
    </div>
    {{ sliceReviews($any(review)?.content, i) }}

    <div class="width-max displays-end">
      <ion-button *ngIf="sliceText?.[i]"
        class="read-moore-button"
        (click)="sliceTextChange.next({index:i, value: false})">{{ 'COMMON.READ_MORE'| translate }}
      </ion-button>
    </div>
  </div>
  `,
  styleUrls: [
    './review-card.component.scss',
    '../item-detail-modal/item-detail-modal.component.scss'
  ],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewCardComponent {

  errorImage = errorImage;
  @Input() review!: Review;
  @Input() i!: number;
  @Input() sliceText!: {[key:string]: boolean};
  @Output() sliceTextChange = new EventEmitter<{index:number, value: boolean}>()


  constructor(
    @Inject(ENVIRONMENT) public env: Environment,
  ) { }


  sliceReviews(text: string, index: number): string {
    return this.sliceText?.[index] && text?.length > 100 ? text?.slice(0, 100) + '...': text
  }


}
