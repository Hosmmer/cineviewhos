export interface Actor {
  id: number;
  name: string;
  birth_date: string | null;
  city: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActorFormData {
  name: string;
  birth_date: string;
  city: string;
}
