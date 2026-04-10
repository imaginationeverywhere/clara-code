# Implement Stripe Connect Standard

Implement production-grade Stripe Connect payment processing following DreamiHairCare's battle-tested patterns.

## Command Usage

```
/implement-stripe-standard [options]
```

### Options
- `--full` - Complete Stripe Connect implementation (default)
- `--backend-only` - Backend infrastructure only
- `--frontend-only` - Frontend components only (requires backend)
- `--webhooks-only` - Add webhook handlers to existing setup
- `--audit` - Audit existing implementation against standards

## Pre-Implementation Checklist

Before running this command, ensure:

1. **Stripe Account Setup**
   - [ ] Stripe account created at https://stripe.com
   - [ ] Platform account enabled for Connect
   - [ ] Test mode API keys available
   - [ ] Webhook endpoint URL planned

2. **Environment Variables Ready**
   ```bash
   # Backend (.env)
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_CONNECT_CLIENT_ID=ca_...

   # Frontend (.env.local)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

3. **Database Prerequisites**
   - PostgreSQL database configured
   - Sequelize ORM installed
   - User model exists with `stripeCustomerId` field capability

## Implementation Phases

### Phase 1: Database Infrastructure

Create the StripeAccount model for Connected Accounts:

```typescript
// backend/src/models/StripeAccount.ts
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum StripeAccountStatus {
  PENDING = 'PENDING',
  ONBOARDING = 'ONBOARDING',
  ACTIVE = 'ACTIVE',
  RESTRICTED = 'RESTRICTED',
  DISABLED = 'DISABLED'
}

export enum StripeAccountType {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
  CUSTOM = 'CUSTOM'
}

interface StripeAccountAttributes {
  id: string;
  userId: string;
  businessId?: string;
  stripeAccountId: string;
  accountType: StripeAccountType;
  status: StripeAccountStatus;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  defaultCurrency: string;
  country: string;
  capabilities: object;
  requirements: object;
  businessProfile: object;
  settings: object;
  metadata: object;
  onboardingCompletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class StripeAccount extends Model<StripeAccountAttributes> implements StripeAccountAttributes {
  public id!: string;
  public userId!: string;
  public businessId?: string;
  public stripeAccountId!: string;
  public accountType!: StripeAccountType;
  public status!: StripeAccountStatus;
  public chargesEnabled!: boolean;
  public payoutsEnabled!: boolean;
  public detailsSubmitted!: boolean;
  public defaultCurrency!: string;
  public country!: string;
  public capabilities!: object;
  public requirements!: object;
  public businessProfile!: object;
  public settings!: object;
  public metadata!: object;
  public onboardingCompletedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StripeAccount.init(
  {
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
    businessId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'businesses', key: 'id' },
    },
    stripeAccountId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    accountType: {
      type: DataTypes.ENUM(...Object.values(StripeAccountType)),
      allowNull: false,
      defaultValue: StripeAccountType.EXPRESS,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(StripeAccountStatus)),
      allowNull: false,
      defaultValue: StripeAccountStatus.PENDING,
    },
    chargesEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    payoutsEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    detailsSubmitted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    defaultCurrency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'usd',
    },
    country: {
      type: DataTypes.STRING(2),
      allowNull: false,
      defaultValue: 'US',
    },
    capabilities: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    requirements: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    businessProfile: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    onboardingCompletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'stripe_accounts',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['businessId'] },
      { fields: ['stripeAccountId'], unique: true },
      { fields: ['status'] },
    ],
  }
);

export default StripeAccount;
```

### Phase 2: Stripe Service Layer

```typescript
// backend/src/services/StripeService.ts
import Stripe from 'stripe';
import StripeAccount, { StripeAccountStatus, StripeAccountType } from '../models/StripeAccount';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// Platform fee configuration
const PLATFORM_FEE_PERCENTAGE = 0.07; // 7%

export class StripeService {
  /**
   * Create a new Connected Account
   */
  static async createConnectedAccount(
    userId: string,
    businessId: string,
    email: string,
    country: string = 'US'
  ): Promise<{ account: StripeAccount; onboardingUrl: string }> {
    // Create Stripe Express account
    const stripeAccount = await stripe.accounts.create({
      type: 'express',
      country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        userId,
        businessId,
        platform: 'quik-nation',
      },
    });

