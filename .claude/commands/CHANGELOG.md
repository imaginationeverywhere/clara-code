# .claude/commands Changelog

## [1.35.1] - 2026-04-16

### Added
- **`/merge-all`** — `.claude/commands/merge-all.md` + `.claude/scripts/merge-all.sh` (mirrored `.cursor/commands/merge-all.md`): fetch, merge every `origin/*` branch into `develop` (except `main` / `develop` / `backup/*` / `HEAD`), always push `develop`, delete other local and remote branches; conflicts abort and those branches are kept for manual rebase.
- **pickup-prompt v3.14.0 + queue-prompt** — `--bedrock` loads `setup/bedrock.md` and `/setup-bedrock`; requires `docs/standards/AI-MODEL-ROUTING.md` for routing changes.
- **pickup-prompt v3.13.0 + queue-prompt** — `--migrate-amplify-to-cf` loads the Amplify→Cloudflare Workers + DNS playbook (`setup/migrate-amplify-to-cf.md` + `/migrate-amplify-to-cf`).
- **`/git-sweep`** — `.claude/commands/git-sweep.md` + `.claude/scripts/git-sweep.sh` (mirrored `.cursor/commands/git-sweep.md`): prune merged branches and orphaned worktrees across Herus.
- **open-qcs1.md** — Related Commands: link to `/open-tabs`.

### Changed
- **`/git-sweep`** — `--apply` (interactive apply; confirms when >20 operations), `--yes` (apply without prompts); `--merged-only` skips worktree prune and dangling `worktree-agent-*` deletes on apply; single-repo mode exits with an error outside a git repo; prints recent **active** branches; macOS Bash 3.2 + `set -u` safe empty-array handling.
- **`.claude/settings.json`** — Session / Stop / Subagent hooks resolve `PROJ` via `git rev-parse --show-toplevel` and run hook scripts with `bash "${PROJ}/.claude/hooks/…"`.

## [1.35.0] - 2026-04-15 (evening)

### Added
- **.claude/hooks/auto-memory.sh, voice-tts.sh, telegraph-check.sh** — No-op stub scripts to silence "missing script" Stop-hook errors that were spamming every session pause. Settings.json no longer fails on Stop events.
- **.claude/scripts/inject-target-repo.py** — Idempotent classifier that scans `prompts/<date>/1-not-started/` and prepends `**TARGET REPO:**` headers based on filename pattern matching. Used April 15 to classify 92 prompts; 1 marked REVIEW_NEEDED. STRIKE-WORTHY rule that prompts must declare target repo before queue entry.

### Changed
- **.claude/commands/grill-me.md + .cursor/commands/grill-me.md** — Refactored requirement-interrogation flow (-78 / +60 lines, cleaner branching).
- **.claude/scripts/pickup-dispatch.sh** — One-line fix.

## [Unreleased] - 2026-04-15

