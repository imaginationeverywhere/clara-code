#!/usr/bin/env bash
# SessionStart hook wrapper — runs session-resume.py next to this script.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if ! OUT="$(python3 "${SCRIPT_DIR}/session-resume.py" 2>/dev/null)"; then
  printf '%s' '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"[session-resume: python failed — continue without auto-resume]"}}'
  exit 0
fi
printf '%s' "$OUT"
exit 0
