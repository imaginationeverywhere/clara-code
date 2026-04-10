# Project MVP Status Command

**Version:** 2.2.0 (Simplified Auto-Claude Integration)
**Category:** Project Management
**Stage:** MVP Development (Days 1-30/60)

---

## Purpose

Track progress during MVP development phase and **generate MVP progress plans** in `docs/auto-claude/`. This command provides a comprehensive view of what has been accomplished toward the MVP and what remains, including blockers, risks, and timeline health.

## Generated Files

This command generates/updates the following files in `docs/auto-claude/`:

| File | Purpose |
|------|---------|
| `MVP_PROGRESS.md` | Current MVP phase tracking with daily updates |
| `MVP_BLOCKERS.md` | Active blockers and resolution plans |
| `MVP_SPRINT_PLAN.md` | Current sprint tasks and priorities |
| `MVP_DEMO_CHECKLIST.md` | Demo preparation and readiness |

## When to Use

- During active MVP development (after `bootstrap-project`, before MVP launch)
- Daily standups and progress checks
- Sprint planning and reviews
- Client progress updates
- Risk assessment and mitigation

---

## Execution

```
project-mvp-status [options]
```

### Options

| Option | Description |
|--------|-------------|
| `--full` | Complete status report with all sections |
| `--quick` | Quick summary dashboard only |
| `--blockers` | Focus on blockers and risks |
| `--timeline` | Timeline and deadline analysis |
| `--demo` | Demo readiness assessment |
| `--client-report` | Generate client-facing progress report |
| `--export [format]` | Export to markdown, json, or pdf |

---

## Status Dashboard Structure

### 1. Progress Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    MVP PROGRESS DASHBOARD                    │
├─────────────────────────────────────────────────────────────┤
│  Project: [PROJECT_NAME]                                     │
│  Start Date: [START_DATE]     Target MVP: [MVP_DATE]        │
│  Current Day: [DAY_NUMBER] of [TOTAL_DAYS]                  │
│                                                              │
│  ████████████████████░░░░░░░░░░  67% Complete               │
│                                                              │
│  Timeline Health: 🟢 On Track | 🟡 At Risk | 🔴 Behind      │
└─────────────────────────────────────────────────────────────┘
```

### 2. Phase Progress Breakdown

```typescript
interface MVPPhaseProgress {
  phases: {
    phase: string;
    status: 'completed' | 'in-progress' | 'not-started' | 'blocked';
    percentComplete: number;
    plannedDays: number;
    actualDays: number;
    variance: number;
  }[];
}
```

**Standard MVP Phases:**

| Phase | Days | Status | Progress |
|-------|------|--------|----------|
| **Phase 1: Infrastructure** | 1-3 | ✅ | 100% |
| **Phase 2: Authentication** | 4-7 | ✅ | 100% |
| **Phase 3: Core Features** | 8-21 | 🔄 | 65% |
| **Phase 4: Payments/Integrations** | 22-26 | ⏳ | 0% |
| **Phase 5: Testing & QA** | 27-28 | ⏳ | 0% |
| **Phase 6: Production Launch** | 29-30 | ⏳ | 0% |

### 3. Feature Completion Matrix

Track features from PRD against implementation status:

```typescript
interface FeatureStatus {
  features: {
    id: string;
    name: string;
    prdSection: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    status: 'completed' | 'in-progress' | 'not-started' | 'blocked' | 'deferred';
    percentComplete: number;
    assignedTo?: string;
    blockers?: string[];
    notes?: string;
  }[];
  summary: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    blocked: number;
    deferred: number;
  };
}
```

**Example Output:**

| Feature | Priority | Status | Progress | Notes |
|---------|----------|--------|----------|-------|
| User Registration | Critical | ✅ | 100% | Clerk integration complete |
| Product Catalog | Critical | 🔄 | 80% | Filtering pending |
| Shopping Cart | Critical | 🔄 | 60% | Redux-persist configured |
| Checkout Flow | Critical | ⏳ | 0% | Waiting on Stripe setup |
| Admin Dashboard | High | 🔄 | 40% | User management done |
| Email Notifications | Medium | ⏳ | 0% | SendGrid pending |

### 4. Blockers and Risks

```typescript
interface BlockersAndRisks {
  blockers: {
    id: string;
    description: string;
    severity: 'critical' | 'high' | 'medium';
    affectedFeatures: string[];
    owner: string;
    createdDate: string;
    targetResolution: string;
    status: 'active' | 'resolved' | 'escalated';
    resolutionPlan?: string;
  }[];
  risks: {
    id: string;
    description: string;
    probability: 'high' | 'medium' | 'low';
    impact: 'high' | 'medium' | 'low';
    mitigation: string;
    status: 'monitoring' | 'mitigating' | 'resolved';
  }[];
}
```

**Risk Matrix:**

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Stripe integration delay | Medium | High | Start integration early, have fallback |
| Scope creep | High | Medium | Strict PRD adherence |
| Third-party API rate limits | Low | Medium | Implement caching |

### 5. Timeline Health Analysis

```typescript
interface TimelineHealth {
  originalMVPDate: string;
  currentProjectedDate: string;
  varianceDays: number;
  status: 'on-track' | 'at-risk' | 'behind' | 'ahead';

