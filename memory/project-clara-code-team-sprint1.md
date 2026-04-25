---
name: Clara Code Team — Sprint 1 Launch
description: Clara Code team standing up to fork pi-mono, wire Hermes router (Gemma 4 on Modal default, DeepSeek V3 on Bedrock for heavy/long-context only), vault integration, create-clara-app bootstrapper
type: project
note: 2026-04-25 — model references updated. Original sprint shipped against DeepSeek-as-primary; canonical stack is now Gemma 4 27B on Modal first. See memory/decision-canonical-stack-supersedes-deepseek-primary-2026-04-25.md.
---

# Clara Code Team — Sprint 1

**Decision date:** 2026-04-10
**Source:** Mo's direct directive — "lets git it"

## Repo + Infrastructure
- **GitHub repo:** `imaginationeverywhere/clara-code`
- **Neon DB:** clara-code (develop + production branches)
- **Foundation:** Fork of `badlogic/pi-mono` packages/coding-agent (MIT license)
- **Model routing (canonical 2026-04-25):** Hermes router defaults to **Gemma 4 27B on Modal A100** (~80% of requests). Kimi K2 on Modal H100 for reasoning (~10-15%). DeepSeek V3 on AWS Bedrock for heavy / long-context only (~3-5%). Claude/GPT premium <1%. See `pricing/model-routing-strategy.md`.

## Team Roles (Ruby to name from historical Black figures)

| Role | Responsibility |
|---|---|
| **Product Owner** | Clara Code product roadmap, developer community, vibe coder relationships |
| **Tech Lead** | Fork architecture, Hermes router wiring, SOUL.md contract per agent |
| **Frontend Engineer** | Voice UI (mic button, S for radio, no slash commands visible), Electron desktop |
| **Backend Engineer** | Vault tool, JSONL session writer, `@ie/clara` SDK, API routes |
| **Dev Relations** | Vibe coder onboarding, docs, `npx create-clara-app` UX, community |

## Sprint 1 Agenda (What the team executes immediately)

1. Fork `badlogic/pi-mono` → `imaginationeverywhere/clara-code`
2. Register Hermes model router — **Gemma 4 27B on Modal A100 as default provider** (canonical 2026-04-25); Kimi K2 on Modal H100 for reasoning routes; DeepSeek V3 on Bedrock for heavy/long-context only. See `pricing/model-routing-strategy.md`.
3. Wire vault sync as a native tool (`~/auset-brain/` read/write)
4. Auto-write session JSONL to `~/auset-brain/agents/<name>/sessions/` (training data pipeline starts day 1)
5. Scaffold `npx create-clara-app` bootstrapper (creates a Clara-powered project)
6. Scaffold `@ie/clara` npm SDK package (what developers embed in their apps)
7. Voice UX: mic button, Enter to mute, S for Clara Radio — NO slash commands visible

## Commands to Create

- `/create-agent-team` — Ossie Davis creates this command. Takes team name + description, calls Ruby for naming, creates agent files, registers in agent-map.sh, creates team registry entry, launches swarm
- `/clara-code` — team swarm shortcut alias

## Key Architecture Decisions (Granville to spec)

- SOUL.md contract per agent persona (what makes Mary sound like Mary in the harness)
- Plugin architecture for DAW integration (VST3 spec, for QuikSession)
- The `@ie/clara` SDK API contract (what vibe coders call in their apps)
