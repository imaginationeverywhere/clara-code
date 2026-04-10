# Vibe Build - Build Features from Natural Language

**Version:** 1.0.0
**Agent:** vibe-coder
**Category:** development

## Purpose

Build complete features from natural language descriptions. Handles everything from database models to frontend components.

## Usage

```bash
/vibe-build "User profile page with avatar upload and bio editing"

# With options
/vibe-build "Shopping cart" --with-tests
/vibe-build "Admin dashboard" --plan-first
/vibe-build "Notification system" --with-docs
```

## What Gets Built

Based on your description, Vibe Build creates:

| Layer | What's Created |
|-------|----------------|
| **Database** | Models, migrations, seeders |
| **Backend** | GraphQL types, resolvers, services |
| **Frontend** | Components, pages, hooks |
| **State** | Redux slices, context providers |
| **Tests** | Unit, integration, E2E tests |
| **Docs** | API docs, component docs |

## Examples

### Example 1: E-commerce Feature

```bash
/vibe-build "Product wishlist where users can save items they want to buy later"
```

**Creates:**
- `Wishlist` model with userId and productId
- `addToWishlist`, `removeFromWishlist` mutations
- `getUserWishlist` query
- `WishlistButton` component
- `WishlistPage` page component
- Tests for all functionality

### Example 2: Social Feature

```bash
/vibe-build "User following system with follow/unfollow and follower counts"
```

**Creates:**
- `UserFollow` model (followerId, followingId)
- Follow/unfollow mutations
- Follower/following queries
- `FollowButton` component
- Profile follower stats
- Notification on new follower

### Example 3: Content Feature

```bash
/vibe-build "Blog with posts, categories, and comments"
```

**Creates:**
- `Post`, `Category`, `Comment` models
- Full CRUD for posts
- Category management
- Nested comments
- Rich text editor integration
- SEO metadata

## Options

| Flag | Description |
|------|-------------|
| `--with-tests` | Generate comprehensive tests |
| `--plan-first` | Show plan before building |
| `--with-docs` | Generate documentation |
| `--minimal` | Core functionality only |
| `--full` | All bells and whistles |

## Best Practices

### Good Descriptions

```bash
# Specific about functionality
/vibe-build "Product reviews with 1-5 star ratings, text comments, and helpful/not helpful voting"

# Mentions user interactions
/vibe-build "Appointment booking where users pick a date, time, and service type"

# Includes business rules
/vibe-build "Discount codes with percentage or fixed amount, minimum order requirement, and expiration date"
```

### What to Include

- **Core functionality** - What users can do
- **Data involved** - What information is stored
- **Relationships** - How entities connect
- **User flows** - How users interact

## Related Commands

- `/vibe` - General vibe coding
- `/vibe-fix` - Fix issues
- `/vibe-refactor` - Improve existing code
- `/vibe-test` - Generate tests only
