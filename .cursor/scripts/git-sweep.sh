#!/usr/bin/env bash
# git-sweep.sh — prune merged branches + orphaned worktrees in a Heru repo.
# Owner: John Mercer Langston (git strategy) · Scaffolding: Ossie Davis (commands)
# v1.0.0
#
# Safe by default:
#   - NEVER touches: main, develop, current branch, backup/*
#   - Defaults to --dry-run unless --yes
#   - Requires --remote to delete origin branches
#   - Refuses to run outside a git repo
#
# Usage: git-sweep.sh [flags]
#   --dry-run           Preview only (default if neither --dry-run nor --yes set)
#   --yes               Apply changes (skips confirmation prompt)
#   --merged-only       Only touch branches fully merged into develop
#   --remote            Also delete matching origin branches
#   --worktrees         Worktree cleanup only (skip branch deletion)
#   --age N             Consider "stale" = unmerged AND older than N days (default 30)
#   --all-herus LIST    Iterate every repo in LIST (newline-separated paths) instead of $PWD
#   -h, --help          This text

set -euo pipefail

DRY_RUN=""
YES=false
MERGED_ONLY=false
REMOTE=false
WORKTREES_ONLY=false
AGE_DAYS=30
ALL_HERUS_FILE=""
PRESERVE_REGEX='^(main|develop|HEAD|backup/.*)$'

usage() {
  sed -n '2,15p' "$0" | sed 's/^# \{0,1\}//'
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)      DRY_RUN=true; shift ;;
    --yes)          YES=true; shift ;;
    --merged-only)  MERGED_ONLY=true; shift ;;
    --remote)       REMOTE=true; shift ;;
    --worktrees)    WORKTREES_ONLY=true; shift ;;
    --age)          AGE_DAYS="$2"; shift 2 ;;
    --all-herus)    ALL_HERUS_FILE="$2"; shift 2 ;;
    -h|--help)      usage; exit 0 ;;
    *)              echo "Unknown arg: $1"; usage; exit 1 ;;
  esac
done

# Default to dry-run unless --yes
if [[ -z "$DRY_RUN" && "$YES" != true ]]; then
  DRY_RUN=true
fi
DRY_RUN="${DRY_RUN:-false}"

[[ ! "$AGE_DAYS" =~ ^[0-9]+$ ]] && { echo "ERROR: --age must be numeric"; exit 1; }

