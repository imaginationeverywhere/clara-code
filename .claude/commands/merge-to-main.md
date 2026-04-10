# Merge PRs to Main

Review and merge one or more pull requests into the main branch.

## Usage

```bash
# By PR numbers
/merge-to-main [PR_NUMBERS]
/merge-to-main 123
/merge-to-main 123 456 789

# By GitHub URL - analyzes ALL open PRs
/merge-to-main https://github.com/org/repo/pulls
/merge-to-main https://github.com/imaginationeverywhere/ppsv-charities/pulls

# Auto-find approved PRs
/merge-to-main --all-approved

# Review only (no merge)
/merge-to-main --review-only https://github.com/org/repo/pulls
```

## Arguments

- `PR_NUMBERS` - Space-separated list of PR numbers to review and merge
- `URL` - GitHub pulls URL (e.g., `https://github.com/org/repo/pulls`) - fetches ALL open PRs
- `--all-approved` - Find and merge all approved PRs targeting main
- `--review-only` - Analyze and report on PRs without merging any
- `--dry-run` - Review PRs without merging
- `--squash` - Squash commits when merging (default)
- `--no-squash` - Create merge commit instead of squashing

## Workflow

### Step 0: Parse Input (URL or PR Numbers)

#### If GitHub URL provided:
```bash
# Extract owner and repo from URL
# URL: https://github.com/imaginationeverywhere/ppsv-charities/pulls
# → owner: imaginationeverywhere
# → repo: ppsv-charities

# Fetch ALL open PRs targeting main
gh pr list --repo [owner]/[repo] --base main --state open \
  --json number,title,state,mergeable,reviewDecision,headRefName,baseRefName,commits,additions,deletions,changedFiles,statusCheckRollup,reviews,labels

# Also fetch PRs targeting develop that may need attention
gh pr list --repo [owner]/[repo] --state open \
  --json number,title,baseRefName,reviewDecision,mergeable
```

### Step 1: Fetch PR Information

For each PR number provided (or from URL):

```bash
# Get PR details
gh pr view [PR_NUMBER] --json number,title,state,mergeable,reviewDecision,headRefName,baseRefName,commits,additions,deletions,changedFiles

# Get PR diff for review
gh pr diff [PR_NUMBER]

# Get PR checks status
gh pr checks [PR_NUMBER]
```

### Step 2: Review Each PR

For each PR, analyze:

1. **Merge Target Validation**
   - Confirm base branch is `main`
   - If not targeting main, warn and skip

2. **Status Checks**
   - All CI checks must pass
   - No failing or pending required checks

3. **Review Status**
   - Must have at least one approval
   - No changes requested
   - No pending required reviews

4. **Merge Conflicts**
   - Check `mergeable` status
   - If conflicts exist, report and skip

5. **Code Review**
   - Review the diff for:
     - Breaking changes
     - Security concerns
     - Missing tests
     - Documentation updates needed

### Step 3: Generate Review Report

```markdown
## PR Merge Review Report

### PR #[NUMBER]: [TITLE]
- **Branch:** [head] → main
- **Status:** [APPROVED/PENDING/BLOCKED]
- **Checks:** [PASSING/FAILING]
- **Mergeable:** [YES/NO]
- **Changes:** +[additions] -[deletions] ([files] files)
- **Review Notes:** [Any concerns or observations]

### Summary
- Ready to merge: [X] PRs
- Blocked: [Y] PRs
- Skipped (wrong target): [Z] PRs
```

### Step 4: Merge Approved PRs

For each PR that passes all checks:

```bash
# Squash merge (default)
gh pr merge [PR_NUMBER] --squash --delete-branch

# Or merge commit
gh pr merge [PR_NUMBER] --merge --delete-branch
```

### Step 5: Post-Merge Actions

After successful merges:

```bash
# Update local main
git fetch origin main
git checkout main
git pull origin main

# Verify merge
git log --oneline -5
```

## Example Output

```
Reviewing 3 PRs for merge to main...

PR #123: feat: Add user authentication
  ✅ Targeting main
  ✅ All checks passing (4/4)
  ✅ Approved by 2 reviewers
  ✅ No merge conflicts
  ✅ Ready to merge

PR #124: fix: Database connection timeout
  ✅ Targeting main
  ✅ All checks passing (4/4)
  ✅ Approved by 1 reviewer
  ✅ No merge conflicts
  ✅ Ready to merge

PR #125: docs: Update README
  ❌ Targeting develop (not main)
  ⏭️ Skipping - wrong target branch

Summary:
  Ready: 2 PRs (#123, #124)
  Blocked: 0 PRs
  Skipped: 1 PR (#125)

Proceed with merge? [Y/n]

Merging PR #123... ✅ Merged
Merging PR #124... ✅ Merged

All merges complete. Main branch updated.
```

## Detailed Review for Blocked PRs

When a PR cannot be merged, generate a detailed review report:

### Blocked PR Review Template

