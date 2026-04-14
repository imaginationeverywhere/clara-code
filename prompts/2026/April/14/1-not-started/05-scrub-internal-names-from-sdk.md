# Scrub Internal Infrastructure Names from SDK Public Surface

**Source:** `docs/auto-claude/PRODUCT_PRD.md`
**Branch:** `prompt/2026-04-14/05-scrub-internal-names-from-sdk`
**Scope:** `packages/sdk/src/` only

---

## Context

Clara Code's internal infrastructure tools (gateway service, voice server, etc.) must not be visible to developers using the SDK. All public-facing types, error messages, and configuration fields use Clara Code branding only.

The current SDK leaks an internal tool name in two places:
1. `ClaraConfig.hermesUrl` — a required config field developers set directly
2. Error message strings — contain internal service names

## Required Changes

### 1. Rename `hermesUrl` → `gatewayUrl` (optional with default)

In `packages/sdk/src/types.ts`:

**Before:**
```typescript
export interface ClaraConfig {
  apiKey: string;
  hermesUrl: string;
  model?: string;
  voice?: string;
}
```

**After:**
```typescript
export interface ClaraConfig {
  apiKey: string;
  /**
   * Clara API gateway URL. Defaults to https://api.claracode.ai
   * Most developers do not need to set this.
   */
  gatewayUrl?: string;
  model?: string;
  voice?: string;
}
```

Making `gatewayUrl` optional with a sensible default means most developers configure the client with just `{ apiKey }` — they never see or think about the underlying gateway URL.

### 2. Update `client.ts` — use `gatewayUrl` with default

In `packages/sdk/src/client.ts`:

Replace every usage of `config.hermesUrl` with `config.gatewayUrl ?? "https://api.claracode.ai"`.

The `joinHermesUrl` utility function should also be renamed to avoid leaking the name in any stack traces:

In `packages/sdk/src/url.ts` (or wherever `joinHermesUrl` lives):
- Rename `joinHermesUrl` → `joinGatewayUrl`
- Update all call sites in `client.ts`

### 3. Scrub Error Message Strings

In `packages/sdk/src/client.ts`, replace every error string that contains internal names:

| Before | After |
|---|---|
| `"Hermes returned invalid JSON for message"` | `"Clara API returned invalid JSON for message"` |
| `"Hermes message missing valid role"` | `"Clara API message missing valid role"` |
| `"Hermes message missing content string"` | `"Clara API message missing content string"` |
| `"Hermes voice session failed (${res.status})"` | `"Clara voice session failed (${res.status})"` |
| `"Hermes voice session response missing id"` | `"Clara voice session response missing id"` |
| `"Hermes voice message failed (${res.status})"` | `"Clara voice message failed (${res.status})"` |
| `"Hermes voice response missing message"` | `"Clara voice response missing message"` |
| `"Hermes agent ask failed (${res.status})"` | `"Clara agent request failed (${res.status})"` |
| `"Hermes agent ask response missing message"` | `"Clara agent response missing message"` |
| `"Hermes agent stream failed (${res.status})"` | `"Clara agent stream failed (${res.status})"` |

Search for any other occurrences of internal names with:
```bash
grep -r "hermes\|Hermes\|modal\|Modal" packages/sdk/src/
```
Replace all found instances with Clara-branded equivalents.

### 4. Update `createClient` Default

In `packages/sdk/src/client.ts`, update the `createClient` function signature so developers can create a fully functional client with just an API key:

```typescript
export function createClient(config: ClaraConfig): ClaraClient {
  const resolvedConfig = {
    ...config,
    gatewayUrl: config.gatewayUrl ?? "https://api.claracode.ai",
  };
  // use resolvedConfig everywhere below
}
```

### 5. Update README

In `packages/sdk/README.md`, update the usage example:

**Before (if it shows hermesUrl):**
```typescript
const client = createClient({
  apiKey: "cc_live_...",
  hermesUrl: "https://api.claracode.ai",
});
```

**After:**
```typescript
const client = createClient({
  apiKey: "cc_live_...",
  // gatewayUrl defaults to https://api.claracode.ai — no need to set it
});
```

## Tests Required

Update `packages/sdk/test/ask.test.ts` (and any other test files):
- Replace any `hermesUrl` in test config with `gatewayUrl`
- Verify tests still pass — the hermes-stub should work with the renamed field

Run `pnpm -C packages/sdk run test` — all tests must pass.

## Acceptance Criteria

- [ ] `ClaraConfig.hermesUrl` no longer exists — replaced by optional `gatewayUrl`
- [ ] `createClient({ apiKey: "cc_live_..." })` works with no other config
- [ ] No occurrence of internal tool names in `packages/sdk/src/` — verified with grep
- [ ] All error messages say "Clara API" or "Clara voice/agent" — no internal names
- [ ] `pnpm -C packages/sdk run build` succeeds — no TypeScript errors
- [ ] `pnpm -C packages/sdk run test` — all tests pass
- [ ] `packages/sdk/README.md` example does not show `hermesUrl`

## Do NOT

- Do not change the behavior of any method — only names and strings
- Do not remove the `gatewayUrl` option entirely — advanced users may need to point to a dev environment
- Do not touch backend code — SDK only
