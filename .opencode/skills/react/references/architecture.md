# Architecture & Project Structure — CineViewHos Frontend

## Principles (from bulletproof-react + CineViewHos patterns)

1. **Feature-based organization**: group by domain, not by file type
2. **Unidirectional imports**: shared → features → app (never reverse)
3. **No cross-feature imports**: features should not import from each other
4. **No barrel files**: import directly (Vite tree-shaking)
5. **Flat when small, grouped when large**: start flat, extract features when they grow
6. **Domain documentation FIRST**: before creating a new feature, ensure `wiki/contexts/{domain}/CONTEXT.md` exists with glossary. Check `wiki/contexts/CONTEXT-MAP.md` for existing domains.

## Project Structure — Current

```
frontend/src/
├── main.tsx              # Root: StrictMode + providers
├── App.tsx               # Routes (lazy-loaded pages)
├── index.css             # Tailwind directives only
├── api/
│   └── django.ts         # Single axios instance + interceptors
├── types/                # TypeScript interfaces (domain-based)
│   ├── auth.ts
│   ├── movies.ts
│   ├── modules.ts
│   └── reservations.ts
├── services/             # API call functions (domain-based)
│   ├── authService.ts
│   ├── movieService.ts
│   ├── moduleService.ts
│   └── reservationService.ts
├── hooks/                # Custom hooks (React Query wrappers)
│   └── useModules.ts
├── contexts/             # React Context providers
│   └── AuthContext.tsx
├── components/           # Shared UI components
│   ├── MainLayout.tsx
│   ├── AdminLayout.tsx
│   ├── ProtectedRoute.tsx
│   ├── AdminProtectedRoute.tsx
│   ├── Navbar.tsx
│   ├── MainSidebar.tsx
│   ├── UserDrawer.tsx
│   └── MovieCard.tsx
├── pages/                # Route-level components
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ProfilePage.tsx
│   ├── MovieHomePage.tsx
│   ├── MovieDetailPage.tsx
│   ├── SeatSelectionPage.tsx
│   ├── MyReservationsPage.tsx
│   └── admin/
│       ├── AdminDashboard.tsx
│       ├── AdminMovieList.tsx / AdminMovieForm.tsx
│       ├── AdminGenreList.tsx / AdminGenreForm.tsx
│       ├── AdminDirectorList.tsx / AdminDirectorForm.tsx
│       ├── AdminAuthorList.tsx / AdminAuthorForm.tsx
│       ├── AdminActorList.tsx / AdminActorForm.tsx
│       ├── AdminSalaList.tsx / AdminSalaForm.tsx
│       ├── AdminFuncionList.tsx / AdminFuncionForm.tsx
│       └── AdminReservationList.tsx
├── i18n/                 # Translations (es.json, en.json)
└── test/
    └── test-utils.tsx    # customRender with all providers
```

## When to Extract a Feature Folder

Transform flat files into feature folders when:

```
# FROM (flat):
pages/MovieHomePage.tsx
pages/MovieDetailPage.tsx
pages/SeatSelectionPage.tsx
services/movieService.ts
helpers/movieHelpers.ts
hooks/useMovies.ts

# TO (feature folder):
features/movies/
├── api/
│   └── movieRequests.ts     # API calls specific to movies
├── components/
│   ├── MovieGrid.tsx        # Movie listing grid
│   ├── MovieCard.tsx        # Already in shared/components/, consider moving
│   ├── MovieFilters.tsx
│   └── SeatGrid.tsx
├── hooks/
│   └── useMovies.ts         # React Query hooks for movies
├── types/
│   └── movie.types.ts       # Local types (if not shared)
├── pages/
│   ├── MovieHomePage.tsx
│   ├── MovieDetailPage.tsx
│   └── SeatSelectionPage.tsx
└── utils/
    └── movieFormatters.ts   # formatDuration(), formatRating(), etc.
```

Extract to feature folder when:
- A domain has **3+ pages**
- A domain has **3+ custom hooks**
- A domain has **5+ API functions** in a single service file
- A domain has **domain-specific components** used only within that feature

Keep in shared/ when:
- Used by **2+ features** (e.g., MovieCard used in home page AND reservations)
- Infrastructure (Navbar, Sidebar, Layout)
- Auth/general utilities

## Import Architecture (Unidirectional)

```
┌────────────────────────────────────────┐
│  App (pages/, layouts/)                │  ← Composes features
├────────────────────────────────────────┤
│  Features (features/{domain}/)         │  ← Domain logic, can import shared
├────────────────────────────────────────┤
│  Shared (components/, hooks/, types/)  │  ← Reusable, no feature imports
├────────────────────────────────────────┤
│  Core (api/, contexts/, i18n/)        │  ← Infrastructure, no feature imports
└────────────────────────────────────────┘

APP can import → FEATURES and SHARED
FEATURES can import → SHARED
FEATURES cannot import → other FEATURES
SHARED cannot import → FEATURES or APP
```

## Component Organization Rules

### When a component stays in shared/components/

```typescript
// ✅ SHARED — used by multiple pages/features
interface MovieCardProps { movie: MovieList; }
export function MovieCard({ movie }: MovieCardProps) { ... }

// ✅ SHARED — infrastructure
export function MainLayout() { ... }
export function ProtectedRoute({ children }: { children: ReactNode }) { ... }
```

