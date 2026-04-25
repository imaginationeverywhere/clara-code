# Model Routing Strategy — How Hermes Picks the Right Model

> **INTERNAL ONLY.** This is the routing logic inside the Hermes harness that decides which LLM handles each user request. The strategy is what makes generous tier hour pools at $29-$59/mo economically possible.

**Authoritative for:** which model serves what, when we use self-hosted vs Bedrock vs premium, per-model COGS, and the invisible fallback chain.

---

## The Core Idea

Clara Code users never see model names. The Hermes harness picks the right model per request based on:
1. **Task complexity** (simple code vs deep reasoning)
2. **Tier** (Business/Enterprise get premium routing priority)
3. **Cost envelope** (default to cheapest sufficient model)
4. **Availability** (fallback if a model is warming up or rate-limited)

This routing is **the moat**. We sell "Clara" as a single coherent intelligence. Underneath, she's a router that picks from a stable of models to deliver the best answer at the lowest cost.

---

## The Model Stable

### Primary — Gemma 4 27B (Self-Hosted on Modal)

- **License:** Apache 2.0 (Google) — zero licensing cost
- **Hardware:** Modal A100 80GB GPU, ~$4.46/hr raw, amortized across users
- **Strengths:** fast, capable at routine coding tasks, strong for frontend/backend scaffolding, good at following instructions
- **Use for:** ~80% of requests. Default.
- **Effective COGS:** ~$0.015-0.025/request (amortized across many concurrent users)

### Reasoning — Kimi K2 (Self-Hosted on Modal)

- **License:** Open-weight (Moonshot)
- **Hardware:** Modal H100 80GB, ~$7.15/hr raw
- **Strengths:** longer chain-of-thought, better at architectural/design decisions, handles ambiguous requirements
- **Use for:** ~10-15% of requests — anything needing multi-step reasoning
- **Effective COGS:** ~$0.03-0.05/request

### Heavy — DeepSeek V3 (AWS Bedrock)

- **License:** Pay-per-token via Bedrock
- **Pricing:** ~$0.27/M input, ~$1.10/M output
- **Strengths:** top-tier coding, best-in-class open-weight reasoning
- **Use for:** ~3-5% of requests — hard bugs, complex refactors, research tasks
- **Effective COGS:** ~$0.003-0.015/request (few tokens, heavy lifting)

### Premium — Claude/GPT via Bedrock (Gate Opt-in)

- **License:** Pay-per-token, premium rates
- **Pricing:** ~$3-15/M tokens
- **Strengths:** absolute frontier capability
- **Use for:** <1% of requests. Enterprise tier, or explicit user opt-in ("give me your best answer")
- **Effective COGS:** ~$0.05-0.20/request

### User's Own (Deepest Plugin)

- **License:** User's own Claude Code or ChatGPT subscription
- **Pricing:** User pays the LLM provider directly
- **Use for:** Users with existing AI subscriptions who want to plug their own inference in
- **Effective COGS:** **$0** — they pay Anthropic/OpenAI

---

## The Routing Decision Tree

```typescript
async function routeRequest(params: {
  userId: string;
  tier: PlanTier;
  taskType: "code_gen" | "reasoning" | "voice_convo" | "research" | "debug";
  inputTokenEstimate: number;
  userHasDeepestPlugin: boolean;
  explicitPremium?: boolean;
}): Promise<ModelChoice> {
  const { tier, taskType, inputTokenEstimate, userHasDeepestPlugin, explicitPremium } = params;

  // 1. User's own inference via Deepest plugin — always preferred if available
  if (userHasDeepestPlugin) {
    return { model: "user_deepest", cost: 0 };
  }

  // 2. Explicit premium request ("Clara, give me your best") — user opt-in, Wallet-debited
  if (explicitPremium) {
    return { model: "bedrock_premium", cost: "wallet" };
  }

  // 3. Enterprise tier — default to premium routing
  if (tier === "enterprise") {
    return { model: taskType === "reasoning" ? "bedrock_premium" : "deepseek_bedrock" };
  }

  // 4. Heavy reasoning / debug / research — use DeepSeek on Bedrock
  if (taskType === "reasoning" || taskType === "research" || taskType === "debug") {
    if (inputTokenEstimate > 20000) {
      return { model: "deepseek_bedrock" };   // long context = Bedrock wins
    }
    return { model: "kimi_self_hosted" };      // short context reasoning = Kimi
  }

  // 5. Voice conversation — Gemma is fast and low-latency
  if (taskType === "voice_convo") {
    return { model: "gemma_self_hosted" };
  }

  // 6. Default: Gemma 4 handles it
  return { model: "gemma_self_hosted" };
}
```

---

## Fallback Chain (Availability)

If a primary model is cold/rate-limited/down:

```
Gemma self-hosted  ──fallback──► Kimi self-hosted  ──fallback──► DeepSeek Bedrock
                                                                     │
                                                                     ▼
                                                             (always available)

Bedrock DeepSeek   ──fallback──► Gemma self-hosted  (if Bedrock slow)
```

Users never see failover — Hermes silently routes to the next-best option within a 3-second SLA.

---

## Cost Blend by Tier

Based on actual routing distribution we expect per tier:

| Tier | % Gemma | % Kimi | % DeepSeek | % Premium | Blended $/hr |
|------|---------|--------|-----------|-----------|--------------|
| Basic | 92% | 7% | 1% | 0% | $0.04/hr |
| Pro | 88% | 10% | 2% | 0% | $0.05/hr |
| Max | 80% | 14% | 5% | 1% | $0.07/hr |
| Business | 70% | 20% | 8% | 2% | $0.12/hr |
| Enterprise | 40% | 30% | 20% | 10% | $0.45/hr |

**Enterprise gets premium routing**, which is why their price jumps to $4k+. They're opting in to the high-cost stack.

---

## The Caching Layer (Hidden Savings)

Every request hashes (agent SOUL + recent conversation + user message) → cache key. If hit, return cached response with cost = $0.

- **Hit rate**: 20-30% in production
- **Cache TTL**: 60-90 minutes
- **Savings**: ~25% off gross COGS

Users never know. They just get faster responses sometimes.

---

## Why This Works Economically

**At $39/mo Basic tier:**
- Typical usage: 40 active hrs/mo × $0.04/hr = $1.60 COGS
- Heavy usage: 120 hrs × $0.04 = $4.80 COGS
- Review-trigger usage: 300 hrs × $0.04 = $12 COGS (still 69% GM, still profitable)

**Compare to API passthrough model** (Anthropic/OpenAI direct):
- Claude Sonnet $3/M input + $15/M output
- Typical hour: ~50 requests × 5k input + 1k output = $0.75 + $0.75 = $1.50/hr
- 40 hrs × $1.50 = $60 COGS on $39 plan = **-54% GM** (bankrupt)

The difference is ~37×. That's the whole game.

---

## Implementation Pointers

- **`prompts/.../18-model-routing-pipeline.md`** — the code that routes Gemma → Kimi → DeepSeek → Premium
- **Hermes harness** — the gateway that talks to Modal (Gemma/Kimi) and Bedrock (DeepSeek/Premium)
- **Cache layer** — Redis-backed response cache keyed by SOUL + context + message hash

---

## Related Files

- **`pricing/cogs-and-unit-economics.md`** — tier margin math this strategy enables
- **`pricing/customer-facing-page.md`** — the generous tier hour pool story this makes possible
- **`pricing/voice-tiers.md`** — the self-hosted voice stack (separate from LLM routing)
- **`pricing/thinking-tiers.md`** — legacy file (thinking tiers are no longer customer-facing; keep for historical reference)
