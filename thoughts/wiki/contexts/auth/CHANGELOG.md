# Auth Domain Changelog

## 2026-06-15 · USER-DRAWER-004
- New: UserDrawer — panel lateral deslizable con menú jerárquico (Mi Cuenta, Catálogo, Ventas), avatar header y focus trap
- New: Avatar field en modelo User + migración + RelativeImageField en UserSerializer para URLs relativas
- New: ProfilePage — edición de perfil con upload de avatar (FormData PATCH)
- New: ChangePasswordPage — cambio de contraseña (POST set_password)
- New: updateUser() en AuthContext — actualiza estado + localStorage tras editar perfil
- New: lucide-react como librería de íconos profesionales
- Changed: Navbar — avatar button reemplaza username + Admin + Logout; dispara UserDrawer
- Changed: UserSerializer — usa RelativeImageField en lugar de ImageField por defecto para evitar URLs absolutas con hostname interno de Docker
- Changed: Navbar y UserDrawer leen avatar desde localStorage como fallback además del contexto React
- New terms: Avatar, UserDrawer, updateUser, RelativeImageField (auth)
- Spec: [USER-DRAWER-004-user-drawer-sidebar_spec.md](../../tickets/USER-DRAWER-004/2026-06-15-user-drawer-sidebar_spec.md)

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
