---
name: stripe-subscriptions-standard
description: Implement Stripe Subscriptions and Billing for SaaS recurring revenue including subscription lifecycle management, pricing tiers, customer portal, usage-based billing, proration, and subscription webhooks. Use when building subscription-based products, SaaS pricing, membership sites, or any recurring billing system.
---

# Stripe Subscriptions Standard

## Overview

Production-tested patterns for Stripe Subscriptions and Billing with:
- **Subscription lifecycle** - Create, update, cancel, pause, resume subscriptions
- **Pricing management** - Products, prices, tiers, and feature gating
- **Customer portal** - Self-service subscription management
- **Usage-based billing** - Metered billing and usage records
- **Proration** - Upgrade/downgrade handling with proper billing adjustments
- **Trial periods** - Free trials with automatic conversion
- **Webhook processing** - Handle all subscription events reliably

## Architecture Pattern

```
┌────────────────────────────────────────────────────────────────────┐
│                    SUBSCRIPTION BILLING SYSTEM                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Product      │  │ Pricing      │  │ Feature      │              │
│  │ Catalog      │  │ Engine       │  │ Gating       │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└────────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ SUBSCRIPTION  │   │ SUBSCRIPTION  │   │ SUBSCRIPTION  │
│ Basic Plan    │   │ Pro Plan      │   │ Enterprise    │
│ $9/mo         │   │ $29/mo        │   │ Custom        │
└───────────────┘   └───────────────┘   └───────────────┘
```

## Critical Concepts

### 1. Stripe Billing Objects Hierarchy

```
Product (what you sell)
  └── Price (how much and how often)
        └── Subscription (customer's active plan)
              └── Subscription Item (line items)
                    └── Usage Records (for metered billing)
```

### 2. Subscription Status Lifecycle

```typescript
type SubscriptionStatus =
  | 'incomplete'          // Initial payment failed
  | 'incomplete_expired'  // Never completed, expired
  | 'trialing'            // In trial period
  | 'active'              // Paid and current
  | 'past_due'            // Payment failed, retrying
  | 'canceled'            // Canceled by user/admin
  | 'unpaid'              // All retry attempts failed
  | 'paused';             // Temporarily paused

// Status flow
// incomplete → active (payment succeeds)
// incomplete → incomplete_expired (payment never succeeds)
// trialing → active (trial ends, payment succeeds)
// active → past_due (payment fails)
// past_due → active (retry succeeds)
// past_due → canceled/unpaid (all retries fail)
// active → canceled (user cancels)
// active → paused (subscription paused)
```

### 3. Billing Anchor and Proration

```typescript
interface BillingBehavior {
  // When upgrading/downgrading
  prorationBehavior:
    | 'create_prorations'      // Charge/credit difference immediately
    | 'none'                   // No proration, change at next billing
    | 'always_invoice';        // Create and finalize invoice immediately

  // Billing date handling
  billingCycleAnchor: 'now' | 'unchanged' | number;
}
```

## Implementation

### Database Schema

```typescript
// models/Subscription.ts
import { Model, DataTypes } from 'sequelize';

export enum SubscriptionStatus {
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  TRIALING = 'trialing',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
  PAUSED = 'paused',
}

export enum BillingInterval {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

class Subscription extends Model {
  declare id: string;
  declare userId: string;
  declare tenantId: string;
  declare stripeCustomerId: string;
  declare stripeSubscriptionId: string;
  declare stripePriceId: string;
  declare stripeProductId: string;
  declare status: SubscriptionStatus;
  declare planName: string;
  declare planTier: 'free' | 'basic' | 'pro' | 'enterprise';
  declare billingInterval: BillingInterval;
  declare amount: number;
  declare currency: string;
  declare currentPeriodStart: Date;
  declare currentPeriodEnd: Date;
  declare cancelAtPeriodEnd: boolean;
  declare canceledAt: Date | null;
  declare trialStart: Date | null;
  declare trialEnd: Date | null;
  declare metadata: object;
  declare features: string[];
  declare usageLimit: number | null;
  declare currentUsage: number;

  get isActive(): boolean {
    return ['active', 'trialing'].includes(this.status);
  }

  get isTrialing(): boolean {
    return this.status === 'trialing';
  }

  get willCancel(): boolean {
    return this.cancelAtPeriodEnd;
  }

  get daysUntilRenewal(): number {
    const now = new Date();
    const end = new Date(this.currentPeriodEnd);
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }
}

Subscription.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'tenants', key: 'id' },
  },
  stripeCustomerId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  stripeSubscriptionId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  stripePriceId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  stripeProductId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(...Object.values(SubscriptionStatus)),
    allowNull: false,
    defaultValue: SubscriptionStatus.INCOMPLETE,
  },
  planName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  planTier: {
    type: DataTypes.ENUM('free', 'basic', 'pro', 'enterprise'),
    allowNull: false,
    defaultValue: 'basic',
  },
  billingInterval: {
    type: DataTypes.ENUM(...Object.values(BillingInterval)),
    allowNull: false,
    defaultValue: BillingInterval.MONTH,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Amount in cents',
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'usd',
  },
  currentPeriodStart: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  currentPeriodEnd: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  cancelAtPeriodEnd: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  canceledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  trialStart: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  trialEnd: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
  features: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: [],
  },
  usageLimit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Monthly usage limit for metered plans',
  },
  currentUsage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  sequelize,
  tableName: 'subscriptions',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['tenantId'] },
    { fields: ['stripeSubscriptionId'], unique: true },
    { fields: ['stripeCustomerId'] },
    { fields: ['status'] },
    { fields: ['currentPeriodEnd'] },
  ],
});

export default Subscription;
```

