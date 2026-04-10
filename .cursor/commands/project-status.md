# Project Status Command

**Version:** 2.2.0 (Simplified Auto-Claude Integration)
**Category:** Project Management
**Stage:** Post-MVP (Day 31+)

---

## Purpose

Track post-MVP milestones and **generate all future tasks** for the project. This command provides visibility into completed MVP deliverables, Phase 2+ roadmap, technical debt, performance metrics, and continuous improvement planning.

## Generated Files

This command generates/updates the following files in `docs/auto-claude/`:

| File | Purpose |
|------|---------|
| `ROADMAP_TASKS.md` | **ALL future tasks** - Phase 2+ features from pattern-mappings.json |
| `TECHNICAL_DEBT.md` | Technical debt register with prioritization |
| `QUARTERLY_PLAN.md` | Current quarter objectives and tasks |
| `MAINTENANCE_TASKS.md` | Ongoing maintenance and support tasks |
| `REVENUE_TRACKING.md` | Platform fee revenue projections and actuals |

## When to Use

- After MVP launch (Day 31+)
- Sprint planning for post-MVP features
- Quarterly business reviews
- Technical debt assessments
- Performance reviews
- Client roadmap discussions
- Feature prioritization

---

## Execution

```
project-status [options]
```

### Options

| Option | Description |
|--------|-------------|
| `--full` | Complete status with all sections |
| `--quick` | Quick summary dashboard |
| `--roadmap` | Phase 2+ feature roadmap |
| `--debt` | Technical debt register |
| `--metrics` | Performance and business metrics |
| `--health` | System health assessment |
| `--retro` | Last milestone retrospective |
| `--client-report` | Client-facing status report |
| `--export [format]` | Export to markdown, json, or pdf |

---

## Status Dashboard Structure

### 1. Project Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   PROJECT STATUS DASHBOARD                   │
├─────────────────────────────────────────────────────────────┤
│  Project: [PROJECT_NAME]                                     │
│  MVP Launch: [LAUNCH_DATE]    Current Phase: [PHASE_NAME]   │
│  Days Since Launch: [DAYS]    Active Users: [COUNT]         │
│                                                              │
│  System Health: 🟢 Healthy  │  Tech Debt: 🟡 Moderate       │
│                                                              │
│  Current Sprint: [SPRINT_NUMBER]                            │
│  Sprint Goal: [GOAL_DESCRIPTION]                            │
└─────────────────────────────────────────────────────────────┘
```

### 2. MVP Completion Certification

```typescript
interface MVPCertification {
  completedDate: string;
  signedOffBy: string;

  deliverables: {
    item: string;
    status: 'delivered' | 'partial' | 'deferred';
    notes?: string;
  }[];

  acceptance: {
    criticalFeatures: boolean;
    performanceTargets: boolean;
    securityAudit: boolean;
    clientSignOff: boolean;
  };

  supportPeriod: {
    startDate: string;
    endDate: string;
    status: 'active' | 'completed';
    issuesResolved: number;
  };
}
```

**MVP Completion Summary:**

| Deliverable | Status | Notes |
|-------------|--------|-------|
| User Authentication | ✅ Delivered | Clerk integration |
| Product Catalog | ✅ Delivered | All features complete |
| Shopping Cart | ✅ Delivered | Persistence working |
| Checkout Flow | ✅ Delivered | Stripe payments live |
| Admin Dashboard | ✅ Delivered | Full user management |
| Email Notifications | ⚠️ Partial | Templates pending |

### 3. Phase 2+ Roadmap

```typescript
interface Roadmap {
  phases: {
    phase: string;
    name: string;
    description: string;
    status: 'completed' | 'in-progress' | 'planned' | 'backlog';
    startDate?: string;
    targetDate?: string;
    features: {
      name: string;
      priority: 'critical' | 'high' | 'medium' | 'low';
      status: string;
      estimate: string;
    }[];
  }[];

  upcomingMilestones: {
    milestone: string;
    targetDate: string;
    dependencies: string[];
  }[];
}
```

**Roadmap Visualization:**

```
MVP (Complete) ──→ Phase 2 (Current) ──→ Phase 3 (Planned) ──→ Phase 4 (Backlog)
    ✅                  🔄                    📅                   📋

Phase 2: Enhanced Features (Q1 2025)
├── Advanced Search & Filtering
├── Wishlist Functionality
├── Email Marketing Integration
└── Performance Optimizations

