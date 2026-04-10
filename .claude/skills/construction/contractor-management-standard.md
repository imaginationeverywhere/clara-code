# Contractor Management Standard

## Overview
Subcontractor and independent contractor management for construction and service industries. Handles contractor onboarding, credential verification, insurance tracking, bid management, work orders, and compliance documentation.

## Domain Context
- **Primary Projects**: Pink-Collar-Contractors, Quik Construction, Service platforms
- **Related Domains**: Construction Projects, Payments, Compliance
- **Key Integration**: Background check APIs, Insurance verification, License databases, DocuSign

## Core Interfaces

```typescript
interface Contractor {
  id: string;
  tenantId: string;
  companyName?: string;
  contactFirstName: string;
  contactLastName: string;
  email: string;
  phone: string;
  type: ContractorType;
  status: ContractorStatus;
  trades: Trade[];
  serviceArea: ServiceArea;
  credentials: ContractorCredentials;
  insurance: InsuranceInfo[];
  licenses: LicenseInfo[];
  certifications: Certification[];
  bankingInfo?: BankingInfo;
  taxInfo: TaxInfo;
  rating: ContractorRating;
  performanceMetrics: PerformanceMetrics;
  documents: ContractorDocument[];
  notes: string[];
  createdAt: Date;
  updatedAt: Date;
}

type ContractorType = 'individual' | 'company' | 'partnership' | 'llc' | 'corporation';

type ContractorStatus =
  | 'applicant'
  | 'pending_verification'
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'blacklisted';

interface Trade {
  id: string;
  name: string;
  category: TradeCategory;
  experienceYears: number;
  isPrimary: boolean;
  hourlyRate?: number;
}

type TradeCategory =
  | 'general'
  | 'electrical'
  | 'plumbing'
  | 'hvac'
  | 'carpentry'
  | 'masonry'
  | 'roofing'
  | 'painting'
  | 'flooring'
  | 'landscaping'
  | 'drywall'
  | 'tile'
  | 'concrete'
  | 'demolition'
  | 'cleaning';

interface ServiceArea {
  type: 'radius' | 'regions' | 'nationwide';
  centerZip?: string;
  radiusMiles?: number;
  regions?: string[];
  excludedAreas?: string[];
}

interface ContractorCredentials {
  backgroundCheckStatus: 'pending' | 'passed' | 'failed' | 'expired';
  backgroundCheckDate?: Date;
  backgroundCheckExpiry?: Date;
  drugTestStatus?: 'pending' | 'passed' | 'failed' | 'expired';
  drugTestDate?: Date;
  identityVerified: boolean;
  identityVerifiedDate?: Date;
  references: Reference[];
  referencesVerified: boolean;
}

interface InsuranceInfo {
  id: string;
  type: InsuranceType;
  provider: string;
  policyNumber: string;
  coverageAmount: number;
  deductible?: number;
  effectiveDate: Date;
  expirationDate: Date;
  certificateUrl?: string;
  verified: boolean;
  verifiedDate?: Date;
  autoRenewal: boolean;
}

type InsuranceType =
  | 'general_liability'
  | 'workers_compensation'
  | 'professional_liability'
  | 'auto'
  | 'umbrella'
  | 'bonding';

interface LicenseInfo {
  id: string;
  type: string;
  number: string;
  state: string;
  issuedDate: Date;
  expirationDate: Date;
  status: 'active' | 'expired' | 'revoked' | 'pending_renewal';
  verified: boolean;
  verifiedDate?: Date;
  verificationSource?: string;
}

interface Certification {
  id: string;
  name: string;
  issuingBody: string;
  certificationNumber?: string;
  issuedDate: Date;
  expirationDate?: Date;
  documentUrl?: string;
}

interface TaxInfo {
  taxIdType: 'ssn' | 'ein';
  taxIdLastFour: string;
  w9OnFile: boolean;
  w9Date?: Date;
  taxClassification: string;
  form1099Eligible: boolean;
}

interface ContractorRating {
  overall: number;
  qualityOfWork: number;
  timeliness: number;
  communication: number;
  professionalism: number;
  totalReviews: number;
  reviews: ContractorReview[];
}

interface ContractorReview {
  id: string;
  projectId: string;
  reviewerId: string;
  rating: number;
  categories: Record<string, number>;
  comment?: string;
  response?: string;
  createdAt: Date;
}

interface PerformanceMetrics {
  projectsCompleted: number;
  projectsInProgress: number;
  onTimeCompletion: number;
  averageResponseTime: number;
  callbackRate: number;
  totalRevenue: number;
  lastProjectDate?: Date;
}

interface BidRequest {
  id: string;
  tenantId: string;
  projectId: string;
  project: ProjectSummary;
  status: BidRequestStatus;
  scope: BidScope;
  invitedContractors: string[];
  respondedContractors: string[];
  deadline: Date;
  bids: Bid[];
  selectedBidId?: string;
  createdAt: Date;
}

type BidRequestStatus = 'draft' | 'open' | 'closed' | 'awarded' | 'cancelled';

interface BidScope {
  description: string;
  tradeRequired: TradeCategory;
  startDate: Date;
  endDate: Date;
  documents: string[];
  requirements: string[];
  estimatedBudget?: number;
}

interface Bid {
  id: string;
  bidRequestId: string;
  contractorId: string;
  contractor: ContractorSummary;
  status: BidStatus;
  amount: number;
  breakdown: BidBreakdown;
  proposedSchedule: ProposedSchedule;
  inclusions: string[];
  exclusions: string[];
  terms: string;
  validUntil: Date;
  submittedAt: Date;
  notes?: string;
}

type BidStatus = 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';

interface BidBreakdown {
  labor: number;
  materials: number;
  equipment: number;
  overhead: number;
  profit: number;
  contingency?: number;
}

interface WorkOrder {
  id: string;
  tenantId: string;
  contractorId: string;
  projectId?: string;
  status: WorkOrderStatus;
  type: 'scheduled' | 'emergency' | 'warranty' | 'change_order';
  scope: WorkOrderScope;
  schedule: WorkOrderSchedule;
  pricing: WorkOrderPricing;
  completion?: WorkOrderCompletion;
  signatures: WorkOrderSignatures;
  communications: Communication[];
  createdAt: Date;
  updatedAt: Date;
}

type WorkOrderStatus =
  | 'draft'
  | 'sent'
  | 'accepted'
  | 'scheduled'
  | 'in_progress'
  | 'pending_inspection'
  | 'completed'
  | 'disputed'
  | 'cancelled';

interface WorkOrderScope {
  description: string;
  tasks: WorkOrderTask[];
  materials: WorkOrderMaterial[];
  documents: string[];
  siteAccess: string;
  specialInstructions?: string;
}

interface WorkOrderPricing {
  type: 'fixed' | 'time_and_materials' | 'cost_plus';
  fixedAmount?: number;
  hourlyRate?: number;
  estimatedHours?: number;
  materialsBudget?: number;
  markup?: number;
  notToExceed?: number;
  paymentTerms: string;
  retainage?: number;
}

interface WorkOrderCompletion {
  completedDate: Date;
  hoursWorked: number;
  materialsUsed: MaterialUsed[];
  photos: string[];
  notes: string;
  issues?: string[];
  customerSignature?: string;
  customerSignedAt?: Date;
}
```

