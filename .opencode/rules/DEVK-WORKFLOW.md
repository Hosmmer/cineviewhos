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

## CI/GitHub Actions — Verificar ANTES de mergear PR

Antes de hacer merge del PR a main, verificar que CI pase:

1. **Migraciones**: Si se agregaron campos a modelos, verificar que el archivo de migración esté commiteado:
   ```
   git ls-files backend/apps/<app>/migrations/
   ```
2. **Pre-commit hooks**: El CI corre `pre-commit run --all-files`. Antes de pushear, ejecutar formateo en TODOS los archivos:
   - `black .` en backend (todos los .py)
   - `isort .` en backend (todos los .py)
   - `prettier --write 'src/**/*.{ts,tsx}'` en frontend
3. **TypeScript**: `npx tsc --noEmit` debe pasar (0 errores)
4. **Build**: `npm run build` (Vite) debe ser exitoso
5. **codespell**: Palabras en español en UI strings deben agregarse al ignore list en `.pre-commit-config.yaml`
6. **end-of-file**: Todos los archivos .md/.py/.tsx deben terminar con newline
7. **trailing-whitespace**: Sin espacios al final de líneas

**Checklist antes de `/gcpush`:**
- [ ] `npx tsc --noEmit` pasa (0 errores)
- [ ] `npm run build` exitoso
- [ ] Migraciones commiteadas si se modificaron modelos
- [ ] Black + isort + prettier aplicados a TODO el proyecto, no solo archivos modificados
- [ ] CI verde en el PR antes de mergear
