# Implement Multi-Tenancy Architecture

Set up multi-tenant SaaS architecture with PLATFORM_OWNER vs SITE_OWNER isolation, tenant_id data segregation, Stripe Connect payment flows, and Clerk authentication following DreamiHairCare's production-tested patterns.

## Command Usage

```
/implement-multi-tenancy [options]
```

### Options
- `--full` - Complete multi-tenant setup (default)
- `--database-only` - Add tenant_id to tables only
- `--auth-only` - Clerk multi-tenant setup only
- `--payments-only` - Stripe Connect setup only
- `--audit` - Audit existing implementation

### Architecture Options
- `--shared-database` - Single database with tenant_id isolation (default)
- `--schema-per-tenant` - PostgreSQL schema per tenant
- `--database-per-tenant` - Separate database per tenant

## Pre-Implementation Checklist

### Requirements
- [ ] PostgreSQL database configured
- [ ] Clerk authentication set up
- [ ] Stripe account created
- [ ] docs/PRD.md exists with business model

### Dependencies
```bash
# Backend
npm install stripe @clerk/clerk-sdk-node uuid

# Types
npm install -D @types/uuid
```

## Implementation Phases

### Phase 1: Database Schema Setup

#### 1.1 Create Tenants Table Migration
```bash
cd backend
npx sequelize-cli migration:generate --name create-tenants-table
```

Migration content:
```javascript
// See multi-tenancy-standard skill for complete migration
await queryInterface.createTable('tenants', {
  id: { type: Sequelize.UUID, primaryKey: true },
  subdomain: { type: Sequelize.STRING, unique: true },
  business_name: { type: Sequelize.STRING },
  stripe_connect_account_id: { type: Sequelize.STRING },
  subscription_tier: { type: Sequelize.ENUM('basic', 'pro', 'enterprise') },
  status: { type: Sequelize.ENUM('active', 'suspended', 'cancelled') },
  settings: { type: Sequelize.JSONB },
  created_at: { type: Sequelize.DATE },
  updated_at: { type: Sequelize.DATE },
});
```

#### 1.2 Add tenant_id to Existing Tables
```bash
npx sequelize-cli migration:generate --name add-tenant-id-to-tables
```

**Tables that need tenant_id:**
- users
- products
- orders
- customers
- invoices
- any business-specific tables

**Migration pattern:**
1. Add column as nullable
2. Create default tenant
3. Update existing records
4. Make column NOT NULL

#### 1.3 Run Migrations
```bash
npm run migrate:local
npm run migrate:develop
npm run migrate:production
```

### Phase 2: Sequelize Models Update

#### 2.1 Update All Models
Add `tenant_id` field to all business models:

```typescript
// backend/src/models/Product.ts
import { Model, DataTypes, Sequelize } from 'sequelize';

class Product extends Model {
  declare id: string;
  declare tenant_id: string;  // MANDATORY
  declare name: string;
  // ... other fields
}

export function initProduct(sequelize: Sequelize) {
  Product.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenant_id: {
      type: DataTypes.UUID,
      allowNull: false,  // CRITICAL: Never allow null
      references: { model: 'tenants', key: 'id' },
    },
    // ... other fields
  }, {
    sequelize,
    indexes: [{ fields: ['tenant_id'] }],  // CRITICAL: Add index
  });
}
```

### Phase 3: Tenant Isolation Middleware

#### 3.1 Create Express Middleware
```typescript
// backend/src/middleware/tenantIsolation.ts
export function enforceTenantIsolation(req, res, next) {
  const auth = req.auth;

  if (!auth?.tenantId) {
    return res.status(401).json({ error: 'Tenant context required' });
  }

  req.tenantId = auth.tenantId;

  // Prevent cross-tenant access via URL
  if (req.params.tenant_id && req.params.tenant_id !== auth.tenantId) {
    return res.status(403).json({ error: 'Cross-tenant access denied' });
  }

  next();
}
```

#### 3.2 Create GraphQL Context Builder
```typescript
// backend/src/graphql/context.ts
export function buildTenantContext(auth) {
  if (!auth?.tenantId) {
    throw new AuthenticationError('Tenant context required');
  }

  return {
    tenantId: auth.tenantId,
    getTenantFilter: () => ({ tenant_id: auth.tenantId }),
    validateTenantAccess: (resourceTenantId) => {
      if (resourceTenantId !== auth.tenantId) {
        throw new ForbiddenError('Access denied');
      }
    },
  };
}
```

### Phase 4: Update GraphQL Resolvers

#### 4.1 Query Pattern
```typescript
// All queries MUST include tenant_id filter
products: async (_, args, context) => {
  if (!context.auth?.userId) {
    throw new AuthenticationError('Authentication required');
  }

  return Product.findAll({
    where: {
      tenant_id: context.auth.tenantId,  // MANDATORY filter
      ...args.filter,
    },
  });
}
```

