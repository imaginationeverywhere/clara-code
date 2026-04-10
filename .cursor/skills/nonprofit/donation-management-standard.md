# Donation Management Standard

## Overview
Comprehensive donation processing and management for nonprofit organizations. Handles one-time and recurring donations, pledge management, donor recognition, tax receipts, fundraising campaigns, and gift matching programs.

## Domain Context
- **Primary Projects**: Quik Giving, Nonprofit platforms
- **Related Domains**: Payments, CRM, Campaigns
- **Key Integration**: Stripe (payments), SendGrid (receipts), CRM systems, Matching gift databases

## Core Interfaces

```typescript
interface Donation {
  id: string;
  tenantId: string;
  donorId: string;
  donor: DonorInfo;
  type: DonationType;
  amount: number;
  currency: string;
  status: DonationStatus;
  designation?: DonationDesignation;
  campaign?: CampaignInfo;
  appeal?: AppealInfo;
  tribute?: TributeInfo;
  matching?: MatchingInfo;
  paymentMethod: PaymentMethodInfo;
  processingFee: number;
  netAmount: number;
  taxDeductible: boolean;
  taxDeductibleAmount: number;
  receiptSent: boolean;
  receiptId?: string;
  acknowledgedAt?: Date;
  notes?: string;
  source: DonationSource;
  createdAt: Date;
  updatedAt: Date;
}

type DonationType = 'one_time' | 'recurring' | 'pledge_payment' | 'matching' | 'in_kind';

type DonationStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'disputed';

interface DonorInfo {
  id: string;
  type: 'individual' | 'organization' | 'foundation' | 'corporation';
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  email: string;
  phone?: string;
  address?: Address;
  isAnonymous: boolean;
  communicationPreferences: CommunicationPreferences;
}

interface DonationDesignation {
  fundId: string;
  fundName: string;
  restrictions?: string;
  projectId?: string;
}

interface TributeInfo {
  type: 'in_honor' | 'in_memory';
  honoreeName: string;
  notifyName?: string;
  notifyEmail?: string;
  notifyAddress?: Address;
  message?: string;
  notificationSent?: boolean;
}

interface MatchingInfo {
  employerId: string;
  employerName: string;
  matchRatio: number;
  maxMatch?: number;
  matchedAmount: number;
  matchStatus: 'pending' | 'submitted' | 'approved' | 'received' | 'declined';
  matchRequestDate?: Date;
  matchReceivedDate?: Date;
}

interface RecurringDonation {
  id: string;
  donorId: string;
  status: RecurringStatus;
  amount: number;
  currency: string;
  frequency: DonationFrequency;
  designation?: DonationDesignation;
  startDate: Date;
  nextDonationDate: Date;
  endDate?: Date;
  paymentMethodId: string;
  stripeSubscriptionId?: string;
  totalDonated: number;
  donationCount: number;
  failedAttempts: number;
  lastDonationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

type RecurringStatus = 'active' | 'paused' | 'cancelled' | 'failed' | 'completed';
type DonationFrequency = 'weekly' | 'monthly' | 'quarterly' | 'annually';

interface Pledge {
  id: string;
  donorId: string;
  campaignId?: string;
  totalAmount: number;
  amountPaid: number;
  amountRemaining: number;
  status: PledgeStatus;
  paymentSchedule: PledgePayment[];
  startDate: Date;
  endDate: Date;
  remindersEnabled: boolean;
  notes?: string;
  createdAt: Date;
}

type PledgeStatus = 'pending' | 'active' | 'fulfilled' | 'defaulted' | 'cancelled';

interface PledgePayment {
  id: string;
  amount: number;
  dueDate: Date;
  status: 'scheduled' | 'paid' | 'overdue' | 'waived';
  paidDate?: Date;
  donationId?: string;
  reminderSent?: boolean;
}

interface FundraisingCampaign {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  type: CampaignType;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  goal: number;
  raised: number;
  donorCount: number;
  startDate: Date;
  endDate: Date;
  designation?: DonationDesignation;
  thermometerEnabled: boolean;
  matchingEnabled: boolean;
  matchingDetails?: CampaignMatching;
  pageUrl?: string;
  heroImage?: string;
  story?: string;
  updates: CampaignUpdate[];
  createdAt: Date;
}

type CampaignType =
  | 'annual_fund'
  | 'capital'
  | 'endowment'
  | 'emergency'
  | 'peer_to_peer'
  | 'crowdfunding'
  | 'event'
  | 'membership';

interface CampaignMatching {
  matcherId: string;
  matcherName: string;
  matchRatio: number;
  maxMatch: number;
  matchedAmount: number;
  startDate: Date;
  endDate: Date;
}

interface CampaignUpdate {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  postedAt: Date;
  postedBy: string;
}

interface DonorProfile {
  id: string;
  tenantId: string;
  contact: DonorContact;
  giving: GivingHistory;
  engagement: EngagementMetrics;
  recognition: RecognitionLevel;
  interests: string[];
  relationships: DonorRelationship[];
  communications: CommunicationLog[];
  notes: DonorNote[];
  createdAt: Date;
  updatedAt: Date;
}

interface GivingHistory {
  lifetimeGiving: number;
  thisYearGiving: number;
  lastYearGiving: number;
  firstGiftDate?: Date;
  lastGiftDate?: Date;
  largestGift: number;
  averageGift: number;
  donationCount: number;
  recurringDonations: number;
  pledges: number;
  lybunt: boolean; // Last Year But Unfortunately Not This
  sybunt: boolean; // Some Year But Unfortunately Not This
}

interface RecognitionLevel {
  tier: string;
  tierThreshold: number;
  nextTier?: string;
  nextTierThreshold?: number;
  amountToNextTier?: number;
  benefits: string[];
  recognitionWall: boolean;
  annualReportListing: boolean;
}

interface TaxReceipt {
  id: string;
  donationId?: string;
  donorId: string;
  year: number;
  receiptNumber: string;
  receiptDate: Date;
  donations: ReceiptDonation[];
  totalAmount: number;
  taxDeductibleAmount: number;
  goodsProvided: boolean;
  goodsValue?: number;
  goodsDescription?: string;
  organizationInfo: OrganizationTaxInfo;
  pdfUrl?: string;
  sentAt?: Date;
  sentTo: string;
}

interface ReceiptDonation {
  donationId: string;
  date: Date;
  amount: number;
  designation?: string;
  paymentMethod: string;
}

interface DonationSource {
  channel: 'online' | 'mobile' | 'mail' | 'phone' | 'event' | 'in_person' | 'text_to_give';
  referrer?: string;
  utm?: UTMParameters;
  appealCode?: string;
  solicitorId?: string;
}
```

