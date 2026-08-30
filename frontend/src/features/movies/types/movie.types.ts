import type { Genre } from "./genre.types";
import type { Director } from "./director.types";
import type { Author } from "./author.types";
import type { Actor } from "./actor.types";

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
  franjas?: { id: number; name: string }[];
  is_active: boolean;
  display_config?: MovieDisplayConfig;
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
  franjas?: { id: number; name: string }[];
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
  franja_ids?: number[];
}

export interface MovieDisplayConfig {
  show_director: boolean;
  show_author: boolean;
  show_actor: boolean;
  show_description: boolean;
  show_duration: boolean;
  show_release_year: boolean;
  show_price: boolean;
  show_genre: boolean;
}
