export interface Genre {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Director {
  id: number;
  name: string;
  birth_date: string | null;
  city: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Author {
  id: number;
  name: string;
  birth_date: string | null;
  city: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Actor {
  id: number;
  name: string;
  birth_date: string | null;
  city: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Movie {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  release_year: number;
  poster: string | null;
  price: string;
  genre: number;
  genre_detail?: Genre;
  genre_name?: string;
  director_fk: number | null;
  director_detail?: Director;
  director_name?: string;
  author_fk: number | null;
  author_detail?: Author;
  author_name?: string;
  actor_fk: number | null;
  actor_detail?: Actor;
  actor_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MovieList {
  id: number;
  title: string;
  director_name: string;
  author_name: string;
  actor_name: string;
  release_year: number;
  duration_minutes: number;
  poster: string | null;
  price: string;
  genre: number;
  genre_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MovieFormData {
  title: string;
  description: string;
  duration_minutes: number;
  release_year: number;
  poster?: File | null;
  price: number;
  genre: number;
  director_fk: number | null;
  author_fk: number | null;
  actor_fk: number | null;
}

export interface GenreFormData {
  name: string;
}

export interface DirectorFormData {
  name: string;
  birth_date: string;
  city: string;
}

export interface AuthorFormData {
  name: string;
  birth_date: string;
  city: string;
}

export interface ActorFormData {
  name: string;
  birth_date: string;
  city: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
