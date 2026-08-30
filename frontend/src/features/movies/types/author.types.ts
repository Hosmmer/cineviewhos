export interface Author {
  id: number;
  name: string;
  birth_date: string | null;
  city: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthorFormData {
  name: string;
  birth_date: string;
  city: string;
}
