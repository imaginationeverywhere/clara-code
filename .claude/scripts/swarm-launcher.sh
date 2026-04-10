#!/bin/bash
# Swarm Launcher — All Claude Code team sessions in ONE tmux session
#
# All teams are windows inside a single "swarm" session:
#   swarm:hq    swarm:wcr    swarm:pkgs    swarm:s962    swarm:devops
#
# Switch teams:  Ctrl+B n (next) | Ctrl+B p (prev) | Ctrl+B 0-9 (jump)
# Message team:  .claude/scripts/swarm-telegraph.sh send wcr "message"
# Detach:        Ctrl+B d (session keeps running)
# Reattach:      tmux attach -t swarm
#
# Usage:
#   swarm-launcher.sh start <team> <project-path>   # Add team window + attach
#   swarm-launcher.sh agent <name>                   # Launch per-agent window (claude --agent=)
#   swarm-launcher.sh team-agents <team>             # Launch all agents on a team as separate windows
#   swarm-launcher.sh start-all                      # Launch all known teams
#   swarm-launcher.sh list                           # List team windows
#   swarm-launcher.sh attach [team]                  # Attach (optionally to specific team)
#   swarm-launcher.sh kill <team>                    # Kill one team window
#   swarm-launcher.sh kill-all                       # Kill entire swarm session

SESSION="swarm"
FEED="$HOME/auset-brain/Swarms/live-feed.md"
SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"

normalize_team() {
    echo "$1" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/-team$//'
}

team_display_name() {
    local TEAM_LOWER=$(normalize_team "$1")
    case "$TEAM_LOWER" in
        hq|headquarters) echo "Headquarters" ;;
        marketing) echo "Marketing Team" ;;
        kls) echo "KLS" ;;
        *) echo "$1" ;;
    esac
}

start_session() {
    local TEAM="$1"
    local PROJECT="$2"

    if [ -z "$TEAM" ] || [ -z "$PROJECT" ]; then
        echo "Usage: swarm-launcher.sh start <team> <project-path>"
        return 1
    fi

    if [ ! -d "$PROJECT" ]; then
        echo "ERROR: Project directory not found: $PROJECT"
        return 1
    fi

    local WINDOW=$(normalize_team "$TEAM")
    local DISPLAY_TEAM=$(team_display_name "$TEAM")
    local CLAUDE_CMD="export SWARM_TEAM='${DISPLAY_TEAM}'; export SWARM_RESUME_AGENT=''; claude --dangerously-skip-permissions -n '${DISPLAY_TEAM}'"

    # Case 1: No swarm session — create it with this team as the first window
    if ! tmux has-session -t "$SESSION" 2>/dev/null; then
        echo "$(date '+%H:%M:%S') | $(basename "$PROJECT") | SWARM START | ${DISPLAY_TEAM} | window ${WINDOW}" >> "$FEED" 2>/dev/null
        exec tmux new-session -s "$SESSION" -n "$WINDOW" -c "$PROJECT" "$CLAUDE_CMD"
    fi

    # Ensure this team's window exists
    if ! tmux list-windows -t "$SESSION" -F '#{window_name}' 2>/dev/null | grep -qx "$WINDOW"; then
        tmux new-window -t "$SESSION" -n "$WINDOW" -c "$PROJECT" "$CLAUDE_CMD"
        echo "$(date '+%H:%M:%S') | $(basename "$PROJECT") | SWARM WINDOW | ${DISPLAY_TEAM} | added ${WINDOW}" >> "$FEED" 2>/dev/null
    fi

    if [ -n "$TMUX" ]; then
        # Already inside tmux (one-tab mode) — just switch to the window
        tmux select-window -t "${SESSION}:${WINDOW}"
    else
        # Separate terminal tab — create a GROUPED session so this tab
        # has its own independent active-window tracking. All windows are
        # shared across tabs but each tab can view a different one.
        local CLIENT_NAME="${SESSION}-tab-${WINDOW}"
        tmux kill-session -t "$CLIENT_NAME" 2>/dev/null
        exec tmux new-session -d -t "$SESSION" -s "$CLIENT_NAME" \; \
             select-window -t "${CLIENT_NAME}:${WINDOW}" \; \
             attach -t "$CLIENT_NAME"
    fi
}

