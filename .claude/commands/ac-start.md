# Auto Claude Start Task

> **Command:** `/ac-start`
> **Version:** 1.0.0
> **Category:** Auto Claude Task Management
> **Related:** ac-planning, ac-pause, ac-return, ac-done

## Overview

Start working on an Auto Claude task manually. This moves a task from **Planning** to **In Progress** and claims it for manual implementation, preventing Auto Claude from picking it up.

## Usage

```bash
# Start working on a specific task
/ac-start 005

# Start with notes
/ac-start 005 --notes "Working on validation logic first"

# Start and create local branch
/ac-start 005 --create-branch

# Start multiple tasks
/ac-start 005 007 009

# Start from GitHub URL context
/ac-start 005 --repo https://github.com/org/repo
```

## Arguments

| Option | Description | Default |
|--------|-------------|---------|
| `TASK_ID` | Task ID(s) to start | Required |
| `--notes <text>` | Add notes about your approach | - |
| `--create-branch` | Create git branch for task | - |
| `--no-notify` | Skip team notification | false |
| `--repo <url>` | Specify repository context | Current repo |

## Workflow

### Step 1: Validate Task

```bash
# Check task exists and is in Planning status
cat .auto-claude/tasks.json | jq '.tasks[] | select(.id == "005")'

# Verify task is not already claimed
# Check for blocking dependencies
```

### Step 2: Update Task Status

```bash
# Update local config
jq '.tasks[] |= if .id == "005" then .status = "in-progress" | .assignee = "manual" | .startedAt = now else . end' \
  .auto-claude/tasks.json > tmp.json && mv tmp.json .auto-claude/tasks.json

# Update GitHub issue label
gh issue edit [ISSUE_NUMBER] --remove-label "planning" --add-label "in-progress,manual"
```

### Step 3: Create Working Environment

```bash
# Create branch (if --create-branch)
git checkout -b manual/005-task-name

# Create local todo file
mkdir -p todo/ac-manual
cat > todo/ac-manual/005-task-name.md << 'EOF'
# AC-005: [Task Title]

## Status: In Progress (Manual)
**Started:** [timestamp]
**Assignee:** [your name]

## Task Details
[task description]

## Implementation Notes
[your notes]

## Progress
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

## When Complete
/ac-done --mark 005
EOF
```

### Step 4: Notify (Optional)

```bash
# Add comment to GitHub issue
gh issue comment [NUMBER] --body "Starting manual implementation by @[user]

Notes: [notes]"

# Slack notification (if configured)
```

## Output Format

```markdown
## Task Started: AC-005

### Task Details
- **ID:** AC-005
- **Title:** Add donation form validation
- **Previous Status:** Planning
- **New Status:** In Progress (Manual)
- **Started:** 2025-12-29 15:45:00

### Working Environment

**Branch Created:** `manual/005-donation-validation`
```bash
git checkout manual/005-donation-validation
```

**Todo File:** `todo/ac-manual/005-donation-validation.md`

### Files to Modify
- `frontend/src/components/DonationForm.tsx`
- `backend/src/resolvers/donation.resolver.ts`
- `frontend/src/utils/validation.ts`

### Quick Commands

```bash
# Check your progress
/ac-in-progress

# When complete, create PR
/create-pr --to develop --title "feat: AC-005 donation form validation"

# Mark as done
/ac-done --mark 005

# If you need to pause
/ac-pause 005

# Return to Auto Claude
/ac-return 005
```
```

## Starting Multiple Tasks

```bash
/ac-start 005 007 009
```

```markdown
## Starting 3 Tasks

### AC-005: Add donation form validation
- ✅ Status changed to In Progress
- ✅ Branch: `manual/005-donation-validation`
- ✅ Todo file created

### AC-007: Create email templates
- ✅ Status changed to In Progress
- ✅ Branch: `manual/007-email-templates`
- ✅ Todo file created

### AC-009: Add unit tests for UserService
- ✅ Status changed to In Progress
- ✅ Branch: `manual/009-userservice-tests`
- ✅ Todo file created

### Summary
- **Started:** 3 tasks
- **Branches:** 3 created
- **Todo Files:** 3 created

### View Your In Progress Tasks
```bash
/ac-in-progress
```
```

## Dependency Check

If task has dependencies:

```markdown
## ⚠️ Dependency Warning: AC-006

Task AC-006 has dependencies that are not complete:

| Dependency | Status | Blocking |
|------------|--------|----------|
| AC-004 | In Progress | Yes |
| AC-003 | AI Review | No (almost done) |

### Options

1. **Wait for dependencies:**
   ```bash
   /ac-in-progress  # Monitor AC-004
   ```

2. **Start anyway (not recommended):**
   ```bash
   /ac-start 006 --ignore-deps
   ```

3. **Start a different task:**
   ```bash
   /ac-planning  # Find unblocked tasks
   ```
```

## Integration with Other Commands

```bash
# View what's available to start
/ac-planning

# Start a task
/ac-start 005

# Check your progress
/ac-in-progress

# Pause if needed
/ac-pause 005

# Resume later
/ac-start 005  # (resumes paused task)

# Complete the task
/create-pr --to develop
/ac-done --mark 005
```

## Best Practices

1. **Check dependencies first** - Use `/ac-planning` to see blockers
2. **Add meaningful notes** - Help yourself and team understand approach
3. **Create branches** - Keep work isolated
4. **Update progress** - Keep todo file current
5. **Communicate** - Let team know what you're working on

## Related Commands

- `/ac-planning` - View available tasks
- `/ac-pause` - Pause work on a task
- `/ac-return` - Return task to Auto Claude
- `/ac-done` - Mark task complete
- `/ac-in-progress` - View active tasks

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-29 | Initial release |
