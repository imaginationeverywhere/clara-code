# Claude Code Command System

This directory contains the sophisticated command system and specialized agent architecture for the Quik Nation AI Boilerplate.

**Related Documentation:**
- **[../CLAUDE.md](CLAUDE.md)** - Root project navigation
- **[agents/README.md](.claude/agents/README.md)** - Complete agent system documentation

## Directory Structure

```
.claude/
├── agents/                    # 22 specialized sub-agents
├── commands/                  # 20+ custom Claude Code commands
├── mcp/                       # MCP server management system
│   ├── servers/               # Installed MCP server instances
│   ├── config/                # Server registry and configuration
│   ├── logs/                  # Health monitoring logs
│   └── scripts/               # Auto-installation automation
├── session-detector.js        # Automatic session startup
├── session-hooks.json         # Session configuration
├── telemetry-reporter.js      # Anonymous usage analytics
├── port-management.sh         # Intelligent port allocation
├── PORT_MANAGEMENT.md         # Port system documentation
└── TEMPLATE_VARIABLES.md      # Template customization guide
```

## Sub-Agents System (23 Specialized Agents)

The `.claude/agents/` directory contains technology-specific agents that enforce best practices and provide coordinated development support.

### Agent Categories

**Project Management & Planning**
- **plan-mode** - Comprehensive project planning and roadmap generation
- **jira-integration** - Epic/Story/Task management with Agile workflows
- **testing-automation** - Three-tier testing strategy and comprehensive test coverage

**Frontend Stack**
- **nextjs** - App Router best practices and performance optimization
- **redux-persist** - State management with SSR hydration
- **typescript-frontend** - Type-safe frontend development patterns
- **graphql-apollo-frontend** - Client-side GraphQL with caching strategies
- **tailwind-css** - Design system consistency and responsive patterns
- **shadcn-ui** - Component library and accessibility standards

**Backend Stack**
- **express** - Server architecture and middleware patterns
- **nodejs** - Runtime optimization and process management
- **typescript-backend** - Type-safe API development
- **graphql-backend** - Apollo Server and schema design
- **sequelize** - ORM best practices with PostgreSQL
- **postgresql** - Database optimization and performance tuning

**Integration Services**
- **stripe** - Payment processing and SCA compliance
- **clerk** - Authentication and RBAC implementation
- **twilio** - SMS/Voice communication features
- **aws** - Cloud service integration and deployment
- **cloudflare-ai-gateway** - Multi-model AI routing with Workers AI, Groq, OpenRouter
- **google-analytics** - GA4 tracking and e-commerce analytics
- **shippo** - Shipping and fulfillment integration

**Testing & Quality**
- **testing-automation** - Comprehensive testing strategy
- **playwright-executor** - Automated end-to-end test execution

**Code Quality & Validation**
- **graphql-validator** - GraphQL schema/operation validation (like tsc --noEmit)
- **document-generator** - Microsoft Office document generation orchestrator

**Creative Production**
- **image-processor** - AI image generation with Nano Banana Pro (`gemini-3-pro-image-preview`) + Pillow
- **remotion-video-generator** - Programmatic video creation with React/Remotion

**System Management**
- **admin-panel** - Dashboard and user management interfaces
- **boilerplate-update-manager** - Automatic session startup, update detection

For complete agent documentation, see **[agents/README.md](.claude/agents/README.md)**

## 🚀 Domain-Specific Agent Orchestration Commands (v1.7.0)

**Context Optimization**: These commands use multi-agent-orchestrator to coordinate specialized agents, providing **70-80% reduction in context usage**.

### Development Commands

#### /debug-fix
Comprehensive debugging and bug resolution
- **Coordinates:** app-troubleshooter, typescript-bug-fixer, graphql-bug-fixer
- **Usage:** `/debug-fix "User authentication stopped working after deployment"`
- **Features:** Intelligent agent routing based on error type

#### /plan-design
Business analysis, requirements, and technical planning
- **Coordinates:** business-analyst-bridge, project-management-bridge, plan-mode-orchestrator, product-design-specialist
- **Usage:** `/plan-design "Build customer portal with self-service features"`
- **Supports:** JIRA, Linear, Asana, GitHub Projects
- **Workflow:** Business requirements → technical architecture