Phase 3: Mobile App (Q2 2025)
├── iOS App Development
├── Android App Development
├── Push Notifications
└── Mobile-specific Features

Phase 4: Scale & Optimize (Q3 2025)
├── Multi-region Deployment
├── Advanced Analytics
├── AI-powered Recommendations
└── API Partner Integrations
```

### 4. Technical Debt Register

```typescript
interface TechnicalDebt {
  items: {
    id: string;
    category: 'code' | 'architecture' | 'testing' | 'documentation' | 'security' | 'performance';
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    effort: 'small' | 'medium' | 'large' | 'epic';
    impact: string;
    recommendation: string;
    status: 'identified' | 'scheduled' | 'in-progress' | 'resolved';
    targetSprint?: string;
  }[];

  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    resolvedThisQuarter: number;
  };

  debtScore: number; // 0-100, lower is better
  trend: 'improving' | 'stable' | 'worsening';
}
```

**Technical Debt Summary:**

| Category | Count | Trend |
|----------|-------|-------|
| Code Quality | 3 | 🟢 Improving |
| Architecture | 1 | 🟡 Stable |
| Testing | 5 | 🔴 Needs Attention |
| Documentation | 2 | 🟢 Improving |
| Security | 0 | 🟢 Clear |
| Performance | 2 | 🟡 Stable |

**High Priority Items:**

| ID | Description | Effort | Target |
|----|-------------|--------|--------|
| TD-001 | Add integration tests for checkout flow | Medium | Sprint 5 |
| TD-002 | Refactor product service for better caching | Large | Sprint 6 |
| TD-003 | Update deprecated Clerk SDK methods | Small | Sprint 5 |

### 5. Performance Metrics

```typescript
interface PerformanceMetrics {
  web: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
    ttfb: number; // Time to First Byte
    lighthouse: number; // Overall score
    trend: 'improving' | 'stable' | 'declining';
  };

  api: {
    avgResponseTime: number;
    p95ResponseTime: number;
    errorRate: number;
    uptime: number;
  };

  database: {
    avgQueryTime: number;
    slowQueries: number;
    connectionPoolUsage: number;
  };

  business: {
    dailyActiveUsers: number;
    monthlyActiveUsers: number;
    conversionRate: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
}
```

**Performance Dashboard:**

```
╔══════════════════════════════════════════════════════════════╗
║                    PERFORMANCE METRICS                        ║
╠════════════════════╦════════════════════╦════════════════════╣
║   WEB VITALS       ║   API HEALTH       ║   BUSINESS         ║
╠════════════════════╬════════════════════╬════════════════════╣
║ LCP:  1.8s ✅      ║ Avg: 145ms ✅      ║ DAU: 1,234         ║
║ FID:  45ms ✅      ║ P95: 380ms ✅      ║ MAU: 12,450        ║
║ CLS:  0.05 ✅      ║ Errors: 0.1% ✅    ║ Conv: 3.2%         ║
║ TTFB: 180ms ✅     ║ Uptime: 99.9% ✅   ║ Bounce: 42%        ║
╚════════════════════╩════════════════════╩════════════════════╝
```

### 6. System Health

```typescript
interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';

  services: {
    name: string;
    status: 'operational' | 'degraded' | 'down';
    lastCheck: string;
    uptime: number;
  }[];

  infrastructure: {
    component: string;
    status: string;
    utilization: number;
    alerts: string[];
  }[];

  security: {
    vulnerabilities: number;
    lastSecurityScan: string;
    complianceStatus: string;
  };

  recentIncidents: {
    date: string;
    severity: string;
    description: string;
    resolution: string;
    postMortem?: string;
  }[];
}
```

**System Health Dashboard:**

| Service | Status | Uptime |
|---------|--------|--------|
| Frontend (Amplify) | 🟢 Operational | 99.99% |
| Backend (EC2) | 🟢 Operational | 99.95% |
| Database (Neon) | 🟢 Operational | 99.99% |
| Authentication (Clerk) | 🟢 Operational | 99.99% |
| Payments (Stripe) | 🟢 Operational | 99.99% |
| Email (SendGrid) | 🟡 Degraded | 99.50% |

### 7. Client Feedback Tracking

```typescript
interface ClientFeedback {
  items: {
    id: string;
    date: string;
    source: 'meeting' | 'email' | 'support' | 'survey';
    category: 'feature-request' | 'bug-report' | 'praise' | 'concern';
    summary: string;
    priority: 'high' | 'medium' | 'low';
    status: 'new' | 'reviewed' | 'planned' | 'completed' | 'declined';
    response?: string;
    linkedIssue?: string;
  }[];

