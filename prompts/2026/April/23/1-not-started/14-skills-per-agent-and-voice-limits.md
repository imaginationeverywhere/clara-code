# Skills Per Agent + Voice Exchange Limits

**TARGET REPO:** imaginationeverywhere/clara-code
**Priority:** P1 — depends on prompt 00 (memory), 11 (usage tracking), 12 (capability scope)
**Packages:** `backend/`
**Milestone:** Agent capability is defined by SKILLS, not just slot count. Skills per agent is a tier limit. Voice exchanges are capped honestly (not "unlimited" in the database). Marketplace skill invocations are metered separately.

---

## The Core Model

An agent slot is a container. **Skills are what fills it.**

Three agents with no skills = three empty containers. Three agents with domain-coherent skills = a product team that can build almost anything in their domain.

The tier defines:
1. How many agent containers you get (slots)
2. How much each container can hold (skills per agent)

**Skills are the capability unit. Slots are the team size.**

---

## What a Skill Is

A skill is a domain knowledge module that attaches to an agent. When attached:
- The skill's instruction set is injected into the agent's system prompt at session start
- The agent gains access to the skill's tools and patterns
- The skill becomes part of the agent's memory context

**First-party skills** (built and maintained by Clara): Always available. Free to attach and invoke. Subject to skill-per-agent limit.

**Marketplace skills** (built by third-party developers, published to Clara Marketplace): Free to attach. Each invocation consumes from the user's monthly marketplace credit. Overage is pay-as-you-go.

---

## Realistic Skill Capacity Per Agent

This is a design constraint, not just a product decision. More skills = more context injected into each inference call. Too many skills creates attention dilution and cross-domain interference.

| Skill count per agent | Effect |
|----------------------|--------|
| 1–3 | Pure specialist. Highly focused. Best for production-critical agents. |
| 4–6 | Coherent domain expert. All skills serve the same domain. (e.g., frontend: React + Tailwind + Accessibility + SEO) |
| 7–10 | Cross-domain tension possible. Still usable if skills are carefully chosen. |
| 11+ | Attention dilution. Agent becomes an unfocused generalist. |

**Design target: 3–5 skills per agent, all within a coherent domain.**

The platform ALLOWS up to the tier limit. But the onboarding UI should guide users to build specialist agents, not generalist ones.

---

## Skill Slots by Tier

| Tier | Harness Agents | Skills Per Agent | Total Skill Slots |
|------|----------------|-----------------|-------------------|
| Basic ($39) | 3 | 5 | 15 |
| Pro ($69) | 6 | 7 | 42 |
| Max ($99) | 9 | 10 | 90 |
| Business ($299) | 24 | 15 | 360 |
| Enterprise ($4k+) | 350 | Custom | Custom (per contract) |

---

## What 3 Agents × 5 Skills Builds (Basic Example)

| Agent | Skills | What It Can Do |
|-------|--------|---------------|
| Frontend | React, Next.js, Tailwind, ShadCN, Figma-to-code | Any UI: landing pages, dashboards, e-commerce storefronts, booking calendars |
| Backend | Express, PostgreSQL, REST/GraphQL, Stripe, Clerk | Any server: auth, payments, APIs, database design |
| DevOps | Vercel, AWS Amplify, CI/CD, GitHub Actions, env management | Any deploy: preview deploys, production deploy, environment config |

**With 15 skill slots (3×5), a Basic user can build any website.** The skills are chosen — they are not forced to fill all 5 per agent. A simple site might only need 3 skills per agent.

---

## Voice Exchange Limits

"Unlimited" is a marketing concept. The honest implementation is a high monthly cap with no paywall, with fair-use monitoring to catch automated abuse.

Voice exchanges are expensive (TTS + STT + LLM). Text turns with harness agents are cheap. The distinction:
- **Voice exchanges** = Clara ↔ User real-time voice conversation
- **Agent operations** = harness agent work (text-based by default)