### Pricing Configuration

```typescript
// config/pricing.ts

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  tier: 'free' | 'basic' | 'pro' | 'enterprise';
  features: string[];
  limits: {
    users?: number;
    storage?: number; // in GB
    apiCalls?: number;
    projects?: number;
    [key: string]: number | undefined;
  };
  prices: {
    monthly: number;  // in cents
    yearly: number;   // in cents (usually discounted)
  };
  stripePriceIds: {
    monthly: string;
    yearly: string;
  };
  stripeProductId: string;
  popular?: boolean;
  trial?: {
    enabled: boolean;
    days: number;
  };
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    tier: 'free',
    features: [
      'Up to 3 projects',
      '1 team member',
      '1GB storage',
      'Community support',
    ],
    limits: {
      users: 1,
      storage: 1,
      apiCalls: 1000,
      projects: 3,
    },
    prices: {
      monthly: 0,
      yearly: 0,
    },
    stripePriceIds: {
      monthly: '', // No Stripe price for free tier
      yearly: '',
    },
    stripeProductId: '',
  },
  {
    id: 'basic',
    name: 'Basic',
    description: 'For individuals and small teams',
    tier: 'basic',
    features: [
      'Up to 10 projects',
      '5 team members',
      '10GB storage',
      'Email support',
      'API access',
    ],
    limits: {
      users: 5,
      storage: 10,
      apiCalls: 10000,
      projects: 10,
    },
    prices: {
      monthly: 900,  // $9/month
      yearly: 9000,  // $90/year (save $18)
    },
    stripePriceIds: {
      monthly: 'price_basic_monthly',
      yearly: 'price_basic_yearly',
    },
    stripeProductId: 'prod_basic',
    trial: {
      enabled: true,
      days: 14,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing businesses',
    tier: 'pro',
    features: [
      'Unlimited projects',
      '25 team members',
      '100GB storage',
      'Priority support',
      'Advanced analytics',
      'Custom integrations',
    ],
    limits: {
      users: 25,
      storage: 100,
      apiCalls: 100000,
      projects: -1, // unlimited
    },
    prices: {
      monthly: 2900,  // $29/month
      yearly: 29000,  // $290/year (save $58)
    },
    stripePriceIds: {
      monthly: 'price_pro_monthly',
      yearly: 'price_pro_yearly',
    },
    stripeProductId: 'prod_pro',
    popular: true,
    trial: {
      enabled: true,
      days: 14,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    tier: 'enterprise',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Unlimited storage',
      'Dedicated support',
      'SSO/SAML',
      'Custom SLA',
      'On-premise option',
    ],
    limits: {
      users: -1,
      storage: -1,
      apiCalls: -1,
      projects: -1,
    },
    prices: {
      monthly: 0,  // Custom pricing
      yearly: 0,
    },
    stripePriceIds: {
      monthly: '',
      yearly: '',
    },
    stripeProductId: 'prod_enterprise',
  },
];

export function getTierByPriceId(priceId: string): PricingTier | undefined {
  return PRICING_TIERS.find(
    tier => tier.stripePriceIds.monthly === priceId || tier.stripePriceIds.yearly === priceId
  );
}

export function getBillingIntervalFromPriceId(priceId: string): 'month' | 'year' {
  const tier = PRICING_TIERS.find(t => t.stripePriceIds.yearly === priceId);
  return tier ? 'year' : 'month';
}
```

### Subscription Service

