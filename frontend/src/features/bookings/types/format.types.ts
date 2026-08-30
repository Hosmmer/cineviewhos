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
