import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { InfiniteScrollComponent } from '@movieset/ui/infinite-scroll';
import { ItemCardComponent } from '@movieset/ui/item-card';
import { ItemCardSkeletonComponent } from '@movieset/ui/item-card-skeleton';
import { NoDataComponent } from '@movieset/ui/no-data';
import { TranslateModule } from '@ngx-translate/core';
import { SerieByActorComponent } from './containers/serie-by-actor.component';
import { SeriesByTypeComponent } from './containers/series-by-type.component';
import { SeriesComponent } from './containers/series.component';
import { SerieRoutingModule } from './serie-routing.module';

const UIComponents = [
  ItemCardComponent,
  NoDataComponent,
  ItemCardSkeletonComponent,
  InfiniteScrollComponent,
];

@NgModule({
  declarations: [
    SeriesComponent,
    SeriesByTypeComponent,
    SerieByActorComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    ...UIComponents,
    TranslateModule.forChild(),
    SerieRoutingModule
  ]
})
export class SerieModule { }
