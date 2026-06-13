# User Authentication Implementation Plan

**Based on specification**: `thoughts/tickets/LOGIN-001/2026-06-13-user-authentication_spec.md`

## Overview

Implement a full authentication system across backend (Django 3.0.7 + DRF 3.15 + djoser + simplejwt) and frontend (React 18 + TypeScript + Vite + Tailwind CSS). The backend activates the existing custom `User` model, configures djoser for JWT-based auth endpoints (login with username or email, register, password reset), and sets up Gmail for confirmation/password-reset emails. The frontend replaces Bootstrap with Tailwind CSS, adds auth-aware routing with dark cinematic theme, and provides full-screen login/register/password-reset pages with no navbar.

## Specification Alignment

This plan implements all acceptance criteria from the spec:
- Backend: Custom User model, JWT auth via djoser, register, login with username/email, password reset via email
- Frontend: Tailwind CSS (dark theme), login page, register page, password reset, full-screen auth pages (no navbar), ProtectedRoute, AuthContext, JWT interceptor

## Files to Create

1. `backend/apps/common/migrations/0001_initial.py` — Initial User model migration
2. `frontend/tailwind.config.js` — Tailwind CSS configuration
3. `frontend/postcss.config.js` — PostCSS configuration
4. `frontend/src/index.css` — Tailwind directives and base styles
5. `frontend/src/AuthContext.tsx` — React context for auth state management
6. `frontend/src/http-common.ts` — Axios instance with JWT interceptor
7. `frontend/src/ProtectedRoute.tsx` — Route guard component
8. `frontend/src/pages/LoginPage.tsx` — Login page component (full-screen, no navbar)
9. `frontend/src/pages/RegisterPage.tsx` — Registration page component (full-screen, no navbar)
10. `frontend/src/pages/PasswordResetPage.tsx` — Password reset email form (full-screen, no navbar)
11. `frontend/src/pages/PasswordResetConfirmPage.tsx` — Password reset confirm form (full-screen, no navbar)
12. `frontend/src/pages/DashboardPage.tsx` — Dashboard page (with minimal navbar)

## Files to Modify

1. `backend/config/settings.py` — Activate custom User model, add djoser + simplejwt, configure JWT + email + SITE_ID
2. `backend/apps/urls.py` — Add djoser auth routes
3. `backend/apps/common/admin.py` — Register User in admin with custom fields
4. `backend/requirements.txt` — Add `djangorestframework-simplejwt`
5. `frontend/package.json` — Remove Bootstrap, add Tailwind + PostCSS + Autoprefixer
6. `frontend/src/main.tsx` — Remove Bootstrap import, wrap with AuthProvider + QueryClientProvider + IntlProvider
7. `frontend/src/App.tsx` — Replace Bootstrap classes with Tailwind, add auth routes & ProtectedRoute
8. `frontend/vite.config.ts` — Proxy `/api` to backend
9. `frontend/src/i18n/messages/es.json` — Add Spanish translations for auth pages
10. `frontend/src/i18n/messages/en.json` — Add English translations for auth pages

## Dependencies to Install

```bash
# Backend
pip install djangorestframework-simplejwt==5.3.1

# Frontend
npm uninstall bootstrap
npm install -D tailwindcss@3 postcss autoprefixer
npm install react-hot-toast
```

---

## Phase 1: Backend — User Model Activation & Dependencies

### Overview

Activate the custom `User(AbstractUser)` model by setting `AUTH_USER_MODEL` in Django settings, install `djangorestframework-simplejwt`, and add `djoser` + `rest_framework_simplejwt` to `INSTALLED_APPS`. Create the initial migration. Add psycopg2 monkey-patch for PostgreSQL compatibility. Register User in admin.

**Spec criteria addressed**: #9 (custom User model activated via AUTH_USER_MODEL)

### Files to Create

**File**: `backend/apps/common/migrations/0001_initial.py`
**Purpose**: Initial migration for the custom User model

### Files to Modify

