# commands - Interactive Command Navigator

Find the right command for what you're doing right now. With 145+ commands, this navigator surfaces only what's relevant.

## Usage
```
/commands                     # Interactive — "What are you working on?"
/commands build               # Show building/feature commands
/commands deploy              # Show deployment commands
/commands test                # Show testing commands
/commands plan                # Show planning commands
/commands status              # Show status/progress commands
/commands auset               # Show Auset Platform commands
/commands vibe                # Show vibe coding commands
/commands docs                # Show documentation commands
/commands git                 # Show git/PR commands
/commands infra               # Show infrastructure commands
/commands --all               # Full categorized list (top 50)
```

## Arguments
- No args — Interactive mode, asks what you're working on
- `<category>` — Jump to a specific category
- `--all` — Show all categories with top commands

## Interactive Mode (default)

When invoked with no arguments, present this menu:

```
COMMAND NAVIGATOR — What are you working on?

  [1] Planning & Design      — Start a project, plan features, brainstorm
  [2] Building Features      — Write code, scaffold, implement
  [3] Debugging & Fixing     — Find and fix bugs, restore lost functionality
  [4] Testing & QA           — Run tests, set up test infrastructure
  [5] Deploying              — Push to staging/production, manage infrastructure
  [6] Status & Progress      — Check where things stand, gap analysis
  [7] Documentation          — Generate docs, sync docs, organize
  [8] Git & PRs              — Commit, create PRs, merge, branch management
  [9] Auset Platform         — Activate features, check status, add features
  [10] Vibe Coding           — Natural language development
  [11] Document Generation   — Create PDFs, presentations, spreadsheets
  [12] MCP & Tooling         — Manage MCP servers, boilerplate updates
  [13] JIRA & Tasks          — Task management, JIRA sync, sprint planning
  [14] Conversation & Discovery — Research, brainstorm, talk, teach, explore
  [15] Platform Sync       — Push changes to all Heru projects

Pick a number or describe what you need:
```

Then show the relevant commands for that category.

## Category Definitions

### 1. Planning & Design
```
/plan-design        — Business analysis + technical planning (coordinates 4 agents)
/plan               — Technical implementation plan from requirements
/specify            — Create executable specifications
/spec-workflow      — Full spec-kit workflow (specify -> plan -> tasks)
/add-feature        — Scaffold a new Auset Platform feature
/brainstorm-domains — Generate creative domain name ideas
/create-plan-todo   — Create local planning todos
```

### 2. Building Features
```
/backend-dev        — Full backend development (Express, GraphQL, DB — 6 agents)
/frontend-dev       — Full frontend development (Next.js, UI, state — 7 agents)
/integrations       — Third-party integrations (Stripe, Clerk, Twilio — 6 agents)
/vibe-build         — Build from natural language description
/vibe-scaffold      — Quick CRUD scaffolding
/convert-design     — Convert mockup/screenshot to Next.js component
/implement-ecommerce — Full e-commerce stack
```

### 3. Debugging & Fixing
```
/debug-fix              — Comprehensive debugging (routes by error type — 3 agents)
/vibe-fix               — Fix bugs in natural language
/restore-functionality  — Recover lost/overwritten features
/prevent-overwrites     — Protect code from accidental overwrites
/browser-debug          — Debug UI issues in Chrome
```

### 4. Testing & QA
```
/test-automation        — Full test suite (unit, E2E, cross-browser — 5 agents)
/vibe-test              — Generate tests from natural language
/regression-testing-setup — Set up regression test infrastructure
/implement-testing      — Implement testing infrastructure
/test-manual            — Manual testing checklist
/validate-graphql       — GraphQL schema/operation validation
```

### 5. Deploying
```
/deploy-ops                 — Full deployment workflow (git, Docker, AWS — 3 agents)
/quick-deploy               — Fast deployment shortcut
/setup-ec2-infrastructure   — Set up EC2 servers
/setup-ec2-multi-app-deployment — Multi-app EC2 setup
/amplify-deploy-production  — Deploy frontend to AWS Amplify (prod)
/amplify-deploy-develop     — Deploy frontend to AWS Amplify (dev)
/setup-production-environment — Full production environment setup
/verify-deployment-setup    — Verify deployment configuration
```

### 6. Status & Progress
```
/progress           — Quick platform progress dashboard (2-5 sec)
/gap-analysis       — Deep hybrid analysis with git + code scan (15-90 sec)
/project-mvp-status — Project-level MVP tracking (for client projects)
/project-status     — Post-MVP milestone tracking
/auset-status       — Auset Platform feature activation status
/amplify-deploy-status — AWS Amplify deployment status
```

### 7. Documentation
```
/generate-docs      — Auto-generate documentation from code
/create-feature-docs — Generate feature-specific documentation
/organize-docs      — Clean up and validate documentation structure
/vibe-docs          — Generate docs from natural language
/sync-docs-to-admin — Sync docs to admin panel database
```

