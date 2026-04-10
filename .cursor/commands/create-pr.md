# Create PR Command

> **Command:** `/create-pr`
> **Version:** 1.0.0
> **Category:** Git Workflow
> **Related:** merge-to-main, merge-to-develop, pr-merge-manager agent

## Overview

Create pull requests targeting develop or main branches, with support for creating new branches and working with Auto-Claude worktrees.

## Usage

```bash
# Create PR from current branch to develop
/create-pr --to develop

# Create PR from current branch to main
/create-pr --to main

# Create PR with specific title and description
/create-pr --to develop --title "Add user authentication" --body "Implements login/logout"

# Create new branch first, then PR
/create-pr --new-branch feature/payment-processing --to develop

# Create PR from worktree branch
/create-pr --from-worktree [WORKTREE_ID] --to develop

# Create PRs from all ready worktrees
/create-pr --from-all-worktrees --to develop

# Create PR with draft status
/create-pr --to develop --draft

# Create PR with reviewers
/create-pr --to develop --reviewer @username1 --reviewer @username2

# Create PR with labels
/create-pr --to develop --label "enhancement" --label "frontend"

# Dry run - show what would be created
/create-pr --to develop --dry-run
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--to <branch>` | Target branch (develop/main) | Required |
| `--from <branch>` | Source branch | Current branch |
| `--new-branch <name>` | Create new branch first | - |
| `--from-worktree <id>` | Create PR from specific worktree | - |
| `--from-all-worktrees` | Create PRs from all ready worktrees | - |
| `--title <text>` | PR title | Auto-generated |
| `--body <text>` | PR description | Auto-generated |
| `--draft` | Create as draft PR | false |
| `--reviewer <user>` | Add reviewer (repeatable) | - |
| `--label <name>` | Add label (repeatable) | - |
| `--dry-run` | Preview without creating | false |

## Workflow

### Phase 1: Pre-flight Checks

```bash
# 1. Verify git status
gh auth status
git status

# 2. Verify target branch exists
git fetch origin
git branch -r | grep "origin/$TARGET_BRANCH"

# 3. Check for uncommitted changes
git diff --stat
git diff --cached --stat
```

### Phase 2: Branch Preparation

#### Standard Branch (Current)
```bash
# Ensure branch is pushed
git push -u origin $(git branch --show-current)
```

#### New Branch Creation
```bash
# Create and switch to new branch
git checkout -b $NEW_BRANCH_NAME

# Stage and commit if there are changes
git add .
git commit -m "feat: initial commit for $NEW_BRANCH_NAME"

# Push new branch
git push -u origin $NEW_BRANCH_NAME
```

#### From Worktree
```bash
# Get worktree branch info
WORKTREE_PATH=$(git worktree list | grep $WORKTREE_ID | awk '{print $1}')
WORKTREE_BRANCH=$(git -C $WORKTREE_PATH branch --show-current)

# Ensure worktree changes are committed
git -C $WORKTREE_PATH status
git -C $WORKTREE_PATH push -u origin $WORKTREE_BRANCH
```

### Phase 3: PR Creation

```bash
# Generate PR title if not provided
if [ -z "$TITLE" ]; then
  # Use branch name or last commit message
  TITLE=$(git log -1 --pretty=%s)
fi

# Generate PR body if not provided
if [ -z "$BODY" ]; then
  BODY=$(cat <<'EOF'
## Summary
<!-- Brief description of changes -->

## Changes
<!-- List key changes -->

## Testing
<!-- How to test these changes -->

## Checklist
- [ ] Tests pass locally
- [ ] Code follows project conventions
- [ ] Documentation updated if needed

---
🤖 Generated with [Claude Code](https://claude.ai/code)
EOF
)
fi

# Create PR
gh pr create \
  --base $TARGET_BRANCH \
  --head $SOURCE_BRANCH \
  --title "$TITLE" \
  --body "$BODY" \
  $DRAFT_FLAG \
  $REVIEWER_FLAGS \
  $LABEL_FLAGS
```

### Phase 4: Post-Creation

```bash
# Get PR number and URL
PR_URL=$(gh pr view --json url -q '.url')
PR_NUMBER=$(gh pr view --json number -q '.number')

# Display PR info
gh pr view $PR_NUMBER

# Run CI status check
gh pr checks $PR_NUMBER
```

## Output Format

### PR Creation Report

```markdown
## PR Created Successfully

### PR Details
- **Number:** #[NUMBER]
- **Title:** [TITLE]
- **URL:** [URL]
- **Source:** [SOURCE_BRANCH]
- **Target:** [TARGET_BRANCH]
- **Status:** [OPEN/DRAFT]

### Branch Info
- **Commits:** [COUNT] commits ahead of [TARGET]
- **Files Changed:** [COUNT]
- **Additions:** +[ADD]
- **Deletions:** -[DEL]

### Reviewers
- @[reviewer1]
- @[reviewer2]

### Labels
- [label1]
- [label2]

### Next Steps
1. Wait for CI checks to pass
2. Request reviews if not auto-assigned
3. Address review feedback
4. Merge when approved: `/merge-to-[TARGET] [NUMBER]`
```

