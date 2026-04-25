# COGS & Unit Economics — Clara Code (Open-Model Routing Edition)

> **INTERNAL ONLY.** This file contains cost-of-goods-sold breakdowns, tier margin math, and the formulas the metering pipeline enforces. Never expose these numbers in customer-facing UI, marketing, or reseller docs.

**Authoritative source for:** per-unit compute costs, per-tier margin targets, the `cogs_usd` counter in the usage pipeline, abuse-protection hard caps.

---

## Why Our COGS Is Radically Lower Than Competitors

Clara Code runs on self-hosted open-weight models on Modal GPUs + Bedrock DeepSeek for tough reasoning. Because we own the harness (Hermes) and serve most inference from open models, our per-hour COGS is ~10× lower than an API-first stack (OpenAI/Anthropic passthrough).

### The Routing Stack

| Priority | Model | Why | COGS |
|----------|-------|-----|------|
| 1 (default) | **Gemma 4 27B** self-hosted on Modal A100 | Fast, capable, Apache 2.0, zero licensing | ~$0.005/active-hour (amortized) |
| 2 (complex) | **Kimi K2** self-hosted on Modal H100 | Stronger reasoning, open weights | ~$0.015/active-hour |
| 3 (heavy reasoning) | **DeepSeek V3** on AWS Bedrock | Best $/token for serious tasks | ~$0.27/M input, ~$1.10/M output |
| 4 (fallback premium) | **Claude / GPT-5** via Bedrock | Only when user explicitly needs the absolute best | ~$3-15/M tokens |

**90%+ of requests route to Gemma/Kimi (self-hosted, nearly free).**
**5-10% route to DeepSeek** for heavy reasoning.
**<1% route to premium closed models** (Enterprise only, or explicit user opt-in).

### Voice Stack (all self-hosted)

| Layer | Platform | COGS |
|-------|----------|------|
| STT | Whisper on Modal A10G | $0.0003/GPU-second |
| TTS | XTTS on Modal A10G (open-source Coqui, supports voice cloning at scale) | $0.0003/GPU-second |
| Gateway | Hermes on Modal | ~$0.0003/GPU-second |
| Transport | LiveKit Cloud (optional, production only) | $0.02/min |

---

## Per-Active-Hour COGS (The Key Number)

A typical "active hour" of vibe-code work:

| Component | Typical Usage | COGS |
|-----------|---------------|------|
| Gemma 4 routing (default) | ~30-60 requests/hr at ~1s GPU each | $0.015-0.030 |
| Kimi K2 routing (complex tasks) | ~3-5 requests/hr at ~3s GPU each | $0.005-0.010 |
| Bedrock DeepSeek (heavy reasoning) | ~1-3 requests/hr at ~2k output tokens each | $0.010-0.030 |
| Whisper STT (if voice used) | ~30s GPU time/hr of voice usage | $0.010-0.015 |
| XTTS TTS (if voice used) | ~60s GPU time/hr of voice usage | $0.020-0.030 |
| Modal fixed overhead | Autoscaled baseline | $0.005 |
| **Typical total per active hour** | | **~$0.04-0.12** |

**Conservative baseline for modeling: $0.05/active hour.**

---

## Per-Tier Unit Economics (The New Canonical)

### Tier Structure

| Tier | Price | Harness Agents | Build New Agents / mo | Eject / mo | Weekly/Monthly Caps | Visible to User |
|------|-------|----------------|------------------------|------------|---------------------|-----------------|
| Basic | $39 | 3 | 1 | 1 | None | Generous pool |
| Pro | $69 | 6 | 3 | 3 | None | Generous pool |
| Max | $99 | 9 | 6 | 6 | None | Generous pool |
| Business | $299 | 24 | 12 | 12 | None | Generous pool |
| Enterprise | $4,000+ | 350 | Custom | Custom | Per contract | Per contract |

**Per-invocation pricing for built agents is deferred to Phase 4** (public Clara Code launch). Current internal deployment (Phase 1-2) collects real usage data across the Heru portfolio to calibrate floor prices before public launch.

