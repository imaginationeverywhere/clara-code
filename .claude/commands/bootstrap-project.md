# Bootstrap Project from PRD + Magic Patterns

**COMMAND AUTHORITY**: This command has PRIMARY orchestration authority over project initialization, from requirements documents to MVP launch.

**VERSION**: 4.3.0 - Auto-Claude Integration + Three-Tier Revenue Model

---

## 🎯 Command Purpose

**THE COMPLETE PROJECT KICKOFF COMMAND** - Take a project from requirements to MVP launch:

1. **ANALYZE**: Read PRD + BRD (optional) + TRD → Understand the project
2. **CONVERT**: Analyze Magic Patterns templates → Identify components & features
3. **MAP**: Determine required agents, skills, and commands
4. **PROPOSE**: Generate client-facing proposal with timeline + **7% platform fee model**
5. **TUNNEL**: Setup shared ngrok tunnel with automatic port discovery
6. **DEPLOY**: Infrastructure-first deployment to AWS
7. **BUILD**: Convert mockups to working features
8. **LAUNCH**: Production deployment in 30-60 days
9. **HANDOFF**: Business docs + technical docs for client delivery

---

## 🚨 CRITICAL: Project Type Selection (Three-Tier Revenue Model)

**FIRST DECISION**: Which tier is this project?

```bash
# TIER 1: High-margin internal products (Quik Carry, Quik Car Rental, Quik Events)
bootstrap-project --type=internal-unicorn

# TIER 2: Quik Nation white-label partners (7% split with partners)
bootstrap-project --type=white-label

# TIER 3: Direct client projects (full 7% to us)
bootstrap-project --type=client
```

---

### TIER 1: Internal Unicorn Products (High Margins)

**Examples:** Quik Carry, Quik Car Rental, Quik Events, Quik Vibes AI

| Aspect | Description |
|--------|-------------|
| **Business Model** | High-margin fees (up to 20% per transaction) |
| **Revenue Split** | 100% to Quik Nation (we own and operate) |
| **Documentation** | Internal PRD, investor materials, growth strategy |
| **Branding** | Full Quik Nation product branding |
| **Infrastructure** | Dedicated resources for scale |
| **Strategy** | Specialized verticals = higher margins |

**Revenue Examples:**
- **Quik Carry**: Up to 20% per delivery trip
- **Quik Car Rental**: 15-25% per rental
- **Quik Events**: 10-15% per ticket + service fees

**Generated Documents:**
- `docs/INTERNAL_PRODUCT_SPEC.md` - Product vision and strategy
- `docs/REVENUE_MODEL.md` - High-margin revenue projections
- `docs/INVESTOR_DECK.md` - Fundraising materials
- `docs/GROWTH_STRATEGY.md` - Market expansion plan
- `docs/COMPETITIVE_ANALYSIS.md` - Market positioning

---

### TIER 2: White-Label Partnerships (Each One is a Unicorn)

**CRITICAL:** Every white-label deal is UNIQUE. No cookie-cutter approach.

| Aspect | Description |
|--------|-------------|
| **Business Model** | Custom negotiated per partnership |
| **Revenue Split** | Negotiated per deal (varies widely) |
| **Product** | Could be ANY Quik Nation product or platform |
| **Territory** | May include geographic exclusivity |
| **Customization** | Varies from light branding to deep integration |
| **Strategy** | Enterprise sales approach - each deal is custom |

**What Makes Each Deal Unique:**
- **Revenue Structure**: Flat fee? Percentage? Hybrid? Tiered?
- **Product Scope**: Full platform? Single product? Feature subset?
- **Geographic Rights**: City? Region? Country? Global?
- **Exclusivity**: Exclusive or non-exclusive?
- **Co-Marketing**: Joint branding? White-label only? Co-branded?
- **Support Model**: We support? Partner supports? Hybrid?
- **Customization Depth**: Config only? Custom features? Full fork?

**Example Deals (All Different):**
```
Partner A: Quik Nation websites, 50/50 split, US Southeast exclusive
Partner B: Quik Carry white-label, 70/30 split, single city, non-exclusive
Partner C: Full platform license, flat $50K/year + 2% of GMV, national
Partner D: Events platform only, 60/40 split, co-branded, 3-year term
```

**Generated Documents (Customized Per Deal):**
- `docs/PARTNER_AGREEMENT_[PARTNER_NAME].md` - Custom terms
- `docs/DEAL_STRUCTURE_[PARTNER_NAME].md` - Revenue model specifics
- `docs/WHITE_LABEL_SCOPE_[PARTNER_NAME].md` - What's included
- `docs/TERRITORY_RIGHTS_[PARTNER_NAME].md` - Geographic terms
- `docs/PARTNER_ONBOARDING_[PARTNER_NAME].md` - Custom setup process

---

### TIER 3: Direct Client Projects (Full 7%)

**Examples:** DreamiHairCare, Pink-Collar-Contractors, PPSV Charities

| Aspect | Description |
|--------|-------------|
| **Business Model** | 7% platform fee (full amount to us) |
| **Revenue Split** | Client gets 93%, we get 7% (no partner split) |
| **Documentation** | Client proposal, onboarding, training |
| **Branding** | Client's brand (white-label for them) |
| **Infrastructure** | Shared EC2, dedicated Amplify app |
| **Strategy** | Direct relationships, custom solutions |

**Generated Documents:**
- `docs/CLIENT_PROPOSAL.md` - Timeline, pricing, milestones
- `docs/business/` - Full business documentation package
- `docs/ONBOARDING_CHECKLIST.md` - Client setup steps
- `docs/TRAINING_GUIDE.md` - Admin panel walkthrough

---

### Revenue Model Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                    REVENUE BY TIER                               │
├─────────────────────────────────────────────────────────────────┤
│  TIER 1 (Unicorns)     │  10-20%+ per transaction               │
│  Quik Carry, Rental,   │  We own & operate                      │
│  Events, Vibes AI      │  HIGH MARGIN, specialized verticals    │
├─────────────────────────────────────────────────────────────────┤
│  TIER 2 (White-Label)  │  CUSTOM per deal (each is a unicorn)   │
│  Any Quik Product      │  Flat fee / % / Hybrid / Tiered        │
│                        │  Enterprise sales, no cookie-cutter    │
├─────────────────────────────────────────────────────────────────┤
│  TIER 3 (Clients)      │  Full 7% to us                         │
│  DreamiHairCare, etc.  │  Direct client relationships           │
│                        │  STANDARD MARGIN, custom work          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚨 NEW in v4.0.0

### Project Type Awareness
Command now distinguishes between:
- **External**: Client onboarding with platform fee model
- **Internal**: Quik Nation products with direct revenue

### Platform Fee Model (External Only)
For client projects, proposals include the **7% platform fee** revenue model:
- Platform Fee: 7% of transaction value
- Stripe Fees: 2.9% + $0.30 (passed to customer)
- Revenue projection calculations included

### Direct Revenue Model (Internal Only)
For internal products:
- Subscription tiers and pricing
- Transaction fees (if applicable)
- Ad revenue projections (if applicable)
- No platform fee split (we ARE the platform)

### Shared ngrok Tunnel Setup
Automatic local development tunnel configuration:
- Discovers available ports using `/Users/amenra/Native-Projects/shared-ngrok/scripts/manage-tunnels.sh`
- Adds project to shared ngrok configuration
- Enables webhook testing during development

### Business Docs Structure
Complete documentation package:
- **External**: Client-facing materials, onboarding, training
- **Internal**: Product specs, marketing briefs, roadmaps

---

## 📋 Required Documents

### Document Hierarchy

| Document | Required | Purpose | Template |
|----------|----------|---------|----------|
| **PRD** | YES | Features, user stories, acceptance criteria | `docs/PRD-TEMPLATE.md` |
| **BRD** | Optional | Business case, ROI, stakeholder needs | (create if needed) |
| **TRD** | YES | Technical stack, architecture | `docs/TRD-TEMPLATE.md` |
| **Magic Patterns** | YES | UI templates to convert | See formats below |

