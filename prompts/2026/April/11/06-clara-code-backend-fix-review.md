# Clara Code Backend — Fix Critical + High Issues from Code Review

**Repo:** `imaginationeverywhere/clara-code`
**Working dir:** `backend/`
**Branch:** `develop`
**Review doc:** `docs/review/20260411-080058-backend-code-review.md`
**Commit to fix:** `f7f3aa3b`

## YOUR MISSION

Fix all Critical and High issues identified in the code review. Zero TypeScript errors required. `npm run build` must pass after every change. Do not change any business logic — type fixes and security additions only.

---

## FIX 1 — [C1] Create API Key Validation Middleware

**File to create:** `backend/src/middleware/api-key-auth.ts`

This is the most important missing piece. When the Clara Code IDE makes requests using a `sk-clara-*` key in the `Authorization` header, this middleware validates it against the database.

```typescript
import type { NextFunction, Request, Response } from "express";
import { ApiKey } from "@/models/ApiKey";
import { logger } from "@/utils/logger";

export interface ApiKeyRequest extends Request {
  apiKeyUserId?: string;
}

/**
 * Validates Bearer sk-clara-* tokens. Updates lastUsedAt on success.
 * Use on any route the Clara Code IDE calls with an API key.
 */
export const requireApiKey = async (
  req: ApiKeyRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer sk-clara-")) {
      res.status(401).json({ error: "API key required. Include: Authorization: Bearer sk-clara-..." });
      return;
    }

    const rawKey = header.slice(7); // strip "Bearer "
    const apiKey = await ApiKey.findOne({
      where: { key: rawKey, isActive: true },
    });

    if (!apiKey) {
      res.status(401).json({ error: "Invalid or revoked API key" });
      return;
    }

    // Track usage without blocking the request
    ApiKey.update({ lastUsedAt: new Date() }, { where: { id: apiKey.id } }).catch(
      (err: unknown) => logger.error("Failed to update lastUsedAt:", err),
    );

    req.apiKeyUserId = apiKey.userId;
    next();
  } catch (error) {
    logger.error("API key validation error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};
```

---

## FIX 2 — [C2] Add Auth to Voice Routes

**File:** `backend/src/routes/voice.ts`

Add `requireAuth()` from Clerk to both voice routes. Voice TTS costs money — only authenticated users can call it.

Replace the current file content with:

```typescript
import axios from "axios";
import { requireAuth } from "@clerk/express";
import { type Request, type Response, Router } from "express";
import { logger } from "@/utils/logger";

const router = Router();

const VOICE_URL =
  process.env.CLARA_VOICE_URL ||
  "https://quik-nation--clara-voice-server-web.modal.run";

// POST /api/voice/greet — generate Clara greeting (Clerk auth required)
router.post("/greet", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, voice_id } = req.body as { text?: string; voice_id?: string };
    const response = await axios.post(
      `${VOICE_URL}/tts`,
      {
        text: text || "Hello! I'm Clara. How can I help you code today?",
        voice_id: voice_id || "clara",
      },
      { responseType: "arraybuffer", timeout: 30000 },
    );

    res.set("Content-Type", "audio/wav");
    res.send(Buffer.from(response.data as ArrayBuffer));
  } catch (error) {
    logger.error("Voice greet error:", error);
    res.status(500).json({ error: "Voice generation failed" });
  }
});

// POST /api/voice/speak — general TTS (Clerk auth required)
router.post("/speak", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, voice_id } = req.body as { text?: string; voice_id?: string };
    if (!text) {
      res.status(400).json({ error: "text is required" });
      return;
    }

    const response = await axios.post(
      `${VOICE_URL}/tts`,
      { text, voice_id },
      { responseType: "arraybuffer", timeout: 30000 },
    );

    res.set("Content-Type", "audio/wav");
    res.send(Buffer.from(response.data as ArrayBuffer));
  } catch (error) {
    logger.error("Voice speak error:", error);
    res.status(500).json({ error: "Voice generation failed" });
  }
});

export default router;
```

---

## FIX 3 — [H1] Harden CORS Configuration

**File:** `backend/src/server.ts`

Replace the wildcard CORS line:

```typescript
// BEFORE — wildcard fallback is dangerous
app.use(cors({ origin: process.env.FRONTEND_URL || "*", credentials: true }));
```

With:

