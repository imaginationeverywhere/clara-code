# create-clara-app — architecture overview and prompt index

**Repository:** [imaginationeverywhere/clara-code](https://github.com/imaginationeverywhere/clara-code)  
**Author:** Granville T. Woods (HQ Architect)  
**Date:** April 7, 2026 (prompt); consolidated April 19, 2026

This document indexes the phased implementation prompts for the **create-clara-app** product line (CLI scaffold → Paperclip → Clara runtime → voice → Hermes). It does not duplicate detailed plans; see linked plan files under `.claude/plans/` or `plans/` when present.

## Prompt index

### Phase 1: Foundation (Sprint 3 Week 1–2)

| # | Prompt | Team | Reviewer | What it builds |
|---|--------|------|----------|----------------|
| 01 | create-clara-app CLI | PKGS | George | `npx create-clara-app` — scaffolds a Heru |
| 02 | heruConfig System | PKGS | George | Config-driven package activation per vertical |
| 03 | Clara API Scaffold | HQ/DevOps | Gary | api.claraagents.com — the public API |

### Phase 2: Client experience (Sprint 3 Week 2–3)

| # | Prompt | Team | Reviewer | What it builds |
|---|--------|------|----------|----------------|
| 04 | Paperclip Dashboard Frontend | QN | Shirley | Client-facing control center UI |
| 05 | Paperclip Dashboard Backend | QN/DevOps | Gary | Hermes integration, real-time updates |
| 06 | Usage Metering + Billing | PKGS | George | AI usage tracking, Stripe billing |

### Phase 3: Clara intelligence (Sprint 3–4)

| # | Prompt | Team | Reviewer | What it builds |
|---|--------|------|----------|----------------|
| 07 | Clara Agents Runtime | HQ | Gary | `.clara/agents/` — multi-agent lifecycle |
| 08 | Agent Management API | HQ/QN | Gary | Create, configure, share agents |
| 09 | Family/Couples Agent Sharing | QN | Shirley | Multi-user households, shared agents |

### Phase 4: Deployment and delivery (Sprint 4)

| # | Prompt | Team | Reviewer | What it builds |
|---|--------|------|----------|----------------|
| 10 | Clara Cloud (AWS Org Automation) | DevOps | Wentworth | Sub-account creation, infra provisioning |
| 11 | One-Command Deploy Pipeline | DevOps | Wentworth | Voice or CLI → live app |
| 12 | Docker Base Image + Registry | PKGS/DevOps | George | All packages baked in container |

### Phase 5: IP core (Sprint 3, parallel)

| # | Prompt | Team | Reviewer | What it builds |
|---|--------|------|----------|----------------|
| 13 | Clara Voice Server | HQ/DevOps | Gary | Voice infra, TTS/STT, Clara Radio |
| 14 | Hermes Harness Integration | HQ ONLY | Gary | Harness — SOUL files, governance, skills, brain sync |

Prompts **13** and **14** are treated as protected IP in the original routing doc; public packages expose `.clara/` UX, not internal infra source paths.

## Dependency graph

```
14 (Hermes harness) ───────────────── foundation
  ├─→ 07 → 08 → 09
  ├─→ 13 → voice in 04 + 01
  ├─→ 05 → 04
01 → 02 → 12
03 → 06
10 → 11
```

## Existing plans (reference)

Search the repo for:

- Paperclip + voice architecture
- Hermes / Syncthing integration
- Clara runtime architecture
- Auset package ecosystem

Do not duplicate those documents here; update links if files move.

## Routing (review ownership)

1. **George (PKGS)** — 01, 02, 06, 12  
2. **Shirley (QN)** — 04, 09  
3. **Wentworth (DevOps)** — 10, 11  
4. **Gary (HQ)** — 03, 05, 07, 08, 13, 14  
5. **Granville (HQ)** — prompts 13–14 narrative ownership per original spec  

## IP classification (original spec)

| Prompts | Classification | Notes |
|---------|----------------|-------|
| 01–12 | Open source (MIT) intent | Ship as publishable packages where applicable |
| 13–14 | Protected | Not public infra details in client-facing repos |
