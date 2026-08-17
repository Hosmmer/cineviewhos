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

export interface Sala {
  id: number;
  cine: number;
  cine_name?: string;
  number: number;
  rows: number;
  cols: number;
  created_at: string;
  updated_at: string;
}

export interface SalaDetail extends Sala {
  seat_count: number;
  active_funcion_count: number;
}

export interface SalaFormData {
  cine: number;
  number: number;
  rows: number;
  cols: number;
}

export interface Format {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormatFormData {
  name: string;
}

export interface Franja {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FranjaFormData {
  name: string;
  start_time: string;
  end_time: string;
}

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

export interface Seat {
  id: number;
  row: number;
  col: number;
  is_occupied: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reserva {
  id: number;
  user: number;
  user_name: string;
  funcion: number;
  movie_title: string;
  sala_name: string;
  start_time: string;
  status: "confirmed" | "anulada";
  confirmed_at: string;
  seats: ReservaSeat[];
  created_at: string;
  updated_at: string;
}

export interface ReservaList {
  id: number;
  user: number;
  user_name: string;
  funcion: number;
  movie_title: string;
  sala_name: string;
  start_time: string;
  status: "confirmed" | "anulada";
  confirmed_at: string;
  seat_count: number;
  seats?: ReservaSeat[];
  created_at: string;
  updated_at: string;
}

export interface ReservaSeat {
  id: number;
  seat_id: number;
  row: number;
  col: number;
  person_name?: string;
}

export interface CreateReservaData {
  funcion_id: number;
  seats: { seat_id: number; person_name: string }[];
}
