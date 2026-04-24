#!/bin/bash
# Wake Session — Send a prompt to an idle Claude Code session via AppleScript
# Usage: wake-session.sh <tty> <message>
# Example: wake-session.sh s002 "Check the live feed for directives"
#
# This is the Multiplex Telegraph — sessions communicating across terminals.

TTY_TARGET="${1:-}"
MESSAGE="${2:-Check the live feed for team updates}"

if [ -z "$TTY_TARGET" ]; then
    echo "Usage: $0 <tty> <message>"
    echo "Example: $0 s002 'Check the live feed for directives'"
    exit 1
fi

osascript -e "
tell application \"Terminal\"
    set targetTab to missing value
    repeat with w in windows
        repeat with t in tabs of w
            if tty of t contains \"${TTY_TARGET}\" then
                set targetTab to t
                exit repeat
            end if
        end repeat
    end repeat
    if targetTab is not missing value then
        do script \"${MESSAGE}\" in targetTab
    end if
end tell
" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "Sent to ${TTY_TARGET}: ${MESSAGE}"
else
    echo "Failed to send to ${TTY_TARGET}"
fi
