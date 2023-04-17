export interface Review {
  author?: string;
  author_details: AuthorDetail;
  content?: string;
  created_at?: string;
  id?: string;
  updated_at?: string;
  url?: string;
}

export interface AuthorDetail {
  name?: string;
  username?: string;
  avatar_path?: string;
  rating?: number;
}
