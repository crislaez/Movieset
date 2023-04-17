import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENVIRONMENT, Environment } from '@movieset/core/environments/environment.token';
import { TypeOption } from '@movieset/core/models/common-type.models';
import { Response } from '@movieset/core/models/response.models';
import { Movie } from '@movieset/features/movie';
import { Serie } from '@movieset/features/serie';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Actor, ActorResponse, ActorsResult, ActorsSeriesOrMovieResponse, Crew } from '../models/actor.model';

@Injectable({
  providedIn: 'root'
})
export class ActorService {

  baseURL: string = this.env.baseEndpoint;
  apiKey: string = this.env.apiKey;


  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private env: Environment,
  ) { }


  getAllPopular(page: number, type: string = 'popular'): Observable<ActorsResult>{
    return this.http.get<Response<Actor>>(`${this.baseURL}person/${type}?api_key=${this.apiKey}&page=${page}`).pipe(
      map( (response) => {
        const { page, results, total_results } = response || {}
        return { actors: results || [], page: page || 1, total_results: total_results || 0 };
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    );
  }

  getByMovieOrSerie(option: TypeOption, id: number): Observable<{actors: Actor[], crews: Crew[]}>{
    const transformOption = option === 'serie' ? 'tv' : option;

    return this.http.get<ActorResponse>(`${this.baseURL}${transformOption}/${id}/credits?api_key=${this.apiKey}`).pipe(
      map( ({cast, crew}) => ({actors: cast || [], crews: crew || []})),
      catchError((error) => {
        return throwError(() => error)
      })
    );
  }

  getDetail(id: number): Observable<Partial<Actor>>{
    return this.http.get<Actor>(`${this.baseURL}person/${id}?api_key=${this.apiKey}`).pipe(
      map( (actor) => (actor || {})),
      catchError((error) => {
        return throwError(() => error)
      })
    );
  }

  getBySearch(page: number, searchName: string): Observable<ActorsResult>{
    return this.http.get<Response<Actor>>(`${this.baseURL}search/person?api_key=${this.apiKey}&query=${searchName}&page=${page}`).pipe(
      map( (response) => {
        const { page, results, total_results } = response || {}
        return { actors: results || [], page: page || 1, total_results: total_results || 0 };
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    );
  }

  getMovies(id: number): Observable<Movie[]>{
    return this.http.get<ActorsSeriesOrMovieResponse<Movie>>(`${this.baseURL}/person/${id}/movie_credits?api_key=${this.apiKey}`).pipe(
      map( ({cast, crew}) => (cast || [])),
      catchError((error) => {
        return throwError(() => error)
      })
    );
  }

  getSeries(id: number): Observable<Serie[]>{
    return this.http.get<ActorsSeriesOrMovieResponse<Serie>>(`${this.baseURL}/person/${id}/tv_credits?api_key=${this.apiKey}`).pipe(
      map( ({cast, crew}) => (cast || [])),
      catchError((error) => {
        return throwError(() => error)
      })
    );
  }


}
