import { TypeSubType } from "@movieset/core/models/common-type.models";
import { Serie } from "@movieset/features/serie";

export interface SeriesByTypePageComponentState {
  type?: TypeSubType;
  page: number;
  search?: string | null;
  cachedSeries?: Serie[]
}
