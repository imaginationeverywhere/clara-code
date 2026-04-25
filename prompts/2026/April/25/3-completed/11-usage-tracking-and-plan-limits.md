# Plan Limits + Invisible Abuse Protection

**TARGET REPO:** imaginationeverywhere/clara-code
**Priority:** P0 — foundation for all paid features
**Packages:** `backend/`
**Milestone:** Clara Code users get UNLIMITED usage as the customer-facing promise. No session caps, no weekly caps, no visible counters. Tiers differ by agent count and capability unlocks ($39=1 agent, $69=3, $99=6, $299=12, Enterprise custom). Three invisible guardrails (rate limit, review trigger, hard COGS cap) protect against abuse for the 0.1% that would exploit it.

**Supersedes:** All prior drafts of this prompt that metered voice exchanges, code-gens, session caps, or weekly hour caps. The canonical model is unlimited-with-abuse-protection. Source of truth: `pricing/customer-facing-page.md`, `pricing/cogs-and-unit-economics.md`, `pricing/abuse-protection.md`.

---

## The Model (canonical)

- **Unlimited usage** visible to all users. No counters, no caps, no countdowns.
- **Tiers differ by agent count** — $39 (1 agent), $69 (3), $99 (6), $299 (12), Enterprise (custom).
- **Premium voice + custom clones + best AI thinking + unlimited usage at every tier.**
- **Three invisible guardrails**: rate limit (120 req/min), review trigger (300 active hrs/mo → flag for support), hard COGS cap (auto-freeze at abuse boundary).

## Tier Structure (canonical)

| Tier | Price | Harness Agents | Skills/agent | Built Agents / mo | Ejections / mo | Marketplace | Hard COGS Cap |
|------|-------|----------------|--------------|-------------------|-----------------|-------------|----------------|
| Basic | $39 | 3 | 5 | 1 | 1 | — | $30/mo |
| Pro | $69 | 6 | 7 | 3 | 3 | — | $50/mo |
| Max | $99 | 9 | 10 | 6 | 6 | list only | $75/mo |
| Business | $299 | 24 | 15 | 12 | 12 | publish + sell | $250/mo |
| Enterprise | $4k+ | 350 | Custom | Custom (per contract) | Custom (per contract) | white-label | Flag only, no freeze |

---

## Part 1 — Migration

**File:** `backend/migrations/011_plan_limits_and_abuse_tracking.sql`

```sql
-- Tier assignment + persistent usage state (Redis is primary; this is write-through backup + audit).
-- Run: psql $DATABASE_URL -f backend/migrations/011_plan_limits_and_abuse_tracking.sql

CREATE TABLE IF NOT EXISTS user_usage (
  user_id              VARCHAR(255) PRIMARY KEY,
  tier                 VARCHAR(50)  NOT NULL DEFAULT 'basic',
  month_key            VARCHAR(10)  NOT NULL,               -- YYYY-MM
  active_hours         NUMERIC(10,2) NOT NULL DEFAULT 0,
  cogs_usd             NUMERIC(10,4) NOT NULL DEFAULT 0,
  is_flagged           BOOLEAN      NOT NULL DEFAULT FALSE,  -- Layer 2 triggered
  is_frozen            BOOLEAN      NOT NULL DEFAULT FALSE,  -- Layer 3 triggered
  flagged_at           TIMESTAMPTZ,
  frozen_at            TIMESTAMPTZ,
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_usage_tier ON user_usage (tier);
CREATE INDEX IF NOT EXISTS idx_user_usage_flagged ON user_usage (is_flagged) WHERE is_flagged = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_usage_frozen ON user_usage (is_frozen) WHERE is_frozen = TRUE;

-- Immutable log. Every paid API call gets a row. Drives COGS attribution + abuse reviews.
CREATE TABLE IF NOT EXISTS usage_events (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              VARCHAR(255)  NOT NULL,
  agent_id             VARCHAR(255),
  model_used           VARCHAR(50)   NOT NULL,              -- gemma / kimi / deepseek / premium
  task_type            VARCHAR(50),
  bedrock_input_tokens INTEGER       NOT NULL DEFAULT 0,
  bedrock_output_tokens INTEGER      NOT NULL DEFAULT 0,
  modal_compute_seconds NUMERIC(8,3) NOT NULL DEFAULT 0,
  cogs_usd             NUMERIC(10,6) NOT NULL DEFAULT 0,
  cache_hit            BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_events_user_month
  ON usage_events (user_id, created_at DESC);
```

Run against all three environments (local, develop, production).

---

## Part 2 — PLAN_LIMITS

**File:** `backend/src/services/plan-limits.ts`

