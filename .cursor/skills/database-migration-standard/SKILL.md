---
name: database-migration-standard
description: Implement Sequelize migrations with Neon PostgreSQL, multi-environment support, zero-downtime migrations, and seeding. Use when creating database migrations, setting up Sequelize, or managing schema changes. Triggers on requests for database migrations, schema changes, Sequelize setup, or database seeding.
---

# Database Migration Standard

Production-grade Sequelize migration patterns from DreamiHairCare implementation with Neon PostgreSQL, multi-environment support, zero-downtime migrations, seeding strategies, and rollback procedures.

## Skill Metadata

- **Name:** database-migration-standard
- **Version:** 1.0.0
- **Category:** Data Architecture
- **Source:** DreamiHairCare Production Implementation
- **Related Skills:** multi-tenancy-standard, file-storage-standard

## When to Use This Skill

Use this skill when:
- Creating new database tables
- Modifying existing schema
- Running migrations across environments
- Setting up seeders for initial data
- Implementing rollback strategies
- Managing database versioning

## Core Patterns

### 1. Migration File Structure

```javascript
// backend/migrations/YYYYMMDDHHMMSS-migration-name.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Use transactions for atomicity
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Your migration logic here

      await transaction.commit();
      console.log('✅ Migration completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // MANDATORY: Always include rollback logic
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Your rollback logic here

      await transaction.commit();
      console.log('✅ Migration rollback completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration rollback failed:', error);
      throw error;
    }
  },
};
```

### 2. Create Table Migration

```javascript
// backend/migrations/20250101000000-create-users-table.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createTable('users', {
        // MANDATORY: UUID primary key
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },

        // External ID for Clerk integration
        clerk_id: {
          type: Sequelize.STRING(255),
          allowNull: true,  // Null for guest users
          unique: true,
        },

        // Basic user info
        email: {
          type: Sequelize.STRING(255),
          allowNull: true,  // Null for guest users
          unique: true,
          validate: {
            isEmail: true,
          },
        },

        first_name: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },

        last_name: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },

        phone: {
          type: Sequelize.STRING(20),
          allowNull: true,
        },

        // Role and status
        role: {
          type: Sequelize.ENUM('SITE_OWNER', 'SITE_ADMIN', 'ADMIN', 'STAFF', 'USER'),
          allowNull: false,
          defaultValue: 'USER',
        },

        status: {
          type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED'),
          allowNull: false,
          defaultValue: 'ACTIVE',
        },

        // JSONB for flexible data
        address: {
          type: Sequelize.JSONB,
          allowNull: true,
        },

        preferences: {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: {
            emailNotifications: true,
            smsNotifications: false,
            marketingEmails: true,
          },
        },

        // Guest user support
        is_guest: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },

        guest_session_id: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },

        // Timestamps
        last_login_at: {
          type: Sequelize.DATE,
          allowNull: true,
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

      // Add indexes for performance
      await queryInterface.addIndex('users', ['clerk_id'], { transaction });
      await queryInterface.addIndex('users', ['email'], { transaction });
      await queryInterface.addIndex('users', ['role'], { transaction });
      await queryInterface.addIndex('users', ['status'], { transaction });
      await queryInterface.addIndex('users', ['is_guest'], { transaction });
      await queryInterface.addIndex('users', ['guest_session_id'], { transaction });

      await transaction.commit();
      console.log('✅ Users table created successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Users table creation failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  },
};
```

### 3. Add Column Migration

```javascript
// backend/migrations/20250102000000-add-tenant-id-to-products.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Add column as nullable first
      await queryInterface.addColumn('products', 'tenant_id', {
        type: Sequelize.UUID,
        allowNull: true,  // Initially nullable
        references: {
          model: 'tenants',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }, { transaction });

      // Add index for performance
      await queryInterface.addIndex('products', ['tenant_id'], {
        transaction,
      });

      // Update existing records if needed
      await queryInterface.sequelize.query(
        `UPDATE products SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL`,
        { transaction }
      );

      // Make column NOT NULL after data migration
      await queryInterface.changeColumn('products', 'tenant_id', {
        type: Sequelize.UUID,
        allowNull: false,  // Now required
        references: {
          model: 'tenants',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }, { transaction });

      await transaction.commit();
      console.log('✅ tenant_id added to products successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.removeColumn('products', 'tenant_id', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
```