  sentiment: {
    overall: 'positive' | 'neutral' | 'negative';
    trend: 'improving' | 'stable' | 'declining';
    npsScore?: number;
  };
}
```

**Recent Feedback:**

| Date | Category | Summary | Status |
|------|----------|---------|--------|
| Dec 15 | Feature Request | Advanced reporting dashboard | Planned (Phase 3) |
| Dec 12 | Praise | Checkout flow very smooth | N/A |
| Dec 10 | Bug Report | Mobile image not loading | Resolved |
| Dec 8 | Feature Request | Bulk product upload | Backlog |

### 8. Next Milestone Planning

```typescript
interface NextMilestone {
  name: string;
  targetDate: string;
  description: string;

  objectives: string[];

  features: {
    name: string;
    owner: string;
    estimate: string;
    status: string;
  }[];

  dependencies: {
    item: string;
    status: string;
    owner: string;
  }[];

  risks: {
    risk: string;
    mitigation: string;
  }[];

  successCriteria: string[];
}
```

**Next Milestone: Phase 2 Launch (Q1 2025)**

**Objectives:**
- [ ] Launch advanced search functionality
- [ ] Implement wishlist feature
- [ ] Integrate email marketing (Klaviyo)
- [ ] Achieve 95+ Lighthouse score

**Key Features:**

| Feature | Owner | Estimate | Status |
|---------|-------|----------|--------|
| Faceted Search | Team | 2 weeks | Not Started |
| Wishlist | Team | 1 week | Not Started |
| Klaviyo Integration | Team | 1 week | Research |

**Success Criteria:**
- Search results returned in <500ms
- Wishlist sync across devices
- Email campaign click-through rate >5%

---

## Output Formats

### Quick Dashboard (Default)

```
╔══════════════════════════════════════════════════════════════╗
║              [PROJECT_NAME] PROJECT STATUS                    ║
╠══════════════════════════════════════════════════════════════╣
║  Phase: Post-MVP (Phase 2)  │  Days Since Launch: 45         ║
╠══════════════════════════════════════════════════════════════╣
║  SYSTEM HEALTH: 🟢 Healthy  │  TECH DEBT: 🟡 13 items        ║
║  UPTIME: 99.95%             │  ERROR RATE: 0.1%              ║
╠══════════════════════════════════════════════════════════════╣
║  CURRENT SPRINT (5):                                          ║
║  • Advanced search implementation (60%)                       ║
║  • Wishlist backend complete (100%)                          ║
║  • Klaviyo research (40%)                                    ║
╠══════════════════════════════════════════════════════════════╣
║  NEXT MILESTONE: Phase 2 Launch │ Target: Jan 31, 2025       ║
╚══════════════════════════════════════════════════════════════╝
```

### Client Report Format

```markdown
# [PROJECT_NAME] - Quarterly Status Report
**Report Date:** [DATE]
**Reporting Period:** Q[X] 2025

## Executive Summary
[High-level status for executive stakeholders]

## Key Metrics
- Active Users: [NUMBER]
- System Uptime: [PERCENTAGE]
- Customer Satisfaction: [SCORE]

## Accomplishments This Quarter
- [Major accomplishment 1]
- [Major accomplishment 2]

## Roadmap Progress
[Visual roadmap with completed/upcoming phases]

## Planned for Next Quarter
- [Plan 1]
- [Plan 2]

## Investment Summary
[If applicable - development hours, infrastructure costs]

## Recommendations
[Strategic recommendations for client consideration]
```

---

## Integration with Project Lifecycle

```
bootstrap-project → project-mvp-status → project-status
      │                    │                    │
      │                    │                    │
   Inception          MVP Dev              Post-MVP
   (Day 0)          (Days 1-30)          (Day 31+)
                                              │
                                    ┌─────────┴─────────┐
                                    │                   │
                               Iterations          Maintenance
                             (Phase 2, 3...)      (Long-term)
```

**Entry Criteria from MVP:**

1. MVP launch complete
2. All critical features delivered
3. Client sign-off received
4. 30-day support period ended (or completed early)
5. Post-mortem conducted

---

## Example Usage

```bash
# Quick status check
project-status --quick

