# Talents Per Agent — Tier Caps + Talent Library + Wallet Purchase Flow

**TARGET REPO:** imaginationeverywhere/clara-code
**Priority:** P1 — depends on prompt 00 (memory), 11 (PLAN_LIMITS)
**Packages:** `backend/`, `packages/sdk/`
**Milestone:** Each harness agent has a **per-tier cap on how many Talents it can carry**. The platform enforces the cap on attach. Users browse the **Talent Library** (Clara-curated + third-party from Talent Agency), attach what they need, and purchase additional Talents from their wallet. Cap is the design constraint; library is the inventory; wallet is the buy flow.

**Supersedes:** All prior drafts of this prompt that talked about "Skills" or "Voice Exchange Limits." Clara terminology is locked: skills = **Talents**. Voice exchange limits are now handled separately via the per-tier hour ladder (see `pricing/clara-ai-tier-ladder.md`) + abuse protection (see `pricing/abuse-protection.md`). This prompt is ONLY about Talent attachment caps + Talent library inventory.

Source of truth:
- `pricing/clara-ai-business-tier-ladder.md` — per-tier Talent counts (5/7/10/15/Custom)
- `pricing/cogs-and-unit-economics.md` — internal economics
- `memory/feedback_talents_abilities_naming_strict.md` — terminology

---

## The Core Model

A harness agent slot is a container. **Talents are what fills it.**

Three agents with zero Talents = three empty containers. Three agents with domain-coherent Talents = a real product team.

The tier defines:
1. **Slots** — how many harness agents you get
2. **Talents per agent** — how knowledgeable each one can be

Slots are team size. Talents are capability per team member.

---

## What a Talent Is

A Talent is a domain knowledge module that attaches to an agent. When attached:
- The Talent's instruction set is injected into the agent's system prompt (Memory Layer 0)
- The agent gains access to the Talent's associated Gears (tools)
- The Talent becomes part of the agent's memory context for that session

**Free Talents (Clara basics)**: Always free. Every plan can attach them. Examples: `personal-assistant`, `scheduling`, `email-triage`, `note-taking`, `summarization`, `research`.

**Professional Talents (Clara curated)**: One-time wallet purchase. Cross-industry skills. Examples: `react-development`, `stripe-payments`, `quickbooks-bookkeeping`, `contract-drafting`. Pricing: $4.99 each.

**Specialty Talents (Clara curated, vertical)**: Industry-specific. Examples: `barbershop-operations`, `real-estate-transactions`, `restaurant-pos`. Pricing: $9.99-$29.99 each.

**Premium Talents (Clara curated, licensed)**: Liability-heavy or licensed-content domains. Examples: `cpa-tax-prep-certified`, `attorney-ip-law`, `medical-intake-hipaa`. Pricing: $49.99-$99.99 (one-time) OR monthly subscription if knowledge updates frequently.

**Third-party Talents (Talent Agency, VP-published)**: Built by Vibe Professionals on Clara Code Business+ tier and published to the Talent Agency. VP sets the price. Revenue split: **85% to creator, 15% to Clara**.

---

## Tier Caps — Talents Per Agent

| Tier | Harness Agents | Talents per Agent | Total Talent Slots |
|------|----------------|-------------------|----|
| Basic ($39/mo) | 3 | **5** | 15 |
| Pro ($69/mo) | 6 | **7** | 42 |
| Max ($99/mo) | 9 | **10** | 90 |
| Business ($299/mo) | 24 | **15** | 360 |
| Enterprise ($4k+/mo) | 350 | **Custom (per contract)** | Custom |

**Why these caps:** More Talents per agent = more system-prompt context = attention dilution. 3-5 Talents per agent is the design sweet spot for production-grade specialist agents. 7-10 is usable. 11+ degrades quality. The Business tier 15 cap is for users running cross-domain teams where one agent legitimately needs broad expertise.

The platform allows up to the cap. The configurator UI nudges users toward focused specialists, not generalists.

