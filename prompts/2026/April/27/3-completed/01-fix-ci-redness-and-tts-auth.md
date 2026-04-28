# Fix: unblock CI on develop + plug TTS auth gap + map raw HTTP error

**Source:** Code review `docs/review/20260427-164313-code-review.md`
**Grade received:** B+
**Issues to fix:** 1 critical (CI blocker), 1 high (auth gap), 1 medium (raw HTTP)
**Estimated time:** 15–25 minutes
**Owner:** /clara-code (anyone — three small mechanical fixes)

---

## Context

Develop's `npm run check` currently fails with 10 TypeScript errors in `packages/ai/test/*.ts` because the `zai` provider's MODELS object is missing 4 model IDs that test files reference. PR #66 was supposed to fix this but was closed without merge. Every Sprint-4 PR will inherit this CI failure — so this must clear first.

While in there, also fix two CLI bugs found in the review:
1. `canonical-greeting.ts` POSTs to `/api/voice/tts` without a Bearer token (the backend requires auth — production calls would 401, or worse, bypass tier billing if backend silently allows).
2. Same file leaks raw HTTP status in an error message — violates the locked "no raw HTTP" rule from prompt 18.

---

## Required Fixes

### CRITICAL: CRIT-1 — Add missing GLM model IDs to `zai` provider

**File:** `packages/ai/src/models.generated.ts` (around line 14914, the `zai` provider block)

**Problem:** `zai` provider exposes 4 models (`glm-4.5-air | glm-4.7 | glm-5-turbo | glm-5.1`) but tests call `getModel("zai", "glm-5")`, `getModel("zai", "glm-4.7-flash")`, `getModel("zai", "glm-4.6v")`, and `getModel("zai", "glm-4.5-flash")` — TypeScript rejects 10 such calls across 5 test files.

**Fix:** In the `zai` provider's MODELS object, add 4 entries patterned on `glm-4.7`. Use the same `provider`, `id`, and `compat` shape. Specifically add:
- `"glm-5"` (with `compat: { zaiToolStream: true }` per the test at line 241)
- `"glm-4.7-flash"` (with `compat: { zaiToolStream: true }` per line 243)
- `"glm-4.6v"` (with `compat: { zaiToolStream: true }` per line 244)
- `"glm-4.5-flash"` (per the references in `tokens.test.ts:171`, `tool-call-without-result.test.ts:180`, `total-tokens.test.ts:338` — verify `zaiToolStream` setting from those tests)

**DO NOT** modify any test files — they're already correct. The change is exclusively in the MODELS data.

**Note:** `models.generated.ts` is generated. If a generator script exists at `packages/ai/scripts/generate-models.*` or similar, run it instead of hand-editing. If no generator is found in this repo, hand-edit is acceptable for now.

**Verification:**
```bash
npm run check 2>&1 | tail -5
# Expect: zero errors, exit code 0
```

### HIGH: HIGH-1 — Add Bearer auth to TTS call

**File:** `packages/cli/src/lib/canonical-greeting.ts:143`

**Problem:** TTS POST has no `Authorization` header. Backend at `backend/src/routes/voice.ts:188+` requires `Clerk session or Clara API key`.

**Fix:** Mirror the auth pattern from `packages/cli/src/lib/agents-api.ts:130-138` and `packages/cli/src/commands/cognitive.ts`:

```typescript
import { pickBearerToken, readClaraCredentials } from "./credentials-store.js";
// ...inside the function, before the fetch:
const creds = await readClaraCredentials();
const bearer = creds ? pickBearerToken(creds) : null;
if (!bearer) {
  return { ok: false, message: "Sign in to continue. Run `clara login`." };
}

ttsRes = await d.fetch(`${backend.url}/api/voice/tts`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${bearer}`,  // ← ADD
  },
  body: JSON.stringify({ text: converse.reply_text }),
  signal: AbortSignal.timeout(15_000),
});
```

If `canonical-greeting.ts` already receives a token via its `deps` argument, prefer that over re-reading credentials. Inspect the function signature first.

### MEDIUM: MED-1 — Replace raw HTTP status leak

**File:** `packages/cli/src/lib/canonical-greeting.ts:155`

**Problem:** `\`TTS request failed: HTTP \${ttsRes.status}\`` leaks raw status code.

**Fix:**
```typescript
import { claraHttpErrorMessage } from "./http-errors.js";  // already imported in stt-client.ts
// ...
if (!ttsRes.ok) {
  const text = await ttsRes.text().catch(() => "");
  return { ok: false, message: claraHttpErrorMessage(ttsRes.status, text) };
}
```

---

## Acceptance Criteria

- [ ] `npm run check` returns 0 errors (CRIT-1 cleared)
- [ ] `npm test --workspace packages/cli` still 47/47 pass
- [ ] `grep "HTTP \${ttsRes.status}" packages/cli/src/lib/canonical-greeting.ts` returns 0 hits
- [ ] `grep -A2 "voice/tts" packages/cli/src/lib/canonical-greeting.ts` shows `Authorization: \`Bearer` in the headers block
- [ ] Add (or update) a unit test in `packages/cli/test/canonical-greeting.test.ts` that asserts the TTS request includes `Authorization` header — would prevent regression
- [ ] Re-run `/review-code` — grade must be A or A−

## Do NOT

- Do not modify test files in `packages/ai/test/` — they're already correct
- Do not modify the backend (`backend/src/routes/voice.ts`) in this PR — that's prompt #02's scope (HIGH-2 from the review)
- Do not refactor `canonical-greeting.ts` beyond the two specific fixes (auth + error mapping)
- Do not add new features
- Do not extract the http-errors module to a shared package (acknowledged tech debt; future sprint)

---

## Archived (completed — code-side)

**Directory:** `prompts/2026/April/27/3-completed/` (2026-04-27).

**Land:** `packages/ai` z.ai model rows; `packages/cli` `canonical-greeting` TTS Bearer + mapped errors; `npm run check` green.
