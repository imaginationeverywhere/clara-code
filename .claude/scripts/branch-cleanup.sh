#!/usr/bin/env bash
# branch-cleanup.sh — merge all branches into develop, delete everything except main + develop.
# Replaces: git-sweep.sh + merge-all.sh
#
# What it does:
#   1. git fetch --all --prune
#   2. git worktree prune (clean orphaned worktrees)
#   3. git checkout develop && git pull
#   4. Merge every origin branch (except main/develop) into develop
#   5. git push origin develop
#   6. Delete every local branch except main/develop
#   7. Delete every remote branch except main/develop
#
# Conflict branches are skipped (merge --abort) and kept so you can resolve manually.

set -eo pipefail

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "ERROR: not a git repository" >&2
  exit 1
fi

REPO=$(basename "$(git rev-parse --show-toplevel)")
PRESERVE='^(main|develop)$'

MERGED=()
CONFLICT=()
ALREADY=()

is_conflict_branch() {
  local b="$1"
  for c in "${CONFLICT[@]}"; do
    [ "$c" = "$b" ] && return 0
  done
  return 1
}

echo ""
echo "=== branch-cleanup: $REPO ==="
echo ""

# --- Step 1: Fetch + prune ---
echo "[1/7] Fetching and pruning..."
git fetch --all --prune --quiet 2>/dev/null || true

# --- Step 2: Worktree cleanup ---
echo "[2/7] Cleaning orphaned worktrees..."
local_wt_count=$(git worktree list --porcelain 2>/dev/null | grep -c "^prunable" || echo "0")
git worktree prune -v 2>/dev/null || true
# Delete dangling worktree-agent-* branches with no backing worktree
all_wt_branches=$(git worktree list --porcelain 2>/dev/null | awk '/^branch refs\/heads\// { sub(/^refs\/heads\//,"",$2); print $2 }')
wt_deleted=0
while IFS= read -r b; do
  [[ -z "$b" ]] && continue
  if ! echo "$all_wt_branches" | grep -qxF "$b"; then
    git branch -D "$b" 2>/dev/null && wt_deleted=$((wt_deleted + 1)) || true
  fi
done < <(git for-each-ref --format='%(refname:short)' refs/heads/worktree-agent-\* 2>/dev/null)
echo "  worktrees pruned, $wt_deleted dangling agent branches removed"

# --- Step 3: Checkout develop ---
echo "[3/7] Checking out develop..."
if ! git show-ref --verify --quiet refs/heads/develop; then
  echo "ERROR: no local 'develop' branch — aborting" >&2
  exit 1
fi
git checkout develop --quiet
git pull origin develop --quiet 2>/dev/null || true

# --- Step 4: Merge all origin branches into develop ---
echo "[4/7] Merging all branches into develop..."
while IFS= read -r ref; do
  br="${ref#origin/}"
  [ -z "$br" ] && continue
  [ "$br" = "HEAD" ] && continue
  [[ "$br" =~ $PRESERVE ]] && continue

  if git merge-base --is-ancestor "origin/$br" develop 2>/dev/null; then
    ALREADY+=("$br")
    continue
  fi

  if git merge --no-edit --no-ff "origin/$br" -m "chore: merge $br into develop" >/dev/null 2>&1; then
    MERGED+=("$br")
    echo "  ✓ merged: $br"
  else
    git merge --abort 2>/dev/null || true
    CONFLICT+=("$br")
    echo "  ⚠ conflict (skipped): $br"
  fi
done < <(git for-each-ref --format='%(refname:short)' refs/remotes/origin/ | grep -v '^origin/HEAD$' || true)

# --- Step 5: Push develop ---
echo "[5/7] Pushing develop..."
git push origin develop --quiet 2>/dev/null || echo "  ⚠ push failed (check permissions)"

# --- Step 6: Delete local branches ---
echo "[6/7] Deleting local branches..."
DELETED_LOCAL=0
while IFS= read -r br; do
  [ -z "$br" ] && continue
  [[ "$br" =~ $PRESERVE ]] && continue
  is_conflict_branch "$br" && continue
  if git branch -D "$br" >/dev/null 2>&1; then
    DELETED_LOCAL=$((DELETED_LOCAL + 1))
  fi
done < <(git for-each-ref --format='%(refname:short)' refs/heads/)

# --- Step 7: Delete remote branches ---
echo "[7/7] Deleting remote branches..."
DELETED_REMOTE=0
FAILED_DELETE=()
while IFS= read -r ref; do
  br="${ref#origin/}"
  [ -z "$br" ] && continue
  [ "$br" = "HEAD" ] && continue
  [[ "$br" =~ $PRESERVE ]] && continue
  is_conflict_branch "$br" && continue
  if git push origin --delete "$br" >/dev/null 2>&1; then
    DELETED_REMOTE=$((DELETED_REMOTE + 1))
  else
    FAILED_DELETE+=("$br")
  fi
done < <(git for-each-ref --format='%(refname:short)' refs/remotes/origin/ | grep -v '^origin/HEAD$' || true)

# --- Summary ---
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  merged into develop:   ${#MERGED[@]}"
echo "  already in develop:    ${#ALREADY[@]}"
echo "  conflict (kept):       ${#CONFLICT[@]}"
echo "  deleted local:         $DELETED_LOCAL"
echo "  deleted remote:        $DELETED_REMOTE"
echo "  worktree cleanup:      $wt_deleted agent branches"
[ ${#FAILED_DELETE[@]} -gt 0 ] && echo "  delete failed:         ${#FAILED_DELETE[@]} (branch protection?)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  remaining branches:    main, develop"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ${#CONFLICT[@]} -gt 0 ]; then
  echo ""
  echo "These branches had conflicts and were NOT deleted:"
  printf '  %s\n' "${CONFLICT[@]}"
  echo ""
  echo "Resolve them manually, then run /branch-cleanup again."
fi

echo ""
echo "== branch-cleanup complete =="
