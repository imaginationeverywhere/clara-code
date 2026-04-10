# Barbershop Loyalty Standard

## Overview
Loyalty program system for barbershops supporting points accrual, tier-based rewards, referral bonuses, promotional campaigns, and redemption management. Enables customer retention through gamified rewards.

## Domain Context
- **Primary Projects**: Quik Barbershop, DreamiHairCare
- **Related Domains**: Fintech (consumer wallet), Events (loyalty patterns)
- **Key Integration**: Consumer Wallet, POS System, SMS Notifications

## Core Interfaces

### Loyalty Program
```typescript
interface LoyaltyProgram {
  id: string;
  shopId: string;
  name: string;
  description: string;
  type: ProgramType;
  status: 'active' | 'paused' | 'ended';
  pointsConfig: PointsConfiguration;
  tiers: LoyaltyTier[];
  rewards: Reward[];
  referralConfig?: ReferralConfiguration;
  expirationPolicy: ExpirationPolicy;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
}

type ProgramType =
  | 'points_based'      // Earn points, redeem for rewards
  | 'punch_card'        // Visit count based
  | 'spend_based'       // Dollar amount thresholds
  | 'hybrid';           // Combination

interface PointsConfiguration {
  earnRate: number;              // Points per $1 spent
  earnRateServices: number;      // Different rate for services
  earnRateProducts: number;      // Different rate for products
  bonusOnBirthday: number;       // Birthday bonus points
  bonusOnSignup: number;         // Signup bonus
  minimumPurchaseToEarn: number; // Minimum spend to earn points
  roundingMethod: 'floor' | 'ceiling' | 'nearest';
}

interface LoyaltyTier {
  id: string;
  name: string;
  level: number;
  threshold: number;              // Points or visits to reach
  thresholdType: 'points' | 'visits' | 'spend';
  benefits: TierBenefit[];
  pointsMultiplier: number;       // e.g., 1.5x for Gold
  color: string;
  icon?: string;
}

interface TierBenefit {
  type: BenefitType;
  value: number | string;
  description: string;
}

type BenefitType =
  | 'discount_percentage'
  | 'discount_fixed'
  | 'free_service'
  | 'priority_booking'
  | 'exclusive_hours'
  | 'free_product'
  | 'points_multiplier';

interface ExpirationPolicy {
  type: 'never' | 'fixed_period' | 'rolling' | 'tier_based';
  periodDays?: number;           // For fixed_period
  warningDays: number;           // Days before to warn
  graceperiodDays: number;       // Grace period after expiration
}
```

### Customer Loyalty
```typescript
interface CustomerLoyalty {
  id: string;
  customerId: string;
  programId: string;
  shopId: string;
  status: 'active' | 'suspended' | 'expired';
  currentTier: LoyaltyTier;
  pointsBalance: number;
  lifetimePoints: number;
  lifetimeSpend: number;
  visitCount: number;
  referralCode: string;
  referralCount: number;
  referralEarnings: number;
  nextTierProgress?: {
    currentPoints: number;
    requiredPoints: number;
    percentage: number;
  };
  pointsExpiringNext?: {
    amount: number;
    expirationDate: Date;
  };
  enrolledAt: Date;
  lastActivityAt: Date;
}

interface PointsTransaction {
  id: string;
  customerLoyaltyId: string;
  type: PointsTransactionType;
  points: number;                 // Positive for earn, negative for redeem
  balanceAfter: number;
  sourceType?: string;            // 'purchase', 'referral', 'bonus', etc.
  sourceId?: string;              // Transaction ID, referral ID, etc.
  description: string;
  expiresAt?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
}

type PointsTransactionType =
  | 'earn_purchase'
  | 'earn_referral'
  | 'earn_bonus'
  | 'earn_promotion'
  | 'earn_birthday'
  | 'earn_signup'
  | 'redeem_reward'
  | 'redeem_discount'
  | 'expire'
  | 'adjust'
  | 'transfer_in'
  | 'transfer_out';
```

