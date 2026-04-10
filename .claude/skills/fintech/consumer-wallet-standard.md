# Consumer Wallet Standard

## Overview
Digital wallet functionality for consumers including balance management, peer-to-peer transfers, loyalty rewards, stored payment methods, and spending controls. Enables frictionless payments across Quik Nation platforms.

## Domain Context
- **Primary Projects**: Tap-to-Tip, Quik Nation (all consumer-facing apps)
- **Related Domains**: All consumer platforms
- **Key Integration**: Stripe, Plaid, Apple Pay, Google Pay

## Core Interfaces

### Consumer Wallet
```typescript
interface ConsumerWallet {
  id: string;
  userId: string;
  status: WalletStatus;
  balance: WalletBalance;
  paymentMethods: PaymentMethod[];
  defaultPaymentMethodId?: string;
  loyaltyPrograms: LoyaltyEnrollment[];
  spendingControls?: SpendingControls;
  settings: WalletSettings;
  createdAt: Date;
  updatedAt: Date;
}

type WalletStatus = 'active' | 'suspended' | 'frozen' | 'closed';

interface WalletBalance {
  available: number;
  pending: number;
  currency: string;
  lastUpdated: Date;
}

interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  brand?: string; // visa, mastercard, etc.
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  isVerified: boolean;
  billingAddress?: Address;
  metadata: Record<string, string>;
  createdAt: Date;
}

type PaymentMethodType =
  | 'card'
  | 'bank_account'
  | 'apple_pay'
  | 'google_pay'
  | 'wallet_balance';

interface WalletSettings {
  autoReloadEnabled: boolean;
  autoReloadThreshold?: number;
  autoReloadAmount?: number;
  notificationsEnabled: boolean;
  twoFactorRequired: boolean;
  biometricEnabled: boolean;
}
```

### Transactions & Transfers
```typescript
interface WalletTransaction {
  id: string;
  walletId: string;
  type: TransactionType;
  direction: 'credit' | 'debit';
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethodId?: string;
  counterparty?: Counterparty;
  reference?: string;
  description: string;
  metadata: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;
}

type TransactionType =
  | 'fund'
  | 'withdraw'
  | 'payment'
  | 'refund'
  | 'transfer_in'
  | 'transfer_out'
  | 'reward'
  | 'cashback'
  | 'fee'
  | 'adjustment';

type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'reversed';

interface Counterparty {
  type: 'user' | 'merchant' | 'platform';
  id: string;
  name: string;
  avatar?: string;
}

interface P2PTransfer {
  id: string;
  senderId: string;
  recipientId: string;
  recipientIdentifier: string; // phone, email, username
  amount: number;
  fee: number;
  currency: string;
  status: TransferStatus;
  note?: string;
  isPrivate: boolean;
  expiresAt?: Date;
  createdAt: Date;
  completedAt?: Date;
}

type TransferStatus =
  | 'pending'
  | 'accepted'
  | 'completed'
  | 'declined'
  | 'expired'
  | 'cancelled';
```

### Loyalty & Rewards
```typescript
interface LoyaltyEnrollment {
  id: string;
  walletId: string;
  programId: string;
  programName: string;
  merchantId?: string;
  memberId: string;
  tier: LoyaltyTier;
  pointsBalance: number;
  lifetimePoints: number;
  enrolledAt: Date;
}

interface LoyaltyTier {
  name: string;
  level: number;
  benefits: string[];
  pointsMultiplier: number;
  nextTierThreshold?: number;
}

interface RewardTransaction {
  id: string;
  walletId: string;
  programId: string;
  type: 'earn' | 'redeem' | 'expire' | 'adjust';
  points: number;
  balanceAfter: number;
  sourceTransactionId?: string;
  description: string;
  createdAt: Date;
}

interface Cashback {
  id: string;
  walletId: string;
  transactionId: string;
  merchantId: string;
  originalAmount: number;
  cashbackPercentage: number;
  cashbackAmount: number;
  status: 'pending' | 'credited' | 'cancelled';
  creditedAt?: Date;
  createdAt: Date;
}
```