    // Save to database
    const account = await StripeAccount.create({
      userId,
      businessId,
      stripeAccountId: stripeAccount.id,
      accountType: StripeAccountType.EXPRESS,
      status: StripeAccountStatus.ONBOARDING,
      country,
      defaultCurrency: stripeAccount.default_currency || 'usd',
      capabilities: stripeAccount.capabilities || {},
      requirements: stripeAccount.requirements || {},
    });

    // Generate onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccount.id,
      refresh_url: `${process.env.FRONTEND_URL}/dashboard/payments/refresh`,
      return_url: `${process.env.FRONTEND_URL}/dashboard/payments/complete`,
      type: 'account_onboarding',
    });

    return { account, onboardingUrl: accountLink.url };
  }

  /**
   * Create Payment Intent with platform fee
   */
  static async createPaymentIntent(
    amount: number,
    currency: string,
    connectedAccountId: string,
    customerId?: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.PaymentIntent> {
    const platformFee = Math.round(amount * PLATFORM_FEE_PERCENTAGE);

    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount,
      currency,
      application_fee_amount: platformFee,
      transfer_data: {
        destination: connectedAccountId,
      },
      metadata: {
        ...metadata,
        platformFee: platformFee.toString(),
        platformFeePercentage: (PLATFORM_FEE_PERCENTAGE * 100).toString(),
      },
    };

    if (customerId) {
      paymentIntentParams.customer = customerId;
    }

    return stripe.paymentIntents.create(paymentIntentParams);
  }

  /**
   * Create or get Stripe Customer
   */
  static async getOrCreateCustomer(
    email: string,
    name: string,
    userId?: string
  ): Promise<string> {
    // Search for existing customer
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      return customers.data[0].id;
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: userId ? { userId } : undefined,
    });

    return customer.id;
  }

  /**
   * Refresh onboarding link
   */
  static async refreshOnboardingLink(stripeAccountId: string): Promise<string> {
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.FRONTEND_URL}/dashboard/payments/refresh`,
      return_url: `${process.env.FRONTEND_URL}/dashboard/payments/complete`,
      type: 'account_onboarding',
    });

    return accountLink.url;
  }

  /**
   * Create dashboard login link for Connected Account
   */
  static async createDashboardLink(stripeAccountId: string): Promise<string> {
    const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);
    return loginLink.url;
  }

  /**
   * Sync account status from Stripe
   */
  static async syncAccountStatus(stripeAccountId: string): Promise<StripeAccount> {
    const stripeAccount = await stripe.accounts.retrieve(stripeAccountId);

    const account = await StripeAccount.findOne({
      where: { stripeAccountId },
    });

    if (!account) {
      throw new Error('Stripe account not found in database');
    }

    // Determine status
    let status = StripeAccountStatus.PENDING;
    if (stripeAccount.charges_enabled && stripeAccount.payouts_enabled) {
      status = StripeAccountStatus.ACTIVE;
    } else if (stripeAccount.details_submitted) {
      status = StripeAccountStatus.RESTRICTED;
    } else {
      status = StripeAccountStatus.ONBOARDING;
    }

    // Update database
    await account.update({
      status,
      chargesEnabled: stripeAccount.charges_enabled || false,
      payoutsEnabled: stripeAccount.payouts_enabled || false,
      detailsSubmitted: stripeAccount.details_submitted || false,
      capabilities: stripeAccount.capabilities || {},
      requirements: stripeAccount.requirements || {},
      businessProfile: stripeAccount.business_profile || {},
      settings: stripeAccount.settings || {},
      onboardingCompletedAt: status === StripeAccountStatus.ACTIVE && !account.onboardingCompletedAt
        ? new Date()
        : account.onboardingCompletedAt,
    });

    return account;
  }
}

export default StripeService;
```

### Phase 3: GraphQL Schema & Resolvers