#### 4.2 Mutation Pattern
```typescript
// All mutations MUST set tenant_id from context
createProduct: async (_, { input }, context) => {
  if (!context.auth?.userId) {
    throw new AuthenticationError('Authentication required');
  }

  return Product.create({
    ...input,
    tenant_id: context.auth.tenantId,  // MANDATORY - from auth context
  });
}
```

### Phase 5: Clerk Multi-Tenant Setup

#### 5.1 Configure Clerk Organization
- Create organization per tenant in Clerk dashboard
- Store tenant_id in user publicMetadata

#### 5.2 Extract Tenant Context
```typescript
// backend/src/middleware/clerkAuth.ts
export function extractTenantContext(auth) {
  const publicMetadata = auth.sessionClaims?.publicMetadata;

  return {
    tenant_id: publicMetadata?.tenant_id,
    site_role: publicMetadata?.site_role || 'customer',
    permissions: publicMetadata?.permissions || [],
  };
}
```

### Phase 6: Stripe Connect Setup

#### 6.1 Platform Account Configuration
1. Create Stripe Connect platform account
2. Enable Connect in Stripe Dashboard
3. Configure onboarding settings

#### 6.2 Connected Account Onboarding
```typescript
// backend/src/services/StripeConnectService.ts
async function createConnectedAccount(tenantId: string, businessEmail: string) {
  const account = await stripe.accounts.create({
    type: 'express',
    email: businessEmail,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: {
      tenant_id: tenantId,
    },
  });

  // Store account ID in tenant record
  await Tenant.update(
    { stripe_connect_account_id: account.id },
    { where: { id: tenantId } }
  );

  return account;
}
```

#### 6.3 Payment Processing with Platform Fee
```typescript
async function processPayment({ productAmount, tenantId, customerId }) {
  const tenant = await Tenant.findByPk(tenantId);
  const platformFee = Math.round(productAmount * 0.07); // 7% minimum

  return stripe.paymentIntents.create({
    amount: productAmount + platformFee + processingFee,
    currency: 'usd',
    customer: customerId,
    transfer_data: {
      destination: tenant.stripe_connect_account_id,
      amount: productAmount,  // SITE_OWNER gets 100% of product price
    },
    application_fee_amount: platformFee,  // PLATFORM_OWNER gets platform fee
  });
}
```

## File Structure

```
backend/
├── migrations/
│   ├── 20250101-create-tenants-table.js
│   └── 20250102-add-tenant-id-to-tables.js
├── src/
│   ├── middleware/
│   │   ├── tenantIsolation.ts
│   │   └── clerkAuth.ts
│   ├── services/
│   │   ├── StripeConnectService.ts
│   │   └── TenantService.ts
│   ├── models/
│   │   └── Tenant.ts
│   └── graphql/
│       └── resolvers/
└── seeders/
    └── 20250101-seed-default-tenant.js
```

## Verification Checklist

### Database
- [ ] Tenants table created
- [ ] All business tables have tenant_id
- [ ] Indexes added on tenant_id columns
- [ ] Foreign key constraints configured
- [ ] Default tenant created for migration

### Authentication
- [ ] Clerk configured for multi-tenancy
- [ ] Tenant context extracted from sessions
- [ ] User-tenant associations working
- [ ] Role-based access control implemented

### Data Isolation
- [ ] All queries filter by tenant_id
- [ ] All mutations set tenant_id from context
- [ ] Cross-tenant access blocked
- [ ] Audit logging for access attempts

### Payments
- [ ] Stripe Connect platform configured
- [ ] Connected account onboarding flow
- [ ] Platform fee (7% minimum) implemented
- [ ] Payment distribution working

### Testing
- [ ] Unit tests for tenant isolation
- [ ] Integration tests for cross-tenant access
- [ ] Payment flow tests
- [ ] Security penetration testing

## Security Considerations

### Critical Rules
1. **NEVER trust tenant_id from client input** - Always from auth context
2. **NEVER query without tenant_id filter** - Data leakage risk
3. **NEVER allow updating tenant_id** - Strip from mutation input
4. **ALWAYS log cross-tenant access attempts** - Security monitoring

### Audit Trail
```typescript
// Log all access attempts
async function logFileAccess(fileId, userId, action, tenantId) {
  await AuditLog.create({
    file_id: fileId,
    user_id: userId,
    tenant_id: tenantId,
    action,
    ip_address: req.ip,
    user_agent: req.headers['user-agent'],
    timestamp: new Date(),
  });
}
```

## Related Skills

- **multi-tenancy-standard** - Complete architecture patterns
- **clerk-auth-standard** - Authentication patterns
- **stripe-connect-standard** - Payment processing
- **database-migration-standard** - Migration patterns

## Related Commands

- `/implement-clerk-standard` - Authentication setup
- `/implement-stripe-standard` - Payment processing
- `/implement-migrations` - Database migrations