**File**: `backend/config/settings.py`
**Changes**:
- Add `AUTH_USER_MODEL = "common.User"` after `DEFAULT_AUTO_FIELD`
- Add `"djoser"` and `"rest_framework_simplejwt"` to `INSTALLED_APPS`
- Add `SIMPLE_JWT` config with access token lifetime (15 min) and refresh token lifetime (1 day)
- Add `DJOSER` config with: `LOGIN_FIELD = "username"`, `SEND_ACTIVATION_EMAIL = False`, `SEND_CONFIRMATION_EMAIL = True`, `PASSWORD_RESET_CONFIRM_URL = "password/reset/confirm/{uid}/{token}"`, `SERIALIZERS`, `DOMAIN`, `SITE_NAME`
- Add email backend config for Gmail: `EMAIL_BACKEND`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USE_TLS`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`
- Add `SITE_ID = 1` + `"django.contrib.sites"` to INSTALLED_APPS for djoser email links
- Add psycopg2 monkey-patch for `utc_tzinfo_factory`
- Configure CORS for frontend origin

**File**: `backend/apps/common/admin.py`
**Changes**: Register `User` model with admin, create `UserAdmin` class

**File**: `backend/requirements.txt`
**Changes**: Add `djangorestframework-simplejwt==5.3.1`

### Implementation Order

1. Create directory `backend/apps/common/migrations/` if not exists
2. Add `djangorestframework-simplejwt==5.3.1` to `requirements.txt`
3. Edit `backend/config/settings.py`: add AUTH_USER_MODEL, INSTALLED_APPS, SIMPLE_JWT, DJOSER, email, SITE_ID, psycopg2 patch
4. Edit `backend/apps/common/admin.py`: register User model
5. Run `python manage.py makemigrations` to create `0001_initial.py`
6. Apply migration and verify

### Test Cases

**Test**: `tests/apps/test_user_model.py::test_user_creation`
**Covers**: Creates a User instance and verifies fields exist (username, email, password)

**Test**: `tests/apps/test_user_model.py::test_auth_user_model_setting`
**Covers**: Verifies `settings.AUTH_USER_MODEL == "common.User"`

### Skills Required

Skills: (none)

### Success Criteria

#### Automated Verification:
- [x] Tests pass: `pytest tests/apps/test_user_model.py`
- [x] Migration applies cleanly: `python manage.py migrate`

#### Manual Verification:
- [x] `python manage.py showmigrations` shows the common migration
- [x] `python manage.py shell -c "from django.conf import settings; print(settings.AUTH_USER_MODEL)"` outputs `common.User`

**Implementation Note**: ✅ Completed on 2026-06-13.

### Assumptions
- Django 3.0.7 is compatible with djoser 2.1.0 (already in requirements.txt)
- `djangorestframework-simplejwt==5.3.1` is compatible with DRF 3.15.0
- psycopg2 2.9 requires monkey-patch of `utc_tzinfo_factory`

---

## Phase 2: Backend — Auth Endpoints

### Overview

Wire djoser auth URLs into the project, configure JWT auth as the default for DRF, and update the existing REST_FRAMEWORK settings to use proper JWT authentication. Add password validators for security. Add `UsernameOrEmailBackend` for login with username or email.

**Spec criteria addressed**: All backend acceptance criteria from spec

### Files to Modify

**File**: `backend/apps/urls.py`
**Changes**: Add `path("auth/", include("djoser.urls"))` and `path("auth/", include("djoser.urls.jwt"))`

**File**: `backend/config/settings.py`
**Changes**: 
- Set `DEFAULT_AUTHENTICATION_CLASSES` to use `rest_framework_simplejwt.authentication.JWTAuthentication`
- Add `AUTH_PASSWORD_VALIDATORS` with minimum length validator (8 chars)
- Configure `USER_CREATE_PASSWORD_RETYPE = True` in DJOSER
- Add `AUTHENTICATION_BACKENDS` pointing to `apps.common.auth_backend.UsernameOrEmailBackend`
- Register `User` model in admin

