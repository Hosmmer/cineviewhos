---
name: frontend-testing
description: "Use when writing or fixing frontend tests. Covers Vitest + React Testing Library patterns: component tests, hook tests, context tests, mocking axios/http, async testing, and test utilities."
metadata:
  version: "1.0.0"
  domain: frontend
  stack: Vitest + React Testing Library + MSW (optional) + TypeScript
  triggers: test, testing, vitest, React Testing Library, render, screen, fireEvent, mock, spy, assertion, expect, describe, it
  role: specialist
  scope: implementation
  output-format: code
---

# Frontend Testing Expert (CineViewHos)

Senior testing specialist — Vitest + React Testing Library + TypeScript.

## When to Use This Skill

- Writing new tests for components, hooks, or contexts
- Fixing failing tests
- Setting up test infrastructure (mocks, fixtures, utilities)
- Testing auth flows (login, register, protected routes)
- Testing async data fetching with react-query
- Testing form validation and submission
- Testing navigation and routing

## Test Setup

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
```

### src/test/setup.ts

```typescript
import '@testing-library/jest-dom'
```

### src/test/test-utils.tsx

```typescript
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../contexts/AuthContext'
import { IntlProvider } from 'react-intl'
import es from '../i18n/es.json'
import type { ReactElement } from 'react'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string
  authenticated?: boolean
}

export function customRender(ui: ReactElement, options: CustomRenderOptions = {}) {
  const { initialRoute = '/', ...renderOptions } = options
  const queryClient = createTestQueryClient()

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale="es" messages={es}>
          <MemoryRouter initialEntries={[initialRoute]}>
            <AuthProvider>
              {children}
            </AuthProvider>
          </MemoryRouter>
        </IntlProvider>
      </QueryClientProvider>
    )
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

export * from '@testing-library/react'
export { customRender as render }
```

## Component Testing Patterns

### Basic Component Test

```typescript
import { render, screen } from '../test/test-utils'
import { describe, it, expect } from 'vitest'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    render(<MyComponent />)
    const button = screen.getByRole('button', { name: /click me/i })
    await userEvent.click(button)
    expect(screen.getByText('Clicked!')).toBeInTheDocument()
  })
})
```

### Testing Auth Context

```typescript
import { render, screen, waitFor } from '../test/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import http from '../http-common'

vi.mock('../http-common', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    defaults: { headers: { common: {} } },
  },
}))

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('shows loading spinner while checking auth', () => {
    vi.mocked(http.get).mockReturnValue(new Promise(() => {})) // pending forever
    render(<ProtectedPage />)
    expect(screen.getByRole('status')).toBeInTheDocument() // spinner
  })

  it('redirects to login when not authenticated', async () => {
    vi.mocked(http.get).mockRejectedValue(new Error('Unauthorized'))
    render(<ProtectedPage />)
    await waitFor(() => {
      expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument()
    })
  })

  it('renders protected content when authenticated', async () => {
    localStorage.setItem('accessToken', 'fake-token')
    vi.mocked(http.get).mockResolvedValue({
      data: { id: 1, username: 'testuser', email: 'test@test.com' },
    })
    render(<ProtectedPage />)
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })
  })
})
```

### Testing Login Form

```typescript
import { render, screen, waitFor } from '../test/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import http from '../http-common'
import { LoginPage } from '../pages/LoginPage'

vi.mock('../http-common', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    defaults: { headers: { common: {} } },
  },
}))

describe('LoginPage', () => {
  it('submits login form successfully', async () => {
    vi.mocked(http.post).mockResolvedValue({
      data: { access: 'token123', refresh: 'refresh123' },
    })
    vi.mocked(http.get).mockResolvedValue({
      data: { id: 1, username: 'test', email: 'test@test.com' },
    })

    render(<LoginPage />)

    await userEvent.type(screen.getByPlaceholderText(/usuario/i), 'testuser')
    await userEvent.type(screen.getByPlaceholderText(/contraseña/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(http.post).toHaveBeenCalledWith('/auth/jwt/create/', {
        username: 'testuser',
        password: 'password123',
      })
    })
  })

  it('shows error on failed login', async () => {
    vi.mocked(http.post).mockRejectedValue({
      response: { data: { detail: 'Credenciales inválidas' } },
    })

    render(<LoginPage />)

    await userEvent.type(screen.getByPlaceholderText(/usuario/i), 'wrong')
    await userEvent.type(screen.getByPlaceholderText(/contraseña/i), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument()
    })
  })
})
```

### Testing react-query Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi } from 'vitest'
import http from '../http-common'

vi.mock('../http-common', () => ({
  default: { get: vi.fn() },
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useMovies', () => {
  it('fetches movies successfully', async () => {
    const movies = [{ id: 1, title: 'Inception', year: 2010 }]
    vi.mocked(http.get).mockResolvedValue({ data: { results: movies } })

    const { result } = renderHook(() => useMovies(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.data).toEqual(movies)
    })
  })

  it('returns loading state', () => {
    vi.mocked(http.get).mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useMovies(), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(true)
  })
})
```