### Spending Controls
```typescript
interface SpendingControls {
  enabled: boolean;
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  perTransactionLimit?: number;
  merchantCategoryRestrictions?: string[];
  allowedMerchants?: string[];
  blockedMerchants?: string[];
  requireApprovalAbove?: number;
  approverUserId?: string;
}

interface SpendingAnalytics {
  period: 'day' | 'week' | 'month';
  totalSpent: number;
  remainingLimit?: number;
  transactions: number;
  byCategory: Record<string, number>;
  byMerchant: { merchantId: string; name: string; amount: number }[];
  trend: 'up' | 'down' | 'stable';
  percentChange: number;
}
```

## Service Implementation

### Consumer Wallet Service
```typescript
import Stripe from 'stripe';

export class ConsumerWalletService {
  private stripe: Stripe;

  constructor(stripeSecretKey: string) {
    this.stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
  }

  // Create wallet for user
  async createWallet(userId: string): Promise<ConsumerWallet> {
    // Create Stripe Customer
    const customer = await this.stripe.customers.create({
      metadata: { userId },
    });

    const wallet: ConsumerWallet = {
      id: crypto.randomUUID(),
      userId,
      status: 'active',
      balance: {
        available: 0,
        pending: 0,
        currency: 'usd',
        lastUpdated: new Date(),
      },
      paymentMethods: [],
      loyaltyPrograms: [],
      settings: {
        autoReloadEnabled: false,
        notificationsEnabled: true,
        twoFactorRequired: false,
        biometricEnabled: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to database with Stripe customer ID
    await this.saveWallet(wallet, customer.id);

    return wallet;
  }

  // Add payment method
  async addPaymentMethod(
    walletId: string,
    paymentMethodId: string,
    setAsDefault: boolean = false
  ): Promise<PaymentMethod> {
    const wallet = await this.getWallet(walletId);
    const stripeCustomerId = await this.getStripeCustomerId(walletId);

    // Attach to customer
    const stripePaymentMethod = await this.stripe.paymentMethods.attach(
      paymentMethodId,
      { customer: stripeCustomerId }
    );

    const paymentMethod: PaymentMethod = {
      id: stripePaymentMethod.id,
      type: this.mapPaymentMethodType(stripePaymentMethod.type),
      brand: stripePaymentMethod.card?.brand,
      last4: stripePaymentMethod.card?.last4 || '',
      expiryMonth: stripePaymentMethod.card?.exp_month,
      expiryYear: stripePaymentMethod.card?.exp_year,
      isDefault: setAsDefault || wallet.paymentMethods.length === 0,
      isVerified: true,
      metadata: {},
      createdAt: new Date(),
    };

    if (paymentMethod.isDefault) {
      await this.stripe.customers.update(stripeCustomerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });
    }

    return paymentMethod;
  }

  // Fund wallet
  async fundWallet(
    walletId: string,
    amount: number,
    paymentMethodId: string
  ): Promise<WalletTransaction> {
    const wallet = await this.getWallet(walletId);
    const stripeCustomerId = await this.getStripeCustomerId(walletId);

    // Create payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      customer: stripeCustomerId,
      payment_method: paymentMethodId,
      confirm: true,
      metadata: {
        walletId,
        type: 'fund',
      },
    });

    // Create transaction record
    const transaction: WalletTransaction = {
      id: crypto.randomUUID(),
      walletId,
      type: 'fund',
      direction: 'credit',
      amount,
      fee: 0,
      netAmount: amount,
      currency: 'usd',
      status: paymentIntent.status === 'succeeded' ? 'completed' : 'pending',
      paymentMethodId,
      description: 'Wallet funding',
      metadata: { stripePaymentIntentId: paymentIntent.id },
      createdAt: new Date(),
      completedAt: paymentIntent.status === 'succeeded' ? new Date() : undefined,
    };

    // Update balance
    if (transaction.status === 'completed') {
      await this.updateBalance(walletId, amount, 'credit');
    }

    return transaction;
  }

  // Pay from wallet
  async payFromWallet(
    walletId: string,
    amount: number,
    merchantId: string,
    description: string,
    metadata: Record<string, any> = {}
  ): Promise<WalletTransaction> {
    const wallet = await this.getWallet(walletId);

    // Check spending controls
    await this.validateSpendingControls(wallet, amount, merchantId);

    // Check balance
    if (wallet.balance.available < amount) {
      // Try to use default payment method
      if (wallet.defaultPaymentMethodId) {
        return this.payWithPaymentMethod(
          walletId,
          wallet.defaultPaymentMethodId,
          amount,
          merchantId,
          description,
          metadata
        );
      }
      throw new Error('Insufficient wallet balance');
    }

    // Debit from wallet
    const transaction: WalletTransaction = {
      id: crypto.randomUUID(),
      walletId,
      type: 'payment',
      direction: 'debit',
      amount,
      fee: 0,
      netAmount: amount,
      currency: 'usd',
      status: 'completed',
      counterparty: {
        type: 'merchant',
        id: merchantId,
        name: await this.getMerchantName(merchantId),
      },
      description,
      metadata,
      createdAt: new Date(),
      completedAt: new Date(),
    };

    await this.updateBalance(walletId, amount, 'debit');

    // Process cashback if applicable
    await this.processCashback(walletId, transaction);

    // Process loyalty points if applicable
    await this.processLoyaltyEarn(walletId, transaction);

    return transaction;
  }

  // P2P transfer
  async sendMoney(
    senderWalletId: string,
    recipientIdentifier: string,
    amount: number,
    note?: string,
    isPrivate: boolean = false
  ): Promise<P2PTransfer> {
    const senderWallet = await this.getWallet(senderWalletId);

    // Resolve recipient
    const recipientWallet = await this.findWalletByIdentifier(recipientIdentifier);
    if (!recipientWallet) {
      throw new Error('Recipient not found');
    }

    // Check balance
    if (senderWallet.balance.available < amount) {
      throw new Error('Insufficient balance');
    }

    const transfer: P2PTransfer = {
      id: crypto.randomUUID(),
      senderId: senderWalletId,
      recipientId: recipientWallet.id,
      recipientIdentifier,
      amount,
      fee: 0,
      currency: 'usd',
      status: 'completed',
      note,
      isPrivate,
      createdAt: new Date(),
      completedAt: new Date(),
    };

    // Debit sender
    await this.updateBalance(senderWalletId, amount, 'debit');
    await this.createTransaction(senderWalletId, {
      type: 'transfer_out',
      direction: 'debit',
      amount,
      counterparty: {
        type: 'user',
        id: recipientWallet.userId,
        name: await this.getUserDisplayName(recipientWallet.userId),
      },
      description: note || 'Money sent',
    });

    // Credit recipient
    await this.updateBalance(recipientWallet.id, amount, 'credit');
    await this.createTransaction(recipientWallet.id, {
      type: 'transfer_in',
      direction: 'credit',
      amount,
      counterparty: {
        type: 'user',
        id: senderWallet.userId,
        name: await this.getUserDisplayName(senderWallet.userId),
      },
      description: note || 'Money received',
    });

    // Send notifications
    await this.notifyTransfer(transfer);

    return transfer;
  }

  // Request money
  async requestMoney(
    requesterWalletId: string,
    payerIdentifier: string,
    amount: number,
    note?: string,
    expiresIn: number = 7 * 24 * 60 * 60 * 1000 // 7 days
  ): Promise<P2PTransfer> {
    const payerWallet = await this.findWalletByIdentifier(payerIdentifier);

    const request: P2PTransfer = {
      id: crypto.randomUUID(),
      senderId: payerWallet?.id || '',
      recipientId: requesterWalletId,
      recipientIdentifier: payerIdentifier,
      amount,
      fee: 0,
      currency: 'usd',
      status: 'pending',
      note,
      isPrivate: false,
      expiresAt: new Date(Date.now() + expiresIn),
      createdAt: new Date(),
    };

    // Notify payer
    if (payerWallet) {
      await this.notifyPaymentRequest(request);
    }

    return request;
  }

  // Withdraw to bank
  async withdrawToBank(
    walletId: string,
    amount: number,
    bankAccountId: string
  ): Promise<WalletTransaction> {
    const wallet = await this.getWallet(walletId);

    if (wallet.balance.available < amount) {
      throw new Error('Insufficient balance');
    }

    // Create payout via Stripe
    // Note: This requires the user to have a connected bank account through Plaid/Stripe

    const transaction: WalletTransaction = {
      id: crypto.randomUUID(),
      walletId,
      type: 'withdraw',
      direction: 'debit',
      amount,
      fee: 0,
      netAmount: amount,
      currency: 'usd',
      status: 'processing',
      paymentMethodId: bankAccountId,
      description: 'Withdrawal to bank account',
      metadata: {},
      createdAt: new Date(),
    };

    await this.updateBalance(walletId, amount, 'debit');

    return transaction;
  }

  // Redeem loyalty points
  async redeemLoyaltyPoints(
    walletId: string,
    programId: string,
    points: number
  ): Promise<RewardTransaction> {
    const enrollment = await this.getLoyaltyEnrollment(walletId, programId);

    if (enrollment.pointsBalance < points) {
      throw new Error('Insufficient points');
    }

    const program = await this.getLoyaltyProgram(programId);
    const cashValue = points * program.pointValue; // e.g., 100 points = $1

    // Create reward transaction
    const rewardTx: RewardTransaction = {
      id: crypto.randomUUID(),
      walletId,
      programId,
      type: 'redeem',
      points: -points,
      balanceAfter: enrollment.pointsBalance - points,
      description: `Redeemed ${points} points for $${cashValue.toFixed(2)}`,
      createdAt: new Date(),
    };

    // Credit wallet
    await this.updateBalance(walletId, cashValue, 'credit');
    await this.createTransaction(walletId, {
      type: 'reward',
      direction: 'credit',
      amount: cashValue,
      description: `Loyalty reward redemption`,
    });

    return rewardTx;
  }

  // Get spending analytics
  async getSpendingAnalytics(
    walletId: string,
    period: 'day' | 'week' | 'month'
  ): Promise<SpendingAnalytics> {
    const wallet = await this.getWallet(walletId);
    const startDate = this.getPeriodStartDate(period);

    const transactions = await this.getTransactions(walletId, {
      startDate,
      types: ['payment'],
      direction: 'debit',
    });

    const analytics: SpendingAnalytics = {
      period,
      totalSpent: 0,
      transactions: transactions.length,
      byCategory: {},
      byMerchant: [],
      trend: 'stable',
      percentChange: 0,
    };

    const merchantMap = new Map<string, number>();

    for (const tx of transactions) {
      analytics.totalSpent += tx.amount;

      const category = tx.metadata.category || 'Other';
      analytics.byCategory[category] = (analytics.byCategory[category] || 0) + tx.amount;

      if (tx.counterparty?.type === 'merchant') {
        const current = merchantMap.get(tx.counterparty.id) || 0;
        merchantMap.set(tx.counterparty.id, current + tx.amount);
      }
    }

    // Convert merchant map to array
    for (const [merchantId, amount] of merchantMap) {
      analytics.byMerchant.push({
        merchantId,
        name: await this.getMerchantName(merchantId),
        amount,
      });
    }

    // Sort by amount
    analytics.byMerchant.sort((a, b) => b.amount - a.amount);

    // Calculate remaining limit if controls enabled
    if (wallet.spendingControls?.enabled) {
      const limitKey = `${period}lyLimit` as keyof SpendingControls;
      const limit = wallet.spendingControls[limitKey] as number | undefined;
      if (limit) {
        analytics.remainingLimit = limit - analytics.totalSpent;
      }
    }

    // Calculate trend vs previous period
    const previousPeriodSpent = await this.getPreviousPeriodSpending(walletId, period);
    if (previousPeriodSpent > 0) {
      analytics.percentChange = ((analytics.totalSpent - previousPeriodSpent) / previousPeriodSpent) * 100;
      analytics.trend = analytics.percentChange > 5 ? 'up' :
                        analytics.percentChange < -5 ? 'down' : 'stable';
    }

    return analytics;
  }

  // Auto-reload check
  async checkAutoReload(walletId: string): Promise<void> {
    const wallet = await this.getWallet(walletId);

    if (!wallet.settings.autoReloadEnabled ||
        !wallet.settings.autoReloadThreshold ||
        !wallet.settings.autoReloadAmount ||
        !wallet.defaultPaymentMethodId) {
      return;
    }

    if (wallet.balance.available < wallet.settings.autoReloadThreshold) {
      await this.fundWallet(
        walletId,
        wallet.settings.autoReloadAmount,
        wallet.defaultPaymentMethodId
      );
    }
  }

  // Validate spending controls
  private async validateSpendingControls(
    wallet: ConsumerWallet,
    amount: number,
    merchantId: string
  ): Promise<void> {
    const controls = wallet.spendingControls;
    if (!controls?.enabled) return;

    // Check per-transaction limit
    if (controls.perTransactionLimit && amount > controls.perTransactionLimit) {
      throw new Error(`Transaction exceeds limit of $${controls.perTransactionLimit}`);
    }

    // Check merchant restrictions
    if (controls.blockedMerchants?.includes(merchantId)) {
      throw new Error('Merchant is blocked');
    }

    if (controls.allowedMerchants && !controls.allowedMerchants.includes(merchantId)) {
      throw new Error('Merchant not in allowed list');
    }

    // Check daily/weekly/monthly limits
    const today = new Date();
    const daySpent = await this.getSpentInPeriod(wallet.id, 'day');
    const weekSpent = await this.getSpentInPeriod(wallet.id, 'week');
    const monthSpent = await this.getSpentInPeriod(wallet.id, 'month');

    if (controls.dailyLimit && (daySpent + amount) > controls.dailyLimit) {
      throw new Error(`Would exceed daily limit of $${controls.dailyLimit}`);
    }

    if (controls.weeklyLimit && (weekSpent + amount) > controls.weeklyLimit) {
      throw new Error(`Would exceed weekly limit of $${controls.weeklyLimit}`);
    }

    if (controls.monthlyLimit && (monthSpent + amount) > controls.monthlyLimit) {
      throw new Error(`Would exceed monthly limit of $${controls.monthlyLimit}`);
    }
  }

  // Helper methods (implementations would query database)
  private async getWallet(walletId: string): Promise<ConsumerWallet> {
    throw new Error('Not implemented');
  }

  private async saveWallet(wallet: ConsumerWallet, stripeCustomerId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getStripeCustomerId(walletId: string): Promise<string> {
    throw new Error('Not implemented');
  }

  private async updateBalance(walletId: string, amount: number, direction: 'credit' | 'debit'): Promise<void> {
    throw new Error('Not implemented');
  }

  private async findWalletByIdentifier(identifier: string): Promise<ConsumerWallet | null> {
    throw new Error('Not implemented');
  }

  private async getMerchantName(merchantId: string): Promise<string> {
    throw new Error('Not implemented');
  }

  private async getUserDisplayName(userId: string): Promise<string> {
    throw new Error('Not implemented');
  }

  private async createTransaction(walletId: string, data: Partial<WalletTransaction>): Promise<WalletTransaction> {
    throw new Error('Not implemented');
  }

  private async getTransactions(walletId: string, filters: any): Promise<WalletTransaction[]> {
    throw new Error('Not implemented');
  }

  private async processCashback(walletId: string, transaction: WalletTransaction): Promise<void> {
    throw new Error('Not implemented');
  }

  private async processLoyaltyEarn(walletId: string, transaction: WalletTransaction): Promise<void> {
    throw new Error('Not implemented');
  }

  private async notifyTransfer(transfer: P2PTransfer): Promise<void> {
    throw new Error('Not implemented');
  }

  private async notifyPaymentRequest(request: P2PTransfer): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getLoyaltyEnrollment(walletId: string, programId: string): Promise<LoyaltyEnrollment> {
    throw new Error('Not implemented');
  }

  private async getLoyaltyProgram(programId: string): Promise<any> {
    throw new Error('Not implemented');
  }

  private async getSpentInPeriod(walletId: string, period: 'day' | 'week' | 'month'): Promise<number> {
    throw new Error('Not implemented');
  }

  private async getPreviousPeriodSpending(walletId: string, period: 'day' | 'week' | 'month'): Promise<number> {
    throw new Error('Not implemented');
  }

  private async payWithPaymentMethod(
    walletId: string,
    paymentMethodId: string,
    amount: number,
    merchantId: string,
    description: string,
    metadata: Record<string, any>
  ): Promise<WalletTransaction> {
    throw new Error('Not implemented');
  }

  private mapPaymentMethodType(type: string): PaymentMethodType {
    const typeMap: Record<string, PaymentMethodType> = {
      'card': 'card',
      'us_bank_account': 'bank_account',
    };
    return typeMap[type] || 'card';
  }

  private getPeriodStartDate(period: 'day' | 'week' | 'month'): Date {
    const now = new Date();
    switch (period) {
      case 'day':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'week':
        const day = now.getDay();
        return new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }
}
```

