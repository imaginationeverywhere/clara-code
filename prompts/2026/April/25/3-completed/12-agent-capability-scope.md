# Agent Capability Scope + Operation Weights

**TARGET REPO:** imaginationeverywhere/clara-code
**Priority:** P1 — depends on prompt 00 (memory) and 11 (usage)
**Packages:** `backend/`
**Milestone:** Every tier has a defined capability ceiling. Agent slots map to real-world outcomes. Heavy operations are weighted heavier than light ones. The system knows what a user can build before they ask.

---

## The Core Principle

Agent slots are not abstract counts. They are a capability scope declaration.

**3 slots = a website team.** A user with Basic ($39) gets three agents that, by default, can build essentially any website — e-commerce, SaaS landing, booking systems, portfolio, local business, restaurant ordering, blog/CMS. They can take a Figma file and ship a production site. That is the product promise for Basic.

**More slots = more capability dimensions.** Pro (6) adds mobile and QA. Max (9) adds research and AI integrations. Small Business (24) adds the ability to build and publish new agents. Enterprise (360) is a platform, not a team.

**The right question is not "how many agents?" — it's "what can this team build?"**

---

## Operation Weight System

Not all agentic work costs the same. This is the weight table used to determine infrastructure cost and rate limiting.

| Weight | Operation Type | Examples |
|--------|---------------|---------|
| **0** (free) | Passive/read operations | Git log, file read, explain code, describe what a function does |
| **1** (light) | Simple generation | Write a unit test, fix a typo, add a comment, generate a small component |
| **3** (medium) | Feature-level work | Build a React page, write an API endpoint, set up a database migration, integrate a third-party API |
| **5** (heavy) | Research + synthesis | Multi-step web research, full feature with design + build + test, DevOps pipeline setup, performance audit |
| **10** (critical) | System-level work | Full application scaffolding, agent orchestration across 3+ agents, complex multi-service integration |
| **20** (agent build) | Building new agents | Creating a SOUL.md + routes + deployment config for a new marketplace agent |

### What this means for enforcement

- Weight 0-1: Never gated, never counted. Git commands, questions, explanations — these do not affect usage.
- Weight 3-5: Counted in `operation_credits_used` per billing month. Medium operations are the daily work.
- Weight 10+: Counted AND limited by tier. Building agents (weight 20) requires `canBuildAgents: true`.

**Free users** can do weight 0-1 (Clara can answer questions and explain code). That is the sales conversation — she shows them what she can do. To execute (weight 3+), they need a plan.

---

## Default Agent Bundles by Tier

When a user activates a tier, these are the DEFAULT agent roles their slots map to. Users can reconfigure — but these are the out-of-the-box capabilities Clara presents.

### Basic ($39) — 3 Slots: The Website Machine

| Slot | Default Agent | Capability |
|------|--------------|-----------|
| 1 | Frontend Engineer | React/Next.js, Tailwind, component libraries, responsive design, Figma-to-code |
| 2 | Backend Engineer | Express/Node, PostgreSQL, REST/GraphQL APIs, authentication, Stripe checkout |
| 3 | Deploy & DevOps | Vercel, Netlify, AWS Amplify, CI/CD, domain setup, environment management |

**What this team can build:** Any website. E-commerce (Shopify alternative), SaaS landing pages with checkout, restaurant ordering systems, booking calendars, portfolio sites, blogs, local business directories, job boards.

**What this team cannot do well:** Deep research before building, mobile apps, complex multi-party payment flows, AI-powered features, building other agents.

---

### Pro ($59) — 6 Slots: The Product Team

| Slot | Default Agent | Capability |
|------|--------------|-----------|
| 1 | Frontend Engineer | — (same as Basic) |
| 2 | Backend Engineer | — |
| 3 | Deploy & DevOps | — |
| 4 | Mobile Engineer | React Native, Expo, iOS + Android builds, push notifications |
| 5 | QA & Testing | Playwright E2E, unit test coverage, regression suites |
| 6 | Product Researcher | Web research, competitive analysis, feature spec writing, user story generation |

**What this team can build:** Full products — web + mobile + tested. Can ship an app to the App Store. Can write specs before building. Research-backed features.

---

### Max ($99) — 9 Slots: The Full Squad

| Slot | Default Agent | Capability |
|------|--------------|-----------|
| 1-6 | Same as Pro | — |
| 7 | AI/Integrations Engineer | OpenAI, Anthropic, Cloudflare AI, webhook systems, third-party APIs |
| 8 | Security Engineer | Auth hardening, OWASP scanning, prompt injection detection, dependency audits |
| 9 | Analytics & Growth | GA4, event tracking, conversion funnels, A/B test setup |

**What this team can build:** Full products with AI features, security review, and analytics. Near-complete startup engineering team.

---

### Small Business ($299) — 24 Slots: The Agency + Agent Factory

All of the above, plus the ability to:
- Build custom agents for their own use
- Publish agents to the Clara Marketplace (with Developer Program enrollment)
- Run agents on behalf of clients
- Maintain a shared team vault accessible across multiple users

