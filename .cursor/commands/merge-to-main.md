# /merge-to-main — Release promotion (develop → main ONLY)

**Mo-authorized release command.** This command exists for ONE purpose: promote `develop` to `main`.

## Hard rules (non-negotiable)

1. **ONLY accepts one shape of PR:** base = `main`, head = `develop`. Anything else is REJECTED.
2. **Requires explicit Mo authorization in-session** for the specific repo. Not standing authorization. Every invocation is a new ask.
3. **Not for hotfixes.** Hotfixes use `/hotfix-to-main`.
4. **Not for feature PRs.** Feature PRs → `develop` via `/merge-to-develop`.

## Usage

```bash
# Mo-invoked in session:
/merge-to-main [repo-name-or-url]
/merge-to-main imaginationeverywhere/quikvoice
/merge-to-main https://github.com/imaginationeverywhere/quikvoice
```

## Workflow

### Step 0: Authorization gate

Confirm in session:
- **"Did Mo explicitly authorize this `develop → main` promotion for this repo in THIS session?"**
- If no → STOP. Reply with "Release promotion requires explicit Mo authorization. Not proceeding."
- If yes → continue.

### Step 1: Base branch gate

```bash
# Find the develop → main PR (there should be exactly one)
gh pr list --repo [owner]/[repo] --base main --head develop --state open \
  --json number,title,mergeable,reviewDecision,headRefName,baseRefName
```

Validate:
- Exactly ONE open PR where `baseRefName == "main"` AND `headRefName == "develop"`
- If zero → create one: `gh pr create --base main --head develop --title "release: develop → main" --body "Release PR. Authorized by Mo in session."`
- If more than one matching PR → ABORT, flag to Mo (indicates bad repo state)
- If any OTHER open PR targets main (not from develop) → FLAG in report but don't merge them; those belong to `/hotfix-to-main`

### Step 2: Pre-merge checks

For the develop→main PR:
- All CI checks must pass
- No merge conflicts (`mergeable == MERGEABLE`)
- If either fails → STOP, report to Mo, do not merge

### Step 3: Diff summary

Produce a short report Mo can scan:
- Commits count being promoted
- Files changed, lines +/−
- CHANGELOG.md / version-bump entries detected
- Breaking changes flagged in commit messages

### Step 4: Final confirmation

Ask Mo: **"Ready to promote develop → main on [repo]? Say yes to execute."**

Only on explicit "yes":

```bash
gh pr merge [PR_NUMBER] --merge --repo [owner]/[repo]
# NO --delete-branch — develop stays; it's long-lived
```

### Step 5: Post-merge

```bash
git fetch origin main
git checkout main && git pull origin main
# Tag only if Mo directs: git tag v[X.Y.Z] && git push origin v[X.Y.Z]
```

Report back: PR # merged, commit SHA now on main, link to release diff.

## REJECTS

- PRs where base ≠ main
- PRs where head ≠ develop
- Any invocation without explicit in-session Mo authorization
- Hotfix branches (those use `/hotfix-to-main`)
- Any flag to bypass checks (`--force`, `--no-verify`, etc.)

## Related

- `/merge-to-develop` — feature branches & agent PRs → develop (normal flow)
- `/hotfix-to-main` — emergency fixes → main directly (Mo-approved only)
- `/repo-cleanup` — merge agent worktree PRs to develop + cleanup

## Why this exists

Locked 2026-04-23 per Mo: "One major rule for any repo I must explicitly give permission to merge develop into main." See memory `feedback-develop-to-main-merge-requires-mo-permission.md`.
