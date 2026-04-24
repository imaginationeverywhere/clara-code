# /ac-planning - View Auto Claude Planning Tasks

When this command is invoked, IMMEDIATELY execute the following workflow:

## Step 1: Scan for Planning Tasks

Execute these commands to gather task data:

```bash
# Check for tasks.json
cat .internal/tasks.json 2>/dev/null | jq '.tasks[] | select(.status == "planning")'

# List planning task files
ls -la .internal/planning-tasks/*.md 2>/dev/null

# Check GitHub issues
gh issue list --label "agent,planning" --state open --json number,title,labels,assignees 2>/dev/null
```

## Step 2: Parse Arguments

Check if user provided arguments:
- No args: Show all planning tasks
- `--take <ID>`: Claim task for manual work (run /ac-start workflow)
- `--export-for-manual`: Create todo files for all tasks
- `--verbose <ID>`: Show full task details
- `--label <name>`: Filter by label
- `<URL>`: If GitHub URL provided, fetch from that repo

## Step 3: Display Results

Format output as:

```
## 📋 Auto Claude Planning Tasks

**Project:** [project-name]
**Total Planning:** [X] tasks
**Ready for Manual:** [Y] tasks (no blockers)

### Tasks Available

| ID | Title | Complexity | Dependencies | Labels |
|----|-------|------------|--------------|--------|
| 001 | [title] | [Low/Med/High] | [deps or None] | [labels] |
| ... | ... | ... | ... | ... |

### Quick Actions

- Start a task: `/ac-start <ID>`
- View details: `/ac-planning --verbose <ID>`
- Take for manual work: `/ac-planning --take <ID>`
```

## Step 4: Handle --take Flag

If `--take <ID>` is provided:
1. Update task status to "manual" in tasks.json (if exists)
2. Create todo file in `todo/ac-manual/<ID>-<task-name>.md`
3. Add GitHub issue comment (if applicable)
4. Output confirmation message

## Step 5: Handle --verbose Flag

If `--verbose <ID>` is provided:
1. Read the full task file from `.internal/planning-tasks/`
2. Display complete task details including:
   - Description
   - Acceptance criteria
   - Technical details
   - Files to modify
   - Dependencies

---

## EXECUTE NOW

Read the planning tasks and display them in the format above. Do not just show this documentation - actually run the workflow and show results.