```typescript
// AFTER — explicit origins, no wildcard
const rawOrigins = process.env.FRONTEND_URL || "";
const allowedOrigins = rawOrigins
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

if (allowedOrigins.length === 0) {
  logger.warn(
    "FRONTEND_URL not set — defaulting CORS to claracode.com origins",
  );
  allowedOrigins.push(
    "https://claracode.com",
    "https://www.claracode.com",
    "https://develop.claracode.com",
  );
}

app.use(cors({ origin: allowedOrigins, credentials: true }));
```

---

## FIX 4 — [H2] Add Rate Limiting

**File to create:** `backend/src/middleware/rate-limit.ts`

```typescript
import rateLimit from "express-rate-limit";

/** 5 waitlist signups per IP per 15 minutes */
export const waitlistLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many signups from this IP. Try again later." },
});

/** 20 TTS requests per IP per minute */
export const voiceLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Voice rate limit exceeded. Slow down." },
});

/** 10 API key creations per user per hour */
export const apiKeyCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many API keys created. Try again later." },
  keyGenerator: (req) => req.headers["x-forwarded-for"]?.toString() || req.ip || "unknown",
});
```

Then update `backend/src/routes/waitlist.ts` — add the limiter on the POST route:

```typescript
import { waitlistLimiter } from "@/middleware/rate-limit";

// POST /api/waitlist
router.post("/", waitlistLimiter, async (req: Request, res: Response): Promise<void> => {
  // ... existing code unchanged
```

Update `backend/src/routes/voice.ts` — add `voiceLimiter` on both routes (after the requireAuth middleware):

```typescript
import { voiceLimiter } from "@/middleware/rate-limit";

router.post("/greet", requireAuth(), voiceLimiter, async (req: Request, res: Response) => {
router.post("/speak", requireAuth(), voiceLimiter, async (req: Request, res: Response) => {
```

Update `backend/src/routes/keys.ts` — add `apiKeyCreateLimiter` on POST only:

```typescript
import { apiKeyCreateLimiter } from "@/middleware/rate-limit";

router.post("/", apiKeyCreateLimiter, async (req: AuthenticatedRequest, res: Response) => {
```

**Install if not already in package.json:**
Check `backend/package.json` — if `express-rate-limit` is missing, run:
```bash
cd backend && npm install express-rate-limit
```

---

## FIX 5 — [H3] Fix `.js` Extension in Dynamic Import

**File:** `backend/src/middleware/clerk-auth.ts`

Find this line (inside `syncUserMiddleware`):
```typescript
const { User } = await import("../models/User.js");
```

Replace with:
```typescript
// CommonJS dynamic import to avoid circular dependency — no .js extension needed in CJS
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { User } = require("../models/User") as typeof import("../models/User");
```

---

## FIX 6 — [M1] Email Validation Before Database Layer

**File:** `backend/src/routes/waitlist.ts`

After the `!email` check, add format validation:

```typescript
if (!email) {
  res.status(400).json({ error: "Email is required" });
  return;
}

// Validate format before hitting DB — Sequelize errors are not user-friendly
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  res.status(400).json({ error: "Invalid email address" });
  return;
}
```

---

## FIX 7 — [L1] Delete Dead Health Route File

```bash
rm backend/src/routes/health.ts
```

The top-level `/health` in `server.ts` is the real health probe. `routes/health.ts` is never mounted and is dead code.

---

## VERIFICATION

After all fixes:

```bash
cd /Volumes/X10-Pro/Native-Projects/AI/clara-code/backend

# 1. TypeScript must compile clean
npm run build
# Expected: 0 errors

# 2. Biome lint must pass
cd .. && npm run check
# Expected: no errors in backend/

# 3. Verify the new middleware is importable
node -e "require('./backend/dist/middleware/api-key-auth.js'); console.log('api-key-auth OK')"
node -e "require('./backend/dist/middleware/rate-limit.js'); console.log('rate-limit OK')"
```

---

## COMMIT

```bash
cd /Volumes/X10-Pro/Native-Projects/AI/clara-code
git add backend/src/middleware/ backend/src/routes/ backend/src/server.ts
git commit -m "fix(backend): resolve critical+high code review issues

- [C1] Add api-key-auth middleware (sk-clara-* token validation + lastUsedAt tracking)
- [C2] Require Clerk auth on all voice endpoints (greet, speak)
- [H1] Harden CORS — explicit origin list, no wildcard fallback
- [H2] Add express-rate-limit (waitlist: 5/15min, voice: 20/min, keys: 10/hr)
- [H3] Fix .js extension in clerk-auth dynamic import (CommonJS require)
- [M1] Add email format validation before Sequelize in waitlist route
- [L1] Remove dead routes/health.ts (never mounted)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

git push origin develop
```
