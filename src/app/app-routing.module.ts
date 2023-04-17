import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./views/home/home.module').then( m => m.HomeModule)
  },
  {
    path: 'movie',
    loadChildren: () => import('./views/movie/movie.module').then( m => m.MovieModule)
  },
  {
    path: 'serie',
    loadChildren: () => import('./views/serie/serie.module').then( m => m.SerieModule)
  },
  {
    path: 'actor',
    loadChildren: () => import('./views/actor/actor.module').then( m => m.ActorModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch:'full'
  },
  {
    path: '**',
    redirectTo: 'home',
  }
];
@NgModule({
  imports: [
    // RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