---

## What 3 Agents × 5 Talents Builds (Basic Example)

| Agent | Talents Attached | What It Can Do |
|-------|------------------|----------------|
| Frontend Engineer | `react`, `nextjs`, `tailwind`, `shadcn-ui`, `figma-to-code` | Ship any UI: landing pages, dashboards, e-commerce storefronts, booking calendars |
| Backend Engineer | `express`, `postgresql`, `graphql-apollo`, `stripe-connect`, `clerk-auth` | Ship any server: auth, payments, APIs, database design |
| DevOps Engineer | `aws-amplify`, `ci-cd`, `docker-ports`, `cloudflare`, `monitoring` | Ship any deploy: preview deploys, production, environment config |

**With 15 Talent slots (3×5), a Basic user can build any website.** Talents are chosen, not required — a simple booking site might use 3 Talents per agent, leaving room to grow.

---

## Wallet Purchase Flow — Buying Additional Talents

When a user wants a Talent that isn't free:

```
User in agent configurator: "I need barbershop-operations on my Frontend Engineer"
   ↓
System checks Talent inventory: barbershop-operations = $9.99 (Specialty Talent)
   ↓
Configurator: "barbershop-operations is $9.99 to add to your library permanently. Add it?"
   ↓
User clicks Yes
   ↓
Wallet debited $9.99
   ↓
Talent added to user's library
   ↓
Talent attached to agent (consumes 1 of agent's Talent slots)
   ↓
SOUL.md regenerated with Talent's instructions injected
```

**Library ownership is permanent.** Once purchased, the Talent stays in the user's library forever. They can:
- Attach/detach to/from any of their agents
- Move between agents
- Use across builder sessions
- Export with the agent on ejection (the Talent NAME, not the implementation — Clara owns the implementation)

**Subscription-priced Talents** (Premium tier): instead of one-time purchase, a recurring monthly fee while attached. If subscription lapses, the Talent detaches automatically.

---

## Dynamic Talent Acquisition (in-conversation)

When an agent encounters a task it can't perform because it lacks a needed Talent:

```
User to Frontend Engineer: "Build me a barbershop booking page"
   ↓
Agent realizes it lacks `barbershop-operations` Talent
   ↓
Agent: "I can build the page, but I'd do it better with the barbershop-operations Talent ($9.99 — adds to your library permanently). Should I grab it?"
   ↓
User: "Yes"
   ↓
Wallet debited → Talent attached → conversation continues
   ↓
Agent now has the booking calendar logic, customer flow patterns, deposit handling
```

This UX is implemented via a hook in the agent's `PreToolUse` lifecycle (see prompt 26 — already merged). Agent emits a `talent_request` tool call → wallet purchase intent → user confirms → Talent attached → agent continues.

---

## Part 1 — Migrations

**File:** `backend/migrations/014_talents_and_agent_attachments.sql`

