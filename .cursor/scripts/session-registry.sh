#!/bin/bash
# Session Registry v3 — Feed + Inbox ONLY. Zero send-keys.
#
# RULE: NEVER use tmux send-keys for inter-agent communication.
#   tmux send-keys injects keystrokes into the active prompt.
#   If ANYONE is typing, their input gets destroyed. Not safe. Period.
#
# The ONLY code that uses send-keys is vtalk (voice-to-swarm.sh)
# because Mo deliberately chooses when to send voice input.
#
# All agent-to-agent messages go to:
#   1. Live feed (~/auset-brain/Swarms/live-feed.md) — audit trail
#   2. Inbox file (/tmp/swarm-inboxes/<team>.md) — per-team delivery
#   Agents read their inbox on their next turn (pull model).
#
# Usage:
#   session-registry.sh list                 List discovered sessions
#   session-registry.sh find <team>          Print tmux target for a team
#   session-registry.sh wake <team> <msg>    Write to inbox + feed (NO send-keys)
#   session-registry.sh wake-all <msg>       Notify all teams (except HQ)
#   session-registry.sh discover             Re-scan and count sessions

SESSION="swarm"
CURSOR_SESSION="cursor-swarm"
REGISTRY_FILE="$HOME/auset-brain/Swarms/.session-registry"
INBOX_DIR="/tmp/swarm-inboxes"
FEED="$HOME/auset-brain/Swarms/live-feed.md"

mkdir -p "$(dirname "$REGISTRY_FILE")" "$INBOX_DIR" 2>/dev/null

resolve_alias() {
    case "$(echo "$1" | tr '[:upper:]' '[:lower:]')" in
        hq|headquarters) echo "hq" ;;
        pkgs|packages)   echo "pkgs" ;;
        qn)              echo "qn" ;;
        wcr)             echo "wcr" ;;
        qcr)             echo "qcr" ;;
        fmo)             echo "fmo" ;;
        st)              echo "st" ;;
        s962|962)        echo "s962" ;;
        slk|slack)       echo "slk" ;;
        qcarry)          echo "qcarry" ;;
        devops)          echo "devops" ;;
        trackit)         echo "trackit" ;;
        pgcmc)           echo "pgcmc" ;;
        *)               echo "$1" ;;
    esac
}

# Map pane title (set by Claude Code / launcher) → short team alias.
# Claude sets titles like "✳ World Cup Ready Team" or "✳ Headquarters".
pane_title_to_team() {
    local t="$1"
    case "$t" in
        *[Hh]eadquarters*)                   echo "hq" ;;
        *[Pp]ackage*|*[Pp]kgs*)              echo "pkgs" ;;
        *FMO*|*fmo*)                          echo "fmo" ;;
        *[Ww]orld*[Cc]up*[Rr]eady*|*WCR*)   echo "wcr" ;;
        *[Qq]uik*[Cc]ar*[Rr]ental*|*QCR*)   echo "qcr" ;;
        *[Qq]uik*[Nn]ation*|*quiknation*)    echo "qn" ;;
        *[Ss]eeking*[Tt]alent*)              echo "st" ;;
        *[Ss]ite962*|*s962*)                 echo "s962" ;;
        *[Ss]liplink*)                       echo "slk" ;;
        *[Qq]uik[Cc]arry*)                   echo "qcarry" ;;
        *[Dd]ev[Oo]ps*)                      echo "devops" ;;
        *[Tt]rack[Ii]t*)                     echo "trackit" ;;
        *PGCMC*|*pgcmc*)                     echo "pgcmc" ;;
        *)                                   echo "" ;;
    esac
}

discover() {
    > "$REGISTRY_FILE"

    command -v tmux &>/dev/null || { echo "0"; return; }

    # Claude Code (swarm:*) — scan PANES, not just windows.
    # After tri-swarm-layout.sh, multiple teams live as panes inside one window (e.g. hq).
    # We register each pane by its team alias → swarm:window.pane_index
    if tmux has-session -t "$SESSION" 2>/dev/null; then
        tmux list-panes -t "$SESSION" -a -F '#{window_name}|#{pane_index}|#{pane_title}' 2>/dev/null | while IFS='|' read -r wname pidx ptitle; do
            local TEAM
            TEAM=$(pane_title_to_team "$ptitle")
            if [ -n "$TEAM" ]; then
                if ! grep -qi "^${TEAM}|" "$REGISTRY_FILE" 2>/dev/null; then
                    echo "${TEAM}|claude|${SESSION}:${wname}.${pidx}" >> "$REGISTRY_FILE"
                fi
            else
                # Unrecognized title — register by window name (single-pane fallback)
                if ! grep -qi "^${wname}|" "$REGISTRY_FILE" 2>/dev/null; then
                    echo "${wname}|claude|${SESSION}:${wname}" >> "$REGISTRY_FILE"
                fi
            fi
        done
    fi

    # Cursor Agent windows (cursor-swarm:*) → type=cursor (NEVER wake-able)
    if tmux has-session -t "$CURSOR_SESSION" 2>/dev/null; then
        tmux list-panes -t "$CURSOR_SESSION" -a -F '#{window_name}|#{pane_index}|#{pane_title}' 2>/dev/null | while IFS='|' read -r wname pidx ptitle; do
            local TEAM
            TEAM=$(pane_title_to_team "$ptitle")
            [ -z "$TEAM" ] && TEAM="$wname"
            if ! grep -qi "^${TEAM}|" "$REGISTRY_FILE" 2>/dev/null; then
                echo "${TEAM}|cursor|${CURSOR_SESSION}:${wname}.${pidx}" >> "$REGISTRY_FILE"
            fi
        done
    fi

    # Legacy separate sessions (swarm-<team>), skip anything cursor-swarm*
    tmux list-sessions -F '#{session_name}' 2>/dev/null | grep "^${SESSION}-" | while read -r sname; do
        [[ "$sname" == "${CURSOR_SESSION}" || "$sname" == "${CURSOR_SESSION}-"* ]] && continue
        local TEAM
        TEAM=$(echo "$sname" | sed "s/^${SESSION}-//")
        if ! grep -qi "^${TEAM}|" "$REGISTRY_FILE" 2>/dev/null; then
            echo "${TEAM}|claude|${sname}" >> "$REGISTRY_FILE"
        fi
    done

    wc -l < "$REGISTRY_FILE" 2>/dev/null | tr -d ' '
}