### Rewards & Redemption
```typescript
interface Reward {
  id: string;
  programId: string;
  name: string;
  description: string;
  type: RewardType;
  pointsCost: number;
  value: number;                  // Dollar value or percentage
  category: string;
  imageUrl?: string;
  availableQuantity?: number;     // Limited quantity rewards
  maxRedemptionsPerCustomer?: number;
  tierRequired?: string;          // Minimum tier ID
  validFrom?: Date;
  validUntil?: Date;
  isActive: boolean;
  termsAndConditions?: string;
}

type RewardType =
  | 'discount_percentage'
  | 'discount_fixed'
  | 'free_service'
  | 'free_product'
  | 'cash_value'
  | 'exclusive_access';

interface Redemption {
  id: string;
  customerLoyaltyId: string;
  rewardId: string;
  pointsSpent: number;
  status: RedemptionStatus;
  code: string;                   // Redemption code for POS
  usedAt?: Date;
  usedTransactionId?: string;
  expiresAt: Date;
  createdAt: Date;
}

type RedemptionStatus =
  | 'pending'
  | 'used'
  | 'expired'
  | 'cancelled';
```

### Referral System
```typescript
interface ReferralConfiguration {
  enabled: boolean;
  referrerReward: number;         // Points for referrer
  refereeReward: number;          // Points for new customer
  minimumPurchaseRequired: number;
  cooldownDays: number;           // Days between referrals to same person
  maxReferralsPerMonth: number;
  requireCompletedService: boolean;
}

interface Referral {
  id: string;
  programId: string;
  referrerCustomerId: string;
  refereeCustomerId: string;
  referralCode: string;
  status: ReferralStatus;
  referrerPointsAwarded: number;
  refereePointsAwarded: number;
  qualifyingTransactionId?: string;
  completedAt?: Date;
  createdAt: Date;
}

type ReferralStatus =
  | 'pending'           // Referee signed up
  | 'qualified'         // Referee made qualifying purchase
  | 'completed'         // Points awarded
  | 'expired'           // Not completed in time
  | 'invalid';          // Invalid referral
```

### Promotions & Campaigns
```typescript
interface LoyaltyPromotion {
  id: string;
  programId: string;
  name: string;
  type: PromotionType;
  description: string;
  pointsMultiplier?: number;      // For multiplier promotions
  bonusPoints?: number;           // For bonus promotions
  conditions: PromotionCondition[];
  startDate: Date;
  endDate: Date;
  maxUses?: number;
  usedCount: number;
  targetTiers?: string[];         // Specific tiers only
  isActive: boolean;
}

type PromotionType =
  | 'points_multiplier'           // 2x, 3x points
  | 'bonus_points'                // Extra points on purchase
  | 'double_day'                  // Double points all day
  | 'service_specific'            // Bonus on specific services
  | 'first_visit_month';          // Bonus for first visit of month

interface PromotionCondition {
  type: 'minimum_spend' | 'specific_service' | 'specific_day' | 'time_range';
  value: any;
}

interface Campaign {
  id: string;
  programId: string;
  name: string;
  type: 'email' | 'sms' | 'push';
  target: CampaignTarget;
  message: string;
  subject?: string;               // For email
  scheduledAt: Date;
  sentAt?: Date;
  recipientCount: number;
  openCount: number;
  clickCount: number;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
}

interface CampaignTarget {
  type: 'all' | 'tier' | 'inactive' | 'expiring_points' | 'birthday' | 'custom';
  tierIds?: string[];
  inactiveDays?: number;
  expiringWithinDays?: number;
  customFilter?: Record<string, any>;
}
```

## Service Implementation