#### /backend-dev
Full-stack backend development
- **Coordinates:** express, graphql-backend, nodejs, typescript-backend, sequelize, postgresql
- **Usage:** `/backend-dev "Implement order management GraphQL API"`
- **Features:** Automatic coordination across all backend layers

#### /frontend-dev
Full-stack frontend development
- **Coordinates:** nextjs, shadcn-ui, i18n, mockup-converter, graphql-frontend, typescript-frontend, redux-persist
- **Usage:** `/frontend-dev "Implement product listing page with search"`
- **Features:** Mockup-to-code conversion, internationalization, state management

#### /integrations
Third-party service integration
- **Coordinates:** shippo, clerk, stripe, google-analytics, slack, twilio
- **Usage:** `/integrations "Set up complete e-commerce integrations"`
- **Stack:** Auth, payments, shipping, analytics, notifications

#### /devops
Development operations and tooling
- **Coordinates:** boilerplate-update, claude-context, mcp-server
- **Usage:** `/devops "Perform complete development environment maintenance"`
- **Features:** MCP server management, boilerplate updates, documentation

#### /deploy-ops
Deployment and operations
- **Coordinates:** git-commit-docs, docker-port, aws-orchestrator
- **Usage:** `/deploy-ops "Deploy complete application to production"`
- **Features:** Git workflows, port management, AWS deployment orchestration

### Heru CI/CD templates (boilerplate)

- **Reusable workflows:** [`.github/workflow-templates/test-and-lint.yml`](../.github/workflow-templates/test-and-lint.yml) and [`.github/workflow-templates/deploy-backend-ec2.yml`](../.github/workflow-templates/deploy-backend-ec2.yml) — pnpm + GitHub Packages, Trivy **table** output (not SARIF), OIDC EC2 deploy (npm build on runner).
- **Installer:** [`scripts/setup-heru-cicd.sh`](../scripts/setup-heru-cicd.sh) — `setup-heru-cicd.sh <repo-path> <port> <pm2-name> <ssm-tail> <remote-dir> [tar-name]`
- **Copy packs for FMO / QCR / TrackIt:** [`heru-cicd/`](../heru-cicd/README.md)
- **GitHub OIDC roles (remaining Herus):** [`scripts/aws/create-remaining-github-oidc-roles.sh`](../scripts/aws/create-remaining-github-oidc-roles.sh) (run with AWS admin credentials)
- **ECS Fargate migration plan:** [`infrastructure/ecs-fargate-platform/README.md`](../infrastructure/ecs-fargate-platform/README.md)

#### /test-automation
Comprehensive testing and QA
- **Coordinates:** playwright-executor, testing-automation, chrome-mcp, playwright-mcp, browserstack-mcp
- **Usage:** `/test-automation "Run comprehensive test suite for authentication"`
- **Coverage:** Unit, integration, E2E, cross-browser, real device testing

### Key Benefits
- **Context Efficiency:** Only load agents when needed (70-80% reduction)
- **Coordinated Workflows:** Multi-agent coordination for complex tasks
- **Intelligent Routing:** Automatic agent selection based on task requirements
- **Consistent Patterns:** Unified command structure across all domains

## 🎸 Vibe Coding Toolkit (v1.0.0)

**Natural Language Development** - Describe what you want in plain English, and Claude builds it.

### Quick Start

```bash
# Build a feature
/vibe-build "Add a wishlist where users can save products"

# Fix a bug
/vibe-fix "The search shows deleted products"

# Improve code
/vibe-refactor "The checkout flow is too slow"

# Generate tests
/vibe-test "Test the payment processing"

# General vibe coding
/vibe "Add dark mode support"
```

### Vibe Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `/vibe` | General natural language coding | `/vibe "Add a loading spinner"` |
| `/vibe-build` | Build complete features | `/vibe-build "Shopping cart with quantities"` |
| `/vibe-fix` | Fix bugs naturally | `/vibe-fix "Login fails on Safari"` |
| `/vibe-refactor` | Improve existing code | `/vibe-refactor "Clean up the auth logic"` |
| `/vibe-test` | Generate test suites | `/vibe-test "Test the checkout flow"` |
| `/vibe-docs` | Generate documentation | `/vibe-docs "Document the API"` |
| `/vibe-scaffold` | Quick scaffolding | `/vibe-scaffold "CRUD for categories"` |

### How It Works

