#!/usr/bin/env python3
"""Fetch captions for w8kkTvdxRu8. Run locally if you see IpBlocked (cloud IP)."""

from __future__ import annotations

from pathlib import Path

from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import YouTubeTranscriptApiException

OUT = Path(__file__).resolve().parent
VID = "w8kkTvdxRu8"
TITLE = "I Reverse-Engineered Vapi (And It's x10 Cheaper)"


def fmt_ts(sec: float) -> str:
    m = int(sec // 60)
    s = int(sec % 60)
    return f"{m:02d}:{s:02d}"


def main() -> None:
    url = f"https://www.youtube.com/watch?v={VID}"
    api = YouTubeTranscriptApi()
    try:
        ft = api.fetch(VID, languages=("en", "en-US", "en-GB"))
    except YouTubeTranscriptApiException as e:
        print(e)
        raise SystemExit(1)
    lines_ts = [f"[{fmt_ts(s.start)}] {s.text.strip()}" for s in ft.snippets]
    plain = " ".join(s.text.strip() for s in ft.snippets)
    body = f"""Source: YouTube captions (language={ft.language_code}, generated={ft.is_generated})

--- Timestamps ---
{chr(10).join(lines_ts)}

--- Plain text ---
{plain}
"""
    header = f"""Title: {TITLE}
Video ID: {VID}
URL: {url}
"""
    path = OUT / f"{VID}.txt"
    path.write_text(header + "\n" + body, encoding="utf-8")
    print(f"Wrote {path} ({len(ft.snippets)} snippets)")


if __name__ == "__main__":
    main()
