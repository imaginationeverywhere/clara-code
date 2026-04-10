---
name: multi-tenancy-standard
description: Implement multi-tenant SaaS architecture with PLATFORM_OWNER/SITE_OWNER isolation, tenant_id segregation, and Stripe Connect. Use when building SaaS platforms, marketplace apps, or multi-tenant systems. Triggers on requests for multi-tenancy, tenant isolation, SaaS architecture, or platform/site separation.
---

# Multi-Tenancy Standard

Production-grade multi-tenant SaaS architecture patterns from DreamiHairCare implementation with PLATFORM_OWNER vs SITE_OWNER isolation, tenant_id data segregation, Stripe Connect payment flows, and Clerk authentication patterns.

## Skill Metadata

- **Name:** multi-tenancy-standard
- **Version:** 1.0.0
- **Category:** Data Architecture
- **Source:** DreamiHairCare Production Implementation
- **Related Skills:** clerk-auth-standard, stripe-connect-standard, database-migration-standard

## When to Use This Skill

Use this skill when:
- Designing multi-tenant SaaS platforms
- Implementing PLATFORM_OWNER vs SITE_OWNER role separation
- Adding tenant_id to database tables
- Setting up Stripe Connect for marketplace payments
- Configuring Clerk for multi-tenant authentication
- Implementing row-level security
- Creating tenant isolation middleware

## Core Concepts

### PLATFORM_OWNER vs SITE_OWNER

**PLATFORM_OWNER** (like Shopify):
- Owns source code and intellectual property
- Maintains servers, databases, cloud services
- Controls master accounts for third-party services
- Bears all infrastructure costs
- Collects platform fees from transactions

**SITE_OWNER** (like a store on Shopify):
- Licenses the platform to run their business
- Manages their own customers, products, operations
- Owns their business data and customer relationships
- Keeps 100% of product prices (platform fee paid by customers)
- Pays monthly SaaS fees to PLATFORM_OWNER

### Revenue Model

```
Customer Payment ($100 product)
         │
         ▼
┌─────────────────────────────┐
│  Customer Pays:              │
│  • Product Price: $100       │  ← Goes to SITE_OWNER (100%)
│  • Platform Fee: $7.00 (7%)  │  ← Goes to PLATFORM_OWNER
│  • Processing Fee: $3.50     │
│  Total: $110.50              │
└─────────────────────────────┘
```

## Core Patterns

### 1. Database Schema with tenant_id

```typescript
// All tables MUST include tenant_id for data isolation

// Platform-level models (controlled by PLATFORM_OWNER)
interface Platform {
  id: string;
  name: string;
  version: string;
  features: Feature[];
  settings: PlatformSettings;
}

interface Tenant {
  id: string;                    // UUID
  platform_id: string;
  site_owner_id: string;
  subdomain: string;
  custom_domain?: string;
  subscription_tier: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled';
  created_at: Date;
}

// Site-level models (data owned by SITE_OWNER)
interface SiteOwner {
  id: string;                    // UUID
  tenant_id: string;             // REQUIRED for isolation
  business_name: string;
  owner_name: string;
  email: string;
  stripe_connect_account_id?: string;
  settings: SiteSettings;
}

interface Customer {
  id: string;                    // UUID
  tenant_id: string;             // REQUIRED - ensures data isolation
  site_owner_id: string;
  email: string;
  name: string;
  // Customer data owned by SITE_OWNER
}

interface Product {
  id: string;                    // UUID
  tenant_id: string;             // REQUIRED - ensures data isolation
  name: string;
  price: number;
  // Product data owned by SITE_OWNER
}

interface Order {
  id: string;                    // UUID
  tenant_id: string;             // REQUIRED - ensures data isolation
  customer_id: string;
  product_ids: string[];
  total_amount: number;
  platform_fee: number;
  // Order data owned by SITE_OWNER
}
```

### 2. Sequelize Model with tenant_id

```typescript
// backend/src/models/Product.ts
import { Model, DataTypes, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

interface ProductAttributes {
  id: string;
  tenant_id: string;        // MANDATORY
  name: string;
  description?: string;
  price: number;
  created_at: Date;
  updated_at: Date;
}

class Product extends Model<ProductAttributes> implements ProductAttributes {
  declare id: string;
  declare tenant_id: string;
  declare name: string;
  declare description?: string;
  declare price: number;
  declare created_at: Date;
  declare updated_at: Date;
}

export function initProduct(sequelize: Sequelize): typeof Product {
  Product.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true,
      },
      tenant_id: {
        type: DataTypes.UUID,
        allowNull: false,  // MANDATORY - never allow null
        references: {
          model: 'tenants',
          key: 'id',
        },
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'products',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        { fields: ['tenant_id'] },  // MANDATORY index for queries
        { fields: ['tenant_id', 'name'] },
      ],
    }
  );

  return Product;
}

export default Product;
```

