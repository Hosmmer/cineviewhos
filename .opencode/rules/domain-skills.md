---
description: Auto-load domain-specific skills when working on code. Reads skill mapping from this file.
globs:
  - "frontend/**/*"
  - "backend/**/*"
  - "xenodocIA/**/*"
alwaysApply: true
---

# Domain Skills

Load the appropriate domain skill before writing or modifying code. Use the `skill` tool.

## Frontend & UI

Matches: `frontend/**/*`, `xenodocIA/frontend/**/*`

| Skill | When |
|-------|------|
| `react-CineViewHos` | Always — React 18 + Vite + TypeScript patterns |
| `tailwind-design` | Always — UI design system, dark cinema theme |
| `frontend-testing` | Writing/changing tests |

## Backend

Matches: `backend/**/*`, `xenodocIA/**/*.py`

| Skill | When |
|-------|------|
| `django-cineviewhos` | Always — Django + DRF service-layer patterns |
| `backend-testing` | Writing/changing tests |

## Architecture & Design

Matches: any file

| Skill | When |
|-------|------|
| `codebase-design` | Designing new modules, interfaces, or seams |
| `domain-modeling` | Working with domain terminology, CONTEXT.md, or ADRs |