### Magic Patterns Input Formats

Accept UI templates from Magic Patterns in any of these formats:

| Format | Location | How to Analyze |
|--------|----------|----------------|
| **Screenshot** | `mockup/screenshots/` | Visual analysis, identify components |
| **React/Vite Zip** | `mockup/react-vite/` | Code analysis, component structure |
| **Prompt Code** | `mockup/prompt-export.tsx` | Parse JSX/TSX, identify components |

### Minimum Magic Patterns Requirements

The UI templates MUST include at minimum:
- [ ] **Marketing Site** - Hero, navigation, footer, features
- [ ] **Sign Up** - Registration form with validation
- [ ] **Sign In** - Login form with social options
- [ ] **Admin Panel** - Dashboard, sidebar, data tables
- [ ] **E-Commerce OR Service Booking** - Cart/checkout OR appointment booking

---

## 🚀 What You Get

### Immediately (Within 2-3 Hours)
- **LIVE Frontend URL**: `https://develop.{domain}` on AWS Amplify
- **LIVE Backend URL**: `https://api-dev.{domain}` on EC2 instance
- **GitHub Actions CI/CD**: Auto-deploy on every push
- **Basic working apps**: Next.js frontend connected to GraphQL backend
- **Database connected**: PostgreSQL with Sequelize ORM
- **Authentication ready**: Clerk auth configured and working

### At Project Completion
- **Client Proposal**: `docs/CLIENT_PROPOSAL.md` with timeline and milestones
- **Component Inventory**: List of all identified components with agents/skills
- **Production Deployment**: Live at `https://{domain}`
- **Complete Documentation**: API docs, user guides, deployment guides

---

## ⏱️ Timeline Calculation

### Base Timeline
| Project Type | Base Days | Notes |
|--------------|-----------|-------|
| Website Only | 30 days | Next.js + Admin Panel |
| Mobile Only | 60 days | React Native + Firebase |
| Website + Mobile | 90 days | Both platforms |

### Timeline Modifiers
| Factor | Additional Days | Trigger |
|--------|-----------------|---------|
| Tap to Pay / NFC | +30 days | Apple/Google certification |
| Real-time Features | +7 days | WebSockets, live updates |
| Multi-tenant Architecture | +14 days | Multiple business support |
| Complex Integrations | +7-14 days | Per integration |
| HIPAA Compliance | +14 days | Healthcare data |
| Offline Mode | +14 days | Works without internet |

### Complexity Multipliers
| Complexity | Component Count | Multiplier |
|------------|-----------------|------------|
| Simple MVP | < 10 components | 1.0x |
| Standard | 10-20 components | 1.2x |
| Complex | 20-30 components | 1.5x |
| Enterprise | 30+ components | 2.0x |

**Formula**: `Total Days = (Base Days + Component Days) × Complexity Multiplier`

---

## Prerequisites

**CRITICAL**: Before running this command, ensure:

### Required Documents
1. ✅ `docs/PRD.md` exists with project name and features
2. ✅ `docs/TRD.md` exists (copy from `docs/TRD-TEMPLATE.md`)
3. ✅ `mockup/` directory with Magic Patterns export

### Required Infrastructure
4. ✅ GitHub repository created (can be empty)
5. ✅ AWS CLI configured with proper credentials
6. ✅ SSH access to EC2 instance i-0c851042b3e385682 (current IP: 3.86.94.124)
7. ✅ Domain registered in Route 53 with hosted zone

### Required Credentials
- **Project Name**: Extracted from PRD `[PROJECT_NAME]`
- **Project Key**: Extracted from PRD `[PROJECT_KEY]` (e.g., "PROJ")
- **Domain Name**: User provides (e.g., `empresseats.com`)
- **Neon PostgreSQL URL**: ✅ **AUTO-PROVISIONED via Neon CLI** (see below)
- **Clerk Keys**: User provides (publishable + secret)
- **GitHub Repository**: User provides (e.g., `org/repo`)

**AUTOMATIC CONFIGURATION**:
- ✅ **Neon Database**: Auto-provisioned via `neonctl` CLI (org: `org-young-hall-74190661`)
- ✅ **EC2 Instance**: i-0c851042b3e385682 (shared staging)
- ✅ **Quik Dollars Stripe**: Development keys pre-configured
- ✅ **Port Assignment**: Automatic from registry
- ✅ **nginx Configuration**: Auto-generated
- ✅ **SSL Certificates**: Via Let's Encrypt
- ✅ **PM2 Process Management**: Auto-configured

### Neon Database Auto-Provisioning (NEW — March 28, 2026)

**Agents no longer need Mo to create databases.** The Neon CLI handles it automatically:

```bash
# 1. Create the Neon project for this Heru
neonctl projects create --name "${PROJECT_NAME}" --region-id aws-us-east-1 --org-id org-young-hall-74190661 --output json

# 2. Get the connection string (DATABASE_URL)
neonctl connection-string --project-id <new-project-id> --org-id org-young-hall-74190661

# 3. Write to all .env files
echo "DATABASE_URL=<connection-string>" >> backend/.env.local
echo "DATABASE_URL=<connection-string>" >> backend/.env.develop

# 4. For production, create a separate branch
neonctl branches create --name production --project-id <project-id> --org-id org-young-hall-74190661
neonctl connection-string --project-id <project-id> --branch production --org-id org-young-hall-74190661
echo "DATABASE_URL=<prod-connection-string>" >> backend/.env.production
```

**Important:** Always use `--org-id org-young-hall-74190661` (Quik Nation org). Without it, projects go to the personal org.

## 🚨 CRITICAL: Deployment-First Approach

**NEW STRATEGY**: Get deployed infrastructure working FIRST, then build features
- Phase 1: Analyze PRD and gather requirements
- Phase 2: Deploy basic apps to Amplify and EC2
- Phase 3: Setup GitHub Actions CI/CD
- Phase 4+: Build actual features on deployed infrastructure

This ensures:
- ✅ Client sees working URLs immediately
- ✅ Every commit auto-deploys
- ✅ No deployment surprises later
- ✅ Features built on proven infrastructure

## Execution Phases Overview

```
Phase 0: Document Validation & Magic Patterns Analysis
    ↓
Phase 1: Agent/Skill Mapping & Client Proposal Generation (with Platform Fee Model)
    ↓
Phase 2: Git Repository Initialization
    ↓
Phase 2.5: Shared ngrok Tunnel Setup & Port Discovery  ← NEW
    ↓
Phase 3: Deploy Infrastructure (2-3 hours)
    ↓
Phase 4: Setup CI/CD Pipeline
    ↓
Phase 5: Implement Core Features (Days 1-21)
    ↓
Phase 6: Payment & Integrations (Days 22-26)
    ↓
Phase 7: Testing & QA (Days 27-28)
    ↓
Phase 8: Production Launch (Days 29-30)
    ↓
Phase 9: Documentation & Handoff (with Business Docs Package)  ← ENHANCED
```

---

## Phase 0: Document Validation & Magic Patterns Analysis
**Agents**: `ui-mockup-converter`, `product-design-specialist`
**Duration**: 30 minutes - 1 hour

### Step 0.1: Validate Required Documents

```bash
# Check for required documents
docs/
├── PRD.md          # REQUIRED - Product Requirements
├── TRD.md          # REQUIRED - Technical Requirements (copy from TRD-TEMPLATE.md)
└── BRD.md          # OPTIONAL - Business Requirements

mockup/
├── screenshots/    # Option 1: Screenshot images
├── react-vite/     # Option 2: React/Vite zip
└── prompt-export.tsx  # Option 3: Single file code export
```

**Validation Checklist**:
- [ ] PRD.md contains `[PROJECT_NAME]` and `[PROJECT_KEY]`
- [ ] TRD.md has project type selected (web/mobile/both)
- [ ] TRD.md has timeline modifiers checked
- [ ] mockup/ directory has at least one format

### Step 0.2: Analyze Magic Patterns Export