## Service Implementation

```typescript
class ContractorManagementService {
  // Contractor onboarding
  async createContractor(input: CreateContractorInput): Promise<Contractor>;
  async updateContractor(contractorId: string, updates: UpdateContractorInput): Promise<Contractor>;
  async submitForVerification(contractorId: string): Promise<void>;
  async activateContractor(contractorId: string): Promise<Contractor>;
  async suspendContractor(contractorId: string, reason: string): Promise<Contractor>;

  // Credential verification
  async initiateBackgroundCheck(contractorId: string): Promise<BackgroundCheckResult>;
  async verifyLicense(contractorId: string, licenseId: string): Promise<LicenseVerification>;
  async verifyInsurance(contractorId: string, insuranceId: string): Promise<InsuranceVerification>;
  async checkCredentialExpiry(daysAhead: number): Promise<ExpiringCredential[]>;

  // Search and matching
  async searchContractors(criteria: SearchCriteria): Promise<ContractorSearchResult[]>;
  async findContractorsForProject(projectId: string): Promise<ContractorMatch[]>;
  async getContractorsByTrade(trade: TradeCategory, location?: string): Promise<Contractor[]>;

  // Bid management
  async createBidRequest(input: CreateBidRequestInput): Promise<BidRequest>;
  async inviteContractors(bidRequestId: string, contractorIds: string[]): Promise<void>;
  async submitBid(bidRequestId: string, bid: SubmitBidInput): Promise<Bid>;
  async awardBid(bidRequestId: string, bidId: string): Promise<void>;
  async rejectBid(bidId: string, reason: string): Promise<void>;

  // Work orders
  async createWorkOrder(input: CreateWorkOrderInput): Promise<WorkOrder>;
  async sendWorkOrder(workOrderId: string): Promise<void>;
  async acceptWorkOrder(workOrderId: string): Promise<WorkOrder>;
  async updateWorkOrderStatus(workOrderId: string, status: WorkOrderStatus): Promise<WorkOrder>;
  async completeWorkOrder(workOrderId: string, completion: WorkOrderCompletion): Promise<WorkOrder>;

  // Ratings and reviews
  async addReview(contractorId: string, review: CreateReviewInput): Promise<ContractorReview>;
  async respondToReview(reviewId: string, response: string): Promise<void>;
  async calculateRating(contractorId: string): Promise<ContractorRating>;

  // Compliance
  async getComplianceStatus(contractorId: string): Promise<ComplianceStatus>;
  async generateComplianceReport(contractorId: string): Promise<ComplianceReport>;
  async sendCredentialReminder(contractorId: string, credentialType: string): Promise<void>;

  // Payments
  async getContractorEarnings(contractorId: string, dateRange: DateRange): Promise<EarningsReport>;
  async generatePaymentSummary(contractorId: string, year: number): Promise<PaymentSummary>;
  async generate1099(contractorId: string, year: number): Promise<Form1099>;
}
```

