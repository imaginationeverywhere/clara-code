# Vibe Coding - Natural Language Development

**Version:** 1.0.0
**Agent:** vibe-coder
**Category:** development

## Purpose

Transform natural language descriptions into working code. The Vibe Coding Toolkit enables developers to describe what they want in plain English and have Claude Code generate, implement, and test the solution.

## Usage

```bash
# Main vibe coding command
/vibe "Add a dark mode toggle to the settings page"

# Build a complete feature
/vibe build "Create a user profile page with avatar upload"

# Fix issues naturally
/vibe fix "The login button doesn't work on mobile"

# Refactor code
/vibe refactor "Make the checkout flow more efficient"

# Generate tests
/vibe test "Add tests for the payment processing module"

# Create documentation
/vibe docs "Document the authentication system"

# Quick scaffolding
/vibe scaffold "API endpoint for managing subscriptions"
```

## How It Works

### The Vibe Coding Philosophy

1. **Describe, Don't Dictate** - Tell Claude what you want, not how to do it
2. **Context is King** - Claude reads your codebase to understand patterns
3. **Iterate Naturally** - Refine with follow-up descriptions
4. **Trust the Process** - Let Claude handle implementation details

### Workflow

```
You Describe → Claude Interprets → Claude Plans → Claude Implements → You Review
     ↑                                                                    ↓
     └────────────────────── Feedback Loop ───────────────────────────────┘
```

## Command Modes

### 1. `/vibe` (Default Mode)
General-purpose vibe coding for any task.

```bash
/vibe "I need a way for users to save their favorite products"
```

Claude will:
- Analyze the request
- Check existing codebase patterns
- Plan the implementation
- Write the code
- Run tests if applicable

### 2. `/vibe build`
Build complete features from descriptions.

```bash
/vibe build "Shopping cart with quantity adjustment, remove items, and save for later"
```

Claude will:
- Create all necessary components
- Set up state management
- Add API endpoints if needed
- Implement database models
- Write comprehensive tests

### 3. `/vibe fix`
Fix bugs and issues using natural language.

```bash
/vibe fix "Users are getting logged out randomly after 5 minutes"
```

Claude will:
- Investigate the issue
- Identify root cause
- Implement the fix
- Verify the solution

### 4. `/vibe refactor`
Improve code quality with natural descriptions.

```bash
/vibe refactor "The order processing is too slow and hard to maintain"
```

Claude will:
- Analyze current implementation
- Identify improvement opportunities
- Refactor while preserving behavior
- Ensure tests still pass

### 5. `/vibe test`
Generate tests from descriptions.

```bash
/vibe test "Make sure the discount codes work correctly"
```

Claude will:
- Analyze the feature
- Write unit tests
- Write integration tests
- Add edge case coverage

### 6. `/vibe docs`
Generate documentation naturally.

```bash
/vibe docs "Explain how the notification system works"
```

Claude will:
- Analyze the code
- Generate clear documentation
- Include examples
- Add API references

### 7. `/vibe scaffold`
Quick scaffolding for common patterns.

```bash
/vibe scaffold "CRUD operations for blog posts"
```

Claude will:
- Create model/schema
- Generate API endpoints
- Create frontend components
- Set up routing

## Examples

### Example 1: Building a Feature

**You say:**
```bash
/vibe build "Add a review system where customers can rate products 1-5 stars and leave comments"
```

**Claude does:**
1. Creates `Review` model with rating, comment, userId, productId
2. Adds GraphQL types, queries, and mutations
3. Creates `ReviewForm` component with star rating UI
4. Creates `ReviewList` component for displaying reviews
5. Adds average rating calculation to products
6. Implements review submission and validation
7. Writes tests for the review system

### Example 2: Fixing a Bug

**You say:**
```bash
/vibe fix "The search results are showing products that are out of stock"
```

**Claude does:**
1. Finds the search query/resolver
2. Identifies missing stock filter
3. Adds `WHERE inStock = true` or equivalent
4. Tests the fix
5. Verifies edge cases

### Example 3: Quick Enhancement

**You say:**
```bash
/vibe "Add a loading spinner when products are being fetched"
```

**Claude does:**
1. Finds the product fetching component
2. Adds loading state
3. Implements spinner UI
4. Ensures smooth UX transitions

## Best Practices

### Do's

- **Be Specific About What**: "Add email notifications when orders ship"
- **Describe the User Experience**: "Users should see a confirmation modal before deleting"
- **Mention Edge Cases**: "Handle the case where the user has no saved addresses"
- **Reference Existing Features**: "Make it work like the existing comment system"

### Don'ts

- **Don't Over-Specify Implementation**: Let Claude choose the best approach
- **Don't Include Code Snippets**: Describe behavior, not syntax
- **Don't Assume Technical Knowledge**: Describe features, not frameworks

## Context Awareness

The Vibe Coder automatically understands:

- **Your Tech Stack**: Next.js, Express, GraphQL, Sequelize, etc.
- **Your Patterns**: How you structure components, resolvers, models
- **Your Style**: Naming conventions, folder structure, coding style
- **Your Business Logic**: Domain-specific terminology and rules

## Integration with Other Tools

### With Plan Mode
```bash
/vibe build "Complete checkout system with Stripe" --plan
```
Creates a detailed plan before implementation.

### With Testing
```bash
/vibe build "User registration" --with-tests
```
Generates comprehensive tests alongside code.

### With Documentation
```bash
/vibe build "API for inventory management" --with-docs
```
Generates API documentation automatically.

## Troubleshooting

### "Claude didn't understand my request"

Try being more specific:
- Bad: "Make the page better"
- Good: "Improve the product page loading speed and add skeleton loaders"

### "The implementation doesn't match my expectations"

Provide feedback naturally:
```bash
/vibe "Actually, I wanted the reviews to show newest first, not oldest"
```

### "Something broke after the changes"

Use vibe fix:
```bash
/vibe fix "After adding reviews, the product page crashes on products without reviews"
```

## Related Commands

- `/vibe-status` - Check status of ongoing vibe coding tasks
- `/vibe-undo` - Revert last vibe coding changes
- `/vibe-history` - See history of vibe coding sessions

## Notes for Claude Code

When executing vibe commands:

1. **Read the codebase first** - Understand existing patterns
2. **Use appropriate agents** - Route to specialized agents as needed
3. **Follow project conventions** - Match existing code style
4. **Test your changes** - Run tests after implementation
5. **Commit incrementally** - Small, focused commits
6. **Document as you go** - Update relevant documentation

## Command Metadata

```yaml
name: vibe
category: development
agent: vibe-coder
version: 1.0.0
author: Quik Nation AI
```