# Full status report
project-status --full

# View roadmap only
project-status --roadmap

# Technical debt assessment
project-status --debt

# Performance metrics
project-status --metrics

# System health check
project-status --health

# Client quarterly report
project-status --client-report --export pdf

# Last milestone retrospective
project-status --retro
```

---

## Data Sources

The command gathers status from:

1. **`docs/auto-claude/MASTER_TASKS.md`** - PRIMARY SOURCE: Task definitions, completion status, agent assignments
2. **`.claude/config/pattern-mappings.json`** - Pattern configuration, platform fee calculations
3. **`docs/PRD.md`** - Original requirements baseline
4. **`docs/CLIENT_PROPOSAL.md`** - Milestones and deliverables
5. **`CHANGELOG.md`** - Release history
6. **Git History** - Development activity
7. **Linear/Project Management** - Issue tracking
8. **Monitoring Systems** - Performance and health data
9. **Analytics** - Business metrics (GA4)

### MASTER_TASKS.md Integration for Post-MVP

The command reads MASTER_TASKS.md to track ongoing work:

```javascript
// 1. Parse completed MVP tasks for certification
const mvpTasks = parseMasterTasks('docs/auto-claude/MASTER_TASKS.md');
const mvpComplete = mvpTasks.every(t => t.phase <= 5 && t.status === 'completed');

// 2. Identify Phase 2+ tasks from pattern.features.recommended
const phase2Tasks = mvpTasks.filter(t => t.phase > 5);

// 3. Track technical debt by analyzing incomplete optional tasks
const technicalDebt = mvpTasks.filter(t =>
  t.status !== 'completed' &&
  t.priority !== 'P0' &&
  t.priority !== 'P1'
);

// 4. Calculate platform fee revenue projection
const patternMappings = require('.claude/config/pattern-mappings.json');
const pattern = patternMappings.patterns[project.mockupTemplateChoice];
const monthlyPlatformRevenue =
  pattern.platformFee.estimatedMonthlyGMV.typical *
  (pattern.platformFee.default / 100);
```

### Roadmap Task Structure

Phase 2+ tasks are added to MASTER_TASKS.md as the project progresses:

```markdown
## Phase 6: Enhanced Features (Days 31-60)

### TASK-025: Advanced Search & Filtering

**Status**: [ ] Not Started
**Priority**: P2 (Medium)
**Timeline**: Days 31-35

#### Assignment
- **Command**: `/frontend-dev`
- **Primary Agent**: `shadcn-ui-specialist`
- **Supporting Agents**: `graphql-apollo-frontend`, `postgresql-database-architect`
- **Required Skills**: `admin-panel-standard`

...
```

---

## Plan File Structures

When `project-status` runs, it generates/updates these files in `docs/auto-claude/`:

### ROADMAP_TASKS.md Structure

**Purpose:** Generate ALL future tasks from pattern-mappings.json

```markdown
# ROADMAP_TASKS.md - [PROJECT_NAME]

> **Generated**: [DATE]
> **Pattern**: [MOCKUP_TEMPLATE_CHOICE]
> **Source**: pattern.features.recommended + pattern.features.advanced

---

## Future Task Generation

Tasks are generated from pattern-mappings.json:

```javascript
// 1. Load pattern configuration
const pattern = patternMappings.patterns[mockupTemplateChoice];

// 2. Generate Phase 2+ tasks from recommended features
const phase2Tasks = pattern.features.recommended.map((feature, index) => ({
  taskId: `TASK-${100 + index}`,
  phase: 6, // Phase 6: Enhanced Features
  name: feature,
  priority: 'P2',
  command: determineCommand(feature),
  agents: determineAgents(feature, pattern.agents),
  skills: determineSkills(feature, pattern.skills),
}));

// 3. Generate Phase 3+ tasks from advanced features
const phase3Tasks = pattern.features.advanced.map((feature, index) => ({
  taskId: `TASK-${200 + index}`,
  phase: 7, // Phase 7: Advanced Features
  name: feature,
  priority: 'P3',
  command: determineCommand(feature),
  agents: determineAgents(feature, pattern.agents),
  skills: determineSkills(feature, pattern.skills),
}));
```

---

## Phase 6: Enhanced Features (Days 31-60)

> **Source**: pattern.features.recommended

### TASK-101: [Recommended Feature 1]