### Added
- **`/setup-bedrock`** — `.claude/commands/setup-bedrock.md` (+ `.cursor/commands/setup-bedrock.md`): AWS Bedrock for Ra Intelligence, DeepSeek default, SSM/IAM. Setup template `prompts/setup/bedrock.md`. **`pickup-prompt` / `queue-prompt`:** `--bedrock` (v3.14.0). Backend: `backend/src/config/bedrock.ts`, `backend/src/features/ai/bedrock/`, `RaIntelligence` integration. Docs: `docs/standards/AI-MODEL-ROUTING.md`, `docs/technical/AI_INTEGRATION.md` (Bedrock section). Agent: `.claude/agents/cloudflare-ai-gateway.md` (Bedrock primary vs CF supplementary).
- **`open-tabs.sh` (security)** — H1/H2 shell-injection fixes: `printf %q` for Claude team strings and SSH remote body; `validate_remote_path` (`^[~/a-zA-Z0-9._/+-]+$`); `ssh %q -t bash -lc %q` wrapper; numeric validation for `--cursor-qcs1` + interactive; self-contained `usage()` (prompt `129-fix-open-tabs-shell-injection.md`).
- **`/open-tabs`** — `.claude/commands/open-tabs.md` + `.claude/scripts/open-tabs.sh`: spawn Claude Code and/or Cursor agent **windows** (tabs) or **panes** in the **current** tmux session; `--claude`, `--cursor` (count or prompt ids), `--cursor-qcs1`, `--layout tabs|panes`, `--project` + named aliases, `--dry-run`, confirmation at 6+ spawns, `.heru-skip` guard, live-feed line. Mirrored `.cursor/commands/open-tabs.md`. See `docs/standards/swarm-accountability-rules.md` (additive /open-tabs note).
- **`/migrate-amplify-to-cf`** — `.claude/commands/migrate-amplify-to-cf.md`: Amplify → Cloudflare Workers + Route53→CF DNS playbook (`--dry-run`, `--frontend-only`, `--dns-only`, `--rollback`). Setup template `prompts/setup/migrate-amplify-to-cf.md`. Docs: `docs/cloudflare/AMPLIFY-TO-CLOUDFLARE-MIGRATION.md`, `docs/migrations/README.md`. **`pickup-prompt` / `queue-prompt`:** `--migrate-amplify-to-cf` (v3.13.0). **`sync-herus --standards`:** includes new cloudflare + migrations index paths.
- **pickup-prompt.md v3.12.0 — `--filter <regex>`** — Limits execution to queued prompts whose **basename** matches `grep -E` (e.g. alternation). Sequential loop and `pickup-dispatch.sh` (arg2 or `PICKUP_FILTER` env). Stops when no more matches remain; non-matching files stay in `1-not-started/`.
- **sync-herus.md — `--standards`** — Syncs `docs/standards/*`, deployment + Cloudflare docs, full `docs/prompts/`, and root `CONTEXT_EFFICIENCY.md` to every Heru (git-root `.claude` discovery unchanged). Composes with `--dry-run` and `--push`; commit step stages `docs/` + `CONTEXT_EFFICIENCY.md` when this flag was used.
- **queue-prompt.md** — Documented **symmetric** flag parity with `/pickup-prompt` (standards, setup, prompt-type flags); Step 3b for generating queued files from flags.
- **pickup-prompt.md v3.11.0** — Clara Code **8-step setup** flags + `.claude/commands/prompts/setup/` template library (`--source-control`, provider aliases, `--vite`, `--angular`, `--aws-deploy`, `--gcp`, `--azure`, `--cloudflare`, `--react-native` / `--expo`, `--electron`, `--nextjs`).
- **docs/prompts/** — Discoverable prompt library (mirrors command templates).

### Changed
- **`open-tabs.sh` (`--cursor-qcs1`)** — H2b follow-up (`129-fix-open-tabs-qcs1-cd-regression.md`): the H2 `ssh … bash -lc` wrapper broke remote `cd` (`~/` escaped; `&&` parsed before `bash -lc`). Remote command is now `ssh %q -t %q` with unquoted `cd ${RHOST}` after `validate_remote_path`; message still `printf %q`. Root `CHANGELOG.md` **[1.35.1]** **Fixed** entry.
- **pickup-prompt.md v3.9.3** — Fix `--parallel N` on QCS1: (1) Step 1b: replaced broken `argv=("$@")` parsing with explicit AI-substitution instruction; (2) Parallel block: inline PID loop replaced with call to `~/bin/pickup-dispatch.sh`; (3) Keychain unlock added before cursor spawn.

### Added (earlier same day)
- **.claude/scripts/pickup-dispatch.sh** — Standalone parallel Cursor dispatcher. Real bash forking + PID management + keychain unlock. Install: `cp .claude/scripts/pickup-dispatch.sh ~/bin/ && chmod +x ~/bin/pickup-dispatch.sh`. Usage: `cd <project> && pickup-dispatch.sh 5`.

## [Unreleased] - 2026-04-14

### Added
- **ai-estimate.md** — Machine-speed timeline estimation. Forces all agents to give hours, not sprints. QCS1 baselines, 6-agent parallel batching, 10-50x correction factor vs human estimates.

### Changed
- **pickup-prompt.md v3.8.0** — Enhanced `--status` with full /ai-estimate integration: AI timeline (hrs done/remaining/total), parallel batch math (6 agents/QCS1), prompt filenames to write with flags, cumulative time tracking, human equivalent.

## [Unreleased] - 2026-04-12

### Changed
- **ossie.md** — Deployment/orchestration command doc updates (mirrored in `.cursor/commands/ossie.md`).

## [Unreleased]

### Changed
- **`open-heru-tabs.md`** — Documents **local-only** Claude Code panes in `swarm` tmux (no SSH/QCS1); local absolute paths for team → project mapping; adds `TRK_POC`; aligns with `feedback-open-heru-tabs-vs-open-qcs1` (2026-04-19). `/open-qcs1` remains the remote execution layer.

### Added
- **Named agent commands (Agent Naming Registry)** — 50+ command files in `.claude/commands/` mirrored to `.cursor/commands/`: achebe, assata, basquiat, benjamin, booker-t, charles, cheikh, chimamanda, clark, dessalines, dorothy, elijah, fela, gary, harriet, hugh, ida, imhotep, jesse, katherine, langston, lewis, lorraine, madam-cj, mae, mandela, marcus, mary-jackson, miriam, nandi, nina, oscar, ossie, phillis, rian, rosa, ruby, shirley, sojourner, thurgood, toni, toussaint, validate-task, wangari, wilma, zora. Aligned with `docs/AGENT_NAMING_REGISTRY.md`.

- **Dispatch, design, and platform commands**
  - **dispatch-agent.md** — Dispatch tasks to Cursor/build farm (Bayard); references `.claude/commands/` and `.cursor/commands/`
  - **n8n-create-workflows.md** — Create and manage n8n automation workflows
  - **pencil-design.md** — Design and UI workflows with Pencil
  - **swarm-manage.md** — Swarm/build farm management
  - **vault-sync.md** — Vault synchronization workflows
  - Location: `.claude/commands/` (mirrored in `.cursor/commands/`)

- **Auset Orchestration & Platform Commands** - Cursor dispatch, sync, progress, gap analysis, dialogue, AI gateway
  - **dispatch-cursor.md**, **orchestrate.md** - Cursor Agent CLI orchestration
  - **sync-herus.md** - Push platform changes to all Heru projects
  - **progress.md** - Quick progress dashboard; **gap-analysis.md** - Deep plan vs code analysis
  - **research.md**, **brainstorm.md**, **talk.md**, **teach.md**, **explore.md** - Dialogue and discovery
  - **save-plan.md** - Save plans to .claude/plans and .cursor/plans
  - **setup-ai-gateway.md** - Initialize Cloudflare AI Gateway
  - **auset-activate.md**, **auset-status.md** - Feature activation and status
  - **browser-debug.md** - Browser debugging (replaces chrome-debug); **commands.md** - Command navigator
  - **add-feature.md** - Scaffold new feature; **project-playground.md** - MVP playground
  - **COMMAND_CHEAT_SHEET.md** - Top 40 commands by workflow (in .claude/ and .cursor/)
  - Location: `.claude/commands/` (mirrored in `.cursor/commands/`)

- **Auto Claude Task Management Commands** - Complete task lifecycle management workflow
  - **ac-start.md** - Start working on a task manually
    - Moves task from Planning to In Progress
    - Claims task for manual implementation
    - Supports branch creation and notes
    - Location: `.claude/commands/ac-start.md`
  - **ac-pause.md** - Pause active task work
    - Saves current progress and notes
    - Moves task back to Planning or marks as blocked
    - Location: `.claude/commands/ac-pause.md`
  - **ac-return.md** - Return to paused task
    - Resumes work on previously paused task
    - Restores context and progress
    - Location: `.claude/commands/ac-return.md`
  - **ac-done.md** - Mark task as completed
    - Moves task to Done status
    - Generates completion summary
    - Location: `.claude/commands/ac-done.md`
  - **ac-status.md** - View task status and progress
    - Shows current task status across all stages
    - Displays progress metrics and velocity
    - Location: `.claude/commands/ac-status.md`
  - **ac-planning.md** - View and manage Planning tasks
    - Lists tasks ready for implementation
    - Exports tasks for manual work
    - Location: `.claude/commands/ac-planning.md`
  - **ac-ai-review.md** - Trigger AI review of completed task
    - Runs automated tests, linting, and build checks
    - Moves task to AI Review status
    - Location: `.claude/commands/ac-ai-review.md`
  - **ac-human-review.md** - Queue task for human review
    - Moves task from AI Review to Human Review
    - Manages review queue and approvals
    - Location: `.claude/commands/ac-human-review.md`

- **Chrome UI Testing Commands** - Browser-based UI testing and debugging
  - **chrome-debug.md** - Chrome UI debugging command
    - Capture screenshots and analyze network requests
    - Debug UI issues in real-time
    - Compare across environments (local, develop, production)
    - Location: `.claude/commands/chrome-debug.md`

- **PR Merge Workflow Commands** - Automated PR merge management
  - **create-pr.md** - Create pull request command
    - Automated PR creation with templates
    - Branch validation and checks
    - Location: `.claude/commands/create-pr.md`
  - **merge-to-develop.md** - Merge feature branch to develop
    - Automated merge workflow with validation
    - Conflict resolution guidance
    - Location: `.claude/commands/merge-to-develop.md`
  - **merge-to-main.md** - Merge develop to main
    - Production release workflow
    - Pre-merge validation and checks
    - Location: `.claude/commands/merge-to-main.md`

- **brainstorm-domains.md** - Domain brainstorming command
  - Interactive domain name generation workflow
  - Business model alignment and domain validation
  - Integration with domain registration services
  - Uses `domain-brainstormer` skill
  - Location: `.claude/commands/brainstorm-domains.md`

- **implement-stripe-subscriptions.md** - Stripe subscriptions implementation command
  - Complete subscription billing system setup
  - Recurring payment workflows and subscription management
  - Proration, upgrades, downgrades, and cancellation handling
  - Uses `stripe-subscriptions-standard` skill
  - Location: `.claude/commands/implement-stripe-subscriptions.md`

- **migrate-mongodb-to-postgresql.md** - MongoDB to PostgreSQL migration command
  - Complete migration guide for MongoDB-based Next.js applications to PostgreSQL + Sequelize boilerplate architecture
  - Schema analysis and type mapping (ObjectId → UUID, embedded documents → normalized tables)
  - Data export and migration workflow automation
  - Designed specifically for site962 and similar projects
  - Location: `.claude/commands/migrate-mongodb-to-postgresql.md`

- **implement-developer-tooling.md** - Developer tooling implementation command
  - Comprehensive developer experience tooling setup including ESLint, Prettier, Husky, lint-staged, VS Code configuration, debugging setup, and code generation scaffolding
  - Monorepo and single package configurations
  - Pre-commit hooks and code quality enforcement
  - Uses `developer-experience-standard`, `debugging-standard`, and `code-generation-standard` skills
  - Location: `.claude/commands/implement-developer-tooling.md`

- **implement-mobile-app.md** - Mobile application implementation command
  - Production-grade React Native mobile application setup with TypeScript, Redux Toolkit, Apollo Client, offline-first architecture, and CI/CD deployment pipelines
  - iOS and Android platform support with Expo option
  - Offline-first capabilities and mobile deployment workflows
  - Uses `react-native-standard`, `offline-first-standard`, and `mobile-deployment-standard` skills
  - Location: `.claude/commands/implement-mobile-app.md`

- **implement-performance-optimization.md** - Performance optimization implementation command
  - Comprehensive performance optimization for frontend (Core Web Vitals, code splitting, image optimization) and backend (DataLoader, query optimization, caching)
  - Core Web Vitals targets (LCP < 2.5s, FID < 100ms, CLS < 0.1, TTI < 3.0s)
  - Bundle size optimization and runtime performance improvements
  - Uses `performance-optimization-standard`, `caching-standard`, and `database-query-optimization-standard` skills
  - Location: `.claude/commands/implement-performance-optimization.md`

- **implement-caching.md** - Caching implementation command
  - Production-grade caching patterns with Redis and in-memory caching
  - Cache invalidation strategies and TTL management
  - GraphQL DataLoader integration for N+1 query prevention
  - Uses `caching-standard` skill
  - Location: `.claude/commands/implement-caching.md`

- **implement-multi-tenancy.md** - Multi-tenancy architecture implementation command
  - Complete multi-tenant SaaS architecture setup
  - PLATFORM_OWNER vs SITE_OWNER isolation patterns
  - tenant_id data segregation and row-level security
  - Stripe Connect payment flows for marketplace
  - Clerk multi-tenant authentication
  - Uses `multi-tenancy-standard`, `database-migration-standard`, and `stripe-connect-standard` skills
  - Location: `.claude/commands/implement-multi-tenancy.md`

- **implement-migrations.md** - Database migration implementation command
  - Production-grade database migration patterns
  - Sequelize migration workflows
  - Multi-environment migration support
  - Migration rollback and validation
  - Uses `database-migration-standard` skill
  - Location: `.claude/commands/implement-migrations.md`

- **implement-testing.md** - Testing infrastructure implementation command
  - Production-grade testing infrastructure with Jest unit testing and Playwright E2E testing
  - Three-tier test pyramid strategy (smoke, regression, full suite)
  - CI/CD integration and coverage thresholds
  - Visual regression, accessibility, and performance testing options
  - Uses `testing-strategy-standard` skill
  - Location: `.claude/commands/implement-testing.md`

- **implement-security-audit.md** - Security audit implementation command
  - Production-grade security patterns and audit procedures
  - Authentication, authorization, input validation, secure headers
  - Rate limiting and OWASP Top 10 protection
  - Security header configuration and vulnerability scanning
  - Uses `security-best-practices-standard` and `error-monitoring-standard` skills
  - Location: `.claude/commands/implement-security-audit.md`

- **implement-aws-deployment.md** - AWS deployment implementation command
  - Complete AWS deployment setup for frontends (Amplify) and backends (App Runner/EC2)
  - PM2 process management, nginx reverse proxy configuration
  - AWS Parameter Store secrets management
  - Multi-environment deployments (staging/production)
  - Uses `aws-deployment-standard` and `docker-containerization-standard` skills
  - Location: `.claude/commands/implement-aws-deployment.md`

- **implement-ci-cd.md** - CI/CD pipeline implementation command
  - Production-grade GitHub Actions CI/CD pipelines
  - Automated testing, deployments, database migrations
  - Security scanning, Slack notifications, health checks
  - Release management workflows
  - Uses `ci-cd-pipeline-standard` skill
  - Location: `.claude/commands/implement-ci-cd.md`

- **implement-analytics.md** - Analytics implementation command
  - Complete Google Analytics 4 integration with rate limiting, circuit breaker patterns, caching
  - E-commerce tracking and comprehensive reporting
  - Backend GA4 Data API integration
  - Real-time analytics, sales reporting, CSV/Excel export to S3
  - Admin dashboard integration
  - Uses `analytics-tracking-standard` and `reporting-standard` skills
  - Location: `.claude/commands/implement-analytics.md`

- **implement-admin-dashboard.md** - Admin dashboard implementation command
  - Production-grade admin dashboard with tab-based analytics
  - Real-time metrics and comprehensive business intelligence interfaces
  - Metric cards with growth indicators, time range selectors
  - Data visualization layouts
  - Uses `admin-dashboard-standard` skill
  - Location: `.claude/commands/implement-admin-dashboard.md`

- **implement-stripe-standard.md** - Stripe Connect implementation command (Phase 2 standardization)
  - Complete Stripe Connect for multi-tenant marketplace payments
  - Connect account setup, OAuth flow, payment splitting, fee calculation
  - Webhook processing and payout management
  - Uses `stripe-connect-standard` skill
  - Location: `.claude/commands/implement-stripe-standard.md`

- **implement-ecommerce.md** - E-commerce stack implementation command (Phase 2 standardization)
  - Full e-commerce implementation using multiple skills
  - Product catalog, shopping cart, checkout flow, order management
  - Integrates product-catalog-standard, shopping-cart-standard, checkout-flow-standard, order-management-standard skills
  - Location: `.claude/commands/implement-ecommerce.md`

- **implement-notifications.md** - Notification system implementation command (Phase 2 standardization)
  - Multi-channel notification system (email and SMS)
  - Uses `email-notifications-standard` and `sms-notifications-standard` skills
  - Template management and delivery tracking
  - Location: `.claude/commands/implement-notifications.md`

- **implement-realtime.md** - Real-time updates implementation command (Phase 2 standardization)
  - Real-time updates using WebSockets or Server-Sent Events
  - Uses `realtime-updates-standard` skill
  - Order status updates, inventory changes, notifications
  - Location: `.claude/commands/implement-realtime.md`

- **implement-admin-panel.md** - Admin panel implementation command (Phase 1 standardization)
  - Implements production-ready admin panels using `admin-panel-standard` skill
  - RBAC-filtered navigation, dashboard components, protected routes
  - Supports interactive mode, specific pages, or complete implementation
  - Location: `.claude/commands/implement-admin-panel.md`

- **implement-clerk-standard.md** - Clerk authentication implementation command (Phase 1 standardization)
  - Full Clerk auth with custom UI using `clerk-auth-standard` skill
  - Sign-in, sign-up, forgot password, profile management
  - Webhook handling and JWT structure
  - Location: `.claude/commands/implement-clerk-standard.md`

- **convert-design.md** - Design to Next.js conversion command (Phase 1 standardization)
  - Converts Magic Patterns mockups to Next.js App Router components
  - Uses `design-to-nextjs` skill for automated conversion
  - Component generation and routing setup
  - Location: `.claude/commands/convert-design.md`

- **consolidate-worktrees.md** - Git worktree consolidation command
  - Merges multiple worktrees into main branch
  - Handles conflict resolution and branch cleanup
  - Location: `.claude/commands/consolidate-worktrees.md`

- **contribute-to-boilerplate.md** - Contribution workflow command
  - Standardized contribution process for boilerplate updates
  - Pull request guidelines and review process
  - Location: `.claude/commands/contribute-to-boilerplate.md`

- **create-command.md** - Command creation template and guide
  - Template for creating new Claude Code commands
  - Best practices and command structure guidelines
  - Location: `.claude/commands/create-command.md`

- **review-code.md** - Code review automation command
  - Automated code review workflows
  - Quality checks and standards enforcement
  - Location: `.claude/commands/review-code.md`

- **run-migrations.md** - Database migration execution command
  - Multi-environment migration support
  - Migration validation and rollback procedures
  - Location: `.claude/commands/run-migrations.md`

- **sync-boilerplate-commands.md** - Command synchronization utility
  - Syncs commands between .claude and .cursor directories
  - Ensures command consistency across IDE configurations
  - Location: `.claude/commands/sync-boilerplate-commands.md`

### Changed
- **bootstrap-project.md** - Enhanced project bootstrap workflow
  - Expanded project initialization capabilities
  - Improved template selection and customization options
  - Enhanced integration with domain brainstorming and subscription setup
  - Location: `.claude/commands/bootstrap-project.md`

- **project-mvp-status.md** - Enhanced MVP status tracking
  - Improved progress tracking and milestone management
  - Enhanced reporting capabilities
  - Better integration with project management systems
  - Location: `.claude/commands/project-mvp-status.md`

- **project-status.md** - Comprehensive project status reporting
  - Enhanced status tracking and reporting capabilities
  - Improved integration with project management systems
  - Better visualization of project health and progress
  - Location: `.claude/commands/project-status.md`

- **update-boilerplate.md** - Enhanced boilerplate update workflow
  - Improved update detection and application
  - Enhanced conflict resolution and merge strategies
  - Better version tracking and component updates
  - Location: `.claude/commands/update-boilerplate.md`

- **Command Documentation** - Updated command documentation across all commands
  - Improved usage examples and integration patterns
  - Enhanced workflow documentation
  - Better error handling and troubleshooting guides
  - Improved consistency across command documentation

- **Command Organization**: Added 6 new development workflow commands
  - Enhanced developer productivity with specialized commands
  - Improved git workflow automation
  - Better code review and contribution processes

## [1.18.0] - 2025-11-03

### Changed
- **bootstrap-project.md** - MAJOR REFACTOR: Infrastructure-first deployment approach (v2.0.0)
  - **NEW STRATEGY**: Deploy working infrastructure IMMEDIATELY (within 2-3 hours)
  - **Phase 1**: PRD analysis and requirements gathering (simplified)
  - **Phase 2**: Deploy basic apps to AWS Amplify and EC2 FIRST
    - Basic Next.js frontend deployed to Amplify with live URL
    - Basic GraphQL backend deployed to EC2 instance i-0c851042b3e385682
    - Database connected and working authentication
  - **Phase 3**: Setup GitHub Actions CI/CD pipeline
    - Auto-deployment on every push to develop branch
    - Health monitoring workflows
  - **Phase 4-9**: Build features on deployed infrastructure
  - **Benefits**:
    - Client sees working URLs within hours, not days
    - CI/CD established from the start
    - No deployment surprises later
    - Features built on proven infrastructure
  - **Simplified prerequisites** - focuses on essential deployment requirements

### Added
- **git-commit-docs.md** - Renamed from git-commit-docs-command.md
  - Maintains comprehensive 8-step documentation workflow
  - Supports command flags: --no-verify, --no-push, --amend, --force-push

### Removed
- **git-commit-docs-command.md** - Renamed to git-commit-docs.md for consistency

## [1.17.0] - 2025-10-27

### Added
- **bootstrap-project.md** - Revolutionary automated project initialization command (111KB, 3,470 lines)
  - **Phase 0**: Git repository with develop branch strategy
  - **Phase 1**: PRD analysis and Magic Patterns mockup discovery
  - **Phase 2**: Monorepo workspace structure creation
  - **Phase 2.5**: Docker environment and global port management
  - **Phase 3A**: Complete Next.js 16 frontend build-out with ALL mockup components
  - **Phase 3B**: React Native mobile (conditional)
  - **Phase 4**: Complete Express.js/GraphQL backend with all resolvers
  - **Phase 5-6**: Stripe/Quik Dollars, Google Analytics, Twilio integrations
  - **Phase 7.0**: Route 53 DNS and webhook endpoints
  - **Phase 7.1**: Neon PostgreSQL with migrations and seeders
  - **Phase 7.2**: AWS Systems Manager Parameter Store secrets
  - **Phase 7.3**: EC2 backend deployment with nginx/PM2
  - **Phase 7.4**: AWS Amplify frontend deployment
  - **Phase 7.5**: GitHub Actions workflows
  - **Phase 7.6**: Initial feature implementation (WORKING features, not scaffolding!)
  - **Phase 8**: Client confidence package and documentation
  - Orchestrates 26+ specialized agents across all phases
  - Converts Magic Patterns mockup to production-ready application
  - Execution time: 30-60 minutes
  - Delivers same-day working demos to clients

- **generate-session-report.md** - Comprehensive session documentation generator
  - Multi-agent orchestration (Explore, Code Quality Reviewer, Business Analyst Bridge)
  - Executive summary with key metrics
  - Complete accomplishments tracking (features, bugs, blockers)
  - Documentation update requirements identification
  - Code quality assessment with production readiness scoring
  - Integration and configuration documentation
  - Testing summary and lessons learned
  - Deployment checklist and next steps
  - Knowledge transfer documentation
  - Hierarchical report organization in docs/reports/

### Modified
- **bootstrap-project.md** - Enhanced project initialization workflow
  - Improved template selection and customization options
  - Expanded project initialization capabilities
  - Location: `.claude/commands/bootstrap-project.md`
- **docker-ports.md** - Enhanced port management capabilities
  - Improved port allocation and conflict detection
  - Better integration with deployment workflows
  - Location: `.claude/commands/docker-ports.md`
- **project-mvp-status.md** - Improved MVP tracking and reporting
  - Enhanced progress tracking and milestone management
  - Improved reporting capabilities
  - Location: `.claude/commands/project-mvp-status.md`
- **project-status.md** - Enhanced status reporting capabilities
  - Improved status tracking and reporting
  - Better integration with project management systems
  - Location: `.claude/commands/project-status.md`
- **README.md** - Updated command index with bootstrap-project and generate-session-report
- **organize-docs.md** - Enhanced documentation management command

### Impact
- **Revolutionary**: First command to deliver working applications (not scaffolding) from mockups in <1 hour
- **Client Confidence**: Same-day demos with real features (authentication, payments, cart, admin)
- **30-Day Guarantee**: Web MVP delivery in 30 days (vs 3+ months traditional)
- **60-Day Mobile**: TestFlight/App Store release for mobile applications
- **10x Faster**: Competitive advantage through automation
- **Production-Ready**: All code follows frontend/CLAUDE.md and backend/CLAUDE.md standards

### Technical Achievement
- **File Creation**: 500+ files (frontend + backend + infrastructure)
- **Database Tables**: 12+ with sample data from mockup
- **GraphQL Endpoints**: 35+ fully functional
- **Admin Pages**: 20+ working
- **SSL Certificates**: 2 (backend + frontend)
- **Deployment Targets**: AWS Amplify + EC2 with Route 53 DNS

## [1.15.0] - 2025-10-27

### Added
- **bootstrap-project.md** - Automated project initialization command that orchestrates 26+ specialized agents
  - Reads `docs/PRD.md` to extract complete technology stack and requirements
  - Executes 8-phase bootstrap: PRD analysis, workspace setup, frontend, backend, payments, integrations, deployment, documentation
  - Creates production-ready foundation with Next.js 16, Express.js, PostgreSQL, GraphQL, Clerk auth, Stripe payments, GA4 analytics
  - Includes comprehensive validation gates and error handling
  - Execution time: 30-60 minutes
  - Reduces project setup time from weeks to under an hour

### Impact
- **Revolutionary Project Initialization**: First command to fully automate monorepo project bootstrap from PRD specifications
- **Agent Orchestration**: Demonstrates advanced multi-agent coordination across frontend, backend, database, and deployment domains
- **PRD-Driven Development**: Establishes PRD.md as the single source of truth for all infrastructure decisions

## [1.14.0] - 2025-10-17

### Added
- **debug-fix.md** - Comprehensive debugging command coordinating app-troubleshooter, typescript-bug-fixer, and graphql-bug-fixer agents
- **plan-design.md** - Business analysis, requirements, and technical planning command with multi-PM system support (JIRA, Linear, Asana, GitHub Projects)
- **backend-dev.md** - Full-stack backend development command coordinating 6 specialized backend agents
- **frontend-dev.md** - Full-stack frontend development command coordinating 7 specialized frontend agents
- **integrations.md** - Third-party service integration command for auth, payments, shipping, analytics, and communications
- **devops.md** - Development operations command for boilerplate updates, MCP servers, and documentation
- **deploy-ops.md** - Deployment operations command for git workflows, Docker ports, and AWS orchestration
- **test-automation.md** - Comprehensive testing command coordinating unit, integration, E2E, and cross-browser testing

### Changed
- **organize-docs.md** - Enhanced with automatic INDEX.md → README.md renaming functionality
  - Added auto-detection and renaming of INDEX.md files
  - Added backup logic when both INDEX.md and README.md exist
  - Added comprehensive directory coverage (.claude/commands/, .claude/agents/, docs subdirectories)
  - Enhanced documentation with auto-fix examples

### Architecture
- Introduced domain-specific command organization for 70-80% context reduction
- All new commands use multi-agent-orchestrator for intelligent agent coordination
- Commands provide sequential and parallel agent execution patterns
- Smart caching and lazy loading for optimal performance

### Command Count
- Total commands: 50+ (42 existing + 8 new domain-specific orchestrated commands)
- Orchestrated commands: 8 new
- Legacy commands: Maintained for backward compatibility with deprecation path

## [1.13.1] - 2025-10-15

### Changed
- Command metadata and documentation improvements

## [1.13.0] - 2025-10-14

### Added
- Documentation organizer command enhancements
