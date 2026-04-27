#!/usr/bin/env bash
# pickup-prompt-parallel.sh — run from terminal, NOT from inside cursor chat.
#
# Spawns N headless `cursor agent -p --yolo` jobs, each in its own worktree,
# each producing one branch + one PR. Loops until 1-not-started/ is empty.
#
# Usage:
#   bash scripts/pickup-prompt-parallel.sh [N]              # today's date
#   bash scripts/pickup-prompt-parallel.sh [N] 2026/April/27
#
# Requires: git, gh, cursor CLI (3.x), GitHub auth, push permissions.

set -euo pipefail

MAX_PARALLEL="${1:-6}"
DATE_PATH="${2:-$(date +%Y)/$(date +%B)/$(date +%-d)}"
PROMPT_DIR="prompts/${DATE_PATH}/1-not-started"
IN_PROGRESS_DIR="prompts/${DATE_PATH}/2-in-progress"
COMPLETED_DIR="prompts/${DATE_PATH}/3-completed"
FAILED_DIR="prompts/${DATE_PATH}/4-failed"
LOCK_DIR="/tmp/pickup-prompt-locks-$$"
MAIN_DIR="$(pwd)"
BASE_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

mkdir -p "$IN_PROGRESS_DIR" "$COMPLETED_DIR" "$FAILED_DIR" "$LOCK_DIR" /tmp/worktrees

command -v cursor >/dev/null 2>&1 || { echo "ERROR: cursor CLI not found"; exit 1; }
command -v gh >/dev/null 2>&1 || { echo "ERROR: gh CLI not found"; exit 1; }

echo "▶ Pickup-prompt parallel dispatcher"
echo "  date:     ${DATE_PATH}"
echo "  parallel: ${MAX_PARALLEL}"
echo "  base:     ${BASE_BRANCH}"

# Recover orphans from previous crashed run
if compgen -G "${IN_PROGRESS_DIR}/*.md" > /dev/null; then
  echo "▶ Recovering orphans from 2-in-progress/ → 1-not-started/"
  mv "${IN_PROGRESS_DIR}"/*.md "${PROMPT_DIR}/" 2>/dev/null || true
fi

claim_one() {
  # Atomic claim via mkdir lock — only one slot wins per file.
  local target prompt_name lock
  target="$1"
  prompt_name="$(basename "$target" .md)"
  lock="${LOCK_DIR}/${prompt_name}.lock"
  if mkdir "$lock" 2>/dev/null; then
    if [ -f "$target" ]; then
      mv "$target" "${IN_PROGRESS_DIR}/" 2>/dev/null || { rmdir "$lock"; return 1; }
      echo "${IN_PROGRESS_DIR}/$(basename "$target")"
      return 0
    fi
    rmdir "$lock"
  fi
  return 1
}

run_slot() {
  local inprogress prompt_name worktree branch
  inprogress="$1"
  prompt_name="$(basename "$inprogress" .md)"
  worktree="/tmp/worktrees/${prompt_name}-$$-${RANDOM}"
  branch="prompt/$(date +%Y-%m-%d)/${prompt_name}"
  branch="$(echo "$branch" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9\/-]/-/g; s/-\+/-/g')"

  echo "  [${prompt_name}] worktree=${worktree}"

  git worktree remove "$worktree" --force 2>/dev/null || true
  rm -rf "$worktree" 2>/dev/null || true
  if ! git worktree add --detach "$worktree" >/dev/null 2>&1; then
    echo "  [${prompt_name}] ✗ worktree create failed"
    mv "$inprogress" "${PROMPT_DIR}/" 2>/dev/null || true
    return 1
  fi

  # Headless cursor — actually does the work
  if ! cursor agent -p --yolo --workspace "$worktree" "$(cat "$inprogress")" \
       > "/tmp/pickup-${prompt_name}.log" 2>&1; then
    echo "  [${prompt_name}] ✗ cursor agent failed (see /tmp/pickup-${prompt_name}.log)"
    git worktree remove "$worktree" --force 2>/dev/null || true
    mv "$inprogress" "${FAILED_DIR}/" 2>/dev/null || true
    return 1
  fi

  (
    cd "$worktree" || exit 1
    git checkout -b "$branch" 2>/dev/null || git checkout "$branch"
    git add -A
    git commit -m "feat: execute prompt ${prompt_name}

Co-Authored-By: Cursor Agent <noreply@cursor.sh>" 2>/dev/null || true
    git push origin "$branch" 2>/dev/null || true
    gh pr create --base "${BASE_BRANCH}" --head "$branch" \
      --title "feat: ${prompt_name}" \
      --body "Executed by pickup-prompt-parallel.sh. See prompt at prompts/${DATE_PATH}/3-completed/$(basename "$inprogress")" \
      2>/dev/null || true
  )

  mv "$inprogress" "${COMPLETED_DIR}/" 2>/dev/null || true
  git worktree remove "$worktree" --force 2>/dev/null || true
  echo "  [${prompt_name}] ✓ complete → PR opened"
}

# Main dispatch loop
PIDS=()
while true; do
  # Reap finished slots
  NEW_PIDS=()
  for pid in "${PIDS[@]:-}"; do
    [ -z "$pid" ] && continue
    if kill -0 "$pid" 2>/dev/null; then
      NEW_PIDS+=("$pid")
    fi
  done
  PIDS=("${NEW_PIDS[@]}")

  # Wait if at capacity
  while [ "${#PIDS[@]}" -ge "$MAX_PARALLEL" ]; do
    sleep 2
    NEW_PIDS=()
    for pid in "${PIDS[@]}"; do
      kill -0 "$pid" 2>/dev/null && NEW_PIDS+=("$pid")
    done
    PIDS=("${NEW_PIDS[@]}")
  done

  # Find next prompt
  NEXT="$(ls "${PROMPT_DIR}"/*.md 2>/dev/null | sort | head -1)"
  if [ -z "$NEXT" ]; then
    [ "${#PIDS[@]}" -eq 0 ] && break
    sleep 2
    continue
  fi

  CLAIMED="$(claim_one "$NEXT")" || continue

  # Spawn slot
  ( run_slot "$CLAIMED" ) &
  PIDS+=($!)
done

wait
rm -rf "$LOCK_DIR"
echo "✓ Queue empty. All prompts processed for ${DATE_PATH}."
