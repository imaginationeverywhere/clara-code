---
name: stripe-connect-standard
description: Implement Stripe Connect for multi-tenant marketplace payments including Connect account setup, OAuth flow, payment splitting, fee calculation, webhook processing, and payout management. Use when building marketplace payments, multi-vendor platforms, or any application requiring payment splitting between platform and connected accounts.
---

# Stripe Connect Standard

## Overview

Production-tested patterns for Stripe Connect marketplace payments with:
- **Connect account management** - Create, onboard, and manage connected accounts
- **OAuth flow** - Standard Connect OAuth for existing Stripe accounts
- **Payment splitting** - Platform fees and automatic transfers
- **Webhook processing** - Handle payment events and account updates
- **Payout management** - Balance retrieval and payout initiation

## Architecture Pattern

```
┌────────────────────────────────────────────────────────────────────┐
│                        PLATFORM (Quik Dollars)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Platform Fee │  │ Master Stripe│  │ Webhook      │              │
│  │ Collection   │  │ Account      │  │ Processing   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└────────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ SITE OWNER A  │   │ SITE OWNER B  │   │ SITE OWNER C  │
│ Connect Acct  │   │ Connect Acct  │   │ Connect Acct  │
│ Express/Std   │   │ Express/Std   │   │ Express/Std   │
└───────────────┘   └───────────────┘   └───────────────┘
```

## Critical Patterns

### 1. SITE OWNER Model (Single Connect Account per Site)

```typescript
// CRITICAL: Each site has ONE Connect account owned by the business
// NOT per-user Connect accounts

// Check if site already has Connect account
const existingAccount = await StripeConnectAccount.findOne();
if (existingAccount) {
  throw new GraphQLError('A Stripe Connect account already exists for this site.');
}
```

### 2. Platform Fee Calculation

```typescript
// Standard fee structure
const PLATFORM_FEE_PERCENTAGE = 0.07; // 7% platform fee

interface PaymentSplit {
  totalAmount: number;      // Customer pays this
  platformFee: number;      // Platform keeps this
  siteOwnerAmount: number;  // Site owner receives this
  stripeFee: number;        // Stripe processing fee
}

function calculatePaymentSplit(subtotal: number, shipping: number, tax: number, discount: number): PaymentSplit {
  const totalAmount = subtotal + shipping + tax - discount;
  const platformFee = Math.round(totalAmount * PLATFORM_FEE_PERCENTAGE);
  const stripeFee = Math.round(totalAmount * 0.029 + 30); // 2.9% + $0.30
  const siteOwnerAmount = totalAmount - platformFee;

  return { totalAmount, platformFee, siteOwnerAmount, stripeFee };
}
```

### 3. Connect Account Status Enum

```typescript
enum StripeAccountStatus {
  PENDING = 'PENDING',           // Account created, onboarding not complete
  ACTIVE = 'ACTIVE',             // Fully functional
  RESTRICTED = 'RESTRICTED',     // Limited functionality
  DEAUTHORIZED = 'DEAUTHORIZED', // Disconnected from platform
}

enum StripeAccountType {
  EXPRESS = 'EXPRESS',   // Recommended: Stripe handles onboarding UI
  STANDARD = 'STANDARD', // Full Stripe dashboard access
  CUSTOM = 'CUSTOM',     // Full control, more compliance burden
}
```

## Implementation

### Backend Routes (Express)

#### Create Connect Account

```typescript
// POST /api/stripe-connect/create-account
router.post('/create-account', async (req, res) => {
  try {
    const { country = 'US', type = 'express', email } = req.body;

    // Check for existing account
    const existingAccount = await StripeConnectAccount.findByUserId(email);
    if (existingAccount) {
      return res.status(400).json({
        success: false,
        error: 'User already has a Stripe Connect account',
        code: 'ACCOUNT_ALREADY_EXISTS',
      });
    }

    // Create account in Stripe
    const account = await stripe.accounts.create({
      type,
      country,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        platform: 'your-platform-name',
        userId: email,
        createdAt: new Date().toISOString(),
      },
    });

    // Save to database
    const dbAccount = await StripeConnectAccount.create({
      userId: email,
      stripeAccountId: account.id,
      accountType: type.toUpperCase(),
      country: account.country,
      status: StripeAccountStatus.PENDING,
      chargesEnabled: false,
      payoutsEnabled: false,
    });

    res.json({ success: true, accountId: account.id });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
```

#### Create Onboarding Link

```typescript
// POST /api/stripe-connect/create-account-session
router.post('/create-account-session', async (req, res) => {
  try {
    const { accountId } = req.body;

    const accountSession = await stripe.accountSessions.create({
      account: accountId,
      components: {
        account_onboarding: { enabled: true },
        account_management: { enabled: true },
        notification_banner: { enabled: true },
        payments: { enabled: true, features: { refund_management: true } },
        payouts: { enabled: true },
        balances: { enabled: true },
        documents: { enabled: true },
      },
    });

    res.json({
      success: true,
      client_secret: accountSession.client_secret,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
```

#### OAuth Flow for Existing Accounts

