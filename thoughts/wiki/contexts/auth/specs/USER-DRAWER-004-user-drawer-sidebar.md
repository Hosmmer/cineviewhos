# User Drawer Sidebar Specification

## 1. Feature Summary

Replace the current inline user controls in `Navbar.tsx` (username text, Admin link, "Cerrar Sesion" button) with a professional slide-over drawer triggered by an avatar button. The drawer provides hierarchical navigation with expandable submenus, a user profile header, and a backdrop overlay.

This feature establishes a scalable navigation pattern for future e-commerce modules (orders, reports). It also introduces user profile editing with avatar upload and password change functionality.

**Key technical decision**: Avatar URLs use `RelativeImageField` (same as movie posters) to return relative URLs (`/media/avatars/xxx.jpg`) instead of absolute URLs with Docker internal hostnames (`http://backend:8000/...`), preventing `ERR_NAME_NOT_RESOLVED` errors in the browser.

## 2. Data Model / Entities Involved

### Modified — `apps.common.models.User` (backend)
- Added `avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)`
- Migration: `apps/common/migrations/0002_user_avatar.py`

### Modified — `apps.common.serializers.UserSerializer` (backend)
- Uses `RelativeImageField` for avatar (imported from `apps.movies.serializers`)
- Returns relative URLs for browser compatibility
- Fields: `("id", "email", "username", "first_name", "last_name", "is_staff", "avatar")`

### New Frontend Components
| Component | Path | Purpose |
|---|---|---|
| `UserDrawer` | `frontend/src/components/UserDrawer.tsx` | Slide-over drawer with submenus, avatar header, focus trap |
| `ProfilePage` | `frontend/src/pages/ProfilePage.tsx` | Edit profile (avatar, first_name, last_name) |
| `ChangePasswordPage` | `frontend/src/pages/ChangePasswordPage.tsx` | Change password form |

### Modified Frontend Files
| File | Changes |
|---|---|
| `Navbar.tsx` | Avatar button replaces auth controls; opens UserDrawer |
| `App.tsx` | Routes for `/profile`, `/change-password`; added to authRoutes |
| `authService.ts` | `updateProfile()` (PATCH FormData), `changePassword()` (POST) |
| `AuthContext.tsx` | `updateUser()` to refresh state after profile edit |
| `auth.ts` | `avatar` field in User, `updateUser` in AuthContextType |

### New Dependency
- `lucide-react` — professional icon library for drawer menu items

## 3. Business Rules and Constraints

### Drawer Behavior
- Trigger: Avatar button in header (right side), only when authenticated
- Open: Slides in from right with 300ms ease-out
- Close: X button, backdrop click, or Escape key
- Width: 360px desktop, 85vw mobile
- Overlay: `bg-black/50` backdrop with fade-in
- Body scroll lock while open
- Focus trap: Tab cycles within drawer only
- z-index: 40

### Submenu Accordion
- One group expanded at a time
- Chevron rotates on toggle (200ms transition)
- All collapsed by default on open

### Menu Structure
```
Mi Cuenta (accordion)
  Perfil -> /profile
  Cambiar Contrasena -> /change-password
  Cerrar Sesion -> logout action
Catalogo (accordion)
  Mis Peliculas -> /admin/movies
  Generos -> /admin/genres
Ventas (accordion)
  Pedidos (disabled, "Proximamente")
  Reportes (disabled, "Proximamente")
```

### Avatar Display
- Navbar + UserDrawer read avatar from context AND fallback to localStorage (`getAvatarFromStorage()`)
- This ensures avatar shows even when context state propagation fails during SPA navigation
- Avatar URL is relative (`/media/avatars/xxx.jpg`), proxied by Vite to backend

### Profile Page
- Fields: avatar (file upload with instant preview via blob URL), first_name, last_name, email (read-only), username (read-only)
- PATCH `/api/auth/users/me/` with multipart/form-data
- Max file size: 5 MB, image types only
- On success: update context via `updateUser()`, show green confirmation

### Change Password Page
- Fields: current_password, new_password, re_new_password
- POST `/api/auth/users/set_password/`
- Min 8 chars, must match confirmation
- On success: redirect to `/`

## 4. Acceptance Criteria

### Drawer
- [x] Avatar button in header opens drawer sliding from right
- [x] Backdrop click closes drawer
- [x] Escape key closes drawer
- [x] Body scroll locked when open
- [x] Focus trapped within open drawer
- [x] Drawer closes on route change
- [x] Mobile: 85vw width, fully usable

### Drawer Header
- [x] Shows user avatar image (or User icon fallback)
- [x] Shows display name (first_name + last_name or username)
- [x] Shows user email
- [x] Close button (X) in top-right

### Submenu
- [x] Three accordion groups collapsed by default
- [x] One group expanded at a time
- [x] Chevron rotates on expand/collapse
- [x] Navigation items close drawer after click
- [x] "Pedidos" and "Reportes" are disabled with "Proximamente" badge

### Profile
- [x] Form pre-filled with current user data
- [x] Avatar upload with instant blob preview
- [x] Upload succeeds with real image files
- [x] Context updated after save
- [x] Avatar visible in Navbar and UserDrawer after save
- [x] Avatar URL is relative (not Docker internal hostname)

### Change Password
- [x] All three fields required
- [x] Mismatched passwords show error
- [x] Min 8 chars enforced
- [x] Successful change redirects to `/`

### Backend
- [x] `avatar` ImageField in User model with migration
- [x] `RelativeImageField` used in serializer for relative URLs
- [x] PATCH and GET work correctly via API
- [x] Migration applies cleanly

### Visual
- [x] Uses existing Tailwind theme (gray-950/900/800, red-500/600)
- [x] lucide-react icons render correctly
- [x] Matches dark theme of Navbar and AdminSidebar

## 5. Out of Scope

- Movie ownership (per-user filtering) — separate ticket
- Orders and Reports — disabled placeholders
- Email/username editing — read-only in profile
- Search functionality — placeholder only
- Admin sidebar redesign — not modified
- Avatar cropping/resizing — basic upload only

## 6. Key Fixes During Implementation

1. **RelativeImageField for avatar**: DRF's default ImageField builds absolute URLs using request host. When frontend proxies `/api` to Docker's `backend:8000`, the host becomes `backend:8000` → URLs become `http://backend:8000/media/...` → browser can't resolve. Fixed by using `RelativeImageField` from movies app.

2. **localStorage fallback for avatar**: React context state updates may not propagate to unmounted components. Navbar and UserDrawer now read avatar from both context AND localStorage via `getAvatarFromStorage()` as fallback.

3. **Serializer file persistence**: Django dev server relies on model/serializer files being in sync with migrations. Ensured both `models.py` (with avatar field) and `serializers.py` (with RelativeImageField + avatar in fields) are correct.
