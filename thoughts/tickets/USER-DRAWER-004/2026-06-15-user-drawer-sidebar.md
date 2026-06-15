# User Drawer Sidebar

## Overview

Replace the inline auth controls in Navbar (username, Admin link, Logout button) with a professional slide-over drawer triggered by an avatar button. Add avatar field to User model, create Profile and Change Password pages, and build hierarchical accordion submenus for scalable e-commerce navigation.

## Current State (Completed)

### Backend
- [x] `avatar` ImageField added to `User(AbstractUser)` in `apps/common/models.py`
- [x] Migration `0002_user_avatar.py` created and applied
- [x] `UserSerializer` uses `RelativeImageField` for avatar (returns relative URLs `/media/avatars/xxx.jpg`)
- [x] `avatar` field in serializer fields: `("id", "email", "username", "first_name", "last_name", "is_staff", "avatar")`
- [x] PATCH `/api/auth/users/me/` accepts multipart/form-data with avatar file
- [x] GET `/api/auth/users/me/` returns relative avatar URL (no Docker internal hostname)

### Frontend — Components
- [x] `UserDrawer.tsx` — slide-over from right, avatar header, 3 accordion groups, focus trap, body scroll lock, localStorage avatar fallback
- [x] `ProfilePage.tsx` — avatar upload with blob URL instant preview, Formik+Yup, PATCH FormData
- [x] `ChangePasswordPage.tsx` — current/new/confirm password form, match validation, POST set_password

### Frontend — Modified
- [x] `Navbar.tsx` — avatar button replaces username+Admin+Logout; opens UserDrawer; localStorage fallback for avatar
- [x] `App.tsx` — lazy routes `/profile` and `/change-password` wrapped in ProtectedRoute; added to authRoutes
- [x] `authService.ts` — `updateProfile(FormData)` PATCH + `changePassword()` POST
- [x] `AuthContext.tsx` — `updateUser()` saves to state + localStorage
- [x] `types/auth.ts` — `avatar?: string` in User, `updateUser()` in AuthContextType

### Dependencies
- [x] `lucide-react` installed — professional icons (User, Film, Tag, Key, LogOut, ShoppingCart, BarChart3, ChevronDown, X)

### Build
- [x] TypeScript: 0 errors
- [x] Vite build: successful

### Bug Fixes
- [x] **Avatar URL ERR_NAME_NOT_RESOLVED**: DRF default ImageField builds absolute URL with request host (`http://backend:8000/...`). Fixed by using `RelativeImageField` from movies app.
- [x] **Avatar not appearing in drawer**: React context propagation across mount/unmount. Fixed by adding `getAvatarFromStorage()` localStorage fallback in Navbar and UserDrawer.
- [x] **Serializer/model file reversion**: Edit tool did not persist files in Docker. Rewritten with Write tool and verified.

## What's NOT Done (Out of Scope)

- Movie ownership (per-user filtering) — separate ticket
- Orders and Reports modules — disabled placeholders
- Email and username editing — read-only in profile
- Search functionality — placeholder only in Navbar
- Admin sidebar redesign — not modified
- Avatar cropping/resizing — basic upload only

## References

- Spec: `thoughts/tickets/USER-DRAWER-004/2026-06-15-user-drawer-sidebar_spec.md`
- Plan: `thoughts/tickets/USER-DRAWER-004/2026-06-15-user-drawer-sidebar_plan.md`
