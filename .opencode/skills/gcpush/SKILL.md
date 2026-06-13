---
name: gcpush
description: Commits and pushes changes in the current git repo. Auto-generates commit message from diff. If on main, creates a feature branch before committing. Use when user runs /gcpush or asks to commit and push changes.
---

# gcpush

Commits and pushes changes in the current git repo.

## Auto-detection

Detect the repo path automatically:
```bash
git rev-parse --show-toplevel
```

Use this as `<repo_path>` for all commands. If the command fails, the user isn't inside a git repo — show an error and stop.

## Steps

### 1. Check status
```bash
git -C <repo_path> status --short --branch
```
Skip if there are no changes.

### 2. Validate branch
If on `main` or `master`, create a new branch:
```bash
git -C <repo_path> checkout -b <auto-name>
```
Auto-name format: `feat/<short-slug-from-diff>` — derive from the staged/unstaged changes. Keep it under 40 chars, kebab-case.

### 3. Stage all changes
```bash
git -C <repo_path> add -A
```

### 4. Generate commit message
Read `git -C <repo_path> diff --cached` and write a Conventional Commits message:
- Format: `<type>(<optional scope>): <summary>`
- Types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`
- Summary: imperative mood, ≤72 chars, no trailing period
- For Frappe: scope can be the app/module name (e.g. `feat(accounting): add tax breakdown`)

### 5. Commit
```bash
git -C <repo_path> commit -m "<generated message>"
```

### 6. Push
```bash
git -C <repo_path> push origin <branch>
```
If no upstream exists: `git -C <repo_path> push --set-upstream origin <branch>`

## Output

```
| Repo | Branch | Commit | Status |
|------|--------|--------|--------|
| frappe | feat/add-endpoint | feat(api): add endpoint | ✓ pushed |
```

## Error handling

- **Dirty merge conflict**: stop, report, suggest resolving manually.
- **Auth failure**: suggest checking SSH keys or `gh auth login`.
- **Nothing to commit**: mark as skipped.
