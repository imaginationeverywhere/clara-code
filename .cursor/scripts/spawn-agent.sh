#!/bin/bash
# Spawn Agent — Launch a named Cursor agent in a new Terminal tab
# Usage: spawn-agent.sh <agent-name> <project-path> [initial-prompt]
#
# Example: spawn-agent.sh "Lewis" "/Volumes/X10-Pro/Native-Projects/clients/world-cup-ready" "Fix the auth bug in backend/src/resolvers/auth.ts"
#
# The agent receives its identity + initial task as the first prompt.

AGENT_NAME="${1:-}"
PROJECT_PATH="${2:-$(pwd)}"
INITIAL_PROMPT="${3:-Check the live feed and prompts directory for your tasks}"

if [ -z "$AGENT_NAME" ]; then
    echo "Usage: spawn-agent.sh <agent-name> <project-path> [initial-prompt]"
    echo "Example: spawn-agent.sh Lewis /path/to/world-cup-ready 'Fix the auth bug'"
    exit 1
fi

# Build the identity prompt — tells the agent who it is
IDENTITY="You are ${AGENT_NAME}. You are a named agent in the Quik Nation swarm. Identify yourself as ${AGENT_NAME} in all output. You can talk to other sessions using .claude/scripts/session-registry.sh wake '<team>' '<message>'. Post progress to the live feed. ${INITIAL_PROMPT}"

# Open new Terminal tab, start Cursor agent with identity + workspace + yolo
osascript -e "
tell application \"Terminal\"
    activate
    do script \"agent --workspace ${PROJECT_PATH} --yolo \\\"${IDENTITY}\\\"\"
end tell
" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "Spawned agent '${AGENT_NAME}' in ${PROJECT_PATH}"
    echo "$(date '+%H:%M:%S') | $(basename ${PROJECT_PATH}) | AGENT SPAWNED | ${AGENT_NAME} | ${INITIAL_PROMPT}" >> ~/auset-brain/Swarms/live-feed.md
else
    echo "Failed to spawn agent '${AGENT_NAME}'"
fi
