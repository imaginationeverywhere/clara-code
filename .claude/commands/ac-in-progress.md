# /ac-in-progress - View Auto Claude In Progress Tasks

When this command is invoked, IMMEDIATELY execute the following workflow:

## Step 1: Scan for In Progress Tasks

Execute these commands to gather data:

```bash
# Check tasks.json for in-progress
cat .internal/tasks.json 2>/dev/null | jq '.tasks[] | select(.status == "in-progress" or .status == "manual")'

# List git worktrees (Auto Claude uses worktrees)
git worktree list

# Check for agent branches
git branch -a | grep -E "agent|ac-"

# Check GitHub PRs in draft/progress
gh pr list --state open --draft --json number,title,headRefName,updatedAt 2>/dev/null
gh pr list --label "in-progress" --state open --json number,title,headRefName 2>/dev/null
```

## Step 2: Parse Arguments

- No args: Show all in-progress tasks
- `--stalled`: Only show tasks with no activity >24 hours
- `--with-worktrees`: Show worktree paths and git status
- `--watch <ID>`: Show detailed progress for specific task
- `--activity`: Show commit timeline

## Step 3: Analyze Activity

For each in-progress task:
```bash
# Get last commit time
git log -1 --format="%ar" [branch] 2>/dev/null

# Check for uncommitted changes
git -C [worktree_path] status --porcelain 2>/dev/null

# Count commits
git rev-list --count main..[branch] 2>/dev/null
```

## Step 4: Display Results

Format output as:

```
## 🏃 Auto Claude In Progress Tasks

**Project:** [project-name]
**Active Tasks:** [X]
**Stalled (>24h):** [Y]

### Currently Active

| ID | Title | Branch/Worktree | Last Activity | Commits | Status |
|----|-------|-----------------|---------------|---------|--------|
| 001 | [title] | [branch] | [X hours ago] | [N] | 🟢 Active |
| 002 | [title] | [branch] | [2 days ago] | [N] | 🔴 Stalled |

### Your Manual Tasks

| ID | Title | Started | Progress |
|----|-------|---------|----------|
| 005 | [title] | [date] | [notes] |

### Quick Actions

- View stalled only: `/ac-in-progress --stalled`
- See worktree details: `/ac-in-progress --with-worktrees`
- Pause a task: `/ac-pause <ID>`
```

## Step 5: Handle --stalled Flag

If `--stalled` provided:
- Filter to only show tasks with last activity > 24 hours
- Highlight why they might be stalled
- Suggest actions (resume, return, or investigate)

## Step 6: Handle --with-worktrees Flag

If `--with-worktrees` provided:
- Show full worktree paths
- Show git status for each
- Show recent commits

---

## EXECUTE NOW

Scan for in-progress tasks and display them. Do not just show documentation.