```sql
-- Talents catalog (curated + third-party).
-- Run: psql $DATABASE_URL -f backend/migrations/014_talents_and_agent_attachments.sql

CREATE TABLE IF NOT EXISTS talents (
  id                 VARCHAR(100)  PRIMARY KEY,            -- e.g., "react", "barbershop-operations"
  display_name       VARCHAR(255)  NOT NULL,
  description        TEXT          NOT NULL,
  category           VARCHAR(50)   NOT NULL,               -- free / professional / specialty / premium / third_party
  domain             VARCHAR(50),                           -- frontend / backend / business / industry-specific
  industry_vertical  VARCHAR(50),                           -- barbershop / real-estate / etc.
  knowledge_content  TEXT          NOT NULL,                -- the system-prompt module text
  associated_gears   JSONB         NOT NULL DEFAULT '[]',   -- list of gear IDs this Talent can use
  pricing_model      VARCHAR(20)   NOT NULL,                -- free / one_time / monthly
  price_usd          NUMERIC(8,2)  NOT NULL DEFAULT 0,
  monthly_price_usd  NUMERIC(8,2),                          -- for subscription-priced Talents
  publisher_user_id  VARCHAR(255),                          -- NULL for Clara-curated; user_id for third-party
  publisher_revenue_share NUMERIC(4,3) NOT NULL DEFAULT 0.85,  -- 0 for Clara-curated; 0.85 for third-party
  is_public          BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_talents_category ON talents (category, domain);
CREATE INDEX IF NOT EXISTS idx_talents_vertical ON talents (industry_vertical) WHERE industry_vertical IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_talents_publisher ON talents (publisher_user_id) WHERE publisher_user_id IS NOT NULL;

-- Owned Talents in user's permanent library
CREATE TABLE IF NOT EXISTS user_talents (
  id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            VARCHAR(255) NOT NULL,
  talent_id          VARCHAR(100) NOT NULL REFERENCES talents(id),
  acquired_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  acquisition_type   VARCHAR(20)  NOT NULL,                 -- free / purchase / subscription
  purchase_price_usd NUMERIC(8,2),
  subscription_active BOOLEAN     NOT NULL DEFAULT TRUE,    -- false when monthly subscription lapses
  UNIQUE (user_id, talent_id)
);

CREATE INDEX IF NOT EXISTS idx_user_talents_user ON user_talents (user_id);

-- Talent attachments to specific agents (consumes the agent's per-tier Talent slots)
CREATE TABLE IF NOT EXISTS agent_talent_attachments (
  id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_agent_id      UUID         NOT NULL REFERENCES user_agents(id) ON DELETE CASCADE,
  talent_id          VARCHAR(100) NOT NULL REFERENCES talents(id),
  user_id            VARCHAR(255) NOT NULL,
  attached_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (user_agent_id, talent_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_talents_agent ON agent_talent_attachments (user_agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_talents_user ON agent_talent_attachments (user_id);

-- Talent purchase audit trail
CREATE TABLE IF NOT EXISTS talent_purchases (
  id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            VARCHAR(255) NOT NULL,
  talent_id          VARCHAR(100) NOT NULL,
  acquisition_type   VARCHAR(20)  NOT NULL,                 -- one_time / monthly_first / monthly_renewal
  amount_usd         NUMERIC(8,2) NOT NULL,
  publisher_user_id  VARCHAR(255),                           -- recipient of the 85% share if third-party
  publisher_payout_usd NUMERIC(8,2),
  clara_revenue_usd  NUMERIC(8,2) NOT NULL,
  stripe_payment_id  VARCHAR(255),
  purchased_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_talent_purchases_user ON talent_purchases (user_id, purchased_at DESC);
CREATE INDEX IF NOT EXISTS idx_talent_purchases_publisher ON talent_purchases (publisher_user_id, purchased_at DESC) WHERE publisher_user_id IS NOT NULL;
```

Run against all three environments.

---

## Part 2 — Talent Catalog Constants

**File:** `backend/src/services/talent-catalog.ts`

