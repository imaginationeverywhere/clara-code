# create-clara-app — Architecture Overview & Prompt Index
**TARGET REPO:** `/Volumes/X10-Pro/Native-Projects/AI/clara-code`  
_(Auto-classified 2026-04-15. If wrong, edit this line before dispatch.)_

**Author:** Granville T. Woods (HQ Architect)
**Date:** April 7, 2026
**Status:** Prompts written, routed for review + implementation

---

## What This Is

14 implementation prompts that build the entire `create-clara-app` product — from the CLI that scaffolds a new Heru, to the Paperclip Dashboard clients see, to the Clara Agents runtime, the Voice Server, and the Hermes Harness that IS our IP.

## Prompt Index

### Phase 1: Foundation (Sprint 3 Week 1-2)

| # | Prompt | Team | Reviewer | What It Builds |
|---|--------|------|----------|---------------|
| 01 | create-clara-app CLI | PKGS | George | `npx create-clara-app` — scaffolds a Heru |
| 02 | heruConfig System | PKGS | George | Config-driven package activation per vertical |
| 03 | Clara API Scaffold | HQ/DevOps | Gary | api.claraagents.com — the public API |

### Phase 2: Client Experience (Sprint 3 Week 2-3)

| # | Prompt | Team | Reviewer | What It Builds |
|---|--------|------|----------|---------------|
| 04 | Paperclip Dashboard Frontend | QN | Shirley | Client-facing control center UI |
| 05 | Paperclip Dashboard Backend | QN/DevOps | Gary | Hermes integration, real-time updates |
| 06 | Usage Metering + Billing | PKGS | George | AI usage tracking, Stripe billing |

### Phase 3: Clara Intelligence (Sprint 3-4)

| # | Prompt | Team | Reviewer | What It Builds |
|---|--------|------|----------|---------------|
| 07 | Clara Agents Runtime | HQ | Gary | .clara/agents/ — multi-agent lifecycle |
| 08 | Agent Management API | HQ/QN | Gary | Create, configure, share agents |
| 09 | Family/Couples Agent Sharing | QN | Shirley | Multi-user households, shared agents |

### Phase 4: Deployment & Delivery (Sprint 4)

| # | Prompt | Team | Reviewer | What It Builds |
|---|--------|------|----------|---------------|
| 10 | Clara Cloud (AWS Org Automation) | DevOps | Wentworth | Sub-account creation, infra provisioning |
| 11 | One-Command Deploy Pipeline | DevOps | Wentworth | Voice or CLI → live app |
| 12 | Docker Base Image + Registry | PKGS/DevOps | George | All 23 packages baked in container |

### Phase 5: IP Core — The Crown Jewels (Sprint 3, parallel with all phases)

| # | Prompt | Team | Reviewer | What It Builds |
|---|--------|------|----------|---------------|
| 13 | Clara Voice Server | HQ/DevOps | Gary | Always-listening voice infra, TTS/STT, Clara Radio |
| 14 | Hermes Harness Integration | HQ ONLY | Gary | Agent harness — SOUL files, governance, skills, brain sync |

**Prompts 13 + 14 are TRADE SECRET / PROTECTED IP.** Clients get the `.clara/` experience. They never see this source.

## Dependency Graph

```
14 (HERMES HARNESS) ─────────────────────────────────── THE FOUNDATION
  │                                                          │
  ├─→ 07 (Agents Runtime) ──→ 08 (Agent API) ──→ 09 (Family Plans)
  │                                                          │
  ├─→ 13 (VOICE SERVER) ──→ Voice in 04 (Dashboard) + 01 (CLI)
  │                                                          │
  ├─→ 05 (Dashboard BE) ──→ 04 (Dashboard FE)               │
  │                                                          │
01 (CLI) ──→ 02 (heruConfig) ──→ 12 (Docker Image)          │
03 (API) ──→ 06 (Metering) ─────────────────────────────────┘
10 (AWS Org) ──→ 11 (Deploy Pipeline)
```

## Existing Plans (Reference — Do NOT Duplicate)

- `plans/2026-04-05-paperclip-voice-full-plan.md` — Paperclip + voice architecture (100% complete)
- `plans/2026-04-06-hermes-syncthing-integration.md` — Hermes messaging (100% complete)
- `plans/clara-runtime-architecture.md` — Clara runtime spec (ready for implementation)
- `plans/auset-package-ecosystem-spec.md` — Package ecosystem (being extracted now)

## Routing Rules

1. **George (PKGS)** reviews package/CLI/heruConfig/billing prompts (01, 02, 06, 12)
2. **Shirley (QN)** reviews dashboard + family plan prompts (04, 09)
3. **Wentworth (DevOps)** reviews infrastructure + deployment prompts (10, 11)
4. **Gary (HQ)** reviews architecture/API/voice/harness prompts (03, 05, 07, 08, 13, 14)
5. **Granville (HQ)** maintains prompts 13 + 14 directly — these are the IP core
6. **Cursor agents** implement after review passes
7. **All prompts** follow the Charles Pattern — code is IN the prompt

## IP Classification

| Prompt | Classification | Who Sees Source |
|--------|---------------|----------------|
| 01-12 | Open Source (MIT) | Everyone — these become @ie packages |
| 13 | Trade Secret | Mo + Quik + HQ agents only |
| 14 | Protected IP | Mo + Quik + HQ agents only |

**Rule:** Clients get `.clara/` on their device. They NEVER get `infrastructure/hermes/` or `infrastructure/voice/`. The packages are the engine you buy. The harness and voice server are the factory you never see.