```typescript
// services/SubscriptionService.ts
import Stripe from 'stripe';
import Subscription, { SubscriptionStatus, BillingInterval } from '../models/Subscription';
import { PRICING_TIERS, getTierByPriceId, getBillingIntervalFromPriceId } from '../config/pricing';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export class SubscriptionService {
  /**
   * Create or get Stripe Customer
   */
  static async getOrCreateCustomer(
    userId: string,
    email: string,
    name?: string
  ): Promise<string> {
    // Check if user already has a customer ID
    const existingSub = await Subscription.findOne({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    if (existingSub?.stripeCustomerId) {
      return existingSub.stripeCustomerId;
    }

    // Search Stripe for existing customer
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length > 0) {
      return customers.data[0].id;
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: { userId },
    });

    return customer.id;
  }

  /**
   * Create a new subscription
   */
  static async createSubscription(input: {
    userId: string;
    email: string;
    priceId: string;
    paymentMethodId?: string;
    trialDays?: number;
    metadata?: Record<string, string>;
  }): Promise<{ subscription: Subscription; clientSecret?: string }> {
    const { userId, email, priceId, paymentMethodId, trialDays, metadata } = input;

    // Get or create customer
    const customerId = await this.getOrCreateCustomer(userId, email);

    // Attach payment method if provided
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });
    }

    // Determine trial period
    const tier = getTierByPriceId(priceId);
    const effectiveTrialDays = trialDays ?? (tier?.trial?.enabled ? tier.trial.days : 0);

    // Create Stripe subscription
    const stripeSubscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
      trial_period_days: effectiveTrialDays > 0 ? effectiveTrialDays : undefined,
      metadata: {
        userId,
        ...metadata,
      },
    });

    // Get price details
    const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
    const product = price.product as Stripe.Product;

    // Save to database
    const subscription = await Subscription.create({
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: priceId,
      stripeProductId: product.id,
      status: stripeSubscription.status as SubscriptionStatus,
      planName: product.name,
      planTier: tier?.tier || 'basic',
      billingInterval: getBillingIntervalFromPriceId(priceId) as BillingInterval,
      amount: price.unit_amount || 0,
      currency: price.currency,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      trialStart: stripeSubscription.trial_start
        ? new Date(stripeSubscription.trial_start * 1000)
        : null,
      trialEnd: stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000)
        : null,
      features: tier?.features || [],
      metadata: metadata || {},
    });

    // Get client secret for payment confirmation
    const invoice = stripeSubscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice?.payment_intent as Stripe.PaymentIntent;

    return {
      subscription,
      clientSecret: paymentIntent?.client_secret || undefined,
    };
  }

  /**
   * Update subscription (upgrade/downgrade)
   */
  static async updateSubscription(
    subscriptionId: string,
    newPriceId: string,
    options: {
      prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
      billingCycleAnchor?: 'now' | 'unchanged';
    } = {}
  ): Promise<Subscription> {
    const subscription = await Subscription.findByPk(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    // Update the subscription item
    const updatedStripeSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        items: [{
          id: stripeSubscription.items.data[0].id,
          price: newPriceId,
        }],
        proration_behavior: options.prorationBehavior || 'create_prorations',
        billing_cycle_anchor: options.billingCycleAnchor || 'unchanged',
      }
    );

    // Get new price details
    const price = await stripe.prices.retrieve(newPriceId, { expand: ['product'] });
    const product = price.product as Stripe.Product;
    const tier = getTierByPriceId(newPriceId);

    // Update database
    await subscription.update({
      stripePriceId: newPriceId,
      stripeProductId: product.id,
      planName: product.name,
      planTier: tier?.tier || subscription.planTier,
      billingInterval: getBillingIntervalFromPriceId(newPriceId) as BillingInterval,
      amount: price.unit_amount || 0,
      features: tier?.features || subscription.features,
    });

    return subscription;
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(
    subscriptionId: string,
    options: {
      immediately?: boolean;
      reason?: string;
      feedback?: string;
    } = {}
  ): Promise<Subscription> {
    const subscription = await Subscription.findByPk(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (options.immediately) {
      // Cancel immediately
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId, {
        cancellation_details: {
          comment: options.reason,
          feedback: options.feedback as any,
        },
      });

      await subscription.update({
        status: SubscriptionStatus.CANCELED,
        canceledAt: new Date(),
      });
    } else {
      // Cancel at period end
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
        cancellation_details: {
          comment: options.reason,
          feedback: options.feedback as any,
        },
      });

      await subscription.update({
        cancelAtPeriodEnd: true,
      });
    }

    return subscription;
  }

  /**
   * Resume canceled subscription (if not yet expired)
   */
  static async resumeSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await Subscription.findByPk(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (!subscription.cancelAtPeriodEnd) {
      throw new Error('Subscription is not scheduled for cancellation');
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    await subscription.update({
      cancelAtPeriodEnd: false,
    });

    return subscription;
  }

  /**
   * Pause subscription
   */
  static async pauseSubscription(
    subscriptionId: string,
    options: {
      resumeAt?: Date;
      behavior?: 'mark_uncollectible' | 'keep_as_draft' | 'void';
    } = {}
  ): Promise<Subscription> {
    const subscription = await Subscription.findByPk(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      pause_collection: {
        behavior: options.behavior || 'mark_uncollectible',
        resumes_at: options.resumeAt ? Math.floor(options.resumeAt.getTime() / 1000) : undefined,
      },
    });

    await subscription.update({
      status: SubscriptionStatus.PAUSED,
    });

    return subscription;
  }

  /**
   * Resume paused subscription
   */
  static async unpauseSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await Subscription.findByPk(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      pause_collection: '',  // Empty string removes pause
    });

    await subscription.update({
      status: SubscriptionStatus.ACTIVE,
    });

    return subscription;
  }

  /**
   * Create Customer Portal session
   */
  static async createPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<string> {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session.url;
  }

  /**
   * Create Checkout Session for new subscriptions
   */
  static async createCheckoutSession(input: {
    userId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    trialDays?: number;
    allowPromotionCodes?: boolean;
  }): Promise<string> {
    const tier = getTierByPriceId(input.priceId);
    const effectiveTrialDays = input.trialDays ?? (tier?.trial?.enabled ? tier.trial.days : 0);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: input.priceId, quantity: 1 }],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      subscription_data: {
        trial_period_days: effectiveTrialDays > 0 ? effectiveTrialDays : undefined,
        metadata: { userId: input.userId },
      },
      allow_promotion_codes: input.allowPromotionCodes ?? true,
      metadata: { userId: input.userId },
    });

    return session.url!;
  }

  /**
   * Sync subscription from Stripe
   */
  static async syncFromStripe(stripeSubscriptionId: string): Promise<Subscription> {
    const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId, {
      expand: ['items.data.price.product'],
    });

    let subscription = await Subscription.findOne({
      where: { stripeSubscriptionId },
    });

    const item = stripeSubscription.items.data[0];
    const price = item.price;
    const product = price.product as Stripe.Product;
    const tier = getTierByPriceId(price.id);

    const updates = {
      status: stripeSubscription.status as SubscriptionStatus,
      stripePriceId: price.id,
      stripeProductId: product.id,
      planName: product.name,
      planTier: tier?.tier || 'basic',
      amount: price.unit_amount || 0,
      currency: price.currency,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      canceledAt: stripeSubscription.canceled_at
        ? new Date(stripeSubscription.canceled_at * 1000)
        : null,
      features: tier?.features || [],
    };

    if (subscription) {
      await subscription.update(updates);
    } else {
      // Create if doesn't exist
      subscription = await Subscription.create({
        userId: stripeSubscription.metadata.userId,
        stripeCustomerId: stripeSubscription.customer as string,
        stripeSubscriptionId,
        billingInterval: price.recurring?.interval as BillingInterval || BillingInterval.MONTH,
        ...updates,
      });
    }

    return subscription;
  }
}

export default SubscriptionService;
```

