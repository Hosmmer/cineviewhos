export interface Cine {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CineFormData {
  name: string;
}

export interface CineScheduleFuncion {
  id: number;
  movie_id: number;
  movie_title: string;
  start_time: string;
  is_active: boolean;
}

export interface CineScheduleSala {
  id: number;
  number: number;
  rows: number;
  cols: number;
  funciones: CineScheduleFuncion[];
}

export interface CineSchedule {
  id: number;
  name: string;
  salas: CineScheduleSala[];
}
