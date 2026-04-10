---
name: testing-strategy-standard
description: Implement testing with Jest, Playwright, three-tier test pyramid, and coverage requirements. Use when setting up testing infrastructure, writing tests, or implementing test automation. Triggers on requests for testing setup, Jest configuration, Playwright tests, or test coverage.
---

# Testing Strategy Standard

Production-grade testing patterns from DreamiHairCare implementation with Jest unit testing, Playwright E2E testing, three-tier test pyramid strategy, and comprehensive coverage requirements.

## Skill Metadata

- **Name:** testing-strategy-standard
- **Version:** 1.0.0
- **Category:** Quality Assurance
- **Source:** DreamiHairCare Production Implementation
- **Related Skills:** ci-cd-pipeline-standard, error-monitoring-standard

## When to Use This Skill

Use this skill when:
- Setting up testing infrastructure for new projects
- Implementing unit tests with Jest
- Creating E2E tests with Playwright
- Configuring test coverage thresholds
- Setting up CI/CD test pipelines
- Implementing Page Object patterns for E2E tests

## Three-Tier Test Pyramid

### Tier 1: Smoke Tests (5-10 minutes)
**Purpose:** Critical path validation, blocks deployment
**Runs:** Every commit, every PR

```bash
npm run test:smoke
```

**Scope:**
- App startup
- Database connection
- Core API endpoints (health, auth)
- Critical user flows (login, checkout)

### Tier 2: Regression Tests (20-30 minutes)
**Purpose:** Full feature coverage, blocks PR merge
**Runs:** Every PR

```bash
npm run test:regression
```

**Scope:**
- All unit tests
- Integration tests
- API endpoint tests
- Business logic validation

### Tier 3: Full Suite (1 hour+)
**Purpose:** Comprehensive validation
**Runs:** Nightly, pre-release

```bash
npm run test:full
```

**Scope:**
- All Tier 1 & 2 tests
- E2E tests (all browsers)
- Visual regression
- Performance tests
- Accessibility tests

## Core Patterns

### 1. Frontend Jest Configuration

```javascript
// frontend/jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.spec.ts',
    '**/__tests__/**/*.spec.tsx',
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 60,
      functions: 60,
      lines: 60,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

### 2. Frontend Jest Setup

```javascript
// frontend/jest.setup.js
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';

// Suppress console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (args[0]?.includes?.('Warning:')) return;
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
```

### 3. Backend Jest Configuration

```javascript
// backend/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.spec.ts', '**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.interface.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 60,
      functions: 60,
      lines: 60,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testTimeout: 30000,
  globals: {
    'ts-jest': {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    },
  },
};
```

### 4. Playwright Configuration

```typescript
// frontend/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ...(process.env.CI ? [['github'] as const] : [])
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    // Setup project for authentication states
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Main browser testing
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },

    // Admin tests with pre-authenticated state
    {
      name: 'admin-chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/admin.json',
      },
      testMatch: /.*admin.*\.spec\.ts/,
      dependencies: ['setup'],
    },

    // Cross-browser (enable for full suite)
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    //   dependencies: ['setup'],
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    //   dependencies: ['setup'],
    // },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### 5. Page Object Pattern

