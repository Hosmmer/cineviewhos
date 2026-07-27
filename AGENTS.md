# CineViewHos

Monorepo at `C:\curso-opencode\cineviewhos`.

## Repos

| Path | Stack |
|------|-------|
| `backend/` | Django 3.0.7 + DRF + PostgreSQL |
| `frontend/` | React 18 + Vite + TypeScript |
| `xenodocIA/` | Django 5.2 + React (internal docs & tickets — separate repo) |

## XenodocIA (internal documentation tool)

- **URL**: `http://localhost:8002` (env `XENODOCIA_URL`)
- **Token**: env `XENODOCIA_API_TOKEN`, header `Authorization: Token {token}` (NOT "Bearer")
- Storage moved to S3 — **no local `thoughts/` checkout**. All reads/writes go through the content API:
  - Read: `GET {XENODOCIA_URL}/api/content/?path=<path>`
  - Write: `PUT {XENODOCIA_URL}/api/content/` with `{"path": "<path>", "content": "..."}`
  - List directory: `GET {XENODOCIA_URL}/api/content/tree/?prefix=<prefix>`
  - Tickets: `GET/POST/PATCH {XENODOCIA_URL}/api/tickets/`
- Ticket creation: `POST /api/tickets/`, ID from `GET /api/tickets/` max+1, human confirms
- **Spec/Plan naming convention MANDATORY**: write files with `YYYY-MM-DD-feature-name_spec.md` and `YYYY-MM-DD-feature-name_plan.md` inside the ticket directory. XenodocIA `has_spec` field is computed by scanning for `*_spec.md` files — a bare `spec.md` will NOT set `has_spec: true`. Always verify via `GET /api/tickets/{ID}/` after writing.
- The `.env` local of `C:\curso-opencode\cineviewhos\xenodocIA` has a DIFFERENT token for local dev only (`http://localhost:8002`)

## thoughts/ (XenodocIA wiki — S3 logical paths)

```
thoughts/wiki/contexts/{domain}/
  CONTEXT.md        ← glossary + bounded context (read first)
  adr/              ← architecture decisions
  specs/            ← promoted specs
thoughts/tickets/{TICKET_ID}/
  description.md
  *spec.md
  *plan.md
  comments/UNN.json
```

These are **logical paths** for the content API, not filesystem locations.

## Skills auto-discovered

- **Opencode-global**: `~/.config/opencode/skills/{devk,gcpush,gpmain,gpr,grill-me,grill-with-docs,handoff,write-a-skill,add-comment,create-ticket,create-ticket-backlog,promote,update-status,cineviewhos-deploy,park,planning}/SKILL.md`
- **Repo-level**: Each repo's `.claude/skills/` directory

## Skill reference files

Some skills (devk, grill-with-docs) reference files like `references/simple_change.md`. These live at `~/.config/opencode/skills/{skill-name}/references/` (copied from `~/.claude/skills/devbookIA/`). Search for them with glob patterns when needed.

## Docker (local dev)

- **NEVER run `docker compose down -v`** — the `-v` flag **DESTROYS ALL DATA** (PostgreSQL volumes, tickets, wiki, users, movies, everything). This is a hard rule. Always use `docker compose down` (no `-v`) or `make down`.
- Root `docker-compose.yml` → CineViewHos (postgres:16, redis:7, backend:8000, celery_worker, frontend:3000)
- `xenodocIA/docker-compose.yml` → XenodocIA (postgres:16, backend:8002, frontend:5175)
- Volumes `cineviewhos_pgdata` and `xenodocia_postgres_data` persist data across restarts.
- Commands: `make up` (start), `make down` (stop, safe), `make stop` (pause, safe), `make status` (check).
- XenodocIA credentials: `hosmmer` / `admin123` (superuser). API token stored in DB (`APIToken` model).
- CineViewHos credentials: `hosmmer` / `admin123` (superuser). DB: `postgres`/`postgres`, database: `custom_app`.

## Feedback rules (hard-won, never violate)

- **No grey UI** — `btn-secondary`, `text-muted`, `#94A3B8`, `#8E8E93`, `rgba(142,142,147` are all banned. Always use a colored variant.
- **No emojis in UI** — always SVG inline or `bi bi-*` icon font (emojis break on some devices, XE-91)
- **"Anular" never "Cancelar"** — in POS, voiding an order is always "Anular orden", never "Cancelar"
- **Surgical scope** — if user asks for X, touch ONLY X. Never widen scope, never add extra CSS selectors or changes without asking
- **QA must be human-led** — guide the human through each QA step; never self-execute and self-report results
- **Never touch tickets user didn't name** — only operate on the exact ticket ID the user specifies
- **Bug reports → diagnosing_bugs pipeline** — any bug report (however small) triggers the full `references/diagnosing_bugs.md` pipeline before touching code. **Explicit user approval required after root cause is confirmed and before applying any fix.**
- **Free input for extensible fields** — if a field is a scalable string, UI must be free input / data-driven list, never a fixed dropdown
- **XenodocIA ticket creation** — no em dash in titles (use `:`), always use Python urllib not curl, check next_id before creating, verify titles vs RELEASE-QUEUE
- **Ticket description MANDATORY** — every ticket created in XenodocIA MUST have a `description.md` with clear summary of what the ticket is about. Never create a ticket without description.
- **XE-12 is off-limits** — never read/modify/comment on XE-12

## Project state

- **XE-56 Kanban**: 6 columns — backlog → todo → in-progress → qa → ready-to-deploy → done. AI owns `→ in-progress` (devk), `→ qa` (QA step), `→ ready-to-deploy` (gpr after merge). Abdo owns manual moves.
- **One open order per table** (POS invariant, XE-46/ADR-0006) — resolve open order from backend before charging
- **Pizza halves** = `is_halvable` flag, SEPARATE from `is_portionable`, mutually exclusive
- **POS menu must match Admin config exactly** — no acceptable divergence
- **Modifier snapshot FK** — `LineItemModifier.modifier` FK only accepts `products.Modifier`; halves/portions with `CategoryModifier` break; always pass through `_modifier_snapshot`
- **POS sheets** — use `.pos-sheet--hide-bars` + sticky header + internal scroll for overflow
- **LineItem soft-delete pending** — hard-delete causes data loss on table switch; deferred
- **Local dev config** — `settings.py`/`vite.config.ts`/`Makefile` in skip-worktree + info/exclude; never PR

## Key conventions

- Import rules from `.claude/rules/` files in each repo when working there
- Service-layer pattern for backend (models → serializers → services → views)
- Module anatomy for frontend (`_models.ts`, `_requests.ts`, hooks, components)
- Ticket ID in commit messages: `feat(scope): description [XE-NNN]`
