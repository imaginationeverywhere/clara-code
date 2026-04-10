# /stop-music — Clara Radio: Stop Playing

Stop all Clara Radio music immediately.

## Execute immediately, no extra text:

```bash
pkill -9 -f "afplay.*default-thinking" 2>/dev/null
pkill -9 -f "afplay.*tones" 2>/dev/null
pkill -9 -f "while true.*afplay" 2>/dev/null
killall afplay 2>/dev/null
true
```

Print: "🔇 Clara Radio — Stopped"

### Alternative: Pause instead of stop
If user says `/stop-music pause`, use `pkill -STOP -f afplay` to freeze (can resume later with `/start-music resume`).
Default `/stop-music` fully kills the process.

## Related Commands
- `/start-music` — Start Clara Radio
- `/start-music "Song Name"` — Play a specific song
- `/start-music "Playlist: Jazz"` — Play a genre playlist
