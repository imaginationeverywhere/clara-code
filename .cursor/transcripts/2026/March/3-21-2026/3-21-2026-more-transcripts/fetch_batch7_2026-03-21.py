#!/usr/bin/env python3
"""
Fetch YouTube captions for batch-7 videos and write *.txt next to this script.

Run on your Mac (not a cloud CI IP) if you see IpBlocked or HTTP 429:

  cd "$(dirname "$0")"
  python3 -m venv .venv-fetch && .venv-fetch/bin/pip install -q youtube-transcript-api
  .venv-fetch/bin/python fetch_batch7_2026-03-21.py
"""

from __future__ import annotations

from pathlib import Path

from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import YouTubeTranscriptApiException

OUT = Path(__file__).resolve().parent

TITLES: dict[str, str] = {
    "LvLdNkgO-N0": "The senior engineer's guide to AI coding: Context loading, custom hooks, and automation",
    "oOVJgfCqyUQ": "How to Run Claude Code for Free (2 Methods)",
    "MppKHh_MfFc": "Everyone Uses GSD. Smart Devs Use PAUL.",
    "CXeCIgc982I": "The Claude Code Skills Trap (Most People Fall For This)",
    "ZNIsMt8LMF0": "Qwen3.5 + Claude-4.6-Opus-Reasoning = Another Anthropic FREE Open Source Claude Model",
    "5lrMdq-HdZc": "Claude Code + Remotion = Unlimited Shorts",
    "g_xXfPHfFuE": "Claude Code FULL COURSE 3 Hours — (Build & Automate Anything)",
}


def fmt_ts(sec: float) -> str:
    m = int(sec // 60)
    s = int(sec % 60)
    return f"{m:02d}:{s:02d}"


def safe_name(vid: str) -> str:
    if vid.startswith("-"):
        return "neg_" + vid[1:]
    return vid


def main() -> None:
    api = YouTubeTranscriptApi()
    ok = 0
    for vid, title in TITLES.items():
        url = f"https://www.youtube.com/watch?v={vid}"
        try:
            ft = api.fetch(vid, languages=("en", "en-US", "en-GB"))
        except YouTubeTranscriptApiException as e:
            print(f"FAIL {vid}: {e}")
            continue
        lines_ts = [f"[{fmt_ts(s.start)}] {s.text.strip()}" for s in ft.snippets]
        plain = " ".join(s.text.strip() for s in ft.snippets)
        body = f"""Source: YouTube captions (language={ft.language_code}, generated={ft.is_generated})

--- Timestamps ---
{chr(10).join(lines_ts)}

--- Plain text ---
{plain}
"""
        header = f"""Title: {title}
Video ID: {vid}
URL: {url}
"""
        path = OUT / f"{safe_name(vid)}.txt"
        path.write_text(header + "\n" + body, encoding="utf-8")
        print(f"OK {vid} -> {path.name} ({len(ft.snippets)} snippets)")
        ok += 1
    print(f"Done: {ok}/{len(TITLES)} written to {OUT}")


if __name__ == "__main__":
    main()
