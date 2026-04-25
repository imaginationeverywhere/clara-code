# SITE_OWNER ↔ Runtime Agent Interaction on Heru Sites

**TARGET REPO:** imaginationeverywhere/clara-code (platform) + embedded in every Heru via SDK
**Priority:** P0 — Beta blocker. Without this, site owners can't manage agents on their live Herus.
**Packages:** `backend/`, `packages/sdk/`, frontend component for Heru embedding
**Depends on:** prompt 11 (PLAN_LIMITS), prompt 15 (runtime agents), prompt 20 (template library)
**Milestone:** When a runtime agent is deployed on a Heru (FMO, WCR, KLS, etc.), the Heru's SITE_OWNER can chat with that agent — via voice or text — to request changes, see reports, modify behavior. Every change the agent proposes MUST pass Clara platform standards before taking effect. Customers (non-owners) only get the hired-agent experience; SITE_OWNERs get privileged control.

---

## What SITE_OWNER Can Do (through conversation)

- **Change site content**: "Update our hours to 9-6 weekdays" → agent updates copy + commits
- **Modify agent behavior**: "When customers ask about pricing, always offer a 10% discount for first-time bookings" → agent updates its instruction set (within allowed bounds)
- **Run reports**: "How many bookings did we have last week?" → agent queries their own database, returns summary
- **Approve/reject pending actions**: "That draft email to Jennifer — send it"
- **Set business rules**: "Don't take bookings after 8pm" → agent enforces going forward

## What SITE_OWNER CANNOT Do

Platform standards Clara enforces regardless of SITE_OWNER instruction:

