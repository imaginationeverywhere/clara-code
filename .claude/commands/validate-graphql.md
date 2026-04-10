# Validate GraphQL Command

> **Command:** `validate-graphql`
> **Version:** 1.0.0
> **Category:** Code Quality
> **Agent:** graphql-validator

## Purpose

Validate GraphQL schemas, operations, and resolvers for errors - similar to how `npx tsc --noEmit` validates TypeScript. Catches schema syntax errors, type mismatches, and operation validation issues before runtime.

## Usage

```bash
# Validate all GraphQL (schema + operations + resolvers)
validate-graphql

# Schema validation only
validate-graphql --schema

# Operations validation only
validate-graphql --ops

# Watch mode (re-validate on file changes)
validate-graphql --watch

# Verbose output with additional info
validate-graphql --verbose
```

## NPM Scripts

```bash
# In backend directory
npm run graphql:validate              # Validate all
npm run graphql:validate:schema       # Schema only
npm run graphql:validate:ops          # Operations only
npm run graphql:validate:watch        # Watch mode
```

## Options

| Option | Description | Example |
|--------|-------------|---------|
| `--schema` | Validate schema files only | `validate-graphql --schema` |
| `--ops` | Validate operations only | `validate-graphql --ops` |
| `--watch` | Watch mode, re-validate on changes | `validate-graphql --watch` |
| `--verbose` | Show additional info messages | `validate-graphql --verbose` |
| `--help` | Show help message | `validate-graphql --help` |

## What It Validates

### 1. Schema Validation
- **Syntax errors** - Invalid GraphQL SDL syntax
- **Type definition errors** - Missing types, invalid field types
- **Directive validation** - Invalid directive usage
- **Naming conventions** - PascalCase for types, camelCase for fields

### 2. Operation Validation
- **Query/Mutation/Subscription syntax** - Valid operation syntax
- **Field selection** - Fields exist on types
- **Argument validation** - Required arguments provided
- **Fragment validation** - Fragments used correctly
- **Variable validation** - Variables typed correctly

### 3. Resolver Checks
- **Authentication validation** - context.auth checks present
- **Type safety** - No `any` types in resolvers
- **Error handling** - Async resolvers have try-catch

## Output Example

```
🔍 GraphQL Validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Validating GraphQL Schema...
   Found 4 schema file(s)
   ✓ Schema syntax is valid
   ✓ Schema structure is valid
   Found 15 type definitions

📋 Validating GraphQL Operations...
   Found 8 operation file(s)
   ✓ 8 operation(s) validated successfully

📋 Checking Resolver Types...
   Found 6 resolver file(s)
   ✓ 6 resolver file(s) checked

════════════════════════════════════════
         GraphQL Validation Report
════════════════════════════════════════

📊 Statistics:
   Files checked:       18
   Schemas validated:   1
   Operations validated: 8
   Types found:         15
   Resolvers checked:   6

────────────────────────────────────────
✅ GraphQL validation passed!
```

## Error Examples

### Schema Syntax Error
```
❌ Errors (1):

   [SCHEMA_SYNTAX_ERROR]
   File: src/graphql/schema/user.graphql
   Location: Line 15, Column 3
   Syntax Error: Expected Name, found "}"
```

### Missing Type Error
```
❌ Errors (1):

   [SCHEMA_VALIDATION_ERROR]
   Unknown type "InvalidType"
   Location: Line 23, Column 10
```

### Operation Validation Error
```
❌ Errors (1):

   [OPERATION_VALIDATION_ERROR]
   File: src/graphql/operations/getUser.graphql
   Cannot query field "nonExistentField" on type "User"
   Location: Line 5, Column 5
```

## Pre-Commit Hook Integration

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running pre-commit validation..."

# GraphQL validation
echo "📊 Validating GraphQL..."
cd backend && npm run graphql:validate
if [ $? -ne 0 ]; then
  echo "❌ GraphQL validation failed!"
  exit 1
fi

# TypeScript validation
echo "📊 Validating TypeScript..."
npm run type-check
if [ $? -ne 0 ]; then
  echo "❌ TypeScript validation failed!"
  exit 1
fi

echo "✅ All validations passed!"
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Validate

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: cd backend && npm ci

      - name: Validate GraphQL
        run: cd backend && npm run graphql:validate

      - name: Validate TypeScript
        run: cd backend && npm run type-check
```

## Comparison with TypeScript Validation

| Feature | TypeScript (`tsc --noEmit`) | GraphQL (`graphql:validate`) |
|---------|----------------------------|------------------------------|
| Syntax validation | ✅ | ✅ |
| Type checking | ✅ | ✅ |
| Watch mode | ✅ `tsc -w` | ✅ `--watch` |
| Error locations | ✅ Line/column | ✅ Line/column |
| Exit codes | 0=pass, 1=fail | 0=pass, 1=fail |
| CI integration | ✅ | ✅ |
| Pre-commit hook | ✅ | ✅ |

## Configuration

The script auto-discovers GraphQL files in common locations:

**Schema files:**
- `src/graphql/schema/**/*.graphql`
- `src/schema/**/*.graphql`
- `graphql/**/*.graphql`

**Operation files:**
- `src/graphql/operations/**/*.graphql`
- `src/graphql/queries/**/*.graphql`
- `src/graphql/mutations/**/*.graphql`
- `../frontend/src/**/*.graphql`

**Resolver files:**
- `src/graphql/resolvers/**/*.ts`
- `src/resolvers/**/*.ts`

## Workflow

### Step 1: Run Validation
```bash
cd backend
npm run graphql:validate
```

### Step 2: Fix Errors
Fix any errors reported in the output.

### Step 3: Re-validate
Run validation again to confirm fixes.

### Step 4: Commit
Once validation passes, commit your changes.

## Best Practices

1. **Run before commits** - Add to pre-commit hook
2. **Run in CI** - Add to GitHub Actions workflow
3. **Use watch mode** - During development
4. **Fix warnings** - Address deprecations and naming issues
5. **Keep schema organized** - Separate files by domain

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "graphql not found" | Missing dependency | `npm install graphql` |
| No files found | Wrong directory | Run from `backend/` |
| Slow validation | Large schema | Use `--schema` for faster checks |
| Watch not working | Missing chokidar | `npm install chokidar` |

## Dependencies

```bash
# Required (usually already installed)
npm install graphql @graphql-tools/load @graphql-tools/graphql-file-loader

# Optional (for watch mode)
npm install chokidar
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | No errors |
| 1 | Validation errors found |
| 2 | Configuration/setup errors |

## Integration

### Uses Agent
- `graphql-validator` - Orchestrates validation and fixes

### Uses Skill
- `graphql-validation-standard` - Validation patterns and best practices

## Related Commands

- `/backend-dev` - Full backend development orchestration
- `/debug-fix` - Debug and fix GraphQL issues
- `/test-automation` - Run tests including GraphQL tests

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-14 | Initial creation |