### Usage-Based Billing

```typescript
// services/UsageService.ts
import Stripe from 'stripe';
import Subscription from '../models/Subscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export class UsageService {
  /**
   * Report usage for metered billing
   */
  static async reportUsage(
    subscriptionId: string,
    quantity: number,
    options: {
      action?: 'increment' | 'set';
      timestamp?: Date;
      idempotencyKey?: string;
    } = {}
  ): Promise<void> {
    const subscription = await Subscription.findByPk(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Get the subscription item ID
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );
    const subscriptionItemId = stripeSubscription.items.data[0].id;

    // Report usage to Stripe
    await stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
      quantity,
      timestamp: options.timestamp
        ? Math.floor(options.timestamp.getTime() / 1000)
        : Math.floor(Date.now() / 1000),
      action: options.action || 'increment',
    }, {
      idempotencyKey: options.idempotencyKey,
    });

    // Update local tracking
    if (options.action === 'set') {
      await subscription.update({ currentUsage: quantity });
    } else {
      await subscription.increment('currentUsage', { by: quantity });
    }
  }

  /**
   * Get usage summary for current period
   */
  static async getUsageSummary(subscriptionId: string): Promise<{
    totalUsage: number;
    limit: number | null;
    percentUsed: number;
    periodStart: Date;
    periodEnd: Date;
  }> {
    const subscription = await Subscription.findByPk(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );
    const subscriptionItemId = stripeSubscription.items.data[0].id;

    // Get usage records from Stripe
    const usageSummary = await stripe.subscriptionItems.listUsageRecordSummaries(
      subscriptionItemId,
      { limit: 1 }
    );

    const totalUsage = usageSummary.data[0]?.total_usage || 0;

    return {
      totalUsage,
      limit: subscription.usageLimit,
      percentUsed: subscription.usageLimit
        ? Math.round((totalUsage / subscription.usageLimit) * 100)
        : 0,
      periodStart: subscription.currentPeriodStart,
      periodEnd: subscription.currentPeriodEnd,
    };
  }

  /**
   * Check if user has exceeded usage limit
   */
  static async checkUsageLimit(subscriptionId: string): Promise<{
    withinLimit: boolean;
    remaining: number | null;
    message?: string;
  }> {
    const { totalUsage, limit } = await this.getUsageSummary(subscriptionId);

    if (limit === null) {
      return { withinLimit: true, remaining: null };
    }

    const remaining = limit - totalUsage;
    const withinLimit = remaining > 0;

    return {
      withinLimit,
      remaining: withinLimit ? remaining : 0,
      message: withinLimit
        ? undefined
        : 'Usage limit exceeded. Please upgrade your plan.',
    };
  }
}

export default UsageService;
```