## Service Implementation

```typescript
class DonationManagementService {
  // Donation processing
  async processDonation(input: CreateDonationInput): Promise<Donation>;
  async refundDonation(donationId: string, reason: string): Promise<Donation>;
  async updateDonation(donationId: string, updates: UpdateDonationInput): Promise<Donation>;
  async getDonation(donationId: string): Promise<Donation>;

  // Recurring donations
  async createRecurringDonation(input: CreateRecurringInput): Promise<RecurringDonation>;
  async updateRecurringDonation(recurringId: string, updates: UpdateRecurringInput): Promise<RecurringDonation>;
  async pauseRecurringDonation(recurringId: string): Promise<RecurringDonation>;
  async cancelRecurringDonation(recurringId: string, reason?: string): Promise<RecurringDonation>;
  async processRecurringDonations(): Promise<ProcessingResult>;

  // Pledges
  async createPledge(input: CreatePledgeInput): Promise<Pledge>;
  async recordPledgePayment(pledgeId: string, payment: PledgePaymentInput): Promise<Pledge>;
  async sendPledgeReminders(): Promise<void>;
  async getOverduePledges(): Promise<Pledge[]>;

  // Campaigns
  async createCampaign(input: CreateCampaignInput): Promise<FundraisingCampaign>;
  async updateCampaign(campaignId: string, updates: UpdateCampaignInput): Promise<FundraisingCampaign>;
  async postCampaignUpdate(campaignId: string, update: CampaignUpdate): Promise<void>;
  async getCampaignProgress(campaignId: string): Promise<CampaignProgress>;

  // Donor management
  async createDonor(input: CreateDonorInput): Promise<DonorProfile>;
  async updateDonor(donorId: string, updates: UpdateDonorInput): Promise<DonorProfile>;
  async mergeDonors(primaryId: string, duplicateIds: string[]): Promise<DonorProfile>;
  async getDonorGivingHistory(donorId: string): Promise<GivingHistory>;
  async calculateRecognitionLevel(donorId: string): Promise<RecognitionLevel>;

  // Matching gifts
  async submitMatchRequest(donationId: string): Promise<MatchingInfo>;
  async recordMatchReceived(matchId: string, amount: number): Promise<void>;
  async searchMatchingEmployers(query: string): Promise<MatchingEmployer[]>;

  // Receipts and acknowledgments
  async generateReceipt(donationId: string): Promise<TaxReceipt>;
  async generateYearEndReceipt(donorId: string, year: number): Promise<TaxReceipt>;
  async sendAcknowledgment(donationId: string, templateId?: string): Promise<void>;
  async sendBulkAcknowledgments(donationIds: string[]): Promise<BulkSendResult>;

  // Reporting
  async getDonationReport(dateRange: DateRange, filters?: DonationFilters): Promise<DonationReport>;
  async getCampaignReport(campaignId: string): Promise<CampaignReport>;
  async getDonorRetentionReport(year: number): Promise<RetentionReport>;
  async getLYBUNTReport(): Promise<DonorProfile[]>;
}
```

