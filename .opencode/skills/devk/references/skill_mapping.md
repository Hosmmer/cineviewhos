# Skill Mapping

> **DEPRECATED** — This file is no longer used for plan generation.
>
> The new flow reads `references/repo_skills_discovery.md` instead, which
> discovers project-local skills from the repo's own `.claude/skills/` or `.opencode/skills/` directory
> at plan time. Stop reading this file and read `repo_skills_discovery.md`.

Lookup table for tagging `Skills:` lines on plan phases. Read this during the
planning phase (per `create_plan.md`) before finalizing any phase. Implementation
phase trusts the tags produced here and loads them.

## How to use this file

For each phase in a plan:

1. Identify the **primary stack area** the phase touches (Python/Frappe, Vue.js/Frappe, or cross-cutting).
2. Start with that area's **Default** skills.
3. Add any **Conditional** skills whose triggers match what the phase does.
4. Always consider the **Cross-cutting** section — those skills apply regardless of stack.
5. Emit a single line: `Skills: skill-a, skill-b, skill-c`
6. If genuinely nothing applies (e.g. a pure docs phase), emit `Skills: (none)` explicitly — never omit the line.

Keep tags minimal. Tagging every skill on every phase defeats the purpose —
Claude only has ~10k tokens of skill headroom before quality degrades.

---

## Python / Frappe backend

### Default (every Python phase)

- `python-code-style`
- `python-error-handling`

### Conditional

Add when the phase matches the trigger:

| Skill | Trigger |
|---|---|
| `python-testing` | Writing or restructuring tests (pytest) |
| `frappe-dev` | Creating DocTypes, server scripts, controller methods |
| `bench-commands` | bench CLI, site management, app installation |
| `python-database` | Database migrations, schema changes, patches |
| `python-security` | Permissions, role-based access, user data |
| `python-api` | REST API endpoints, frappe.hooks, api.py |
| `python-documentation` | Writing docstrings, module docs |

### Notes

- Always tag `python-error-handling` on any phase that writes Python code.
- Tag `frappe-dev` when the phase creates or modifies DocTypes or controller logic.
- Tag `bench-commands` when the phase involves running bench commands.

---

## Vue.js / Frappe frontend

### Default (every frontend phase)

- `frappe-ui-patterns`

### Conditional

Add when the phase matches the trigger:

| Skill | Trigger |
|---|---|
| `vue-component` | New Vue components, templates, JS/TS files |
| `frappe-list-view` | List views, form views, custom page templates |
| `frappe-report` | Report builder, query reports, script reports |
| `frappe-workflow` | Workflow states, transitions, actions |
| `frappe-print` | Print formats, Jinja templates, PDF generation

---

## Cross-cutting (any stack)

These apply regardless of language and should be tagged based on what the phase
is doing, not what stack it's in.

| Skill | Trigger |
|---|---|
| `pre-mortem` | Phase introduces shared mutable state, implicit ordering dependencies, new resource lifecycles, or load-bearing defaults. Tag on any phase that expands the surface area where things can go wrong later. |
| `security-review` | Phase handles user input, authentication, permissions, or sensitive data. |

### Notes

- `pre-mortem` is the highest-leverage cross-cutting skill. When in doubt, tag
  it on structural changes. Skip it on mechanical refactors.
- Tag `security-review` on any phase that touches auth, user data, or external APIs.

---

## Worked examples

### Example 1: Create a custom Sales Invoice field (Frappe)

Phase: "Add 'Discounted Amount' field to Sales Invoice with server-side validation"

- Primary area: Python/Frappe backend
- Characteristics: DocType field, controller validation, permission check

`Skills: python-code-style, python-error-handling, frappe-dev`

### Example 2: Build a custom report (Frappe)

Phase: "Create a monthly sales summary report with charts"

- Primary area: Python/Frappe backend + Vue.js
- Characteristics: new report, query, visualization

`Skills: python-code-style, python-error-handling, frappe-dev, frappe-report`

### Example 3: Add payment reconciliation (cross-cutting)

Phase: "Build payment reconciliation between bank statements and invoices"

- Primary area: Python/Frappe backend
- Characteristics: external data, sensitive, new DocType

`Skills: python-code-style, python-error-handling, frappe-dev, python-security`

### Example 4: Update print format

Phase: "Redesign the Sales Invoice print format"

- Primary area: Frappe frontend
- Characteristics: Jinja template, print design

`Skills: frappe-print`

### Example 5: Update the README

Phase: "Add setup instructions to README"

`Skills: (none)`

---

## When to update this file

- New skill installed → add it to the relevant section with a clear trigger
- Skill consistently over-tagged (shows up where it doesn't help) → tighten its trigger wording
- Skill consistently under-tagged (should have been there but wasn't) → broaden its trigger wording or move it to Default
- New stack area introduced → add a new top-level section
