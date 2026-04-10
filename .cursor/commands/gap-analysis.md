# gap-analysis - Deep Hybrid Progress Analysis

Deep analysis comparing micro plans against actual code, git history, and acceptance criteria. For quick checks, use `/progress`.

**Agent:** `progress-tracker`

## Usage
```
/gap-analysis --epic 16                    # Deep scan one epic
/gap-analysis --story 16.10               # Single story deep-dive
/gap-analysis --feature payments           # Cross-cutting keyword across all epics
/gap-analysis --all                        # Full platform deep scan
/gap-analysis --epic 16 --stakeholder      # Clean report for external audience
/gap-analysis --epic 16 --save             # Save report to docs/gap-analysis/
/gap-analysis --all --quick                # Summary only (skip file-level detail)
```

## Arguments
- `--epic <number>` — Deep scan a single epic (01-16)
- `--story <epic.story>` — Single story deep-dive (e.g., 16.10)
- `--feature <keyword>` — Cross-cutting feature across all epics
- `--all` — Full platform scan (all 16 epics)
- `--stakeholder` — Clean report: no file paths, plain English, executive summary
- `--save` — Save report to `docs/gap-analysis/YYYY-MM-DD-<scope>.md`
- `--quick` — Summary dashboard only (skip per-file detail)

## How the Hybrid Engine Works

### Layer 1: Plan Scan
Parse `.claude/plans/micro/*.md` and extract for each story:
- Story ID, title, description
- Expected files (file paths in code blocks, bullet lists, "New Files" sections)
- Acceptance criteria (checkbox items under "Acceptance Criteria" headings)
- Dependencies on other stories (mentioned in dependency sections)
- Epic-level context (title, category, execution phase)

### Layer 2: Code Scan
For each expected file:
```bash
# Check existence
test -f <filepath>

# If exists, inspect content for key patterns mentioned in acceptance criteria
# e.g., if criteria says "PaymentRouter routes by geography"
# grep for "PaymentRouter" and "geography" in the file
```

Scoring:
- File exists + key patterns found = IMPLEMENTED
- File exists but missing key patterns = PARTIAL
- File does not exist = MISSING

### Layer 3: Git Scan
```bash
# Search commits for story references and feature keywords
git log --oneline --all --grep="<story-keyword>" --since="2026-01-01"

# Check branch activity
git branch -a | grep -i "<feature-keyword>"

# Find last activity date for relevant files
git log -1 --format="%ai" -- <filepath>
```

Extract:
- Number of commits mentioning the feature/story
- Last activity date
- Which branches have relevant work
- Contributors

### Layer 4: Cross-Reference

For each story, determine status:

| Status | Criteria |
|--------|----------|
| **DONE** | 90%+ files exist, key acceptance patterns found, git commits confirm |
| **PARTIAL** | Some files exist (20-89%), or files exist but missing key patterns |
| **NOT STARTED** | <20% files exist, no relevant git activity |
| **BLOCKED** | Dependencies (other stories) not yet DONE |
| **READY** | NOT STARTED but all dependencies are DONE — can be assigned now |

### Layer 5: Recommendations

For each incomplete story, generate:
- **Assignment recommendation**: "Send to Cursor" (grunt work) vs "Needs Opus" (complex integration)
  - Cursor indicators: scaffolding, CRUD, UI components, standard patterns
  - Opus indicators: AWS CLI, webhook setup, 3rd party API integration, complex architecture
- **Effort estimate**: Small (1-2 hours), Medium (half day), Large (full day), Epic (multi-day)
- **Priority**: Based on execution phase and dependency chain

## Output Formats

### Epic View (`--epic 16`)
```
EPIC 16: Auset Platform Activation
Progress: ####          38% (5/12 stories)
Last Activity: 2026-03-07 (today)

  Story | Title                    | Status      | Gap        | Assignee
  16.1  | Activation API           | PARTIAL     | 3 files    | Cursor
  16.2  | Dynamic Schema           | DONE        | —          | —
  16.3  | Dynamic Routes           | DONE        | —          | —
  16.4  | Migration Runner         | DONE        | —          | —
  16.5  | CLI Commands             | PARTIAL     | 1 cmd      | Cursor
  16.6  | Feature Dashboard        | NOT YET     | 8 files    | Cursor
  16.7  | QuikCarRental Extract    | DONE        | —          | —
  16.8  | Feature Generator        | DONE        | —          | —
  16.9  | Auth/Anpu                | PARTIAL     | 2 files    | Cursor
  16.10 | Payments/Sobek           | READY       | 9 files    | Cursor+Opus
  16.11 | Notifications/Seshat     | NOT YET     | 7 files    | Cursor
  16.12 | Frontend Feature System  | READY       | 6 files    | Cursor

  GAPS: 36 files missing | 7 stories need work
  READY TO START: 16.6, 16.10, 16.12 (no blockers)
  BLOCKED: None
  GIT: 23 commits this week touching features/
```

