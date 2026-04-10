# /ac-ai-review - View Auto Claude AI Review Tasks

When this command is invoked, IMMEDIATELY execute the following workflow:

## Step 1: Scan for AI Review Tasks

Execute these commands to gather data:

```bash
# Check tasks.json for ai-review status
cat .auto-claude/tasks.json 2>/dev/null | jq '.tasks[] | select(.status == "ai-review")'

# Check GitHub PRs with CI running
gh pr list --state open --json number,title,headRefName,statusCheckRollup 2>/dev/null

# Check recent CI runs
gh run list --limit 10 --json status,name,conclusion,headBranch 2>/dev/null
```

## Step 2: Parse Arguments

- No args: Show all tasks in AI review
- `--failing`: Only show tasks with failed checks
- `--passing`: Only show tasks passing all checks
- `--rerun <ID>`: Trigger re-run of CI for task
- `--report <ID>`: Show detailed review report

## Step 3: Check CI Status for Each Task

For each task in AI review:
```bash
# Get PR checks
gh pr checks [PR_NUMBER] 2>/dev/null

# Get specific check details
gh pr view [PR_NUMBER] --json statusCheckRollup 2>/dev/null
```

## Step 4: Display Results

Format output as:

```
## 🤖 Auto Claude AI Review Tasks

**Project:** [project-name]
**In AI Review:** [X] tasks
**Passing:** [Y] | **Failing:** [Z]

### Review Status

| ID | Title | Tests | Types | Lint | Build | Overall |
|----|-------|-------|-------|------|-------|---------|
| 003 | [title] | ✅ 45/45 | ✅ | ✅ | ✅ | 🟢 PASS |
| 006 | [title] | ❌ 18/23 | ✅ | ⚠️ 2 | ✅ | 🔴 FAIL |

### Passing - Ready for Human Review

| ID | Title | Coverage | PR |
|----|-------|----------|-----|
| 003 | [title] | 87% | #154 |

### Failing - Needs Attention

| ID | Title | Issue | Action |
|----|-------|-------|--------|
| 006 | [title] | 5 test failures | Fix tests |

### Quick Actions

- View failures: `/ac-ai-review --failing`
- See full report: `/ac-ai-review --report <ID>`
- Re-run checks: `/ac-ai-review --rerun <ID>`
```

## Step 5: Handle --failing Flag

Show only tasks where CI checks are failing with details about what's wrong.

## Step 6: Handle --report Flag

Show detailed breakdown:
- Test results (which tests failed)
- Type errors (if any)
- Lint issues (if any)
- Coverage report
- Build logs

---

## EXECUTE NOW

Scan for AI review tasks and display CI status. Do not just show documentation.
