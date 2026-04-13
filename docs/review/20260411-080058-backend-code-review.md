# Code Review — Clara Code Backend
**Date:** 2026-04-11 08:00
**Commit:** f7f3aa3b
**Branch:** develop
**Reviewer:** Granville (Granville T. Woods), Chief Architect
**Scope:** `backend/` directory — Express+Apollo+Clerk+Neon backend built from scratch per prompt `prompts/2026/April/11/05-clara-code-build-backend.md`

---

## ❌ COVERAGE REQUIREMENT CHECK — REVIEW NOTES

**Status:** ❌ NO TESTS — 80% coverage requirement not met

| Metric | Value | Required |
|--------|-------|----------|
| Tests Run | 0 | — |
| Tests Passed | 0 | — |
| Tests Failed | 0 | — |
| Test Coverage | 0% | 80% |
| Status | ❌ BLOCKED | ≥80% |

**Note:** This is a greenfield build delivered from a single-session prompt. The 80% coverage requirement applies before merge to `main`. Tests must be written before this backend is promoted to production. The review continues below as a security and architecture audit — do NOT merge to `main` without tests.

---

## Executive Summary

| | |
|---|---|
| **Files Reviewed** | 14 |
| **Lines Added** | ~650 |
| **Build Status** | ✅ `tsc` — 0 errors |
| **Docker Build** | ✅ Passes |
| **Smoke Test** | ✅ `/health` responds |
| **Test Coverage** | ❌ 0% (no tests written) |
| **Issues Found** | 8 (2 critical, 3 high, 2 medium, 1 low) |
| **Overall Grade** | **B−** |
| **Merge to develop** | ✅ APPROVED |
| **Merge to main** | ❌ BLOCKED (no tests, 2 critical issues) |

**Summary:** The architecture is sound. TypeScript is clean, Docker is correct, the Sequelize models and migrations align, and the health endpoint works. However, there are two critical security gaps — unauthenticated voice endpoints and a missing API key validation middleware — that must be fixed before production. The `main` branch is blocked until tests reach 80% and the critical issues are resolved.

---

## 🔴 Critical Issues

### C1 — API Key Validation Middleware is MISSING

**File:** No file — this feature was never implemented
**Impact:** The entire API key system is incomplete

The backend can CREATE, LIST, and REVOKE `sk-clara-*` keys — but there is no middleware or route that VALIDATES them. When a Clara Code IDE user sets their API key in settings and makes a request to the backend, there is nothing to authenticate that key.

The missing piece:

```typescript
// backend/src/middleware/api-key-auth.ts — DOES NOT EXIST
export const requireApiKey = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer sk-clara-')) {
    return res.status(401).json({ error: 'API key required' });
  }
  const rawKey = header.slice(7);
  const apiKey = await ApiKey.findOne({ where: { key: rawKey, isActive: true } });
  if (!apiKey) return res.status(401).json({ error: 'Invalid or revoked API key' });
  await apiKey.update({ lastUsedAt: new Date() }); // tracks usage
  req.apiKeyUserId = apiKey.userId;
  return next();
};
```

Without this, the `lastUsedAt` field never gets set, usage can't be tracked, and the IDE auth flow has no backend anchor.

