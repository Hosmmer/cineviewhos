# User Drawer Sidebar Implementation Plan

**Based on specification**: `thoughts/tickets/USER-DRAWER-004/2026-06-15-user-drawer-sidebar_spec.md`

## Overview

Build a slide-over drawer triggered by an avatar button in Navbar, replacing inline auth controls. Add avatar support to the backend User model, create Profile and Change Password pages, and wire navigation through expandable accordion submenus. Install `lucide-react` for icons.

## Specification Alignment

- Replace inline user controls with avatar-triggered drawer
- Hierarchical accordion submenus: Mi Cuenta, Catalogo, Ventas
- User drawer header: avatar + display name + email
- Backend: add `avatar` ImageField to User model + migration + RelativeImageField serializer
- New pages: ProfilePage (edit avatar/name), ChangePasswordPage
- Responsive: 360px desktop / 85vw mobile, backdrop overlay, Escape to close

## Files to Create

1. `frontend/src/components/UserDrawer.tsx` — slide-over drawer with avatar header, accordion menus, focus trap, body scroll lock, localStorage avatar fallback
2. `frontend/src/pages/ProfilePage.tsx` — avatar upload with blob preview, name editing, PATCH FormData
3. `frontend/src/pages/ChangePasswordPage.tsx` — password form with match validation

## Files to Modify

1. `frontend/src/components/Navbar.tsx` — avatar button + UserDrawer, localStorage fallback for avatar
2. `frontend/src/App.tsx` — add routes `/profile`, `/change-password` to authRoutes
3. `frontend/src/services/authService.ts` — `updateProfile()` (PATCH FormData), `changePassword()` (POST)
4. `frontend/src/contexts/AuthContext.tsx` — `updateUser()` action with localStorage persistence
5. `frontend/src/types/auth.ts` — `avatar` field in User, `updateUser` in AuthContextType
6. `backend/apps/common/models.py` — add `avatar = ImageField(upload_to="avatars/", blank=True, null=True)`
7. `backend/apps/common/serializers.py` — use `RelativeImageField` for avatar, add to fields

## Dependencies

```bash
npm install lucide-react  # icon library
```

## Implementation Phases

### Phase 1: Backend — Avatar Field + Migration + Serializer

**Done:**
- Added `avatar` ImageField to `User(AbstractUser)` in `models.py`
- Ran `makemigrations common` + `migrate` → migration `0002_user_avatar.py`
- Added `avatar` to `UserSerializer` fields
- **Fix**: Switched to `RelativeImageField` to return relative URLs instead of Docker internal hostnames

**Files modified:**
- `backend/apps/common/models.py` — avatar field
- `backend/apps/common/serializers.py` — RelativeImageField + avatar in fields
- `backend/apps/common/migrations/0002_user_avatar.py` — auto-generated

**Verification:**
- Migration applied cleanly
- PATCH accepts multipart upload
- GET returns relative avatar URL (`/media/avatars/xxx.jpg`)

### Phase 2: Frontend — authService + AuthContext

**Done:**
- Added `avatar?: string` to User interface
- Added `updateUser: (user: User) => void` to AuthContextType
- Created `updateProfile(formData: FormData)` — PATCH `/auth/users/me/`
- Created `changePassword(current, new, re_new)` — POST `/auth/users/set_password/`
- Implemented `updateUser` in AuthContext (setUser + saveAuthData)

**Files modified:**
- `frontend/src/types/auth.ts`
- `frontend/src/services/authService.ts`
- `frontend/src/contexts/AuthContext.tsx`

### Phase 3: UserDrawer + Navbar

**Done:**
- Installed `lucide-react`
- Created `UserDrawer.tsx`:
  - Slide-over from right with backdrop overlay
  - Avatar header (avatar + display name + email)
  - 3 accordion groups with chevron rotation
  - Focus trap (Tab cycling)
  - Escape key to close
  - Body scroll lock
  - **localStorage avatar fallback** via `getAvatarFromStorage()`
- Modified `Navbar.tsx`:
  - Avatar button replaces username + Admin + Logout
  - Mobile menu also updated with avatar button
  - Drawer closes on route change (useEffect on pathname)
  - **localStorage avatar fallback** for avatar display

**Files created/modified:**
- `frontend/src/components/UserDrawer.tsx` — new
- `frontend/src/components/Navbar.tsx` — modified

### Phase 4: ProfilePage + ChangePasswordPage + Routes

**Done:**
- Created `ProfilePage.tsx`:
  - Formik + Yup validation
  - Avatar upload with instant blob URL preview
  - Camera overlay on hover
  - Editable first_name, last_name
  - Read-only email, username
  - Green success message
- Created `ChangePasswordPage.tsx`:
  - Formik + Yup (min 8 chars, match validation)
  - Three password fields
  - Success redirects to `/`
- Updated `App.tsx`:
  - Lazy imports for both pages
  - Routes wrapped in `ProtectedRoute`
  - Added to `authRoutes` (hide Navbar)

**Files created/modified:**
- `frontend/src/pages/ProfilePage.tsx` — new
- `frontend/src/pages/ChangePasswordPage.tsx` — new
- `frontend/src/App.tsx` — modified

### Phase 5: Bug Fixes During QA

**Issue 1 — Avatar not appearing in drawer:**
- Root cause: DRF's default ImageField builds absolute URLs using request host. Vite proxy forwards with `Host: backend:8000`, resulting in `http://backend:8000/media/avatars/xxx.jpg` which the browser can't resolve.
- Fix: Used `RelativeImageField` in UserSerializer (same as movie posters), which returns relative URLs `/media/avatars/xxx.jpg`.
- Also added localStorage fallback in Navbar and UserDrawer to ensure avatar reads the freshest data.

**Issue 2 — Serializer/model not picking up avatar:**
- Root cause: Edit tool write persistence issues caused serializer and model files to revert.
- Fix: Rewrote both files with Write tool and verified container sync.

**Verification:**
- TypeScript compiles clean (`npx tsc --noEmit`: 0 errors)
- Vite build succeeds
- Backend migration state clean
- API returns relative avatar URLs
- Avatar upload + display works end-to-end

## Testing Strategy

### Verified
- Avatar upload via ProfilePage → PATCH `/api/auth/users/me/` → saved to `media/avatars/`
- API returns relative URL `/media/avatars/xxx.jpg`
- Vite proxy resolves `/media/*` → `http://backend:8000`
- Avatar displays in Navbar avatar button and UserDrawer header
- Accordion expand/collapse with chevron animation
- Focus trap within open drawer
- Escape and backdrop click close drawer
- Body scroll lock/unlock
- Disabled items (Pedidos, Reportes) show "Proximamente" badge
- Mobile responsive (85vw drawer)
- Password change with validation

## Lessons Learned

1. **Always use `RelativeImageField` for file fields in DRF when the frontend accesses files through a proxy**: DRF's default ImageField builds absolute URLs using the request's Host header, which is the Docker internal hostname when proxied. This causes `ERR_NAME_NOT_RESOLVED` in the browser.

2. **React context propagation across mount/unmount cycles**: When a component is unmounted during a context update, the component that mounts later still receives the latest context value. However, adding a localStorage fallback provides an additional safety net.

3. **File persistence with volume mounts**: Docker volume mounts (`./backend:/app`) properly sync host files to the container. The Vite dev server with `usePolling: true` picks up changes.
