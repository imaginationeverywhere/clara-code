# Builder Agents vs Runtime Agents — Two-Phase Model

**TARGET REPO:** imaginationeverywhere/clara-code
**Priority:** P1 — depends on prompt 14 (skills) and prompt 12 (capability scope)
**Packages:** `backend/`
**Milestone:** A user building an Airbnb platform needs two different kinds of agents. Builder agents construct the product. Runtime agents operate it. Same industry skill, dual interpretation. This distinction unlocks what Small Business ($299) is actually selling.

---

## The Two Phases

**Someone who wants to build an Airbnb-style rental platform needs:**

### Phase 1 — Builder Agents (Build the Platform)

The harness agents in your Clara workspace during development. These are the engineers.

| Agent | Skills | What They Do |
|-------|--------|-------------|
| Frontend Engineer | React, Next.js, Tailwind, `rental` | Builds listing pages, calendar UI, search/filter |
| Backend Engineer | PostgreSQL, Stripe Connect, `rental` | Implements booking holds, payouts, availability logic |
| DevOps | AWS, CI/CD, Docker | Deploys and runs the platform infrastructure |

The `rental` industry vertical skill — for a **builder agent** — means:
- Calendar availability state machine (hold → confirm → expire)
- Stripe Connect for split payments (platform fee + host payout)
- Damage deposit hold and release patterns
- Multi-tenant host/guest data isolation
- Booking status lifecycle (pending → confirmed → checked-in → reviewed)

**Available at:** Basic ($39, 3 slots). Three agents with technical skills can build this platform.

---

### Phase 2 — Runtime Agents (Run the Platform)

Agents the platform owner builds using Clara, then deploys INTO their product to operate it 24/7. These are the staff.

| Agent | Skills | What They Do |
|-------|--------|-------------|
| Guest Inquiry Agent | voice-persona-design, conversation-flow-design, `rental` | Answers availability questions, handles booking requests |
| Host Onboarding Agent | conversation-flow-design, memory-configuration, `rental` | Guides new hosts through listing setup |
| Booking Confirmation Agent | voice-audio-patterns, `rental` | Confirms reservations, handles change requests |
| Dispute Resolution Agent | conversation-flow-design, voice-persona-design, `rental` | Mediates host/guest conflicts |

The `rental` industry vertical skill — for a **runtime agent** — means:
- How to explain the cancellation policy in clear spoken language
- How to handle "my host isn't responding" as a conversation, not a code path
- How to talk a guest through check-in instructions step by step
- How to defuse a damage dispute while staying neutral
- When to escalate to a human vs when to resolve autonomously

**Available at:** Small Business ($299, `canBuildAgents: true`). This is the unlock. You cannot build runtime agents until you have this flag.

---

## The Skill Dual Interpretation

The same industry vertical skill carries two interpretations depending on the agent's phase:

```typescript
export type AgentPhase = "builder" | "runtime";

interface SkillInterpretation {
  skill: string;
  phase: AgentPhase;
  primaryFocus: string;
  exampleCapability: string;
}

const RENTAL_INTERPRETATIONS: SkillInterpretation[] = [
  {
    skill: "rental",
    phase: "builder",
    primaryFocus: "code patterns",
    exampleCapability: "Implement Stripe Connect split payments with booking hold and host payout release",
  },
  {
    skill: "rental",
    phase: "runtime",
    primaryFocus: "conversation patterns",
    exampleCapability: "Walk a guest through the host refund policy without escalating to human support",
  },
];
```

Clara injects the correct interpretation into the agent's memory context based on its declared phase.

---

## Part 1 — Agent Phase Column

**File:** `backend/migrations/015_agent_phase.sql`

```sql
-- Add phase column to agents table.
-- "builder" agents have technical skills; they write code.
-- "runtime" agents have conversational skills; they talk to end users.
-- Run: psql $DATABASE_URL -f backend/migrations/015_agent_phase.sql

ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS phase VARCHAR(20) NOT NULL DEFAULT 'builder'
    CHECK (phase IN ('builder', 'runtime'));

-- Index for filtering agents by phase in a user's workspace
CREATE INDEX IF NOT EXISTS idx_agents_user_phase
  ON agents (user_id, phase);

COMMENT ON COLUMN agents.phase IS
  'builder = dev team that builds products; runtime = deployed agents that operate products';
```

