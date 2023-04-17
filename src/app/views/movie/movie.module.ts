import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { InfiniteScrollComponent } from '@movieset/ui/infinite-scroll';
import { ItemCardComponent } from '@movieset/ui/item-card';
import { ItemCardSkeletonComponent } from '@movieset/ui/item-card-skeleton';
import { NoDataComponent } from '@movieset/ui/no-data';
import { TranslateModule } from '@ngx-translate/core';
import { MoviesByActorComponent } from './containers/movies-by-actor.component';
import { MoviesByTypeComponent } from './containers/movies-by-type.component';
import { MoviesComponent } from './containers/movies.component';
import { MovieRoutingModule } from './movie-routing.module';

const UIComponents = [
  ItemCardComponent,
  NoDataComponent,
  ItemCardSkeletonComponent,
  InfiniteScrollComponent,
];

@NgModule({
  declarations: [
    MoviesComponent,
    MoviesByTypeComponent,
    MoviesByActorComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    ...UIComponents,
    TranslateModule.forChild(),
    MovieRoutingModule
  ]
})
export class MovieModule { }
