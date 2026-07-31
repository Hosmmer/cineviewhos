import "@testing-library/jest-dom/vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach } from "vitest";

afterEach(() => cleanup());

function customRender(
  ui: React.ReactElement,
  options?: {
    queryClient?: QueryClient;
    initialEntries?: string[];
    routePath?: string;
  },
) {
  const queryClient =
    options?.queryClient ||
    new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  const initialEntries = options?.initialEntries || ["/"];
  const routePath = options?.routePath || "*";
  return render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale="es" messages={{}}>
          <MemoryRouter initialEntries={initialEntries}>
            <Routes>
              <Route path={routePath} element={children} />
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
