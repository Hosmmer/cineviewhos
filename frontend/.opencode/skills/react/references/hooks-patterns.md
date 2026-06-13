# Hooks Patterns — React 18 + TypeScript

## Custom Hook Anatomy

```typescript
function useFeature<T>(param: string): { data: T | null; loading: boolean; error: Error | null } {
  // state
  // effects with cleanup
  // callbacks with useCallback
  return result
}
```

## Async Effects — Always Handle Cancellation

```typescript
useEffect(() => {
  let cancelled = false

  async function load() {
    try {
      const data = await fetchSomething(id)
      if (!cancelled) setState(data)
    } catch {
      if (!cancelled) setError(true)
    }
  }

  load()
  return () => { cancelled = true }
}, [id])
```

## useDebounce

```typescript
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
```

## useLocalStorage

```typescript
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
  }, [key, value])

  return [value, setValue] as const
}
```

## useReducer — Complex Local State

```typescript
interface State {
  items: string[]
  selected: string | null
  screen: 'list' | 'detail'
}

type Action =
  | { type: 'SET_ITEMS'; payload: string[] }
  | { type: 'SELECT'; payload: string }
  | { type: 'SET_SCREEN'; payload: 'list' | 'detail' }
  | { type: 'CLEAR_SELECTION' }

const initialState: State = { items: [], selected: null, screen: 'list' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload }
    case 'SELECT':
      return { ...state, selected: action.payload, screen: 'detail' }
    case 'SET_SCREEN':
      return { ...state, screen: action.payload }
    case 'CLEAR_SELECTION':
      return { ...state, selected: null, screen: 'list' }
    default:
      return state
  }
}

// In component
const [state, dispatch] = useReducer(reducer, initialState)
```

## useCallback & useMemo

```typescript
// useCallback — stabilize function reference
const handleSelect = useCallback((id: string) => {
  dispatch({ type: 'SELECT', payload: id })
}, [dispatch])

// useMemo — cache expensive derivation
const total = useMemo(
  () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
  [items]
)

// Only memoize when:
// 1. Passed as prop to a React.memo component, OR
// 2. The calculation is expensive and deps change rarely
```

## useRef

```typescript
// DOM access
const inputRef = useRef<HTMLInputElement>(null)
useEffect(() => { inputRef.current?.focus() }, [])

// Mutable non-reactive value
const hasAttempted = useRef(false)
if (!hasAttempted.current) {
  hasAttempted.current = true
  doSomething()
}
```

## Context + Custom Hook Pattern

```typescript
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface Filters {
  page: number
  status: string
}

interface FilterContextValue {
  filters: Filters
  updateFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void
}

const FilterContext = createContext<FilterContextValue | null>(null)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Filters>({ page: 1, status: 'all' })

  const updateFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  return (
    <FilterContext.Provider value={{ filters, updateFilter }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters(): FilterContextValue {
  const ctx = useContext(FilterContext)
  if (!ctx) throw new Error('useFilters must be inside FilterProvider')
  return ctx
}
```

## Quick Reference

| Hook | Purpose |
|---|---|
| `useState` | Simple local state |
| `useReducer` | Multiple related state transitions |
| `useEffect` | Side effects — always return cleanup |
| `useCallback` | Stable function for memoized children |
| `useMemo` | Cache expensive derived values |
| `useRef` | DOM access or mutable non-reactive value |
| `useContext` | Read context — wrap in a typed hook |

| Gotcha | Fix |
|---|---|
| Async effect updates unmounted component | Set `cancelled = true` in cleanup |
| `useEffect` runs twice in dev | Strict Mode — expected, design effects to be safe |
| Stale closure in `useEffect` | Add the value to dependency array |
