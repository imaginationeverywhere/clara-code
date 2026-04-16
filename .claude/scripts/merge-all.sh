#!/usr/bin/env bash
# merge-all.sh — merge every branch into develop, push, delete every branch except main+develop.
# No flags. Runs on the current repo. Local AND remote.
#
# Preserves: main, develop, HEAD, backup/*
# Skips: branches that conflict (aborts merge, logs, continues)

set -eo pipefail

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "ERROR: not a git repository"; exit 1
fi

REPO=$(basename "$(git rev-parse --show-toplevel)")
PRESERVE='^(main|develop|HEAD|backup/.*)$'

echo "=== merge-all: $REPO ==="

git fetch --all --prune --quiet 2>/dev/null || true

# Need develop to merge into
if ! git show-ref --verify --quiet refs/heads/develop; then
  echo "✗ no develop branch — aborting"; exit 1
fi

# Checkout + update develop
git checkout develop >/dev/null 2>&1 || { echo "✗ cannot checkout develop (dirty tree?)"; exit 1; }
git pull origin develop --quiet 2>/dev/null || true

MERGED=()
CONFLICT=()
ALREADY=()

# Merge every origin branch into develop
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
done < <(git for-each-ref --format='%(refname:short)' refs/remotes/origin/ | grep -v '^origin/HEAD$')

# Push develop if anything new landed
if [ ${#MERGED[@]} -gt 0 ]; then
  if git push origin develop >/dev/null 2>&1; then
    echo "  ✓ pushed develop (+${#MERGED[@]} branches)"
  else
    echo "  ✗ push develop FAILED"; exit 1
  fi
fi

# Delete EVERY branch except main + develop + backup/* — local AND remote
DELETED_LOCAL=0
DELETED_REMOTE=0
FAILED_DELETE=()

# Local branches
while IFS= read -r br; do
  [ -z "$br" ] && continue
  [[ "$br" =~ $PRESERVE ]] && continue
  if git branch -D "$br" >/dev/null 2>&1; then
    DELETED_LOCAL=$((DELETED_LOCAL+1))
  fi
done < <(git for-each-ref --format='%(refname:short)' refs/heads/)

# Remote branches (everything on origin except preserved)
while IFS= read -r ref; do
  br="${ref#origin/}"
  [ -z "$br" ] && continue
  [ "$br" = "HEAD" ] && continue
  [[ "$br" =~ $PRESERVE ]] && continue
  if git push origin --delete "$br" >/dev/null 2>&1; then
    DELETED_REMOTE=$((DELETED_REMOTE+1))
  else
    FAILED_DELETE+=("$br")
  fi
done < <(git for-each-ref --format='%(refname:short)' refs/remotes/origin/ | grep -v '^origin/HEAD$')

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  merged into develop:   ${#MERGED[@]}"
echo "  already in develop:    ${#ALREADY[@]}"
echo "  conflict (skipped):    ${#CONFLICT[@]}"
echo "  deleted local:         $DELETED_LOCAL"
echo "  deleted remote:        $DELETED_REMOTE"
[ ${#FAILED_DELETE[@]} -gt 0 ] && echo "  delete failed:         ${#FAILED_DELETE[@]} (branch protection?)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ${#CONFLICT[@]} -gt 0 ]; then
  echo ""
  echo "Branches left untouched (conflicts — rebase manually):"
  printf '  %s\n' "${CONFLICT[@]}"
fi
