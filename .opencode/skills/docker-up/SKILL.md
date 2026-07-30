---
name: docker-up
description: Start, stop, and check Docker containers safely using only Makefile targets (never raw docker compose, NEVER `-v` flag). Use when user asks to start/stop docker, bring up containers, start the project, or runs /docker-up, /docker-down, /docker-status, /docker-restart.
---

# docker-up

Gestiona contenedores Docker del proyecto actual via Makefile.

## Comandos

| Comando | Accion |
|---------|--------|
| `/docker-up` | Iniciar todos los contenedores (`make up`) |
| `/docker-down` | Detener todos los contenedores (`make down`) |
| `/docker-status` | Ver estado de contenedores (`make status`) |
| `/docker-restart` | Reiniciar contenedores (`make restart`) |
| `/docker-logs` | Ver logs en vivo (`make logs`) |

## Seguridad (OBLIGATORIO)

**REGLAS INMUTABLES:**

1. **NUNCA ejecutar `docker compose down -v`** — el flag `-v` DESTRUYE TODOS los volumenes PostgreSQL (datos, tickets, usuarios, peliculas, TODO). Esto es una regla absoluta.
2. **Solo usar los targets del Makefile** — nunca ejecutar `docker compose` directamente. Los targets `up`, `down`, `stop`, `restart`, `logs`, `status` ya son seguros (no usan `-v`).
3. **Nunca ejecutar `docker system prune`**, `docker volume rm`, ni cualquier comando que elimine volumenes o contenedores.
4. **Si el Makefile no existe o no tiene el target, ABORTAR y avisar al usuario.** No improvisar comandos docker.

**Validacion antes de ejecutar:**

- Confirmar que `make <target>` existe en el Makefile (`grep` o `findstr`).
- Confirmar que el target NO contiene `down -v` ni `prune` ni `rm`.
- Si el usuario pide algo fuera de los 5 comandos definidos, responder: "Solo soporto: up, down, stop, restart, logs, status. Si necesitas otra cosa, ejecuta manualmente."

## Implementacion

Detectar el proyecto root via `git rev-parse --show-toplevel`. Si falla, usar el working directory actual.

Ejecutar unicamente el comando make correspondiente desde el proyecto root:

```bash
make -C <project_root> <target>
```

Validar que existe el Makefile y el target en el project root antes de ejecutar. Si no existe, mostrar error.

## Ejemplos

Usuario: `/docker-up`
→ Ejecuta `make -C C:\curso-opencode\cineviewhos up`
→ Muestra: "Contenedores iniciados: localhost:3000 (front) | localhost:8000 (API) | localhost:5175 (XenodocIA)"

Usuario: `/docker-status`
→ Ejecuta `make -C C:\curso-opencode\cineviewhos status`
→ Muestra la tabla de estado de contenedores
