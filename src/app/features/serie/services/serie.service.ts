import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENVIRONMENT, Environment } from '@movieset/core/environments/environment.token';
import { TypeOption, TypeSubType } from '@movieset/core/models/common-type.models';
import { Response } from '@movieset/core/models/response.models';
import { Review } from '@movieset/core/models/reviews.models';
import { Video } from '@movieset/core/models/vide.models';
import { BehaviorSubject, Observable, catchError, forkJoin, map, of, throwError } from 'rxjs';
import { CarruselSerieFormatBody, HomeSerieCarrusel } from '../models/serie-state.models';
import { Serie, SerieResult } from '../models/serie.models';


@Injectable({
  providedIn: 'root'
})
export class SerieService {

  baseURL: string = this.env.baseEndpoint;
  apiKey: string = this.env.apiKey;
  serieCarrusel$ = new BehaviorSubject<HomeSerieCarrusel<Serie>>({});


  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private env: Environment,
  ) { }


  getHomeCarrusel(reload: boolean): Observable<HomeSerieCarrusel<Serie>> {
    if(!reload && Object.keys(this.serieCarrusel$.value || {})?.length > 0){
      return of(this.serieCarrusel$.value)
    }

    return forkJoin({
      popular: this.getByType('popular', 1).pipe(catchError(() => of({}))),
      on_the_air: this.getByType('on_the_air', 1).pipe(catchError(() => of({}))),
      top_rated: this.getByType('top_rated', 1).pipe(catchError(() => of({})))
    }).pipe(
      map(responses => {
        const { popular, on_the_air, top_rated } = responses || {};
        const { series: popularMovies = [] } = (popular as SerieResult) || {};
        const { series: onTheAirMovies = [] } = (on_the_air as SerieResult) || {};
        const { series: topRatedMovies = [] } = (top_rated as SerieResult) || {};

        const body = this.getHomeCarruselFormatBody({popularMovies, onTheAirMovies, topRatedMovies})
        this.serieCarrusel$.next(body);

        return body || {};
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    );
  }

  getDetail(idSerie: string): Observable<Serie>{
    return this.http.get<Serie>(`${this.baseURL}tv/${idSerie}?api_key=${this.apiKey}`).pipe(
      map( (serie) => {
        return serie || {};
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    )
  }

  getVideos(idSerie: string): Observable<Video[]> {
    return this.http.get<any>(`${this.baseURL}tv/${idSerie}/videos?api_key=${this.apiKey}`).pipe(
      map(response => {
        const { results: videos } = response || {};
        return videos || [];
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    )
  }

  getAll(page:number = 1): Observable<SerieResult> {
    return this.http.get<Response<Serie>>(`${this.baseURL}tv/airing_today?api_key=${this.apiKey}&page=${page}`).pipe(
      map( ({page, results: series, total_pages, total_results }) => {
        return {series: series || [], page:page || 1, total_pages:total_pages || 0 , total_results:total_results || 0}
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    )
  }

  getReviews(idSerie: string): Observable<Review[]>{
    return this.http.get<Response<Review>>(`${this.baseURL}tv/${idSerie}/reviews?api_key=${this.apiKey}`).pipe(
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
  ): Observable<SerieResult> {
    return this.http.get<Response<Serie>>(`${this.baseURL}tv/${type}?api_key=${this.apiKey}&page=${page}`).pipe(
      map( ({page, results: series, total_pages, total_results }) => {
        return {series: series || [], page:page || 1, total_pages:total_pages || 0 , total_results:total_results || 0}
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    )
  }

  getBySearch(searchName: string, page: number = 1): Observable<SerieResult> {
    return this.http.get<Response<Serie>>(`${this.baseURL}search/tv?api_key=${this.apiKey}&query=${searchName}&page=${page}`).pipe(
      map( ({page, results, total_pages, total_results }) => ({series: results || [], page:page || 1, total_pages:total_pages || 0 , total_results:total_results || 0})),
      catchError((error) => {
        return throwError(() => error)
      })
    );
  }

  private getHomeCarruselFormatBody(data: CarruselSerieFormatBody): HomeSerieCarrusel<Serie> {
    const { popularMovies, onTheAirMovies, topRatedMovies } = data || {};

    return {
      popular: {
        id: 4,
        title: ('serie' as TypeOption),
        url:'/serie/popular',
        subTitle: 'popular',
        items: popularMovies?.slice(0, 7)
      },
      on_the_air: {
        id: 5,
        title: ('serie' as TypeOption),
        url:'/serie/on_the_air',
        subTitle: 'on_the_air',
        items: onTheAirMovies?.slice(0, 7)
      },
      top_rated: {
        id: 6,
        title: ('serie' as TypeOption),
        url:'/serie/top_rated',
        subTitle: 'top_rated',
        items: topRatedMovies?.slice(0, 7)
      }
    };
  }

  // getMenu(): Observable<Genre[]>{
  //   return this.http.get<{genres: Genre[]}>(`${this.baseURL}genre/tv/list?api_key=${this.apiKey}`).pipe(
  //     map(response => {
  //       const { genres } = response || {}
  //       this.serieGenres$.next(genres);
  //       return genres || []
  //     }),
  //     catchError((error) => {
  //       this.serieGenres$.next([]);
  //       return throwError(() => error)
  //     })
  //   )
  // }


}
