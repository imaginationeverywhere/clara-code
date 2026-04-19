#!/usr/bin/env bash
# Cursor Swarm Launcher — Cursor Agent CLI in tmux (parallel to swarm-launcher.sh / Claude Code)
#
# Session: cursor-swarm (override: CURSOR_SWARM_SESSION)
# Same window naming as Claude swarm (hq, wcr, slk, hq-granville, …) but separate session.
#
# Usage:
#   cursor-swarm-launcher.sh start <team> [<team> ...]     # paths from Quik Nation defaults
#   cursor-swarm-launcher.sh start <team> <project-path>   # one team, explicit path
#   cursor-swarm-launcher.sh start fmo wcr qn              # three windows, default paths
#   cursor-swarm-launcher.sh agent <name>                  # per-agent window (like swarm-launcher agent)
#   cursor-swarm-launcher.sh team-agents <team>            # all agents on team as Cursor windows
#   cursor-swarm-launcher.sh start-all                     # all known teams (same roster as Claude start-all subset)
#   cursor-swarm-launcher.sh list | attach [team] | kill <team> | kill-all
#
set -euo pipefail

SESSION="${CURSOR_SWARM_SESSION:-cursor-swarm}"
FEED="${HOME}/auset-brain/Swarms/live-feed.md"
SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"
BOILERPLATE="$(cd "${SCRIPTS_DIR}/../.." && pwd)"
TEAM_PROMPTS_DIR="${TEAM_PROMPTS_DIR:-${HOME}/auset-brain/Swarms/cursor-team-prompts}"

# shellcheck source=/dev/null
source "${SCRIPTS_DIR}/quik-heru-paths.sh"
qn_set_roots_from_boilerplate "$BOILERPLATE"

# shellcheck source=/dev/null
source "${SCRIPTS_DIR}/agent-map.sh"

CURSOR_BIN=""
for _p in /usr/local/bin/cursor "$HOME/.local/bin/cursor" /Applications/Cursor.app/Contents/Resources/app/bin/cursor; do
	if [[ -x "$_p" ]]; then
		CURSOR_BIN="$_p"
		break
	fi
done
unset _p

ensure_agent_cli() {
	if [[ -z "$CURSOR_BIN" ]]; then
		echo "ERROR: 'cursor' binary not found. Checked /usr/local/bin, ~/.local/bin, and Cursor.app." >&2
		echo "  Install Cursor and ensure the CLI is on PATH, then retry." >&2
		return 1
	fi
	return 0
}

normalize_team() {
	echo "$1" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/-team$//'
}

# tmux window name (match Claude swarm: slack → slk, 962 → s962)
cursor_window_name() {
	local t
	t=$(normalize_team "$1")
	case "$t" in
	slack) echo "slk" ;;
	962) echo "s962" ;;
	*) echo "$t" ;;
	esac
}

team_display_name() {
	local TEAM_LOWER
	TEAM_LOWER=$(normalize_team "$1")
	case "$TEAM_LOWER" in
	hq | headquarters) echo "Headquarters" ;;
	*) echo "$1" ;;
	esac
}

# Default repo paths — from quik-heru-paths.sh (works with ~/Native-Projects/... symlinks)
resolve_cursor_project() {
	local t p
	t=$(normalize_team "$1")
	p=$(qn_team_project_path "$t")
	if [[ -n "$p" ]]; then
		echo "$p"
		return 0
	fi
	team_project "$t"
}

build_cursor_cmd() {
	local team="$1"
	local proj="$2"
	local t
	t=$(normalize_team "$team")
	local pf="${TEAM_PROMPTS_DIR}/${t}.md"
	local msg
	if [ -f "$pf" ]; then
		msg="You are the ${t} team Cursor agent. Open and follow this file first: ${pf}. Identify as team ${t} in output. Post meaningful updates to ~/auset-brain/Swarms/live-feed.md when you complete work."
	else
		msg="You are the ${t} team Cursor agent. Workspace is your team's repo. For a fixed brief, create: ${pf}. Identify as team ${t}. Use ~/auset-brain/Swarms/live-feed.md for coordination."
	fi
	printf '%q agent --yolo --workspace %q %q; echo "--- cursor agent exited ($?) — press Enter to close ---"; read' "$CURSOR_BIN" "$proj" "$msg"
}

