# Prompt 04 — @clara/sdk
# Surface: TypeScript npm SDK
# Branch: feat/sdk-complete
# Machine: QCS1

You are building `@clara/sdk` — the official TypeScript SDK for Clara Code. This is the developer-facing npm package that lets anyone build with Clara's AI capabilities. It wraps the Clara Hermes gateway and vault in a clean, chainable API.

## What You Are Building

A TypeScript npm package at `packages/sdk/` that exports a `clara` client with:
- `clara.agent({ name, soul })` — create/configure a named agent
- `clara.chat(message)` — send a text message, get a reply
- `clara.voice.speak(text)` — send text to TTS, returns audio URL
- `clara.vault.save(key, value)` — persist a value to the vault
- `clara.vault.get(key)` — retrieve a persisted value
- `clara.deploy()` — trigger a deploy via the gateway

Full TypeScript types + JSDoc on every export. tsup build. ESM + CJS dual output.

## Exact File Structure

```
packages/sdk/
├── src/
│   index.ts         # Main export: createClara() factory + Clara class
│   types.ts         # All shared TypeScript types
│   client/
│     gateway.ts     # HTTP client for Hermes gateway
│     vault.ts       # Vault read/write/append (fs-based)
│   modules/
│     agent.ts       # AgentModule — clara.agent()
│     chat.ts        # ChatModule — clara.chat()
│     voice.ts       # VoiceModule — clara.voice.*
│     deploy.ts      # DeployModule — clara.deploy()
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

## package.json

```json
{
  "name": "@clara/sdk",
  "version": "0.1.0",
  "description": "Official TypeScript SDK for Clara Code AI",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist", "README.md"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit",
    "test": "node --experimental-vm-modules $(which jest)"
  },
  "dependencies": {
    "node-fetch": "^3.3.2"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.3.0"
  },
  "engines": { "node": ">=18.0.0" },
  "keywords": ["clara", "ai", "coding-agent", "voice", "llm", "sdk"],
  "author": "Imagination Everywhere",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/imaginationeverywhere/clara-code.git",
    "directory": "packages/sdk"
  }
}
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

## tsup.config.ts

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  treeshake: true,
  outDir: "dist",
  target: "node18",
  banner: {
    js: "// @clara/sdk — Official Clara Code SDK — imaginationeverywhere/clara-code",
  },
});
```

## src/types.ts

```typescript
/**
 * Core types for the @clara/sdk.
 */

/** Options for creating a Clara SDK client */
export interface ClaraOptions {
  /**
   * Clara Hermes gateway URL.
   * @default "https://info-24346--hermes-gateway.modal.run"
   */
  gatewayUrl?: string;

  /**
   * User identifier sent with every gateway request.
   * @default "dev"
   */
  userId?: string;

  /**
   * Vault root directory for persistent storage.
   * @default "~/.clara/vault"
   */
  vaultRoot?: string;

  /**
   * Default model for agent sessions.
   * @default "deepseek.v3.2"
   */
  model?: string;
}

/** Options for configuring an agent */
export interface AgentOptions {
  /** Human-readable agent name */
  name: string;

  /**
   * Agent soul — personality/system prompt.
   * Sent as system context to the model.
   */
  soul?: string;

  /** Override model for this agent */
  model?: string;
}

/** A configured agent instance */
export interface AgentInstance extends AgentOptions {
  /** Send a message to this agent and get a reply */
  chat(message: string): Promise<string>;
  /** Speak text via TTS */
  speak(text: string): Promise<SpeakResult>;
}

/** Result of a clara.chat() call */
export interface ChatResult {
  /** The assistant's text reply */
  reply: string;
  /** Latency in milliseconds */
  latencyMs: number;
  /** Model that generated the reply */
  model: string;
}

/** Result of a clara.voice.speak() call */
export interface SpeakResult {
  /** URL to the generated audio file (wav/mp3) */
  audioUrl: string;
  /** Duration in seconds (if provided by gateway) */
  durationSecs?: number;
}

/** Result of a clara.deploy() call */
export interface DeployResult {
  /** Whether the deploy was triggered successfully */
  success: boolean;
  /** Deploy ID or job ID if provided */
  deployId?: string;
  /** Human-readable status message */
  message: string;
}