### Batch PR Creation Report (from worktrees)

```markdown
## Batch PR Creation Report

### Created PRs
| # | Branch | Target | Title | Status |
|---|--------|--------|-------|--------|
| 123 | feature/auth | develop | Add authentication | Open |
| 124 | feature/payments | develop | Payment processing | Draft |
| 125 | fix/login-bug | develop | Fix login redirect | Open |

### Summary
- **Total Created:** X PRs
- **Open:** Y PRs
- **Draft:** Z PRs

### Skipped Worktrees
- worktree-abc: No commits ahead of target
- worktree-xyz: Uncommitted changes present
```

## Auto-Generated Titles

When `--title` is not provided, titles are auto-generated based on:

1. **Branch Name Pattern:**
   - `feature/add-user-auth` → "Add user auth"
   - `fix/login-redirect` → "Fix login redirect"
   - `chore/update-deps` → "Update deps"

2. **Conventional Commits:**
   - Uses last commit message if it follows conventional format
   - `feat: add shopping cart` → "feat: add shopping cart"

3. **Fallback:**
   - Branch name with slashes replaced by spaces

## Auto-Generated Body

When `--body` is not provided:

1. **Analyze Commits:**
   ```bash
   # Get commits not in target
   git log origin/$TARGET..HEAD --oneline
   ```

2. **Extract Changed Files:**
   ```bash
   git diff origin/$TARGET --stat
   ```

3. **Detect Patterns:**
   - Tests added? Add testing section
   - Migrations present? Add database section
   - UI changes? Add screenshot placeholder

## Worktree Integration

### List Ready Worktrees
```bash
# Show worktrees with their PR status
git worktree list --porcelain | while read line; do
  # Extract worktree info
  # Check if branch is pushed
  # Check if PR already exists
done
```

### Worktree PR Status
```markdown
## Worktree Status

| ID | Branch | Pushed | PR Exists | Ready |
|----|--------|--------|-----------|-------|
| abc123 | feature/auth | ✅ | ❌ | ✅ Ready |
| def456 | feature/pay | ✅ | #123 | ⏭️ Exists |
| ghi789 | fix/bug | ❌ | ❌ | ⚠️ Not pushed |
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "No commits" | Branch same as target | Make commits first |
| "PR already exists" | PR open for branch | Use existing PR |
| "Branch not pushed" | Local only | Push branch first |
| "Uncommitted changes" | Dirty working tree | Commit or stash |
| "Target doesn't exist" | Invalid base branch | Use develop or main |

## Integration with Project Commands

### With bootstrap-project
```bash
# After bootstrap creates feature branches
/create-pr --from-all-worktrees --to develop --draft

# Review each PR
/merge-to-develop --all-approved
```

### With project-mvp-status
```bash
# Create PR for completed feature
/create-pr --to develop --title "Complete user auth feature"

# Check PR in MVP status
/project-mvp-status --quick
```

### With project-status
```bash
# Create release PR
/create-pr --to main --title "Release v1.2.0" --from develop
```

## Examples

### Example 1: Simple Feature PR
```bash
# On feature/shopping-cart branch
/create-pr --to develop

# Output:
# ✅ PR #45 created: "Shopping cart implementation"
# URL: https://github.com/org/repo/pull/45
```

### Example 2: New Branch with PR
```bash
/create-pr --new-branch feature/user-profiles --to develop --draft

# Output:
# ✅ Branch 'feature/user-profiles' created
# ✅ Draft PR #46 created
# URL: https://github.com/org/repo/pull/46
```

### Example 3: Batch from Worktrees
```bash
/create-pr --from-all-worktrees --to develop

# Output:
# ✅ Created 3 PRs from worktrees:
#    - #47: feature/auth (abc123)
#    - #48: feature/payments (def456)
#    - #49: fix/validation (ghi789)
# ⏭️ Skipped 2 worktrees (already have PRs)
```

### Example 4: Release to Main
```bash
/create-pr --to main --from develop --title "Release v2.0.0" \
  --label "release" --reviewer @lead-dev

# Output:
# ✅ PR #50 created: "Release v2.0.0"
# 📋 Reviewer @lead-dev assigned
# 🏷️ Label 'release' added
```

## Best Practices

1. **Always target develop first** - Features go to develop, then develop to main
2. **Use draft for WIP** - Create drafts for early feedback
3. **Add reviewers early** - Don't wait until the last minute
4. **Use meaningful titles** - Helps with release notes
5. **Include testing info** - How can reviewers verify?
6. **Link issues** - Reference related issues in body

## Related Commands

- `/merge-to-main` - Merge PRs to production
- `/merge-to-develop` - Merge PRs to integration
- `/project-mvp-status` - Track PR metrics
- `/project-status` - Post-MVP PR tracking

## Agent Integration

This command is supported by the `pr-merge-manager` agent which provides:
- Intelligent title generation
- Commit analysis for body generation
- Worktree status tracking
- PR lifecycle management

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-29 | Initial release |
