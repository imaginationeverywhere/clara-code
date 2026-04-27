# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Quik Nation AI Boilerplate (Auset Platform)

Enterprise-grade monorepo boilerplate with Claude Code custom commands, JIRA integration, and intelligent deployment automation. The **Auset Platform** is the backbone — a feature-complete engine that can birth any product (Heru) in days, not months. Terminology follows Kemetic (African) naming; see [.claude/plans/2026-03-06-auset-platform-design.md](.claude/plans/2026-03-06-auset-platform-design.md).

## Agent Self-Identification (NON-NEGOTIABLE)

**Every agent MUST state their name in bold before speaking.** No exceptions. No anonymous output. This applies to ALL multi-agent contexts: `/family`, `/council`, `/tech-team`, `/frontend-team`, `/backend-team`, `/devops-team`, `/security-team`, `/qa-team`, `/creative-team`, `/business-team`, swarm reports, standup, and ANY response where an agent persona is speaking.

**Format:** `> **Granville (Granville T. Woods):** "Your message here."`

**Why:** This platform is demoed to clients and partners. When agents don't identify themselves, it breaks the experience and looks unprofessional. This is Amen Ra's repeated correction — treat it as a strike-worthy offense.

**Enforcement:**
- First line of any agent speech = bold name
- If writing a multi-agent response, EVERY agent block starts with their name
- System/narrator text (non-agent) does not need a name
- When in doubt, say your name

## GitHub Organization Gate (NON-NEGOTIABLE)

**This platform ONLY operates inside approved GitHub organizations.** At session start, verify the git remote:

```bash
ORG=$(git remote get-url origin 2>/dev/null | sed -E 's|.*github\.com[:/]([^/]+)/.*|\1|')
```

**Approved orgs:** `imaginationeverywhere`, `Sliplink-Inc`

If the repo is NOT under one of these orgs, platform commands and agents are DISABLED. The boilerplate can be forked, but the intelligence doesn't follow.

## Developer Identity & Session Tracking

At session start, identify the developer:
```bash
GIT_EMAIL=$(git config user.email)
GH_USER=$(gh api user --jq '.login' 2>/dev/null)
```

### Founders (Full Vault Access)
- **amenray2k / cto@quiknation.com** — Amen Ra (CTO & Co-Founder)
- **quikv** — Rashad "Quik" Campbell (Co-Founder)

### Developers (Tracked, No Vault Access)
All other users get their sessions tracked at `~/auset-brain/developers/<username>/`. They can NOT access `~/auset-brain/` founder directories (Daily, Feedback, Decisions, People). Founders can read ALL developer data.

**Per-developer tracking:**
- `~/auset-brain/developers/<username>/sessions/YYYY-MM-DD.md` — What they worked on
- `~/auset-brain/developers/<username>/memory/` — Their personal memory/preferences
- Track: commands used, files changed, commits, session duration, project

## Auset Platform — Feature Registry

- **Ausar Engine:** `backend/src/features/` — Feature registry, dependency resolution, activation. All capabilities exist as modules; activate via `/auset-activate <feature>`.
- **Maat:** Validation (types, env, config) via `MaatValidator`; invoke before deploy.
- **Ra Intelligence:** AI layer in `backend/src/features/ai/` — model routing (Claude), prompt caching, fraud detection (Sekhmet), chat, recommendations.
- **Product configs:** `backend/src/features/products/` — QuikCarRental, QuikSign; each Heru defines which features are active.
- **Commands:** `/auset-activate <feature>`, `/auset-status`, `/add-feature <name>` — scaffold, activate, and monitor features.
- **Progress & Gap Analysis:** `/progress` (quick dashboard), `/gap-analysis --epic N` (deep hybrid scan with code + git analysis), `/commands` (interactive command navigator)
- **Payment Providers:** Stripe Connect (domestic US) + Yapit/YapEX (global diaspora) — dual-provider architecture.
- **Conversation & Discovery:** Talk to the AI first, command it second. `/research`, `/brainstorm`, `/talk`, `/teach`, `/explore` — dialogue costs fewer tokens than code generation and prevents building the wrong thing.
- **Platform Sync:** `/sync-herus` — push Auset platform changes (commands, plans, agents) to all 53 Heru projects at once.

## Common Development Commands

### Frontend (Next.js 16)
```bash
cd frontend
npm run dev          # Start development server (port 3000)
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript validation
```

