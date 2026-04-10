# Stripe Subscription Webhook Events

## Critical Events (Must Handle)

### customer.subscription.created
Triggered when a new subscription is created.

```json
{
  "type": "customer.subscription.created",
  "data": {
    "object": {
      "id": "sub_xxx",
      "customer": "cus_xxx",
      "status": "active" | "trialing" | "incomplete",
      "items": { "data": [{ "price": { "id": "price_xxx" } }] },
      "current_period_start": 1234567890,
      "current_period_end": 1234567890,
      "trial_start": null,
      "trial_end": null,
      "cancel_at_period_end": false,
      "metadata": { "userId": "xxx" }
    }
  }
}
```

**Action**: Create subscription record in database, send welcome email.

### customer.subscription.updated
Triggered when subscription is modified (plan change, status change, etc.).

```json
{
  "type": "customer.subscription.updated",
  "data": {
    "object": { /* Same as created */ },
    "previous_attributes": {
      "items": { "data": [{ "price": { "id": "price_old" } }] }
    }
  }
}
```

**Action**: Sync subscription state, update features, send confirmation if plan changed.

### customer.subscription.deleted
Triggered when subscription is canceled (immediately or at period end).

```json
{
  "type": "customer.subscription.deleted",
  "data": {
    "object": {
      "id": "sub_xxx",
      "status": "canceled",
      "canceled_at": 1234567890
    }
  }
}
```

**Action**: Update status to canceled, revoke access, send cancellation confirmation.

### invoice.payment_succeeded
Triggered when subscription invoice is paid successfully.

```json
{
  "type": "invoice.payment_succeeded",
  "data": {
    "object": {
      "id": "in_xxx",
      "subscription": "sub_xxx",
      "customer": "cus_xxx",
      "amount_paid": 2900,
      "status": "paid"
    }
  }
}
```

**Action**: Update subscription to active, extend period, send receipt.

### invoice.payment_failed
Triggered when payment attempt fails.

```json
{
  "type": "invoice.payment_failed",
  "data": {
    "object": {
      "id": "in_xxx",
      "subscription": "sub_xxx",
      "attempt_count": 1,
      "next_payment_attempt": 1234567890
    }
  }
}
```

**Action**: Update status to past_due, notify customer, suggest payment method update.

## Important Events (Should Handle)

### customer.subscription.trial_will_end
Triggered 3 days before trial ends.

**Action**: Send trial ending reminder, prompt to add payment method.

### customer.subscription.paused
Triggered when subscription is paused.

**Action**: Update status, suspend access while preserving data.

### customer.subscription.resumed
Triggered when paused subscription resumes.

**Action**: Restore access, update status to active.

### invoice.upcoming
Triggered ~1 day before invoice is finalized.

**Action**: Send upcoming charge notification.

### checkout.session.completed
Triggered when Checkout Session completes successfully.

```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_xxx",
      "mode": "subscription",
      "subscription": "sub_xxx",
      "customer": "cus_xxx",
      "metadata": { "userId": "xxx" }
    }
  }
}
```

**Action**: Link subscription to user, redirect to success page.

## Informational Events (Nice to Have)

- `customer.subscription.pending_update_applied` - Scheduled change applied
- `customer.subscription.pending_update_expired` - Scheduled change expired
- `invoice.created` - New invoice created
- `invoice.finalized` - Invoice finalized and ready
- `invoice.paid` - Invoice marked as paid
- `invoice.voided` - Invoice voided

## Webhook Handler Template

```typescript
switch (event.type) {
  case 'customer.subscription.created':
  case 'customer.subscription.updated':
    await syncSubscription(event.data.object);
    break;

  case 'customer.subscription.deleted':
    await cancelSubscription(event.data.object);
    break;

  case 'invoice.payment_succeeded':
    await handlePaymentSuccess(event.data.object);
    break;

  case 'invoice.payment_failed':
    await handlePaymentFailure(event.data.object);
    break;

  case 'customer.subscription.trial_will_end':
    await sendTrialEndingEmail(event.data.object);
    break;
}
```

## Event Ordering

Events are not guaranteed to arrive in order. Always use `event.created` timestamp or subscription `updated` field to determine latest state.

## Idempotency

Webhooks may be delivered multiple times. Use `event.id` as idempotency key:

```typescript
const processed = await WebhookEvent.findOne({ where: { stripeEventId: event.id } });
if (processed) return; // Already handled

// Process event...

await WebhookEvent.create({ stripeEventId: event.id, type: event.type });
```
