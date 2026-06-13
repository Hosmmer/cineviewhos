# Testing React — Vitest + React Testing Library

## Test Stack

| Tool | Role |
|---|---|
| `vitest` | Test runner |
| `@testing-library/react` | Render + query utilities |
| `@testing-library/user-event` v14 | Simulate real user interactions |
| `@testing-library/jest-dom` | Custom matchers (`toBeInTheDocument`, etc.) |
| `jsdom` | Browser-like environment |
| `customRender` | Wraps with providers |

```bash
npm run test         # watch mode
npm run test:ci      # single run (CI)
npx vitest --coverage
```

## customRender

The project's `src/test/test-utils.tsx` provides a `customRender` that wraps providers.

```typescript
// test-utils.tsx
import { cleanup, render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { IntlProvider } from 'react-intl'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, vi } from 'vitest'

afterEach(() => cleanup())

function customRender(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale="es" messages={{}}>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route path="*" element={children} />
            </Routes>
          </MemoryRouter>
        </IntlProvider>
      </QueryClientProvider>
    ),
  })
}

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
export { customRender }
```

## Basic Component Test

```typescript
import { customRender, screen } from '@/test/test-utils'
import { describe, it, expect } from 'vitest'
import HomePage from './HomePage'

describe('HomePage', () => {
  it('renders without crashing', () => {
    customRender(<HomePage />)
    expect(screen.getByText(/custom app/i)).toBeInTheDocument()
  })
})
```

## User Interactions — userEvent v14

```typescript
import { customRender, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'

it('types in the search input', async () => {
  render(<SearchInput />)
  const input = screen.getByPlaceholderText(/search/i)
  await userEvent.type(input, 'test')
  expect(input).toHaveValue('test')
})

it('clicks a button', async () => {
  const onSave = vi.fn()
  render(<SaveButton onSave={onSave} />)
  await userEvent.click(screen.getByRole('button', { name: /save/i }))
  expect(onSave).toHaveBeenCalledTimes(1)
})
```

## Testing with react-query

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { customRender, screen } from '@/test/test-utils'

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return customRender(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

// Mock axios
import axios from 'axios'
vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

it('renders items after fetch', async () => {
  mockedAxios.get.mockResolvedValueOnce({ data: [{ id: '1', name: 'Test' }] })
  renderWithQuery(<ItemList />)
  expect(await screen.findByText('Test')).toBeInTheDocument()
})
```

## Testing Custom Hooks

```typescript
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from './useDebounce'

it('useDebounce delays the value', async () => {
  vi.useFakeTimers()

  const { result, rerender } = renderHook(
    ({ value }) => useDebounce(value, 300),
    { initialProps: { value: 'initial' } }
  )

  rerender({ value: 'updated' })
  expect(result.current).toBe('initial')

  await act(async () => { vi.advanceTimersByTime(300) })
  expect(result.current).toBe('updated')

  vi.useRealTimers()
})
```

## Query Selector Priority

```typescript
// 1. Prefer accessible queries
screen.getByRole('button', { name: /create/i })
screen.getByRole('textbox', { name: /name/i })
screen.getByLabelText('Email')
screen.getByText('No items found')

// 2. Fallback — test id
screen.getByTestId('item-row')

// 3. Async — after render/fetch
await screen.findByText('Item created')

// 4. Assert absence
expect(screen.queryByText('Error')).not.toBeInTheDocument()
```

## Quick Reference

| Import | Source |
|---|---|
| `customRender`, `screen` | `@/test/test-utils` |
| `userEvent` | `@testing-library/user-event` |
| `vi`, `describe`, `it`, `expect` | `vitest` |

| Pattern | When |
|---|---|
| `customRender` | Any component using providers |
| `vi.mock('axios')` | Mock HTTP calls |
| `renderHook` | Test custom hooks |
| Direct reducer call | Test reducers — no component needed |
| `vi.useFakeTimers()` | Test debounce, polling, timeouts |

| Gotcha | Fix |
|---|---|
| `useIntl()` fails | Use `customRender` (includes IntlProvider) |
| `useNavigate()` fails | Use `customRender` (includes MemoryRouter) |
| `userEvent.setup()` | v14 has it — use `const user = userEvent.setup()` |
| Query not found after async op | Use `findBy*` instead of `getBy*` |