By default, harness agents communicate via text. Voice interaction with a specific harness agent (instead of via Clara) is only available on Max and above.

| Tier | Voice Exchanges/Month | Notes |
|------|-----------------------|-------|
| Free | 100 | Hard cap — conversion funnel |
| Basic | 2,000 | ~67 sessions of 30 exchanges each |
| Pro | 5,000 | Daily driver with full team |
| Max | 10,000 | Heavy use + voice standups |
| Small Business | 25,000 | Team use across multiple users |
| Enterprise | Fair use | No hard cap, monitored |

Voice exchanges reset on the billing date. Free users who reach 100 receive Clara's conversion prompt (see prompt 12).

---

## Marketplace Skill Invocation Credits

When an agent uses a marketplace skill, the skill developer earns revenue. The platform handles billing.

| Tier | Marketplace Invocations/Month (included) | Overage |
|------|------------------------------------------|---------|
| Free | 0 | — |
| Basic | 50 invocations | $0.10 per additional invocation |
| Pro | 200 invocations | $0.08 per additional |
| Max | 500 invocations | $0.06 per additional |
| Small Business | 2,000 invocations | $0.05 per additional |
| Enterprise | Custom | Custom |

Developer revenue share: 70% to developer, 30% to Clara Platform (same model as App Store).

---

## Part 1 — Agent Skills Table

**File:** `backend/migrations/014_agent_skills.sql`

```sql
-- Skills attached to harness agents.
-- An agent can hold up to the tier's skill limit.
-- Run: psql $DATABASE_URL -f backend/migrations/014_agent_skills.sql

CREATE TABLE IF NOT EXISTS agent_skills (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         VARCHAR(255) NOT NULL,
  agent_id        VARCHAR(255) NOT NULL,   -- the harness agent this skill is attached to
  skill_id        VARCHAR(255) NOT NULL,   -- e.g. 'frontend-react', 'backend-express', 'devops-vercel'
  skill_source    VARCHAR(20)  NOT NULL DEFAULT 'first_party',
    -- 'first_party' = built by Clara (free)
    -- 'marketplace' = third-party developer skill (metered)
  skill_version   VARCHAR(20)  NOT NULL DEFAULT 'latest',
  attached_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  active          BOOLEAN      NOT NULL DEFAULT TRUE,

  UNIQUE (user_id, agent_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_skills_agent
  ON agent_skills (user_id, agent_id)
  WHERE active = TRUE;
```

---

## Part 2 — Voice Exchange Tracking Update

**File:** Update `backend/migrations/007_user_memory.sql` or the existing voice_usage table

The existing `voice_usage` table tracks `exchanges_count` per session. Extend to track monthly aggregate for limit enforcement:

```sql
-- Add monthly cap tracking to voice_usage (if not already present)
ALTER TABLE voice_usage
  ADD COLUMN IF NOT EXISTS billing_month DATE,
  ADD COLUMN IF NOT EXISTS monthly_exchanges INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_voice_usage_user_month
  ON voice_usage (user_id, billing_month);

-- View: current month voice totals per user
CREATE OR REPLACE VIEW voice_monthly_totals AS
  SELECT
    user_id,
    DATE_TRUNC('month', created_at)::DATE AS billing_month,
    SUM(exchanges_count)                  AS total_exchanges
  FROM voice_usage
  GROUP BY user_id, DATE_TRUNC('month', created_at)::DATE;
```

---

## Part 3 — Skill Limit Enforcement

**File:** `backend/src/services/agent-skill.service.ts`

