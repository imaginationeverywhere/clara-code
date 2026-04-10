---
type: decision
date: 2026-04-06
topic: Hermes Agent + Syncthing Integration — The Independent Agent Harness Already Exists
status: approved-for-implementation
priority: critical
tags: [hermes, syncthing, agent-harness, voice, learning, skills, gateway, independent-agents]
---

# Decision: Hermes Agent Replaces Custom Agent Harness. Syncthing Replaces S3/Git Sync.

## The Discovery

Hermes Agent (NousResearch, 19K stars, MIT, Python, already forked to imaginationeverywhere) IS the independent agent harness we were designing from scratch. It has: self-improving learning loop, 14+ messaging platforms, built-in voice mode, MCP support, subagent delegation, cron scheduler, context files, SOUL.md personas, 6 deployment backends (including Modal serverless at ~$0 idle), persistent memory, skill auto-creation, and smart model routing.

Syncthing (open-source P2P file sync, encrypted, no central server) replaces `aws s3 sync` and `push-herus.sh` for real-time file distribution across MacBook, QCS1, and AWS.

## What This Replaces

- Agent persona impersonation → Hermes SOUL.md (real identity with persistent memory)
- Manual brain loader → Hermes prompt_builder.py
- Manual skill creation → Hermes auto-skills from trajectories
- voice-to-swarm.sh → Hermes Voice Mode + Gateway
- speak.py → Hermes TTS (Voxtral plugged in)
- feed-watcher.sh / inbox-dispatcher.sh → Hermes Gateway (always listening)
- wake-session.sh → Hermes never sleeps (Gateway always online)
- aws s3 sync → Syncthing P2P continuous
- push-herus.sh → Syncthing Send Only from MacBook

## What Stays

- Claude Code + Cursor Ultra (Mo's dev tools, unchanged)
- Paperclip (governance layer, tickets/budgets/org chart)
- @auset/voice-widget (customer-facing, connects to Hermes via webhook)
- Voxtral STT/TTS (plugs into Hermes voice mode)
- DeepSeek V3.2 (primary LLM via Hermes smart routing)
- tmux swarm sessions (Mo's local coding session management)

## Implementation

4 calendar days. 19 agent compute hours. 4.5 hours of Mo's time. 85 agents migrated.

## The Compound Effect

Agents that learn → create skills → self-improve → remember users → get smarter month over month. This is the moat. Every competitor starts from zero. Our agents compound.

## Full Plan

`.claude/plans/2026-04-06-hermes-syncthing-integration.md`

## Related

- [Paperclip Voice Full Plan](decision-paperclip-voice-full-plan-2026-04-05.md)
- [Independent Agent Harness Architecture](decision-independent-agent-harness-2026-04-05.md)
- [Clara Voice Heru Sprint Plan](decision-clara-voice-heru-sprint-2026-04-06.md)
