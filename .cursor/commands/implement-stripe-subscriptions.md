# Implement Stripe Subscriptions

Implement production-grade Stripe Subscriptions and Billing for SaaS recurring revenue following enterprise patterns.

## Command Usage

```
/implement-stripe-subscriptions [options]
```

### Options
- `--full` - Complete subscription system implementation (default)
- `--backend-only` - Backend infrastructure only (models, services, webhooks)
- `--frontend-only` - Frontend components only (requires backend)
- `--pricing-only` - Pricing configuration and tier setup only
- `--webhooks-only` - Add webhook handlers to existing setup
- `--usage-billing` - Include usage-based/metered billing support
- `--audit` - Audit existing implementation against standards

## Pre-Implementation Checklist

Before running this command, ensure:

1. **Stripe Account Setup**
   - [ ] Stripe account created at https://stripe.com
   - [ ] Test mode API keys available
   - [ ] Products and Prices created in Stripe Dashboard
   - [ ] Customer Portal configured (Settings > Billing > Customer portal)
   - [ ] Webhook endpoint URL planned

2. **Required Stripe Products (Create in Dashboard)**
   ```
   Products to create:
   - Basic Plan (prod_basic)
     - Monthly price: $9/month (price_basic_monthly)
     - Yearly price: $90/year (price_basic_yearly)
   - Pro Plan (prod_pro)
     - Monthly price: $29/month (price_pro_monthly)
     - Yearly price: $290/year (price_pro_yearly)
   - Enterprise Plan (prod_enterprise)
     - Custom pricing (contact sales)
   ```

3. **Environment Variables Ready**
   ```bash
   # Backend (.env)
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_SUBSCRIPTION_WEBHOOK_SECRET=whsec_...

   # Price IDs (from Stripe Dashboard)
   STRIPE_PRICE_BASIC_MONTHLY=price_...
   STRIPE_PRICE_BASIC_YEARLY=price_...
   STRIPE_PRICE_PRO_MONTHLY=price_...
   STRIPE_PRICE_PRO_YEARLY=price_...

   # Frontend (.env.local)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

4. **Database Prerequisites**
   - PostgreSQL database configured
   - Sequelize ORM installed
   - User model exists

## Implementation Phases

### Phase 1: Database Schema

Create the Subscription model with full lifecycle support:

```bash
# Generate migration
npx sequelize-cli migration:generate --name create-subscriptions
```

**Key Fields:**
- `stripeSubscriptionId` - Unique Stripe subscription ID
- `stripeCustomerId` - Stripe customer ID
- `stripePriceId` - Current price ID
- `status` - Subscription lifecycle state
- `planTier` - free | basic | pro | enterprise
- `billingInterval` - month | year
- `currentPeriodStart/End` - Billing period dates
- `cancelAtPeriodEnd` - Scheduled cancellation flag
- `trialStart/End` - Trial period dates
- `features` - Array of enabled features
- `usageLimit` / `currentUsage` - For metered billing

### Phase 2: Pricing Configuration

Create a centralized pricing configuration:

```typescript
// config/pricing.ts
export const PRICING_TIERS = [
  {
    id: 'free',
    name: 'Free',
    tier: 'free',
    features: ['3 projects', '1 user', '1GB storage'],
    limits: { projects: 3, users: 1, storage: 1 },
    prices: { monthly: 0, yearly: 0 },
  },
  {
    id: 'basic',
    name: 'Basic',
    tier: 'basic',
    features: ['10 projects', '5 users', '10GB storage', 'Email support'],
    limits: { projects: 10, users: 5, storage: 10 },
    prices: { monthly: 900, yearly: 9000 },
    stripePriceIds: {
      monthly: process.env.STRIPE_PRICE_BASIC_MONTHLY,
      yearly: process.env.STRIPE_PRICE_BASIC_YEARLY,
    },
    trial: { enabled: true, days: 14 },
  },
  // ... additional tiers
];
```

### Phase 3: Subscription Service

Implement the core subscription service with:

- `getOrCreateCustomer()` - Customer management
- `createSubscription()` - New subscription with optional trial
- `updateSubscription()` - Plan changes with proration
- `cancelSubscription()` - Immediate or at-period-end
- `pauseSubscription()` / `unpauseSubscription()` - Pause support
- `createPortalSession()` - Customer portal access
- `createCheckoutSession()` - Checkout for new subscriptions
- `syncFromStripe()` - Webhook synchronization

### Phase 4: Webhook Handler

Register and handle these events:

```typescript
// Critical subscription events
'customer.subscription.created'
'customer.subscription.updated'
'customer.subscription.deleted'
'customer.subscription.paused'
'customer.subscription.resumed'
'customer.subscription.trial_will_end'

// Invoice events
'invoice.payment_succeeded'
'invoice.payment_failed'
'invoice.upcoming'

// Checkout events
'checkout.session.completed'
```

**Webhook Route Setup:**
```typescript
// CRITICAL: Raw body required for signature verification
router.post(
  '/stripe-subscriptions',
  express.raw({ type: 'application/json' }),
  handleSubscriptionWebhook
);
```

### Phase 5: GraphQL API

```graphql
type Query {
  mySubscription: Subscription
  pricingTiers: [PricingTier!]!
  usageSummary: UsageSummary
}

