# Gig Worker Payments Standard

## Overview
Payment processing standard for gig workers including tip distribution, instant payouts, earnings tracking, and tax document generation. Designed for barbers, drivers, vendors, and other service providers.

## Domain Context
- **Primary Projects**: Tap-to-Tip, Quik Barbershop, Quik Delivery, Quik Rides
- **Related Domains**: Barbershop, Transportation, Delivery, Events
- **Key Integration**: Stripe Connect, Plaid, Tax APIs

## Core Interfaces

### Gig Worker Financial Profile
```typescript
interface GigWorkerProfile {
  id: string;
  userId: string;
  stripeConnectAccountId: string;
  accountStatus: ConnectAccountStatus;
  payoutSchedule: PayoutSchedule;
  instantPayoutEnabled: boolean;
  taxInfo: TaxInformation;
  bankAccounts: BankAccount[];
  debitCards: DebitCard[];
  defaultPayoutMethod: 'bank_account' | 'debit_card';
  earningsThisWeek: number;
  earningsThisMonth: number;
  earningsYTD: number;
  pendingBalance: number;
  availableBalance: number;
  createdAt: Date;
}

type ConnectAccountStatus =
  | 'onboarding_pending'
  | 'onboarding_incomplete'
  | 'restricted'
  | 'active'
  | 'disabled';

interface PayoutSchedule {
  interval: 'daily' | 'weekly' | 'monthly' | 'manual';
  weeklyAnchor?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  monthlyAnchor?: number; // 1-31
  minimumAmount: number;
}

interface TaxInformation {
  businessType: 'individual' | 'company' | 'non_profit';
  taxIdProvided: boolean;
  taxIdLast4?: string;
  form1099Eligible: boolean;
  ytdEarnings: number;
  ytdTaxWithheld: number;
}
```

### Earnings & Tips
```typescript
interface Earning {
  id: string;
  workerId: string;
  type: EarningType;
  sourceId: string; // Order, ride, service ID
  sourceType: 'delivery' | 'ride' | 'service' | 'event' | 'tip';
  grossAmount: number;
  platformFee: number;
  processingFee: number;
  netAmount: number;
  tipAmount: number;
  bonusAmount: number;
  status: EarningStatus;
  payoutId?: string;
  metadata: Record<string, any>;
  earnedAt: Date;
  availableAt: Date;
}

type EarningType =
  | 'base_fare'
  | 'tip'
  | 'bonus'
  | 'incentive'
  | 'surge'
  | 'reimbursement'
  | 'adjustment';

type EarningStatus =
  | 'pending'
  | 'available'
  | 'paid'
  | 'held'
  | 'cancelled';

interface TipDistribution {
  id: string;
  transactionId: string;
  totalTipAmount: number;
  distributionMethod: 'equal' | 'percentage' | 'role_based' | 'custom';
  recipients: TipRecipient[];
  status: 'pending' | 'distributed' | 'failed';
  createdAt: Date;
  distributedAt?: Date;
}

interface TipRecipient {
  workerId: string;
  workerName: string;
  role: string;
  percentage: number;
  amount: number;
  status: 'pending' | 'transferred' | 'failed';
}
```

### Payouts
```typescript
interface Payout {
  id: string;
  workerId: string;
  stripePayoutId: string;
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  method: 'standard' | 'instant';
  destination: PayoutDestination;
  status: PayoutStatus;
  earnings: string[]; // Earning IDs included
  failureCode?: string;
  failureMessage?: string;
  arrivalDate: Date;
  createdAt: Date;
  completedAt?: Date;
}

type PayoutStatus =
  | 'pending'
  | 'in_transit'
  | 'paid'
  | 'failed'
  | 'cancelled';

interface PayoutDestination {
  type: 'bank_account' | 'debit_card';
  bankName?: string;
  last4: string;
  routingNumber?: string;
}

interface InstantPayoutEligibility {
  eligible: boolean;
  availableAmount: number;
  fee: number;
  feePercentage: number;
  minimumAmount: number;
  maximumAmount: number;
  cooldownUntil?: Date;
  ineligibilityReason?: string;
}
```

## Service Implementation

