# Component Architecture — CineViewHos Frontend

## Component Rules

### Function Declarations Only

```typescript
// YES
function MyComponent() { ... }

// NO — never use arrow function components
const MyComponent = () => { ... };
```

### Default Exports

All pages and components use `export default`:
```typescript
export default LoginPage;
```

### Props Typing

Simple: inline on destructured parameter.
```typescript
function MovieCard({ movie }: { movie: MovieList }) { ... }
function ProtectedRoute({ children }: { children: React.ReactNode }) { ... }
```

Complex: separate interface.
```typescript
interface UserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}
function UserDrawer({ isOpen, onClose }: UserDrawerProps) { ... }
```

### File Naming

| Type | Convention |
|------|-----------|
| Page component | `PascalCase.tsx` |
| Shared component | `PascalCase.tsx` |
| Layout component | `PascalCase.tsx` |

### Component Types

| Type | Location | Purpose |
|------|----------|---------|
| Pages | `src/pages/` | Route-level components |
| Layouts | `src/components/` | Shell components (MainLayout, AdminLayout) |
| Guards | `src/components/` | Route guards (ProtectedRoute, AdminProtectedRoute) |
| Shell | `src/components/` | Navbar, MainSidebar, UserDrawer |
| Display | `src/components/` | MovieCard, etc. |

## Layout Strategy

- `MainLayout` renders `<Navbar />` + `<MainSidebar />` + `<Outlet />` + `<Suspense>`
- Navbar/sidebar hidden on auth pages (`/login`, `/register`, `/password/reset/*`) and admin pages (`/admin/*`)
- `AdminLayout` renders `<MainSidebar />` + `<Outlet />`
- Sidebar uses `location.pathname` for active item highlighting

## CRUD Pattern

Every admin entity follows the same pattern:
- `Admin{Entity}List.tsx` — table with search, delete confirmation modal, pagination
- `Admin{Entity}Form.tsx` — create/edit form (determined by `useParams<{ id: string }>()`)