```markdown
## 🔍 Detailed Review: PR #[NUMBER]

### Basic Info
- **Title:** [TITLE]
- **Author:** @[author]
- **Branch:** [head] → main
- **Created:** [date]
- **Last Updated:** [date]

### ❌ Blocking Issues

#### 1. CI/CD Status
| Check | Status | Details |
|-------|--------|---------|
| build | ❌ Failed | Error in src/components/Auth.tsx:45 |
| tests | ⏳ Pending | Waiting for build |
| lint | ✅ Passed | - |

**Required Action:** Fix build error before merge

#### 2. Review Status
- **Approvals:** 0/1 required
- **Changes Requested:** 1
  - @reviewer1: "Please add error handling for edge case"
- **Pending Reviews:** @reviewer2 (assigned 2 days ago)

**Required Action:** Address review feedback and get approval

#### 3. Merge Conflicts
**Conflicting Files:**
- `src/utils/helpers.ts` (modified in both branches)
- `package.json` (version conflict)

**Resolution Steps:**
```bash
gh pr checkout [NUMBER]
git merge main
# Resolve conflicts in:
#   - src/utils/helpers.ts
#   - package.json
git add .
git commit -m "Resolve merge conflicts with main"
git push
```

#### 4. Code Quality Observations
- **Large PR:** 847 lines changed (consider splitting)
- **Missing Tests:** New `AuthService` class has no tests
- **Documentation:** Public API changes not documented

### 📋 Action Items Checklist
- [ ] Fix CI build error in Auth.tsx:45
- [ ] Address @reviewer1's feedback on error handling
- [ ] Resolve 2 merge conflicts
- [ ] Add tests for AuthService
- [ ] Update API documentation

### 🔗 Quick Links
- [View PR](https://github.com/[owner]/[repo]/pull/[NUMBER])
- [View Checks](https://github.com/[owner]/[repo]/pull/[NUMBER]/checks)
- [View Files Changed](https://github.com/[owner]/[repo]/pull/[NUMBER]/files)
```

### URL Analysis Output Example

```markdown
## Repository Analysis: imaginationeverywhere/ppsv-charities

**URL:** https://github.com/imaginationeverywhere/ppsv-charities/pulls
**Analysis Date:** 2025-12-29

### Summary
| Category | Count | PRs |
|----------|-------|-----|
| ✅ Ready to Merge | 2 | #45, #48 |
| ⏳ Needs Review | 3 | #42, #44, #47 |
| ❌ Has Issues | 2 | #41, #46 |
| ⚠️ Wrong Target | 1 | #43 (targets develop) |

---

### ✅ Ready to Merge (2 PRs)

#### PR #45: feat: Add donation tracking
- **Status:** All checks passing, 2 approvals
- **Changes:** +234 -12 (8 files)
- **Action:** Ready for `/merge-to-main 45`

#### PR #48: fix: Payment processing timeout
- **Status:** All checks passing, 1 approval
- **Changes:** +45 -23 (3 files)
- **Action:** Ready for `/merge-to-main 48`

---

### ⏳ Needs Review (3 PRs)

#### PR #42: feat: User dashboard redesign
- **Blocking:** Awaiting review (no reviewers assigned)
- **Changes:** +567 -89 (24 files)
- **Suggestion:** Assign reviewers: `gh pr edit 42 --add-reviewer @team-lead`

#### PR #44: chore: Update dependencies
- **Blocking:** 1 approval needed (has 0)
- **Changes:** +89 -76 (2 files)
- **Suggestion:** Request review from maintainer

#### PR #47: docs: API documentation update
- **Blocking:** Review in progress
- **Changes:** +123 -0 (5 files)
- **Suggestion:** Follow up with @reviewer

---

### ❌ Has Issues (2 PRs)

[Detailed review for PR #41]
[Detailed review for PR #46]

---

### Recommended Actions

1. **Merge ready PRs:**
   ```bash
   /merge-to-main 45 48
   ```

2. **Assign reviewers to unreviewed PRs:**
   ```bash
   gh pr edit 42 --add-reviewer @team-lead
   ```

3. **Fix issues in blocked PRs:**
   - PR #41: Resolve merge conflicts
   - PR #46: Fix failing CI checks
```

## Safety Checks

- Never force merge PRs with failing checks
- Always verify target branch is main
- Require at least one approval
- Check for merge conflicts before attempting merge
- Delete source branch after successful merge
- Report any PRs that couldn't be merged

## Find All Approved PRs

To find all PRs ready to merge to main:

```bash
gh pr list --base main --state open --json number,title,reviewDecision,mergeable | jq '.[] | select(.reviewDecision == "APPROVED" and .mergeable == "MERGEABLE")'
```

## Integration with CI/CD

After merging to main:
- Production deployment may be triggered automatically
- Monitor deployment status
- Be prepared to rollback if issues arise

## Related Commands

- `/merge-to-develop` - Merge PRs to develop branch
- `/create-pr` - Create new pull requests
- `/pr-status` - Check PR status without merging
