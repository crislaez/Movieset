import { TypeOption } from "@movieset/core/models/common-type.models";
import { Actor } from "@movieset/features/actor";
import { Serie } from "@movieset/features/serie";

export interface SeriesByActorPageComponentState {
  idActor: number;
  slice: number;
  search?: string;
  type: TypeOption
  reload: boolean;
}

export interface SeriesByActorPageInfo {
  detail: Partial<Actor>,
  series: Serie[]
}
