#!/bin/bash
# Wake Session v2 — Send a prompt to a Claude Code session (Cursor-safe)
#
# Thin wrapper around session-registry.sh wake.
# Registry ONLY sends to Claude panes (type=claude). Cursor panes are hard-blocked.
#
# Usage:
#   wake-session.sh <team> <message>
#   wake-session.sh wcr "Check the live feed for directives"
#   wake-session.sh all "HQ has new tasks"

TEAM="${1:-}"
MESSAGE="${2:-Check the live feed for team updates}"
SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -z "$TEAM" ]; then
    echo "Usage: $0 <team> <message>"
    echo "Example: $0 wcr 'Check the live feed for directives'"
    echo ""
    echo "Claude panes: send-keys (instant). Cursor panes: BLOCKED."
    echo "Teams: hq, pkgs, wcr, qcr, fmo, s962, devops, trackit, st, qcarry, qn, slk, pgcmc"
    exit 1
fi

if [ "$TEAM" = "all" ]; then
    "$SCRIPTS_DIR/session-registry.sh" wake-all "$MESSAGE"
else
    "$SCRIPTS_DIR/session-registry.sh" wake "$TEAM" "$MESSAGE"
fi
