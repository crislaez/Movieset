import { Carrusel } from "@movieset/core/models/common-type.models";
import { Movie } from "./movie.models";

export interface HomeMovieCarrusel<T> {
  popular?: Carrusel<T>;
  upcoming?: Carrusel<T>;
  top_rated?: Carrusel<T>;
}

export interface CarruselMovieFormatBody {
  popularMovies: Movie[];
  upcomingMovies: Movie[];
  topRatedMovies: Movie[];
}
