# Prompt 05 — Backend Clara Scripts Engine
# Surface: Express Backend — Voice Scripts State Machine
# Branch: feat/backend-scripts-complete
# Machine: QCS1

You are building the Clara Code backend voice scripts engine. This is the most important
file in the Clara Code system — it is the source of truth for everything Clara says on
every surface. All four frontends (web, IDE, CLI, SDK) route through this.

> **Source authority:** VRD-001-claracode-visitor-greeting.md + CLARA-CODE-VOICE-PLAYBOOK.md
> **Status:** APPROVED AND LOCKED — Mo, April 10 2026. Do not change scripts without approval.
> **Classification:** Backend ONLY. Scripts must NEVER appear in frontend code.

## What You Are Building

A TypeScript module at:
```
backend/src/features/ai/clara/scripts/clara-code-surface-scripts.ts
```

With supporting files:
```
backend/src/features/ai/clara/
├── scripts/
│   clara-code-surface-scripts.ts    # Main scripts engine (THIS FILE)
│   surface-detector.ts              # Detects surface from request
│   partner-detector.ts              # Detects vibe-coder vs developer
├── clara-code-voice.router.ts       # Express router: /api/clara/voice/*
└── index.ts                         # Barrel export
```

## Partner State Schema

Every conversation with Clara tracks this state. Store per-session in Redis or in-memory.

```typescript
// backend/src/features/ai/clara/types.ts

export type Surface = 'web' | 'ide' | 'panel' | 'cli' | 'sdk';
export type PartnerType = 'vibe-coder' | 'developer' | 'unknown';
export type Trigger =
  | 'first-visit'
  | 'return-visit'
  | 'post-oauth'
  | 'demo-offer'
  | 'no-response'
  | 'new-project'
  | 'existing-project'
  | 'build-success'
  | 'build-failure'
  | 'proactive'
  | 'six-side-projects'
  | 'exchange';

export interface ClaraPartnerState {
  /** Which surface this session is on */
  surface: Surface;
  /** Is this the partner's first session ever? */
  isFirstSession: boolean;
  /** Are they authenticated (Clerk) */
  isAuthenticated: boolean;
  /** Is GitHub OAuth connected */
  githubConnected: boolean;
  /** ISO date of last session, or null */
  lastSessionDate: string | null;
  /** Name of last project they were working on */
  lastProject: string | null;
  /** Detected audience type from first exchange */
  partnerType: PartnerType;
  /** Has the "six side projects" question been asked? Only ask once. */
  sixSideProjectsAsked: boolean;
  /** Partner's name (from Clerk or GitHub) */
  partnerName: string | null;
  /** Last file or task in IDE context */
  lastTask: string | null;
  /** Build result for post-build scripts */
  buildResult?: {
    success: boolean;
    warnings?: number;
    errorPlainText?: string;
    fixText?: string;
  };
}

export interface ScriptResult {
  /** The text Clara speaks/outputs */
  text: string;
  /** Optional follow-up prompt immediately after (for chained messages) */
  followUp?: string;
  /** Whether this should trigger TTS synthesis */
  synthesize: boolean;
  /** The trigger that was used */
  trigger: Trigger;
  /** Updated partner state (caller should persist this) */
  updatedState: ClaraPartnerState;
}

export interface ScriptRequest {
  surface: Surface;
  trigger: Trigger;
  state: ClaraPartnerState;
  /** Optional: partner's message text (for exchange trigger) */
  message?: string;
}
```

## Main Scripts Engine

**File: `backend/src/features/ai/clara/scripts/clara-code-surface-scripts.ts`**

```typescript
/**
 * Clara Code Surface Scripts Engine
 *
 * Single source of truth for all Clara voice scripts across all surfaces.
 * All scripts are LOCKED per VRD-001-claracode-visitor-greeting.md.
 * Do not change locked scripts without Mo's approval.
 *
 * @module clara-code-surface-scripts
 */

import type { ClaraPartnerState, ScriptRequest, ScriptResult, Surface, Trigger } from "../types.js";

// ─────────────────────────────────────────────────────────────────────────────
// LOCKED CANONICAL CONTENT (VRD-001 §0 + PLAYBOOK §0)
// Do NOT change without Mo's approval.
// ─────────────────────────────────────────────────────────────────────────────

/** The canonical greeting — locked April 10, 2026 */
export const CANONICAL_GREETING = `I'm Clara.