**Fix:** Create `backend/src/middleware/api-key-auth.ts` and mount it on any routes the IDE calls (e.g., `/api/agent/*` when that's built).

---

### C2 — Voice Endpoints Are Completely Unauthenticated

**File:** `backend/src/routes/voice.ts`
**Lines:** All routes
**Impact:** Unlimited free TTS to anyone on the internet

`POST /api/voice/greet` and `POST /api/voice/speak` have zero authentication. No Clerk check, no API key check. Any HTTP client can hit these endpoints and proxy unlimited requests to the Modal voice server at Quik Nation's cost. The Modal server charges per TTS call.

```typescript
// Current — no auth
router.post("/greet", async (req: Request, res: Response) => {
  // Proxies directly to Modal with no authentication whatsoever
```

**Fix:** Add `requireAuth()` from Clerk OR the new `requireApiKey` middleware:

```typescript
import { requireAuth } from "@clerk/express";

router.post("/greet", requireAuth(), async (req: AuthenticatedRequest, res: Response) => {
```

---

## 🟠 High Priority Issues

### H1 — CORS Wildcard Fallback in Production

**File:** `backend/src/server.ts`, line 22
**Impact:** Any origin can make credentialed requests if `FRONTEND_URL` is unset

```typescript
// CURRENT — dangerous fallback
app.use(cors({ origin: process.env.FRONTEND_URL || "*", credentials: true }));
```

With `credentials: true`, using `"*"` as origin violates the CORS spec — browsers will actually reject this combination. But the real risk is that if `FRONTEND_URL` is missing from SSM/ECS, every deploy silently opens CORS to all origins instead of failing loudly.

**Fix:**
```typescript
const allowedOrigins = (process.env.FRONTEND_URL || "").split(",").filter(Boolean);
if (allowedOrigins.length === 0) {
  logger.warn("FRONTEND_URL not set — CORS defaulting to claracode.com origins");
  allowedOrigins.push("https://claracode.com", "https://develop.claracode.com");
}
app.use(cors({ origin: allowedOrigins, credentials: true }));
```

---

### H2 — No Rate Limiting on Any Routes

**File:** `backend/src/routes/waitlist.ts`, `voice.ts`, `keys.ts`
**Impact:** Spam, abuse, cost amplification

`POST /api/waitlist` can be hammered to spam the database with fake emails. `POST /api/voice/*` can be hammered to rack up Modal costs (even after fixing C2, rate limiting should be added). `POST /api/keys` can create unlimited keys.

**Fix:** Add `express-rate-limit` (already in `claraagents/backend/package.json`):

```typescript
// backend/src/middleware/rate-limit.ts
import rateLimit from 'express-rate-limit';

export const waitlistLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
export const voiceLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });
export const apiKeyLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 });
```

---

### H3 — `syncUserMiddleware` Dynamic Import Uses `.js` Extension

**File:** `backend/src/middleware/clerk-auth.ts`, line 39
**Impact:** Fragile — may break on certain Node.js/tsc configurations

```typescript
const { User } = await import("../models/User.js"); // .js extension in .ts source
```

The `.js` extension is a workaround for ESM resolution in TypeScript — but this project is CommonJS (`"module": "commonjs"` in tsconfig). In CommonJS, `require('../models/User')` resolves without extension. The `.js` extension will work because Node finds the compiled output, but it breaks the path alias pattern (`@/models/User`) used everywhere else and will confuse future contributors.

**Fix:**
```typescript
// Use require() for CommonJS dynamic import to avoid circular deps:
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { User } = require("@/models/User") as typeof import("@/models/User");
```

---

## 🟡 Medium Priority Issues

### M1 — Email Validation Only at DB Layer, Not Route Layer

**File:** `backend/src/routes/waitlist.ts`
**Impact:** Poor error UX — Sequelize validation errors are exposed raw

```typescript
// No format check — Sequelize validates then throws a raw SequelizeValidationError
const [entry, created] = await WaitlistEntry.findOrCreate({
  where: { email: email.toLowerCase().trim() },
```

If `email` is not a valid email address, Sequelize throws a `SequelizeValidationError` with a stack trace that the generic `catch` block logs and converts to a 500. The user gets `{ error: "Failed to join waitlist" }` instead of `{ error: "Invalid email address" }`.

**Fix:** Validate before hitting the DB:
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  res.status(400).json({ error: 'Invalid email address' });
  return;
}
```

---

### M2 — `database.ts` Throws at Module Load When `DATABASE_URL` Unset

**File:** `backend/src/config/database.ts`, line 16
**Impact:** Hard crash on startup — no graceful degradation

```typescript
if (!databaseUrl) {
  throw new Error("Database URL is not configured...");
}
```

This throw happens at module import time. If `DATABASE_URL` is missing from ECS secrets (e.g., wrong SSM path), the container crashes immediately with an unhandled module load error — not a clean startup failure. The `/health` endpoint can never respond with `db: error` because the server never starts.

**Recommendation:** This is acceptable behavior for production — fail fast. But it should be documented clearly, and the ECS health check start period (currently 30s) gives the task time to be terminated by ECS before the first health probe. No code change required, but add a comment:

```typescript
// Intentionally throws at load time — production requires DATABASE_URL.
// ECS will restart the task; check SSM /clara-code/develop/DATABASE_URL.
```

---

## 🟢 Low Priority Issues

### L1 — `routes/health.ts` Is Registered But Not Mounted

**File:** `backend/src/routes/index.ts`
**Impact:** Dead file — minor confusion

The file `routes/health.ts` exists and exports a router, but it is not imported in `routes/index.ts`. The top-level `/health` in `server.ts` is the real health probe. `routes/health.ts` is dead code.

**Fix:** Delete `backend/src/routes/health.ts`.

---

## ✅ Positive Findings

| What | Why It's Good |
|------|---------------|
| `@BeforeCreate` generates `sk-clara-*` keys | Key generation is model-level, not route-level — can't be bypassed |
| Soft delete on API keys (`isActive: false`) | Keys are revocable without losing audit history |
| Key masking in GET `/api/keys` response | Full key shown only at creation — matches Stripe, GitHub pattern |
| `testConnection({ silent: true })` on `/health` | Health check doesn't log DB noise on every probe |
| Non-root Docker user (`nodejs:nodejs`) | Follows container security best practices |
| `dumb-init` as PID 1 | Proper signal handling for graceful ECS task shutdown |
| Conditional `clerkMiddleware` | Dev can run without `CLERK_SECRET_KEY` for local testing |
| Pool sizing: 5 dev / 10 prod | Neon-appropriate connection limits |
| `underscored: true` Sequelize config | Consistent snake_case in Postgres matching migration files |
| Migration files use snake_case columns | Aligns with `underscored: true` — no column name mismatch |
| `docker build` passes clean | No hidden build-time failures |
| `npm run build` — 0 TypeScript errors | Strict mode compliance |

---

## Required Actions Before `main`

### Must Fix (Critical — do before any production traffic)
1. **[C1]** Create `backend/src/middleware/api-key-auth.ts` — validate `sk-clara-*` tokens
2. **[C2]** Add auth to voice routes (`requireAuth()` or `requireApiKey`)

### Should Fix (High — do in next sprint)
3. **[H1]** Harden CORS config — explicit origin list, no `"*"` fallback
4. **[H2]** Add `express-rate-limit` to waitlist, voice, and keys routes
5. **[H3]** Replace `.js` extension dynamic import with CommonJS `require()`

### Medium (Next sprint)
6. **[M1]** Add email format validation before Sequelize in waitlist route
7. **[M2]** Add explanatory comment on the intentional startup throw

### Low
8. **[L1]** Delete dead `routes/health.ts` file

### Tests (Blocking for `main`)
Write Jest tests covering:
- `POST /api/waitlist` — valid email, duplicate email, invalid email, missing email
- `GET /api/keys` — authenticated, unauthenticated, returns masked keys
- `POST /api/keys` — creates key, returns full key once
- `DELETE /api/keys/:id` — revokes key, can't revoke another user's key
- `POST /api/voice/speak` — unauthenticated rejected (after C2 fix), valid auth proxied
- `/health` — returns `{ status: "ok", db: "connected" }` with live DB

Target: 80% line coverage on `backend/src/routes/**` and `backend/src/middleware/**`.

---

## DevOps Actions (Granville → Elijah)

1. **Update ECS task definition** — add `CLARA_VOICE_URL` from SSM `/quik-nation/shared/CLARA_VOICE_URL` to the `clara-code-backend-dev` task secrets
2. **Remove** `MOM_SLACK_BOT_TOKEN` and `MOM_SLACK_APP_TOKEN` from the task definition (Slack bot is dead)
3. **Scale service** from desired=0 to desired=1 after GitHub Actions deploys the new image
4. **Run migrations** against Neon develop: `cd backend && DATABASE_URL=<from SSM> npm run db:migrate`
5. **Add `FRONTEND_URL`** to SSM at `/clara-code/develop/FRONTEND_URL` (e.g., `https://develop.claracode.com`)
