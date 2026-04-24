# Auto Claude Return Task

> **Command:** `/ac-return`
> **Version:** 1.0.0
> **Category:** Auto Claude Task Management
> **Related:** ac-start, ac-pause, ac-planning

## Overview

Return a task to Auto Claude for automated completion. Use this when you've taken a task manually but want Auto Claude to finish it, or when you need to hand off work.

## Usage

```bash
# Return a task to Auto Claude
/ac-return 005

# Return with context/notes for Auto Claude
/ac-return 005 --notes "Completed validation logic, needs tests"

# Return with partial progress
/ac-return 005 --progress 60

# Return to specific status
/ac-return 005 --to planning
/ac-return 005 --to ai-review

# Return multiple tasks
/ac-return 005 007

# Return and preserve your branch
/ac-return 005 --keep-branch
```

## Arguments

| Option | Description | Default |
|--------|-------------|---------|
| `TASK_ID` | Task ID(s) to return | Required |
| `--notes <text>` | Context/notes for Auto Claude | - |
| `--progress <percent>` | Percentage complete | 0 |
| `--to <status>` | Target status | planning |
| `--keep-branch` | Don't delete manual branch | false |
| `--preserve-changes` | Push changes before returning | true |

## Workflow

### Step 1: Preserve Your Work

```bash
# Commit any changes
git add .
git commit -m "WIP: AC-005 partial progress - returning to Auto Claude"

# Push branch (if not pushed)
git push -u origin manual/005-task-name
```

### Step 2: Document Progress

```bash
# Update todo file with handoff notes
cat >> todo/ac-manual/005-task-name.md << 'EOF'

## Returned to Auto Claude
**Date:** [timestamp]
**Progress:** 60%
**Notes:** [handoff notes]

### Completed
- [x] Validation logic for amount field
- [x] Email format validation
- [x] Error message display

### Remaining
- [ ] Server-side validation
- [ ] Unit tests
- [ ] Integration tests
EOF
```

### Step 3: Update Task Status

```bash
# Update local config
jq '.tasks[] |= if .id == "005" then
  .status = "planning" |
  .assignee = "agent" |
  .returnedAt = now |
  .progress = 60 |
  .handoffNotes = "[notes]"
else . end' .internal/tasks.json > tmp.json && mv tmp.json .internal/tasks.json

# Update GitHub
gh issue edit [NUMBER] --remove-label "in-progress,manual,paused" --add-label "planning"
gh issue comment [NUMBER] --body "↩️ Returned to Auto Claude

**Progress:** 60%
**Notes:** Completed validation logic, needs tests

**Branch with partial work:** \`manual/005-task-name\`"
```

### Step 4: Clean Up (Optional)

```bash
# Switch to main branch
git checkout develop

# Delete local branch (unless --keep-branch)
git branch -d manual/005-task-name

# Archive todo file
mv todo/ac-manual/005-task-name.md todo/ac-manual/archive/
```

## Output Format

```markdown
## Task Returned: AC-005

### Status Change
- **Previous:** In Progress (Manual) / Paused
- **New:** Planning
- **Returned At:** 2025-12-29 17:00:00

### Progress Preserved

**Your Progress:** 60%
**Branch:** `manual/005-donation-validation` (kept)
**Commits:** 5 commits pushed

### What Was Completed
- ✅ Validation logic for amount field
- ✅ Email format validation
- ✅ Error message display

### What Remains
- ⬜ Server-side validation
- ⬜ Unit tests
- ⬜ Integration tests

### Handoff Notes
Completed client-side validation logic. Server-side validation should follow
the same patterns. Tests should cover edge cases for min/max amounts.

### Auto Claude Will

1. Review your partial work in `manual/005-donation-validation`
2. Continue from where you left off
3. Complete remaining items
4. Submit for AI review

### Track Progress
```bash
# Watch Auto Claude pick this up
/ac-planning | grep 005

# See when it starts
/ac-in-progress | grep 005
```
```

## Return to Specific Status

### Return to Planning (Default)

```bash
/ac-return 005 --to planning
```
Auto Claude will review and start fresh or continue your work.

### Return to AI Review

```bash
/ac-return 005 --to ai-review --progress 100
```
For when you've completed the work but want Auto Claude to run the automated review.

```markdown
## Task Returned to AI Review: AC-005

Auto Claude will:
1. Run tests on your implementation
2. Check TypeScript types
3. Run linting
4. Verify build
5. Check code coverage

If all pass → moves to Human Review
If failures → returns to In Progress for fixes
```

### Return to Human Review

```bash
/ac-return 005 --to human-review --progress 100
```
For when you've completed work and AI review, ready for human approval.

## Returning Multiple Tasks

```bash
/ac-return 005 007 --notes "Focusing on other priorities"
```

```markdown
## Returned 2 Tasks to Auto Claude

### AC-005: Add donation form validation
- **Progress:** 60%
- **Branch:** Preserved
- **Target:** Planning

### AC-007: Create email templates
- **Progress:** 30%
- **Branch:** Preserved
- **Target:** Planning

### Handoff Notes
Focusing on other priorities. Both tasks have partial progress
that Auto Claude can build on.

### Track Progress
```bash
/ac-planning  # See when queued
/ac-in-progress  # See when started
```
```

## Preserve vs Clean Options

### Default (Preserve Changes)

```bash
/ac-return 005
```
- Commits and pushes your changes
- Keeps branch for Auto Claude to use
- Archives todo file

### Keep Everything

```bash
/ac-return 005 --keep-branch
```
- Preserves branch locally
- Useful if you might take it back

### Return Without Progress

```bash
/ac-return 005 --progress 0 --notes "Couldn't start, dependencies unclear"
```
- Returns to planning as if not started
- Good for when blocked before starting

## Integration with Other Commands

```bash
# Take a task
/ac-start 005

# Work on it...
# Realize you can't finish it

# Return with context
/ac-return 005 --notes "Completed 60%, need help with tests" --progress 60

# Or return because blocked
/ac-return 005 --to planning --notes "Blocked on API design decision"

# Track it going back to Auto Claude
/ac-planning
/ac-in-progress
```

## When to Return vs Done

| Situation | Command |
|-----------|---------|
| Work complete, ready to merge | `/ac-done --mark 005` |
| Partially done, Auto Claude can finish | `/ac-return 005 --progress 60` |
| Can't start, need Auto Claude to do it | `/ac-return 005 --progress 0` |
| Complete but want AI to review | `/ac-return 005 --to ai-review --progress 100` |

## Best Practices

1. **Always provide notes** - Help Auto Claude understand context
2. **Indicate progress** - So Auto Claude knows where to start
3. **Push your work** - Don't lose progress
4. **Document blockers** - Explain why you're returning
5. **Keep branch if unsure** - Can always delete later

## Related Commands

- `/ac-start` - Start working on a task
- `/ac-pause` - Pause without returning
- `/ac-done` - Mark task complete
- `/ac-planning` - View returned tasks
- `/ac-in-progress` - Track Auto Claude's progress

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-29 | Initial release |