```typescript
// GET /api/stripe-connect/oauth/authorize
router.get('/oauth/authorize', async (req, res) => {
  const { clientId, redirectUri } = getOAuthConfig();
  const { state } = req.query;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: 'read_write',
    redirect_uri: redirectUri,
  });

  if (state) params.set('state', String(state));

  const url = `https://connect.stripe.com/oauth/authorize?${params.toString()}`;
  return res.redirect(url);
});

// GET /api/stripe-connect/oauth/callback
router.get('/oauth/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`${frontendUrl}/connect?oauth=error`);
  }

  // Exchange code for access token
  const tokenResponse = await stripe.oauth.token({
    grant_type: 'authorization_code',
    code: String(code),
  });

  const connectedAccountId = tokenResponse.stripe_user_id;

  // Sync account to database
  const acct = await stripe.accounts.retrieve(connectedAccountId);
  await syncAccountToDatabase(connectedAccountId, acct);

  return res.redirect(`${frontendUrl}/connect?oauth=success&account=${connectedAccountId}`);
});
```

### Payment Intent with Split

```typescript
// Create payment with platform fee and transfer
async function createSplitPayment(input: {
  orderId: string;
  siteOwnerStripeAccountId: string;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
}) {
  const { totalAmount, platformFee, siteOwnerAmount } = calculatePaymentSplit(
    input.subtotal,
    input.shipping,
    input.tax,
    input.discount
  );

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount,
    currency: 'usd',
    application_fee_amount: platformFee,
    transfer_data: {
      destination: input.siteOwnerStripeAccountId,
    },
    metadata: {
      orderId: input.orderId,
      platformFee: platformFee.toString(),
      siteOwnerAmount: siteOwnerAmount.toString(),
    },
  });

  return {
    paymentIntent,
    platformFee,
    siteOwnerAmount,
  };
}
```

### Webhook Processing

```typescript
// POST /api/webhooks/stripe
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;

    case 'account.updated':
      await handleAccountUpdated(event.data.object);
      break;

    case 'account.application.deauthorized':
      await handleAccountDeauthorized(event.data.object);
      break;

    case 'payout.paid':
    case 'payout.failed':
      await handlePayoutEvent(event.data.object, event.type);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};
```

### GraphQL Schema

```graphql
type StripeConnectAccount {
  id: ID!
  stripeAccountId: String!
  userId: String!
  accountType: StripeAccountType!
  status: StripeAccountStatus!
  email: String
  country: String!
  chargesEnabled: Boolean!
  payoutsEnabled: Boolean!
  detailsSubmitted: Boolean!
  onboardingComplete: Boolean!
  requirements: StripeAccountRequirements
  capabilities: [StripeCapability!]
  businessProfile: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
}

type StripeAccountRequirements {
  currentlyDue: [StripeRequirement!]!
  pendingVerification: [StripeRequirement!]!
  errors: [StripeRequirement!]!
  disabledReason: String
  deadline: String
}

type StripeBalance {
  available: [StripeBalanceAmount!]!
  pending: [StripeBalanceAmount!]!
  totalAvailable: Float!
  totalPending: Float!
  currency: String!
  formattedAvailable: String!
  formattedPending: String!
}

type Query {
  myStripeConnectAccount: StripeConnectAccount
  stripeBalance(accountId: String): StripeBalance
  stripeTransactions(filters: TransactionFilters!): [StripeTransaction!]!
}

type Mutation {
  createStripeConnectAccount(input: CreateConnectAccountInput!): CreateConnectAccountResult!
  createStripeOnboardingLink(input: OnboardingLinkInput!): StripeOnboardingLink!
  createStripePaymentIntent(input: PaymentIntentInput!): StripePaymentIntent!
  initiatePayout(input: PayoutInput!): PayoutResult!
}
```

### GraphQL Resolvers

```typescript
// CRITICAL: Always validate context.auth?.userId
const stripeResolvers = {
  Query: {
    myStripeConnectAccount: async (_: any, __: any, context: any) => {
      // CRITICAL: Required auth pattern
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      // SITE OWNER MODEL: Return site's single Connect account
      const user = await User.findByClerkId(context.auth.userId);
      const adminRoles = ['SITE_OWNER', 'SITE_ADMIN', 'ADMIN'];
      if (!user || !adminRoles.includes(user.role)) {
        throw new GraphQLError('Admin access required');
      }

      return await StripeConnectAccount.findOne();
    },

    stripeBalance: async (_: any, { accountId }: any, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required');
      }

      const balance = await stripe.balance.retrieve({
        stripeAccount: accountId,
      });

      return {
        available: balance.available,
        pending: balance.pending,
        totalAvailable: balance.available.reduce((sum, b) => sum + b.amount, 0) / 100,
        totalPending: balance.pending.reduce((sum, b) => sum + b.amount, 0) / 100,
        currency: balance.available[0]?.currency || 'usd',
      };
    },
  },

  Mutation: {
    createStripeConnectAccount: async (_: any, { input }: any, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required');
      }

      // Check for existing site account
      const existingAccount = await StripeConnectAccount.findOne();
      if (existingAccount) {
        throw new GraphQLError('Site already has a Connect account');
      }

      const account = await StripeConnectService.createConnectAccount(
        context.auth.userId,
        {
          businessType: input.businessType.toLowerCase(),
          country: input.country,
          email: input.email,
        }
      );

      return {
        account,
        onboardingRequired: !account.chargesEnabled,
        requirements: await getAccountRequirements(account.stripeAccountId),
      };
    },
  },
};
```

## Database Model

```typescript
// models/StripeConnectAccount.ts
import { Model, DataTypes } from 'sequelize';