### 4. Modify Column Migration (Zero-Downtime)

```javascript
// backend/migrations/20250103000000-expand-product-name-length.js
'use strict';

// Zero-downtime migration: Never make breaking changes
// Instead of ALTER TABLE, create new column, migrate data, then swap

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Safe: Expanding column size is non-breaking
      await queryInterface.changeColumn('products', 'name', {
        type: Sequelize.STRING(500),  // Expanded from 255
        allowNull: false,
      }, { transaction });

      await transaction.commit();
      console.log('✅ Product name column expanded successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // WARNING: This could truncate data
    // Consider if rollback is safe
    await queryInterface.changeColumn('products', 'name', {
      type: Sequelize.STRING(255),
      allowNull: false,
    });
  },
};
```

### 5. Create Index Migration

```javascript
// backend/migrations/20250104000000-add-composite-indexes.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Composite index for common queries
      await queryInterface.addIndex('orders', ['tenant_id', 'customer_id'], {
        name: 'idx_orders_tenant_customer',
        transaction,
      });

      // Partial index for active orders
      await queryInterface.addIndex('orders', ['status'], {
        name: 'idx_orders_active',
        where: {
          status: 'active',
        },
        transaction,
      });

      // Unique constraint index
      await queryInterface.addIndex('products', ['tenant_id', 'sku'], {
        name: 'idx_products_tenant_sku_unique',
        unique: true,
        transaction,
      });

      await transaction.commit();
      console.log('✅ Indexes added successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.removeIndex('orders', 'idx_orders_tenant_customer', { transaction });
      await queryInterface.removeIndex('orders', 'idx_orders_active', { transaction });
      await queryInterface.removeIndex('products', 'idx_products_tenant_sku_unique', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
```

### 6. Seeder with Fixed UUIDs

```javascript
// backend/seeders/20250101000000-seed-default-data.js
'use strict';

// CRITICAL: Use fixed UUIDs for data that must be consistent across environments
// Example: menu_items must have identical IDs for cart localStorage to work

module.exports = {
  async up(queryInterface, Sequelize) {
    // Default tenant
    await queryInterface.bulkInsert('tenants', [{
      id: '550e8400-e29b-41d4-a716-446655440001',  // FIXED UUID
      subdomain: 'demo',
      business_name: 'Demo Business',
      subscription_tier: 'enterprise',
      status: 'active',
      settings: JSON.stringify({
        theme: 'default',
        features: ['products', 'orders', 'customers'],
      }),
      created_at: new Date(),
      updated_at: new Date(),
    }]);

    // Admin user
    await queryInterface.bulkInsert('users', [{
      id: '550e8400-e29b-41d4-a716-446655440002',  // FIXED UUID
      tenant_id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'admin@example.com',
      first_name: 'Admin',
      last_name: 'User',
      role: 'SITE_OWNER',
      status: 'ACTIVE',
      is_guest: false,
      preferences: JSON.stringify({
        emailNotifications: true,
        smsNotifications: false,
        marketingEmails: false,
        adminAlerts: true,
      }),
      created_at: new Date(),
      updated_at: new Date(),
    }]);

    // Sample products with FIXED UUIDs
    // CRITICAL: These IDs are stored in cart localStorage
    await queryInterface.bulkInsert('products', [
      {
        id: '550e8400-e29b-41d4-a716-446655440010',  // FIXED UUID
        tenant_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Product One',
        description: 'Description for product one',
        price: 29.99,
        sku: 'PROD-001',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440011',  // FIXED UUID
        tenant_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Product Two',
        description: 'Description for product two',
        price: 49.99,
        sku: 'PROD-002',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    console.log('✅ Default data seeded successfully');
  },

  async down(queryInterface, Sequelize) {
    // Delete in reverse order due to foreign keys
    await queryInterface.bulkDelete('products', {
      id: {
        [Sequelize.Op.in]: [
          '550e8400-e29b-41d4-a716-446655440010',
          '550e8400-e29b-41d4-a716-446655440011',
        ],
      },
    });

    await queryInterface.bulkDelete('users', {
      id: '550e8400-e29b-41d4-a716-446655440002',
    });

    await queryInterface.bulkDelete('tenants', {
      id: '550e8400-e29b-41d4-a716-446655440001',
    });
  },
};
```

