#!/usr/bin/env bash
# git-sweep.sh — prune merged branches + orphaned worktrees in a Heru repo.
# Owner: John Mercer Langston (git strategy) · Scaffolding: Ossie Davis (commands)
# v1.0.0
#
# Safe by default:
#   - NEVER touches: main, develop, current branch, backup/*
#   - Defaults to --dry-run unless --apply or --yes
#   - Requires --remote to delete origin branches
#   - Refuses to run outside a git repo (single-repo mode; fleet mode skips bad paths)
#
# Usage: git-sweep.sh [flags]
#   --dry-run           Preview only (default)
#   --apply             Apply changes; confirm if >20 operations
#   --yes               Apply changes without confirmation (automation)
#   --merged-only       Only delete branches merged into develop/main; skip worktree cleanup on apply
#   --remote            Also delete matching origin branches
#   --worktrees         Worktree cleanup only (skip merged-branch deletion)
#   --merge-prs         Before deletion, merge every OPEN + MERGEABLE PR into its base (develop/main) via gh, then delete the branch. Requires gh CLI.
#   --force-merge-all   BRUTE: checkout develop, raw-git-merge EVERY origin branch (except main/develop/backup/current), push develop, delete merged branches. Ignores PR state, branch protection, CI — aborts on conflict, skips the branch, continues. Combine with --remote to also delete origin branches.
#   --age N             Consider "stale" = unmerged AND older than N days (default 30)
#   --all-herus LIST    Iterate every repo in LIST (newline-separated paths) instead of $PWD
#   -h, --help          This text

set -eo pipefail
# nounset intentionally off: macOS bash 3.2 errors on "${arr[@]}" when arr is empty

DRY_RUN=true
DRY_RUN_EXPLICIT=false
SKIP_CONFIRM=false
YES=false
APPLY=false
MERGED_ONLY=false
REMOTE=false
WORKTREES_ONLY=false
AGE_DAYS=30
ALL_HERUS_FILE=""
MERGE_PRS=false
FORCE_MERGE_ALL=false
PRESERVE_REGEX='^(main|develop|HEAD|backup/.*)$'

usage() {
  sed -n '2,22p' "$0" | sed 's/^# \{0,1\}//'
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)      DRY_RUN_EXPLICIT=true; DRY_RUN=true; shift ;;
    --apply)        APPLY=true; shift ;;
    --yes)          YES=true; shift ;;
    --merged-only)  MERGED_ONLY=true; shift ;;
    --remote)       REMOTE=true; shift ;;
    --worktrees)    WORKTREES_ONLY=true; shift ;;
    --merge-prs)    MERGE_PRS=true; shift ;;
    --force-merge-all) FORCE_MERGE_ALL=true; shift ;;
    --age)          AGE_DAYS="$2"; shift 2 ;;
    --all-herus)    ALL_HERUS_FILE="$2"; shift 2 ;;
    -h|--help)      usage; exit 0 ;;
    *)              echo "Unknown arg: $1"; usage; exit 1 ;;
  esac
done

if [[ "$YES" == true ]]; then
  DRY_RUN=false
  SKIP_CONFIRM=true
elif [[ "$APPLY" == true ]]; then
  DRY_RUN=false
  SKIP_CONFIRM=false
fi
if [[ "$DRY_RUN_EXPLICIT" == true ]]; then
  DRY_RUN=true
fi

[[ ! "$AGE_DAYS" =~ ^[0-9]+$ ]] && { echo "ERROR: --age must be numeric"; exit 1; }

# Dedupe newline-separated list (bash 3.2–safe)
dedupe_lines() {
  LC_ALL=C sort -u
}