**Status**: [ ] Not Started
**Priority**: P2 (Medium)
**Timeline**: Days 31-35
**Source**: pattern.features.recommended[0]

#### Assignment
- **Command**: `/[determined-command]`
- **Primary Agent**: `[from pattern.agents.primary]`
- **Supporting Agents**: `[from pattern.agents.secondary]`
- **Required Skills**: `[from pattern.skills.recommended]`

#### Description
[Feature description from pattern]

#### Acceptance Criteria
- [ ] Criterion from pattern definition
- [ ] Performance requirements met
- [ ] Tests added with 80%+ coverage

#### Platform Fee Impact
- **Revenue Component**: [Yes/No]
- **Additional Revenue**: [If applicable]

---

### TASK-102: [Recommended Feature 2]
...

---

## Phase 7: Advanced Features (Days 61-90)

> **Source**: pattern.features.advanced

### TASK-201: [Advanced Feature 1]

**Status**: [ ] Not Started
**Priority**: P3 (Low)
**Timeline**: Days 61-70
**Source**: pattern.features.advanced[0]

#### Assignment
- **Command**: `/[determined-command]`
- **Primary Agent**: `[from pattern.agents.primary]`
- **Supporting Agents**: `[from pattern.agents.secondary]`
- **Required Skills**: `[from pattern.skills.optional]`

...

---

## Phase 8: Scale & Optimize (Days 91+)

> **Source**: Client feedback + technical requirements

### TASK-301: Performance Optimization
- **Command**: `/backend-dev`
- **Primary Agent**: `nodejs-runtime-optimizer`
- **Skills**: `database-query-optimization-standard`

### TASK-302: Multi-Region Deployment
- **Command**: `/deploy-ops`
- **Primary Agent**: `aws-cloud-services-orchestrator`
- **Skills**: `aws-deployment-standard`

---

## Task Summary by Command

| Command | Task Count | Priority Range |
|---------|------------|----------------|
| `/frontend-dev` | [X] | P2-P3 |
| `/backend-dev` | [X] | P2-P3 |
| `/integrations` | [X] | P2-P3 |
| `/deploy-ops` | [X] | P3 |
| `/test-automation` | [X] | P2-P3 |

---

## Agent Workload Projection

| Agent | Phase 6 Tasks | Phase 7 Tasks | Total |
|-------|---------------|---------------|-------|
| shadcn-ui-specialist | [X] | [X] | [X] |
| graphql-apollo-frontend | [X] | [X] | [X] |
| stripe-connect-specialist | [X] | [X] | [X] |
| ...

---

## Revenue Impact Summary

| Feature | Phase | Estimated Monthly Revenue |
|---------|-------|---------------------------|
| [Feature with payment impact] | 6 | $[X] |
| [Feature with payment impact] | 7 | $[X] |
| **Total Additional Revenue** | | **$[X]/month** |
```

---

### TECHNICAL_DEBT.md Structure

**Purpose:** Track and prioritize technical debt items

```markdown
# TECHNICAL_DEBT.md - [PROJECT_NAME]

> **Generated**: [DATE]
> **Debt Score**: [0-100] (lower is better)
> **Trend**: [improving | stable | worsening]

---

## Summary Dashboard

| Category | Count | Trend | Action Required |
|----------|-------|-------|-----------------|
| Code Quality | [X] | 🟢/🟡/🔴 | [Yes/No] |
| Architecture | [X] | 🟢/🟡/🔴 | [Yes/No] |
| Testing | [X] | 🟢/🟡/🔴 | [Yes/No] |
| Documentation | [X] | 🟢/🟡/🔴 | [Yes/No] |
| Security | [X] | 🟢/🟡/🔴 | [Yes/No] |
| Performance | [X] | 🟢/🟡/🔴 | [Yes/No] |

---

## Critical Items (Immediate Action)

### TD-001: [Description]

**Category**: [code | architecture | testing | documentation | security | performance]
**Severity**: Critical
**Effort**: [small | medium | large | epic]
**Status**: [identified | scheduled | in-progress | resolved]

#### Impact
[What happens if not addressed]

#### Recommendation
[How to fix]

#### Assignment
- **Command**: `/[command]`
- **Agent**: `[agent-name]`
- **Target Sprint**: [Sprint X]

---

## High Priority Items

### TD-002: [Description]
...

---

## Debt Reduction Plan