### 3. Tenant Isolation Middleware

```typescript
// backend/src/middleware/tenantIsolation.ts
import { Request, Response, NextFunction } from 'express';
import { AuthenticationError, ForbiddenError } from 'apollo-server-express';

interface AuthContext {
  platform_role?: 'admin' | 'support' | 'developer';
  tenant_id?: string;
  site_owner_id?: string;
  site_role?: 'owner' | 'admin' | 'staff' | 'customer';
  permissions: string[];
}

// Express middleware
export function enforceTenantIsolation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const auth = req.auth as AuthContext;

  if (!auth?.tenant_id) {
    return res.status(401).json({ error: 'Tenant context required' });
  }

  // Set tenant context for all database queries
  req.tenantId = auth.tenant_id;

  // Prevent cross-tenant access via URL parameters
  if (req.params.tenant_id && req.params.tenant_id !== auth.tenant_id) {
    return res.status(403).json({ error: 'Cross-tenant access denied' });
  }

  next();
}

// GraphQL context builder
export function buildTenantContext(auth: AuthContext) {
  if (!auth?.tenant_id) {
    throw new AuthenticationError('Tenant context required');
  }

  return {
    tenantId: auth.tenant_id,
    siteOwnerId: auth.site_owner_id,
    permissions: auth.permissions,

    // Helper to scope queries
    getTenantFilter: () => ({
      tenant_id: auth.tenant_id,
    }),

    // Helper to validate ownership
    validateTenantAccess: (resourceTenantId: string) => {
      if (resourceTenantId !== auth.tenant_id) {
        throw new ForbiddenError('Access denied to this resource');
      }
    },
  };
}
```

### 4. GraphQL Resolver with Tenant Isolation

```typescript
// backend/src/graphql/resolvers/product.ts
import { AuthenticationError, ForbiddenError } from 'apollo-server-express';
import Product from '../../models/Product';

export const productResolvers = {
  Query: {
    // All queries MUST include tenant_id filter
    products: async (_, args, context) => {
      // CRITICAL: Validate authentication
      if (!context.auth?.userId) {
        throw new AuthenticationError('Authentication required');
      }

      // CRITICAL: Validate tenant context
      if (!context.auth?.tenantId) {
        throw new AuthenticationError('Tenant context required');
      }

      // CRITICAL: Always filter by tenant_id
      return Product.findAll({
        where: {
          tenant_id: context.auth.tenantId,  // MANDATORY filter
          ...args.filter,
        },
        order: [['created_at', 'DESC']],
      });
    },

    product: async (_, { id }, context) => {
      if (!context.auth?.userId) {
        throw new AuthenticationError('Authentication required');
      }

      const product = await Product.findByPk(id);

      // CRITICAL: Validate tenant ownership before returning
      if (product && product.tenant_id !== context.auth.tenantId) {
        throw new ForbiddenError('Access denied');
      }

      return product;
    },
  },

  Mutation: {
    createProduct: async (_, { input }, context) => {
      if (!context.auth?.userId) {
        throw new AuthenticationError('Authentication required');
      }

      // CRITICAL: Always set tenant_id from context, never from input
      return Product.create({
        ...input,
        tenant_id: context.auth.tenantId,  // MANDATORY - from auth context
      });
    },

    updateProduct: async (_, { id, input }, context) => {
      if (!context.auth?.userId) {
        throw new AuthenticationError('Authentication required');
      }

      const product = await Product.findByPk(id);

      // CRITICAL: Validate tenant ownership
      if (!product || product.tenant_id !== context.auth.tenantId) {
        throw new ForbiddenError('Access denied');
      }

      // Never allow updating tenant_id
      const { tenant_id, ...safeInput } = input;

      return product.update(safeInput);
    },

    deleteProduct: async (_, { id }, context) => {
      if (!context.auth?.userId) {
        throw new AuthenticationError('Authentication required');
      }

      const product = await Product.findByPk(id);

      // CRITICAL: Validate tenant ownership
      if (!product || product.tenant_id !== context.auth.tenantId) {
        throw new ForbiddenError('Access denied');
      }

      await product.destroy();
      return { success: true };
    },
  },
};
```

### 5. Stripe Connect Payment Flow