1. **Describe** - Tell Claude what you want in plain English
2. **Review** - Claude analyzes your codebase and shows a plan
3. **Implement** - Claude generates code following your patterns
4. **Verify** - Tests run, types check, you review

### Best Practices

```bash
# Good - describes the user experience
/vibe-build "Checkout where users enter shipping, choose delivery speed, and pay"

# Less good - too vague
/vibe-build "Checkout"

# Good - specific about the problem
/vibe-fix "Prices show 10.000 instead of 10.00"

# Less good - too vague
/vibe-fix "Prices are wrong"
```

**Full Documentation:** See `docs/VIBE_CODING_TOOLKIT.md`

## Essential Commands

### Core Workflow Commands
- **`sync-jira --connect`** - Initial JIRA integration setup with monorepo awareness
- **`sync-jira --configure-personal`** - Personal filtering and assignment detection
- **`process-todos`** - Development workflow with JIRA integration and workspace filtering
  - `process-todos --workspace=frontend` - Focus on Next.js/AWS Amplify tasks
  - `process-todos --workspace=backend` - Focus on Express.js/shared EC2 tasks
  - `process-todos --workspace=mobile` - Focus on React Native tasks
  - `process-todos --prp-mode` - Activates PRP Framework validation
- **`update-todos`** - Bidirectional sync, progress tracking, summary generation
- **`demo-workflow-live`** - Interactive workflow demonstration

### MCP Server Management Commands (v1.6.0)

#### mcp-init
Initialize enterprise + community + specialized MCP servers
- `mcp-init --client claude` - Auto-install CRITICAL enterprise servers (Clerk/Twilio/SendGrid)
- `mcp-init --enterprise` - Install production-ready enterprise stack
- `mcp-init --minimal` - Install only essential development servers

**Enterprise Servers (CRITICAL):**
- **clerk-auth** - User authentication, RBAC, OAuth, session management
- **twilio-communications** - SMS, Voice, Video, WhatsApp messaging
- **sendgrid-email** - Transactional emails, campaigns, analytics

**Specialized Servers:**
- **castplan-project** - AI-powered project management and living documentation
- **claude-historian** - Development history tracking and conversation search
- **ultrathink-knowledge-graph** - Advanced knowledge graph with entity extraction

**Community Servers:**
- shadcn/ui, Playwright, GitHub Official, AWS Cloud Control

#### mcp-status
Enterprise + community server status
- `mcp-status --enterprise-config` - Show critical enterprise server configuration
- `mcp-status --health-check` - Health checks for all servers

#### mcp-enable [server]
Enable enterprise and community servers
- `mcp-enable --category enterprise-auth` - Enable Clerk authentication with RBAC
- `mcp-enable --category enterprise-communications` - Enable Twilio SMS/Voice/Video
- `mcp-enable --category enterprise-email` - Enable SendGrid emails
- `mcp-enable --category specialized-knowledge` - Enable UltraThink Knowledge Graph

#### mcp-disable [server]
Safely disable servers with configuration preservation
- `mcp-disable --temporary [duration]` - Temporary disable with auto re-enable

### Spec-Kit Integration Commands

- **`specify [requirement]`** - Create executable specifications from requirements
- **`plan [technical_approach]`** - Generate detailed technical implementation plans
- **`tasks`** - Break down plans into actionable development tasks
- **`spec-workflow [requirement]`** - Complete end-to-end specification-driven workflow
  - `spec-workflow --interactive` - Guided specification creation
  - `spec-workflow --from-epic [epic_name]` - Enhance existing epics
  - `spec-workflow --explore` - Creative exploration with multiple approaches

### Project Lifecycle Commands (v3.0.0)

Complete project lifecycle management from inception through ongoing iteration.

**See:** [docs/PROJECT_LIFECYCLE.md](docs/PROJECT_LIFECYCLE.md) for complete documentation.

#### Stage 1: Inception
- **`bootstrap-project`** - Automated project bootstrap from PRD
  - Orchestrates 26+ specialized agents to bootstrap complete infrastructure
  - Reads `docs/PRD.md` to extract technology stack and requirements
  - Analyzes Magic Patterns UI exports to determine required agents/skills
  - Generates `docs/CLIENT_PROPOSAL.md` with timeline and milestones
  - Executes 10-phase setup: validation, proposal, git, infrastructure, CI/CD, features, payments, testing, launch, documentation
  - **Execution time**: 30-60 minutes depending on complexity
  - **Prerequisites**: Complete `docs/PRD.md` must exist

