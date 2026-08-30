import type { Format } from "./format.types";

export interface Funcion {
  id: number;
  movie: number;
  movie_title: string;
  sala: number;
  sala_name: string;
  cine_name?: string;
  sala_number?: number;
  start_time: string;
  available_seats: number;
  is_active: boolean;
  formats: Format[];
  franja?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FuncionDetail extends Funcion {
  movie_duration: number;
  sala_rows: number;
  sala_cols: number;
}

export interface FuncionFormData {
  movie: number;
  sala: number;
  start_time: string;
  format_ids?: number[];
}
