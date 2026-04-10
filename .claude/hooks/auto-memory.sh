#!/bin/bash
# Auto-Memory Hook — Scans assistant responses for corrections and saves to memory
# Runs on Stop (after every assistant response)
# Cost: ~0 (pure shell, no API calls)

MEMORY_DIR="$HOME/.claude/projects/-Volumes-X10-Pro-Native-Projects-AI-quik-nation-ai-boilerplate/memory"
LOG="/tmp/auto-memory-hook.log"

# Read the last assistant message from stdin (piped by hook system)
INPUT=$(cat)

# Extract the assistant's last response text if available
RESPONSE=$(echo "$INPUT" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    # Look for correction indicators in the conversation
    messages = data.get('messages', [])
    if not messages:
        sys.exit(0)

    # Get the last few user messages to detect corrections
    user_msgs = [m.get('content','') for m in messages if m.get('role') == 'user'][-3:]
    combined = ' '.join(str(m) for m in user_msgs).lower()

    # Correction patterns
    corrections = [
        'don\\'t', 'stop', 'no not', 'wrong', 'that\\'s not', 'i said',
        'i told you', 'how many times', 'already told', 'never do',
        'always do', 'from now on', 'new standard', 'new rule',
        'remember this', 'save this', 'don\\'t forget'
    ]

    # Check if any correction pattern exists
    found = any(c in combined for c in corrections)
    if found:
        print('CORRECTION_DETECTED')
        # Print the last user message for context
        if user_msgs:
            print(str(user_msgs[-1])[:500])
    else:
        print('NO_CORRECTION')
except:
    print('NO_CORRECTION')
" 2>/dev/null)

# If a correction was detected, flag it
if echo "$RESPONSE" | head -1 | grep -q "CORRECTION_DETECTED"; then
    CORRECTION=$(echo "$RESPONSE" | tail -n +2)
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

    # Log the detection (the actual saving is done by Claude in-conversation)
    echo "[$TIMESTAMP] Correction detected: ${CORRECTION:0:200}" >> "$LOG"

    # Signal back to Claude Code that a correction was detected
    # This uses hookSpecificOutput to inject context into the next turn
    printf '{"hookSpecificOutput":{"hookEventName":"Stop","additionalContext":"AUTO-MEMORY: A correction or new rule was detected in the recent conversation. Check if it needs to be saved to memory. If Mo corrected behavior, save it to a feedback memory file IMMEDIATELY — do not wait until session end."}}'
fi
