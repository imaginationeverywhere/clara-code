# Auto Claude Change Status

> **Command:** `/ac-status`
> **Version:** 1.0.0
> **Category:** Auto Claude Task Management
> **Related:** ac-start, ac-pause, ac-return, ac-done

## Overview

Directly change the status of Auto Claude tasks. This is the power-user command for managing task states, allowing any valid status transition.

## Usage

```bash
# Change task to specific status
/ac-status 005 --set in-progress
/ac-status 005 --set ai-review
/ac-status 005 --set human-review
/ac-status 005 --set done
/ac-status 005 --set planning

# Change with notes
/ac-status 005 --set ai-review --notes "Ready for automated checks"

# Bulk status change
/ac-status 005 007 009 --set human-review

# View current status
/ac-status 005

# View status history
/ac-status 005 --history

# Force status change (skip validations)
/ac-status 005 --set done --force
```

## Arguments

| Option | Description | Default |
|--------|-------------|---------|
| `TASK_ID` | Task ID(s) to update | Required |
| `--set <status>` | Target status | - |
| `--notes <text>` | Notes for the change | - |
| `--force` | Skip validation checks | false |
| `--history` | Show status history | - |
| `--assignee <name>` | Change assignee | - |

## Valid Statuses

| Status | Description | Typical Flow |
|--------|-------------|--------------|
| `planning` | Task defined, not started | Initial state |
| `in-progress` | Actively being worked on | After planning |
| `ai-review` | Automated review running | After implementation |
| `human-review` | Awaiting human approval | After AI review passes |
| `done` | Complete and merged | Final state |
| `paused` | Temporarily on hold | From in-progress |
| `blocked` | Waiting on dependency | Any state |
| `cancelled` | Task cancelled | Any state |

## Status Transition Rules

```
                    ┌──────────┐
                    │ Planning │◄────────────────┐
                    └────┬─────┘                 │
                         │                       │
                         ▼                       │
    ┌────────┐     ┌───────────┐     ┌─────────┐│
    │ Paused │◄───▶│In Progress│────▶│Blocked  ││
    └────────┘     └─────┬─────┘     └────┬────┘│
                         │                │     │
                         ▼                │     │
                    ┌──────────┐          │     │
                    │AI Review │◄─────────┘     │
                    └────┬─────┘                │
                         │ fail                 │
                         ├──────────────────────┘
                         │ pass
                         ▼
                   ┌────────────┐
                   │Human Review│
                   └─────┬──────┘
                         │ fail
                         ├──────────────────────┐
                         │ pass                 │
                         ▼                      ▼
                    ┌──────┐              ┌──────────┐
                    │ Done │              │ Planning │
                    └──────┘              └──────────┘
```

## Workflow

### Step 1: Validate Transition

```bash
# Get current status
CURRENT=$(cat .internal/tasks.json | jq -r '.tasks[] | select(.id == "005") | .status')

# Validate transition is allowed
# (unless --force is used)
```

### Step 2: Update Status

```bash
# Update local config
jq --arg status "[new-status]" --arg notes "[notes]" '
  .tasks[] |= if .id == "005" then
    .status = $status |
    .statusHistory += [{"status": $status, "at": now, "notes": $notes}]
  else . end
' .internal/tasks.json > tmp.json && mv tmp.json .internal/tasks.json

# Update GitHub labels
gh issue edit [NUMBER] \
  --remove-label "planning,in-progress,ai-review,human-review,paused,blocked" \
  --add-label "[new-status]"

# Add comment
gh issue comment [NUMBER] --body "Status changed to **[new-status]**

Notes: [notes]"
```

## Output Format

### View Status

```bash
/ac-status 005
```

```markdown
## Task Status: AC-005

### Current State
- **Status:** In Progress
- **Assignee:** manual (@yourname)
- **Since:** 2025-12-29 15:00:00 (2 hours ago)

### Task Info
- **Title:** Add donation form validation
- **Priority:** Medium
- **Labels:** frontend, validation

### Valid Transitions

| To Status | Command |
|-----------|---------|
| AI Review | `/ac-status 005 --set ai-review` |
| Paused | `/ac-status 005 --set paused` |
| Blocked | `/ac-status 005 --set blocked` |
| Planning | `/ac-status 005 --set planning` |
| Done | `/ac-status 005 --set done` |
```

### Change Status

```bash
/ac-status 005 --set ai-review --notes "Implementation complete, ready for tests"
```

