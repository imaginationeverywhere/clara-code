# Tenant Management Standard

## Overview
Multi-tenant SaaS platform management for the Quik Nation ecosystem. Handles tenant provisioning, configuration, billing, feature flags, resource isolation, usage tracking, and tenant lifecycle management with proper PLATFORM_OWNER vs SITE_OWNER separation.

## Domain Context
- **Primary Projects**: All Quik Nation platforms (as infrastructure)
- **Related Domains**: Billing, Authentication, Configuration
- **Key Integration**: Stripe (billing), Clerk (auth), AWS (infrastructure), Feature flags

## Core Interfaces

```typescript
interface Tenant {
  id: string;
  slug: string;
  name: string;
  type: TenantType;
  status: TenantStatus;
  owner: TenantOwner;
  subscription: TenantSubscription;
  configuration: TenantConfiguration;
  branding: TenantBranding;
  domains: TenantDomain[];
  features: FeatureFlags;
  limits: TenantLimits;
  usage: TenantUsage;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  activatedAt?: Date;
  suspendedAt?: Date;
}

type TenantType = 'trial' | 'starter' | 'professional' | 'enterprise' | 'custom';

type TenantStatus =
  | 'pending_setup'
  | 'active'
  | 'suspended'
  | 'past_due'
  | 'cancelled'
  | 'archived';

interface TenantOwner {
  userId: string;
  email: string;
  name: string;
  phone?: string;
  company?: string;
  role: 'site_owner';
}

interface TenantSubscription {
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  billingCycle: 'monthly' | 'annual';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  mrr: number;
  trialEndsAt?: Date;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: Date;
}

type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'unpaid'
  | 'cancelled'
  | 'paused';

interface TenantConfiguration {
  timezone: string;
  locale: string;
  currency: string;
  dateFormat: string;
  notifications: NotificationConfig;
  integrations: IntegrationConfig[];
  security: SecurityConfig;
  customFields: CustomFieldDefinition[];
}

interface NotificationConfig {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  webhookUrl?: string;
  adminNotifications: string[];
}

interface SecurityConfig {
  mfaRequired: boolean;
  ssoEnabled: boolean;
  ssoProvider?: string;
  ipWhitelist?: string[];
  sessionTimeout: number;
  passwordPolicy: PasswordPolicy;
}

interface TenantBranding {
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  fontFamily?: string;
  customCss?: string;
  emailTemplate?: string;
  footerText?: string;
}

interface TenantDomain {
  id: string;
  domain: string;
  type: 'primary' | 'alias' | 'custom';
  status: 'pending' | 'verified' | 'failed';
  sslStatus: 'pending' | 'active' | 'expired';
  verificationToken?: string;
  verifiedAt?: Date;
}

interface FeatureFlags {
  [key: string]: FeatureFlag;
}

interface FeatureFlag {
  enabled: boolean;
  variant?: string;
  config?: Record<string, any>;
  overrideReason?: string;
}

interface TenantLimits {
  users: ResourceLimit;
  storage: ResourceLimit;
  apiCalls: ResourceLimit;
  bandwidth: ResourceLimit;
  [resource: string]: ResourceLimit;
}

interface ResourceLimit {
  limit: number;
  used: number;
  unit: string;
  resetPeriod?: 'monthly' | 'daily' | 'never';
  lastReset?: Date;
  hardLimit: boolean;
  overageRate?: number;
}

interface TenantUsage {
  currentPeriod: UsagePeriod;
  history: UsagePeriod[];
  projectedUsage: ProjectedUsage;
}

interface UsagePeriod {
  startDate: Date;
  endDate: Date;
  metrics: UsageMetrics;
}

interface UsageMetrics {
  activeUsers: number;
  apiCalls: number;
  storageBytes: number;
  bandwidthBytes: number;
  transactions: number;
  events: number;
  [metric: string]: number;
}

interface TenantMember {
  id: string;
  tenantId: string;
  userId: string;
  email: string;
  name: string;
  role: TenantRole;
  permissions: Permission[];
  status: 'invited' | 'active' | 'suspended';
  invitedBy?: string;
  invitedAt?: Date;
  joinedAt?: Date;
  lastActiveAt?: Date;
}

type TenantRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer';

interface TenantInvitation {
  id: string;
  tenantId: string;
  email: string;
  role: TenantRole;
  permissions?: Permission[];
  token: string;
  expiresAt: Date;
  sentAt: Date;
  acceptedAt?: Date;
  invitedBy: string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  type: TenantType;
  pricing: PlanPricing;
  features: PlanFeature[];
  limits: TenantLimits;
  trialDays: number;
  isPublic: boolean;
  sortOrder: number;
}

interface PlanPricing {
  monthly: number;
  annual: number;
  currency: string;
  setupFee?: number;
  perUserPricing?: number;
  tieredPricing?: PriceTier[];
}

interface PriceTier {
  upTo: number;
  pricePerUnit: number;
}

interface PlanFeature {
  featureId: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number;
}

interface TenantAuditLog {
  id: string;
  tenantId: string;
  actorId: string;
  actorType: 'user' | 'system' | 'platform_admin';
  action: string;
  resource: string;
  resourceId?: string;
  changes?: Record<string, { old: any; new: any }>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

interface TenantDataExport {
  id: string;
  tenantId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: 'json' | 'csv' | 'zip';
  includeData: string[];
  downloadUrl?: string;
  expiresAt?: Date;
  requestedBy: string;
  requestedAt: Date;
  completedAt?: Date;
}
```

