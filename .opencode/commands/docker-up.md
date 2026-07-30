---
description: Iniciar todos los contenedores Docker del proyecto
---

Ejecuta `make up` desde el root del proyecto para levantar todos los contenedores.
Usa `make -C <project_root> up`.

Reglas de seguridad:
- NUNCA ejecutes `docker compose down -v`
- Solo usa los targets del Makefile: up, down, stop, restart, logs, status
- No improvises comandos docker
