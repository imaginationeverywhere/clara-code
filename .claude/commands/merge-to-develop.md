# Merge PRs to Develop

Review and merge one or more pull requests into the develop branch.

## Usage

```bash
# By PR numbers
/merge-to-develop [PR_NUMBERS]
/merge-to-develop 123
/merge-to-develop 123 456 789

# By GitHub URL - analyzes ALL open PRs
/merge-to-develop https://github.com/org/repo/pulls
/merge-to-develop https://github.com/imaginationeverywhere/ppsv-charities/pulls

# Auto-find approved PRs
/merge-to-develop --all-approved

# From worktrees
/merge-to-develop --from-worktrees

# Review only (no merge)
/merge-to-develop --review-only https://github.com/org/repo/pulls
```

## Arguments

- `PR_NUMBERS` - Space-separated list of PR numbers to review and merge
- `URL` - GitHub pulls URL (e.g., `https://github.com/org/repo/pulls`) - fetches ALL open PRs
- `--all-approved` - Find and merge all approved PRs targeting develop
- `--from-worktrees` - Create PRs from completed worktree branches and merge
- `--review-only` - Analyze and report on PRs without merging any
- `--dry-run` - Review PRs without merging
- `--squash` - Squash commits when merging
- `--no-squash` - Create merge commit (default for develop)

## Workflow

### Step 0: Parse Input (URL or PR Numbers)

#### If GitHub URL provided:
```bash
# Extract owner and repo from URL
# URL: https://github.com/imaginationeverywhere/ppsv-charities/pulls
# → owner: imaginationeverywhere
# → repo: ppsv-charities

# Fetch ALL open PRs targeting develop
gh pr list --repo [owner]/[repo] --base develop --state open \
  --json number,title,state,mergeable,reviewDecision,headRefName,baseRefName,commits,additions,deletions,changedFiles,statusCheckRollup,reviews,labels,author

# Also identify PRs from worktrees/agent
gh pr list --repo [owner]/[repo] --state open --search "agent in:head" \
  --json number,title,headRefName,reviewDecision,mergeable
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
   - Confirm base branch is `develop`
   - If targeting main instead, warn (may need different workflow)

2. **Status Checks**
   - All CI checks must pass
   - No failing or pending required checks

3. **Review Status**
   - Should have at least one approval (can be relaxed for feature branches)
   - No changes requested

4. **Merge Conflicts**
   - Check `mergeable` status
   - If conflicts exist, report and provide resolution guidance

5. **Code Review**
   - Review the diff for:
     - Code quality issues
     - Test coverage
     - Documentation
     - Breaking changes to develop

### Step 3: Generate Review Report

```markdown
## PR Merge Review Report (Develop)

### PR #[NUMBER]: [TITLE]
- **Branch:** [head] → develop
- **Type:** [feature/fix/chore/agent]
- **Status:** [APPROVED/PENDING/READY]
- **Checks:** [PASSING/FAILING/PENDING]
- **Mergeable:** [YES/NO/CONFLICTS]
- **Changes:** +[additions] -[deletions] ([files] files)
- **Review Notes:** [Observations]

### Summary
- Ready to merge: [X] PRs
- Needs review: [Y] PRs
- Has conflicts: [Z] PRs
```

### Step 4: Merge PRs

For each PR that passes checks:

```bash
# Merge commit (default for develop - preserves history)
gh pr merge [PR_NUMBER] --merge --delete-branch

# Or squash if requested
gh pr merge [PR_NUMBER] --squash --delete-branch
```

### Step 5: Post-Merge Actions

After successful merges:

```bash
# Update local develop
git fetch origin develop
git checkout develop
git pull origin develop

# Verify merges
git log --oneline -10

# Clean up merged worktree branches
git branch -d [merged-branch-names]
```

## Worktree Integration

When using `--from-worktrees`:

```bash
# List all worktrees
git worktree list

# For each completed worktree (has QA sign-off):
# 1. Check if PR exists
gh pr list --head [branch-name] --json number,state

