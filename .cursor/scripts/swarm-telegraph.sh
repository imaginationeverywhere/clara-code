#!/bin/bash
# Swarm Telegraph v3 — Feed + Inbox messaging (zero send-keys)
# Named after Granville T. Woods' Multiplex Telegraph (1887)
#
# How it works:
#   1. fswatch monitors the live feed file for changes
#   2. When a TO:<TEAM> message is written, the parser extracts it
#   3. Message is written to /tmp/swarm-inboxes/<team>.md
#   4. session-registry.sh writes to inbox + feed (NO send-keys)
#   5. Agents read their inbox on next turn (pull model)
#
# Usage:
#   swarm-telegraph.sh start              Start the daemon
#   swarm-telegraph.sh stop               Stop the daemon
#   swarm-telegraph.sh status             Check status + inbox counts
#   swarm-telegraph.sh send <team> "msg"  Send message to team
#   swarm-telegraph.sh check <team>       Read team inbox
#   swarm-telegraph.sh clear <team>       Clear team inbox

FEED_FILE="$HOME/auset-brain/Swarms/live-feed.md"
PID_FILE="/tmp/swarm-telegraph.pid"
INBOX_DIR="/tmp/swarm-inboxes"
LOG_FILE="/tmp/swarm-telegraph.log"

TEAMS="hq pkgs devops s962 qcr fmo wcr qcarry qn slack trackit st pgcmc"

mkdir -p "$INBOX_DIR"

start_daemon() {
    if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
        echo "Telegraph already running (PID $(cat "$PID_FILE"))"
        return 0
    fi

    local start_lines
    start_lines=$(wc -l < "$FEED_FILE" 2>/dev/null || echo "0")

    echo "Starting Swarm Telegraph v2 (Cursor-safe)..."
    echo "Watching: $FEED_FILE"
    echo "Inboxes: $INBOX_DIR/"

    local SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

    (
        echo "$start_lines" > /tmp/swarm-telegraph-lastline

        fswatch -o "$FEED_FILE" 2>/dev/null | while read -r _; do
            local last_line current_lines
            last_line=$(cat /tmp/swarm-telegraph-lastline 2>/dev/null || echo "0")
            current_lines=$(wc -l < "$FEED_FILE")

            if [ "$current_lines" -gt "$last_line" ]; then
                local new_lines
                new_lines=$(tail -n +"$((last_line + 1))" "$FEED_FILE")

                # Parse TO:<TEAM> messages (skip DISPATCH echoes to prevent loops)
                echo "$new_lines" | grep -i "TO:" | grep -viE '\| DISPATCH( FAILED)? \|' | while IFS= read -r line; do
                    local target
                    target=$(echo "$line" | grep -oiE 'TO:[A-Za-z0-9_-]+' | head -1 | cut -d: -f2 | tr '[:upper:]' '[:lower:]')

                    if [ -n "$target" ]; then
                        local timestamp
                        timestamp=$(date '+%H:%M:%S')

                        # Write to inbox (backup for hook-based pickup)
                        if [ "$target" = "all" ]; then
                            for team in $TEAMS; do
                                echo "[$timestamp] $line" >> "$INBOX_DIR/$team.md"
                            done
                            echo "[$timestamp] BROADCAST: $line" >> "$LOG_FILE"
                        else
                            echo "[$timestamp] $line" >> "$INBOX_DIR/$target.md"
                            echo "[$timestamp] -> $target: $line" >> "$LOG_FILE"
                        fi
                    fi
                done

                echo "$current_lines" > /tmp/swarm-telegraph-lastline
            fi
        done
    ) &

    local daemon_pid=$!
    echo "$daemon_pid" > "$PID_FILE"
    echo "Telegraph v3 started (PID $daemon_pid)"
    echo "Delivery: inbox files only (zero send-keys). Display: companion panes (tail -f)."
    echo "$(date '+%H:%M:%S') | TELEGRAPH | STARTED | PID $daemon_pid" >> "$LOG_FILE"
}

stop_daemon() {
    if [ -f "$PID_FILE" ]; then
        local pid
        pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null
            pkill -P "$pid" 2>/dev/null
            echo "Telegraph stopped (PID $pid)"
            echo "$(date '+%H:%M:%S') | TELEGRAPH | STOPPED" >> "$LOG_FILE"
        else
            echo "Telegraph was not running (stale PID)"
        fi
        rm -f "$PID_FILE"
    else
        echo "Telegraph is not running"
    fi
}