## Database Schema

```sql
CREATE TABLE contractors (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  company_name VARCHAR(255),
  contact_first_name VARCHAR(100) NOT NULL,
  contact_last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  contractor_type VARCHAR(30) NOT NULL,
  status VARCHAR(30) DEFAULT 'applicant',
  service_area JSONB,
  background_check_status VARCHAR(30),
  background_check_date DATE,
  background_check_expiry DATE,
  identity_verified BOOLEAN DEFAULT false,
  references_verified BOOLEAN DEFAULT false,
  tax_id_type VARCHAR(10),
  tax_id_last_four VARCHAR(4),
  w9_on_file BOOLEAN DEFAULT false,
  w9_date DATE,
  tax_classification VARCHAR(50),
  form_1099_eligible BOOLEAN DEFAULT true,
  overall_rating DECIMAL(3,2),
  total_reviews INTEGER DEFAULT 0,
  projects_completed INTEGER DEFAULT 0,
  stripe_account_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contractor_trades (
  id UUID PRIMARY KEY,
  contractor_id UUID NOT NULL REFERENCES contractors(id),
  trade_category VARCHAR(50) NOT NULL,
  trade_name VARCHAR(100) NOT NULL,
  experience_years INTEGER,
  is_primary BOOLEAN DEFAULT false,
  hourly_rate DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contractor_licenses (
  id UUID PRIMARY KEY,
  contractor_id UUID NOT NULL REFERENCES contractors(id),
  license_type VARCHAR(100) NOT NULL,
  license_number VARCHAR(100) NOT NULL,
  state VARCHAR(10) NOT NULL,
  issued_date DATE,
  expiration_date DATE NOT NULL,
  status VARCHAR(30) DEFAULT 'active',
  verified BOOLEAN DEFAULT false,
  verified_date DATE,
  verification_source VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contractor_insurance (
  id UUID PRIMARY KEY,
  contractor_id UUID NOT NULL REFERENCES contractors(id),
  insurance_type VARCHAR(50) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  policy_number VARCHAR(100) NOT NULL,
  coverage_amount DECIMAL(12,2) NOT NULL,
  deductible DECIMAL(10,2),
  effective_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  certificate_url TEXT,
  verified BOOLEAN DEFAULT false,
  verified_date DATE,
  auto_renewal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contractor_certifications (
  id UUID PRIMARY KEY,
  contractor_id UUID NOT NULL REFERENCES contractors(id),
  certification_name VARCHAR(255) NOT NULL,
  issuing_body VARCHAR(255) NOT NULL,
  certification_number VARCHAR(100),
  issued_date DATE NOT NULL,
  expiration_date DATE,
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bid_requests (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  project_id UUID,
  status VARCHAR(30) DEFAULT 'draft',
  trade_required VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  estimated_budget DECIMAL(12,2),
  deadline TIMESTAMPTZ NOT NULL,
  documents TEXT[],
  requirements TEXT[],
  invited_contractors UUID[],
  selected_bid_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bids (
  id UUID PRIMARY KEY,
  bid_request_id UUID NOT NULL REFERENCES bid_requests(id),
  contractor_id UUID NOT NULL REFERENCES contractors(id),
  status VARCHAR(30) DEFAULT 'submitted',
  amount DECIMAL(12,2) NOT NULL,
  labor_cost DECIMAL(10,2),
  materials_cost DECIMAL(10,2),
  equipment_cost DECIMAL(10,2),
  overhead_cost DECIMAL(10,2),
  profit_amount DECIMAL(10,2),
  proposed_start_date DATE,
  proposed_end_date DATE,
  inclusions TEXT[],
  exclusions TEXT[],
  terms TEXT,
  valid_until DATE,
  notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE work_orders (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  contractor_id UUID NOT NULL REFERENCES contractors(id),
  project_id UUID,
  status VARCHAR(30) DEFAULT 'draft',
  work_order_type VARCHAR(30) NOT NULL,
  description TEXT NOT NULL,
  tasks JSONB DEFAULT '[]',
  materials JSONB DEFAULT '[]',
  site_address JSONB,
  scheduled_start DATE,
  scheduled_end DATE,
  actual_start DATE,
  actual_end DATE,
  pricing_type VARCHAR(30) NOT NULL,
  fixed_amount DECIMAL(10,2),
  hourly_rate DECIMAL(10,2),
  estimated_hours DECIMAL(8,2),
  materials_budget DECIMAL(10,2),
  not_to_exceed DECIMAL(10,2),
  payment_terms VARCHAR(100),
  retainage_percent DECIMAL(5,2),
  hours_worked DECIMAL(8,2),
  completion_notes TEXT,
  completion_photos TEXT[],
  contractor_signature TEXT,
  contractor_signed_at TIMESTAMPTZ,
  customer_signature TEXT,
  customer_signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contractor_reviews (
  id UUID PRIMARY KEY,
  contractor_id UUID NOT NULL REFERENCES contractors(id),
  project_id UUID,
  reviewer_id UUID NOT NULL,
  overall_rating DECIMAL(3,2) NOT NULL,
  quality_rating DECIMAL(3,2),
  timeliness_rating DECIMAL(3,2),
  communication_rating DECIMAL(3,2),
  professionalism_rating DECIMAL(3,2),
  comment TEXT,
  contractor_response TEXT,
  response_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contractors_tenant_status ON contractors(tenant_id, status);
CREATE INDEX idx_contractors_rating ON contractors(overall_rating DESC);
CREATE INDEX idx_trades_contractor ON contractor_trades(contractor_id);
CREATE INDEX idx_trades_category ON contractor_trades(trade_category);
CREATE INDEX idx_licenses_contractor ON contractor_licenses(contractor_id);
CREATE INDEX idx_licenses_expiry ON contractor_licenses(expiration_date);
CREATE INDEX idx_insurance_contractor ON contractor_insurance(contractor_id);
CREATE INDEX idx_insurance_expiry ON contractor_insurance(expiration_date);
CREATE INDEX idx_bids_request ON bids(bid_request_id);
CREATE INDEX idx_bids_contractor ON bids(contractor_id);
CREATE INDEX idx_work_orders_contractor ON work_orders(contractor_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_reviews_contractor ON contractor_reviews(contractor_id);
```

