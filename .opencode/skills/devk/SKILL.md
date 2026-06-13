---
name: devk
description: Main development router that classifies tasks by complexity and routes through the right workflow (simple change, bug fix, or spec-driven pipeline). Use when user runs /devk or asks to start working on a development task.
---

# Developer Skills Router

Route development tasks through the right workflow based on complexity and environment.

## Environment

This skill runs in **OpenCode**. Use the following tools and conventions:

| Aspect | OpenCode |
|--------|----------|
| Sub-agents available | `explore`, `general` |
| Codebase search | Direct Glob + Grep, or `explore` agent |
| Spec files | `thoughts/tickets/TICKET-123/*_spec.md` |
| Plan files | `thoughts/tickets/TICKET-123/*_plan.md` |
| Domain skills | `.opencode/skills/<skill>/SKILL.md` in the repo |
| Shell | PowerShell (Windows) or bash (Linux/macOS) |

> **Path note:** `thoughts/` lives at the project root. All specs, plans, and wiki docs live under `thoughts/`. Use `thoughts/tickets/TICKET-123/` for tickets and `thoughts/wiki/` for permanent domain knowledge.

## Input Detection (do this BEFORE task classification)

Check what the user passed as input. If it matches a known artifact, jump directly to the right pipeline stage — do NOT run earlier steps.

| User input | Action |
|------------|--------|
| Path ending in `_spec.md` (e.g. `thoughts/tickets/TICKET-123/..._spec.md`) | **Spec shortcut** — read the spec, then ask: *"I see you have the spec for [TICKET]. Want me to generate the implementation plan?"* If yes → read `references/generate_plan_from_spec.md` and proceed. Skip Research, Grill-me, Generate Spec, and Review steps entirely. |
| Path ending in `_plan.md` (e.g. `thoughts/tickets/TICKET-123/..._plan.md`) | **Plan shortcut** — read the plan, then ask: *"Ready to start implementing [TICKET]?"* If yes → read `references/implement_plan.md` and proceed. Skip everything up to Execute Implementation. |
| Anything else | Fall through to Task Classification below. |

## Task Classification (do this FIRST — before reading any reference)

Classify the task by complexity and load ONLY the corresponding reference:

### 1. Simple change
≤ 3 files, no new business logic, no new endpoints, no data migration complexity.

→ Read `references/simple_change.md`

*Examples: rename a field, change FK to OneToOneField, add a validation, fix a typo, add a field to serializer, adjust a filter.*

### 2. Bug fix
Fix broken behavior, traced to specific code. May touch multiple files.

→ Read `references/research.md` then `references/implement_plan.md`

*Don't write a formal plan file. Research, confirm the fix with the user, implement.*

### 3. Feature / Refactor
New capability, architectural change, or multi-file coordination with new logic.

→ **Spec Driven Development (SDD) pipeline:**

**Entry points (explicit indicators):**
- **No file provided**: Full SDD pipeline from scratch (a ticket folder will be created in `thoughts/tickets/`)
- **Spec file provided** (`thoughts/tickets/TICKET-123/*_spec.md`): Generate plan from spec → Review → Implement
- **Plan file provided** (`thoughts/tickets/TICKET-123/*_plan.md`): Implement directly

**Full SDD Pipeline:**

1. **Research** — Read `references/research.md`. Investigate the wiki and codebase, understand current state.
2. **Grill-with-docs** — Load the `grill-with-docs` skill. Interview the user about requirements one question at a time. Challenge against the domain glossary and record hard decisions as ADRs. Do NOT update `CONTEXT.md` during this phase — wiki docs are updated in the Document step (step 9). Prior research ensures the grill is informed by code reality, not assumptions.
3. **Generate Spec** — Read `references/generate_spec.md`. Generate formal specification document from research + grill findings.
4. **Review & Edit Spec** — User reviews and edits spec. Iterate until specification is approved.
5. **Generate Plan** — Read `references/generate_plan_from_spec.md`. Generate implementation plan from approved spec.
6. **Review & Approve Plan** — User reviews plan. Iterate until plan is approved.
7. **Execute Implementation** — Read `references/implement_plan.md`. Execute phase by phase.
8. **QA** — Read `references/qa.md`. Frappe Admin or UI. All criteria must pass before proceeding.
9. **Document** — Read `references/document.md`. Promote the ticket to the wiki (`thoughts/wiki/`).
10. **Push & PR** — `/gcpush` then `/gpr`.

## Golden rule (applies to ALL paths)

```
Research → Present findings + options → Get explicit approval → Implement
```

**For Feature/Refactor with SDD:**
```
Research → Grill-with-docs → Generate Spec → Approve Spec → Generate Plan → Approve Plan → Implement → QA → Document → /gcpush + /gpr
```

**Never write code before the user approves the plan (or spec, if generating plan next).**
**Never push before QA passes and documentation is complete.**

If the user has to ask "where's the spec?" or "where's the plan?" — you failed the workflow.
