# CineViewHos

Project manifest — single source of truth for all skills and agents.

## Tracker

| Key | Value |
|-----|-------|
| type | xenodocia |
| url | `http://localhost:8002` (env `XENODOCIA_URL`) |
| auth | `Authorization: Token {XENODOCIA_API_TOKEN}` |
| tickets_api | `{url}/api/tickets/` |
| content_api | `{url}/api/content/` |
| content_tree | `{url}/api/content/tree/?prefix=...` |
| ticket_id_format | `XE-NNN` |

## Wiki

| Key | Value |
|-----|-------|
| backend | content-api |
| contexts_path | `thoughts/wiki/contexts/{domain}/` |
| tickets_path | `thoughts/tickets/{TICKET_ID}/` |
| adr_path | `thoughts/wiki/contexts/{domain}/adr/` |
| specs_path | `thoughts/wiki/contexts/{domain}/specs/` |
| description_file | `description.md` |
| spec_suffix | `_spec.md` |
| plan_suffix | `_plan.md` |
| file_prefix | `YYYY-MM-DD-name` |
| ticket_dir_prefix | `YYYY-MM` |

## Repos

| Path | Stack |
|------|-------|
| `backend/` | Django + DRF + PostgreSQL |
| `frontend/` | React 18 + Vite + TypeScript |
| `xenodocIA/` | Django + React (separate repo — internal tools) |

## Toolchain

| Key | Command | Workdir |
|-----|---------|---------|
| fe/typecheck | `npx tsc --noEmit` | `frontend/` |
| fe/build | `npm run build` | `frontend/` |
| fe/format | `prettier --write .` | `frontend/` |
| fe/test | `vitest` | `frontend/` |
| be/check | `python manage.py check` | `backend/` |
| be/test | `pytest` | `backend/` |
| be/lint | `ruff check` | `backend/` |
| be/format | `black . && isort .` | `backend/` |
| be/migrations | `python manage.py makemigrations` | `backend/` |

## Workflow

| Key | Value |
|-----|-------|
| kanban | backlog → todo → in-progress → qa → ready-to-deploy → done |
| ai_transitions | in-progress, qa, ready-to-deploy |
| branch_format | `{type}/{TICKET-ID-slug}` (type: feat\|fix) |
| pr_format | `{TICKET-ID}: description` |
| commit_format | `{type}(scope): description [{TICKET-ID}]` |
| ci_checks | fe/typecheck, fe/build, be/check, be/lint, be/test |

## Domain Rules

- **No grey UI** — `btn-secondary`, `text-muted`, `#94A3B8`, `#8E8E93`, `rgba(142,142,147` are banned
- **No emojis in UI** — SVG or `bi bi-*` icons only
- **Spec/Plan approval gates** — never skip. User must explicitly approve spec and plan before code is written.
- **Documentation plan gate** — present a documentation plan (specs to promote, ADRs, CONTEXT.md changes, CHANGELOG updates) and get explicit approval before executing.
- **Documentation MANDATORY after QA** — after QA passes, you MUST update CONTEXT.md, CHANGELOG.md, promote specs, and record ADRs before pushing. Never move to ready-to-deploy without docs.
- **Surgical scope** — touch ONLY what's asked, no CSS/selector creep
- **Free input for extensible fields** — never hardcode dropdowns for dynamic string data

## Architecture Rules

- **Backend**: service-layer (models → serializers → services → views)
- **Frontend**: module anatomy (`_models.ts`, `_requests.ts`, hooks, components)

## Process Rules

- **QA**: human-led only — guide, never self-execute and self-report
- **Bugs**: full diagnosing_bugs pipeline before touching code
- **Ticket scope**: only operate on tickets user explicitly names
- **Ticket creation**: description.md mandatory, no em dashes in titles, check next_id
- **XE-12**: off-limits — never read/modify/comment
- **Local dev config**: `settings.py`/`vite.config.ts`/`Makefile` in skip-worktree; never PR

## Skills

- **Global** — `~/.config/opencode/skills/{name}/SKILL.md` (project-agnostic, reads config from this AGENTS.md)
- **Repo-local** — `.opencode/skills/{name}/SKILL.md` (overrides/extensions with project-specific details)
- **Domain loading** — `.opencode/rules/domain-skills.md` controls which domain skills auto-load per file path

### Skill Resolution Order
1. Global skill loaded first (defines the workflow, delegates to references)
2. Repo-local override extends it (adds project-specific config)
3. Domain skills load per path match (defined in `rules/domain-skills.md`)

### Domain Skills Map
| Paths | Skills loaded |
|-------|--------------|
| `backend/**/*` | `django-cineviewhos` (patterns in `backend/.opencode/skills/django/references/`) + `backend-testing` |
| `frontend/**/*` | `react-CineViewHos` (patterns in `frontend/.opencode/skills/react/references/`) + `tailwind-design` + `frontend-testing` |
| `xenodocIA/**/*` | `django-cineviewhos` + `react-CineViewHos` + `backend-testing` + `frontend-testing` |
| Any | `codebase-design`, `domain-modeling` |

### Skill Reference Files (deep-dive patterns loaded on demand)
- **Backend**: `backend/.opencode/skills/django/references/` — models-orm (544L), drf-serializers (318L), viewsets-views (433L), testing-django (420L)
- **Frontend**: `frontend/.opencode/skills/react/references/` — hooks-patterns (309L), state-management (281L), testing-react (334L), performance (260L), i18n (53L), component-architecture (125L), metronic-plugin-init (53L)