  criticalPath: {
    task: string;
    deadline: string;
    status: string;
    slack: number; // days of buffer
  }[];

  burndown: {
    planned: number[];  // story points per day
    actual: number[];
  };

  velocityTrend: 'increasing' | 'stable' | 'decreasing';
}
```

**Timeline Indicators:**

- 🟢 **On Track**: Within 2 days of planned schedule
- 🟡 **At Risk**: 3-5 days behind, recoverable
- 🔴 **Behind**: 5+ days behind, needs intervention

### 6. Demo Readiness

```typescript
interface DemoReadiness {
  nextDemoDate: string;
  demoType: 'internal' | 'client' | 'stakeholder';

  readiness: {
    userFlows: {
      flow: string;
      status: 'ready' | 'partial' | 'not-ready';
      notes: string;
    }[];
    environments: {
      env: string;
      url: string;
      status: 'operational' | 'issues' | 'down';
    }[];
    testData: 'seeded' | 'partial' | 'missing';
    knownIssues: string[];
  };

  recommendation: string;
}
```

**Demo Checklist:**

- [ ] Development environment accessible
- [ ] Test accounts created
- [ ] Sample data seeded
- [ ] Critical user flows working
- [ ] Known issues documented
- [ ] Fallback plan ready

### 7. Sprint/Week Focus

```typescript
interface SprintFocus {
  currentSprint: number;
  sprintGoal: string;

  thisWeek: {
    focusAreas: string[];
    keyDeliverables: string[];
    dependencies: string[];
  };

  nextWeek: {
    plannedWork: string[];
    prerequisites: string[];
  };
}
```

---

## Data Sources

The command gathers status from:

1. **`docs/auto-claude/MASTER_TASKS.md`** - PRIMARY SOURCE: Task definitions with command/agent/skill assignments
2. **`docs/PRD.md`** - Feature requirements and acceptance criteria
3. **`.claude/config/pattern-mappings.json`** - Pattern configuration, agents, skills, platform fees
4. **`docs/CLIENT_PROPOSAL.md`** - Timeline and milestones (if generated)
5. **`todo/`** - Local task tracking
6. **Git History** - Recent commits and activity
7. **Linear/Project Management** - Issue status (when integrated)
8. **Deployment Status** - Environment health checks

### MASTER_TASKS.md Integration

The command reads MASTER_TASKS.md to:

```javascript
// 1. Parse task status from MASTER_TASKS.md
const tasks = parseMasterTasks('docs/auto-claude/MASTER_TASKS.md');

// 2. Calculate phase progress
const phases = {
  foundation: tasks.filter(t => t.phase === 1).map(t => t.status),
  coreFeatures: tasks.filter(t => t.phase === 2).map(t => t.status),
  integrations: tasks.filter(t => t.phase === 3).map(t => t.status),
  testing: tasks.filter(t => t.phase === 4).map(t => t.status),
  launch: tasks.filter(t => t.phase === 5).map(t => t.status),
};

// 3. Extract command/agent assignments for resource tracking
const agentWorkload = tasks.reduce((acc, task) => {
  const agent = task.primaryAgent;
  acc[agent] = (acc[agent] || []).concat(task);
  return acc;
}, {});

// 4. Calculate platform fee progress
const paymentTasks = tasks.filter(t => t.platformFeeImpact === true);
const paymentProgress = calculateProgress(paymentTasks);
```

### Task Status Mapping

| MASTER_TASKS Status | MVP Status |
|---------------------|------------|
| `[ ] Not Started` | ⏳ Not Started |
| `[~] In Progress` | 🔄 In Progress |
| `[x] Completed` | ✅ Completed |
| `[!] Blocked` | 🚫 Blocked |

---

## Plan File Generation

### MVP_PROGRESS.md Structure

```markdown
# MVP Progress - [PROJECT_NAME]

> **Generated**: [DATE]
> **Day**: [X] of [TOTAL]
> **Status**: 🟢 On Track | 🟡 At Risk | 🔴 Behind

---

## Phase Progress

