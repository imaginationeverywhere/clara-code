#!/bin/bash
# dispatch-cursor-with-notify.sh — Run Cursor agent, then auto-post result to Slack
#
# Usage: dispatch-cursor-with-notify.sh <project-name> <workspace-path> <prompt>
#
# Examples:
#   dispatch-cursor-with-notify.sh "Sliplink CodeSec" "/path/to/repo" "Fix all lint errors"
#   dispatch-cursor-with-notify.sh "QuikCarRental" "/path/to/qcr" "Add booking API"

PROJECT="${1:?Usage: dispatch-cursor-with-notify.sh <project> <workspace> <prompt>}"
WORKSPACE="${2:?Missing workspace path}"
PROMPT="${3:?Missing prompt}"
NOTIFY_SCRIPT="$(dirname "$0")/notify-agent-done.sh"
LOGFILE="/tmp/cursor-$(echo "$PROJECT" | tr ' ' '-' | tr '[:upper:]' '[:lower:]')-$(date +%s).log"

echo "Dispatching Cursor agent for $PROJECT..."
echo "Log: $LOGFILE"

# Run cursor agent and capture output + exit code
cursor agent --print --trust --force --workspace "$WORKSPACE" "$PROMPT" > "$LOGFILE" 2>&1
EXIT_CODE=$?

# Determine status and summary
if [ $EXIT_CODE -eq 0 ]; then
  # Check if there were actual changes
  CHANGED=$(cd "$WORKSPACE" && git diff --stat 2>/dev/null | tail -1)
  if [ -n "$CHANGED" ]; then
    STATUS="done"
    SUMMARY="Finished. $CHANGED"
  else
    STATUS="done"
    SUMMARY="Finished, no files changed."
  fi
else
  STATUS="failed"
  # Grab last meaningful line from log for summary
  SUMMARY="Failed (exit $EXIT_CODE). $(tail -5 "$LOGFILE" | head -1)"
fi

# Post to Slack
if [ -f "$NOTIFY_SCRIPT" ]; then
  bash "$NOTIFY_SCRIPT" "$PROJECT" "$STATUS" "$SUMMARY"
else
  echo "Warning: notify script not found at $NOTIFY_SCRIPT"
fi

echo "Done. Status: $STATUS"