Run against all three environments.

---

## Part 2 — Phase Constants and Skill Defaults

**File:** `backend/src/services/agent-phase.service.ts`

```typescript
import type { AgentPhase } from "@/types/agent";

/**
 * Default skill bundles by phase.
 * Builder agents get technical skills. Runtime agents get conversational craft skills.
 * Industry verticals appear in BOTH — with different system prompt interpretation.
 */
export const DEFAULT_BUILDER_SKILLS: string[] = [
  "react",
  "nodejs",
  "postgresql",
  "typescript",
  "stripe-connect",
];

export const DEFAULT_RUNTIME_SKILLS: string[] = [
  "voice-persona-design",
  "conversation-flow-design",
  "voice-audio-patterns",
  "memory-configuration",
];

/**
 * Industry vertical skills that have dual interpretation.
 * When attached to a builder agent: teaches code patterns.
 * When attached to a runtime agent: teaches conversation patterns.
 */
export const DUAL_INTERPRETATION_SKILLS: string[] = [
  "rental",
  "barbershop",
  "delivery",
  "fintech",
  "restaurant",
  "healthcare",
  "legal",
  "fitness",
  "real-estate",
  "ecommerce",
];

/**
 * Phase-specific context prefix injected into memory Layer 0
 * (active skills), BEFORE the skill knowledge content.
 * This tells the LLM how to interpret the industry vertical skill.
 */
export function getPhaseContextPrefix(phase: AgentPhase): string {
  if (phase === "builder") {
    return [
      "[AGENT PHASE: BUILDER]",
      "You are a development agent. When you apply industry vertical skills,",
      "interpret them as CODE PATTERNS: data models, API flows, payment logic,",
      "UI components, and integration architecture.",
      "You write code, not conversations.",
    ].join(" ");
  }

  return [
    "[AGENT PHASE: RUNTIME]",
    "You are an operational agent deployed inside a live product.",
    "When you apply industry vertical skills, interpret them as CONVERSATION PATTERNS:",
    "how to talk to customers, how to handle requests, how to explain policies.",
    "You speak to end users, not to developers.",
  ].join(" ");
}

/**
 * Validate that a skill is appropriate for the agent's phase.
 * Runtime agents cannot hold builder-only skills (raw code skills without UX).
 * Builder agents can hold any skill.
 */
const BUILDER_ONLY_SKILLS = new Set([
  "ci-cd",
  "docker",
  "kubernetes",
  "terraform",
  "aws-infrastructure",
  "database-migrations",
  "graphql-schema-design",
]);

const RUNTIME_ONLY_SKILLS = new Set([
  "voice-persona-design",
  "conversation-flow-design",
  "voice-audio-patterns",
  "agent-skill-selection",
]);

export function isSkillCompatible(skill: string, phase: AgentPhase): boolean {
  if (phase === "runtime" && BUILDER_ONLY_SKILLS.has(skill)) return false;
  if (phase === "builder" && RUNTIME_ONLY_SKILLS.has(skill)) return false;
  return true;
}

export class AgentPhaseService {
  /**
   * Get the default skill set for a newly created agent based on its phase.
   * Industry vertical is added separately at onboarding.
   */
  getDefaultSkills(phase: AgentPhase): string[] {
    return phase === "builder"
      ? [...DEFAULT_BUILDER_SKILLS]
      : [...DEFAULT_RUNTIME_SKILLS];
  }

  /**
   * Build the phase context prefix for memory injection (Layer 0).
   * This is prepended to the active skills block before inference.
   */
  buildPhaseContext(phase: AgentPhase, industryVertical?: string): string {
    const prefix = getPhaseContextPrefix(phase);
    if (!industryVertical) return prefix;

    const verticalNote =
      phase === "builder"
        ? `\nFor the ${industryVertical} industry: apply code patterns, data models, and integration flows.`
        : `\nFor the ${industryVertical} industry: apply conversation patterns, customer scripts, and operational knowledge.`;

    return prefix + verticalNote;
  }

  /**
   * Check whether a user's tier allows them to create runtime agents.
   * canBuildAgents = true is required to create runtime agents.
   * Builder agents are available at all paid tiers.
   */
  canCreateRuntimeAgent(canBuildAgents: boolean): boolean {
    return canBuildAgents;
  }
}

export const agentPhaseService = new AgentPhaseService();
```

