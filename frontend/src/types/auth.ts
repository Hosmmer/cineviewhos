export interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  re_password: string
  first_name?: string
  last_name?: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  resetPassword: (email: string) => Promise<void>
}