**Agent building is the key unlock** — Small Business is where Clara becomes a platform, not just a tool.

---

### Enterprise ($4,000) — 360 Slots: The Platform

360 agents that can be organized into multiple teams, each with its own sprint cadence, standup schedule, and memory context. SSO, audit logs, SLA, dedicated support. Can white-label agents for customers.

---

## Part 1 — Operation Credits Table

**File:** `backend/migrations/012_operation_credits.sql`

```sql
-- Operation credits: tracks weighted usage per billing month.
-- Weight-0 and weight-1 operations are never recorded here.
-- Run: psql $DATABASE_URL -f backend/migrations/012_operation_credits.sql

CREATE TABLE IF NOT EXISTS operation_credits (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        VARCHAR(255) NOT NULL,
  agent_id       VARCHAR(255) NOT NULL,
  billing_month  DATE         NOT NULL,

  -- Cumulative credits consumed this billing month
  credits_used   INTEGER      NOT NULL DEFAULT 0,

  -- Breakdown by weight tier
  medium_ops     INTEGER      NOT NULL DEFAULT 0,  -- weight 3 each
  heavy_ops      INTEGER      NOT NULL DEFAULT 0,  -- weight 5 each
  critical_ops   INTEGER      NOT NULL DEFAULT 0,  -- weight 10 each
  agent_builds   INTEGER      NOT NULL DEFAULT 0,  -- weight 20 each

  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, agent_id, billing_month)
);

CREATE INDEX IF NOT EXISTS idx_op_credits_user_month
  ON operation_credits (user_id, billing_month);
```

Run against all three environments.

---

## Part 2 — Operation Weight Constants

**File:** `backend/src/services/operation-weights.ts`

```typescript
export type OperationWeight = 0 | 1 | 3 | 5 | 10 | 20;

export type OperationCategory =
  | "passive"       // weight 0 — never counted
  | "light"         // weight 1 — never counted
  | "medium"        // weight 3
  | "heavy"         // weight 5
  | "critical"      // weight 10
  | "agent_build";  // weight 20

export const OPERATION_WEIGHTS: Record<OperationCategory, OperationWeight> = {
  passive: 0,
  light: 1,
  medium: 3,
  heavy: 5,
  critical: 10,
  agent_build: 20,
};

/** Classify an operation by keyword/intent. Used by the voice converse route. */
export function classifyOperation(intent: string): OperationCategory {
  const lower = intent.toLowerCase();

  // Passive — never counted
  if (/\b(explain|describe|what is|what does|show me|list|log|status|read|help)\b/.test(lower)) {
    return "passive";
  }

  // Agent build — always heaviest
  if (/\b(build.*(agent|soul)|create.*(agent|harness)|publish.*agent|new agent)\b/.test(lower)) {
    return "agent_build";
  }

  // Critical — system-level
  if (/\b(scaffold|full.*(app|application)|orchestrate|multi.?agent|entire)\b/.test(lower)) {
    return "critical";
  }

  // Heavy — research + full features
  if (/\b(research|audit|pipeline|devops|deploy|integrate|full.*(feature|flow|page))\b/.test(lower)) {
    return "heavy";
  }

  // Medium — feature-level
  if (/\b(build|create|implement|write|generate|add|fix|refactor|migrate|setup)\b/.test(lower)) {
    return "medium";
  }

  // Default: light
  return "light";
}

/**
 * Per-tier credit budget per billing month.
 * null = unlimited.
 */
export const CREDIT_BUDGETS: Record<string, number | null> = {
  free: 0,          // can only do passive/light — zero execution credits
  basic: 500,       // ~166 medium-weight operations per month
  pro: 1_500,       // ~300 medium / ~100 heavy
  max: 4_000,       // ~400 heavy / plenty of critical
  small_business: null,
  enterprise: null,
};
```

---

## Part 3 — Credit Service

**File:** `backend/src/services/operation-credit.service.ts`