- Bypass multi-tenant isolation (can't access another site's data)
- Disable the IP firewall (can't leak platform internals)
- Violate legal compliance (cannot instruct agent to lie about policies, ignore consent, etc.)
- Remove Clara branding / white-label on non-Enterprise tier
- Modify core payment/checkout flows (those flow through Stripe Connect with audited rules)

---

## Part 1 — Migration

**File:** `backend/migrations/023_site_owner_interactions.sql`

```sql
-- Per-site SITE_OWNER configuration overlay on a deployed runtime agent.
-- Stores SITE_OWNER-requested behavior tweaks. Merged into the agent's instruction set at runtime.

CREATE TABLE IF NOT EXISTS site_agent_deployments (
  id                       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_agent_id            UUID         NOT NULL REFERENCES user_agents(id) ON DELETE CASCADE,
  heru_slug                VARCHAR(100) NOT NULL,            -- e.g., "fmo", "wcr", "kls"
  site_owner_user_id       VARCHAR(255) NOT NULL,            -- Clerk user ID
  deployment_status        VARCHAR(50)  NOT NULL DEFAULT 'active',
  deployed_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_owner_instructions (
  id                       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id            UUID         NOT NULL REFERENCES site_agent_deployments(id) ON DELETE CASCADE,
  instruction              TEXT         NOT NULL,            -- "Always greet customers by name"
  category                 VARCHAR(50)  NOT NULL,            -- behavior / hours / pricing / inventory
  approved_by_platform     BOOLEAN      NOT NULL DEFAULT FALSE,
  platform_rejection_reason TEXT,
  effective_at             TIMESTAMPTZ,
  created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_owner_change_log (
  id                       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id            UUID         NOT NULL REFERENCES site_agent_deployments(id),
  site_owner_user_id       VARCHAR(255) NOT NULL,
  action_type              VARCHAR(50)  NOT NULL,            -- content / behavior / report / rule
  before_value             JSONB,
  after_value              JSONB,
  approved                 BOOLEAN      NOT NULL,
  created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deployments_heru ON site_agent_deployments (heru_slug, deployment_status);
CREATE INDEX IF NOT EXISTS idx_instructions_deployment ON site_owner_instructions (deployment_id, approved_by_platform);
```

---

## Part 2 — Platform Standards Validator

**File:** `backend/src/services/platform-standards.service.ts`

Every SITE_OWNER instruction passes through this validator before affecting the agent's runtime behavior.

```typescript
export interface ValidationResult {
  approved: boolean;
  rejectionReason?: string;
  sanitizedInstruction?: string;
}

const FORBIDDEN_INSTRUCTION_PATTERNS = [
  /disable.{0,20}(safety|firewall|standards)/i,
  /ignore.{0,20}(consent|compliance|terms)/i,
  /lie.{0,20}(about|to)/i,
  /access.{0,20}(other.{0,20}(site|tenant))/i,
  /remove.{0,20}clara.{0,20}branding/i,
  /bypass.{0,20}(payment|checkout|stripe)/i,
];

const RESTRICTED_CATEGORIES = new Set(["payment", "compliance", "multi_tenant", "branding"]);

export class PlatformStandardsService {
  async validate(instruction: string, category: string): Promise<ValidationResult> {
    // 1. Forbidden pattern scan
    for (const pattern of FORBIDDEN_INSTRUCTION_PATTERNS) {
      if (pattern.test(instruction)) {
        return {
          approved: false,
          rejectionReason: "Instruction violates platform standards (restricted action).",
        };
      }
    }

    // 2. Category restriction check
    if (RESTRICTED_CATEGORIES.has(category)) {
      return {
        approved: false,
        rejectionReason: `Category "${category}" requires platform approval. Contact support.`,
      };
    }

    // 3. Sanitize (strip any forbidden internal strings that might leak)
    const { sanitize } = await import("@/lib/ip-firewall");
    const sanitized = sanitize(instruction);

    return { approved: true, sanitizedInstruction: sanitized };
  }
}

export const platformStandards = new PlatformStandardsService();
```

---

## Part 3 — Site Owner Auth Middleware

**File:** `backend/src/middleware/require-site-owner.ts`

```typescript
import { SiteAgentDeployment } from "@/models";

export async function requireSiteOwner(req, res, next) {
  const deploymentId = req.params.deploymentId || req.body.deployment_id;
  const userId = req.claraUser?.userId;
  if (!userId) { res.status(401).json({ error: "unauthorized" }); return; }

  const deployment = await SiteAgentDeployment.findByPk(deploymentId);
  if (!deployment) { res.status(404).json({ error: "deployment_not_found" }); return; }
  if (deployment.siteOwnerUserId !== userId) {
    res.status(403).json({ error: "not_site_owner" });
    return;
  }

  req.deployment = deployment;
  next();
}
```

---

## Part 4 — Site Owner API Routes

**File:** `backend/src/routes/site-owner.ts`

```typescript
import { Router } from "express";
import { requireClaraOrClerk } from "@/middleware/api-key-auth";
import { requireSiteOwner } from "@/middleware/require-site-owner";
import { platformStandards } from "@/services/platform-standards.service";
import {
  SiteAgentDeployment, SiteOwnerInstruction, SiteOwnerChangeLog,
} from "@/models";

const router = Router();

// GET /api/site-owner/deployments — list deployments this user is SITE_OWNER of
router.get("/deployments", requireClaraOrClerk, async (req, res) => {
  const deployments = await SiteAgentDeployment.findAll({
    where: { siteOwnerUserId: req.claraUser!.userId, deploymentStatus: "active" },
  });
  res.json({ deployments });
});

// POST /api/site-owner/deployments/:deploymentId/instruct
// Voice or text instruction; validates + queues for agent next turn
router.post("/deployments/:deploymentId/instruct",
  requireClaraOrClerk, requireSiteOwner,
  async (req, res) => {
    const { instruction, category = "behavior" } = req.body;

    const validation = await platformStandards.validate(instruction, category);
    if (!validation.approved) {
      await SiteOwnerInstruction.create({
        deploymentId: req.deployment.id,
        instruction,
        category,
        approvedByPlatform: false,
        platformRejectionReason: validation.rejectionReason,
      });
      res.status(400).json({
        error: "platform_rejected",
        reason: validation.rejectionReason,
      });
      return;
    }

    const saved = await SiteOwnerInstruction.create({
      deploymentId: req.deployment.id,
      instruction: validation.sanitizedInstruction!,
      category,
      approvedByPlatform: true,
      effectiveAt: new Date(),
    });

    res.status(201).json({ instruction: saved });
  });

// GET /api/site-owner/deployments/:deploymentId/instructions
router.get("/deployments/:deploymentId/instructions",
  requireClaraOrClerk, requireSiteOwner,
  async (req, res) => {
    const instructions = await SiteOwnerInstruction.findAll({
      where: { deploymentId: req.deployment.id, approvedByPlatform: true },
      order: [["created_at", "DESC"]],
    });
    res.json({ instructions });
  });

// POST /api/site-owner/deployments/:deploymentId/revert
// Undo a specific instruction
router.post("/deployments/:deploymentId/revert/:instructionId",
  requireClaraOrClerk, requireSiteOwner,
  async (req, res) => {
    await SiteOwnerInstruction.update(
      { approvedByPlatform: false, platformRejectionReason: "reverted by site owner" },
      { where: { id: req.params.instructionId } },
    );
    res.json({ reverted: true });
  });

// GET /api/site-owner/deployments/:deploymentId/report?metric=bookings&period=week
// Agent-generated report
router.get("/deployments/:deploymentId/report",
  requireClaraOrClerk, requireSiteOwner,
  async (req, res) => {
    // Delegate to the deployed agent to generate the report
    // (invokes the agent with system instruction "You are reporting to your SITE_OWNER.")
    const { metric, period } = req.query;
    // ... agent invocation with SITE_OWNER context ...
    res.json({ report: "<generated by agent>" });
  });

export default router;
```

---

## Part 5 — Runtime Agent Integration

When a deployed agent serves a request, load SITE_OWNER instructions into the system prompt:

```typescript
async function buildAgentSystemPrompt(deploymentId: string): Promise<string> {
  const deployment = await SiteAgentDeployment.findByPk(deploymentId, {
    include: [{ model: UserAgent }],
  });
  const baseSoul = deployment.userAgent.soulMd;
  const ipWrapper = AGENT_IP_WRAPPER;

  const activeInstructions = await SiteOwnerInstruction.findAll({
    where: { deploymentId, approvedByPlatform: true },
    order: [["created_at", "ASC"]],
  });

  const ownerOverlay = activeInstructions.length > 0
    ? `\n\n[SITE OWNER INSTRUCTIONS — follow these in priority order]\n${activeInstructions.map((i) => `- ${i.instruction}`).join("\n")}`
    : "";

  return [ipWrapper, baseSoul, ownerOverlay].join("\n\n");
}
```

Platform standards STILL win — the IP firewall output filter runs on every response regardless of SITE_OWNER instructions.

---

## Part 6 — Voice Flow for SITE_OWNER

When SITE_OWNER talks to the agent via the admin dashboard (or signed-in on the Heru site), the voice handler routes through the SITE_OWNER-privileged endpoint. The agent knows it's speaking to the owner, not a customer, and responds accordingly.

System prompt injection at runtime:
```
[RUNTIME CONTEXT]
You are {{agent_name}} deployed on the {{heru_name}} site.
You are currently speaking to the SITE_OWNER ({{owner_name}}).
The SITE_OWNER can request changes to site content, behavior rules, and run reports.
Every change must pass platform standards — if a request violates them, decline politely and explain.
```

---

## Part 7 — SDK Component for Heru Embedding

**File:** `packages/sdk/src/components/SiteOwnerPanel.tsx`

A React component Herus embed in their admin dashboard:

```tsx
export function SiteOwnerPanel({ deploymentId, agentName }: Props) {
  // Voice + text input → POST /api/site-owner/deployments/:deploymentId/instruct
  // Shows chat transcript + active instructions list + revert buttons
}
```

Each Heru imports this once; Clara handles the rest.

---

## Part 8 — Tests

```typescript
describe("PlatformStandards", () => {
  it("rejects instructions matching forbidden patterns");
  it("rejects restricted categories (payment, compliance, multi_tenant, branding)");
  it("sanitizes IP-forbidden strings before approval");
  it("approves clean business instructions");
});

describe("Site owner routes", () => {
  it("GET /deployments lists only user's deployments");
  it("POST /instruct accepts approved instructions");
  it("POST /instruct returns 400 with reason on rejection");
  it("GET /instructions returns approved-only");
  it("POST /revert marks instruction inactive");
  it("requireSiteOwner returns 403 for non-owner");
});

describe("Agent runtime overlay", () => {
  it("includes SITE_OWNER instructions in system prompt");
  it("IP firewall still filters output after SITE_OWNER instructions applied");
  it("does not apply rejected or reverted instructions");
});
```

---

## Acceptance Criteria

- [ ] `site_agent_deployments`, `site_owner_instructions`, `site_owner_change_log` tables in all three environments
- [ ] `PlatformStandardsService.validate` rejects the 6 forbidden pattern categories
- [ ] `/api/site-owner/deployments/:id/instruct` validates then persists instructions
- [ ] Rejection reasons explicit and actionable
- [ ] Every agent runtime merges approved SITE_OWNER instructions into system prompt
- [ ] IP firewall still runs on output (defense in depth — SITE_OWNER can't bypass)
- [ ] `requireSiteOwner` enforces ownership (403 on non-owner)
- [ ] Revert / undo flow works
- [ ] `SiteOwnerPanel` SDK component works in a test Heru embed
- [ ] `npm run type-check` passes
- [ ] All tests pass
- [ ] CI thin-client gate passes

## Branch + PR

```bash
git checkout -b prompt/2026-04-23/23-site-owner-agent-interaction
git commit -m "feat(platform): SITE_OWNER ↔ runtime agent conversational control with platform-standards validation"
gh pr create --base develop --title "feat(platform): SITE_OWNER agent interaction on Heru sites"
```
