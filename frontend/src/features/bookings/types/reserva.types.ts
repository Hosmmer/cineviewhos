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
