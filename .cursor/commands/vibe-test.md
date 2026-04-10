# Vibe Test - Generate Tests from Natural Language

**Version:** 1.0.0
**Agent:** vibe-coder
**Category:** testing

## Purpose

Describe what you want to test in plain English and let Claude generate comprehensive test suites.

## Usage

```bash
/vibe-test "Make sure the checkout process works correctly"

/vibe-test "Test all the user authentication flows"

/vibe-test "Verify the discount codes apply correctly"

/vibe-test "Ensure the API handles errors gracefully"
```

## What Gets Generated

| Test Type | Description |
|-----------|-------------|
| **Unit Tests** | Individual functions and components |
| **Integration Tests** | Multiple components working together |
| **E2E Tests** | Full user flows with Playwright |
| **API Tests** | GraphQL queries and mutations |
| **Edge Cases** | Boundary conditions and error scenarios |

## Examples

### Example 1: Feature Testing

```bash
/vibe-test "Test the shopping cart functionality"
```

**Generated Tests:**
```typescript
describe('Shopping Cart', () => {
  describe('Adding items', () => {
    it('should add item to empty cart');
    it('should increase quantity for existing item');
    it('should respect maximum quantity limits');
    it('should handle out-of-stock items');
  });

  describe('Removing items', () => {
    it('should remove item from cart');
    it('should update total after removal');
    it('should handle removing last item');
  });

  describe('Cart calculations', () => {
    it('should calculate subtotal correctly');
    it('should apply quantity discounts');
    it('should handle tax calculations');
    it('should calculate shipping costs');
  });
});
```

### Example 2: API Testing

```bash
/vibe-test "Test the order creation API"
```

**Generated Tests:**
```typescript
describe('createOrder mutation', () => {
  it('should create order with valid data');
  it('should validate required fields');
  it('should require authentication');
  it('should verify product availability');
  it('should calculate totals correctly');
  it('should handle payment failures');
  it('should send confirmation email');
  it('should clear cart after success');
});
```

### Example 3: E2E Testing

```bash
/vibe-test "Test the user registration flow end-to-end"
```

**Generated Playwright Test:**
```typescript
test.describe('User Registration', () => {
  test('complete registration flow', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/verify-email');
    // ... verification steps
  });

  test('shows validation errors', async ({ page }) => {
    await page.goto('/signup');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error')).toBeVisible();
  });

  test('handles existing email', async ({ page }) => {
    // ... test duplicate email handling
  });
});
```

### Example 4: Edge Case Focus

```bash
/vibe-test "Make sure discount codes handle all the weird cases"
```

**Generated Tests:**
```typescript
describe('Discount Codes - Edge Cases', () => {
  it('should reject expired codes');
  it('should reject codes below minimum order');
  it('should not allow stacking multiple codes');
  it('should handle percentage over 100%');
  it('should handle fixed discount larger than total');
  it('should work with zero-price items');
  it('should handle currency rounding');
  it('should respect usage limits');
  it('should handle case-insensitive codes');
  it('should trim whitespace from input');
});
```

## Describing Tests

### Good Descriptions

```bash
# Feature-focused
/vibe-test "Test all the payment processing scenarios"

# User-focused
/vibe-test "Make sure users can reset their passwords"

# Error-focused
/vibe-test "Test what happens when the database is unavailable"

# Security-focused
/vibe-test "Verify that users can only see their own orders"
```

### What to Mention

- **Happy paths** - Normal successful flows
- **Error cases** - What should fail and how
- **Edge cases** - Unusual but valid scenarios
- **Security** - Authorization and data access

## Options

| Flag | Description |
|------|-------------|
| `--unit-only` | Generate only unit tests |
| `--e2e-only` | Generate only E2E tests |
| `--coverage-target=80` | Aim for specific coverage |
| `--include-mocks` | Generate mock implementations |
| `--run` | Run tests after generating |

## Test Frameworks Used

| Project Type | Framework |
|--------------|-----------|
| Frontend | Jest + React Testing Library |
| Backend | Jest |
| E2E | Playwright |
| API | Supertest + Jest |

## Related Commands

- `/vibe` - General vibe coding
- `/vibe-build` - Build features with tests
- `/test-automation` - Full test automation agent
- `/playwright-test-executor` - Run E2E tests