### Story Deep-Dive (`--story 16.10`)
```
STORY 16.10: Payments/Sobek — Dual Provider System
Status: READY (all dependencies met)

EXPECTED FILES:
  [exists]  backend/src/features/core/payments/feature.config.ts
  [exists]  backend/src/features/core/payments/index.ts
  [MISSING] backend/src/features/core/payments/payment-router.ts
  [MISSING] backend/src/features/core/payments/stripe-provider.ts
  [MISSING] backend/src/features/core/payments/yapit-provider.ts
  [MISSING] backend/src/features/core/payments/yapit-webhooks.ts
  [MISSING] backend/src/features/core/payments/payments.service.ts
  [MISSING] backend/src/features/core/payments/schema.graphql
  [MISSING] backend/src/features/core/payments/resolvers.ts
  [MISSING] backend/src/features/core/payments/routes.ts
  [MISSING] backend/src/features/core/payments/migrations/001_create_payments_tables.ts

ACCEPTANCE CRITERIA:                          MET?
  PaymentRouter routes by geography           [NO]
  YapitProvider implements Money In/Out       [NO]
  StripeProvider wraps existing Connect       [NO]
  Dual webhook endpoints                      [NO]
  Provider health monitoring                  [NO]
  Fallback routing on provider failure        [NO]
  Unit tests >80% coverage                    [NO]
  Migration creates payments tables           [NO]
  Environment variables validated             [NO]

GIT ACTIVITY: 0 commits mentioning "yapit" or "payment-router"
DEPENDENCIES: 16.1 (PARTIAL), 16.2 (DONE), 16.3 (DONE)
EFFORT: Large (full day)
ASSIGNMENT: Cursor (scaffolding) + Opus (Yapit API integration, webhook setup)

RECOMMENDATION: Ready to assign. Start with Cursor for scaffolding
payment-router.ts, stripe-provider.ts, yapit-provider.ts structure.
Then Opus handles Yapit API integration and webhook verification.
```

### Stakeholder Report (`--stakeholder`)
```markdown
# Auset Platform — Gap Analysis Report
**Date:** [DATE]
**Prepared for:** Stakeholders

## Executive Summary
[Plain English summary of where things stand]

## What's Working
[Bullet points of completed capabilities]

## What's Missing
[Bullet points of gaps, no file paths, business language]

## Recommended Next Steps
[Numbered priority list with business justification]

## Timeline Assessment
[Velocity-based projection of completion]

## Risk Factors
[Dependencies, blockers, complexity flags]
```

### Save Report (`--save`)
Saves to `docs/gap-analysis/YYYY-MM-DD-<scope>.md`:
```bash
mkdir -p docs/gap-analysis
# Epic: docs/gap-analysis/2026-03-07-epic-16.md
# Story: docs/gap-analysis/2026-03-07-story-16-10.md
# Feature: docs/gap-analysis/2026-03-07-feature-payments.md
# All: docs/gap-analysis/2026-03-07-full-platform.md
```

## Data Sources
- `.claude/plans/micro/*.md` — Plan files (stories, acceptance criteria, expected files)
- `.claude/plans/micro/00-master-plan-index.md` — Execution phases and dependencies
- Codebase — File existence and content pattern matching
- Git history — Commits, branches, activity dates
- `backend/src/features/` — Feature module structure

## Performance
- Target: 15-30 seconds for single epic, 60-90 seconds for `--all`
- Git operations are the bottleneck; plan/code scans are fast
- `--quick` flag skips per-file detail for faster results

## Comparison with Other Status Commands

| Aspect | `/progress` | `/gap-analysis` | `/project-mvp-status` |
|--------|------------|-----------------|----------------------|
| Speed | 2-5 sec | 15-90 sec | 10-20 sec |
| Scope | Epic/feature | Story-level | Whole project |
| Code scan | File existence | File + content | PRD features |
| Git analysis | None | Full history | Recent commits |
| Acceptance criteria | No | Yes | No |
| Stakeholder mode | No | Yes | Yes |
| Data source | Micro plans | Micro plans | PRD + MASTER_TASKS |
| Recommendations | Next epic | Per-story assignment | Sprint focus |

## Related Commands
- `/progress` — Quick dashboard (2-5 seconds)
- `/project-mvp-status` — Project-level MVP tracking
- `/project-status` — Post-MVP milestone tracking
- `/commands` — Find the right command for your current work
