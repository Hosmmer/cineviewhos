export interface Director {
  id: number;
  name: string;
  birth_date: string | null;
  city: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DirectorFormData {
  name: string;
  birth_date: string;
  city: string;
}
