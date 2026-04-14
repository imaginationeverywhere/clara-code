# Fix: request-tier.ts coverage gap + user-usage.ts missing branches

**Source:** Code review `docs/review/20260414-review-prompts-02-03.md`
**Grade received:** B+
**Issues to fix:** 0 critical, 2 high, 1 medium

---

## Context

PRs #12 and #13 (voice usage tracking + model routing) were reviewed against develop on 2026-04-14.
Two HIGH coverage gaps were found:

1. `request-tier.ts` at 20% — the real function is globally mocked in the test suite; its implementation has never been executed by any test.
2. `user-usage.ts` at 78.9% — two error branches (401 and 500) are untested.

One MEDIUM finding is also included: the hardcoded Modal URL in `models.ts` fallback violates the confidentiality rule (internal infrastructure names must not appear in source code).

---

## Required Fixes

### HIGH — Add unit tests for `resolveRequestTier`

Create `backend/src/__tests__/utils/request-tier.test.ts`.

This file must import and exercise the **real** `resolveRequestTier` function (not a mock). Mock only the database models and `validateApiKeyAgainstHash`.

The function lives at `backend/src/utils/request-tier.ts` and has three auth paths:
1. `sk-clara-` prefix → plaintext key lookup via `ApiKey.findOne({ where: { key: rawKey } })`
2. `cc_live_` prefix → prefix + hash lookup via `ApiKey.findAll` + `validateApiKeyAgainstHash`
3. Clerk auth fallback → `req.auth()` → `Subscription.findOne({ where: { userId } })`
4. No auth / auth errors → returns `"free"` silently

Required test cases:

```typescript
import { resolveRequestTier } from "@/utils/request-tier";

// Mock the models
jest.mock("@/models/ApiKey", () => ({
  ApiKey: { findOne: jest.fn(), findAll: jest.fn() },
}));
jest.mock("@/models/Subscription", () => ({
  Subscription: { findOne: jest.fn() },
}));
jest.mock("@/utils/api-key", () => ({
  validateApiKeyAgainstHash: jest.fn(),
}));

import { ApiKey } from "@/models/ApiKey";
import { Subscription } from "@/models/Subscription";
import { validateApiKeyAgainstHash } from "@/utils/api-key";

// -- sk-clara- path --

it("resolves sk-clara- key to its tier", async () => {
  (ApiKey.findOne as jest.Mock).mockResolvedValueOnce({ tier: "pro" });
  const req = { headers: { authorization: "Bearer sk-clara-abc123" } };
  const tier = await resolveRequestTier(req as any);
  expect(tier).toBe("pro");
});

it("returns free for inactive sk-clara- key", async () => {
  (ApiKey.findOne as jest.Mock).mockResolvedValueOnce(null);
  const req = { headers: { authorization: "Bearer sk-clara-notfound" } };
  const tier = await resolveRequestTier(req as any);
  expect(tier).toBe("free");
});

// -- cc_live_ path --

it("resolves cc_live_ key to its tier via hash", async () => {
  (ApiKey.findAll as jest.Mock).mockResolvedValueOnce([
    { tier: "business", keyHash: "hashvalue" },
  ]);
  (validateApiKeyAgainstHash as jest.Mock).mockResolvedValueOnce(true);
  const req = { headers: { authorization: "Bearer cc_live_abcdefghijklmno" } };
  const tier = await resolveRequestTier(req as any);
  expect(tier).toBe("business");
});

it("returns free when cc_live_ hash does not match", async () => {
  (ApiKey.findAll as jest.Mock).mockResolvedValueOnce([
    { tier: "pro", keyHash: "hashvalue" },
  ]);
  (validateApiKeyAgainstHash as jest.Mock).mockResolvedValueOnce(false);
  const req = { headers: { authorization: "Bearer cc_live_abcdefghijklmno" } };
  const tier = await resolveRequestTier(req as any);
  expect(tier).toBe("free");
});

it("returns free when cc_live_ has no matching candidates", async () => {
  (ApiKey.findAll as jest.Mock).mockResolvedValueOnce([]);
  const req = { headers: { authorization: "Bearer cc_live_abcdefghijklmno" } };
  const tier = await resolveRequestTier(req as any);
  expect(tier).toBe("free");
});

// -- Clerk fallback path --

it("resolves Clerk session to subscription tier", async () => {
  (Subscription.findOne as jest.Mock).mockResolvedValueOnce({ tier: "pro" });
  const req = {
    headers: { authorization: "" },
    auth: jest.fn().mockResolvedValueOnce({ userId: "clerk_user_123" }),
  };
  const tier = await resolveRequestTier(req as any);
  expect(tier).toBe("pro");
});

it("returns free when Clerk user has no subscription", async () => {
  (Subscription.findOne as jest.Mock).mockResolvedValueOnce(null);
  const req = {
    headers: { authorization: "" },
    auth: jest.fn().mockResolvedValueOnce({ userId: "clerk_user_no_sub" }),
  };
  const tier = await resolveRequestTier(req as any);
  expect(tier).toBe("free");
});

// -- No auth / error path --

it("returns free when no Authorization header", async () => {
  const req = { headers: {} };
  const tier = await resolveRequestTier(req as any);
  expect(tier).toBe("free");
});

it("returns free when auth() throws", async () => {
  const req = {
    headers: { authorization: "" },
    auth: jest.fn().mockRejectedValueOnce(new Error("auth failure")),
  };
  const tier = await resolveRequestTier(req as any);
  expect(tier).toBe("free");
});
```

