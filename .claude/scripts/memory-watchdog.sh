#!/bin/bash
# Memory Watchdog for Quik Nation Development
# Monitors memory pressure and Cursor agent count
# Sends macOS notifications when thresholds are exceeded
#
# Usage:
#   Start:  ./memory-watchdog.sh start
#   Stop:   ./memory-watchdog.sh stop
#   Status: ./memory-watchdog.sh status
#   Once:   ./memory-watchdog.sh check

PIDFILE="/tmp/memory-watchdog.pid"
LOGFILE="/tmp/memory-watchdog.log"
CHECK_INTERVAL=30  # seconds
MEMORY_THRESHOLD=40  # alert when free % drops below this
MAX_AGENTS=4  # alert when cursor agents exceed this
COOLDOWN=300  # don't repeat same alert for 5 minutes

# Track last alert times to avoid spam
LAST_MEMORY_ALERT=0
LAST_AGENT_ALERT=0

notify() {
    local title="$1"
    local message="$2"
    local sound="${3:-Basso}"
    osascript -e "display notification \"$message\" with title \"$title\" sound name \"$sound\"" 2>/dev/null
    echo "$(date '+%H:%M:%S') ALERT: $title - $message" >> "$LOGFILE"
}

get_memory_free_pct() {
    memory_pressure 2>/dev/null | grep "free percentage" | grep -o '[0-9]*'
}

get_cursor_agent_count() {
    pgrep -f "cursor.*agent" 2>/dev/null | wc -l | tr -d ' '
}

get_memory_used_gb() {
    local page_size=4096
    local active=$(vm_stat 2>/dev/null | awk '/Pages active/ {print $NF}' | tr -d '.')
    local wired=$(vm_stat 2>/dev/null | awk '/Pages wired/ {print $NF}' | tr -d '.')
    local compressed=$(vm_stat 2>/dev/null | awk '/occupied by compressor/ {print $NF}' | tr -d '.')
    local total=$(( (active + wired + compressed) * page_size / 1073741824 ))
    echo "$total"
}

check_once() {
    local now=$(date +%s)
    local free_pct=$(get_memory_free_pct)
    local agent_count=$(get_cursor_agent_count)
    local used_gb=$(get_memory_used_gb)

    echo "Memory: ${free_pct}% free (~${used_gb}GB used) | Cursor Agents: ${agent_count}"

    # Memory pressure check
    if [ -n "$free_pct" ] && [ "$free_pct" -lt "$MEMORY_THRESHOLD" ]; then
        if [ $(( now - LAST_MEMORY_ALERT )) -gt "$COOLDOWN" ]; then
            if [ "$free_pct" -lt 20 ]; then
                notify "CRITICAL: Memory ${free_pct}% Free" "System will crash soon! Close apps NOW. ${used_gb}GB used." "Sosumi"
            elif [ "$free_pct" -lt 30 ]; then
                notify "WARNING: Memory ${free_pct}% Free" "Danger zone. Stop dispatching agents. ${used_gb}GB used." "Basso"
            else
                notify "CAUTION: Memory ${free_pct}% Free" "Below ${MEMORY_THRESHOLD}% threshold. ${used_gb}GB used." "Tink"
            fi
            LAST_MEMORY_ALERT=$now
        fi
    fi

    # Agent count check
    if [ "$agent_count" -gt "$MAX_AGENTS" ]; then
        if [ $(( now - LAST_AGENT_ALERT )) -gt "$COOLDOWN" ]; then
            notify "Too Many Cursor Agents: ${agent_count}" "Max recommended: ${MAX_AGENTS}. Kill some with: pkill -f 'cursor.*agent'" "Basso"
            LAST_AGENT_ALERT=$now
        fi
    fi
}

run_daemon() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') Watchdog started (PID $$)" > "$LOGFILE"
    echo "  Check interval: ${CHECK_INTERVAL}s"
    echo "  Memory threshold: ${MEMORY_THRESHOLD}% free"
    echo "  Max agents: ${MAX_AGENTS}"
    echo "  Cooldown: ${COOLDOWN}s"

    while true; do
        check_once >> "$LOGFILE" 2>&1
        sleep "$CHECK_INTERVAL"
    done
}

case "${1:-check}" in
    start)
        if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
            echo "Watchdog already running (PID $(cat "$PIDFILE"))"
            exit 0
        fi
        echo "Starting memory watchdog..."
        run_daemon &
        echo $! > "$PIDFILE"
        echo "Watchdog started (PID $!)"
        echo "  Checking every ${CHECK_INTERVAL}s"
        echo "  Alert when memory < ${MEMORY_THRESHOLD}% free"
        echo "  Alert when agents > ${MAX_AGENTS}"
        echo "  Log: $LOGFILE"
        echo ""
        echo "Stop with: $0 stop"
        ;;
    stop)
        if [ -f "$PIDFILE" ]; then
            PID=$(cat "$PIDFILE")
            if kill -0 "$PID" 2>/dev/null; then
                kill "$PID"
                rm "$PIDFILE"
                echo "Watchdog stopped (PID $PID)"
            else
                rm "$PIDFILE"
                echo "Watchdog was not running (stale PID)"
            fi
        else
            echo "Watchdog is not running"
        fi
        ;;
    status)
        if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
            echo "Watchdog: RUNNING (PID $(cat "$PIDFILE"))"
        else
            echo "Watchdog: STOPPED"
        fi
        echo ""
        check_once
        echo ""
        echo "Last 5 alerts:"
        grep "ALERT" "$LOGFILE" 2>/dev/null | tail -5 || echo "  (none)"
        ;;
    check)
        check_once
        ;;
    *)
        echo "Usage: $0 {start|stop|status|check}"
        exit 1
        ;;
esac
