import { TypeOption } from "@movieset/core/models/common-type.models";
import { Actor } from "@movieset/features/actor";
import { Movie } from "@movieset/features/movie";

export interface MoviesByActorPageComponentState {
  idActor: number;
  slice: number;
  search?: string;
  type: TypeOption
  reload: boolean;
}

export interface MoviesByActorPageInfo {
  detail: Partial<Actor>,
  movies: Movie[]
}
