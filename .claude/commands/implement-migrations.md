# Implement Database Migrations

Set up production-grade Sequelize migration system with multi-environment support, Neon PostgreSQL integration, zero-downtime migrations, seeding strategies, and rollback procedures following DreamiHairCare's battle-tested patterns.

## Command Usage

```
/implement-migrations [options]
```

### Options
- `--full` - Complete migration system setup (default)
- `--init` - Initialize Sequelize CLI configuration only
- `--create [name]` - Create new migration file
- `--seed [name]` - Create new seeder file
- `--run` - Run pending migrations on all environments
- `--audit` - Audit existing migration status

### Environment Options
- `--local` - Run on local database only
- `--develop` - Run on development database only
- `--production` - Run on production database (with confirmation)

## Pre-Implementation Checklist

### Requirements
- [ ] Node.js 18+ installed
- [ ] PostgreSQL database accessible
- [ ] Backend workspace configured
- [ ] Environment files created

### Dependencies
```bash
cd backend
npm install sequelize sequelize-cli pg pg-hstore
npm install -D @types/sequelize
```

## Implementation Phases

### Phase 1: Sequelize CLI Configuration

#### 1.1 Create .sequelizerc
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

#### 1.2 Create Database Configuration
```javascript
// backend/config/database.js
require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'local'}` });

module.exports = {
  local: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: console.log,
    pool: { max: 5, min: 1, acquire: 30000, idle: 10000 },
  },
  develop: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false,
    pool: { max: 10, min: 5, acquire: 30000, idle: 10000 },
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false,
    pool: { max: 20, min: 10, acquire: 30000, idle: 10000 },
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  },
};
```

#### 1.3 Create Directory Structure
```bash
mkdir -p backend/migrations backend/seeders backend/config
```

### Phase 2: Multi-Environment Migration Script

#### 2.1 Create Migration Script
```bash
# Create backend/scripts/run-migrations-all-environments.sh
# See database-migration-standard skill for complete script
```

**Key features:**
- Environment validation
- Safe .env file loading
- Transaction support
- Production confirmation prompt
- Colored output
- Error handling

#### 2.2 Make Script Executable
```bash
chmod +x backend/scripts/run-migrations-all-environments.sh
```

### Phase 3: npm Scripts Setup

#### 3.1 Add to package.json
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

### Phase 4: Create First Migration

#### 4.1 Generate Migration
```bash
cd backend
npm run migrate:generate create-users-table
```

#### 4.2 Edit Migration File
```javascript
// backend/migrations/YYYYMMDD-create-users-table.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createTable('users', {
        // UUID primary key (MANDATORY)
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        // Your columns here
        email: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
        },
        // Timestamps
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
      }, { transaction });

      // Add indexes
      await queryInterface.addIndex('users', ['email'], { transaction });

      await transaction.commit();
      console.log('✅ Migration completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  // MANDATORY: Always include down() for rollback
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  },
};
```

#### 4.3 Run Migration
```bash
# Test locally first
npm run migrate:local

# Check status
npm run migrate:status:local

# Run on develop
npm run migrate:develop

# Run on production (with confirmation)
npm run migrate:production
```

### Phase 5: Create Seeders

#### 5.1 Generate Seeder
```bash
npm run seed:generate seed-default-data
```

#### 5.2 Edit Seeder (Use Fixed UUIDs!)
```javascript
// backend/seeders/YYYYMMDD-seed-default-data.js
'use strict';

// CRITICAL: Use FIXED UUIDs for data that must be consistent
// Example: menu_items in cart localStorage must match database

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [{
      // FIXED UUID - never use uuidv4() here
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'admin@example.com',
      created_at: new Date(),
      updated_at: new Date(),
    }]);

    console.log('✅ Seeder completed successfully');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      id: '550e8400-e29b-41d4-a716-446655440001',
    });
  },
};
```

#### 5.3 Run Seeders
```bash
npm run migrate:seed
```

### Phase 6: Environment Configuration

#### 6.1 Create Environment Files
```bash
# backend/.env.local
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/myapp_local

