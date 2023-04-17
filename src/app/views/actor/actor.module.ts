import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActorDetailModalComponent } from '@movieset/ui/actor-detail-modal';
import { InfiniteScrollComponent } from '@movieset/ui/infinite-scroll';
import { ItemCardComponent } from '@movieset/ui/item-card';
import { ItemCardSkeletonComponent } from '@movieset/ui/item-card-skeleton';
import { NoDataComponent } from '@movieset/ui/no-data';
import { TranslateModule } from '@ngx-translate/core';
import { ActorRoutingModule } from './actor-routing.module';
import { ActorsByMovieOrSerieComponent } from './containers/actors-by-movie-or-serie.component';
import { ActorsComponent } from './containers/actors.component';

const UIComponents = [
  ItemCardComponent,
  NoDataComponent,
  ActorDetailModalComponent,
  ItemCardSkeletonComponent,
  InfiniteScrollComponent,
];

@NgModule({
  declarations: [
    ActorsComponent,
    ActorsByMovieOrSerieComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    ...UIComponents,
    TranslateModule.forChild(),
    ActorRoutingModule
  ]
})
export class ActorModule { }
