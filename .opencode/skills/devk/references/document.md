---
description: Document a completed ticket in the project wiki after QA passes
---

# Document

Run this after QA passes. This is the wiki promotion step for a completed ticket.

## Overview

When a branch is merged (or about to be merged), the ticket's spec moves from draft (`thoughts/tickets/{TICKET_ID}/`) into the permanent wiki at `thoughts/wiki/`.

## Step 1 — Locate the spec

```
thoughts/tickets/{TICKET_ID}/*_spec.md
```

If there is no spec, stop. Nothing to promote.

## Step 2 — Identify the domain(s)

1. **Always** read `thoughts/wiki/contexts/CONTEXT-MAP.md` if it exists.
2. Find the spec's **primary domain** (the Frappe module most affected: Accounting, Selling, Buying, Stock, HR, Projects, etc.)
3. If the domain doesn't exist yet, propose creating it to the user.

## Step 3 — Update `CONTEXT.md` (only if terms changed)

File: `thoughts/wiki/contexts/{domain}/CONTEXT.md`

Rules:
- **Glossary only** — no file paths, no implementation details
- One entry per term: `**Term**: definition. _Avoid_: synonym.`
- Insert in alphabetical order
- If no terms changed, skip this step entirely

## Step 4 — Copy spec to `specs/`

```
thoughts/wiki/contexts/{domain}/specs/{TICKET_ID}-{short-slug}.md
```

Example: `FEAT-001-custom-sales-report.md`

The original in `thoughts/tickets/{TICKET_ID}/` stays as the source of record — don't delete it.

## Step 5 — Write the `CHANGELOG.md` entry

File: `thoughts/wiki/contexts/{domain}/CHANGELOG.md`

Add at the **top** (newest entries first):

```markdown
## 2026-06-13 · TICKET-123
- New term: ExampleTerm
- Spec: [TICKET-123-feature-name.md](specs/TICKET-123-feature-name.md)
```

One bullet per concept or term changed. Link to the promoted spec.

## Step 6 — Write an ADR (only if a hard architectural decision was made)

Check the spec for decisions that pass the three-question test:
1. Hard to reverse — undoing this requires significant rework
2. Surprising without context — future reader would wonder "why?"
3. Real trade-off — genuine alternatives existed

If all three are true, write the ADR at:
```
thoughts/wiki/contexts/{domain}/adr/NNNN-short-slug.md
```

If none qualify, skip this step.

## Summary checklist

```
[ ] Spec exists in thoughts/tickets/{TICKET_ID}/
[ ] Domain(s) identified
[ ] CONTEXT.md updated (new/changed terms only)
[ ] Spec copied → contexts/{domain}/specs/{TICKET_ID}-{slug}.md
[ ] CHANGELOG.md entry added at top
[ ] If ADR warranted → ADR written and linked
```

## After documentation is complete

All checklist items done → proceed to `/gcpush` + `/gpr`.