### 7. Multi-Environment Migration Script

```bash
#!/bin/bash
# backend/scripts/run-migrations-all-environments.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running from backend directory
if [ ! -f "package.json" ]; then
  echo -e "${RED}Error: Please run this script from the backend directory${NC}"
  exit 1
fi

# Parse arguments
RUN_LOCAL=true
RUN_DEVELOP=true
RUN_PRODUCTION=false
RUN_SEEDERS=false

for arg in "$@"; do
  case $arg in
    --local)
      RUN_LOCAL=true
      RUN_DEVELOP=false
      ;;
    --develop)
      RUN_LOCAL=false
      RUN_DEVELOP=true
      ;;
    --production)
      RUN_PRODUCTION=true
      RUN_LOCAL=false
      RUN_DEVELOP=false
      ;;
    --seed)
      RUN_SEEDERS=true
      ;;
    --help)
      echo "Usage: ./run-migrations-all-environments.sh [options]"
      echo ""
      echo "Options:"
      echo "  --local       Run on local database only"
      echo "  --develop     Run on development database only"
      echo "  --production  Run on production database (with confirmation)"
      echo "  --seed        Also run seeders after migrations"
      echo "  --help        Show this help message"
      exit 0
      ;;
  esac
done

# Function to load .env file safely
load_env() {
  local env_file=$1
  if [ -f "$env_file" ]; then
    export $(grep -v '^#' "$env_file" | xargs)
    return 0
  fi
  return 1
}

# Function to run migration
run_migration() {
  local env_name=$1
  local env_file=$2

  echo -e "${YELLOW}Running migrations for: ${env_name}${NC}"

  if ! load_env "$env_file"; then
    echo -e "${RED}Error: ${env_file} not found${NC}"
    return 1
  fi

  # Check DATABASE_URL
  if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL not found in ${env_file}${NC}"
    return 1
  fi

  # Run migration
  echo "  Checking migration status..."
  npx sequelize-cli db:migrate:status --env "$env_name"

  echo "  Running migrations..."
  if npx sequelize-cli db:migrate --env "$env_name"; then
    echo -e "${GREEN}  ✅ Migrations completed for ${env_name}${NC}"
  else
    echo -e "${RED}  ❌ Migration failed for ${env_name}${NC}"
    return 1
  fi

  # Run seeders if requested
  if [ "$RUN_SEEDERS" = true ]; then
    echo "  Running seeders..."
    if npx sequelize-cli db:seed:all --env "$env_name" 2>/dev/null; then
      echo -e "${GREEN}  ✅ Seeders completed for ${env_name}${NC}"
    else
      echo -e "${YELLOW}  ⚠️ No seeders to run or seeders already applied${NC}"
    fi
  fi

  echo ""
}

# Run local migrations
if [ "$RUN_LOCAL" = true ]; then
  run_migration "local" ".env.local"
fi

# Run development migrations
if [ "$RUN_DEVELOP" = true ]; then
  run_migration "develop" ".env.develop"
fi

# Run production migrations with confirmation
if [ "$RUN_PRODUCTION" = true ]; then
  echo -e "${RED}⚠️  WARNING: You are about to run migrations on PRODUCTION${NC}"
  echo -e "${RED}   This action cannot be easily undone.${NC}"
  echo ""
  read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirm

  if [ "$confirm" = "yes" ]; then
    run_migration "production" ".env.production"
  else
    echo "Production migration cancelled."
  fi
fi

echo -e "${GREEN}✅ Migration script completed${NC}"
```

