# Voice Exchange Usage Tracking + Tier Enforcement

**Source:** `docs/auto-claude/PRODUCT_PRD.md` — read this document before writing any code.
**Depends on:** Prompt 01 must be merged first (`subscriptions` and `api_keys` tables must exist)
**Branch:** `prompt/2026-04-14/02-voice-exchange-usage-tracking`
**Scope:** `backend/src/` only

---

## Context

Clara Code is voice-first. The billing unit is a **voice exchange** — one full round trip (user speaks → Clara responds). See `docs/auto-claude/PRODUCT_PRD.md` for tier definitions.

Free tier = 100 voice exchanges/month. Pro and Business = unlimited. This prompt adds the middleware and DB tracking to enforce that limit.

## Free Tier Limit (from PRD)

- **Free:** 100 voice exchanges per calendar month
- **Pro:** Unlimited
- **Business:** Unlimited
- Reset: 1st of each month at 00:00 UTC

## Required Work

### 1. Database Migration

Create migration `backend/src/migrations/XXXXXX-add-voice-usage.js`:

```sql
CREATE TABLE voice_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  exchange_count INTEGER NOT NULL DEFAULT 0,
  billing_month DATE NOT NULL,  -- first day of the month: 2026-04-01
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, billing_month)
);

CREATE INDEX idx_voice_usage_user_month ON voice_usage(user_id, billing_month);
```

Run migration on all three environments:
- `backend/.env.local`
- `backend/.env.develop`
- `backend/.env.production`

### 2. Usage Service

Create `backend/src/services/voice-usage.service.ts`:

```typescript
export class VoiceUsageService {
  // Get current month's usage for a user
  async getUsage(userId: string): Promise<{ used: number; limit: number | null; resetDate: string }>;

  // Increment usage by 1. Returns false if free tier limit exceeded (do not process the request).
  async checkAndIncrement(userId: string, tier: "free" | "pro" | "business"): Promise<boolean>;

  // Get billing month key (e.g., "2026-04-01" for April 2026)
  private getBillingMonth(): string;
}
```

Logic for `checkAndIncrement`:
- Pro and Business: always return `true` (unlimited), still increment counter for analytics
- Free: check current month count; if `count >= 100` return `false`; else increment and return `true`
- Use `INSERT ... ON CONFLICT DO UPDATE` (upsert) for atomic increment

### 3. Usage Enforcement Middleware

Create `backend/src/middleware/voice-limit.ts`:

Runs after `api-key-auth` middleware on all `/api/voice/*` routes.

If `checkAndIncrement` returns `false`:
```json
HTTP 402 Payment Required
{
  "error": "voice_limit_reached",
  "message": "You've used all 100 voice exchanges for this month.",
  "used": 100,
  "limit": 100,
  "reset_date": "2026-05-01",
  "upgrade_url": "https://claracode.ai/pricing"
}
```

If `checkAndIncrement` returns `true`: call `next()`.

### 4. Usage Dashboard Endpoint

`GET /api/user/usage`
- Requires auth (Clerk JWT or API key)
- Returns:
```json
{
  "tier": "free",
  "voice_exchanges": {
    "used": 47,
    "limit": 100,
    "reset_date": "2026-05-01",
    "unlimited": false
  }
}
```
For Pro/Business return `"unlimited": true` and `"limit": null`.

### 5. Wire Middleware to Voice Routes

In `backend/src/routes/voice.ts` (or wherever voice routes are registered):
- Add `voiceLimitMiddleware` after `apiKeyAuth` middleware on all POST routes that complete a voice exchange
- Only increment AFTER a successful response (not on errors) — use a response interceptor pattern or post-processing hook

## Tests Required

Add to `backend/src/__tests__/`:
- `voice-usage.test.ts`:
  - Free user at 0 usage: `checkAndIncrement` returns true
  - Free user at 99 usage: `checkAndIncrement` returns true, count becomes 100
  - Free user at 100 usage: `checkAndIncrement` returns false
  - Pro user at 500 usage: `checkAndIncrement` always returns true
  - Usage resets correctly on new billing month
- `voice-limit.test.ts`:
  - Middleware returns 402 with correct JSON when limit exceeded
  - Middleware calls `next()` when under limit

All tests must pass. Backend coverage must remain ≥ 80%.

## Acceptance Criteria

- [ ] `voice_usage` table created and migrated on all three environments
- [ ] Free users blocked with HTTP 402 after 100 exchanges in a calendar month
- [ ] Pro and Business users never blocked (unlimited)
- [ ] Usage counter resets on 1st of month
- [ ] `GET /api/user/usage` returns correct counts and reset date
- [ ] Counter only increments on successful exchanges, not on errors
- [ ] `npm test` passes — zero failures
- [ ] Coverage remains ≥ 80%

## Do NOT

- Do not touch frontend code
- Do not change subscription logic from Prompt 01
- Do not block Pro or Business users under any usage scenario
