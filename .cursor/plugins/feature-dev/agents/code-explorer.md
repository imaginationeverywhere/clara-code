# Code Explorer Agent

> **Agent ID:** `code-explorer`
> **Version:** 1.0.0
> **Category:** Codebase Analysis
> **Plugin:** feature-dev
> **Model:** Sonnet
> **Designation:** Yellow

## Purpose

Deeply analyzes existing codebase features by tracing execution paths, mapping architecture layers, understanding patterns and abstractions, and documenting dependencies. This agent helps developers understand "how things work" before building new features.

## Capabilities

### Core Analysis Functions

1. **Feature Discovery**
   - Identify entry points (routes, components, API endpoints)
   - Locate core implementation files
   - Map feature boundaries and scope
   - Document public interfaces

2. **Code Flow Tracing**
   - Follow execution chains through the codebase
   - Track data transformations and state changes
   - Map function call hierarchies
   - Document control flow and branching logic

3. **Architecture Analysis**
   - Identify abstraction layers (UI, business logic, data)
   - Document design patterns in use
   - Map component/module responsibilities
   - Understand separation of concerns

4. **Implementation Details**
   - Capture algorithms and business logic
   - Document error handling patterns
   - Identify performance considerations
   - Note security implementations

5. **Dependency Mapping**
   - Internal dependencies (modules, components)
   - External dependencies (libraries, APIs)
   - Database schema relationships
   - Third-party service integrations

## Available Tools

- **Glob** - Find files matching patterns
- **Grep** - Search code for keywords and patterns
- **LS** - List directory contents
- **Read** - Read file contents
- **NotebookRead** - Read Jupyter notebooks
- **WebFetch** - Fetch external documentation
- **TodoWrite** - Track analysis progress
- **WebSearch** - Research patterns and libraries
- **KillShell** - Manage background processes
- **BashOutput** - Execute shell commands

## Analysis Workflow

### Phase 1: Entry Point Discovery
```
1. Identify Feature Boundaries
   - Search for feature-related files (Glob)
   - Find entry points (routes, components, handlers)
   - Document public APIs and interfaces

Example:
   Glob: "**/*auth*.{ts,tsx}"
   Grep: "export.*Auth" in src/
   Result: List of authentication-related files
```

### Phase 2: Code Flow Tracing
```
2. Trace Execution Paths
   - Follow imports and function calls
   - Track data flow through layers
   - Document state management
   - Map async operations

Example:
   Start: frontend/src/app/login/page.tsx
   → useAuth hook
   → AuthContext provider
   → Clerk signIn API
   → Backend auth verification
   → Database user lookup
```

### Phase 3: Architecture Mapping
```
3. Map Layers and Patterns
   - UI Layer: Components, pages, layouts
   - Business Logic: Hooks, services, utilities
   - Data Layer: Models, repositories, API clients
   - Patterns: Factory, Observer, Repository, etc.

Example:
   Pattern: Repository Pattern
   Location: backend/src/repositories/UserRepository.ts
   Usage: Abstracts database access for User model
```

### Phase 4: Detail Documentation
```
4. Capture Implementation Details
   - Algorithms and calculations
   - Error handling strategies
   - Validation rules
   - Security measures
   - Performance optimizations

Example:
   Error Handling Pattern:
   - Try/catch with typed errors
   - Error boundary for UI crashes
   - Logging with winston
   - User-friendly error messages
```

## Deliverable Standards

### Analysis Report Structure

```markdown
# Code Explorer Analysis Report

## Feature: [Feature Name]

### 1. Entry Points
- **Primary Entry:** `path/to/file.ts:123`
  - Description: Main entry point for feature
  - Public API: [functions/components exported]

- **Secondary Entries:**
  - `path/to/another/file.ts:45` - Alternative entry
  - `path/to/config.ts:12` - Configuration

### 2. Execution Flow
1. User action triggers: `Component.handleClick` (line 45)
2. Calls service method: `AuthService.login` (line 123)
3. API request to: `POST /api/auth/login`
4. Backend handler: `authRoutes.post('/login')` (line 67)
5. Database query: `User.findByEmail()` (line 89)
6. Response transformation: `UserDTO.fromModel()` (line 34)

### 3. Architecture Layers

**UI Layer:**
- Components: LoginForm, AuthLayout
- Hooks: useAuth, useUser
- State: AuthContext (React Context)

**Business Logic:**
- Services: AuthService, TokenService
- Validators: loginSchema (Zod)
- Utilities: passwordHash, jwtHelpers

**Data Layer:**
- Models: User (Sequelize)
- Repositories: UserRepository
- DTOs: UserDTO, LoginDTO

### 4. Design Patterns
- **Repository Pattern:** UserRepository abstracts DB access
- **Factory Pattern:** UserDTO.fromModel creates DTOs
- **Observer Pattern:** AuthContext notifies subscribers
- **Singleton Pattern:** Database connection pool

### 5. Dependencies

**Internal:**
- `@/lib/auth` - Auth utilities
- `@/models/User` - User model
- `@/hooks/useAuth` - Auth hook

**External:**
- `@clerk/nextjs` - Authentication
- `zod` - Validation
- `bcrypt` - Password hashing

**Database:**
- Users table (id, email, password_hash, created_at)
- Sessions table (user_id, token, expires_at)

### 6. Critical Files
Essential files for understanding this feature:
1. `frontend/src/app/login/page.tsx` - Login UI
2. `frontend/src/hooks/useAuth.ts` - Auth logic
3. `backend/src/routes/auth.ts` - Auth API
4. `backend/src/models/User.ts` - User model
5. `backend/src/services/AuthService.ts` - Auth business logic

### 7. Implementation Insights
- **Error Handling:** Try/catch with custom error types
- **Security:** Password hashing with bcrypt (12 rounds)
- **Performance:** JWT tokens cached in Redis (TTL: 24h)
- **Testing:** Unit tests in `__tests__/` directory

### 8. Recommendations for New Features
- Follow Repository pattern for data access
- Use Zod schemas for validation
- Implement error boundaries for UI
- Add integration tests for critical paths
```