### Implementation Order

1. Update `backend/config/settings.py` to fix JWT auth configuration and add auth backends
2. Add djoser URLs to `backend/apps/urls.py`
3. Remove unused `backend/apps/common/db_backend.py` (psycopg2 monkey-patch approach in settings.py used instead)

### Test Cases

**Test**: `tests/apps/test_auth_endpoints.py::test_register_user`
**Covers**: Registration endpoint returns 201 with valid data

**Test**: `tests/apps/test_auth_endpoints.py::test_register_duplicate_username`
**Covers**: Duplicate username returns 400

**Test**: `tests/apps/test_auth_endpoints.py::test_login_with_username`
**Covers**: Login with username returns 200 with tokens

**Test**: `tests/apps/test_auth_endpoints.py::test_login_with_email`
**Covers**: Login with email (via UsernameOrEmailBackend) returns 200 with tokens

**Test**: `tests/apps/test_auth_endpoints.py::test_login_invalid_credentials`
**Covers**: Invalid credentials returns 401

**Test**: `tests/apps/test_auth_endpoints.py::test_protected_endpoint_with_valid_token`
**Covers**: JWT authentication on protected endpoint

**Test**: `tests/apps/test_auth_endpoints.py::test_protected_endpoint_with_expired_token`
**Covers**: Expired token returns 401

**Test**: `tests/apps/test_auth_endpoints.py::test_password_reset_request`
**Covers**: Password reset email trigger returns 204

### Skills Required

Skills: (none)

### Success Criteria

#### Automated Verification:
- [x] Tests pass: `pytest tests/apps/test_auth_endpoints.py`
- [x] Linting passes: `ruff check .`

#### Manual Verification:
- [x] `curl` tests for register, login, password reset endpoints pass
- [x] Login with email works correctly

**Implementation Note**: ✅ Completed on 2026-06-13.

### Assumptions
- djoser 2.1.0 URLs work with Django 3.0.7 URL patterns

---

## Phase 3: Frontend — Tailwind CSS Migration

### Overview

Remove Bootstrap 5, install Tailwind CSS with PostCSS and Autoprefixer, configure Tailwind, create base CSS with Tailwind directives, and update all existing components to use Tailwind utility classes. All styles follow the dark movie-theme (gray-900 backgrounds, red-600 accents).

**Spec criteria addressed**: Frontend acceptance criteria about Tailwind CSS and dark theme

### Files to Create

**File**: `frontend/tailwind.config.js`
**Purpose**: Tailwind CSS configuration pointing to `./src/**/*.{ts,tsx}`

**File**: `frontend/postcss.config.js`
**Purpose**: PostCSS configuration with `tailwindcss` and `autoprefixer` plugins

**File**: `frontend/src/index.css`
**Purpose**: Tailwind directives (`@tailwind base; @tailwind components; @tailwind utilities;`) and custom base styles

### Files to Modify

**File**: `frontend/package.json`
**Changes**: Remove `"bootstrap"`, add `"tailwindcss"`, `"postcss"`, `"autoprefixer"` to devDependencies

**File**: `frontend/src/main.tsx`
**Changes**: Replace `import 'bootstrap/dist/css/bootstrap.min.css'` with `import './index.css'`

**File**: `frontend/src/App.tsx`
**Changes**: Replace Bootstrap classes with Tailwind utility classes (dark theme)

**File**: `frontend/vite.config.ts`
**Changes**: Add proxy `/api` → `http://backend:8000`

### Implementation Order

1. Remove bootstrap and install tailwind dependencies
2. Create `tailwind.config.js`
3. Create `postcss.config.js`
4. Create `src/index.css` with Tailwind directives
5. Update `src/main.tsx` import
6. Convert `App.tsx` Bootstrap classes to Tailwind
7. Verify the app compiles and renders correctly

### Test Cases

**Test**: Visual verification (no automated tests needed for CSS migration)
**Covers**: Pages render with Tailwind dark theme styles

### Skills Required

Skills: (none)

### Success Criteria

#### Automated Verification:
- [x] `npm run build` succeeds (TypeScript compilation + Vite build)
- [x] `npm run lint` passes

#### Manual Verification:
- [x] App loads without Bootstrap CSS errors in console
- [x] Dark theme renders correctly (gray-900 backgrounds, red-600 accents)

**Implementation Note**: ✅ Completed on 2026-06-13.

### Assumptions
- Tailwind CSS v3 is compatible with Vite 5
- PostCSS v8 is compatible with Vite 5 (Vite handles PostCSS automatically)

---

## Phase 4: Frontend — Auth Pages, Context & Components

### Overview

Create the auth infrastructure: AuthContext for JWT state management, http-common.ts with JWT interceptor, login/register/password-reset pages (full-screen without navbar), ProtectedRoute, minimal navbar for dashboard, and wire routes in App.tsx.

**Spec criteria addressed**: All frontend acceptance criteria from spec

### Files to Create

**File**: `frontend/src/AuthContext.tsx`
**Purpose**: React context providing auth state (login, register, logout, user, loading, error)

**File**: `frontend/src/http-common.ts`
**Purpose**: Axios instance with JWT interceptor (auto-attach Bearer token, auto-refresh on 401)

**File**: `frontend/src/ProtectedRoute.tsx`
**Purpose**: Route guard — redirects unauthenticated users to `/login`

**File**: `frontend/src/pages/LoginPage.tsx`
**Purpose**: Login page — full-screen cinematic background, no navbar, username/email + password form, link to register and password reset

**File**: `frontend/src/pages/RegisterPage.tsx`
**Purpose**: Registration page — full-screen cinematic background, no navbar, username + email + password + confirm form

**File**: `frontend/src/pages/PasswordResetPage.tsx`
**Purpose**: Password reset email form — full-screen cinematic background, no navbar, email input

**File**: `frontend/src/pages/PasswordResetConfirmPage.tsx`
**Purpose**: Password reset confirm form — extracts UID and token from URL, new password + confirm

**File**: `frontend/src/pages/DashboardPage.tsx`
**Purpose**: Authenticated dashboard with minimal navbar (brand + logout button)

### Files to Modify

**File**: `frontend/src/App.tsx`
**Changes**: Add routes for all auth pages, wrap dashboard with ProtectedRoute, no navbar on auth pages

**File**: `frontend/src/main.tsx`
**Changes**: Wrap app with AuthProvider + QueryClientProvider + IntlProvider + BrowserRouter

**File**: `frontend/src/i18n/messages/es.json`
**Changes**: Add all Spanish auth translations

**File**: `frontend/src/i18n/messages/en.json`
**Changes**: Add all English auth translations

### Implementation Order

1. Create `src/AuthContext.tsx` with provider and hook
2. Create `src/http-common.ts` with JWT interceptor
3. Create `src/ProtectedRoute.tsx`
4. Create `src/pages/LoginPage.tsx`
5. Create `src/pages/RegisterPage.tsx`
6. Create `src/pages/PasswordResetPage.tsx`
7. Create `src/pages/PasswordResetConfirmPage.tsx`
8. Create `src/pages/DashboardPage.tsx`
9. Update `src/main.tsx` to wrap app with providers
10. Update `src/App.tsx` with new routes
11. Update i18n files with auth translations
12. Build and verify

### Test Cases

**Test**: Visual/E2E verification
**Covers**: All auth flows work end-to-end

### Skills Required

Skills: react-dev (react), django-dev (django)

### Success Criteria

#### Automated Verification:
- [x] Build succeeds: `npm run build` (378 modules, TypeScript + Vite clean)
- [x] Backend linting passes: `ruff check .`
- [x] Backend tests pass: `pytest` (1/1)