## API Endpoints

```typescript
// GET /api/contractors - List contractors
// GET /api/contractors/:id - Get contractor details
// POST /api/contractors - Create contractor
// PUT /api/contractors/:id - Update contractor
// POST /api/contractors/:id/verify - Submit for verification
// POST /api/contractors/:id/activate - Activate contractor
// POST /api/contractors/:id/suspend - Suspend contractor
// GET /api/contractors/:id/compliance - Get compliance status
// POST /api/contractors/:id/licenses - Add license
// POST /api/contractors/:id/insurance - Add insurance
// POST /api/contractors/:id/certifications - Add certification
// GET /api/contractors/search - Search contractors
// POST /api/bid-requests - Create bid request
// GET /api/bid-requests/:id - Get bid request
// POST /api/bid-requests/:id/invite - Invite contractors
// POST /api/bids - Submit bid
// POST /api/bids/:id/award - Award bid
// POST /api/work-orders - Create work order
// GET /api/work-orders/:id - Get work order
// PUT /api/work-orders/:id/status - Update status
// POST /api/work-orders/:id/complete - Complete work order
// POST /api/contractors/:id/reviews - Add review
// GET /api/contractors/:id/earnings - Get earnings report
```

## Related Skills
- `construction-project-standard.md` - Project management
- `gig-worker-payments-standard.md` - Contractor payments
- `equipment-rental-standard.md` - Equipment for contractors

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-15
- **Domain**: Construction
