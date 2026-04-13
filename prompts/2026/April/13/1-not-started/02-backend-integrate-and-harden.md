# 02 — Backend: Integrate Dashboard + Add Svix + Harden

**Surface:** Express backend (Node 20, TypeScript, ECS Fargate)
**Repo:** `/Volumes/X10-Pro/Native-Projects/AI/clara-code`
**Branch:** `develop`
**Agent:** Miles (backend Cursor agent on QCS1)

---

## Context

The backend is live on ECS Fargate with 80%+ test coverage. Two open items block production readiness:
1. **Svix webhook verification is missing** — any POST to `/api/webhooks/*` is accepted without signature check
2. **Dashboard integration test** — verify the `/api/keys` CRUD routes work end-to-end with the frontend

---

## Task 1 — Add Svix Verification to Webhook Handler

**File:** `backend/src/routes/webhooks.ts` (or wherever the Stripe/Clerk webhook routes live — check `backend/src/routes/index.ts`)

Add Svix signature verification to all inbound webhooks:

```typescript
import { Webhook } from 'svix'

// For Stripe webhooks:
const stripeWh = new Webhook(process.env.STRIPE_WEBHOOK_SECRET!)
try {
  stripeWh.verify(rawBody, {
    'svix-id': req.headers['svix-id'] as string,
    'svix-timestamp': req.headers['svix-timestamp'] as string,
    'svix-signature': req.headers['svix-signature'] as string,
  })
} catch (err) {
  return res.status(400).json({ error: 'Invalid webhook signature' })
}

// For Clerk webhooks:
const clerkWh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
// same pattern
```

**Requirements:**
- Install `svix` if not already in `backend/package.json`
- Use raw body (not parsed JSON) for verification — ensure `express.raw({ type: 'application/json' })` middleware is applied to webhook routes
- Return 400 with `{ error: 'Invalid webhook signature' }` on verification failure
- Add unit tests covering: valid signature passes, invalid signature returns 400, missing headers returns 400
- Update `backend/.env.example` with `STRIPE_WEBHOOK_SECRET=whsec_...` and `CLERK_WEBHOOK_SECRET=whsec_...`

---

## Task 2 — Verify /api/keys CRUD Routes

**File:** `backend/src/routes/keys.ts`

Confirm these routes exist and work correctly:
- `GET /api/keys` — returns all keys for authenticated user (Clerk JWT required)
- `POST /api/keys` — creates a new key, returns `{ id, name, prefix, createdAt }` (never return full secret after creation except in POST response)
- `DELETE /api/keys/:id` — deletes key, verifies ownership
- `GET /api/keys/:id` — optional, but if it exists ensure it doesn't expose the full secret

If any are missing, implement them following the existing pattern in `keys.ts`.

Run full test suite and verify coverage stays ≥80%:
```bash
cd backend
npm test
npm run test:coverage
```

---

## Task 3 — Add Waitlist Endpoint (if not complete)

**File:** `backend/src/routes/waitlist.ts`

Verify `POST /api/waitlist` exists and stores email to Neon DB. If it's a stub, implement it:
- Validate email format
- Check for duplicate email (return 200 if already on list — idempotent)
- Store in `waitlist` table (create migration if needed)
- Return `{ message: 'Added to waitlist' }`

---

## Task 4 — Health Check Verify

Confirm `GET /health` returns:
```json
{
  "status": "ok",
  "db": "connected",
  "version": "x.x.x"
}
```

If DB connection check is missing, add it.

---

## Task 5 — Environment Docs Update

Update `backend/.env.example` to reflect all required variables including Svix secrets. Update `docs/auto-claude/MVP_BLOCKERS.md` — mark BLK-03 as resolved once Svix is in.

---

## Commit and Push

```bash
cd /Volumes/X10-Pro/Native-Projects/AI/clara-code
git add backend/
git commit -m "feat(backend): add Svix webhook verification, verify /api/keys CRUD complete"
git push origin develop
```

---

## Do NOT

- Do not touch frontend files
- Do not change ECS Fargate infrastructure
- Do not add features beyond what's listed here
- Do not break existing test coverage below 80%
