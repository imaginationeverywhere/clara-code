# Project Playground Command

**Version:** 1.0.0
**Category:** Project Management
**Stage:** All Stages (MVP through Post-MVP)

---

## Purpose

Generate and view the MVP Playground dashboard - a visual status dashboard that non-technical stakeholders can understand. This command regenerates project data from codebase analysis and opens the dashboard UI.

## When to Use

- Before stakeholder demos or client meetings
- During sprint reviews to show visual progress
- After significant code changes to update status
- When onboarding new team members to show project state
- Any time you want a visual overview of project health

---

## Execution

```
project-playground [options]
```

### Options

| Option | Description |
|--------|-------------|
| (none) | Full regeneration + summary |
| `--validate-first` | Run `pnpm validate:quick` before generating |
| `--open` | Open browser to `/admin/mvp-playground` after generating |
| `--json-only` | Only regenerate JSON, skip summary output |

---

## Steps

### Step 1: Regenerate Playground Data

Run the data generation script:

```bash
node scripts/generate-playground-data.js
```

This scans the codebase and generates `frontend/public/mvp-playground-data.json` with:
- Frontend page discovery (from `frontend/src/app/`)
- Backend resolver and model discovery
- TODO/FIXME/HACK scanning
- MASTER_TASKS.md parsing (if exists)
- MVP_BLOCKERS.md parsing (if exists)
- Mobile module discovery (if exists)
- Overall progress calculation

### Step 2: (Optional) Run Validation First

If `--validate-first` is specified:

```bash
pnpm validate:quick
```

This captures TypeScript and GraphQL validation results that get included in the dashboard.

### Step 3: Report Summary

Display a terminal summary of key metrics:

```
MVP Playground Data Generated
==============================
Project:          [PROJECT_NAME]
Overall Progress: [X]%
Timeline Health:  [on_track|at_risk|behind]
Web Pages:        [X] discovered
Backend Areas:    [X] discovered
TODOs Found:      [X]
Blockers:         [X] active
Last Updated:     [TIMESTAMP]

Dashboard: /admin/mvp-playground
Data File: frontend/public/mvp-playground-data.json
```

### Step 4: (Optional) Open Dashboard

If `--open` is specified and the dev server is running, open:
```
http://localhost:3000/admin/mvp-playground
```

---

## Data File Location

```
frontend/public/mvp-playground-data.json
```

This file is:
- Read by the dashboard UI at runtime via `fetch('/mvp-playground-data.json')`
- Safe to commit to git for history tracking
- Auto-generated (do not edit manually)

---

## Integration with Other Commands

This command's data generation is also triggered by:

- **`/git-commit-docs`** - Regenerates after documentation updates (Step 8.5)
- **`/project-mvp-status`** - Regenerates at end of status report
- **`/project-status`** - Regenerates at end of status report

---

## Stakeholder Access

The dashboard at `/admin/mvp-playground` is accessible to these roles:

| Role | Access |
|------|--------|
| PLATFORM_OWNER | Full access |
| SITE_OWNER | Full access |
| DEVELOPER | Full access |
| SITE_ADMIN | Full access |
| ADMIN | Full access |

In development mode (no Clerk), access is unrestricted.

---

## Related Commands

- **`project-mvp-status`** - Detailed MVP tracking (generates plans in docs/auto-claude/)
- **`project-status`** - Post-MVP milestone tracking
- **`git-commit-docs`** - Git workflow with documentation updates
- **`bootstrap-project`** - Project initialization

---

## Required Agent

- **mvp-playground-generator** - Specialized agent for codebase analysis and data generation

---

*This command is part of the Quik Nation AI Boilerplate Project Lifecycle System.*
