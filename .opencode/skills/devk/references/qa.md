---
description: QA verification after implementation — before documentation
---

# QA

## Scope

| Ticket type | Method |
|-------------|--------|
| Backend-only | Frappe Admin (desk) |
| Includes frontend | Frappe UI (desk / website) |

## Steps

1. Start the dev server if not running
2. Go through every acceptance criterion in the spec — perform the action, verify the result
3. Check the edge cases listed in the spec (errors, nulls, boundary values)
4. Verify no regressions in adjacent areas

## Report format

```
QA — [Frappe Admin | Frappe UI]

✓ [criterion] — [what you did and saw]
✗ [criterion] — FAILED: [what went wrong]
```

Fix every failure before proceeding to documentation.