type Mutation {
  createSubscription(input: CreateSubscriptionInput!): CreateSubscriptionResult!
  updateSubscription(input: UpdateSubscriptionInput!): Subscription!
  cancelSubscription(input: CancelSubscriptionInput): Subscription!
  resumeSubscription: Subscription!
  pauseSubscription(resumeAt: DateTime): Subscription!
  unpauseSubscription: Subscription!
  createCheckoutSession(...): CheckoutSessionResult!
  createPortalSession(returnUrl: String!): PortalSessionResult!
}
```

### Phase 6: Frontend Components

1. **PricingTable** - Display pricing tiers with monthly/yearly toggle
2. **SubscriptionManager** - Show current subscription, manage, cancel
3. **CheckoutButton** - Redirect to Stripe Checkout
4. **PortalButton** - Open Stripe Customer Portal

### Phase 7: Usage-Based Billing (Optional)

If `--usage-billing` is specified:

```typescript
// Report usage
await UsageService.reportUsage(subscriptionId, quantity, {
  action: 'increment', // or 'set'
  idempotencyKey: uniqueKey,
});

// Check limits
const { withinLimit, remaining } = await UsageService.checkUsageLimit(subscriptionId);
```

## Stripe Dashboard Configuration

### 1. Create Products and Prices

Navigate to Products in Stripe Dashboard:
- Create product for each tier
- Add monthly and yearly prices
- Note the price IDs for environment variables

### 2. Configure Customer Portal

Settings > Billing > Customer portal:
- Enable "Allow customers to switch plans"
- Enable "Allow customers to cancel subscriptions"
- Enable "Allow customers to update payment methods"
- Configure business information

### 3. Create Webhook Endpoint

Developers > Webhooks > Add endpoint:
- URL: `https://your-domain.com/webhooks/stripe-subscriptions`
- Events to subscribe:
  - `customer.subscription.*`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `invoice.upcoming`
  - `checkout.session.completed`

### 4. Enable Test Mode

For development:
- Use `sk_test_` and `pk_test_` keys
- Use Stripe CLI for local webhook testing:
  ```bash
  stripe listen --forward-to localhost:4000/webhooks/stripe-subscriptions
  ```

## Testing Checklist

### Subscription Lifecycle
- [ ] Create new subscription via Checkout
- [ ] Trial period works correctly
- [ ] Subscription activates after trial
- [ ] Upgrade plan (proration works)
- [ ] Downgrade plan (proration works)
- [ ] Cancel at period end
- [ ] Resume canceled subscription
- [ ] Immediate cancellation
- [ ] Pause and unpause subscription

### Webhooks
- [ ] Subscription created event handled
- [ ] Subscription updated event syncs status
- [ ] Payment succeeded updates subscription
- [ ] Payment failed marks as past_due
- [ ] Trial ending notification triggered

### Customer Portal
- [ ] Portal session creates successfully
- [ ] Customer can update payment method
- [ ] Customer can cancel subscription
- [ ] Customer can switch plans

### Frontend
- [ ] Pricing page displays correctly
- [ ] Monthly/yearly toggle works
- [ ] Checkout redirects properly
- [ ] Subscription manager shows correct status
- [ ] Cancel/resume flows work

## Test Card Numbers

```
Success: 4242424242424242
Decline: 4000000000000002
Requires Auth: 4000002500003155
Insufficient Funds: 4000000000009995
```

## Metrics to Track

- **MRR (Monthly Recurring Revenue)**: Sum of active monthly-equivalent subscriptions
- **Churn Rate**: Canceled subscriptions / total subscriptions
- **Trial Conversion Rate**: Converted trials / total trials
- **ARPU (Average Revenue Per User)**: MRR / active subscriptions
- **Upgrade Rate**: Upgrades / total subscriptions

## Security Checklist

- [ ] Webhook signature verification enabled
- [ ] API keys stored in environment variables (never committed)
- [ ] Raw body parsing for webhook route
- [ ] Checkout Sessions used for new subscriptions (PCI compliance)
- [ ] Customer Portal used for payment method updates
- [ ] Rate limiting on subscription endpoints
- [ ] Idempotency keys for usage records

## Related Commands

- **`/implement-stripe-standard`** - Stripe Connect for marketplace payments
- **`/implement-checkout-flow`** - One-time payment checkout
- **`/implement-admin-dashboard`** - Subscription analytics dashboard

## Related Skills

- **stripe-subscriptions-standard** - Core subscription patterns
- **stripe-connect-standard** - Marketplace with subscription splits
- **multi-tenancy-standard** - Tenant subscription management
- **analytics-tracking-standard** - Subscription event tracking

## Quick Reference

### Create Subscription
```typescript
const { subscription, clientSecret } = await SubscriptionService.createSubscription({
  userId,
  email,
  priceId: 'price_pro_monthly',
  trialDays: 14,
});
```

### Upgrade/Downgrade
```typescript
await SubscriptionService.updateSubscription(subscriptionId, 'price_enterprise_monthly', {
  prorationBehavior: 'create_prorations',
});
```

### Cancel at Period End
```typescript
await SubscriptionService.cancelSubscription(subscriptionId, {
  immediately: false,
  reason: 'Customer requested cancellation',
});
```

### Open Customer Portal
```typescript
const portalUrl = await SubscriptionService.createPortalSession(
  customerId,
  'https://app.example.com/settings'
);
```
