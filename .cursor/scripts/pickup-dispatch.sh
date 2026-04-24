#!/bin/bash
# pickup-dispatch.sh — parallel Cursor agent dispatcher for /pickup-prompt
#
# Handles what pickup-prompt --parallel N cannot: true bash forking + PID management.
# Install: cp .claude/scripts/pickup-dispatch.sh ~/bin/ && chmod +x ~/bin/pickup-dispatch.sh
#
# Usage (from within project dir):
#   pickup-dispatch.sh <parallel_count>
#   pickup-dispatch.sh 5      # run up to 5 cursor agents simultaneously
#
# Requirements:
#   - cursor CLI on PATH
#   - ~/.agent-creds/keychain-password (macOS QCS1)
#   - gh CLI on PATH (for PR creation)

set -o pipefail

MAX_PARALLEL="${1:-3}"
PROJECT_DIR="$(pwd)"

# ── Unlock macOS keychain (required for cursor CLI on QCS1) ──────────────────
KEYCHAIN_PASS=$(cat ~/.agent-creds/keychain-password 2>/dev/null)
if [ -n "$KEYCHAIN_PASS" ]; then
  security unlock-keychain -p "$KEYCHAIN_PASS" 2>/dev/null && echo "🔑 Keychain unlocked"
fi

# ── Verify cursor CLI works ───────────────────────────────────────────────────
if ! command -v cursor >/dev/null 2>&1; then
  echo "❌ cursor CLI not found. Ensure /opt/homebrew/bin is in PATH."
  exit 1
fi

# ── Date resolution ───────────────────────────────────────────────────────────
YEAR=$(date +%Y)
MONTH=$(date +%B)
DAY=$(date +%-d)
PROMPT_DIR="prompts/$YEAR/$MONTH/$DAY/1-not-started"
IN_PROGRESS_DIR="prompts/$YEAR/$MONTH/$DAY/2-in-progress"
COMPLETED_DIR="prompts/$YEAR/$MONTH/$DAY/3-completed"
FAILED_DIR="prompts/$YEAR/$MONTH/$DAY/4-failed"
mkdir -p "$IN_PROGRESS_DIR" "$COMPLETED_DIR" "$FAILED_DIR"

