# Thinking Tiers

Pick how deep Clara thinks. Upgrade or downgrade anytime. Independent of voice tier.

## Tiers

| Tier | Model | Speed | Our Cost/mo | Use Case |
|------|-------|-------|-------------|----------|
| **Fast** | Bedrock Haiku | < 1s | ~$3-5 | Calendar, bookings, quick answers, simple tasks |
| **Balanced** | Bedrock Sonnet | 1-3s | ~$8-12 | Business analysis, content creation, moderate reasoning |
| **Deep** | Bedrock Opus | 3-8s | ~$25-35 | Research, architecture, complex strategy, deep analysis |
| **Deepest** | User's Claude Code subscription | Varies | $0 to us | Full Opus power via user's own subscription. Clara plugin adds vault + identity + voice on top. |

## Included Interactions

| Tier | Included interactions/mo | Overage rate |
|------|------------------------|--------------|
| Fast | 5,000 interactions | $0.002/interaction |
| Balanced | 2,000 interactions | $0.01/interaction |
| Deep | 500 interactions | $0.05/interaction |
| Deepest | Unlimited (user pays Anthropic directly) | N/A |

## Per-Request Upsell

Users on any tier can request a single higher-tier response without upgrading their plan:

| Request | Price to User | Our Cost | Margin |
|---------|--------------|----------|--------|
| Balanced single request | $0.50 | ~$0.05-0.10 | 90% |
| Deep single request | $2.00 | ~$0.15-0.30 | 85% |

Agent detects when deeper thinking is needed, quotes the price, user approves via wallet.

## Claude Code Plugin (Deepest Tier)

Users who have their own Claude Code subscription can add Clara as a plugin:
- Clara brings: agent identity, user vault, context, tools, voice
- Claude Code brings: Opus-level inference (user's own subscription)
- **Cost to us: $0 for LLM** — the customer already pays Anthropic
- Clara adds VALUE on top of Claude Code, doesn't replace it

## Terminology

- The model is NOT the "brain" — it's the "thinking"
- Clara IS the brain (vault, identity, memory, context)
- Fast/Balanced/Deep are effort levels, not intelligence levels
- Customer sees: "Fast Thinking" / "Balanced Thinking" / "Deep Thinking"
- Customer NEVER sees model names (Haiku, Sonnet, Opus) — those are internal