```markdown
## Status Changed: AC-005

### Transition
- **From:** In Progress
- **To:** AI Review
- **Changed:** 2025-12-29 17:00:00

### Notes
Implementation complete, ready for tests

### What Happens Next

Auto Claude will run automated checks:
- ⏳ Unit tests
- ⏳ Type checking
- ⏳ Linting
- ⏳ Build verification
- ⏳ Coverage analysis

### Track Progress
```bash
/ac-ai-review | grep 005
```
```

### View History

```bash
/ac-status 005 --history
```

```markdown
## Status History: AC-005

### Timeline

| Date | Status | Duration | Notes |
|------|--------|----------|-------|
| Dec 28, 10:00 | Planning | 1 day | Task created |
| Dec 29, 10:00 | In Progress | 5 hours | Started manual work |
| Dec 29, 12:00 | Paused | 2 hours | Lunch break |
| Dec 29, 14:00 | In Progress | 3 hours | Resumed work |
| Dec 29, 17:00 | AI Review | - | Ready for tests |

### Summary
- **Total Time:** 1 day 7 hours
- **Active Time:** 8 hours
- **Paused Time:** 2 hours
- **Status Changes:** 5

### Visualization

```
Planning    ████████████████████████░░░░░░░░░░░░░░░░░░░░
In Progress ░░░░░░░░░░░░░░░░░░░░░░░░████████░░░░████████
Paused      ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██░░░░░░░░░░
AI Review   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██
            Dec 28          Dec 29                  Now
```
```

## Bulk Status Changes

```bash
/ac-status 005 007 009 --set human-review --notes "All implementations complete"
```

```markdown
## Bulk Status Change

### Tasks Updated (3)

| ID | Title | From | To |
|----|-------|------|-----|
| 005 | Donation validation | AI Review | Human Review |
| 007 | Email templates | AI Review | Human Review |
| 009 | UserService tests | AI Review | Human Review |

### Notes
All implementations complete

### Next Steps
```bash
# Review all three
/ac-human-review

# Approve all
/ac-human-review --approve-all
```
```

## Special Statuses

### Setting Blocked

```bash
/ac-status 005 --set blocked --notes "Waiting for API design decision"
```

```markdown
## Task Blocked: AC-005

### Blocked
- **Reason:** Waiting for API design decision
- **Blocked Since:** 2025-12-29 17:00:00

### Unblock When
1. Resolve the blocking issue
2. Run: `/ac-status 005 --set planning` or `/ac-status 005 --set in-progress`

### Related
- Blocking issue: [link if available]
- Blocked by tasks: [list if available]
```

### Setting Cancelled

```bash
/ac-status 005 --set cancelled --notes "Requirements changed, no longer needed"
```

```markdown
## Task Cancelled: AC-005

### Cancelled
- **Reason:** Requirements changed, no longer needed
- **Cancelled At:** 2025-12-29 17:00:00

### Cleanup
- Branch `manual/005-task-name` can be deleted
- Todo file archived

### To Restore
```bash
/ac-status 005 --set planning --notes "Restoring cancelled task"
```
```

## Force Mode

Use `--force` to skip validation checks:

```bash
/ac-status 005 --set done --force --notes "Manually verified complete"
```

**Warning:** Force mode skips:
- Transition validation
- Dependency checks
- Required field checks

Use only when you know what you're doing.

## Integration Examples

```bash
# Full workflow using ac-status

# View current state
/ac-status 005

# Start working (equivalent to /ac-start 005)
/ac-status 005 --set in-progress --assignee manual

# Need to pause (equivalent to /ac-pause 005)
/ac-status 005 --set paused --notes "Context switch"

# Resume work
/ac-status 005 --set in-progress

# Implementation done, run tests
/ac-status 005 --set ai-review --notes "Ready for automated checks"

# Tests passed, need human review
/ac-status 005 --set human-review

# Approved and merged
/ac-status 005 --set done --notes "Merged in PR #178"
```

## Related Commands

- `/ac-start` - Friendly way to start tasks
- `/ac-pause` - Friendly way to pause tasks
- `/ac-return` - Return task to Auto Claude
- `/ac-done` - Mark task complete
- `/ac-planning` - View planning tasks
- `/ac-in-progress` - View in-progress tasks
- `/ac-ai-review` - View AI review tasks
- `/ac-human-review` - View human review tasks

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-29 | Initial release |
