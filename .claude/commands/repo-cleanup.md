# /repo-cleanup — Consolidate Branches, Worktrees, and PRs into Develop

**Purpose:** End orphan-branch / spaghetti-code sprawl across Herus. One command, every repo, consolidated to develop.

**When to run:**
- Weekly fleet hygiene
- Before starting a new sprint
- When a Heru feels messy (many open PRs, stale branches, forgotten worktrees)
- After merging a big feature across multiple branches

## What It Does

For the target repo (or every Heru with `--all-herus`):

1. `git fetch --all --prune` — sync with remote.
2. **Worktrees:** remove any worktree whose branch is gone or detached.
3. **Branches:** for every non-protected local and remote branch:
   - Already in develop → delete.
   - Ahead of develop, clean auto-merge → merge into develop, delete.
   - Ahead of develop, conflict → FLAG in report, leave alone.
4. **Pull requests** (via `gh`): for every open PR targeting develop/main/master:
   - Mergeable → squash-merge with auto-delete.
   - Conflicting → comment "needs rebase", leave open.
   - Stale (>14 days, not mergeable) → close with comment.
   - Draft / non-standard base → skip.
5. Push develop, prune remote.
6. Emit per-repo `reports/repo-cleanup/<timestamp>/report.md` + `actions.csv`.

**Protected branches never touched:** `main`, `master`, `develop`, `production`, `release/*`.

## Usage

```bash
# Dry run on current repo (default — safe, read-only)
./scripts/repo-cleanup/repo-cleanup.sh

# Live run on current repo
./scripts/repo-cleanup/repo-cleanup.sh --execute

# Fleet dry run — every client repo under /Volumes/X10-Pro/Native-Projects/clients/
./scripts/repo-cleanup/repo-cleanup.sh --all-herus

# Fleet live run
./scripts/repo-cleanup/repo-cleanup.sh --all-herus --execute

# Single named repo
./scripts/repo-cleanup/repo-cleanup.sh --repo /Volumes/X10-Pro/Native-Projects/clients/fmo

# Custom heru root (override default)
./scripts/repo-cleanup/repo-cleanup.sh --all-herus --heru-root /other/path

# Help
./scripts/repo-cleanup/repo-cleanup.sh --help
```

## Safety Rails

- **Default = dry run.** `--execute` must be explicit.
- **Uncommitted changes = abort per repo.** Will not touch dirty working trees.
- **Never force-pushes.** Never rebases main/develop.
- **`.heru-skip` marker honored** (same as `/sync-herus`).
- **Conflict = flag, not resolve.** Conflicted branches and PRs are left intact for human decision.
- **No gh CLI or no auth = PR step skipped** (branches + worktrees still run).

## Recommended Flow

1. **First time on a messy repo:** dry run, read the report, eyeball the action list.
   ```bash
   ./scripts/repo-cleanup/repo-cleanup.sh
   less reports/repo-cleanup/*/report.md
   ```
2. If the list looks right → re-run with `--execute`.
3. **Weekly fleet maintenance:**
   ```bash
   ./scripts/repo-cleanup/repo-cleanup.sh --all-herus --execute
   ```
   Then review `/tmp/repo-cleanup-rollup-<timestamp>/fleet-index.csv` for the per-Heru reports.

## What It Won't Do (by design)

- Rewrite git history (use `git filter-repo` for that — separate, dangerous)
- Resolve merge conflicts
- Delete protected branches
- Touch repos with uncommitted changes
- Push any non-develop branch
- Merge PRs that target non-standard bases (feature/* → release/* etc.)
- Close active draft PRs

## Related

- `/sync-herus` — push platform changes across all Herus
- `/advanced-git` — low-level git workflow helpers
- `git-commit-docs` — stage + commit + document

## Output Format

Per-repo: `<repo>/reports/repo-cleanup/<timestamp>/`
- `report.md` — human-readable summary
- `actions.csv` — machine-readable: `action, target, result, detail`

Action types:
- `worktree-remove` — stale worktree cleaned
- `branch-delete` — branch was already merged, deleted
- `branch-merge` — auto-merged branch into develop
- `branch-merged-and-deleted` — merged + deleted (live mode confirmation)
- `branch-flag` — conflicting branch flagged for manual resolution
- `remote-branch-merged` — remote branch deleted (already in develop)
- `pr-merge` / `pr-merged` — PR squash-merged
- `pr-flag` — PR commented "needs rebase"
- `pr-close` — stale PR closed
- `pr-skip` — draft / non-standard base / mergeable-unknown

Fleet rollup: `/tmp/repo-cleanup-rollup-<timestamp>/fleet-index.csv`.
