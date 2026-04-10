# Implement Testing Infrastructure

Set up production-grade testing infrastructure with Jest unit testing, Playwright E2E testing, three-tier test pyramid strategy, and CI/CD integration following DreamiHairCare's battle-tested patterns.

## Command Usage

```
/implement-testing [options]
```

### Options
- `--full` - Complete testing stack (Jest + Playwright) (default)
- `--unit-only` - Jest unit testing only
- `--e2e-only` - Playwright E2E testing only
- `--ci-only` - GitHub Actions workflows only
- `--audit` - Audit existing test configuration

### Feature Options
- `--with-coverage` - Include coverage thresholds and reporting
- `--with-visual` - Include visual regression testing
- `--with-a11y` - Include accessibility testing
- `--with-performance` - Include performance testing

## Pre-Implementation Checklist

### Dependencies Required
- [ ] Node.js 18+
- [ ] TypeScript configured
- [ ] Next.js or React app (for frontend)
- [ ] Express/NestJS (for backend)

### Package Installation

```bash
# Frontend Testing
npm install -D jest @types/jest jest-environment-jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  @playwright/test

# Backend Testing
npm install -D jest @types/jest ts-jest

# Optional: Visual/A11y Testing
npm install -D @axe-core/playwright percy-playwright
```

## Implementation Phases

### Phase 1: Jest Configuration

#### 1.1 Frontend Jest Setup
See **testing-strategy-standard** skill for complete configuration.

Create files:
- `frontend/jest.config.js`
- `frontend/jest.setup.js`

#### 1.2 Backend Jest Setup
Create files:
- `backend/jest.config.js`
- `backend/jest.setup.ts`

### Phase 2: Playwright Configuration

#### 2.1 Create playwright.config.ts
See **testing-strategy-standard** skill for complete configuration.

Key features:
- Multi-browser support
- Authentication state management
- Screenshot/video on failure
- Web server auto-start

#### 2.2 Set Up Authentication
Create `tests/e2e/auth.setup.ts` for pre-authenticated test states.

### Phase 3: Test Structure

#### 3.1 Create Directory Structure
```
frontend/
├── src/__tests__/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── tests/e2e/
    ├── fixtures/
    ├── helpers/
    ├── pages/
    └── specs/
        ├── auth/
        ├── ecommerce/
        └── admin/
```

#### 3.2 Create Page Objects
See **testing-strategy-standard** skill for Page Object pattern examples.

### Phase 4: npm Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:smoke": "jest --testPathPattern=smoke/ --passWithNoTests",
    "test:regression": "jest --testPathPattern='(unit|integration)/' --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:report": "playwright show-report",
    "test:full": "npm run test:regression && npm run test:e2e"
  }
}
```

### Phase 5: CI/CD Integration

#### 5.1 Smoke Tests Workflow
```yaml
# .github/workflows/smoke-tests.yml
name: Smoke Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  smoke-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run smoke tests
        run: npm run test:smoke

      - name: Upload results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: smoke-test-results
          path: coverage/
```

#### 5.2 Regression Tests Workflow
```yaml
# .github/workflows/regression-tests.yml
name: Regression Tests

on:
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run regression tests
        run: npm run test:regression

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true
```

#### 5.3 E2E Tests Workflow
```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * *' # Nightly at 2 AM

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 60

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          BASE_URL: http://localhost:3000
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

## File Structure

```
project/
├── frontend/
│   ├── jest.config.js
│   ├── jest.setup.js
│   ├── playwright.config.ts
│   ├── src/__tests__/
│   └── tests/e2e/
├── backend/
│   ├── jest.config.js
│   ├── jest.setup.ts
│   └── src/__tests__/
├── .github/workflows/
│   ├── smoke-tests.yml
│   ├── regression-tests.yml
│   └── e2e-tests.yml
└── playwright/
    └── .auth/
```

## Coverage Thresholds

### Default Requirements
```javascript
coverageThreshold: {
  global: {
    statements: 60,
    branches: 60,
    functions: 60,
    lines: 60,
  },
}
```

### Critical Path Requirements (100%)
- Authentication flows
- Payment processing
- Checkout process
- Order management

## Verification Checklist

### Jest Setup
- [ ] jest.config.js created
- [ ] jest.setup.js configured
- [ ] Module aliases working
- [ ] Coverage thresholds set
- [ ] Test files discovered

### Playwright Setup
- [ ] playwright.config.ts created
- [ ] Browser projects configured
- [ ] Auth setup working
- [ ] Page objects created
- [ ] Fixtures defined

### CI/CD
- [ ] Smoke tests on every push
- [ ] Regression tests on PRs
- [ ] E2E tests nightly
- [ ] Coverage reporting
- [ ] Test artifacts uploaded

### Test Quality
- [ ] 60%+ coverage
- [ ] Critical paths tested
- [ ] Edge cases covered
- [ ] Error scenarios tested

## Related Skills

- **testing-strategy-standard** - Complete testing patterns
- **ci-cd-pipeline-standard** - CI/CD workflows

## Related Commands

- `/implement-ci-cd` - CI/CD pipeline setup
- `/implement-security-audit` - Security testing