class StripeConnectAccount extends Model {
  declare id: string;
  declare userId: string;
  declare stripeAccountId: string;
  declare accountType: StripeAccountType;
  declare status: StripeAccountStatus;
  declare email: string | null;
  declare country: string;
  declare chargesEnabled: boolean;
  declare payoutsEnabled: boolean;
  declare detailsSubmitted: boolean;
  declare onboardingComplete: boolean;
  declare requirements: object | null;
  declare capabilities: object | null;
  declare businessProfile: object | null;
  declare metadata: object | null;
  declare lastSyncAt: Date | null;

  static async findByStripeAccountId(stripeAccountId: string) {
    return this.findOne({ where: { stripeAccountId } });
  }

  static async findByUserId(userId: string) {
    return this.findOne({ where: { userId } });
  }

  get isActive(): boolean {
    return this.chargesEnabled && this.payoutsEnabled && this.detailsSubmitted;
  }
}

StripeConnectAccount.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  stripeAccountId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  accountType: {
    type: DataTypes.ENUM('EXPRESS', 'STANDARD', 'CUSTOM'),
    defaultValue: 'EXPRESS',
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'ACTIVE', 'RESTRICTED', 'DEAUTHORIZED'),
    defaultValue: 'PENDING',
  },
  chargesEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  payoutsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  detailsSubmitted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  onboardingComplete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // ... additional fields
}, { sequelize, modelName: 'StripeConnectAccount' });
```

## Frontend Integration

### Connect Embedded Components

```typescript
// components/stripe/ConnectOnboarding.tsx
'use client';

import { loadConnectAndInitialize } from '@stripe/connect-js';
import {
  ConnectAccountOnboarding,
  ConnectComponentsProvider,
} from '@stripe/react-connect-js';
import { useEffect, useState } from 'react';

export function ConnectOnboarding({ accountId }: { accountId: string }) {
  const [stripeConnectInstance, setStripeConnectInstance] = useState<any>(null);

  useEffect(() => {
    const initStripeConnect = async () => {
      // Fetch client secret from backend
      const response = await fetch('/api/stripe-connect/create-account-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });
      const { client_secret } = await response.json();

      const instance = await loadConnectAndInitialize({
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
        fetchClientSecret: async () => client_secret,
      });

      setStripeConnectInstance(instance);
    };

    initStripeConnect();
  }, [accountId]);

  if (!stripeConnectInstance) {
    return <div>Loading...</div>;
  }

  return (
    <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
      <ConnectAccountOnboarding
        onExit={() => {
          // Handle exit - refresh account status
          window.location.reload();
        }}
      />
    </ConnectComponentsProvider>
  );
}
```

### Payment Form with Connect

```typescript
// components/checkout/PaymentForm.tsx
'use client';

import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useMutation } from '@apollo/client';
import { CREATE_PAYMENT_INTENT } from '@/graphql/mutations/stripe';

export function PaymentForm({ orderId, amount }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [createPaymentIntent] = useMutation(CREATE_PAYMENT_INTENT);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create payment intent on backend
    const { data } = await createPaymentIntent({
      variables: {
        input: {
          orderId,
          subtotal: amount.subtotal,
          shipping: amount.shipping,
          tax: amount.tax,
          discount: amount.discount,
        },
      },
    });

    // Confirm payment
    const { error } = await stripe!.confirmPayment({
      elements: elements!,
      clientSecret: data.createStripePaymentIntent.clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe}>Pay Now</button>
    </form>
  );
}
```

## Environment Variables

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Connect
STRIPE_CONNECT_CLIENT_ID=ca_...
STRIPE_API_VERSION=2024-06-20

# Platform Configuration
PLATFORM_FEE_PERCENTAGE=0.07
```

## Quality Checklist

Before deployment:

- [ ] Connect account creation works for Express type
- [ ] OAuth flow works for Standard accounts
- [ ] Onboarding embeds render correctly
- [ ] Payment intents include application_fee_amount
- [ ] Transfers route to correct destination account
- [ ] Webhooks verify signatures
- [ ] Account status syncs from Stripe
- [ ] Balance retrieval works for connected accounts
- [ ] Payout initiation works
- [ ] Error handling for all Stripe API calls
- [ ] Database records sync with Stripe state

## Resources

### references/
- `webhook-events.md` - All Connect webhook event types
- `fee-structures.md` - Platform fee calculation patterns

### assets/
- `templates/StripeConnectService.ts` - Service class template
- `templates/stripeConnectRoutes.ts` - Express routes template
