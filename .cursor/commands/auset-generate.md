---
description: "Scaffold feature implementation from Ptah template (Story 16.8)"
---

# Auset Generate — Ptah Shapes a Feature From the Template

## Usage
```
/auset-generate <feature-name> [--category <category>] [--neter <neter-name>]
```

## Description

Scaffolds a complete feature implementation from the canonical template in `backend/src/features/_template/`. Use this to populate the 47 feature stubs with consistent, pattern-compliant code (context.auth?.userId, tenant isolation, Kemetic naming, tests).

## Arguments

- **feature-name** — Kebab-case name (e.g. `loyalty-program`, `digital-wallet`). Required.
- **--category** — One of: core, commerce, services, engagement, logistics, ai, enterprise, integrations. Default: **services**.
- **--neter** — Kemetic guardian name (e.g. Sobek, Anpu). Auto-assigned from category if omitted.

## Executable Command Flow

When the user runs `/auset-generate <feature-name>`:

1. **Parse arguments**: feature name (required), optional `--category`, optional `--neter`.

2. **Run the generator script** from the project root:
   ```bash
   cd backend && npx ts-node -r tsconfig-paths/register scripts/auset-generate.ts <feature-name> [--category <category>] [--neter <neter>]
   ```
   The script:
   - Validates feature name (kebab-case) and that the target directory does not already exist
   - Reads all files from `backend/src/features/_template/` (including `migrations/`, `__tests__/`)
   - Substitutes placeholders: feature name, PascalCase name, category, neter, display name, import paths
   - Writes to `backend/src/features/<category>/<feature-name>/` with correct filenames:
     - `feature.config.ts`, `schema.graphql`, `resolvers.ts`, `<feature-name>.service.ts`, `routes.ts`
     - `migrations/001_create_<feature-name>_tables.ts`
     - `__tests__/<feature-name>.spec.ts`
   - Creates `index.ts` that exports `featureConfig`

3. **After generation**:
   - The feature is **dormant** until activated: `/auset-activate <feature-name>`
   - Run `cd backend && npm run build` to verify TypeScript compiles
   - Optionally run tests: `npm run test -- --testPathPattern=<feature-name>`

## Template Contents (What Gets Generated)

| File | Purpose |
|------|--------|
| feature.config.ts | Ausar feature registration (name, category, dependencies, envVars, graphqlSchema, graphqlResolvers, routes, migrations) |
| schema.graphql | GraphQL types, Query, Mutation (placeholder entity CRUD) |
| resolvers.ts | Resolvers with `context.auth?.userId` and requireAuth |
| \<feature\>.service.ts | Business logic; tenant_id isolation; placeholder CRUD |
| routes.ts | REST under /api/features/\<feature\>/ (optional) |
| migrations/001_create_\<feature\>_tables.ts | Sequelize migration with id, tenant_id, created_at, updated_at |
| __tests__/\<feature\>.spec.ts | Config + service tests (scaffolding for >80% coverage) |

## Neter Defaults by Category

| Category | Default Neter |
|----------|----------------|
| core | Ausar |
| commerce | Sobek |
| services | Seshat |
| engagement | Hathor |
| logistics | Nut |
| ai | Ra |
| enterprise | Ptah |
| integrations | Tehuti |

## Kemetic Framing

```
Ptah (the divine craftsman) has forged a new capability from the template.
Feature "<feature-name>" now rests in backend/src/features/<category>/<feature-name>/,
guarded by <Neter>, awaiting activation by Auset.
```

## Examples

```
/auset-generate loyalty-program --category engagement
/auset-generate digital-wallet --category logistics --neter Nut
/auset-generate tax-reporting --category commerce
```

## Dependencies

- Story 16.8 template files in `backend/src/features/_template/`
- Stories 16.1–16.4 (activation, schema loader, route loader, migration runner) for activation after generation
