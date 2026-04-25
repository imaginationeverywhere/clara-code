# Model Routing Pipeline — Gemma → Kimi → DeepSeek → Premium

**TARGET REPO:** imaginationeverywhere/clara-code
**Priority:** P0 — required for unlimited-usage economics to work
**Packages:** `backend/`
**Milestone:** Every paid Clara Code request routes through the Hermes harness to the cheapest model that can handle it. 90%+ of requests land on self-hosted Gemma 3 27B or Kimi K2 on Modal (zero token cost). Complex reasoning routes to DeepSeek on Bedrock. Enterprise + explicit opt-in routes to premium closed models. Fallback chain handles cold-start and rate-limit cases transparently.

Source of truth: `pricing/model-routing-strategy.md` and `pricing/cogs-and-unit-economics.md`.

---

## Why This Prompt Exists

Without smart routing, "unlimited usage on $39/mo" is bankrupt (COGS 1.5× revenue). With smart routing, it's 80%+ gross margin. This prompt is what makes the pricing model economically real.

---

## The Routing Stack

| Priority | Model | Hosted On | Use Case | Cost |
|----------|-------|-----------|----------|------|
| 1 (default) | Gemma 3 27B | Modal A100 (self) | 80% of requests — code gen, voice convo, simple tasks | $0.015-0.025/req |
| 2 (reasoning) | Kimi K2 | Modal H100 (self) | 10-15% of requests — multi-step reasoning, architecture | $0.03-0.05/req |
| 3 (heavy) | DeepSeek V3 | AWS Bedrock | 3-5% of requests — hard bugs, research, large context | $0.003-0.015/req |
| 4 (premium) | Claude / GPT | Bedrock | <1% — Enterprise or explicit opt-in | $0.05-0.20/req |
| 0 (plugin) | User's Claude Code | User's own sub | Deepest plugin users | $0 to us |

---

## Part 1 — Route Classifier

**File:** `backend/src/services/model-router.service.ts`

```typescript
import type { PlanTier } from "./plan-limits";

export type ModelChoice =
  | "user_deepest"      // user's own Claude Code plugin
  | "gemma_27b"         // self-hosted on Modal A100
  | "kimi_k2"           // self-hosted on Modal H100
  | "deepseek_v3"       // Bedrock
  | "bedrock_premium";  // Claude / GPT via Bedrock

export type TaskType =
  | "voice_convo"
  | "code_gen"
  | "code_review"
  | "reasoning"
  | "debug"
  | "research"
  | "agent_build";

export interface RoutingContext {
  userId: string;
  tier: PlanTier;
  taskType: TaskType;
  inputTokenEstimate: number;
  userHasDeepestPlugin: boolean;
  explicitPremiumRequest: boolean;  // user said "give me your best"
  priorModel?: ModelChoice;          // for fallback routing
}

export class ModelRouterService {
  /**
   * Choose the cheapest sufficient model for this request.
   * Called before every Hermes inference call.
   */
  selectModel(ctx: RoutingContext): ModelChoice {
    // 0. User's own Claude Code plugin wins always (zero cost to us)
    if (ctx.userHasDeepestPlugin) return "user_deepest";

    // Premium path — Enterprise or explicit opt-in
    if (ctx.explicitPremiumRequest) return "bedrock_premium";
    if (ctx.tier === "enterprise") {
      return ctx.taskType === "reasoning" || ctx.taskType === "debug"
        ? "bedrock_premium"
        : "deepseek_v3";
    }

    // Heavy reasoning / large context → DeepSeek on Bedrock
    if (ctx.taskType === "reasoning" || ctx.taskType === "research" || ctx.taskType === "debug") {
      return ctx.inputTokenEstimate > 20_000 ? "deepseek_v3" : "kimi_k2";
    }

    // Agent build is heavy — use Kimi
    if (ctx.taskType === "agent_build") return "kimi_k2";

    // Voice conversation → Gemma (fast, low latency)
    if (ctx.taskType === "voice_convo") return "gemma_27b";

    // Code gen / review default → Gemma
    return "gemma_27b";
  }

  /**
   * On primary model failure, pick the next-best model.
   * Users never see this — the swap happens within the 3s SLA.
   */
  selectFallback(ctx: RoutingContext, failed: ModelChoice): ModelChoice | null {
    const chain: ModelChoice[] = [
      "gemma_27b", "kimi_k2", "deepseek_v3", "bedrock_premium",
    ];
    const failedIdx = chain.indexOf(failed);
    if (failedIdx === -1 || failedIdx === chain.length - 1) {
      return null;  // no further fallback
    }
    return chain[failedIdx + 1];
  }
}

export const modelRouter = new ModelRouterService();
```