## Database Schema

```sql
-- Consumer wallets
CREATE TABLE consumer_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
  stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  balance_available INTEGER DEFAULT 0, -- cents
  balance_pending INTEGER DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'usd',
  default_payment_method_id VARCHAR(255),
  auto_reload_enabled BOOLEAN DEFAULT false,
  auto_reload_threshold INTEGER,
  auto_reload_amount INTEGER,
  notifications_enabled BOOLEAN DEFAULT true,
  two_factor_required BOOLEAN DEFAULT false,
  biometric_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet payment methods
CREATE TABLE wallet_payment_methods (
  id VARCHAR(255) PRIMARY KEY, -- Stripe PM ID
  wallet_id UUID NOT NULL REFERENCES consumer_wallets(id),
  type VARCHAR(30) NOT NULL,
  brand VARCHAR(20),
  last4 VARCHAR(4) NOT NULL,
  expiry_month INTEGER,
  expiry_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  billing_address JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet transactions
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES consumer_wallets(id),
  type VARCHAR(30) NOT NULL,
  direction VARCHAR(10) NOT NULL, -- credit, debit
  amount INTEGER NOT NULL, -- cents
  fee INTEGER DEFAULT 0,
  net_amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(20) DEFAULT 'pending',
  payment_method_id VARCHAR(255),
  counterparty_type VARCHAR(20),
  counterparty_id VARCHAR(255),
  counterparty_name VARCHAR(255),
  reference VARCHAR(255),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- P2P transfers
CREATE TABLE p2p_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_wallet_id UUID NOT NULL REFERENCES consumer_wallets(id),
  recipient_wallet_id UUID REFERENCES consumer_wallets(id),
  recipient_identifier VARCHAR(255) NOT NULL,
  amount INTEGER NOT NULL, -- cents
  fee INTEGER DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(20) DEFAULT 'pending',
  note TEXT,
  is_private BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Spending controls
CREATE TABLE wallet_spending_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES consumer_wallets(id) UNIQUE,
  enabled BOOLEAN DEFAULT false,
  daily_limit INTEGER,
  weekly_limit INTEGER,
  monthly_limit INTEGER,
  per_transaction_limit INTEGER,
  merchant_category_restrictions TEXT[],
  allowed_merchants TEXT[],
  blocked_merchants TEXT[],
  require_approval_above INTEGER,
  approver_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loyalty enrollments
CREATE TABLE loyalty_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES consumer_wallets(id),
  program_id UUID NOT NULL REFERENCES loyalty_programs(id),
  member_id VARCHAR(255) NOT NULL,
  tier_name VARCHAR(100) DEFAULT 'base',
  tier_level INTEGER DEFAULT 1,
  points_balance INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(wallet_id, program_id)
);

-- Reward transactions
CREATE TABLE reward_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES consumer_wallets(id),
  program_id UUID NOT NULL REFERENCES loyalty_programs(id),
  type VARCHAR(20) NOT NULL, -- earn, redeem, expire, adjust
  points INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  source_transaction_id UUID REFERENCES wallet_transactions(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cashback records
CREATE TABLE wallet_cashback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES consumer_wallets(id),
  transaction_id UUID NOT NULL REFERENCES wallet_transactions(id),
  merchant_id UUID,
  original_amount INTEGER NOT NULL,
  cashback_percentage DECIMAL(5, 2) NOT NULL,
  cashback_amount INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  credited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_wallets_user ON consumer_wallets(user_id);
CREATE INDEX idx_wallets_status ON consumer_wallets(status);
CREATE INDEX idx_wallet_txns_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_txns_type ON wallet_transactions(type);
CREATE INDEX idx_wallet_txns_status ON wallet_transactions(status);
CREATE INDEX idx_wallet_txns_created ON wallet_transactions(created_at DESC);
CREATE INDEX idx_p2p_sender ON p2p_transfers(sender_wallet_id);
CREATE INDEX idx_p2p_recipient ON p2p_transfers(recipient_wallet_id);
CREATE INDEX idx_p2p_status ON p2p_transfers(status);
CREATE INDEX idx_loyalty_wallet ON loyalty_enrollments(wallet_id);
CREATE INDEX idx_reward_txns_wallet ON reward_transactions(wallet_id);
```