```typescript
export type PlanTier = "basic" | "pro" | "max" | "business" | "enterprise";
export type MarketplaceTier = "none" | "list" | "publish" | "publish_white_label";
export type MemoryScope = "personal_vault" | "team_vault" | "federated";

export interface PlanConfig {
  price: number;
  configurableAgents: number | null;  // null = custom (Enterprise)
  skillsPerAgent: number | null;      // null = unlimited
  canBuildAgents: boolean;
  runtimeAgentBuildsPerMonth: number | null;
  marketplaceTier: MarketplaceTier;
  memoryScope: MemoryScope;
  monthlyCogsHardCap: number | null;  // null = no auto-freeze
}

export const PLAN_LIMITS: Record<PlanTier, PlanConfig> = {
  basic: {
    price: 39, configurableAgents: 1, skillsPerAgent: 5,
    canBuildAgents: false, runtimeAgentBuildsPerMonth: 0,
    marketplaceTier: "none", memoryScope: "personal_vault",
    monthlyCogsHardCap: 30,
  },
  pro: {
    price: 69, configurableAgents: 3, skillsPerAgent: 7,
    canBuildAgents: false, runtimeAgentBuildsPerMonth: 0,
    marketplaceTier: "none", memoryScope: "personal_vault",
    monthlyCogsHardCap: 50,
  },
  max: {
    price: 99, configurableAgents: 6, skillsPerAgent: 10,
    canBuildAgents: false, runtimeAgentBuildsPerMonth: 0,
    marketplaceTier: "list", memoryScope: "personal_vault",
    monthlyCogsHardCap: 75,
  },
  business: {
    price: 299, configurableAgents: 12, skillsPerAgent: 15,
    canBuildAgents: true, runtimeAgentBuildsPerMonth: null,
    marketplaceTier: "publish", memoryScope: "team_vault",
    monthlyCogsHardCap: 250,
  },
  enterprise: {
    price: 4000, configurableAgents: null, skillsPerAgent: null,
    canBuildAgents: true, runtimeAgentBuildsPerMonth: null,
    marketplaceTier: "publish_white_label", memoryScope: "federated",
    monthlyCogsHardCap: null,
  },
};

/** Universal inclusions at EVERY paid tier — never tiered. */
export const UNIVERSAL_INCLUSIONS = {
  unlimitedUsage: true,
  premiumVoice: true,
  customVoiceCloning: true,
  aiThinkingQuality: "best" as const,
} as const;

/** Rate limit that applies to ALL tiers — only catches bots. */
export const RATE_LIMIT_PER_MINUTE = 120;

/** Review trigger threshold (hours/month). Flags for support, does NOT block. */
export const REVIEW_TRIGGER_HOURS = 300;
```

---

## Part 3 — Abuse Protection Service

**File:** `backend/src/services/abuse-protection.service.ts`