| Phase | Status | Progress | Tasks |
|-------|--------|----------|-------|
| Phase 1: Foundation | ✅ Complete | 100% | 5/5 |
| Phase 2: Core Features | 🔄 In Progress | 65% | 8/12 |
| Phase 3: Integrations | ⏳ Not Started | 0% | 0/6 |
| Phase 4: Testing | ⏳ Not Started | 0% | 0/4 |
| Phase 5: Launch | ⏳ Not Started | 0% | 0/3 |

---

## Today's Focus

### In Progress Tasks
[List of current tasks from MASTER_TASKS.md with [~] status]

### Completed Today
[Tasks completed today]

### Blocked
[Tasks with [!] status and resolution plans]

---

## This Sprint (Week [X])

### Sprint Goal
[Sprint objective]

### Sprint Tasks
[Tasks scheduled for this sprint]

### Dependencies
[External dependencies affecting sprint]

---

## Platform Fee Progress

| Payment Feature | Status | Revenue Impact |
|-----------------|--------|----------------|
| Stripe Connect Setup | ✅ | Enabling |
| Checkout Flow | 🔄 65% | $[X]/month projected |
| Subscription Billing | ⏳ | $[X]/month projected |

**Projected Monthly Revenue**: $[X] (at [pattern.platformFee.estimatedMonthlyGMV.typical] GMV)
```

### MVP_SPRINT_PLAN.md Structure

```markdown
# Sprint [X] Plan - [PROJECT_NAME]

> **Sprint Dates**: [START] - [END]
> **Sprint Goal**: [GOAL]

---

## Sprint Backlog

### Priority 1 (Must Complete)

| Task | Command | Agent | Status |
|------|---------|-------|--------|
| TASK-007: Checkout Flow | /integrations | stripe-connect-specialist | 🔄 |
| TASK-008: Order Confirmation | /frontend-dev | shadcn-ui-specialist | ⏳ |

### Priority 2 (Should Complete)

| Task | Command | Agent | Status |
|------|---------|-------|--------|
| TASK-009: Email Notifications | /integrations | twilio-flex-communication-manager | ⏳ |

### Stretch Goals

| Task | Command | Agent | Status |
|------|---------|-------|--------|
| TASK-012: Advanced Filtering | /frontend-dev | graphql-apollo-frontend | ⏳ |

---

## Agent Workload

| Agent | Assigned Tasks | Capacity |
|-------|----------------|----------|
| stripe-connect-specialist | 2 | 🟡 |
| shadcn-ui-specialist | 4 | 🔴 High |
| graphql-apollo-frontend | 1 | 🟢 |

---

## Sprint Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Stripe approval delay | Medium | High | Start early, have backup |
```

---

## Output Formats

### Quick Dashboard (Default)

```
╔══════════════════════════════════════════════════════════════╗
║              [PROJECT_NAME] MVP STATUS                        ║
╠══════════════════════════════════════════════════════════════╣
║  Day 18 of 30  │  🟢 On Track  │  67% Complete                ║
╠══════════════════════════════════════════════════════════════╣
║  COMPLETED: 12 features  │  IN PROGRESS: 5  │  REMAINING: 8  ║
║  BLOCKERS: 1 active      │  RISKS: 2 monitoring              ║
╠══════════════════════════════════════════════════════════════╣
║  THIS WEEK FOCUS:                                             ║
║  • Complete shopping cart persistence                         ║
║  • Start Stripe checkout integration                          ║
║  • Admin user management                                      ║
╠══════════════════════════════════════════════════════════════╣
║  NEXT DEMO: Friday │ Status: Ready with caveats              ║
╚══════════════════════════════════════════════════════════════╝
```

### Client Report Format

Generates a professional client-facing report:

```markdown
# [PROJECT_NAME] - Progress Report
**Report Date:** [DATE]
**Reporting Period:** Week [X] of [Y]

## Executive Summary
[High-level progress summary suitable for non-technical stakeholders]

## Milestone Progress
[Visual timeline with completed/upcoming milestones]

## Key Accomplishments This Week
- [Accomplishment 1]
- [Accomplishment 2]

## Planned for Next Week
- [Plan 1]
- [Plan 2]

## Items Requiring Attention
[Any blockers or decisions needed from client]

## Demo Access
- Development: [URL]
- Test Accounts: [Credentials]
```

---

## Integration with Project Lifecycle

```
bootstrap-project → project-mvp-status → project-status
      │                    │                    │
      │                    │                    │
   Inception          MVP Dev              Post-MVP
   (Day 0)          (Days 1-30)          (Day 31+)
```

**Transition Criteria to `project-status`:**

1. All critical features completed (100%)
2. Production deployment successful
3. Client sign-off received
4. 30-day support period begins

---

## Example Usage

```bash
# Quick status check
project-mvp-status --quick

# Full status report
project-mvp-status --full

# Generate client report
project-mvp-status --client-report --export markdown

# Focus on blockers
project-mvp-status --blockers

