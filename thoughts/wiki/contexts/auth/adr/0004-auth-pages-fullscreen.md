# ADR-004: Auth pages full-screen sin navbar

## Status
Aceptado (2026-06-13)

## Context
Las páginas de autenticación (login, registro, password reset) tienen un diseño diferente al resto de la app. Opciones:
1. Mantener navbar/header en auth pages (consistencia)
2. Full-screen sin navbar (inmersivo)
3. Layout minimalista con solo logo

## Decision
Elegimos **full-screen sin navbar** porque:
- Enfoque visual en la acción principal (login/register)
- Estética cinematográfica (tema oscuro, gradiente, sin distracciones)
- Mejor UX en mobile (más espacio para el formulario)
- Usuario no autenticado no necesita navegación

## Consequences
**Positivas:**
- Diseño más limpio y enfocado
- Mejor conversión (menos distracciones)
- Consistente con apps modernas (Netflix, Spotify login)

**Negativas:**
- Inconsistencia visual con el resto de la app
- Usuario no puede navegar a otras páginas desde login

## Implementation
```tsx
// Auth pages no renderizan <Navbar />
<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
  <div className="flex items-center justify-center min-h-screen">
    {/* Formulario centrado */}
  </div>
</div>
```

## Alternatives Considered
- **Navbar en auth pages**: Más consistente pero distrae del objetivo
- **Solo logo**: Menos inmersivo, no aprovecha el tema cinematográfico
