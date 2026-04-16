#!/bin/bash
# Inbox Dispatcher v3 — Event-driven inbox writer + dashboard
# Named after Granville T. Woods' automatic air brake system
#
# Writes to team inbox files. Companion panes (tail -f) display messages
# in real-time. ZERO send-keys. Agents read their inbox on next turn.
#
# Usage:
#   inbox-dispatcher.sh start     Start the event-driven dispatcher
#   inbox-dispatcher.sh stop      Stop the dispatcher
#   inbox-dispatcher.sh status    Show status + pending deliveries
#   inbox-dispatcher.sh drain     One-shot: process all pending messages

INBOX_DIR="/tmp/swarm-inboxes"
PID_FILE="/tmp/inbox-dispatcher.pid"
LOG_FILE="/tmp/inbox-dispatcher.log"
BACKOFF_DIR="/tmp/inbox-dispatcher-backoff"
SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"
FEED="$HOME/auset-brain/Swarms/live-feed.md"

mkdir -p "$INBOX_DIR" "$BACKOFF_DIR"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') | $*" >> "$LOG_FILE"
}

is_claude_session_alive() {
    local team="$1"
    local tty
    tty=$("$SCRIPTS_DIR/session-registry.sh" find "$team" 2>/dev/null)
    [ -n "$tty" ]
}

get_backoff_seconds() {
    local team="$1"
    local backoff_file="$BACKOFF_DIR/$team"
    local current=10
    if [ -f "$backoff_file" ]; then
        current=$(cat "$backoff_file" 2>/dev/null || echo "10")
    fi
    echo "$current"
}

increase_backoff() {
    local team="$1"
    local backoff_file="$BACKOFF_DIR/$team"
    local current
    current=$(get_backoff_seconds "$team")
    local next=$((current * 2))
    [ "$next" -gt 300 ] && next=300
    echo "$next" > "$backoff_file"
    log "BACKOFF | $team | ${current}s -> ${next}s"
}

reset_backoff() {
    local team="$1"
    rm -f "$BACKOFF_DIR/$team"
}

deliver_to_team() {
    local team="$1"
    local inbox="$INBOX_DIR/$team.md"

    if [ ! -f "$inbox" ] || [ ! -s "$inbox" ]; then
        return 0
    fi

    if ! is_claude_session_alive "$team"; then
        log "SKIP | $team | session not found (inbox has $(wc -l < "$inbox" | tr -d ' ') msgs)"
        return 1
    fi

    local msg_count
    msg_count=$(wc -l < "$inbox" | tr -d ' ')
    log "DELIVER | $team | $msg_count message(s)"

    log "READY | $team | $msg_count message(s) in inbox — visible via companion pane (tail -f)"
    reset_backoff "$team"
    return 0
}