# 2. Create PR if doesn't exist
gh pr create --base develop --head [branch-name] --title "[Title]" --body "[Description]"

# 3. Review and merge
```

### Auto-Claude Worktree Workflow

For agent branches (from agent builds):

```bash
# Find all agent branches
git branch -a | grep "agent/"

# Check each for QA completion
# Look for qa_report.md with "PASSED" status

# Create PRs for completed branches
for branch in $(git branch | grep "agent/"); do
  gh pr create --base develop --head $branch --fill
done
```

## Example Output

```
Reviewing 4 PRs for merge to develop...

PR #201: feat: Add Video model and migration
  ✅ Targeting develop
  ✅ All checks passing (3/3)
  ✅ Approved by 1 reviewer
  ✅ No merge conflicts
  ✅ Ready to merge

PR #202: feat: Add Quote model and migration
  ✅ Targeting develop
  ⏳ Checks running (2/3 complete)
  ⏳ Awaiting review
  ✅ No merge conflicts
  ⚠️ Needs approval before merge

PR #203: fix: Database connection handling
  ✅ Targeting develop
  ✅ All checks passing
  ❌ Has merge conflicts
  🔧 Needs conflict resolution

PR #204: agent/008-donation-model
  ✅ Targeting develop
  ✅ All checks passing
  ✅ QA sign-off found
  ✅ Ready to merge

