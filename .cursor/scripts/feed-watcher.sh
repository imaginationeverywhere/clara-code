#!/bin/bash
# Feed Watcher v3 — Event-Driven Multiplex Telegraph (inbox-only, zero send-keys)
# Watches ~/auset-brain/Swarms/live-feed.md for meaningful events.
# When a TO:<TEAM> message appears, writes to that team's inbox file.
# Companion panes (tail -f) display messages in real-time via kqueue.
# NEVER uses tmux send-keys. Agents read inbox on next turn.
#
# Usage: .claude/scripts/feed-watcher.sh start|stop|status|check
# Cost: $0.00 — pure shell, no API calls

FEED="$HOME/auset-brain/Swarms/live-feed.md"
TRIGGER="$HOME/auset-brain/Swarms/.feed-trigger"
PID_FILE="$HOME/auset-brain/Swarms/.feed-watcher.pid"
LOG_FILE="$HOME/auset-brain/Swarms/.feed-watcher.log"

EVENTS="AGENDA COMPLETE|REPORTING IN|PROGRESS|TO:|DIRECTIVE|SESSION END|SESSION START"

start_watcher() {
    if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
        echo "Feed watcher already running (PID $(cat "$PID_FILE"))"
        return 0
    fi

    rm -f "$TRIGGER"

    (
        SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"

        tail -f "$FEED" 2>/dev/null | while IFS= read -r line; do
            # Noise filter
            if echo "$line" | grep -qE "SESSION PAUSED|NOTIFICATION"; then
                continue
            fi

            # Skip DISPATCH echoes — these are written by session-registry.sh wake
            # and contain TO: which would re-fire → infinite loop
            if echo "$line" | grep -qE '\| DISPATCH( FAILED)? \|'; then
                continue
            fi

            if echo "$line" | grep -qE "$EVENTS"; then
                TIMESTAMP=$(date '+%H:%M:%S')
                TYPE=$(echo "$line" | grep -oE "$EVENTS" | head -1)

                echo "${TIMESTAMP} | ${line}" >> "$TRIGGER"
                echo "${TIMESTAMP} | TRIGGER SET: ${TYPE}" >> "$LOG_FILE"

                # AUTO-DISPATCH: TO:<TEAM> messages → write to inbox (no send-keys)
                # session-registry.sh wake writes to inbox + feed only
                if echo "$line" | grep -qE "TO:"; then
                    TARGET=$(echo "$line" | grep -oE "TO:[A-Za-z0-9_-]+" | head -1 | sed 's/TO://')

                    if [ -n "$TARGET" ]; then
                        MY_TEAM="${SWARM_TEAM:-Headquarters}"
                        if echo "$MY_TEAM" | grep -qi "$TARGET"; then
                            continue
                        fi

                        SENDER=$(echo "$line" | cut -d'|' -f2 | tr -d ' ')

                        case "$TARGET" in
                            HQ|hq) TARGET="Headquarters" ;;
                        esac

                        if [ "$TARGET" = "ALL" ]; then
                            "$SCRIPTS_DIR/session-registry.sh" wake-all "Message from ${SENDER} on the feed. Read the last 5 lines of ~/auset-brain/Swarms/live-feed.md and act on any TO:ALL messages." &
                        else
                            "$SCRIPTS_DIR/session-registry.sh" wake "$TARGET" "Message from ${SENDER} on the feed. Read the last 5 lines of ~/auset-brain/Swarms/live-feed.md and act on any TO:${TARGET} messages." &
                        fi

                        echo "${TIMESTAMP} | AUTO-DISPATCH: Woke ${TARGET} for message from ${SENDER}" >> "$LOG_FILE"
                    fi
                fi
            fi
        done
    ) &

    echo $! > "$PID_FILE"
    echo "Feed watcher v3 started (PID $(cat "$PID_FILE"))"
    echo "Watching: $FEED"
    echo "Trigger: $TRIGGER"
    echo "Delivery: inbox files only (zero send-keys). Display: companion panes (tail -f)."
}

check_trigger() {
    if [ -f "$TRIGGER" ] && [ -s "$TRIGGER" ]; then
        cat "$TRIGGER"
        rm -f "$TRIGGER"
        return 0
    fi
    return 1
}

stop_watcher() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            kill "$PID" 2>/dev/null
            pkill -P "$PID" 2>/dev/null
            echo "Feed watcher stopped (PID $PID)"
        else
            echo "Feed watcher was not running"
        fi
        rm -f "$PID_FILE"
    else
        echo "No PID file found"
    fi
    rm -f "$TRIGGER"
}

status_watcher() {
    if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
        echo "Feed watcher v3: RUNNING (PID $(cat "$PID_FILE"))  [inbox-only, no send-keys]"
        if [ -f "$TRIGGER" ] && [ -s "$TRIGGER" ]; then
            COUNT=$(wc -l < "$TRIGGER" 2>/dev/null | tr -d ' ')
            echo "Pending triggers: $COUNT"
            echo "--- Queued Events ---"
            cat "$TRIGGER"
        else
            echo "No pending triggers"
        fi
    else
        echo "Feed watcher v3: STOPPED"
    fi
}

case "${1:-status}" in
    start)   start_watcher ;;
    stop)    stop_watcher ;;
    status)  status_watcher ;;
    check)   check_trigger ;;
    *)       echo "Usage: $0 {start|stop|status|check}" ;;
esac
