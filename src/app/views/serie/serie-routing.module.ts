import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SerieByActorComponent } from './containers/serie-by-actor.component';
import { SeriesByTypeComponent } from './containers/series-by-type.component';
import { SeriesComponent } from './containers/series.component';

const routes: Routes = [
  {
    path: '',
    component: SeriesComponent,
  },
  {
    path: ':typeSerie',
    component: SeriesByTypeComponent,
    data:{
      router: 'serie'
    }
  },
  {
    path: 'actor/:idActor',
    component: SerieByActorComponent,
    data: {
      router: 'serie'
    }
  },
  {
    path:'**',
    redirectTo:'/home'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SerieRoutingModule { }
