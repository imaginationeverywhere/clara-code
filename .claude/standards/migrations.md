# Database Migrations Standard

**Version:** 1.0.0
**Enforced by:** `/pickup-prompt --migrations`

---

## CRITICAL RULES

### 1. Every migration MUST have both `up` and `down`

**FORBIDDEN:**
```typescript
// ❌ No rollback path — undeployable in emergencies
export async function up(queryInterface) {
  await queryInterface.addColumn("users", "tier", { type: "VARCHAR(20)" });
}
```

**REQUIRED:**
```typescript
// ✅ Always reversible
export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("users", "tier", {
    type: Sequelize.STRING(20),
    allowNull: false,
    defaultValue: "free",
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn("users", "tier");
}
```

---

### 2. Never DROP a column — deprecate first

Columns are dropped in two migrations, two separate deploys:

**Migration 1 (this deploy): mark as deprecated**
```typescript
// ❌ NEVER do this in a single migration
await queryInterface.removeColumn("users", "old_field");

// ✅ DO THIS: add NOT NULL constraint removal first, soft-delete in code
await queryInterface.changeColumn("users", "old_field", {
  type: Sequelize.STRING,
  allowNull: true,  // make nullable so existing code doesn't break
  comment: "DEPRECATED: remove in next migration after code cleanup",
});
```

**Migration 2 (next deploy, after code is removed): then drop**
```typescript
await queryInterface.removeColumn("users", "old_field");
```

---

### 3. Run on all three environments — no exceptions

```bash
# ALWAYS run migrations in this order:
npm run db:migrate              # local (.env.local)
NODE_ENV=development npm run db:migrate   # dev (.env.develop)
NODE_ENV=production npm run db:migrate    # prod (.env.production)
```

**From CLAUDE.md (global rule):**
> Whenever migrations are ran we need run them on local `.env.local`, `.env.develop`, and `.env.production`

---

### 4. Add indexes on every foreign key

```typescript
// ❌ FK without index — table scans on every JOIN
await queryInterface.addColumn("orders", "userId", {
  type: Sequelize.UUID,
  references: { model: "users", key: "id" },
});

// ✅ Always add index
await queryInterface.addColumn("orders", "userId", {
  type: Sequelize.UUID,
  references: { model: "users", key: "id" },
});
await queryInterface.addIndex("orders", ["userId"]);
```

Also add indexes on any column used in `WHERE`, `ORDER BY`, or `GROUP BY` in hot paths.

---

### 5. Migration naming convention

```
YYYYMMDDHHMMSS-action-entity[-detail].js
```

Examples:
- `20260414123000-add-tier-to-users.js`
- `20260414130000-create-talents-table.js`
- `20260414140000-drop-deprecated-old-field-from-users.js`

Never rename an existing migration — Sequelize tracks by filename.

---

### 6. Never modify data in a migration

```typescript
// ❌ Data mutations in migrations are dangerous — lock tables, irreversible
await queryInterface.bulkUpdate("users", { tier: "pro" }, { id: "xyz" });

// ✅ Data migration = separate script run once, not a schema migration
// Put it in: scripts/one-time/2026-04-14-backfill-user-tiers.ts
```

---

### 7. Transaction wrapping for multi-step migrations

```typescript
export async function up(queryInterface, Sequelize) {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    await queryInterface.createTable("subscriptions", { /* ... */ }, { transaction });
    await queryInterface.addIndex("subscriptions", ["userId"], { transaction });
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}
```

---

### Heru-specific tech doc required

Each Heru MUST have `docs/standards/migrations.md` that documents:
- Migration directory path
- ORM in use (Sequelize, raw SQL, Drizzle, etc.)
- Database name per environment
- Any special migration constraints (e.g., zero-downtime requirements)
- List of sensitive tables (require DBA review before dropping)

If `docs/standards/migrations.md` does not exist, create it.
