# /merge-to-develop — Integration merges (feature branch → develop)

**Normal agent/team flow.** Merges feature branches, agent worktree branches, and hotfix PRs into `develop`.

## Hard rules

1. **Accepts only:** base = `develop`, head = anything except `develop` itself.
2. **REJECTS** any PR where base = `main` (those use `/merge-to-main` or `/hotfix-to-main`).
3. **No Mo authorization required** for the standard flow — agents and teams can invoke freely.
4. PRs must pass review gates (CI green, conflict-free) before merge.

## Usage

```bash
# By PR numbers
/merge-to-develop [PR_NUMBERS]
/merge-to-develop 123
/merge-to-develop 123 456 789

# By GitHub URL — analyzes all open PRs targeting develop
/merge-to-develop https://github.com/org/repo/pulls

# Auto-find approved PRs
/merge-to-develop --all-approved

# From Cursor agent worktrees (via /repo-cleanup pipeline)
/merge-to-develop --from-worktrees

# Review only
/merge-to-develop --review-only
```

## Workflow

### Step 0: Base branch gate

For each PR under consideration:

```bash
gh pr view [PR_NUMBER] --json number,title,baseRefName,headRefName,mergeable,reviewDecision,statusCheckRollup
```

Validate:
- `baseRefName == "develop"` → continue
- `baseRefName == "main"` → REJECT: "PR #[N] targets main. Use /merge-to-main (develop→main promotion) or /hotfix-to-main (emergency hotfix) instead."
- `headRefName == "develop"` → REJECT (can't merge develop into itself)

### Step 1: Per-PR pre-merge checks

- CI checks all green (or explicit override flag)
- No merge conflicts (`mergeable == MERGEABLE`)
- Review decision ≠ CHANGES_REQUESTED

### Step 2: Merge approved PRs

```bash
gh pr merge [PR_NUMBER] --squash --delete-branch --repo [owner]/[repo]
```

- Default: `--squash --delete-branch` (keeps develop history clean; agent branches discarded)
- Override: `--no-squash` to preserve individual commit history

### Step 3: Post-merge

```bash
git fetch origin develop
git checkout develop && git pull origin develop
```

Report: PRs merged, PRs skipped (with reason), PRs blocked (with blocker).

## Worktree integration

When `--from-worktrees`:
- Scans `.claude/worktrees/agent-*` for branches with completed work + open PRs
- Applies the same base-branch gate (must target develop)
- Auto-merges ready PRs, skips blocked
- Pairs with `/repo-cleanup` for post-merge worktree teardown

## REJECTS

- PRs where base = `main` → "Use /merge-to-main or /hotfix-to-main"
- PRs where head = `develop` (self-merge attempt)
- PRs with failing CI
- PRs with unresolved merge conflicts
- PRs with CHANGES_REQUESTED

## Related

- `/merge-to-main` — develop → main release promotion (Mo-authorized)
- `/hotfix-to-main` — emergency direct-to-main (Mo-approved)
- `/queue-prompt` — queue work for agents
- `/pickup-prompt` — agent picks up + worktree + PR
- `/review-code` — PR review before merge
- `/repo-cleanup` — merge worktree PRs + cleanup

## Why this exists

Standardized git workflow locks every repo to `main + develop` only with a fixed four-command flow. See `decision-standardized-git-workflow-simple.md`.