#### Stage 2: MVP Development (Days 1-30/60)
- **`project-mvp-status`** - Track progress during MVP development
  - `project-mvp-status --quick` - Quick dashboard view
  - `project-mvp-status --full` - Complete status report
  - `project-mvp-status --blockers` - Focus on blockers and risks
  - `project-mvp-status --timeline` - Timeline health analysis
  - `project-mvp-status --demo` - Demo readiness assessment
  - `project-mvp-status --client-report` - Client-facing progress report
  - **Features:** Phase tracking, feature matrix, blocker/risk register, timeline health, demo readiness

#### Stage 3: Post-MVP (Day 31+)
- **`project-status`** - Track post-MVP milestones and ongoing iteration
  - `project-status --quick` - Quick dashboard view
  - `project-status --roadmap` - Phase 2+ feature roadmap
  - `project-status --debt` - Technical debt register
  - `project-status --metrics` - Performance and business metrics
  - `project-status --health` - System health assessment
  - `project-status --client-report` - Quarterly client report
  - **Features:** MVP certification, roadmap, tech debt tracking, performance metrics, client feedback

### Planning and Creation Commands

- **`create-jira-plan-todo --new-epic`** - Create new epics with JIRA integration
- **`create-plan-todo`** - Local-only planning and todo generation
- **`simulate-jira-workflow`** - Test workflows without affecting JIRA

### Administrative Commands

- **`project-curl-commands`** - JIRA API templates and configuration
- **`process-jira-todos`** - Advanced JIRA-integrated development sessions
- **`update-jira-todos`** - Enhanced bidirectional synchronization
- **`organize-docs`** - Maintain organized documentation
  - `organize-docs --check` - Check documentation status
  - `organize-docs --fix` - Auto-fix common issues
  - `organize-docs --index` - Generate documentation indexes
  - `organize-docs --validate` - Validate documentation structure
  - `organize-docs --sync` - Sync documentation with code structure
- **`advanced-git`** - Enterprise git workflow management
  - `advanced-git fork-sync` - Sync fork with upstream
  - `advanced-git rebase-interactive` - Interactive rebase workflow
  - `advanced-git release-branch` - Create and manage release branches
  - `advanced-git setup-hooks` - Configure git hooks for quality control
  - `advanced-git workflow --strategy=git-flow` - Implement git-flow workflow
  - `advanced-git workflow --strategy=trunk` - Trunk-based development

### Document Generation Commands (v1.8.0)

**Microsoft Office Suite generation with bidirectional markdown conversion:**

- **`create-presentation [topic]`** - Generate PowerPoint presentations
  - `create-presentation "Q4 Business Review"` - Create from topic
  - `create-presentation --from-doc docs/PROPOSAL.md` - Convert markdown to PPTX
  - `create-presentation --style corporate` - Use corporate styling
  - Supports: JSON/YAML style configs, image embedding, templates

- **`create-document [topic]`** - Generate Word documents
  - `create-document "Technical Specification"` - Create from topic
  - `create-document --from-doc docs/README.md --to-word` - Convert MD to DOCX
  - `create-document --from-word report.docx --to-md` - Convert DOCX to MD
  - Supports: Tracked changes, comments, headers/footers, images

- **`create-spreadsheet [topic]`** - Generate Excel spreadsheets
  - `create-spreadsheet "Budget Analysis"` - Create from topic
  - `create-spreadsheet --from-doc data.md` - Convert markdown tables to XLSX
  - `create-spreadsheet --template financial` - Use financial template
  - Supports: Formulas, charts, multiple sheets, data validation

- **`create-pdf [topic]`** - Generate PDF documents
  - `create-pdf "Project Report"` - Create from topic
  - `create-pdf --from-doc docs/PROPOSAL.md` - Convert markdown to PDF
  - `create-pdf --style modern-tech` - Use styling configuration
  - Supports: Headers, footers, watermarks, page numbers

- **`docs-to-office`** - Batch convert documentation
  - `docs-to-office --source docs/ --format pptx` - Convert all to PowerPoint
  - `docs-to-office --format all` - Generate all formats
  - `docs-to-office --watch` - Watch mode for live conversion

