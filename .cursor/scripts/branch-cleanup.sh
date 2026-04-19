#!/usr/bin/env bash
# branch-cleanup.sh — merge all branches into develop; delete everything else.
# Preserves: main, develop, and branch named origin (origin/origin). Replaces git-sweep.sh + merge-all.sh.
#
# What it does:
#   1. git fetch --all --prune
#   2. git worktree prune + delete dangling worktree-agent-* branches
#   3. git checkout develop && git pull
#   4. Merge every origin branch (except main/develop/origin) into develop (--no-ff)
#   5. git push origin develop
#   6. Delete every local branch except main/develop/origin
#   7. Delete every remote branch except main/develop/origin
#
# Conflict branches are skipped (merge --abort) and kept so you can resolve manually.

set -eo pipefail

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "ERROR: not a git repository" >&2
  exit 1
fi

REPO=$(basename "$(git rev-parse --show-toplevel)")
# Short branch name (e.g. "origin" for refs/remotes/origin/origin) — never merged or deleted.
PRESERVE='^(main|develop|origin)$'

MERGED=()
CONFLICT=()
ALREADY=()

is_conflict_branch() {
  local b="$1"
  local c
  for c in "${CONFLICT[@]}"; do
    [ "$c" = "$b" ] && return 0
  done
  return 1
}

# Newline-separated branch names currently checked out in some worktree (see git worktree list).
worktree_list_branches_in_use() {
  git worktree list 2>/dev/null | while IFS= read -r line; do
    [[ "$line" =~ \[([^]]+)\] ]] && echo "${BASH_REMATCH[1]}"
  done | sort -u
}

echo ""
echo "=== branch-cleanup: $REPO ==="
echo ""

# --- Step 1: Fetch + prune ---
echo "[1/7] git fetch --all --prune"
git fetch --all --prune

# --- Step 2: Worktree cleanup ---
echo "[2/7] git worktree prune; remove dangling worktree-agent-* branches"
git worktree prune

branches_in_use=$(worktree_list_branches_in_use || true)
wt_deleted=0
while IFS= read -r b; do
  [[ -z "$b" ]] && continue
  [[ "$b" != worktree-agent-* ]] && continue
  if echo "$branches_in_use" | grep -qxF "$b"; then
    continue
  fi
  if git branch -D "$b" 2>/dev/null; then
    wt_deleted=$((wt_deleted + 1))
  fi
done < <(git for-each-ref --format='%(refname:short)' refs/heads/ 2>/dev/null)

echo "  dangling worktree-agent branches removed: $wt_deleted"

# --- Step 3: Checkout develop ---
echo "[3/7] git checkout develop && git pull"
if ! git show-ref --verify --quiet refs/heads/develop; then
  echo "ERROR: no local 'develop' branch — aborting" >&2
  exit 1
fi
git checkout develop
if ! git pull; then
  echo "WARN: git pull failed; trying: git pull origin develop" >&2
  if ! git pull origin develop; then
    echo "ERROR: could not fast-forward develop — fix network/upstream, then retry." >&2
    exit 1
  fi
fi

# --- Step 4: Merge all origin branches into develop ---
echo "[4/7] Merging origin/* into develop (except main, develop, origin)"
while IFS= read -r ref; do
  br="${ref#origin/}"
  [ -z "$br" ] && continue
  [ "$br" = "HEAD" ] && continue
  [[ "$br" =~ $PRESERVE ]] && continue

  if git merge-base --is-ancestor "origin/$br" develop 2>/dev/null; then
    ALREADY+=("$br")
    continue
  fi

  if git merge --no-ff --no-edit "origin/$br" -m "chore: merge $br into develop" >/dev/null 2>&1; then
    MERGED+=("$br")
    echo "  [merged] $br"
  else
    git merge --abort 2>/dev/null || true
    CONFLICT+=("$br")
    echo "  [conflict, skipped] $br"
  fi
done < <(git for-each-ref --format='%(refname:short)' refs/remotes/origin/ | grep -v '^origin/HEAD$' || true)

# --- Step 5: Push develop ---
echo "[5/7] git push origin develop"
git push origin develop

# --- Step 6: Delete local branches ---
echo "[6/7] Deleting local branches (except main, develop, origin, conflicts)"
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
echo "[7/7] Deleting remote branches (except main, develop, origin, conflicts)"
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
echo "------------------------------------------------------------------"
echo "  merged into develop:   ${#MERGED[@]}"
echo "  already in develop:    ${#ALREADY[@]}"
echo "  conflict (kept):       ${#CONFLICT[@]}"
echo "  deleted local:         $DELETED_LOCAL"
echo "  deleted remote:        $DELETED_REMOTE"
echo "  worktree-agent cleanup: $wt_deleted"
if [ ${#FAILED_DELETE[@]} -gt 0 ]; then
  echo "  delete failed:         ${#FAILED_DELETE[@]} (branch protection?)"
fi
echo "------------------------------------------------------------------"
echo "  preserved:             main, develop, origin"
echo "------------------------------------------------------------------"

if [ ${#CONFLICT[@]} -gt 0 ]; then
  echo ""
  echo "These branches had conflicts and were NOT deleted:"
  printf '  %s\n' "${CONFLICT[@]}"
  echo ""
  echo "Resolve them manually, then run /branch-cleanup again."
fi

echo ""
echo "== branch-cleanup complete =="