```typescript
import { AgentSkill } from "@/models/AgentSkill";
import { PLAN_LIMITS } from "./usage-extended.service";
import type { PlanTier } from "./usage-extended.service";

export type SkillSource = "first_party" | "marketplace";

export class AgentSkillService {
  /**
   * Attach a skill to an agent. Enforces the per-agent skill limit.
   */
  async attachSkill(
    userId: string,
    agentId: string,
    skillId: string,
    source: SkillSource,
    tier: PlanTier,
  ): Promise<{ success: boolean; reason?: string; upgradeUrl?: string }> {
    const limit = PLAN_LIMITS[tier].skillsPerAgent;

    if (limit !== null) {
      const currentCount = await AgentSkill.count({
        where: { userId, agentId, active: true },
      });

      if (currentCount >= limit) {
        return {
          success: false,
          reason: `This agent already has ${currentCount} skills — the limit for your plan. Upgrade to attach more.`,
          upgradeUrl: "https://claracode.ai/pricing",
        };
      }
    }

    await AgentSkill.upsert({
      userId,
      agentId,
      skillId,
      skillSource: source,
      active: true,
    });

    return { success: true };
  }

  /** Get all active skills for an agent (injected into system prompt at session start). */
  async getActiveSkills(userId: string, agentId: string): Promise<{ skillId: string; source: SkillSource }[]> {
    const rows = await AgentSkill.findAll({
      where: { userId, agentId, active: true },
    });
    return rows.map((r) => ({ skillId: r.skillId, source: r.skillSource as SkillSource }));
  }

  /** Detach a skill. Does not delete — preserves history. */
  async detachSkill(userId: string, agentId: string, skillId: string): Promise<void> {
    await AgentSkill.update(
      { active: false },
      { where: { userId, agentId, skillId } },
    );
  }
}

export const agentSkillService = new AgentSkillService();
```

---

## Part 4 — Add Skill Limit to PLAN_LIMITS

**File:** `backend/src/services/usage-extended.service.ts`

Add `skillsPerAgent` to every tier in `PLAN_LIMITS`:

```typescript
export const PLAN_LIMITS = {
  free: {
    ...existing fields...,
    skillsPerAgent: 0,              // no agents = no skills
    voiceExchangesPerMonth: 100,
    marketplaceInvocationsPerMonth: 0,
  },
  basic: {
    ...existing fields...,
    skillsPerAgent: 5,
    voiceExchangesPerMonth: 2000,
    marketplaceInvocationsPerMonth: 50,
  },
  pro: {
    ...existing fields...,
    skillsPerAgent: 7,
    voiceExchangesPerMonth: 5000,
    marketplaceInvocationsPerMonth: 200,
  },
  max: {
    ...existing fields...,
    skillsPerAgent: 10,
    voiceExchangesPerMonth: 10000,
    marketplaceInvocationsPerMonth: 500,
  },
  small_business: {
    ...existing fields...,
    skillsPerAgent: 15,
    voiceExchangesPerMonth: 25000,
    marketplaceInvocationsPerMonth: 2000,
  },
  enterprise: {
    ...existing fields...,
    skillsPerAgent: null,           // unlimited
    voiceExchangesPerMonth: null,   // fair use
    marketplaceInvocationsPerMonth: null,
  },
} as const;
```

---

## Part 5 — Voice Exchange Cap Enforcement

**File:** `backend/src/services/voice-cap.service.ts`

```typescript
import { VoiceUsage } from "@/models/VoiceUsage";
import { Op } from "sequelize";
import { PLAN_LIMITS } from "./usage-extended.service";
import type { PlanTier } from "./usage-extended.service";

function monthStart(date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export class VoiceCapService {
  /** Check if user has voice exchanges remaining this month. */
  async checkVoiceAllowed(
    userId: string,
    tier: PlanTier,
  ): Promise<{ allowed: boolean; used: number; cap: number | null; upgradeUrl?: string }> {
    const cap = PLAN_LIMITS[tier].voiceExchangesPerMonth;

    if (cap === null) return { allowed: true, used: 0, cap: null };

    const used = await VoiceUsage.sum("exchanges_count", {
      where: {
        userId,
        createdAt: { [Op.gte]: monthStart() },
      },
    }) as number | null ?? 0;

    if (used >= cap) {
      if (tier === "free") {
        // Trigger conversion — not a hard error, return a special flag
        return { allowed: false, used, cap, upgradeUrl: "https://claracode.ai/pricing" };
      }
      // Paid tier at fair-use limit — log, allow, but flag for review
      return { allowed: true, used, cap };
    }

    return { allowed: true, used, cap };
  }
}

export const voiceCapService = new VoiceCapService();
```

