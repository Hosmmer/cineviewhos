# State Management — React 18 + TypeScript

## Decision Tree

```
Is the state used in only one component?
  └─ Yes → useState (or useReducer if complex)

Is it server data (fetched from the API)?
  └─ Yes → @tanstack/react-query v5 useQuery / useMutation

Is it shared across multiple components in a subtree?
  └─ Yes → Context + custom hook
```

## Local State — useState

```typescript
const [isOpen, setIsOpen] = useState(false)
const [query, setQuery] = useState('')
const [count, setCount] = useState(0)
const increment = () => setCount(prev => prev + 1)

const [filters, setFilters] = useState({ page: 1, status: 'all' as string })
const setPage = (page: number) => setFilters(prev => ({ ...prev, page }))
```

## Server State — @tanstack/react-query v5

> **Important:** This project uses `@tanstack/react-query` **v5**.
> Import from `'@tanstack/react-query'`.

### useQuery

```typescript
import { useQuery } from '@tanstack/react-query'
import { getItems } from './_requests'
import type { Item } from './_models'

export function useItems(params?: Record<string, unknown>) {
  return useQuery<Item[]>({
    queryKey: ['items', params],
    queryFn: () => getItems(params),
    enabled: !!params,
    staleTime: 2 * 60 * 1000,
  })
}

// In component
function ItemList() {
  const { data = [], isLoading, isError, error } = useItems({ page: 1 })

  if (isLoading) return <span className="spinner-border" />
  if (isError) return <div className="alert alert-danger">{(error as Error).message}</div>

  return (
    <ul className="list-group">
      {data.map(item => <li key={item.id} className="list-group-item">{item.name}</li>)}
    </ul>
  )
}
```

### useMutation + invalidate

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createItem, deleteItem } from './_requests'
import type { Item } from './_models'

export function useCreateItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Item>) => createItem(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

export function useDeleteItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

// In component
function CreateButton() {
  const mutation = useCreateItem()

  return (
    <button
      className="btn btn-primary"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate({ name: 'New Item' })}
    >
      {mutation.isPending ? 'Creating…' : 'Create'}
    </button>
  )
}
```

### Read from cache without refetching

```typescript
import { useQueryClient } from '@tanstack/react-query'

const qc = useQueryClient()
const cached = qc.getQueryData<Item[]>(['items', { page: 1 }])
```

## Shared UI State — Context + Custom Hook

```typescript
import { createContext, useContext, useState, type ReactNode } from 'react'

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
}

interface UIContextValue extends UIState {
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

const UIContext = createContext<UIContextValue | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const toggleSidebar = () => setSidebarOpen(prev => !prev)

  return (
    <UIContext.Provider value={{ sidebarOpen, toggleSidebar, theme, setTheme }}>
      {children}
    </UIContext.Provider>
  )
}

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be inside UIProvider')
  return ctx
}
```

## Complex Module State — useReducer + Context

```typescript
const initialState = { items: [] as string[], selectedId: null as string | null, loading: false, error: null as string | null }

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: string[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'SELECT'; payload: string }

function listReducer(state: typeof initialState, action: Action) {
  switch (action.type) {
    case 'FETCH_START':     return { ...state, loading: true, error: null }
    case 'FETCH_SUCCESS':   return { ...state, loading: false, items: action.payload }
    case 'FETCH_ERROR':     return { ...state, loading: false, error: action.payload }
    case 'SELECT':          return { ...state, selectedId: action.payload }
    default:                return state
  }
}
```

## Quick Reference

| Solution | Best for |
|---|---|
| `useState` | Local UI state, flags, simple inputs |
| `useReducer` | Complex local state with multiple actions |
| Context + hook | Shared state in a subtree |
| `useQuery` | Fetching and caching server data |
| `useMutation` | Creating, updating, deleting |

| @tanstack/react-query v5 gotcha | Fix |
|---|---|
| Old import path | `from '@tanstack/react-query'` not `from 'react-query'` |
| Query runs before data is ready | `enabled: !!param` |
| Stale list after mutation | `qc.invalidateQueries({ queryKey: ['resource'] })` in `onSuccess` |
| v5 API uses objects | `{ queryKey, queryFn }` not positional args |