# Check demo readiness
project-mvp-status --demo

# Timeline analysis
project-mvp-status --timeline
```

---

## Auto-Claude Integration

**Version 2.2.0**: Simplified Auto-Claude integration - plans stay in the project directory.

### How It Works

Auto-Claude runs from `$HOME/Auto-Claude` but works directly on the project directory. Plans are stored **in the project itself** - no copying to a central location needed.

```
Auto-Claude Location:  $HOME/Auto-Claude/
Project Location:      {project-path}/
Plan Location:         {project-path}/.auto-claude/plans/mvp-plan.md
```

### Plan Location

When `project-mvp-status` runs, it generates the MVP plan directly in the project:

```
{project}/.auto-claude/plans/
└── mvp-plan.md    ← Auto-Claude reads this directly
```

**That's it.** No copying, no central directory, no sync issues.

### Auto-Claude Plan Structure

The generated `mvp-plan.md` follows this format:

```markdown
# MVP Completion Plan - [PROJECT_NAME]

## Project Context
- **Project Path**: {full-path-to-project}
- **Project Type**: [client | internal-unicorn]
- **Current Completion**: [X]%
- **Target MVP Date**: [DATE]

## Execution Sessions

### Session 1: [Phase Name]
**Duration**: [estimated time]
**Commands to Execute**:
- `/backend-dev` - [specific task]
- `/frontend-dev` - [specific task]

**Acceptance Criteria**:
- [ ] Criterion 1
- [ ] Criterion 2

### Session 2: [Phase Name]
...

## Critical Blockers
[List of blockers that must be resolved]

## Success Metrics
[How to verify MVP is complete]
```

### Developer Process

1. **Run MVP Status Command** (in the project directory):
   ```bash
   # In Claude Code:
   project-mvp-status --full
   ```

2. **Review Generated Plan**:
   - Status dashboard: `docs/auto-claude/MVP_PROGRESS.md`
   - Execution plan: `.auto-claude/plans/mvp-plan.md`

3. **Execute with Auto-Claude**:
   - Auto-Claude opens the project directory
   - Reads `.auto-claude/plans/mvp-plan.md`
   - Executes the sessions

4. **Monitor Progress**:
   - Re-run `project-mvp-status` to track completion
   - Plan updates with current progress

---

## PR Management Integration

During MVP development, use PR management commands to merge feature branches:

### Checking PR Status

```bash
# List all open PRs for this project
gh pr list --state open

# Check status of worktree branches
/merge-to-develop --dry-run --from-worktrees
```

### Merging Feature PRs to Develop

```bash
# Merge completed feature PRs
/merge-to-develop 201 202 203

# Merge all approved PRs targeting develop
/merge-to-develop --all-approved

# Merge from completed worktrees (Auto-Claude branches)
/merge-to-develop --from-worktrees
```

### MVP Release to Production

When MVP is ready for launch:

```bash
# Create release PR from develop to main
gh pr create --base main --head develop --title "MVP Release v1.0.0"

# Review and merge to main
/merge-to-main [PR_NUMBER]

# Or merge all approved main PRs
/merge-to-main --all-approved
```

### PR Metrics in MVP Status

The MVP status dashboard includes:
- **Pending PRs**: Count of open PRs blocking progress
- **Ready to Merge**: PRs with approvals and passing CI
- **Blocked PRs**: PRs with conflicts or failing checks

```typescript
interface MVPPRMetrics {
  pending: number;
  readyToMerge: number;
  blocked: number;
  mergedThisWeek: number;
  avgTimeToMerge: number; // hours
}
```

---

## MVP Playground Dashboard Integration

**Final Step: Regenerate Playground Dashboard**

After generating all status reports and plans, regenerate the MVP Playground data:

```bash
node scripts/generate-playground-data.js
```

This updates the visual dashboard at `/admin/mvp-playground` with the latest project status. The dashboard is accessible to PLATFORM_OWNER, SITE_OWNER, DEVELOPER, SITE_ADMIN, and ADMIN roles.

Skip silently if `scripts/generate-playground-data.js` does not exist.

---

## Related Commands

- **`bootstrap-project`** - Project initialization (Stage 1)
- **`project-status`** - Post-MVP milestone tracking (Stage 3)
- **`project-playground`** - Visual status dashboard generation
- **`process-todos`** - Development workflow
- **`update-todos`** - Progress sync
- **`merge-to-develop`** - Merge feature PRs to develop branch
- **`merge-to-main`** - Merge release PRs to main branch (production)

---

## Required Agents

- **plan-mode-orchestrator** - Progress analysis and planning
- **project-management-bridge** - Linear/PM tool integration
- **business-analyst-bridge** - Client reporting

---

*This command is part of the Quik Nation AI Boilerplate Project Lifecycle System.*