Apply in `POST /api/voice/converse`:

```typescript
const voiceCheck = await voiceCapService.checkVoiceAllowed(userId, tier);
if (!voiceCheck.allowed && tier === "free") {
  // Return conversion prompt via voice — not a 402
  const conversionText = buildConversionPrompt(voiceCheck.used);
  res.json({ text: conversionText, audio: null, convert: true, upgrade_url: voiceCheck.upgradeUrl });
  return;
}
```

---

## Part 6 — Skills API Routes

**File:** `backend/src/routes/agent-skills.ts`

```typescript
import { Router } from "express";
import { requireClaraOrClerk } from "@/middleware/api-key-auth";
import { agentSkillService } from "@/services/agent-skill.service";

const router = Router();

// POST /api/agents/:agentId/skills — attach a skill
router.post("/:agentId/skills", requireClaraOrClerk, async (req, res) => {
  const userId = req.claraUser?.userId;
  if (!userId) { res.status(401).json({ error: "Authenticated" }); return; }

  const { agentId } = req.params;
  const { skill_id, source = "first_party" } = req.body as { skill_id?: string; source?: string };
  if (!skill_id) { res.status(400).json({ error: "skill_id required" }); return; }

  const tier = (req.claraUser?.tier ?? "free") as PlanTier;
  const result = await agentSkillService.attachSkill(userId, agentId, skill_id, source as SkillSource, tier);

  if (!result.success) {
    res.status(402).json({ error: "skill_limit_reached", message: result.reason, upgrade_url: result.upgradeUrl });
    return;
  }
  res.status(201).json({ ok: true });
});

// GET /api/agents/:agentId/skills — list active skills
router.get("/:agentId/skills", requireClaraOrClerk, async (req, res) => {
  const userId = req.claraUser?.userId;
  if (!userId) { res.status(401).json({ error: "Authenticated" }); return; }

  const skills = await agentSkillService.getActiveSkills(userId, req.params.agentId);
  res.json({ skills, count: skills.length });
});

// DELETE /api/agents/:agentId/skills/:skillId — detach a skill
router.delete("/:agentId/skills/:skillId", requireClaraOrClerk, async (req, res) => {
  const userId = req.claraUser?.userId;
  if (!userId) { res.status(401).json({ error: "Authenticated" }); return; }

  await agentSkillService.detachSkill(userId, req.params.agentId, req.params.skillId);
  res.json({ ok: true });
});

export default router;
```

Register in `backend/src/server.ts`:
```typescript
import agentSkillRoutes from "./routes/agent-skills";
app.use("/api/agents", agentSkillRoutes);  // becomes /api/agents/:agentId/skills
```

---

## Part 7 — Inject Active Skills Into Memory Context

**File:** `backend/src/services/memory.service.ts`

When building the session context for an agent, inject its active skills into the system prompt:

```typescript
import { agentSkillService } from "./agent-skill.service";
import { loadSkillContent } from "@/lib/skill-registry";  // reads skill instruction content

// In getMemoryContext, add to Promise.all:
const [memory, recentRows, inbox, profile, skills] = await Promise.all([
  AgentUserMemory.findOne({ where: { userId, agentId } }),
  ConversationTurn.findAll({ ... }),
  agentMessagingService.readInbox(userId, agentId),
  claraScrumService.getUserProfile(userId),
  agentSkillService.getActiveSkills(userId, agentId),  // ← new
]);

// In buildHistory, inject skills as Layer 0 (before user profile):
if (context.skills.length > 0) {
  const skillContent = context.skills
    .map((s) => loadSkillContent(s.skillId))
    .filter(Boolean)
    .join("\n\n");
  history.push({ role: "user", content: `[Active Skills]\n${skillContent}` });
  history.push({ role: "assistant", content: "Understood — I have these capabilities active." });
}
```