```typescript
import { Op } from "sequelize";
import { OperationCredits } from "@/models/OperationCredits";
import { OPERATION_WEIGHTS, CREDIT_BUDGETS, classifyOperation, type OperationCategory } from "./operation-weights";
import logger from "@/lib/logger";

function billingMonthKey(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

export class OperationCreditService {
  /**
   * Record a weighted operation. Returns remaining budget (null = unlimited).
   * Weight-0 and weight-1 operations return immediately without a DB write.
   */
  async record(
    userId: string,
    agentId: string,
    tier: string,
    category: OperationCategory,
  ): Promise<{ allowed: boolean; creditsRemaining: number | null; upgradeUrl?: string }> {
    const weight = OPERATION_WEIGHTS[category];
    const budget = CREDIT_BUDGETS[tier] ?? null;

    // Free operations — never touch the DB
    if (weight <= 1) return { allowed: true, creditsRemaining: null };

    // Free users cannot execute
    if (budget === 0) {
      return {
        allowed: false,
        creditsRemaining: 0,
        upgradeUrl: "https://claracode.ai/pricing",
      };
    }

    const billingMonth = billingMonthKey();
    const [row] = await OperationCredits.findOrCreate({
      where: { userId, agentId, billingMonth },
      defaults: { userId, agentId, billingMonth },
    });

    // Unlimited
    if (budget === null) {
      await this.incrementRow(row, category, weight);
      return { allowed: true, creditsRemaining: null };
    }

    if (row.creditsUsed + weight > budget) {
      return {
        allowed: false,
        creditsRemaining: budget - row.creditsUsed,
        upgradeUrl: "https://claracode.ai/pricing",
      };
    }

    await this.incrementRow(row, category, weight);
    return { allowed: true, creditsRemaining: budget - row.creditsUsed - weight };
  }

  private async incrementRow(
    row: OperationCredits,
    category: OperationCategory,
    weight: number,
  ): Promise<void> {
    const fieldMap: Record<OperationCategory, string | null> = {
      passive: null,
      light: null,
      medium: "mediumOps",
      heavy: "heavyOps",
      critical: "criticalOps",
      agent_build: "agentBuilds",
    };
    const field = fieldMap[category];
    if (!field) return;

    await row.increment("creditsUsed", { by: weight });
    await row.increment(field, { by: 1 });
  }
}

export const operationCreditService = new OperationCreditService();
```

---

## Part 4 — Inject Credit Check Into Voice Converse Route

**File:** `backend/src/routes/voice.ts`

In `POST /api/voice/converse`, classify the user's intent and check credits before processing:

```typescript
import { classifyOperation } from "@/services/operation-weights";
import { operationCreditService } from "@/services/operation-credit.service";

// After auth and body parse, before voice/memory processing:
const userMessage = req.body.text ?? "";
const intentCategory = classifyOperation(userMessage);
const tier = req.claraUser?.tier ?? "free";

const creditCheck = await operationCreditService.record(
  userId,
  agentId ?? "clara",
  tier,
  intentCategory,
);

if (!creditCheck.allowed) {
  res.status(402).json({
    error: "credit_limit_reached",
    message: "You've used your monthly operation credits. Upgrade to continue.",
    credits_remaining: creditCheck.creditsRemaining,
    upgrade_url: creditCheck.upgradeUrl,
  });
  return;
}
```

---

## Part 5 — Free Tier Conversion Prompt

**File:** `backend/src/services/clara-conversion.service.ts`

When a free user hits their voice exchange limit (100), Clara does not just error. She converts:

```typescript
export function buildConversionPrompt(exchangesUsed: number): string {
  return [
    `You've had ${exchangesUsed} conversations with Clara. I've shown you what I can do —`,
    `now let me actually build with you.`,
    ``,
    `For $39/month, you get three agents who can build your whole website:`,
    `a frontend engineer, a backend engineer, and a DevOps specialist.`,
    `We pick up exactly where we left off — with memory of everything we've discussed.`,
    ``,
    `Ready to start? → claracode.ai/pricing`,
  ].join("\n");
}
```

This prompt is passed to the voice server so Clara speaks it, not just displays it.

---

## Default Agent Slot Configuration

**File:** `backend/src/services/agent-slot.service.ts`

When a user upgrades and activates their first paid tier, seed default agent configurations:

```typescript
export const DEFAULT_AGENT_BUNDLES: Record<string, string[]> = {
  basic: ["frontend-engineer", "backend-engineer", "devops-engineer"],
  pro: ["frontend-engineer", "backend-engineer", "devops-engineer", "mobile-engineer", "qa-engineer", "researcher"],
  max: [
    "frontend-engineer", "backend-engineer", "devops-engineer",
    "mobile-engineer", "qa-engineer", "researcher",
    "ai-integrations-engineer", "security-engineer", "analytics-engineer",
  ],
  // small_business and enterprise: user configures their own
};
```

Each name maps to a pre-written SOUL.md template in `backend/src/agent-templates/`. The agent gets provisioned with the template on first use, not at signup — lazy provisioning.

---

## Acceptance Criteria

- [ ] `operation_credits` table with `UNIQUE (user_id, agent_id, billing_month)`
- [ ] `classifyOperation(intent)` correctly categorizes passive, medium, heavy, critical, agent_build
- [ ] Weight-0 and weight-1 operations never touch the DB
- [ ] Free users get 402 with upgrade_url on any weight-3+ operation
- [ ] Credit budget exhaustion returns 402 before processing the voice turn
- [ ] Default agent bundles defined for basic, pro, max tiers
- [ ] Conversion prompt fires at 100 voice exchanges for free users (spoken by Clara)
- [ ] `npm run type-check` passes
- [ ] Tests cover: intent classification, credit enforcement per tier, conversion prompt trigger

## Branch + PR

```bash
git checkout -b prompt/2026-04-23/12-agent-capability-scope
git commit -m "feat(agents): capability scope — operation weights, credit budgets, default bundles, free conversion"
gh pr create --base develop --title "feat(agents): agent capability scope — operation weights, credit budgets, default bundles"
```
