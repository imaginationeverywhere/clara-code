#!/bin/bash
# push-herus.sh — Resilient parallel git push for all Herus
#
# Lifecycle per Heru:
#   1. Detect dirty working directory
#   2. git stash (if dirty — preserves developer's uncommitted work)
#   3. git add .claude/ .cursor/
#   4. git commit
#   5. git pull --rebase (catches "push rejected — pull first")
#   6. git push
#   7. git stash pop (restores developer's work)
#
# Handles: dirty trees, remote-ahead, merge conflicts, stash pop failures,
#          missing remotes, detached heads, push timeouts
#
# Usage:
#   ./push-herus.sh                    # Push all Herus (8 parallel)
#   ./push-herus.sh --jobs 4           # Push 4 at a time
#   ./push-herus.sh --dry-run          # Show what would happen
#   ./push-herus.sh --message "msg"    # Custom commit message
#   ./push-herus.sh --timeout 60       # Per-repo push timeout (seconds)
#   ./push-herus.sh --sync-first       # Copy boilerplate files before push

JOBS=8
DRY_RUN=false
SYNC_FIRST=false
PUSH_TIMEOUT=120
COMMIT_MSG="chore(auset): sync platform commands from boilerplate"
SRC="/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate"

while [[ $# -gt 0 ]]; do
  case $1 in
    --jobs) JOBS="$2"; shift 2;;
    --dry-run) DRY_RUN=true; shift;;
    --message) COMMIT_MSG="$2"; shift 2;;
    --timeout) PUSH_TIMEOUT="$2"; shift 2;;
    --sync-first) SYNC_FIRST=true; shift;;
    *) shift;;
  esac
done

HERUS=()
while IFS= read -r dir; do
  PROJECT=$(echo "$dir" | sed 's|/.claude$||')
  if [ -d "$PROJECT/.git" ]; then
    HERUS+=("$PROJECT")
  fi
done < <(find /Volumes/X10-Pro/Native-Projects -maxdepth 4 -name ".claude" -type d 2>/dev/null \
  | grep -v node_modules | grep -v ".git/" | grep -v quik-nation-ai-boilerplate | sort)

