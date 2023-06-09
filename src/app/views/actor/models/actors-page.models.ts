import { Actor } from "@movieset/features/actor";

export interface ActorsPageComponentState {
  page: number;
  cachedActors: Actor[]
  search?: string;
}
