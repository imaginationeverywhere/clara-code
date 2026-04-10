#!/bin/bash
# Agent Aliases — Source this in .zshrc
# Usage: source .claude/scripts/agent-aliases.sh
#
# Swarm aliases (launch Claude Code in tmux — enables reliable wake):
#   hq, wcr, pkgs, qn, qcr, fmo, st, s962, slk, qcarry, devops, trackit, pgcmc, marketing, kls, cp-team, clara-agents, clara-code
#
# Live feed (real-time message display — zero send-keys):
#   feed                  Open dedicated feed tab (one tab, all messages)
#   split-inbox <team>    Add inbox watcher pane below current pane (optional)
#   split-feed            Add live feed pane below current pane (optional)
#
# Agent aliases (spawn Cursor agents):
#   agent lewis "Fix the auth bug"

SWARM_LAUNCHER="/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate/.claude/scripts/swarm-launcher.sh"
INBOX_WATCHER="/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate/operations/inbox-watcher.sh"

# ━━━ Companion Inbox Panes (real-time message display) ━━━
# Uses tail -f (kqueue on macOS). Messages appear INSTANTLY.
# No send-keys. No cron. No polling. No prompt injection.

split-inbox() {
    local team="${1:?Usage: split-inbox <team>}"
    if [ -z "${TMUX:-}" ]; then
        echo "ERROR: not inside tmux. Run from a tmux pane."
        return 1
    fi
    tmux split-window -v -l 8 "bash -lc \"${INBOX_WATCHER} ${team}\""
    tmux select-pane -T "📬 ${team} inbox"
    tmux select-pane -t '{up}'
    echo "Companion pane added: ${team} inbox (below)"
}

split-feed() {
    local filter="${1:-}"
    if [ -z "${TMUX:-}" ]; then
        echo "ERROR: not inside tmux. Run from a tmux pane."
        return 1
    fi
    if [ -n "$filter" ]; then
        tmux split-window -v -l 8 "bash -lc \"${INBOX_WATCHER} --feed ${filter}\""
        tmux select-pane -T "📡 feed:${filter}"
    else
        tmux split-window -v -l 8 "bash -lc \"${INBOX_WATCHER} --feed\""
        tmux select-pane -T "📡 live feed"
    fi
    tmux select-pane -t '{up}'
    echo "Companion pane added: live feed (below)"
}

feed() {
    local SESSION="${TMUX_SWARM_SESSION:-swarm}"
    local WIN="feed"

    if [ -z "${TMUX:-}" ]; then
        echo "ERROR: not inside tmux."
        return 1
    fi

    if tmux list-windows -t "$SESSION" -F '#{window_name}' 2>/dev/null | grep -qx "$WIN"; then
        tmux select-window -t "$SESSION:$WIN"
        return 0
    fi

    tmux new-window -t "$SESSION" -n "$WIN" "bash -lc \"${INBOX_WATCHER} --feed\""
    tmux select-window -t "$SESSION:$WIN"
}

# ━━━ Swarm Session Aliases (Claude Code in tmux) ━━━
# Messages delivered via inbox files. Companion panes display via tail -f.

alias hq="$SWARM_LAUNCHER start hq /Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate"
alias pkgs="$SWARM_LAUNCHER start pkgs /Volumes/X10-Pro/Native-Projects/AI/auset-packages"
alias wcr="$SWARM_LAUNCHER start wcr /Volumes/X10-Pro/Native-Projects/clients/world-cup-ready"
alias qn="$SWARM_LAUNCHER start qn /Volumes/X10-Pro/Native-Projects/Quik-Nation/quiknation"
alias qcr="$SWARM_LAUNCHER start qcr /Volumes/X10-Pro/Native-Projects/Quik-Nation/quikcarrental"
alias fmo="$SWARM_LAUNCHER start fmo /Volumes/X10-Pro/Native-Projects/clients/fmo"
alias st="$SWARM_LAUNCHER start st /Volumes/X10-Pro/Native-Projects/clients/seeking-talent"
alias s962="$SWARM_LAUNCHER start s962 /Volumes/X10-Pro/Native-Projects/Quik-Nation/site962"
alias 962="$SWARM_LAUNCHER start s962 /Volumes/X10-Pro/Native-Projects/Quik-Nation/site962"
alias slk="$SWARM_LAUNCHER start slk /Volumes/X10-Pro/Native-Projects/Quik-Nation/sliplink"
alias slack="$SWARM_LAUNCHER start slk /Volumes/X10-Pro/Native-Projects/Quik-Nation/sliplink"
alias qcarry="$SWARM_LAUNCHER start qcarry /Volumes/X10-Pro/Native-Projects/Quik-Nation/quikcarry"
alias devops="$SWARM_LAUNCHER start devops /Volumes/X10-Pro/Native-Projects/AI/quik-nation-devops"
alias trackit="$SWARM_LAUNCHER start trackit /Volumes/X10-Pro/Native-Projects/clients/trackit"
alias pgcmc="$SWARM_LAUNCHER start pgcmc /Volumes/X10-Pro/Native-Projects/clients/new-pgcmc-website-and-app"
alias marketing="$SWARM_LAUNCHER start marketing /Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate"
alias kls="$SWARM_LAUNCHER start kls /Volumes/X10-Pro/Native-Projects/clients/kingluxuryservices-v2"
alias cp-team="$SWARM_LAUNCHER start cp-team /Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate"
alias clara-agents="$SWARM_LAUNCHER start clara-agents /Volumes/X10-Pro/Native-Projects/Quik-Nation/claraagents"
alias clara-code="$SWARM_LAUNCHER start clara-code /Volumes/X10-Pro/Native-Projects/AI/clara-code"

