# Auth Domain Changelog

## 2026-06-15 · MOVIE-MANAGEMENT-003
- New term: is_staff — exposed via custom djoser UserSerializer (`apps/common/serializers.py`)
- Changed: DJOSER SERIALIZERS config updated to use custom `user` and `current_user` serializers

## 2026-06-13 · LOGIN-001
- New: Sistema completo de autenticación JWT (registro, login, password reset)
- New: Login con username o email via UsernameOrEmailBackend
- New: AuthContext para gestión de estado en frontend
- New: ProtectedRoute para rutas privadas
- New: Auth pages full-screen con tema cinematográfico oscuro
- Spec: [LOGIN-001-user-authentication.md](specs/LOGIN-001-user-authentication.md)