### When a component belongs in a feature

```typescript
// ✅ FEATURE — only used within reservations feature
// features/reservations/components/SeatGrid.tsx
function SeatGrid({ seats, onSelect }: SeatGridProps) { ... }
```

### When to split a large component

```typescript
// FROM: 200+ line component doing everything
function AdminMovieForm() {
  // form logic + poster upload + cast selection + validation + submit
  return <div>...200 lines...</div>;
}

// TO: composition
function AdminMovieForm() {
  return (
    <MovieFormLayout>
      <MovieBasicFields formik={formik} />
      <PosterUpload formik={formik} fileInputRef={fileRef} />
      <MovieCastSection formik={formik} />
      <MovieFormActions isPending={isPending} isEdit={isEdit} onCancel={handleCancel} />
    </MovieFormLayout>
  );
}
```

Split component when:
- Exceeds **200 lines** of JSX
- Has **4+ distinct sections** (visual or logical)
- Has **complex internal state** that could be its own hook

## State Management Architecture

```
Global State (Context):
  AuthContext — user, tokens, login/logout/register
    ↓
Server State (React Query):
  useQuery / useMutation — all API data
    ↓
Form State (Formik):
  useFormik — per-form local state
    ↓
UI State (useState):
  menus, drawers, modals, file previews
    ↓
Persistent (localStorage):
  auth_tokens, auth_user, sidebar_collapsed
```

### DO NOT add:
- Redux / Zustand / MobX (React Query already handles server state)
- Additional Context providers (AuthContext is sufficient)
- Global form state libraries

## Routing Architecture

Routes are split by **auth level** into separate modules. Each file owns its lazy imports and Route elements.

```
src/
├── routes/
│   ├── index.tsx            # Composes all route groups under MainLayout
│   ├── public.tsx           # No auth: /login, /register, /password/*
│   ├── protected.tsx        # Auth required: /, /movies/:id, /profile, etc.
│   └── admin.tsx            # Staff only: /admin/** CRUD
└── App.tsx                  # Thin: import AppRoutes, render it
```

### Route File Pattern

Each route file exports a **JSX fragment** (not a component), because React Router v6 `<Routes>` requires direct `<Route>` or `<React.Fragment>` children — custom components are not allowed.

```typescript
// src/routes/admin.tsx
import { lazy } from "react";
import { Route } from "react-router-dom";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import AdminLayout from "@/components/AdminLayout";

const AdminMovieList = lazy(() => import("@/pages/admin/AdminMovieList"));
const AdminMovieForm = lazy(() => import("@/pages/admin/AdminMovieForm"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));

const adminRoutes = (
  <Route
    path="/admin"
    element={
      <AdminProtectedRoute>
        <AdminLayout />
      </AdminProtectedRoute>
    }
  >
    <Route index element={<AdminDashboard />} />
    <Route path="movies" element={<AdminMovieList />} />
    <Route path="movies/create" element={<AdminMovieForm />} />
    <Route path="movies/:id/edit" element={<AdminMovieForm />} />
  </Route>
);

export default adminRoutes;
```

For flat routes (public, protected), use a fragment:

```typescript
// src/routes/public.tsx
const publicRoutes = (
  <>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
  </>
);

export default publicRoutes;
```

### Composition (`src/routes/index.tsx`)

```typescript
import { Routes, Route } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import publicRoutes from "@/routes/public";
import protectedRoutes from "@/routes/protected";
import adminRoutes from "@/routes/admin";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {publicRoutes}
        {protectedRoutes}
        {adminRoutes}
      </Route>
    </Routes>
  );
}

export default AppRoutes;
```

### App.tsx (3 lines)

```typescript
import AppRoutes from "@/routes";

function App() {
  return <AppRoutes />;
}

export default App;
```

### Route Module Rules

- **Public**: no auth required, exports `<>...</>` fragment with individual `<Route>` elements
- **Protected**: wraps each page in `<ProtectedRoute>`, exports `<>...</>` fragment
- **Admin**: wraps parent path in `<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>`, exports a single `<Route>` (not fragment, because it's a structural route)
- **Exports JSX constants**, NOT components — React Router v6 `<Routes>` only accepts `<Route>` or `<>` children
- **Lazy loading**: `React.lazy()` per page, co-located in the route file
- **Suspense**: handled by `MainLayout` once (wraps `<Outlet />`)
- **When adding a page**: import + add `<Route>` to the correct route file — never modify `App.tsx` or `index.tsx`
- **When a route file exceeds ~80 lines**: consider splitting by sub-domain (e.g., `admin/movies.routes.tsx`)

## Scaling Rules (Hard)

| If... | Then... |
|-------|---------|
| Domain has 3+ pages | Extract to `features/{domain}/` |
| Service file has 5+ API functions | Split by domain |
| Component > 200 lines | Split into sub-components |
| Hook > 50 lines | Consider splitting or extracting logic |
| 3+ features use same component | Move to `shared/components/` |
| Single component used in admin + public | Keep in `shared/` OR create variant |
| Page has business logic (calculations, side effects) | Extract to hook or util |
| Same query in 2+ components | Extract to custom hook |
| Form shared between create + edit | Extract to shared form component |
| Types used by 2+ domains | Move to `types/` root (shared) |
| Types used by 1 domain only | Keep in feature or co-locate |