---

## Part 2 — Hermes Gateway Client

**File:** `backend/src/services/hermes-client.service.ts`

```typescript
import axios, { type AxiosError } from "axios";
import { modelRouter, type ModelChoice, type RoutingContext } from "./model-router.service";
import logger from "@/lib/logger";

const HERMES_URL = process.env.HERMES_GATEWAY_URL!;
const HERMES_API_KEY = process.env.HERMES_API_KEY!;
const HERMES_TIMEOUT_MS = 150_000;   // generous — first cold boot is ~60-120s

export interface HermesRequest {
  model: ModelChoice;
  prompt: string;
  systemPrompt?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  maxTokens?: number;
  temperature?: number;
}

export interface HermesResponse {
  text: string;
  modelUsed: ModelChoice;
  inputTokens: number;
  outputTokens: number;
  modalComputeSeconds: number;
  cacheHit: boolean;
  latencyMs: number;
}

export class HermesClient {
  async inference(
    request: HermesRequest,
    routingContext: RoutingContext,
  ): Promise<HermesResponse> {
    let currentModel: ModelChoice = request.model;
    const attempts: ModelChoice[] = [];

    while (currentModel) {
      attempts.push(currentModel);
      try {
        const response = await this.callHermes({ ...request, model: currentModel });
        if (attempts.length > 1) {
          logger.info("hermes_fallback_recovered", {
            attempted: attempts,
            succeededOn: currentModel,
          });
        }
        return { ...response, modelUsed: currentModel };
      } catch (err) {
        const status = (err as AxiosError).response?.status;
        const retriable = !status || status >= 500 || status === 429;
        if (!retriable) throw err;

        const fallback = modelRouter.selectFallback(routingContext, currentModel);
        if (!fallback) {
          logger.error("hermes_all_models_failed", { attempts, error: err });
          throw new Error("model_fallback_exhausted");
        }

        logger.warn("hermes_fallback", { from: currentModel, to: fallback, reason: status });
        currentModel = fallback;
      }
    }

    throw new Error("unreachable");
  }

  private async callHermes(request: HermesRequest): Promise<Omit<HermesResponse, "modelUsed">> {
    const start = Date.now();
    const response = await axios.post(
      `${HERMES_URL}/inference`,
      {
        model: request.model,
        prompt: request.prompt,
        system_prompt: request.systemPrompt,
        history: request.history,
        max_tokens: request.maxTokens ?? 1024,
        temperature: request.temperature ?? 0.7,
      },
      {
        headers: { Authorization: `Bearer ${HERMES_API_KEY}` },
        timeout: HERMES_TIMEOUT_MS,
      },
    );

    const data = response.data as {
      text: string;
      input_tokens: number;
      output_tokens: number;
      modal_compute_seconds: number;
      cache_hit: boolean;
    };

    return {
      text: data.text,
      inputTokens: data.input_tokens,
      outputTokens: data.output_tokens,
      modalComputeSeconds: data.modal_compute_seconds,
      cacheHit: data.cache_hit,
      latencyMs: Date.now() - start,
    };
  }
}

export const hermesClient = new HermesClient();
```

---

## Part 3 — Response Cache

**File:** `backend/src/services/inference-cache.service.ts`

