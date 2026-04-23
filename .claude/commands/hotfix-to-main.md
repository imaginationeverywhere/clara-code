# /hotfix-to-main — Emergency direct-to-main (Mo-approved ONLY)

**For production emergencies.** Bypasses `develop` to patch `main` directly.

## Hard rules

1. **Requires explicit Mo approval in-session** for THIS specific hotfix. No standing authorization.
2. **Accepts:** base = `main`, head = any branch EXCEPT `develop`. (Develop → main is `/merge-to-main`.)
3. **Hotfix branch naming convention:** `hotfix/<short-description>` (e.g., `hotfix/voice-endpoint-500-crash`).
4. **Must backport to develop immediately after main merge.** Command does both.

## Usage

```bash
# Mo-invoked in session:
/hotfix-to-main [PR_NUMBER]
/hotfix-to-main [PR_URL]

# Or create hotfix branch + PR + merge in one shot (Mo-directed):
/hotfix-to-main --create [description] [patch-file-or-diff]
```

## Workflow

### Step 0: Authorization gate

Confirm in session:
- **"Did Mo explicitly authorize this hotfix-to-main for this repo, for THIS specific fix, in THIS session?"**
- **"Is this a genuine production emergency that cannot wait for the standard develop → main cycle?"**
- If either answer is no → STOP. Reply with "Hotfix requires explicit Mo authorization + production-emergency justification. Standard flow: PR to develop → /merge-to-develop → /merge-to-main when ready."
- If both yes → continue.

### Step 1: Validate the PR

```bash
gh pr view [PR_NUMBER] --json number,title,baseRefName,headRefName,mergeable,statusCheckRollup
```

Gates:
- `baseRefName == "main"` ✓
- `headRefName != "develop"` ✓ (develop uses /merge-to-main)
- `headRefName` starts with `hotfix/` — warn if not (naming convention)
- CI checks green
- No merge conflicts
- Minimal scope — hotfix should touch the smallest surface area that fixes the emergency

### Step 2: Review the diff

Produce a short report Mo can scan in seconds:
- Files changed, lines +/−
- What the fix does (from PR body)
- Risk assessment (any touched files also in recent develop-only work?)

### Step 3: Confirm one last time

Ask Mo: **"Merge hotfix PR #[N] directly to main on [repo]? Say yes to execute."**

Only on explicit "yes":

```bash
gh pr merge [PR_NUMBER] --merge --delete-branch --repo [owner]/[repo]
# Use --merge (not --squash) to preserve the hotfix commit for forensics
```

### Step 4: Backport to develop (MANDATORY, AUTOMATIC)

Hotfixes to main MUST be merged back to develop immediately, or develop drifts behind main.

```bash
# Get hotfix commit SHA from main
HOTFIX_SHA=$(git log main -1 --format=%H)

# Create backport branch from develop
git checkout develop
git pull origin develop
git checkout -b backport/hotfix-[PR_NUMBER]

# Cherry-pick the hotfix commit
git cherry-pick $HOTFIX_SHA

# Push + PR to develop
git push -u origin backport/hotfix-[PR_NUMBER]
gh pr create --base develop --head backport/hotfix-[PR_NUMBER] \
  --title "backport: hotfix #[PR_NUMBER] to develop" \
  --body "Mandatory backport of hotfix merged to main. See #[PR_NUMBER]."

# Merge the backport immediately
gh pr merge [BACKPORT_PR_NUMBER] --merge --delete-branch
```

### Step 5: Post-merge

Report to Mo:
- main: PR # merged, commit SHA
- develop: backport PR # merged, commit SHA
- Both branches confirmed in sync for the hotfix commit
- Link to forensic log

## What this command REJECTS

- Any invocation without explicit Mo authorization
- Any invocation without production-emergency justification
- PRs where base ≠ main
- PRs where head = develop (use /merge-to-main)
- Hotfixes that modify more than strictly necessary surface area (warn + confirm)
- Hotfixes without a backport-to-develop plan

## When to use WHICH command

| Situation | Command |
|---|---|
| Agent finishes feature/task → PR to develop | `/merge-to-develop` |
| Ready to release develop → main | `/merge-to-main` (Mo-authorized) |
| Production is ON FIRE and can't wait | `/hotfix-to-main` (Mo-approved emergency) |
| Agent worktree cleanup + merge | `/repo-cleanup` (delegates to /merge-to-develop) |

## Related

- `/merge-to-main` — develop → main release promotion
- `/merge-to-develop` — standard integration flow
- `/repo-cleanup` — worktree teardown + batch merge to develop

## Why this exists

Locked 2026-04-23. Hotfixes are the ONLY path to main outside of develop → main. Without a dedicated command, emergencies either (a) get blocked by the develop → main gate, or (b) slip in via unreviewed direct pushes. This command enforces both that Mo approves the emergency AND that the fix is backported to develop.