```typescript
import { DateTime } from "luxon";
import { redis } from "@/lib/redis";
import { UserUsage } from "@/models/UserUsage";
import { UsageEvent } from "@/models/UsageEvent";
import {
  PLAN_LIMITS, RATE_LIMIT_PER_MINUTE, REVIEW_TRIGGER_HOURS,
  type PlanTier,
} from "./plan-limits";
import logger from "@/lib/logger";

export type AbuseCheckResult =
  | { allowed: true }
  | { allowed: false; reason: "rate_limit" | "frozen"; retryAfter?: number };

export class AbuseProtectionService {
  /**
   * Preflight — the ONLY check that runs before paid API calls.
   * Users never see these unless they are the 0.1% abuser case.
   */
  async preflight(userId: string, tier: PlanTier): Promise<AbuseCheckResult> {
    // Layer 1: rate limit (anti-bot)
    const minuteKey = DateTime.utc().toFormat("yyyyLLddHHmm");
    const minuteCount = await redis.incr(`rl:${userId}:${minuteKey}`);
    if (minuteCount === 1) {
      await redis.expire(`rl:${userId}:${minuteKey}`, 65);
    }
    if (minuteCount > RATE_LIMIT_PER_MINUTE) {
      return { allowed: false, reason: "rate_limit", retryAfter: 60 };
    }

    // Layer 3: hard COGS cap (auto-freeze)
    const limits = PLAN_LIMITS[tier];
    if (limits.monthlyCogsHardCap !== null) {
      const monthKey = DateTime.utc().toFormat("yyyyLL");
      const monthCogs = parseFloat(
        (await redis.get(`usage:${userId}:${monthKey}:cogs_usd`)) ?? "0",
      );
      if (monthCogs >= limits.monthlyCogsHardCap) {
        await this.freezeAccount(userId, monthCogs, limits.monthlyCogsHardCap);
        return { allowed: false, reason: "frozen" };
      }
    }

    return { allowed: true };
  }

  /**
   * Record COGS + active time + token counts. Triggers Layer 2 review flag if applicable.
   * Called from post-call middleware.
   */
  async recordUsage(params: {
    userId: string;
    agentId?: string;
    modelUsed: "gemma" | "kimi" | "deepseek" | "premium";
    taskType?: string;
    bedrockInputTokens: number;
    bedrockOutputTokens: number;
    modalComputeSeconds: number;
    cacheHit: boolean;
  }): Promise<void> {
    const { userId, agentId, modelUsed, taskType,
            bedrockInputTokens, bedrockOutputTokens, modalComputeSeconds, cacheHit } = params;

    const cogsUsd = cacheHit ? 0 : this.computeCOGS(modelUsed, bedrockInputTokens, bedrockOutputTokens, modalComputeSeconds);

    const nowHourKey = DateTime.utc().toFormat("yyyyLLddHH");
    const monthKey = DateTime.utc().toFormat("yyyyLL");

    // Active hour tracking — only increment hours when user crosses into a new clock hour
    const isNewHour = await redis.set(
      `usage:${userId}:hour:${nowHourKey}`,
      "1",
      "EX",
      3700,
      "NX",
    );

    const ops: Promise<unknown>[] = [
      redis.incrbyfloat(`usage:${userId}:${monthKey}:cogs_usd`, cogsUsd),
      redis.expire(`usage:${userId}:${monthKey}:cogs_usd`, 35 * 24 * 3600),
    ];

    if (isNewHour === "OK") {
      ops.push(
        redis.hincrbyfloat(`usage:${userId}:${monthKey}:stats`, "hours", 1),
        redis.expire(`usage:${userId}:${monthKey}:stats`, 35 * 24 * 3600),
      );
    }

    await Promise.all(ops);

    // Layer 2: review trigger (flag, don't block)
    const monthlyHours = parseFloat(
      (await redis.hget(`usage:${userId}:${monthKey}:stats`, "hours")) ?? "0",
    );
    if (monthlyHours > REVIEW_TRIGGER_HOURS) {
      await this.flagForReview(userId, monthlyHours);
    }

    // Persist event row (fire-and-forget)
    UsageEvent.create({
      userId, agentId, modelUsed, taskType,
      bedrockInputTokens, bedrockOutputTokens, modalComputeSeconds, cogsUsd, cacheHit,
    }).catch((err) => logger.warn("usage_event persist failed", { err }));
  }

  private computeCOGS(
    model: "gemma" | "kimi" | "deepseek" | "premium",
    inputTokens: number,
    outputTokens: number,
    modalSeconds: number,
  ): number {
    const modalCost = modalSeconds * 0.0003;
    let tokenCost = 0;
    if (model === "deepseek") {
      tokenCost = (inputTokens / 1_000_000) * 0.27 + (outputTokens / 1_000_000) * 1.10;
    } else if (model === "premium") {
      tokenCost = (inputTokens / 1_000_000) * 3 + (outputTokens / 1_000_000) * 15;
    }
    // gemma / kimi are self-hosted — cost is in modalSeconds only
    return tokenCost + modalCost;
  }

  private async flagForReview(userId: string, hours: number): Promise<void> {
    const already = await redis.exists(`flagged:${userId}`);
    if (already) return;

    await redis.set(`flagged:${userId}`, "1", "EX", 32 * 24 * 3600);
    await UserUsage.update(
      { isFlagged: true, flaggedAt: new Date() },
      { where: { userId } },
    );

    logger.warn("abuse_review_triggered", { userId, hours });
    // Out-of-band: send email to ops team + friendly email to user
  }

  private async freezeAccount(userId: string, currentCogs: number, cap: number): Promise<void> {
    const already = await redis.exists(`frozen:${userId}`);
    if (already) return;

    await redis.set(`frozen:${userId}`, "1");
    await UserUsage.update(
      { isFrozen: true, frozenAt: new Date() },
      { where: { userId } },
    );

    logger.error("account_frozen_cogs_cap", { userId, currentCogs, cap });
    // Out-of-band: send "please contact support" email + page on-call
  }
}

export const abuseProtectionService = new AbuseProtectionService();
```

---

## Part 4 — Middleware

**File:** `backend/src/middleware/abuse-protection.ts`

