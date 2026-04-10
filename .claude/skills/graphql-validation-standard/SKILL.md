# GraphQL Validation Standard

> **Skill:** `graphql-validation-standard`
> **Version:** 1.0.0
> **Category:** Code Quality
> **Trigger:** GraphQL schema/resolver changes, pre-commit validation, CI/CD pipelines

## Overview

Comprehensive GraphQL validation patterns for ensuring schema correctness, operation validity, and resolver type safety. This skill provides the same level of validation for GraphQL that TypeScript provides for JavaScript.

## When to Use This Skill

- Before committing GraphQL schema changes
- When adding new queries, mutations, or subscriptions
- During CI/CD pipeline validation
- When debugging GraphQL errors
- When setting up new GraphQL projects

## Validation Categories

### 1. Schema Syntax Validation

Validates GraphQL SDL (Schema Definition Language) syntax.

**What it checks:**
- Keyword correctness (`type`, `input`, `enum`, `interface`, `union`, `scalar`)
- Field definitions and types
- Directive syntax and placement
- Comments and descriptions

**Example errors:**
```graphql
# ❌ Missing field type
type User {
  id: ID!
  name        # ERROR: Missing type
}

# ✅ Correct
type User {
  id: ID!
  name: String!
}
```

### 2. Type Definition Validation

Validates type references and relationships.

**What it checks:**
- All referenced types exist
- Field types are valid
- Interface implementations are complete
- Union types have valid members

**Example errors:**
```graphql
# ❌ Unknown type reference
type Order {
  customer: UnknownType!  # ERROR: Type not defined
}

# ✅ Correct
type Order {
  customer: User!
}
```

### 3. Directive Validation

Validates directive usage and placement.

**What it checks:**
- Directives are defined
- Directives are used in valid locations
- Required directive arguments provided

**Example errors:**
```graphql
# ❌ Invalid directive location
type User @deprecated {  # ERROR: @deprecated not valid on types
  name: String!
}

# ✅ Correct
type User {
  oldName: String @deprecated(reason: "Use 'name' instead")
  name: String!
}
```

### 4. Operation Validation

Validates queries, mutations, and subscriptions against the schema.

**What it checks:**
- Field selections exist on types
- Required arguments provided
- Variable types match expected types
- Fragments used correctly

**Example errors:**
```graphql
# ❌ Unknown field
query GetUser {
  user(id: "123") {
    nonExistentField  # ERROR: Field doesn't exist
  }
}

# ✅ Correct
query GetUser {
  user(id: "123") {
    id
    name
    email
  }
}
```

### 5. Naming Convention Validation

Enforces consistent naming across the schema.

**Conventions:**
- **Types:** PascalCase (e.g., `User`, `OrderItem`)
- **Fields:** camelCase (e.g., `firstName`, `createdAt`)
- **Enums:** UPPER_SNAKE_CASE values (e.g., `ACTIVE`, `PENDING_APPROVAL`)
- **Input types:** Suffix with `Input` (e.g., `CreateUserInput`)

**Example warnings:**
```graphql
# ⚠️ Warning: Should use PascalCase
type user_profile {  # Should be UserProfile
  first_name: String!  # Should be firstName
}

# ✅ Correct
type UserProfile {
  firstName: String!
}
```

### 6. Deprecation Tracking

Identifies and reports deprecated fields and types.

**What it checks:**
- Fields marked with `@deprecated`
- Types with deprecation reasons
- Usage of deprecated fields in operations

**Example output:**
```
⚠️ Deprecated field: User.oldName is deprecated: Use 'name' instead
⚠️ Deprecated field: Order.legacyStatus is deprecated: Use 'status' instead
```

## Resolver Validation Patterns

### Authentication Check Pattern

```typescript
// ✅ Required pattern: Always check context.auth
const resolvers = {
  Query: {
    me: async (_, __, context) => {
      if (!context.auth?.userId) {
        throw new AuthenticationError('Authentication required');
      }
      return context.loaders.userLoader.load(context.auth.userId);
    },
  },
};
```

### DataLoader Pattern

```typescript
// ✅ Required pattern: Use DataLoader for relationships
const resolvers = {
  Order: {
    // ❌ WRONG: N+1 query problem
    customer: async (order) => {
      return await User.findByPk(order.customerId);
    },

    // ✅ CORRECT: Use DataLoader
    customer: (order, _, context) => {
      return context.loaders.userLoader.load(order.customerId);
    },
  },
};
```

### Error Handling Pattern

```typescript
// ✅ Required pattern: Proper error handling
const resolvers = {
  Mutation: {
    createOrder: async (_, args, context) => {
      try {
        // Validate input
        if (!args.input.items?.length) {
          throw new UserInputError('Order must have at least one item');
        }

        // Business logic
        const order = await OrderService.create(args.input, context.auth.userId);
        return order;
      } catch (error) {
        // Log error
        logger.error('Failed to create order', { error, args });

        // Re-throw known errors
        if (error instanceof UserInputError || error instanceof AuthenticationError) {
          throw error;
        }

        // Wrap unknown errors
        throw new ApolloError('Failed to create order', 'ORDER_CREATE_FAILED');
      }
    },
  },
};
```