Summary:
  Ready: 2 PRs (#201, #204)
  Pending: 1 PR (#202 - awaiting review)
  Conflicts: 1 PR (#203)

Proceed with ready PRs? [Y/n]

Merging PR #201... ✅ Merged
Merging PR #204... ✅ Merged

Merged 2 PRs. 2 PRs need attention.
```

## Conflict Resolution

When conflicts are detected:

```bash
# Checkout the PR branch
gh pr checkout [PR_NUMBER]

# Merge develop into the branch
git merge develop

# Resolve conflicts manually
# ... edit files ...

# Complete the merge
git add .
git commit -m "Resolve merge conflicts with develop"
git push

# Re-run the merge command
/merge-to-develop [PR_NUMBER]
```

## Batch Operations

### Merge All Approved PRs

```bash
# Find all approved PRs targeting develop
gh pr list --base develop --state open --json number,reviewDecision,mergeable \
  | jq -r '.[] | select(.reviewDecision == "APPROVED") | .number'
```

### Merge All Auto-Claude PRs with QA Sign-off

```bash
# Find agent PRs
gh pr list --base develop --state open --search "agent in:title" --json number,title
```

## Detailed Review for Blocked PRs

When a PR cannot be merged, generate a detailed review report:

### Blocked PR Review Template

```markdown
## 🔍 Detailed Review: PR #[NUMBER]

### Basic Info
- **Title:** [TITLE]
- **Author:** @[author]
- **Branch:** [head] → develop
- **Type:** [feature/fix/chore/agent]
- **Created:** [date]
- **Last Updated:** [date]

### ❌ Blocking Issues

#### 1. CI/CD Status
| Check | Status | Details |
|-------|--------|---------|
| build | ❌ Failed | TypeScript error in models/User.ts:23 |
| tests | ❌ Failed | 3 test failures in auth.spec.ts |
| lint | ✅ Passed | - |

**Required Action:** Fix TypeScript and test failures

#### 2. Review Status
- **Approvals:** 0 (recommended but not required for develop)
- **Changes Requested:** 1
  - @reviewer1: "Missing migration for new column"
- **Comments:** 3 unresolved

**Required Action:** Add missing migration, resolve comments

#### 3. Merge Conflicts
**Conflicting Files:**
- `src/models/index.ts` (export conflict)
- `backend/package.json` (dependency versions)

**Resolution Steps:**
```bash
gh pr checkout [NUMBER]
git merge develop
# Resolve conflicts in listed files
git add .
git commit -m "Resolve merge conflicts with develop"
git push
```

#### 4. Code Quality Observations
- **Missing Tests:** New endpoint has no integration tests
- **Schema Changes:** Migration present but needs review
- **Dependencies:** New package added - verify compatibility

### 📋 Action Items Checklist
- [ ] Fix TypeScript error in models/User.ts:23
- [ ] Fix 3 failing tests in auth.spec.ts
- [ ] Add missing migration for new column
- [ ] Resolve 2 merge conflicts
- [ ] Add integration tests for new endpoint
- [ ] Resolve 3 unresolved comments

### 🔗 Quick Links
- [View PR](https://github.com/[owner]/[repo]/pull/[NUMBER])
- [View Checks](https://github.com/[owner]/[repo]/pull/[NUMBER]/checks)
- [View Files Changed](https://github.com/[owner]/[repo]/pull/[NUMBER]/files)
```

### URL Analysis Output Example

```markdown
## Repository Analysis: imaginationeverywhere/ppsv-charities

**URL:** https://github.com/imaginationeverywhere/ppsv-charities/pulls
**Target:** develop branch
**Analysis Date:** 2025-12-29

### Summary
| Category | Count | PRs |
|----------|-------|-----|
| ✅ Ready to Merge | 3 | #201, #204, #207 |
| ⏳ Needs Review | 2 | #202, #205 |
| ❌ Has Issues | 2 | #203, #206 |
| 🤖 Auto-Claude | 2 | #204, #207 (ready) |

---

### ✅ Ready to Merge (3 PRs)

#### PR #201: feat: Add Video model and migration
- **Status:** All checks passing, 1 approval
- **Changes:** +345 -12 (8 files)
- **Action:** Ready for `/merge-to-develop 201`

#### PR #204: agent/008-donation-model
- **Status:** All checks passing, QA sign-off
- **Changes:** +234 -0 (6 files)
- **Source:** Auto-Claude worktree
- **Action:** Ready for `/merge-to-develop 204`

#### PR #207: agent/012-payment-integration
- **Status:** All checks passing, QA sign-off
- **Changes:** +567 -45 (12 files)
- **Source:** Auto-Claude worktree
- **Action:** Ready for `/merge-to-develop 207`

---

### ⏳ Needs Review (2 PRs)

#### PR #202: feat: Quote model implementation
- **Blocking:** CI still running (2/4 checks complete)
- **Changes:** +289 -34 (7 files)
- **ETA:** ~5 minutes for CI completion
- **Suggestion:** Wait for CI, then merge if passes

#### PR #205: chore: Update backend dependencies
- **Blocking:** No reviews yet
- **Changes:** +156 -134 (3 files)
- **Risk:** Medium (dependency updates)
- **Suggestion:** Request security review

---

### ❌ Has Issues (2 PRs)

#### PR #203: fix: Database connection handling
[Detailed review with blocking issues]

#### PR #206: feat: Admin dashboard
[Detailed review with blocking issues]

---

### Recommended Actions

1. **Merge ready PRs (including Auto-Claude):**
   ```bash
   /merge-to-develop 201 204 207
   ```

2. **Wait for CI on pending PRs:**
   - PR #202 should be ready in ~5 minutes

3. **Fix issues in blocked PRs:**
   - PR #203: Resolve merge conflicts
   - PR #206: Fix 3 failing tests

4. **Review worktree status:**
   ```bash
   /worktree-status
   ```
```

## Safety Checks

- Verify target branch is develop (not main)
- Check CI status before merging
- Warn about large PRs (>500 lines)
- Detect breaking changes
- Preserve commit history by default (no squash)
- Clean up source branches after merge

## Post-Merge Verification

After merging:

1. Verify develop branch builds
2. Run smoke tests if available
3. Check for any downstream impacts
4. Update related JIRA tickets if applicable

## Related Commands

- `/merge-to-main` - Merge PRs to main branch (production)
- `/create-pr` - Create new pull requests
- `/pr-status` - Check PR status without merging
- `/worktree-status` - Check status of all worktrees