```typescript
// tests/e2e/pages/CheckoutPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly shippingForm: Locator;
  readonly paymentForm: Locator;
  readonly placeOrderButton: Locator;
  readonly orderConfirmation: Locator;

  constructor(page: Page) {
    this.page = page;
    this.shippingForm = page.locator('[data-testid="shipping-form"]');
    this.paymentForm = page.locator('[data-testid="payment-form"]');
    this.placeOrderButton = page.locator('[data-testid="place-order"]');
    this.orderConfirmation = page.locator('[data-testid="order-success"]');
  }

  async goto() {
    await this.page.goto('/checkout');
  }

  async fillShippingInformation(address: ShippingAddress) {
    await this.shippingForm.locator('[name="firstName"]').fill(address.firstName);
    await this.shippingForm.locator('[name="lastName"]').fill(address.lastName);
    await this.shippingForm.locator('[name="email"]').fill(address.email);
    await this.shippingForm.locator('[name="addressLine1"]').fill(address.addressLine1);
    await this.shippingForm.locator('[name="city"]').fill(address.city);
    await this.shippingForm.locator('[name="state"]').fill(address.state);
    await this.shippingForm.locator('[name="zipCode"]').fill(address.zipCode);
  }

  async selectShippingOption(index: number) {
    const options = this.page.locator('[data-testid="shipping-option"]');
    await options.nth(index).click();
  }

  async continueToPayment() {
    await this.page.locator('[data-testid="continue-to-payment"]').click();
  }

  async fillPaymentInformation(payment: PaymentInfo) {
    // Stripe Elements iframe handling
    const stripeFrame = this.page.frameLocator('iframe[name*="__privateStripeFrame"]').first();
    await stripeFrame.locator('[name="cardnumber"]').fill(payment.cardNumber);
    await stripeFrame.locator('[name="exp-date"]').fill(payment.expDate);
    await stripeFrame.locator('[name="cvc"]').fill(payment.cvc);
  }

  async placeOrder() {
    await this.placeOrderButton.click();
  }

  async waitForOrderConfirmation() {
    await expect(this.orderConfirmation).toBeVisible({ timeout: 30000 });
  }

  async getOrderSummary() {
    return {
      subtotal: await this.page.locator('[data-testid="subtotal"]').textContent(),
      shipping: await this.page.locator('[data-testid="shipping-cost"]').textContent(),
      tax: await this.page.locator('[data-testid="tax"]').textContent(),
      total: await this.page.locator('[data-testid="total"]').textContent(),
    };
  }

  async hasFieldError(fieldName: string): Promise<boolean> {
    const error = this.page.locator(`[data-testid="${fieldName}-error"]`);
    return error.isVisible();
  }
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
}

interface PaymentInfo {
  cardNumber: string;
  expDate: string;
  cvc: string;
}
```

### 6. E2E Test Example

```typescript
// tests/e2e/specs/ecommerce/checkout-flow.spec.ts
import { test, expect } from '@playwright/test';
import { ProductsPage } from '../../pages/ProductsPage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { shippingAddresses, testPaymentMethods } from '../../fixtures';

test.describe('Checkout Flow', () => {
  let productsPage: ProductsPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);

    // Add products to cart
    await productsPage.goto();
    await productsPage.addProductToCart(0);
  });

  test('should complete guest checkout', async ({ page }) => {
    await cartPage.openCart();
    await cartPage.proceedToCheckout();

    await checkoutPage.fillShippingInformation(shippingAddresses.valid);
    await checkoutPage.selectShippingOption(0);
    await checkoutPage.continueToPayment();
    await checkoutPage.fillPaymentInformation(testPaymentMethods.validCard);
    await checkoutPage.placeOrder();

    await checkoutPage.waitForOrderConfirmation();
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await cartPage.openCart();
    await cartPage.proceedToCheckout();

    // Try to continue without filling fields
    await checkoutPage.continueToPayment();

    await expect(checkoutPage.hasFieldError('firstName')).resolves.toBeTruthy();
    await expect(checkoutPage.hasFieldError('email')).resolves.toBeTruthy();
  });

  test('should handle payment errors', async ({ page }) => {
    await cartPage.openCart();
    await cartPage.proceedToCheckout();

    await checkoutPage.fillShippingInformation(shippingAddresses.valid);
    await checkoutPage.selectShippingOption(0);
    await checkoutPage.continueToPayment();
    await checkoutPage.fillPaymentInformation(testPaymentMethods.declined);
    await checkoutPage.placeOrder();

    // Should show error and remain on checkout
    await expect(page.locator('[data-testid="payment-error"]')).toBeVisible();
    await expect(page).toHaveURL(/checkout/);
  });
});
```