### Video Generation Commands (v1.9.0)

**Programmatic video creation with Remotion:**

- **`/remotion-setup`** - Initialize Remotion video project
  - `/remotion-setup` - Interactive setup wizard
  - `/remotion-setup --workspace=remotion` - Add to monorepo
  - `/remotion-setup --template=marketing` - Use starter template
  - Supports: TailwindCSS, TypeScript, MCP server integration

- **`/create-video [description]`** - Create videos from natural language
  - `/create-video "30-second product launch video"` - Create from prompt
  - `/create-video "TikTok announcing summer sale" --format=tiktok` - Social media
  - `/create-video --script=scripts/video.md` - From script file
  - Supports: Marketing, social media, product demos, data visualizations

- **`/render-video [composition]`** - Render video to file
  - `/render-video ProductDemo` - Render to MP4
  - `/render-video Promo --format=tiktok` - Render for TikTok (1080x1920)
  - `/render-video --batch=youtube,tiktok,reels` - Multi-format export
  - Formats: h264, h265, vp9, prores, gif

**Use Cases:**
- Marketing/promotional videos
- Social media content (TikTok, Reels, Shorts)
- Product demos and tutorials
- Data visualizations and animated charts
- Lyric videos and creative productions

### Image Generation Commands (v2.0.0)

**AI-powered image generation with Nano Banana Pro (`gemini-3-pro-image-preview` model):**

- **`/image <action>`** - Comprehensive image toolkit
  - `/image logo "Modern sports logo with soccer ball"` - Generate logos
  - `/image generate "Stadium at sunset"` - Create images from text
  - `/image remove-bg ./photo.jpg --tool paid` - AI background removal
  - `/image remove-bg ./logo.png --tool free` - Free background removal (solid colors)
  - `/image resize ./image.png --size 128x128` - Resize images (FREE)
  - `/image edit ./photo.jpg "Remove person in background"` - AI editing
  - `/image style ./photo.jpg "oil painting style"` - Style transfer

**Tool Options:**
| Tool | Cost | Best For |
|------|------|----------|
| Free (Pillow) | $0.00 | Solid backgrounds, resize, convert |
| Paid (Nano Banana Pro) | ~$0.05-0.15/image | AI generation, complex editing, logos |

**Setup (One-Time):**
```bash
# Get GEMINI_API_KEY from AWS SSM Parameter Store
echo "GEMINI_API_KEY=$(aws ssm get-parameter --name '/quik-nation/shared/GEMINI_API_KEY' --with-decryption --query 'Parameter.Value' --output text)" > .claude/skills/ccskill-nanobanana/.env
```

**AWS SSM Parameter:** `/quik-nation/shared/GEMINI_API_KEY` (SecureString, us-east-1)

### Cloudflare AI Gateway Commands (v1.10.0)

**Multi-model AI routing with automatic fallback for all Quik Nation projects:**

- **`/setup-ai-gateway`** - Initialize Cloudflare AI Gateway
  - `/setup-ai-gateway` - Full setup with all features
  - `/setup-ai-gateway --minimal` - Basic chat only
  - `/setup-ai-gateway --chat-only` - Only chat features
  - `/setup-ai-gateway --dry-run` - Preview what would be created
  - Creates: Worker code, middleware, providers, usage tracking

- **`/cloudflare:build-agent`** - Scaffold AI agents using Agents SDK
- **`/cloudflare:build-mcp`** - Generate MCP server projects

**AI Models (Priority Order):**

| Priority | Provider | Model | Cost | Use Case |
|----------|----------|-------|------|----------|
| 1 | Workers AI | Llama 3.1 8B | ~$0.0001/conv | Primary chat |
| 2 | Groq | Llama 4 Scout | ~$0.0001/conv | Fast fallback |
| 3 | OpenRouter | Gemini Flash | $0.00 | Free backup |

**Pricing Strategy:**

| Feature | User Cost | Your Margin |
|---------|-----------|-------------|
| Chat | FREE (included) | 95-99% |
| Image | $0.25 | 5-12x |
| Logo | $0.75 | 5-15x |
| Video | $2.00 | 4-20x |

**Setup:**
```bash
# One-time setup
npx wrangler login
cd infrastructure/cloudflare/worker
npm install
npx wrangler kv:namespace create "USAGE"
npx wrangler deploy
```

