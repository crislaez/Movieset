export interface Movie {
  adult?:boolean,
  backdrop_path?:string,
  id?:number,
  original_language?:string,
  original_title?:string,
  overview?:string,
  popularity?:number,
  poster_path?:string,
  release_date?:string,
  title?:string,
  video?:boolean,
  vote_average?:string,
  vote_count?:number,
  belongs_to_collection?: any,
  budget?:number,
  genres?: any,
  homepage?: any,
  imdb_id?: string,
  production_companies?: any,
  production_countries?: any
  revenue?: number,
  runtime?: number,
  spoken_languages?: any,
  status?: string,
  tagline?: string
}


export interface MovieFilter {
  genre?: string;
  search?: string;
}

export interface MovieResult {
  // searchs?: Serie[];
  movies?: Movie[];
  page: number;
  total_results: number;
}
