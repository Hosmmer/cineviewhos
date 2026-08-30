# Architecture & Project Structure — CineViewHos Frontend

## Principles

1. **Separate logic from UX**: business logic and state live in `hooks/`, data access
   in `api/`, presentation in `components/`. Pages only compose them.
2. **Feature-based organization**: group by domain (`features/{domain}/`), not by file
   type.
3. **Unidirectional imports**: `routes`/`layouts` → `features` → (`components`,
   `services`, `store`, `utils`). Leaf folders never import features.
4. **No barrel files**: import directly (Vite tree-shaking).
5. **Domain documentation FIRST**: before creating a new feature, ensure
   `wiki/contexts/{domain}/CONTEXT.md` exists with glossary. Check
   `wiki/contexts/CONTEXT-MAP.md` for existing domains.

## Project Structure

```
frontend/src/
├── main.tsx                  # Entry: providers (QueryClient, Intl, Router, Auth)
├── App.tsx                   # Thin root: renders <AppRoutes/>
├── index.css                 # Tailwind directives only
├── assets/                   # Global static assets (images, fonts, icons) — reserved
├── components/               # Reusable cross-feature UI (no data fetching)
│   ├── icons/
│   │   ├── lucide-icons.generated.ts
│   │   └── ModuleIcon.tsx        # Dynamic module icon (name -> lucide)
│   └── ui/
│       └── ConfirmModal.tsx      # Shared delete/confirm dialog
├── layouts/                  # Base shells (depend on features for auth/modules)
│   ├── MainLayout.tsx
│   ├── AdminLayout.tsx
│   ├── Navbar.tsx
│   ├── MainSidebar.tsx
│   └── UserDrawer.tsx
├── routes/                   # React Router config + route guards
│   ├── index.tsx             # Composes all groups under MainLayout
│   ├── public.tsx            # No auth
│   ├── protected.tsx         # Auth required
│   ├── admin.tsx             # Staff only
│   ├── ProtectedRoute.tsx
│   └── AdminProtectedRoute.tsx
├── services/                 # Global services (no React, no domain)
│   ├── django.ts             # Single axios instance + interceptors
│   └── types.ts              # Shared API types (PaginatedResponse<T>)
├── store/                    # Global app state (Context)
│   └── AuthContext.tsx       # user, tokens, login/logout/register
├── utils/                    # Pure functions (no React, no side effects)
│   └── format.ts             # formatPrice, formatTime, formatDate, formatDateTime
├── i18n/                     # Translations (es.json, en.json)
├── test/
│   └── test-utils.tsx        # customRender with all providers
└── features/                 # App modules grouped by functionality
    ├── auth/
    │   ├── api/auth.api.ts       # loginUser, registerUser, resetPassword*, ...
    │   ├── types/auth.types.ts
    │   └── pages/{Login,Register,PasswordReset,PasswordResetConfirm}Page.tsx
    ├── movies/
    │   ├── api/                  # one file per entity
    │   │   ├── movies.api.ts         # Movie CRUD
    │   │   ├── genres.api.ts
    │   │   ├── directors.api.ts
    │   │   ├── authors.api.ts
    │   │   ├── actors.api.ts
    │   │   └── display-config.api.ts
    │   ├── types/                # one file per entity
    │   │   ├── movie.types.ts        # Movie, MovieList, MovieFormData, MovieDisplayConfig
    │   │   ├── genre.types.ts
    │   │   ├── director.types.ts
    │   │   ├── author.types.ts
    │   │   └── actor.types.ts
    │   ├── utils/movies.utils.ts # buildFormatTabs, buildFranjaTabs, groupBy*
    │   ├── components/{MovieCard,MovieShowtimes}.tsx
    │   ├── pages/{MovieHomePage,MovieDetailPage}.tsx
    │   └── admin/                # AdminMovieList/Form, AdminGenre*, AdminDirector*, ...
    ├── bookings/
    │   ├── api/                  # one file per entity
    │   │   ├── funciones.api.ts      # funciones + seats
    │   │   ├── reservas.api.ts
    │   │   ├── salas.api.ts
    │   │   ├── cines.api.ts
    │   │   ├── formats.api.ts
    │   │   └── franjas.api.ts
    │   ├── types/                # one file per entity
    │   │   ├── funcion.types.ts
    │   │   ├── seat.types.ts
    │   │   ├── reserva.types.ts
    │   │   ├── sala.types.ts
    │   │   ├── cine.types.ts
    │   │   ├── format.types.ts
    │   │   └── franja.types.ts
    │   ├── components/SeatGrid.tsx
    │   ├── pages/{SeatSelectionPage,MyReservationsPage}.tsx
    │   └── admin/                # AdminSala*, AdminCine*, AdminFuncion*, AdminReservation*, ...
    ├── profile/
    │   └── pages/{ProfilePage,ChangePasswordPage}.tsx
    └── system/
        ├── api/modules.api.ts    # modules + roles
        ├── api/users.api.ts      # fetchUsers, updateUserRoles (admin)
        ├── types/system.types.ts # Module, Role, UserAdmin
        ├── hooks/useModules.ts
        └── pages/{AdminDashboard,AdminModuleList,AdminRoleList,AdminUserList}.tsx
```

## Feature Module Anatomy (the layer contract)

Every feature folder separates concerns. Use the minimal set it needs:

```
features/{domain}/
├── api/         # HTTP calls for the model (data access: no React, no state)
├── components/  # presentational views (props in, events out, no data fetching)
├── hooks/       # business logic + state (controllers: React Query, form logic)
├── pages/       # route-level composition (thin: hooks + components)
├── types/       # TS types / interfaces for this module
└── utils/       # domain-specific pure functions (optional)
```

Rules:

- **One file per entity** in `api/` and `types/` (e.g. `genres.api.ts` + `genre.types.ts`),
  never a single mega-file for the whole feature. Split when a feature has 2+ entities.
- `api/` functions take plain args and return parsed data (e.g. `.results`), never JSX.
- `hooks/` own `useQuery`/`useMutation` and expose `{ data, isLoading, error, actions }`.
- `components/` receive props and emit events; they must not import `api/` or call hooks
  that fetch data.
- `pages/` are the only files a route imports; keep them thin.

## Import Architecture (Unidirectional)

```
┌──────────────────────────────────────────────────┐
│  App shell (layouts/, routes/, App.tsx)          │  ← Composes features
├──────────────────────────────────────────────────┤
│  Features (features/{domain}/)                   │  ← Domain logic + UI
├──────────────────────────────────────────────────┤
│  Leaf (components/, services/, store/, utils/)   │  ← Reusable, no feature imports
└──────────────────────────────────────────────────┘

app shell  can import → features AND leaf
features   can import → leaf (and, rarely, another feature when inherent)
leaf       cannot import → features or app shell
```

Cross-feature imports are allowed only when inherent and documented, e.g.:
- `features/bookings/admin/AdminFuncionForm` imports `features/movies/api/movies.api`
  (showtime form needs the movie dropdown).
- `features/movies/` imports `features/bookings/types/bookings.types` (`Funcion`).
- `features/profile/` reuses `features/auth/api/auth.api` (updateProfile, changePassword).

## Component Organization Rules

### Reusable → `components/` (top level)

```typescript
// ✅ components/ui/ConfirmModal.tsx — used by every admin list page
function ConfirmModal({ open, title, message, onConfirm, onCancel }: ConfirmModalProps) {}

// ✅ components/icons/ModuleIcon.tsx — sidebar + module admin
function ModuleIcon({ name, className }: ModuleIconProps) {}
```

### Domain-specific → `features/{domain}/components/`

```typescript
// ✅ features/bookings/components/SeatGrid.tsx — only used by bookings
function SeatGrid({ seats, rows, cols, selected, onToggle }: SeatGridProps) {}
```

### Layout → `layouts/`

```typescript
// ✅ layouts/MainSidebar.tsx — module-driven navigation (imports system feature hook)
```

### Route guard → `routes/`

```typescript
// ✅ routes/ProtectedRoute.tsx, routes/AdminProtectedRoute.tsx
```

### When to split a large component

```typescript
// FROM: 400+ line page doing everything
function MovieDetailPage() {
  // fetch + 8 helper functions + franja/format tabs + cine cards + seat buttons
}

// TO: composition — helpers in utils/, showtimes UI in its own component
function MovieDetailPage() {
  // fetch movie + funciones, render header/sidebar/description
  return <MovieShowtimes movieId={id} funciones={funciones} />;
}
```

Split component when:
- Exceeds ~200 lines of JSX.
- Has 4+ distinct sections (visual or logical).
- Has complex internal state that could be its own hook.

## State Management Architecture

```
Global State (Context):
  store/AuthContext — user, tokens, login/logout/register
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
- Redux / Zustand / MobX (React Query already handles server state).
- Additional Context providers (AuthContext is sufficient).
- Global form state libraries.

## Routing Architecture

Routes are split by auth level into `routes/`. Each file owns its lazy imports and
`Route` elements. Guards (`ProtectedRoute`, `AdminProtectedRoute`) also live in
`routes/`.

```
src/routes/
├── index.tsx            # Composes all groups under MainLayout
├── public.tsx           # No auth: /login, /register, /password/*
├── protected.tsx        # Auth: /, /movies/:id, /profile, etc.
├── admin.tsx            # Staff: /admin/** CRUD
├── ProtectedRoute.tsx
└── AdminProtectedRoute.tsx
```

### Adding a new page

1. Create the page under `features/{domain}/pages/NewPage.tsx`.
2. Add `const NewPage = lazy(() => import("@/features/{domain}/pages/NewPage"));` to the
   correct route file (public/protected/admin).
3. Add the `<Route>` (wrap in `ProtectedRoute` if needed).
4. NEVER touch `App.tsx` or `routes/index.tsx`.

## Scaling Rules (Hard)

| If... | Then... |
|-------|---------|
| New domain appears | Create `features/{domain}/` with `api/hooks/components/pages/types` |
| Domain has 3+ pages | Extract into its own feature folder |
| Service file has 5+ API functions | Split by entity (one `.api.ts` per entity) |
| Feature has 2+ entities | Split `api/` and `types/` per entity |
| Component > 200 lines | Split into sub-components |
| Hook > 50 lines | Consider splitting or extracting logic |
| 3+ features use same component | Move to top-level `components/` |
| Page has business logic (calculations, side effects) | Extract to hook or util |
| Same query in 2+ components | Extract to custom hook |
| Form shared between create + edit | Extract to shared form component |
| Types used by 2+ domains | Move to `services/types.ts` (or a shared leaf) |
| Types used by 1 domain only | Keep in the feature's `types/` |
| Pure helper used by 2+ places | Move to `utils/` |
