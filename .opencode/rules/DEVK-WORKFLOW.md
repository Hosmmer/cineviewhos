# DevK Workflow — NO SKIP

Seguir el pipeline de devk en orden estricto. **NUNCA saltarse pasos.**

## Pipeline Order

```
1. Research (references/research.md)
2. Grill-with-docs (skill: grill-with-docs)
3. Generate Spec (references/generate_spec.md)
4. Review & Edit Spec — USER aprueba
5. Generate Plan (references/generate_plan_from_spec.md)
6. Review & Approve Plan — USER aprueba
7. Execute Implementation (references/implement_plan.md)
8. QA (references/qa.md) — USER aprueba
9. Document (wiki) — promover ticket al wiki
10. Push & PR (/gcpush + /gpr)
```

## Ticket Folder — Siempre 3 archivos

Crear los TRES de una vez:
- `YYYY-MM-DD-name_spec.md`
- `YYYY-MM-DD-name_plan.md`
- `YYYY-MM-DD-name.md` (description)

## PR Naming — Usar siempre el Ticket ID

El branch y PR deben nombrarse con el ticket ID, NO con nombres genéricos:

```
Branch:  feat/<TICKET-ID-slug>   o   fix/<TICKET-ID-slug>
PR title: <TICKET-ID>: <feature description>
```

Ejemplos:
- `feat/USER-DRAWER-004` → PR: `USER-DRAWER-004: add user drawer sidebar`
- `fix/LOGIN-001` → PR: `LOGIN-001: fix login redirect loop`

**NUNCA** uses nombres como `fix/ci-lint-formatting` o `feat/some-random-name`. Siempre referencia el ticket.

## CI/GitHub Actions — Verificar ANTES de mergear PR

El CI tiene 3 jobs: lint, frontend, backend. Los 3 deben pasar en verde.

### Frontend CI
- TypeScript: `npx tsc --noEmit` → 0 errores
- Build: `npm run build` → exitoso

### Backend CI
- Migraciones: `python manage.py migrate` → sin errores
- Tests: `pytest` → todos pasan
- Ruff: `ruff check` → sin errores
- Django check: `python manage.py check` → sin warnings

### Checklist antes de pushear
- [ ] `npx tsc --noEmit` pasa (0 errores)
- [ ] `npm run build` exitoso
- [ ] Migraciones commiteadas (`git ls-files` las muestra)
- [ ] `black .` en backend
- [ ] `isort .` en backend
- [ ] `prettier --write` en frontend
- [ ] Branch nombrado con ticket ID: `feat/<TICKET>` o `fix/<TICKET>`
- [ ] PR title usa ticket ID: `<TICKET>: <description>`

### Si CI falla
1. Leer el log del job que falló
2. Corregir el error (NO hacer workaround)
3. Pushear fix
4. Esperar CI verde
5. Mergear

## Reglas

- **NUNCA** hacer wiki (paso 9) antes de QA aprobado (paso 8)
- **NUNCA** hacer push (paso 10) antes de documentar (paso 9)
- **NUNCA** escribir código antes de spec + plan aprobados
- **NUNCA** mergear PR sin CI verde (los 3 jobs)
- **SIEMPRE** crear los 3 archivos del ticket juntos
- **SIEMPRE** nombrar branch y PR con el ticket ID
- **SIEMPRE** pedir aprobación del usuario entre fases
