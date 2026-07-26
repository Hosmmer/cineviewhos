.PHONY: up down stop restart logs status

up:
	@echo "==> Iniciando CineViewHos + XenodocIA..."
	docker compose -f docker-compose.yml up -d
	docker compose -f xenodocIA/docker-compose.yml up -d
	@echo "==> Todo iniciado: localhost:3000 (front) | localhost:8000 (API) | localhost:5175 (XenodocIA)"

down:
	@echo "==> Deteniendo todo (datos intactos)..."
	docker compose -f docker-compose.yml down
	docker compose -f xenodocIA/docker-compose.yml down

stop:
	@echo "==> Pausando contenedores (datos intactos)..."
	docker compose -f docker-compose.yml stop
	docker compose -f xenodocIA/docker-compose.yml stop

restart:
	@echo "==> Reiniciando..."
	docker compose -f docker-compose.yml restart
	docker compose -f xenodocIA/docker-compose.yml restart

logs:
	docker compose -f docker-compose.yml logs -f

status:
	@echo "=== CineViewHos ==="
	@docker ps --filter "name=cineviewhos" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
	@echo ""
	@echo "=== XenodocIA ==="
	@docker ps --filter "name=xenodocia" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