### Backend (Express + Apollo Server)
```bash
cd backend
npm run dev                     # Start development server
npm run build                   # TypeScript compilation
npm run type-check              # npx tsc --noEmit
npm run graphql:validate        # GraphQL schema/operation validation
npm run graphql:validate:watch  # Watch mode for GraphQL validation
npm run db:migrate              # Run database migrations
npm run db:seed                 # Seed database
npm run test                    # Run tests
```

### Docker Development
```bash
docker-compose up frontend backend   # Start all services
docker-compose exec backend bash     # Shell into backend container
docker-compose down                  # Stop all containers
```

## 📋 Plan Mode — Auto-Save to Project Directory

**IMPORTANT:** All plans MUST be saved to BOTH `.claude/plans/` AND `.cursor/plans/` in the project root.

```
.claude/plans/           # Claude Code reads from here
├── feature-name-plan.md
├── auth-system-design.md
└── micro/               # Agent-executable micro plans (epics/stories)
.cursor/plans/           # Cursor reads from here (mirror)
├── feature-name-plan.md
├── auth-system-design.md
└── micro/
```

### 🚨 CRITICAL: Automatic Plan Save (NON-NEGOTIABLE)

After EVERY `ExitPlanMode`, you MUST automatically:

1. **Find the plan** — Check `~/.claude/plans/` for the most recently modified `.md` file
2. **Generate a meaningful name** — From the plan's title/content: `<feature>-<type>.md` (types: plan, design, architecture, migration)
3. **Save to BOTH directories:**
   ```bash
   mkdir -p .claude/plans .cursor/plans
   cp ~/.claude/plans/<random-name>.md .claude/plans/<meaningful-name>.md
   cp ~/.claude/plans/<random-name>.md .cursor/plans/<meaningful-name>.md
   ```
4. **Confirm** — Tell the user: "Plan saved to .claude/plans/<name>.md and .cursor/plans/<name>.md"

**This is automatic. Do NOT wait for the user to ask. Do NOT skip this step.**

You can also run `/save-plan [name]` manually at any time.

### 🔄 Plan-to-Tasks Workflow (Parallel Sessions)

Plans should generate task lists that enable **parallel Claude sessions** to work on different tasks simultaneously.

**After creating/moving a plan:**

1. **Create tasks from the plan** - Use `TaskCreate` to add all implementation tasks
2. **Set task list ID** - Tasks are scoped to the project via `CLAUDE_CODE_TASK_LIST_ID` in `.claude/settings.json`
3. **Tag tasks with plan reference** - Include plan filename in task metadata for traceability

**Example task creation from plan:**
```
TaskCreate:
  subject: "Implement user authentication API"
  description: "From plan: user-auth-plan.md - Phase 1, Step 2..."
  metadata: { "plan": "user-auth-plan.md", "phase": 1 }
```

**Parallel session workflow:**
1. **Session A** starts → runs `TaskList` → claims Task 1 → marks `in_progress`
2. **Session B** starts → runs `TaskList` → sees Task 1 claimed → claims Task 2
3. Both sessions work independently on their tasks
4. Each marks their task `completed` when done
5. Sessions check `TaskList` for next available task

**Task dependencies:**
- Use `addBlockedBy` to prevent tasks from starting until prerequisites complete
- Parallel sessions automatically skip blocked tasks

**Settings for parallel work:**
```json
// .claude/settings.json
{
  "env": {
    "CLAUDE_CODE_TASK_LIST_ID": "project-name"
  }
}
```

All sessions in the same project share the task list, enabling coordinated parallel development.

## 🚨 CRITICAL: Automatic Session Startup

**IMMEDIATE ACTION REQUIRED**: When Claude Code starts a session in this directory, you MUST:
1. Check if `.boilerplate-manifest.json` or `.claude/commands/update-boilerplate.md` exists
2. If either exists, IMMEDIATELY invoke the `boilerplate-update-manager` agent
3. Display either "✅ Quik Nation AI Boilerplate is up to date" or an update notification
4. This MUST happen WITHOUT waiting for user input - be PROACTIVE

## Workspace-Specific Documentation

This is a **monorepo project** with specialized documentation for each workspace:

- **[frontend/CLAUDE.md](frontend/CLAUDE.md)** - Next.js 16 + React 19, Redux-Persist, Apollo Client, AWS Amplify deployment
- **[backend/CLAUDE.md](backend/CLAUDE.md)** - Express.js/NestJS, Apollo Server, PostgreSQL, EC2/App Runner deployment
- **[mobile/CLAUDE.md](mobile/CLAUDE.md)** - React Native patterns and mobile development workflows
- **[.claude/CLAUDE.md](.claude/CLAUDE.md)** - Custom commands, agent system, MCP servers, session management
- **[docs/CLAUDE.md](docs/CLAUDE.md)** - Documentation system, PRD requirements, testing strategy templates
- **[infrastructure/CLAUDE.md](infrastructure/CLAUDE.md)** - AWS CDK, deployment automation, infrastructure patterns
- **[specs/CLAUDE.md](specs/CLAUDE.md)** - Spec-Kit integration and specification-driven development

