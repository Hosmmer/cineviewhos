---
description: How to discover and use project-local skills and rules at plan generation time
---

# Repo Skills Discovery

When generating an implementation plan, discover the project's own skills and rules — **do not use `skill_mapping.md`** (the old global generic mapping).

## Step 1 — Find skills

Your cwd should be the project root. Confirm with:
- **Windows**: `Get-ChildItem ".opencode/skills" -ErrorAction SilentlyContinue`
- **Linux/macOS**: `ls .opencode/skills/ 2>/dev/null`

If the directory doesn't exist, skip to [Fallback](#fallback).

## Step 2 — Discover skills

- **Windows**: `Get-ChildItem -Path ".opencode/skills" -Filter "SKILL.md" -Recurse -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName`
- **Linux/macOS**: `find .opencode/skills -name "SKILL.md" 2>/dev/null`

For each found `SKILL.md`, read its frontmatter (`name`, `description` fields).
**Read the frontmatter only** — do not load the full skill yet. The description tells you when the skill applies.

Example layout:
```
.opencode/skills/
  bench-commands/SKILL.md  → description: "Common Frappe Bench CLI commands..."
  frappe-dev/SKILL.md      → description: "Frappe development patterns..."
```

## Step 3 — Discover rules

- **Windows**: `Get-ChildItem -Path ".opencode/rules" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name`
- **Linux/macOS**: `ls .opencode/rules/ 2>/dev/null`

Read each rule file's filename and first heading to understand when it applies.

## Step 4 — Match skills to plan phases

For each plan phase:
1. Read the phase description (what it does: models, views, API endpoints, React components, tests, etc.)
2. Check each skill's `triggers` field — does a trigger term match what this phase touches?
3. Check each rule filename/heading — does it apply to what this phase touches?
4. Tag matching skills using their **directory name** under `.opencode/skills/`

**Output format**:
```
Skills: django           ← backend-only phase
Skills: react            ← frontend-only phase
Skills: django, react    ← full-stack phase
Skills: (none)           ← docs-only or infra phase with no local skill match
```

Never invent skill names. Only use directory names that actually exist under `.opencode/skills/`.

## Fallback — No local skills found

If no skills directories exist or contain `SKILL.md` files:
- Tag all phases with `Skills: (none)`
- Note in the plan preamble: "No project-local skills found — phases tagged as (none)"

## During Implementation

When `implement_plan.md` references skills per phase, it reads: `.opencode/skills/{skill-name}/SKILL.md`

Where `{skill-name}` is the directory name from the `Skills:` tag.