### Webhook Handler

```typescript
// webhooks/subscriptionWebhook.ts
import { Request, Response } from 'express';
import Stripe from 'stripe';
import Subscription, { SubscriptionStatus } from '../models/Subscription';
import SubscriptionService from '../services/SubscriptionService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const webhookSecret = process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET!;

export async function handleSubscriptionWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      // Subscription Lifecycle Events
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await SubscriptionService.syncFromStripe(subscription.id);
        console.log(`Subscription ${subscription.id} created`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await SubscriptionService.syncFromStripe(subscription.id);
        console.log(`Subscription ${subscription.id} updated: ${subscription.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await Subscription.update(
          {
            status: SubscriptionStatus.CANCELED,
            canceledAt: new Date(),
          },
          { where: { stripeSubscriptionId: subscription.id } }
        );
        console.log(`Subscription ${subscription.id} deleted`);
        break;
      }

      case 'customer.subscription.paused': {
        const subscription = event.data.object as Stripe.Subscription;
        await Subscription.update(
          { status: SubscriptionStatus.PAUSED },
          { where: { stripeSubscriptionId: subscription.id } }
        );
        console.log(`Subscription ${subscription.id} paused`);
        break;
      }

      case 'customer.subscription.resumed': {
        const subscription = event.data.object as Stripe.Subscription;
        await Subscription.update(
          { status: SubscriptionStatus.ACTIVE },
          { where: { stripeSubscriptionId: subscription.id } }
        );
        console.log(`Subscription ${subscription.id} resumed`);
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        // Send email notification about trial ending
        console.log(`Trial ending for subscription ${subscription.id}`);
        // TODO: Integrate with email service
        break;
      }

      // Invoice Events
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await SubscriptionService.syncFromStripe(invoice.subscription as string);
        }
        console.log(`Invoice ${invoice.id} paid`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await Subscription.update(
            { status: SubscriptionStatus.PAST_DUE },
            { where: { stripeSubscriptionId: invoice.subscription } }
          );
        }
        console.log(`Invoice ${invoice.id} payment failed`);
        // TODO: Send payment failure notification
        break;
      }

      case 'invoice.upcoming': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Upcoming invoice for subscription ${invoice.subscription}`);
        // TODO: Send upcoming billing notification
        break;
      }

      // Checkout Events
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription) {
          await SubscriptionService.syncFromStripe(session.subscription as string);
        }
        console.log(`Checkout session ${session.id} completed`);
        break;
      }

      // Customer Portal Events
      case 'billing_portal.session.created': {
        const session = event.data.object as Stripe.BillingPortal.Session;
        console.log(`Portal session created for customer ${session.customer}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}
```

### GraphQL Schema

```graphql
# schema/subscription.graphql

enum SubscriptionStatus {
  INCOMPLETE
  INCOMPLETE_EXPIRED
  TRIALING
  ACTIVE
  PAST_DUE
  CANCELED
  UNPAID
  PAUSED
}

enum BillingInterval {
  DAY
  WEEK
  MONTH
  YEAR
}

