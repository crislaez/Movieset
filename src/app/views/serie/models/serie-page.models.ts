import { Serie } from "@movieset/features/serie";

export interface SeriePageComponentState {
  page: number;
  search?: string | null;
  cachedSeries?: Serie[];
}
