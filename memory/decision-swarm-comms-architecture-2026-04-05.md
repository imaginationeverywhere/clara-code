---
type: decision
topic: Swarm Inter-Session Communication Architecture
date: 2026-04-05
session: quik-nation-ai-boilerplate
author: Amen Ra
status: implemented
tags: [swarm, tmux, telegraph, inbox-dispatcher, wake, cron-removal]
---

# Decision: Swarm Communication — Event-Driven + tmux Wake

## Date: 2026-04-05

## Context
Multiple Claude Code sessions run simultaneously as team swarms. Sessions need to communicate (send tasks, report completion, wake idle sessions). The old approach used a 5-minute CronCreate in every session that polled for messages — wasting tokens and CPU even when all inboxes were empty and no sessions were alive.

Additionally, waking truly idle sessions (no user input, no agent running) was impossible because Claude Code hooks only fire on events, and AppleScript keystroke injection was fragile, clipboard-destructive, and didn't work over SSH.

## Decisions Made

### 1. Kill All Cron Jobs — Replace with Event-Driven Inbox Dispatcher
- **Created:** `.claude/scripts/inbox-dispatcher.sh` (296 lines)
- Uses `fswatch` on `/tmp/swarm-inboxes/` — fires ONLY when a message arrives
- Wakes ONLY the targeted session (not all sessions)
- Exponential backoff on failed wakes (10s → 20s → 40s → cap 5min)
- Auto-terminates when all sessions are dead + all inboxes empty
- Auto-started by `swarm-telegraph.sh start`
- **`session-start.md` updated**: Removed CronCreate block, added explicit "NO CRON JOBS" warnings

### 2. tmux as Pseudo-Terminal Wrapper for Reliable Wake
- **Created:** `.claude/scripts/swarm-launcher.sh`
- Sessions launched via `swarm-launcher.sh start <team> <project-path>` run inside named tmux sessions
- `tmux send-keys -t swarm-<team> "message" Enter` injects text directly — no clipboard, no focus theft, works over SSH
- **Solves the "idle session wake" problem** that was previously unsolvable
- `.zshrc` aliases updated: `wcr`, `hq`, `pkgs`, etc. all now launch through swarm-launcher.sh

### 3. Session Registry Rewritten for Dual Discovery
- **Rewrote:** `.claude/scripts/session-registry.sh`
- Discovers tmux sessions first (preferred), falls back to TTY scan for bare Terminal tabs
- Wake logic: `tmux send-keys` primary, AppleScript fallback
- All existing scripts (inbox-dispatcher, feed-watcher) call `session-registry.sh wake` — no changes needed

### 4. push-herus.sh Resilience Upgrade
- **Rewrote:** `.claude/scripts/push-herus.sh`
- Added: git stash → sync → commit (--no-verify) → pull --rebase (fallback to merge) → push → stash pop
- Handles: dirty trees, remote-ahead, pre-commit hooks, symlink-to-dir migration, push timeouts
- Timeouts on stash (15s), stash pop (15s), pull (60s), push (configurable, default 120s)
- No `--include-untracked` (hangs on repos with large untracked trees)

## The Full Delivery Chain
```
1. Team A sends: swarm-telegraph.sh send pkgs "Fix the build"
2. Telegraph:    writes live-feed.md (archive) + /tmp/swarm-inboxes/pkgs.md (delivery)
3. fswatch:      inbox-dispatcher detects the write INSTANTLY
4. Dispatcher:   calls session-registry.sh wake pkgs "You have messages"
5. Registry:     finds swarm-pkgs in tmux → tmux send-keys (instant, reliable)
6. Claude Code:  PKGS session receives prompt, reads inbox, acts
```

## Files Changed
| File | Action |
|------|--------|
| `.claude/scripts/inbox-dispatcher.sh` | NEW — event-driven inbox watcher |
| `.claude/scripts/swarm-launcher.sh` | NEW — tmux session launcher |
| `.claude/scripts/session-registry.sh` | REWRITTEN — tmux + TTY discovery, dual wake |
| `.claude/scripts/wake-session.sh` | REWRITTEN — thin wrapper around registry |
| `.claude/scripts/swarm-telegraph.sh` | UPDATED — auto-starts inbox-dispatcher |
| `.claude/scripts/push-herus.sh` | REWRITTEN — stash/pull/pop resilience |
| `.claude/scripts/agent-aliases.sh` | UPDATED — swarm-launcher aliases |
| `.claude/commands/session-start.md` | UPDATED — Step 11 rewritten, no cron, tmux docs |
| `~/.zshrc` | UPDATED — all 14 team aliases now tmux-wrapped |

## Sync Status
- All files synced to 61 Herus + pushed to 35 remotes (2026-04-05)
- empresss-eats + quikcarrental manually fixed (pre-commit hooks + symlink conflicts)
