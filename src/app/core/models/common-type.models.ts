export type TypeSubType = 'popular' | 'top_rated' | 'on_the_air' | 'upcoming';

export type TypeOption =  'serie' | 'movie';

export interface Carrusel<T> {
  id: number;
  title: TypeOption;
  url: string;
  subTitle: string;
  items: T[]
}
