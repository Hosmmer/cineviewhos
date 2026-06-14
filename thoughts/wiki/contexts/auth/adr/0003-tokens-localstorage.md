# ADR-003: Tokens JWT en localStorage

## Status
Aceptado (2026-06-13)

## Context
JWT tokens necesitan almacenarse en el cliente. Opciones:
1. **localStorage**: Simple, persistente entre sesiones
2. **sessionStorage**: Se borra al cerrar tab
3. **HttpOnly cookies**: Más seguro pero requiere CSRF
4. **Memory only**: Se pierde al refrescar página

## Decision
Elegimos **localStorage** porque:
- Simple de implementar (sin configuración de cookies)
- Persiste entre sesiones del navegador
- Compatible con API REST pura (sin CSRF)
- Suficiente para el nivel de seguridad actual

## Consequences
**Positivas:**
- Implementación trivial (`localStorage.setItem('access_token', token)`)
- No requiere configuración de cookies (SameSite, Secure, HttpOnly)
- Funciona con CORS sin problemas

**Negativas:**
- Vulnerable a XSS (si attacker inyecta JS, puede leer tokens)
- No hay protección automática contra CSRF (pero usamos Bearer tokens, no cookies)

## Security Considerations
- **XSS mitigation**: Sanitizar inputs, no usar `dangerouslySetInnerHTML`
- **Future**: Si la app crece, migrar a HttpOnly cookies con CSRF tokens
- **Token lifetime**: Access token 15 min (limita ventana de ataque)

## Alternatives Considered
- **HttpOnly cookies**: Más seguro pero requiere CSRF setup y configuración de cookies cross-origin
- **sessionStorage**: No persiste entre tabs/sesiones
- **Memory only**: Mala UX (usuario pierde sesión al refrescar)
