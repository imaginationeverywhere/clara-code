---
type: decision
date: 2026-04-06
topic: Clara Voice Heru Sprint Plan — Agent Voice First for All Products
status: approved-for-implementation
priority: critical
tags: [voice, clara, sprint, herus, revenue, agent-voice-first, deepseek, voxtral]
---

# Decision: Clara Voice Sprint Plan — Every Heru Gets Agent Voice First

## The Decision

20 Herus across 4 sprint tiers (12 weeks). Every product gets `@auset/voice-widget` with Heru-specific tool registries, Clara personas, and voice-first UX. No chat boxes. Everybody talks.

## Sprint Tiers (Agent-Driven — 10 Calendar Days Total)

| Tier | Herus | Days | Agent Hours | Mo's Time | Focus |
|------|-------|------|------------|-----------|-------|
| Foundation | `@auset/voice-*` packages | Day 1 | 12h | 2h | Shared widget, STT/TTS client, LLM router, tool framework |
| 1 — Revenue Machines | QCR, Site962, QuikCarry, QuikAction | Day 2-3 | 24h | 2.5h | Direct booking/sales via voice |
| 2 — High-Value Conversion | WCR, FMO, QuikNation, QuikVibes | Day 4-5 | 22h | 2.5h | Form replacement, onboarding, assessment |
| 3 — Service Enhancement | QuikSession, QuikEvents, Tap-to-Tip, QuikBarber, QuikDelivers, PGCMC | Day 6-7 | 24h | 3.5h | User experience, support reduction |
| 4 — Platform & Flagship | Clara Agents (deep), Empresss Eats, Seeking Talent, QuikHuddle, Sliplink, free trial | Day 8-9 | 26h | 3h | Flagship product, free trial system |
| Hardening | All 20 Herus | Day 10 | 8h | 1h | E2E tests, failover, monitoring, ship |

**Total: 116 agent compute hours. 14.5 hours of Mo's time. 6 Cursor agents on QCS1 (parallel).**

## Key Use Cases Called Out by Mo

- **WCR:** Voice assessment replaces boring form → 3.4x completion rate
- **FMO:** Premium agent pitches memberships during conversation → 4x conversion
- **QCR:** Full booking, owner onboarding, vehicle listing, approval — all via voice
- **E-commerce Herus:** 1-2 saved sales pays for 10,000+ voice conversations ($0.04/each)

## Revenue Impact

- **Total monthly voice delta:** +$98,500/mo across all Herus (conservative)
- **Total voice infrastructure cost:** ~$65/mo (Voxtral self-hosted, DeepSeek V3.2 at $0.0012/turn)
- **ROI:** 151,500%

## The Stack

```
Voxtral STT (self-hosted QCS1) → DeepSeek V3.2 (Bedrock) → Voxtral TTS (self-hosted QCS1)
Free trial: Qwen3-30B on Cloudflare ($0.000113/turn)
```

## Full Plan

See `.claude/plans/2026-04-06-clara-voice-heru-sprint-plan.md`

## Related Decisions

- [Paperclip Voice Full Plan](decision-paperclip-voice-full-plan-2026-04-05.md)
- [DeepSeek V3.2 Primary LLM](decision-deepseek-v3-primary-llm-2026-04-05.md)
- [Mistral Voxtral Voice Engine](decision-mistral-voxtral-voice-engine-2026-04-05.md)