# One team + project → ensure window exists, attach
launch_team_window() {
	local TEAM="$1"
	local PROJECT="$2"

	if [ -z "$TEAM" ] || [ -z "$PROJECT" ]; then
		echo "Usage: internal launch_team_window <team> <project-path>"
		return 1
	fi

	if [ ! -d "$PROJECT" ]; then
		echo "ERROR: Project directory not found: $PROJECT"
		return 1
	fi

	local WINDOW
	WINDOW=$(cursor_window_name "$TEAM")
	local DISPLAY_TEAM
	DISPLAY_TEAM=$(team_display_name "$TEAM")
	local CMD
	CMD=$(build_cursor_cmd "$TEAM" "$PROJECT")

	if ! tmux has-session -t "$SESSION" 2>/dev/null; then
		echo "$(date '+%H:%M:%S') | $(basename "$PROJECT") | CURSOR SWARM START | ${DISPLAY_TEAM} | ${WINDOW}" >>"$FEED" 2>/dev/null || true
		exec tmux new-session -s "$SESSION" -n "$WINDOW" -c "$PROJECT" bash -lc "$CMD"
	fi

	if ! tmux list-windows -t "$SESSION" -F '#{window_name}' 2>/dev/null | grep -qx "$WINDOW"; then
		tmux new-window -t "$SESSION" -n "$WINDOW" -c "$PROJECT" bash -lc "$CMD"
		echo "$(date '+%H:%M:%S') | $(basename "$PROJECT") | CURSOR SWARM WINDOW | ${DISPLAY_TEAM} | ${WINDOW}" >>"$FEED" 2>/dev/null || true
	fi

	if [ -n "${TMUX:-}" ]; then
		tmux select-window -t "${SESSION}:${WINDOW}"
	else
		local CLIENT_NAME="${SESSION}-tab-${WINDOW}"
		tmux kill-session -t "$CLIENT_NAME" 2>/dev/null || true
		exec tmux new-session -d -t "$SESSION" -s "$CLIENT_NAME" \; \
			select-window -t "${CLIENT_NAME}:${WINDOW}" \; \
			attach -t "$CLIENT_NAME"
	fi
}