| Sprint | Items to Address | Estimated Effort |
|--------|------------------|------------------|
| Sprint [X] | TD-001, TD-003 | [X] story points |
| Sprint [X+1] | TD-002, TD-004 | [X] story points |

---

## Metrics History

| Date | Total Items | Critical | Debt Score |
|------|-------------|----------|------------|
| [Date] | [X] | [X] | [X] |
| [Date] | [X] | [X] | [X] |
```

---

### QUARTERLY_PLAN.md Structure

**Purpose:** Current quarter objectives and tasks

```markdown
# QUARTERLY_PLAN.md - [PROJECT_NAME]

> **Quarter**: Q[X] [YEAR]
> **Generated**: [DATE]
> **Status**: [On Track | At Risk | Behind]

---

## Quarter Objectives

### Objective 1: [Business Objective]
**Key Results:**
- [ ] KR1: [Measurable result]
- [ ] KR2: [Measurable result]
- [ ] KR3: [Measurable result]

**Related Tasks:**
| Task ID | Description | Command | Agent | Status |
|---------|-------------|---------|-------|--------|
| TASK-[X] | [Desc] | `/[cmd]` | `[agent]` | [ ] |

---

### Objective 2: [Technical Objective]
...

---

## Sprint Breakdown

### Sprint [X] (Weeks 1-2)
**Goal**: [Sprint goal]

| Task | Command | Agent | Priority | Status |
|------|---------|-------|----------|--------|
| [Task] | `/frontend-dev` | `shadcn-ui-specialist` | P1 | [ ] |

### Sprint [X+1] (Weeks 3-4)
...

---

## Resource Allocation

| Agent | Sprint [X] | Sprint [X+1] | Sprint [X+2] |
|-------|------------|--------------|--------------|
| shadcn-ui-specialist | 3 tasks | 2 tasks | 4 tasks |
| stripe-connect-specialist | 1 task | 2 tasks | 0 tasks |

---

## Dependencies & Risks

| Dependency | Owner | Status | Impact if Delayed |
|------------|-------|--------|-------------------|
| [External API] | [Owner] | [Status] | [Impact] |

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk] | [H/M/L] | [H/M/L] | [Plan] |

---

## Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Feature Completion | 100% | [X]% | 🟢/🟡/🔴 |
| Test Coverage | 80%+ | [X]% | 🟢/🟡/🔴 |
| Performance Score | 95+ | [X] | 🟢/🟡/🔴 |
```

---

### MAINTENANCE_TASKS.md Structure

**Purpose:** Ongoing maintenance and support tasks

```markdown
# MAINTENANCE_TASKS.md - [PROJECT_NAME]

> **Generated**: [DATE]
> **Active Maintenance Items**: [X]
> **Next Scheduled Maintenance**: [DATE]

---

## Recurring Maintenance

### Weekly Tasks

| Task | Command | Agent | Schedule | Last Run |
|------|---------|-------|----------|----------|
| Dependency updates | `/devops` | `boilerplate-update-manager` | Monday | [Date] |
| Security scan | `/test-automation` | `testing-automation-agent` | Wednesday | [Date] |
| Performance check | `/backend-dev` | `nodejs-runtime-optimizer` | Friday | [Date] |

### Monthly Tasks

| Task | Command | Agent | Schedule | Last Run |
|------|---------|-------|----------|----------|
| Full backup verification | `/deploy-ops` | `aws-cloud-services-orchestrator` | 1st | [Date] |
| SSL certificate check | `/deploy-ops` | `aws-cloud-services-orchestrator` | 15th | [Date] |
| Database optimization | `/backend-dev` | `postgresql-database-architect` | 20th | [Date] |

### Quarterly Tasks

| Task | Command | Agent | Schedule | Last Run |
|------|---------|-------|----------|----------|
| Infrastructure audit | `/deploy-ops` | `aws-cloud-services-orchestrator` | Q start | [Date] |
| Security audit | `/test-automation` | `testing-automation-agent` | Q start | [Date] |
| Performance baseline | `/backend-dev` | `nodejs-runtime-optimizer` | Q start | [Date] |

---

## Active Support Tickets

| ID | Issue | Priority | Command | Agent | Status |
|----|-------|----------|---------|-------|--------|
| SUP-[X] | [Issue] | [P1/P2/P3] | `/debug-fix` | `app-troubleshooter` | [Status] |

---

## Upcoming Maintenance Windows

| Date | Duration | Type | Impact | Tasks |
|------|----------|------|--------|-------|
| [Date] | [X] hours | Planned | [Low/Med/High] | [Tasks] |

