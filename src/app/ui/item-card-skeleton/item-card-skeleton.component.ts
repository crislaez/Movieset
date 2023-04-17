import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-item-card-skeleton',
  template:`
  <ion-card class="ion-activatable ripple-parent slide-ion-card"  >

    <div class="mat-card-header">
      <div class="div-image"></div>
    </div>

    <!-- <div class="card-content">
      <div class="div-p"></div>
    </div> -->
  </ion-card>
  `,
  styleUrls: ['./item-card-skeleton.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    // RouterModule,
    // TranslateModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemCardSkeletonComponent {

  constructor() { }

}