# ---------- core sweep for ONE repo ----------
sweep_repo() {
  local repo="$1"
  cd "$repo" 2>/dev/null || { echo "SKIP: $repo (not accessible)"; return 0; }

  if ! git rev-parse --git-dir >/dev/null 2>&1; then
    echo "SKIP: $repo (not a git repo)"
    return 0
  fi

  local repo_name
  repo_name="$(basename "$repo")"
  echo ""
  echo "=== $repo_name ==="

  # Always fetch+prune so deleted-on-remote branches disappear locally
  git fetch --all --prune --quiet 2>/dev/null || true

  local current
  current=$(git symbolic-ref --short HEAD 2>/dev/null || echo "DETACHED")

  # -------- worktrees --------
  local wt_output
  wt_output=$(git worktree list --porcelain 2>/dev/null || echo "")
  local orphan_worktrees=()
  local orphan_branches=()
  local wt_path="" wt_branch="" wt_prunable=false
  while IFS= read -r line; do
    if [[ "$line" =~ ^worktree\ (.+)$ ]]; then
      if $wt_prunable; then
        orphan_worktrees+=("$wt_path")
        [[ -n "$wt_branch" ]] && orphan_branches+=("$wt_branch")
      fi
      wt_path="${BASH_REMATCH[1]}"
      wt_branch=""
      wt_prunable=false
    elif [[ "$line" =~ ^branch\ refs/heads/(.+)$ ]]; then
      wt_branch="${BASH_REMATCH[1]}"
    elif [[ "$line" == "prunable"* ]]; then
      wt_prunable=true
    fi
  done <<< "$wt_output"
  # Tail entry
  if $wt_prunable; then
    orphan_worktrees+=("$wt_path")
    [[ -n "$wt_branch" ]] && orphan_branches+=("$wt_branch")
  fi

  # Also catch local branches named worktree-agent-* whose worktree isn't in the list
  local all_wt_branches
  all_wt_branches=$(echo "$wt_output" | awk '/^branch / {sub(/^refs\/heads\//,"",$2); print $2}')
  while IFS= read -r b; do
    if ! echo "$all_wt_branches" | grep -qxF "$b"; then
      orphan_branches+=("$b")
    fi
  done < <(git for-each-ref --format='%(refname:short)' refs/heads/worktree-agent-\* 2>/dev/null)

  # -------- branch classification (skip if --worktrees) --------
  local merged=() stale=() alive=()
  if ! $WORKTREES_ONLY; then
    # Merged into develop (or main if no develop)
    local base_branch=""
    if git show-ref --verify --quiet refs/heads/develop; then
      base_branch="develop"
    elif git show-ref --verify --quiet refs/heads/main; then
      base_branch="main"
    fi

    local now_epoch
    now_epoch=$(date +%s)
    local age_cutoff=$((now_epoch - AGE_DAYS * 86400))

    while IFS='|' read -r br ts; do
      [[ -z "$br" ]] && continue
      # Preserve list
      if [[ "$br" =~ $PRESERVE_REGEX ]]; then continue; fi
      if [[ "$br" == "$current" ]]; then continue; fi

      local is_merged=false
      if [[ -n "$base_branch" ]]; then
        if git merge-base --is-ancestor "$br" "$base_branch" 2>/dev/null; then
          is_merged=true
        fi
      fi

      if $is_merged; then
        merged+=("$br")
      elif [[ "$ts" -lt "$age_cutoff" ]]; then
        stale+=("$br|$ts")
      else
        alive+=("$br")
      fi
    done < <(git for-each-ref --format='%(refname:short)|%(committerdate:unix)' refs/heads/)
  fi

  # -------- report --------
  echo "  current:     $current"
  echo "  worktrees:   ${#orphan_worktrees[@]} orphan · ${#orphan_branches[@]} dangling branches"
  if ! $WORKTREES_ONLY; then
    echo "  branches:    ${#merged[@]} merged · ${#stale[@]} stale (>${AGE_DAYS}d) · ${#alive[@]} active"
  fi

  if [[ ${#merged[@]} -gt 0 ]]; then
    echo "  MERGED (safe to delete):"
    printf '    %s\n' "${merged[@]}"
  fi
  if [[ ${#stale[@]} -gt 0 ]] && ! $MERGED_ONLY; then
    echo "  STALE unmerged (review before deletion):"
    for s in "${stale[@]}"; do
      local br="${s%|*}" ts="${s#*|}"
      local days=$(( (now_epoch - ts) / 86400 ))
      printf '    %s (%d days)\n' "$br" "$days"
    done
  fi
  if [[ ${#orphan_branches[@]} -gt 0 ]]; then
    echo "  ORPHAN worktree branches:"
    printf '    %s\n' "${orphan_branches[@]}"
  fi

  # -------- apply --------
  if $DRY_RUN; then
    echo "  [dry-run] no changes applied"
    return 0
  fi

  # Confirm if not --yes and >20 operations
  local total_ops=$((${#merged[@]} + ${#orphan_branches[@]} + ${#orphan_worktrees[@]}))
  if ! $YES && [[ $total_ops -gt 20 ]]; then
    read -r -p "  Proceed with $total_ops operations on $repo_name? [y/N] " ans
    [[ "$ans" != "y" && "$ans" != "Y" ]] && { echo "  aborted"; return 0; }
  fi

  # Worktree prune (removes entries for missing paths)
  if [[ ${#orphan_worktrees[@]} -gt 0 ]]; then
    git worktree prune -v || true
  fi

  # Delete merged local branches
  if ! $WORKTREES_ONLY; then
    for br in "${merged[@]}"; do
      git branch -D "$br" 2>/dev/null && echo "  ✓ deleted local: $br" || echo "  ✗ failed: $br"
      if $REMOTE; then
        git push origin --delete "$br" 2>/dev/null && echo "  ✓ deleted origin: $br" || true
      fi
    done
  fi

  # Delete orphan worktree branches
  for br in "${orphan_branches[@]}"; do
    [[ "$br" =~ $PRESERVE_REGEX ]] && continue
    git branch -D "$br" 2>/dev/null && echo "  ✓ deleted orphan: $br" || true
  done

  echo "  done."
}

# ---------- run ----------
if [[ -n "$ALL_HERUS_FILE" ]]; then
  [[ ! -f "$ALL_HERUS_FILE" ]] && { echo "ERROR: --all-herus file not found: $ALL_HERUS_FILE"; exit 1; }
  while IFS= read -r repo; do
    [[ -z "$repo" || "$repo" == "#"* ]] && continue
    sweep_repo "$repo" || true
  done < "$ALL_HERUS_FILE"
else
  sweep_repo "$(pwd -P)"
fi

echo ""
if $DRY_RUN; then
  echo "== dry-run complete. re-run with --yes to apply. =="
else
  echo "== sweep complete =="
fi
