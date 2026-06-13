---
name: gpmain
description: Syncs the current git repo to the latest main/master branch. Use when user runs /gpmain or asks to sync, pull main, or update repo.
---

# gpmain

Ensures the current git repo is on `main` and up to date.

## Auto-detection

Detect the repo path automatically:
```bash
git rev-parse --show-toplevel
```

Use this as `<repo_path>` for all commands.

## Steps

1. Check current branch:
   ```
   git -C <repo_path> branch --show-current
   ```

2. If not on `main` or `master`, switch to it:
   ```
   git -C <repo_path> checkout main
   ```

3. Pull latest from origin:
   ```
   git -C <repo_path> pull origin main
   ```

## Output

```
| Repo | Was on | Action | Result |
|------|--------|--------|--------|
| frappe | main | pull | ✓ up to date |
```

If any step fails (dirty working tree, merge conflict, auth error), report the error and stop.