```typescript
export type TalentCategory = "free" | "professional" | "specialty" | "premium" | "third_party";
export type PricingModel = "free" | "one_time" | "monthly";

export interface TalentDef {
  id: string;
  displayName: string;
  description: string;
  category: TalentCategory;
  domain: string;
  industryVertical: string | null;
  pricingModel: PricingModel;
  priceUsd: number;
  monthlyPriceUsd: number | null;
  associatedGears: string[];
}

/**
 * Per-tier Talent attachment caps.
 * Source of truth: pricing/clara-ai-business-tier-ladder.md
 */
export const TALENTS_PER_AGENT_BY_TIER: Record<string, number | null> = {
  basic: 5,
  pro: 7,
  max: 10,
  business: 15,
  enterprise: null,    // null = custom per contract; service must validate against contract terms
};

/**
 * Free Talents — always available, every plan can attach them.
 * No wallet charge. Counts against the per-agent attachment cap.
 */
export const FREE_TALENTS: TalentDef[] = [
  {
    id: "personal-assistant",
    displayName: "Personal Assistant",
    description: "General-purpose personal helper — calendar, email triage, note-taking",
    category: "free",
    domain: "personal",
    industryVertical: null,
    pricingModel: "free",
    priceUsd: 0,
    monthlyPriceUsd: null,
    associatedGears: ["calendar", "email", "notes"],
  },
  {
    id: "scheduling",
    displayName: "Scheduling",
    description: "Calendar management, meeting coordination, reminder logic",
    category: "free",
    domain: "personal",
    industryVertical: null,
    pricingModel: "free",
    priceUsd: 0,
    monthlyPriceUsd: null,
    associatedGears: ["calendar"],
  },
  {
    id: "email-triage",
    displayName: "Email Triage",
    description: "Read inbox, prioritize, draft replies",
    category: "free",
    domain: "personal",
    industryVertical: null,
    pricingModel: "free",
    priceUsd: 0,
    monthlyPriceUsd: null,
    associatedGears: ["email-personal"],
  },
  {
    id: "summarization",
    displayName: "Summarization",
    description: "Condense long content into key points",
    category: "free",
    domain: "personal",
    industryVertical: null,
    pricingModel: "free",
    priceUsd: 0,
    monthlyPriceUsd: null,
    associatedGears: [],
  },
  {
    id: "research",
    displayName: "Research",
    description: "Web research, source verification, structured findings",
    category: "free",
    domain: "personal",
    industryVertical: null,
    pricingModel: "free",
    priceUsd: 0,
    monthlyPriceUsd: null,
    associatedGears: ["web-search", "web-fetch"],
  },
];

/**
 * Professional Talents — $4.99 one-time, cross-industry work skills.
 */
export const PROFESSIONAL_TALENTS: TalentDef[] = [
  {
    id: "react",
    displayName: "React Development",
    description: "Component architecture, hooks, state management, modern React patterns",
    category: "professional",
    domain: "frontend",
    industryVertical: null,
    pricingModel: "one_time",
    priceUsd: 4.99,
    monthlyPriceUsd: null,
    associatedGears: ["github", "playwright"],
  },
  {
    id: "nextjs",
    displayName: "Next.js (App Router)",
    description: "Server components, ISR, middleware, App Router patterns",
    category: "professional",
    domain: "frontend",
    industryVertical: null,
    pricingModel: "one_time",
    priceUsd: 4.99,
    monthlyPriceUsd: null,
    associatedGears: ["github", "vercel"],
  },
  {
    id: "tailwind",
    displayName: "Tailwind CSS",
    description: "Utility-first CSS, design system implementation, responsive patterns",
    category: "professional",
    domain: "frontend",
    industryVertical: null,
    pricingModel: "one_time",
    priceUsd: 4.99,
    monthlyPriceUsd: null,
    associatedGears: [],
  },
  {
    id: "stripe-payments",
    displayName: "Stripe Payments",
    description: "Stripe Checkout, Connect, subscriptions, webhooks, refunds",
    category: "professional",
    domain: "backend",
    industryVertical: null,
    pricingModel: "one_time",
    priceUsd: 4.99,
    monthlyPriceUsd: null,
    associatedGears: ["stripe"],
  },
  {
    id: "quickbooks-bookkeeping",
    displayName: "QuickBooks Bookkeeping",
    description: "Reconciliation, invoicing, A/R, financial statements",
    category: "professional",
    domain: "business",
    industryVertical: null,
    pricingModel: "one_time",
    priceUsd: 4.99,
    monthlyPriceUsd: null,
    associatedGears: ["quickbooks"],
  },
  {
    id: "contract-drafting",
    displayName: "Contract Drafting (general)",
    description: "NDAs, service agreements, terms of service, privacy policies",
    category: "professional",
    domain: "business",
    industryVertical: null,
    pricingModel: "one_time",
    priceUsd: 4.99,
    monthlyPriceUsd: null,
    associatedGears: ["docusign"],
  },
  // ... seed file should include 15-20 more Professional Talents covering common backend, frontend, devops, business operations
];

/**
 * Specialty Talents — $9.99-$29.99, industry-specific.
 */
export const SPECIALTY_TALENTS: TalentDef[] = [
  {
    id: "barbershop-operations",
    displayName: "Barbershop Operations",
    description: "Booking flows, walk-in handling, deposit management, stylist scheduling",
    category: "specialty",
    domain: "industry",
    industryVertical: "barbershop",
    pricingModel: "one_time",
    priceUsd: 14.99,
    monthlyPriceUsd: null,
    associatedGears: ["calendar", "stripe"],
  },
  {
    id: "real-estate-transactions",
    displayName: "Real Estate Transactions",
    description: "Listing flows, showing scheduling, lead nurture, MLS data patterns",
    category: "specialty",
    domain: "industry",
    industryVertical: "real-estate",
    pricingModel: "one_time",
    priceUsd: 19.99,
    monthlyPriceUsd: null,
    associatedGears: ["mls-search", "calendar"],
  },
  {
    id: "rental-property-management",
    displayName: "Rental Property Management",
    description: "Booking holds, damage deposits, host payouts, guest comms",
    category: "specialty",
    domain: "industry",
    industryVertical: "rental",
    pricingModel: "one_time",
    priceUsd: 19.99,
    monthlyPriceUsd: null,
    associatedGears: ["stripe-connect", "calendar"],
  },
  {
    id: "restaurant-pos",
    displayName: "Restaurant POS Operations",
    description: "Order flows, table turnover, tip calculation, inventory tracking",
    category: "specialty",
    domain: "industry",
    industryVertical: "restaurant",
    pricingModel: "one_time",
    priceUsd: 24.99,
    monthlyPriceUsd: null,
    associatedGears: ["stripe", "inventory"],
  },
  // ... seed file should include 15-20 more Specialty Talents covering Mo's Heru verticals
];

/**
 * Premium Talents — $49.99+ one-time OR monthly subscription.
 * Liability-heavy or licensed-content domains.
 */
export const PREMIUM_TALENTS: TalentDef[] = [
  {
    id: "cpa-tax-prep",
    displayName: "CPA Tax Preparation",
    description: "Form 1040/1120/1065 prep patterns, tax code references, current-year updates",
    category: "premium",
    domain: "business",
    industryVertical: null,
    pricingModel: "monthly",
    priceUsd: 0,
    monthlyPriceUsd: 14.99,    // monthly because tax code changes
    associatedGears: ["tax-tables", "irs-forms"],
  },
  {
    id: "attorney-ip-law",
    displayName: "IP Law Practice (advisory only)",
    description: "Trademark, copyright, patent application patterns. NOT legal advice — drafts only.",
    category: "premium",
    domain: "business",
    industryVertical: null,
    pricingModel: "monthly",
    priceUsd: 0,
    monthlyPriceUsd: 24.99,
    associatedGears: ["uspto-search"],
  },
];

/**
 * Combined catalog for seeding.
 */
export const ALL_CURATED_TALENTS: TalentDef[] = [
  ...FREE_TALENTS,
  ...PROFESSIONAL_TALENTS,
  ...SPECIALTY_TALENTS,
  ...PREMIUM_TALENTS,
];
```

