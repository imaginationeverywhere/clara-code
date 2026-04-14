# .claude Directory Changelog

## [1.33.1] - 2026-04-06

### Added
- **Session resume hook** — `hooks/session-resume.py` + `session-resume.sh` — SessionStart `additionalContext`: project + optional `memory/agent-checkpoints/<SWARM_RESUME_AGENT>.md`, `session-checkpoint.md`, live-feed tail, Daily note tail, `git log -5`.
- **settings.json** — `SessionStart` hook entry pointing at `session-resume.sh`.

### Changed
- **swarm-launcher.sh** — Exports `SWARM_RESUME_AGENT` for per-agent windows; `export SWARM_RESUME_AGENT=''` for team-only windows.
- **session-start.md** — “Automatic resume” subsection before full execution steps.
- **hooks/README.md** — SessionStart resume documented; `session-start.js` noted as separate reference.

### Security
- **session-resume.py** — Resolved `agent-checkpoints` path must stay under `memory/agent-checkpoints/`; ISO-dated daily filenames only; truncation preserves `(from filename)` prefix.

## [Unreleased] - 2026-04-06

### Added
- **Swarm Launcher** (`scripts/swarm-launcher.sh`) — Launches Claude Code sessions in tmux. Supports team windows, per-agent windows (`claude --agent=`), team expansion (`team-agents`), grouped sessions for multi-tab viewing.
- **Agent Map** (`scripts/agent-map.sh`) — Centralized agent name → team + file resolution. Used by voice-to-swarm.sh and swarm-launcher.sh for 85+ agents across 13 teams.
- **Inbox Dispatcher** (`scripts/inbox-dispatcher.sh`) — Event-driven replacement for 5-min cron job. Uses `fswatch` on `/tmp/swarm-inboxes/` for instant message delivery.
- **Swarm Telegraph** (`scripts/swarm-telegraph.sh`) — Cross-session messaging daemon. Routes live-feed messages to team inboxes.
- **Telegraph Check Hook** (`hooks/telegraph-check.sh`) — Hook that checks team inbox on every Claude Code turn.
- **Architecture Plans** — Independent Agent Harness, Paperclip Voice, Clara Voice Heru Sprint, Hermes + Syncthing Integration

### Changed
- **session-start.md** — Removed CronCreate block. Added event-driven feed watcher + swarm telegraph startup. Updated "How this works" to describe tmux-based delivery chain.
- **session-registry.sh** — Rewritten to discover tmux windows inside unified `swarm` session. Wake logic uses `tmux send-keys`. Falls back to `ps aux` TTY scanning.
- **agent-aliases.sh** — Added per-agent aliases (`gran`, `mary`, etc.), team expansion aliases (`hq-all`, `wcr-all`), swarm management aliases.
- **push-herus.sh** — Added `git stash` resilience, `--no-verify` for platform commits, `git pull --rebase` with merge fallback, timeout handling, symlink conflict resolution.
- **wake-session.sh** — Rewritten as thin wrapper around `session-registry.sh wake`.

### Previous

- **Heru CI/CD section in CLAUDE.md** — Links to `.github/workflow-templates/`, `scripts/setup-heru-cicd.sh`, `heru-cicd/`, `scripts/aws/create-remaining-github-oidc-roles.sh`, `infrastructure/ecs-fargate-platform/README.md`.
- **Persona-based agent and command system** - Agent roster and commands refactor
  - Replaced task-named agents with persona-named agents (see `.claude/agents/CHANGELOG.md`)
  - New persona and team commands (see `.claude/commands/CHANGELOG.md`)
  - GitHub org gate (`org-gate.sh`): platform only operates inside approved orgs (imaginationeverywhere, Sliplink-Inc)
  - Scripts: cloud-sync-herus.sh, wentworth-daily-scan.sh
  - Skills: kepano-obsidian in `.claude/skills/`; content mirrored to `.cursor/agents/`, `.cursor/commands/`, `.cursor/skills/`

### Changed
- **MCP registry** — Removed `sendgrid-email` server; `aws-cloud-control` in standard/full profiles; enterprise-email category describes AWS SES. **mcp-status.js** / **mcp-init.js** updated for SES detection.
- **email-notifications-standard skill** — Frontmatter and intro: SES-only platform email (no SendGrid in boilerplate).

