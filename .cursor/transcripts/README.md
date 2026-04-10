# Transcripts

This directory holds video transcripts (YouTube captions and local video transcriptions).

## Structure

- **`3-18-2026/`** — Transcripts collected on March 18, 2026
  - **`local/`** — Transcripts from local videos (e.g. Whisper output from Instagram downloads, screen recordings, etc.)
  - `*.txt` / `*.en.vtt` — YouTube transcripts (from yt-dlp)

## Adding a local video transcript (Whisper)

Output Whisper directly into the local folder:

```bash
whisper /path/to/your/video.mp4 \
  --output_format txt \
  --output_dir /Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate/.cursor/transcripts/3-18-2026/local
```

Or from anywhere, using a relative path from the project root:

```bash
cd /Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate
whisper ~/Downloads/video.mp4 --output_format txt --output_dir .cursor/transcripts/3-18-2026/local
```

The transcript will be saved as `video.txt` (or the video’s filename + `.txt`) in `local/`.