---

## SLA Compliance

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Uptime | 99.9% | [X]% | 🟢/🟡/🔴 |
| P1 Response | <1 hour | [X] | 🟢/🟡/🔴 |
| P2 Response | <4 hours | [X] | 🟢/🟡/🔴 |
```

---

### REVENUE_TRACKING.md Structure

**Purpose:** Platform fee revenue projections and actuals

```markdown
# REVENUE_TRACKING.md - [PROJECT_NAME]

> **Generated**: [DATE]
> **Pattern**: [MOCKUP_TEMPLATE_CHOICE]
> **Platform Fee**: [X]%

---

## Platform Fee Configuration

```javascript
// From .claude/config/pattern-mappings.json
const platformFee = {
  default: [X], // percentage
  byTier: {
    selfService: [X],
    guidedCustom: [X],
    fullCustom: [X],
    enterprise: [X]
  },
  estimatedMonthlyGMV: {
    low: [X],
    typical: [X],
    high: [X]
  }
};
```

---

## Revenue Projections

### By GMV Scenario

| Scenario | Monthly GMV | Platform Fee ([X]%) | Annual Revenue |
|----------|-------------|---------------------|----------------|
| Conservative | $[low] | $[X] | $[X] |
| Typical | $[typical] | $[X] | $[X] |
| Optimistic | $[high] | $[X] | $[X] |

### By Service Tier

| Tier | Fee Rate | Est. GMV | Monthly Revenue |
|------|----------|----------|-----------------|
| Self-Service | [X]% | $[X] | $[X] |
| Guided Custom | [X]% | $[X] | $[X] |
| Full Custom | [X]% | $[X] | $[X] |
| Enterprise | [X]% | $[X] | $[X] |

---

## Actual Revenue (Monthly)

| Month | GMV | Platform Fee | Transactions | Avg Order |
|-------|-----|--------------|--------------|-----------|
| [Month] | $[X] | $[X] | [X] | $[X] |
| [Month] | $[X] | $[X] | [X] | $[X] |

---

## Revenue by Feature

| Feature | Task ID | Status | Est. Monthly Revenue |
|---------|---------|--------|---------------------|
| Primary Checkout | TASK-004 | ✅ Live | $[X] |
| Subscription Billing | TASK-105 | [ ] Planned | $[X] |
| Marketplace Fees | TASK-106 | [ ] Planned | $[X] |

---

## Growth Projections

| Quarter | Projected GMV | Projected Revenue | Growth % |
|---------|---------------|-------------------|----------|
| Q[X] | $[X] | $[X] | - |
| Q[X+1] | $[X] | $[X] | [X]% |
| Q[X+2] | $[X] | $[X] | [X]% |
| Q[X+3] | $[X] | $[X] | [X]% |

---

## Stripe Connect Dashboard

**Live Data Source:** Stripe Dashboard → Connect → Platform Revenue

```javascript
// Stripe API to fetch actual revenue
const platformRevenue = await stripe.applicationFees.list({
  created: { gte: startOfMonth, lte: endOfMonth }
});

const totalRevenue = platformRevenue.data.reduce(
  (sum, fee) => sum + fee.amount, 0
) / 100; // Convert cents to dollars
```

---

## Revenue Alerts

| Alert | Threshold | Current | Status |
|-------|-----------|---------|--------|
| Monthly GMV below target | <$[X] | $[X] | 🟢/🟡/🔴 |
| Failed transactions spike | >5% | [X]% | 🟢/🟡/🔴 |
| Refund rate high | >3% | [X]% | 🟢/🟡/🔴 |
```

---

## Auto-Claude Integration

**Version 2.2.0**: Simplified Auto-Claude integration - plans stay in the project directory.

### How It Works

Auto-Claude runs from `$HOME/Auto-Claude` but works directly on the project directory. Plans are stored **in the project itself** - no copying to a central location needed.

```
Auto-Claude Location:  $HOME/Auto-Claude/
Project Location:      {project-path}/
Plan Location:         {project-path}/.auto-claude/plans/roadmap-plan.md
```

### Plan Location

When `project-status` runs, it generates the roadmap plan directly in the project:

```
{project}/.auto-claude/plans/
├── mvp-plan.md        ← From project-mvp-status (if exists)
└── roadmap-plan.md    ← Auto-Claude reads this directly
```

**That's it.** No copying, no central directory, no sync issues.

### Post-MVP Plan Structure

The generated `roadmap-plan.md` follows this format:

```markdown
# Roadmap Plan - [PROJECT_NAME]

