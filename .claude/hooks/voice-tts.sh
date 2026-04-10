#!/bin/bash
# voice-tts.sh — Stop hook that speaks Claude's last response via MiniMax TTS
# Fires after every Claude response. Checks toggle file to decide whether to speak.
#
# Toggle: touch /tmp/claude-voice-tts-active   (enable)
#         rm /tmp/claude-voice-tts-active       (disable)

TOGGLE="/tmp/claude-voice-tts-active"
SPEAK_PY="/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate/infrastructure/voice/server/speak.py"
PROJECT_DIR="$HOME/.claude/projects/-Volumes-X10-Pro-Native-Projects-AI-quik-nation-ai-boilerplate"

# Only speak if toggle is on
[ -f "$TOGGLE" ] || exit 0

# Find the most recently modified session JSONL
SESSION=$(ls -t "$PROJECT_DIR"/*.jsonl 2>/dev/null | head -1)
[ -n "$SESSION" ] || exit 0

# Extract last assistant text, strip markdown/code, truncate for TTS
TEXT=$(python3 -c "
import json, re, sys

with open('$SESSION') as f:
    lines = f.readlines()

for line in reversed(lines):
    try:
        msg = json.loads(line.strip())
        if msg.get('type') == 'assistant':
            content = msg.get('message',{}).get('content','')
            texts = []
            if isinstance(content, list):
                texts = [c.get('text','') for c in content if c.get('type') == 'text' and c.get('text','').strip()]
            elif isinstance(content, str) and content.strip():
                texts = [content]
            if texts:
                combined = ' '.join(texts)
                # Strip code blocks
                combined = re.sub(r'\`\`\`[\s\S]*?\`\`\`', '', combined)
                # Strip inline code
                combined = re.sub(r'\`[^\`]+\`', '', combined)
                # Strip markdown formatting
                combined = re.sub(r'[*_#>|]', '', combined)
                # Strip URLs
                combined = re.sub(r'https?://\S+', '', combined)
                # Strip table formatting
                combined = re.sub(r'[-]{3,}', '', combined)
                # Collapse whitespace
                combined = re.sub(r'\s+', ' ', combined).strip()
                # Truncate for TTS (first 600 chars)
                if len(combined) > 600:
                    # Cut at last sentence boundary
                    cut = combined[:600]
                    for end in ['. ', '! ', '? ']:
                        idx = cut.rfind(end)
                        if idx > 200:
                            cut = cut[:idx+1]
                            break
                    combined = cut
                print(combined)
                break
    except:
        pass
" 2>/dev/null)

# Skip if no text or too short
[ ${#TEXT} -lt 10 ] && exit 0

# Speak in background so we don't block the session
python3 "$SPEAK_PY" --agent granville "$TEXT" &

exit 0