# ---------- core sweep for ONE repo ----------
# Args: repo path, is_fleet (true = skip non-git with message instead of exit)
sweep_repo() {
  local repo="$1"
  local is_fleet="${2:-false}"

  cd "$repo" 2>/dev/null || { echo "SKIP: $repo (not accessible)"; return 0; }

  if ! git rev-parse --git-dir >/dev/null 2>&1; then
    if [[ "$is_fleet" == true ]]; then
      echo "SKIP: $repo (not a git repo)"
      return 0
    fi
    echo "ERROR: not a git repository: $repo" >&2
    return 1
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
  local orphan_branches_raw=()
  local wt_path="" wt_branch="" wt_prunable=false
  while IFS= read -r line; do
    if [[ "$line" =~ ^worktree\ (.+)$ ]]; then
      if $wt_prunable; then
        orphan_worktrees+=("$wt_path")
        [[ -n "$wt_branch" ]] && orphan_branches_raw+=("$wt_branch")
      fi
      wt_path="${BASH_REMATCH[1]}"
      wt_branch=""
      wt_prunable=false
    elif [[ "$line" =~ ^branch\ refs/heads/(.+)$ ]]; then
      wt_branch="${BASH_REMATCH[1]}"
    elif [[ "$line" == prunable* ]]; then
      wt_prunable=true
    fi
  done <<< "$wt_output"
  if $wt_prunable; then
    orphan_worktrees+=("$wt_path")
    [[ -n "$wt_branch" ]] && orphan_branches_raw+=("$wt_branch")
  fi

  local all_wt_branches
  all_wt_branches=$(echo "$wt_output" | awk '/^branch refs\/heads\// { sub(/^refs\/heads\//,"",$2); print $2 }')

  while IFS= read -r b; do
    [[ -z "$b" ]] && continue
    if ! echo "$all_wt_branches" | grep -qxF "$b"; then
      orphan_branches_raw+=("$b")
    fi
  done < <(git for-each-ref --format='%(refname:short)' refs/heads/worktree-agent-\* 2>/dev/null)

  local orphan_branches=()
  if ((${#orphan_branches_raw[@]} > 0)); then
    while IFS= read -r line; do
      [[ -z "$line" ]] && continue
      orphan_branches+=("$line")
    done < <(printf '%s\n' "${orphan_branches_raw[@]}" | dedupe_lines)
  fi

  # -------- branch classification (skip if --worktrees) --------
  local merged=() stale=() alive=()
  if ! $WORKTREES_ONLY; then
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
  if [[ ${#alive[@]} -gt 0 ]] && ! $MERGED_ONLY; then
    echo "  ACTIVE (recent, unmerged):"
    local max_show=20
    local shown=0
    for br in "${alive[@]}"; do
      if [[ $shown -ge $max_show ]]; then
        echo "    ... ($(( ${#alive[@]} - max_show )) more)"
        break
      fi
      echo "    $br"
      shown=$((shown + 1))
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

  local total_ops=0
  if ! $WORKTREES_ONLY; then
    total_ops=$((total_ops + ${#merged[@]}))
  fi
  if ! $MERGED_ONLY; then
    total_ops=$((total_ops + ${#orphan_branches[@]} + ${#orphan_worktrees[@]}))
  fi

  if ! $SKIP_CONFIRM && [[ $total_ops -gt 20 ]]; then
    read -r -p "  Proceed with $total_ops operations on $repo_name? [y/N] " ans
    [[ "$ans" != "y" && "$ans" != "Y" ]] && { echo "  aborted"; return 0; }
  fi

  if ! $MERGED_ONLY; then
    if [[ ${#orphan_worktrees[@]} -gt 0 ]]; then
      git worktree prune -v || true
    fi
  fi

  # -------- force-merge-all (raw git, bypasses PR flow) --------
  if $FORCE_MERGE_ALL; then
    local base="develop"
    if ! git show-ref --verify --quiet refs/heads/develop; then
      if git show-ref --verify --quiet refs/heads/main; then
        base="main"
        echo "  ⚠ force-merge-all: no develop; using main as base"
      else
        echo "  ⚠ force-merge-all: no develop or main; skipping"
        base=""
      fi
    fi
    if [[ -n "$base" ]]; then
      # Checkout + update base
      if git checkout "$base" >/dev/null 2>&1; then
        git pull origin "$base" --quiet 2>/dev/null || true
        local fm_merged=()
        local fm_conflict=()
        local fm_already=()
        while IFS= read -r ref; do
          local br="${ref#origin/}"
          [[ -z "$br" ]] && continue
          [[ "$br" == "HEAD" ]] && continue
          [[ "$br" =~ $PRESERVE_REGEX ]] && continue
          [[ "$br" == "$base" ]] && continue
          if git merge-base --is-ancestor "origin/$br" "$base" 2>/dev/null; then
            fm_already+=("$br")
            continue
          fi
          if git merge --no-edit --no-ff "origin/$br" -m "chore(git-sweep): force-merge $br into $base" >/dev/null 2>&1; then
            fm_merged+=("$br")
            echo "    ✓ merged: $br"
          else
            git merge --abort 2>/dev/null || true
            fm_conflict+=("$br")
            echo "    ⚠ conflict, skipped: $br"
          fi
        done < <(git for-each-ref --format='%(refname:short)' refs/remotes/origin/ | grep -v '^origin/HEAD$')
        # Push base if anything merged
        if [[ ${#fm_merged[@]} -gt 0 ]]; then
          if git push origin "$base" >/dev/null 2>&1; then
            echo "  ✓ pushed $base (merged ${#fm_merged[@]} branches)"
          else
            echo "  ✗ push $base FAILED — merges sit locally until you investigate"
          fi
        fi
        # Delete merged + already-merged branches (remote if --remote)
        local fm_all_to_delete=("${fm_merged[@]}" "${fm_already[@]}")
        for br in "${fm_all_to_delete[@]}"; do
          [[ -z "$br" ]] && continue
          git branch -D "$br" 2>/dev/null || true
          if $REMOTE; then
            git push origin --delete "$br" >/dev/null 2>&1 && echo "    ✓ deleted origin: $br" || true
          fi
        done
        echo "  force-merge-all: ${#fm_merged[@]} merged · ${#fm_already[@]} already-in-$base · ${#fm_conflict[@]} conflicts skipped"
      else
        echo "  ⚠ force-merge-all: cannot checkout $base (dirty tree?); skipping"
      fi
    fi
    # Skip the rest of the apply phase for this repo — force-merge did the work
    return 0
  fi

  # -------- merge-prs (runs BEFORE branch deletion) --------
  if $MERGE_PRS; then
    if ! command -v gh >/dev/null 2>&1; then
      echo "  ⚠ --merge-prs skipped: gh CLI not installed"
    else
      # gh returns mergeable=UNKNOWN briefly after opening; force-compute by viewing each PR first
      local prs_json
      prs_json=$(gh pr list --state open --limit 200 --json number,headRefName,baseRefName,mergeable,title 2>/dev/null || echo "[]")
      local pr_count
      pr_count=$(echo "$prs_json" | jq 'length' 2>/dev/null || echo 0)
      if [[ "$pr_count" -gt 0 ]]; then
        echo "  merging PRs: $pr_count open (only MERGEABLE + base in {develop,main})"
        # Force mergeable computation for UNKNOWN PRs
        while IFS= read -r pr_num; do
          [[ -z "$pr_num" ]] && continue
          gh pr view "$pr_num" --json mergeable >/dev/null 2>&1 || true
        done < <(echo "$prs_json" | jq -r '.[] | select(.mergeable == "UNKNOWN") | .number')
        # Re-fetch after compute
        prs_json=$(gh pr list --state open --limit 200 --json number,headRefName,baseRefName,mergeable,title 2>/dev/null || echo "[]")
        # Now merge the mergeable ones
        while IFS='|' read -r num head base mergeable; do
          [[ -z "$num" ]] && continue
          if [[ "$base" != "develop" && "$base" != "main" ]]; then
            echo "    skip #$num ($head → $base: non-standard base)"
            continue
          fi
          if [[ "$mergeable" != "MERGEABLE" ]]; then
            echo "    skip #$num [$mergeable] ($head)"
            continue
          fi
          if gh pr merge "$num" --squash --delete-branch >/dev/null 2>&1; then
            echo "    ✓ merged #$num $head → $base"
          else
            echo "    ✗ merge failed #$num $head"
          fi
        done < <(echo "$prs_json" | jq -r '.[] | "\(.number)|\(.headRefName)|\(.baseRefName)|\(.mergeable)"')

        # Re-fetch after merges so newly-merged branches show up in the merged-classification below
        git fetch --all --prune --quiet 2>/dev/null || true
        # Re-classify merged branches now that new merges landed
        if [[ -n "${base_branch:-}" ]]; then
          merged=()
          while IFS='|' read -r br ts; do
            [[ -z "$br" ]] && continue
            if [[ "$br" =~ $PRESERVE_REGEX ]]; then continue; fi
            if [[ "$br" == "$current" ]]; then continue; fi
            if git merge-base --is-ancestor "$br" "$base_branch" 2>/dev/null; then
              merged+=("$br")
            fi
          done < <(git for-each-ref --format='%(refname:short)|%(committerdate:unix)' refs/heads/)
        fi
      else
        echo "  merge-prs: no open PRs"
      fi
    fi
  fi

  if ! $WORKTREES_ONLY; then
    for br in "${merged[@]}"; do
      git branch -D "$br" 2>/dev/null && echo "  ✓ deleted local: $br" || echo "  ✗ failed: $br"
      if $REMOTE; then
        git push origin --delete "$br" 2>/dev/null && echo "  ✓ deleted origin: $br" || true
      fi
    done
  fi

  if ! $MERGED_ONLY; then
    for br in "${orphan_branches[@]}"; do
      [[ "$br" =~ $PRESERVE_REGEX ]] && continue
      [[ "$br" == "$current" ]] && continue
      git branch -D "$br" 2>/dev/null && echo "  ✓ deleted orphan: $br" || true
    done
  fi

  echo "  done."
}

# ---------- run ----------
if [[ -n "$ALL_HERUS_FILE" ]]; then
  [[ ! -f "$ALL_HERUS_FILE" ]] && { echo "ERROR: --all-herus file not found: $ALL_HERUS_FILE"; exit 1; }
  while IFS= read -r repo; do
    [[ -z "$repo" || "$repo" == "#"* ]] && continue
    sweep_repo "$repo" true || true
  done < "$ALL_HERUS_FILE"
else
  sweep_repo "$(pwd -P)" false || exit 1
fi

echo ""
if $DRY_RUN; then
  echo "== dry-run complete. re-run with --apply or --yes to apply. =="
else
  echo "== sweep complete =="
fi