## Service Implementation

```typescript
class TenantManagementService {
  // Tenant lifecycle
  async createTenant(input: CreateTenantInput): Promise<Tenant>;
  async provisionTenant(tenantId: string): Promise<ProvisioningResult>;
  async activateTenant(tenantId: string): Promise<Tenant>;
  async suspendTenant(tenantId: string, reason: string): Promise<Tenant>;
  async reactivateTenant(tenantId: string): Promise<Tenant>;
  async cancelTenant(tenantId: string, feedback?: CancellationFeedback): Promise<Tenant>;
  async archiveTenant(tenantId: string): Promise<void>;
  async deleteTenant(tenantId: string): Promise<void>;

  // Configuration
  async updateConfiguration(tenantId: string, config: Partial<TenantConfiguration>): Promise<Tenant>;
  async updateBranding(tenantId: string, branding: Partial<TenantBranding>): Promise<Tenant>;
  async setFeatureFlag(tenantId: string, featureId: string, flag: FeatureFlag): Promise<void>;
  async getEffectiveFeatures(tenantId: string): Promise<FeatureFlags>;

  // Domains
  async addDomain(tenantId: string, domain: string): Promise<TenantDomain>;
  async verifyDomain(tenantId: string, domainId: string): Promise<TenantDomain>;
  async removeDomain(tenantId: string, domainId: string): Promise<void>;
  async provisionSsl(tenantId: string, domainId: string): Promise<TenantDomain>;

  // Subscription and billing
  async changePlan(tenantId: string, planId: string, immediate?: boolean): Promise<Tenant>;
  async updateBillingCycle(tenantId: string, cycle: 'monthly' | 'annual'): Promise<Tenant>;
  async cancelSubscription(tenantId: string, atPeriodEnd?: boolean): Promise<Tenant>;
  async resumeSubscription(tenantId: string): Promise<Tenant>;
  async getUpcomingInvoice(tenantId: string): Promise<Invoice>;
  async applyCredit(tenantId: string, amount: number, reason: string): Promise<void>;

  // Members
  async inviteMember(tenantId: string, invite: InviteMemberInput): Promise<TenantInvitation>;
  async acceptInvitation(token: string, userId: string): Promise<TenantMember>;
  async updateMemberRole(tenantId: string, memberId: string, role: TenantRole): Promise<TenantMember>;
  async removeMember(tenantId: string, memberId: string): Promise<void>;
  async transferOwnership(tenantId: string, newOwnerId: string): Promise<Tenant>;

  // Usage and limits
  async trackUsage(tenantId: string, metric: string, value: number): Promise<void>;
  async getUsage(tenantId: string, dateRange?: DateRange): Promise<TenantUsage>;
  async checkLimit(tenantId: string, resource: string, amount?: number): Promise<LimitCheckResult>;
  async updateLimits(tenantId: string, limits: Partial<TenantLimits>): Promise<Tenant>;
  async getUsageAlerts(tenantId: string): Promise<UsageAlert[]>;

  // Data management
  async exportData(tenantId: string, options: ExportOptions): Promise<TenantDataExport>;
  async importData(tenantId: string, importFile: File): Promise<ImportResult>;
  async getDataRetention(tenantId: string): Promise<DataRetentionPolicy>;

  // Audit
  async logAuditEvent(tenantId: string, event: AuditEventInput): Promise<void>;
  async getAuditLogs(tenantId: string, filters?: AuditFilters): Promise<TenantAuditLog[]>;

  // Platform admin (PLATFORM_OWNER only)
  async listAllTenants(filters?: TenantFilters): Promise<PaginatedResult<Tenant>>;
  async getTenantMetrics(): Promise<PlatformMetrics>;
  async impersonateTenant(tenantId: string): Promise<ImpersonationToken>;
  async applyPlatformUpdate(update: PlatformUpdate): Promise<void>;
}
```

