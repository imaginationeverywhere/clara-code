# /config-agent Command — Voice-First Agent Configuration

**TARGET REPO:** imaginationeverywhere/clara-code
**Priority:** P0 — Beta blocker. Without this, VPs can't customize their team.
**Packages:** `packages/cli/`, `backend/`
**Milestone:** `/config-agent` command lets Vibe Professionals configure the AI hires on their team — pick a role from Clara's starter library, name them, give them a voice, attach skills, tweak personality — via both CLI text AND voice dialogue. Customer framing: *these are YOUR team members*, not "rented agents." Complements the existing `/clara-agents` command (which spawns the team into a working session).

---

## Distinction from `/clara-agents`

- **`/clara-agents`** (ALREADY EXISTS) — spawns the harness team in the current session for actual build work
- **`/config-agent`** (THIS PROMPT) — lets the VP configure/reconfigure their agents (the meta action)

Workflow:
```
VP opens CLI → /config-agent → picks template → names it "Marcus" → clones voice → attaches skills → done
Next session → /clara-agents → team spins up WITH Marcus as one of the agents → work happens
```

## The Voice Flow

VP says: *"Clara, config agent."*
Clara responds: *"Let's configure a new agent. What role do you need — frontend engineer, accountant, publicist, or something else?"*
VP: *"An accountant."*
Clara: *"Perfect. Name them?"*
VP: *"Marcus."*
Clara: *"Want to use your voice, or pick one from our library?"*
VP: *"Use my voice. Record me."*
Clara: *"Ready when you are — say a short sentence."*
[VP records 5 seconds; XTTS clones.]
Clara: *"Got it. Which skills should Marcus have? I can read our accounting bundle: QuickBooks, Stripe, tax prep, 1099 forms, invoicing. Attach all?"*
VP: *"Yes."*
Clara: *"Marcus is configured. He'll join your team next session."*

---

## Part 1 — Migration

**File:** `backend/migrations/019_user_agents.sql`

```sql
-- User-configured agents (instances cloned from Clara templates).
-- Run: psql $DATABASE_URL -f backend/migrations/019_user_agents.sql

CREATE TABLE IF NOT EXISTS user_agents (
  id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            VARCHAR(255)  NOT NULL,
  template_id        VARCHAR(100)  NOT NULL,             -- FK to agent_templates
  name               VARCHAR(100)  NOT NULL,              -- VP-chosen
  voice_id           VARCHAR(100)  NOT NULL,              -- cloned or from library
  attached_skills    JSONB         NOT NULL DEFAULT '[]',
  personality_tweaks JSONB         NOT NULL DEFAULT '{}',
  soul_md            TEXT          NOT NULL,              -- composed from template + tweaks
  is_active          BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_agents_user_active
  ON user_agents (user_id, is_active);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_agents_user_name
  ON user_agents (user_id, LOWER(name)) WHERE is_active = TRUE;
```

---

## Part 2 — ConfigAgentService

**File:** `backend/src/services/config-agent.service.ts`

