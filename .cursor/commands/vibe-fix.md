# Vibe Fix - Fix Issues Using Natural Language

**Version:** 1.0.0
**Agent:** vibe-coder
**Category:** debugging

## Purpose

Describe bugs and issues in plain English and let Claude investigate and fix them automatically.

## Usage

```bash
/vibe-fix "The login button doesn't do anything when clicked"

/vibe-fix "Users are seeing a blank page after checkout"

/vibe-fix "The search results are showing deleted products"

/vibe-fix "Mobile menu doesn't close when you tap outside it"
```

## How It Works

1. **Interpret** - Understand the issue from your description
2. **Investigate** - Search codebase for relevant code
3. **Diagnose** - Identify the root cause
4. **Fix** - Implement the solution
5. **Verify** - Test the fix works
6. **Report** - Explain what was wrong and how it was fixed

## Examples

### Example 1: UI Bug

```bash
/vibe-fix "The dropdown menu is appearing behind other elements"
```

**Investigation:**
- Found dropdown component
- Identified z-index issue

**Fix:**
- Added `z-50` class to dropdown container
- Ensured parent has `relative` positioning

### Example 2: Logic Bug

```bash
/vibe-fix "The discount isn't being applied to the cart total"
```

**Investigation:**
- Traced cart calculation flow
- Found discount applied after tax instead of before

**Fix:**
- Reordered calculation: subtotal → discount → tax → total
- Added test case for discount + tax scenario

### Example 3: Data Bug

```bash
/vibe-fix "Old users can't see their order history"
```

**Investigation:**
- Query working for new users
- Found migration added `userId` column
- Old records have null userId

**Fix:**
- Created migration to backfill userId from email
- Added fallback query for legacy orders

### Example 4: Performance Bug

```bash
/vibe-fix "The product page takes forever to load"
```

**Investigation:**
- Profiled page load
- Found N+1 queries for product images

**Fix:**
- Added DataLoader for image batching
- Implemented eager loading in Sequelize query
- Load time reduced from 3s to 200ms

## Describing Issues Effectively

### Include

- **What should happen**: "Users should see their cart"
- **What actually happens**: "They see an empty page"
- **When it happens**: "After adding items and refreshing"
- **Who's affected**: "Only happens for logged-in users"

### Examples of Good Descriptions

```bash
# Includes expected vs actual
/vibe-fix "The price should show $10.00 but it's showing $1000"

# Includes trigger
/vibe-fix "The form submits twice when clicking the button fast"

# Includes context
/vibe-fix "The notification badge shows wrong count after marking as read"

# Includes affected users
/vibe-fix "Admin users can't access the settings page anymore"
```

## Options

| Flag | Description |
|------|-------------|
| `--analyze-only` | Diagnose without fixing |
| `--with-test` | Add regression test |
| `--trace` | Show detailed investigation |
| `--rollback` | Prepare rollback if fix fails |

## Related Commands

- `/vibe` - General vibe coding
- `/vibe-build` - Build new features
- `/debug-fix` - Technical debugging
- `/app-troubleshooter` - Deep investigation