## Database Schema

```sql
-- Core tenant table
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  slug VARCHAR(63) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  tenant_type VARCHAR(30) NOT NULL,
  status VARCHAR(30) DEFAULT 'pending_setup',
  owner_user_id UUID NOT NULL,
  owner_email VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255),
  owner_company VARCHAR(255),
  timezone VARCHAR(50) DEFAULT 'UTC',
  locale VARCHAR(10) DEFAULT 'en-US',
  currency VARCHAR(3) DEFAULT 'USD',
  primary_color VARCHAR(7) DEFAULT '#000000',
  secondary_color VARCHAR(7) DEFAULT '#FFFFFF',
  logo_url TEXT,
  favicon_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  suspended_at TIMESTAMPTZ,
  suspension_reason TEXT
);

-- Subscription management
CREATE TABLE tenant_subscriptions (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  plan_id UUID NOT NULL,
  status VARCHAR(30) NOT NULL,
  billing_cycle VARCHAR(20) NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  mrr DECIMAL(10,2) DEFAULT 0,
  trial_ends_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plans definition
CREATE TABLE plans (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  plan_type VARCHAR(30) NOT NULL,
  monthly_price DECIMAL(10,2) NOT NULL,
  annual_price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  setup_fee DECIMAL(10,2) DEFAULT 0,
  per_user_price DECIMAL(10,2),
  features JSONB DEFAULT '[]',
  limits JSONB DEFAULT '{}',
  trial_days INTEGER DEFAULT 14,
  is_public BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  stripe_monthly_price_id VARCHAR(100),
  stripe_annual_price_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant domains
CREATE TABLE tenant_domains (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  domain VARCHAR(255) NOT NULL,
  domain_type VARCHAR(20) DEFAULT 'alias',
  status VARCHAR(20) DEFAULT 'pending',
  ssl_status VARCHAR(20) DEFAULT 'pending',
  verification_token VARCHAR(100),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(domain)
);

-- Feature flags per tenant
CREATE TABLE tenant_features (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  feature_id VARCHAR(100) NOT NULL,
  enabled BOOLEAN DEFAULT false,
  variant VARCHAR(50),
  config JSONB,
  override_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, feature_id)
);

-- Tenant members
CREATE TABLE tenant_members (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(30) NOT NULL,
  permissions JSONB DEFAULT '[]',
  status VARCHAR(30) DEFAULT 'active',
  invited_by UUID,
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- Member invitations
CREATE TABLE tenant_invitations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  email VARCHAR(255) NOT NULL,
  role VARCHAR(30) NOT NULL,
  permissions JSONB,
  token VARCHAR(100) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  invited_by UUID NOT NULL
);

-- Usage tracking
CREATE TABLE tenant_usage (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  metric VARCHAR(50) NOT NULL,
  value BIGINT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, metric, period_start)
);

-- Resource limits
CREATE TABLE tenant_limits (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  resource VARCHAR(50) NOT NULL,
  limit_value BIGINT NOT NULL,
  used_value BIGINT DEFAULT 0,
  unit VARCHAR(20),
  reset_period VARCHAR(20),
  last_reset TIMESTAMPTZ,
  hard_limit BOOLEAN DEFAULT true,
  overage_rate DECIMAL(10,4),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, resource)
);

-- Audit logs
CREATE TABLE tenant_audit_logs (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  actor_id UUID,
  actor_type VARCHAR(30) NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100),
  changes JSONB,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuration storage
CREATE TABLE tenant_configurations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  config_key VARCHAR(100) NOT NULL,
  config_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, config_key)
);

-- Indexes
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_owner ON tenants(owner_user_id);
CREATE INDEX idx_subscriptions_tenant ON tenant_subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_stripe ON tenant_subscriptions(stripe_subscription_id);
CREATE INDEX idx_domains_tenant ON tenant_domains(tenant_id);
CREATE INDEX idx_domains_domain ON tenant_domains(domain);
CREATE INDEX idx_features_tenant ON tenant_features(tenant_id);
CREATE INDEX idx_members_tenant ON tenant_members(tenant_id);
CREATE INDEX idx_members_user ON tenant_members(user_id);
CREATE INDEX idx_invitations_token ON tenant_invitations(token);
CREATE INDEX idx_usage_tenant_period ON tenant_usage(tenant_id, period_start);
CREATE INDEX idx_audit_tenant_time ON tenant_audit_logs(tenant_id, created_at DESC);
```