After adding these tests, `request-tier.ts` coverage should reach ≥ 85%.

---

### HIGH — Add missing branches to `user-usage.test.ts`

**File:** `backend/src/__tests__/routes/user-usage.test.ts`

Add two test cases to the existing `describe("routes GET /api/user/usage", ...)` block:

```typescript
it("returns 401 when claraUser has no userId", async () => {
  mockClara.mockImplementationOnce((req: ApiKeyRequest, _res: unknown, next: () => void) => {
    // Simulate missing userId — middleware ran but didn't set userId
    req.claraUser = { userId: undefined as unknown as string, tier: "free" };
    next();
  });
  const res = await request(app).get("/api/user/usage");
  expect(res.status).toBe(401);
  expect(res.body.error).toBe("Unauthorized");
});

it("returns 500 when service throws", async () => {
  getUsage.mockRejectedValueOnce(new Error("db error"));
  const res = await request(app).get("/api/user/usage");
  expect(res.status).toBe(500);
  expect(res.body.error).toBe("Failed to load usage");
});
```

---

### MEDIUM — Remove hardcoded Modal URL from `models.ts`

**File:** `backend/src/config/models.ts:15`

**Before:**
```typescript
const VOICE_FALLBACK = process.env.CLARA_VOICE_URL || "https://quik-nation--clara-voice-server-web.modal.run";
```

**After:**
```typescript
const VOICE_FALLBACK = process.env.CLARA_VOICE_URL ?? "";
```

Then guard against an empty `inferenceBackend` in `resolveModel`. When `inferenceBackend` is empty, the voice route will fail with a network error anyway — but better to fail fast with a clear message. Add at the end of `resolveModel`, before returning:

```typescript
export function resolveModel(requested: string | undefined, tier: ClaraTier): ModelConfig {
  const raw = requested ?? DEFAULT_MODEL;
  const modelName = raw as ClaraModelName;
  const model = MODELS[modelName];
  if (!model) {
    return MODELS[DEFAULT_MODEL];
  }
  if (TIER_RANK[tier] < TIER_RANK[model.requiredTier]) {
    throw new ModelTierError(modelName, model.requiredTier, tier);
  }
  if (!model.inferenceBackend) {
    throw new Error(`Clara voice service is not configured (${modelName})`);
  }
  return model;
}
```

This error is caught by the route handler and returned as a 500 to the caller — no internal URL leaks.

Update `models.test.ts` to cover the new throw path — add one test:
```typescript
it("throws when inferenceBackend is empty", () => {
  const originalUrl = process.env.CLARA_VOICE_URL;
  delete process.env.CLARA_VOICE_URL;
  // Force empty backend (maya with empty MAYA_BACKEND_URL and CLARA_VOICE_URL)
  // This is tricky with module-level constants — spy instead:
  const spy = jest.spyOn(MODELS, "maya", "get").mockReturnValue({
    ...MODELS.maya,
    inferenceBackend: "",
  });
  expect(() => resolveModel("maya", "free")).toThrow("Clara voice service is not configured");
  spy.mockRestore();
  if (originalUrl) process.env.CLARA_VOICE_URL = originalUrl;
});
```

**Note:** If the spy approach is awkward due to module initialization, it's acceptable to add an integration-style test via the voice route that mocks the model config. Do whatever results in a clean, non-brittle test.

---

## Acceptance Criteria

- [ ] `backend/src/__tests__/utils/request-tier.test.ts` exists with ≥ 9 test cases
- [ ] `request-tier.ts` line coverage ≥ 85% (currently 20%)
- [ ] `user-usage.ts` line coverage ≥ 85% (currently 78.9%)
- [ ] `models.ts` hardcoded Modal URL removed — `CLARA_VOICE_URL ?? ""` is the fallback
- [ ] `npm test` — all tests pass (126+ tests, 0 failures)
- [ ] `npm run type-check` — zero TypeScript errors
- [ ] Re-run `/review-code` — grade must be A or A-

## Do NOT

- Do not change any implementation behavior — only add tests and remove the hardcoded URL
- Do not mock `request-tier.ts` in the new test file — import and call the real function
- Do not change the signature or behavior of `resolveModel` beyond adding the empty-backend guard
- Do not fix the `checkAndIncrement` naming (M2) in this prompt — that's a follow-up rename after coverage is fixed
