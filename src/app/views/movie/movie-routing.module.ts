import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MoviesByActorComponent } from './containers/movies-by-actor.component';
import { MoviesByTypeComponent } from './containers/movies-by-type.component';
import { MoviesComponent } from './containers/movies.component';

const routes: Routes = [
  {
    path: '',
    component: MoviesComponent,
  },
  {
    path: ':typeMovie',
    component: MoviesByTypeComponent,
    data:{
      router: 'movie'
    }
  },
  {
    path: 'actor/:idActor',
    component: MoviesByActorComponent,
    data: {
      router: 'movie'
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
export class MovieRoutingModule { }
