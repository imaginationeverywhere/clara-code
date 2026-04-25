# Agent Lifecycle Hooks — PreToolUse, PostToolUse, Stop, SessionStart, SessionEnd, UserPromptSubmit

**TARGET REPO:** imaginationeverywhere/clara-code
**Priority:** P1 — Beta parity with Anthropic's Claude Agent SDK; foundation for IP firewall, audit log, platform standards
**Packages:** `backend/`, `packages/sdk/`
**Depends on:** prompt 11 (PLAN_LIMITS), prompt 13 (IP firewall), prompt 18 (model routing)
**Milestone:** Every agent call (harness OR built) flows through a pluggable lifecycle hook chain. Hooks can validate, log, block, or transform agent behavior at six well-defined lifecycle points. Clara's IP firewall becomes a hook. Platform standards validator becomes a hook. Audit logging becomes a hook. VPs on higher tiers can add their own custom hooks. This is the extensibility primitive that makes Clara Code peer to Anthropic's Claude Agent SDK while staying voice-first and multi-tenant.

Reference: Anthropic's Claude Agent SDK documents `PreToolUse`, `PostToolUse`, `Stop`, `SessionStart`, `SessionEnd`, `UserPromptSubmit`. We implement the same surface for API parity.

---

## The Six Hook Points

| Hook | Fires When | Use Cases |
|------|-----------|-----------|
| **SessionStart** | Agent session begins | Load VP's memory, inject SITE_OWNER overlay, warm voice cache |
| **UserPromptSubmit** | User submits text or voice prompt, BEFORE inference | IP-firewall input sanitize, rate-limit, abuse check, introspection deflection |
| **PreToolUse** | Agent is about to call a tool (Read/Write/Edit/Bash/MCP) | Permission check, audit log entry, standards validation |
| **PostToolUse** | Tool call completed | Record outcome, update context, observability metrics |
| **Stop** | Agent finishes its turn | Final output filter (IP firewall scrub), post to voice TTS, commit conversation to vault |
| **SessionEnd** | Session closes | Persist session summary, update agent memory summary, fire analytics |

---

## Part 1 — Core Hook Types

**File:** `backend/src/lib/hooks.ts`

```typescript
export type HookType =
  | "SessionStart" | "SessionEnd"
  | "UserPromptSubmit"
  | "PreToolUse" | "PostToolUse"
  | "Stop";

export interface HookContext {
  userId: string;
  agentId: string;
  sessionId: string;
  turnId: string;
  deploymentId?: string;           // set if this is a deployed runtime agent (SITE_OWNER context)
  tier: string;
  metadata: Record<string, unknown>;
}

export interface SessionStartInput {
  startingSoulMd: string;
  initialMemory: string[];
}
export interface SessionStartOutput {
  soulMd?: string;                 // replaced SOUL.md if hook modified it
  additionalMemory?: string[];
}

export interface UserPromptSubmitInput {
  rawPrompt: string;
  modality: "text" | "voice";
}
export interface UserPromptSubmitOutput {
  sanitizedPrompt?: string;        // replace prompt (e.g., IP firewall sanitize)
  blocked?: boolean;
  blockReason?: string;
  deflectionResponse?: string;     // return this directly instead of running inference
}

export interface PreToolUseInput {
  toolName: string;
  toolInput: Record<string, unknown>;
}
export interface PreToolUseOutput {
  allowed: boolean;
  reason?: string;
  transformedInput?: Record<string, unknown>;
}

export interface PostToolUseInput {
  toolName: string;
  toolInput: Record<string, unknown>;
  toolOutput: unknown;
  error?: string;
  durationMs: number;
}
export type PostToolUseOutput = Record<string, never>;  // no return; observability only

export interface StopInput {
  agentResponseText: string;
  toolCallsExecuted: number;
}
export interface StopOutput {
  sanitizedResponseText?: string;  // IP firewall output filter lives here
  shouldEmitAudio?: boolean;
}

export interface SessionEndInput {
  turnCount: number;
  durationMs: number;
  lastAgentMessage: string;
}
export type SessionEndOutput = Record<string, never>;

export type HookHandler<I, O> = (input: I, ctx: HookContext) => Promise<O> | O;

export interface HookRegistration {
  hookType: HookType;
  handler: HookHandler<unknown, unknown>;
  priority: number;                // lower = runs first
  name: string;                    // for debugging + ops
  owner: "platform" | "vp" | "deployment";  // platform hooks always run first, unconditionally
}
```