start_agent() {
    local AGENT_NAME="$1"
    if [ -z "$AGENT_NAME" ]; then
        echo "Usage: swarm-launcher.sh agent <agent-name>"
        echo "Example: swarm-launcher.sh agent gran"
        return 1
    fi

    source "${SCRIPTS_DIR}/agent-map.sh"

    local RESOLVED
    RESOLVED=$(resolve_agent "$AGENT_NAME")
    if [ $? -ne 0 ] || [ -z "$RESOLVED" ]; then
        echo "ERROR: Unknown agent '$AGENT_NAME'"
        echo "Check .claude/agents/ for available agents."
        return 1
    fi

    local AGENT_TEAM=$(echo "$RESOLVED" | cut -d'|' -f1)
    local AGENT_FILE=$(echo "$RESOLVED" | cut -d'|' -f2)

    if [ "$AGENT_TEAM" = "TEAM" ]; then
        echo "That's a team name, not an agent. Use: swarm-launcher.sh start $AGENT_FILE <path>"
        return 1
    fi

    local PROJECT
    PROJECT=$(team_project "$AGENT_TEAM")
    local WINDOW="${AGENT_TEAM}-${AGENT_FILE}"
    local AGENT_PATH=".claude/agents/${AGENT_FILE}.md"
    local SHORT_NAME=$(echo "$AGENT_FILE" | cut -d'-' -f1)
    local CLAUDE_CMD="export SWARM_TEAM='${AGENT_TEAM}'; export SWARM_RESUME_AGENT='${AGENT_FILE}'; claude --dangerously-skip-permissions --agent='${AGENT_PATH}' -n '${SHORT_NAME}'"

    if ! tmux has-session -t "$SESSION" 2>/dev/null; then
        echo "$(date '+%H:%M:%S') | AGENT START | ${AGENT_FILE} | team ${AGENT_TEAM}" >> "$FEED" 2>/dev/null
        exec tmux new-session -s "$SESSION" -n "$WINDOW" -c "$PROJECT" "$CLAUDE_CMD"
    fi

    if ! tmux list-windows -t "$SESSION" -F '#{window_name}' 2>/dev/null | grep -qx "$WINDOW"; then
        tmux new-window -t "$SESSION" -n "$WINDOW" -c "$PROJECT" "$CLAUDE_CMD"
        echo "$(date '+%H:%M:%S') | AGENT WINDOW | ${AGENT_FILE} | team ${AGENT_TEAM}" >> "$FEED" 2>/dev/null
    fi

    if [ -n "$TMUX" ]; then
        tmux select-window -t "${SESSION}:${WINDOW}"
    else
        local CLIENT_NAME="${SESSION}-tab-${WINDOW}"
        tmux kill-session -t "$CLIENT_NAME" 2>/dev/null
        exec tmux new-session -d -t "$SESSION" -s "$CLIENT_NAME" \; \
             select-window -t "${CLIENT_NAME}:${WINDOW}" \; \
             attach -t "$CLIENT_NAME"
    fi
}

start_team_agents() {
    local TEAM="$1"
    if [ -z "$TEAM" ]; then
        echo "Usage: swarm-launcher.sh team-agents <team>"
        echo "Example: swarm-launcher.sh team-agents hq"
        return 1
    fi

    source "${SCRIPTS_DIR}/agent-map.sh"

    local AGENTS
    AGENTS=$(team_agents "$TEAM")
    if [ -z "$AGENTS" ]; then
        echo "ERROR: Unknown team or no agents mapped for '$TEAM'"
        return 1
    fi

    local PROJECT
    PROJECT=$(team_project "$TEAM")
    local COUNT=0

    for AGENT_FILE in $AGENTS; do
        local WINDOW="${TEAM}-${AGENT_FILE}"
        local AGENT_PATH=".claude/agents/${AGENT_FILE}.md"
        local SHORT_NAME=$(echo "$AGENT_FILE" | cut -d'-' -f1)
        local CLAUDE_CMD="export SWARM_TEAM='${TEAM}'; export SWARM_RESUME_AGENT='${AGENT_FILE}'; claude --dangerously-skip-permissions --agent='${AGENT_PATH}' -n '${SHORT_NAME}'"

        if ! tmux has-session -t "$SESSION" 2>/dev/null; then
            tmux new-session -d -s "$SESSION" -n "$WINDOW" -c "$PROJECT" "$CLAUDE_CMD"
        elif ! tmux list-windows -t "$SESSION" -F '#{window_name}' 2>/dev/null | grep -qx "$WINDOW"; then
            tmux new-window -t "$SESSION" -n "$WINDOW" -c "$PROJECT" "$CLAUDE_CMD"
        fi
        COUNT=$((COUNT + 1))
        sleep 0.5
    done

    echo "Launched $COUNT agents for team '$TEAM':"
    for AGENT_FILE in $AGENTS; do
        echo "  ${TEAM}-${AGENT_FILE}"
    done
    echo ""
    echo "$(date '+%H:%M:%S') | TEAM AGENTS | ${TEAM} | ${COUNT} agents launched" >> "$FEED" 2>/dev/null

    if [ -z "$TMUX" ]; then
        exec tmux attach -t "$SESSION"
    fi
}