### 8. Sequelize Configuration

```javascript
// backend/config/database.js
require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'local'}` });

module.exports = {
  local: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: 5,
      min: 1,
      acquire: 30000,
      idle: 10000,
    },
  },
  develop: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 5,
      acquire: 30000,
      idle: 10000,
    },
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 20,
      min: 10,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,  // Required for Neon PostgreSQL
      },
    },
  },
};
```

### 9. .sequelizerc Configuration

```javascript
// backend/.sequelizerc
const path = require('path');

module.exports = {
  config: path.resolve('config', 'database.js'),
  'models-path': path.resolve('src', 'models'),
  'seeders-path': path.resolve('seeders'),
  'migrations-path': path.resolve('migrations'),
};
```

## npm Scripts

```json
{
  "scripts": {
    "migrate": "bash ./scripts/run-migrations-all-environments.sh",
    "migrate:local": "bash ./scripts/run-migrations-all-environments.sh --local",
    "migrate:develop": "bash ./scripts/run-migrations-all-environments.sh --develop",
    "migrate:production": "bash ./scripts/run-migrations-all-environments.sh --production",
    "migrate:seed": "bash ./scripts/run-migrations-all-environments.sh --seed",
    "migrate:status:local": "sequelize-cli db:migrate:status --env local",
    "migrate:status:develop": "sequelize-cli db:migrate:status --env develop",
    "migrate:status:production": "sequelize-cli db:migrate:status --env production",
    "migrate:undo:local": "sequelize-cli db:migrate:undo --env local",
    "migrate:undo:develop": "sequelize-cli db:migrate:undo --env develop",
    "migrate:generate": "sequelize-cli migration:generate --name",
    "seed:generate": "sequelize-cli seed:generate --name"
  }
}
```

## Best Practices

### Migration Rules

1. **Always use transactions** - Ensure atomicity
2. **Always include down()** - Enable rollback
3. **Use UUID primary keys** - MANDATORY for all tables
4. **Add timestamps** - Include created_at and updated_at
5. **Add indexes** - Index foreign keys and frequently queried columns
6. **Use JSONB for flexible data** - Better than multiple columns
7. **Test locally first** - Never run untested migrations on production

### Zero-Downtime Strategies

1. **Add nullable columns first** - Make required later
2. **Never rename columns directly** - Create new, migrate data, drop old
3. **Never change column types directly** - Create new column instead
4. **Deploy app changes before dropping columns** - Ensure app doesn't need old column
5. **Use feature flags** - Gradually roll out schema changes

### UUID Synchronization

```
CRITICAL: Product/Menu Item UUIDs MUST be identical across all environments!

Why:
- Cart stores menuItemIds in localStorage
- Frontend sends these IDs to backend
- Mismatched IDs cause checkout 500 errors

Rule:
- NEVER use uuidv4() in seeders for products
- ALWAYS use fixed UUIDs in seeders
- Verify UUID consistency before deployment
```

## Implementation Checklist

### Initial Setup
- [ ] Install sequelize-cli: `npm install --save-dev sequelize-cli`
- [ ] Create config/database.js
- [ ] Create .sequelizerc
- [ ] Create .env files for each environment
- [ ] Create migrations/ directory
- [ ] Create seeders/ directory

### Per Migration
- [ ] Generate migration file
- [ ] Add up() with transaction
- [ ] Add down() with rollback logic
- [ ] Test locally: `npm run migrate:local`
- [ ] Check status: `npm run migrate:status:local`
- [ ] Run on develop: `npm run migrate:develop`
- [ ] Verify in develop environment
- [ ] Run on production: `npm run migrate:production`

### Security
- [ ] Never commit .env files
- [ ] Store production credentials in AWS Parameter Store
- [ ] Backup production before migrations
- [ ] Test rollback in staging

## Related Commands

- `/implement-migrations` - Set up migration system
- `/implement-multi-tenancy` - Add tenant isolation
- `/run-migrations` - Execute migrations

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-15 | Initial release from DreamiHairCare patterns |