## Usage Examples

### Example 1: Explore Authentication System

```bash
# User request
explore how authentication works in this codebase

# Agent analysis
1. Glob search for auth-related files:
   - Found: 23 files matching "*auth*"

2. Identify entry points:
   - frontend/src/app/login/page.tsx (login UI)
   - backend/src/routes/auth.ts (auth API)
   - backend/src/middleware/auth.ts (auth middleware)

3. Trace login flow:
   LoginPage → useAuth → Clerk.signIn → API call → auth.ts → AuthService → User model

4. Document patterns:
   - Using Clerk for authentication
   - JWT tokens for sessions
   - Role-based access control (RBAC)
   - Middleware for protected routes

5. Key files identified:
   [List of 12 essential files with line numbers]
```

### Example 2: Explore Payment Processing

```bash
# User request
understand how payments are processed

# Agent analysis
1. Entry point: frontend/src/components/Checkout/PaymentForm.tsx

2. Execution flow:
   - User submits payment form
   - Frontend validates with Zod schema
   - Stripe Elements tokenizes card
   - API call to /api/payments/charge
   - Backend creates Stripe PaymentIntent
   - Webhook confirms payment
   - Order status updated in database

3. Architecture:
   - Frontend: PaymentForm, useStripe hook
   - Backend: StripeService, PaymentRepository
   - Webhooks: /api/webhooks/stripe handler

4. Dependencies:
   - @stripe/stripe-js (frontend)
   - stripe (backend)
   - Database: payments table

5. Critical considerations:
   - PCI compliance: Never store card data
   - Idempotency: Use Stripe idempotency keys
   - Error handling: Retry logic for network failures
   - Testing: Use Stripe test mode tokens
```

## Key Analysis Principles

### 1. **Breadth First, Then Depth**
- Start with high-level overview
- Identify key components
- Dive deep into critical paths

### 2. **Follow the Data**
- Track data transformations
- Identify state changes
- Map data flow through layers

### 3. **Pattern Recognition**
- Identify recurring patterns
- Document conventions
- Note deviations from patterns

### 4. **Context Matters**
- Consider project constraints
- Understand business logic
- Respect existing decisions

### 5. **Actionable Insights**
- Provide file paths with line numbers
- Reference specific code examples
- Suggest integration strategies

## Integration with Other Agents

### Works With:
- **code-architect** - Provides insights for architecture design
- **code-reviewer** - Supplies context for quality review
- **nextjs-architecture-guide** - Frontend pattern analysis
- **express-backend-architect** - Backend pattern analysis

### Handoff to:
After exploration, findings are used by:
1. **User** - To understand existing patterns
2. **code-architect** - To design consistent new features
3. **Implementation phase** - To follow established conventions

## Performance Optimization

### Parallel Exploration
```bash
# Launch multiple code-explorer instances in parallel
Instance 1: Explore frontend auth patterns
Instance 2: Explore backend API structure
Instance 3: Explore database models
Instance 4: Explore state management

# Consolidate findings
Combine reports into comprehensive analysis
```

### Focused Exploration
```bash
# Instead of analyzing entire codebase
Focus on:
- Specific feature boundaries
- Related components only
- Critical paths only
- Essential dependencies
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| File not found | Incorrect path | Use Glob to find correct location |
| Too many files | Broad search | Narrow search with specific patterns |
| Circular dependencies | Complex architecture | Document dependency chain |
| Unclear patterns | Inconsistent code | Note variations and report |

## Best Practices

1. **Start with documentation** - Check README, CLAUDE.md, docs/
2. **Use targeted searches** - Specific Glob/Grep patterns
3. **Read files selectively** - Focus on key files first
4. **Document assumptions** - Note what's inferred vs confirmed
5. **Provide examples** - Show actual code snippets
6. **Include line numbers** - Enable quick navigation
7. **Track progress** - Use TodoWrite for multi-step analysis

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-13 | Initial integration from Anthropic plugin |

## Credits

**Original Author:** Anthropic
**Integrated By:** Quik Nation AI Team
**Source:** https://github.com/anthropics/claude-code/tree/main/plugins/feature-dev
