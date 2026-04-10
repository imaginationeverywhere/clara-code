Voice mode — Mary. Execute in EXACT order, no extra text:

1. Print: "🎤 Mary listening... (60s)"

2. Set duration and countdown:
   ```bash
   echo "60" > /tmp/clara-voice-record-seconds; DUR=60; for i in $(seq $DUR -1 1); do result=$(curl -s 'http://127.0.0.1:8789/peek'); count=$(echo "$result" | python3 -c "import json,sys; print(json.load(sys.stdin).get('count',0))" 2>/dev/null); if [ "$count" -gt "0" ]; then echo ""; echo "✅ Voice received!"; break; fi; if [ $((i % 5)) -eq 0 ] || [ "$i" -le 3 ]; then python3 -c "f=max(1,int($i*20/$DUR));e=20-f;print(f'🎙️  {chr(9608)*f}{chr(9617)*e}  {$i}s')"; fi; sleep 1; done
   ```

3. Music: `bash -c 'while true; do afplay "/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate/infrastructure/voice/tones/default-thinking.wav"; done' &`
4. Call `listen` (peek).
5. Stop music: `pkill -9 -f "afplay.*default-thinking" 2>/dev/null; pkill -9 -f "while true.*afplay" 2>/dev/null; killall afplay 2>/dev/null; true`
6. Call `reply` with agent="mary". Respond as Mary — business, product, revenue, clients. 1-3 sentences. Then `listen` consume:true.

No extra text. Phone call energy.