### Gig Worker Payments Service
```typescript
import Stripe from 'stripe';

export class GigWorkerPaymentsService {
  private stripe: Stripe;

  constructor(stripeSecretKey: string) {
    this.stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
  }

  // Create Connect account for worker
  async createWorkerAccount(
    workerId: string,
    email: string,
    businessType: 'individual' | 'company' = 'individual'
  ): Promise<GigWorkerProfile> {
    const account = await this.stripe.accounts.create({
      type: 'express',
      country: 'US',
      email,
      business_type: businessType,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: { workerId },
    });

    return this.createWorkerProfile(workerId, account);
  }

  // Generate onboarding link
  async getOnboardingLink(
    stripeAccountId: string,
    returnUrl: string,
    refreshUrl: string
  ): Promise<string> {
    const link = await this.stripe.accountLinks.create({
      account: stripeAccountId,
      type: 'account_onboarding',
      return_url: returnUrl,
      refresh_url: refreshUrl,
    });

    return link.url;
  }

  // Record earning
  async recordEarning(
    workerId: string,
    earning: Omit<Earning, 'id' | 'status' | 'availableAt'>
  ): Promise<Earning> {
    const profile = await this.getWorkerProfile(workerId);

    // Calculate availability time (instant for tips, delayed for base)
    const availableAt = earning.type === 'tip'
      ? new Date()
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newEarning: Earning = {
      ...earning,
      id: crypto.randomUUID(),
      status: 'pending',
      availableAt,
    };

    // Create transfer to Connect account (pending)
    await this.stripe.transfers.create({
      amount: Math.round(newEarning.netAmount * 100),
      currency: 'usd',
      destination: profile.stripeConnectAccountId,
      metadata: {
        earningId: newEarning.id,
        workerId,
        type: earning.type,
      },
    });

    return newEarning;
  }

  // Distribute tips among workers
  async distributeTips(
    transactionId: string,
    totalTipAmount: number,
    recipients: Omit<TipRecipient, 'status'>[],
    method: TipDistribution['distributionMethod'] = 'percentage'
  ): Promise<TipDistribution> {
    const distribution: TipDistribution = {
      id: crypto.randomUUID(),
      transactionId,
      totalTipAmount,
      distributionMethod: method,
      recipients: recipients.map(r => ({ ...r, status: 'pending' })),
      status: 'pending',
      createdAt: new Date(),
    };

    // Process each recipient's tip
    for (const recipient of distribution.recipients) {
      try {
        const profile = await this.getWorkerProfile(recipient.workerId);

        await this.stripe.transfers.create({
          amount: Math.round(recipient.amount * 100),
          currency: 'usd',
          destination: profile.stripeConnectAccountId,
          metadata: {
            type: 'tip',
            distributionId: distribution.id,
            transactionId,
          },
        });

        recipient.status = 'transferred';
      } catch (error) {
        recipient.status = 'failed';
      }
    }

    distribution.status = distribution.recipients.every(r => r.status === 'transferred')
      ? 'distributed'
      : 'failed';
    distribution.distributedAt = new Date();

    return distribution;
  }

  // Check instant payout eligibility
  async checkInstantPayoutEligibility(workerId: string): Promise<InstantPayoutEligibility> {
    const profile = await this.getWorkerProfile(workerId);

    const balance = await this.stripe.balance.retrieve({
      stripeAccount: profile.stripeConnectAccountId,
    });

    const availableAmount = balance.instant_available?.[0]?.amount || 0;
    const instantFeePercentage = 0.015; // 1.5%
    const minimumAmount = 100; // $1.00 minimum
    const maximumAmount = 1000000; // $10,000 maximum

    // Check if instant payouts are enabled
    const account = await this.stripe.accounts.retrieve(profile.stripeConnectAccountId);
    const instantPayoutsEnabled = account.capabilities?.instant_payouts === 'active';

    if (!instantPayoutsEnabled) {
      return {
        eligible: false,
        availableAmount: availableAmount / 100,
        fee: 0,
        feePercentage: instantFeePercentage * 100,
        minimumAmount: minimumAmount / 100,
        maximumAmount: maximumAmount / 100,
        ineligibilityReason: 'Instant payouts not enabled for this account',
      };
    }

    if (availableAmount < minimumAmount) {
      return {
        eligible: false,
        availableAmount: availableAmount / 100,
        fee: 0,
        feePercentage: instantFeePercentage * 100,
        minimumAmount: minimumAmount / 100,
        maximumAmount: maximumAmount / 100,
        ineligibilityReason: `Minimum balance of $${minimumAmount / 100} required`,
      };
    }

    const fee = Math.round(availableAmount * instantFeePercentage);

    return {
      eligible: true,
      availableAmount: availableAmount / 100,
      fee: fee / 100,
      feePercentage: instantFeePercentage * 100,
      minimumAmount: minimumAmount / 100,
      maximumAmount: Math.min(availableAmount, maximumAmount) / 100,
    };
  }

  // Request instant payout
  async requestInstantPayout(
    workerId: string,
    amount: number
  ): Promise<Payout> {
    const eligibility = await this.checkInstantPayoutEligibility(workerId);

    if (!eligibility.eligible) {
      throw new Error(eligibility.ineligibilityReason || 'Not eligible for instant payout');
    }

    if (amount > eligibility.availableAmount) {
      throw new Error(`Amount exceeds available balance of $${eligibility.availableAmount}`);
    }

    const profile = await this.getWorkerProfile(workerId);
    const amountInCents = Math.round(amount * 100);
    const fee = Math.round(amountInCents * 0.015);

    const stripePayout = await this.stripe.payouts.create(
      {
        amount: amountInCents,
        currency: 'usd',
        method: 'instant',
      },
      { stripeAccount: profile.stripeConnectAccountId }
    );

    return {
      id: crypto.randomUUID(),
      workerId,
      stripePayoutId: stripePayout.id,
      amount: amount,
      fee: fee / 100,
      netAmount: (amountInCents - fee) / 100,
      currency: 'usd',
      method: 'instant',
      destination: {
        type: 'debit_card',
        last4: stripePayout.destination?.toString().slice(-4) || '****',
      },
      status: 'in_transit',
      earnings: [],
      arrivalDate: new Date(stripePayout.arrival_date * 1000),
      createdAt: new Date(),
    };
  }

  // Request standard payout
  async requestStandardPayout(
    workerId: string,
    amount?: number
  ): Promise<Payout> {
    const profile = await this.getWorkerProfile(workerId);

    const balance = await this.stripe.balance.retrieve({
      stripeAccount: profile.stripeConnectAccountId,
    });

    const availableAmount = balance.available?.[0]?.amount || 0;
    const payoutAmount = amount ? Math.round(amount * 100) : availableAmount;

    if (payoutAmount > availableAmount) {
      throw new Error(`Amount exceeds available balance`);
    }

    const stripePayout = await this.stripe.payouts.create(
      {
        amount: payoutAmount,
        currency: 'usd',
        method: 'standard',
      },
      { stripeAccount: profile.stripeConnectAccountId }
    );

    return {
      id: crypto.randomUUID(),
      workerId,
      stripePayoutId: stripePayout.id,
      amount: payoutAmount / 100,
      fee: 0,
      netAmount: payoutAmount / 100,
      currency: 'usd',
      method: 'standard',
      destination: {
        type: 'bank_account',
        last4: '****',
      },
      status: 'pending',
      earnings: [],
      arrivalDate: new Date(stripePayout.arrival_date * 1000),
      createdAt: new Date(),
    };
  }

  // Get earnings summary
  async getEarningsSummary(
    workerId: string,
    period: 'day' | 'week' | 'month' | 'year'
  ): Promise<EarningsSummary> {
    const profile = await this.getWorkerProfile(workerId);
    const startDate = this.getPeriodStartDate(period);

    // Query earnings from database
    const earnings = await this.queryEarnings(workerId, startDate, new Date());

    const summary: EarningsSummary = {
      period,
      startDate,
      endDate: new Date(),
      totalGross: 0,
      totalNet: 0,
      totalTips: 0,
      totalBonuses: 0,
      totalFees: 0,
      transactionCount: 0,
      breakdown: {
        baseFare: 0,
        tips: 0,
        bonuses: 0,
        incentives: 0,
        surge: 0,
        reimbursements: 0,
      },
    };

    for (const earning of earnings) {
      summary.totalGross += earning.grossAmount;
      summary.totalNet += earning.netAmount;
      summary.totalTips += earning.tipAmount;
      summary.totalBonuses += earning.bonusAmount;
      summary.totalFees += earning.platformFee + earning.processingFee;
      summary.transactionCount++;

      switch (earning.type) {
        case 'base_fare':
          summary.breakdown.baseFare += earning.netAmount;
          break;
        case 'tip':
          summary.breakdown.tips += earning.netAmount;
          break;
        case 'bonus':
          summary.breakdown.bonuses += earning.netAmount;
          break;
        case 'incentive':
          summary.breakdown.incentives += earning.netAmount;
          break;
        case 'surge':
          summary.breakdown.surge += earning.netAmount;
          break;
        case 'reimbursement':
          summary.breakdown.reimbursements += earning.netAmount;
          break;
      }
    }

    return summary;
  }

  // Generate tax documents
  async generateTaxDocument(
    workerId: string,
    year: number,
    type: '1099-K' | '1099-NEC'
  ): Promise<TaxDocument> {
    const profile = await this.getWorkerProfile(workerId);

    // Get annual earnings
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const earnings = await this.queryEarnings(workerId, startDate, endDate);

    const totalEarnings = earnings.reduce((sum, e) => sum + e.grossAmount, 0);
    const totalTransactions = earnings.length;

    // Check 1099-K threshold ($600 for 2024+)
    const threshold = 600;
    const requiresForm = totalEarnings >= threshold;

    return {
      workerId,
      year,
      formType: type,
      grossAmount: totalEarnings,
      transactionCount: totalTransactions,
      requiresForm,
      generatedAt: new Date(),
      downloadUrl: requiresForm ? `/api/tax-documents/${workerId}/${year}/${type}` : undefined,
    };
  }

  private async getWorkerProfile(workerId: string): Promise<GigWorkerProfile> {
    // Implementation: fetch from database
    throw new Error('Not implemented');
  }

  private async createWorkerProfile(
    workerId: string,
    account: Stripe.Account
  ): Promise<GigWorkerProfile> {
    // Implementation: save to database
    throw new Error('Not implemented');
  }

  private async queryEarnings(
    workerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Earning[]> {
    // Implementation: query database
    throw new Error('Not implemented');
  }

  private getPeriodStartDate(period: 'day' | 'week' | 'month' | 'year'): Date {
    const now = new Date();
    switch (period) {
      case 'day':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'week':
        const day = now.getDay();
        return new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
    }
  }
}

interface EarningsSummary {
  period: 'day' | 'week' | 'month' | 'year';
  startDate: Date;
  endDate: Date;
  totalGross: number;
  totalNet: number;
  totalTips: number;
  totalBonuses: number;
  totalFees: number;
  transactionCount: number;
  breakdown: {
    baseFare: number;
    tips: number;
    bonuses: number;
    incentives: number;
    surge: number;
    reimbursements: number;
  };
}

interface TaxDocument {
  workerId: string;
  year: number;
  formType: '1099-K' | '1099-NEC';
  grossAmount: number;
  transactionCount: number;
  requiresForm: boolean;
  generatedAt: Date;
  downloadUrl?: string;
}
```

