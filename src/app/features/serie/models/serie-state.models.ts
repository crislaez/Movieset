import { Carrusel } from "@movieset/core/models/common-type.models";

export interface HomeSerieCarrusel<T>  {
  popular?: Carrusel<T>;
  on_the_air?: Carrusel<T>;
  top_rated?: Carrusel<T>;
}