/** Gateway request payload */
export interface GatewayRequest {
  platform: "web" | "vscode" | "tui" | "sdk";
  user: string;
  message: string;
  model?: string;
  soul?: string;
  action?: "chat" | "speak" | "deploy";
}

/** Gateway response payload */
export interface GatewayResponse {
  reply?: string;
  text?: string;
  message?: string;
  audioUrl?: string;
  audio_url?: string;
  durationSecs?: number;
  duration_secs?: number;
  deployId?: string;
  deploy_id?: string;
  model?: string;
  error?: string;
}
```

## src/client/gateway.ts

```typescript
import type { GatewayRequest, GatewayResponse } from "../types.js";

/**
 * Low-level HTTP client for the Clara Hermes gateway.
 * All SDK modules delegate network calls through here.
 */
export class GatewayClient {
  constructor(
    private readonly gatewayUrl: string,
    private readonly userId: string
  ) {}

  /**
   * Send a request to the gateway and return the parsed response.
   * @throws {Error} on network errors or non-2xx status
   */
  async send(payload: Omit<GatewayRequest, "user">): Promise<GatewayResponse> {
    const body: GatewayRequest = {
      ...payload,
      user: this.userId,
    };

    const response = await fetch(this.gatewayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "@clara/sdk/0.1.0",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Clara gateway error ${response.status}: ${text || response.statusText}`
      );
    }

    return (await response.json()) as GatewayResponse;
  }

  /** Convenience: send a chat message, return text reply */
  async chat(
    message: string,
    opts?: { model?: string; soul?: string }
  ): Promise<string> {
    const res = await this.send({
      platform: "sdk",
      message,
      action: "chat",
      ...opts,
    });
    const reply = res.reply ?? res.text ?? res.message;
    if (!reply) throw new Error("Gateway returned no reply text");
    return reply;
  }

  /** Convenience: TTS speak, return audio URL */
  async speak(text: string): Promise<{ audioUrl: string; durationSecs?: number }> {
    const res = await this.send({
      platform: "sdk",
      message: text,
      action: "speak",
    });
    const audioUrl = res.audioUrl ?? res.audio_url;
    if (!audioUrl) throw new Error("Gateway returned no audio URL");
    return {
      audioUrl,
      durationSecs: res.durationSecs ?? res.duration_secs,
    };
  }

  /** Convenience: trigger a deploy */
  async deploy(opts?: { model?: string }): Promise<{ deployId?: string; message: string }> {
    const res = await this.send({
      platform: "sdk",
      message: "__deploy__",
      action: "deploy",
      ...opts,
    });
    return {
      deployId: res.deployId ?? res.deploy_id,
      message: res.reply ?? res.message ?? "Deploy triggered",
    };
  }
}
```

## src/client/vault.ts

```typescript
import {
  readFileSync,
  writeFileSync,
  appendFileSync,
  existsSync,
  mkdirSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";

/**
 * Vault client for persistent key-value storage.
 * Stores values in `~/.clara/vault/<key>.json` by default.
 */
export class VaultClient {
  private readonly root: string;

  constructor(vaultRoot?: string) {
    this.root = vaultRoot ?? join(homedir(), ".clara", "vault");
  }

  /**
   * Save a value to the vault.
   * @param key - Vault key (may contain slashes for namespacing, e.g., "agents/mybot/config")
   * @param value - Any JSON-serializable value
   */
  save(key: string, value: unknown): void {
    const filePath = this._keyToPath(key);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, JSON.stringify({ key, value, updatedAt: new Date().toISOString() }, null, 2), "utf-8");
  }

  /**
   * Retrieve a value from the vault.
   * @returns The stored value, or `undefined` if not found
   */
  get<T = unknown>(key: string): T | undefined {
    const filePath = this._keyToPath(key);
    if (!existsSync(filePath)) return undefined;
    try {
      const raw = JSON.parse(readFileSync(filePath, "utf-8")) as {
        value: T;
      };
      return raw.value;
    } catch {
      return undefined;
    }
  }

  /**
   * Append a line to a vault log file.
   * Useful for JSONL session logs, audit trails, etc.
   * @param key - Vault key (treated as a file path suffix)
   * @param line - String to append (newline added automatically)
   */
  append(key: string, line: string): void {
    const filePath = this._keyToPath(key);
    mkdirSync(dirname(filePath), { recursive: true });
    appendFileSync(filePath, line + "\n", "utf-8");
  }

  /**
   * Check whether a vault key exists.
   */
  has(key: string): boolean {
    return existsSync(this._keyToPath(key));
  }

  /**
   * Delete a vault key.
   */
  delete(key: string): void {
    const { unlinkSync } = require("node:fs") as typeof import("node:fs");
    const filePath = this._keyToPath(key);
    if (existsSync(filePath)) unlinkSync(filePath);
  }

  private _keyToPath(key: string): string {
    // Sanitize: strip leading slashes, prevent directory traversal
    const safe = key.replace(/\.\./g, "_").replace(/^\/+/, "");
    return join(this.root, `${safe}.json`);
  }
}
```

## src/modules/agent.ts

```typescript
import type { GatewayClient } from "../client/gateway.js";
import type { AgentOptions, AgentInstance, SpeakResult } from "../types.js";

/**
 * AgentModule — creates named, soul-configured agent instances.
 * Accessed via `clara.agent({ name, soul })`.
 */
export class AgentModule {
  constructor(private readonly gateway: GatewayClient) {}

  /**
   * Create a named agent with an optional soul (system prompt).
   *
   * @example
   * ```typescript
   * const bot = clara.agent({ name: "Nia", soul: "You are a helpful coding assistant." });
   * const reply = await bot.chat("Explain async/await");
   * ```
   */
  create(opts: AgentOptions): AgentInstance {
    const { name, soul, model } = opts;
    const gateway = this.gateway;

    return {
      name,
      soul,
      model,
      async chat(message: string): Promise<string> {
        return gateway.chat(message, { model, soul });
      },
      async speak(text: string): Promise<SpeakResult> {
        const result = await gateway.speak(text);
        return {
          audioUrl: result.audioUrl,
          durationSecs: result.durationSecs,
        };
      },
    };
  }
}
```

## src/modules/chat.ts

```typescript
import type { GatewayClient } from "../client/gateway.js";
import type { ChatResult } from "../types.js";

/**
 * ChatModule — simple stateless message-reply.
 * Accessed via `clara.chat(message)`.
 */
export class ChatModule {
  constructor(private readonly gateway: GatewayClient) {}

  /**
   * Send a message to Clara and receive a reply.
   *
   * @example
   * ```typescript
   * const result = await clara.chat("What is the capital of France?");
   * console.log(result.reply); // "Paris"
   * console.log(result.latencyMs); // 342
   * ```
   */
  async send(message: string, opts?: { model?: string; soul?: string }): Promise<ChatResult> {
    const start = Date.now();
    const reply = await this.gateway.chat(message, opts);
    return {
      reply,
      latencyMs: Date.now() - start,
      model: opts?.model ?? "deepseek.v3.2",
    };
  }
}
```

## src/modules/voice.ts

```typescript
import type { GatewayClient } from "../client/gateway.js";
import type { SpeakResult } from "../types.js";

/**
 * VoiceModule — text-to-speech via the Clara Hermes gateway.
 * Accessed via `clara.voice.*`.
 */
export class VoiceModule {
  constructor(private readonly gateway: GatewayClient) {}

  /**
   * Convert text to speech via Clara's Voxtral TTS engine.
   * Returns an audio URL you can play or download.
   *
   * @example
   * ```typescript
   * const result = await clara.voice.speak("Hello, I'm Clara!");
   * console.log(result.audioUrl); // "https://..."
   * ```
   */
  async speak(text: string): Promise<SpeakResult> {
    const result = await this.gateway.speak(text);
    return {
      audioUrl: result.audioUrl,
      durationSecs: result.durationSecs,
    };
  }
}
```

## src/modules/deploy.ts

```typescript
import type { GatewayClient } from "../client/gateway.js";
import type { DeployResult } from "../types.js";

/**
 * DeployModule — trigger Clara deployments via the gateway.
 * Accessed via `clara.deploy()`.
 */
export class DeployModule {
  constructor(private readonly gateway: GatewayClient) {}

  /**
   * Trigger a Clara deployment.
   *
   * @example
   * ```typescript
   * const result = await clara.deploy();
   * console.log(result.message); // "Deploy triggered successfully"
   * ```
   */
  async trigger(opts?: { model?: string }): Promise<DeployResult> {
    try {
      const result = await this.gateway.deploy(opts);
      return {
        success: true,
        deployId: result.deployId,
        message: result.message,
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
```

## src/index.ts

```typescript
/**
 * @clara/sdk — Official TypeScript SDK for Clara Code AI
 *
 * @example
 * ```typescript
 * import { createClara } from "@clara/sdk";
 *
 * const clara = createClara({ userId: "mo" });
 *
 * // Chat
 * const { reply } = await clara.chat("What should I build today?");
 *
 * // Configured agent
 * const bot = clara.agent({ name: "Nia", soul: "You are a senior engineer." });
 * const answer = await bot.chat("Explain dependency injection");
 *
 * // Voice
 * const audio = await clara.voice.speak("Building great software takes patience.");
 * console.log(audio.audioUrl);
 *
 * // Vault
 * clara.vault.save("session/last", { ts: Date.now() });
 * const last = clara.vault.get("session/last");
 *
 * // Deploy
 * const deploy = await clara.deploy();
 * console.log(deploy.message);
 * ```
 */

export type {
  ClaraOptions,
  AgentOptions,
  AgentInstance,
  ChatResult,
  SpeakResult,
  DeployResult,
  GatewayRequest,
  GatewayResponse,
} from "./types.js";

export { GatewayClient } from "./client/gateway.js";
export { VaultClient } from "./client/vault.js";
export { AgentModule } from "./modules/agent.js";
export { ChatModule } from "./modules/chat.js";
export { VoiceModule } from "./modules/voice.js";
export { DeployModule } from "./modules/deploy.js";

import type { ClaraOptions, AgentOptions, AgentInstance, ChatResult, SpeakResult, DeployResult } from "./types.js";
import { GatewayClient } from "./client/gateway.js";
import { VaultClient } from "./client/vault.js";
import { AgentModule } from "./modules/agent.js";
import { ChatModule } from "./modules/chat.js";
import { VoiceModule } from "./modules/voice.js";
import { DeployModule } from "./modules/deploy.js";

/** Default gateway URL */
export const CLARA_GATEWAY_URL = "https://info-24346--hermes-gateway.modal.run";

/** Default model */
export const CLARA_DEFAULT_MODEL = "deepseek.v3.2";

/**
 * Clara SDK client — the main entry point.
 * Create one instance and use all capabilities through it.
 */
export class Clara {
  /** Gateway HTTP client */
  readonly _gateway: GatewayClient;

  /** Vault persistent storage */
  readonly vault: VaultClient;

  /** Voice module — TTS */
  readonly voice: VoiceModule;

  private readonly _agents: AgentModule;
  private readonly _chat: ChatModule;
  private readonly _deploy: DeployModule;

  constructor(options: ClaraOptions = {}) {
    const gatewayUrl = options.gatewayUrl ?? CLARA_GATEWAY_URL;
    const userId = options.userId ?? "dev";

    this._gateway = new GatewayClient(gatewayUrl, userId);
    this.vault = new VaultClient(options.vaultRoot);
    this.voice = new VoiceModule(this._gateway);
    this._agents = new AgentModule(this._gateway);
    this._chat = new ChatModule(this._gateway);
    this._deploy = new DeployModule(this._gateway);
  }

  /**
   * Create a named, soul-configured agent instance.
   *
   * @example
   * ```typescript
   * const bot = clara.agent({ name: "Dev", soul: "You are a senior TypeScript engineer." });
   * const reply = await bot.chat("How do I debounce in React?");
   * ```
   */
  agent(opts: AgentOptions): AgentInstance {
    return this._agents.create(opts);
  }

  /**
   * Send a message to Clara and receive a text reply.
   *
   * @example
   * ```typescript
   * const { reply, latencyMs } = await clara.chat("Explain WebSockets");
   * ```
   */
  async chat(message: string, opts?: { model?: string; soul?: string }): Promise<ChatResult> {
    return this._chat.send(message, opts);
  }

  /**
   * Trigger a Clara deployment.
   *
   * @example
   * ```typescript
   * const result = await clara.deploy();
   * ```
   */
  async deploy(opts?: { model?: string }): Promise<DeployResult> {
    return this._deploy.trigger(opts);
  }
}

/**
 * Factory function — preferred way to create a Clara SDK client.
 *
 * @example
 * ```typescript
 * import { createClara } from "@clara/sdk";
 *
 * const clara = createClara({ userId: "mo" });
 * const { reply } = await clara.chat("Hello, Clara!");
 * ```
 */
export function createClara(options: ClaraOptions = {}): Clara {
  return new Clara(options);
}

/**
 * Default export — a pre-configured Clara instance using env vars or defaults.
 * Good for quick scripts; use `createClara()` for production with explicit config.
 *
 * @example
 * ```typescript
 * import clara from "@clara/sdk";
 * await clara.chat("Hello");
 * ```
 */
export default createClara({
  gatewayUrl: process.env["CLARA_GATEWAY_URL"] ?? CLARA_GATEWAY_URL,
  userId: process.env["CLARA_USER_ID"] ?? "dev",
});
```

## README.md

````markdown
# @clara/sdk

Official TypeScript SDK for [Clara Code](https://github.com/imaginationeverywhere/clara-code) — AI voice coding assistant.

## Install

```bash
npm install @clara/sdk
```

## Quick Start

```typescript
import { createClara } from "@clara/sdk";

const clara = createClara({ userId: "mo" });

// Chat with Clara
const { reply } = await clara.chat("What should we build today?");
console.log(reply);

// Create a named agent with a soul (system prompt)
const bot = clara.agent({
  name: "Nia",
  soul: "You are a senior TypeScript engineer who writes clean, idiomatic code.",
});
const answer = await bot.chat("Explain the difference between type and interface");
console.log(answer);

// Text-to-speech
const audio = await clara.voice.speak("Building great software takes patience.");
console.log(audio.audioUrl); // Play this URL

// Vault — persistent key-value storage
clara.vault.save("session/context", { lastFile: "src/app.ts", ts: Date.now() });
const ctx = clara.vault.get<{ lastFile: string }>("session/context");
console.log(ctx?.lastFile); // "src/app.ts"

// Deploy
const deploy = await clara.deploy();
console.log(deploy.success, deploy.message);
```

## API Reference

### `createClara(options?)` → `Clara`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `gatewayUrl` | `string` | Hermes Modal URL | Clara voice gateway endpoint |
| `userId` | `string` | `"dev"` | User identifier for telemetry |
| `vaultRoot` | `string` | `~/.clara/vault` | Vault storage directory |
| `model` | `string` | `"deepseek.v3.2"` | Default language model |

### `clara.chat(message, opts?)` → `Promise<ChatResult>`

Send a text message and get a reply.

```typescript
const result = await clara.chat("Explain React Server Components");
result.reply       // string — assistant reply
result.latencyMs   // number — response time
result.model       // string — model used
```

### `clara.agent({ name, soul, model? })` → `AgentInstance`

Create a configured agent.

```typescript
const bot = clara.agent({ name: "Nia", soul: "You are a Python expert." });
await bot.chat("How do I use asyncio?");
await bot.speak("Running your code now.");
```

### `clara.voice.speak(text)` → `Promise<SpeakResult>`

Convert text to speech via Voxtral TTS.

```typescript
const { audioUrl, durationSecs } = await clara.voice.speak("Hello, Clara!");
```

### `clara.vault.save(key, value)` / `.get(key)` / `.append(key, line)` / `.has(key)` / `.delete(key)`

Persistent local storage backed by `~/.clara/vault/`.

```typescript
clara.vault.save("config/theme", "dark");
const theme = clara.vault.get<string>("config/theme"); // "dark"
clara.vault.append("logs/session", JSON.stringify({ ts: Date.now(), event: "start" }));
```

### `clara.deploy(opts?)` → `Promise<DeployResult>`

Trigger a Clara deployment via the gateway.

```typescript
const { success, deployId, message } = await clara.deploy();
```

## Environment Variables

```bash
CLARA_GATEWAY_URL=https://your-gateway.modal.run  # Custom gateway
CLARA_USER_ID=your-name                            # User identity
```

## Default Export

For quick scripts, import the default pre-configured instance:

```typescript
import clara from "@clara/sdk";
await clara.chat("Hello!");
```

## Architecture

| Layer | Technology |
|-------|-----------|
| Language model | DeepSeek V3.2 via AWS Bedrock |
| Gateway | Hermes (Modal serverless) |
| TTS | Voxtral (Modal) |
| Vault | Local filesystem (`~/.clara/vault/`) |
| Build | tsup (ESM + CJS dual output) |

## License

MIT — © Imagination Everywhere
````

## Acceptance Criteria

- [ ] `createClara()` creates a Clara client with gateway + vault + voice + deploy
- [ ] `clara.chat(message)` calls gateway and returns `{ reply, latencyMs, model }`
- [ ] `clara.agent({ name, soul })` returns an instance with `.chat()` and `.speak()`
- [ ] `clara.voice.speak(text)` returns `{ audioUrl, durationSecs? }`
- [ ] `clara.vault.save(key, value)` writes to `~/.clara/vault/<key>.json`
- [ ] `clara.vault.get(key)` reads and deserializes the stored value
- [ ] `clara.vault.append(key, line)` appends a line to a vault file
- [ ] `clara.deploy()` sends deploy action to gateway, returns `{ success, deployId?, message }`
- [ ] Default export is a pre-configured `Clara` instance using env vars
- [ ] Full JSDoc on every exported function, class, and method
- [ ] TypeScript strict mode: zero errors
- [ ] `tsup build` produces `dist/index.js` (ESM) + `dist/index.cjs` (CJS) + `dist/index.d.ts`
- [ ] Dual CJS/ESM exports in package.json `exports` field
- [ ] README covers all methods with code examples
- [ ] No dependencies other than `node-fetch` (for Node <18 fetch compat)

## Push to Branch

```bash
git checkout -b feat/sdk-complete
git add packages/sdk/
git commit -m "feat(sdk): @clara/sdk TypeScript npm package with agent/chat/voice/vault/deploy"
git push origin feat/sdk-complete
```

---

## VRD-001 Surface Awareness Addition

The SDK must carry `surface` context. Add to `ClaraOptions` and pass through to every gateway request:

```typescript
// In src/types.ts — add to ClaraOptions:
export interface ClaraOptions {
  // ... existing fields ...
  /**
   * Surface identifier. Sent with every gateway request for surface-specific script selection.
   * @default "sdk"
   */
  surface?: 'web' | 'ide' | 'panel' | 'cli' | 'sdk';
}
```

And in `GatewayClient.send()` — include `surface` in every payload:

```typescript
const body: GatewayRequest = {
  ...payload,
  user: this.userId,
  surface: this.surface,  // add this field
};
```

This lets the backend Clara scripts engine (Prompt 05) select the correct response register for each surface. An SDK caller using `surface: 'ide'` gets peer-level developer responses. A caller using `surface: 'cli'` gets 1-3 line terminal-dense responses.

**Also add to `ClaraOptions`:**
```typescript
  /**
   * Partner type hint — helps Clara select the right audience register.
   * @default "unknown" (Clara detects from first exchange)
   */
  partnerType?: 'vibe-coder' | 'developer' | 'unknown';
```

**The Six Side Projects question** — add to the `ChatModule` as a helper:
```typescript
/** The canonical six side projects question. Ask once per session after first developer win. */
static readonly SIX_SIDE_PROJECTS_QUESTION =
  "What's the thing you've been wanting to build for the longest time?";
```

**Note:** The full Clara scripts engine lives in `backend/src/features/ai/clara/scripts/` (see Prompt 05). The SDK is a thin client — it passes context but doesn't embed scripts.