start_all() {
    declare -A TEAM_PROJECTS
    TEAM_PROJECTS[hq]="/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate"
    TEAM_PROJECTS[wcr]="/Volumes/X10-Pro/Native-Projects/clients/world-cup-ready"
    TEAM_PROJECTS[pkgs]="/Volumes/X10-Pro/Native-Projects/AI/auset-packages"
    TEAM_PROJECTS[s962]="/Volumes/X10-Pro/Native-Projects/Quik-Nation/site962"
    TEAM_PROJECTS[qcr]="/Volumes/X10-Pro/Native-Projects/Quik-Nation/quikcarrental"
    TEAM_PROJECTS[fmo]="/Volumes/X10-Pro/Native-Projects/clients/fmo"
    TEAM_PROJECTS[devops]="/Volumes/X10-Pro/Native-Projects/AI/quik-nation-devops"
    TEAM_PROJECTS[trackit]="/Volumes/X10-Pro/Native-Projects/clients/trackit"
    TEAM_PROJECTS[st]="/Volumes/X10-Pro/Native-Projects/clients/seeking-talent"
    TEAM_PROJECTS[qcarry]="/Volumes/X10-Pro/Native-Projects/Quik-Nation/quikcarry"
    TEAM_PROJECTS[qn]="/Volumes/X10-Pro/Native-Projects/Quik-Nation/quiknation"
    TEAM_PROJECTS[slk]="/Volumes/X10-Pro/Native-Projects/Quik-Nation/sliplink"

    local FIRST=true
    for TEAM in hq wcr pkgs s962 qcr fmo devops trackit st qcarry qn slk; do
        local PROJ="${TEAM_PROJECTS[$TEAM]}"
        if [ ! -d "$PROJ" ]; then
            echo "SKIP: $TEAM — not found: $PROJ"
            continue
        fi

        local WINDOW=$(normalize_team "$TEAM")
        local DISPLAY_TEAM=$(team_display_name "$TEAM")
        local CLAUDE_CMD="export SWARM_TEAM='${DISPLAY_TEAM}'; export SWARM_RESUME_AGENT=''; claude --dangerously-skip-permissions -n '${DISPLAY_TEAM}'"

        if $FIRST; then
            # Create session with first team
            tmux new-session -d -s "$SESSION" -n "$WINDOW" -c "$PROJ" "$CLAUDE_CMD"
            echo "  Created swarm session with: $WINDOW"
            FIRST=false
        else
            # Add window for subsequent teams
            tmux new-window -t "$SESSION" -n "$WINDOW" -c "$PROJ" "$CLAUDE_CMD"
            echo "  Added window: $WINDOW"
        fi
        sleep 1
    done

    echo ""
    echo "$(tmux list-windows -t "$SESSION" -F '#{window_index}:#{window_name}' 2>/dev/null | wc -l | tr -d ' ') teams launched in swarm session."
    echo ""
    echo "Attach: tmux attach -t swarm"
    echo "Switch: Ctrl+B n/p or Ctrl+B <number>"

    echo "$(date '+%H:%M:%S') | SWARM | ALL TEAMS LAUNCHED | $(tmux list-windows -t "$SESSION" -F '#{window_name}' 2>/dev/null | tr '\n' ' ')" >> "$FEED" 2>/dev/null
}

list_sessions() {
    if ! tmux has-session -t "$SESSION" 2>/dev/null; then
        echo "No swarm session running."
        echo ""
        echo "Launch:  swarm-launcher.sh start <team> <project-path>"
        echo "Or:      hq  (alias)"
        return 0
    fi

    local ACTIVE=$(tmux display-message -t "$SESSION" -p '#{window_name}' 2>/dev/null)

    echo "Swarm Session — Team Windows:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    tmux list-windows -t "$SESSION" -F '#{window_index}|#{window_name}|#{pane_current_path}|#{window_active}' 2>/dev/null | while IFS='|' read -r IDX NAME CWD ACTIVE_FLAG; do
        local PROJ=$(basename "$CWD" 2>/dev/null)
        local MARKER="  "
        [ "$ACTIVE_FLAG" = "1" ] && MARKER="→ "
        printf "  %s%-2s %-12s %-25s  msg: telegraph send %s \"...\"\n" "$MARKER" "$IDX" "$NAME" "$PROJ" "$NAME"
    done

    local WIN_COUNT=$(tmux list-windows -t "$SESSION" -F '#{window_name}' 2>/dev/null | wc -l | tr -d ' ')
    local TAB_COUNT=$(tmux list-sessions -F '#{session_name}' 2>/dev/null | grep "^${SESSION}" | wc -l | tr -d ' ')
    echo ""
    echo "  $WIN_COUNT teams | $TAB_COUNT terminal tab(s)"
    echo ""
    echo "  One tab:       Ctrl+B n/p to switch teams"
    echo "  Separate tabs:  Each alias opens its own independent view"
    echo "  Detach:         Ctrl+B d"
    echo "  Attach:         swarm-attach [team]"
}

