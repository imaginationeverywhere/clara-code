# Fix: backend brand-hygiene — rename `HERMES_*` env vars to `CLARA_GATEWAY_*`

**Source:** Code review `docs/review/20260427-164313-code-review.md` (HIGH-2)
**Grade received:** B+
**Issues to fix:** 1 high
**Estimated time:** 30–60 minutes (touches code + SSM + App Runner)
**Owner:** /clara-platform (needs SSM + infra coordination — NOT pure /clara-code work)

---

## Context

Strategy briefing locked rule (every Sprint-3 prompt referenced this):

> Env vars: `CLARA_GATEWAY_URL`, `CLARA_BRAIN_URL`, `CLARA_BACKEND_URL`. **Never `HERMES_*`.**

The CLI/IDE rename landed via PR #64 (`be4402b2`). The backend was missed. Production code at `backend/src/routes/voice.ts` still reads `HERMES_GATEWAY_URL` and `HERMES_API_KEY` from the environment, and emits `HERMES_API_KEY is not set` log errors that surface internal names to anyone with CloudWatch access.

---

## Required Fixes

### HIGH: rename in production source

**File:** `backend/src/routes/voice.ts`

Replace 8 references:
- `process.env.HERMES_GATEWAY_URL` → `process.env.CLARA_GATEWAY_URL` (lines 44, 262, 341)
- `process.env.HERMES_API_KEY` → `process.env.CLARA_GATEWAY_API_KEY` (lines 51, 304, 381)
- `const HERMES_TIMEOUT_MS` → `const CLARA_GATEWAY_TIMEOUT_MS` (line 57, plus call sites)
- `headers: hermesHeaders()` → `headers: gatewayHeaders()` (line 311 + the helper definition)
- Log strings: `"HERMES_API_KEY is not set — refusing to proxy to Modal"` → `"Gateway API key is not set — refusing to proxy"` (lines 304, 381). Also strip the "Modal" reference per Internal Names Confidential.
- Comments: `// Real mode: proxies to HERMES_GATEWAY_URL/voice/stt (Whisper on Modal, cp-team owned).` → `// Real mode: proxies to the Clara gateway for voice services.`

### Test rename

**File:** `backend/src/__tests__/routes/voice.test.ts`

Update all 9+ references that read/write `process.env.HERMES_GATEWAY_URL` to use the new name. Test descriptions like `"POST /stt proxies to HERMES_GATEWAY_URL/voice/stt with Bearer HERMES_API_KEY"` → `"POST /stt proxies to gateway with Bearer key"`.

### Infrastructure: SSM + App Runner env

**Owner: /clara-platform** — this requires AWS access.

1. Create new SSM parameters:
   - `/quik-nation/clara-code/CLARA_GATEWAY_URL` (mirror current `HERMES_GATEWAY_URL` value)
   - `/quik-nation/clara-code/CLARA_GATEWAY_API_KEY` (mirror current `HERMES_API_KEY` value)
2. Update App Runner `clara-code-prod` service config to inject the new SSM keys as env vars under the new names.
3. Verify deploy: `clara doctor` against production should still report gateway reachable, brain reachable, backend reachable.
4. After verifying the new names work in production, **delete the old SSM keys** to prevent drift.

### Don't break in flight

The rename code change can land BEFORE the SSM rename if you accept-both-names with a fallback during the migration window:

```typescript
const gatewayUrl = (
  process.env.CLARA_GATEWAY_URL ??
  process.env.HERMES_GATEWAY_URL ??  // ← deprecation fallback, remove after SSM migrated
  ""
).trim();
```

After SSM migration is verified live, delete the deprecation fallback in a follow-up commit. This avoids a "deploy the rename → app crashes because env vars still point to old name" outage.

---

## Acceptance Criteria

- [ ] `grep -r "HERMES" backend/src/ --include="*.ts" | grep -v __tests__` returns 0 hits in production source
- [ ] All `voice.test.ts` tests still pass with the new names
- [ ] Deprecation fallback present (per "Don't break in flight" above) UNTIL SSM migration is confirmed
- [ ] SSM keys created with the new names and populated from the old values
- [ ] App Runner `clara-code-prod` service env updated to use new SSM paths
- [ ] `clara doctor` reports gateway/brain/backend all green against production
- [ ] After live verification, deprecation fallback removed in follow-up commit
- [ ] Old SSM keys deleted after follow-up commit deploys

## Do NOT

- Do not deploy the source rename WITHOUT the deprecation fallback first
- Do not delete old SSM keys before the new ones are confirmed working
- Do not touch `backend/src/routes/` files beyond `voice.ts` — other routes don't have HERMES leaks (verified via grep)
- Do not change the actual gateway/Modal endpoints — only the env var names that POINT at them

---

## Archived (completed — code-side)

**Directory:** `prompts/2026/April/27/3-completed/` (2026-04-27).

**Land:** Backend prefers `CLARA_GATEWAY_URL` / `CLARA_GATEWAY_API_KEY` with `HERMES_*` fallback until infra rename; tests updated. **Ops:** SSM/App Runner migration + fallback removal remain platform-owned.