type Subscription {
  id: ID!
  userId: ID!
  status: SubscriptionStatus!
  planName: String!
  planTier: String!
  billingInterval: BillingInterval!
  amount: Int!
  currency: String!
  currentPeriodStart: DateTime!
  currentPeriodEnd: DateTime!
  cancelAtPeriodEnd: Boolean!
  canceledAt: DateTime
  trialStart: DateTime
  trialEnd: DateTime
  features: [String!]!
  isActive: Boolean!
  isTrialing: Boolean!
  willCancel: Boolean!
  daysUntilRenewal: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type PricingTier {
  id: ID!
  name: String!
  description: String!
  tier: String!
  features: [String!]!
  monthlyPrice: Int!
  yearlyPrice: Int!
  popular: Boolean
  trialDays: Int
}

type UsageSummary {
  totalUsage: Int!
  limit: Int
  percentUsed: Int!
  periodStart: DateTime!
  periodEnd: DateTime!
}

type CheckoutSessionResult {
  url: String!
}

type PortalSessionResult {
  url: String!
}

type CreateSubscriptionResult {
  subscription: Subscription!
  clientSecret: String
}

input CreateSubscriptionInput {
  priceId: String!
  paymentMethodId: String
}

input UpdateSubscriptionInput {
  priceId: String!
  prorationBehavior: String
}

input CancelSubscriptionInput {
  immediately: Boolean
  reason: String
  feedback: String
}

extend type Query {
  mySubscription: Subscription
  pricingTiers: [PricingTier!]!
  usageSummary: UsageSummary
}

extend type Mutation {
  createSubscription(input: CreateSubscriptionInput!): CreateSubscriptionResult!
  updateSubscription(input: UpdateSubscriptionInput!): Subscription!
  cancelSubscription(input: CancelSubscriptionInput): Subscription!
  resumeSubscription: Subscription!
  pauseSubscription(resumeAt: DateTime): Subscription!
  unpauseSubscription: Subscription!
  createCheckoutSession(priceId: String!, successUrl: String!, cancelUrl: String!): CheckoutSessionResult!
  createPortalSession(returnUrl: String!): PortalSessionResult!
}
```

### GraphQL Resolvers

```typescript
// resolvers/subscriptionResolvers.ts
import { GraphQLError } from 'graphql';
import Subscription from '../models/Subscription';
import SubscriptionService from '../services/SubscriptionService';
import UsageService from '../services/UsageService';
import { PRICING_TIERS } from '../config/pricing';

export const subscriptionResolvers = {
  Query: {
    mySubscription: async (_: any, __: any, context: any) => {
      // CRITICAL: Required auth pattern
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      return Subscription.findOne({
        where: {
          userId: context.auth.userId,
          status: ['active', 'trialing', 'past_due', 'paused'],
        },
        order: [['createdAt', 'DESC']],
      });
    },

    pricingTiers: () => {
      return PRICING_TIERS.map(tier => ({
        id: tier.id,
        name: tier.name,
        description: tier.description,
        tier: tier.tier,
        features: tier.features,
        monthlyPrice: tier.prices.monthly,
        yearlyPrice: tier.prices.yearly,
        popular: tier.popular || false,
        trialDays: tier.trial?.days || null,
      }));
    },

    usageSummary: async (_: any, __: any, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required');
      }

      const subscription = await Subscription.findOne({
        where: { userId: context.auth.userId, status: 'active' },
      });

      if (!subscription) {
        throw new GraphQLError('No active subscription');
      }

      return UsageService.getUsageSummary(subscription.id);
    },
  },

  Mutation: {
    createSubscription: async (_: any, { input }: any, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required');
      }

      const user = await context.loaders.user.load(context.auth.userId);

      return SubscriptionService.createSubscription({
        userId: context.auth.userId,
        email: user.email,
        priceId: input.priceId,
        paymentMethodId: input.paymentMethodId,
      });
    },

    updateSubscription: async (_: any, { input }: any, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required');
      }

      const subscription = await Subscription.findOne({
        where: { userId: context.auth.userId, status: 'active' },
      });

      if (!subscription) {
        throw new GraphQLError('No active subscription');
      }

      return SubscriptionService.updateSubscription(
        subscription.id,
        input.priceId,
        { prorationBehavior: input.prorationBehavior }
      );
    },

    cancelSubscription: async (_: any, { input }: any, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required');
      }

      const subscription = await Subscription.findOne({
        where: { userId: context.auth.userId, status: ['active', 'trialing'] },
      });

      if (!subscription) {
        throw new GraphQLError('No active subscription');
      }

      return SubscriptionService.cancelSubscription(subscription.id, input);
    },

    resumeSubscription: async (_: any, __: any, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required');
      }

      const subscription = await Subscription.findOne({
        where: { userId: context.auth.userId, cancelAtPeriodEnd: true },
      });

      if (!subscription) {
        throw new GraphQLError('No subscription to resume');
      }

      return SubscriptionService.resumeSubscription(subscription.id);
    },

    pauseSubscription: async (_: any, { resumeAt }: any, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required');
      }

      const subscription = await Subscription.findOne({
        where: { userId: context.auth.userId, status: 'active' },
      });

      if (!subscription) {
        throw new GraphQLError('No active subscription');
      }

      return SubscriptionService.pauseSubscription(subscription.id, { resumeAt });
    },

    unpauseSubscription: async (_: any, __: any, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required');
      }

      const subscription = await Subscription.findOne({
        where: { userId: context.auth.userId, status: 'paused' },
      });

      if (!subscription) {
        throw new GraphQLError('No paused subscription');
      }

      return SubscriptionService.unpauseSubscription(subscription.id);
    },

    createCheckoutSession: async (_: any, { priceId, successUrl, cancelUrl }: any, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required');
      }

      const url = await SubscriptionService.createCheckoutSession({
        userId: context.auth.userId,
        priceId,
        successUrl,
        cancelUrl,
      });

      return { url };
    },

    createPortalSession: async (_: any, { returnUrl }: any, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required');
      }

      const subscription = await Subscription.findOne({
        where: { userId: context.auth.userId },
        order: [['createdAt', 'DESC']],
      });

      if (!subscription) {
        throw new GraphQLError('No subscription found');
      }

      const url = await SubscriptionService.createPortalSession(
        subscription.stripeCustomerId,
        returnUrl
      );

      return { url };
    },
  },

  Subscription: {
    isActive: (sub: Subscription) => sub.isActive,
    isTrialing: (sub: Subscription) => sub.isTrialing,
    willCancel: (sub: Subscription) => sub.willCancel,
    daysUntilRenewal: (sub: Subscription) => sub.daysUntilRenewal,
  },
};
```

### Frontend Components

```typescript
// components/pricing/PricingTable.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check } from 'lucide-react';
import { gql } from '@apollo/client';

