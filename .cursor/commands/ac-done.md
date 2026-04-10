# /ac-done - View Auto Claude Completed Tasks

When this command is invoked, IMMEDIATELY execute the following workflow:

## Step 1: Scan for Completed Tasks

Execute these commands to gather data:

```bash
# Check tasks.json for done status
cat .auto-claude/tasks.json 2>/dev/null | jq '.tasks[] | select(.status == "done")'

# Check merged PRs with auto-claude label
gh pr list --state merged --label "auto-claude" --json number,title,mergedAt,headRefName --limit 20 2>/dev/null

# Check closed issues
gh issue list --state closed --label "auto-claude" --json number,title,closedAt --limit 20 2>/dev/null

# Check completed todo files
ls todo/ac-manual/archive/*.md 2>/dev/null
ls todo/completed/*.md 2>/dev/null
```

## Step 2: Parse Arguments

- No args: Show recent completed tasks
- `--this-week`: Filter to this week only
- `--today`: Filter to today only
- `--since <date>`: Filter by date
- `--stats`: Show completion statistics
- `--report`: Generate stakeholder report
- `--mark <ID>`: Mark a manual task as done

## Step 3: Display Results

Format output as:

```
## ✅ Auto Claude Completed Tasks

**Project:** [project-name]
**Total Completed:** [X] tasks
**This Week:** [Y] tasks
**Today:** [Z] tasks

### Recently Completed

| ID | Title | Type | Completed | PR | Lines |
|----|-------|------|-----------|-----|-------|
| 012 | [title] | feature | 2h ago | #167 | +234 |
| 011 | [title] | fix | 4h ago | #165 | +23 |
| 010 | [title] | feature | Yesterday | #162 | +456 |

### Completion Summary

| Type | Count | Lines Added |
|------|-------|-------------|
| feature | 8 | +2,456 |
| fix | 4 | +234 |
| chore | 3 | +178 |

### Quick Actions

- This week: `/ac-done --this-week`
- Statistics: `/ac-done --stats`
- Full report: `/ac-done --report`
- Mark done: `/ac-done --mark <ID>`
```

## Step 4: Handle --stats Flag

Calculate and display:
- Tasks per status
- Velocity (tasks/day, tasks/week)
- Average time in each status
- Code impact (lines added/removed)
- Test coverage trends

## Step 5: Handle --report Flag

Generate stakeholder report with:
- Executive summary
- Completed features list
- Key metrics vs targets
- Remaining work
- Risks and blockers

## Step 6: Handle --mark Flag

If `--mark <ID>` provided:
1. Find task in planning-tasks or ac-manual
2. Move to completed/archive
3. Update tasks.json status to "done"
4. Link to PR if provided
5. Output confirmation

---

## EXECUTE NOW

Scan for completed tasks and display them. Do not just show documentation.
