import { Actor } from '@movieset/features/actor';
import { TypeOption } from "@movieset/core/models/common-type.models";

export interface ActorsByMoviePageComponentState {
  idMovieOrSerie: number;
  type: TypeOption;
  slice?: number;
  search?: string;
  reload: boolean;
}

export interface ActorByMoviePageInfo {
  info: any,
  actors: Actor[]
}