# ━━━ Per-Agent Session Aliases (claude --agent= in tmux) ━━━
# Each alias launches a dedicated Claude Code session for ONE agent.
# The session runs in its own tmux window: swarm:<team>-<agent>

# HQ Agents
alias gran="$SWARM_LAUNCHER agent gran"
alias mary="$SWARM_LAUNCHER agent mary"
alias katherine="$SWARM_LAUNCHER agent katherine"
alias gary="$SWARM_LAUNCHER agent gary"
alias maya="$SWARM_LAUNCHER agent maya"
alias nikki="$SWARM_LAUNCHER agent nikki"
alias fannie="$SWARM_LAUNCHER agent fannie-lou"
alias philip="$SWARM_LAUNCHER agent a-philip"
alias carter="$SWARM_LAUNCHER agent carter"

# Packages Agents
alias nannie="$SWARM_LAUNCHER agent nannie"
alias mark-d="$SWARM_LAUNCHER agent mark"
alias george="$SWARM_LAUNCHER agent george"

# WCR Agents
alias althea="$SWARM_LAUNCHER agent althea"
alias lewis="$SWARM_LAUNCHER agent lewis"
alias daniel="$SWARM_LAUNCHER agent daniel"

# QCR Agents
alias maggie="$SWARM_LAUNCHER agent maggie"
alias norbert="$SWARM_LAUNCHER agent norbert"

# Clara Agents Team
alias biddy="$SWARM_LAUNCHER agent biddy"
alias james-a="$SWARM_LAUNCHER agent james-armistead"
alias alonzo="$SWARM_LAUNCHER agent alonzo"
alias solomon="$SWARM_LAUNCHER agent solomon"
alias malone="$SWARM_LAUNCHER agent malone"
alias aaron="$SWARM_LAUNCHER agent aaron"
alias blackwell="$SWARM_LAUNCHER agent blackwell"
alias henson="$SWARM_LAUNCHER agent henson"

# Clara Code Team
alias john-hope="$SWARM_LAUNCHER agent john-hope"
alias carruthers="$SWARM_LAUNCHER agent carruthers"
alias motley="$SWARM_LAUNCHER agent motley"
alias miles="$SWARM_LAUNCHER agent miles"
alias claudia="$SWARM_LAUNCHER agent claudia"

# DevOps Agents
alias robert="$SWARM_LAUNCHER agent robert"
alias harriet="$SWARM_LAUNCHER agent harriet"
alias gordon-p="$SWARM_LAUNCHER agent gordon"

# Site962 Agents
alias josephine="$SWARM_LAUNCHER agent josephine"
alias ernest="$SWARM_LAUNCHER agent ernest"

# Team Expansion (launch ALL agents on a team as separate windows)
alias hq-all="$SWARM_LAUNCHER team-agents hq"
alias wcr-all="$SWARM_LAUNCHER team-agents wcr"
alias pkgs-all="$SWARM_LAUNCHER team-agents pkgs"
alias qcr-all="$SWARM_LAUNCHER team-agents qcr"
alias fmo-all="$SWARM_LAUNCHER team-agents fmo"
alias s962-all="$SWARM_LAUNCHER team-agents s962"
alias devops-all="$SWARM_LAUNCHER team-agents devops"
alias qcarry-all="$SWARM_LAUNCHER team-agents qcarry"
alias clara-agents-all="$SWARM_LAUNCHER team-agents clara-agents"

# Swarm management
alias swarm-list="$SWARM_LAUNCHER list"
alias swarm-kill="$SWARM_LAUNCHER kill"
alias swarm-kill-all="$SWARM_LAUNCHER kill-all"
alias swarm-attach="$SWARM_LAUNCHER attach"

# Override the default `agent` command to support named agents
agent() {
    local FIRST_ARG="${1:-}"

    # If first arg matches a known agent name, spawn them as named Cursor agent
    # Otherwise, pass through to the original Cursor CLI
    local AGENT_FILE="$HOME/.claude/agents/${FIRST_ARG}.md"
    local BOILERPLATE_AGENT="/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate/.claude/agents/${FIRST_ARG}.md"

    if [ -f "$AGENT_FILE" ] || [ -f "$BOILERPLATE_AGENT" ]; then
        shift
        local TASK_INPUT="${*:-Check your team prompts directory and live feed for tasks}"

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
        command agent --yolo "You are ${AGENT_NAME}. You are a named agent in the Quik Nation swarm. Identify yourself as ${AGENT_NAME} in all output. Post messages to the live feed at ~/auset-brain/Swarms/live-feed.md using format: HH:MM:SS | project | COMMS | FROM: YourName → TO: TeamName | message. Check your inbox at /tmp/swarm-inboxes/ for messages from other agents. NEVER use tmux send-keys. Your task: ${TASK}"
    else
        # Not a known agent name — pass through to original Cursor CLI
        command agent "$@"
    fi
}

# Run all not-started prompts in current Heru sequentially
alias run-prompts="/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate/.claude/scripts/run-prompts.sh"

# Run /git-commit-docs via Cursor Agent in current project
alias git-commit-docs='agent -p --yolo --workspace "$(pwd)" "Run the /git-commit-docs command - stage all changes, update documentation, generate commit message, and commit."'

# Run /organize-docs via Cursor Agent in current project
alias organize-docs='agent -p --yolo --workspace "$(pwd)" "Run the /organize-docs command - check documentation status, fix common issues, generate indexes, validate structure, and sync with code."'
