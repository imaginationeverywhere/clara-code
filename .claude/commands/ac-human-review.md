# /ac-human-review - View Auto Claude Human Review Tasks

When this command is invoked, IMMEDIATELY execute the following workflow:

## Step 1: Scan for Human Review Tasks

Execute these commands to gather data:

```bash
# Check tasks.json for human-review status
cat .internal/tasks.json 2>/dev/null | jq '.tasks[] | select(.status == "human-review")'

# Check GitHub PRs awaiting review
gh pr list --state open --json number,title,headRefName,reviewDecision,reviews,statusCheckRollup 2>/dev/null

# PRs where checks passed and awaiting review
gh pr list --search "review:required status:success" --json number,title 2>/dev/null
```

## Step 2: Parse Arguments

- No args: Show all tasks awaiting human review
- `--review <ID>`: Start detailed review of specific task
- `--approve <ID>`: Approve task for merge
- `--request-changes <ID> "<message>"`: Request changes
- `--approve-all`: Approve all passing tasks

## Step 3: Display Results

Format output as:

```
## 👤 Auto Claude Human Review Queue

**Project:** [project-name]
**Awaiting Review:** [X] tasks
**Your Reviews:** [Y] assigned to you

### Ready for Review

| ID | Title | PR | AI Review | Coverage | Files |
|----|-------|-----|-----------|----------|-------|
| 003 | [title] | #154 | ✅ PASS | 87% | 8 |
| 004 | [title] | #155 | ✅ PASS | 92% | 12 |

### Review Priority

1. **#003 [title]** - [reason for priority]
2. **#004 [title]** - [reason]

### Quick Actions

- Start review: `/ac-human-review --review <ID>`
- Approve: `/ac-human-review --approve <ID>`
- Request changes: `/ac-human-review --request-changes <ID> "message"`
- Approve all: `/ac-human-review --approve-all`
```

## Step 4: Handle --review Flag

If `--review <ID>` provided:
1. Fetch PR details: `gh pr view [NUMBER] --json title,body,files,commits`
2. Fetch diff: `gh pr diff [NUMBER]`
3. Show checklist:
   - Security review items
   - Code quality items
   - Business logic items
   - Test coverage items

## Step 5: Handle --approve Flag

If `--approve <ID>` provided:
1. Add approval: `gh pr review [NUMBER] --approve`
2. Update task status in tasks.json
3. Output confirmation

## Step 6: Handle --request-changes Flag

If `--request-changes <ID> "<message>"` provided:
1. Add review with changes requested: `gh pr review [NUMBER] --request-changes --body "<message>"`
2. Update task status
3. Output confirmation

---

## EXECUTE NOW

Scan for human review tasks and display them. Do not just show documentation.