**Documentation:** See [docs/AI_INTEGRATION.md](../docs/AI_INTEGRATION.md) for complete guide.

### GraphQL Validation Commands (v1.8.0)

**TypeScript-like validation for GraphQL (like `npx tsc --noEmit`):**

- **`validate-graphql`** - Run GraphQL schema and operation validation
  - `validate-graphql` - Full validation (schema + operations + resolvers)
  - `validate-graphql --schema` - Schema-only validation
  - `validate-graphql --ops` - Operations-only validation
  - `validate-graphql --watch` - Watch mode for continuous validation

**What it validates:**
- Schema syntax and type definitions
- Operation queries/mutations against schema
- Resolver auth patterns (`context.auth?.userId`)
- DataLoader usage for N+1 prevention
- Naming conventions (PascalCase, camelCase)
- Deprecation tracking

**Exit codes:** 0=pass, 1=errors, 2=config issues

### Boilerplate Maintenance Commands

- **`session-startup-handler`** - **AUTOMATIC**: Session startup checks (runs automatically)
- **`update-boilerplate`** - Intelligent update system for projects
  - `update-boilerplate --check` - Check for available updates
  - `update-boilerplate --commands-only` - Update only commands (safe)
  - `update-boilerplate --docs-only` - Update only documentation
  - `update-boilerplate --infrastructure` - Update infrastructure files
  - `update-boilerplate --all-projects` - Scan and update all projects
- **`init-manifest`** - Initialize .boilerplate-manifest.json for update tracking
- **`init-session-hooks`** - Initialize automatic session startup and telemetry

### Code Quality & Protection Commands

- **`restore-functionality [description]`** - Intelligent functionality recovery
  - `restore-functionality "shopping cart checkout"` - Interactive investigation
  - `restore-functionality --mode=analysis-only` - Analyze without changes
  - `restore-functionality --strategy=selective` - Restore only lost functions
  - **Features:** CHANGELOG.md integration, accidental vs intentional detection
  - **Strategies:** selective, full-revert, cherry-pick, reconstruction

- **`prevent-overwrites [options]`** - Proactive functionality protection
  - `prevent-overwrites --init` - Initialize protection system
  - `prevent-overwrites --watch` - Real-time monitoring during development
  - `prevent-overwrites --validate` - Pre-commit validation (auto via git hooks)
  - `prevent-overwrites --analyze` - Analyze changes for potential overwrites
  - `prevent-overwrites --report` - Generate protection coverage reports
  - **Features:** Four protection layers, critical function registry, test coverage enforcement

## Port Management System

**Location:** `.claude/port-management.sh`

Intelligent port allocation and conflict resolution for shared EC2 deployments.

**Commands:**
- `port-management.sh scan` - Live port usage analysis
- `port-management.sh show` - Current port registry display
- `port-management.sh allocate` - Automatic port allocation for new projects

**Features:**
- Centralized JSON registry with conflict detection
- Automatic allocation and prevention of conflicts
- Integration with deployment commands

**See:** [PORT_MANAGEMENT.md](.claude/PORT_MANAGEMENT.md) for complete documentation

## Automatic Session Update Checking

The boilerplate includes automatic update checking that runs when Claude Code sessions start.

### How It Works
1. **SessionStart Hook:** `.claude/hooks/session-start.js` executes automatically
2. **Project Detection:** Verifies this is a boilerplate project
3. **Agent Invocation:** boilerplate-update-manager agent is triggered
4. **Update Check:** Checks for available updates from GitHub
5. **User Notification:** Shows update status or "✅ up to date" message

### Enabling Automatic Checks

**Method 1: Global Hooks (Recommended)**
1. See `.claude/hooks/SETUP.md` for detailed setup
2. Copy hook to Claude Code config directory (~/.config/claude/hooks/)
3. Enable hooks in Claude Code settings.json
4. Restart Claude Code
5. Updates check automatically on every session start

**Method 2: Proactive Agent (No Setup Required)**
- Claude Code detects `.boilerplate-manifest.json`
- Automatically invokes update check
- Shows update status message

**If automatic detection doesn't trigger:**
- Say "Check for boilerplate updates" on your first message

See `.claude/hooks/NO-HOOKS-FALLBACK.md` for troubleshooting.