list_sessions() {
    discover > /dev/null

    if [ ! -s "$REGISTRY_FILE" ]; then
        echo "No active sessions found."
        echo "Launch: hq / wcr / pkgs (Claude) or c-fmo / c-wcr (Cursor)"
        return 1
    fi

    echo "Session Registry v3 (feed + inbox only — zero send-keys):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    while IFS='|' read -r NAME TYPE ID; do
        local INBOX_COUNT=0
        local INBOX_FILE="$INBOX_DIR/${NAME}.md"
        [ -f "$INBOX_FILE" ] && [ -s "$INBOX_FILE" ] && INBOX_COUNT=$(wc -l < "$INBOX_FILE" | tr -d ' ')
        local INBOX_TAG=""
        [ "$INBOX_COUNT" -gt 0 ] && INBOX_TAG=" [${INBOX_COUNT} msg]"

        if [ "$TYPE" = "claude" ]; then
            printf "  %-15s %-8s %-22s%s\n" "$NAME" "[claude]" "$ID" "$INBOX_TAG"
        else
            printf "  %-15s %-8s %-22s (protected — no wake)\n" "$NAME" "[cursor]" "$ID"
        fi
    done < "$REGISTRY_FILE"
}

find_session() {
    discover > /dev/null
    local SEARCH
    SEARCH=$(resolve_alias "$1")
    grep -i "^${SEARCH}|claude|" "$REGISTRY_FILE" 2>/dev/null | head -1 | cut -d'|' -f3
}

wake_session() {
    local SEARCH="$1"
    local MESSAGE="${2:-Check the live feed for directives from HQ}"

    SEARCH=$(resolve_alias "$SEARCH")
    discover > /dev/null

    local MATCH
    MATCH=$(grep -i "^${SEARCH}|" "$REGISTRY_FILE" 2>/dev/null | head -1)

    if [ -z "$MATCH" ]; then
        echo "No session found matching: $SEARCH"
        echo "$(date '+%H:%M:%S') | DISPATCH FAILED | TO:${SEARCH} | Session not found | ${MESSAGE}" >> "$FEED" 2>/dev/null
        return 1
    fi

    local NAME TYPE ID
    NAME=$(echo "$MATCH" | cut -d'|' -f1)
    TYPE=$(echo "$MATCH" | cut -d'|' -f2)
    ID=$(echo "$MATCH" | cut -d'|' -f3)

    # 1. Write to team inbox (agents read on next turn)
    local TIMESTAMP
    TIMESTAMP=$(date '+%H:%M:%S')
    echo "[${TIMESTAMP}] ${MESSAGE}" >> "$INBOX_DIR/${NAME}.md"

    # 2. Log to live feed (audit trail for HQ)
    echo "${TIMESTAMP} | DISPATCH | TO:${NAME} | via inbox | ${MESSAGE}" >> "$FEED" 2>/dev/null

    echo "Notified '${NAME}' (inbox: ${INBOX_DIR}/${NAME}.md): ${MESSAGE}"
    return 0
}

wake_all() {
    local MESSAGE="${1:-Check the live feed for directives from HQ}"

    discover > /dev/null

    while IFS='|' read -r NAME TYPE ID; do
        [ "$TYPE" = "claude" ] || continue
        local NAME_LOWER
        NAME_LOWER=$(echo "$NAME" | tr '[:upper:]' '[:lower:]')
        [[ "$NAME_LOWER" == "hq" || "$NAME_LOWER" == "headquarters" ]] && continue
        wake_session "$NAME" "$MESSAGE"
        sleep 0.5
    done < "$REGISTRY_FILE"
}

case "${1:-list}" in
    list)       list_sessions ;;
    find)       find_session "$2" ;;
    wake)       wake_session "$2" "$3" ;;
    wake-all)   wake_all "$2" ;;
    discover)   COUNT=$(discover); echo "Discovered $COUNT sessions" ;;
    *)
        echo "Session Registry v3 — Feed + inbox only (zero send-keys)"
        echo ""
        echo "Usage:"
        echo "  $0 list                    List all sessions"
        echo "  $0 find <team>             Find tmux target for a team"
        echo "  $0 wake <team> <message>   Write to team inbox + live feed"
        echo "  $0 wake-all <message>      Notify all teams (except HQ)"
        echo "  $0 discover                Re-scan sessions"
        echo ""
        echo "RULE: tmux send-keys is BANNED for agent dispatch."
        echo "Only vtalk (voice-to-swarm.sh) uses send-keys — Mo controls that."
        ;;
esac
