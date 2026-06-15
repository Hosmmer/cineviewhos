export interface Genre {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface Movie {
  id: number
  title: string
  description: string
  director: string
  actors: string
  duration_minutes: number
  release_year: number
  poster: string | null
  price: string
  genre: number
  genre_detail?: Genre
  genre_name?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MovieList {
  id: number
  title: string
  director: string
  release_year: number
  duration_minutes: number
  poster: string | null
  price: string
  genre: number
  genre_name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MovieFormData {
  title: string
  description: string
  director: string
  actors: string
  duration_minutes: number
  release_year: number
  poster?: File | null
  price: number
  genre: number
}

export interface GenreFormData {
  name: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
