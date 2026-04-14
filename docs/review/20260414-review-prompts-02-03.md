# Code Review — Prompts 02 + 03
**Date:** 2026-04-14
**Branch:** develop (PRs #12, #13 merged)
**Reviewer:** Carruthers (automated via /review-code)
**Scope:** Voice exchange usage tracking + Named model routing (Mary/Maya/Nikki)

---

## ⚠️ COVERAGE REQUIREMENT CHECK

**Status:** ⚠️ CONDITIONAL PASS — average above threshold, two individual files below 80%

| Metric | Value | Status |
|--------|-------|--------|
| Tests Run | 126 | — |
| Tests Passed | 126 | ✅ |
| Tests Failed | 0 | ✅ |
| Overall Line Coverage | 89.6% | ✅ |
| Overall Statement Coverage | 89.5% | ✅ |
| Average (changed files) | 87.0% | ✅ |

### Per-File Coverage — Changed Files

| File | Lines | Stmts | Branch | Status |
|------|-------|-------|--------|--------|
| `src/config/models.ts` | 95.8% | 95.8% | 93.3% | ✅ |
| `src/middleware/api-key-auth.ts` | 85.5% | 86.0% | 76.5% | ✅ |
| `src/middleware/voice-limit.ts` | 100.0% | 100.0% | 83.3% | ✅ |
| `src/models/ApiKey.ts` | 100.0% | 100.0% | 100.0% | ✅ |
| `src/models/Subscription.ts` | 100.0% | 100.0% | 100.0% | ✅ |
| `src/models/VoiceUsage.ts` | 100.0% | 100.0% | 100.0% | ✅ |
| `src/routes/checkout.ts` | 85.1% | 85.4% | 71.4% | ✅ |
| `src/routes/models.ts` | 87.5% | 87.5% | 100.0% | ✅ |
| `src/routes/user-api-key.ts` | 80.5% | 80.5% | 66.7% | ✅ |
| `src/routes/user-usage.ts` | 78.9% | 78.9% | 71.4% | ⚠️ |
| `src/routes/voice.ts` | 91.1% | 91.1% | 71.4% | ✅ |
| `src/routes/webhooks-stripe.ts` | 83.3% | 80.7% | 47.5% | ✅ |
| `src/services/voice-usage.service.ts` | 97.0% | 97.1% | 78.6% | ✅ |
| `src/utils/api-key.ts` | 100.0% | 100.0% | 100.0% | ✅ |
| `src/utils/request-tier.ts` | 20.0% | 20.0% | 0.0% | ❌ |

**Two files below 80% require corrective tests before next merge to main.**

---

## Executive Summary

- **Files Reviewed:** 15 changed source files
- **Tests:** ✅ 126/126 passing
- **Overall Coverage:** 89.6% lines (✅ above threshold)
- **Issues Found:** 5 (0 critical, 2 high, 2 medium, 1 low)
- **Lines Changed:** +3,200 approx across PRs #11–13
- **Overall Grade:** B+
- **Review Status:** APPROVED for develop — corrective tests required before merge to main

---

## High Priority Issues

### H1 — `request-tier.ts` implementation never tested (20% coverage)
- **File:** `backend/src/utils/request-tier.ts`
- **Problem:** `resolveRequestTier()` is always replaced with `jest.fn()` via `jest.mock("@/utils/request-tier", ...)` in `models.test.ts`. The actual function body — which handles three distinct authentication paths — has zero test execution. Only the module-level type declarations contribute to the 20% floor.
- **Risk:** If the auth logic for `GET /api/models` is broken, it won't be caught until production. The `sk-clara-` legacy key path, the `cc_live_` hash-validation path, and the Clerk auth fallback are all unexercised.
- **Fix:** Add `backend/src/__tests__/utils/request-tier.test.ts` with dedicated unit tests that import and call the real function (not mocked). Test all three auth paths plus the unauthenticated → "free" fallback.

### H2 — `user-usage.ts` missing two branches (78.9%)
- **File:** `backend/src/routes/user-usage.ts:16–19` (401 path) and `:33–36` (500 path)
- **Problem:** The existing tests cover the happy path (free tier, pro tier) but neither the `!userId` guard (line 16) nor the catch block (line 33) are tested. Both are error paths that developers could hit.
- **Fix:** Add two tests to `backend/src/__tests__/routes/user-usage.test.ts`:
  1. Mock middleware to NOT set `claraUser.userId` → expect 401 `{ error: "Unauthorized" }`
  2. Mock `voiceUsageService.getUsage` to throw → expect 500 `{ error: "Failed to load usage" }`

---

## Medium Priority Issues

### M1 — Hardcoded Modal URL in `models.ts:15` (confidentiality)
- **File:** `backend/src/config/models.ts:15`
- **Problem:**
  ```typescript
  const VOICE_FALLBACK = process.env.CLARA_VOICE_URL || "https://quik-nation--clara-voice-server-web.modal.run";
  ```
  The fallback value contains the Modal infrastructure domain. Per project policy, internal infrastructure names (Modal, Hermes, PI) must not appear in any surface visible to developers. While this URL does not surface in API responses (the spec correctly prevents `inferenceBackend` from being returned), it is present in source code that ships in the image and can appear in error logs, stack traces, or debug output.
- **Fix:** Remove the hardcoded fallback or replace it with a Clara-branded placeholder:
  ```typescript
  const VOICE_FALLBACK = process.env.CLARA_VOICE_URL ?? "";
  // In resolveModel, throw if inferenceBackend is empty string:
  // if (!model.inferenceBackend) throw new Error("Clara voice service unavailable");
  ```
  OR simply require `CLARA_VOICE_URL` to be set — it should always be set in any real environment (local dev, dev, prod). A missing env var should be loud, not silently fall back to a hardcoded internal URL.

### M2 — `checkAndIncrement` is misleadingly named
- **File:** `backend/src/services/voice-usage.service.ts:53`
- **Problem:** The method name implies it both checks AND increments. The docstring corrects this ("Does not increment"), and `voice-limit.ts` comments reinforce it ("Does not increment usage — callers must call `voiceUsageService.incrementAfterSuccess`"). But a future developer reading only the method signature could skip `incrementAfterSuccess`, resulting in voice usage never being tracked.
- **Fix:** Rename to `checkLimit` or `hasRemainingExchanges` to make the check-only semantics clear from the signature:
  ```typescript
  async hasRemainingExchanges(userId: string, tier: VoiceTier): Promise<boolean>
  ```
  Update all call sites: `voice-limit.ts` and any tests.

---

## Low Priority Issues

### L1 — `webhooks-stripe.ts` branch coverage at 47.5%
- **File:** `backend/src/routes/webhooks-stripe.ts`
- **Problem:** Line coverage passes (83.3%) but branch coverage is 47.5%, indicating several conditional paths aren't exercised:
  - `customer.subscription.updated` tier resolution via price ID vs. metadata fallback
  - `Subscription.update` vs. `Subscription.create` branch (subRow exists or not)
  - `prevTier !== tier` guard for key re-issue
- **Fix:** Extend `webhooks-stripe-events.test.ts` to cover these branches. Not blocking but should be addressed in the next test pass.

---

## Test Quality Assessment

- **Coverage:** 87.0% average for changed files (✅ above 80%)
- **Test Organization:** Good — follows `src/__tests__/` mirror structure
- **Assertions:** Strong on happy paths; error paths need work (H2)
- **Mocking:** Mostly correct, but the global mock in `models.test.ts` renders `request-tier.ts` invisible to coverage (H1)
- **Edge Cases:** `resolveModel` has strong coverage (7 scenarios, all specified in the prompt)
- **`VoiceUsageService`:** Well-tested with dedicated service test file

---

## Positive Findings

- **Voice limit architecture is correct.** The separation of concerns is clean: `voiceLimitMiddleware` (gate check before) + `voiceUsageService.incrementAfterSuccess` (increment after success) is exactly right. No double-counting, no lost increments on failed voice calls.
- **`MODELS` registry is well-typed.** `ClaraModelName`, `ClaraTier`, `TIER_RANK` — the type system enforces correct tier comparison. No magic strings in the tier logic.
- **`inferenceBackend` never exposed.** Verified across `routes/models.ts`, `routes/voice.ts`, and all test payloads — the internal backend URL is never returned in any response. ✅
- **Model names are Clara-branded.** `mary`, `maya`, `nikki` appear in all public-facing surfaces. No underlying provider names visible. ✅
- **`resolveModel` error response is correctly shaped.** `modelTierErrorResponse` returns `upgrade_url`, `required_tier`, `current_tier` — matches the spec from Prompt 03.
- **`voiceLimitMiddleware` 402 response is correctly shaped** — includes `used`, `limit`, `reset_date`, `upgrade_url` as spec'd.
- **Migration `005-add-voice-usage.js`** — `UNIQUE(user_id, billing_month)` constraint prevents double-counting at the DB level; `exchangeCount` defaults to 0 correctly.
- **`getBillingMonthKey` and `getNextResetDateKey`** use UTC consistently — no timezone bugs in billing period calculation.

---

## Corrective Action Required

Two tests must be added before `develop` can merge to `main`:

1. `backend/src/__tests__/utils/request-tier.test.ts` — full unit test of `resolveRequestTier` (H1)
2. Two additional cases in `backend/src/__tests__/routes/user-usage.test.ts` — 401 and 500 paths (H2)

See corrective prompt: `prompts/2026/April/14/1-not-started/13-fix-request-tier-and-usage-coverage.md`

---

*Review generated by Carruthers — Clara Code Tech Lead*