### Added (previous)
- **Auset Orchestration Boilerplate** - Agents, commands, skills, plans, cheat sheet
  - **Agents**: cursor-orchestrator, dialogue-facilitator, platform-sync-manager, progress-tracker, cloudflare-ai-gateway, mvp-playground-generator (see `.claude/agents/CHANGELOG.md`)
  - **Commands**: dispatch-cursor, orchestrate, sync-herus, progress, gap-analysis, research, brainstorm, talk, teach, explore, save-plan, setup-ai-gateway, auset-activate, auset-status, browser-debug, commands, add-feature, project-playground (see `.claude/commands/CHANGELOG.md`)
  - **Skills**: cursor-orchestration, cloudflare
  - **Plans**: Auset platform design and implementation plans in `.claude/plans/` and `docs/plans/`; micro plans in `.claude/plans/micro/`
  - **COMMAND_CHEAT_SHEET.md** - Quick reference for top 40 commands
  - All content mirrored to `.cursor/` for Cursor IDE

- **Auto Claude Task Management System** - Complete task lifecycle management workflow
  - **agents/agent-manager.md** - Task status tracking and coordination agent
    - Manages task transitions: Planning → In Progress → AI Review → Human Review → Done
    - Monitors task progress, velocity, and stalled tasks
    - Coordinates between Auto Claude automation and manual development work
    - Location: `.claude/agents/agent-manager.md`
  - **commands/ac-start.md** - Start working on a task manually
    - Moves task from Planning to In Progress
    - Claims task for manual implementation
    - Supports branch creation and notes
    - Location: `.claude/commands/ac-start.md`
  - **commands/ac-pause.md** - Pause active task work
    - Saves current progress and notes
    - Moves task back to Planning or marks as blocked
    - Location: `.claude/commands/ac-pause.md`
  - **commands/ac-return.md** - Return to paused task
    - Resumes work on previously paused task
    - Restores context and progress
    - Location: `.claude/commands/ac-return.md`
  - **commands/ac-done.md** - Mark task as completed
    - Moves task to Done status
    - Generates completion summary
    - Location: `.claude/commands/ac-done.md`
  - **commands/ac-status.md** - View task status and progress
    - Shows current task status across all stages
    - Displays progress metrics and velocity
    - Location: `.claude/commands/ac-status.md`
  - **commands/ac-planning.md** - View and manage Planning tasks
    - Lists tasks ready for implementation
    - Exports tasks for manual work
    - Location: `.claude/commands/ac-planning.md`
  - **commands/ac-ai-review.md** - Trigger AI review of completed task
    - Runs automated tests, linting, and build checks
    - Moves task to AI Review status
    - Location: `.claude/commands/ac-ai-review.md`
  - **commands/ac-human-review.md** - Queue task for human review
    - Moves task from AI Review to Human Review
    - Manages review queue and approvals
    - Location: `.claude/commands/ac-human-review.md`