Depending on the format provided, analyze the UI templates:

**For Screenshots** (`mockup/screenshots/`):
```
Use visual analysis to identify:
- Page types (marketing, auth, dashboard, e-commerce)
- UI components (forms, tables, cards, navigation)
- Interactive elements (buttons, modals, dropdowns)
- Layout patterns (responsive, sidebar, grid)
```

**For React/Vite Code** (`mockup/react-vite/` or `mockup/prompt-export.tsx`):
```
Parse code to identify:
- Component imports and structure
- State management needs
- Routing requirements
- API integration points
```

### Step 0.3: Load Pattern Configuration from pattern-mappings.json

**CRITICAL**: Read the pattern configuration based on PRD's MOCKUP_TEMPLATE_CHOICE:

```javascript
// 1. Extract MOCKUP_TEMPLATE_CHOICE from docs/PRD.md
const prd = await readFile('docs/PRD.md');
const mockupChoice = extractVariable(prd, 'MOCKUP_TEMPLATE_CHOICE');
// Examples: "retail", "booking", "property-rental", "restaurant", "custom"

// 2. Load pattern configuration
const patternMappings = require('.claude/config/pattern-mappings.json');
const pattern = patternMappings.patterns[mockupChoice];

// 3. Extract all configuration
const config = {
  displayName: pattern.displayName,
  description: pattern.description,
  industries: pattern.industries,

  // AGENTS - Who does the work
  agents: {
    primary: pattern.agents.primary,      // Main implementation agents
    secondary: pattern.agents.secondary,  // Supporting agents
    backend: pattern.agents.backend,      // Backend-specific agents
    testing: pattern.agents.testing,      // QA agents
  },

  // SKILLS - What capabilities are needed
  skills: {
    required: pattern.skills.required,      // Must have
    recommended: pattern.skills.recommended, // Should have
    optional: pattern.skills.optional,       // Nice to have
  },

  // FEATURES - What to build
  features: {
    core: pattern.features.core,           // MVP required
    recommended: pattern.features.recommended, // Phase 2
    advanced: pattern.features.advanced,   // Future roadmap
  },

  // DATABASE - What tables to create
  database: {
    required: pattern.database.requiredTables,
    optional: pattern.database.optionalTables,
  },

  // PLATFORM FEE - Revenue configuration
  platformFee: {
    default: pattern.platformFee.default,
    byTier: pattern.platformFee.byTier,
    estimatedGMV: pattern.platformFee.estimatedMonthlyGMV,
    cap: pattern.platformFee.cap || null,
    note: pattern.platformFee.note,
  },

  // TIMELINE - Project duration
  timeline: pattern.timeline,

  // PRICING - Development costs
  pricing: pattern.pricing,
};
```

### Step 0.4: Generate Component Inventory

Output a component inventory using the pattern configuration:

```typescript
interface ComponentInventory {
  project: {
    name: string;
    key: string;
    type: 'web' | 'mobile' | 'both';
    baseTimeline: number; // 30, 60, or 90 days
  };

  components: {
    category: string;
    name: string;
    identified: boolean;
    agents: string[];
    skills: string[];
    timelineImpact: number; // days
  }[];

  totals: {
    componentDays: number;
    complexityMultiplier: number;
    calculatedTimeline: number;
    modifiers: string[];
    modifierDays: number;
    finalTimeline: number;
  };

  requiredAgents: string[];
  requiredSkills: string[];
}
```

**Example Output**:
```json
{
  "project": {
    "name": "DreamiHairCare",
    "key": "DHC",
    "type": "web",
    "baseTimeline": 30
  },
  "components": [
    {"category": "Marketing", "name": "Hero Section", "identified": true, "agents": ["nextjs", "tailwind"], "skills": ["frontend-design"], "timelineImpact": 2},
    {"category": "Marketing", "name": "Navigation", "identified": true, "agents": ["shadcn-ui"], "skills": ["admin-panel-standard"], "timelineImpact": 1},
    {"category": "Auth", "name": "Sign Up", "identified": true, "agents": ["clerk-auth-enforcer"], "skills": ["clerk-auth-standard"], "timelineImpact": 1},
    {"category": "Auth", "name": "Sign In", "identified": true, "agents": ["clerk-auth-enforcer"], "skills": ["clerk-auth-standard"], "timelineImpact": 1},
    {"category": "Admin", "name": "Dashboard", "identified": true, "agents": ["shadcn-ui", "redux-persist"], "skills": ["admin-panel-standard"], "timelineImpact": 3},
    {"category": "Booking", "name": "Calendar", "identified": true, "agents": ["shadcn-ui"], "skills": ["barbershop"], "timelineImpact": 3},
    {"category": "Booking", "name": "Service Selection", "identified": true, "agents": ["shadcn-ui"], "skills": ["barbershop"], "timelineImpact": 1},
    {"category": "E-Commerce", "name": "Checkout", "identified": true, "agents": ["stripe-connect"], "skills": ["checkout-flow-standard"], "timelineImpact": 5}
  ],
  "totals": {
    "componentDays": 17,
    "complexityMultiplier": 1.2,
    "calculatedTimeline": 56,
    "modifiers": ["SMS Reminders"],
    "modifierDays": 2,
    "finalTimeline": 58
  },
  "requiredAgents": ["nextjs-architecture-guide", "tailwind-design-system-architect", "shadcn-ui-specialist", "clerk-auth-enforcer", "redux-persist-state-manager", "stripe-connect-specialist"],
  "requiredSkills": ["frontend-design", "admin-panel-standard", "clerk-auth-standard", "barbershop", "checkout-flow-standard", "sms-notifications-standard"]
}
```

### Step 0.5: Generate docs/internal/MASTER_TASKS.md

**CRITICAL**: Generate the master task file with command + agent + skill assignments:

```bash
# Create the internal directory if it does not exist
mkdir -p docs/internal
```

**Generate MASTER_TASKS.md with this structure**:

```markdown
# MASTER_TASKS.md - [PROJECT_NAME]

> **Project**: [PROJECT_NAME]
> **Pattern**: [MOCKUP_TEMPLATE_CHOICE] (from docs/PRD.md)
> **Pattern Source**: .claude/config/pattern-mappings.json
> **Generated**: [DATE]
> **Total Tasks**: [X]
> **Estimated MVP**: [X] days
> **Platform Fee**: [X]% (estimated monthly revenue: $[Y])

---

## Project Configuration

### PRD Settings
| Setting | Value |
|---------|-------|
| MOCKUP_TEMPLATE_CHOICE | [pattern] |
| MOCKUP_SOURCE | [magic-patterns/existing-ui/screenshot/template] |
| MOCKUP_PATH | [path to mockup files] |

### Pattern Configuration (from pattern-mappings.json)
| Setting | Value |
|---------|-------|
| Display Name | [pattern.displayName] |
| Industries | [pattern.industries] |
| Platform Fee | [pattern.platformFee.default]% |
| Estimated Monthly GMV | $[pattern.platformFee.estimatedMonthlyGMV.typical] |
| Monthly Platform Revenue | $[GMV × fee%] |

### Activated Agents
| Category | Agents |
|----------|--------|
| **Primary** | [pattern.agents.primary] |
| **Secondary** | [pattern.agents.secondary] |
| **Backend** | [pattern.agents.backend] |
| **Testing** | [pattern.agents.testing] |

### Required Skills
| Priority | Skills |
|----------|--------|
| **Required** | [pattern.skills.required] |
| **Recommended** | [pattern.skills.recommended] |
| **Optional** | [pattern.skills.optional] |

### Core Features (MVP)
[List from pattern.features.core]

### Database Tables
| Required | Optional |
|----------|----------|
| [pattern.database.requiredTables] | [pattern.database.optionalTables] |

---

## Task Assignment Matrix

| Task Category | Command | Primary Agent | Skills |
|---------------|---------|---------------|--------|
| Infrastructure | /deploy-ops | aws-cloud-services-orchestrator | aws-deployment-standard |
| Database | /backend-dev | sequelize-orm-optimizer | database-migration-standard |
| Authentication | /integrations | clerk-auth-enforcer | clerk-auth-standard |
| UI Components | /frontend-dev | shadcn-ui-specialist | admin-panel-standard |
| Data Fetching | /frontend-dev | graphql-apollo-frontend | - |
| State Management | /frontend-dev | redux-persist-state-manager | checkout-flow-standard |
| Payments | /integrations | stripe-connect-specialist | checkout-flow-standard |
| Testing | /test-automation | testing-automation-agent | - |

---

## Phase 1: Foundation (Days 1-7)

### TASK-001: Initialize Project Infrastructure

**Status**: [ ] Not Started
**Priority**: P0 (Critical)
**Timeline**: Day 1

#### Assignment
- **Command**: `/deploy-ops`
- **Primary Agent**: `aws-cloud-services-orchestrator`
- **Supporting Agents**: `express-backend-architect`, `nodejs-runtime-optimizer`
- **Required Skills**: `aws-deployment-standard`

#### Description
Deploy foundational infrastructure:
- EC2 backend with PM2 process management
- AWS Amplify frontend deployment
- Neon PostgreSQL database connection
- GitHub Actions CI/CD pipeline

#### Acceptance Criteria
- [ ] Backend: https://api-dev.[domain]/graphql responds
- [ ] Frontend: https://develop.[domain] renders
- [ ] Database: Migrations run successfully
- [ ] CI/CD: Push to develop triggers deployment

---

### TASK-002: Database Schema & Models

**Status**: [ ] Not Started
**Priority**: P0 (Critical)
**Timeline**: Days 2-3

#### Assignment
- **Command**: `/backend-dev`
- **Primary Agent**: `sequelize-orm-optimizer`
- **Supporting Agents**: `postgresql-database-architect`
- **Required Skills**: `database-migration-standard`

#### Description
Create database schema based on pattern requirements:
- Required tables: [pattern.database.requiredTables]
- UUID primary keys
- Proper indexes for performance
- Sequelize associations

#### Acceptance Criteria
- [ ] All required tables created
- [ ] Migrations run without errors
- [ ] Seed data populates correctly

---

[Continue with Phase 2, 3, 4, 5 tasks following the same format...]
```

**Task Generation Rules**:

1. **Each core feature from pattern.features.core gets a task**
2. **Each task is assigned a command based on domain**:
   - Frontend UI → `/frontend-dev`
   - Backend API → `/backend-dev`
   - Third-party services → `/integrations`
   - Deployment → `/deploy-ops`
   - Testing → `/test-automation`
   - Debugging → `/debug-fix`
   - Planning → `/plan-design`

3. **Agents are assigned from pattern.agents based on task type**
4. **Skills are assigned from pattern.skills based on feature**
5. **Platform fee tasks are clearly marked** with revenue impact

---

## Phase 1: Generate Client Proposal (with Platform Fee Model)
**Agents**: `business-analyst-bridge`, `product-design-specialist`, `stripe-connect-specialist`
**Duration**: 15-30 minutes

### Step 1.1: Generate docs/CLIENT_PROPOSAL.md

Using the component inventory from Phase 0, generate a client-facing proposal:

```bash
# Copy template and fill in project-specific details
cp docs/CLIENT_PROPOSAL_TEMPLATE.md docs/CLIENT_PROPOSAL.md
```

**Auto-populate**:
- Project name and type from PRD
- Timeline calculated from component analysis
- Feature list from identified components
- Milestone breakdown based on timeline
- Required technology stack from TRD
- **Platform fee model and revenue projections** ← NEW

### Step 1.1.5: Include Platform Fee Model

**CRITICAL**: All proposals MUST include the platform fee structure:

```markdown
## Revenue Model

### Platform Fee Structure
| Component | Rate | Description |
|-----------|------|-------------|
| Platform Fee | 7% | Quik Nation platform services |
| Stripe Processing | 2.9% + $0.30 | Payment processing (passed to customer) |

### Revenue Projection Example
| Monthly GMV | Platform Revenue (7%) | Annual Revenue |
|-------------|----------------------|----------------|
| $10,000 | $700 | $8,400 |
| $50,000 | $3,500 | $42,000 |
| $100,000 | $7,000 | $84,000 |
| $500,000 | $35,000 | $420,000 |

### What's Included in Platform Fee
- ✅ Infrastructure hosting (AWS)
- ✅ Database management (Neon PostgreSQL)
- ✅ SSL certificates and security
- ✅ Automatic backups
- ✅ 24/7 monitoring
- ✅ Technical support
- ✅ Software updates and maintenance
```

**Implementation Notes**:
- Platform fee is collected via Stripe Connect
- Site owners (SITE_OWNER) receive 93% of transaction
- Platform owner (PLATFORM_OWNER) receives 7%
- Stripe fees are added on top and passed to customer

### Step 1.2: Present Proposal to User

Display the generated proposal summary:

```
╔══════════════════════════════════════════════════════════╗
║              PROJECT PROPOSAL: [PROJECT_NAME]            ║
╠══════════════════════════════════════════════════════════╣
║  Type:          [web/mobile/both]                        ║
║  Timeline:      [X] days                                 ║
║  Launch Date:   [CALCULATED_DATE]                        ║
╠══════════════════════════════════════════════════════════╣
║  IDENTIFIED COMPONENTS                                    ║
║  • Marketing Site       [X] components    +[X] days      ║
║  • Authentication       [X] components    +[X] days      ║
║  • Admin Panel          [X] components    +[X] days      ║
║  • E-Commerce/Booking   [X] components    +[X] days      ║
║  • Additional Features  [X] components    +[X] days      ║
╠══════════════════════════════════════════════════════════╣
║  REQUIRED AGENTS: [X] agents                             ║
║  REQUIRED SKILLS: [X] skills                             ║
╠══════════════════════════════════════════════════════════╣
║  Full proposal saved to: docs/CLIENT_PROPOSAL.md         ║
╚══════════════════════════════════════════════════════════╝
```

### Step 1.3: Confirm with User

Ask user to confirm before proceeding:

```
Ready to proceed with bootstrap?
- Timeline: [X] days (target launch: [DATE])
- This will:
  1. Create live development URLs (2-3 hours)
  2. Setup CI/CD pipeline
  3. Begin feature development

Proceed? [Y/n]
```

---

## Phase 2: Git Repository Initialization
**Duration**: 5-10 minutes

**Actions**:
1. Check if repository exists locally
2. If not, clone from GitHub
3. Create branch structure:
   ```bash
   git checkout -b main (if doesn't exist)
   git checkout -b develop
   git checkout -b feature/bootstrap-infrastructure
   ```
4. Ensure `.gitignore` includes sensitive files
5. Initial commit if empty repository

---

## Phase 2.5: Shared ngrok Tunnel Setup & Port Discovery
**NEW in v4.0.0**
**Agents**: `docker-port-manager`
**Duration**: 5-10 minutes

This phase sets up local development tunnels for webhook testing and third-party integrations.

### Step 2.5.1: Discover Available Ports

```bash
# Use the shared ngrok management script to find available ports
cd /Users/amenra/Native-Projects/shared-ngrok

# Discover current port allocations across all projects
./scripts/manage-tunnels.sh ports

# Expected output:
# Available port pairs for new projects:
#   Backend: 3031, Frontend: 3131
#   Backend: 3032, Frontend: 3132
#   ...
```

### Step 2.5.2: Allocate Ports for New Project

```bash
# Add tunnel configuration for the new project
./scripts/manage-tunnels.sh add ${PROJECT_KEY} ${BACKEND_PORT} ${FRONTEND_PORT}

# Example:
./scripts/manage-tunnels.sh add dreamihaircare 3031 3131
```