---

## Part 3 — Talent Service

**File:** `backend/src/services/talent.service.ts`

```typescript
import { Talent, UserTalent, AgentTalentAttachment, TalentPurchase, UserAgent } from "@/models";
import { TALENTS_PER_AGENT_BY_TIER, ALL_CURATED_TALENTS } from "./talent-catalog";
import { PLAN_LIMITS, type PlanTier } from "./plan-limits";
import { walletService } from "./wallet.service";
import logger from "@/lib/logger";

export class TalentService {
  /**
   * Browse Talent inventory available to the user.
   * Returns Free + curated paid + third-party (purchased OR available to purchase).
   */
  async browseInventory(userId: string, filters?: {
    category?: string;
    domain?: string;
    industryVertical?: string;
  }): Promise<Array<Talent & { owned: boolean; canAttach: boolean }>> {
    const where: any = { isPublic: true };
    if (filters?.category) where.category = filters.category;
    if (filters?.domain) where.domain = filters.domain;
    if (filters?.industryVertical) where.industryVertical = filters.industryVertical;

    const talents = await Talent.findAll({ where, order: [["category", "ASC"], ["displayName", "ASC"]] });
    const owned = await UserTalent.findAll({ where: { userId, subscriptionActive: true } });
    const ownedIds = new Set(owned.map((t: any) => t.talentId));

    return talents.map((t: any) => ({
      ...t.toJSON(),
      owned: ownedIds.has(t.id),
      canAttach: t.category === "free" || ownedIds.has(t.id),
    }));
  }

  /**
   * Acquire a Talent — free, one-time purchase, or monthly subscription.
   * Wallet is debited; entry created in user_talents library; purchase logged.
   */
  async acquire(userId: string, talentId: string): Promise<{ acquired: boolean; userTalentId: string }> {
    const talent = await Talent.findByPk(talentId);
    if (!talent) throw new Error(`talent_not_found:${talentId}`);

    const existing = await UserTalent.findOne({ where: { userId, talentId } });
    if (existing && existing.subscriptionActive) {
      return { acquired: true, userTalentId: existing.id };
    }

    if (talent.category === "free") {
      const userTalent = await UserTalent.create({
        userId, talentId,
        acquisitionType: "free",
        purchasePriceUsd: 0,
        subscriptionActive: true,
      });
      return { acquired: true, userTalentId: userTalent.id };
    }

    // Paid acquisition — debit wallet
    const price = talent.pricingModel === "monthly" ? talent.monthlyPriceUsd! : talent.priceUsd;
    await walletService.debit(userId, price, `talent:${talentId}:${talent.pricingModel}`);

    // Compute revenue split
    const isThirdParty = talent.publisherUserId !== null;
    const publisherShare = isThirdParty ? price * Number(talent.publisherRevenueShare) : 0;
    const claraRevenue = price - publisherShare;

    // Pay publisher (if third-party)
    if (isThirdParty && publisherShare > 0) {
      await walletService.creditPublisher(talent.publisherUserId!, publisherShare, `talent_sale:${talentId}`);
    }

    // Record purchase
    await TalentPurchase.create({
      userId, talentId,
      acquisitionType: talent.pricingModel === "monthly" ? "monthly_first" : "one_time",
      amountUsd: price,
      publisherUserId: talent.publisherUserId,
      publisherPayoutUsd: publisherShare,
      claraRevenueUsd: claraRevenue,
    });

    // Add to library
    const userTalent = await UserTalent.create({
      userId, talentId,
      acquisitionType: talent.pricingModel === "monthly" ? "subscription" : "purchase",
      purchasePriceUsd: price,
      subscriptionActive: true,
    });

    logger.info("talent_acquired", { userId, talentId, type: talent.pricingModel, price });
    return { acquired: true, userTalentId: userTalent.id };
  }

  /**
   * Attach a Talent to an agent. Enforces per-tier per-agent cap.
   */
  async attach(userId: string, tier: PlanTier, agentId: string, talentId: string): Promise<void> {
    // Verify ownership
    const owned = await UserTalent.findOne({
      where: { userId, talentId, subscriptionActive: true },
    });
    const talent = await Talent.findByPk(talentId);
    if (!talent) throw new Error(`talent_not_found`);
    if (talent.category !== "free" && !owned) throw new Error(`talent_not_owned`);

    // Verify agent ownership
    const agent = await UserAgent.findOne({ where: { id: agentId, userId } });
    if (!agent) throw new Error(`agent_not_found_or_not_owned`);

    // Check per-agent cap
    const cap = TALENTS_PER_AGENT_BY_TIER[tier];
    if (cap !== null) {
      const currentCount = await AgentTalentAttachment.count({ where: { userAgentId: agentId } });
      if (currentCount >= cap) {
        throw new Error(`talents_per_agent_cap_reached:${cap}`);
      }
    }

    // Already attached?
    const exists = await AgentTalentAttachment.findOne({ where: { userAgentId: agentId, talentId } });
    if (exists) return;

    await AgentTalentAttachment.create({
      userAgentId: agentId, talentId, userId,
    });

    logger.info("talent_attached", { userId, agentId, talentId });
  }

  async detach(userId: string, agentId: string, talentId: string): Promise<void> {
    await AgentTalentAttachment.destroy({
      where: { userAgentId: agentId, talentId, userId },
    });
  }

  async listAgentTalents(agentId: string): Promise<Talent[]> {
    const attachments = await AgentTalentAttachment.findAll({
      where: { userAgentId: agentId },
      include: [{ model: Talent }],
    });
    return attachments.map((a: any) => a.talent);
  }
}

export const talentService = new TalentService();
```