## Project Context
- **Project Path**: {full-path-to-project}
- **Project Type**: [client | internal-unicorn | white-label]
- **MVP Status**: Completed
- **Current Phase**: [Phase 2/3/4...]

## Phase Objectives
[Current phase goals and key results]

## Execution Sessions

### Session 1: [Feature/Enhancement Name]
**Duration**: [estimated time]
**Commands to Execute**:
- `/frontend-dev` - [specific task]
- `/backend-dev` - [specific task]
- `/integrations` - [specific task]

**Acceptance Criteria**:
- [ ] Criterion 1
- [ ] Criterion 2

### Session 2: [Feature/Enhancement Name]
...

## Technical Debt Items
[Items from TECHNICAL_DEBT.md to address]

## Revenue Impact
[Features that affect platform fee revenue]
```

### Developer Process

1. **Run Project Status Command** (in the project directory):
   ```bash
   # In Claude Code:
   project-status --full
   ```

2. **Review Generated Plans**:
   - Roadmap tasks: `docs/auto-claude/ROADMAP_TASKS.md`
   - Quarterly plan: `docs/auto-claude/QUARTERLY_PLAN.md`
   - Execution plan: `.auto-claude/plans/roadmap-plan.md`

3. **Execute with Auto-Claude**:
   - Auto-Claude opens the project directory
   - Reads `.auto-claude/plans/roadmap-plan.md`
   - Executes the sessions

4. **Monitor Progress**:
   - Re-run `project-status` to track feature completion
   - Plan updates with current progress

---

## PR Management Integration

Post-MVP, use PR management commands for ongoing feature releases:

### Phase 2+ Feature Releases

```bash
# Merge completed Phase 2 feature PRs
/merge-to-develop 301 302 303

# Merge all approved PRs for develop
/merge-to-develop --all-approved
```

### Production Releases

```bash
# Create release PR for Phase 2
gh pr create --base main --head develop --title "Phase 2 Release v1.1.0"

# Merge release to main
/merge-to-main [PR_NUMBER]

# Emergency hotfix flow
gh pr create --base main --head hotfix/critical-bug
/merge-to-main --dry-run [PR_NUMBER]  # Review first
/merge-to-main [PR_NUMBER]            # Then merge
```

### PR Metrics in Project Status

The status dashboard includes PR velocity metrics:

```typescript
interface PRMetrics {
  openPRs: number;
  avgMergeTime: number; // hours
  mergedThisMonth: number;
  prsByAuthor: Record<string, number>;
  blockedPRs: number;
  stalePRs: number; // >7 days without activity
}
```

### Roadmap PR Tracking

Phase 2+ tasks link to PRs:

| Task | PR | Status | Merged |
|------|-----|--------|--------|
| TASK-101: Advanced Search | #301 | Approved | - |
| TASK-102: Wishlist | #302 | In Review | - |
| TASK-103: Email Marketing | - | Not Started | - |

---

## MVP Playground Dashboard Integration

**Final Step: Regenerate Playground Dashboard**

After generating all status reports, roadmap tasks, and plans, regenerate the MVP Playground data:

```bash
node scripts/generate-playground-data.js
```

This updates the visual dashboard at `/admin/mvp-playground` with the latest project status. The dashboard is accessible to PLATFORM_OWNER, SITE_OWNER, DEVELOPER, SITE_ADMIN, and ADMIN roles.

Skip silently if `scripts/generate-playground-data.js` does not exist.

---

## Related Commands

- **`bootstrap-project`** - Project initialization (Stage 1)
- **`project-mvp-status`** - MVP development tracking (Stage 2)
- **`project-playground`** - Visual status dashboard generation
- **`process-todos`** - Development workflow
- **`update-todos`** - Progress sync
- **`merge-to-develop`** - Merge feature PRs to develop branch
- **`merge-to-main`** - Merge release PRs to main branch (production)

---

## Required Agents

- **plan-mode-orchestrator** - Roadmap planning
- **project-management-bridge** - Linear/PM tool integration
- **business-analyst-bridge** - Client reporting
- **google-analytics-implementation-specialist** - Business metrics

---

*This command is part of the Quik Nation AI Boilerplate Project Lifecycle System.*
