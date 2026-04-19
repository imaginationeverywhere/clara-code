# Prompt 09 — Remove Internal Voice URL from Source Code

**Date**: 2026-04-15
**Branch**: `prompt/2026-04-15/09-voice-url-ssm`
**Flags**: `--security --testing`
**Estimated scope**: 2–3 files

---

## Context

`backend/src/routes/voice.ts` line 17 has a hardcoded fallback URL:

```typescript
const VOICE_FALLBACK = process.env.CLARA_VOICE_URL || "https://quik-nation--clara-voice-server-web.modal.run";
```

This exposes the name of an internal infrastructure tool in the source code. All voice URLs must come from environment variables (SSM in production) with no hardcoded fallback.

**Rule**: No internal infrastructure tool names, vendor-specific URLs, or deployment platform names are visible in source code, documentation, or error messages. The product is "Clara" end-to-end.

---

## Task 1 — Remove hardcoded URL from `backend/src/routes/voice.ts`

Replace the fallback line:

```typescript
// BEFORE:
const VOICE_FALLBACK = process.env.CLARA_VOICE_URL || "https://quik-nation--clara-voice-server-web.modal.run";

// AFTER:
const VOICE_FALLBACK = process.env.CLARA_VOICE_URL;
if (!VOICE_FALLBACK) {
  logger.warn("CLARA_VOICE_URL is not set — voice endpoints will fail gracefully");
}
```

Update `ttsBaseUrl` to handle the undefined case:

```typescript
function ttsBaseUrl(inferenceBackend: string): string {
  const base = inferenceBackend.trim().replace(/\/$/, "");
  if (base.length > 0) return base;
  if (!VOICE_FALLBACK) return "";
  return VOICE_FALLBACK.replace(/\/$/, "");
}
```

In any route handler that calls `ttsBaseUrl()`, add a check before proxying:

```typescript
const voiceUrl = ttsBaseUrl(inferenceBackend);
if (!voiceUrl) {
  res.status(503).json({ error: "Voice service is not available" });
  return;
}
```

---

## Task 2 — Scan for other internal URL/tool references

Run the following check and fix any matches:

```bash
grep -r "modal.run\|hermes-gateway\|quik-nation--\|clara-voice-server" \
  backend/src/ frontend/src/ packages/ \
  --include="*.ts" --include="*.tsx" --include="*.js" \
  --exclude-dir=node_modules
```

For each match:
- If it's a hardcoded URL → move to env var (no hardcoded fallback)
- If it's a comment explaining what the URL is → remove the identifying details, keep a generic comment

**Exception**: `.env.example` files may show the format/shape of the env var (e.g., `CLARA_VOICE_URL=https://your-voice-endpoint.example.com`) but NEVER the actual internal URL.

---

## Task 3 — Update `backend/.env.example`

Ensure `CLARA_VOICE_URL` is documented:

```bash
# Clara Voice Service — set to your deployed voice endpoint
# Retrieve from AWS SSM: aws ssm get-parameter --name '/clara-code/CLARA_VOICE_URL' --with-decryption
CLARA_VOICE_URL=https://your-voice-endpoint.example.com
```

---

## Task 4 — Update tests

In any test that mocks or stubs voice routes, ensure it uses `process.env.CLARA_VOICE_URL = 'https://test.example.com'` (not a hardcoded internal URL).

Check: `grep -r "modal.run\|hermes-gateway" backend/src/__tests__/ --include="*.ts"`

---

## Acceptance Criteria

- [ ] `grep -r "modal.run\|hermes-gateway\|quik-nation--" backend/src/ frontend/src/ packages/ --include="*.ts" --include="*.tsx"` returns zero results
- [ ] When `CLARA_VOICE_URL` is not set, voice endpoints return `503` with `"Voice service is not available"` — not a 500 crash
- [ ] `backend/.env.example` documents `CLARA_VOICE_URL` without revealing the actual URL
- [ ] `cd backend && npm run type-check` passes
- [ ] Backend tests pass: `cd backend && npm test`

## What NOT to Change

- The env var name `CLARA_VOICE_URL` itself is fine — it's generic
- SSM parameter path `/clara-code/CLARA_VOICE_URL` is fine — not visible to end users
- No changes to frontend, IDE extension, or CLI packages