```graphql
# backend/src/graphql/schema/stripe.graphql
enum StripeAccountStatus {
  PENDING
  ONBOARDING
  ACTIVE
  RESTRICTED
  DISABLED
}

enum StripeAccountType {
  STANDARD
  EXPRESS
  CUSTOM
}

type StripeAccount {
  id: ID!
  userId: ID!
  businessId: ID
  stripeAccountId: String!
  accountType: StripeAccountType!
  status: StripeAccountStatus!
  chargesEnabled: Boolean!
  payoutsEnabled: Boolean!
  detailsSubmitted: Boolean!
  defaultCurrency: String!
  country: String!
  onboardingCompletedAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
}

type OnboardingResult {
  account: StripeAccount!
  onboardingUrl: String!
}

type PaymentIntentResult {
  clientSecret: String!
  paymentIntentId: String!
  amount: Int!
  platformFee: Int!
}

input CreateConnectedAccountInput {
  businessId: ID!
  email: String!
  country: String
}

input CreatePaymentIntentInput {
  amount: Int!
  currency: String!
  orderId: ID
  metadata: JSON
}

extend type Query {
  myStripeAccount: StripeAccount
  stripeAccountStatus(businessId: ID!): StripeAccount
}

extend type Mutation {
  createConnectedAccount(input: CreateConnectedAccountInput!): OnboardingResult!
  refreshOnboardingLink: String!
  createStripeDashboardLink: String!
  createPaymentIntent(input: CreatePaymentIntentInput!): PaymentIntentResult!
  syncStripeAccountStatus: StripeAccount!
}
```

### Phase 4: Webhook Handler

```typescript
// backend/src/webhooks/stripeWebhook.ts
import { Request, Response } from 'express';
import Stripe from 'stripe';
import StripeService from '../services/StripeService';
import StripeAccount, { StripeAccountStatus } from '../models/StripeAccount';
import Order from '../models/Order';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function handleStripeWebhook(req: Request, res: Response) {
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
      // Connected Account Events
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        await StripeService.syncAccountStatus(account.id);
        console.log(`Account ${account.id} updated`);
        break;
      }

      case 'account.application.deauthorized': {
        const account = event.data.object as Stripe.Account;
        await StripeAccount.update(
          { status: StripeAccountStatus.DISABLED },
          { where: { stripeAccountId: account.id } }
        );
        console.log(`Account ${account.id} deauthorized`);
        break;
      }

      // Payment Events
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
          await Order.update(
            {
              paymentStatus: 'PAID',
              stripePaymentIntentId: paymentIntent.id,
              paidAt: new Date(),
            },
            { where: { id: orderId } }
          );
        }
        console.log(`Payment ${paymentIntent.id} succeeded`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
          await Order.update(
            {
              paymentStatus: 'FAILED',
              metadata: sequelize.fn(
                'jsonb_set',
                sequelize.col('metadata'),
                '{paymentError}',
                JSON.stringify(paymentIntent.last_payment_error?.message || 'Unknown error')
              ),
            },
            { where: { id: orderId } }
          );
        }
        console.log(`Payment ${paymentIntent.id} failed`);
        break;
      }

      // Payout Events
      case 'payout.paid': {
        const payout = event.data.object as Stripe.Payout;
        console.log(`Payout ${payout.id} completed: ${payout.amount}`);
        // Implement payout tracking if needed
        break;
      }

      case 'payout.failed': {
        const payout = event.data.object as Stripe.Payout;
        console.error(`Payout ${payout.id} failed: ${payout.failure_message}`);
        // Implement failure notification
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

### Phase 5: Frontend Integration

```typescript
// frontend/src/hooks/useStripeConnect.ts
'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { loadStripe } from '@stripe/stripe-js';
import { gql } from '@apollo/client';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const MY_STRIPE_ACCOUNT = gql`
  query MyStripeAccount {
    myStripeAccount {
      id
      status
      chargesEnabled
      payoutsEnabled
      detailsSubmitted
      onboardingCompletedAt
    }
  }
`;

const CREATE_CONNECTED_ACCOUNT = gql`
  mutation CreateConnectedAccount($input: CreateConnectedAccountInput!) {
    createConnectedAccount(input: $input) {
      account {
        id
        status
      }
      onboardingUrl
    }
  }
`;

const REFRESH_ONBOARDING = gql`
  mutation RefreshOnboardingLink {
    refreshOnboardingLink
  }
`;

const CREATE_DASHBOARD_LINK = gql`
  mutation CreateStripeDashboardLink {
    createStripeDashboardLink
  }
`;