## Validation Script Usage

### Basic Validation

```bash
# From backend directory
npm run graphql:validate
```

### Schema Only

```bash
npm run graphql:validate:schema
```

### Operations Only

```bash
npm run graphql:validate:ops
```

### Watch Mode

```bash
npm run graphql:validate:watch
```

## Pre-Commit Hook Setup

### Using Husky

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running GraphQL validation..."
cd backend && npm run graphql:validate

if [ $? -ne 0 ]; then
  echo "❌ GraphQL validation failed!"
  exit 1
fi

echo "✅ GraphQL validation passed!"
```

### Manual Git Hook

```bash
# .git/hooks/pre-commit
#!/bin/sh

echo "📊 Validating GraphQL..."
cd backend && npm run graphql:validate

if [ $? -ne 0 ]; then
  echo "❌ GraphQL validation failed. Please fix errors before committing."
  exit 1
fi
```

## CI/CD Integration

### GitHub Actions

```yaml
name: GraphQL Validation

on:
  push:
    paths:
      - 'backend/src/graphql/**'
      - 'frontend/src/**/*.graphql'
  pull_request:
    paths:
      - 'backend/src/graphql/**'
      - 'frontend/src/**/*.graphql'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: cd backend && npm ci

      - name: Validate GraphQL Schema
        run: cd backend && npm run graphql:validate

      - name: Validate TypeScript
        run: cd backend && npm run type-check
```

### GitLab CI

```yaml
graphql-validation:
  stage: test
  script:
    - cd backend
    - npm ci
    - npm run graphql:validate
  only:
    changes:
      - backend/src/graphql/**/*
      - frontend/src/**/*.graphql
```

## Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| `SCHEMA_SYNTAX_ERROR` | Invalid GraphQL syntax | Fix syntax in schema file |
| `SCHEMA_VALIDATION_ERROR` | Type/field reference error | Check type definitions |
| `SCHEMA_BUILD_ERROR` | Schema couldn't be built | Review entire schema |
| `OPERATION_SYNTAX_ERROR` | Invalid operation syntax | Fix query/mutation syntax |
| `OPERATION_VALIDATION_ERROR` | Operation doesn't match schema | Update operation or schema |
| `FILE_READ_ERROR` | Couldn't read file | Check file permissions |
| `DEPRECATED_FIELD` | Using deprecated field | Update to new field |
| `DEPRECATED_TYPE` | Using deprecated type | Update to new type |
| `NAMING_CONVENTION` | Naming doesn't follow convention | Rename to follow convention |
| `RESOLVER_AUTH_CHECK` | Missing auth check | Add context.auth validation |
| `ANY_TYPE_USAGE` | Using `any` type | Define proper types |
| `ASYNC_ERROR_HANDLING` | Missing error handling | Add try-catch blocks |

## Best Practices Checklist

### Schema Design
- [ ] All types use PascalCase
- [ ] All fields use camelCase
- [ ] All enums use UPPER_SNAKE_CASE
- [ ] Input types suffixed with `Input`
- [ ] No circular type references
- [ ] All fields have descriptions

### Operations
- [ ] All operations have names
- [ ] Variables are typed correctly
- [ ] Fragments are defined and used
- [ ] No unused variables
- [ ] No duplicate operation names

### Resolvers
- [ ] All protected resolvers check `context.auth`
- [ ] DataLoader used for relationships
- [ ] Proper error handling with try-catch
- [ ] No `any` types in resolver code
- [ ] Proper TypeScript types for all parameters

## Common Issues and Solutions

### Issue: "Cannot find module 'graphql'"

```bash
# Solution: Install required dependencies
npm install graphql @graphql-tools/load @graphql-tools/graphql-file-loader
```

### Issue: No schema files found

```bash
# Check your schema directory structure
ls -la src/graphql/schema/

# Expected structure:
# src/graphql/schema/
# ├── user.graphql
# ├── order.graphql
# └── common.graphql
```

### Issue: Schema builds but operations fail

```bash
# Validate schema first
npm run graphql:validate:schema

# Then validate operations
npm run graphql:validate:ops

# Check for type mismatches between frontend and backend
```

### Issue: Watch mode not working

```bash
# Install chokidar for file watching
npm install chokidar

# Then run watch mode
npm run graphql:validate:watch
```

## Integration with Editor

### VS Code

Install the GraphQL extension for real-time validation:

```json
// .vscode/settings.json
{
  "graphql.schemaPath": "backend/src/graphql/schema/**/*.graphql",
  "graphql.documents": [
    "frontend/src/**/*.graphql",
    "backend/src/graphql/operations/**/*.graphql"
  ]
}
```

### JetBrains IDEs

Use the GraphQL plugin with these settings:
- Schema path: `backend/src/graphql/schema`
- Operations path: `frontend/src`, `backend/src/graphql/operations`

## Related Resources

- [GraphQL Spec](https://spec.graphql.org/)
- [Apollo Server Documentation](https://www.apollographql.com/docs/apollo-server/)
- [graphql-js Validation](https://graphql.org/graphql-js/validation/)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-14 | Initial creation |
