# Developer Program Billing — $99/Year Stripe Checkout

**Source:** `docs/auto-claude/CLARA_TALENT_AGENCY_ARCHITECTURE.md` — read this document before writing any code.
**Depends on:** Prompt 01 must be merged (Stripe checkout + webhook infrastructure must exist); Prompt 07 must be merged (`developer_programs` table must exist)
**Branch:** `prompt/2026-04-14/08-developer-program-billing`
**Scope:** `backend/src/features/talent-registry/` (extend existing module)

---

## Context

The Clara Developer Program costs $99/year. It gates access to:
- `@claracode/marketplace-sdk` (private npm registry)
- Talent submission via `POST /api/talents`
- Developer dashboard at `developers.claracode.ai`

Payment is handled entirely by Stripe — Stripe Hosted Checkout for the initial purchase, and Stripe sends a webhook on successful payment. Clara does NOT handle card data directly.

The `developer_programs` table was created in Prompt 07. This prompt wires it to Stripe.

---

## Required Work

### 1. Stripe Price

Add to `backend/.env.example`:
```
STRIPE_PRICE_DEVELOPER_PROGRAM=   # $99/year annual Stripe Price ID
```

This Price ID is created in the Stripe Dashboard (or via Stripe CLI):
- Type: recurring
- Billing period: yearly
- Amount: $99.00 USD
- Product: "Clara Developer Program"

The actual value is stored in SSM at `/clara-code/STRIPE_PRICE_DEVELOPER_PROGRAM` in production.

### 2. Enroll endpoint

In `backend/src/features/talent-registry/talent-registry.routes.ts`, add a new sub-router mounted at `/api/developer-program`:

```typescript
// POST /api/developer-program/enroll — create Stripe Checkout session
router.post("/enroll", apiKeyAuth, async (req, res) => {
  try {
    const userId = (req as any).claraUser.userId;

    // Check if already enrolled
    const alreadyEnrolled = await service.hasDeveloperProgram(userId);
    if (alreadyEnrolled) {
      return res.status(409).json({
        error: "already_enrolled",
        message: "You already have an active Developer Program membership.",
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_DEVELOPER_PROGRAM!, quantity: 1 }],
      success_url: `${process.env.DEVELOPER_PORTAL_URL}/program?enrolled=true`,
      cancel_url: `${process.env.DEVELOPER_PORTAL_URL}/program?canceled=true`,
      metadata: {
        type: "developer_program",
        userId,
      },
      subscription_data: {
        metadata: {
          type: "developer_program",
          userId,
        },
      },
    });

    res.json({ checkoutUrl: session.url });
  } catch (err) {
    console.error("Developer program checkout error:", err);
    res.status(500).json({ error: "internal_error" });
  }
});

// GET /api/developer-program/status — check enrollment status
router.get("/status", apiKeyAuth, async (req, res) => {
  try {
    const userId = (req as any).claraUser.userId;
    const status = await service.getDeveloperProgramStatus(userId);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: "internal_error" });
  }
});
```

Mount this router in `app.ts`:
```typescript
app.use("/api/developer-program", developerProgramRouter);
```

### 3. Service additions

In `backend/src/features/talent-registry/talent-registry.service.ts`, add:

```typescript
async getDeveloperProgramStatus(userId: string): Promise<{
  enrolled: boolean;
  status: string | null;
  expiresAt: Date | null;
}> {
  const result = await this.db.query(
    `SELECT status, expires_at FROM developer_programs WHERE user_id = $1`,
    [userId]
  );
  if (!result.rows[0]) return { enrolled: false, status: null, expiresAt: null };
  const row = result.rows[0];
  const active = row.status === "active" && new Date(row.expires_at) > new Date();
  return { enrolled: active, status: row.status, expiresAt: row.expires_at };
}

async activateDeveloperProgram(userId: string, stripeSubscriptionId: string): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  await this.db.query(
    `INSERT INTO developer_programs (user_id, stripe_subscription_id, status, expires_at)
     VALUES ($1, $2, 'active', $3)
     ON CONFLICT (user_id) DO UPDATE
     SET stripe_subscription_id = EXCLUDED.stripe_subscription_id,
         status = 'active',
         expires_at = EXCLUDED.expires_at`,
    [userId, stripeSubscriptionId, expiresAt]
  );
}

async cancelDeveloperProgram(stripeSubscriptionId: string): Promise<void> {
  await this.db.query(
    `UPDATE developer_programs SET status = 'canceled' WHERE stripe_subscription_id = $1`,
    [stripeSubscriptionId]
  );
}
```