- **Chrome UI Testing & Debugging System** - Browser-based UI testing and debugging
  - **agents/chrome-ui-debugger.md** - Chrome DevTools Protocol integration agent
    - Browser automation and performance profiling
    - Accessibility audits and UI debugging
    - Cross-environment comparison (local, develop, production)
    - Location: `.claude/agents/chrome-ui-debugger.md`
  - **commands/chrome-debug.md** - Chrome UI debugging command
    - Capture screenshots and analyze network requests
    - Debug UI issues in real-time
    - Compare across environments
    - Location: `.claude/commands/chrome-debug.md`
  - **skills/chrome-ui-testing-standard/** - Chrome UI testing skill
    - Browser-based UI testing patterns
    - Performance analysis and debugging workflows
    - Location: `.claude/skills/chrome-ui-testing-standard/`

- **PR Merge Workflow System** - Automated PR merge management
  - **agents/pr-merge-manager.md** - PR merge coordination agent
    - Manages PR creation, review, and merge workflows
    - Coordinates between develop and main branches
    - Location: `.claude/agents/pr-merge-manager.md`
  - **commands/create-pr.md** - Create pull request command
    - Automated PR creation with templates
    - Branch validation and checks
    - Location: `.claude/commands/create-pr.md`
  - **commands/merge-to-develop.md** - Merge feature branch to develop
    - Automated merge workflow with validation
    - Conflict resolution guidance
    - Location: `.claude/commands/merge-to-develop.md`
  - **commands/merge-to-main.md** - Merge develop to main
    - Production release workflow
    - Pre-merge validation and checks
    - Location: `.claude/commands/merge-to-main.md`
  - **skills/pr-merge-workflow/** - PR merge workflow skill
    - Production-grade PR management patterns
    - Branch protection and merge strategies
    - Location: `.claude/skills/pr-merge-workflow/`

- **Docker Port Management System** - Cross-project port allocation
  - **config/docker-port-registry.json** - Centralized port registry
    - Tracks port allocations across all projects
    - Prevents port conflicts
    - Location: `.claude/config/docker-port-registry.json`
  - **skills/docker-ports-standard/** - Docker port management skill
    - Port allocation patterns and collision detection
    - Multi-project development environment management
    - Location: `.claude/skills/docker-ports-standard/`

- **agents/domain-brainstormer.md** - Domain brainstorming agent
  - AI-powered domain name generation and validation
  - Business model analysis and domain selection guidance
  - Integration with domain registration workflows
  - Location: `.claude/agents/domain-brainstormer.md`

- **agents/stripe-subscriptions-specialist.md** - Stripe subscriptions specialist agent
  - Subscription billing patterns and implementation guidance
  - Recurring payment workflows and subscription lifecycle management
  - Proration, upgrades, downgrades, and cancellation handling
  - Location: `.claude/agents/stripe-subscriptions-specialist.md`

- **commands/brainstorm-domains.md** - Domain brainstorming command
  - Interactive domain name generation workflow
  - Business model alignment and domain validation
  - Integration with domain registration services
  - Location: `.claude/commands/brainstorm-domains.md`

- **commands/implement-stripe-subscriptions.md** - Stripe subscriptions implementation command
  - Complete subscription billing system setup
  - Recurring payment workflows and subscription management
  - Uses `stripe-subscriptions-standard` skill
  - Location: `.claude/commands/implement-stripe-subscriptions.md`

- **skills/domain-brainstormer/** - Domain brainstorming skill
  - Domain name generation patterns and validation strategies
  - Business model alignment and domain selection criteria
  - Location: `.claude/skills/domain-brainstormer/`

- **skills/stripe-subscriptions-standard/** - Stripe subscriptions skill
  - Production-grade subscription billing patterns
  - Recurring payment workflows and subscription lifecycle management
  - Proration, upgrades, downgrades, and cancellation handling
  - Location: `.claude/skills/stripe-subscriptions-standard/`

- **config/** directory - Claude Code configuration management
  - Centralized configuration for Claude Code tools
  - Settings and preferences management
  - Location: `.claude/config/`

- **settings.json** - Claude Code settings configuration
  - Tool preferences and behavior settings
  - Location: `.claude/settings.json`

### Changed
- **Agent Documentation Updates** - Comprehensive updates across all 33 agent files
  - Enhanced agent descriptions and usage patterns
  - Improved coordination workflows and integration examples
  - Updated metadata and version information
  - Location: `.claude/agents/*.md`

- **Command Documentation Updates** - Enhanced command documentation
  - **commands/bootstrap-project.md** - Improved project initialization workflow
  - **commands/docker-ports.md** - Enhanced port management capabilities
  - **commands/project-mvp-status.md** - Improved MVP tracking and reporting
  - **commands/project-status.md** - Enhanced status reporting capabilities
  - Location: `.claude/commands/*.md`

- **settings.json** - Updated Claude Code settings configuration
  - Tool preferences and behavior settings
  - Location: `.claude/settings.json`

- **agents/boilerplate-update-manager.md** - Enhanced boilerplate update management
  - Improved update detection and conflict resolution
  - Enhanced manifest tracking and version management
  - Location: `.claude/agents/boilerplate-update-manager.md`

- **commands/bootstrap-project.md** - Enhanced project bootstrap workflow
  - Expanded project initialization capabilities
  - Improved template selection and customization options
  - Location: `.claude/commands/bootstrap-project.md`

- **commands/project-mvp-status.md** - Enhanced MVP status tracking
  - Improved progress tracking and milestone management
  - Enhanced reporting capabilities
  - Location: `.claude/commands/project-mvp-status.md`

- **commands/project-status.md** - Comprehensive project status reporting
  - Enhanced status tracking and reporting capabilities
  - Improved integration with project management systems
  - Location: `.claude/commands/project-status.md`

- **commands/update-boilerplate.md** - Enhanced boilerplate update workflow
  - Improved update detection and application
  - Enhanced conflict resolution and merge strategies
  - Location: `.claude/commands/update-boilerplate.md`

- **agents/stripe-connect-specialist.md** - Enhanced Stripe Connect patterns
  - Additional marketplace payment patterns
  - Improved multi-tenant payment workflows
  - Location: `.claude/agents/stripe-connect-specialist.md`

- **skills/** - Updated domain-specific skills documentation
  - Enhanced patterns for barbershop, construction, delivery, events, fintech, luxury, music, nonprofit, paas, rental, social, transportation, video domains
  - Improved implementation guidance and best practices
  - Location: `.claude/skills/[domain]/`

- **commands/** - Updated command documentation across all commands
  - Improved usage examples and integration patterns
  - Enhanced workflow documentation
  - Location: `.claude/commands/[command].md`

- **agents/** - Updated agent documentation
  - Enhanced agent descriptions and usage patterns
  - Improved coordination workflows
  - Location: `.claude/agents/[agent].md`

### Added
- **skills/pptx/package.json** - PPTX skill package dependencies
  - Package.json file for pptx skill with dependencies (playwright, pptxgenjs, sharp)
  - Enables PowerPoint presentation generation capabilities
  - Location: `.claude/skills/pptx/package.json`

- **skills/barbershop/** - Barbershop domain-specific skills
  - `barbershop-booking-standard.md` - Appointment booking and scheduling patterns for barbershops
  - `barbershop-loyalty-standard.md` - Customer loyalty and rewards program patterns
  - `barbershop-pos-standard.md` - Point-of-sale system patterns for barbershops
  - `barbershop-queue-standard.md` - Queue management and walk-in handling patterns
  - Location: `.claude/skills/barbershop/`

- **skills/construction/** - Construction domain-specific skills
  - Construction project management and estimation patterns
  - Location: `.claude/skills/construction/`

- **skills/delivery/** - Delivery domain-specific skills
  - `delivery-driver-standard.md` - Driver management and dispatch patterns
  - `food-delivery-standard.md` - Food delivery platform patterns
  - `non-food-delivery-standard.md` - General delivery and logistics patterns
  - Location: `.claude/skills/delivery/`

- **skills/events/** - Events domain-specific skills
  - `event-ticketing-standard.md` - Event ticketing and ticket management patterns
  - `venue-contract-standard.md` - Venue contract management patterns
  - `venue-pos-standard.md` - Venue point-of-sale system patterns
  - Location: `.claude/skills/events/`

- **skills/federation/** - GraphQL Federation domain-specific skills
  - GraphQL federation patterns for microservices architecture
  - Location: `.claude/skills/federation/`

- **skills/fintech/** - Fintech domain-specific skills
  - Financial technology patterns including payments, banking, and financial services
  - Location: `.claude/skills/fintech/`

- **skills/luxury/** - Luxury services domain-specific skills
  - High-end service booking and management patterns
  - Location: `.claude/skills/luxury/`

- **skills/music/** - Music industry domain-specific skills
  - Music industry collaboration, copyright, and royalty management patterns
  - Location: `.claude/skills/music/`

- **skills/nonprofit/** - Nonprofit domain-specific skills
  - Nonprofit organization management and fundraising patterns
  - Location: `.claude/skills/nonprofit/`

- **skills/paas/** - Platform-as-a-Service domain-specific skills
  - Multi-tenant SaaS platform patterns and infrastructure
  - Location: `.claude/skills/paas/`

- **skills/rental/** - Rental domain-specific skills
  - Peer-to-peer rental platform patterns (e.g., car rental, equipment rental)
  - Location: `.claude/skills/rental/`

- **skills/social/** - Social platform domain-specific skills
  - Social networking and community platform patterns
  - Location: `.claude/skills/social/`

- **skills/transportation/** - Transportation domain-specific skills
  - Ride-sharing, transportation, and logistics platform patterns
  - Location: `.claude/skills/transportation/`

- **skills/video/** - Video platform domain-specific skills
  - Video streaming, conferencing, and content platform patterns
  - Location: `.claude/skills/video/`

- **commands/migrate-mongodb-to-postgresql.md** - MongoDB to PostgreSQL migration command
  - Complete migration guide for MongoDB-based applications
  - Schema analysis and type mapping
  - Location: `.claude/commands/migrate-mongodb-to-postgresql.md`

- **skills/react-native-standard/** - React Native skill
  - Enterprise-grade React Native development patterns for cross-platform mobile applications
  - TypeScript, Redux Toolkit, Apollo Client, React Navigation integration
  - Platform-specific optimizations for iOS and Android
  - Component patterns and navigation configuration
  - Location: `.claude/skills/react-native-standard/`

- **skills/offline-first-standard/** - Offline-first skill
  - Production-grade offline-first architecture patterns for mobile applications
  - Data synchronization and conflict resolution
  - Local storage and caching strategies
  - Network state management
  - Location: `.claude/skills/offline-first-standard/`

- **skills/mobile-deployment-standard/** - Mobile deployment skill
  - Production-grade mobile deployment patterns with Fastlane
  - iOS App Store and Google Play Store deployment workflows
  - CI/CD integration for mobile applications
  - Code signing and provisioning profile management
  - Location: `.claude/skills/mobile-deployment-standard/`

- **skills/developer-experience-standard/** - Developer experience skill
  - Production-tested developer experience patterns
  - Monorepo workspace configuration
  - Code quality tooling (ESLint, Prettier)
  - Pre-commit hooks (Husky, lint-staged)
  - TypeScript configuration and npm scripts organization
  - Location: `.claude/skills/developer-experience-standard/`

- **skills/debugging-standard/** - Debugging skill
  - Production-grade debugging patterns and tooling
  - VS Code debugging configuration
  - Error tracking and logging
  - Development environment setup
  - Location: `.claude/skills/debugging-standard/`

- **skills/code-generation-standard/** - Code generation skill
  - Production-grade code generation scaffolding patterns
  - Component and file templates
  - Automated code generation workflows
  - Development productivity tools
  - Location: `.claude/skills/code-generation-standard/`

- **commands/implement-developer-tooling.md** - Developer tooling implementation command
  - Complete developer experience tooling setup
  - ESLint, Prettier, Husky, lint-staged, VS Code configuration
  - Location: `.claude/commands/implement-developer-tooling.md`

- **commands/implement-mobile-app.md** - Mobile application implementation command
  - Complete React Native mobile application setup
  - TypeScript, Redux Toolkit, Apollo Client, offline-first architecture
  - Location: `.claude/commands/implement-mobile-app.md`

- **skills/performance-optimization-standard/** - Performance optimization skill
  - Enterprise-grade frontend and backend performance optimization patterns
  - Core Web Vitals optimization (LCP < 2.5s, FID < 100ms, CLS < 0.1, TTI < 3.0s)
  - Code splitting, SSR optimization, and runtime performance
  - Bundle size reduction and image optimization
  - Location: `.claude/skills/performance-optimization-standard/`

- **skills/caching-standard/** - Caching skill
  - Production-grade caching patterns with Redis and in-memory caching
  - Cache invalidation strategies and TTL management
  - GraphQL DataLoader integration for N+1 query prevention
  - Cache warming and cache-aside patterns
  - Location: `.claude/skills/caching-standard/`

- **skills/database-query-optimization-standard/** - Database query optimization skill
  - Production-grade database query optimization patterns
  - Index optimization and query analysis
  - N+1 query prevention and batch loading
  - Query performance monitoring
  - Location: `.claude/skills/database-query-optimization-standard/`

- **commands/implement-performance-optimization.md** - Performance optimization implementation command
  - Comprehensive performance optimization setup
  - Frontend and backend optimization workflows
  - Location: `.claude/commands/implement-performance-optimization.md`

- **commands/implement-caching.md** - Caching implementation command
  - Complete caching infrastructure setup
  - Redis and in-memory caching configuration
  - Location: `.claude/commands/implement-caching.md`

- **skills/multi-tenancy-standard/** - Multi-tenancy architecture skill
  - Production-grade multi-tenant SaaS architecture patterns
  - PLATFORM_OWNER vs SITE_OWNER isolation and role separation
  - tenant_id data segregation and row-level security
  - Stripe Connect payment flows for marketplace
  - Clerk multi-tenant authentication patterns
  - Revenue model and tenant isolation middleware
  - Location: `.claude/skills/multi-tenancy-standard/`

- **skills/database-migration-standard/** - Database migration skill
  - Production-grade database migration patterns
  - Sequelize migration workflows and best practices
  - Multi-environment migration support
  - Migration rollback and validation patterns
  - Location: `.claude/skills/database-migration-standard/`

- **skills/file-storage-standard/** - File storage skill
  - Production-grade file storage patterns
  - AWS S3 integration and file management
  - File upload, download, and deletion workflows
  - Location: `.claude/skills/file-storage-standard/`

- **commands/implement-multi-tenancy.md** - Multi-tenancy architecture implementation command
  - Complete multi-tenant SaaS setup
  - PLATFORM_OWNER vs SITE_OWNER isolation
  - tenant_id data segregation
  - Location: `.claude/commands/implement-multi-tenancy.md`

- **commands/implement-migrations.md** - Database migration implementation command
  - Complete database migration workflow
  - Multi-environment support
  - Location: `.claude/commands/implement-migrations.md`

- **skills/testing-strategy-standard/** - Testing strategy skill
  - Production-grade testing infrastructure patterns
  - Jest unit testing and Playwright E2E testing
  - Three-tier test pyramid strategy (smoke, regression, full suite)
  - CI/CD integration and coverage thresholds
  - Visual regression, accessibility, and performance testing
  - Location: `.claude/skills/testing-strategy-standard/`

- **skills/security-best-practices-standard/** - Security best practices skill
  - Production-grade security patterns
  - Authentication, authorization, input validation, secure headers
  - Rate limiting and OWASP Top 10 protection
  - Security header configuration and vulnerability scanning
  - Location: `.claude/skills/security-best-practices-standard/`

- **skills/error-monitoring-standard/** - Error monitoring skill
  - Production-grade error monitoring and logging patterns
  - Sentry integration and error tracking
  - Performance monitoring and alerting
  - Error boundary patterns and breadcrumbs
  - Location: `.claude/skills/error-monitoring-standard/`

- **commands/implement-testing.md** - Testing infrastructure implementation command
  - Complete testing stack setup (Jest + Playwright)
  - Three-tier test pyramid implementation
  - CI/CD integration
  - Location: `.claude/commands/implement-testing.md`

- **commands/implement-security-audit.md** - Security audit implementation command
  - Complete security audit and best practices implementation
  - OWASP Top 10 protection
  - Security header configuration
  - Location: `.claude/commands/implement-security-audit.md`

- **skills/aws-deployment-standard/** - AWS deployment skill
  - Production-grade AWS deployment patterns for Amplify (frontends) and App Runner/EC2 (backends)
  - PM2 process management and nginx reverse proxy configuration
  - AWS Parameter Store secrets management
  - Multi-environment deployments (staging/production)
  - Location: `.claude/skills/aws-deployment-standard/`

- **skills/ci-cd-pipeline-standard/** - CI/CD pipeline skill
  - Production-grade GitHub Actions CI/CD pipelines
  - Automated testing, deployments, database migrations
  - Security scanning, Slack notifications, health checks
  - Release management workflows
  - Location: `.claude/skills/ci-cd-pipeline-standard/`

- **skills/docker-containerization-standard/** - Docker containerization skill
  - Docker containerization patterns for applications
  - Multi-stage builds and optimization
  - Docker Compose configurations
  - Container orchestration patterns
  - Location: `.claude/skills/docker-containerization-standard/`

- **commands/implement-aws-deployment.md** - AWS deployment implementation command
  - Complete AWS deployment setup
  - Frontend and backend deployment workflows
  - Location: `.claude/commands/implement-aws-deployment.md`

- **commands/implement-ci-cd.md** - CI/CD pipeline implementation command
  - Complete GitHub Actions CI/CD setup
  - Automated workflows and validation
  - Location: `.claude/commands/implement-ci-cd.md`

- **skills/admin-dashboard-standard/** - Admin dashboard skill
  - Production-grade admin dashboard with tab-based analytics
  - Real-time metrics and comprehensive business intelligence interfaces
  - Metric cards with growth indicators, time range selectors
  - Data visualization layouts
  - Tab-based analytics dashboard patterns
  - Location: `.claude/skills/admin-dashboard-standard/`

- **skills/analytics-tracking-standard/** - Analytics tracking skill
  - Google Analytics 4 integration with rate limiting and circuit breaker patterns
  - E-commerce tracking and event management
  - Backend GA4 Data API integration
  - Caching strategies for analytics data
  - Location: `.claude/skills/analytics-tracking-standard/`

- **skills/reporting-standard/** - Reporting skill
  - Sales reporting and analytics
  - CSV/Excel export to S3
  - Report generation and scheduling
  - Data aggregation patterns
  - Location: `.claude/skills/reporting-standard/`

- **commands/implement-analytics.md** - Analytics implementation command
  - Complete Google Analytics 4 integration
  - Backend and frontend tracking
  - Real-time analytics and reporting
  - Location: `.claude/commands/implement-analytics.md`

- **commands/implement-admin-dashboard.md** - Admin dashboard implementation command
  - Tab-based analytics dashboard
  - Real-time metrics and business intelligence
  - Location: `.claude/commands/implement-admin-dashboard.md`

- **skills/stripe-connect-standard/** - Stripe Connect payment skill (Phase 2 standardization)
  - Multi-tenant marketplace payments with Connect accounts
  - OAuth flow, payment splitting, fee calculation
  - Webhook processing and payout management
  - Platform fee collection patterns
  - Location: `.claude/skills/stripe-connect-standard/`

- **skills/product-catalog-standard/** - Product catalog skill (Phase 2 standardization)
  - Product CRUD operations with variants and categories
  - SKU management and inventory tracking
  - Product search and filtering
  - Location: `.claude/skills/product-catalog-standard/`

- **skills/shopping-cart-standard/** - Shopping cart skill (Phase 2 standardization)
  - Cart state management with persistence
  - Guest and user cart support
  - Cart operations (add, update, remove, clear)
  - Location: `.claude/skills/shopping-cart-standard/`

- **skills/checkout-flow-standard/** - Checkout flow skill (Phase 2 standardization)
  - Multi-step checkout process
  - Payment integration and validation
  - Order creation and confirmation
  - Location: `.claude/skills/checkout-flow-standard/`

- **skills/order-management-standard/** - Order management skill (Phase 2 standardization)
  - Order CRUD operations and status lifecycle
  - Order fulfillment and tracking
  - Order history and detail views
  - Location: `.claude/skills/order-management-standard/`

- **skills/email-notifications-standard/** - Email notifications skill (Phase 2 standardization)
  - Transactional email templates
  - Email delivery tracking
  - Template management
  - Location: `.claude/skills/email-notifications-standard/`

- **skills/sms-notifications-standard/** - SMS notifications skill (Phase 2 standardization)
  - Transactional SMS messaging
  - SMS delivery tracking
  - Phone number validation
  - Location: `.claude/skills/sms-notifications-standard/`

- **skills/realtime-updates-standard/** - Real-time updates skill (Phase 2 standardization)
  - WebSocket and Server-Sent Events patterns
  - Real-time order status updates
  - Inventory change notifications
  - Location: `.claude/skills/realtime-updates-standard/`

- **commands/implement-stripe-standard.md** - Stripe Connect implementation command
  - Uses `stripe-connect-standard` skill
  - Complete marketplace payment setup
  - Location: `.claude/commands/implement-stripe-standard.md`

- **commands/implement-ecommerce.md** - E-commerce stack implementation command
  - Uses multiple e-commerce skills (product-catalog, shopping-cart, checkout-flow, order-management)
  - Complete e-commerce implementation workflow
  - Location: `.claude/commands/implement-ecommerce.md`

- **commands/implement-notifications.md** - Notification system implementation command
  - Uses `email-notifications-standard` and `sms-notifications-standard` skills
  - Multi-channel notification setup
  - Location: `.claude/commands/implement-notifications.md`

- **commands/implement-realtime.md** - Real-time updates implementation command
  - Uses `realtime-updates-standard` skill
  - WebSocket/SSE implementation workflow
  - Location: `.claude/commands/implement-realtime.md`

- **skills/admin-panel-standard/** - Production-grade admin panel skill (Phase 1 standardization)
  - RBAC-filtered navigation with role hierarchy
  - Collapsible sidebar with local storage persistence
  - Dashboard widgets (StatCards, QuickActionCards, ActivityFeeds)
  - Access level guards and protected routes
  - Component templates and implementation patterns
  - Location: `.claude/skills/admin-panel-standard/`

- **skills/clerk-auth-standard/** - Clerk authentication skill (Phase 1 standardization)
  - Complete Clerk integration patterns
  - Custom authentication UI components
  - Webhook event handling
  - JWT structure and validation
  - Sign-in, sign-up, forgot password flows
  - Location: `.claude/skills/clerk-auth-standard/`

- **skills/design-to-nextjs/** - Design conversion skill (Phase 1 standardization)
  - Magic Patterns mockup to Next.js App Router conversion
  - Component generation from design files
  - Routing and layout setup
  - Location: `.claude/skills/design-to-nextjs/`

- **skills/user-management-standard/** - User management skill (Phase 1 standardization)
  - User CRUD operations
  - Role assignment and permissions
  - User directory and detail views
  - Location: `.claude/skills/user-management-standard/`

- **commands/implement-admin-panel.md** - Admin panel implementation command
  - Uses `admin-panel-standard` skill
  - Interactive implementation workflow
  - Location: `.claude/commands/implement-admin-panel.md`

- **commands/implement-clerk-standard.md** - Clerk authentication command
  - Uses `clerk-auth-standard` skill
  - Complete auth flow implementation
  - Location: `.claude/commands/implement-clerk-standard.md`

- **commands/convert-design.md** - Design conversion command
  - Uses `design-to-nextjs` skill
  - Mockup to production conversion
  - Location: `.claude/commands/convert-design.md`

### Changed
- **Standardization Strategy Implementation** - Phase 2 E-Commerce Core skills and commands
  - Implements 8 Phase 2 skills (stripe-connect, product-catalog, shopping-cart, checkout-flow, order-management, email-notifications, sms-notifications, realtime-updates)
  - Implements 4 Phase 2 commands (implement-stripe-standard, implement-ecommerce, implement-notifications, implement-realtime)
  - Completes E-Commerce Core tier from standardization strategy
  - Enables full e-commerce functionality for 30-day MVP delivery
  - See `docs/STANDARDIZATION_STRATEGY.md` for complete strategy

- **Standardization Strategy Implementation** - Phase 1 foundation skills and commands
  - Implements first 4 skills from standardization strategy (admin-panel, clerk-auth, design-to-nextjs, user-management)
  - Implements first 3 commands from standardization strategy
  - Enables 30-day website MVP delivery timeline
  - See `docs/STANDARDIZATION_STRATEGY.md` for complete strategy

## [1.18.0] - 2025-11-03

### Changed
- **commands/bootstrap-project.md** - Infrastructure-first deployment approach
  - Prioritizes immediate deployment to AWS Amplify and EC2
  - Establishes CI/CD pipeline before feature development
  - See commands/CHANGELOG.md for detailed changes

- **commands/git-commit-docs.md** - Renamed and standardized
  - Previously git-commit-docs-command.md
  - Maintains comprehensive documentation workflow

### Added
- **BOOTSTRAP-PROJECT-DEVELOPMENT-THREAD.md** - Development discussion and planning document
- **workflows/deploy-backend-staging-ec2.yml** - GitHub Actions deployment workflow

## [1.17.0] - 2025-10-27

### Added
- **BOOTSTRAP-PROJECT-SUMMARY.md** - Executive summary document for bootstrap-project command
  - Technical specifications and file statistics (111KB command file)
  - Complete 10-phase execution flow documentation
  - Success metrics and competitive advantage analysis
  - Client deliverables and confidence package details

- **MOCKUP-TO-PRODUCTION-STRATEGY.md** - Complete mockup conversion implementation guide
  - Magic Patterns mockup parsing methodology
  - Next.js 16 App Router conversion patterns
  - GraphQL schema generation from mockup data
  - Complete feature implementation workflow
  - Production-ready code generation strategies

- **port-manager.sh** - Intelligent port allocation and conflict resolution script (9.2KB, executable)
  - Global port registry management
  - Automatic port allocation for new projects
  - Live port usage analysis
  - Integration with deployment commands

- **port-registry.json** - Centralized port tracking database (4KB)
  - Tracks 15+ projects across client portfolios
  - ODD numbers for backend (3025, 3027, 3029...)
  - EVEN numbers for frontend (3026, 3028, 3030...)
  - Auto-syncs to boilerplate for future project awareness

### Modified
- **CLAUDE.md** - Updated command system documentation
  - Added bootstrap-project command documentation
  - Added generate-session-report command reference
  - Enhanced port management system documentation
  - Updated domain-specific agent orchestration commands to v1.7.0

### Technical Details
- **Port Management**: Global registry prevents port conflicts across all projects
- **Bootstrap Automation**: 111KB command orchestrates 26+ specialized agents
- **Mockup Conversion**: Complete strategy for Magic Patterns → Production transformation
- **Executive Summary**: Comprehensive project tracking and client deliverables

## [1.16.0] - 2025-01-27

### Added
- **organize-docs.md** - Comprehensive documentation management command specification
  - Complete command documentation with usage examples and integration guidelines
  - Documentation standards enforcement (README.md vs INDEX.md)
  - Content validation patterns and placeholder detection
  - Link management and cross-reference validation
  - Index generation for improved navigation
  - Auto-fix capabilities for common documentation issues
  - Integration with git workflow and CI/CD pipelines
  - Best practices and troubleshooting guides

### Modified
- **agents/README.md** - Created comprehensive agent catalog
  - 40+ specialized agents categorized by function
  - Detailed descriptions and usage examples
  - Agent coordination patterns and collaboration workflows
  - Technology mapping and specialization areas
  - Development guidelines and contribution process

### Technical Details
- **Command Integration**: Seamless integration with existing git-commit-docs workflow
- **Documentation Standards**: Enforced README.md naming convention across all directories
- **Quality Assurance**: Proactive detection and correction of documentation issues
- **Navigation Enhancement**: Improved discoverability through comprehensive indexes
- **Cross-Reference Management**: Ensures consistency across all documentation files

## [1.14.0] - 2025-10-17

### Added
- **AGENT-ORCHESTRATION-ARCHITECTURE.md** - Comprehensive architecture documentation for the agent orchestration system
  - Complete system architecture and design principles
  - Performance metrics and context optimization details
  - Agent coordination patterns (sequential, parallel, conditional)
  - Future enhancements roadmap
- **COMMAND-CONSOLIDATION-PLAN.md** - Migration guide from legacy commands to orchestrated system
  - Commands to deprecate and migration paths
  - Commands to keep and rationale
  - Implementation timeline and phases
  - Benefits analysis and success metrics
- **AGENT-ORCHESTRATION-V1.7.0-RELEASE.md** - Official release summary document
  - Performance improvements (70-80% context reduction)
  - Deployment statistics (30 projects updated)
  - Usage examples and workflows
  - Upgrade instructions and support information
- **scripts/bulk-update-orchestration-system.sh** - Automated bulk update script for all projects
  - Updates 30 projects across client and Quik-Nation portfolios
  - Automatic backups and safety measures
  - Manifest version updates and feature tracking
  - Comprehensive reporting and summary

### Changed
- **agents/** - Renamed jira-integration-manager to project-management-bridge with multi-PM system support
- **commands/** - Added 8 new domain-specific orchestrated commands (see commands/CHANGELOG.md)

### Documentation
- commands/CHANGELOG.md - Detailed command changes and additions
- agents/CHANGELOG.md - Detailed agent changes and additions

## [1.13.1] - 2025-10-15

### Changed
- Claude Code configuration metadata updates

## [1.13.0] - 2025-10-14

### Added
- Documentation organization enhancements