const GET_PRICING = gql`
  query GetPricing {
    pricingTiers {
      id
      name
      description
      tier
      features
      monthlyPrice
      yearlyPrice
      popular
      trialDays
    }
    mySubscription {
      id
      planTier
      status
    }
  }
`;

const CREATE_CHECKOUT = gql`
  mutation CreateCheckoutSession($priceId: String!, $successUrl: String!, $cancelUrl: String!) {
    createCheckoutSession(priceId: $priceId, successUrl: $successUrl, cancelUrl: $cancelUrl) {
      url
    }
  }
`;

export function PricingTable() {
  const [isYearly, setIsYearly] = useState(false);
  const { data, loading } = useQuery(GET_PRICING);
  const [createCheckout, { loading: checkoutLoading }] = useMutation(CREATE_CHECKOUT);

  const handleSubscribe = async (tier: any) => {
    const priceId = isYearly ? tier.stripePriceIds.yearly : tier.stripePriceIds.monthly;

    const { data } = await createCheckout({
      variables: {
        priceId,
        successUrl: `${window.location.origin}/dashboard?subscribed=true`,
        cancelUrl: `${window.location.origin}/pricing`,
      },
    });

    if (data?.createCheckoutSession?.url) {
      window.location.href = data.createCheckoutSession.url;
    }
  };

  if (loading) return <div>Loading pricing...</div>;

  const tiers = data?.pricingTiers || [];
  const currentTier = data?.mySubscription?.planTier;

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={!isYearly ? 'font-semibold' : 'text-muted-foreground'}>Monthly</span>
        <Switch checked={isYearly} onCheckedChange={setIsYearly} />
        <span className={isYearly ? 'font-semibold' : 'text-muted-foreground'}>
          Yearly <Badge variant="secondary">Save 20%</Badge>
        </span>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {tiers.filter((t: any) => t.tier !== 'enterprise').map((tier: any) => (
          <Card
            key={tier.id}
            className={tier.popular ? 'border-primary shadow-lg' : ''}
          >
            <CardHeader>
              {tier.popular && (
                <Badge className="w-fit mb-2">Most Popular</Badge>
              )}
              <CardTitle>{tier.name}</CardTitle>
              <CardDescription>{tier.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  ${(isYearly ? tier.yearlyPrice : tier.monthlyPrice) / 100}
                </span>
                <span className="text-muted-foreground">
                  /{isYearly ? 'year' : 'month'}
                </span>
              </div>
              <ul className="space-y-2">
                {tier.features.map((feature: string) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              {tier.trialDays && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {tier.trialDays}-day free trial included
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={tier.popular ? 'default' : 'outline'}
                disabled={currentTier === tier.tier || checkoutLoading}
                onClick={() => handleSubscribe(tier)}
              >
                {currentTier === tier.tier ? 'Current Plan' : 'Get Started'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

```typescript
// components/subscription/SubscriptionManager.tsx
'use client';

import { useQuery, useMutation } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { gql } from '@apollo/client';
import { format } from 'date-fns';

const MY_SUBSCRIPTION = gql`
  query MySubscription {
    mySubscription {
      id
      planName
      planTier
      status
      amount
      currency
      billingInterval
      currentPeriodEnd
      cancelAtPeriodEnd
      isTrialing
      trialEnd
      features
      daysUntilRenewal
    }
  }
`;

const CANCEL_SUBSCRIPTION = gql`
  mutation CancelSubscription($input: CancelSubscriptionInput) {
    cancelSubscription(input: $input) {
      id
      cancelAtPeriodEnd
    }
  }
`;

const RESUME_SUBSCRIPTION = gql`
  mutation ResumeSubscription {
    resumeSubscription {
      id
      cancelAtPeriodEnd
    }
  }
`;

const CREATE_PORTAL = gql`
  mutation CreatePortalSession($returnUrl: String!) {
    createPortalSession(returnUrl: $returnUrl) {
      url
    }
  }
`;

export function SubscriptionManager() {
  const { data, loading, refetch } = useQuery(MY_SUBSCRIPTION);
  const [cancelSubscription] = useMutation(CANCEL_SUBSCRIPTION);
  const [resumeSubscription] = useMutation(RESUME_SUBSCRIPTION);
  const [createPortal] = useMutation(CREATE_PORTAL);

  const subscription = data?.mySubscription;

  const handleCancel = async () => {
    await cancelSubscription({
      variables: { input: { immediately: false } },
    });
    refetch();
  };

  const handleResume = async () => {
    await resumeSubscription();
    refetch();
  };

  const handleManage = async () => {
    const { data } = await createPortal({
      variables: { returnUrl: window.location.href },
    });
    if (data?.createPortalSession?.url) {
      window.location.href = data.createPortalSession.url;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!subscription) return <div>No active subscription</div>;

  const statusColors: Record<string, string> = {
    active: 'bg-green-500',
    trialing: 'bg-blue-500',
    past_due: 'bg-yellow-500',
    canceled: 'bg-red-500',
    paused: 'bg-gray-500',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Subscription</CardTitle>
        <Badge className={statusColors[subscription.status]}>
          {subscription.status.replace('_', ' ')}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{subscription.planName}</h3>
          <p className="text-muted-foreground">
            ${subscription.amount / 100}/{subscription.billingInterval}
          </p>
        </div>

        {subscription.isTrialing && subscription.trialEnd && (
          <p className="text-sm text-blue-600">
            Trial ends {format(new Date(subscription.trialEnd), 'PPP')}
          </p>
        )}

        {subscription.cancelAtPeriodEnd ? (
          <div className="bg-yellow-50 p-3 rounded-md">
            <p className="text-sm text-yellow-800">
              Your subscription will end on {format(new Date(subscription.currentPeriodEnd), 'PPP')}
            </p>
            <Button variant="link" className="p-0 h-auto" onClick={handleResume}>
              Resume subscription
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Renews {format(new Date(subscription.currentPeriodEnd), 'PPP')} ({subscription.daysUntilRenewal} days)
          </p>
        )}

        <div className="flex gap-2">
          <Button onClick={handleManage}>Manage Billing</Button>

          {!subscription.cancelAtPeriodEnd && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your subscription will remain active until {format(new Date(subscription.currentPeriodEnd), 'PPP')}.
                    You can resume anytime before then.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep subscription</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel}>
                    Cancel at period end
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

## Environment Variables

```env
# Stripe Subscriptions
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SUBSCRIPTION_WEBHOOK_SECRET=whsec_...

# Customer Portal Configuration (set in Stripe Dashboard)
# https://dashboard.stripe.com/settings/billing/portal

# Product & Price IDs (create in Stripe Dashboard)
STRIPE_PRODUCT_BASIC=prod_...
STRIPE_PRICE_BASIC_MONTHLY=price_...
STRIPE_PRICE_BASIC_YEARLY=price_...
STRIPE_PRODUCT_PRO=prod_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
```

## Database Migration

```typescript
// migrations/YYYYMMDDHHMMSS-create-subscriptions.ts
import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('subscriptions', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    tenant_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'tenants', key: 'id' },
      onDelete: 'SET NULL',
    },
    stripe_customer_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stripe_subscription_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    stripe_price_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stripe_product_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        'incomplete', 'incomplete_expired', 'trialing', 'active',
        'past_due', 'canceled', 'unpaid', 'paused'
      ),
      allowNull: false,
      defaultValue: 'incomplete',
    },
    plan_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    plan_tier: {
      type: DataTypes.ENUM('free', 'basic', 'pro', 'enterprise'),
      allowNull: false,
      defaultValue: 'basic',
    },
    billing_interval: {
      type: DataTypes.ENUM('day', 'week', 'month', 'year'),
      allowNull: false,
      defaultValue: 'month',
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'usd',
    },
    current_period_start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    current_period_end: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    cancel_at_period_end: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    canceled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    trial_start: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    trial_end: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    features: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    usage_limit: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    current_usage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  await queryInterface.addIndex('subscriptions', ['user_id']);
  await queryInterface.addIndex('subscriptions', ['tenant_id']);
  await queryInterface.addIndex('subscriptions', ['stripe_subscription_id'], { unique: true });
  await queryInterface.addIndex('subscriptions', ['stripe_customer_id']);
  await queryInterface.addIndex('subscriptions', ['status']);
  await queryInterface.addIndex('subscriptions', ['current_period_end']);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('subscriptions');
}
```

## Quality Checklist

Before deployment:

- [ ] Stripe products and prices created in Dashboard
- [ ] Customer Portal configured in Stripe Dashboard
- [ ] Webhook endpoint registered with correct events
- [ ] Trial periods configured correctly
- [ ] Proration behavior tested for upgrades/downgrades
- [ ] Cancellation flow tested (immediate and at period end)
- [ ] Invoice events handled correctly
- [ ] Usage-based billing tested (if applicable)
- [ ] Frontend pricing page displays correctly
- [ ] Subscription management UI works
- [ ] Email notifications configured for key events

## Webhook Events to Register

```
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
customer.subscription.paused
customer.subscription.resumed
customer.subscription.trial_will_end
invoice.payment_succeeded
invoice.payment_failed
invoice.upcoming
checkout.session.completed
billing_portal.session.created
```

## Related Skills

- **stripe-connect-standard** - For marketplace payments with connected accounts
- **checkout-flow-standard** - For one-time payment checkout flows
- **multi-tenancy-standard** - For tenant-specific subscription management

## Resources

### references/
- `subscription-events.md` - All subscription webhook event types
- `proration-examples.md` - Proration calculation examples

### assets/
- `templates/SubscriptionService.ts` - Service class template
- `templates/pricing-config.ts` - Pricing configuration template