```typescript
// backend/src/services/PaymentService.ts
import Stripe from 'stripe';

const platformStripe = new Stripe(process.env.PLATFORM_STRIPE_SECRET_KEY!);

interface PaymentParams {
  product_amount: number;          // SITE_OWNER's product price
  platform_fee_percent: number;    // Minimum 7%
  site_owner_stripe_account_id: string;
  customer_id: string;
  tenant_id: string;
}

export async function processPayment({
  product_amount,
  platform_fee_percent,
  site_owner_stripe_account_id,
  customer_id,
  tenant_id,
}: PaymentParams) {
  // Enforce minimum platform fee
  const effectiveFeePercent = Math.max(platform_fee_percent, 7);

  // Calculate fees
  const platform_fee = Math.round(product_amount * effectiveFeePercent / 100);
  const processing_fee = Math.round(product_amount * 0.029) + 30; // 2.9% + $0.30
  const total_charge = product_amount + platform_fee + processing_fee;

  const payment = await platformStripe.paymentIntents.create({
    amount: total_charge, // Customer pays product + platform fee + processing
    currency: 'usd',
    customer: customer_id,

    // SITE_OWNER gets 100% of their product price
    transfer_data: {
      destination: site_owner_stripe_account_id,
      amount: product_amount,  // Exactly what SITE_OWNER priced
    },

    // PLATFORM_OWNER keeps the platform fee
    application_fee_amount: platform_fee,

    // Metadata for tracking and audit
    metadata: {
      platform_name: 'QuikNation',
      tenant_id: tenant_id,
      site_owner_stripe_id: site_owner_stripe_account_id,
      product_amount: product_amount.toString(),
      platform_fee: platform_fee.toString(),
      platform_fee_percent: effectiveFeePercent.toString(),
      processing_fee: processing_fee.toString(),
    },
  });

  return payment;
}

// Checkout summary for customer transparency
export function calculateCheckoutSummary(product_amount: number) {
  const platform_fee = Math.round(product_amount * 0.07); // 7% minimum
  const processing_fee = Math.round(product_amount * 0.029) + 30;

  return {
    subtotal: product_amount,                    // $100.00 (goes to SITE_OWNER)
    platform_fee: platform_fee,                  // $7.00 (goes to PLATFORM_OWNER)
    processing_fee: processing_fee,              // $3.20 (covers payment processing)
    total: product_amount + platform_fee + processing_fee, // $110.20
    message: 'Platform fee supports the marketplace infrastructure and services',
  };
}
```

### 6. Clerk Multi-Tenant Authentication

```typescript
// backend/src/middleware/clerkAuth.ts
import { ClerkExpressWithAuth, AuthObject } from '@clerk/clerk-sdk-node';

interface TenantMetadata {
  tenant_id: string;
  site_role: 'owner' | 'admin' | 'staff' | 'customer';
  permissions: string[];
}

// Extract tenant context from Clerk session
export function extractTenantContext(auth: AuthObject): TenantMetadata | null {
  if (!auth.userId) return null;

  // Tenant info stored in user's public metadata
  const publicMetadata = auth.sessionClaims?.publicMetadata as TenantMetadata;

  if (!publicMetadata?.tenant_id) {
    return null;
  }

  return {
    tenant_id: publicMetadata.tenant_id,
    site_role: publicMetadata.site_role || 'customer',
    permissions: publicMetadata.permissions || [],
  };
}

// Middleware that adds tenant context
export const clerkWithTenant = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // First, authenticate with Clerk
    await ClerkExpressWithAuth()(req, res, () => {
      const auth = req.auth;

      if (auth.userId) {
        const tenantContext = extractTenantContext(auth);

        if (!tenantContext) {
          return res.status(403).json({
            error: 'User not associated with any tenant',
          });
        }

        // Attach tenant context to request
        req.tenantContext = tenantContext;
      }

      next();
    });
  };
};
```

### 7. Migration for Multi-Tenant Tables