## API Endpoints

```typescript
// POST /api/wallet/create
// Create wallet
{
  response: ConsumerWallet
}

// GET /api/wallet
// Get wallet details
{
  response: ConsumerWallet
}

// GET /api/wallet/balance
// Get balance
{
  response: WalletBalance
}

// POST /api/wallet/payment-methods
// Add payment method
{
  request: { paymentMethodId: string, setAsDefault?: boolean },
  response: PaymentMethod
}

// POST /api/wallet/fund
// Fund wallet
{
  request: { amount: number, paymentMethodId: string },
  response: WalletTransaction
}

// POST /api/wallet/pay
// Pay from wallet
{
  request: { amount: number, merchantId: string, description: string },
  response: WalletTransaction
}

// POST /api/wallet/send
// Send money P2P
{
  request: { recipient: string, amount: number, note?: string },
  response: P2PTransfer
}

// POST /api/wallet/request
// Request money
{
  request: { from: string, amount: number, note?: string },
  response: P2PTransfer
}

// POST /api/wallet/withdraw
// Withdraw to bank
{
  request: { amount: number, bankAccountId: string },
  response: WalletTransaction
}

// GET /api/wallet/transactions
// Get transactions
{
  query: { page?: number, limit?: number, type?: string },
  response: { transactions: WalletTransaction[], total: number }
}

// GET /api/wallet/analytics
// Get spending analytics
{
  query: { period: 'day' | 'week' | 'month' },
  response: SpendingAnalytics
}

// PUT /api/wallet/spending-controls
// Update spending controls
{
  request: SpendingControls,
  response: SpendingControls
}

// GET /api/wallet/loyalty
// Get loyalty programs
{
  response: { enrollments: LoyaltyEnrollment[] }
}

// POST /api/wallet/loyalty/:programId/redeem
// Redeem points
{
  request: { points: number },
  response: RewardTransaction
}
```

## Related Skills
- `tap-to-pay-standard.md` - Accept payments into wallet
- `gig-worker-payments-standard.md` - Worker wallet features
- `barbershop-loyalty-standard.md` - Barbershop loyalty programs

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-15
- **Domain**: Fintech