retry_failed() {
    for backoff_file in "$BACKOFF_DIR"/*; do
        [ -f "$backoff_file" ] || continue
        local team
        team=$(basename "$backoff_file")
        local inbox="$INBOX_DIR/$team.md"

        if [ ! -f "$inbox" ] || [ ! -s "$inbox" ]; then
            reset_backoff "$team"
            continue
        fi

        local wait_seconds
        wait_seconds=$(get_backoff_seconds "$team")
        local last_modified
        last_modified=$(stat -f %m "$backoff_file" 2>/dev/null || echo "0")
        local now
        now=$(date +%s)
        local elapsed=$((now - last_modified))

        if [ "$elapsed" -ge "$wait_seconds" ]; then
            deliver_to_team "$team"
        fi
    done
}

start_dispatcher() {
    if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
        echo "Inbox Dispatcher already running (PID $(cat "$PID_FILE"))"
        return 0
    fi

    echo "Starting Inbox Dispatcher v3 (inbox-only, no send-keys)..."
    echo "Watching: $INBOX_DIR/"
    log "STARTED"

    (
        for inbox in "$INBOX_DIR"/*.md; do
            [ -f "$inbox" ] && [ -s "$inbox" ] || continue
            local team
            team=$(basename "$inbox" .md)
            deliver_to_team "$team"
        done

        fswatch -o --event Created --event Updated "$INBOX_DIR" 2>/dev/null | while read -r _; do
            sleep 1

            for inbox in "$INBOX_DIR"/*.md; do
                [ -f "$inbox" ] && [ -s "$inbox" ] || continue
                local team
                team=$(basename "$inbox" .md)

                if [ -f "$BACKOFF_DIR/$team" ]; then
                    continue
                fi

                deliver_to_team "$team"
            done
        done &

        local FSWATCH_PID=$!

        while true; do
            sleep 30
            retry_failed

            local has_messages=false
            for inbox in "$INBOX_DIR"/*.md; do
                if [ -f "$inbox" ] && [ -s "$inbox" ]; then
                    has_messages=true
                    break
                fi
            done

            if ! $has_messages; then
                local session_count
                session_count=$("$SCRIPTS_DIR/session-registry.sh" discover 2>/dev/null | grep -oE '[0-9]+' || echo "0")
                if [ "$session_count" = "0" ]; then
                    log "AUTO-STOP | No sessions alive, no pending messages."
                    kill "$FSWATCH_PID" 2>/dev/null
                    rm -f "$PID_FILE"
                    exit 0
                fi
            fi
        done &

        wait "$FSWATCH_PID"
    ) &

    echo $! > "$PID_FILE"
    echo "Inbox Dispatcher v3 started (PID $(cat "$PID_FILE"))"
    echo "Display: companion panes (tail -f) show messages in real-time"
}

stop_dispatcher() {
    if [ -f "$PID_FILE" ]; then
        local pid
        pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null
            pkill -P "$pid" 2>/dev/null
            echo "Inbox Dispatcher stopped (PID $pid)"
            log "STOPPED"
        else
            echo "Inbox Dispatcher was not running (stale PID)"
        fi
        rm -f "$PID_FILE"
    else
        echo "Inbox Dispatcher is not running"
    fi
    rm -rf "$BACKOFF_DIR"
}

status_dispatcher() {
    echo "━━━ Inbox Dispatcher v3 (inbox-only, tail -f display) ━━━"
    echo ""

    if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
        echo "State: RUNNING (PID $(cat "$PID_FILE"))"
    else
        echo "State: STOPPED"
    fi

    echo ""
    echo "Pending Deliveries:"
    local pending=0
    for inbox in "$INBOX_DIR"/*.md; do
        [ -f "$inbox" ] && [ -s "$inbox" ] || continue
        local team
        team=$(basename "$inbox" .md)
        local count
        count=$(wc -l < "$inbox" | tr -d ' ')
        local alive="dead"
        is_claude_session_alive "$team" && alive="alive"

        local backoff_info=""
        if [ -f "$BACKOFF_DIR/$team" ]; then
            backoff_info=" (backoff: $(cat "$BACKOFF_DIR/$team")s)"
        fi

        printf "  %-12s %3d msg(s)  session: %-5s%s\n" "$team" "$count" "$alive" "$backoff_info"
        pending=$((pending + 1))
    done

    if [ "$pending" -eq 0 ]; then
        echo "  (none)"
    fi

    echo ""
    if [ -f "$LOG_FILE" ]; then
        echo "Last 5 log entries:"
        tail -5 "$LOG_FILE" | while IFS= read -r line; do
            echo "  $line"
        done
    fi
}

drain_now() {
    echo "Processing all pending inbox messages..."
    local delivered=0
    for inbox in "$INBOX_DIR"/*.md; do
        [ -f "$inbox" ] && [ -s "$inbox" ] || continue
        local team
        team=$(basename "$inbox" .md)
        if deliver_to_team "$team"; then
            delivered=$((delivered + 1))
        fi
    done
    echo "Delivered to $delivered team(s)"
}

case "${1:-status}" in
    start)   start_dispatcher ;;
    stop)    stop_dispatcher ;;
    status)  status_dispatcher ;;
    drain)   drain_now ;;
    *)
        echo "Inbox Dispatcher v3 — Event-driven inbox management (zero send-keys)"
        echo ""
        echo "Usage:"
        echo "  inbox-dispatcher.sh start    Start the event-driven watcher"
        echo "  inbox-dispatcher.sh stop     Stop the watcher"
        echo "  inbox-dispatcher.sh status   Show status + pending messages"
        echo "  inbox-dispatcher.sh drain    One-shot: process all pending"
        echo ""
        echo "Display: companion panes with tail -f show messages in real-time."
        echo "Agents: read inbox on next turn. No prompt injection."
        ;;
esac
