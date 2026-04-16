# /git-sweep — Prune merged branches and orphaned worktrees in a Heru

**Owner:** John Mercer Langston (git strategy) · **Scaffolding:** Ossie Davis (commands)
**Implementation:** `.claude/scripts/git-sweep.sh`

At fleet scale (55+ Herus), branch sprawl is the problem. `prompt/*`, `swarm/*`, `feat/*`, `worktree-agent-*` accumulate per repo. This command prunes them safely.

## Usage

```bash
/git-sweep                          # Current repo, dry-run (preview only)
/git-sweep --apply                  # Apply changes (prompts if >20 operations)
/git-sweep --yes                    # Apply changes without prompts (automation / CI)
/git-sweep --dry-run                # Explicit preview
/git-sweep --merged-only            # Only delete branches merged into develop/main; skip worktree cleanup on apply
/git-sweep --remote                 # Also delete matching origin branches
/git-sweep --worktrees              # Worktree cleanup only (skip merged-branch deletion)
/git-sweep --merge-prs              # Merge every open MERGEABLE PR (base: develop/main) then delete the branch
/git-sweep --merge-prs --apply --remote        # Apply merge + delete, local + origin
/git-sweep --merge-prs --yes --remote --all-herus ~/.heru-repos.txt   # Fleet-wide merge sweep
/git-sweep --age 30                 # "Stale" = unmerged AND older than N days (default 30)
/git-sweep --all-herus /path/to/list.txt   # Iterate every repo in a newline-separated list
```

## Safe by default (NON-NEGOTIABLE)

- **Never touches:** `main`, `develop`, `HEAD`, current branch, `backup/*`
- **Defaults to `--dry-run`** unless `--yes` is passed
- **`--remote` required** to delete origin branches (local-only by default)
- **`fetch --prune` first** so deleted-on-remote disappears locally before classification
- **Confirms** before applying if >20 operations (unless `--yes`; use `--apply` for interactive apply with confirmation)
- **Single-repo mode** exits with an error if the current directory is not a git repo; **`--all-herus`** skips paths that are missing or not repos

## What gets classified as what

| Category | Definition | Default action |
|---|---|---|
| **Preserved** | `main`, `develop`, `backup/*`, current branch | Never touched |
| **Merged** | Branch is fully contained in `develop` (or `main` if no `develop`) | Delete local; delete remote iff `--remote` |
| **Stale** | Not merged AND last commit > `--age` days ago | Listed for review only in v1.0 (never deleted automatically) |
| **Active** | Not merged, recent commits | Listed, never touched |
| **Worktree orphan** | `git worktree` entry whose path is missing | `git worktree prune -v` + delete its branch |
| **Dangling `worktree-agent-*`** | Local branch with no backing worktree | Deleted |
| **Open PR — MERGEABLE** (with `--merge-prs`) | `gh pr list` returns state=OPEN, mergeable=MERGEABLE, base=develop/main | `gh pr merge --squash --delete-branch` |
| **Open PR — CONFLICTING** (with `--merge-prs`) | Has merge conflicts | Skipped, logged for manual resolution |
| **Open PR — UNKNOWN** (with `--merge-prs`) | GH hasn't computed mergeable yet | Triggered via `gh pr view`, re-checked, then treated as above |

## Example run (WCR)

```
$ cd ~/Native-Projects/clients/world-cup-ready
$ /git-sweep

=== world-cup-ready ===
  current:     develop
  worktrees:   1 orphan · 1 dangling branches
  branches:    27 merged · 6 stale (>30d) · 3 active
  MERGED (safe to delete):
    prompt/2026-04-15/00-wcr-design-system-setup
    prompt/2026-04-15/01-navbar-footer
    ... (25 more)
    feat/heru-feedback-wcr
  STALE unmerged (review before deletion):
    swarm/wcr-20260314-0908 (33 days)
    ... (5 more)
  ORPHAN worktree branches:
    worktree-agent-a341457c
  [dry-run] no changes applied

== dry-run complete. re-run with --apply or --yes to apply. ==

$ /git-sweep --yes --remote
  ... (deletes 27 merged local + remote, prunes orphan worktree, deletes dangling branch)
```

## Fleet-wide sweep

Generate a list file once, reuse it:

```bash
# ~/.heru-repos.txt (newline-separated paths)
/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate
/Volumes/X10-Pro/Native-Projects/AI/claraagents
/Volumes/X10-Pro/Native-Projects/AI/clara-code
/Volumes/X10-Pro/Native-Projects/clients/world-cup-ready
/Volumes/X10-Pro/Native-Projects/clients/kingluxuryservicesllc
/Volumes/X10-Pro/Native-Projects/Quik-Nation/quiknation
# ...

$ /git-sweep --all-herus ~/.heru-repos.txt
```

## Relationship to other commands

| Command | Role |
|---|---|
| `/review-code` Phase 6 | Deletes merged `prompt/*` branches after PR merge. `/git-sweep` is the periodic broom that catches what Phase 6 missed. |
| `/sync-herus --sweep` | Future: run `/git-sweep --yes --remote` on every Heru before pushing a platform update. |
| `/pickup-prompt` | Creates `prompt/*` branches and `worktree-agent-*` entries. `/git-sweep` cleans the remnants. |

## Future flags (not in v1.0)

- `--merge-prompts` — auto-merge approved `prompt/*` PRs into develop before deleting (needs `gh pr view` state check)
- `--exclude 'pattern'` — glob additions to the preserve list
- `--base develop,main` — require merge into ALL named bases before delete (stricter)

## Command metadata

```yaml
name: git-sweep
version: 1.0.0
owner: John Mercer Langston (git strategy)
scaffolding: Ossie Davis (commands)
implementation: .claude/scripts/git-sweep.sh
safe_defaults:
  - dry_run_unless_yes
  - local_only_unless_remote_flag
  - preserves_main_develop_backup_and_current
  - fetch_prune_before_classify
  - confirm_if_over_20_ops
changelog:
  - 1.0.0: Initial — local branch classification (merged/stale/active), worktree prune, orphan branch delete, --all-herus fleet iteration, safe-by-default dry-run
```
