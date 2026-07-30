---
description: Detener todos los contenedores Docker del proyecto
---

Ejecuta `make down` desde el root del proyecto para detener todos los contenedores.
Usa `make -C <project_root> down`.

Reglas de seguridad:
- NUNCA ejecutes `docker compose down -v`
- El target `down` del Makefile YA ES SEGURO (no usa -v)
