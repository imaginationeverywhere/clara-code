# Regression Testing Setup Command

**Version:** 1.0.0
**Purpose:** Comprehensive regression testing setup with UltraThink integration
**Complexity:** High - Multi-step project configuration

## Overview

This command sets up a production-grade regression testing system for any project in the boilerplate with:
- ✅ Three-tier testing pyramid (Smoke → Regression → Full Suite)
- ✅ UltraThink knowledge graph integration
- ✅ Automated registry generation
- ✅ CI/CD pipeline configuration
- ✅ GitHub Actions workflows
- ✅ Smart test selection and prioritization

## Usage

```bash
# Full setup for current project
/regression-testing-setup

# Setup specific project
/regression-testing-setup --project=dreamihaircare

# Setup with specific scope
/regression-testing-setup --scope=frontend
/regression-testing-setup --scope=backend
/regression-testing-setup --scope=full

# Dry run to see what will be created
/regression-testing-setup --dry-run

# Update existing setup
/regression-testing-setup --update
```

## What Gets Created

### 1. Test Structure

```
project/
├── __tests__/
│   ├── regression/
│   │   ├── smoke.spec.ts              ← Critical paths only
│   │   ├── features/
│   │   │   ├── [feature-1].spec.ts
│   │   │   ├── [feature-2].spec.ts
│   │   │   └── ultrathink-registry.json
│   │   ├── critical-flows/
│   │   │   └── [user-journey].spec.ts
│   │   ├── fixtures/
│   │   │   ├── factories.ts
│   │   │   └── mocks.ts
│   │   └── utils/
│   │       └── test-helpers.ts
│   └── __snapshots__/
├── jest.config.js                     ← Configured for regression tests
├── ultrathink-registry.json           ← Auto-generated knowledge graph
└── test-setup.ts
```

### 2. Configuration Files

**jest.config.js** - Optimized for regression testing:
- Coverage thresholds (80%+ statements/branches)
- Test pattern matching for regression suite
- Parallelization configuration
- Coverage reporters (text, HTML, LCOV)

**ultrathink-registry.json** - Knowledge graph:
- Features and test coverage mapping
- Critical flow registry
- Impact scoring and risk analysis
- Business value metadata

**test-setup.ts** - Global test configuration:
- Database connection pooling
- Mocking configuration
- Environment variable setup

### 3. GitHub Actions Workflows

**.github/workflows/smoke-tests.yml**:
- Triggers on every push
- Runs critical path tests (5-10 min)
- Blocks further CI if fails

**.github/workflows/regression-tests.yml**:
- Triggers on pull requests
- Runs full regression suite (20-30 min)
- Blocks merge if fails
- Uploads coverage reports

**.github/workflows/full-test-suite.yml**:
- Scheduled nightly run (1 hour)
- Complete testing including E2E
- Generates coverage trends

### 4. Package.json Scripts

```json
{
  "scripts": {
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "test:smoke": "jest --testPathPattern='smoke'",
    "test:regression": "jest --testPathPattern='regression'",
    "test:regression:coverage": "jest --testPathPattern='regression' --coverage",
    "test:regression:watch": "jest --testPathPattern='regression' --watch",
    "test:regression:smart": "npm run ultrathink:smart-test-selection && jest $TEST_SUBSET",
    "ultrathink:generate-registry": "ts-node scripts/ultrathink-registry-generator.ts",
    "ultrathink:sync-registry": "curl -X POST $ULTRATHINK_API_URL/registries -d @ultrathink-registry.json",
    "ultrathink:get-insights": "curl $ULTRATHINK_API_URL/projects/$PROJECT_ID/insights",
    "ultrathink:smart-test-selection": "node scripts/smart-test-selector.js",
    "ci:smoke": "npm run test:smoke",
    "ci:regression": "npm run test:regression:coverage"
  }
}
```

### 5. Documentation

**docs/REGRESSION_TESTING.md**:
- Project-specific regression testing guide
- Feature registry documentation
- Running tests locally
- CI/CD integration details

## Step-by-Step Setup

### Step 1: Initialize Test Structure

```
mkdir -p __tests__/regression/{features,critical-flows,fixtures,utils}
mkdir -p .github/workflows
```

### Step 2: Copy Configuration Files

- Copy `jest.config.js` template
- Copy `test-setup.ts` template
- Create `ultrathink-registry.json`

### Step 3: Create Smoke Tests

```typescript
// __tests__/regression/smoke.spec.ts
// - Critical paths only
// - Server health checks
// - Authentication flow
// - Core page rendering
```

### Step 4: Generate Feature Tests

```
/regression-testing-setup --generate-features
```

Creates test files for:
- Authentication/Authorization
- Core business logic
- Payment processing (if applicable)
- Data persistence

### Step 5: Configure CI/CD

Sets up GitHub Actions workflows:
- Smoke tests on every push
- Regression tests on PR
- Full suite nightly

### Step 6: Generate Registry

```
npm run ultrathink:generate-registry
```