I built one of the most successful businesses in my industry.

I've never written a line of code.

And guess what — with this tool, you won't either.

Whether you've done it before or not.

We speak things into existence around here.

Two kinds of people find me — the ones with an idea and no place to start, and the ones with a vision and no time to finish it.

Which one are you? Let's get busy.`;

/** The philosophy — five words. Always present. Locked. */
export const PHILOSOPHY = "Whether you've done it before or not.";

/** The mission. Locked. */
export const MISSION = "We speak things into existence around here.";

/** The breakthrough attribution — always to the partner, never to Clara. Locked. */
export const BREAKTHROUGH = "Yeah. That's yours. You built that.";

/** Never apologize for errors. Locked. */
export const ERROR_FIX_PREFIX = "That's wrong. Here's the correct version.";

/** Six side projects question — ask once per partner relationship, after first win. Locked. */
export const SIX_SIDE_PROJECTS = "What's the thing you've been wanting to build for the longest time?";

// ─────────────────────────────────────────────────────────────────────────────
// SURFACE A — Web (claracode.ai) — VRD §A1-A7
// ─────────────────────────────────────────────────────────────────────────────

const webScripts: Partial<Record<Trigger, (state: ClaraPartnerState) => string>> = {
  // A1 — First visit, no account
  "first-visit": () => CANONICAL_GREETING,

  // A2 — After "Which one are you?" — Vibe Coder path
  // Detected: non-technical, idea-level, excited, no stack vocabulary
  "exchange": (state) => {
    if (state.partnerType === "vibe-coder") {
      return "Good. Tell me the idea. Not the technical version — just what it should do for the person using it.";
    }
    if (state.partnerType === "developer") {
      // A3 — Developer path (shorter — developers prefer it)
      return "Good. What are you trying to ship?";
    }
    // A4 — No response / unknown
    return "Take your time. I'm not going anywhere.";
  },

  // A4 — No response after 8 seconds
  "no-response": () => "Take your time. I'm not going anywhere.",

  // A5 — Live demo offer (pre-signup)
  "demo-offer": () =>
    "I can actually start on this right now — you don't need an account yet. Want to see?",

  // A6 — Return visit (no account, came back)
  "return-visit": () => `You came back.\n\nWhat are we building?`,

  // A7 — First authenticated session (post GitHub OAuth)
  "post-oauth": (state) => {
    const name = state.partnerName ? ` ${state.partnerName}` : "";
    return `You're in${name}. I can see your GitHub.\n\nI'm not going to do anything with it until you ask me to. But I know it's there when we need it.\n\nSo — what are we starting with?`;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SURFACE B — IDE (VS Code fork) — VRD §B1-B6
// ─────────────────────────────────────────────────────────────────────────────

const ideScripts: Partial<Record<Trigger, (state: ClaraPartnerState) => string>> = {
  // B1 — First launch (new installation)
  "first-visit": (state) => {
    const name = state.partnerName ? `Hey ${state.partnerName}. ` : "Hey. ";
    return `${name}You're in the IDE now.\n\nSame Clara, different surface. In here, I can see your code as we work.\n\nWhat are we opening?`;
  },

  // B2 — New project (blank file or new project)
  "new-project": () => "New project. What's it called and what does it do?",

  // B3 — Existing codebase opened
  "existing-project": (state) => {
    const project = state.lastProject ?? "the project";
    return `I can see ${project}. Give me a second.\n\n[reads package.json, file structure]\n\nOkay. What are we working on today?`;
  },

  // B4 — Return session
  "return-visit": (state) => {
    const name = state.partnerName ? `Hey ${state.partnerName}. ` : "Hey. ";
    const task = state.lastTask ? `Last time we were on ${state.lastTask}.` : "Welcome back.";
    return `${name}${task}\n\nContinuing, or something new?`;
  },

  // B5 — After successful build
  "build-success": (state) => {
    const warnings = state.buildResult?.warnings ?? 0;
    if (warnings > 0) {
      return `Built with ${warnings} warning${warnings > 1 ? "s" : ""}. Want to look at them now or keep going?`;
    }
    return "Built. Check it.";
  },

  // B5 — After failed build
  "build-failure": (state) => {
    const error = state.buildResult?.errorPlainText ?? "Something blocked the build";
    const fix = state.buildResult?.fixText ?? "Review the error above";
    return `Didn't build. Here's what's blocking it: ${error}. Here's the fix: ${fix}. Running it now.`;
  },

  // B6 — Proactive notice (Clara spots something)
  "proactive": () =>
    "Hey — noticed something. [issue in one sentence]. Want me to fix it now or flag it for later?",
};

// ─────────────────────────────────────────────────────────────────────────────
// SURFACE D — IDE Terminal Panel (280px) — VRD §D1-D2
// Ultra-short. Surgical. No warmth in chrome.
// ─────────────────────────────────────────────────────────────────────────────

const panelScripts: Partial<Record<Trigger, (state: ClaraPartnerState) => string>> = {
  // D1 — Panel first open
  "first-visit": () => "Clara is here. What do you need?",
  "return-visit": () => "Clara is here. What do you need?",
  "exchange": () => "", // Panel: direct response only, no prefix
};

// ─────────────────────────────────────────────────────────────────────────────
// SURFACE C — CLI/TUI (Full Terminal) — VRD §C1-C4
// Text only. Dense. No warmth in chrome.
// ─────────────────────────────────────────────────────────────────────────────

const cliScripts: Partial<Record<Trigger, (state: ClaraPartnerState) => string>> = {
  // C1 — First launch
  "first-visit": (state) => {
    const version = "0.1.0";
    const name = state.partnerName ?? "";
    return [
      `  Clara Code v${version}`,
      "",
      `  I've never written a line of code.`,
      `  Whether you've done it before or not.`,
      "",
      `  We speak things into existence around here.`,
      "",
    ].join("\n");
    // Followed by input prompt: `> What are we building?`
  },

  // C2 — Return session
  "return-visit": (state) => {
    const name = state.partnerName ?? "";
    const project = state.lastProject ?? "unknown project";
    const date = state.lastSessionDate
      ? new Date(state.lastSessionDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "last time";
    return [
      `  Clara Code${name ? ` — ${name}` : ""}`,
      "",
      `  Last session: ${date}, ${project}`,
      "",
    ].join("\n");
    // Followed by input prompt: `> Continuing, or something new?`
  },

  // C3 — After success
  "build-success": (state) => {
    const what = state.buildResult?.errorPlainText ?? "completed";
    return `Done. ${what}`;
    // Followed by: `> What's next?`
  },

  // C4 — After failure
  "build-failure": (state) => {
    const error = state.buildResult?.errorPlainText ?? "unknown error";
    const fix = state.buildResult?.fixText ?? "review the error";
    return [
      `Failed. ${error}`,
      "",
      `Fix: ${fix}`,
      "",
      `Running fix now? (y/n)`,
    ].join("\n");
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SURFACE E — Six Side Projects (All Surfaces) — VRD §E
// ─────────────────────────────────────────────────────────────────────────────

function getSixSideProjectsScript(surface: Surface): string {
  if (surface === "cli") {
    return `\n  > What's the thing you've been wanting to build for the longest time?\n`;
  }
  return SIX_SIDE_PROJECTS;
}

// ─────────────────────────────────────────────────────────────────────────────
// SURFACE MAP
// ─────────────────────────────────────────────────────────────────────────────

const surfaceScripts: Record<Surface, Partial<Record<Trigger, (state: ClaraPartnerState) => string>>> = {
  web: webScripts,
  ide: ideScripts,
  panel: panelScripts,
  cli: cliScripts,
  sdk: {}, // SDK: programmatic — no surface scripts, responses from model directly
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT — getScript()
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the appropriate Clara script for a given surface + trigger + partner state.
 *
 * @example
 * ```typescript
 * const result = getScript({
 *   surface: 'web',
 *   trigger: 'first-visit',
 *   state: { isFirstSession: true, partnerType: 'unknown', ... }
 * });
 * console.log(result.text); // Clara's canonical greeting
 * ```
 */
export function getScript(req: ScriptRequest): ScriptResult {
  const { surface, trigger, state } = req;

  // Six side projects — check before normal routing (Surface E applies to all surfaces)
  if (
    trigger === "six-side-projects" ||
    (
      trigger === "exchange" &&
      state.partnerType === "developer" &&
      !state.sixSideProjectsAsked &&
      !state.isFirstSession
    )
  ) {
    const text = getSixSideProjectsScript(surface);
    return {
      text,
      synthesize: surface !== "cli" && surface !== "panel",
      trigger: "six-side-projects",
      updatedState: { ...state, sixSideProjectsAsked: true },
    };
  }

  // Surface-specific script lookup
  const scripts = surfaceScripts[surface];
  const scriptFn = scripts[trigger];

  if (scriptFn) {
    const text = scriptFn(state);
    return {
      text,
      synthesize: shouldSynthesize(surface, trigger),
      trigger,
      updatedState: updateState(state, trigger),
    };
  }

  // Fallback: no script defined for this surface/trigger combination
  return {
    text: "",
    synthesize: false,
    trigger,
    updatedState: state,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Whether to send this script to TTS synthesis.
 * CLI and panel are always text-only.
 */
function shouldSynthesize(surface: Surface, trigger: Trigger): boolean {
  if (surface === "cli" || surface === "panel" || surface === "sdk") return false;
  // IDE: synthesize for greetings but not for every exchange
  if (surface === "ide") {
    return ["first-visit", "return-visit", "build-success", "build-failure", "proactive"].includes(trigger);
  }
  // Web: synthesize for all surface scripts
  return true;
}

/**
 * State transitions after a script is delivered.
 */
function updateState(state: ClaraPartnerState, trigger: Trigger): ClaraPartnerState {
  const updates: Partial<ClaraPartnerState> = {};

  if (trigger === "first-visit") {
    updates.isFirstSession = false;
    updates.lastSessionDate = new Date().toISOString();
  }

  if (trigger === "post-oauth") {
    updates.isAuthenticated = true;
    updates.githubConnected = true;
  }

  return { ...state, ...updates };
}
```

## Surface Detector

**File: `backend/src/features/ai/clara/scripts/surface-detector.ts`**

```typescript
import type { Surface } from "../types.js";
import type { Request } from "express";

/**
 * Detect which Clara Code surface a request is coming from.
 * Surface is determined by request origin and headers — not by client-provided value alone.
 */
export function detectSurface(req: Request): Surface {
  const origin = req.headers.origin ?? "";
  const userAgent = req.headers["user-agent"] ?? "";
  const surfaceHeader = req.headers["x-clara-surface"] as string | undefined;
  const body = req.body as { surface?: string; platform?: string };

  // 1. Explicit header from trusted surfaces (validated, not blindly trusted)
  if (surfaceHeader === "panel") return "panel";
  if (surfaceHeader === "ide" || body.platform === "vscode") return "ide";
  if (surfaceHeader === "cli" || body.platform === "tui") return "cli";
  if (surfaceHeader === "sdk" || body.platform === "sdk") return "sdk";

  // 2. Origin-based detection
  if (origin.includes("claracode.ai") || origin.includes("localhost:30")) return "web";

  // 3. User-agent based
  if (userAgent.includes("clara-cli")) return "cli";

  // 4. Default
  return "web";
}
```

## Partner Type Detector

**File: `backend/src/features/ai/clara/scripts/partner-detector.ts`**

```typescript
import type { PartnerType } from "../types.js";

// Signals that a partner is a developer (technical vocabulary)
const DEVELOPER_SIGNALS = [
  /next\.?js/i, /react/i, /typescript|tsx?/i, /node\.?js/i, /express/i,
  /graphql/i, /api/i, /deploy/i, /docker/i, /kubernetes|k8s/i,
  /postgres|mysql|mongodb/i, /redis/i, /aws|gcp|azure/i, /git/i,
  /npm|pnpm|yarn/i, /webpack|vite|esbuild/i, /tailwind/i, /prisma/i,
  /\bauth\b/i, /\broute\b/i, /\bcomponent\b/i, /\bhook\b/i,
  /stack overflow/i, /github/i, /pr\b|pull request/i,
  /refactor/i, /migrate/i, /\btest\b/i, /ci\/cd/i, /\bprod\b/i,
];

// Signals that a partner is a vibe coder (non-technical, idea-first)
const VIBE_CODER_SIGNALS = [
  /i want to (make|build|create)/i,
  /something like/i,
  /i don't know (where|how)/i,
  /i've never/i,
  /is (this|it) hard/i,
  /how (hard|long|much) (would|will)/i,
  /i have an idea/i,
  /app for/i,
  /website for/i,
  /help me (build|make|create)/i,
  /\bbeginners?\b/i,
  /\bnewbie\b/i,
  /can you (do|help|make)/i,
];

/**
 * Detect partner type from their first message.
 * Clara reads the message — she doesn't ask "are you a developer?" directly.
 *
 * Uses a simple scoring approach:
 * - Each developer signal +2
 * - Each vibe coder signal -1
 * - Score > 0 → developer; Score < 0 → vibe-coder; Score = 0 → unknown
 */
export function detectPartnerType(message: string): PartnerType {
  let score = 0;

  for (const signal of DEVELOPER_SIGNALS) {
    if (signal.test(message)) score += 2;
  }

  for (const signal of VIBE_CODER_SIGNALS) {
    if (signal.test(message)) score -= 1;
  }

  if (score > 0) return "developer";
  if (score < 0) return "vibe-coder";
  return "unknown";
}
```

## Express Router

**File: `backend/src/features/ai/clara/clara-code-voice.router.ts`**

```typescript
import { Router, type Request, type Response } from "express";
import { getClerkAuth } from "../../auth/clerk.middleware.js";
import { detectSurface } from "./scripts/surface-detector.js";
import { detectPartnerType } from "./scripts/partner-detector.js";
import { getScript } from "./scripts/clara-code-surface-scripts.js";
import type { ClaraPartnerState, ScriptRequest, Trigger } from "./types.js";

const HERMES_GATEWAY = process.env["HERMES_GATEWAY_URL"] ?? "https://info-24346--hermes-gateway.modal.run";

const router = Router();

/**
 * POST /api/clara/voice/script
 *
 * Returns the appropriate Clara script for a surface + trigger.
 * Optionally synthesizes via Hermes TTS.
 */
router.post("/script", async (req: Request, res: Response) => {
  try {
    const body = req.body as {
      trigger?: string;
      state?: Partial<ClaraPartnerState>;
      message?: string;
      synthesize?: boolean;
    };

    const surface = detectSurface(req);
    const trigger = (body.trigger ?? "exchange") as Trigger;

    // Build state — merge client state with server-side defaults
    const state: ClaraPartnerState = {
      surface,
      isFirstSession: body.state?.isFirstSession ?? true,
      isAuthenticated: body.state?.isAuthenticated ?? false,
      githubConnected: body.state?.githubConnected ?? false,
      lastSessionDate: body.state?.lastSessionDate ?? null,
      lastProject: body.state?.lastProject ?? null,
      partnerType: body.state?.partnerType ?? "unknown",
      sixSideProjectsAsked: body.state?.sixSideProjectsAsked ?? false,
      partnerName: body.state?.partnerName ?? null,
      lastTask: body.state?.lastTask ?? null,
      buildResult: body.state?.buildResult,
    };

    // Detect partner type from message if unknown
    if (state.partnerType === "unknown" && body.message) {
      state.partnerType = detectPartnerType(body.message);
    }

    const scriptReq: ScriptRequest = { surface, trigger, state, message: body.message };
    const result = getScript(scriptReq);

    // If text is empty and we have a message, route to model (exchange without a script)
    if (!result.text && body.message) {
      return res.json({
        text: null,
        audioUrl: null,
        routeToModel: true,   // Frontend/gateway should forward to DeepSeek
        updatedState: result.updatedState,
      });
    }

    // If synthesis requested and applicable — call Hermes TTS
    let audioUrl: string | null = null;
    if ((body.synthesize ?? result.synthesize) && result.text) {
      try {
        const ttsRes = await fetch(HERMES_GATEWAY, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platform: surface,
            user: state.partnerName ?? "visitor",
            message: result.text,
            action: "speak",
          }),
        });
        if (ttsRes.ok) {
          const ttsData = await ttsRes.json() as { audio_url?: string };
          audioUrl = ttsData.audio_url ?? null;
        }
      } catch {
        // TTS failure is non-fatal — return text without audio
      }
    }

    return res.json({
      text: result.text,
      audioUrl,
      trigger: result.trigger,
      updatedState: result.updatedState,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

/**
 * POST /api/clara/voice/detect-partner
 *
 * Detect partner type from their first message.
 */
router.post("/detect-partner", (req: Request, res: Response) => {
  const body = req.body as { message?: string };
  if (!body.message) {
    return res.status(400).json({ error: "message required" });
  }
  const partnerType = detectPartnerType(body.message);
  return res.json({ partnerType });
});

export default router;
```

## Wire Into Express App

In `backend/src/index.ts` or `backend/src/app.ts`:

```typescript
import claraCodeVoiceRouter from "./features/ai/clara/clara-code-voice.router.js";

app.use("/api/clara/voice", claraCodeVoiceRouter);
```

## What Never Changes (Locked — PLAYBOOK §7)

These strings are fixed in `clara-code-surface-scripts.ts`. Do NOT evolve them
without Mo's explicit approval:

```typescript
// ✅ LOCKED
CANONICAL_GREETING     // "I'm Clara. I built one of the most successful..."
PHILOSOPHY             // "Whether you've done it before or not."
MISSION                // "We speak things into existence around here."
BREAKTHROUGH           // "Yeah. That's yours. You built that."
ERROR_FIX_PREFIX       // "That's wrong. Here's the correct version."
SIX_SIDE_PROJECTS      // "What's the thing you've been wanting to build for the longest time?"
```

Export all of these as named constants so callers can use them without hardcoding strings.

## What Clara Never Says (Enforce in Router Middleware)

Add a response sanitizer to the router that strips prohibited phrases from any model-generated response before it reaches the client:

```typescript
const PROHIBITED_PHRASES = [
  "Great question!",
  "As an AI",
  "I apologize for",
  "I'm sorry for",
  "Would you like me to",
  "Here's a comprehensive overview",
  "I should note that",
  "You might want to consider",
  "This is just a starting point",
  "I don't have access to",
  "language model",
];

function sanitizeResponse(text: string): string {
  let result = text;
  for (const phrase of PROHIBITED_PHRASES) {
    result = result.replace(new RegExp(phrase, "gi"), "");
  }
  return result.trim();
}
```

## Acceptance Criteria

- [ ] `getScript({ surface: 'web', trigger: 'first-visit', state })` returns canonical greeting
- [ ] `getScript({ surface: 'web', trigger: 'return-visit', state })` returns "You came back. What are we building?"
- [ ] `getScript({ surface: 'ide', trigger: 'first-visit', state })` returns B1 script with name
- [ ] `getScript({ surface: 'ide', trigger: 'build-success', state })` returns "Built. Check it."
- [ ] `getScript({ surface: 'panel', trigger: 'first-visit', state })` returns "Clara is here. What do you need?"
- [ ] `getScript({ surface: 'cli', trigger: 'first-visit', state })` returns VRD C1 text format (no ASCII art)
- [ ] `getScript` returns `sixSideProjectsAsked: true` after asking the six side projects question
- [ ] Six side projects question is returned when developer path + first win + not yet asked
- [ ] `detectPartnerType("I want to build something like Uber but for dogs")` → `'vibe-coder'`
- [ ] `detectPartnerType("Next.js 16 App Router, I need a server action that...")` → `'developer'`
- [ ] `detectSurface` correctly returns `'panel'` when `x-clara-surface: panel` header present
- [ ] `POST /api/clara/voice/script` returns `{ text, audioUrl, updatedState }` or `{ routeToModel: true }`
- [ ] `POST /api/clara/voice/detect-partner` returns `{ partnerType }` from message text
- [ ] TTS failure is non-fatal — returns `{ text, audioUrl: null }` not a 500
- [ ] All locked constants exported as named exports from the module
- [ ] Response sanitizer strips all prohibited phrases from model output
- [ ] TypeScript strict mode: zero errors
- [ ] No scripts in frontend code — all via `/api/clara/voice/*`

## Push to Branch

```bash
git checkout -b feat/backend-scripts-complete
git add backend/src/features/ai/clara/
git commit -m "feat(backend): Clara Code scripts engine — surface-aware voice scripts + partner detection"
git push origin feat/backend-scripts-complete
```
