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
