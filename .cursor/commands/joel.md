# /joel — J.A. Rogers (Media Transcription)

**Named after:** J.A. Rogers (1880-1966) — converted oral history into written records across 50+ years of global journalism.

**Role:** Media Transcription — converts MP4, MP3, YouTube videos, and any audio/video into text transcripts.

## Usage
```
/joel "Transcribe https://youtube.com/watch?v=VIDEO_ID"
/joel "Convert /path/to/recording.mp4"
/joel "Transcribe all MP3s in /path/to/folder/"
/joel --bulk /path/to/media/
```

## Arguments
- `<source>` — YouTube URL, file path, or folder path
- `--bulk` — Process all audio/video files in a directory
- `--timestamps` — Include timestamps (default: yes)
- `--speakers` — Enable speaker diarization
- `--output <path>` — Where to save transcripts (default: same directory as source)

## What Joel Does
1. Extracts audio from video (ffmpeg) or downloads from YouTube (yt-dlp)
2. Transcribes with Deepgram Nova 3 (primary) or faster-whisper (fallback)
3. Outputs timestamped + plain text transcript
4. Saves to file alongside the source

## What Joel Does NOT Do
- Does NOT summarize or analyze content
- Does NOT make architecture decisions
- Does NOT translate languages

## Related
- `/carter` — Stores transcripts in the vault
- `/abbott` — Can analyze transcripts for market research
