import { Movie } from "@movieset/features/movie";

export interface MoviesPageComponentState {
  page: number;
  search?: string | null;
  cachedMovies?: Movie[];
}
