# Vibe Refactor - Improve Code Using Natural Language

**Version:** 1.0.0
**Agent:** vibe-coder
**Category:** development

## Purpose

Describe code improvements in plain English and let Claude refactor while preserving functionality.

## Usage

```bash
/vibe-refactor "The checkout code is messy and hard to follow"

/vibe-refactor "Make the product listing more efficient"

/vibe-refactor "Split the giant UserPage component into smaller pieces"

/vibe-refactor "The authentication logic is duplicated everywhere"
```

## What Gets Improved

| Issue Type | Refactoring Applied |
|------------|---------------------|
| **Messy code** | Extract functions, improve naming, add comments |
| **Duplication** | Extract shared logic, create utilities |
| **Large files** | Split into smaller, focused modules |
| **Slow code** | Optimize queries, add caching, reduce renders |
| **Hard to test** | Dependency injection, pure functions |
| **Inconsistent** | Apply consistent patterns throughout |

## Examples

### Example 1: Code Organization

```bash
/vibe-refactor "The OrderService has too many responsibilities"
```

**Before:**
- 1 file, 500 lines
- Handles orders, payments, shipping, notifications

**After:**
- `OrderService` - Core order logic
- `PaymentService` - Payment processing
- `ShippingService` - Shipping calculations
- `OrderNotificationService` - Email/SMS notifications

### Example 2: Performance

```bash
/vibe-refactor "The dashboard loads slowly with lots of data"
```

**Improvements:**
- Added pagination to data fetching
- Implemented virtual scrolling for long lists
- Added Redis caching for computed stats
- Lazy loaded chart components

### Example 3: Consistency

```bash
/vibe-refactor "Error handling is different in every resolver"
```

**Changes:**
- Created `handleResolverError` utility
- Standardized error response format
- Added consistent logging
- Applied to all 47 resolvers

### Example 4: Testability

```bash
/vibe-refactor "The payment code is impossible to test"
```

**Improvements:**
- Extracted Stripe calls to `PaymentGateway` interface
- Created `MockPaymentGateway` for tests
- Added dependency injection
- Now 95% test coverage possible

## Describing Improvements

### Good Descriptions

```bash
# Problem-focused
/vibe-refactor "The cart calculations are scattered across 5 different files"

# Goal-focused
/vibe-refactor "Make it easier to add new payment methods"

# Specific about what bothers you
/vibe-refactor "The UserProfile component re-renders too often"
```

### What to Mention

- **Pain points** - What's frustrating about the current code
- **Goals** - What you want to achieve
- **Constraints** - What must not change
- **Examples** - Reference good patterns in your codebase

## Safety Measures

Vibe Refactor ensures:

1. **Tests still pass** - Runs all tests after refactoring
2. **Behavior preserved** - No functional changes
3. **Incremental commits** - Can rollback specific changes
4. **Type safety** - TypeScript compilation verified

## Options

| Flag | Description |
|------|-------------|
| `--analyze-only` | Show plan without changing code |
| `--aggressive` | More substantial changes |
| `--conservative` | Minimal, safe changes |
| `--single-file` | Only refactor specified file |
| `--preserve-api` | Keep public interfaces unchanged |

## Related Commands

- `/vibe` - General vibe coding
- `/vibe-fix` - Fix bugs
- `/code-quality-reviewer` - Get refactoring suggestions