export function useStripeConnect() {
  const [isLoading, setIsLoading] = useState(false);

  const { data, loading: accountLoading, refetch } = useQuery(MY_STRIPE_ACCOUNT);
  const [createAccountMutation] = useMutation(CREATE_CONNECTED_ACCOUNT);
  const [refreshOnboardingMutation] = useMutation(REFRESH_ONBOARDING);
  const [createDashboardMutation] = useMutation(CREATE_DASHBOARD_LINK);

  const account = data?.myStripeAccount;

  const startOnboarding = useCallback(async (businessId: string, email: string) => {
    setIsLoading(true);
    try {
      const { data } = await createAccountMutation({
        variables: {
          input: { businessId, email },
        },
      });

      if (data?.createConnectedAccount?.onboardingUrl) {
        window.location.href = data.createConnectedAccount.onboardingUrl;
      }
    } finally {
      setIsLoading(false);
    }
  }, [createAccountMutation]);

  const continueOnboarding = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await refreshOnboardingMutation();
      if (data?.refreshOnboardingLink) {
        window.location.href = data.refreshOnboardingLink;
      }
    } finally {
      setIsLoading(false);
    }
  }, [refreshOnboardingMutation]);

  const openDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await createDashboardMutation();
      if (data?.createStripeDashboardLink) {
        window.open(data.createStripeDashboardLink, '_blank');
      }
    } finally {
      setIsLoading(false);
    }
  }, [createDashboardMutation]);

  return {
    account,
    isLoading: isLoading || accountLoading,
    isOnboarded: account?.status === 'ACTIVE',
    needsOnboarding: !account || account.status === 'PENDING' || account.status === 'ONBOARDING',
    startOnboarding,
    continueOnboarding,
    openDashboard,
    refetch,
  };
}
```

## Express Route Setup

```typescript
// backend/src/routes/webhooks.ts
import express from 'express';
import { handleStripeWebhook } from '../webhooks/stripeWebhook';

const router = express.Router();

// CRITICAL: Raw body required for Stripe signature verification
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

export default router;
```

## Database Migration

```typescript
// backend/src/migrations/YYYYMMDDHHMMSS-create-stripe-accounts.ts
import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('stripe_accounts', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
      field: 'user_id',
    },
    businessId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'businesses', key: 'id' },
      onDelete: 'SET NULL',
      field: 'business_id',
    },
    stripeAccountId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'stripe_account_id',
    },
    accountType: {
      type: DataTypes.ENUM('STANDARD', 'EXPRESS', 'CUSTOM'),
      allowNull: false,
      defaultValue: 'EXPRESS',
      field: 'account_type',
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'ONBOARDING', 'ACTIVE', 'RESTRICTED', 'DISABLED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    chargesEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'charges_enabled',
    },
    payoutsEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'payouts_enabled',
    },
    detailsSubmitted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'details_submitted',
    },
    defaultCurrency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'usd',
      field: 'default_currency',
    },
    country: {
      type: DataTypes.STRING(2),
      allowNull: false,
      defaultValue: 'US',
    },
    capabilities: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    requirements: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    businessProfile: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
      field: 'business_profile',
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    onboardingCompletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'onboarding_completed_at',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  });

  await queryInterface.addIndex('stripe_accounts', ['user_id']);
  await queryInterface.addIndex('stripe_accounts', ['business_id']);
  await queryInterface.addIndex('stripe_accounts', ['stripe_account_id'], { unique: true });
  await queryInterface.addIndex('stripe_accounts', ['status']);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('stripe_accounts');
}
```

## Verification Steps

After implementation, verify:

1. **Database**: `SELECT * FROM stripe_accounts;` returns schema correctly
2. **Onboarding**: Test account creation redirects to Stripe
3. **Webhooks**: Use Stripe CLI: `stripe listen --forward-to localhost:4000/webhooks/stripe`
4. **Payments**: Create test payment with platform fee
5. **Dashboard**: Connected account can access Stripe dashboard

## Related Skills

- **stripe-connect-standard** - Full Stripe Connect documentation
- **checkout-flow-standard** - Integration with checkout process
- **order-management-standard** - Payment status tracking

## Security Checklist

- [ ] Webhook signature verification enabled
- [ ] API keys stored in environment variables
- [ ] Raw body parsing for webhook route
- [ ] Platform fee calculation server-side only
- [ ] Connected account validation before charges