---

## Part 2 — HookBus Registry

**File:** `backend/src/services/hook-bus.service.ts`

```typescript
import type {
  HookType, HookRegistration, HookContext,
  SessionStartInput, SessionStartOutput,
  UserPromptSubmitInput, UserPromptSubmitOutput,
  PreToolUseInput, PreToolUseOutput,
  PostToolUseInput,
  StopInput, StopOutput,
  SessionEndInput,
} from "@/lib/hooks";
import logger from "@/lib/logger";

export class HookBus {
  private registry: Map<HookType, HookRegistration[]> = new Map();

  register(reg: HookRegistration): void {
    const list = this.registry.get(reg.hookType) ?? [];
    list.push(reg);
    // Platform hooks always run first, then by priority
    list.sort((a, b) => {
      if (a.owner === "platform" && b.owner !== "platform") return -1;
      if (b.owner === "platform" && a.owner !== "platform") return 1;
      return a.priority - b.priority;
    });
    this.registry.set(reg.hookType, list);
  }

  async runSessionStart(input: SessionStartInput, ctx: HookContext): Promise<SessionStartOutput> {
    let soulMd = input.startingSoulMd;
    const memory = [...input.initialMemory];
    for (const hook of this.registry.get("SessionStart") ?? []) {
      try {
        const out = (await hook.handler(input, ctx)) as SessionStartOutput;
        if (out?.soulMd) soulMd = out.soulMd;
        if (out?.additionalMemory) memory.push(...out.additionalMemory);
      } catch (err) {
        logger.error("hook_failed", { hook: hook.name, type: "SessionStart", err });
      }
    }
    return { soulMd, additionalMemory: memory };
  }

  async runUserPromptSubmit(
    input: UserPromptSubmitInput,
    ctx: HookContext,
  ): Promise<UserPromptSubmitOutput> {
    let prompt = input.rawPrompt;
    for (const hook of this.registry.get("UserPromptSubmit") ?? []) {
      try {
        const out = (await hook.handler({ ...input, rawPrompt: prompt }, ctx)) as UserPromptSubmitOutput;
        if (out?.blocked) return out;
        if (out?.deflectionResponse) return out;
        if (out?.sanitizedPrompt !== undefined) prompt = out.sanitizedPrompt;
      } catch (err) {
        logger.error("hook_failed", { hook: hook.name, type: "UserPromptSubmit", err });
      }
    }
    return { sanitizedPrompt: prompt };
  }

  async runPreToolUse(input: PreToolUseInput, ctx: HookContext): Promise<PreToolUseOutput> {
    let toolInput = input.toolInput;
    for (const hook of this.registry.get("PreToolUse") ?? []) {
      try {
        const out = (await hook.handler({ ...input, toolInput }, ctx)) as PreToolUseOutput;
        if (!out.allowed) return out;
        if (out.transformedInput) toolInput = out.transformedInput;
      } catch (err) {
        logger.error("hook_failed", { hook: hook.name, type: "PreToolUse", err });
      }
    }
    return { allowed: true, transformedInput: toolInput };
  }

  async runPostToolUse(input: PostToolUseInput, ctx: HookContext): Promise<void> {
    for (const hook of this.registry.get("PostToolUse") ?? []) {
      try { await hook.handler(input, ctx); }
      catch (err) { logger.error("hook_failed", { hook: hook.name, type: "PostToolUse", err }); }
    }
  }

  async runStop(input: StopInput, ctx: HookContext): Promise<StopOutput> {
    let responseText = input.agentResponseText;
    let shouldEmit = true;
    for (const hook of this.registry.get("Stop") ?? []) {
      try {
        const out = (await hook.handler({ ...input, agentResponseText: responseText }, ctx)) as StopOutput;
        if (out?.sanitizedResponseText !== undefined) responseText = out.sanitizedResponseText;
        if (out?.shouldEmitAudio === false) shouldEmit = false;
      } catch (err) {
        logger.error("hook_failed", { hook: hook.name, type: "Stop", err });
      }
    }
    return { sanitizedResponseText: responseText, shouldEmitAudio: shouldEmit };
  }

  async runSessionEnd(input: SessionEndInput, ctx: HookContext): Promise<void> {
    for (const hook of this.registry.get("SessionEnd") ?? []) {
      try { await hook.handler(input, ctx); }
      catch (err) { logger.error("hook_failed", { hook: hook.name, type: "SessionEnd", err }); }
    }
  }
}

export const hookBus = new HookBus();
```