---

## Part 3 — Inject Phase Context Into Memory Build

**File:** `backend/src/services/agent-memory.service.ts` (modify existing)

In `buildMemoryContext()`, inject the phase prefix at Layer 0 (before skills):

```typescript
import { agentPhaseService } from "@/services/agent-phase.service";
import type { AgentPhase } from "@/types/agent";

// In buildMemoryContext():
async buildMemoryContext(
  agentId: string,
  userId: string,
  phase: AgentPhase,
  industryVertical?: string,
): Promise<string[]> {
  const layers: string[] = [];

  // Layer 0a: Phase context (first — sets interpretation frame)
  layers.push(agentPhaseService.buildPhaseContext(phase, industryVertical));

  // Layer 0b: Active skill knowledge modules
  const skills = await this.getActiveSkills(agentId);
  for (const skill of skills) {
    layers.push(skill.knowledgeContent);
  }

  // Layer 1: Global user profile
  layers.push(await this.getUserProfile(userId));

  // Layer 2: Agent's own memory summary
  layers.push(await this.getAgentMemorySummary(agentId));

  // Layer 3: Inbox messages
  layers.push(await this.getInboxMessages(agentId));

  // Layer 4: Recent conversation turns (handled by caller, not stored here)

  return layers.filter(Boolean);
}
```

---

## Part 4 — Onboarding Flow: Phase Declaration

When a paid user creates their first agent, Clara asks one question to determine phase:

**File:** `backend/src/services/agent-onboarding.service.ts`

```typescript
export type OnboardingIntent =
  | "build_a_product"     // Phase: builder — I want to build a website/app/platform
  | "run_my_business"     // Phase: runtime — I want agents that talk to my customers
  | "both";               // Phase: will need both — user needs to understand the unlock

export function resolvePhaseFromIntent(intent: OnboardingIntent): AgentPhase | "both" {
  if (intent === "build_a_product") return "builder";
  if (intent === "run_my_business") return "runtime";
  return "both";
}

/**
 * The single onboarding question Clara asks.
 * Spoken in voice, displayed in UI.
 */
export const ONBOARDING_PHASE_QUESTION =
  "Are you here to build a product — like a website or app — or do you want " +
  "agents that run your business and talk to your customers?";

/**
 * If user says "both" or "Airbnb" (they want to build a platform AND have it staffed):
 * Clara explains the two-phase unlock and what tier enables it.
 */
export function buildBothPhaseExplainer(currentTier: string): string {
  const canBuildAgents = ["small_business", "enterprise"].includes(currentTier);

  if (canBuildAgents) {
    return [
      "You're in good shape. Your plan supports both.",
      "First we'll build your platform — frontend, backend, and infrastructure agents.",
      "Once it's live, we'll build the agents that operate it: guest service, booking confirmation,",
      "host onboarding — whatever your platform needs to run 24/7.",
      "Let's start with the build team. What kind of platform?",
    ].join(" ");
  }

  return [
    "To build the platform, your current plan works great — three agents can build almost any website.",
    "To ALSO have agents that run the platform and talk to your customers,",
    "you'll need the Small Business plan. That's where we build the operational layer.",
    "Want to start building the platform now and upgrade when it's ready to launch?",
  ].join(" ");
}
```

---

## Part 5 — Route: Create Agent with Phase

**File:** `backend/src/routes/agents.ts`

In `POST /api/agents`, accept and validate the `phase` field:

```typescript
import { agentPhaseService } from "@/services/agent-phase.service";
import { PLAN_LIMITS } from "@/services/usage-tracking.service";

// POST /api/agents
router.post("/", requireAuth, async (req, res) => {
  const { name, soulMd, phase = "builder", industryVertical, skills = [] } = req.body;
  const { userId, tier } = req.claraUser;

  const limits = PLAN_LIMITS[tier];

  // Runtime agents require canBuildAgents
  if (phase === "runtime" && !limits.canBuildAgents) {
    res.status(403).json({
      error: "plan_limit",
      message:
        "Building runtime agents requires the Small Business plan. " +
        "Your current plan supports builder agents — the dev team that creates your product.",
      upgrade_url: "https://claracode.ai/pricing",
    });
    return;
  }

  // Validate skill compatibility with phase
  const incompatibleSkills = skills.filter(
    (skill: string) => !agentPhaseService.isSkillCompatible(skill, phase),
  );
  if (incompatibleSkills.length > 0) {
    res.status(400).json({
      error: "skill_phase_mismatch",
      message: `These skills are not compatible with ${phase} agents: ${incompatibleSkills.join(", ")}`,
    });
    return;
  }

  // Create the agent
  const agent = await Agent.create({
    userId,
    name,
    soulMd: agentConfigService.sanitizeSoulMd(soulMd ?? "", name),
    phase,
    industryVertical: industryVertical ?? null,
  });

  // Attach default skills if none provided
  const skillsToAttach =
    skills.length > 0 ? skills : agentPhaseService.getDefaultSkills(phase);
  await agentSkillService.attachSkills(agent.id, skillsToAttach);

  res.status(201).json({ agent });
});
```

---

## Part 6 — Tests

```typescript
describe("Agent Phase", () => {
  describe("AgentPhaseService", () => {
    it("getDefaultSkills(builder) returns technical skills");
    it("getDefaultSkills(runtime) returns conversational craft skills");
    it("isSkillCompatible: builder cannot hold voice-persona-design");
    it("isSkillCompatible: runtime cannot hold ci-cd");
    it("isSkillCompatible: rental is compatible with both phases");
    it("buildPhaseContext includes phase prefix and vertical note");
  });

  describe("Onboarding", () => {
    it("resolvePhaseFromIntent(build_a_product) returns builder");
    it("resolvePhaseFromIntent(run_my_business) returns runtime");
    it("buildBothPhaseExplainer: small_business tier enables both");
    it("buildBothPhaseExplainer: basic tier explains upgrade path");
  });

  describe("Route: POST /api/agents", () => {
    it("creates builder agent without canBuildAgents");
    it("blocks runtime agent creation on basic tier (canBuildAgents: false)");
    it("allows runtime agent creation on small_business tier");
    it("returns 400 on skill/phase mismatch");
    it("attaches default skills when none provided");
    it("sanitizes SOUL.md before storing");
  });

  describe("Memory Context", () => {
    it("builder phase prefix appears before skill content in Layer 0");
    it("runtime phase prefix directs toward conversation patterns");
    it("industry vertical note is appended when vertical is set");
  });
});
```

---

## Acceptance Criteria

- [ ] `agents.phase` column with `CHECK (phase IN ('builder', 'runtime'))`
- [ ] `POST /api/agents` accepts `phase` field; defaults to `'builder'`
- [ ] Creating a `runtime` agent on basic/pro/max tier returns 403 with upgrade URL
- [ ] Small Business + Enterprise can create runtime agents
- [ ] Builder and runtime phases get different default skill sets
- [ ] Builder-only skills (ci-cd, docker, kubernetes) blocked on runtime agents
- [ ] Runtime-only skills (voice-persona-design, conversation-flow-design) blocked on builder agents
- [ ] Industry vertical skills (rental, barbershop, etc.) are compatible with both phases
- [ ] Phase context prefix injected at memory Layer 0 (before skill content)
- [ ] Prefix directs builder agents toward code patterns; runtime agents toward conversation patterns
- [ ] Onboarding question resolves phase; "both" triggers upgrade explainer for lower tiers
- [ ] `npm run type-check` passes
- [ ] All tests pass

## Branch + PR

```bash
git checkout -b prompt/2026-04-23/15-builder-vs-runtime-agents
git commit -m "feat(agents): builder vs runtime phase — two-tier agent model, phase-aware skills, onboarding flow"
gh pr create --base develop --title "feat(agents): builder vs runtime agent phases — capability scope, skill validation, onboarding"
```