### Loyalty Service
```typescript
export class BarbershopLoyaltyService {

  // Enroll customer in program
  async enrollCustomer(
    customerId: string,
    programId: string
  ): Promise<CustomerLoyalty> {
    const program = await this.getProgram(programId);
    const customer = await this.getCustomer(customerId);

    // Check if already enrolled
    const existing = await this.getCustomerLoyalty(customerId, programId);
    if (existing) {
      throw new Error('Customer already enrolled in program');
    }

    // Generate unique referral code
    const referralCode = await this.generateReferralCode(customerId);

    const loyalty: CustomerLoyalty = {
      id: crypto.randomUUID(),
      customerId,
      programId,
      shopId: program.shopId,
      status: 'active',
      currentTier: program.tiers[0], // Start at base tier
      pointsBalance: 0,
      lifetimePoints: 0,
      lifetimeSpend: 0,
      visitCount: 0,
      referralCode,
      referralCount: 0,
      referralEarnings: 0,
      enrolledAt: new Date(),
      lastActivityAt: new Date(),
    };

    await this.saveCustomerLoyalty(loyalty);

    // Award signup bonus
    if (program.pointsConfig.bonusOnSignup > 0) {
      await this.awardPoints(
        loyalty.id,
        program.pointsConfig.bonusOnSignup,
        'earn_signup',
        'Signup bonus'
      );
    }

    // Check for referral
    const referralCode_used = await this.checkPendingReferral(customerId);
    if (referralCode_used) {
      await this.awardReferralBonusToReferee(loyalty, referralCode_used);
    }

    return loyalty;
  }

  // Calculate points for a transaction
  async calculatePoints(
    programId: string,
    transactionAmount: number,
    serviceAmount: number,
    productAmount: number,
    customerId: string
  ): Promise<{ basePoints: number; bonusPoints: number; multiplier: number; total: number }> {
    const program = await this.getProgram(programId);
    const loyalty = await this.getCustomerLoyalty(customerId, programId);
    const config = program.pointsConfig;

    // Check minimum purchase
    if (transactionAmount < config.minimumPurchaseToEarn) {
      return { basePoints: 0, bonusPoints: 0, multiplier: 1, total: 0 };
    }

    // Calculate base points
    const servicePoints = this.roundPoints(
      serviceAmount * config.earnRateServices,
      config.roundingMethod
    );
    const productPoints = this.roundPoints(
      productAmount * config.earnRateProducts,
      config.roundingMethod
    );
    let basePoints = servicePoints + productPoints;

    // Apply tier multiplier
    const tierMultiplier = loyalty?.currentTier.pointsMultiplier || 1;

    // Check for active promotions
    const promotions = await this.getActivePromotions(programId);
    let promotionMultiplier = 1;
    let bonusPoints = 0;

    for (const promo of promotions) {
      if (await this.customerQualifiesForPromotion(customerId, promo)) {
        if (promo.type === 'points_multiplier' && promo.pointsMultiplier) {
          promotionMultiplier = Math.max(promotionMultiplier, promo.pointsMultiplier);
        } else if (promo.type === 'bonus_points' && promo.bonusPoints) {
          bonusPoints += promo.bonusPoints;
        }
      }
    }

    // Check birthday bonus
    if (await this.isBirthday(customerId)) {
      bonusPoints += config.bonusOnBirthday;
    }

    const totalMultiplier = tierMultiplier * promotionMultiplier;
    const total = Math.floor(basePoints * totalMultiplier) + bonusPoints;

    return {
      basePoints,
      bonusPoints,
      multiplier: totalMultiplier,
      total,
    };
  }

  // Award points from purchase
  async awardPointsFromPurchase(
    customerId: string,
    programId: string,
    transactionId: string,
    transactionAmount: number,
    serviceAmount: number,
    productAmount: number
  ): Promise<PointsTransaction> {
    const loyalty = await this.getCustomerLoyalty(customerId, programId);
    if (!loyalty) {
      throw new Error('Customer not enrolled in program');
    }

    const pointsCalc = await this.calculatePoints(
      programId,
      transactionAmount,
      serviceAmount,
      productAmount,
      customerId
    );

    if (pointsCalc.total <= 0) {
      throw new Error('No points earned for this transaction');
    }

    const transaction = await this.awardPoints(
      loyalty.id,
      pointsCalc.total,
      'earn_purchase',
      `${pointsCalc.total} points earned on $${transactionAmount.toFixed(2)} purchase`,
      transactionId
    );

    // Update loyalty stats
    loyalty.lifetimeSpend += transactionAmount;
    loyalty.visitCount++;
    loyalty.lastActivityAt = new Date();

    // Check tier upgrade
    await this.checkTierUpgrade(loyalty);

    await this.saveCustomerLoyalty(loyalty);

    // Check if referral qualifies
    await this.checkReferralQualification(customerId, transactionId);

    return transaction;
  }

  // Award points (generic)
  async awardPoints(
    customerLoyaltyId: string,
    points: number,
    type: PointsTransactionType,
    description: string,
    sourceId?: string
  ): Promise<PointsTransaction> {
    const loyalty = await this.getCustomerLoyaltyById(customerLoyaltyId);
    const program = await this.getProgram(loyalty.programId);

    // Calculate expiration date
    let expiresAt: Date | undefined;
    if (program.expirationPolicy.type === 'fixed_period') {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + program.expirationPolicy.periodDays!);
    } else if (program.expirationPolicy.type === 'rolling') {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + program.expirationPolicy.periodDays!);
    }

    const newBalance = loyalty.pointsBalance + points;

    const transaction: PointsTransaction = {
      id: crypto.randomUUID(),
      customerLoyaltyId,
      type,
      points,
      balanceAfter: newBalance,
      sourceType: type.includes('purchase') ? 'purchase' : type.split('_')[1],
      sourceId,
      description,
      expiresAt,
      metadata: {},
      createdAt: new Date(),
    };

    await this.savePointsTransaction(transaction);

    // Update balance
    loyalty.pointsBalance = newBalance;
    loyalty.lifetimePoints += points;
    loyalty.lastActivityAt = new Date();
    await this.saveCustomerLoyalty(loyalty);

    // Send notification if significant
    if (points >= 100) {
      await this.notifyPointsEarned(loyalty.customerId, points, newBalance);
    }

    return transaction;
  }

  // Redeem reward
  async redeemReward(
    customerId: string,
    programId: string,
    rewardId: string
  ): Promise<Redemption> {
    const loyalty = await this.getCustomerLoyalty(customerId, programId);
    if (!loyalty) {
      throw new Error('Customer not enrolled in program');
    }

    const reward = await this.getReward(rewardId);
    if (!reward.isActive) {
      throw new Error('Reward is not available');
    }

    // Check points balance
    if (loyalty.pointsBalance < reward.pointsCost) {
      throw new Error(`Insufficient points. Need ${reward.pointsCost}, have ${loyalty.pointsBalance}`);
    }

    // Check tier requirement
    if (reward.tierRequired) {
      const requiredTier = await this.getTier(reward.tierRequired);
      if (loyalty.currentTier.level < requiredTier.level) {
        throw new Error(`${requiredTier.name} tier required for this reward`);
      }
    }

    // Check quantity
    if (reward.availableQuantity !== undefined && reward.availableQuantity <= 0) {
      throw new Error('Reward is out of stock');
    }

    // Check max redemptions
    if (reward.maxRedemptionsPerCustomer) {
      const redemptionCount = await this.getCustomerRedemptionCount(
        loyalty.id,
        rewardId
      );
      if (redemptionCount >= reward.maxRedemptionsPerCustomer) {
        throw new Error('Maximum redemptions reached for this reward');
      }
    }

    // Generate redemption code
    const code = await this.generateRedemptionCode();

    // Create redemption
    const redemption: Redemption = {
      id: crypto.randomUUID(),
      customerLoyaltyId: loyalty.id,
      rewardId,
      pointsSpent: reward.pointsCost,
      status: 'pending',
      code,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      createdAt: new Date(),
    };

    await this.saveRedemption(redemption);

    // Deduct points
    await this.awardPoints(
      loyalty.id,
      -reward.pointsCost,
      'redeem_reward',
      `Redeemed: ${reward.name}`,
      redemption.id
    );

    // Update reward quantity
    if (reward.availableQuantity !== undefined) {
      reward.availableQuantity--;
      await this.saveReward(reward);
    }

    // Send notification
    await this.notifyRewardRedeemed(customerId, reward, redemption.code);

    return redemption;
  }

  // Use redemption at POS
  async useRedemption(
    code: string,
    transactionId: string
  ): Promise<{ redemption: Redemption; reward: Reward }> {
    const redemption = await this.getRedemptionByCode(code);

    if (!redemption) {
      throw new Error('Invalid redemption code');
    }

    if (redemption.status !== 'pending') {
      throw new Error(`Redemption already ${redemption.status}`);
    }

    if (new Date() > redemption.expiresAt) {
      redemption.status = 'expired';
      await this.saveRedemption(redemption);
      throw new Error('Redemption has expired');
    }

    const reward = await this.getReward(redemption.rewardId);

    // Mark as used
    redemption.status = 'used';
    redemption.usedAt = new Date();
    redemption.usedTransactionId = transactionId;
    await this.saveRedemption(redemption);

    return { redemption, reward };
  }

  // Process referral
  async processReferral(
    referralCode: string,
    newCustomerId: string
  ): Promise<Referral> {
    // Find referrer
    const referrerLoyalty = await this.getLoyaltyByReferralCode(referralCode);
    if (!referrerLoyalty) {
      throw new Error('Invalid referral code');
    }

    const program = await this.getProgram(referrerLoyalty.programId);
    const referralConfig = program.referralConfig;

    if (!referralConfig?.enabled) {
      throw new Error('Referral program is not active');
    }

    // Check if referee is already a customer
    const existingCustomer = await this.getCustomer(newCustomerId);
    if (existingCustomer.createdAt < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      throw new Error('Referral only valid for new customers');
    }

    // Check cooldown
    const recentReferral = await this.getRecentReferral(
      referrerLoyalty.customerId,
      newCustomerId,
      referralConfig.cooldownDays
    );
    if (recentReferral) {
      throw new Error('Cannot refer same person within cooldown period');
    }

    // Check monthly limit
    const monthlyCount = await this.getMonthlyReferralCount(referrerLoyalty.customerId);
    if (monthlyCount >= referralConfig.maxReferralsPerMonth) {
      throw new Error('Monthly referral limit reached');
    }

    const referral: Referral = {
      id: crypto.randomUUID(),
      programId: program.id,
      referrerCustomerId: referrerLoyalty.customerId,
      refereeCustomerId: newCustomerId,
      referralCode,
      status: 'pending',
      referrerPointsAwarded: 0,
      refereePointsAwarded: 0,
      createdAt: new Date(),
    };

    await this.saveReferral(referral);

    return referral;
  }

  // Complete referral after qualifying purchase
  async completeReferral(
    refereeCustomerId: string,
    transactionId: string,
    transactionAmount: number
  ): Promise<Referral | null> {
    const referral = await this.getPendingReferral(refereeCustomerId);
    if (!referral) return null;

    const program = await this.getProgram(referral.programId);
    const referralConfig = program.referralConfig!;

    // Check minimum purchase
    if (transactionAmount < referralConfig.minimumPurchaseRequired) {
      return null;
    }

    // Award points to referrer
    const referrerLoyalty = await this.getCustomerLoyalty(
      referral.referrerCustomerId,
      program.id
    );
    if (referrerLoyalty) {
      await this.awardPoints(
        referrerLoyalty.id,
        referralConfig.referrerReward,
        'earn_referral',
        `Referral bonus for referring a friend`,
        referral.id
      );
      referral.referrerPointsAwarded = referralConfig.referrerReward;

      // Update referral stats
      referrerLoyalty.referralCount++;
      referrerLoyalty.referralEarnings += referralConfig.referrerReward;
      await this.saveCustomerLoyalty(referrerLoyalty);
    }

    // Award points to referee
    const refereeLoyalty = await this.getCustomerLoyalty(
      refereeCustomerId,
      program.id
    );
    if (refereeLoyalty) {
      await this.awardPoints(
        refereeLoyalty.id,
        referralConfig.refereeReward,
        'earn_referral',
        `Welcome bonus from referral`,
        referral.id
      );
      referral.refereePointsAwarded = referralConfig.refereeReward;
    }

    referral.status = 'completed';
    referral.qualifyingTransactionId = transactionId;
    referral.completedAt = new Date();
    await this.saveReferral(referral);

    // Notify both parties
    await this.notifyReferralComplete(referral);

    return referral;
  }

  // Check and upgrade tier
  async checkTierUpgrade(loyalty: CustomerLoyalty): Promise<boolean> {
    const program = await this.getProgram(loyalty.programId);
    const currentLevel = loyalty.currentTier.level;

    // Find highest qualifying tier
    let newTier = loyalty.currentTier;
    for (const tier of program.tiers.sort((a, b) => b.level - a.level)) {
      let qualifies = false;
      switch (tier.thresholdType) {
        case 'points':
          qualifies = loyalty.lifetimePoints >= tier.threshold;
          break;
        case 'visits':
          qualifies = loyalty.visitCount >= tier.threshold;
          break;
        case 'spend':
          qualifies = loyalty.lifetimeSpend >= tier.threshold;
          break;
      }
      if (qualifies && tier.level > newTier.level) {
        newTier = tier;
        break;
      }
    }

    if (newTier.level > currentLevel) {
      loyalty.currentTier = newTier;
      await this.saveCustomerLoyalty(loyalty);
      await this.notifyTierUpgrade(loyalty.customerId, newTier);
      return true;
    }

    return false;
  }

  // Expire points
  async processPointsExpiration(): Promise<number> {
    const expiringPoints = await this.getExpiringPoints(new Date());
    let totalExpired = 0;

    for (const points of expiringPoints) {
      const loyalty = await this.getCustomerLoyaltyById(points.customerLoyaltyId);

      // Create expiration transaction
      await this.awardPoints(
        loyalty.id,
        -points.points,
        'expire',
        `${points.points} points expired`,
        points.id
      );

      totalExpired += points.points;
    }

    return totalExpired;
  }

  // Get customer loyalty summary
  async getLoyaltySummary(
    customerId: string,
    programId: string
  ): Promise<{
    loyalty: CustomerLoyalty;
    recentTransactions: PointsTransaction[];
    availableRewards: Reward[];
    activePromotions: LoyaltyPromotion[];
    pendingRedemptions: Redemption[];
  }> {
    const loyalty = await this.getCustomerLoyalty(customerId, programId);
    if (!loyalty) {
      throw new Error('Customer not enrolled');
    }

    const program = await this.getProgram(programId);

    // Get next tier progress
    const nextTier = program.tiers.find(t => t.level === loyalty.currentTier.level + 1);
    if (nextTier) {
      let currentProgress = 0;
      switch (nextTier.thresholdType) {
        case 'points':
          currentProgress = loyalty.lifetimePoints;
          break;
        case 'visits':
          currentProgress = loyalty.visitCount;
          break;
        case 'spend':
          currentProgress = loyalty.lifetimeSpend;
          break;
      }
      loyalty.nextTierProgress = {
        currentPoints: currentProgress,
        requiredPoints: nextTier.threshold,
        percentage: (currentProgress / nextTier.threshold) * 100,
      };
    }

    // Get expiring points
    const expiringPoints = await this.getNextExpiringPoints(loyalty.id);
    if (expiringPoints) {
      loyalty.pointsExpiringNext = expiringPoints;
    }

    const recentTransactions = await this.getRecentTransactions(loyalty.id, 10);
    const availableRewards = await this.getAvailableRewards(programId, loyalty);
    const activePromotions = await this.getActivePromotions(programId);
    const pendingRedemptions = await this.getPendingRedemptions(loyalty.id);

    return {
      loyalty,
      recentTransactions,
      availableRewards,
      activePromotions,
      pendingRedemptions,
    };
  }

  // Helper methods
  private roundPoints(
    points: number,
    method: 'floor' | 'ceiling' | 'nearest'
  ): number {
    switch (method) {
      case 'floor':
        return Math.floor(points);
      case 'ceiling':
        return Math.ceil(points);
      case 'nearest':
        return Math.round(points);
    }
  }

  private async generateReferralCode(customerId: string): Promise<string> {
    // Generate unique code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private async generateRedemptionCode(): Promise<string> {
    const chars = '0123456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Database methods (implementations needed)
  private async getProgram(id: string): Promise<LoyaltyProgram> {
    throw new Error('Not implemented');
  }

  private async getCustomer(id: string): Promise<any> {
    throw new Error('Not implemented');
  }

  private async getCustomerLoyalty(customerId: string, programId: string): Promise<CustomerLoyalty | null> {
    throw new Error('Not implemented');
  }

  private async getCustomerLoyaltyById(id: string): Promise<CustomerLoyalty> {
    throw new Error('Not implemented');
  }

  private async saveCustomerLoyalty(loyalty: CustomerLoyalty): Promise<void> {
    throw new Error('Not implemented');
  }

  private async savePointsTransaction(tx: PointsTransaction): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getReward(id: string): Promise<Reward> {
    throw new Error('Not implemented');
  }

  private async saveReward(reward: Reward): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getTier(id: string): Promise<LoyaltyTier> {
    throw new Error('Not implemented');
  }

  private async getCustomerRedemptionCount(loyaltyId: string, rewardId: string): Promise<number> {
    throw new Error('Not implemented');
  }

  private async saveRedemption(redemption: Redemption): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getRedemptionByCode(code: string): Promise<Redemption | null> {
    throw new Error('Not implemented');
  }

  private async getLoyaltyByReferralCode(code: string): Promise<CustomerLoyalty | null> {
    throw new Error('Not implemented');
  }

  private async saveReferral(referral: Referral): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getPendingReferral(customerId: string): Promise<Referral | null> {
    throw new Error('Not implemented');
  }

  private async getRecentReferral(referrerId: string, refereeId: string, days: number): Promise<Referral | null> {
    throw new Error('Not implemented');
  }

  private async getMonthlyReferralCount(customerId: string): Promise<number> {
    throw new Error('Not implemented');
  }

  private async getActivePromotions(programId: string): Promise<LoyaltyPromotion[]> {
    throw new Error('Not implemented');
  }

  private async customerQualifiesForPromotion(customerId: string, promo: LoyaltyPromotion): Promise<boolean> {
    throw new Error('Not implemented');
  }

  private async isBirthday(customerId: string): Promise<boolean> {
    throw new Error('Not implemented');
  }

  private async checkPendingReferral(customerId: string): Promise<string | null> {
    throw new Error('Not implemented');
  }

  private async awardReferralBonusToReferee(loyalty: CustomerLoyalty, referralCode: string): Promise<void> {
    throw new Error('Not implemented');
  }

  private async checkReferralQualification(customerId: string, transactionId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getExpiringPoints(date: Date): Promise<PointsTransaction[]> {
    throw new Error('Not implemented');
  }

  private async getNextExpiringPoints(loyaltyId: string): Promise<{ amount: number; expirationDate: Date } | null> {
    throw new Error('Not implemented');
  }

  private async getRecentTransactions(loyaltyId: string, limit: number): Promise<PointsTransaction[]> {
    throw new Error('Not implemented');
  }

  private async getAvailableRewards(programId: string, loyalty: CustomerLoyalty): Promise<Reward[]> {
    throw new Error('Not implemented');
  }

  private async getPendingRedemptions(loyaltyId: string): Promise<Redemption[]> {
    throw new Error('Not implemented');
  }

  // Notification methods
  private async notifyPointsEarned(customerId: string, points: number, balance: number): Promise<void> {
    throw new Error('Not implemented');
  }

  private async notifyRewardRedeemed(customerId: string, reward: Reward, code: string): Promise<void> {
    throw new Error('Not implemented');
  }

  private async notifyTierUpgrade(customerId: string, tier: LoyaltyTier): Promise<void> {
    throw new Error('Not implemented');
  }

  private async notifyReferralComplete(referral: Referral): Promise<void> {
    throw new Error('Not implemented');
  }
}
```

