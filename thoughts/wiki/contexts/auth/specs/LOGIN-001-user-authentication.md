# Feature: User Authentication (Login, Registration, Password Reset)

## 1. Feature Summary

Add a complete user authentication system to the CineViewHos application, enabling users to register, log in (with username or email), and reset their passwords via email. The backend uses JWT tokens (via djoser + simplejwt) for API authentication, and the frontend provides dark-theme cinematic pages for login, registration, and password reset flows.

The brand is **CineViewHos** — a movie-themed application with dark gray backgrounds (`gray-900`) and red accent colors (`red-600`). Auth pages are full-screen with no navbar or header.

This feature solves the lack of any authentication mechanism in the current application, which only has a health-check endpoint and a public home page. It establishes the foundation for all future authenticated features.

## 2. Data Model

### Modified: `apps.common.models.User`
- **Location**: `backend/apps/common/models.py`
- **Change**: Activate the existing `User(AbstractUser)` model by setting `AUTH_USER_MODEL = "common.User"` in Django settings
- **Fields** (from `AbstractUser`):
  - `id` (BigAutoField, PK)
  - `username` (unique, required)
  - `email` (unique via djoser, required)
  - `password` (hashed)
  - `first_name` (optional)
  - `last_name` (optional)
  - `is_active` (default: True)
  - `date_joined` (auto)
- **Relationships**: None (standalone model)
- **Migrations**: Initial migration for the User model was created

### No new models are created

## 3. Business Rules and Constraints

### Registration
- Username must be unique and at least 3 characters
- Email must be valid format and unique
- Password must be at least 8 characters
- Password and password confirmation must match
- Registration is open to anyone (no invitation required)
- Confirmation email is sent on successful registration via Gmail SMTP

### Login
- Users can authenticate with **either username or email** (via `UsernameOrEmailBackend`)
- Successful login returns JWT access and refresh tokens
- Failed login returns a clear error message
- Access token lifetime: 15 minutes
- Refresh token lifetime: 1 day

### Password Reset
- User can request a password reset by providing their registered email
- System sends an email with a password reset link containing a UID and token
- User can set a new password using the reset link
- The reset link expires after the default djoser timeout
- Frontend `/password/reset/confirm/:uid/:token` extracts UID and token from URL

### Authorization
- Unauthenticated users can access: login, register, password reset endpoints
- All other API endpoints require a valid JWT token (`Authorization: Bearer <token>`)
- Frontend routes for login, register, and password reset are public (no navbar)
- Frontend dashboard requires authentication (via `ProtectedRoute`)
- Auth pages are full-screen without navbar/header/footer

### Security
- Passwords are hashed using Django's default hasher (PBKDF2)
- JWT access tokens have 15 min expiration
- JWT refresh tokens have 1 day expiration
- CORS is configured to allow the frontend origin
- CSRF protection is handled via token-based auth (no CSRF cookies needed for API)
- Backend: Django 3.0.7 + DRF 3.15, psycopg2 2.9 (with monkey-patch)

### UI/UX
- Dark theme throughout: `bg-gray-900` backgrounds, `red-600` accents, white/gray text
- Auth pages: full-screen gradient `from-gray-900 via-gray-800 to-gray-900`
- No navbar or header on login/register/password-reset pages
- Notifications via `react-hot-toast` (success/error toasts)
- Brand "CineViewHos" shown prominently on auth pages

## 4. Acceptance Criteria

### Backend

- [x] Given an unauthenticated request to `POST /api/auth/users/` with valid username, email, and password, the system creates a new user and returns 201
- [x] Given an unauthenticated request to `POST /api/auth/users/` with an existing username, the system returns 400 with a duplicate error
- [x] Given an unauthenticated request to `POST /api/auth/jwt/create/` with valid credentials (username or email), the system returns 200 with access and refresh tokens
- [x] Given an unauthenticated request to `POST /api/auth/jwt/create/` with invalid credentials, the system returns 401
- [x] Given an authenticated request to a protected endpoint with a valid JWT token, the system returns the expected response
- [x] Given an authenticated request with an expired JWT token, the system returns 401
- [x] Given an unauthenticated request to `POST /api/auth/users/reset_password/` with a registered email, the system sends a password reset email and returns 204
- [x] Given a valid password reset UID and token, the system allows setting a new password
- [x] The custom `User` model (`apps.common.models.User`) is properly activated via `AUTH_USER_MODEL`

### Frontend

- [x] Visiting `/login` shows a login form with username/email field, password field, and a login button — full-screen cinematic theme, no navbar
- [x] Visiting `/register` shows a registration form with username, email, password, confirm password, and a register button — full-screen cinematic theme, no navbar
- [x] Submitting the login form with valid credentials redirects to the dashboard
- [x] Submitting the login form with invalid credentials shows an error message
- [x] Submitting the registration form with valid data shows a success toast and redirects to login page
- [x] Submitting the registration form with invalid data shows inline field validation errors
- [x] Auth pages have no navbar/header — they are full-screen cinematic pages
- [x] Dashboard has a minimal navbar with "CineViewHos" brand and "Cerrar sesión" button
- [x] Clicking "Cerrar sesión" clears the JWT tokens and redirects to the login page
- [x] Unauthenticated users trying to access `/` are redirected to `/login`
- [x] The password reset flow includes a "¿Olvidaste tu contraseña?" link on the login page
- [x] Clicking the reset link shows a form to enter email, and a success message is shown after submission
- [x] Password reset email link routes to `/password/reset/confirm/:uid/:token`
- [x] All pages use Tailwind CSS with dark theme (movie aesthetic)

## 5. Out of Scope

- Social login (Google, GitHub, etc.)
- Email verification on registration (djoser supports it but is deferred — `SEND_ACTIVATION_EMAIL = False`)
- Two-factor authentication
- User profile management (edit profile, change password while logged in)
- Admin user management interface (beyond Django's built-in admin)
- Rate limiting on auth endpoints (deferred to a future security pass)
- Refresh token rotation
- Session persistence across browser restarts

## 6. Open Questions

- All resolved during implementation. Gmail SMTP configured via env vars, access token lifetime set to 15 min, brand is CineViewHos with movie-theme dark UI.
