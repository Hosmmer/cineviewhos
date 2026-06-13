# Dev Skill: Research Phase

Research before planning or implementing. DO NOT plan or implement during this phase. You're gathering information, not making decisions.

## Tools

- Use Glob to find files by pattern (e.g. `**/co/**/*.py`).
- Use Grep to find usages of specific symbols (fields, classes, functions, `related_name` values).
- Use Read to understand implementation details in the most relevant files.
- For broad searches crossing multiple directories, use the `explore` agent with thoroughness "medium" or "very thorough".
- For multi-step analysis, use the `general` agent.
- DO NOT use sub-agents for simple searches that Glob + Grep can resolve in one call.

## Wiki research (do this FIRST — before touching the codebase)

The wiki lives at `thoughts/wiki/` in the project root.

> **ONLY read `thoughts/wiki/` during research.** Never traverse `thoughts/tickets/` (in-progress specs/plans). Those are not domain knowledge sources.

### Step 1 — Read the context map
Always start here to understand domain boundaries:
```
thoughts/wiki/contexts/CONTEXT-MAP.md
```

### Step 2 — Read the domain context
If the task touches a known domain (`accounting`, `selling`, `buying`, `stock`, `HR`, `projects`, etc.), read:
```
thoughts/wiki/contexts/{domain}/CONTEXT.md
```
This gives you the bounded context, canonical terminology, and architectural constraints. Skip if the file doesn't exist — it will be created during the grill-with-docs session.

### Step 3 — Search for relevant wiki docs
Scan the wiki for docs relevant to the task (only `wiki/` — do NOT scan `tickets/`):
- **Linux/macOS**: `find thoughts/wiki/ -type f -name "*.md" | sort`
- **Windows**: `Get-ChildItem -Path "thoughts/wiki/" -Filter "*.md" -Recurse | Select-Object -ExpandProperty FullName`
Read any file whose name or path relates to the feature area. Prioritize `specs/` and `adr/` subdirectories.

## Research checklist

- [ ] Find the definition of the DocType/model being changed
- [ ] Find all files that reference the target symbol (field, class, function)
- [ ] Identify which references need changes and which are safe
- [ ] Find the controller class for any DocType being changed
- [ ] Find the views, API endpoints, or services that use the model
- [ ] Find tests related to the area
- [ ] Find patches/migrations that reference the field/table
- [ ] Identify conventions and patterns used in neighboring code (naming, imports, structure)

## Output format

After researching, present findings in this structure:

```
### Current state
- `file:line` — what it does, how it works
- `file:line` — pattern or convention to follow

### Files that need changes
- `file:line` — what change is needed
- `file:line` — what change is needed

### Confirmed safe files (no changes)
- `file:line` — why it's safe

### Design options (maximum 2)
1. Option A — pros/cons in 1 line
2. Option B — pros/cons in 1 line

Recommendation: [option] because [reason].

### Open questions (only what code can't answer)
- [Question requiring human judgment or business knowledge]
```

DO NOT include questions you can answer by reading more code. If you have a doubt, read the code first.
