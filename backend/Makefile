.PHONY: help start test lint migrate migrations shell

help:
	@echo "Available commands:"
	@echo "  start         Start dev server"
	@echo "  test          Run tests"
	@echo "  lint          Run linter"
	@echo "  migrate       Apply migrations"
	@echo "  migrations    Create migrations"
	@echo "  shell         Django shell"

start:
	python manage.py runserver 0.0.0.0:8000

test:
	pytest

lint:
	flake8 apps/ config/ tests/

migrate:
	python manage.py migrate

migrations:
	python manage.py makemigrations

shell:
	python manage.py shell