### Testing Navigation / Routing

```typescript
import { render, screen } from '../test/test-utils'
import { describe, it, expect } from 'vitest'
import { App } from '../App'

describe('Routing', () => {
  it('renders home page on /', () => {
    render(<App />, { initialRoute: '/' })
    expect(screen.getByText(/cineviewhos/i)).toBeInTheDocument()
  })

  it('renders login page on /login', () => {
    render(<App />, { initialRoute: '/login' })
    expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument()
  })

  it('redirects to login when accessing protected route unauthenticated', async () => {
    render(<App />, { initialRoute: '/dashboard' })
    await waitFor(() => {
      expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument()
    })
  })
})
```

## Mocking Patterns

### Mocking axios/http

```typescript
// Always mock the shared http instance, not axios directly
vi.mock('../http-common', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    defaults: { headers: { common: {} } },
  },
}))
```

### Mocking localStorage

```typescript
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })
```

### Mocking react-router-dom

```typescript
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})
```

### Mocking react-hot-toast

```typescript
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
  toast: { success: vi.fn(), error: vi.fn() },
}))
```

## Common Assertions

```typescript
// Element exists
expect(screen.getByText('Hello')).toBeInTheDocument()

// Element does not exist
expect(screen.queryByText('Hello')).not.toBeInTheDocument()

// Element has class
expect(element).toHaveClass('bg-gray-900')

// Input has value
expect(input).toHaveValue('test')

// Button is disabled
expect(button).toBeDisabled()

// Function was called
expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledWith({ key: 'value' })
expect(mockFn).toHaveBeenCalledTimes(2)

// Wait for async
await waitFor(() => expect(screen.getByText('Loaded')).toBeInTheDocument())

// Find by (async query)
const element = await screen.findByText('Loaded')

// Wait for element to disappear
await waitForElementToBeRemoved(() => screen.queryByText('Loading'))
```

## Testing async with `waitFor`

```typescript
// Good: explicit assertion inside waitFor
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument()
})

// Good: find* queries auto-wait
const message = await screen.findByText('Success')

// Bad: waitFor without assertion (will always pass)
await waitFor(() => {}) // DON'T DO THIS
```

## Test Organization

```typescript
describe('ComponentName', () => {
  // Group by behavior
  describe('when loading', () => {
    it('shows spinner', () => { /* ... */ })
  })

  describe('when data is loaded', () => {
    it('renders items', () => { /* ... */ })
  })

  describe('when there is an error', () => {
    it('shows error message', () => { /* ... */ })
  })

  describe('user interactions', () => {
    it('handles click', () => { /* ... */ })
  })
})
```

## Constraints

### MUST DO
- **Use custom render from test-utils** — never `@testing-library/react` raw render
- **Clear mocks** in `beforeEach` — `vi.clearAllMocks()`
- **Test from user perspective** — query by text/role/label, not by test-id or class
- **`waitFor` always has assertion** — never empty callback
- **Mock at module level** — `vi.mock('../http-common')` at top of file
- **Test error states** — network failure, validation errors, auth errors
- **Test loading states** — spinner/skeleton renders while async resolves
- **`async/await` with userEvent** — `await userEvent.click(...)`

### MUST NOT DO
- **Don't test implementation details** — test behavior, not state variable names
- **Don't use `data-testid`** — query by text, role, label instead
- **Don't mock react-query internals** — mock the http layer instead
- **Don't skip cleanup** — testing-library auto-cleans, but clear localStorage manually
- **Don't test external libraries** — test your code, not react-query or react-router
