# /ship — Run the Full Pipeline

**The Pipeline:** Granville → Maya → Nikki → Agents → Gary → Fannie Lou → Granville merges.

End-to-end: from requirements to merged code. One command.

## Usage
```
/ship "Add booking confirmation emails to QCR"
/ship --from-plan .claude/plans/qcr-email-plan.md
/ship --heru qcr --story "Booking confirmation emails"
/ship --dry-run                                # Preview the pipeline without executing
```

## Arguments
- `<requirement>` (required) — What needs to be built
- `--from-plan <path>` — Start from an existing plan (skip Granville's architecture step)
- `--heru <name>` — Target Heru project
- `--story <name>` — Story-level scope
- `--dry-run` — Show what would happen without executing
- `--skip-review` — Skip Gary's review (emergencies only, requires confirmation)

## The Pipeline

### Phase 1: Requirements (Granville - Opus)
- Analyze the requirement
- Make architecture decisions
- Write or update plan in `.claude/plans/`
- Define acceptance criteria

### Phase 2: Task Planning (Maya - Sonnet)
- Read Granville's plan
- Break into implementation tasks
- Write prioritized work queue to `/tmp/maat-workqueue.md`
- Select which coding agents are needed

### Phase 3: Dispatch (Nikki - Haiku)
- Read Maya's work queue
- Dispatch Cursor agents (max 4 concurrent)
- Monitor progress via status files
- Auto-fix simple issues (lint, types)
- Escalate blockers

### Phase 4: Execution (Coding Agents - Cursor)
- Write code following the plan
- Run type-checks and tests
- Commit, push, create PR
- Write completion status files

### Phase 5: Review (Gary - Opus)
- Review every PR with `[Opus Review]` tag
- Check code quality, security, patterns
- Validate against acceptance criteria
- Approve or send back with feedback

### Phase 6: Validation (Fannie Lou - Opus)
- Validate deliverable against acceptance criteria
- Run on Amen Ra's local machine
- Approve or reject with actionable feedback

### Phase 7: Merge (Granville - Opus)
- Final merge approval
- Merge to develop
- Update tracking

## Guardrails
- Agents MUST create PRs (no direct commits to develop/main)
- Gary reviews EVERY PR before merge
- Tester bugs bypass the queue (immediate priority)
- Max 4 concurrent Cursor agents
- Internal Herus → QC1, Client Herus → EC2

## Related Commands
- `/gran` — Talk to Granville (Phase 1)
- `/maat-workqueue` — Maya's planning step (Phase 2)
- `/nikki` — Nikki's dispatch status (Phase 3)
- `/gary` — Gary's review queue (Phase 5)
- `/fannie-lou` — Fannie Lou's validation (Phase 6)
- `/dispatch-agent` — Manual dispatch (bypass queue)