## Quick Navigation

**Working on frontend?** → Read [frontend/CLAUDE.md](frontend/CLAUDE.md)
**Working on backend?** → Read [backend/CLAUDE.md](backend/CLAUDE.md)
**Need to run a command?** → Read [.claude/CLAUDE.md](.claude/CLAUDE.md)
**Setting up deployment?** → Read [infrastructure/CLAUDE.md](infrastructure/CLAUDE.md)
**Need documentation help?** → Read [docs/CLAUDE.md](docs/CLAUDE.md)
**Setting up regression testing?** → Read [docs/REGRESSION_TESTING_WITH_ULTRATHINK.md](docs/REGRESSION_TESTING_WITH_ULTRATHINK.md)

## 🧪 Enterprise Regression Testing with UltraThink

**NEW:** Comprehensive regression testing framework integrated with UltraThink knowledge graph for intelligent test coverage analysis.

### What You Get

✅ **Three-Tier Testing Pyramid**
- **Smoke Tests:** 5-10 minutes, critical paths only, blocks on every commit
- **Regression Suite:** 20-30 minutes, full feature coverage, blocks PR merge
- **Full Suite:** 1 hour, E2E + performance + accessibility, nightly run

✅ **UltraThink Integration**
- Automatic knowledge graph building from tests
- Intelligent impact analysis of code changes
- Risk scoring for regression prevention
- Coverage insights and gap identification

✅ **Automated Workflows**
- GitHub Actions for CI/CD automation
- Smart test selection (only run affected tests)
- Parallel test execution
- Coverage reporting and trends

✅ **Production-Ready Setup**
- One command to initialize: `/regression-testing-setup`
- Pre-built test templates for all project types
- Automatic registry generation
- Business domain-specific configurations

### Quick Start

```bash
# Initialize regression tests in your project
/regression-testing-setup

# Run tests locally
npm run test:smoke      # 5-10 minutes
npm run test:regression # 20-30 minutes

# Generate UltraThink registry
npm run ultrathink:generate-registry

# Get AI-powered insights
npm run ultrathink:get-insights
```

### Project-Specific Specifications

Each project type has tailored regression specifications:

- **[DreamiHairCare](docs/CLIENT_REGRESSION_SPECIFICATIONS.md#dreamihaircare)** - Salon booking, appointment management, payment processing
- **[Pink-Collar-Contractors](docs/CLIENT_REGRESSION_SPECIFICATIONS.md#pink-collar-contractors)** - Job marketplace, contractor verification, payment settlement
- **[QuikAction](docs/CLIENT_REGRESSION_SPECIFICATIONS.md#quikaction)** - Task management, real-time collaboration, notifications
- **[StacksBabiee](docs/CLIENT_REGRESSION_SPECIFICATIONS.md#stacksbabiee)** - E-commerce, checkout flow, inventory sync
- **[QuikCarRental & QuikNation](docs/CLIENT_REGRESSION_SPECIFICATIONS.md#quiknation-projects)** - Multi-tenant platforms

See **[CLIENT_REGRESSION_SPECIFICATIONS.md](docs/CLIENT_REGRESSION_SPECIFICATIONS.md)** for complete details.

### Documentation

- **[REGRESSION_TESTING_WITH_ULTRATHINK.md](docs/REGRESSION_TESTING_WITH_ULTRATHINK.md)** - Complete technical guide with UltraThink integration
- **[TESTING_STRATEGY_TEMPLATE.md](docs/TESTING_STRATEGY_TEMPLATE.md)** - Reusable testing patterns for any project
- **[TESTING_QUICK_START.md](docs/TESTING_QUICK_START.md)** - 30-minute implementation guide
- **[CLIENT_REGRESSION_SPECIFICATIONS.md](docs/CLIENT_REGRESSION_SPECIFICATIONS.md)** - Business domain specifications
- **[.claude/commands/regression-testing-setup.md](.claude/commands/regression-testing-setup.md)** - Custom command documentation

## Project Lifecycle Commands (v3.0.0)

Complete project lifecycle management from inception through ongoing iteration. See [docs/PROJECT_LIFECYCLE.md](docs/PROJECT_LIFECYCLE.md) for full documentation.

#### Stage 1: Inception
- **`bootstrap-project`** - Automated project bootstrap from PRD (30-60 min)

#### Stage 2: MVP Development (Days 1-30/60)
- **`project-mvp-status`** - Track progress during MVP development
  - `project-mvp-status --quick` - Quick dashboard view
  - `project-mvp-status --full` - Complete status report
  - `project-mvp-status --blockers` - Focus on blockers and risks
  - `project-mvp-status --timeline` - Timeline health analysis
  - `project-mvp-status --demo` - Demo readiness assessment
  - `project-mvp-status --client-report` - Client-facing progress report

#### Status & Gap Analysis (All Stages)
- **`progress`** - Quick platform progress dashboard against micro plans
  - `progress` - Full platform summary (all epics)
  - `progress --epic 16` - Single epic progress
  - `progress --feature payments` - Cross-cutting feature search
  - **Speed:** 2-5 seconds
- **`gap-analysis`** - Deep hybrid analysis comparing plans vs code vs git
  - `gap-analysis --epic 16` - Deep scan one epic
  - `gap-analysis --story 16.10` - Single story deep-dive
  - `gap-analysis --all --stakeholder` - Stakeholder-ready report
  - `gap-analysis --epic 16 --save` - Save report to docs/gap-analysis/
  - **Speed:** 15-90 seconds
  - **Features:** Code scanning, git history analysis, acceptance criteria cross-reference, assignment recommendations

#### Command Discovery
- **`commands`** - Interactive command navigator for 145+ commands
  - `commands` - Interactive "what are you working on?" menu
  - `commands build` - Show building commands
  - `commands status` - Show status/progress commands
  - `commands --all` - Full categorized list

See [.claude/COMMAND_CHEAT_SHEET.md](.claude/COMMAND_CHEAT_SHEET.md) for a quick reference of the top 40 commands by workflow phase.

#### Stage 3: Post-MVP (Day 31+)
- **`project-status`** - Track post-MVP milestones and ongoing iteration
  - `project-status --quick` - Quick dashboard view
  - `project-status --roadmap` - Phase 2+ feature roadmap
  - `project-status --debt` - Technical debt register
  - `project-status --metrics` - Performance and business metrics
  - `project-status --health` - System health assessment
  - `project-status --client-report` - Quarterly client report

## System Architecture

```
Monorepo Structure:
├── frontend/          # Next.js 16 + React 19 (AWS Amplify)
├── backend/           # Express.js + Apollo Server (EC2/App Runner)
├── mobile/            # React Native (future)
├── .claude/           # 20+ custom commands + 22 specialized agents
├── docs/              # PRD.md + comprehensive documentation
├── infrastructure/    # AWS CDK infrastructure as code
├── specs/             # GitHub Spec-Kit executable specifications
└── todo/              # JIRA-synchronized local development
```

**Core Design Principles:**
- **PRD-driven development** - All context from docs/PRD.md
- **Monorepo workspace awareness** - Frontend, backend, mobile workspaces
- **Local-first, JIRA-synchronized** - Bidirectional sync
- **Enterprise MCP integration** - Clerk, Twilio (voice/SMS), AWS (SES/SNS), GitHub
- **Intelligent deployment** - AWS Amplify (frontend), App Runner/EC2 (backend)
- **Specialized sub-agents** - 22 technology-specific agents enforce best practices

## 🔐 Shared Environment Variables

**Shared credentials across all Quik Nation projects:**

- **[Twilio Environment Variables](docs/shared-environment-variables/TWILIO_ENVIRONMENT_VARIABLES.md)** - Marketing and Transactional SMS credentials (shared across site962, ultrathink, and other projects)

> ⚠️ **Important**: These credentials are shared. Never commit actual values to git. Use AWS Systems Manager Parameter Store for production secrets.

## 🚨 CRITICAL: PLATFORM_OWNER vs SITE_OWNER Distinction

**IMPORTANT**: This boilerplate supports multi-tenant SaaS architecture with clear separation between PLATFORM_OWNER and SITE_OWNER roles.

### Understanding the Roles

- **PLATFORM_OWNER**: The entity that owns, develops, and maintains the technical infrastructure. Controls master accounts for Stripe, Clerk, AWS, and all third-party services. Bears infrastructure costs and provides platform as a service.

- **SITE_OWNER**: The entity that licenses the platform to run their business. Owns their business data, customers, and revenue. Uses Stripe Connect for payments and operates within platform-provided features.

### Implementation Guidelines

1. **Always maintain tenant isolation** - Use `tenant_id` in all database queries
2. **Respect ownership boundaries** - PLATFORM_OWNER code vs SITE_OWNER data
3. **Use Stripe Connect patterns** - Never mix platform and site payment flows
4. **Implement proper RBAC** - Platform admins vs site admins have different scopes
5. **Follow multi-tenant patterns** - See [docs/technical/PLATFORM_OWNER_VS_SITE_OWNER_ARCHITECTURE.md](docs/technical/PLATFORM_OWNER_VS_SITE_OWNER_ARCHITECTURE.md)

### Code Context

When writing code, always consider:
- Is this platform-level functionality (PLATFORM_OWNER)?
- Is this site-specific business logic (SITE_OWNER)?
- Are we properly isolating tenant data?
- Are payments flowing through the correct Stripe accounts?

### Key Technical Patterns

**Database:** All tables must include `tenant_id` for data isolation
**Authentication:** Clerk provides multi-tenant user management
**Payments:** Stripe Connect for site-specific payment processing
**Infrastructure:** Platform bears all hosting costs
**UI/UX:** Clear separation between platform and site branding

For complete architectural details, see [docs/technical/PLATFORM_OWNER_VS_SITE_OWNER_ARCHITECTURE.md](docs/technical/PLATFORM_OWNER_VS_SITE_OWNER_ARCHITECTURE.md)

## 🚨 CRITICAL: Backend Production Deployment Standard

**MANDATORY:** All backend production deployments to AWS App Runner MUST use **pre-built Docker containers pushed to ECR**.

### The Rule

```bash
# ✅ CORRECT: Build Docker image → Push to ECR → App Runner pulls container
docker build -f Dockerfile.apprunner -t project-backend:latest ./backend
docker push [ACCOUNT_ID].dkr.ecr.[REGION].amazonaws.com/project-backend:latest
# App Runner configured with "Container registry" → "Amazon ECR"

# ❌ INCORRECT: DO NOT use App Runner source-based deployment
# DO NOT configure App Runner with "Source code repository" where it builds the image
```

### Why This Matters

| Docker Container (CORRECT) | Source Build (INCORRECT) |
|---------------------------|--------------------------|
| Full control over build | Limited control |
| Same image tested locally | May differ from local |
| Faster deployments | Slower (builds each time) |
| Can scan before deploy | Post-deployment only |

### Required Reading

**See:** [docs/deployment/APP_RUNNER_DOCKER_DEPLOYMENT.md](docs/deployment/APP_RUNNER_DOCKER_DEPLOYMENT.md) - Complete deployment guide with CI/CD pipeline examples

## 🤖 AI Integration with Cloudflare Workers AI

**NEW:** Built-in AI capabilities for all Quik Nation projects using Cloudflare Workers AI with multi-model routing.

### AI Features

| Feature | User Cost | Description |
|---------|-----------|-------------|
| **AI Chat** | FREE (included) | Conversational AI in all subscription tiers |
| **Image Generation** | $0.25/image | Create images from text prompts |
| **Logo Generation** | $0.75/logo | Professional logo creation |
| **Video Generation** | $2.00/video | Programmatic video creation |

### Quick Start

```bash
# Initialize AI Gateway
/setup-ai-gateway

# Deploy to Cloudflare
cd infrastructure/cloudflare/worker
npm install
npx wrangler deploy
```

### Architecture

- **Primary:** Cloudflare Workers AI (Llama 3.1 8B)
- **Fallback 1:** Groq (Llama 4 Scout - ultra-fast)
- **Fallback 2:** OpenRouter (Gemini 2.0 Flash - free tier)
- **Generations:** Workers AI FLUX, Gemini Pro Image, Remotion

### Documentation

- **[docs/AI_INTEGRATION.md](docs/AI_INTEGRATION.md)** - Complete AI integration guide
- **[infrastructure/cloudflare/README.md](infrastructure/cloudflare/README.md)** - AI Gateway deployment
- **[.claude/agents/cloudflare-ai-gateway.md](.claude/agents/cloudflare-ai-gateway.md)** - Agent documentation

### Cloudflare Skills

The boilerplate includes Cloudflare Skills for building on the Cloudflare platform:

```bash
# Build AI agents
/cloudflare:build-agent

# Build MCP servers
/cloudflare:build-mcp
```

**Skills included:** cloudflare, agents-sdk, durable-objects, wrangler, web-perf, building-mcp-server-on-cloudflare, building-ai-agent-on-cloudflare

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `bash scripts/graphify-rebuild.sh` to keep the graph current. The wrapper silently no-ops if graphify is not installed (e.g. on QCS1 or fresh clones), so this rule is safe to run unconditionally.
