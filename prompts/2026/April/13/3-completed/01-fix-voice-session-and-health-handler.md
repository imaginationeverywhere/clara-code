# Fix: VoiceSession silent error swallowing + Express 4 async health handler

**Source:** Code review `docs/review/20260413-162351-code-review.md`
**Grade received:** B+
**Issues to fix:** 0 critical, 2 high, 1 medium

## Context

Code review of 5 commits (feat/sdk, feat/ide, fix/backend server.ts, chore/create-clara-app
templates). Two production reliability bugs were identified: the SDK's VoiceSession silently
swallows initialization errors producing confusing empty-ID requests, and the Express 4 health
endpoint has an unprotected async handler that can hang ECS health probes under DB failures.
One medium issue: agent stream path is missing the `Accept: text/event-stream` header.

## Required Fixes

### HIGH — H1: Fix VoiceSessionImpl silent error swallowing

**File:** `packages/sdk/src/client.ts` — `VoiceSessionImpl` class

**Problem:** Constructor calls `void this.create()`. When `create()` hits an HTTP error, it calls
`this.settleReady()` (resolving `ready` to fulfilled) then throws. The throw becomes an unhandled
promise rejection. Callers who then call `send()` will `await this.ready` (fulfilled), pass the
`this.closed` guard, and fire a request with `this._id === ""` — producing URLs like
`/v1/voice/sessions//messages` and non-obvious 404s.

**Fix:** Make the `ready` promise rejectable and route errors through it:

```typescript
class VoiceSessionImpl implements VoiceSession {
  private _id = "";
  private closed = false;
  private readonly settleReady: () => void;
  private readonly rejectReady: (err: Error) => void;  // ADD THIS
  readonly ready: Promise<void>;

  constructor(private readonly config: ClaraConfig) {
    let settle!: () => void;
    let reject!: (err: Error) => void;      // ADD THIS
    this.ready = new Promise<void>((res, rej) => {
      settle = res;
      reject = rej;                          // ADD THIS
    });
    this.settleReady = settle;
    this.rejectReady = reject;               // ADD THIS
    void this.create();
  }

  private async create(): Promise<void> {
    // Wrap entire create body in try/catch — route errors to rejectReady
    try {
      const url = joinHermesUrl(this.config.hermesUrl, "/v1/voice/sessions");
      const res = await fetch(url, {
        method: "POST",
        headers: authHeaders(this.config),
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        throw new Error(`Hermes voice session failed (${res.status}): ${await readErrorBody(res)}`);
      }
      const data = (await res.json()) as { id?: unknown };
      if (typeof data.id !== "string" || data.id.length === 0) {
        throw new Error("Hermes voice session response missing id");
      }
      this._id = data.id;
      this.settleReady();
    } catch (err) {
      this.rejectReady(err instanceof Error ? err : new Error(String(err)));  // ADD THIS
    }
  }
  // ... rest unchanged
}
```

After this change, callers of `startVoice()` should `try { await session.ready; }` to catch
initialization failures. Document this in the SDK README.

---

### HIGH — H2: Wrap health endpoint async handler in try/catch

**File:** `backend/src/server.ts` — line ~44

**Problem:** Express 4 does not automatically catch rejected promises from async route handlers.
If `testConnection({ silent: true })` throws (DB timeout, pool error), the health probe hangs
indefinitely. ECS health probes are on a short interval — hung probes trigger task replacement
loops.

**Fix:** Wrap the handler body:

```typescript
// Replace the existing /health handler with:
app.get("/health", async (_req, res) => {
  try {
    const dbOk = await testConnection({ silent: true });
    res.json({ status: "ok", db: dbOk ? "connected" : "error", service: "clara-code-backend" });
  } catch {
    res.status(503).json({ status: "error", db: "unreachable", service: "clara-code-backend" });
  }
});
```

---

### MEDIUM — M2: Add `Accept: text/event-stream` header to agent stream

**File:** `packages/sdk/src/client.ts` — `streamAgentChunks` function

**Problem:** `streamChunks` (the base client stream) correctly sends `Accept: "text/event-stream"`.
`streamAgentChunks` (the agent stream) does not. If Hermes uses content negotiation, agent stream
calls will silently receive JSON instead of SSE and produce no output.

**Fix:** Add the header to `streamAgentChunks`:

```typescript
async function* streamAgentChunks(config: ClaraConfig, agentId: string, prompt: string): AsyncIterable<string> {
  const url = joinHermesUrl(config.hermesUrl, `/v1/agents/${encodeURIComponent(agentId)}/stream`);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...authHeaders(config),
      Accept: "text/event-stream",  // ADD THIS — mirrors streamChunks
    },
    body: JSON.stringify({ prompt, model: config.model, voice: config.voice }),
  });
  if (!res.ok) {
    throw new Error(`Hermes agent stream failed (${res.status}): ${await readErrorBody(res)}`);
  }
  for await (const chunk of parseSseTextStream(res.body)) {
    yield chunk;
  }
}
```

---

## Acceptance Criteria

- [ ] `VoiceSessionImpl` constructor no longer produces unhandled promise rejections when Hermes
      returns a non-2xx response
- [ ] Calling `await session.ready` throws (rejects) when voice session creation fails
- [ ] Health endpoint returns HTTP 503 with `{ status: "error" }` when `testConnection` throws
- [ ] Health endpoint never hangs — always responds within the DB timeout window
- [ ] `streamAgentChunks` sends `Accept: text/event-stream` header
- [ ] `npm test` in `backend/` passes — all 85 tests green
- [ ] `npm test` in `packages/sdk/` passes — existing test green
- [ ] TypeScript compiles clean: `npx tsc --noEmit` in both `backend/` and `packages/sdk/`
- [ ] Re-run `/review-code` — grade must reach A or A-

## Do NOT

- Do not refactor code unrelated to these three fixes
- Do not add new features or new tests (unless needed to verify the H1 fix)
- Do not change the VoiceSession public API signature — `startVoice()` stays synchronous
- Fix only what the review identified