status_daemon() {
    if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
        echo "Telegraph v2: RUNNING (PID $(cat "$PID_FILE"))  [Cursor-safe]"
        echo ""
        echo "Inboxes:"
        local has_any=false
        for team in $TEAMS; do
            local count=0
            if [ -f "$INBOX_DIR/$team.md" ] && [ -s "$INBOX_DIR/$team.md" ]; then
                count=$(wc -l < "$INBOX_DIR/$team.md" | tr -d ' ')
                printf "  %-12s %d message(s) WAITING\n" "$team" "$count"
                has_any=true
            fi
        done
        $has_any || echo "  (all inboxes empty)"
    else
        echo "Telegraph v2: NOT RUNNING"
        echo "Run: swarm-telegraph.sh start"
    fi
}

send_message() {
    local target="$1"
    shift
    local message="$*"

    if [ -z "$target" ] || [ -z "$message" ]; then
        echo "Usage: swarm-telegraph.sh send <team> \"message\""
        return 1
    fi

    target=$(echo "$target" | tr '[:upper:]' '[:lower:]')
    local timestamp
    timestamp=$(date '+%H:%M:%S')
    local SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

    # Write to live feed (archive + triggers feed-watcher auto-dispatch)
    echo "$timestamp | swarm-telegraph | TO:$(echo "$target" | tr '[:lower:]' '[:upper:]') | $message" >> "$FEED_FILE"

    # Write to inbox (backup)
    if [ "$target" = "all" ]; then
        for team in $TEAMS; do
            echo "[$timestamp] TO:$(echo "$target" | tr '[:lower:]' '[:upper:]') | $message" >> "$INBOX_DIR/$team.md"
        done
    else
        echo "[$timestamp] TO:$(echo "$target" | tr '[:lower:]' '[:upper:]') | $message" >> "$INBOX_DIR/$target.md"
    fi

    # Write to inbox via registry (no send-keys — companion panes display via tail -f)
    if [ "$target" = "all" ]; then
        "$SCRIPT_DIR/session-registry.sh" wake-all "$message" 2>/dev/null
        echo "Sent to ALL teams (feed + inbox — visible in companion panes)"
    else
        "$SCRIPT_DIR/session-registry.sh" wake "$target" "$message" 2>/dev/null
        echo "Sent to $target (feed + inbox — visible in companion pane)"
    fi
}

check_inbox() {
    local team="$1"
    if [ -z "$team" ]; then
        echo "Usage: swarm-telegraph.sh check <team>"
        return 1
    fi

    team=$(echo "$team" | tr '[:upper:]' '[:lower:]')
    local inbox="$INBOX_DIR/$team.md"

    if [ -f "$inbox" ] && [ -s "$inbox" ]; then
        echo "=== INBOX: $team ==="
        cat "$inbox"
        echo "=== END ==="
    else
        echo "(no messages for $team)"
    fi
}

clear_inbox() {
    local team="$1"
    if [ -z "$team" ]; then
        echo "Usage: swarm-telegraph.sh clear <team>"
        return 1
    fi

    team=$(echo "$team" | tr '[:upper:]' '[:lower:]')
    rm -f "$INBOX_DIR/$team.md"
    echo "Inbox cleared: $team"
}

case "${1:-}" in
    start)   start_daemon ;;
    stop)    stop_daemon ;;
    status)  status_daemon ;;
    send)    shift; send_message "$@" ;;
    check)   check_inbox "$2" ;;
    clear)   clear_inbox "$2" ;;
    *)
        echo "Swarm Telegraph v2 — Cursor-safe cross-session messaging"
        echo ""
        echo "Usage:"
        echo "  swarm-telegraph.sh start              Start the daemon"
        echo "  swarm-telegraph.sh stop               Stop the daemon"
        echo "  swarm-telegraph.sh status             Check status + inbox counts"
        echo "  swarm-telegraph.sh send <team> \"msg\"  Send message to team"
        echo "  swarm-telegraph.sh check <team>       Read team inbox"
        echo "  swarm-telegraph.sh clear <team>       Clear team inbox"
        echo ""
        echo "All delivery: inbox files + feed. Display: companion panes (tail -f). Zero send-keys."
        echo "Teams: $TEAMS"
        ;;
esac
