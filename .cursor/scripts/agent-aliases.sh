#!/bin/bash
# Agent Aliases — Source this in .zshrc to get `agent lewis "task"` working
# Usage: source .claude/scripts/agent-aliases.sh
# Then: agent lewis "Fix the auth bug"

# Override the default `agent` command to support named agents
agent() {
    local FIRST_ARG="${1:-}"

    # If first arg matches a known agent name, spawn them as named Cursor agent
    # Otherwise, pass through to the original Cursor CLI
    local AGENT_FILE="$HOME/.claude/agents/${FIRST_ARG}.md"
    local BOILERPLATE_AGENT="/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate/.claude/agents/${FIRST_ARG}.md"

    if [ -f "$AGENT_FILE" ] || [ -f "$BOILERPLATE_AGENT" ]; then
        shift
        local TASK_INPUT="${*:-Check your team's prompts directory and live feed for tasks}"

        # If task input is a file path, read its contents as the prompt
        local TASK="$TASK_INPUT"
        if [ -f "$TASK_INPUT" ]; then
            TASK="Execute this prompt: $(cat "$TASK_INPUT")"
        fi
        local AGENT_NAME="$FIRST_ARG"

        # Read agent description from file if available
        local DESC=""
        if [ -f "$BOILERPLATE_AGENT" ]; then
            DESC=$(head -5 "$BOILERPLATE_AGENT" | grep "Named after" | head -1)
        fi

        echo "━━━━━━━━━━━━━━━━━━━━"
        echo "  Spawning: ${AGENT_NAME}"
        [ -n "$DESC" ] && echo "  ${DESC}"
        echo "  Task: ${TASK}"
        echo "━━━━━━━━━━━━━━━━━━━━"

        # Log to live feed
        echo "$(date '+%H:%M:%S') | $(basename $(pwd)) | AGENT SPAWNED | ${AGENT_NAME} | ${TASK}" >> ~/auset-brain/Swarms/live-feed.md

        # Start Cursor with identity
        command agent --yolo "You are ${AGENT_NAME}. You are a named agent in the Quik Nation swarm. Identify yourself as ${AGENT_NAME} in all output. You can talk to other sessions using .claude/scripts/session-registry.sh wake '<team>' '<message>'. Post progress to the live feed at ~/auset-brain/Swarms/live-feed.md. Your task: ${TASK}"
    else
        # Not a known agent name — pass through to original Cursor CLI
        command agent "$@"
    fi
}

# Run all not-started prompts in current Heru sequentially
alias run-prompts="/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate/.claude/scripts/run-prompts.sh"

# Run /git-commit-docs via Cursor Agent in current project
alias git-commit-docs='agent -p --yolo --workspace "$(pwd)" "Run the /git-commit-docs command — stage all changes, update documentation, generate commit message, and commit."'

# Run /organize-docs via Cursor Agent in current project
alias organize-docs='agent -p --yolo --workspace "$(pwd)" "Run the /organize-docs command — check documentation status, fix common issues, generate indexes, validate structure, and sync with code."'
