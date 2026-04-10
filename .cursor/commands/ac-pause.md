# Auto Claude Pause Task

> **Command:** `/ac-pause`
> **Version:** 1.0.0
> **Category:** Auto Claude Task Management
> **Related:** ac-start, ac-return, ac-in-progress

## Overview

Pause work on an Auto Claude task you've been working on manually. The task remains assigned to you but is marked as paused, allowing you to context-switch without losing progress.

## Usage

```bash
# Pause a specific task
/ac-pause 005

# Pause with reason
/ac-pause 005 --reason "Waiting for design review"

# Pause with expected resume time
/ac-pause 005 --resume-after "2025-12-30"

# Pause multiple tasks
/ac-pause 005 007

# Pause all your in-progress tasks
/ac-pause --all
```

## Arguments

| Option | Description | Default |
|--------|-------------|---------|
| `TASK_ID` | Task ID(s) to pause | Required (unless --all) |
| `--reason <text>` | Reason for pausing | - |
| `--resume-after <date>` | Expected resume date | - |
| `--all` | Pause all your in-progress tasks | - |
| `--no-notify` | Skip team notification | false |

## Workflow

### Step 1: Validate Task

```bash
# Check task is in-progress and assigned to you
cat .auto-claude/tasks.json | jq '.tasks[] | select(.id == "005" and .status == "in-progress" and .assignee == "manual")'
```

### Step 2: Save Progress State

```bash
# Commit any uncommitted work
git add .
git stash save "AC-005 paused: [reason]"

# Or commit with WIP message
git commit -m "WIP: AC-005 [task name] - paused"
```

### Step 3: Update Task Status

```bash
# Update local config
jq '.tasks[] |= if .id == "005" then .status = "paused" | .pausedAt = now | .pauseReason = "[reason]" else . end' \
  .auto-claude/tasks.json > tmp.json && mv tmp.json .auto-claude/tasks.json

# Update GitHub issue
gh issue edit [NUMBER] --add-label "paused"
gh issue comment [NUMBER] --body "⏸️ Paused: [reason]"
```

### Step 4: Update Todo File

```bash
# Update local todo file
cat >> todo/ac-manual/005-task-name.md << 'EOF'

## Paused
**Date:** [timestamp]
**Reason:** [reason]
**Resume After:** [date]

### Progress at Pause
- [x] Completed step 1
- [x] Completed step 2
- [ ] In progress: step 3

### Notes for Resume
[context to help when resuming]
EOF
```

## Output Format

```markdown
## Task Paused: AC-005

### Status Change
- **Previous:** In Progress (Manual)
- **New:** Paused
- **Paused At:** 2025-12-29 16:30:00

### Reason
Waiting for design review feedback on validation UX

### Progress Saved
- **Branch:** `manual/005-donation-validation`
- **Uncommitted Changes:** Stashed (stash@{0})
- **Todo File:** Updated with pause notes

### Resume Instructions

When ready to continue:
```bash
# Resume the task
/ac-start 005

# Or return to Auto Claude
/ac-return 005
```

### Your Paused Tasks

| ID | Title | Paused | Resume After |
|----|-------|--------|--------------|
| 005 | Donation validation | Just now | 2025-12-30 |

View all: `/ac-in-progress --paused`
```

## Pausing Multiple Tasks

```bash
/ac-pause 005 007 --reason "Focusing on urgent bug fix"
```

```markdown
## Paused 2 Tasks

### AC-005: Add donation form validation
- ✅ Status: Paused
- 📝 Progress stashed

### AC-007: Create email templates
- ✅ Status: Paused
- 📝 Progress stashed

### Reason
Focusing on urgent bug fix

### Resume Later
```bash
/ac-start 005 007  # Resume both
/ac-start 005      # Resume one
```
```

## Pause All (--all)

```bash
/ac-pause --all --reason "End of day"
```

```markdown
## Paused All Your Tasks

### Tasks Paused (3)

| ID | Title | Progress | Stashed |
|----|-------|----------|---------|
| 005 | Donation validation | 60% | ✅ |
| 007 | Email templates | 30% | ✅ |
| 009 | UserService tests | 80% | ✅ |

### Reason
End of day

### Tomorrow
```bash
# View your paused tasks
/ac-in-progress --paused

# Resume all
/ac-start 005 007 009

# Or resume one at a time
/ac-start 005
```
```

## Viewing Paused Tasks

```bash
/ac-in-progress --paused
```

```markdown
## Your Paused Tasks

| ID | Title | Paused | Reason | Resume After |
|----|-------|--------|--------|--------------|
| 005 | Donation validation | 2h ago | Design review | Dec 30 |
| 007 | Email templates | 2h ago | End of day | - |

### Actions

```bash
# Resume specific task
/ac-start 005

# Return task to Auto Claude
/ac-return 005

# View pause details
/ac-pause --info 005
```
```

## Auto-Pause Warnings

If you've been inactive on a task:

```markdown
## ⚠️ Inactivity Warning: AC-005

Task AC-005 has had no commits for **48 hours**.

### Options

1. **Continue working:**
   ```bash
   # Make a commit to show activity
   git commit --allow-empty -m "WIP: AC-005 still in progress"
   ```

2. **Pause explicitly:**
   ```bash
   /ac-pause 005 --reason "Blocked on external dependency"
   ```

3. **Return to Auto Claude:**
   ```bash
   /ac-return 005
   ```
```

## Integration with Other Commands

```bash
# Start a task
/ac-start 005

# Work on it...

# Need to switch context? Pause it
/ac-pause 005 --reason "Urgent bug needs attention"

# Work on something else...

# Come back later
/ac-start 005  # Resumes from where you left off

# Or let Auto Claude finish it
/ac-return 005
```

## Best Practices

1. **Always provide a reason** - Helps you remember why you paused
2. **Set resume date if known** - Creates reminder
3. **Commit or stash changes** - Don't lose work
4. **Update todo file** - Document your progress and context
5. **Don't pause indefinitely** - Either resume or return to Auto Claude

## Related Commands

- `/ac-start` - Start or resume a task
- `/ac-return` - Return task to Auto Claude
- `/ac-in-progress` - View active and paused tasks
- `/ac-planning` - View available tasks

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-29 | Initial release |