```typescript
import { UserAgent } from "@/models/UserAgent";
import { AgentTemplate } from "@/models/AgentTemplate";
import { PLAN_LIMITS, type PlanTier } from "./plan-limits";
import { voiceCloneService } from "./voice-clone.service";
import logger from "@/lib/logger";

export interface ConfigureAgentInput {
  userId: string;
  tier: PlanTier;
  templateId: string;
  name: string;
  voice: { source: "library"; voiceId: string } | { source: "clone"; audioBase64: string };
  skillIds: string[];
  personalityTweaks?: Record<string, string>;
}

export class ConfigAgentService {
  async configure(input: ConfigureAgentInput): Promise<UserAgent> {
    const limits = PLAN_LIMITS[input.tier];

    // Enforce harness count cap
    const existing = await UserAgent.count({
      where: { userId: input.userId, isActive: true },
    });
    if (existing >= limits.harnessAgentSlots) {
      throw new Error(`harness_limit_reached:${limits.harnessAgentSlots}`);
    }

    // Enforce skills-per-agent cap
    if (limits.skillsPerAgent !== null && input.skillIds.length > limits.skillsPerAgent) {
      throw new Error(`skills_per_agent_exceeded:${limits.skillsPerAgent}`);
    }

    // Resolve template
    const template = await AgentTemplate.findByPk(input.templateId);
    if (!template) throw new Error(`unknown_template:${input.templateId}`);

    // Resolve voice
    let voiceId: string;
    if (input.voice.source === "clone") {
      voiceId = await voiceCloneService.cloneFromSample(input.userId, input.voice.audioBase64);
    } else {
      voiceId = input.voice.voiceId;
    }

    // Compose SOUL.md
    const soulMd = this.composeSoulMd(template, input.name, input.personalityTweaks);

    // Create
    const agent = await UserAgent.create({
      userId: input.userId,
      templateId: input.templateId,
      name: input.name,
      voiceId,
      attachedSkills: input.skillIds,
      personalityTweaks: input.personalityTweaks ?? {},
      soulMd,
    });

    logger.info("user_agent_configured", {
      userId: input.userId, agentId: agent.id, templateId: input.templateId, name: input.name,
    });
    return agent;
  }

  private composeSoulMd(
    template: AgentTemplate,
    agentName: string,
    tweaks?: Record<string, string>,
  ): string {
    let soul = template.soulMdTemplate.replace(/\{AGENT_NAME\}/g, agentName);
    if (tweaks) {
      for (const [k, v] of Object.entries(tweaks)) {
        soul = soul.replace(new RegExp(`\\{TWEAK_${k.toUpperCase()}\\}`, "g"), v);
      }
    }
    return soul;
  }

  async retireAgent(userId: string, agentId: string): Promise<void> {
    const agent = await UserAgent.findOne({ where: { id: agentId, userId } });
    if (!agent) throw new Error("not_found");
    await agent.update({ isActive: false });
  }

  async listActiveAgents(userId: string): Promise<UserAgent[]> {
    return await UserAgent.findAll({
      where: { userId, isActive: true },
      order: [["createdAt", "ASC"]],
    });
  }
}

export const configAgentService = new ConfigAgentService();
```

---

## Part 3 — Backend Routes

**File:** `backend/src/routes/agents.ts`

```typescript
import { Router } from "express";
import { requireClaraOrClerk } from "@/middleware/api-key-auth";
import { configAgentService } from "@/services/config-agent.service";
import { AgentTemplate } from "@/models/AgentTemplate";

const router = Router();

// GET /api/agents/templates — list available templates for the user's tier
router.get("/templates", requireClaraOrClerk, async (req, res) => {
  const templates = await AgentTemplate.findAll({
    where: { isPublic: true },
    order: [["category", "ASC"], ["displayName", "ASC"]],
  });
  res.json({ templates });
});

// GET /api/agents — list user's configured agents
router.get("/", requireClaraOrClerk, async (req, res) => {
  const agents = await configAgentService.listActiveAgents(req.claraUser!.userId);
  res.json({ agents });
});

// POST /api/agents/configure — create a new configured agent
router.post("/configure", requireClaraOrClerk, async (req, res) => {
  try {
    const agent = await configAgentService.configure({
      userId: req.claraUser!.userId,
      tier: req.claraUser!.tier,
      templateId: req.body.template_id,
      name: req.body.name,
      voice: req.body.voice,
      skillIds: req.body.skill_ids ?? [],
      personalityTweaks: req.body.personality_tweaks,
    });
    res.status(201).json({ agent });
  } catch (err) {
    const message = err instanceof Error ? err.message : "error";
    res.status(400).json({ error: message });
  }
});

// DELETE /api/agents/:id — retire an agent (soft delete)
router.delete("/:id", requireClaraOrClerk, async (req, res) => {
  try {
    await configAgentService.retireAgent(req.claraUser!.userId, req.params.id);
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "not_found" });
  }
});

export default router;
```

Register in `backend/src/routes/index.ts`:
```typescript
import agentsRouter from "./agents";
app.use("/api/agents", agentsRouter);
```

---

## Part 4 — CLI Command: `/config-agent`

**File:** `packages/cli/src/commands/config-agent.ts`