**Memory buildHistory final layer order:**
```
Layer 0: Active skills (domain knowledge modules)
Layer 1: Global user profile (shared across all agents)
Layer 2: This agent's memory summary (private to this agent)
Layer 3: Inbox messages from other agents
Layer 4: Recent conversation turns
```

---

## Part 8 — Skill Registry

**File:** `backend/src/lib/skill-registry.ts`

A lookup table that maps skill IDs to their instruction content. First-party skills live in `backend/src/skills/`. Marketplace skills are fetched from the marketplace service.

```typescript
import * as fs from "fs";
import * as path from "path";

const FIRST_PARTY_SKILLS_DIR = path.join(__dirname, "../skills");

export function loadSkillContent(skillId: string): string | null {
  // First-party: load from local file
  const localPath = path.join(FIRST_PARTY_SKILLS_DIR, `${skillId}.md`);
  if (fs.existsSync(localPath)) {
    return fs.readFileSync(localPath, "utf8");
  }

  // Marketplace: fetch from marketplace service (async in real impl — simplified here)
  // In production: cache marketplace skill content, refresh daily
  return null;
}
```

**First-party skill files** (`backend/src/skills/*.md`):
- `frontend-react.md` — React patterns, component architecture, hooks
- `frontend-nextjs.md` — Next.js App Router, server/client components, routing
- `frontend-tailwind.md` — Tailwind design system, responsive patterns
- `backend-express.md` — Express middleware, route patterns, error handling
- `backend-postgresql.md` — SQL patterns, schema design, query optimization
- `backend-stripe.md` — Stripe Connect, checkout, webhooks
- `devops-vercel.md` — Vercel deployment, preview deploys, env config
- `devops-aws.md` — AWS Amplify, App Runner, EC2, S3
- `devops-cicd.md` — GitHub Actions, CI pipelines, automated testing
- `mobile-expo.md` — React Native + Expo, iOS/Android builds
- `qa-playwright.md` — Playwright E2E, test writing, coverage
- `research-web.md` — Web research, synthesis, spec writing
- `ai-integrations.md` — OpenAI, Anthropic, Cloudflare AI patterns
- `security-owasp.md` — OWASP scanning, auth hardening, dependency audits

---

## Acceptance Criteria

- [ ] `agent_skills` table with `UNIQUE (user_id, agent_id, skill_id)`
- [ ] `PLAN_LIMITS` updated with `skillsPerAgent` and `voiceExchangesPerMonth` per tier
- [ ] `POST /api/agents/:agentId/skills` enforces skill slot limit — 402 with upgrade_url at limit
- [ ] `GET /api/agents/:agentId/skills` returns active skills
- [ ] Active skills are injected as Layer 0 in `buildHistory` before user profile
- [ ] Voice exchange cap enforced per tier — free users get conversion prompt at 100, not 402
- [ ] First-party skill files exist for all 14 listed skills in `backend/src/skills/*.md`
- [ ] Voice exchange fair-use monitoring logs when paid users approach their soft cap
- [ ] Marketplace skill invocations tracked separately in `usage_extended.skill_invocations`
- [ ] `npm run type-check` passes
- [ ] Tests cover: skill limit enforcement, voice cap, conversion prompt trigger, skill injection into history

## Branch + PR

```bash
git checkout -b prompt/2026-04-23/14-skills-per-agent-and-voice-limits
git commit -m "feat(agents): skills per agent limits, voice exchange caps, skill injection into memory context"
gh pr create --base develop --title "feat(agents): skill slots, voice limits, skill registry + memory injection"
```