---

## Part 4 — Routes

**File:** `backend/src/routes/talents.ts`

```typescript
import { Router } from "express";
import { requireClaraOrClerk } from "@/middleware/api-key-auth";
import { talentService } from "@/services/talent.service";

const router = Router();

router.get("/", requireClaraOrClerk, async (req, res) => {
  const inventory = await talentService.browseInventory(req.claraUser!.userId, {
    category: req.query.category as string | undefined,
    domain: req.query.domain as string | undefined,
    industryVertical: req.query.industry as string | undefined,
  });
  res.json({ talents: inventory });
});

router.post("/acquire", requireClaraOrClerk, async (req, res) => {
  try {
    const result = await talentService.acquire(req.claraUser!.userId, req.body.talent_id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "error" });
  }
});

router.post("/attach", requireClaraOrClerk, async (req, res) => {
  try {
    await talentService.attach(
      req.claraUser!.userId,
      req.claraUser!.tier,
      req.body.agent_id,
      req.body.talent_id,
    );
    res.json({ attached: true });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "error" });
  }
});

router.post("/detach", requireClaraOrClerk, async (req, res) => {
  await talentService.detach(req.claraUser!.userId, req.body.agent_id, req.body.talent_id);
  res.json({ detached: true });
});

router.get("/agent/:agentId", requireClaraOrClerk, async (req, res) => {
  const talents = await talentService.listAgentTalents(req.params.agentId);
  res.json({ talents });
});

export default router;
```