### 8. Git & PRs
```
/git-commit-docs    — Stage, document, and commit changes
/create-pr          — Create pull request with proper formatting
/merge-to-develop   — Merge PRs to develop branch
/merge-to-main      — Merge PRs to main branch (production)
/advanced-git       — Enterprise git workflows (rebase, release branches)
/consolidate-worktrees — Clean up git worktrees
```

### 9. Auset Platform
```
/auset-activate     — Activate a dormant feature module
/auset-status       — Show feature activation status across all categories
/add-feature        — Scaffold a new feature (config, service, schema, resolvers, tests)
/progress           — Quick progress against micro plans
/gap-analysis       — Deep analysis against micro plans
```

### 10. Vibe Coding
```
/vibe               — General natural language coding
/vibe-build         — Build features from description
/vibe-fix           — Fix bugs naturally
/vibe-refactor      — Improve existing code
/vibe-test          — Generate tests
/vibe-docs          — Generate documentation
/vibe-scaffold      — Quick scaffolding
```

### 11. Document Generation
```
/create-presentation — PowerPoint (PPTX)
/create-document     — Word (DOCX)
/create-spreadsheet  — Excel (XLSX)
/create-pdf          — PDF documents
/docs-to-office      — Batch convert docs to Office formats
/create-video        — Programmatic video with Remotion
/render-video        — Render video to file
/image               — AI image generation and editing
```

### 12. MCP & Tooling
```
/mcp-init           — Initialize MCP servers
/mcp-status         — Check MCP server health
/mcp-enable         — Enable a specific MCP server
/mcp-disable        — Disable a specific MCP server
/devops             — Development operations maintenance (3 agents)
/update-boilerplate — Check for and apply boilerplate updates
/sync-boilerplate-commands — Sync commands to all Heru projects
```

### 13. JIRA & Tasks
```
/tasks              — Break down and implement tasks
/tasks-orchestrate  — Intelligent task orchestration
/tasks-parallel     — Run tasks in parallel
/tasks-session      — Multi-session task coordination
/tasks-sync         — Sync tasks with project management
/tasks-review       — Quality review for completed tasks
/tasks-cleanup      — Clean up stale tasks
/sync-jira          — Connect and sync with JIRA
/process-todos      — Development workflow with JIRA
/update-todos       — Bidirectional progress sync
```

### 14. Conversation & Discovery

**Talk first. Command second. Build third.** These commands encourage dialogue over directives. A 20-message conversation costs fewer tokens than one code generation.

```
/research           — Deep research before building (tech, API, architecture)
/research --codebase "How does our feature loader work?"
/research --web "Latest Yapit API capabilities"
/brainstorm         — Creative ideation (features, names, strategy)
/brainstorm "What would make Clara different from every other AI?"
/talk               — Reason through decisions (architecture, strategy, rubber duck)
/talk --architecture "Should payments be a microservice?"
/talk --devils-advocate "Challenge my approach"
/teach              — Learn in depth using YOUR codebase as examples
/teach --our-code "Walk me through how features get activated"
/explore            — Discover what's possible (codebase, APIs, ideas)
/explore --codebase "What features are implemented vs scaffolded?"
```

### 15. Platform Sync
```
/sync-herus             — Push Auset platform changes to all 53 Heru projects
/sync-herus --commands  — Only sync commands
/sync-herus --dry-run   — Preview without syncing
/sync-herus --list      — List all discovered Herus
```

## Context-Aware Suggestions

When the user asks "what command should I use?" without invoking `/commands`, use these heuristics:

| Context Signal | Suggested Commands |
|---------------|-------------------|
| Just created a plan | `/tasks`, `/backend-dev` or `/frontend-dev` |
| Working on backend code | `/backend-dev`, `/validate-graphql`, `/debug-fix` |
| Working on frontend code | `/frontend-dev`, `/convert-design`, `/vibe-build` |
| Talking about bugs | `/debug-fix`, `/vibe-fix`, `/restore-functionality` |
| Asking about progress | `/progress`, `/gap-analysis`, `/project-mvp-status` |
| Ready to deploy | `/deploy-ops`, `/quick-deploy`, `/verify-deployment-setup` |
| Need tests | `/test-automation`, `/vibe-test`, `/regression-testing-setup` |
| Working on Auset features | `/auset-activate`, `/auset-status`, `/add-feature` |
| Creating documents | `/create-presentation`, `/create-pdf`, `/create-document` |
| Git operations | `/git-commit-docs`, `/create-pr`, `/merge-to-develop` |
| Exploring or unsure where to start | `/explore`, `/research`, `/commands` |
| Need to think something through | `/talk`, `/brainstorm`, `/research` |
| Want to learn a technology | `/teach`, `/research`, `/explore` |
| Made changes to boilerplate | `/sync-herus`, `/sync-cursor` |

## Related Commands
- `/progress` — Quick platform progress dashboard
- `/gap-analysis` — Deep progress analysis
- `/auset-status` — Auset Platform feature status
