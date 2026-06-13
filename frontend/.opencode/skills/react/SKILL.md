---
name: react-dev
description: "Use when building or modifying the React frontend. Covers React 18 + TypeScript + Vite patterns: functional components, custom hooks, @tanstack/react-query v5, axios JWT interceptor, react-router-dom v6, Tailwind CSS (dark theme), react-intl i18n, AuthContext, Vitest testing."
metadata:
  version: "2.1.0"
  domain: frontend
  stack: React 18 + TypeScript 5 + Vite 5 + @tanstack/react-query v5 + axios + react-router-dom v6 + Tailwind CSS + react-intl + vitest
  triggers: React, component, hook, useState, useEffect, useQuery, useMutation, axios, context, router, TypeScript, tsx, Tailwind, vitest, auth, login, register
  role: specialist
  scope: implementation
  output-format: code
---

# React Frontend Expert (CineViewHos)

Senior React specialist — React 18 + TypeScript + Tailwind CSS + JWT Auth.

## When to Use This Skill

- Creating or modifying page components
- Implementing data fetching with @tanstack/react-query v5
- Adding auth-related UI (login, register, password reset)
- Writing custom hooks
- Configuring routing with react-router-dom v6
- Managing auth state via AuthContext
- Writing tests with Vitest + React Testing Library
- Optimizing performance (lazy, memo, useMemo)

## Critical Project-Specific Details

- **Tailwind CSS** — NOT Bootstrap. No Bootstrap classes. Use `gray-900`, `red-600`, etc.
- **Dark theme** — backgrounds `gray-900`/`gray-800`, text `gray-100`/`gray-300`, red accents
- **Auth via AuthContext** — `useAuth()` returns `{ user, login, register, logout, loading }`
- **JWT interceptor** in `src/http-common.ts` — auto-attaches `Authorization: Bearer <token>`
- **No formik** — forms use plain `useState` with simple validation
- **No i18n required for MVP** — hardcoded Spanish strings are acceptable
- **Auth pages are cinematic** — full-screen gradient, no navbar/header, centered card
- **Notifications via react-hot-toast** — `toast.success(msg)` / `toast.error(msg)`
- **ProtectedRoute** — wraps authenticated pages, redirects `/login` if no token

## Project Structure Reference

| Layer | File | Description |
|-------|------|-------------|
| Axios instance | `src/http-common.ts` | Base axios w/ JWT interceptor |
| Auth context | `src/AuthContext.tsx` | login(), register(), logout(), user state |
| Protected route | `src/ProtectedRoute.tsx` | Auth guard for private pages |
| Pages | `src/pages/*.tsx` | Lazy-loaded route pages |
| Models | `src/pages/*_models.ts` | TypeScript interfaces per feature |
| Requests | `src/pages/*_requests.ts` | Axios call wrappers per feature |

## Core Workflow

1. **Identify the layer** — page, request, context, or component?
2. **Types first** — define interfaces in `*_models.ts`
3. **Request function** — in `*_requests.ts`, uses the shared axios instance
4. **Hook/Context** — wrap in custom hook or consume AuthContext
5. **Component** — consume the hook; keep JSX thin
6. **Type-check** — `npx tsc --noEmit`. Fix all errors.
7. **Test** — write vitest tests

## Key Patterns

### Axios instance (JWT interceptor)
```typescript
// src/http-common.ts
import axios from 'axios'

const instance = axios.create({ baseURL: '/api' })

instance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refreshToken')
      if (refresh) {
        try {
          const { data } = await axios.post('/api/auth/jwt/refresh/', { refresh })
          localStorage.setItem('accessToken', data.access)
          original.headers.Authorization = `Bearer ${data.access}`
          return instance(original)
        } catch { /* refresh failed */ }
      }
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default instance
```

