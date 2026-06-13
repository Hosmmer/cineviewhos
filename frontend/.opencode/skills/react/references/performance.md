# Performance — React 18 + TypeScript

## Route-Level Code Splitting

All page-level components must be loaded with `lazy()` and `Suspense`.

```typescript
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

const HomePage  = lazy(() => import('./pages/HomePage'))
const ItemsPage = lazy(() => import('./pages/ItemsPage'))

export const AppRoutes = () => (
  <Suspense fallback={<span className="spinner-border" />}>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/items" element={<ItemsPage />} />
    </Routes>
  </Suspense>
)
```

### Lazy-load heavy components within a page

```typescript
const HeavyChart = lazy(() => import('./HeavyChart'))

function Dashboard() {
  const [showChart, setShowChart] = useState(false)

  return (
    <div>
      <button className="btn btn-primary" onClick={() => setShowChart(true)}>
        Show Chart
      </button>
      {showChart && (
        <Suspense fallback={<div className="text-muted">Loading chart...</div>}>
          <HeavyChart />
        </Suspense>
      )}
    </div>
  )
}
```

## React.memo — Prevent Unnecessary Re-renders

```typescript
import { memo } from 'react'

interface ItemRowProps {
  item: { id: string; name: string; status: string }
  onSelect: (id: string) => void
}

const ItemRow = memo(function ItemRow({ item, onSelect }: ItemRowProps) {
  return (
    <tr onClick={() => onSelect(item.id)}>
      <td>{item.name}</td>
      <td><span className={`badge badge-light-${item.status === 'active' ? 'success' : 'secondary'}`}>{item.status}</span></td>
    </tr>
  )
})
```

## useCallback — Stable Callbacks for Memoized Children

```typescript
function ItemList({ items }: { items: Item[] }) {
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = useCallback((id: string) => {
    setSelected(id)
  }, [])

  return items.map(item => (
    <ItemRow key={item.id} item={item} onSelect={handleSelect} />
  ))
}
```

## useMemo — Cache Expensive Derivations

```typescript
// Total
const total = useMemo(
  () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
  [items]
)

// Filtered + sorted
const filteredItems = useMemo(
  () => items
    .filter(i => filter === 'all' || i.status === filter)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
  [items, filter]
)
```

## useTransition — Keep UI Responsive

```typescript
import { useTransition, useState } from 'react'

function ProductSearch({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('')
  const [filtered, setFiltered] = useState(products)
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setQuery(value)

    startTransition(() => {
      setFiltered(products.filter(p =>
        p.name.toLowerCase().includes(value.toLowerCase())
      ))
    })
  }

  return (
    <>
      <input className="form-control" value={query} onChange={handleChange} />
      {isPending && <span className="spinner-border spinner-border-sm" />}
      <ProductGrid products={filtered} />
    </>
  )
}
```

## Avoid Common Pitfalls

```typescript
// ❌ Inline object — new reference every render
<ItemRow style={{ color: 'red' }} />

// ✅ Lift stable objects
const rowStyle = { color: 'red' } as const
<ItemRow style={rowStyle} />

// ❌ Inline function
<ItemRow onSelect={() => setSelected(id)} />

// ✅ useCallback
const handleSelect = useCallback(() => setSelected(id), [id])
<ItemRow onSelect={handleSelect} />

// ❌ Array index as key
{items.map((item, i) => <ItemRow key={i} item={item} />)}

// ✅ Unique id
{items.map(item => <ItemRow key={item.id} item={item} />)}
```

## Quick Reference

| Technique | When to Apply |
|---|---|
| `lazy()` + `Suspense` | Every page component |
| `React.memo` | Expensive list rows re-rendering from parent |
| `useCallback` | Callbacks passed to `memo`-wrapped children |
| `useMemo` | Expensive sorts/filters; stable objects for memo'd children |
| `useTransition` | Filter/sort over large in-memory datasets |
| `staleTime` in useQuery | Prevent redundant API calls |

| Anti-pattern | Fix |
|---|---|
| Inline `{}` or `[]` as prop | Lift out of render or `useMemo` |
| Inline `() => ...` to memo'd child | `useCallback` |
| `key={index}` on dynamic list | `key={item.id}` |
| Heavy component blocking render | `lazy()` + `Suspense` |
