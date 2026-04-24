#!/bin/bash
# push-herus.sh — Fast parallel git push for all Herus
# Since symlinks don't travel with git, this commits the symlink itself
# and pushes. GitHub stores symlinks as text files pointing to the target.
#
# Usage:
#   ./push-herus.sh                    # Push all Herus (8 parallel)
#   ./push-herus.sh --jobs 4           # Push 4 at a time
#   ./push-herus.sh --dry-run          # Show what would happen
#   ./push-herus.sh --message "msg"    # Custom commit message

JOBS=8
DRY_RUN=false
COMMIT_MSG="chore(auset): sync platform commands + agents (symlinked)"

while [[ $# -gt 0 ]]; do
  case $1 in
    --jobs) JOBS="$2"; shift 2;;
    --dry-run) DRY_RUN=true; shift;;
    --message) COMMIT_MSG="$2"; shift 2;;
    *) shift;;
  esac
done

# Discover Herus (only top-level git repos, not nested)
HERUS=()
while IFS= read -r dir; do
  PROJECT=$(echo "$dir" | sed 's|/.claude$||')
  # Only include if this project IS a git root (has its own .git)
  if [ -d "$PROJECT/.git" ]; then
    HERUS+=("$PROJECT")
  fi
done < <(find /Volumes/X10-Pro/Native-Projects -maxdepth 4 -name ".claude" -type d 2>/dev/null \
  | grep -v node_modules | grep -v ".git/" | grep -v quik-nation-ai-boilerplate | sort)

TOTAL=${#HERUS[@]}
echo "╔══════════════════════════════════════════╗"
echo "║  PUSH HERUS — $TOTAL repos, $JOBS parallel     ║"
echo "╚══════════════════════════════════════════╝"
echo ""

if $DRY_RUN; then
  echo "[DRY RUN] Would push these repos:"
  for P in "${HERUS[@]}"; do echo "  $(basename $P)"; done
  exit 0
fi

# Create temp dir for results
RESULTS_DIR=$(mktemp -d)

push_one() {
  local PROJECT="$1"
  local NAME=$(basename "$PROJECT")
  local RESULT_FILE="$RESULTS_DIR/$NAME"
  
  cd "$PROJECT" || { echo "SKIP (can't cd)" > "$RESULT_FILE"; return; }
  
  # Check remote
  local REMOTE=$(git remote 2>/dev/null | head -1)
  if [ -z "$REMOTE" ]; then
    echo "SKIP (no remote)" > "$RESULT_FILE"
    return
  fi
  
  local BRANCH=$(git branch --show-current 2>/dev/null)
  if [ -z "$BRANCH" ]; then
    echo "SKIP (detached HEAD)" > "$RESULT_FILE"
    return
  fi
  
  # Stage .claude/ and .cursor/ 
  git add .claude/ .cursor/ 2>/dev/null
  
  if git diff --cached --quiet 2>/dev/null; then
    echo "SKIP (nothing to commit)" > "$RESULT_FILE"
    return
  fi
  
  # Commit
  git commit -m "$COMMIT_MSG" --quiet 2>/dev/null
  if [ $? -ne 0 ]; then
    echo "FAILED (commit error)" > "$RESULT_FILE"
    return
  fi
  
  # Push
  local PUSH_OUT=$(git push "$REMOTE" "$BRANCH" 2>&1)
  if [ $? -eq 0 ]; then
    echo "PUSHED ($BRANCH)" > "$RESULT_FILE"
  else
    local ERR=$(echo "$PUSH_OUT" | grep -i "error\|reject\|fatal" | head -1 | head -c 60)
    echo "FAILED ($ERR)" > "$RESULT_FILE"
  fi
}

export -f push_one
export RESULTS_DIR COMMIT_MSG

# Check if GNU parallel is available
if command -v parallel &>/dev/null; then
  printf '%s\n' "${HERUS[@]}" | parallel -j$JOBS push_one {}
else
  # Fallback: xargs with background jobs
  RUNNING=0
  for PROJECT in "${HERUS[@]}"; do
    push_one "$PROJECT" &
    RUNNING=$((RUNNING + 1))
    if [ $RUNNING -ge $JOBS ]; then
      wait -n 2>/dev/null || wait
      RUNNING=$((RUNNING - 1))
    fi
  done
  wait
fi

# Collect results
PUSHED=0; SKIPPED=0; FAILED=0
echo ""
for RESULT_FILE in "$RESULTS_DIR"/*; do
  NAME=$(basename "$RESULT_FILE")
  STATUS=$(cat "$RESULT_FILE")
  
  case "$STATUS" in
    PUSHED*) PUSHED=$((PUSHED + 1)); echo "  ✓ $NAME ... $STATUS";;
    SKIP*) SKIPPED=$((SKIPPED + 1)); echo "  - $NAME ... $STATUS";;
    FAILED*) FAILED=$((FAILED + 1)); echo "  ✗ $NAME ... $STATUS";;
  esac
done

rm -rf "$RESULTS_DIR"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  $PUSHED pushed | $SKIPPED skipped | $FAILED failed  ║"
echo "╚══════════════════════════════════════════╝"