```typescript
import { Command } from "commander";
import prompts from "prompts";
import { fetchTemplates, configureAgent } from "@/api";
import { captureVoiceSample } from "@/audio-capture";

export function registerConfigAgentCommand(program: Command) {
  program
    .command("config-agent")
    .alias("configure-agent")
    .description("Configure a new harness agent for your team")
    .action(async () => {
      const templates = await fetchTemplates();

      // Category → template picker
      const cats = Array.from(new Set(templates.map((t) => t.category)));
      const { category } = await prompts({
        type: "select",
        name: "category",
        message: "What kind of agent?",
        choices: cats.map((c) => ({ title: c, value: c })),
      });
      const inCat = templates.filter((t) => t.category === category);
      const { templateId } = await prompts({
        type: "select",
        name: "templateId",
        message: "Which template?",
        choices: inCat.map((t) => ({ title: `${t.displayName} — ${t.shortDescription}`, value: t.id })),
      });

      // Name
      const { name } = await prompts({ type: "text", name: "name", message: "Name them" });

      // Voice
      const { voiceChoice } = await prompts({
        type: "select",
        name: "voiceChoice",
        message: "Voice",
        choices: [
          { title: "Clone my voice (5-sec sample)", value: "clone" },
          { title: "Pick from Clara's library", value: "library" },
        ],
      });

      let voice;
      if (voiceChoice === "clone") {
        console.log("Speak a sentence when ready. Press Ctrl+Space to start.");
        const audioBase64 = await captureVoiceSample({ durationSeconds: 5 });
        voice = { source: "clone", audioBase64 };
      } else {
        const { voiceId } = await prompts({
          type: "select",
          name: "voiceId",
          message: "Library voice",
          choices: [
            { title: "Clara (default)", value: "clara-default" },
            { title: "Marcus (deep)", value: "marcus-deep" },
            // ... more
          ],
        });
        voice = { source: "library", voiceId };
      }

      // Skills (fetched per template)
      const availableSkills = inCat.find((t) => t.id === templateId)?.suggestedSkills ?? [];
      const { skillIds } = await prompts({
        type: "multiselect",
        name: "skillIds",
        message: "Attach skills",
        choices: availableSkills.map((s) => ({ title: s.name, value: s.id, selected: true })),
      });

      const agent = await configureAgent({ templateId, name, voice, skillIds });
      console.log(`✓ ${agent.name} (${agent.templateId}) is ready.`);
    });
}
```

---

## Part 5 — Voice Mode: Voice-Led Configuration Flow

**File:** `packages/cli/src/voice/config-agent-flow.ts`

When the VP says "Clara, config agent" (or triggers voice config), the CLI enters a voice-led flow backed by the `/api/voice/converse` endpoint with a structured system prompt telling Clara to guide the configuration.

Key system-prompt excerpt for voice flow:

```
You are Clara in Agent Configuration mode. The Vibe Professional wants to
configure a new harness agent. Walk them through it conversationally:
  1. Ask what role they need (resolve to a template in our catalog)
  2. Ask for a name
  3. Ask about voice (clone or library)
     - If clone: instruct them to record a 5-second sample, call captureVoiceSample
  4. Suggest skills from the template's recommended skill list
  5. Ask if they want to tweak personality (tone: professional/casual, verbosity, etc.)
  6. Confirm and call /api/agents/configure

Be warm. Be brief. One question at a time.
```

The CLI's voice handler routes user answers to both the LLM AND the config flow state machine. State transitions happen when the LLM returns tool-calls matching the configure-agent action.

---

## Part 6 — Tests

```typescript
describe("ConfigAgentService", () => {
  it("creates a user_agent with composed SOUL.md");
  it("rejects when harness agent cap reached for tier");
  it("rejects when skill count exceeds skillsPerAgent for tier");
  it("clones voice via voiceCloneService when voice.source === 'clone'");
  it("retires agent via soft delete");
});

describe("Routes", () => {
  it("GET /api/agents/templates returns all public templates");
  it("POST /api/agents/configure creates and returns agent");
  it("DELETE /api/agents/:id marks is_active=false");
});

describe("CLI /config-agent", () => {
  it("walks through template → name → voice → skills → confirm");
  it("in voice mode, drives the flow through voice converse");
});
```

---

## Acceptance Criteria

- [ ] `user_agents` table in all three environments
- [ ] `POST /api/agents/configure` honors tier harness + skill caps (from PLAN_LIMITS)
- [ ] `GET /api/agents/templates` returns all available templates
- [ ] CLI `/config-agent` guides user through category → template → name → voice → skills
- [ ] Voice mode of `/config-agent` works end-to-end via `/api/voice/converse`
- [ ] Voice cloning integrated (5-sec sample → XTTS clone → voice_id saved)
- [ ] Retired agents soft-deleted (is_active=false), freeing a slot
- [ ] `npm run type-check` passes
- [ ] All tests pass
- [ ] CI thin-client gate passes

## Branch + PR

```bash
git checkout -b prompt/2026-04-23/19-config-agent-command
git commit -m "feat(agents): /config-agent command — voice-first agent configuration with template + skill + voice selection"
gh pr create --base develop --title "feat(agents): /config-agent — voice-first agent configuration"
```