### COGS at Typical Usage (40 hrs/mo — average developer)

| Tier | Price | Hrs @ $0.05 | Voice COGS | Fixed | Stripe | **Gross Margin** |
|------|-------|-------------|------------|-------|--------|------------------|
| Basic $39 | $39 | $2.00 | $1.50 | $1.80 | $1.43 | **82%** 🟢 |
| Pro $69 | $69 | $4.00 | $3.00 | $1.80 | $2.30 | **85%** 🟢 |
| Max $99 | $99 | $6.00 | $4.50 | $1.80 | $3.17 | **84%** 🟢 |
| Business $299 | $299 | $15.00 | $12.00 | $5.00 | $8.97 | **86%** 🟢 |

**Healthy 80%+ margins across the board at typical usage.**

### COGS at Heavy Usage (120 hrs/mo — vibe coding full-time)

| Tier | Price | Hrs @ $0.05 | Voice COGS | Fixed | Stripe | **Gross Margin** |
|------|-------|-------------|------------|-------|--------|------------------|
| Basic $39 | $39 | $6.00 | $4.50 | $1.80 | $1.43 | **65%** 🟢 |
| Pro $69 | $69 | $10.00 | $7.50 | $1.80 | $2.30 | **69%** 🟢 |
| Max $99 | $99 | $14.00 | $10.50 | $1.80 | $3.17 | **70%** 🟢 |
| Business $299 | $299 | $40.00 | $30.00 | $5.00 | $8.97 | **72%** 🟢 |

**Still healthy at 65%+ even for the heaviest legitimate users.**

### COGS at Abuse Boundary (300 hrs/mo — triggers review)

| Tier | Price | Hrs @ $0.05 | Voice COGS | Fixed | Stripe | **Gross Margin** |
|------|-------|-------------|------------|-------|--------|------------------|
| Basic $39 | $39 | $15.00 | $11.25 | $1.80 | $1.43 | **24%** 🟡 |
| Pro $69 | $69 | $26.00 | $19.50 | $1.80 | $2.30 | **29%** 🟡 |
| Max $99 | $99 | $40.00 | $30.00 | $1.80 | $3.17 | **25%** 🟡 |
| Business $299 | $299 | $100.00 | $75.00 | $5.00 | $8.97 | **37%** 🟡 |

**Margin thins at 300+ hrs but still positive.** This is the abuse-review threshold — accounts here get a support check-in (not blocked).

### Hard COGS Ceiling (Absolute Freeze)

| Tier | Price | Hard COGS Cap | Corresponds To |
|------|-------|----------------|-----------------|
| Basic $39 | $39 | **$30/mo** | ~600 active hrs/mo (20 hrs/day × 30 days) |
| Pro $69 | $69 | **$50/mo** | ~1,000 active hrs/mo |
| Max $99 | $99 | **$75/mo** | ~1,500 active hrs/mo |
| Business $299 | $299 | **$250/mo** | ~5,000 active hrs/mo |
| Enterprise | $4k+ | Flag for review, no auto-freeze | — |

At hard cap, account is paused. Manual support ticket lifts it. This fires for ~0.1% of accounts (bot farms, scrapers, etc.).

---

## Fixed Per-User Costs

| Component | Cost/user/month |
|-----------|-----------------|
| Postgres storage + bandwidth | $0.60 |
| API gateway + CloudFront | $0.50 |
| Monitoring (Sentry, DataDog) | $0.30 |
| Backups + disaster recovery | $0.40 |
| **Fixed subtotal** | **$1.80** |
| Stripe fee | 2.9% of subscription + $0.30 per charge |

---

## The Viability Formula (enforced in code)

