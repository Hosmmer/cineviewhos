---
name: gpr
description: Creates a GitHub Pull Request for the current git repo. Auto-generates PR title and body from the branch diff. Use when user runs /gpr or asks to open a PR, create a pull request, or submit changes for review.
---

# gpr

Creates a Pull Request for the current git repo.

## Auto-detection

Detect the repo path automatically:
```bash
git rev-parse --show-toplevel
```

Use this as `<repo_path>` for all commands.

## Step 1 — Pre-flight check

```bash
git -C <repo_path> branch --show-current
git -C <repo_path> log origin/main..HEAD --oneline
```

- Branch is `main` → abort: "No podés hacer PR desde main. Creá una rama primero."
- No commits ahead of main → skip: "No hay commits nuevos sobre main."

## Step 2 — Generate PR content

```bash
git -C <repo_path> diff origin/main...HEAD --stat
git -C <repo_path> log origin/main..HEAD --pretty=format:"%s"
```

Generate:
- **Title**: Conventional Commits style, ≤72 chars
- **Body**:

```markdown
## Summary
- <bullet points from commits>

## Test plan
- [ ] <test steps>

## Frappe notes
- [ ] bench migrate runs cleanly
- [ ] Assets rebuild if needed
```

Show title and body to the user and ask for confirmation before creating.

## Step 3 — Create PR

```bash
gh pr create \
  --repo <owner>/<repo> \
  --base main \
  --title "<title>" \
  --body "<body>"
```

Detect `<owner>/<repo>` from:
```bash
git -C <repo_path> remote get-url origin
```

Parse the `owner/repo` from the URL.

## Output

```
| Repo | Branch | PR |
|------|--------|----|
| frappe | feat/add-endpoint | https://github.com/... |
```

## Error handling

- **`gh` not authenticated**: print `gh auth login` and stop.
- **Branch has no upstream**: push first, then retry.
- **PR already exists**: print the existing PR URL and skip.
