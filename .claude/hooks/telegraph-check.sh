#!/bin/bash
# Telegraph Inbox Check — Hook for Claude Code sessions
# Checks the team inbox and injects messages into session context
#
# Detects team name from: $SWARM_TEAM env var, or defaults to "hq"
# Returns hookSpecificOutput JSON if messages are waiting

TEAM="${SWARM_TEAM:-hq}"
TEAM=$(echo "$TEAM" | tr '[:upper:]' '[:lower:]')
INBOX="/tmp/swarm-inboxes/${TEAM}.md"

if [ -f "$INBOX" ] && [ -s "$INBOX" ]; then
    # Read messages
    MSGS=$(cat "$INBOX")
    # Clear inbox after reading
    rm -f "$INBOX"
    # Escape for JSON (replace newlines, quotes)
    MSGS_ESCAPED=$(echo "$MSGS" | tr '\n' ' | ' | sed 's/"/\\"/g' | head -c 500)
    printf '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"TELEGRAPH MESSAGE FOR %s: %s"}}' "$(echo "$TEAM" | tr '[:lower:]' '[:upper:]')" "$MSGS_ESCAPED"
fi