Analyzes test files and creates:
- Feature registry
- Impact scores
- Risk assessment
- Coverage metrics

### Step 7: Sync with UltraThink

```
npm run ultrathink:sync-registry
```

Uploads to UltraThink for:
- Knowledge graph building
- AI analysis
- Coverage insights
- Regression risk scoring

## Project-Specific Customization

After setup, customize for your business domain:

### DreamiHairCare (Salon Management)
```json
{
  "businessDomain": "salon",
  "criticalFlows": [
    "user-login-to-booking",
    "appointment-confirmation",
    "payment-processing"
  ],
  "highRiskAreas": [
    "appointment-conflicts",
    "double-charging",
    "timezone-issues"
  ]
}
```

### Pink-Collar-Contractors (Job Marketplace)
```json
{
  "businessDomain": "marketplace",
  "criticalFlows": [
    "job-posting-to-contract",
    "contractor-verification",
    "payment-settlement"
  ],
  "highRiskAreas": [
    "contractor-fraud",
    "payment-disputes",
    "sla-violations"
  ]
}
```

### QuikAction (Task Management)
```json
{
  "businessDomain": "taskmanagement",
  "criticalFlows": [
    "task-creation-to-assignment",
    "task-completion",
    "notification-delivery"
  ],
  "highRiskAreas": [
    "concurrent-edits",
    "real-time-sync",
    "notification-delays"
  ]
}
```

### StacksBabiee (Fashion E-Commerce)
```json
{
  "businessDomain": "ecommerce",
  "criticalFlows": [
    "browse-to-checkout",
    "payment-processing",
    "order-fulfillment"
  ],
  "highRiskAreas": [
    "inventory-sync",
    "checkout-abandonment",
    "shipping-integration"
  ]
}
```

## Running Tests

### Local Development

```bash
# Run smoke tests (quick feedback)
npm run test:smoke

# Run full regression suite
npm run test:regression

# Run with coverage report
npm run test:regression:coverage

# Watch mode for TDD
npm run test:regression:watch

# Run specific feature tests
npm run test:regression -- salon-booking
npm run test:regression -- payment-processing
```

### CI/CD Pipeline

```bash
# GitHub Actions will automatically:
# 1. Run smoke tests on every commit
# 2. Run regression tests on every PR
# 3. Run full suite nightly
# 4. Generate coverage reports
# 5. Update UltraThink insights
```

### Smart Test Selection

```bash
# Run only tests affected by code changes
npm run test:regression:smart

# Uses UltraThink to:
# - Identify changed modules
# - Find affected tests
# - Prioritize by impact score
# - Run in parallel
```

## Monitoring & Insights

### View UltraThink Insights

```bash
npm run ultrathink:get-insights
```

Returns:
- Test coverage by feature
- High-risk areas with low coverage
- Regression risk scores
- Recommended optimizations
- Trend analysis

### Monitor Test Metrics

**Dashboard includes:**
- Test execution times
- Coverage trends
- Failure rates
- Most flaky tests
- Performance regressions

### Update Registry

After adding new tests or features:

```bash
npm run ultrathink:generate-registry
npm run ultrathink:sync-registry
```

## Advanced Configuration

### Custom Test Timeout

Edit `jest.config.js`:

```javascript
module.exports = {
  testTimeout: 15000, // 15 seconds
};
```

### Parallel Test Execution

```javascript
module.exports = {
  maxWorkers: '50%', // Use 50% of available CPUs
};
```

### Custom Coverage Thresholds

```javascript
module.exports = {
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './src/critical/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    }
  }
};
```

## Troubleshooting

### Tests Not Running

```bash
# Verify test file patterns
npm run test:regression -- --listTests

# Check Jest configuration
npm run test:regression -- --showConfig
```

### Registry Generation Fails

```bash
# Check test files exist
find . -name "*.spec.ts" -o -name "*.test.ts"

# Verify test framework
grep -E "(jest|vitest|mocha)" package.json
```

### GitHub Actions Workflow Issues

- Check `.github/workflows/` files exist
- Verify workflow permissions
- Check environment variables in GitHub Settings

## Next Steps

After setup completes:

1. ✅ **Create feature tests** - Add tests for each business feature
2. ✅ **Define critical flows** - Map user journeys in `ultrathink-registry.json`
3. ✅ **Run local tests** - Verify everything works: `npm run test:regression`
4. ✅ **Enable CI/CD** - Push to GitHub and watch workflows run
5. ✅ **Monitor insights** - Check UltraThink dashboard regularly
6. ✅ **Iterate & improve** - Add tests as gaps are identified

## Questions?

See comprehensive guides:
- **[REGRESSION_TESTING_WITH_ULTRATHINK.md](../../docs/REGRESSION_TESTING_WITH_ULTRATHINK.md)** - Complete strategy
- **[TESTING_STRATEGY_TEMPLATE.md](../../docs/TESTING_STRATEGY_TEMPLATE.md)** - Generic testing patterns
- **[TESTING_QUICK_START.md](../../docs/TESTING_QUICK_START.md)** - 30-minute setup
