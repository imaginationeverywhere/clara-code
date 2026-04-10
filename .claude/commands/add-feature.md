# add-feature - Add a New Feature to the Auset Platform

Scaffold a complete Auset Platform feature with all required files. Each feature follows the Ausar Engine pattern: config, schema, resolvers, service, routes, migrations, tests.

## Usage
```
/add-feature <feature-name> [--category <category>] [--neter <neter-name>]
```

## Arguments
- `feature-name` — Name of the feature (e.g., "loyalty-program", "digital-wallet", "fleet-tracking")
- `--category` — Feature category: core, commerce, services, engagement, logistics, ai, enterprise, integrations (default: services)
- `--neter` — Kemetic guardian name (e.g., Sobek for payments, Anpu for security). Auto-assigned if not specified.

## What This Command Creates

```
backend/src/features/<category>/<feature-name>/
  index.ts                    # Module exports + singleton getter
  feature.config.ts           # AusarFeature registration (name, category, dependencies, env vars)
  <feature-name>.service.ts   # Business logic service class
  schema.graphql              # GraphQL type definitions, queries, mutations
  resolvers.ts                # GraphQL resolvers with context.auth?.userId pattern
  routes.ts                   # REST endpoints (optional, under /api/features/<feature-name>/)
  migrations/
    001_create_<feature>_tables.ts  # Initial database migration
  __tests__/
    <feature-name>.spec.ts    # Unit tests with >80% coverage scaffolding
```

## Execution Steps

### Step 1: Validate Feature Name
- Check feature doesn't already exist in `backend/src/features/`
- Validate category is one of the 8 Auset categories
- Generate kebab-case directory name and PascalCase class name

### Step 2: Auto-Assign Neter Guardian
If `--neter` not specified, assign based on category:
| Category | Default Neter | Domain |
|----------|--------------|--------|
| core | Ausar | Foundation |
| commerce | Sobek | Financial |
| services | Seshat | Record-keeping |
| engagement | Hathor | Connection |
| logistics | Nut | Sky/Transport |
| ai | Ra | Intelligence |
| enterprise | Ptah | Craftsmanship |
| integrations | Tehuti | Knowledge |

### Step 3: Create feature.config.ts
```typescript
import { AusarFeature } from '../../ausar.types';

export const <featureName>Config: AusarFeature = {
  name: '<feature-name>',
  displayName: '<Feature Name>',
  category: '<category>',
  npiGuardian: '<Neter>',
  description: '<Feature description>',
  version: '1.0.0',
  dependencies: [],
  envVars: [],
  graphqlSchema: './schema.graphql',
  graphqlResolvers: './resolvers.ts',
  routes: ['./routes.ts'],
  middlewares: [],
  migrations: ['./migrations/001_create_<feature>_tables.ts'],
};

export default <featureName>Config;
```

### Step 4: Create Service Class
```typescript
export class <FeatureName>Service {
  // Business logic methods
  // All database queries use tenant_id for multi-tenant isolation
  // All methods validate context.auth?.userId
}
```

### Step 5: Create GraphQL Schema
- Type definitions for the feature's domain objects
- Query: list, getById, search
- Mutation: create, update, delete
- All operations require authentication

### Step 6: Create Resolvers
- All resolvers use `context.auth?.userId` pattern
- DataLoader integration for N+1 prevention
- Proper error handling with Kemetic error classification (Set, Apep, Isfet)

### Step 7: Create Migration
- Tables include: id (UUID), tenant_id, created_at, updated_at
- Proper indexes on tenant_id and common query fields

### Step 8: Create Tests
- Service unit tests
- Resolver tests with mocked context
- >80% coverage scaffolding

### Step 9: Register Feature
- Verify Ausar Engine discovers the new feature.config.ts
- Run: `cd backend && npm run build` to verify TypeScript compilation
- Report: "Feature <name> registered with Ausar Engine under <category>"

### Step 10: Mirror to .cursor
If applicable, update any .cursor mirrored configs.

## Post-Creation

After the feature is created:
1. Activate with: `/auset-activate <feature-name>`
2. Generate docs with: `/create-feature-docs --feature "<Feature Name>"`
3. The feature is dormant until activated — zero impact on existing code

## Kemetic Framing
```
Ptah (The Divine Craftsman) has forged a new capability.
Feature "<feature-name>" now rests in the Ausar Engine,
guarded by <Neter>, awaiting activation by Auset.
```

## Examples
```
/add-feature loyalty-program --category engagement --neter Hathor
/add-feature fleet-tracking --category logistics
/add-feature tax-reporting --category commerce
/add-feature yapit-payments --category core --neter Sobek
```
