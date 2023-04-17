import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-no-data',
  template: `
  <div class="error-serve" [ngStyle]="{'margin-top': top}">
    <div>
      <span>
        <img [src]="image"/>
      </span>
      <br>
      <span class="text-color-light">{{ title | translate }}</span>
    </div>
  </div>
  `,
  styleUrls: ['./no-data.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoDataComponent {
  @Input() top = '2vh';
  @Input() title!: string;
  @Input() image!: string;


  constructor() { }


}
