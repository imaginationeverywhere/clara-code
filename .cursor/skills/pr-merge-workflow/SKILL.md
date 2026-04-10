# PR Merge Workflow Skill

> **Skill ID:** `pr-merge-workflow`
> **Version:** 1.0.0
> **Category:** Git Workflow
> **Last Updated:** 2025-12-29

## Overview

This skill provides structured workflows for reviewing and merging pull requests into target branches. Supports batch operations, conflict resolution, and integration with CI/CD pipelines.

## Triggers

Use this skill when:
- User runs `/merge-to-main` or `/merge-to-develop`
- User asks to "merge PRs" or "review pull requests"
- Worktree branches are ready for integration
- Multiple PRs need batch processing

## Core Workflows

### 1. Single PR Merge

```bash
# Fetch PR details
gh pr view [NUMBER] --json number,title,state,mergeable,reviewDecision,headRefName,baseRefName,commits,additions,deletions,changedFiles

# Check CI status
gh pr checks [NUMBER]

# Review diff
gh pr diff [NUMBER]

# Merge (if approved)
gh pr merge [NUMBER] --squash --delete-branch  # For main
gh pr merge [NUMBER] --merge --delete-branch   # For develop
```

### 2. Batch PR Merge

```bash
# List all PRs for a branch
gh pr list --base [branch] --state open --json number,title,reviewDecision,mergeable

# Filter approved PRs
gh pr list --base main --state open --json number,reviewDecision | jq '.[] | select(.reviewDecision == "APPROVED")'

# Merge each approved PR
for pr in $(approved_prs); do
  gh pr merge $pr --squash --delete-branch
done
```

### 3. Worktree to PR to Merge

```bash
# From worktree branch
git push origin [branch-name]

# Create PR
gh pr create --base develop --head [branch-name] --title "[Title]" --body "[Description]"

# After approval, merge
gh pr merge [NUMBER] --merge --delete-branch
```

## Validation Checks

### Pre-Merge Validation

| Check | Required for Main | Required for Develop |
|-------|-------------------|---------------------|
| CI Passing | Yes | Yes |
| Approval | Yes (1+) | Recommended |
| No Conflicts | Yes | Yes |
| Branch Target | Must be main | Must be develop |

### Post-Merge Validation

```bash
# Update local branch
git fetch origin [branch]
git checkout [branch]
git pull origin [branch]

# Verify merge
git log --oneline -3

# Clean up
git branch -d [merged-branch]
```

## Merge Strategies

### For Main Branch (Production)

- **Strategy:** Squash merge
- **Reason:** Clean production history
- **Command:** `gh pr merge [NUMBER] --squash --delete-branch`

### For Develop Branch (Integration)

- **Strategy:** Merge commit
- **Reason:** Preserve feature branch history
- **Command:** `gh pr merge [NUMBER] --merge --delete-branch`

## Conflict Resolution

When conflicts are detected:

```bash
# Checkout PR branch
gh pr checkout [NUMBER]

# Merge target into branch
git merge [target-branch]

# Resolve conflicts
# ... manual resolution ...

# Push resolution
git add .
git commit -m "Resolve merge conflicts"
git push

# Retry merge
gh pr merge [NUMBER] --merge --delete-branch
```

## Integration with Project Commands

### bootstrap-project Integration

After project setup, check for any setup PRs:

```bash
gh pr list --base develop --state open --search "setup OR bootstrap"
```

### project-mvp-status Integration

Include PR metrics in status:

```bash
# Pending PRs
gh pr list --base develop --state open --json number,title | jq 'length'

# Blocked PRs (conflicts or failing CI)
gh pr list --base develop --state open --json number,mergeable | jq '[.[] | select(.mergeable == "CONFLICTING")] | length'
```

### project-status Integration

Track PR velocity:

```bash
# Merged this week
gh pr list --state merged --search "merged:>$(date -d '7 days ago' +%Y-%m-%d)" --json number | jq 'length'

# Average time to merge
gh pr list --state merged --limit 10 --json createdAt,mergedAt
```

## Output Templates

### Review Report

```markdown
## PR Merge Review Report

### PR #[NUMBER]: [TITLE]
- **Branch:** [head] → [base]
- **Status:** [READY/PENDING/BLOCKED]
- **Checks:** [X/Y passing]
- **Mergeable:** [YES/NO/CONFLICTS]
- **Changes:** +[add] -[del] ([files] files)
- **Notes:** [observations]

### Summary
| Status | Count | PRs |
|--------|-------|-----|
| Ready | X | #1, #2 |
| Pending | Y | #3 |
| Blocked | Z | #4 |
```

### Merge Result

```markdown
## Merge Results

### Successful Merges
- PR #[NUMBER]: [TITLE] ✅

### Failed Merges
- PR #[NUMBER]: [TITLE] ❌ (reason)

### Summary
- Merged: X PRs
- Failed: Y PRs
- Skipped: Z PRs
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "Not mergeable" | Conflicts | Resolve conflicts first |
| "Checks failing" | CI failed | Fix CI issues |
| "Review required" | No approval | Get review approval |
| "Branch protection" | Rules not met | Meet all requirements |

## Best Practices

1. **Always review diffs** before merging
2. **Check CI status** completely
3. **Use squash for main** - clean history
4. **Use merge for develop** - preserve context
5. **Delete branches** after merge
6. **Update local** after remote merge

## Related Skills

- `git-workflow` - General git operations
- `ci-cd-pipeline-standard` - CI/CD integration
- `testing-automation` - Test verification

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-29 | Initial release |
