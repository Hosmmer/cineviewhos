# Workflow — CineViewHos

Project-specific conventions. The full development pipeline is in the global `devk` skill. Config values are in `.opencode/AGENTS.md`.

## Kanban

Columns: backlog → todo → **in-progress** → **qa** → **ready-to-deploy** → done

AI handles: `in-progress`, `qa`, `ready-to-deploy`. Update via:
```
PATCH {XENODOCIA_URL}/api/tickets/{TICKET_ID}/
{"status": "<new_status>"}
Authorization: Token {XENODOCIA_API_TOKEN}
```
Always GET current first and print `old → new`.

## Ticket Files

Create three files via content API (`PUT {XENODOCIA_URL}/api/content/`):
```
tickets/YYYY-MM/{TICKET_ID}/YYYY-MM-DD-name_spec.md
tickets/YYYY-MM/{TICKET_ID}/YYYY-MM-DD-name_plan.md
tickets/YYYY-MM/{TICKET_ID}/description.md
```
`scan_thoughts()` scans for `_spec.md` and `_plan.md` suffixes. Always use date prefix.

## Git & PR

- Branch: `feat/{TICKET-ID-slug}` or `fix/{TICKET-ID-slug}`
- PR: `{TICKET-ID}: description`
- Commit: `type(scope): description [{TICKET-ID}]`

## Pre-Push Checks

```
frontend/  → npx tsc --noEmit && npm run build
backend/   → python manage.py check && ruff check && pytest
```
Also verify migrations are committed (`git ls-files`).

CI (GitHub Actions): 3 jobs — lint, frontend, backend. All must be green.
CI fails → read log → fix (no workarounds) → push → wait → merge.

## Domain Documentation (MANDATORY)

Every domain touched by a ticket MUST have documentation in the wiki BEFORE the ticket moves to `ready-to-deploy`:

```
wiki/contexts/{domain}/
├── CONTEXT.md      # Glossary: terms, entities, API, business rules
└── CHANGELOG.md    # What changed and when
```

### New Domain Checklist

When a ticket introduces a NEW domain:
1. Create `wiki/contexts/{domain}/CONTEXT.md` with full glossary
2. Create `wiki/contexts/{domain}/CHANGELOG.md`
3. Add domain to `wiki/contexts/CONTEXT-MAP.md` with dependencies
4. Create domain label via `POST /api/labels/`
5. Reference the new domain in `wiki/contexts/cineviewhos/CONTEXT.md`

Existing domains: auth, movies, reservations, modules.

## Never

- Write code without `in-progress` status
- Request QA without `qa` status
- Push without QA approved + docs complete
- Merge without CI green
- Skip or self-execute QA