---

## Part 3 — Platform-Owned Hooks (Register at Boot)

**File:** `backend/src/hooks/platform-hooks.ts`

```typescript
import { hookBus } from "@/services/hook-bus.service";
import { detectForbidden, sanitize, isIntrospectionQuery, deflectionResponse } from "@/lib/ip-firewall";
import { platformStandards } from "@/services/platform-standards.service";
import { UsageEvent } from "@/models/UsageEvent";
import logger from "@/lib/logger";

// IP firewall — UserPromptSubmit (deflect introspection before inference)
hookBus.register({
  hookType: "UserPromptSubmit",
  name: "ip-firewall-introspection-deflect",
  owner: "platform",
  priority: 0,
  handler: async (input: any, ctx) => {
    if (isIntrospectionQuery(input.rawPrompt)) {
      const agentName = ctx.metadata.agentName ?? "your agent";
      return { deflectionResponse: deflectionResponse(agentName as string) };
    }
    return { sanitizedPrompt: input.rawPrompt };
  },
});

// IP firewall — Stop (output filter, ALWAYS runs last platform hook)
hookBus.register({
  hookType: "Stop",
  name: "ip-firewall-output-filter",
  owner: "platform",
  priority: 0,
  handler: async (input: any, ctx) => {
    const violations = detectForbidden(input.agentResponseText);
    if (violations.length > 0) {
      logger.warn("[ip-firewall] output filter triggered", {
        userId: ctx.userId, agentId: ctx.agentId, matched: violations,
      });
      return { sanitizedResponseText: sanitize(input.agentResponseText) };
    }
    return {};
  },
});

// Audit log — PostToolUse (every tool call logged)
hookBus.register({
  hookType: "PostToolUse",
  name: "audit-log",
  owner: "platform",
  priority: 0,
  handler: async (input: any, ctx) => {
    await UsageEvent.create({
      userId: ctx.userId,
      agentId: ctx.agentId,
      operationCategory: `tool:${input.toolName}`,
      durationSeconds: input.durationMs / 1000,
      modalComputeSeconds: 0,
      bedrockInputTokens: 0,
      bedrockOutputTokens: 0,
      cogsUsd: 0,
      cacheHit: false,
    });
  },
});

// SITE_OWNER overlay — SessionStart (merge SITE_OWNER instructions for deployed agents)
hookBus.register({
  hookType: "SessionStart",
  name: "site-owner-instruction-overlay",
  owner: "platform",
  priority: 10,
  handler: async (input: any, ctx) => {
    if (!ctx.deploymentId) return {};
    const { SiteOwnerInstruction } = await import("@/models");
    const instructions = await SiteOwnerInstruction.findAll({
      where: { deploymentId: ctx.deploymentId, approvedByPlatform: true },
      order: [["created_at", "ASC"]],
    });
    if (instructions.length === 0) return {};
    const overlay = `\n\n[SITE OWNER INSTRUCTIONS]\n${instructions.map((i: any) => `- ${i.instruction}`).join("\n")}`;
    return { soulMd: input.startingSoulMd + overlay };
  },
});

// Platform standards — PreToolUse (block tools the tier/deployment disallows)
hookBus.register({
  hookType: "PreToolUse",
  name: "platform-standards-tool-gate",
  owner: "platform",
  priority: 0,
  handler: async (input: any, ctx) => {
    // Example: block "Bash" tool on deployed runtime agents (SITE_OWNER sites)
    if (ctx.deploymentId && input.toolName === "Bash") {
      return { allowed: false, reason: "bash_disallowed_on_deployed_agents" };
    }
    return { allowed: true };
  },
});
```

Call this at server boot:

```typescript
// backend/src/index.ts
import "./hooks/platform-hooks";   // registers at import time
```

---

## Part 4 — Voice/Code Routes Wired Through the HookBus

Modify `/api/voice/converse` and any inference endpoint to route through the hook bus:

```typescript
import { hookBus } from "@/services/hook-bus.service";
import type { HookContext } from "@/lib/hooks";

router.post("/converse", requireClaraOrClerk, requireAbuseCheck, async (req, res) => {
  const { user_message, agent_id, session_id } = req.body;
  const ctx: HookContext = {
    userId: req.claraUser!.userId,
    agentId: agent_id,
    sessionId: session_id,
    turnId: crypto.randomUUID(),
    deploymentId: req.body.deployment_id,
    tier: req.claraUser!.tier,
    metadata: { agentName: req.body.agent_name },
  };

  // 1. Session start (idempotent per session)
  const sessionStart = await hookBus.runSessionStart(
    { startingSoulMd: agent.soulMd, initialMemory: [] },
    ctx,
  );

  // 2. User prompt submit (IP firewall deflection happens here)
  const promptResult = await hookBus.runUserPromptSubmit(
    { rawPrompt: user_message, modality: "voice" },
    ctx,
  );
  if (promptResult.blocked) {
    res.status(400).json({ error: promptResult.blockReason }); return;
  }
  if (promptResult.deflectionResponse) {
    // Skip inference — return deflection directly
    res.json({ text: promptResult.deflectionResponse, deflected: true });
    return;
  }
  const finalPrompt = promptResult.sanitizedPrompt!;

  // 3. Inference (with PreToolUse/PostToolUse running per tool call internally)
  const inference = await hermesClient.inference({ /* ... */ }, { /* ... */ });

  // 4. Stop hook (IP firewall output filter happens here)
  const stopResult = await hookBus.runStop(
    { agentResponseText: inference.text, toolCallsExecuted: 0 },
    ctx,
  );

  res.json({ text: stopResult.sanitizedResponseText });
});
```

---

## Part 5 — SDK Exposure (VP-Added Custom Hooks)

**File:** `packages/sdk/src/hooks.ts`

VPs on Business+ tier can add custom hooks via the SDK:

```typescript
export interface ClaraHookOptions {
  agentId: string;
  hookType: HookType;
  handler: HookHandler<any, any>;
  name: string;
}

export function registerHook(options: ClaraHookOptions): Promise<void>;
// Enforces: only Business+ can register custom hooks
// Custom hooks always owner="vp", run AFTER platform hooks
```

Backend endpoint `/api/sdk/hooks/register` checks tier + persists the hook config in DB. VP-owned hooks run in a sandboxed Node worker with bounded CPU + memory.

---

## Part 6 — Tests

```typescript
describe("HookBus", () => {
  it("runs platform hooks before VP hooks regardless of priority");
  it("stops UserPromptSubmit chain on block or deflection");
  it("composes sanitizedPrompt through multiple handlers");
  it("PreToolUse blocks tool when any hook returns allowed:false");
  it("PostToolUse never blocks (observability-only)");
  it("Stop output filter transforms response text");
  it("runs hooks in priority order within owner tier");
  it("logs + skips a failed handler, continues the chain");
});

describe("Platform hooks", () => {
  it("deflects introspection query without calling inference");
  it("strips forbidden strings from agent output on Stop");
  it("records tool-use event in audit log");
  it("overlays SITE_OWNER instructions on SessionStart when deploymentId present");
  it("blocks Bash tool on deployed runtime agents");
});
```

---

## Acceptance Criteria

- [ ] `HookBus` registered at boot with platform hooks
- [ ] Six hook types implemented: SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, Stop, SessionEnd
- [ ] Platform hooks ALWAYS run first (owner="platform" sorts before "vp")
- [ ] IP firewall is now a hook (UserPromptSubmit deflect + Stop output filter)
- [ ] Platform standards is a hook (PreToolUse gate on deployed agents)
- [ ] SITE_OWNER instructions overlay is a SessionStart hook
- [ ] Audit log is a PostToolUse hook
- [ ] `/api/voice/converse` routes through hookBus for every relevant lifecycle point
- [ ] SDK surface allows Business+ tier to register custom hooks
- [ ] VP hooks cannot override or suppress platform hooks
- [ ] Failing hooks logged, chain continues (no single handler can crash the session)
- [ ] `npm run type-check` passes
- [ ] All tests pass
- [ ] CI thin-client gate passes

## Branch + PR

```bash
git checkout -b prompt/2026-04-23/26-agent-lifecycle-hooks
git commit -m "feat(agents): six-point lifecycle hook system — SessionStart/UserPromptSubmit/PreToolUse/PostToolUse/Stop/SessionEnd with platform + VP ownership tiers"
gh pr create --base develop --title "feat(agents): agent lifecycle hook system (parity with Claude Agent SDK)"
```