## Database Schema

```sql
CREATE TABLE donors (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  donor_type VARCHAR(30) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  organization_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address JSONB,
  is_anonymous BOOLEAN DEFAULT false,
  communication_preferences JSONB,
  lifetime_giving DECIMAL(12,2) DEFAULT 0,
  this_year_giving DECIMAL(12,2) DEFAULT 0,
  first_gift_date DATE,
  last_gift_date DATE,
  largest_gift DECIMAL(10,2) DEFAULT 0,
  donation_count INTEGER DEFAULT 0,
  recognition_tier VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE donations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  donor_id UUID NOT NULL REFERENCES donors(id),
  donation_type VARCHAR(30) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(30) DEFAULT 'pending',
  designation_fund_id UUID,
  designation_fund_name VARCHAR(255),
  campaign_id UUID,
  appeal_code VARCHAR(50),
  tribute_type VARCHAR(20),
  tribute_honoree_name VARCHAR(255),
  tribute_notify_name VARCHAR(255),
  tribute_notify_email VARCHAR(255),
  matching_employer_id VARCHAR(100),
  matching_employer_name VARCHAR(255),
  match_ratio DECIMAL(5,2),
  matched_amount DECIMAL(10,2),
  match_status VARCHAR(30),
  payment_method_type VARCHAR(30),
  payment_method_last_four VARCHAR(4),
  stripe_payment_intent_id VARCHAR(100),
  processing_fee DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2),
  tax_deductible BOOLEAN DEFAULT true,
  tax_deductible_amount DECIMAL(10,2),
  receipt_sent BOOLEAN DEFAULT false,
  receipt_id UUID,
  acknowledged_at TIMESTAMPTZ,
  source_channel VARCHAR(30),
  source_referrer VARCHAR(255),
  source_utm JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE recurring_donations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  donor_id UUID NOT NULL REFERENCES donors(id),
  status VARCHAR(30) DEFAULT 'active',
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  frequency VARCHAR(20) NOT NULL,
  designation_fund_id UUID,
  start_date DATE NOT NULL,
  next_donation_date DATE NOT NULL,
  end_date DATE,
  payment_method_id UUID,
  stripe_subscription_id VARCHAR(100),
  total_donated DECIMAL(12,2) DEFAULT 0,
  donation_count INTEGER DEFAULT 0,
  failed_attempts INTEGER DEFAULT 0,
  last_donation_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pledges (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  donor_id UUID NOT NULL REFERENCES donors(id),
  campaign_id UUID,
  total_amount DECIMAL(12,2) NOT NULL,
  amount_paid DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(30) DEFAULT 'pending',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reminders_enabled BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pledge_payments (
  id UUID PRIMARY KEY,
  pledge_id UUID NOT NULL REFERENCES pledges(id),
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(30) DEFAULT 'scheduled',
  paid_date DATE,
  donation_id UUID REFERENCES donations(id),
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fundraising_campaigns (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(50) NOT NULL,
  status VARCHAR(30) DEFAULT 'draft',
  goal DECIMAL(12,2) NOT NULL,
  raised DECIMAL(12,2) DEFAULT 0,
  donor_count INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  designation_fund_id UUID,
  thermometer_enabled BOOLEAN DEFAULT true,
  matching_enabled BOOLEAN DEFAULT false,
  matching_details JSONB,
  page_url VARCHAR(255),
  hero_image TEXT,
  story TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE campaign_updates (
  id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES fundraising_campaigns(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  posted_by UUID NOT NULL,
  posted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tax_receipts (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  donor_id UUID NOT NULL REFERENCES donors(id),
  donation_id UUID REFERENCES donations(id),
  receipt_year INTEGER NOT NULL,
  receipt_number VARCHAR(50) NOT NULL,
  receipt_date DATE NOT NULL,
  donations JSONB NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  tax_deductible_amount DECIMAL(12,2) NOT NULL,
  goods_provided BOOLEAN DEFAULT false,
  goods_value DECIMAL(10,2),
  goods_description TEXT,
  organization_info JSONB NOT NULL,
  pdf_url TEXT,
  sent_at TIMESTAMPTZ,
  sent_to VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE designation_funds (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  fund_type VARCHAR(50),
  restrictions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_donors_tenant ON donors(tenant_id);
CREATE INDEX idx_donors_email ON donors(email);
CREATE INDEX idx_donations_tenant_date ON donations(tenant_id, created_at);
CREATE INDEX idx_donations_donor ON donations(donor_id);
CREATE INDEX idx_donations_campaign ON donations(campaign_id);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_recurring_donor ON recurring_donations(donor_id);
CREATE INDEX idx_recurring_next_date ON recurring_donations(next_donation_date);
CREATE INDEX idx_pledges_donor ON pledges(donor_id);
CREATE INDEX idx_pledge_payments_due ON pledge_payments(due_date, status);
CREATE INDEX idx_campaigns_tenant_status ON fundraising_campaigns(tenant_id, status);
CREATE INDEX idx_receipts_donor_year ON tax_receipts(donor_id, receipt_year);
```

