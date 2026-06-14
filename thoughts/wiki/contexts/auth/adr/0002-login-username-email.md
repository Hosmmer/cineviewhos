# ADR-002: Login con username o email

## Status
Aceptado (2026-06-13)

## Context
Los usuarios modernos esperan poder loguearse con email (más fácil de recordar que username). Django por defecto solo soporta username.

Opciones:
1. Login solo con username (Django default)
2. Login solo con email
3. Login con username o email

## Decision
Elegimos **login con username o email** via `UsernameOrEmailBackend` porque:
- Flexibilidad para el usuario (elige su método preferido)
- Compatible con usuarios legacy que usan username
- Mejor UX sin sacrificar seguridad

## Consequences
**Positivas:**
- Mejor experiencia de usuario
- No fuerza migración de usuarios existentes
- djoser soporta esto nativamente con `LOGIN_FIELD = "username"`

**Negativas:**
- Backend custom de autenticación (más código)
- Validación más compleja (verificar si input es email o username)

## Implementation
```python
# backend/apps/common/auth_backends.py
class UsernameOrEmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        # Intenta login con username
        # Si falla, intenta con email
        # Retorna user o None
```
