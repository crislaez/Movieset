import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActorsByMovieOrSerieComponent } from './containers/actors-by-movie-or-serie.component';
import { ActorsComponent } from './containers/actors.component';

const routes: Routes = [
  {
    path: '',
    component: ActorsComponent,
  },
  {
    path: 'movie/:idMovieOrSerie',
    component: ActorsByMovieOrSerieComponent,
    data: {
      router: 'movie'
    }
  },
  {
    path: 'serie/:idMovieOrSerie',
    component: ActorsByMovieOrSerieComponent,
    data: {
      router: 'serie'
    }
  },
  {
    path:'**',
    redirectTo:''
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActorRoutingModule { }
