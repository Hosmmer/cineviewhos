# User Authentication Implementation Plan

## Overview

Implement complete authentication system: login (username or email), registration, and password reset with JWT tokens (djoser + simplejwt) on the backend and a dark-theme Tailwind CSS frontend.

## Brand & Theme

- **Brand name**: CineViewHos
- **UI**: Dark theme — `gray-900` backgrounds, `red-600` accents, cinematic look
- **Auth pages**: Full-screen gradient background, no navbar/header/footer

## Current State (Completed)

### Backend (Django 3.0.7 + DRF 3.15)
- [x] Custom `User(AbstractUser)` model at `apps/common/models.py` — activated via `AUTH_USER_MODEL = "common.User"`
- [x] djoser 2.1.0 + simplejwt 5.3.1 for JWT auth at `/api/auth/`
- [x] Login with username OR email via `UsernameOrEmailBackend`
- [x] Registration with email confirmation sent via Gmail SMTP
- [x] Password reset flow via email (UID + token link)
- [x] psycopg2 monkey-patch for PostgreSQL compatibility
- [x] Django Admin con jazzmin para administrar usuarios
- [x] All backend tests passing (1/1)

### Frontend (React 18 + TypeScript + Vite + Tailwind CSS)
- [x] Auth pages: Login (`/login`), Register (`/register`), Password Reset (`/password/reset`), Confirm Reset (`/password/reset/confirm/:uid/:token`)
- [x] AuthContext for JWT state management (login, register, logout, user state)
- [x] ProtectedRoute — wraps authenticated pages, redirects `/login`
- [x] JWT interceptor in `http-common.ts` — auto-attaches Bearer token, refresh on 401
- [x] Dark theme — cinema aesthetic, red accents, full-screen auth pages
- [x] Navbar hidden on auth pages
- [x] Brand renamed to CineViewHos everywhere
- [x] Build compiles cleanly (378 modules)
- [x] `react-hot-toast` for notifications

## What's NOT Done (Out of Scope)
- Social login
- Email verification on registration (deferred)
- Two-factor authentication
- User profile management
- Rate limiting

## References
- Spec: `thoughts/tickets/LOGIN-001/2026-06-13-user-authentication_spec.md`
- Detailed plan: `thoughts/tickets/LOGIN-001/2026-06-13-user-authentication_plan.md`