# backend/.env.develop
NODE_ENV=development
DATABASE_URL=postgresql://user:password@neon.tech/myapp_develop

# backend/.env.production
NODE_ENV=production
DATABASE_URL=postgresql://user:password@neon.tech/myapp_production
```

#### 6.2 Add to .gitignore
```
.env.local
.env.develop
.env.production
```

## Migration Patterns

### Add Column (Safe)
```javascript
// Adding nullable column is safe
await queryInterface.addColumn('users', 'phone', {
  type: Sequelize.STRING,
  allowNull: true,  // Start nullable
}, { transaction });
```

### Add Required Column (Two-Step)
```javascript
// Step 1: Add as nullable, update data
await queryInterface.addColumn('users', 'tenant_id', {
  type: Sequelize.UUID,
  allowNull: true,
}, { transaction });

await queryInterface.sequelize.query(
  `UPDATE users SET tenant_id = 'default-uuid' WHERE tenant_id IS NULL`,
  { transaction }
);

// Step 2: Make NOT NULL
await queryInterface.changeColumn('users', 'tenant_id', {
  type: Sequelize.UUID,
  allowNull: false,
}, { transaction });
```

### Add Index
```javascript
await queryInterface.addIndex('orders', ['tenant_id', 'customer_id'], {
  name: 'idx_orders_tenant_customer',
  transaction,
});
```

### Modify Column (Careful!)
```javascript
// SAFE: Expanding size
await queryInterface.changeColumn('products', 'name', {
  type: Sequelize.STRING(500),  // Was 255
}, { transaction });

// UNSAFE: Shrinking size (may truncate)
// Consider: Create new column, migrate data, drop old
```

## File Structure

```
backend/
├── .sequelizerc
├── config/
│   └── database.js
├── migrations/
│   ├── 20250101-create-users-table.js
│   ├── 20250102-create-products-table.js
│   └── 20250103-add-tenant-id.js
├── seeders/
│   ├── 20250101-seed-admin-user.js
│   └── 20250102-seed-products.js
├── scripts/
│   └── run-migrations-all-environments.sh
└── src/
    └── models/
```

## Verification Checklist

### Configuration
- [ ] .sequelizerc created
- [ ] config/database.js configured
- [ ] Environment files created
- [ ] Migration script executable

### Migrations
- [ ] Directory structure created
- [ ] First migration generated
- [ ] down() method included
- [ ] Indexes defined
- [ ] Local migration successful
- [ ] Develop migration successful

### Seeders
- [ ] Seeder directory created
- [ ] Fixed UUIDs used (not uuidv4())
- [ ] down() method included
- [ ] Seeder runs successfully

### npm Scripts
- [ ] All migrate scripts added
- [ ] Status scripts working
- [ ] Undo scripts configured

## CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/migration.yml
name: Run Migrations

on:
  push:
    branches: [develop]
    paths:
      - 'backend/migrations/**'

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd backend
          npm ci

      - name: Run migrations
        run: |
          cd backend
          ./scripts/run-migrations-all-environments.sh --develop
        env:
          DATABASE_URL: ${{ secrets.DEV_DATABASE_URL }}
```

## Troubleshooting

### Migration Fails
```bash
# Check status
npm run migrate:status:local

# Rollback last migration
npm run migrate:undo:local

# Fix migration and re-run
npm run migrate:local
```

### Permission Denied
```bash
chmod +x backend/scripts/run-migrations-all-environments.sh
```

### DATABASE_URL Not Found
- Check .env file exists
- Verify variable name (DATABASE_URL, not DB_URL)
- Ensure no typos

### Neon Connection Issues
- Verify connection string format
- Check SSL configuration
- Ensure IP is not blocked

## Related Skills

- **database-migration-standard** - Complete migration patterns
- **multi-tenancy-standard** - tenant_id migrations
- **file-storage-standard** - File metadata tables

## Related Commands

- `/implement-multi-tenancy` - Multi-tenant architecture
- `/run-migrations` - Execute migrations
