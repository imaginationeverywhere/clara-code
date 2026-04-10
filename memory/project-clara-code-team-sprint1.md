---
name: Clara Code Team — Sprint 1 Launch
description: Clara Code team standing up to fork pi-mono, wire Hermes+DeepSeek, vault integration, create-clara-app bootstrapper
type: project
---

# Clara Code Team — Sprint 1

**Decision date:** 2026-04-10
**Source:** Mo's direct directive — "lets git it"

## Repo + Infrastructure
- **GitHub repo:** `imaginationeverywhere/clara-code`
- **Neon DB:** clara-code (develop + production branches)
- **Foundation:** Fork of `badlogic/pi-mono` packages/coding-agent (MIT license)
- **Model:** Bedrock DeepSeek V3.2 via Hermes router (default)

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
2. Register Hermes model router — Bedrock DeepSeek V3.2 as default provider
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
