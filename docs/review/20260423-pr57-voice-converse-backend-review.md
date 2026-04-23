# Code Review — 2026-04-23 · PR #57

**Branch:** `prompt/2026-04-23/05-miles-voice-converse-route`
**Commits:** 3 (prompt queuing + backend implementation + review docs)
**Code files changed:** `backend/src/routes/voice.ts` (+84 lines), `backend/src/__tests__/routes/voice.test.ts` (+111 lines), `backend/.env.example` (+11 lines)
**Reviewer:** automated `/review-code`

---

## ⚠️ COVERAGE REQUIREMENT CHECK

**Status:** ✅ PASS — with one pre-existing caveat (see below)

| Suite | Tests Run | Tests Passed | Tests Failed |
|-------|-----------|--------------|--------------|
| `backend` (full suite) | 238 | 238 | 0 |
| `voice.test.ts` (focused) | 26 | 26 | 0 |

**Pre-existing failure (NOT introduced by this PR):**
`src/__tests__/server.test.ts` fails to **run** on `develop` with `TS2739: Type 'Application<...' is missing request, response`. Verified: fails identically on develop before this branch's commits. All 238 *test cases* that do run pass. This PR neither introduced nor worsened the failure.

### Per-File Coverage

| File | Tests | Status |
|------|-------|--------|
| `backend/src/routes/voice.ts` (new: /converse, /health) | 9 new tests | ✅ PASS |
| `backend/src/__tests__/routes/voice.test.ts` | test-only file | ✅ exempt |
| `backend/.env.example` | documentation | ✅ exempt |

### TypeScript

```
npx tsc --noEmit
# 0 errors, 0 warnings
```

---

## Executive Summary

- **Files Reviewed:** 3 (1 source, 1 test, 1 env doc)
- **Tests:** 26/26 passing ✅, 0 TypeScript errors ✅
- **Issues Found:** 0 critical, 1 high, 2 medium
- **Lines Added:** +84 source, +111 tests, +11 docs
- **Overall Grade:** B+
- **Review Status:** ✅ CONDITIONAL APPROVAL — fix H1 (usage tracking) before merge

The implementation is clean. The fallback chain (`VOICE_SERVER_URL → HERMES_GATEWAY_URL`), the Bearer injection, and the timeout budget are all correct. The auth scheme is consistent with existing `/stt` and `/tts` patterns. The primary finding is a billing gap: `/converse` is the most expensive voice endpoint (STT + LLM + TTS in one call) but does not record usage, so the quota system is blind to it.

---

## High Priority Issues

### H1 — `/converse` missing `voiceUsageService.incrementAfterSuccess` (HIGH)

**File:** `backend/src/routes/voice.ts` lines 342–356

Every other voice endpoint that consumes compute calls `voiceUsageService.incrementAfterSuccess` after a successful response:

```typescript
// ✅ /greet, /speak, /tts all do this:
const userId = req.claraUser?.userId;
const usageTier = (req.claraUser?.tier ?? "free") as VoiceTier;
if (userId) {
  await voiceUsageService.incrementAfterSuccess(userId, usageTier);
}
```

The `/converse` route skips this entirely. Since `voiceLimitMiddleware` checks the counter that `incrementAfterSuccess` increments, users on the `/converse` endpoint can make unlimited calls without the quota system knowing. `/converse` is the most expensive call (STT + LLM + TTS), so this is the worst endpoint to leave untracked.

**Fix — add after `res.json(response.data)` on line 351:**

```typescript
const response = await axios.post(
  `${base}/voice/converse`,
  { audio_base64, voice_id, history, max_tokens },
  { timeout: HERMES_TIMEOUT_MS, headers: { Authorization: `Bearer ${apiKey}` } },
);

// Track usage before responding
const userId = req.claraUser?.userId;
const usageTier = (req.claraUser?.tier ?? "free") as VoiceTier;
if (userId) {
  await voiceUsageService.incrementAfterSuccess(userId, usageTier);
}

res.json(response.data);
```

**Test to add:**
```typescript
it("increments voice usage after successful converse", async () => {
  (axios.post as jest.Mock).mockResolvedValueOnce({
    data: { transcript: "hi", response_text: "hello", audio_base64: "z" },
  });
  await request(app).post("/api/voice/converse").send({ audio_base64: "AAAA" });
  expect(voiceUsageService.incrementAfterSuccess).toHaveBeenCalledWith(
    "user_voice_test",
    "free",
  );
});
```

---

## Medium Priority Issues

### M1 — `axios.get` not in top-level mock; health tests assign it inline

