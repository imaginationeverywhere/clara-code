#!/usr/bin/env python3
"""
SessionStart hook — inject checkpoint + vault snippets so sessions resume in-place.

Runs for every Claude Code start in this project (team windows, per-agent --agent=, etc.).
Outputs hook JSON only on stdout.
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path

MAX_CHECKPOINT = 8000  # project-wide session checkpoint
MAX_AGENT_CHECKPOINT = 4000  # per-agent checkpoint (half of project checkpoint)
MAX_FEED = 2500  # live-feed.md tail (last 20 lines)
MAX_DAILY = 3500  # daily note tail (last 45 lines)
MAX_TOTAL = 14000  # hard cap on total injected context (~3.5K tokens)

_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}\.md$")


def _read_text(path: Path, limit: int) -> str:
    if not path.is_file():
        return ""
    try:
        raw = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return ""
    if len(raw) > limit:
        return raw[:limit] + "\n… [truncated]"
    return raw


def _tail_file(path: Path, max_bytes: int) -> str:
    if not path.is_file():
        return ""
    try:
        lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
    except OSError:
        return ""
    tail = "\n".join(lines[-20:])
    if len(tail) > max_bytes:
        return tail[-max_bytes:] + "\n… [truncated]"
    return tail


def _latest_daily_snippet(daily_dir: Path) -> str:
    if not daily_dir.is_dir():
        return ""
    try:
        md_files = sorted(
            [f for f in daily_dir.glob("*.md") if _DATE_RE.match(f.name)],
            key=lambda p: p.name,
            reverse=True,
        )
        if not md_files:
            return ""
        latest = md_files[0]
        lines = latest.read_text(encoding="utf-8", errors="replace").splitlines()
        body = "\n".join(lines[-45:])
        if len(body) > MAX_DAILY:
            return f"(from {latest.name})\n" + body[-MAX_DAILY:] + "\n… [truncated]"
        return f"(from {latest.name})\n{body}"
    except OSError:
        return ""


def _git_oneline(root: Path, n: int = 5) -> str:
    try:
        cp = subprocess.run(
            ["git", "-C", str(root), "log", f"-{n}", "--oneline"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        if cp.returncode != 0:
            return ""
        return cp.stdout.strip()
    except (OSError, subprocess.TimeoutExpired):
        return ""


def build_context(root: Path) -> str:
    home = Path.home()
    team = os.environ.get("SWARM_TEAM", "").strip() or "standalone"

    parts: list[str] = [
        "[SESSION RESUME — injected at SessionStart]",
        f"SWARM_TEAM: {team}",
        "",
        "PROTOCOL:",
        "- Continue from the checkpoint and recent activity below.",
        "- Do NOT run a full Family Standup, long roll call, or lengthy self-introduction unless Mo explicitly asks.",
        "- At most one short line acknowledging you're resuming, then wait for Mo's next message.",
        "- If the checkpoint is empty or stale, say you're ready and ask what Mo needs.",
        "",
    ]

    agent_key = os.environ.get("SWARM_RESUME_AGENT", "").strip()
    if agent_key:
        checkpoints_dir = root / "memory" / "agent-checkpoints"
        ap = checkpoints_dir / f"{agent_key}.md"
        # Prevent path traversal via SWARM_RESUME_AGENT
        if not ap.resolve().is_relative_to(checkpoints_dir.resolve()):
            ap = checkpoints_dir / "invalid.md"  # won't exist, returns ""
        ag = _read_text(ap, MAX_AGENT_CHECKPOINT)
        if ag.strip():
            parts.append(f"--- memory/agent-checkpoints/{agent_key}.md (this agent) ---")
            parts.append(ag.strip())
            parts.append("")

    ck_path = root / "memory" / "session-checkpoint.md"
    ck = _read_text(ck_path, MAX_CHECKPOINT)
    if ck.strip():
        parts.append("--- memory/session-checkpoint.md (project) ---")
        parts.append(ck.strip())
        parts.append("")

    feed = home / "auset-brain" / "Swarms" / "live-feed.md"
    ft = _tail_file(feed, MAX_FEED)
    if ft.strip():
        parts.append("--- ~/auset-brain/Swarms/live-feed.md (last lines) ---")
        parts.append(ft.strip())
        parts.append("")

    daily = _latest_daily_snippet(home / "auset-brain" / "Daily")
    if daily.strip():
        parts.append("--- ~/auset-brain/Daily/ (latest note, tail) ---")
        parts.append(daily.strip())
        parts.append("")

    gl = _git_oneline(root)
    if gl:
        parts.append("--- git log (this repo, recent) ---")
        parts.append(gl)

    text = "\n".join(parts).strip()
    if len(text) > MAX_TOTAL:
        text = text[:MAX_TOTAL] + "\n… [truncated for hook size]"

    return text


def main() -> int:
    root = Path.cwd()
    ctx = build_context(root)
    # Always emit valid JSON so Claude Code never breaks on empty output
    out = {
        "hookSpecificOutput": {
            "hookEventName": "SessionStart",
            "additionalContext": ctx,
        }
    }
    sys.stdout.write(json.dumps(out, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
