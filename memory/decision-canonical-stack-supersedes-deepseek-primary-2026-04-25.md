---
type: decision
date: 2026-04-25
topic: Canonical Inference Stack — Gemma 4 on Modal, DeepSeek demoted to heavy-only
status: canonical
priority: critical
supersedes:
  - decision-deepseek-v3-primary-llm-2026-04-05.md
  - .claude/plans/2026-04-05-paperclip-voice-full-plan.md (LLM routing sections)
  - .claude/plans/2026-04-06-hermes-syncthing-integration.md (LLM routing sections)
tags: [llm, gemma, modal, kimi, deepseek, bedrock, routing, canonical]
---

# Decision: Canonical Inference Stack — 2026-04-25

This memory file is the **pointer of record** for Clara's current inference architecture. Any older memory or plan file that names DeepSeek V3.2 as the primary LLM is superseded by this entry.

## Live Source of Truth

- **`pricing/model-routing-strategy.md`** — full routing logic, per-model COGS, fallback chain
- **`pricing/cogs-and-unit-economics.md`** — unit economics under the canonical stack

If anything below diverges from those two files, the pricing files win. They are patched as the architecture evolves; this memory is just the index pointer.

## Canonical Routing (as of 2026-04-25)

| Route | Share | Model | Hosting | Why |
|---|---|---|---|---|
| **Default** | ~80% | Gemma 4 27B | Self-hosted on Modal A100 | Apache 2.0, fast, capable for routine work, amortized COGS |
| **Reasoning** | ~10-15% | Kimi K2 | Self-hosted on Modal H100 | Multi-step CoT, architectural decisions |
| **Heavy / long-context** | ~3-5% | DeepSeek V3 | AWS Bedrock | Hard bugs, complex refactors, large context windows |
| **Premium** | <1% | Claude / GPT | AWS Bedrock | Enterprise default or explicit user opt-in only |
| **User-supplied** | varies | User's Claude/GPT sub | N/A | "Deepest" plugin — $0 to us |

**Voice stack:** Voxtral (Whisper STT + XTTS TTS) on Modal A10G. The voice LLM is **Gemma 4 via the same Hermes router** — voice does not get its own dedicated model.

## What Got Superseded

1. `memory/decision-deepseek-v3-primary-llm-2026-04-05.md` — original "DeepSeek V3.2 primary" decision. Banner added; historical content preserved.
2. `memory/MEMORY.md` — index entries that summarized DeepSeek-as-primary updated inline.
3. `memory/project-clara-code-team-sprint1.md` — sprint references to DeepSeek-as-default updated inline.
4. `.claude/plans/2026-04-05-paperclip-voice-full-plan.md` — supersession header added at top.
5. `.claude/plans/2026-04-06-hermes-syncthing-integration.md` — supersession header added at top.

## Why The Change

Two things flipped the economics between 2026-04-05 and 2026-04-25:

1. **Voxtral self-hosted went live on Modal A10G** — voice STT/TTS COGS dropped to GPU-seconds only, freeing budget that was previously assumed to belong to the LLM line.
2. **Gemma 4 27B batched inference on Modal A100 was proven in production** — the amortized per-request cost beats Bedrock DeepSeek V3 for the ~80% of traffic that's routine work, while quality is sufficient for conversational/coding tasks at Clara's tier ladder.

DeepSeek V3 is still in the stable. It's no longer the default route — it's a high-value tool for the small fraction of requests that actually need it.

## Do Not Edit Old Decisions Without Adding A Pointer Here

If a future architecture change supersedes this entry, add a new dated `decision-*.md` file pointing back, update `pricing/model-routing-strategy.md`, and add a banner at the top of this file. Preserve history; don't rewrite it.
