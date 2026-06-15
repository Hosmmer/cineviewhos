---
description: Always load and follow domain-specific skills when working on frontend or backend code.
globs:
  - "frontend/**/*"
  - "backend/**/*"
alwaysApply: true
---

# Domain Skill Usage Rule

**When touching ANY file under `frontend/`**, load and follow these skills:
- `react-dev` (React 18 + TypeScript + Vite patterns)
- `tailwind-design` (UI design system, dark cinema theme)
- `frontend-testing` (Vitest + React Testing Library patterns)

**When touching ANY file under `backend/`**, load and follow these skills:
- `django-dev` (Django 3.0.7 + DRF 3.15 patterns)
- `backend-testing` (Pytest + Django patterns)

**General rules:**
- Never write code without consulting the relevant domain skill first
- Follow the constraints (MUST DO / MUST NOT DO) from each skill
- Use the component patterns and conventions defined in the skills
- Run type-checking (`npx tsc --noEmit` for frontend, `pytest` for backend) before considering work done
