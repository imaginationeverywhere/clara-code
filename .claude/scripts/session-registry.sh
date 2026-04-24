#!/bin/bash
# Session Registry — Maps team names to active Claude Code TTYs
# Discovers sessions dynamically by scanning running processes
# Usage: session-registry.sh list|find <team>|wake <team> <message>
#
# No hardcoded TTYs. Discovers fresh every time.

REGISTRY_FILE="$HOME/auset-brain/Swarms/.session-registry"

# Scan running Claude Code processes and build registry
discover() {
    > "$REGISTRY_FILE"  # Clear registry

    # Find Claude Code AND Cursor Agent CLI sessions
    ps aux | grep -E "(claude.*--dangerously-skip-permissions|\.local/bin/agent)" | grep -v grep | while read -r line; do
        PID=$(echo "$line" | awk '{print $2}')
        TTY=$(echo "$line" | awk '{print $7}')

        # Extract session name from -n flag (Claude Code)
        NAME=$(echo "$line" | sed -E 's/.*-n ([^-]+).*/\1/' | sed 's/ *$//')

        # If no -n flag found (Cursor), use TTY as identifier
        if echo "$NAME" | grep -q "dangerously\|agent\|index.js"; then
            NAME="Cursor-${TTY}"
        fi

        if [ -n "$NAME" ] && [ -n "$TTY" ] && [ "$TTY" != "??" ]; then
            echo "${NAME}|${TTY}|${PID}" >> "$REGISTRY_FILE"
        fi
    done

    # Return count
    wc -l < "$REGISTRY_FILE" 2>/dev/null | tr -d ' '
}

# List all active sessions
list_sessions() {
    discover > /dev/null

    if [ ! -s "$REGISTRY_FILE" ]; then
        echo "No active Claude Code sessions found"
        return 1
    fi

    echo "Active Claude Code Sessions:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    while IFS='|' read -r NAME TTY PID; do
        printf "  %-25s TTY: %-6s PID: %s\n" "$NAME" "$TTY" "$PID"
    done < "$REGISTRY_FILE"
}

# Find TTY for a team name (partial match)
find_session() {
    discover > /dev/null
    local SEARCH="$1"

    grep -i "$SEARCH" "$REGISTRY_FILE" 2>/dev/null | head -1 | cut -d'|' -f2
}

# Wake a session by team name
wake_session() {
    local SEARCH="$1"
    local MESSAGE="${2:-Check the live feed for directives from HQ}"
    local FEED="$HOME/auset-brain/Swarms/live-feed.md"

    # Map common aliases to full session names
    case "$(echo "$SEARCH" | tr '[:upper:]' '[:lower:]')" in
        hq)         SEARCH="Headquarters" ;;
        pkgs)       SEARCH="Packages" ;;
        qn)         SEARCH="Quik Nation" ;;
        wcr)        SEARCH="World Cup" ;;
        qcr)        SEARCH="QuikCar" ;;
        fmo)        SEARCH="FMO" ;;
        st)         SEARCH="Seeking" ;;
        s962|962)   SEARCH="962" ;;
        slk|slack)  SEARCH="Slack" ;;
        qcarry)     SEARCH="QuikCarry" ;;
        devops)     SEARCH="DevOps" ;;
        trackit)    SEARCH="TrackIt" ;;
        pgcmc)      SEARCH="PGCMC" ;;
    esac

    discover > /dev/null

    local MATCH=$(grep -i "$SEARCH" "$REGISTRY_FILE" 2>/dev/null | head -1)

    if [ -z "$MATCH" ]; then
        echo "No session found matching: $SEARCH"
        echo "Active sessions:"
        list_sessions
        # Log failed dispatch to feed
        echo "$(date '+%H:%M:%S') | DISPATCH FAILED | TO:${SEARCH} | Session not found | ${MESSAGE}" >> "$FEED" 2>/dev/null
        return 1
    fi

    local NAME=$(echo "$MATCH" | cut -d'|' -f1)
    local TTY=$(echo "$MATCH" | cut -d'|' -f2)

    # Log directive to live feed — HQ sees all dispatches
    echo "$(date '+%H:%M:%S') | DISPATCH | TO:${NAME} | ${MESSAGE}" >> "$FEED" 2>/dev/null

    # Use AppleScript to send message to the terminal tab
    # Strategy: clipboard paste + Enter — works for both Claude Code and Cursor Agent CLI
    # 1. Save current clipboard, 2. Set clipboard to message, 3. Focus tab, 4. Paste, 5. Enter, 6. Restore clipboard
    local OLD_CLIPBOARD=$(pbpaste 2>/dev/null)
    echo -n "${MESSAGE}" | pbcopy

    osascript -e "
    tell application \"Terminal\"
        set targetTab to missing value
        set targetWindow to missing value
        repeat with w in windows
            repeat with t in tabs of w
                if tty of t contains \"${TTY}\" then
                    set targetTab to t
                    set targetWindow to w
                    exit repeat
                end if
            end repeat
            if targetTab is not missing value then exit repeat
        end repeat
        if targetTab is not missing value then
            set selected of targetTab to true
            set frontmost of targetWindow to true
            activate
            delay 0.3
            tell application \"System Events\"
                keystroke \"v\" using command down
                delay 0.2
                keystroke return
            end tell
        end if
    end tell
    " 2>/dev/null

    # Restore clipboard
    echo -n "${OLD_CLIPBOARD}" | pbcopy 2>/dev/null

    if [ $? -eq 0 ]; then
        echo "Woke '${NAME}' (${TTY}): ${MESSAGE}"
    else
        echo "Failed to wake '${NAME}' (${TTY})"
        echo "$(date '+%H:%M:%S') | DISPATCH FAILED | TO:${NAME} | AppleScript error | ${MESSAGE}" >> "$FEED" 2>/dev/null
    fi
}

# Wake ALL sessions
wake_all() {
    local MESSAGE="${1:-Check the live feed for directives from HQ}"

    discover > /dev/null

    while IFS='|' read -r NAME TTY PID; do
        # Skip HQ — don't wake yourself
        if echo "$NAME" | grep -qi "headquarters"; then
            continue
        fi
        wake_session "$NAME" "$MESSAGE"
        sleep 1  # Small delay between wakes
    done < "$REGISTRY_FILE"
}

case "${1:-list}" in
    list)     list_sessions ;;
    find)     find_session "$2" ;;
    wake)     wake_session "$2" "$3" ;;
    wake-all) wake_all "$2" ;;
    discover) COUNT=$(discover); echo "Discovered $COUNT sessions" ;;
    *)        echo "Usage: $0 {list|find <team>|wake <team> <message>|wake-all <message>|discover}" ;;
esac
