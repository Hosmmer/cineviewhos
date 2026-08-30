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