## Database Schema

```sql
-- Loyalty programs
CREATE TABLE loyalty_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES barbershops(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(30) DEFAULT 'points_based',
  status VARCHAR(20) DEFAULT 'active',
  points_config JSONB NOT NULL,
  referral_config JSONB,
  expiration_policy JSONB NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loyalty tiers
CREATE TABLE loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES loyalty_programs(id),
  name VARCHAR(100) NOT NULL,
  level INTEGER NOT NULL,
  threshold INTEGER NOT NULL,
  threshold_type VARCHAR(20) NOT NULL,
  benefits JSONB NOT NULL DEFAULT '[]',
  points_multiplier DECIMAL(3, 2) DEFAULT 1.0,
  color VARCHAR(20),
  icon VARCHAR(255)
);

-- Customer loyalty
CREATE TABLE customer_loyalty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  program_id UUID NOT NULL REFERENCES loyalty_programs(id),
  shop_id UUID NOT NULL REFERENCES barbershops(id),
  status VARCHAR(20) DEFAULT 'active',
  current_tier_id UUID REFERENCES loyalty_tiers(id),
  points_balance INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  lifetime_spend DECIMAL(10, 2) DEFAULT 0,
  visit_count INTEGER DEFAULT 0,
  referral_code VARCHAR(20) UNIQUE,
  referral_count INTEGER DEFAULT 0,
  referral_earnings INTEGER DEFAULT 0,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, program_id)
);

-- Points transactions
CREATE TABLE points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_loyalty_id UUID NOT NULL REFERENCES customer_loyalty(id),
  type VARCHAR(30) NOT NULL,
  points INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  source_type VARCHAR(30),
  source_id VARCHAR(255),
  description TEXT,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rewards
CREATE TABLE loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES loyalty_programs(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(30) NOT NULL,
  points_cost INTEGER NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50),
  image_url TEXT,
  available_quantity INTEGER,
  max_redemptions_per_customer INTEGER,
  tier_required UUID REFERENCES loyalty_tiers(id),
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  terms_and_conditions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Redemptions
CREATE TABLE loyalty_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_loyalty_id UUID NOT NULL REFERENCES customer_loyalty(id),
  reward_id UUID NOT NULL REFERENCES loyalty_rewards(id),
  points_spent INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  code VARCHAR(20) UNIQUE NOT NULL,
  used_at TIMESTAMPTZ,
  used_transaction_id UUID,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals
CREATE TABLE loyalty_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES loyalty_programs(id),
  referrer_customer_id UUID NOT NULL REFERENCES customers(id),
  referee_customer_id UUID NOT NULL REFERENCES customers(id),
  referral_code VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  referrer_points_awarded INTEGER DEFAULT 0,
  referee_points_awarded INTEGER DEFAULT 0,
  qualifying_transaction_id UUID,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promotions
CREATE TABLE loyalty_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES loyalty_programs(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(30) NOT NULL,
  description TEXT,
  points_multiplier DECIMAL(3, 2),
  bonus_points INTEGER,
  conditions JSONB DEFAULT '[]',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  target_tiers UUID[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns
CREATE TABLE loyalty_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES loyalty_programs(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL,
  target JSONB NOT NULL,
  message TEXT NOT NULL,
  subject VARCHAR(255),
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_customer_loyalty_customer ON customer_loyalty(customer_id);
CREATE INDEX idx_customer_loyalty_program ON customer_loyalty(program_id);
CREATE INDEX idx_customer_loyalty_referral_code ON customer_loyalty(referral_code);
CREATE INDEX idx_points_transactions_loyalty ON points_transactions(customer_loyalty_id);
CREATE INDEX idx_points_transactions_expires ON points_transactions(expires_at);
CREATE INDEX idx_points_transactions_created ON points_transactions(created_at DESC);
CREATE INDEX idx_loyalty_redemptions_code ON loyalty_redemptions(code);
CREATE INDEX idx_loyalty_redemptions_status ON loyalty_redemptions(status);
CREATE INDEX idx_loyalty_referrals_referrer ON loyalty_referrals(referrer_customer_id);
CREATE INDEX idx_loyalty_referrals_referee ON loyalty_referrals(referee_customer_id);
CREATE INDEX idx_loyalty_promotions_dates ON loyalty_promotions(start_date, end_date);
```

