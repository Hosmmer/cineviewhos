export interface Module {
  id: number;
  name: string;
  slug: string;
  icon: string;
  route: string | null;
  parent: number | null;
  order: number;
  is_active: boolean;
  children: Module[];
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
}
