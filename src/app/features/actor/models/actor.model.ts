import { Movie } from "@movieset/features/movie";
import { Serie } from "@movieset/features/serie";

export interface Actor {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string;
  character: string;
  credit_id: string;
  order: number;
  also_known_as?: string[];
  biography?: string;
  birthday?: string;
  deathday?: string;
  homepage?: string;
  imdb_id?: string;
  place_of_birth?: string;
}

export interface Crew {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string;
  credit_id: string;
  department: string;
  job: string;
}

export interface ActorResponse {
  cast: Actor[];
  crew: Crew[];
  id: number;
}

export interface ActorMovieResponse {
  cast: Movie[];
  crew: Crew[];
  id: number;
}


export interface ActorTvResponse {
  cast: Serie[];
  crew: Crew[];
  id: number;
}

export interface ActorsResult {
  // searchs?: Serie[];
  actors?: Actor[];
  page?: number;
  total_results?: number;
}

export interface ActorsSeriesOrMovieResponse<T> {
  crew: Crew[];
  cast: T[];
  id?: number
}