```typescript
import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import { abuseProtectionService } from "@/services/abuse-protection.service";

export async function requireAbuseCheck(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const userId = req.claraUser?.userId;
  const tier = req.claraUser?.tier ?? "basic";

  if (!userId) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const result = await abuseProtectionService.preflight(userId, tier);

  if (!result.allowed) {
    if (result.reason === "rate_limit") {
      res.status(429).json({
        error: "rate_limit",
        message: "Slow down — Clara's catching her breath.",
        retry_after: result.retryAfter,
      });
    } else {
      // "frozen"
      res.status(403).json({
        error: "account_review",
        message: "We've paused your account due to unusually high usage. Please contact support.",
        support_url: "https://claracode.ai/support",
      });
    }
    return;
  }

  next();
}
```

Apply `requireAbuseCheck` before every paid route — voice `/converse`, `/tts`, `/speak`, `/greet`, and all code-gen routes.

---

## Part 5 — Post-Call Recording

In each paid route handler, after the model call completes:

```typescript
router.post("/converse", requireClaraOrClerk, requireAbuseCheck, voiceLimiter, async (req, res) => {
  // ... inference call to Hermes, capturing:
  //   - modelUsed (from Hermes response metadata)
  //   - inputTokens, outputTokens
  //   - modalComputeSeconds
  //   - cacheHit

  await abuseProtectionService.recordUsage({
    userId: req.claraUser.userId,
    agentId: req.body.agent_id,
    modelUsed: inferenceResult.modelUsed,
    taskType: "voice_convo",
    bedrockInputTokens: inferenceResult.inputTokens,
    bedrockOutputTokens: inferenceResult.outputTokens,
    modalComputeSeconds: inferenceResult.modalSeconds,
    cacheHit: inferenceResult.cacheHit,
  });

  res.json(inferenceResult.response);
});
```

---

## Part 6 — Tests

```typescript
describe("AbuseProtectionService", () => {
  describe("preflight", () => {
    it("allows normal requests (no counters tripped)");
    it("blocks at 121 req/min on rate_limit");
    it("blocks with frozen reason when month_cogs_usd >= hard cap");
    it("does not auto-freeze Enterprise (cap is null)");
    it("persists isFrozen=true and frozenAt to user_usage on freeze");
  });

  describe("recordUsage", () => {
    it("records $0 COGS on cache hit");
    it("records Bedrock token COGS for deepseek model");
    it("records Modal GPU COGS for gemma/kimi (no token cost)");
    it("increments month cogs_usd atomically in Redis");
    it("increments month active_hours when crossing to new clock hour");
    it("does NOT double-count active hour within same clock hour");
    it("persists usage_events row with model + tokens + cogs_usd");
  });

  describe("review trigger (Layer 2)", () => {
    it("flags user when monthly active_hours exceeds 300");
    it("does NOT block flagged users — they continue");
    it("does not re-flag already-flagged users");
  });
});

describe("PLAN_LIMITS", () => {
  it("Basic is $39 with 1 configurable agent");
  it("Pro is $69 with 3 agents, canBuildAgents=false");
  it("Max is $99 with 6 agents + marketplaceTier=list");
  it("Business is $299 with 12 agents + canBuildAgents=true + marketplaceTier=publish");
  it("Enterprise has null for configurableAgents, skillsPerAgent, monthlyCogsHardCap");
  it("UNIVERSAL_INCLUSIONS applies to all paid tiers (unlimited, premium voice, custom clones, best AI)");
});
```

---

## Acceptance Criteria

- [ ] `user_usage` + `usage_events` tables in all three environments
- [ ] `PLAN_LIMITS` matches canonical pricing ($39/$69/$99/$299/$4k+)
- [ ] `configurableAgents` field drives agent configurator at signup (1/3/6/12/custom)
- [ ] `requireAbuseCheck` middleware on every paid voice + code-gen route
- [ ] Preflight blocks ONLY on rate_limit (429) or frozen (403). Never session-cap, never weekly-cap.
- [ ] Post-call `recordUsage` correctly attributes COGS by model (gemma/kimi=0 tokens, deepseek=Bedrock rate, premium=Claude rate)
- [ ] Active hours counter only increments once per clock hour per user
- [ ] Review trigger fires at >300 active hours/mo and flags but does NOT block
- [ ] Hard COGS cap fires per-tier (Basic=$30, Pro=$50, Max=$75, Business=$250); Enterprise flags only
- [ ] No customer-facing counters or usage UI elements (verified in frontend)
- [ ] `npm run type-check` passes
- [ ] All tests pass
- [ ] CI thin-client gate passes

## Branch + PR

```bash
git checkout -b prompt/2026-04-23/11-plan-limits-and-abuse-protection
git commit -m "feat(usage): unlimited usage model — invisible abuse protection only, no user-facing caps"
gh pr create --base develop --title "feat(usage): plan limits + invisible abuse protection (unlimited usage model)"
```