**Port Allocation Algorithm**:
1. Reserved ports are skipped: 4040 (ngrok UI), 5432 (PostgreSQL), 6379 (Redis), 5433, 27017, 9200, 9300
2. Primary allocation range: 3031-3040 (backend), 3131-3140 (frontend)
3. Secondary range: 3041-3050 (backend), 3141-3150 (frontend)
4. Overflow range: 3051+ (backend), 3151+ (frontend)

### Step 2.5.3: Update Project Environment Files

```bash
# Add ngrok URLs to project .env files
echo "NGROK_BACKEND_URL=https://${PROJECT_KEY}-api.ngrok.io" >> backend/.env.local
echo "NGROK_FRONTEND_URL=https://${PROJECT_KEY}.ngrok.io" >> frontend/.env.local
echo "NGROK_WEBHOOK_URL=https://${PROJECT_KEY}-api.ngrok.io/webhooks" >> backend/.env.local
```

### Step 2.5.4: Configure Webhook Endpoints

For each integration, configure webhook URLs:

```typescript
// Webhook configuration for development
const WEBHOOK_CONFIG = {
  stripe: `${process.env.NGROK_BACKEND_URL}/webhooks/stripe`,
  clerk: `${process.env.NGROK_BACKEND_URL}/webhooks/clerk`,
  twilio: `${process.env.NGROK_BACKEND_URL}/webhooks/twilio`,
  shippo: `${process.env.NGROK_BACKEND_URL}/webhooks/shippo`,
  sendgrid: `${process.env.NGROK_BACKEND_URL}/webhooks/sendgrid`,
};
```

### Step 2.5.5: Verify Tunnel Configuration

```bash
# Verify the tunnel was added to ngrok.yml
./scripts/manage-tunnels.sh list

# Start ngrok to verify tunnels work
ngrok start ${PROJECT_KEY}-backend ${PROJECT_KEY}-frontend

# Test webhook endpoint
curl -X POST https://${PROJECT_KEY}-api.ngrok.io/webhooks/test
```

### Step 2.5.6: Copy Shared ngrok Documentation

```bash
# Copy shared ngrok integration guide to project
cp -r /Users/amenra/Native-Projects/AI/quik-nation-ai-boilerplate/docs/shared-ngrok ${PROJECT_DIR}/docs/
```

---

## Phase 3: Deploy Basic Infrastructure
**NOTE**: Phase 0 already handles PRD analysis and user input gathering. This phase focuses on deployment.

**MISSION**: Get working apps deployed within first hour

#### Phase 3A: Backend Deployment to EC2
**Agents**: `express-backend-architect`, `aws-cloud-services-orchestrator`, `nodejs-runtime-optimizer`

**Actions**:

1. **Create Basic Backend Structure**:
   ```bash
   backend/
   ├── src/
   │   ├── server.ts          # Basic Express + GraphQL server
   │   ├── schema.graphql      # Minimal schema (User, healthCheck)
   │   ├── resolvers/
   │   │   └── index.ts        # Basic resolvers
   │   ├── database/
   │   │   ├── connection.ts   # Neon PostgreSQL connection
   │   │   └── models/
   │   │       └── User.ts     # Basic User model
   │   └── middleware/
   │       └── auth.ts         # Clerk JWT validation
   ├── package.json
   ├── tsconfig.json
   ├── ecosystem.config.js     # PM2 configuration
   └── .env.example
   ```

2. **Basic GraphQL Schema**:
   ```graphql
   type User {
     id: ID!
     email: String!
     name: String
     createdAt: String!
   }

   type Query {
     healthCheck: String!
     me: User
   }

   type Mutation {
     updateProfile(name: String!): User!
   }
   ```

3. **Allocate Port from Registry**:
   ```bash
   # Use port management system
   /Users/amenra/Projects/shared-ngrok/.claude/port-manager.sh allocate ${PROJECT_KEY}
   # Returns: Allocated port 3042 (example)
   ```

4. **Deploy to EC2**:
   ```bash
   # SSH to EC2 instance
   ssh -i ~/.ssh/shared-ec2.pem ubuntu@3.86.94.124

   # Create project directory
   sudo mkdir -p /var/www/${PROJECT_KEY}-backend
   sudo chown ubuntu:ubuntu /var/www/${PROJECT_KEY}-backend

   # Clone repository
   cd /var/www/${PROJECT_KEY}-backend
   git clone ${github_repo} .
   git checkout develop

   # Install dependencies and build
   cd backend
   npm install
   npm run build

   # Create .env file with Parameter Store values
   echo "DATABASE_URL=${database_url}" > .env
   echo "CLERK_SECRET_KEY=${clerk_secret_key}" >> .env
   echo "PORT=3042" >> .env
   echo "NODE_ENV=development" >> .env

   # Start with PM2
   pm2 start ecosystem.config.js
   pm2 save
   ```

