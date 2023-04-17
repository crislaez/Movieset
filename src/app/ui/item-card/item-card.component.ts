import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ENVIRONMENT, Environment } from '@movieset/core/environments/environment.token';
import { errorImage, sliceText } from '@movieset/core/functions/common.functions';
import { Actor } from '@movieset/features/actor';
import { Movie } from '@movieset/features/movie';
import { Serie } from '@movieset/features/serie';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-item-card',
  template: `
  <ion-card class="ion-activatable ripple-parent" (click)="openModal.next($any(item))">
    <img class="card-image" loading="lazy"
      [src]="$any(env)?.imageBase + image"
      [alt]="image"
      (error)="errorImage($event)"/>

    <!-- <div class="card-item displays-around" >
      <div class="card-item-title displays-center" >
        <div class="span-text text-color-light"><span class="span-bold">{{ sliceText(name, 15) }}</span></div>
      </div>

      <div class="card-item-types ">
        <ion-chip *ngIf="card?.damage_type">
          <ion-label class="text-color-light">{{ card?.damage_type }}</ion-label>
        </ion-chip>
        <ion-chip *ngIf="card?.tags?.range">
          <ion-label class="text-color-light">{{ card?.tags?.range }}</ion-label>
        </ion-chip>
      </div>

      <div class="card-item-avatar">
        <ion-avatar slot="start">
          <ion-img loading="lazy" [src]="_core.imageUrl(type, card?.name)" [alt]="card?.name" (ionError)="errorImage($event)"></ion-img>
        </ion-avatar>
      </div>
    </div> -->

    <div *ngIf="showStars" class="card-star displays-around">
      <img *ngFor="let star of [0,1,2,3,4]"
        [src]="(star + 1) <= stars ? starComplete : starEmpty"
      >
    </div>

    <!-- RIPLE EFFECT  -->
    <ion-ripple-effect></ion-ripple-effect>
  </ion-card>

  <div class="card-item-title displays-center" >
    <div class="padding-2 font-small text-color-light">
      <span class="span-bold">{{ sliceText(name, 18) }}</span>
    </div>
    <div class="width-max"></div>
    <div class="padding-2 font-small text-color-light">
      <span class="span-bold">{{ sliceText((item?.character ?? item?.job), 18) }}</span>
    </div>
  </div>
  `,
  styleUrls: ['./item-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    TranslateModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemCardComponent {

  sliceText = sliceText;
  errorImage = errorImage;
  @Input() item!: any //Movie | Serie | Actor;
  @Input() url!: string;
  @Input() showStars: boolean = true;
  @Output() openModal = new EventEmitter<Movie | Serie | Actor>();
  defaultImage: string = 'assets/images/image_not_found.png';
  starComplete = 'assets/images/complete_star.svg';
  starEmpty = 'assets/images/empty_star.svg';

  constructor(
    private router: Router,
    @Inject(ENVIRONMENT) public env: Environment,
  ) { }


  // ngOnInit(): void {
  //   console.log(this.item)
  // }

  onClick(): void {
    // if(this.from === 'Line') return;

    // const url:string = {
    //   // 'Line': `map/line/${this.item}`,
    //   'Station': `map/station/${this.item?.['KODEA-CODIGO']?.['_text']}`,
    //   'Schedule': `map/schedule/${this.item?.['KODEA-CODIGO']?.['_text']}`,
    // }?.[this.from] || '/home';

    // this.router.navigate([url])
  }

  get name(){
    return (this.item as Movie)?.['original_title'] ?? (this.item as Serie)?.['name'] ?? '--'
  }

  get stars (): number{
    const { vote_average } = this.item || {};
    const data = ((vote_average as number) * 5) / 10;
    return Number(Math.round(data));
  }

  get image() {
    return this.item?.poster_path ?? (this.item as any)?.profile_path
  }

}