attach_session() {
    local TEAM="$1"

    if ! tmux has-session -t "$SESSION" 2>/dev/null; then
        echo "No swarm session running. Launch one first:"
        echo "  swarm-launcher.sh start <team> <project-path>"
        return 1
    fi

    if [ -n "$TEAM" ]; then
        local WINDOW=$(normalize_team "$TEAM")
        if ! tmux list-windows -t "$SESSION" -F '#{window_name}' 2>/dev/null | grep -qx "$WINDOW"; then
            echo "No window '$WINDOW' in swarm session."
            list_sessions
            return 1
        fi
        # Grouped session so this tab has its own view
        local CLIENT_NAME="${SESSION}-tab-${WINDOW}"
        tmux kill-session -t "$CLIENT_NAME" 2>/dev/null
        exec tmux new-session -d -t "$SESSION" -s "$CLIENT_NAME" \; \
             select-window -t "${CLIENT_NAME}:${WINDOW}" \; \
             attach -t "$CLIENT_NAME"
    else
        exec tmux attach -t "$SESSION"
    fi
}

kill_session() {
    local TEAM="$1"
    if [ -z "$TEAM" ]; then
        echo "Usage: swarm-launcher.sh kill <team>"
        return 1
    fi

    local WINDOW=$(normalize_team "$TEAM")

    if ! tmux has-session -t "$SESSION" 2>/dev/null; then
        echo "No swarm session running."
        return 1
    fi

    if tmux list-windows -t "$SESSION" -F '#{window_name}' 2>/dev/null | grep -qx "$WINDOW"; then
        tmux kill-window -t "${SESSION}:${WINDOW}"
        echo "Killed window: $WINDOW"
        echo "$(date '+%H:%M:%S') | SWARM | WINDOW KILLED | ${TEAM}" >> "$FEED" 2>/dev/null

        # If no windows remain, session auto-dies
        if ! tmux has-session -t "$SESSION" 2>/dev/null; then
            echo "Swarm session ended (last window closed)."
        fi
    else
        echo "No window '$WINDOW' in swarm session."
        list_sessions
    fi
}

kill_all() {
    local FOUND=false

    # Kill grouped tab sessions first, then the base session
    tmux list-sessions -F '#{session_name}' 2>/dev/null | grep "^${SESSION}" | while read -r sname; do
        tmux kill-session -t "$sname" 2>/dev/null
        FOUND=true
    done

    if tmux has-session -t "$SESSION" 2>/dev/null; then
        tmux kill-session -t "$SESSION"
        FOUND=true
    fi

    if $FOUND || tmux list-sessions -F '#{session_name}' 2>/dev/null | grep -q "^${SESSION}"; then
        echo "Swarm session killed (all teams + tabs)."
        echo "$(date '+%H:%M:%S') | SWARM | ALL SESSIONS KILLED" >> "$FEED" 2>/dev/null
    else
        echo "No swarm session running."
    fi
}

case "${1:-list}" in
    start)        shift; start_session "$@" ;;
    agent)        start_agent "$2" ;;
    team-agents)  start_team_agents "$2" ;;
    start-all)    start_all ;;
    list)         list_sessions ;;
    attach)       attach_session "$2" ;;
    kill)         kill_session "$2" ;;
    kill-all)     kill_all ;;
    *)
        echo "Swarm Launcher — Teams + Individual Agents in tmux"
        echo ""
        echo "Teams:"
        echo "  swarm-launcher.sh start <team> <path>  Add a team + attach"
        echo "  swarm-launcher.sh start-all             Launch all known teams"
        echo ""
        echo "Agents:"
        echo "  swarm-launcher.sh agent <name>          Launch single agent (claude --agent=)"
        echo "  swarm-launcher.sh team-agents <team>    Launch all agents on a team"
        echo ""
        echo "Management:"
        echo "  swarm-launcher.sh list                  List all windows"
        echo "  swarm-launcher.sh attach [team]         Attach to swarm"
        echo "  swarm-launcher.sh kill <team|agent>     Kill one window"
        echo "  swarm-launcher.sh kill-all              Kill entire swarm"
        echo ""
        echo "Inside tmux:"
        echo "  Ctrl+B n    Next window"
        echo "  Ctrl+B p    Previous window"
        echo "  Ctrl+B 0-9  Jump by index"
        echo "  Ctrl+B d    Detach (everything keeps running)"
        ;;
esac
