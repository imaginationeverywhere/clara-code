# Stripe Proration Examples

## Understanding Proration

Proration calculates partial charges when a customer changes plans mid-billing cycle.

## Proration Behaviors

### `create_prorations` (Default)

Creates proration invoice items but doesn't immediately charge.

**Example: Upgrade from Basic ($9/mo) to Pro ($29/mo) on day 15 of 30-day cycle**

```
Days remaining: 15 (50% of cycle)
Credit for unused Basic: -$4.50 (50% of $9)
Charge for Pro: +$14.50 (50% of $29)
Net charge: $10.00 (added to next invoice)
```

```typescript
await stripe.subscriptions.update(subscriptionId, {
  items: [{ id: itemId, price: 'price_pro_monthly' }],
  proration_behavior: 'create_prorations',
});
```

### `always_invoice`

Creates prorations AND immediately generates/collects an invoice.

**Use when**: Customer needs immediate access to upgraded features.

```typescript
await stripe.subscriptions.update(subscriptionId, {
  items: [{ id: itemId, price: 'price_pro_monthly' }],
  proration_behavior: 'always_invoice',
});
```

### `none`

No proration - change takes effect at next billing cycle.

**Use when**: Downgrades or when you want to delay the change.

```typescript
await stripe.subscriptions.update(subscriptionId, {
  items: [{ id: itemId, price: 'price_basic_monthly' }],
  proration_behavior: 'none',
});
```

## Common Scenarios

### Upgrade Mid-Cycle

```typescript
// Customer on Basic ($9/mo), upgrading to Pro ($29/mo)
// Day 10 of 30-day cycle (20 days remaining = 66.7%)

const subscription = await stripe.subscriptions.update(subId, {
  items: [{ id: itemId, price: 'price_pro_monthly' }],
  proration_behavior: 'create_prorations',
});

// Proration items created:
// - Credit: -$6.00 (66.7% of $9)
// - Charge: +$19.33 (66.7% of $29)
// Net: $13.33 added to next invoice
```

### Downgrade Mid-Cycle

```typescript
// Customer on Pro ($29/mo), downgrading to Basic ($9/mo)
// Day 10 of 30-day cycle (20 days remaining)

const subscription = await stripe.subscriptions.update(subId, {
  items: [{ id: itemId, price: 'price_basic_monthly' }],
  proration_behavior: 'none', // Delay until next cycle
});

// No immediate change - Pro features until cycle ends
// Next invoice will be $9 for Basic
```

### Monthly to Yearly

```typescript
// Customer on Pro Monthly ($29/mo), switching to Pro Yearly ($290/yr)
// Day 15 of 30-day cycle

const subscription = await stripe.subscriptions.update(subId, {
  items: [{ id: itemId, price: 'price_pro_yearly' }],
  proration_behavior: 'always_invoice',
  billing_cycle_anchor: 'now', // Reset billing date
});

// Immediate invoice:
// - Credit for unused monthly: ~$14.50
// - Charge for yearly: $290.00
// - Net: ~$275.50
```

### Add Seats/Quantity

```typescript
// Customer has 5 seats at $10/seat/mo, adding 3 more
// Day 20 of 30-day cycle (10 days remaining = 33.3%)

const subscription = await stripe.subscriptions.update(subId, {
  items: [{ id: itemId, quantity: 8 }],
  proration_behavior: 'create_prorations',
});

// Proration:
// - Charge for 3 new seats for remaining 10 days
// - 3 seats × $10 × 33.3% = $10.00
```

## Preview Proration

Always preview before applying:

```typescript
const preview = await stripe.invoices.retrieveUpcoming({
  customer: customerId,
  subscription: subscriptionId,
  subscription_items: [{ id: itemId, price: 'price_pro_monthly' }],
  subscription_proration_behavior: 'create_prorations',
});

console.log('Proration amount:', preview.amount_due / 100);
console.log('Line items:', preview.lines.data);
```

## Billing Cycle Anchor

Control when billing cycles reset:

```typescript
// Keep same billing date (default)
billing_cycle_anchor: 'unchanged'

// Reset to now
billing_cycle_anchor: 'now'

// Set specific date (Unix timestamp)
billing_cycle_anchor: 1704067200 // Jan 1, 2024
```

## Best Practices

1. **Always preview** proration before applying
2. **Use `none`** for downgrades to avoid refund complexity
3. **Use `always_invoice`** for upgrades when immediate payment is expected
4. **Show proration preview** to customers before confirming changes
5. **Handle negative prorations** (credits) gracefully
6. **Consider billing anchor** when switching intervals (monthly ↔ yearly)

## Displaying to Users

```typescript
// Get preview for UI
const preview = await stripe.invoices.retrieveUpcoming({
  customer: customerId,
  subscription: subscriptionId,
  subscription_items: [{ id: itemId, price: newPriceId }],
});

// Format for display
const prorationDetails = {
  currentPlanCredit: formatCurrency(calculateCredit(preview)),
  newPlanCharge: formatCurrency(calculateCharge(preview)),
  netAmount: formatCurrency(preview.amount_due),
  effectiveDate: new Date(),
  nextBillingDate: new Date(preview.next_payment_attempt * 1000),
};
```
