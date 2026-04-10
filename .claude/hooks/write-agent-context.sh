#!/bin/bash
# Write Agent Context — Called before dispatching any named agent
# Usage: .claude/hooks/write-agent-context.sh <agent-name> <task-description>
# Creates ~/auset-brain/Swarms/agent-context/<agent-name>.md
# The dispatching agent tells the sub-agent to read this file as step 1

AGENT_NAME="$1"
TASK="$2"
CONTEXT_DIR="$HOME/auset-brain/Swarms/agent-context"
MEMORY_DIR="$HOME/.claude/projects/-Volumes-X10-Pro-Native-Projects-AI-quik-nation-ai-boilerplate/memory"
OUTPUT="$CONTEXT_DIR/${AGENT_NAME}.md"

mkdir -p "$CONTEXT_DIR"

# Get current session info
PROJECT=$(basename "$(pwd)")
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S %Z')
MACHINE=$(hostname -s)

# Read session checkpoint for recent context
CHECKPOINT=""
if [ -f "$MEMORY_DIR/session-checkpoint.md" ]; then
    CHECKPOINT=$(head -80 "$MEMORY_DIR/session-checkpoint.md")
fi

# Read recent corrections (last 5 feedback files by modification time)
RECENT_FEEDBACK=""
if [ -d "$MEMORY_DIR" ]; then
    RECENT_FEEDBACK=$(ls -t "$MEMORY_DIR"/feedback-*.md 2>/dev/null | head -5 | while read f; do
        echo "- $(basename "$f" .md): $(head -5 "$f" | grep "^description:" | sed 's/description: //')"
    done)
fi

# Read team registry entry for this agent
TEAM_INFO=""
if [ -f "$HOME/auset-brain/Swarms/team-registry.md" ]; then
    TEAM_INFO=$(grep -A5 "$AGENT_NAME" "$HOME/auset-brain/Swarms/team-registry.md" 2>/dev/null | head -10)
fi

cat > "$OUTPUT" << CONTEXT
# Agent Context: ${AGENT_NAME}

**Generated:** ${TIMESTAMP}
**Machine:** ${MACHINE}
**Project:** ${PROJECT}

## Your Identity
You are ${AGENT_NAME}. Read the team registry at ~/auset-brain/Swarms/team-registry.md to find your full identity, role, and team assignment. Identify yourself by name when speaking.

## Your Task
${TASK}

## Session Context (what happened before you were called)
${CHECKPOINT}

## Recent Corrections from Mo (FOLLOW THESE)
${RECENT_FEEDBACK}

## Team Registry Entry
${TEAM_INFO}

## Rules (NON-NEGOTIABLE)
1. Identify yourself by name when speaking: > **${AGENT_NAME}:** "message"
2. Never declare done until verified
3. Never deprioritize what Mo asks for
4. Two environments only: develop + production (no local DB)
5. Charles Pattern: reviewer writes the fix prompt
6. Check memory before acting — read ~/auset-brain/ for context
7. Write progress to live feed: echo "\$(date '+%H:%M:%S') | \$(basename \$(pwd)) | PROGRESS | ${AGENT_NAME} | <what you did>" >> ~/auset-brain/Swarms/live-feed.md

## How to Report Back
When done, write results to the live feed and update the session checkpoint.
CONTEXT

echo "$OUTPUT"
