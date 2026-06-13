# Frontend Custom — React 18 + TypeScript + Vite

## Stack
- **React 18** + **TypeScript 5** + **Vite 5**
- **UI**: Tailwind CSS (clases utilitarias), dark theme, diseño cinematográfico
- **Data fetching**: `@tanstack/react-query` v5 (`useQuery` / `useMutation`)
- **HTTP**: `axios` con interceptor JWT. Auth header via interceptor en `src/http-common.ts`
- **Routing**: `react-router-dom` v6. Routes via `lazy()` + `Suspense`
- **Auth**: Context (`AuthContext`) + ProtectedRoute. Tokens en localStorage
- **i18n**: `react-intl`. Translation keys en `src/i18n/messages/`
- **Forms**: `useState` para inputs simples (sin formik)
- **Testing**: `vitest` + React Testing Library
- **Linting**: ESLint + ts-standard + WSL rules on Windows
- **Notifications**: `react-hot-toast`

## Brand
- **Name**: CineViewHos
- **Theme**: Cine oscuro — fondo `gray-900`, rojo como acento `red-600`, texto claro
- **Auth pages**: Full-screen cinematic background, sin navbar/header ni footer

## Dev commands
```bash
npm run dev       # Dev server (hot reload, proxy /api → backend:8000)
npm run build     # tsc --noEmit + Vite build
npm run test      # Vitest
npx tsc --noEmit  # Type check
```

## Project structure
```
src/
  main.tsx             # Entry: AuthProvider + QueryClientProvider + IntlProvider + Router
  App.tsx              # Routes definition (lazy pages + ProtectedRoute)
  http-common.ts       # Axios instance with JWT interceptor (Authorization: Bearer)
  AuthContext.tsx       # Auth context & provider (user, tokens, login/logout/register)
  ProtectedRoute.tsx   # Wraps routes that require auth — redirects to /login
  pages/
    LoginPage.tsx       # Login form (username/email, password) — cinematic theme
    RegisterPage.tsx    # Register form — cinematic theme
    DashboardPage.tsx   # Autenticated dashboard (placeholder)
    PasswordResetPage.tsx    # Solicitar reset
    PasswordResetConfirmPage.tsx  # Confirmar reset (via email link)
  components/
  hooks/
  i18n/
    messages/
      es.json
      en.json
  test/
    test-utils.tsx      # customRender wrapper
```

## Backend API
- Dev proxy (Vite): `/api` → `http://backend:8000`
- Producción: nginx proxea `/api/` a `backend:8000`
- Puerto dev: 3000

## Auth flow
- Register → POST `/api/auth/users/` → toast success → redirect to login
- Login → POST `/api/auth/jwt/create/` → store tokens → fetch user → redirect to dashboard
- Token refresh → interceptor refreshes automáticamente en 401
- Logout → clear tokens → redirect to login
- Password reset → email link → PasswordResetConfirmPage → extract {uid}/{token} from URL

## UI Patterns (Tailwind)
- Cards: `bg-gray-800 rounded-lg p-6`
- Buttons: `bg-red-600 hover:bg-red-700 text-white rounded-lg px-6 py-3`
- Inputs: `w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400`
- Links: `text-red-500 hover:text-red-400`
- Alerts: `bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg`
- Loading spinner: `animate-spin rounded-full h-8 w-8 border-b-2 border-red-600`
- Auth page wrapper: `min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900`

## Skills
- `react-dev` — Desarrollo React completo (`.opencode/skills/react/SKILL.md`)