### 4. Webhook handler additions

In `backend/src/routes/webhooks.ts` (from Prompt 01), add handling for Developer Program events inside the existing `checkout.session.completed` handler:

```typescript
if (session.metadata?.type === "developer_program") {
  const userId = session.metadata.userId;
  const subscriptionId = session.subscription as string;
  await talentRegistryService.activateDeveloperProgram(userId, subscriptionId);
  console.log(`Developer Program activated for user ${userId}`);
}
```

Also handle cancellations. Add a new event type inside the existing webhook switch:

```typescript
case "customer.subscription.deleted": {
  const subscription = event.data.object as Stripe.Subscription;
  if (subscription.metadata?.type === "developer_program") {
    await talentRegistryService.cancelDeveloperProgram(subscription.id);
  }
  break;
}

case "customer.subscription.updated": {
  const subscription = event.data.object as Stripe.Subscription;
  if (
    subscription.metadata?.type === "developer_program" &&
    subscription.status === "canceled"
  ) {
    await talentRegistryService.cancelDeveloperProgram(subscription.id);
  }
  break;
}
```

### 5. Environment variable in SSM (note for infrastructure team)

Post-deployment, add to SSM:
```
/clara-code/STRIPE_PRICE_DEVELOPER_PROGRAM = price_xxx   # from Stripe Dashboard
/clara-code/DEVELOPER_PORTAL_URL = https://developers.claracode.ai
```

Also add `DEVELOPER_PORTAL_URL` to `backend/.env.example`:
```
DEVELOPER_PORTAL_URL=https://developers.claracode.ai
```

---

## Tests Required

Add to `backend/src/__tests__/developer-program.test.ts`:

- `GET /api/developer-program/status` without auth → 401
- `GET /api/developer-program/status` with valid key, no program → `{ enrolled: false }`
- `POST /api/developer-program/enroll` → 200 with `{ checkoutUrl: "https://checkout.stripe.com/..." }` (mock Stripe)
- `POST /api/developer-program/enroll` when already enrolled → 409 `already_enrolled`
- Webhook: `checkout.session.completed` with `metadata.type = "developer_program"` → activates program in DB
- Webhook: `customer.subscription.deleted` with `metadata.type = "developer_program"` → cancels program in DB
- After activation: `GET /api/developer-program/status` → `{ enrolled: true }`
- After cancellation: `GET /api/developer-program/status` → `{ enrolled: false }`

All tests must pass. `npm test` exits zero.

---

## Acceptance Criteria

- [ ] `POST /api/developer-program/enroll` creates a Stripe Checkout session and returns `checkoutUrl`
- [ ] Webhook activates `developer_programs` row on `checkout.session.completed` with correct metadata
- [ ] `GET /api/developer-program/status` reflects live enrollment state from DB
- [ ] `POST /api/talents` (from Prompt 07) now correctly unblocks after enrollment
- [ ] `customer.subscription.deleted` webhook marks program as `canceled`
- [ ] `npm run build` — no TypeScript errors
- [ ] `npm test` — all tests pass

## Do NOT

- Do not handle card data directly — Stripe Hosted Checkout only
- Do not grant Developer Program access before the webhook confirms payment
- Do not hardcode the Stripe Price ID — use `process.env.STRIPE_PRICE_DEVELOPER_PROGRAM`
- Do not remove or break existing subscription webhook logic from Prompt 01
