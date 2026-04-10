# [PROJECT_NAME] Monorepo Jira Integration - Claude Code Custom Commands

This directory contains a sophisticated Jira integration system designed for pnpm monorepo workflows that transforms your local development experience with seamless project management coordination across frontend (AWS Amplify) and backend (shared EC2) workspaces.

## 🚨 IMPORTANT: How to Use These Commands

### ✅ These are Claude Code Custom Commands
Run them **inside Claude Code** by typing:
```
sync-jira --connect
process-todos
update-todos
```

Or ask Claude naturally:
```
"Can you run sync-jira --connect?"
"Please process-todos for my assigned tasks"
```

### ❌ NOT Terminal Commands
These will **NOT work** in your terminal:
```bash
$ sync-jira --connect    # ❌ Will fail
$ process-todos          # ❌ Command not found
```

## 📋 Available Commands

### 🎯 Project Initialization Commands

#### bootstrap-project
**Purpose**: Automated project bootstrap from PRD specifications
**Usage in Claude Code**: `bootstrap-project`
**What it does**:
- Reads `docs/PRD.md` to extract complete technology stack and requirements
- Orchestrates 26+ specialized agents across 8 phases:
  1. **PRD Analysis** - Parse and validate project requirements
  2. **Workspace Setup** - Create monorepo structure (frontend/backend/mobile/shared)
  3. **Frontend Bootstrap** - Next.js 16, React 19, Tailwind, shadcn/ui, Redux Persist, Apollo Client
  4. **Backend Bootstrap** - Express.js, GraphQL, PostgreSQL, Sequelize, Clerk auth, PM2
  5. **Payment Integration** - Stripe subscription management with all pricing tiers
  6. **Additional Services** - Google Analytics 4, Twilio SMS notifications
  7. **Deployment Infrastructure** - AWS Amplify (frontend), EC2 (backend), RDS (database)
  8. **Documentation** - Complete API docs, architecture diagrams, deployment guides
- Creates production-ready foundation with authentication, payments, analytics
- Validates each phase before proceeding to ensure quality
- **Execution time**: 30-60 minutes
- **Prerequisites**: Complete `docs/PRD.md` must exist

**Related Commands**: After bootstrap, run `setup-aws-cli` → `setup-github-deployment` → `verify-deployment-setup`

---

### 🚀 Deployment Commands

**Complete deployment setup workflow for EC2 infrastructure:**

#### setup-dynamic-ip-deployment
**Purpose**: Configure GitHub Actions to handle EC2 instances with dynamic IP addresses
**Usage**: `setup-dynamic-ip-deployment` in Claude Code
**What it does**:
- Stores EC2 instance IDs in AWS Parameter Store
- Configures automatic IP resolution in GitHub Actions
- Handles staging and production environments
- Provides fallback strategy for failed IP lookups
- Optional Elastic IP conversion for static IPs
- Zero cost (no Elastic IP required)

#### setup-aws-cli
**Purpose**: Install and configure AWS CLI for developers who don't have it installed
**Usage**: `setup-aws-cli` in Claude Code
**What it does**:
- Detects operating system and installs AWS CLI
- Guides through AWS credentials configuration
- Tests SSM Parameter Store access for SSH keys
- Verifies AWS region is set correctly

#### setup-github-deployment
**Purpose**: Configure GitHub repository for QuikNation deployment  
**Usage**: `setup-github-deployment` in Claude Code  
**What it does**:
- Validates GitHub repository setup
- Guides through repository secrets configuration
- Sets up repository variables for port management
- Configures GitHub Actions permissions

#### setup-quiknation-deployment
**Purpose**: Initialize QuikNation CLI and complete deployment setup  
**Usage**: `setup-quiknation-deployment` in Claude Code  
**What it does**:
- Initializes QuikNation CLI project with PRD context
- Allocates ports on EC2 instances
- Creates GitHub Actions deployment workflow
- Updates package.json with deployment scripts