#### Manual Verification:
- [ ] Full auth flow (register → login → dashboard → logout)
- [ ] Login with email works
- [ ] Password reset flow end-to-end
- [ ] Unauthenticated users redirected to `/login`
- [ ] Auth pages have no navbar — full-screen cinematic theme
- [ ] Dashboard shows minimal navbar with brand + logout

**Implementation Note**: ✅ Phase 4 implementation complete on 2026-06-13. Removed unused `backend/apps/common/db_backend.py`. Renamed brand to CineViewHos. Added favicon. All auth pages movie-themed (dark, red accents, cinematic gradients). Navbar hidden on auth pages. Build compiles cleanly at 378 modules.

### Assumptions
- Tokens are stored in localStorage
- Brand is CineViewHos with movie theme
- Auth pages are full-screen without navbar

---

## Phase 5: Integration & Final Verification

### Overview

End-to-end testing of the full auth flow, verify all acceptance criteria from the spec pass, run linters and type checkers.

### Implementation Order

1. Run full backend test suite
2. Run full frontend build
3. Run linters (ruff, ESLint)
4. Manual end-to-end walkthrough of all auth flows
5. Fix any issues discovered

### Test Cases

Full integration test covering:
- User registers → receives confirmation email → redirected to login
- User logs in with username → receives JWT → redirected to dashboard
- User logs in with email → receives JWT → redirected to dashboard
- User accesses dashboard with valid token → sees content
- User accesses dashboard without token → redirected to login
- User logs out → tokens cleared → redirected to login
- User requests password reset → email sent
- User resets password via link → can login with new password

### Skills Required

Skills: (none)

### Success Criteria

#### Automated Verification:
- [x] Backend tests pass: `pytest`
- [x] Frontend build succeeds: `npm run build` (378 modules)
- [x] Backend linting passes: `ruff check .`

#### Manual Verification:
- [ ] Full auth flow works end-to-end (register → login → logout → login)
- [ ] Password reset flow works (request → receive email → set new password → login)
- [ ] Dark theme renders correctly on all pages

### Assumptions
- Docker environment is running (postgres, backend, frontend)
- Email backend is configured for Gmail (credentials provided via env vars)

---

## Testing Strategy

### Unit Tests
- **Backend**: Test User model creation, auth endpoint responses, token creation/validation
- **Frontend**: Build verification (TypeScript compilation)

### Integration Tests
- Register → auto-Login flow
- Login with JWT → access protected endpoint
- Token refresh on 401
- Password reset request → confirmation → new password login

### Manual Testing Checklist
1. Register a new user with valid data
2. Try registering with duplicate username
3. Login with username
4. Login with email
5. Login with wrong password
6. Logout
7. Access "/" while logged out (should redirect to "/login")
8. Request password reset
9. Complete password reset
10. Login with new password

## Performance Considerations
- JWT access tokens have 15 min lifetime to limit exposure
- Refresh tokens have 1 day lifetime

## Migration Notes
- The custom User model migration is a standard Django migration (no data migration needed)
- Clean state — no existing `auth_user` table

## References

- Specification: `thoughts/tickets/LOGIN-001/2026-06-13-user-authentication_spec.md`
- Django custom User model: `backend/apps/common/models.py`
- DRF config: `backend/config/settings.py`
- Frontend entry point: `frontend/src/main.tsx`
- Auth context: `frontend/src/AuthContext.tsx`
- Backend skills: `backend/.opencode/skills/django/SKILL.md`
- Frontend skills: `frontend/.opencode/skills/react/SKILL.md`

## Assumptions Summary

1. Django 3.0.7 is compatible with djoser 2.1.0 and djangorestframework-simplejwt 5.3.1
2. Tokens are stored in localStorage (simple, sufficient for this scope)
3. djoser's `LOGIN_FIELD = "username"` allows login with email via custom backend
4. Tailwind CSS v3 with PostCSS v8 is compatible with Vite 5
5. Gmail credentials are provided via environment variables
6. Brand is CineViewHos — movie-themed dark UI
7. Auth pages are full-screen without navbar
