import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENVIRONMENT, Environment } from '@movieset/core/environments/environment.token';
import { TypeOption, TypeSubType } from '@movieset/core/models/common-type.models';
import { Response } from '@movieset/core/models/response.models';
import { Review } from '@movieset/core/models/reviews.models';
import { Video } from '@movieset/core/models/vide.models';
import { BehaviorSubject, Observable, catchError, forkJoin, map, of, throwError } from 'rxjs';
import { CarruselMovieFormatBody, HomeMovieCarrusel } from '../models/movie-state.models';
import { Movie, MovieResult } from '../models/movie.models';


@Injectable({
  providedIn: 'root'
})
export class MovieService {

  baseURL: string = this.env.baseEndpoint;
  apiKey: string = this.env.apiKey;
  movieCarrusel$ = new BehaviorSubject<HomeMovieCarrusel<Movie>>({});


  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private env: Environment,
  ) { }


  getHomeCarrusel(reload: boolean): Observable<HomeMovieCarrusel<Movie>> {
    if(!reload && Object.keys(this.movieCarrusel$.value || {})?.length > 0){
      return of(this.movieCarrusel$.value)
    }

    return forkJoin({
      popular: this.getByType('popular', 1).pipe(catchError(() => of({}))),
      upcoming: this.getByType('upcoming', 1).pipe(catchError(() => of({}))),
      top_rated: this.getByType('top_rated', 1).pipe(catchError(() => of({})))
    }).pipe(
      map(responses => {
        const { popular, upcoming, top_rated } = responses || {};
        const { movies: popularMovies = [] } = (popular as MovieResult) || {};
        const { movies: upcomingMovies = [] } = (upcoming as MovieResult) || {};
        const { movies: topRatedMovies = [] } = (top_rated as MovieResult) || {};

        const body = this.getHomeCarruselFormatBody({popularMovies, upcomingMovies, topRatedMovies});
        this.movieCarrusel$.next(body);

        return body || {}
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    );
  }

  getDetail(idMovie: string): Observable<Movie>{
    return this.http.get<Movie>(`${this.baseURL}movie/${idMovie}?api_key=${this.apiKey}`).pipe(
      map( (movie) => {
        return movie || {};
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    )
  }

  getVideos(idMovie: string): Observable<Video[]> {
    return this.http.get<Response<Video>>(`${this.baseURL}movie/${idMovie}/videos?api_key=${this.apiKey}`).pipe(
      map(response => {
        const { results: videos } = response || {};
        return videos || [];
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    )
  }

  getAll(page:number = 1): Observable<MovieResult> {
    return this.http.get<Response<Movie>>(`${this.baseURL}movie/now_playing?api_key=${this.apiKey}&page=${page}`).pipe(
      map(({ page, results: movies, total_results }) => {
        return { movies: movies || [], page: page || 1, total_results: total_results || 0 };
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    )
  }

  getReviews(idMovie: string): Observable<Review[]>{
    return this.http.get<Response<Review>>(`${this.baseURL}movie/${idMovie}/reviews?api_key=${this.apiKey}`).pipe(
      map((response) => {
        const { results } = response || {}
        return results || [];
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    )
  }

  getByType(
    type: TypeSubType = 'popular',
    page: number = 1,
  ): Observable<MovieResult> {
    return this.http.get<Response<Movie>>(`${this.baseURL}movie/${type}?api_key=${this.apiKey}&page=${page}`).pipe(
      map(({ page, results: movies, total_results }) => {
        return { movies: movies || [], page: page || 1, total_results: total_results || 0 };
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    )
  }

  getBySearch(searchName: string, page: number = 1): Observable<MovieResult> {
    return this.http.get<Response<Movie>>(`${this.baseURL}search/movie?api_key=${this.apiKey}&query=${searchName}&page=${page}`).pipe(
      map( ({page, results, total_pages, total_results }) => ({movies: results || [], page:page || 1, total_pages:total_pages || 0 , total_results:total_results || 0})),
      catchError((error) => {
        return throwError(() => error)
      })
    );
  }

  private getHomeCarruselFormatBody(data: CarruselMovieFormatBody): HomeMovieCarrusel<Movie> {
    const { popularMovies, upcomingMovies, topRatedMovies } = data || {};

    return {
      popular: {
        id: 1,
        title: ('movie' as TypeOption),
        url:'/movie/popular',
        subTitle: 'popular',
        items: popularMovies?.slice(0, 7)
      },
      upcoming: {
        id: 2,
        title: ('movie' as TypeOption),
        url:'/movie/upcoming',
        subTitle: 'upcoming',
        items: upcomingMovies?.slice(0, 7)
      },
      top_rated: {
        id: 3,
        title: ('movie' as TypeOption),
        url:'/movie/top_rated',
        subTitle: 'top_rated',
        items: topRatedMovies?.slice(0, 7)
      }
    };
  }

  // getMenu(): Observable<Genre[]>{
  //   return this.http.get<{genres: Genre[]}>(`${this.baseURL}genre/movie/list?api_key=${this.apiKey}`).pipe(
  //     map(response => {
  //       const { genres } = response || {}
  //       this.movieGenres$.next(genres);
  //       return genres || []
  //     }),
  //     catchError((error) => {
  //       this.movieGenres$.next([]);
  //       return throwError(() => error)
  //     })
  //   )
  // }

}