#### verify-deployment-setup
**Purpose**: Comprehensive verification of entire deployment setup  
**Usage**: `verify-deployment-setup` in Claude Code  
**What it does**:
- Tests AWS CLI and SSH connectivity
- Validates GitHub repository configuration
- Checks QuikNation CLI functionality
- Generates deployment readiness report

**Complete Workflow**: `setup-aws-cli` → `setup-github-deployment` → `setup-quiknation-deployment` → `verify-deployment-setup`

---

### 🔗 sync-jira
**Purpose**: Connect and synchronize with your [PROJECT_KEY] Jira project
**Usage in Claude Code**:
- `sync-jira --connect` - Initial setup
- `sync-jira --configure-personal` - Personal filtering setup
- `sync-jira --test-connection` - Verify connection
- `sync-jira` - Daily synchronization

### ⚙️ process-todos  
**Purpose**: Work on your assigned tasks with monorepo-aware Jira integration
**Usage in Claude Code**:
- `process-todos` - Process your assigned tasks with workspace context
- `process-todos --workspace=frontend` - Focus on Next.js/Amplify tasks
- `process-todos --workspace=backend` - Focus on Express/EC2 tasks
- `process-todos --epic=[PROJECT_KEY]-100` - Focus on specific epic
- `process-todos --focus-mode` - Minimize interruptions

### 🔄 update-todos
**Purpose**: Sync progress and organize your workspace  
**Usage in Claude Code**:
- `update-todos` - Full synchronization and organization
- `update-todos --refresh-assignments` - Update assignment changes

### 🎭 demo-workflow-live
**Purpose**: Experience the complete workflow through simulation
**Usage in Claude Code**:
- `demo-workflow-live` - Full workflow demonstration
- `demo-workflow-live --role=developer` - Developer-focused demo

### 📖 Documentation Commands
- `create-jira-plan-todo` - Enhanced planning with Jira integration
- `simulate-jira-workflow` - Comprehensive workflow simulation
- `organize-docs` - Maintain organized and consistent documentation
  - `organize-docs --check` - Check documentation status
  - `organize-docs --fix` - Auto-fix common issues
  - `organize-docs --index` - Generate documentation indexes
  - `organize-docs --validate` - Validate structure and links
  - `organize-docs --sync` - Sync documentation with code

### 🔀 Advanced Git Commands
- `advanced-git fork-sync` - Sync fork with upstream repository
- `advanced-git rebase-interactive` - Interactive rebase workflow
- `advanced-git release-branch` - Create and manage release branches
- `advanced-git setup-hooks` - Configure git hooks for quality control
- `advanced-git branch-protection` - Set up branch protection rules
- `advanced-git workflow --strategy=git-flow` - Implement git-flow
- `advanced-git workflow --strategy=trunk` - Trunk-based development

### 🧪 Testing & Quality Assurance

#### test-manual
**Purpose**: Interactive manual testing with Playwright or Chrome DevTools MCP
**Usage in Claude Code**:
- `test-manual http://localhost:3000` - Basic page testing
- `test-manual http://localhost:3000 "Test login flow"` - Test with scenario
- `test-manual http://localhost:3000 --login "email:user@example.com,password:Pass123!"` - Auto-login testing
- `test-manual http://localhost:3000 --screenshots --console-errors` - Full monitoring
- `test-manual http://localhost:3000 --mcp chrome` - Use Chrome DevTools instead

**What it does**:
- Interactive browser testing sessions
- Supports login flow testing
- Form filling and validation
- Screenshot capture at key steps
- Console error monitoring
- Network request inspection
- Error boundary debugging
- Performance profiling

**Common scenarios**:
```bash
# Test authentication
test-manual http://localhost:3000/sign-in --scenario "Login and verify dashboard access"

# Debug white screen issue
test-manual http://localhost:3000 --console-errors --network-logs

# Test admin panel
test-manual http://localhost:3000/admin --login "email:admin@example.com,password:Pass123!" --screenshots

# Performance audit
test-manual http://localhost:3000 --mcp chrome --network-logs
```