### Auth Context
```typescript
// src/AuthContext.tsx
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import http from './http-common'

interface User { id: number; username: string; email: string }
interface AuthContextType {
  user: User | null; loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) { setLoading(false); return }
      http.defaults.headers.common.Authorization = `Bearer ${token}`
      const { data } = await http.get('/auth/users/me/')
      setUser(data)
    } catch { localStorage.removeItem('accessToken') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchUser() }, [fetchUser])

  const login = async (username: string, password: string) => {
    const { data } = await http.post('/auth/jwt/create/', { username, password })
    localStorage.setItem('accessToken', data.access)
    localStorage.setItem('refreshToken', data.refresh)
    http.defaults.headers.common.Authorization = `Bearer ${data.access}`
    const me = await http.get('/auth/users/me/')
    setUser(me.data)
  }

  const register = async (regData: RegisterData) => {
    await http.post('/auth/users/', regData)
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    delete http.defaults.headers.common.Authorization
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth must be used within AuthProvider'); return ctx }
```

### Protected Route
```typescript
import { Navigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex justify-center items-center min-h-screen bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
  </div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
```

### Data fetching (@tanstack/react-query v5)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import http from '../http-common'
import type { Profile } from './_models'

export function useProfile() {
  return useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: () => http.get('/auth/users/me/').then(r => r.data),
  })
}
```

## UI Patterns (Tailwind CSS — dark theme)

### Auth Page (cinematic)
```tsx
<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
  <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-white">CineViewHos</h1>
      <p className="text-gray-400 mt-2">Subtítulo</p>
    </div>
    {/* form */}
  </div>
</div>
```

### Card
```tsx
<div className="bg-gray-800 rounded-lg p-6 shadow-lg">
  <h3 className="text-lg font-semibold text-white mb-4">Title</h3>
  {children}
</div>
```

### Input
```tsx
<input
  type="text"
  value={value}
  onChange={e => setValue(e.target.value)}
  placeholder="Placeholder"
  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
/>
```

### Button
```tsx
<button
  onClick={handleClick}
  disabled={loading}
  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
>
  {loading ? 'Cargando...' : 'Texto'}
</button>
```

### Error Alert
```tsx
{error && (
  <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
    {error}
  </div>
)}
```

### Loading Spinner
```tsx
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
```

### Navbar
```tsx
<nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
  <div className="flex items-center justify-between max-w-7xl mx-auto">
    <span className="text-xl font-bold text-white">CineViewHos</span>
    <button onClick={logout} className="text-gray-400 hover:text-white transition-colors">Cerrar sesión</button>
  </div>
</nav>
```

### Empty state
```tsx
<div className="text-center py-12">
  <p className="text-gray-400">No hay datos.</p>
</div>
```

## Constraints

### MUST DO
- **TypeScript everywhere** — no `any`, no implicit types. Define interfaces in `*_models.ts`.
- **`npx tsc --noEmit` must pass** — fix all type errors before committing.
- **@tanstack/react-query v5 API** — `import { useQuery } from '@tanstack/react-query'`. Query keys are objects `{queryKey: ['resource', id]}`.
- **Effect cleanup** — return a cleanup function or set a `cancelled` flag in every async `useEffect`.
- **`lazy()` for all page-level components** — register in route config.
- **Tailwind CSS only** — never use Bootstrap classes. Never import .css files.

### MUST NOT DO
- `console.log` in committed code
- Using array index as `key` for dynamic lists
- Inline arrow functions as stable callbacks passed to memoized children — use `useCallback`
- Bootstrap classes or additional CSS frameworks

## React 18 Notes (not React 19)

- **No `useActionState`** — React 19 feature
- **No `use(promise)`** — React 19 feature. Use react-query.
- **No Server Components** — Vite SPA
- **`useTransition`** — available in React 18
- **Strict Mode** — active in dev; effects run twice intentionally

## Dev Commands

```bash
npm run dev          # Dev server
npm run build        # tsc + Vite build
npm run test         # Vitest (watch)
npm run test:ci      # Vitest (single run)
npx tsc --noEmit     # Type-check only
```