## API Endpoints

```typescript
// POST /api/loyalty/enroll
// Enroll customer
{
  request: { customerId: string, programId: string },
  response: CustomerLoyalty
}

// GET /api/loyalty/customer/:customerId
// Get loyalty summary
{
  query: { programId: string },
  response: { loyalty, recentTransactions, availableRewards, promotions, redemptions }
}

// POST /api/loyalty/points/award
// Award points from purchase
{
  request: {
    customerId: string,
    transactionId: string,
    amount: number,
    serviceAmount: number,
    productAmount: number
  },
  response: PointsTransaction
}

// GET /api/loyalty/rewards
// Get available rewards
{
  query: { programId: string },
  response: { rewards: Reward[] }
}

// POST /api/loyalty/redeem
// Redeem reward
{
  request: { customerId: string, rewardId: string },
  response: Redemption
}

// POST /api/loyalty/redemption/use
// Use redemption code at POS
{
  request: { code: string, transactionId: string },
  response: { redemption: Redemption, reward: Reward }
}

// POST /api/loyalty/referral
// Process referral
{
  request: { referralCode: string, newCustomerId: string },
  response: Referral
}

// GET /api/loyalty/tiers
// Get program tiers
{
  query: { programId: string },
  response: { tiers: LoyaltyTier[] }
}

// GET /api/loyalty/promotions
// Get active promotions
{
  query: { programId: string },
  response: { promotions: LoyaltyPromotion[] }
}
```

## Related Skills
- `consumer-wallet-standard.md` - Wallet integration for points
- `barbershop-pos-standard.md` - POS integration for earning/redeeming
- `barbershop-booking-standard.md` - Loyalty points from appointments

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-15
- **Domain**: Barbershop
