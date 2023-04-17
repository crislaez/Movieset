import { TypeSubType } from "@movieset/core/models/common-type.models";
import { Movie } from "@movieset/features/movie";

export interface MoviesByTypePageComponentState {
  type?: TypeSubType;
  page: number;
  search?: string | null;
  cachedMovies?: Movie[]
}
