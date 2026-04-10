Voice mode — Granville (tech/architecture). If argument is "2", use agent="mary" and respond as Mary (business/product). Execute in EXACT order, no extra text:

1. Print: "🎤 Granville listening..." (or "🎤 Mary listening..." if arg is 2)

2. Show a COUNTDOWN CLOCK in Claude Code while waiting. Run this bash script which polls every second and prints the timer:
   ```bash
   for i in $(seq 15 -1 1); do result=$(curl -s 'http://127.0.0.1:8789/peek'); count=$(echo "$result" | python3 -c "import json,sys; print(json.load(sys.stdin).get('count',0))" 2>/dev/null); if [ "$count" -gt "0" ]; then echo ""; echo "✅ Voice received!"; break; fi; printf "\r🎙️  Recording... %2ds " "$i"; sleep 1; done
   ```

3. Start thinking tone: `bash -c 'while true; do afplay "/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate/infrastructure/voice/tones/default-thinking.wav"; done' &`

4. Call `listen` (peek).

5. Stop music: `pkill -9 -f "afplay.*default-thinking" 2>/dev/null; pkill -9 -f "while true.*afplay" 2>/dev/null; killall afplay 2>/dev/null; true`

6. Call `reply` with the correct agent. 1-3 sentences, conversational. Then `listen` consume:true.

No extra text. Phone call energy. If countdown finishes with no voice: "Didn't hear anything. Try /speak again."