```typescript
// Every tier must pass this test at TYPICAL usage (40-60 hrs/mo)
function tierIsViableAtTypical(tier: TierConfig): boolean {
  const typicalHours = 50;
  const hourlyCOGS = 0.05;
  const voiceCOGSRatio = 0.75;   // voice adds ~75% on top of LLM
  const totalCOGS =
    typicalHours * hourlyCOGS * (1 + voiceCOGSRatio) +
    1.80 +
    tier.price * 0.029 + 0.30;

  const grossMargin = (tier.price - totalCOGS) / tier.price;
  return grossMargin >= 0.70;  // typical users must clear 70% GM
}

// Every tier must REMAIN positive-margin at heavy usage
function tierIsViableAtHeavy(tier: TierConfig): boolean {
  const heavyHours = 120;
  const totalCOGS =
    heavyHours * 0.05 * 1.75 +
    1.80 +
    tier.price * 0.029 + 0.30;

  return (tier.price - totalCOGS) / tier.price >= 0.50;  // heavy users still 50%+
}
```

---

## The `cogs_usd` Counter (Redis, Real-Time)

Every paid API call appends to `usage:{userId}:{yyyy-mm}:cogs_usd`. This is the ground-truth abuse protection metric.

```typescript
async function recordCOGS(
  userId: string,
  modelUsed: "gemma" | "kimi" | "deepseek" | "bedrock_premium",
  bedrockInputTokens: number,
  bedrockOutputTokens: number,
  modalComputeSeconds: number,
): Promise<void> {
  const MODEL_TOKEN_COSTS = {
    gemma: 0, kimi: 0,               // self-hosted; cost is in modalComputeSeconds
    deepseek: { in: 0.27e-6, out: 1.10e-6 },
    bedrock_premium: { in: 3e-6, out: 15e-6 },
  };

  const tokenCost = modelUsed in MODEL_TOKEN_COSTS && typeof MODEL_TOKEN_COSTS[modelUsed] === "object"
    ? bedrockInputTokens * MODEL_TOKEN_COSTS[modelUsed].in +
      bedrockOutputTokens * MODEL_TOKEN_COSTS[modelUsed].out
    : 0;

  const modalCost = modalComputeSeconds * 0.0003;
  const totalCOGS = tokenCost + modalCost;

  await redis.hincrbyfloat(
    `usage:${userId}:${monthKey()}`,
    "cogs_usd",
    totalCOGS,
  );
}
```

---

## Abuse-Only Preflight (NOT Visible to User)

```typescript
async function preflightAbuseOnly(userId: string, tier: PlanTier): Promise<{ allowed: boolean }> {
  const monthKey = currentMonthKey();

  // 1. Rate limit: 120 req/min max (anti-bot)
  const minuteReqs = await redis.incr(`rl:${userId}:${currentMinute()}`);
  await redis.expire(`rl:${userId}:${currentMinute()}`, 65);
  if (minuteReqs > 120) return { allowed: false };

  // 2. Review trigger (not a block — flag only)
  const monthHours = parseFloat(await redis.get(`usage:${userId}:${monthKey}:hours`) ?? "0");
  if (monthHours > 300) {
    await flagForReview(userId, { reason: "high_usage", hours: monthHours });
    // still allow — just flag
  }

  // 3. Hard COGS cap (the ONLY auto-block)
  const monthCogs = parseFloat(await redis.get(`usage:${userId}:${monthKey}:cogs_usd`) ?? "0");
  const hardCap = HARD_COGS_CAPS[tier];
  if (monthCogs >= hardCap) return { allowed: false };

  return { allowed: true };
}
```

**That's the whole preflight.** No session caps. No weekly caps. Nothing user-facing.

---

## Related Files

- **`pricing/customer-facing-page.md`** — what users see (tier-based hour pools + configurable agents)
- **`pricing/abuse-protection.md`** — invisible guardrails for the 0.1% case
- **`pricing/model-routing-strategy.md`** — how we choose Gemma/Kimi/DeepSeek per request
- **`pricing/voice-tiers.md`** — self-hosted voice stack
- **`prompts/2026/April/23/1-not-started/11-usage-tracking-and-plan-limits.md`** — implementation prompt
- **`prompts/2026/April/23/1-not-started/18-model-routing-pipeline.md`** — routing implementation
