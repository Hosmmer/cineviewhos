# Dev Skill: Simple Change

For changes ≤ 3 files, no new business logic, no new endpoints, no data migration complexity.

## Workflow (mandatory order — DO NOT skip steps)

### Step 1: Research (lightweight)

- Read the files the user mentioned or those clearly related.
- Use Grep to find all usages of what you're going to change (field names, functions, classes, `related_name`, `ForeignKey` targets).
- Identify exactly which files need modification and which are safe (no changes).
- Use direct Glob + Grep. Only use `explore` agent if the search crosses 10+ files across multiple apps.

### Step 2: Present findings + options

Use this exact format:

```
**What I found:**
- `path/to/file.py:NN` — what it currently does, why it needs change
- `path/to/file.py:MM` — reference that requires adjustment
- `path/to/file.py:KK` — doesn't need change, verified

**Approaches:**
1. Option A — 1 line of pros/cons
2. Option B — 1 line of pros/cons

I recommend option X because [brief reason]. Shall I proceed?
```

Keep it short. 3-5 findings bullets, maximum 2 options. The user should be able to read and approve in less than 10 seconds.

### Step 3: Get explicit approval

Use the `question` tool with a simple yes/no. DO NOT touch code until receiving a "yes" or equivalent.

### Step 4: Implement

- Make all edits with the Edit tool.
- If DB migration is needed, generate the file with `python manage.py makemigrations`. DO NOT apply it — the user decides when to migrate.
- Show a brief summary of what was changed when done.

### Step 5: Verify

- Run the project's linter if it exists (`ruff check`, `make lint`, etc.).
- Run relevant tests if they exist and can be executed locally.
- Confirm no references to the old pattern remain (re-grep if necessary).

## Anti-patterns (what to NEVER do)

- ❌ Jump straight to editing without presenting findings and options
- ❌ Write a plan file for a simple change
- ❌ Spawn multiple agents for a 1-file change
- ❌ Run migrations without explicit user permission
- ❌ Add code comments unless the user requests it
- ❌ Create new files unless the change actually requires it
- ❌ Explain the code after editing — just make the change and stop
