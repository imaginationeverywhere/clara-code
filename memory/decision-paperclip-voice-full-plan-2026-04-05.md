---
type: decision
date: 2026-04-05
topic: Paperclip Voice — Full Product Plan (Internal + Consumer + Business)
status: approved
priority: critical
tags: [paperclip, voice, clara, product, pricing, plan]
---

# Decision: Paperclip Voice — Three Deployments, Zero Chat Boxes

## Brand

**Paperclip Voice** — "Adding voice to Paperclip"

## Three Paperclip Companies

1. **Quik Nation Internal** — Mo's dev team. Claude Max + Cursor Ultra ($0 variable). Receives feedback tickets, swarms.
2. **Clara Voice** — Consumer/business product. DeepSeek V3.2 on Bedrock ($1.79/user/mo). Qwen3 for free trials ($0.006/trial).
3. **Client Dashboard** — Direct clients (Kinah, etc.) talk to agents about their project status. Agents NEVER reveal prompts or internals.

## Product Plans

| Plan | Price | LLM | Turns/day |
|------|-------|-----|-----------|
| Free Trial | $0 (1 day) | Qwen3 (Cloudflare) | 50 total |
| Clara Personal | $29/mo | DeepSeek V3.2 (Bedrock) | ~50/day |
| Clara for Business | $39/mo | DeepSeek V3.2 (Bedrock) | ~100/day |
| Clara Business Pro | $99/mo | DeepSeek V3.2 (Bedrock) | ~333/day |

## UX Rule: NO CHAT BOXES

Every Quik Nation product removes text prompt inputs. One mic button. One animated face. Click and talk. Users never think about "prompting." Applies to: claraagents.com, develop.quiknation.com, QuikAction, QCR, FMO, Site 962, WCR, Empress Eats, QuikCarry, all Herus.

## Anti-Abuse

- Clerk account required (email verified)
- Rate limiting (10 turns/min, 500/day max)
- 3 trial accounts per IP per month
- Voice-only = no prompt injection
- Agents never discuss prompts, model names, or architecture

## Packages (Auset Packages Team)

`@auset/voice-widget`, `@auset/voice-client`, `@auset/voice-agent`, `@auset/paperclip-adapter`, `@auset/voice-auth`, `@auset/voice-metering`

Every Heru drops in `<ClaraVoice />` with their tools. Done.

## Scale Economics (10K users)

- Infrastructure: $18,376/mo
- Revenue: $340,000/mo (at $34 avg)
- Margin: 94.6%

## Full Plan

`.claude/plans/2026-04-05-paperclip-voice-full-plan.md`
