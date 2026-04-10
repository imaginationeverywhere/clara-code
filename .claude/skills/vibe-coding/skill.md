# Vibe Coding Skill

Natural language development - describe what you want and let Claude build it.

## Triggers

This skill activates when users:
- Want to build features using natural descriptions
- Ask to "vibe code" something
- Describe desired functionality without technical specifics
- Say things like "I need a way to..." or "Add something that..."

## Skill Definition

```yaml
name: vibe-coding
description: Transform natural language descriptions into working code
category: development
version: 1.0.0
triggers:
  - "vibe"
  - "I need a way to"
  - "I want to add"
  - "Can you build"
  - "Make it so users can"
  - "Add a feature for"
  - "Create something that"
agent: vibe-coder
commands:
  - vibe
  - vibe-build
  - vibe-fix
  - vibe-refactor
  - vibe-test
  - vibe-docs
  - vibe-scaffold
```

## Usage Examples

### Building Features

```bash
User: "I need users to be able to save their favorite products"

Skill Response:
I'll build a favorites/wishlist system for you.

1. Creating Favorite model (userId, productId)
2. Adding GraphQL mutations (addFavorite, removeFavorite)
3. Creating FavoriteButton component with heart icon
4. Adding favorites page to user profile
5. Syncing favorites across sessions

[Implementation follows...]
```

### Fixing Issues

```bash
User: "The checkout breaks when the cart is empty"

Skill Response:
I'll fix the empty cart checkout issue.

Investigation:
- Found checkout proceeds without cart validation
- No guard for empty cart state

Fix:
- Added cart validation before checkout
- Added redirect to cart with message when empty
- Added disabled state to checkout button

[Implementation follows...]
```

### Quick Scaffolding

```bash
User: "I need a CRUD for blog posts"

Skill Response:
I'll scaffold the blog post system.

Creating:
- Post model (title, content, slug, authorId, publishedAt)
- GraphQL types, queries, and mutations
- PostList component
- PostEditor component
- Post detail page

[Implementation follows...]
```

## Workflow

```
1. INTERPRET
   - Parse natural language request
   - Identify intent (build, fix, refactor, etc.)
   - Extract key requirements

2. ANALYZE
   - Read relevant codebase sections
   - Understand existing patterns
   - Identify affected files

3. PLAN
   - Break down into tasks
   - Identify dependencies
   - Select appropriate agents

4. IMPLEMENT
   - Orchestrate specialized agents
   - Generate code following patterns
   - Handle edge cases

5. VERIFY
   - Run type checks
   - Run tests
   - Verify no regressions

6. REPORT
   - Summarize changes
   - Explain decisions
   - Suggest next steps
```

## Agent Orchestration

Route to specialized agents based on task:

| Task Type | Primary Agent | Supporting Agents |
|-----------|---------------|-------------------|
| Frontend UI | nextjs-architecture-guide | shadcn-ui-specialist |
| Backend API | graphql-backend-enforcer | express-backend-architect |
| Database | sequelize-orm-optimizer | postgresql-database-architect |
| Authentication | clerk-auth-enforcer | |
| Testing | testing-automation-agent | playwright-test-executor |
| Bug Fixing | app-troubleshooter | typescript-bug-fixer |
| Performance | nodejs-runtime-optimizer | |

## Best Practices for Users

### Good Descriptions

✅ "Add a wishlist where users can save products and get notified when they go on sale"

✅ "Fix the issue where logged-out users can still access the dashboard"

✅ "Make the product search faster and add autocomplete suggestions"

### Less Effective Descriptions

❌ "Make it better" (too vague)

❌ "Add a button that calls the POST /api/wishlist endpoint with userId and productId params" (too specific - let the skill choose implementation)

## Related Skills

- `code-generation-standard` - For template-based generation
- `debugging-standard` - For systematic debugging
- `testing-strategy-standard` - For test planning

## Notes

The vibe-coding skill embodies the principle of working at a higher level of abstraction. Users describe intent, and Claude handles implementation details while following project conventions and best practices.