### Disabling Automatic Checks
```bash
# Disable session hooks
init-session-hooks --disable-all

# Or manually check for updates when desired
update-boilerplate --check
```

### Privacy
- Update checks only compare version numbers
- Telemetry is anonymized and helps improve the boilerplate
- No project content or personal data is ever transmitted
- You can disable telemetry while keeping update checks

## Configuration Requirements

### JIRA Configuration Templates
- **`todo/jira-config/project-config-template.json`** - Project settings template
- **`todo/jira-config/personal-config-template.json`** - Personal preferences template
- **`todo/jira-config/setup-instructions.md`** - Step-by-step configuration guide

### Required Placeholders to Replace
When copying to your project:
- `[PROJECT_KEY]` → Your JIRA project key (e.g., "PROJ", "DEV")
- `[JIRA_DOMAIN]` → Your JIRA instance domain (e.g., "company.atlassian.net")
- `[YOUR_EMAIL]` → Your JIRA account email
- `[API_TOKEN]` → Your JIRA API token
- `[BASE64_ENCODED_CREDENTIALS]` → Base64 encoded "email:token"
- `[YOUR_JIRA_ACCOUNT_ID]` → Your JIRA account ID

### Security Configuration
```bash
echo "todo/jira-config/project-config.json" >> .gitignore
echo "todo/jira-config/personal-config.json" >> .gitignore
echo ".jira-token" >> .gitignore
echo ".claude/.session-count" >> .gitignore
echo ".claude/.session-errors.log" >> .gitignore
echo ".claude/.telemetry-cache.json" >> .gitignore
```

## Understanding the System

### File Organization Pattern
Each epic/story follows this structure:
```
todo/not-started/
└── [jira-project-code-1]-platform-foundation/     # Epic directory
    ├── epic-overview.md                             # Business context
    ├── [jira-project-code-{number}]-user-auth/     # Story directory
    │   ├── story-plan.md                           # Technical plan
    │   ├── [jira-project-code-{number}]-login-impl.md
    │   └── [jira-project-code-{number}]-signup-impl.md
    └── [jira-project-code-{number}]-user-profile/
        ├── story-plan.md
        └── [jira-project-code-{number}]-profile-crud.md
```

### Status Mapping
- **`todo/not-started/`** ↔ JIRA "To Do", "Backlog"
- **`todo/in-progress/`** ↔ JIRA "In Progress", "In Review"
- **`todo/completed/`** ↔ JIRA "Done", "Closed", "Resolved"

### Key System Features
- **Personal Filtering:** Only shows work assigned to you
- **Conflict Resolution:** Local files win for implementation details, JIRA wins for status/assignment
- **Bidirectional Sync:** Changes flow both ways
- **Team Coordination:** Automatic dependency tracking

## Command Execution

- **All commands run in Claude Code**, not terminal
- Commands are **NOT** bash/shell commands
- Ask Claude to run commands: "Can you run sync-jira --connect?"
- Or run directly in Claude Code: `sync-jira --connect`

## Quick Start

### For New Monorepo Projects
```bash
# 1. Copy complete monorepo boilerplate to your project
cp -r /path/to/quik-nation-ai-boilerplate/.claude /your/project/

# 2. Customize template variables
# See TEMPLATE_VARIABLES.md for complete instructions

# 3. Initialize enterprise MCP servers and session hooks
mcp-init --client claude        # Auto-install CRITICAL enterprise servers
init-session-hooks             # Enable automatic update detection

# 4. In Claude Code, run:
sync-jira --connect
sync-jira --configure-personal
create-jira-plan-todo --new-epic
process-todos
```

## Related Documentation

- **[../CLAUDE.md](CLAUDE.md)** - Root project navigation
- **[../frontend/CLAUDE.md](frontend/CLAUDE.md)** - Frontend development patterns
- **[../backend/CLAUDE.md](backend/CLAUDE.md)** - Backend development patterns
- **[../docs/CLAUDE.md](docs/CLAUDE.md)** - Documentation system
- **[../infrastructure/CLAUDE.md](infrastructure/CLAUDE.md)** - Deployment and infrastructure

## Document Version

- **Version:** 1.0.0 (Modular Architecture)
- **Last Updated:** 2025-10-23
- **Maintained By:** Quik Nation AI Team
- **Review Schedule:** Quarterly