## API Endpoints

```typescript
// GET /api/tenants - List tenants (platform admin)
// GET /api/tenants/:id - Get tenant
// POST /api/tenants - Create tenant
// PUT /api/tenants/:id - Update tenant
// POST /api/tenants/:id/activate - Activate tenant
// POST /api/tenants/:id/suspend - Suspend tenant
// POST /api/tenants/:id/cancel - Cancel tenant
// PUT /api/tenants/:id/configuration - Update configuration
// PUT /api/tenants/:id/branding - Update branding
// POST /api/tenants/:id/domains - Add domain
// POST /api/tenants/:id/domains/:domainId/verify - Verify domain
// DELETE /api/tenants/:id/domains/:domainId - Remove domain
// PUT /api/tenants/:id/features/:featureId - Set feature flag
// GET /api/tenants/:id/features - Get effective features
// POST /api/tenants/:id/subscription/change-plan - Change plan
// POST /api/tenants/:id/subscription/cancel - Cancel subscription
// GET /api/tenants/:id/members - List members
// POST /api/tenants/:id/members/invite - Invite member
// PUT /api/tenants/:id/members/:memberId - Update member role
// DELETE /api/tenants/:id/members/:memberId - Remove member
// POST /api/tenants/:id/transfer-ownership - Transfer ownership
// GET /api/tenants/:id/usage - Get usage
// GET /api/tenants/:id/limits - Get limits
// POST /api/tenants/:id/export - Export data
// GET /api/tenants/:id/audit-logs - Get audit logs
// GET /api/plans - List available plans
```

## Related Skills
- `white-label-standard.md` - White-label customization
- `graphql-federation-standard.md` - Multi-tenant API architecture
- `clerk-auth-enforcer` - Authentication patterns

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-15
- **Domain**: PaaS