QUEUE_COUNT=$(ls "$PROMPT_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')
echo ""
echo "🚀 Parallel dispatch — up to $MAX_PARALLEL agents | $QUEUE_COUNT prompts in queue"
echo "📁 Project: $PROJECT_DIR"
echo "📋 Queue: $PROMPT_DIR"
echo ""

[ "$QUEUE_COUNT" -eq 0 ] && echo "✅ Queue empty — nothing to do." && exit 0

PIDS=()

while true; do
  # ── Wait if at capacity ──────────────────────────────────────────────────────
  while [ "${#PIDS[@]}" -ge "$MAX_PARALLEL" ]; do
    NEW_PIDS=()
    for PID in "${PIDS[@]}"; do
      kill -0 "$PID" 2>/dev/null && NEW_PIDS+=("$PID")
    done
    PIDS=("${NEW_PIDS[@]}")
    [ "${#PIDS[@]}" -ge "$MAX_PARALLEL" ] && sleep 5
  done

  # ── Claim next prompt (atomic mv = mutex lock) ───────────────────────────────
  TARGET=$(ls "$PROMPT_DIR"/*.md 2>/dev/null | sort | head -1)
  [ -z "$TARGET" ] || [ ! -f "$TARGET" ] && break

  PROMPT_NAME=$(basename "$TARGET" .md)
  mv "$TARGET" "$IN_PROGRESS_DIR/" 2>/dev/null || continue
  INPROGRESS_FILE="$IN_PROGRESS_DIR/$(basename "$TARGET")"

  WT_SUFFIX="${$}-${#PIDS[@]}-$RANDOM"
  WORKTREE_PATH="/tmp/worktrees/${PROMPT_NAME}-${WT_SUFFIX}"

  echo "🔀 Slot $((${#PIDS[@]}+1))/$MAX_PARALLEL: $PROMPT_NAME → $WORKTREE_PATH"

  (
    # ── Create detached worktree ──────────────────────────────────────────────
    git -C "$PROJECT_DIR" worktree remove "$WORKTREE_PATH" --force 2>/dev/null || true
    rm -rf "$WORKTREE_PATH" 2>/dev/null || true
    git -C "$PROJECT_DIR" worktree add --detach "$WORKTREE_PATH" 2>/dev/null || {
      echo "❌ Worktree failed for $PROMPT_NAME — returning to queue"
      mv "$INPROGRESS_FILE" "$PROMPT_DIR/$(basename "$INPROGRESS_FILE")" 2>/dev/null
      exit 1
    }

    # ── Run cursor agent ──────────────────────────────────────────────────────
    LOG="/tmp/pickup-log-${PROMPT_NAME}.txt"
    PROMPT_CONTENT=$(cat "$INPROGRESS_FILE")
    echo "  → cursor agent running (log: $LOG)"
    cursor agent -p --yolo --workspace "$WORKTREE_PATH" "$PROMPT_CONTENT" 2>&1 | tee "$LOG"

    # ── Commit ────────────────────────────────────────────────────────────────
    cd "$WORKTREE_PATH" || exit 1
    BRANCH_NAME="prompt/${YEAR}-$(date +%m)-$(date +%d)/${PROMPT_NAME}"
    BRANCH_NAME=$(echo "$BRANCH_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9\/\-]/-/g' | sed 's/-\+/-/g')
    git checkout -b "$BRANCH_NAME" 2>/dev/null || true
    git add -A
    git commit -m "feat: execute prompt ${PROMPT_NAME}

Co-Authored-By: Cursor Agent <cursor@cursor.sh>" 2>/dev/null || true

    # ── Push + PR ─────────────────────────────────────────────────────────────
    REMOTE=$(cd "$PROJECT_DIR" && git remote | grep -v "^boilerplate$" | head -1)
    if [ -n "$REMOTE" ]; then
      git push "$REMOTE" "$BRANCH_NAME" 2>&1
      PUSH_EXIT=$?
      if [ "$PUSH_EXIT" -ne 0 ]; then
        cd "$PROJECT_DIR" || exit 1
        git -C "$PROJECT_DIR" worktree remove "$WORKTREE_PATH" --force 2>/dev/null
        mv "$INPROGRESS_FILE" "$FAILED_DIR/" 2>/dev/null
        echo "❌ Push failed: $PROMPT_NAME → moved to 4-failed/"
        echo "$(date '+%H:%M:%S') | $(basename $PROJECT_DIR) | PUSH FAILED | ${PROMPT_NAME}" >> ~/auset-brain/Swarms/live-feed.md
        exit 1
      fi
      gh pr create \
        --base develop \
        --title "feat: ${PROMPT_NAME}" \
        --body "Executed by pickup-dispatch.sh --parallel ${MAX_PARALLEL}" 2>/dev/null || true
    fi

    # ── Move to completed ─────────────────────────────────────────────────────
    cd "$PROJECT_DIR" || exit 1
    mv "$INPROGRESS_FILE" "$COMPLETED_DIR/" 2>/dev/null
    git -C "$PROJECT_DIR" worktree remove "$WORKTREE_PATH" --force 2>/dev/null
    echo "✅ Completed: $PROMPT_NAME"
    echo "$(date '+%H:%M:%S') | $(basename $PROJECT_DIR) | PARALLEL COMPLETE | ${PROMPT_NAME}" >> ~/auset-brain/Swarms/live-feed.md
  ) &

  PIDS+=($!)
done

echo ""
echo "⏳ Waiting for ${#PIDS[@]} running agent(s) to finish..."
wait
echo ""
echo "✅ All prompts dispatched and complete."
echo "$(date '+%H:%M:%S') | $(basename $PROJECT_DIR) | PICKUP DONE | parallel=$MAX_PARALLEL" >> ~/auset-brain/Swarms/live-feed.md