```typescript
import crypto from "crypto";
import { redis } from "@/lib/redis";
import type { HermesResponse } from "./hermes-client.service";

const CACHE_TTL_SECONDS = 90 * 60;  // 90 minutes

export class InferenceCache {
  /**
   * Cache key = hash of (soulMd + recent conversation + user message).
   * Same input = same output = return from cache.
   */
  private cacheKey(soulMd: string, history: unknown[], userMessage: string): string {
    const payload = JSON.stringify({ soulMd, history, userMessage });
    return `inference:cache:${crypto.createHash("sha256").update(payload).digest("hex")}`;
  }

  async get(soulMd: string, history: unknown[], userMessage: string): Promise<HermesResponse | null> {
    const key = this.cacheKey(soulMd, history, userMessage);
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set(
    soulMd: string,
    history: unknown[],
    userMessage: string,
    response: HermesResponse,
  ): Promise<void> {
    const key = this.cacheKey(soulMd, history, userMessage);
    await redis.set(
      key,
      JSON.stringify({ ...response, cacheHit: true }),
      "EX",
      CACHE_TTL_SECONDS,
    );
  }
}

export const inferenceCache = new InferenceCache();
```

---

## Part 4 — End-to-End Flow in Voice Converse

**File:** `backend/src/routes/voice.ts` (modify existing `/converse`)

```typescript
import { modelRouter } from "@/services/model-router.service";
import { hermesClient } from "@/services/hermes-client.service";
import { inferenceCache } from "@/services/inference-cache.service";
import { abuseProtectionService } from "@/services/abuse-protection.service";
import { requireAbuseCheck } from "@/middleware/abuse-protection";

router.post("/converse", requireClaraOrClerk, requireAbuseCheck, voiceLimiter, async (req, res) => {
  const { userId, tier, userHasDeepestPlugin } = req.claraUser!;
  const { audio_base64, history = [], user_message, agent_soul_md, explicit_premium = false } = req.body;

  // 1. Try cache first
  const cached = await inferenceCache.get(agent_soul_md, history, user_message);
  if (cached) {
    // Record zero-COGS hit
    await abuseProtectionService.recordUsage({
      userId,
      modelUsed: cached.modelUsed as any,
      taskType: "voice_convo",
      bedrockInputTokens: 0,
      bedrockOutputTokens: 0,
      modalComputeSeconds: 0,
      cacheHit: true,
    });
    res.json({ text: cached.text, cached: true });
    return;
  }

  // 2. Route to the cheapest sufficient model
  const routingCtx = {
    userId,
    tier,
    taskType: "voice_convo" as const,
    inputTokenEstimate: JSON.stringify({ history, user_message }).length / 4,
    userHasDeepestPlugin,
    explicitPremiumRequest: explicit_premium,
  };
  const selectedModel = modelRouter.selectModel(routingCtx);

  // 3. Call Hermes (with automatic fallback)
  const inference = await hermesClient.inference(
    {
      model: selectedModel,
      prompt: user_message,
      systemPrompt: agent_soul_md,
      history,
      maxTokens: 1024,
    },
    routingCtx,
  );

  // 4. Cache the result
  await inferenceCache.set(agent_soul_md, history, user_message, inference);

  // 5. Record COGS
  await abuseProtectionService.recordUsage({
    userId,
    modelUsed: inference.modelUsed as any,
    taskType: "voice_convo",
    bedrockInputTokens: inference.inputTokens,
    bedrockOutputTokens: inference.outputTokens,
    modalComputeSeconds: inference.modalComputeSeconds,
    cacheHit: false,
  });

  res.json({ text: inference.text, latency_ms: inference.latencyMs });
});
```

---

## Part 5 — Analytics: Track Routing Distribution

**File:** `backend/src/jobs/routing-distribution-daily.ts`

Nightly job that aggregates `usage_events` by `model_used` and logs the distribution. Used to verify actual routing matches the expected distribution in `pricing/model-routing-strategy.md`.