## API Endpoints

```typescript
// POST /api/donations - Process donation
// GET /api/donations/:id - Get donation
// PUT /api/donations/:id - Update donation
// POST /api/donations/:id/refund - Refund donation
// POST /api/donations/:id/receipt - Generate receipt
// POST /api/recurring - Create recurring donation
// PUT /api/recurring/:id - Update recurring donation
// POST /api/recurring/:id/pause - Pause recurring
// POST /api/recurring/:id/cancel - Cancel recurring
// POST /api/pledges - Create pledge
// POST /api/pledges/:id/payment - Record pledge payment
// GET /api/pledges/overdue - Get overdue pledges
// POST /api/campaigns - Create campaign
// GET /api/campaigns/:id - Get campaign
// PUT /api/campaigns/:id - Update campaign
// POST /api/campaigns/:id/updates - Post campaign update
// GET /api/donors - List donors
// GET /api/donors/:id - Get donor profile
// PUT /api/donors/:id - Update donor
// POST /api/donors/merge - Merge duplicate donors
// GET /api/donors/:id/history - Get giving history
// POST /api/matching/submit - Submit match request
// GET /api/matching/employers - Search matching employers
// GET /api/reports/donations - Donation report
// GET /api/reports/retention - Retention report
```

## Related Skills
- `volunteer-management-standard.md` - Volunteer coordination
- `campaign-management-standard.md` - Campaign features
- `consumer-wallet-standard.md` - Payment processing

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-15
- **Domain**: Nonprofit