**File:** `backend/src/__tests__/routes/voice.test.ts` lines 327–349

The top-level axios mock is:
```typescript
jest.mock("axios", () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));
```

`axios.get` is not mocked. The health tests work around this by directly assigning it inside each test:
```typescript
(axios.get as jest.Mock) = jest.fn().mockResolvedValueOnce({ data: mockHealth });
```

This is fragile: `jest.clearAllMocks()` in `beforeEach` clears mock state for registered mocks but doesn't handle this re-assigned function consistently. If test execution order changes or Jest internals change, these tests could fail unexpectedly.

**Fix — add `get: jest.fn()` to the top-level mock and use `mockResolvedValueOnce` in tests:**

```typescript
jest.mock("axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),  // add this
  },
}));

// In health tests, use the registered mock:
import axios from "axios";
// ...
(axios.get as jest.Mock).mockResolvedValueOnce({ data: mockHealth });
```

### M2 — Success test doesn't verify `history` and `max_tokens` are forwarded

**File:** `backend/src/__tests__/routes/voice.test.ts` line 297

The success assertion uses:
```typescript
expect.objectContaining({ audio_base64: "AAAA", voice_id: "clara" })
```

This passes even if `history` and `max_tokens` are stripped before the upstream call. A future refactor that accidentally drops these fields would not be caught.

**Fix — extend the assertion:**
```typescript
expect(axios.post).toHaveBeenCalledWith(
  "https://hermes.test.example/voice/converse",
  expect.objectContaining({
    audio_base64: "AAAA",
    voice_id: "clara",
    history: [],       // default
    max_tokens: 300,   // default
  }),
  expect.objectContaining({ ... }),
);
```

---

## Positive Findings

**Auth scheme is correct and consistent:**
- `requireClaraOrClerk` + `voiceLimiter` + `voiceLimitMiddleware` matches `/stt` and `/tts` exactly
- Bearer injection from `converseApiKey()` follows the same Option B pattern as other Hermes routes
- `HERMES_API_KEY` never appears in the response to the client

**Fallback chain is clean:**
- `VOICE_SERVER_URL` → `HERMES_GATEWAY_URL` → `CLARA_VOICE_URL` for URL
- `CLARA_VOICE_API_KEY` → `HERMES_API_KEY` for auth
- Code reuse via `hermesVoiceBase()` and `hermesApiKey()` — no duplication

**Timeout budget is correct:**
- `HERMES_TIMEOUT_MS = 150_000` applied to `/converse` — appropriate for Modal cold starts (60–120s)
- `/health` uses `5_000` — fast-fail is correct for a health probe

**400/503/502 status codes are correctly chosen:**
- 400 for client input validation failures
- 503 for missing configuration (server-side setup issue)
- 502 for upstream proxy failures (upstream is at fault, not this server)

**`.env.example` documentation is thorough:**
- Explains SSM path for `CLARA_VOICE_API_KEY`
- Notes that `VOICE_SERVER_URL` overrides `HERMES_GATEWAY_URL` for `/converse` and `/health` only
- Falls back gracefully if comment convention is missed

**`GET /health` design:**
- No auth required — correct for monitoring/readiness probes
- 5s timeout prevents health checks from hanging on cold Modal containers
- Wraps upstream response in `{ voice_server: ... }` envelope — clean, doesn't merge upstream keys into root

**Pre-existing `server.test.ts` failure confirmed not introduced by this PR:**
- Confirmed on `develop` before this branch's commits
- This PR's diff does not touch `server.test.ts`
- All 238 runnable test cases pass

---

## Pre-Merge Checklist

- [ ] **H1** — Add `voiceUsageService.incrementAfterSuccess` to `/converse` success path + 1 test
- [ ] **H2 (optional but recommended)** — Add `get: jest.fn()` to top-level axios mock
- [ ] Run `npm test` — confirm 27+ tests pass (26 existing + 1 new usage test)
- [ ] Run `npx tsc --noEmit` — confirm 0 errors

**After H1 fix:** This PR is ready to merge.

---

## Suggested Merge Order

```
PR #56 (voice client coverage + install copy fix) — already approved
  ↓
PR #57 (backend /converse + /health) — approve after H1 fix  ← this PR
  ↓
Prompt 07 (unblock PR #03 — tests + @ts-nocheck)
  ↓
PR #03 re-review
```

---

**Review Status:** ✅ CONDITIONAL APPROVAL
**Blocker:** H1 — add usage tracking to `/converse`
**Grade:** B+ (clean implementation, one billing gap)