## Database Schema

```sql
-- Gig worker profiles
CREATE TABLE gig_worker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  stripe_connect_account_id VARCHAR(255) UNIQUE NOT NULL,
  account_status VARCHAR(30) DEFAULT 'onboarding_pending',
  payout_interval VARCHAR(20) DEFAULT 'weekly',
  payout_weekly_anchor VARCHAR(10) DEFAULT 'friday',
  payout_monthly_anchor INTEGER,
  payout_minimum_amount INTEGER DEFAULT 0,
  instant_payout_enabled BOOLEAN DEFAULT false,
  default_payout_method VARCHAR(20) DEFAULT 'bank_account',
  business_type VARCHAR(20) DEFAULT 'individual',
  tax_id_provided BOOLEAN DEFAULT false,
  tax_id_last4 VARCHAR(4),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Worker bank accounts
CREATE TABLE worker_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_profile_id UUID NOT NULL REFERENCES gig_worker_profiles(id),
  stripe_bank_account_id VARCHAR(255) NOT NULL,
  bank_name VARCHAR(255),
  last4 VARCHAR(4) NOT NULL,
  routing_number VARCHAR(9),
  account_holder_name VARCHAR(255),
  account_type VARCHAR(20), -- checking, savings
  is_default BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Worker earnings
CREATE TABLE worker_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES gig_worker_profiles(id),
  type VARCHAR(30) NOT NULL,
  source_id VARCHAR(255) NOT NULL,
  source_type VARCHAR(30) NOT NULL,
  gross_amount INTEGER NOT NULL, -- cents
  platform_fee INTEGER DEFAULT 0,
  processing_fee INTEGER DEFAULT 0,
  net_amount INTEGER NOT NULL,
  tip_amount INTEGER DEFAULT 0,
  bonus_amount INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  payout_id UUID REFERENCES worker_payouts(id),
  stripe_transfer_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  earned_at TIMESTAMPTZ NOT NULL,
  available_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Worker payouts
CREATE TABLE worker_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES gig_worker_profiles(id),
  stripe_payout_id VARCHAR(255) NOT NULL,
  amount INTEGER NOT NULL, -- cents
  fee INTEGER DEFAULT 0,
  net_amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd',
  method VARCHAR(20) NOT NULL, -- standard, instant
  destination_type VARCHAR(20) NOT NULL,
  destination_last4 VARCHAR(4),
  status VARCHAR(20) DEFAULT 'pending',
  failure_code VARCHAR(100),
  failure_message TEXT,
  arrival_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Tip distributions
CREATE TABLE tip_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id VARCHAR(255) NOT NULL,
  total_tip_amount INTEGER NOT NULL, -- cents
  distribution_method VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  distributed_at TIMESTAMPTZ
);

-- Tip recipients
CREATE TABLE tip_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_id UUID NOT NULL REFERENCES tip_distributions(id),
  worker_id UUID NOT NULL REFERENCES gig_worker_profiles(id),
  role VARCHAR(100),
  percentage DECIMAL(5, 2) NOT NULL,
  amount INTEGER NOT NULL, -- cents
  status VARCHAR(20) DEFAULT 'pending',
  stripe_transfer_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_worker_earnings_worker ON worker_earnings(worker_id);
CREATE INDEX idx_worker_earnings_status ON worker_earnings(status);
CREATE INDEX idx_worker_earnings_earned_at ON worker_earnings(earned_at DESC);
CREATE INDEX idx_worker_payouts_worker ON worker_payouts(worker_id);
CREATE INDEX idx_worker_payouts_status ON worker_payouts(status);
CREATE INDEX idx_tip_recipients_worker ON tip_recipients(worker_id);
```

