#!/bin/bash
# run-prompts.sh — Run all not-started prompts sequentially in this Heru
# Usage: run-prompts [date-folder]
# Example: run-prompts           (uses today's date)
#          run-prompts 2026/April/02
#
# Finds all .md files in prompts/<date>/1-not-started/
# Runs each one with agent -p --yolo
# Moves to 2-in-progress/ while running, then 3-completed/ when done
# Posts progress to the live feed

DATE_FOLDER="${1:-$(date '+%Y/%B/%d')}"
PROMPT_DIR="prompts/$DATE_FOLDER/1-not-started"
IN_PROGRESS="prompts/$DATE_FOLDER/2-in-progress"
COMPLETED="prompts/$DATE_FOLDER/3-completed"
PROJECT_NAME=$(basename "$(pwd)")
FEED="$HOME/auset-brain/Swarms/live-feed.md"

# --- Resource Check ---
# CPU: warn if load average > number of cores (machine is overloaded)
# Memory: abort if free memory < 2GB (agent needs room to work)
# Disk: abort if < 5GB free
CORES=$(sysctl -n hw.ncpu 2>/dev/null || echo 4)
LOAD=$(sysctl -n vm.loadavg 2>/dev/null | awk '{print $2}' | cut -d. -f1)
FREE_MEM_MB=$(vm_stat 2>/dev/null | awk '/Pages free/ {free=$3} /Pages inactive/ {inactive=$3} END {printf "%.0f", (free+inactive)*4096/1048576}')
FREE_DISK_GB=$(df -g "$(pwd)" 2>/dev/null | tail -1 | awk '{print $4}')

echo "Resource check:"
echo "  CPU cores: $CORES | Load: $LOAD"
echo "  Free memory: ${FREE_MEM_MB}MB"
echo "  Free disk: ${FREE_DISK_GB}GB"

if [ "${FREE_MEM_MB:-0}" -lt 2000 ] 2>/dev/null; then
    echo "ERROR: Less than 2GB free memory (${FREE_MEM_MB}MB). Machine will overheat. Exiting."
    echo "$(date '+%H:%M:%S') | $PROJECT_NAME | ERROR | run-prompts aborted — insufficient memory (${FREE_MEM_MB}MB)" >> "$FEED"
    exit 1
fi

if [ "${FREE_DISK_GB:-0}" -lt 5 ] 2>/dev/null; then
    echo "ERROR: Less than 5GB free disk (${FREE_DISK_GB}GB). Exiting."
    echo "$(date '+%H:%M:%S') | $PROJECT_NAME | ERROR | run-prompts aborted — low disk (${FREE_DISK_GB}GB)" >> "$FEED"
    exit 1
fi

if [ "${LOAD:-0}" -gt "$((CORES * 2))" ] 2>/dev/null; then
    echo "WARNING: CPU load ($LOAD) is over 2x cores ($CORES). Machine is stressed."
    echo "Continue anyway? Waiting 10 seconds... (Ctrl+C to abort)"
    sleep 10
fi

echo "  Resources OK ✓"
echo ""

# Check prompts exist
if [ ! -d "$PROMPT_DIR" ] || [ -z "$(ls "$PROMPT_DIR"/*.md 2>/dev/null)" ]; then
    echo "No prompts found in $PROMPT_DIR"
    exit 1
fi

# Create directories
mkdir -p "$IN_PROGRESS" "$COMPLETED"

# Count prompts
TOTAL=$(ls "$PROMPT_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')
CURRENT=0
PASSED=0
FAILED=0

echo "╔══════════════════════════════════════════╗"
echo "║  RUN PROMPTS — $PROJECT_NAME"
echo "║  $TOTAL prompts in queue"
echo "╚══════════════════════════════════════════╝"
echo ""

# Post to feed
echo "$(date '+%H:%M:%S') | $PROJECT_NAME | PROGRESS | Starting $TOTAL prompts sequentially" >> "$FEED"

for PROMPT in "$PROMPT_DIR"/*.md; do
    FILENAME=$(basename "$PROMPT")
    CURRENT=$((CURRENT + 1))

    echo "━━━ [$CURRENT/$TOTAL] $FILENAME ━━━"

    # Mid-queue resource check (skip on first prompt — we already checked)
    if [ $CURRENT -gt 1 ]; then
        MID_MEM=$(vm_stat 2>/dev/null | awk '/Pages free/ {free=$3} /Pages inactive/ {inactive=$3} END {printf "%.0f", (free+inactive)*4096/1048576}')
        if [ "${MID_MEM:-0}" -lt 1500 ] 2>/dev/null; then
            echo "PAUSED: Memory low (${MID_MEM}MB). Waiting 60s for system to recover..."
            echo "$(date '+%H:%M:%S') | $PROJECT_NAME | WARNING | Paused between prompts — memory low (${MID_MEM}MB)" >> "$FEED"
            sleep 60
            # Recheck
            MID_MEM2=$(vm_stat 2>/dev/null | awk '/Pages free/ {free=$3} /Pages inactive/ {inactive=$3} END {printf "%.0f", (free+inactive)*4096/1048576}')
            if [ "${MID_MEM2:-0}" -lt 1500 ] 2>/dev/null; then
                echo "ABORT: Memory still low after 60s (${MID_MEM2}MB). Stopping to protect machine."
                echo "$(date '+%H:%M:%S') | $PROJECT_NAME | ERROR | run-prompts stopped — memory critical (${MID_MEM2}MB). $PASSED/$TOTAL done." >> "$FEED"
                break
            fi
        fi
    fi

    # Move to in-progress
    mv "$PROMPT" "$IN_PROGRESS/$FILENAME"

    # Run the agent
    agent -p --yolo --workspace "$(pwd)" "$(cat "$IN_PROGRESS/$FILENAME")"
    EXIT_CODE=$?

    if [ $EXIT_CODE -eq 0 ]; then
        # Move to completed
        mv "$IN_PROGRESS/$FILENAME" "$COMPLETED/$FILENAME"
        PASSED=$((PASSED + 1))
        echo "✓ $FILENAME — DONE"
        echo "$(date '+%H:%M:%S') | $PROJECT_NAME | PROGRESS | [$CURRENT/$TOTAL] $FILENAME — DONE" >> "$FEED"
    else
        # Leave in in-progress for retry
        FAILED=$((FAILED + 1))
        echo "✗ $FILENAME — FAILED (exit $EXIT_CODE)"
        echo "$(date '+%H:%M:%S') | $PROJECT_NAME | PROGRESS | [$CURRENT/$TOTAL] $FILENAME — FAILED" >> "$FEED"
    fi

    echo ""
done

echo "╔══════════════════════════════════════════╗"
echo "║  COMPLETE: $PASSED passed, $FAILED failed"
echo "╚══════════════════════════════════════════╝"

echo "$(date '+%H:%M:%S') | $PROJECT_NAME | AGENDA COMPLETE | All $TOTAL prompts done. $PASSED passed, $FAILED failed." >> "$FEED"
