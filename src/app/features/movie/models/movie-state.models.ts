import { Carrusel } from "@movieset/core/models/common-type.models";

export interface HomeMovieCarrusel<T> {
  popular?: Carrusel<T>;
  upcoming?: Carrusel<T>;
  top_rated?: Carrusel<T>;
}