## API Endpoints

```typescript
// POST /api/workers/connect/create
// Create Connect account
{
  request: { email: string, businessType?: 'individual' | 'company' },
  response: { profile: GigWorkerProfile, onboardingUrl: string }
}

// GET /api/workers/earnings
// Get earnings list
{
  query: { period?: string, type?: string, status?: string },
  response: { earnings: Earning[], summary: EarningsSummary }
}

// GET /api/workers/earnings/summary
// Get earnings summary
{
  query: { period: 'day' | 'week' | 'month' | 'year' },
  response: EarningsSummary
}

// GET /api/workers/payout/eligibility
// Check instant payout eligibility
{
  response: InstantPayoutEligibility
}

// POST /api/workers/payout/instant
// Request instant payout
{
  request: { amount: number },
  response: Payout
}

// POST /api/workers/payout/standard
// Request standard payout
{
  request: { amount?: number },
  response: Payout
}

// POST /api/tips/distribute
// Distribute tips
{
  request: {
    transactionId: string,
    totalAmount: number,
    recipients: TipRecipient[],
    method?: 'equal' | 'percentage' | 'custom'
  },
  response: TipDistribution
}

// GET /api/workers/tax-documents/:year
// Get tax documents
{
  response: { documents: TaxDocument[] }
}
```

## Related Skills
- `tap-to-pay-standard.md` - Payment collection that generates earnings
- `barbershop-pos-standard.md` - Barber service earnings
- `delivery-driver-standard.md` - Delivery driver earnings

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-15
- **Domain**: Fintech