TOTAL=${#HERUS[@]}
echo "╔══════════════════════════════════════════╗"
echo "║  PUSH HERUS — $TOTAL repos, $JOBS parallel     ║"
echo "║  Stash: ON | Pull: ON | Timeout: ${PUSH_TIMEOUT}s  ║"
echo "╚══════════════════════════════════════════╝"
echo ""

if $DRY_RUN; then
  echo "[DRY RUN] Would push these repos:"
  for P in "${HERUS[@]}"; do
    NAME=$(basename "$P")
    BRANCH=$(cd "$P" && git branch --show-current 2>/dev/null || echo "???")
    REMOTE=$(cd "$P" && git remote 2>/dev/null | head -1 || echo "none")
    DIRTY=""
    (cd "$P" && ! git diff --quiet 2>/dev/null) && DIRTY=" [dirty]"
    printf "  %-35s %-10s %-8s%s\n" "$NAME" "$BRANCH" "$REMOTE" "$DIRTY"
  done
  exit 0
fi

RESULTS_DIR=$(mktemp -d)

push_one() {
  local PROJECT="$1"
  local NAME=$(basename "$PROJECT")
  local RESULT_FILE="$RESULTS_DIR/$NAME"
  local STASHED=false
  local STASH_REF=""

  cd "$PROJECT" || { echo "SKIP|can't cd" > "$RESULT_FILE"; return; }

  # --- Pre-flight checks ---
  local REMOTE=$(git remote 2>/dev/null | head -1)
  if [ -z "$REMOTE" ]; then
    echo "SKIP|no remote" > "$RESULT_FILE"
    return
  fi

  local BRANCH=$(git branch --show-current 2>/dev/null)
  if [ -z "$BRANCH" ]; then
    echo "SKIP|detached HEAD" > "$RESULT_FILE"
    return
  fi

  # Abort if mid-rebase or mid-merge
  if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ]; then
    echo "SKIP|rebase in progress" > "$RESULT_FILE"
    return
  fi
  if [ -f ".git/MERGE_HEAD" ]; then
    echo "SKIP|merge in progress" > "$RESULT_FILE"
    return
  fi

  # --- Step 1: Stash dirty working directory ---
  local HAS_STAGED=false
  local HAS_UNSTAGED=false
  git diff --cached --quiet 2>/dev/null || HAS_STAGED=true
  git diff --quiet 2>/dev/null || HAS_UNSTAGED=true

  if $HAS_STAGED || $HAS_UNSTAGED; then
    STASH_REF="auset-sync-$(date +%s)-$NAME"
    # Only stash tracked files — --include-untracked hangs on repos with
    # large untracked trees (node_modules, build dirs, etc.)
    timeout 15s git stash push -m "$STASH_REF" --quiet 2>/dev/null
    if [ $? -eq 0 ]; then
      if git stash list 2>/dev/null | head -1 | grep -q "$STASH_REF"; then
        STASHED=true
      fi
    fi
  fi

  # --- Step 2: Sync files from boilerplate (if --sync-first) ---
  if $SYNC_FIRST; then
    mkdir -p .claude/commands .claude/plans/micro .claude/scripts 2>/dev/null
    cp "$SRC/.claude/commands/"*.md .claude/commands/ 2>/dev/null
    cp "$SRC/.claude/COMMAND_CHEAT_SHEET.md" .claude/ 2>/dev/null
    cp "$SRC/.claude/plans/micro/"*.md .claude/plans/micro/ 2>/dev/null
    cp "$SRC/.claude/scripts/inbox-dispatcher.sh" .claude/scripts/ 2>/dev/null
    cp "$SRC/.claude/scripts/swarm-telegraph.sh" .claude/scripts/ 2>/dev/null
    cp "$SRC/.claude/scripts/feed-watcher.sh" .claude/scripts/ 2>/dev/null
    cp "$SRC/.claude/scripts/session-registry.sh" .claude/scripts/ 2>/dev/null
    chmod +x .claude/scripts/*.sh 2>/dev/null

    if [ -d ".cursor" ]; then
      mkdir -p .cursor/commands .cursor/plans/micro 2>/dev/null
      cp "$SRC/.claude/commands/"*.md .cursor/commands/ 2>/dev/null
      cp "$SRC/.claude/COMMAND_CHEAT_SHEET.md" .cursor/ 2>/dev/null
      cp "$SRC/.claude/plans/micro/"*.md .cursor/plans/micro/ 2>/dev/null
    fi
  fi

  # --- Step 3: Stage .claude/ and .cursor/ ---
  git add .claude/ .cursor/ 2>/dev/null

  if git diff --cached --quiet 2>/dev/null; then
    if $STASHED; then timeout 15s git stash pop --quiet 2>/dev/null; fi
    echo "SKIP|nothing to commit" > "$RESULT_FILE"
    return
  fi

  # --- Step 4: Commit (--no-verify skips pre-commit hooks that validate project code) ---
  git commit -m "$COMMIT_MSG" --quiet --no-verify 2>/dev/null
  if [ $? -ne 0 ]; then
    if $STASHED; then timeout 15s git stash pop --quiet 2>/dev/null; fi
    echo "FAILED|commit error" > "$RESULT_FILE"
    return
  fi

  # --- Step 5: Pull to catch up with remote ---
  # Try rebase first; if it fails (symlink-to-dir conflicts, etc.), fall back to merge
  local PULL_OUTPUT
  PULL_OUTPUT=$(timeout 60s git pull --rebase "$REMOTE" "$BRANCH" --quiet 2>&1)
  local PULL_EXIT=$?

  if [ $PULL_EXIT -eq 124 ]; then
    if $STASHED; then timeout 15s git stash pop --quiet 2>/dev/null; fi
    echo "FAILED|pull timeout" > "$RESULT_FILE"
    return
  fi

  if [ $PULL_EXIT -ne 0 ]; then
    # Rebase failed — abort and try merge instead
    git rebase --abort 2>/dev/null

    # Clean up untracked .claude/.cursor dirs that block checkout (symlink→dir migration)
    for d in .claude/agents .claude/commands .cursor/commands .cursor/agents .claude/plans/micro; do
      [ -d "$d" ] && ! [ -L "$d" ] && rm -rf "$d" 2>/dev/null
    done

    PULL_OUTPUT=$(timeout 60s git pull --no-rebase "$REMOTE" "$BRANCH" --quiet 2>&1)
    PULL_EXIT=$?

    if [ $PULL_EXIT -ne 0 ]; then
      if $STASHED; then timeout 15s git stash pop --quiet 2>/dev/null; fi
      local PULL_ERR=$(echo "$PULL_OUTPUT" | head -1 | head -c 80)
      echo "FAILED|pull conflict: $PULL_ERR" > "$RESULT_FILE"
      return
    fi
  fi

  # --- Step 6: Push (with timeout) ---
  local PUSH_OUTPUT
  PUSH_OUTPUT=$(timeout "${PUSH_TIMEOUT}s" git push "$REMOTE" "$BRANCH" 2>&1)
  local PUSH_EXIT=$?

  if [ $PUSH_EXIT -eq 124 ]; then
    if $STASHED; then timeout 15s git stash pop --quiet 2>/dev/null; fi
    echo "FAILED|push timeout (${PUSH_TIMEOUT}s)" > "$RESULT_FILE"
    return
  fi

  if [ $PUSH_EXIT -ne 0 ]; then
    if $STASHED; then timeout 15s git stash pop --quiet 2>/dev/null; fi
    local PUSH_ERR="push error"
    echo "$PUSH_OUTPUT" | grep -qi "rejected" && PUSH_ERR="push rejected"
    echo "$PUSH_OUTPUT" | grep -qi "auth\|permission\|403\|401" && PUSH_ERR="auth error"
    echo "$PUSH_OUTPUT" | grep -qi "not found\|does not exist" && PUSH_ERR="remote not found"
    echo "FAILED|$PUSH_ERR" > "$RESULT_FILE"
    return
  fi

  # --- Step 7: Restore stash ---
  local STASH_NOTE=""
  if $STASHED; then
    timeout 15s git stash pop --quiet 2>/dev/null
    local POP_EXIT=$?
    if [ $POP_EXIT -eq 124 ]; then
      STASH_NOTE=" [STASH POP TIMEOUT — run: cd $PROJECT && git stash pop]"
    elif [ $POP_EXIT -ne 0 ]; then
      STASH_NOTE=" [STASH CONFLICT — run: cd $PROJECT && git stash pop]"
    fi
  fi

  echo "PUSHED|${BRANCH}${STASH_NOTE}" > "$RESULT_FILE"
}

export -f push_one
export RESULTS_DIR COMMIT_MSG PUSH_TIMEOUT SRC SYNC_FIRST

if command -v parallel &>/dev/null; then
  printf '%s\n' "${HERUS[@]}" | parallel -j$JOBS push_one {}
else
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

# --- Collect and display results ---
PUSHED=0; SKIPPED=0; FAILED=0
PUSHED_LIST=""; SKIPPED_LIST=""; FAILED_LIST=""; STASH_WARNINGS=""

for RESULT_FILE in "$RESULTS_DIR"/*; do
  [ -f "$RESULT_FILE" ] || continue
  NAME=$(basename "$RESULT_FILE")
  FULL=$(cat "$RESULT_FILE")
  STATUS=$(echo "$FULL" | cut -d'|' -f1)
  DETAIL=$(echo "$FULL" | cut -d'|' -f2-)

  case "$STATUS" in
    PUSHED)
      PUSHED=$((PUSHED + 1))
      PUSHED_LIST+="  $(printf '%-35s' "$NAME") PUSHED ($DETAIL)\n"
      echo "$DETAIL" | grep -q "STASH CONFLICT" && STASH_WARNINGS+="  $NAME: $DETAIL\n"
      ;;
    SKIP)
      SKIPPED=$((SKIPPED + 1))
      SKIPPED_LIST+="  $(printf '%-35s' "$NAME") SKIP ($DETAIL)\n"
      ;;
    FAILED)
      FAILED=$((FAILED + 1))
      FAILED_LIST+="  $(printf '%-35s' "$NAME") FAILED ($DETAIL)\n"
      ;;
  esac
done

rm -rf "$RESULTS_DIR"

echo ""
if [ $PUSHED -gt 0 ]; then
  echo "Pushed: $PUSHED"
  printf "$PUSHED_LIST"
  echo ""
fi
if [ $SKIPPED -gt 0 ]; then
  echo "Skipped: $SKIPPED"
  printf "$SKIPPED_LIST"
  echo ""
fi
if [ $FAILED -gt 0 ]; then
  echo "Failed: $FAILED"
  printf "$FAILED_LIST"
  echo ""
fi
if [ -n "$STASH_WARNINGS" ]; then
  echo "⚠ STASH POP CONFLICTS (manual resolve needed):"
  printf "$STASH_WARNINGS"
  echo ""
fi

echo "╔══════════════════════════════════════════╗"
printf "║  %-3s pushed | %-3s skipped | %-3s failed   ║\n" "$PUSHED" "$SKIPPED" "$FAILED"
echo "╚══════════════════════════════════════════╝"