```javascript
// backend/migrations/20250101-add-tenant-id-to-tables.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 1. Create tenants table first
      await queryInterface.createTable('tenants', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        subdomain: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true,
        },
        custom_domain: {
          type: Sequelize.STRING(255),
          allowNull: true,
          unique: true,
        },
        business_name: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        subscription_tier: {
          type: Sequelize.ENUM('basic', 'pro', 'enterprise'),
          allowNull: false,
          defaultValue: 'basic',
        },
        stripe_connect_account_id: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        settings: {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: {},
        },
        status: {
          type: Sequelize.ENUM('active', 'suspended', 'cancelled'),
          allowNull: false,
          defaultValue: 'active',
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
      }, { transaction });

      // 2. Add tenant_id to existing tables
      const tables = ['products', 'orders', 'customers', 'users'];

      for (const table of tables) {
        // Add tenant_id column
        await queryInterface.addColumn(
          table,
          'tenant_id',
          {
            type: Sequelize.UUID,
            allowNull: true,  // Initially nullable for migration
            references: {
              model: 'tenants',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          { transaction }
        );

        // Add index for tenant_id
        await queryInterface.addIndex(table, ['tenant_id'], { transaction });
      }

      // 3. Create default tenant for existing data
      await queryInterface.bulkInsert('tenants', [{
        id: '00000000-0000-0000-0000-000000000001',
        subdomain: 'default',
        business_name: 'Default Tenant',
        subscription_tier: 'enterprise',
        status: 'active',
        settings: JSON.stringify({}),
        created_at: new Date(),
        updated_at: new Date(),
      }], { transaction });

      // 4. Update existing records with default tenant
      for (const table of tables) {
        await queryInterface.sequelize.query(
          `UPDATE "${table}" SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL`,
          { transaction }
        );
      }

      // 5. Make tenant_id NOT NULL after data migration
      for (const table of tables) {
        await queryInterface.changeColumn(
          table,
          'tenant_id',
          {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'tenants',
              key: 'id',
            },
          },
          { transaction }
        );
      }

      await transaction.commit();
      console.log('✅ Multi-tenancy migration completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Multi-tenancy migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const tables = ['products', 'orders', 'customers', 'users'];

      // Remove tenant_id from tables
      for (const table of tables) {
        await queryInterface.removeColumn(table, 'tenant_id', { transaction });
      }

      // Drop tenants table
      await queryInterface.dropTable('tenants', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
```

## Role-Based Access Control

### Permission Matrix

| Role | Data Access | Admin Features | Financial |
|------|------------|----------------|-----------|
| SITE_OWNER | Full tenant data | All features | Full access |
| SITE_ADMIN | Full tenant data | Most features | Limited |
| ADMIN | Products, Orders, Customers | Limited | View only |
| STAFF | Assigned resources | Minimal | None |
| USER | Own data only | None | Own orders |

### Role Validation

```typescript
// backend/src/utils/roleValidation.ts
export enum SiteRole {
  SITE_OWNER = 'SITE_OWNER',
  SITE_ADMIN = 'SITE_ADMIN',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  USER = 'USER',
}

const roleHierarchy: Record<SiteRole, number> = {
  [SiteRole.SITE_OWNER]: 100,
  [SiteRole.SITE_ADMIN]: 80,
  [SiteRole.ADMIN]: 60,
  [SiteRole.STAFF]: 40,
  [SiteRole.USER]: 20,
};

export function hasMinimumRole(
  userRole: SiteRole,
  requiredRole: SiteRole
): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function requireRole(requiredRole: SiteRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.tenantContext?.site_role as SiteRole;

    if (!hasMinimumRole(userRole, requiredRole)) {
      return res.status(403).json({
        error: `Requires ${requiredRole} or higher role`,
      });
    }

    next();
  };
}
```

## Implementation Checklist

### Database
- [ ] Create tenants table
- [ ] Add tenant_id to all business tables
- [ ] Add indexes on tenant_id columns
- [ ] Implement row-level security (if using PostgreSQL RLS)
- [ ] Create migration for existing data

### Authentication
- [ ] Configure Clerk multi-tenancy
- [ ] Store tenant_id in user metadata
- [ ] Implement tenant context extraction
- [ ] Create tenant isolation middleware

### GraphQL API
- [ ] Add tenant_id filter to all queries
- [ ] Validate tenant ownership on all mutations
- [ ] Never accept tenant_id from user input
- [ ] Log cross-tenant access attempts

### Payments
- [ ] Set up Stripe Connect platform account
- [ ] Implement Connected Account onboarding
- [ ] Configure application fees (minimum 7%)
- [ ] Test payment flows with test accounts

### Security
- [ ] Regular security audits for data leakage
- [ ] Penetration testing for cross-tenant access
- [ ] Logging and alerting for suspicious activity
- [ ] Compliance documentation

## Anti-Patterns to Avoid

1. **Never trust tenant_id from client input** - Always get from auth context
2. **Never query without tenant_id filter** - Data leakage risk
3. **Never share database connections** - Use connection pooling with tenant context
4. **Never mix platform and site payment flows** - Separate Stripe accounts
5. **Never expose platform_role to SITE_OWNERs** - Different permission systems

## Related Commands

- `/implement-multi-tenancy` - Set up multi-tenant architecture
- `/implement-clerk-standard` - Authentication setup
- `/implement-stripe-standard` - Payment processing

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-15 | Initial release from DreamiHairCare patterns |