### 7. Test Fixtures

```typescript
// tests/e2e/fixtures/users.ts
export const shippingAddresses = {
  valid: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'test@example.com',
    addressLine1: '123 Test Street',
    city: 'Test City',
    state: 'CA',
    zipCode: '90210',
  },
  international: {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    addressLine1: '456 International Ave',
    city: 'London',
    state: '',
    zipCode: 'SW1A 1AA',
    country: 'GB',
  },
};

// tests/e2e/fixtures/payment.ts
export const testPaymentMethods = {
  validCard: {
    cardNumber: '4242424242424242',
    expDate: '12/30',
    cvc: '123',
  },
  declined: {
    cardNumber: '4000000000000002',
    expDate: '12/30',
    cvc: '123',
  },
  insufficientFunds: {
    cardNumber: '4000000000009995',
    expDate: '12/30',
    cvc: '123',
  },
  threeDSecure: {
    cardNumber: '4000000000003220',
    expDate: '12/30',
    cvc: '123',
  },
};
```

### 8. Authentication Setup

```typescript
// tests/e2e/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

const adminFile = 'playwright/.auth/admin.json';
const userFile = 'playwright/.auth/user.json';

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/sign-in');
  await page.fill('[name="email"]', process.env.TEST_ADMIN_EMAIL!);
  await page.fill('[name="password"]', process.env.TEST_ADMIN_PASSWORD!);
  await page.click('[type="submit"]');

  // Wait for authentication to complete
  await page.waitForURL('/admin/dashboard');

  // Save storage state
  await page.context().storageState({ path: adminFile });
});

setup('authenticate as user', async ({ page }) => {
  await page.goto('/sign-in');
  await page.fill('[name="email"]', process.env.TEST_USER_EMAIL!);
  await page.fill('[name="password"]', process.env.TEST_USER_PASSWORD!);
  await page.click('[type="submit"]');

  await page.waitForURL('/');
  await page.context().storageState({ path: userFile });
});
```

## npm Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage",
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

## Coverage Requirements

### Minimum Thresholds
- **Statements:** 60%
- **Branches:** 60%
- **Functions:** 60%
- **Lines:** 60%

### Critical Path Coverage (100%)
- Authentication flows
- Payment processing
- Checkout process
- Order management
- Admin operations

## File Structure

```
project/
├── frontend/
│   ├── jest.config.js
│   ├── jest.setup.js
│   ├── playwright.config.ts
│   ├── src/
│   │   └── __tests__/
│   │       ├── components/
│   │       ├── hooks/
│   │       └── utils/
│   └── tests/
│       └── e2e/
│           ├── fixtures/
│           ├── helpers/
│           ├── pages/
│           ├── specs/
│           │   ├── auth/
│           │   ├── ecommerce/
│           │   └── admin/
│           └── auth.setup.ts
├── backend/
│   ├── jest.config.js
│   ├── jest.setup.ts
│   └── src/
│       └── __tests__/
│           ├── services/
│           ├── resolvers/
│           └── middleware/
└── playwright/
    └── .auth/
        ├── admin.json
        └── user.json
```

## Implementation Checklist

### Jest Setup
- [ ] Frontend jest.config.js created
- [ ] Backend jest.config.js created
- [ ] jest.setup files configured
- [ ] Module aliases configured
- [ ] Coverage thresholds set

### Playwright Setup
- [ ] playwright.config.ts created
- [ ] Browser projects configured
- [ ] Authentication setup implemented
- [ ] Page objects created
- [ ] Test fixtures defined

### CI/CD Integration
- [ ] Smoke tests run on every commit
- [ ] Regression tests run on PRs
- [ ] Full suite runs nightly
- [ ] Coverage reports generated
- [ ] Test results archived

## Related Commands

- `/implement-testing` - Set up testing infrastructure
- `/implement-ci-cd` - CI/CD pipeline with test stages

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-15 | Initial release from DreamiHairCare patterns |
