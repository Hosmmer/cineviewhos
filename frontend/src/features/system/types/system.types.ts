export interface Module {
  id: number;
  name: string;
  slug: string;
  icon: string;
  route: string | null;
  parent: number | null;
  order: number;
  is_active: boolean;
  roles?: number[];
  children: Module[];
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
}

export interface UserAdmin {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_staff?: boolean;
  is_active?: boolean;
  roles: number[];
}