5. **Configure nginx**:
   ```nginx
   # /etc/nginx/sites-available/${PROJECT_KEY}-backend
   server {
     listen 80;
     server_name api-dev.${domain};

     location / {
       proxy_pass http://localhost:3042;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

6. **Setup SSL with Certbot**:
   ```bash
   sudo certbot --nginx -d api-dev.${domain}
   ```

7. **Configure Route 53**:
   ```bash
   # A record for api-dev.${domain} → 3.86.94.124
   aws route53 change-resource-record-sets \
     --hosted-zone-id ${ZONE_ID} \
     --change-batch '{
       "Changes": [{
         "Action": "CREATE",
         "ResourceRecordSet": {
           "Name": "api-dev.'${domain}'",
           "Type": "A",
           "TTL": 300,
           "ResourceRecords": [{"Value": "3.86.94.124"}]
         }
       }]
     }'
   ```

8. **Verify Backend is Live**:
   ```bash
   curl https://api-dev.${domain}/graphql
   # Should return GraphQL playground in dev mode
   ```

#### Phase 3B: Frontend Deployment to AWS Amplify
**Agents**: `nextjs-architecture-guide`, `aws-cloud-services-orchestrator`

**Actions**:

1. **Create Basic Frontend Structure**:
   ```bash
   frontend/
   ├── app/
   │   ├── layout.tsx          # Root layout with Clerk
   │   ├── page.tsx            # Home page
   │   ├── login/
   │   │   └── page.tsx        # Login page
   │   ├── dashboard/
   │   │   └── page.tsx        # Protected dashboard
   │   └── api/
   │       └── graphql/
   │           └── route.ts    # GraphQL client setup
   ├── components/
   │   ├── Header.tsx
   │   └── Footer.tsx
   ├── lib/
   │   ├── apollo-client.ts    # Apollo Client configuration
   │   └── store.ts            # Redux store setup
   ├── package.json
   ├── next.config.js
   ├── tailwind.config.js
   └── .env.local
   ```

2. **Basic Next.js App with Clerk**:
   ```typescript
   // app/layout.tsx
   import { ClerkProvider } from '@clerk/nextjs'

   export default function RootLayout({
     children,
   }: {
     children: React.ReactNode
   }) {
     return (
       <ClerkProvider>
         <html lang="en">
           <body>{children}</body>
         </html>
       </ClerkProvider>
     )
   }
   ```

3. **Connect to Backend**:
   ```typescript
   // lib/apollo-client.ts
   import { ApolloClient, InMemoryCache } from '@apollo/client'

   const client = new ApolloClient({
     uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://api-dev.${domain}/graphql',
     cache: new InMemoryCache(),
   })
   ```

4. **Create Amplify App**:
   ```bash
   # Create amplify.yml
   cat > amplify.yml << 'EOF'
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd frontend
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: frontend/.next
       files:
         - '**/*'
     cache:
       paths:
         - frontend/node_modules/**/*
   EOF

   # Push to repository
   git add .
   git commit -m "feat: initial frontend structure for AWS Amplify"
   git push origin develop
   ```

5. **Connect GitHub to Amplify**:
   ```bash
   # Create Amplify app
   aws amplify create-app \
     --name "${PROJECT_KEY}-frontend" \
     --repository "${github_repo}" \
     --access-token "${GITHUB_TOKEN}"

   # Create develop branch
   aws amplify create-branch \
     --app-id "${APP_ID}" \
     --branch-name "develop" \
     --enable-auto-build

   # Set environment variables
   aws amplify update-branch \
     --app-id "${APP_ID}" \
     --branch-name "develop" \
     --environment-variables \
       "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${clerk_publishable_key},\
        NEXT_PUBLIC_GRAPHQL_URL=https://api-dev.${domain}/graphql"
   ```

6. **Configure Custom Domain**:
   ```bash
   # Add custom domain to Amplify
   aws amplify create-domain-association \
     --app-id "${APP_ID}" \
     --domain-name "${domain}" \
     --sub-domain-settings '[
       {
         "prefix": "develop",
         "branchName": "develop"
       }
     ]'
   ```

7. **Verify Frontend is Live**:
   ```bash
   # Wait for deployment (usually 5-10 minutes)
   aws amplify get-branch --app-id "${APP_ID}" --branch-name "develop"

   # Test the URL
   curl https://develop.${domain}
   # Should return Next.js app HTML
   ```

---

### Phase 4: Setup GitHub Actions CI/CD
**Agents**: `aws-cloud-services-orchestrator`, `nodejs-runtime-optimizer`

**Actions**:

1. **Create GitHub Actions Workflow for Backend**:
   ```yaml
   # .github/workflows/deploy-backend-develop.yml
   name: Deploy Backend to EC2 (Develop)

   on:
     push:
       branches: [develop]
       paths:
         - 'backend/**'
         - '.github/workflows/deploy-backend-develop.yml'

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3

         - name: Deploy to EC2
           uses: appleboy/ssh-action@v0.1.5
           with:
             host: ${{ secrets.EC2_HOST }}
             username: ubuntu
             key: ${{ secrets.EC2_SSH_KEY }}
             script: |
               cd /var/www/${PROJECT_KEY}-backend
               git pull origin develop
               cd backend
               npm install
               npm run build
               pm2 reload ${PROJECT_KEY}-backend
   ```

2. **Create GitHub Actions Workflow for Database Migrations**:
   ```yaml
   # .github/workflows/run-migrations.yml
   name: Run Database Migrations

   on:
     push:
       branches: [develop, main]
       paths:
         - 'backend/src/database/migrations/**'

   jobs:
     migrate:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3

         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '20'

         - name: Run migrations
           run: |
             cd backend
             npm ci
             npm run migrate:up
           env:
             DATABASE_URL: ${{ secrets.DATABASE_URL }}
   ```

3. **Setup GitHub Secrets via AWS Parameter Store**:
   ```bash
   # Store in Parameter Store
   aws ssm put-parameter \
     --name "/${PROJECT_KEY}/github/ec2-host" \
     --value "3.86.94.124" \
     --type "String"

   aws ssm put-parameter \
     --name "/${PROJECT_KEY}/github/ec2-ssh-key" \
     --value "${SSH_KEY_CONTENT}" \
     --type "SecureString"

   aws ssm put-parameter \
     --name "/${PROJECT_KEY}/database/url" \
     --value "${database_url}" \
     --type "SecureString"
   ```

4. **Frontend Auto-Deploy via Amplify**:
   ```yaml
   # Frontend deploys automatically via Amplify
   # No GitHub Action needed - Amplify watches the repository
   # Every push to develop branch triggers automatic build and deploy
   ```

5. **Create Monitoring Workflow**:
   ```yaml
   # .github/workflows/health-check.yml
   name: Health Check

   on:
     schedule:
       - cron: '*/30 * * * *'  # Every 30 minutes

   jobs:
     check:
       runs-on: ubuntu-latest
       steps:
         - name: Check Backend Health
           run: |
             response=$(curl -s -o /dev/null -w "%{http_code}" https://api-dev.${domain}/graphql)
             if [ $response != "200" ]; then
               echo "Backend is down! Status: $response"
               exit 1
             fi

         - name: Check Frontend Health
           run: |
             response=$(curl -s -o /dev/null -w "%{http_code}" https://develop.${domain})
             if [ $response != "200" ]; then
               echo "Frontend is down! Status: $response"
               exit 1
             fi
   ```

6. **Verify CI/CD Pipeline**:
   ```bash
   # Make a test change
   echo "// Test CI/CD" >> backend/src/server.ts
   git add .
   git commit -m "test: verify CI/CD pipeline"
   git push origin develop

   # Watch GitHub Actions
   # Backend should auto-deploy to EC2
   # Frontend should auto-deploy to Amplify
   ```

---

### Phase 5: Implement Core Features (Days 1-21)
**NOW** that infrastructure is deployed and CI/CD is working, implement actual features

#### Phase 5A: Database Schema & Models
**Agents**: `sequelize-orm-optimizer`, `postgresql-database-architect`

**Actions**:
1. **Analyze mockup/PRD for data requirements**
2. **Create complete database schema**:
   - User, Role, Permission tables
   - Business entity tables (from PRD)
   - Relationship tables
3. **Implement Sequelize models** with:
   - UUID primary keys
   - Proper associations
   - Validation rules
   - Indexes for performance
4. **Create and run migrations**
5. **Seed initial data**

#### Phase 5B: Authentication & Authorization
**Agents**: `clerk-auth-enforcer`, `graphql-backend-enforcer`

**Actions**:
1. **Complete Clerk integration**:
   - Webhook endpoints for user sync
   - Role-based access control
   - Protected routes
   - Admin panel access
2. **GraphQL authorization**:
   - Context setup with user info
   - Resolver-level permissions
   - Field-level authorization
3. **Frontend auth flows**:
   - Sign up with email verification
   - Sign in with remember me
   - Password reset
   - Social logins (if required)

#### Phase 5C: Convert Mockups to Working Features
**Agents**: `ui-mockup-converter`, `shadcn-ui-specialist`, `tailwind-design-system-architect`

**Actions**:
1. **Parse mockup/MOCKUP.md or mockup/custom/**
2. **Extract all components and pages**
3. **Convert to Next.js components**:
   - Server Components by default
   - Client Components where needed
   - Proper data fetching
4. **Implement design system**:
   - Colors, typography, spacing
   - Responsive layouts
   - Dark mode (if required)
5. **Wire up to GraphQL backend**:
   - Queries for data fetching
   - Mutations for user actions
   - Subscriptions for real-time

---

### Phase 6: Payment & Integrations (Days 22-26)
**Agents**: `stripe-connect-specialist`, `twilio-flex-communication-manager`, `google-analytics-implementation-specialist`, `shippo-shipping-integration`

#### Phase 6A: Payment Integration
**Actions**:
1. **Stripe Connect setup** (if marketplace)
2. **Payment flows**:
   - Product/service selection
   - Shopping cart (Redux Persist)
   - Checkout with Stripe Elements
   - Order confirmation
3. **Webhook processing**:
   - Payment confirmation
   - Failed payments
   - Refunds
4. **Admin payment dashboard**

#### Phase 6B: Business Features & Integrations
**Actions**:
1. **Core business logic** from PRD
2. **Admin dashboards** from mockup
3. **Reporting and analytics**
4. **Third-party integrations**:
   - Email (SendGrid)
   - SMS (Twilio)
   - Analytics (Google Analytics)
   - Shipping (Shippo)

---

### Phase 7: Testing & QA (Days 27-28)
**Agents**: `testing-automation-agent`, `playwright-test-executor`

**Actions**:
1. **Unit tests** for critical functions
2. **Integration tests** for API
3. **E2E tests** with Playwright:
   - User registration flow
   - Login and authentication
   - Core business flows
   - Payment processing
4. **Performance testing**
5. **Security audit**

---

### Phase 8: Production Launch (Days 29-30)
**Agents**: `aws-cloud-services-orchestrator`, `nodejs-runtime-optimizer`

**Actions**:
1. **Create production branch**:
   ```bash
   git checkout -b main
   git merge develop
   git push origin main
   ```

2. **Setup production URLs**:
   - Backend: `https://api.${domain}`
   - Frontend: `https://${domain}`

3. **Configure Amplify production**:
   - Connect main branch
   - Set production environment variables
   - Configure custom domain

4. **Configure EC2 production** (if not sharing):
   - Separate PM2 process
   - Production environment variables
   - nginx configuration for api.${domain}

5. **Production checklist**:
   - [ ] SSL certificates active
   - [ ] Environment variables set
   - [ ] Database migrations run
   - [ ] Monitoring configured
   - [ ] Backups scheduled
   - [ ] Rate limiting enabled
   - [ ] Error tracking setup

---

### Phase 9: Documentation & Handoff (with Business Docs Package)
**ENHANCED in v4.0.0**
**Agents**: `git-commit-docs-manager`, `claude-context-documenter`, `business-analyst-bridge`

**Actions**:
1. **Technical documentation**:
   - API documentation
   - Database schema docs
   - Deployment guide
   - Environment variables list

2. **User documentation**:
   - Admin user guide
   - API integration guide
   - Troubleshooting guide

3. **Project handoff package**:
   - Access credentials (in Parameter Store)
   - GitHub repository access
   - AWS account access
   - Monitoring dashboard links
   - Support contacts

4. **Business Documentation Package** ← NEW:
   Copy and customize business docs from boilerplate:

   ```bash
   # Copy business docs structure
   cp -r /Users/amenra/Native-Projects/AI/quik-nation-ai-boilerplate/docs/business ${PROJECT_DIR}/docs/

   # Business docs structure:
   docs/business/
   ├── vision/                    # Company vision and strategy
   │   └── quik_nation_vision.md
   ├── client-materials/          # Sales and onboarding
   │   ├── client_onboarding.docx
   │   ├── platform_overview.pptx
   │   └── pricing_guide.md
   ├── technical-overview/        # Non-technical explanations
   │   ├── how_we_build_apps.docx
   │   ├── security_compliance.md
   │   └── infrastructure_overview.md
   ├── presentations/             # PowerPoint presentations
   │   ├── investor_deck.pptx
   │   └── client_presentation.pptx
   └── infrastructure/            # Business-friendly technical docs
       ├── How_We_Connect_Your_Business.docx
       └── webhook_infrastructure.md
   ```

5. **Customize for Client**:
   - Replace `[PROJECT_NAME]` with actual project name
   - Update revenue projections with client-specific data
   - Customize branding and contact information
   - Generate project-specific feature documentation

6. **Client Training Materials**:
   - Admin panel walkthrough
   - Common tasks guide
   - Support escalation process
   - Platform fee explanation (7% model)

---

## Success Metrics

### Immediate Success (2-3 Hours)
- ✅ Frontend accessible at `https://develop.${domain}`
- ✅ Backend API at `https://api-dev.${domain}/graphql`
- ✅ Database connected and migrations run
- ✅ Authentication working (can create account and login)
- ✅ GitHub Actions CI/CD operational

### Day 1 Success
- ✅ Core pages from mockup implemented
- ✅ Basic CRUD operations working
- ✅ Design system applied
- ✅ Mobile responsive

### Week 1 Success
- ✅ All mockup pages converted
- ✅ Payment processing working
- ✅ Admin dashboard functional
- ✅ Email notifications setup

### Day 30 Success
- ✅ All PRD features implemented
- ✅ Testing suite complete
- ✅ Production environment ready
- ✅ Documentation complete
- ✅ Client training delivered

## Error Recovery

### Common Issues and Solutions

1. **Port conflicts on EC2**:
   ```bash
   # Check port allocation
   /Users/amenra/Projects/shared-ngrok/.claude/port-manager.sh show
   # Allocate new port if needed
   /Users/amenra/Projects/shared-ngrok/.claude/port-manager.sh allocate ${PROJECT_KEY}
   ```

2. **Amplify build failures**:
   - Check build logs in AWS Console
   - Verify environment variables
   - Check amplify.yml configuration
   - Ensure frontend/package.json scripts are correct

3. **Database connection issues**:
   - Verify Neon PostgreSQL URL
   - Check SSL mode (should be require)
   - Verify from EC2: `psql "${DATABASE_URL}"`

4. **nginx configuration issues**:
   ```bash
   # Test configuration
   sudo nginx -t
   # Reload if valid
   sudo systemctl reload nginx
   # Check error logs
   sudo tail -f /var/log/nginx/error.log
   ```

5. **PM2 process issues**:
   ```bash
   # Check process status
   pm2 status
   # View logs
   pm2 logs ${PROJECT_KEY}-backend
   # Restart if needed
   pm2 restart ${PROJECT_KEY}-backend
   ```

## Command Invocation

### TIER 1: Internal Unicorn Product

```bash
# For high-margin internal products (Quik Carry, Quik Car Rental, Quik Events)
bootstrap-project \
  --type=internal-unicorn \
  --domain="quikcarry.com" \
  --product-name="Quik Carry" \
  --revenue-model="20% per trip" \
  --database-url="postgresql://..." \
  --clerk-publishable-key="pk_test_..." \
  --clerk-secret-key="sk_test_..." \
  --github-repo="imaginationeverywhere/quik-carry"

# This generates:
# - docs/INTERNAL_PRODUCT_SPEC.md (product vision)
# - docs/REVENUE_MODEL.md (high-margin projections)
# - docs/INVESTOR_DECK.md (fundraising materials)
# - docs/GROWTH_STRATEGY.md (market expansion)
# - docs/COMPETITIVE_ANALYSIS.md (market positioning)
```

### TIER 2: White-Label Partnership (Custom Deal)

```bash
# Each white-label deal is UNIQUE - customize all parameters
bootstrap-project \
  --type=white-label \
  --partner-name="Partner Company LLC" \
  --product="quik-carry" \                    # or "quik-nation", "quik-events", etc.
  --territory="US-Southeast" \                # geographic scope
  --exclusivity="exclusive" \                 # or "non-exclusive"
  --revenue-model="percentage" \              # or "flat-fee", "hybrid", "tiered"
  --revenue-split="70/30" \                   # custom per deal
  --domain="partner-delivery.com" \
  --database-url="postgresql://..." \
  --clerk-publishable-key="pk_test_..." \
  --clerk-secret-key="sk_test_..." \
  --github-repo="imaginationeverywhere/partner-quikcarry"

# This generates CUSTOM documents for this specific deal:
# - docs/PARTNER_AGREEMENT_PartnerCompanyLLC.md
# - docs/DEAL_STRUCTURE_PartnerCompanyLLC.md
# - docs/WHITE_LABEL_SCOPE_PartnerCompanyLLC.md
# - docs/TERRITORY_RIGHTS_PartnerCompanyLLC.md
# - docs/PARTNER_ONBOARDING_PartnerCompanyLLC.md
```

**IMPORTANT:** White-label deals require manual review of generated documents.
Each partnership is a unicorn - no auto-pilot.

### TIER 3: Direct Client Project

```bash
# For direct client projects (full 7% to us)
bootstrap-project \
  --type=client \
  --domain="dreamihaircare.com" \
  --client-name="DreamiHairCare LLC" \
  --database-url="postgresql://..." \
  --clerk-publishable-key="pk_test_..." \
  --clerk-secret-key="sk_test_..." \
  --github-repo="imaginationeverywhere/dreamihaircare"

# This generates:
# - docs/CLIENT_PROPOSAL.md (with 7% platform fee)
# - docs/business/ (client-facing materials)
# - docs/ONBOARDING_CHECKLIST.md
# - docs/TRAINING_GUIDE.md
```

### Interactive Mode

```bash
# Interactive mode asks which tier
bootstrap-project --interactive

# First question:
# Which revenue tier is this project?
# [1] Internal Unicorn - High-margin product (10-20%) we own & operate
# [2] White-Label Partner - Quik Nation platform, 7% split with partner
# [3] Direct Client - Custom build, full 7% to us
```

## Post-Bootstrap Checklist

After successful bootstrap, verify:

- [ ] **URLs are live**:
  - [ ] https://develop.${domain} shows Next.js app
  - [ ] https://api-dev.${domain}/graphql shows GraphQL playground

- [ ] **CI/CD working**:
  - [ ] Push to develop branch triggers deployments
  - [ ] GitHub Actions showing green checkmarks

- [ ] **Basic features working**:
  - [ ] Can create account
  - [ ] Can login
  - [ ] Can access dashboard
  - [ ] GraphQL queries working

- [ ] **Monitoring active**:
  - [ ] Health check workflow running
  - [ ] PM2 monitoring active
  - [ ] Amplify build logs available

---

## Auto-Claude Integration

**Version 4.4.0**: Simplified Auto-Claude integration - plans stay in the project directory.

### How It Works

Auto-Claude runs from `$HOME/Auto-Claude` but works directly on the project directory. Plans are stored **in the project itself** - no copying to a central location needed.

```
Auto-Claude Location:  $HOME/Auto-Claude/
Project Location:      {project-path}/
Plan Location:         {project-path}/.internal/plans/bootstrap-plan.md
```

### Plan Location

When `bootstrap-project` runs, it generates plans directly in the project:

```
{project}/.internal/plans/
└── bootstrap-plan.md    ← Auto-Claude reads this directly
```

**That's it.** No copying, no central directory, no sync issues.

### Bootstrap Plan Structure

The generated `bootstrap-plan.md` follows this format:

```markdown
# Bootstrap Plan - [PROJECT_NAME]

## Project Context
- **Project Path**: {full-path-to-project}
- **Project Type**: [client | internal-unicorn | white-label]
- **Target MVP Date**: [DATE]
- **Pattern**: [MOCKUP_TEMPLATE_CHOICE]

## Pre-Requisites
- [ ] PRD.md completed
- [ ] TRD.md configured
- [ ] Mockups provided
- [ ] Credentials collected (Clerk, Database, etc.)

## Execution Sessions

### Session 1: Infrastructure Setup
**Duration**: 2-3 hours
**Commands to Execute**:
- `/deploy-ops` - Deploy EC2 backend infrastructure
- `/deploy-ops` - Deploy AWS Amplify frontend

**Acceptance Criteria**:
- [ ] Backend API responds at https://api-dev.{domain}/graphql
- [ ] Frontend renders at https://develop.{domain}
- [ ] CI/CD pipeline operational

### Session 2: Database & Auth Foundation
**Duration**: 2-3 hours
**Commands to Execute**:
- `/backend-dev` - Database schema and models
- `/integrations` - Clerk authentication setup

**Acceptance Criteria**:
- [ ] Migrations run successfully
- [ ] User registration works
- [ ] JWT validation operational

### Session 3: Core Features
...

## Generated Documents
[List of docs created by bootstrap]

## Success Metrics
[How to verify bootstrap is complete]
```

### Developer Process for New Projects

1. **Create/Open Project Directory**
2. **Configure PRD and TRD**:
   - Fill out `docs/PRD.md` with project details
   - Configure `docs/TRD.md` with technical choices

3. **Run Bootstrap Command** (in the project directory):
   ```bash
   # In Claude Code:
   bootstrap-project --type=[client|internal-unicorn|white-label]
   ```

4. **Execute with Auto-Claude**:
   - Auto-Claude opens the project directory
   - Reads `.internal/plans/bootstrap-plan.md`
   - Executes the sessions

5. **Transition to MVP Development**:
   - Once bootstrap is complete, use `project-mvp-status`
   - New plan generated: `.internal/plans/mvp-plan.md`

### Integration with Other Commands

The project lifecycle uses plans in the same location:

```
{project}/.internal/plans/
├── bootstrap-plan.md   ← bootstrap-project generates
├── mvp-plan.md         ← project-mvp-status generates
└── roadmap-plan.md     ← project-status generates
```

All plans stay in the project. Auto-Claude reads them directly.

---

## Version History

- **v4.4.0** (Current): Simplified Auto-Claude Integration
  - Plans now stay in project directory only (no central copy)
  - Removed `$HOME/Auto-Claude/.internal/planning-tasks/` complexity
  - Auto-Claude reads directly from `{project}/.internal/plans/`
  - Simpler, no sync issues, cleaner approach
- **v4.2.0**: Three-Tier Revenue Model
  - **TIER 1**: Internal Unicorn Products (10-20%+ margin)
    - Quik Carry, Quik Car Rental, Quik Events, Quik Vibes AI
    - High-margin specialized verticals, we own & operate
    - Generates: INTERNAL_PRODUCT_SPEC.md, INVESTOR_DECK.md, GROWTH_STRATEGY.md
  - **TIER 2**: White-Label Partnerships (Each is a Unicorn)
    - **CRITICAL**: No cookie-cutter approach, every deal is custom
    - Custom revenue models: flat fee, percentage, hybrid, tiered
    - Custom terms: territory, exclusivity, product scope, support model
    - Generates: PARTNER_AGREEMENT_[NAME].md, DEAL_STRUCTURE_[NAME].md
  - **TIER 3**: Direct Client Projects (Full 7% to us)
    - DreamiHairCare, Pink-Collar-Contractors, etc.
    - Standard platform fee model, direct relationships
    - Generates: CLIENT_PROPOSAL.md, business/, ONBOARDING_CHECKLIST.md
- **v4.1.0**: External vs Internal Project Types (superseded by v4.2.0)
- **v4.0.0**: Shared ngrok + Platform Fee + Business Docs
  - Added Phase 2.5: Shared ngrok Tunnel Setup & Port Discovery
  - Enhanced Phase 1: Platform Fee Model (7%) in all client proposals
  - Enhanced Phase 9: Business Documentation Package for client delivery
  - Integrated `/Users/amenra/Native-Projects/shared-ngrok/scripts/manage-tunnels.sh`
  - Added webhook configuration for all third-party integrations
  - Business docs structure: vision, client-materials, technical-overview, presentations, infrastructure
- **v3.0.0**: PRD + Magic Patterns cohesive workflow
  - Added Phase 0: Document Validation & Magic Patterns Analysis
  - Added Phase 1: Client Proposal Generation with timeline calculation
  - Integrated TRD-TEMPLATE.md and COMPONENT_AGENT_SKILL_MAPPING.md
  - Enhanced workflow from project start to MVP launch
- **v2.0.0**: Infrastructure-first approach with immediate deployment
- **v1.0.0**: Original feature-first approach

---

**Note**: This command prioritizes getting WORKING, DEPLOYED infrastructure immediately, then builds features on top. This gives clients confidence by showing live URLs within hours, not days.

## PR Management Integration

After bootstrap completes, use PR management commands to merge feature branches:

### Merging Bootstrap PRs

```bash
# After bootstrap creates feature branches, merge to develop
/merge-to-develop --from-worktrees

# Review all pending PRs targeting develop
/merge-to-develop --all-approved

# Merge specific bootstrap PRs
/merge-to-develop 101 102 103
```

### Production Release Flow

```bash
# When ready for production, merge to main
/merge-to-main 105

# Review all approved PRs for main
/merge-to-main --all-approved
```

### Typical Bootstrap → Merge Flow

1. **Bootstrap creates infrastructure** → Commits to `feature/bootstrap-infrastructure`
2. **Create PR** → `gh pr create --base develop`
3. **Merge to develop** → `/merge-to-develop [PR_NUMBER]`
4. **Validate on develop** → Test at `https://develop.${domain}`
5. **Create release PR** → `gh pr create --base main --head develop`
6. **Merge to main** → `/merge-to-main [PR_NUMBER]`
7. **Verify production** → Test at `https://${domain}`

---

## Related Commands

For existing projects, use these commands instead:
- **`project-mvp-status`** - Track progress during MVP development (Days 1-30/60)
- **`project-status`** - Track post-MVP milestones and ongoing iteration (Day 31+)
- **`merge-to-develop`** - Merge feature PRs to develop branch
- **`merge-to-main`** - Merge release PRs to main branch (production)

This keeps `bootstrap-project` focused on NEW projects only.