## 🚀 Quick Start

1. **Initial Setup** (Run in Claude Code):
   ```
   sync-jira --connect
   ```

2. **Configure Personal Filtering**:
   ```
   sync-jira --configure-personal
   ```

3. **Start Working**:
   ```
   process-todos
   ```

4. **Try the Demo**:
   ```
   demo-workflow-live
   ```

## 🏗️ What This System Does

**For Developers:**
- **Monorepo Awareness**: Workspace-specific task filtering (frontend/backend/mobile)
- **Deployment Context**: AWS Amplify (frontend) and shared EC2 (backend) configurations
- **Personal Filtering**: Shows only your assigned work with workspace context
- **Automatic Jira Synchronization**: Real-time sync across all workspaces
- **Technology Integration**: Next.js 16 + React 19 (frontend), Express + Apollo Server (backend)
- **Enhanced Productivity**: No context switching between workspaces and deployment targets

**For Project Managers:**
- Real-time visibility into development progress
- Automatic status updates
- Team coordination facilitation
- Business-relevant progress reporting

**For Teams:**
- Seamless collaboration through dependency management
- Shared context without meetings overhead
- Automatic knowledge preservation
- Connected development ecosystem

## 📁 Monorepo Structure After Setup

```
# Root Monorepo Structure
├── frontend/                           # Next.js 16 + React 19 (AWS Amplify)
├── backend/                            # Express + Apollo Server (Shared EC2)
├── mobile/                             # React Native (future)
├── docs/
│   └── PRD.md                          # **REQUIRED** Project context
├── todo/
│   ├── jira-config/                    # Integration control center
│   ├── not-started/
│   │   └── [PROJECT_KEY]-100-epic/     # Epic directories with workspace context
│   │       ├── epic-overview.md        # Business + deployment context
│   │       └── [PROJECT_KEY]-101-story/ # Story directories
│   │           ├── story-plan.md       # Technical plan (frontend/backend)
│   │           ├── frontend-tasks/     # Next.js/Amplify tasks
│   │           └── backend-tasks/      # Express/EC2 tasks
│   ├── in-progress/                    # Active work (workspace-aware)
│   └── completed/                      # Finished work
└── todo-summaries/                     # Pattern library with workspace context
    ├── completed/                      # Implementation summaries
    └── relationships.json              # Epic/story/workspace dependencies
```

## 🛠️ Key Features

- **Monorepo Integration**: Workspace-aware task management (frontend/backend/mobile)
- **Deployment Context**: AWS Amplify (frontend) and shared EC2 (backend) awareness
- **Personal Filtering**: See only work assigned to you with workspace context
- **Real-Time Sync**: Changes flow between local files and Jira across all workspaces
- **Technology Stack Integration**: Next.js 16, React 19, Express, Apollo Server context
- **Team Coordination**: Automatic dependency and collaboration management
- **Smart Organization**: Epic/Story/Task hierarchy with workspace-specific workflows
- **Port Management**: Dynamic port assignment for shared EC2 deployment
- **Comprehensive Summaries**: Automatic documentation with deployment context

## 🎯 Benefits

- **Productivity**: Stay focused on your assigned work
- **Coordination**: Automatic team collaboration
- **Visibility**: Real-time project status for stakeholders  
- **Knowledge**: Preserved decisions and institutional learning
- **Alignment**: Technical work connected to business objectives

## 📚 Documentation

- **[QUICK-START.md](QUICK-START.md)** - Essential getting started guide
- **[User Guide Artifact]** - Comprehensive developer documentation
- **[jira-integration-guide.md](jira-integration-guide.md)** - Complete implementation guide

## 🔧 Troubleshooting

**Commands not working?**
- Make sure you're running them in Claude Code, not terminal
- Check the QUICK-START.md for proper syntax

**Need help?**
Ask Claude: "How do I use the Jira integration commands?"

## 🚀 Ready to Transform Your Workflow?

Start with: `sync-jira --connect` in Claude Code and experience the future of integrated development!