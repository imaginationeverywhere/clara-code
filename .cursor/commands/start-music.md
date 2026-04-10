# /start-music — Clara Radio: Start Playing

Start the Clara Radio ambient music. Artists earn while agents think and users work.

## CONSTANTS
```
RADIO_DIR=/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate/infrastructure/voice/tones/radio
TONES_DIR=/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate/infrastructure/voice/tones
```

## KILL MUSIC FIRST (always)
```bash
pkill -9 -f "afplay.*tones" 2>/dev/null; pkill -9 -f "while true.*afplay" 2>/dev/null; killall afplay 2>/dev/null; true
```

## TRACK STATE (always)
After starting playback, ALWAYS write the playing file path to `/tmp/clara-radio-now-playing`:
```bash
echo "/path/to/playing/file.wav" > /tmp/clara-radio-now-playing
```
This lets `/mary` and `/gran` voice commands resume the SAME song after speaking.

## FILENAME SANITIZATION (always)
After downloading with yt-dlp, rename files to remove special characters (`"`, `'`, `＂`, etc.):
```bash
# Example: rename to clean slug
for f in *.wav; do mv "$f" "$(echo "$f" | sed 's/[^a-zA-Z0-9._-]/-/g')" 2>/dev/null; done
```

## MODE DETECTION

Check the argument: `$ARGUMENTS`

---

### If argument is EMPTY → Play default thinking tone

```bash
bash -c 'while true; do afplay "/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate/infrastructure/voice/tones/default-thinking.wav"; done' &
```
Print: "🎵 Clara Radio — Now playing: Default Thinking Tone"

---

### If argument is a SINGLE SONG (e.g., "Gangsta Shit by Snoop Dogg" or "Ain't Nothing But A G Thang:Dr Dre") → Download and play

1. Parse: if argument contains ":" treat left side as song, right side as artist. Otherwise search the full string.
   - `"Ain't Nothing But A G Thang:Dr Dre"` → search `"Ain't Nothing But A G Thang Dr Dre"`
   - `"Computer Love by Zapp"` → search `"Computer Love by Zapp"`

2. Download:
   ```bash
   mkdir -p $RADIO_DIR
   rm -f $RADIO_DIR/now-playing.wav 2>/dev/null
   yt-dlp -x --audio-format wav --audio-quality 0 -o "$RADIO_DIR/now-playing.%(ext)s" "ytsearch1:<search-query>" --no-playlist --quiet
   ```

3. Play on loop:
   ```bash
   bash -c 'while true; do afplay "$RADIO_DIR/now-playing.wav"; done' &
   ```

4. Print: "🎵 Clara Radio — Now playing: <song name>"

---

### If argument contains COMMAS → Multiple tracks (queue/shuffle)

Parse each comma-separated entry. Each entry can be:
- `"Song Name:Artist"` — search with both
- `"Song Name"` — search song only

Example: `"Ain't Nothing But A G Thang:Dr Dre", "Today was A Good Day:Ice Cube", "True to the Game"`

1. Create queue directory:
   ```bash
   mkdir -p $RADIO_DIR/queue
   rm -f $RADIO_DIR/queue/*.wav 2>/dev/null
   ```

2. Download each track (number them for order):
   ```bash
   # For each track, replace ":" with " " for search
   yt-dlp -x --audio-format wav --audio-quality 0 -o "$RADIO_DIR/queue/01-%(title).50s.%(ext)s" "ytsearch1:<track1-query>" --no-playlist --quiet
   yt-dlp -x --audio-format wav --audio-quality 0 -o "$RADIO_DIR/queue/02-%(title).50s.%(ext)s" "ytsearch1:<track2-query>" --no-playlist --quiet
   # ... etc for each track
   ```

3. Shuffle and play:
   ```bash
   bash -c 'while true; do for f in $(ls $RADIO_DIR/queue/*.wav | sort -R); do afplay "$f"; done; done' &
   ```

4. Print: "🎵 Clara Radio — Queue loaded: <N> tracks (shuffling)"
   List each track name.

---

### If argument starts with "Playlist:" → Genre/artist station

Extract the name after "Playlist:". This is a STATION — like old radio.

- `"Playlist: Jazz"` → search `"Jazz classics songs"`
- `"Playlist: Michael Jackson"` → search `"Michael Jackson"` (downloads top 5 songs)
- `"Playlist: 90s Hip Hop"` → search `"90s hip hop classics"`
- `"Playlist: R&B"` → search `"R&B soul classics"`

1. Download 5 tracks:
   ```bash
   mkdir -p $RADIO_DIR/station
   rm -f $RADIO_DIR/station/*.wav 2>/dev/null
   cd $RADIO_DIR/station
   yt-dlp -x --audio-format wav --audio-quality 0 -o "%(title).50s.%(ext)s" "ytsearch5:<station-query> songs" --no-playlist --quiet
   ```

2. Shuffle and play:
   ```bash
   bash -c 'while true; do for f in $(ls $RADIO_DIR/station/*.wav | sort -R); do afplay "$f"; done; done' &
   ```

3. Print: "🎵 Clara Radio — Station: <name> (5 tracks, shuffling)"
   List downloaded track names.

---

### If argument starts with "Album:" → Full album

- `"Album: The Chronic:Dr Dre"` → search `"Dr Dre The Chronic full album"`

1. Download up to 10 tracks:
   ```bash
   mkdir -p $RADIO_DIR/album
   rm -f $RADIO_DIR/album/*.wav 2>/dev/null
   cd $RADIO_DIR/album
   yt-dlp -x --audio-format wav --audio-quality 0 -o "%(title).50s.%(ext)s" "ytsearch10:<album-query> album tracks" --no-playlist --quiet
   ```

2. Play in order (albums should play sequentially, not shuffled):
   ```bash
   bash -c 'while true; do for f in $(ls $RADIO_DIR/album/*.wav); do afplay "$f"; done; done' &
   ```

3. Print: "🎵 Clara Radio — Album: <name> (playing in order)"

---

### If argument is "library" or "list" → Show music library

List all files with sizes in:
- `$TONES_DIR/` (default tones)
- `$RADIO_DIR/` (single tracks)
- `$RADIO_DIR/queue/` (queued tracks)
- `$RADIO_DIR/station/` (station tracks)
- `$RADIO_DIR/album/` (album tracks)

---

## Clara Radio — The Business Model

**Right now (dev/internal):** yt-dlp pulls from YouTube for prototyping. This is Mo and Quik testing the UX.

**Clara Radio (production):**
- Artists upload tracks → set their own rates (purchase price, licensing fee)
- Users BUY tones (own forever, NO streaming) OR listen to Clara Radio FREE (ad-supported)
- Clara Radio = old-school radio. Artists CHOOSE what music they promote for free on stations
- Users pick a station (Jazz, Hip Hop, R&B, Gospel, Afrobeat, etc.)
- Ads play between songs for free-tier listeners
- Premium users: no ads, unlimited plays
- Clara takes platform fee on every purchase. Clearing house model.
- Every play is tracked → artist gets paid
- Blockchain-verified ownership for purchased tones
- Secondary market: resell tones you bought

**Music ONLY plays during:** agent thinking, background work, dead air between exchanges
**Music STOPS during:** user speaking, agent TTS speaking

## Related Commands
- `/stop-music` — Stop Clara Radio
- `/mary` or `/gran` with number — Voice mode (auto-manages music timing)
