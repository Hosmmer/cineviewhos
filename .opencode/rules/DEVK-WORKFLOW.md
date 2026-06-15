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

## Reglas

- **NUNCA** hacer wiki (paso 9) antes de QA aprobado (paso 8)
- **NUNCA** hacer push (paso 10) antes de documentar (paso 9)
- **NUNCA** escribir código antes de spec + plan aprobados
- **SIEMPRE** crear los 3 archivos del ticket juntos
- **SIEMPRE** pedir aprobación del usuario entre fases
