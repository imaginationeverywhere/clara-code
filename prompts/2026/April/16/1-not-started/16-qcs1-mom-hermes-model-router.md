# Prompt 16 — QCS1: mom Package — Register Clara Hermes Model Router
**TARGET REPO:** `/Volumes/X10-Pro/Native-Projects/AI/clara-code`  
_(Auto-classified 2026-04-15. If wrong, edit this line before dispatch.)_
**Author:** Carruthers (Tech Lead, Clara Code Team)
**Task:** Add Clara Gateway (Hermes) as an optional model router in mom
**Machine:** QCS1 (Mac M4 Pro — dispatch via Cursor agent, 2 of 3)
**Priority:** P1 — Allows mom to route through Clara's own infrastructure

---

## Context

The `mom` package (`packages/mom/`) is the master orchestrator module. It dispatches Slack
messages to Claude agents running on the local machine. Currently, it is hardcoded to use
`claude-sonnet-4-5` via the Anthropic API:

```typescript
// packages/mom/src/agent.ts line 27
const model = getModel("anthropic", "claude-sonnet-4-5");
```

We need to add **Clara Gateway (Hermes)** as an optional model backend. When the env var
`HERMES_GATEWAY_URL` is set, mom should route through Hermes (which routes to
Bedrock DeepSeek V3.2) instead of direct Anthropic.

**Hermes Gateway:** `https://info-24346--hermes-gateway.modal.run`
(already deployed, LIVE, used by claraagents.com)

---

## What to Build

### 1. Create `packages/mom/src/hermes.ts`

```typescript
/**
 * Clara Gateway (Hermes) adapter for mom
 * Routes LLM requests through the Hermes gateway on Modal
 * instead of direct Anthropic API.
 *
 * Gateway: https://info-24346--hermes-gateway.modal.run
 * Model: Bedrock DeepSeek V3.2 (via Hermes)
 */

export interface HermesMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface HermesRequest {
  messages: HermesMessage[]
  max_tokens?: number
  stream?: boolean
}

export interface HermesResponse {
  content: string
  model: string
  usage?: {
    input_tokens: number
    output_tokens: number
  }
}

export class HermesClient {
  private readonly gatewayUrl: string

  constructor(gatewayUrl: string) {
    this.gatewayUrl = gatewayUrl.replace(/\/$/, '')
  }

  async complete(request: HermesRequest): Promise<HermesResponse> {
    const url = `${this.gatewayUrl}/v1/chat`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client': 'clara-code-mom/1.0',
      },
      body: JSON.stringify({
        messages: request.messages,
        max_tokens: request.max_tokens ?? 4096,
        stream: false,
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Hermes gateway error ${response.status}: ${body}`)
    }

    return response.json() as Promise<HermesResponse>
  }

  /**
   * Streaming completion — yields text chunks
   */
  async *stream(request: HermesRequest): AsyncGenerator<string> {
    const url = `${this.gatewayUrl}/v1/chat`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client': 'clara-code-mom/1.0',
      },
      body: JSON.stringify({
        messages: request.messages,
        max_tokens: request.max_tokens ?? 4096,
        stream: true,
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Hermes gateway error ${response.status}: ${body}`)
    }

    const reader = response.body?.getReader()
    if (!reader) return

    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      // Parse SSE lines
      for (const line of chunk.split('\n')) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') return
          try {
            const parsed = JSON.parse(data)
            const text = parsed?.choices?.[0]?.delta?.content ?? ''
            if (text) yield text
          } catch {
            // Skip malformed SSE lines
          }
        }
      }
    }
  }

  /**
   * Health check — returns true if gateway is reachable
   */
  async ping(): Promise<boolean> {
    try {
      const response = await fetch(`${this.gatewayUrl}/health`, {
        signal: AbortSignal.timeout(5000),
      })
      return response.ok
    } catch {
      return false
    }
  }
}

/**
 * Create a HermesClient from env, or return null if not configured.
 * Usage: const hermes = createHermesFromEnv()
 */
export function createHermesFromEnv(): HermesClient | null {
  const url = process.env.HERMES_GATEWAY_URL
  if (!url) return null
  return new HermesClient(url)
}
```

---

### 2. Update `packages/mom/src/agent.ts`

Add Hermes support alongside the existing Anthropic model. Find the model declaration
(around line 27) and update:

```typescript
// Find:
const model = getModel("anthropic", "claude-sonnet-4-5");

// Replace with (keep the original as fallback):
import { createHermesFromEnv } from "./hermes.js";

const hermesClient = createHermesFromEnv();

if (hermesClient) {
  const alive = await hermesClient.ping().catch(() => false);
  if (alive) {
    log.logInfo("Model router: Clara Gateway (Hermes) — Bedrock DeepSeek V3.2");
  } else {
    log.logWarning("HERMES_GATEWAY_URL set but gateway unreachable — falling back to Anthropic");
  }
} else {
  log.logInfo("Model router: Anthropic claude-sonnet-4-5 (direct)");
}

const model = getModel("anthropic", "claude-sonnet-4-5"); // Keep as-is; Hermes used in tools below
```

**Note:** The full Hermes routing into the agent run loop requires understanding how
`@mariozechner/pi-ai` models work. For this sprint, the goal is:
1. `HermesClient` exists and compiles ✅
2. Mom logs which model backend is active on startup ✅
3. `hermes.complete()` and `hermes.stream()` are ready for the next sprint to wire into the run loop ✅

Do NOT break the existing run loop — the Anthropic model must still work as-is.

---

### 3. Add env var to `packages/mom/.env.example`

```
# Optional: Route through Clara Gateway (Hermes) instead of direct Anthropic
# HERMES_GATEWAY_URL=https://info-24346--hermes-gateway.modal.run
```

---

### 4. Add to `packages/mom/README.md` (or create if it doesn't exist)

```markdown
## Model Routing

By default, mom uses the Anthropic API directly (`claude-sonnet-4-5`).

To route through Clara Gateway (Hermes — Bedrock DeepSeek V3.2):

```bash
export HERMES_GATEWAY_URL=https://info-24346--hermes-gateway.modal.run
```

Clara Gateway is the Quik Nation shared inference layer. It provides:
- Bedrock DeepSeek V3.2 (faster, lower cost)
- Shared rate limits across all Clara products
- No per-user API key required
```

---

## SSM Parameter (for QCS1 setup)

The gateway URL is in SSM — fetch it:
```bash
aws ssm get-parameter --name '/quik-nation/shared/CLARA_GATEWAY_URL' --query 'Parameter.Value' --output text --region us-east-1
```

Store in QCS1's `~/.profile` or the project's `.env`:
```bash
export HERMES_GATEWAY_URL=<value from SSM>
```

---

## Acceptance Criteria

- [ ] `packages/mom/src/hermes.ts` compiles with no type errors
- [ ] `HermesClient.complete()` makes a POST to `<gateway>/v1/chat`
- [ ] `HermesClient.ping()` returns `true` when gateway is alive (test manually)
- [ ] `createHermesFromEnv()` returns `null` when `HERMES_GATEWAY_URL` is not set
- [ ] `agent.ts` imports `createHermesFromEnv` and logs the active model backend
- [ ] Existing mom bot behavior is UNCHANGED when `HERMES_GATEWAY_URL` is not set
- [ ] `npm run build` passes in `packages/mom/`
- [ ] `.env.example` documents the new env var
