# /merge-to-develop — Integration merges (feature branch → develop)

**Normal agent/team flow.** Merges feature branches, agent worktree branches, and hotfix PRs into `develop`.

## Hard rules

1. **Accepts only:** base = `develop`, head = anything except `develop` itself.
2. **REJECTS** any PR where base = `main` (those use `/merge-to-main` or `/hotfix-to-main`).
3. **No Mo authorization required** for the standard flow — agents and teams can invoke freely.
4. PRs must pass review gates (CI green, conflict-free) before merge.

## Usage

```bash
# By PR numbers
/merge-to-develop [PR_NUMBERS]
/merge-to-develop 123
/merge-to-develop 123 456 789

# By GitHub URL — analyzes all open PRs targeting develop
/merge-to-develop https://github.com/org/repo/pulls

# Auto-find approved PRs
/merge-to-develop --all-approved

# From Cursor agent worktrees (via /repo-cleanup pipeline)
/merge-to-develop --from-worktrees

# Review only
/merge-to-develop --review-only
```

## Workflow

### Step 0: Base branch gate

#### If a GitHub URL is provided (lists open PRs for a repo)

```bash
# Example: https://github.com/imaginationeverywhere/ppsv-charities/pulls
# → resolve owner/repo, then fetch open PRs targeting develop
gh pr list --repo [owner]/[repo] --base develop --state open \
  --json number,title,state,mergeable,reviewDecision,headRefName,baseRefName,commits,additions,deletions,changedFiles,statusCheckRollup,reviews,labels,author

# Optional: PRs from worktrees / auto-claude style branches
gh pr list --repo [owner]/[repo] --state open --search "auto-claude in:head" \
  --json number,title,headRefName,reviewDecision,mergeable
```

#### For each PR under consideration (by number, or from the list above)

```bash
gh pr view [PR_NUMBER] --json number,title,baseRefName,headRefName,mergeable,reviewDecision,statusCheckRollup
```

Validate:
- `baseRefName == "develop"` → continue
- `baseRefName == "main"` → REJECT: "PR #[N] targets main. Use /merge-to-main (develop→main promotion) or /hotfix-to-main (emergency hotfix) instead."
- `headRefName == "develop"` → REJECT (can't merge develop into itself)

### Step 1: Per-PR pre-merge checks

- CI checks all green (or explicit override flag)
- No merge conflicts (`mergeable == MERGEABLE`)
- Review decision ≠ CHANGES_REQUESTED

2. **Status checks** — All required CI checks pass (no failing or long-pending required checks).
3. **Review status** — At least one approval when policy requires it; no unresolved `CHANGES_REQUESTED` unless explicitly overridden.
4. **Merge conflicts** — `mergeable` is mergeable; if not, report and point to **Conflict resolution** (below).
5. **Code review (spot check)** — Diff sanity: quality, tests, docs, breaking changes to `develop`.

### Step 2: Generate review report

```markdown
## PR Merge Review Report (Develop)

### PR #[NUMBER]: [TITLE]
- **Branch:** [head] → develop
- **Type:** [feature/fix/chore/auto-claude]
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

### Step 3: Merge approved PRs

For each PR that passes checks:

```bash
gh pr merge [PR_NUMBER] --squash --delete-branch --repo [owner]/[repo]
```

- Default: `--squash --delete-branch` (keeps develop history clean; agent branches discarded)
- Override: `--no-squash` to preserve individual commit history

### Step 4: Post-merge

```bash
git fetch origin develop
git checkout develop && git pull origin develop
```

Report: PRs merged, PRs skipped (with reason), PRs blocked (with blocker).

## Worktree integration

When `--from-worktrees`:
- Scans `.claude/worktrees/agent-*` for branches with completed work + open PRs
- Applies the same base-branch gate (must target develop)
- Auto-merges ready PRs, skips blocked
- Pairs with `/repo-cleanup` for post-merge worktree teardown

## REJECTS

- PRs where base = `main` → "Use /merge-to-main or /hotfix-to-main"
- PRs where head = `develop` (self-merge attempt)
- PRs with failing CI
- PRs with unresolved merge conflicts
- PRs with CHANGES_REQUESTED

## Related

- `/merge-to-main` — develop → main release promotion (Mo-authorized)
- `/hotfix-to-main` — emergency direct-to-main (Mo-approved)
- `/queue-prompt` — queue work for agents
- `/pickup-prompt` — agent picks up + worktree + PR
- `/review-code` — PR review before merge
- `/repo-cleanup` — merge worktree PRs + cleanup

## Why this exists

Standardized git workflow locks every repo to `main + develop` only with a fixed four-command flow. See `decision-standardized-git-workflow-simple.md`.

## Auto-claude branches (from Auto Claude builds)

```bash
# Find all auto-claude branches
git branch -a | grep "auto-claude/"

# Check each for QA completion
# Look for qa_report.md with "PASSED" status

# Create PRs for completed branches
for branch in $(git branch | grep "auto-claude/"); do
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

PR #204: auto-claude/008-donation-model
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
# Find auto-claude PRs
gh pr list --base develop --state open --search "auto-claude in:title" --json number,title
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
- **Type:** [feature/fix/chore/auto-claude]
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

#### PR #204: auto-claude/008-donation-model
- **Status:** All checks passing, QA sign-off
- **Changes:** +234 -0 (6 files)
- **Source:** Auto-Claude worktree
- **Action:** Ready for `/merge-to-develop 204`

#### PR #207: auto-claude/012-payment-integration
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