```typescript
import cron from "node-cron";
import { UsageEvent } from "@/models/UsageEvent";
import { sequelize } from "@/lib/db";
import logger from "@/lib/logger";

// Run daily at 02:00 UTC
cron.schedule("0 2 * * *", async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const results = await UsageEvent.findAll({
    attributes: [
      "modelUsed",
      [sequelize.fn("COUNT", sequelize.col("id")), "request_count"],
      [sequelize.fn("SUM", sequelize.col("cogs_usd")), "total_cogs"],
    ],
    where: {
      createdAt: { [Op.gte]: yesterday },
    },
    group: ["modelUsed"],
  });

  const total = results.reduce((s, r: any) => s + Number(r.get("request_count")), 0);
  const distribution = results.map((r: any) => ({
    model: r.get("modelUsed"),
    requests: Number(r.get("request_count")),
    pct: ((Number(r.get("request_count")) / total) * 100).toFixed(1),
    cogs_usd: Number(r.get("total_cogs")).toFixed(2),
  }));

  logger.info("routing_distribution_daily", { distribution, total_requests: total });

  // Expected: gemma ≥70%, kimi 10-15%, deepseek 3-8%, premium <1%
});
```

---

## Part 6 — Environment Variables

Add to `backend/.env.example`:

```bash
# Hermes gateway (internal — never expose to client)
HERMES_GATEWAY_URL=https://hermes.internal.claracode.ai
HERMES_API_KEY=<injected from SSM>

# Model routing flags
ENABLE_PREMIUM_FALLBACK=true            # allow fallback to bedrock_premium on total failure
ENABLE_INFERENCE_CACHE=true             # hash-based response cache
CACHE_TTL_MINUTES=90
```

Production values live in SSM Parameter Store; `backend/src/config/secrets.ts` pulls them at boot.

---

## Part 7 — Tests

```typescript
describe("ModelRouterService", () => {
  describe("selectModel", () => {
    it("returns user_deepest when userHasDeepestPlugin is true");
    it("returns bedrock_premium when explicitPremiumRequest is true");
    it("routes Enterprise reasoning to bedrock_premium");
    it("routes Enterprise code_gen to deepseek_v3");
    it("routes long-context reasoning (>20k tokens) to deepseek_v3");
    it("routes short-context reasoning to kimi_k2");
    it("routes agent_build tasks to kimi_k2");
    it("routes voice_convo to gemma_27b");
    it("routes default code_gen to gemma_27b");
  });

  describe("selectFallback", () => {
    it("gemma → kimi → deepseek → premium → null");
    it("returns null for premium (no further fallback)");
  });
});

describe("HermesClient", () => {
  it("calls Hermes with the selected model + system_prompt");
  it("returns modelUsed from successful call");
  it("falls back on 5xx responses through the chain");
  it("falls back on 429 (rate limit)");
  it("does NOT fall back on 4xx business errors");
  it("throws model_fallback_exhausted when all models fail");
});

describe("InferenceCache", () => {
  it("returns null for a cache miss");
  it("returns the cached response on exact input match");
  it("does not return stale entries past TTL");
  it("produces different cache keys for different soul_md or messages");
});

describe("Voice /converse end-to-end", () => {
  it("returns cached response without calling Hermes");
  it("calls Hermes and caches the result on cache miss");
  it("records usage with correct modelUsed + tokens + cogs_usd");
  it("falls through the model chain on Hermes errors");
});
```

---

## Acceptance Criteria

- [ ] `ModelRouterService` returns the correct model for every tier × task combo per the rubric
- [ ] Fallback chain: gemma → kimi → deepseek → bedrock_premium → null
- [ ] `HermesClient` retries through the fallback chain on 5xx / 429, preserving model used
- [ ] `InferenceCache` returns cached responses with cacheHit=true when input matches
- [ ] Voice `/converse` uses cache → route → Hermes call → record COGS, in that order
- [ ] Cache hits record cogs_usd=0 and still count as a usage event
- [ ] Deepest plugin users route to `user_deepest` and record $0 COGS
- [ ] Daily routing-distribution job logs aggregate per-model request counts and COGS
- [ ] Production verified: >70% of requests route to gemma, <10% to premium
- [ ] `npm run type-check` passes
- [ ] All tests pass
- [ ] CI thin-client gate passes (no forbidden strings — Hermes/Modal/model names must stay server-side)

## Branch + PR

```bash
git checkout -b prompt/2026-04-23/18-model-routing-pipeline
git commit -m "feat(routing): Hermes model routing — Gemma/Kimi self-hosted + DeepSeek fallback + response cache"
gh pr create --base develop --title "feat(routing): model routing pipeline — Gemma → Kimi → DeepSeek with inference cache"
```
