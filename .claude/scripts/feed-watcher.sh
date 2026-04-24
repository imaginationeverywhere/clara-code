#!/bin/bash
# Feed Watcher v2 — Event-Driven Multiplex Telegraph
# Watches ~/auset-brain/Swarms/live-feed.md for meaningful events
# When found: writes trigger file that Stop hook consumes → surfaces in conversation
#
# Usage: .claude/scripts/feed-watcher.sh start|stop|status
# Cost: $0.00 — pure shell, no API calls, no tokens
#
# v2 Changes:
# - Writes trigger file (.feed-trigger) on meaningful events
# - Stop hook checks trigger → surfaces update in conversation
# - Catches: AGENDA COMPLETE, REPORTING IN, PROGRESS, TO:*, SESSION END, DIRECTIVE
# - No more writing to hq-notifications.md that nobody reads

FEED="$HOME/auset-brain/Swarms/live-feed.md"
TRIGGER="$HOME/auset-brain/Swarms/.feed-trigger"
PID_FILE="$HOME/auset-brain/Swarms/.feed-watcher.pid"
LOG_FILE="$HOME/auset-brain/Swarms/.feed-watcher.log"

# Events worth surfacing
EVENTS="AGENDA COMPLETE|REPORTING IN|PROGRESS|TO:|DIRECTIVE|SESSION END|SESSION START"

start_watcher() {
    if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
        echo "Feed watcher already running (PID $(cat "$PID_FILE"))"
        return 0
    fi

    # Clear any stale trigger
    rm -f "$TRIGGER"

    (
        SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"

        tail -f "$FEED" 2>/dev/null | while IFS= read -r line; do
            # Skip SESSION PAUSED and NOTIFICATION — these are noise
            if echo "$line" | grep -qE "SESSION PAUSED|NOTIFICATION"; then
                continue
            fi

            # Skip DISPATCH FAILED — prevents infinite loop
            if echo "$line" | grep -qE "DISPATCH FAILED"; then
                continue
            fi

            # Check for meaningful events
            if echo "$line" | grep -qE "$EVENTS"; then
                TIMESTAMP=$(date '+%H:%M:%S')
                TYPE=$(echo "$line" | grep -oE "$EVENTS" | head -1)

                # Write trigger file — append the event so multiple can queue
                echo "${TIMESTAMP} | ${line}" >> "$TRIGGER"

                # Log it
                echo "${TIMESTAMP} | TRIGGER SET: ${TYPE}" >> "$LOG_FILE"

                # AUTO-DISPATCH: If this is a TO: message, wake the target session
                if echo "$line" | grep -qE "TO:"; then
                    # Extract target team name (TO:WCR, TO:PKGS, TO:ALL, TO:HQ)
                    TARGET=$(echo "$line" | grep -oE "TO:[A-Za-z0-9_-]+" | head -1 | sed 's/TO://')

                    if [ -n "$TARGET" ]; then
                        # Don't wake yourself (check SWARM_TEAM)
                        MY_TEAM="${SWARM_TEAM:-Headquarters}"
                        if echo "$MY_TEAM" | grep -qi "$TARGET"; then
                            continue
                        fi

                        # Extract sender for the wake message
                        SENDER=$(echo "$line" | cut -d'|' -f2 | tr -d ' ')

                        # Map short aliases to full session names
                        case "$TARGET" in
                            HQ|hq) TARGET="Headquarters" ;;
                        esac

                        if [ "$TARGET" = "ALL" ]; then
                            # Wake all sessions
                            "$SCRIPTS_DIR/session-registry.sh" wake-all "Message from ${SENDER} on the feed. Read the last 5 lines of ~/auset-brain/Swarms/live-feed.md and act on any TO:ALL messages." &
                        else
                            # Wake specific team
                            "$SCRIPTS_DIR/session-registry.sh" wake "$TARGET" "Message from ${SENDER} on the feed. Read the last 5 lines of ~/auset-brain/Swarms/live-feed.md and act on any TO:${TARGET} messages." &
                        fi

                        echo "${TIMESTAMP} | AUTO-DISPATCH: Woke ${TARGET} for message from ${SENDER}" >> "$LOG_FILE"
                    fi
                fi
            fi
        done
    ) &

    echo $! > "$PID_FILE"
    echo "Feed watcher v2 started (PID $(cat "$PID_FILE"))"
    echo "Watching: $FEED"
    echo "Trigger: $TRIGGER"
}

# Check if there are pending triggers (called by Stop hook)
check_trigger() {
    if [ -f "$TRIGGER" ] && [ -s "$TRIGGER" ]; then
        # Read and output the trigger contents
        cat "$TRIGGER"
        # Clear the trigger after reading
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
        echo "Feed watcher v2: RUNNING (PID $(cat "$PID_FILE"))"
        if [ -f "$TRIGGER" ] && [ -s "$TRIGGER" ]; then
            COUNT=$(wc -l < "$TRIGGER" 2>/dev/null | tr -d ' ')
            echo "Pending triggers: $COUNT"
            echo "--- Queued Events ---"
            cat "$TRIGGER"
        else
            echo "No pending triggers"
        fi
    else
        echo "Feed watcher v2: STOPPED"
    fi
}

case "${1:-status}" in
    start)   start_watcher ;;
    stop)    stop_watcher ;;
    status)  status_watcher ;;
    check)   check_trigger ;;
    *)       echo "Usage: $0 {start|stop|status|check}" ;;
esac
