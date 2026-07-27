export interface Sala {
  id: number;
  name: string;
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
  name: string;
  rows: number;
  cols: number;
}

export interface Funcion {
  id: number;
  movie: number;
  movie_title: string;
  sala: number;
  sala_name: string;
  start_time: string;
  available_seats: number;
  is_active: boolean;
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
  created_at: string;
  updated_at: string;
}

export interface ReservaSeat {
  id: number;
  seat_id: number;
  row: number;
  col: number;
}

export interface CreateReservaData {
  funcion_id: number;
  seat_ids: number[];
}