Register in `backend/src/routes/index.ts`:
```typescript
import talentsRouter from "./talents";
app.use("/api/talents", talentsRouter);
```

---

## Part 5 — Memory Layer 0 Injection (Wire Talents into SOUL)

In the agent's session start, fetch all attached Talents and inject their `knowledge_content` into the agent's system prompt at Memory Layer 0 (the highest priority layer):

```typescript
// In agent inference prep (already wired by hook bus from prompt 26):
async function buildAgentSystemPrompt(agentId: string): Promise<string> {
  const baseSoul = await getAgentSoul(agentId);
  const talents = await talentService.listAgentTalents(agentId);
  const ipWrapper = AGENT_IP_WRAPPER;

  const talentSection = talents.length > 0
    ? `\n\n[ATTACHED TALENTS]\n${talents.map(t =>
        `## ${t.displayName}\n${t.knowledgeContent}`
      ).join("\n\n")}`
    : "";

  return [ipWrapper, baseSoul, talentSection].join("\n\n");
}
```

Talents become part of every inference call's system prompt. Agents "know" their attached Talents.

---

## Part 6 — Seed Script

**File:** `backend/src/scripts/seed-talents.ts`

```typescript
import { Talent } from "@/models";
import { ALL_CURATED_TALENTS } from "@/services/talent-catalog";

(async () => {
  for (const t of ALL_CURATED_TALENTS) {
    await Talent.upsert({
      ...t,
      knowledgeContent: `# ${t.displayName}\n\n${t.description}\n\n[knowledge content placeholder — to be populated]`,
    } as any);
  }
  console.log(`Seeded ${ALL_CURATED_TALENTS.length} curated Talents.`);
  process.exit(0);
})();
```

Add to `package.json`:
```json
"scripts": {
  "seed:talents": "tsx src/scripts/seed-talents.ts"
}
```

Run against all three environments after migration:
```bash
NODE_ENV=local npm run seed:talents
NODE_ENV=develop npm run seed:talents
NODE_ENV=production npm run seed:talents
```

The actual knowledge content (the system-prompt instructions for each Talent) is a separate authoring task — the seed creates placeholder rows; content fills in over time.

---

## Part 7 — Tests

```typescript
describe("TalentService", () => {
  describe("browseInventory", () => {
    it("returns Free Talents + curated paid + third-party");
    it("filters by category, domain, industry vertical");
    it("marks owned=true for Talents in user_talents");
    it("marks canAttach=true for Free OR owned Talents");
  });

  describe("acquire", () => {
    it("returns immediately for free Talents (no wallet debit)");
    it("debits wallet for one_time Talents");
    it("debits wallet for monthly subscription Talents");
    it("pays publisher 85% for third-party Talents");
    it("logs talent_purchases row");
    it("creates user_talents library entry");
    it("returns existing entry if already owned + active");
  });

  describe("attach", () => {
    it("attaches Free Talent without ownership check");
    it("rejects paid Talent attach if not owned");
    it("rejects if agent not owned by user");
    it("rejects if agent already at per-tier Talent cap");
    it("respects per-tier caps: 5/7/10/15 by tier");
    it("handles Enterprise null cap correctly (custom contract)");
    it("idempotent on duplicate attach");
  });

  describe("detach", () => {
    it("removes attachment without affecting library");
  });

  describe("System prompt injection", () => {
    it("injects all attached Talents into agent SOUL.md");
    it("excludes detached Talents from system prompt");
  });
});

