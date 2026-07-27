# Testing — CineViewHos Frontend

## Framework

**Vitest** + **Testing Library**. Config in `vitest.config.ts`:
- Environment: `jsdom`
- Globals: true (`describe`, `it`, `expect` without imports)
- Setup: `./src/test/test-utils.tsx`
- CSS: true

Run: `cd frontend && vitest`

## Test Utils (`src/test/test-utils.tsx`)

All tests use `customRender` which wraps components in ALL providers:

```typescript
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

afterEach(() => cleanup());

function customRender(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale="es" messages={{}}>
          <MemoryRouter initialEntries={["/"]}>
            <Routes>
              <Route path="*" element={children} />
            </Routes>
          </MemoryRouter>
        </IntlProvider>
      </QueryClientProvider>
    ),
  });
}

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
export { customRender };
```

## Test Imports

```typescript
import { customRender, screen, waitFor, fireEvent, userEvent } from "@/test/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
```

## Component Test Pattern

```typescript
describe("LoginPage", () => {
  it("renders login form", () => {
    customRender(<LoginPage />);
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /iniciar/i })).toBeInTheDocument();
  });

  it("shows validation errors on empty submit", async () => {
    customRender(<LoginPage />);
    await userEvent.click(screen.getByRole("button", { name: /iniciar/i }));
    expect(await screen.findByText(/requerido/i)).toBeInTheDocument();
  });
});
```

## Mocking API Calls

```typescript
import { vi } from "vitest";

vi.mock("@/services/authService", () => ({
  loginUser: vi.fn(),
}));
```

## Key Rules

- Use `customRender` (not bare `render`) to include all providers
- Use `screen.getBy*` for synchronous queries, `screen.findBy*` for async
- Prefer `userEvent` over `fireEvent` for user interaction simulation
- Use `vi.fn()` for mocking, `vi.mock()` for module mocking
- Always include `await waitFor(() => ...)` for async state updates
