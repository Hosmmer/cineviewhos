---
name: devk
description: DevK for CineViewHos — extends the global devk skill with project-specific tracker, naming, and workflow details. Use when user runs /devk or asks to start working on a development task.
---

# DevK — CineViewHos

The global `devk` skill (`~/.config/opencode/skills/devk/SKILL.md`) handles the full pipeline. Load it first. This file provides project-specific configuration that the global skill reads from AGENTS.md and applies.

## Project-Specific Details

### Tracker (XenodocIA)
- **Auth**: `Authorization: Token {XENODOCIA_API_TOKEN}`
- **Tickets**: `GET/POST/PATCH {XENODOCIA_URL}/api/tickets/`
- **Content**: `GET/PUT {XENODOCIA_URL}/api/content/`
- **Wiki paths**: S3-backed via content API — no local filesystem access

### Ticket Files
Files match `scan_thoughts()` expectations (date prefix + underscore suffix):
```
tickets/YYYY-MM/{TICKET_ID}/YYYY-MM-DD-name_spec.md
tickets/YYYY-MM/{TICKET_ID}/YYYY-MM-DD-name_plan.md
tickets/YYYY-MM/{TICKET_ID}/description.md
```
Create all three at once via content API.

### Kanban
Columns: backlog → todo → in-progress → qa → ready-to-deploy → done.
AI transitions: `in-progress`, `qa`, `ready-to-deploy`.

### Git
- Branch: `feat/{TICKET-ID-slug}` or `fix/{TICKET-ID-slug}`
- PR: `{TICKET-ID}: description`
- Commit: `type(scope): description [{TICKET-ID}]`

### CI
```
frontend/ → npx tsc --noEmit && npm run build
backend/  → python manage.py check && ruff check && pytest
```