# Parse: alternating team [optional /abs/path] … If next arg is absolute existing dir, use as path for current team.
start_sessions() {
	ensure_agent_cli || return 1
	if [ $# -eq 0 ]; then
		echo "Usage: cursor-swarm-launcher.sh start <team> [<abs-path>] [<team> [<abs-path>] ...]"
		echo "  Paths default to the same repos as Claude aliases (agent-aliases.sh)."
		echo "  Examples:"
		echo "    cursor-swarm-launcher.sh start fmo"
		echo "    cursor-swarm-launcher.sh start fmo wcr qn pkgs"
		echo "    cursor-swarm-launcher.sh start qcr /custom/path/to/quikcarrental"
		return 1
	fi

	while [ $# -gt 0 ]; do
		TEAM="$1"
		shift
		PROJECT=""
		if [ -n "${1:-}" ] && [ "${1#/}" != "$1" ] && [ -d "$1" ]; then
			PROJECT="$1"
			shift
		else
			PROJECT=$(resolve_cursor_project "$TEAM")
		fi
		if [ ! -d "$PROJECT" ]; then
			echo "ERROR: team '$TEAM' → path not found: $PROJECT"
			return 1
		fi
		# Last team wins attach/exec; earlier teams only add windows when session already exists
		if [ $# -eq 0 ]; then
			launch_team_window "$TEAM" "$PROJECT"
			return 0
		fi
		# More teams coming: add window without attaching this shell (detach pattern)
		WINDOW=$(cursor_window_name "$TEAM")
		CMD=$(build_cursor_cmd "$TEAM" "$PROJECT")
		if ! tmux has-session -t "$SESSION" 2>/dev/null; then
			tmux new-session -d -s "$SESSION" -n "$WINDOW" -c "$PROJECT" bash -lc "$CMD"
			echo "$(date '+%H:%M:%S') | $(basename "$PROJECT") | CURSOR SWARM START | ${TEAM} | ${WINDOW}" >>"$FEED" 2>/dev/null || true
		elif ! tmux list-windows -t "$SESSION" -F '#{window_name}' 2>/dev/null | grep -qx "$WINDOW"; then
			tmux new-window -t "$SESSION" -n "$WINDOW" -c "$PROJECT" bash -lc "$CMD"
			echo "$(date '+%H:%M:%S') | $(basename "$PROJECT") | CURSOR SWARM WINDOW | ${TEAM} | ${WINDOW}" >>"$FEED" 2>/dev/null || true
		else
			echo "Window '$WINDOW' already exists — skipping"
		fi
	done
}

cursor_start_agent() {
	ensure_agent_cli || return 1
	local AGENT_NAME="$1"
	if [ -z "$AGENT_NAME" ]; then
		echo "Usage: cursor-swarm-launcher.sh agent <agent-name>"
		return 1
	fi

	local RESOLVED
	RESOLVED=$(resolve_agent "$AGENT_NAME")
	if [ $? -ne 0 ] || [ -z "$RESOLVED" ]; then
		echo "ERROR: Unknown agent '$AGENT_NAME'"
		return 1
	fi

	local AGENT_TEAM
	AGENT_TEAM=$(echo "$RESOLVED" | cut -d'|' -f1)
	local AGENT_FILE
	AGENT_FILE=$(echo "$RESOLVED" | cut -d'|' -f2)

	if [ "$AGENT_TEAM" = "TEAM" ]; then
		echo "That's a team name. Use: cursor-swarm-launcher.sh start ${AGENT_FILE}"
		return 1
	fi

	local PROJECT
	PROJECT=$(resolve_cursor_project "$AGENT_TEAM")
	local WINDOW="${AGENT_TEAM}-${AGENT_FILE}"
	local AGENT_MD="${BOILERPLATE}/.claude/agents/${AGENT_FILE}.md"
	local SHORT_NAME
	SHORT_NAME=$(echo "$AGENT_FILE" | cut -d'-' -f1)

	local msg="You are Cursor agent ${SHORT_NAME} (file: ${AGENT_FILE}). Team ${AGENT_TEAM}. Read and follow identity/skills in: ${AGENT_MD}. Workspace: ${PROJECT}. Post updates to ~/auset-brain/Swarms/live-feed.md. Use session-registry / team wake patterns when coordinating."
	local CMD
	CMD=$(printf '%q agent --yolo --workspace %q %q; echo "--- cursor agent exited ($?) — press Enter to close ---"; read' "$CURSOR_BIN" "$PROJECT" "$msg")

	if ! tmux has-session -t "$SESSION" 2>/dev/null; then
		echo "$(date '+%H:%M:%S') | CURSOR AGENT | ${AGENT_FILE} | ${AGENT_TEAM}" >>"$FEED" 2>/dev/null || true
		exec tmux new-session -s "$SESSION" -n "$WINDOW" -c "$PROJECT" bash -lc "$CMD"
	fi

	if ! tmux list-windows -t "$SESSION" -F '#{window_name}' 2>/dev/null | grep -qx "$WINDOW"; then
		tmux new-window -t "$SESSION" -n "$WINDOW" -c "$PROJECT" bash -lc "$CMD"
		echo "$(date '+%H:%M:%S') | CURSOR AGENT WINDOW | ${AGENT_FILE}" >>"$FEED" 2>/dev/null || true
	fi

	if [ -n "${TMUX:-}" ]; then
		tmux select-window -t "${SESSION}:${WINDOW}"
	else
		local CLIENT_NAME="${SESSION}-tab-${WINDOW}"
		tmux kill-session -t "$CLIENT_NAME" 2>/dev/null || true
		exec tmux new-session -d -t "$SESSION" -s "$CLIENT_NAME" \; \
			select-window -t "${CLIENT_NAME}:${WINDOW}" \; \
			attach -t "$CLIENT_NAME"
	fi
}

cursor_team_agents() {
	ensure_agent_cli || return 1
	local TEAM="$1"
	if [ -z "$TEAM" ]; then
		echo "Usage: cursor-swarm-launcher.sh team-agents <team>"
		return 1
	fi
	local TNORM
	TNORM=$(normalize_team "$TEAM")
	local COUNT=0
	local FIRST=true

	for AGENT_FILE in $(team_agents "$TNORM"); do
		[ -z "$AGENT_FILE" ] && continue
		local R
		R=$(resolve_agent "$AGENT_FILE") || continue
		local AGENT_TEAM
		AGENT_TEAM=$(echo "$R" | cut -d'|' -f1)
		local AF
		AF=$(echo "$R" | cut -d'|' -f2)
		if [ "$AGENT_TEAM" = "TEAM" ]; then
			continue
		fi
		if [ "$AGENT_TEAM" = "unknown" ]; then
			AGENT_TEAM="$TNORM"
		fi

		local PROJECT
		PROJECT=$(resolve_cursor_project "$AGENT_TEAM")
		if [ ! -d "$PROJECT" ]; then
			echo "SKIP ${AF}: no project for team ${AGENT_TEAM} ($PROJECT)"
			continue
		fi

		local WINDOW="${AGENT_TEAM}-${AF}"
		local AGENT_MD="${BOILERPLATE}/.claude/agents/${AF}.md"
		local SHORT_NAME
		SHORT_NAME=$(echo "$AF" | cut -d'-' -f1)
		local msg="You are Cursor agent ${SHORT_NAME} (file: ${AF}). Team ${AGENT_TEAM}. Read and follow: ${AGENT_MD}. Workspace: ${PROJECT}. Post updates to ~/auset-brain/Swarms/live-feed.md."
		local CMD
		CMD=$(printf '%q agent --yolo --workspace %q %q; echo "--- cursor agent exited ($?) — press Enter to close ---"; read' "$CURSOR_BIN" "$PROJECT" "$msg")

		if $FIRST; then
			if ! tmux has-session -t "$SESSION" 2>/dev/null; then
				tmux new-session -d -s "$SESSION" -n "$WINDOW" -c "$PROJECT" bash -lc "$CMD"
			elif ! tmux list-windows -t "$SESSION" -F '#{window_name}' 2>/dev/null | grep -qx "$WINDOW"; then
				tmux new-window -t "$SESSION" -n "$WINDOW" -c "$PROJECT" bash -lc "$CMD"
			else
				echo "Window exists: $WINDOW — skipping"
			fi
			FIRST=false
		else
			if ! tmux list-windows -t "$SESSION" -F '#{window_name}' 2>/dev/null | grep -qx "$WINDOW"; then
				tmux new-window -t "$SESSION" -n "$WINDOW" -c "$PROJECT" bash -lc "$CMD"
			else
				echo "Window exists: $WINDOW — skipping"
			fi
		fi
		COUNT=$((COUNT + 1))
		sleep 1
	done

	echo "Launched ${COUNT} Cursor agent window(s) for team ${TNORM} (session ${SESSION})."
	if [ "$COUNT" -eq 0 ]; then
		echo "No agents resolved for team ${TNORM}."
		return 1
	fi
	exec tmux attach -t "$SESSION"
}

# All teams as PANES in one window (not separate tabs)
start_panes() {
	ensure_agent_cli || return 1
	if [ $# -eq 0 ]; then
		echo "Usage: cursor-swarm-launcher.sh panes <team> [<team> ...]"
		echo "  Opens all teams as splits in ONE tmux window."
		return 1
	fi

	local WINDOW_NAME="teams"
	local TEAMS_LIST=()
	local PROJECTS_LIST=()

	while [ $# -gt 0 ]; do
		local TEAM="$1"; shift
		local PROJECT=""
		if [ -n "${1:-}" ] && [ "${1#/}" != "$1" ] && [ -d "$1" ]; then
			PROJECT="$1"; shift
		else
			PROJECT=$(resolve_cursor_project "$TEAM")
		fi
		if [ ! -d "$PROJECT" ]; then
			echo "ERROR: team '$TEAM' → path not found: $PROJECT"
			return 1
		fi
		TEAMS_LIST+=("$TEAM")
		PROJECTS_LIST+=("$PROJECT")
	done

	local COUNT=${#TEAMS_LIST[@]}
	if [ "$COUNT" -eq 0 ]; then
		echo "No teams resolved."
		return 1
	fi

	# Build window name from team keys
	WINDOW_NAME=$(IFS='-'; echo "${TEAMS_LIST[*]}")

	# First team: create session or window
	local FIRST_TEAM="${TEAMS_LIST[0]}"
	local FIRST_PROJECT="${PROJECTS_LIST[0]}"
	local FIRST_CMD
	FIRST_CMD=$(build_cursor_cmd "$FIRST_TEAM" "$FIRST_PROJECT")

	if ! tmux has-session -t "$SESSION" 2>/dev/null; then
		tmux new-session -d -s "$SESSION" -n "$WINDOW_NAME" -c "$FIRST_PROJECT" -x 220 -y 55
		tmux send-keys -t "${SESSION}:${WINDOW_NAME}" "bash -lc $(printf '%q' "$FIRST_CMD")" Enter
	else
		# Kill existing window with same name to rebuild
		tmux kill-window -t "${SESSION}:${WINDOW_NAME}" 2>/dev/null || true
		tmux new-window -t "$SESSION" -n "$WINDOW_NAME" -c "$FIRST_PROJECT"
		tmux send-keys -t "${SESSION}:${WINDOW_NAME}" "bash -lc $(printf '%q' "$FIRST_CMD")" Enter
	fi

	tmux select-pane -t "${SESSION}:${WINDOW_NAME}.0" -T "$FIRST_TEAM"

	# Remaining teams: split-window into new panes
	for i in $(seq 1 $((COUNT - 1))); do
		local T="${TEAMS_LIST[$i]}"
		local P="${PROJECTS_LIST[$i]}"
		local CMD
		CMD=$(build_cursor_cmd "$T" "$P")
		tmux split-window -t "${SESSION}:${WINDOW_NAME}" -v -c "$P"
		tmux send-keys -t "${SESSION}:${WINDOW_NAME}" "bash -lc $(printf '%q' "$CMD")" Enter
		# Tag pane with team name
		local PANE_IDX
		PANE_IDX=$(tmux display-message -t "${SESSION}:${WINDOW_NAME}" -p '#{pane_index}')
		tmux select-pane -t "${SESSION}:${WINDOW_NAME}.${PANE_IDX}" -T "$T"
	done

	# Tile evenly and select first pane
	tmux select-layout -t "${SESSION}:${WINDOW_NAME}" tiled
	tmux select-pane -t "${SESSION}:${WINDOW_NAME}.0"

	echo "Cursor panes: ${TEAMS_LIST[*]} (window: ${WINDOW_NAME})"
	echo "$(date '+%H:%M:%S') | CURSOR PANES | ${TEAMS_LIST[*]}" >>"$FEED" 2>/dev/null || true

	# Attach
	if [ -n "${TMUX:-}" ]; then
		tmux select-window -t "${SESSION}:${WINDOW_NAME}"
	else
		exec tmux attach -t "$SESSION"
	fi
}

cursor_start_all() {
	ensure_agent_cli || return 1
	local ORDER=(hq wcr pkgs s962 qcr fmo devops trackit st qcarry qn slk pgcmc)
	local FIRST=true
	for TEAM in "${ORDER[@]}"; do
		local PROJ
		PROJ=$(resolve_cursor_project "$TEAM")
		if [ ! -d "$PROJ" ]; then
			echo "SKIP ${TEAM}: $PROJ"
			continue
		fi
		local WINDOW
		WINDOW=$(cursor_window_name "$TEAM")
		local CMD
		CMD=$(build_cursor_cmd "$TEAM" "$PROJ")
		if $FIRST; then
			if ! tmux has-session -t "$SESSION" 2>/dev/null; then
				tmux new-session -d -s "$SESSION" -n "$WINDOW" -c "$PROJ" bash -lc "$CMD"
				echo "  Created ${SESSION} with: ${WINDOW}"
			elif ! tmux list-windows -t "$SESSION" -F '#{window_name}' 2>/dev/null | grep -qx "$WINDOW"; then
				tmux new-window -t "$SESSION" -n "$WINDOW" -c "$PROJ" bash -lc "$CMD"
				echo "  Added window: ${WINDOW}"
			fi
			FIRST=false
		else
			if ! tmux list-windows -t "$SESSION" -F '#{window_name}' 2>/dev/null | grep -qx "$WINDOW"; then
				tmux new-window -t "$SESSION" -n "$WINDOW" -c "$PROJ" bash -lc "$CMD"
				echo "  Added window: ${WINDOW}"
			fi
		fi
		sleep 1
	done
	echo ""
	echo "Attach: tmux attach -t ${SESSION}"
}

list_sessions() {
	if ! tmux has-session -t "$SESSION" 2>/dev/null; then
		echo "No Cursor swarm session (${SESSION})."
		echo "  Launch: c-fmo   or   cursor-swarm-launcher.sh start fmo wcr"
		return 0
	fi

	echo "Cursor Swarm Session (${SESSION}) — Cursor Agent CLI windows:"
	echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	tmux list-windows -t "$SESSION" -F '#{window_index}|#{window_name}|#{pane_current_path}|#{window_active}' 2>/dev/null | while IFS='|' read -r IDX NAME CWD ACTIVE_FLAG; do
		local PROJ
		PROJ=$(basename "$CWD" 2>/dev/null || echo "")
		local MARKER="  "
		[ "$ACTIVE_FLAG" = "1" ] && MARKER="→ "
		printf "  %s%-2s %-22s %-25s\n" "$MARKER" "$IDX" "$NAME" "$PROJ"
	done
	echo ""
	echo "  Attach: cursor-attach / tmux attach -t ${SESSION}"
}

attach_session() {
	local TEAM="$1"
	if ! tmux has-session -t "$SESSION" 2>/dev/null; then
		echo "No Cursor swarm session. Launch: c-hq  or  c-teams fmo wcr"
		return 1
	fi

	if [ -n "$TEAM" ]; then
		local WINDOW
		WINDOW=$(cursor_window_name "$TEAM")
		if ! tmux list-windows -t "$SESSION" -F '#{window_name}' 2>/dev/null | grep -qx "$WINDOW"; then
			echo "No window '${WINDOW}' in ${SESSION}."
			list_sessions
			return 1
		fi
		local CLIENT_NAME="${SESSION}-tab-${WINDOW}"
		tmux kill-session -t "$CLIENT_NAME" 2>/dev/null || true
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
		echo "Usage: cursor-swarm-launcher.sh kill <team-or-window-name>"
		return 1
	fi

	local WINDOW
	WINDOW=$(cursor_window_name "$TEAM")
	# Allow killing agent windows: pass full window name if normalize changed it wrong
	if ! tmux list-windows -t "$SESSION" -F '#{window_name}' 2>/dev/null | grep -qx "$WINDOW"; then
		WINDOW="$TEAM"
	fi

	if ! tmux has-session -t "$SESSION" 2>/dev/null; then
		echo "No Cursor swarm session."
		return 1
	fi

	if tmux list-windows -t "$SESSION" -F '#{window_name}' 2>/dev/null | grep -qx "$WINDOW"; then
		tmux kill-window -t "${SESSION}:${WINDOW}"
		echo "Killed window: $WINDOW"
	else
		echo "No window '$WINDOW' in ${SESSION}."
		list_sessions
	fi
}

kill_all() {
	tmux list-sessions -F '#{session_name}' 2>/dev/null | grep "^${SESSION}" | while read -r sname; do
		tmux kill-session -t "$sname" 2>/dev/null || true
	done
	if tmux has-session -t "$SESSION" 2>/dev/null; then
		tmux kill-session -t "$SESSION"
	fi
	echo "Cursor swarm sessions killed."
}

case "${1:-list}" in
start)
	shift
	start_sessions "$@"
	;;
panes)
	shift
	start_panes "$@"
	;;
agent) cursor_start_agent "${2:-}" ;;
team-agents) cursor_team_agents "${2:-}" ;;
start-all) cursor_start_all ;;
list) list_sessions ;;
attach) attach_session "${2:-}" ;;
kill) kill_session "${2:-}" ;;
kill-all) kill_all ;;
*)
	echo "Cursor Swarm Launcher — Cursor Agent CLI in tmux (session: ${SESSION})"
	echo ""
	echo "Teams (combine freely):"
	echo "  cursor-swarm-launcher.sh start <team> [<team> ...]   # separate tabs"
	echo "  cursor-swarm-launcher.sh panes <team> [<team> ...]   # panes in ONE window"
	echo "  cursor-swarm-launcher.sh start <team> /abs/path      # one team, custom path"
	echo "  cursor-swarm-launcher.sh start-all"
	echo ""
	echo "Agents:"
	echo "  cursor-swarm-launcher.sh agent <name>"
	echo "  cursor-swarm-launcher.sh team-agents <team>"
	echo ""
	echo "Manage:"
	echo "  cursor-swarm-launcher.sh list | attach [team] | kill <team> | kill-all"
	echo ""
	echo "Shell aliases:"
	echo "  c-teams fmo wcr qn     → panes (one window, splits)"
	echo "  c-tabs fmo wcr qn      → tabs (separate windows)"
	echo "  c-fmo, c-wcr, c-hq     → single team tab"
	;;
esac
