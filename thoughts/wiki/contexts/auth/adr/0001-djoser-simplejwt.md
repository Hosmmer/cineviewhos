# ADR-001: Uso de djoser + simplejwt para autenticación

## Status
Aceptado (2026-06-13)

## Context
Necesitábamos implementar autenticación JWT para la API REST. Las opciones eran:
1. Implementar auth custom desde cero (views, serializers, token generation)
2. Usar djoser (endpoints pre-construidos para DRF)
3. Usar solo simplejwt (tokens sin endpoints de usuario)

## Decision
Elegimos **djoser + simplejwt** porque:
- Provee endpoints REST completos (registro, login, password reset, perfil)
- Reduce código boilerplate y superficie de bugs
- Es el estándar de facto para DRF + JWT
- Permite customización via `DJOSER` settings y `SERIALIZERS`

## Consequences
**Positivas:**
- Implementación rápida (1-2 días vs 1 semana custom)
- Endpoints probados y mantenidos por la comunidad
- Soporte nativo para password reset via email

**Negativas:**
- Dependencia de librería externa (djoser 2.1.0)
- Menos control sobre el flujo de autenticación
- Requiere entender la API de djoser para customizaciones

## Alternatives Considered
- **Auth custom**: Más control pero más código, tests y mantenimiento
- **Solo simplejwt**: Tendríamos que implementar endpoints de usuario manualmente
- **django-allauth**: Overkill para API REST, orientado a web tradicional