describe("Routes", () => {
  it("GET /api/talents returns inventory with filters");
  it("POST /api/talents/acquire debits wallet + creates library entry");
  it("POST /api/talents/attach respects tier caps");
  it("GET /api/talents/agent/:id returns attached Talents");
});
```

---

## Acceptance Criteria

- [ ] `talents`, `user_talents`, `agent_talent_attachments`, `talent_purchases` tables in all three environments
- [ ] At least **5 Free Talents seeded** (personal-assistant, scheduling, email-triage, summarization, research)
- [ ] At least **15 Professional Talents** seeded across frontend/backend/business domains
- [ ] At least **10 Specialty Talents** seeded across Mo's Heru verticals (barbershop, real-estate, rental, restaurant, etc.)
- [ ] At least **2 Premium Talents** seeded (cpa-tax-prep, attorney-ip-law)
- [ ] Per-tier attachment caps enforced: 5 (Basic), 7 (Pro), 10 (Max), 15 (Business), null/custom (Enterprise)
- [ ] Wallet debit flow for paid Talents works end-to-end
- [ ] Third-party Talent purchases pay publisher 85% to their wallet, Clara keeps 15%
- [ ] Monthly-subscription Talents can lapse (subscription_active=false) and re-activate
- [ ] Talents inject into agent system prompt at Memory Layer 0
- [ ] Browse inventory route filters by category/domain/industry
- [ ] All endpoints require auth
- [ ] `npm run type-check` passes
- [ ] All tests pass
- [ ] CI thin-client gate passes

## Branch + PR

```bash
git checkout -b prompt/2026-04-23/14-talents-per-agent-tier-caps
git commit -m "feat(talents): per-tier Talent attachment caps + Talent library + wallet purchase + 85/15 third-party split"
gh pr create --base develop --title "feat(talents): Talent library + per-tier attachment caps + wallet purchase flow"
```
