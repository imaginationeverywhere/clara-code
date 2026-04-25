---
type: decision
date: 2026-04-05
topic: DeepSeek V3.2 as Primary LLM for Agent Harness (Replacing Qwen3 / Haiku)
status: SUPERSEDED 2026-04-25
priority: critical
supersededBy: decision-canonical-stack-supersedes-deepseek-primary-2026-04-25.md
tags: [llm, deepseek, bedrock, pricing, agent-harness, voice, business-model, superseded]
---

> **SUPERSEDED 2026-04-25** — This 2026-04-05 decision named DeepSeek V3.2 as the **primary** LLM for the agent harness. On 2026-04-25, with self-hosted Voxtral live on Modal A10G and Gemma 4 27B batched inference on Modal A100 proven in production, the canonical default routing changed to:
>
> - **Default (~80%):** Gemma 4 27B self-hosted on Modal A100
> - **Reasoning (~10-15%):** Kimi K2 self-hosted on Modal H100
> - **Heavy / long-context (~3-5%):** DeepSeek V3 on AWS Bedrock
> - **Premium (<1%):** Claude / GPT via Bedrock — Enterprise default or explicit user opt-in
>
> DeepSeek V3 remains in the stable but is no longer the primary route. The numeric COGS, margin, and scale tables below reflect the **prior** architecture and should not be quoted as current. See `pricing/model-routing-strategy.md` and `pricing/cogs-and-unit-economics.md` for current truth, and `memory/decision-canonical-stack-supersedes-deepseek-primary-2026-04-25.md` for the supersession record. Original content preserved below for historical reference.

# Decision: DeepSeek V3.2 on AWS Bedrock = Primary LLM for Voice Agents

## The Decision

**Primary LLM:** AWS Bedrock DeepSeek V3.2 ($0.62/M input, $1.85/M output)
**Fallback:** Cloudflare Qwen3-30B ($0.051/M input, $0.34/M output)
**Emergency:** Bedrock Haiku 4.5 ($1.00/M input, $5.00/M output)

## Why DeepSeek V3.2

- Full 685B model, 37B active params per token — 12x more compute than Qwen3-30B (3B active)
- $1.79/mo per user at 50 voice turns/day — charging $29-39/mo = 93-95% margin
- Function calling accuracy 92-95% (vs 87% for smaller models)
- No GPU to manage — fully managed on AWS Bedrock
- Already have AWS infrastructure
- Quality indistinguishable from Opus/GPT-4 for conversational business tasks

## Why NOT Opus/Sonnet/GPT-4 for the Harness

Small businesses and individuals don't need models that can write compilers or prove theorems. They need:
- Understand what the customer said
- Call the right API (book, order, update, send)
- Respond naturally in 2-3 sentences
- Remember context within the conversation

DeepSeek V3.2 does all of this at near-perfect accuracy. Opus/Sonnet/GPT-4 are for Enterprise ($4,000+/mo) and for Mo's own development work (covered by Claude Max + Cursor Ultra subscriptions).

## Cost Per User

| User Type | Turns/day | Turns/mo | LLM Cost/mo |
|-----------|-----------|----------|-------------|
| Casual | 15 | 450 | $0.54 |
| Regular | 50 | 1,500 | $1.79 |
| Power | 120 | 3,600 | $4.30 |
| Heavy | 300 | 9,000 | $10.74 |

## Scale Economics

| Users | LLM Cost/mo | Revenue at $29/mo | Revenue at $35/mo | Margin |
|-------|------------|-------------------|-------------------|--------|
| 1,000 | $1,790 | $29,000 | $35,000 | 93-95% |
| 2,500 | $4,475 | $72,500 | $87,500 | 93-95% |
| 5,000 | $8,950 | $145,000 | $175,000 | 93-95% |
| 10,000 | $17,900 | $290,000 | $350,000 | 93-95% |

## Customer-Facing Tier Mapping

| Tier Name | Internal Model | Price/mo | LLM cost/user | Margin | Who |
|-----------|---------------|----------|---------------|--------|-----|
| Fast Thinking | Qwen3-30B (Cloudflare) | $29 | $0.17 | 99.4% | Budget users, simple tasks |
| Balanced Thinking | DeepSeek V3.2 (Bedrock) | $39 | $1.79 | 95.4% | SMBs, salons, restaurants |
| Deep Thinking | Haiku 4.5 (Bedrock) | $59 | $3.12 | 94.7% | Agencies, power users |
| Deepest | User's Claude/Cursor sub | $29 plugin | $0 to us | 100% | Developers (they pay Anthropic) |
| Enterprise | Mo + Opus (his subs) | $4,000+ | $0 variable | — | Full AI dev team |

Customers never see model names. They see "Fast" / "Balanced" / "Deep" / "Deepest."

## The Moat

Competitors charging $50-100/mo for AI assistants run Sonnet or GPT-4 and eat the margin. We run DeepSeek V3.2 at $1.79/user and charge $29-39. Same quality for the use case. 10x better margins.

## Final Voice Agent Stack

```
Voxtral STT    →  self-hosted on QCS1           = $0/mo
Voxtral TTS    →  self-hosted on QCS1           = $0/mo
Primary LLM    →  Bedrock DeepSeek V3.2         = $1.79/user/mo
Fallback       →  Cloudflare Qwen3-30B          = $0.17/user/mo
Emergency      →  Bedrock Haiku 4.5             = (only if both fail)
Paperclip      →  self-hosted                   = ~$20/mo fixed
```

## Mo's Development Stack (Unchanged)

| Tool | Cost | Purpose |
|------|------|---------|
| Claude Max | ~$200/mo flat | /gran, /mary, /council, /tech-team, all architecture |
| Cursor Ultra | ~$200/mo flat | All coding agents on QCS1 |

All development tickets still come to Mo. He is the only human developer.

## Related Decisions
- [Mistral Voxtral Voice Engine](decision-mistral-voxtral-voice-engine-2026-04-05.md)
- [Independent Agent Harness Architecture](decision-independent-agent-harness-2026-04-05.md)
- [LLM Cost Analysis](reference-llm-self-hosting-cost-analysis-2026-04-05.md)
