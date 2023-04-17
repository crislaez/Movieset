import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { EntityStatus } from '@movieset/core/enums/state.enum';
import { TranslateModule } from '@ngx-translate/core';
import { SpinnerComponent } from '../spinner';

@Component({
  selector: 'app-infinite-scroll',
  template: `
    <ng-container *ngIf="slice < total">
      <ion-infinite-scroll threshold="100px" (ionInfinite)="loadData($event, total)">
        <ion-infinite-scroll-content class="loadingspinner">
          <app-spinner [top]="'0%'" *ngIf="$any(status) === 'pending'"></app-spinner>
        </ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ng-container>
  `,
  styleUrls: ['./infinite-scroll.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    SpinnerComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfiniteScrollComponent {

  @Input() slice!: number;
  @Input() status!: EntityStatus;
  @Input() total!: number;
  @Output() loadDataTrigger = new EventEmitter<{event: any, total:number}>();

  constructor() { }

  loadData(event: any, total:number): void{
    this.loadDataTrigger.next({event, total})
  }

}
