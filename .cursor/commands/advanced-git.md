# advanced-git

**Purpose**: Comprehensive git workflow management for enterprise development including fork synchronization, rebasing strategies, release branches, branch protection, and git hooks

**Context**: This command provides sophisticated git operations for teams working with forked repositories, managing complex release workflows, implementing branch protection strategies, and automating quality controls through git hooks. Ideal for open-source contributions, enterprise monorepo management, and production release coordination.

## Command Usage

**Claude Code Commands**:
```bash
advanced-git fork-sync                      # Sync fork with upstream repository
advanced-git rebase-interactive            # Interactive rebase workflow
advanced-git release-branch                # Create and manage release branches
advanced-git setup-hooks                   # Configure git hooks for quality control
advanced-git branch-protection             # Set up branch protection rules
advanced-git workflow --strategy=git-flow  # Implement git-flow workflow
advanced-git workflow --strategy=trunk     # Implement trunk-based development
```

**npm Scripts**:
```bash
npm run git:fork-sync                      # Sync fork with upstream
npm run git:rebase                         # Interactive rebase helper
npm run git:release                        # Release branch management
npm run git:hooks                          # Git hooks setup and management
npm run git:protect-branches               # Branch protection configuration
```

## Core Functionality

### 1. **Fork Repository Management**

#### Fork Synchronization

**Initial Fork Setup**:
```bash
# Add upstream remote
git remote add upstream git@github.com:original-org/original-repo.git

# Verify remotes
git remote -v
# origin    git@github.com:your-username/forked-repo.git (fetch)
# upstream  git@github.com:original-org/original-repo.git (fetch)
```

**Sync Fork with Upstream**:
```bash
# Fetch upstream changes
git fetch upstream

# Checkout your main branch
git checkout main

# Merge upstream changes
git merge upstream/main

# Push to your fork
git push origin main
```

**Keep Feature Branch Updated**:
```bash
# Rebase feature branch on latest upstream
git checkout feature/your-feature
git fetch upstream
git rebase upstream/main

# Handle conflicts if needed
git rebase --continue

# Force push to your fork (safe for feature branches)
git push origin feature/your-feature --force-with-lease
```

#### Pull Request Workflow

**Create PR-Ready Branch**:
```bash
# Create feature branch from latest upstream
git fetch upstream
git checkout -b feature/new-feature upstream/main

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to your fork
git push origin feature/new-feature
```

**Update PR Based on Review**:
```bash
# Make requested changes
git add .
git commit -m "fix: address review comments"

# Squash commits before merge (optional)
git rebase -i upstream/main
# Mark commits as 'squash' or 'fixup' in editor

# Update PR
git push origin feature/new-feature --force-with-lease
```

**Sync PR with Upstream Changes**:
```bash
# Fetch latest upstream
git fetch upstream

# Rebase your feature on latest upstream
git rebase upstream/main

# Resolve conflicts if any
git add <resolved-files>
git rebase --continue

# Update PR
git push origin feature/new-feature --force-with-lease
```

### 2. **Interactive Rebasing Strategies**

#### Basic Interactive Rebase

**Clean Up Commit History**:
```bash
# Interactive rebase last 5 commits
git rebase -i HEAD~5

# Interactive rebase from specific commit
git rebase -i abc123def

# Rebase on target branch
git rebase -i main
```

**Rebase Editor Commands**:
```
pick abc123 feat: add user authentication
squash def456 fix: typo in auth
fixup ghi789 fix: linting errors
reword jkl012 feat: implement login form
edit mno345 feat: add password reset
drop pqr678 WIP: debugging code
```

**Command Meanings**:
- **pick** - Keep commit as-is
- **reword** - Keep commit but edit message
- **edit** - Stop to amend commit
- **squash** - Combine with previous commit, edit message
- **fixup** - Combine with previous commit, discard message
- **drop** - Remove commit entirely

#### Advanced Rebase Workflows

**Split a Commit**:
```bash
# Start interactive rebase
git rebase -i HEAD~3

# Mark commit to split as 'edit'
# When rebase stops at that commit:
git reset HEAD^
git add file1.js
git commit -m "feat: add feature part 1"
git add file2.js
git commit -m "feat: add feature part 2"
git rebase --continue
```

**Combine Multiple Commits**:
```bash
# Rebase interactively
git rebase -i HEAD~5

# In editor, squash all commits into first:
pick abc123 feat: implement feature
squash def456 feat: add tests
squash ghi789 fix: address review
squash jkl012 docs: update README

# Edit combined commit message when prompted
```

**Autosquash Workflow**:
```bash
# Make a commit to squash later
git commit -m "fixup! feat: implement feature"

# Auto-squash during rebase
git rebase -i --autosquash HEAD~10
# Commits marked 'fixup!' automatically squashed
```

### 3. **Release Branch Management**

#### Git-Flow Strategy

**Initialize Git-Flow**:
```bash
# Install git-flow (if needed)
# macOS: brew install git-flow
# Linux: apt-get install git-flow

# Initialize git-flow
git flow init
# Accept defaults: main for production, develop for development
```

**Feature Branch Workflow**:
```bash
# Start new feature
git flow feature start user-dashboard

# Work on feature
git add .
git commit -m "feat: add dashboard components"

# Finish feature (merges to develop)
git flow feature finish user-dashboard
```

**Release Branch Workflow**:
```bash
# Start release branch
git flow release start 1.5.0

# Update version numbers
npm version 1.5.0
git add package.json package-lock.json
git commit -m "chore: bump version to 1.5.0"

# Update CHANGELOG.md
# Make final adjustments

# Finish release (merges to main and develop, tags)
git flow release finish 1.5.0
git push origin main develop --tags
```

**Hotfix Workflow**:
```bash
# Start hotfix from main
git flow hotfix start 1.5.1

# Fix critical bug
git add .
git commit -m "fix: resolve critical security issue"

# Finish hotfix (merges to main and develop, tags)
git flow hotfix finish 1.5.1
git push origin main develop --tags
```

#### Trunk-Based Development

**Main Branch as Source of Truth**:
```bash
# Create short-lived feature branch
git checkout -b feature/quick-fix main

# Make changes (keep branch life < 1 day)
git add .
git commit -m "feat: add quick improvement"

# Rebase on latest main
git fetch origin
git rebase origin/main

# Merge to main (fast-forward preferred)
git checkout main
git merge --ff-only feature/quick-fix
git push origin main

# Delete feature branch
git branch -d feature/quick-fix
```

**Feature Flags for Large Features**:
```javascript
// Use feature flags for incomplete features
const FEATURE_FLAGS = {
  newDashboard: process.env.FEATURE_NEW_DASHBOARD === 'true',
  paymentV2: process.env.FEATURE_PAYMENT_V2 === 'true'
};

function renderDashboard() {
  if (FEATURE_FLAGS.newDashboard) {
    return <NewDashboard />;
  }
  return <LegacyDashboard />;
}
```

**Release Tagging**:
```bash
# Tag release on main
git tag -a v1.5.0 -m "Release version 1.5.0"
git push origin v1.5.0

# Create release branch for maintenance
git checkout -b release/1.5.x v1.5.0
git push origin release/1.5.x
```

#### Release Branch Maintenance

**Cherry-Pick Fixes to Release**:
```bash
# Fix applied to main
git checkout main
git commit -m "fix: resolve bug in feature X"

# Cherry-pick to release branch
git checkout release/1.5.x
git cherry-pick abc123def
git push origin release/1.5.x

# Tag patch release
git tag -a v1.5.1 -m "Patch release 1.5.1"
git push origin v1.5.1
```

**Multiple Release Branch Support**:
```bash
# Maintain multiple release versions
git branch
  main
  release/1.4.x    # LTS support
  release/1.5.x    # Current stable
  release/2.0.x    # Next major

# Apply security fix to all supported versions
for branch in release/1.4.x release/1.5.x release/2.0.x; do
  git checkout $branch
  git cherry-pick <security-fix-commit>
  git push origin $branch
done
```

### 4. **Branch Protection Setup**

#### GitHub Branch Protection Rules

**Protect Main Branch**:
```bash
# Via GitHub API
curl -X PUT \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/OWNER/REPO/branches/main/protection \
  -d '{
    "required_status_checks": {
      "strict": true,
      "contexts": ["ci/test", "ci/lint", "ci/build"]
    },
    "enforce_admins": true,
    "required_pull_request_reviews": {
      "dismissal_restrictions": {},
      "dismiss_stale_reviews": true,
      "require_code_owner_reviews": true,
      "required_approving_review_count": 2
    },
    "restrictions": null,
    "required_linear_history": true,
    "allow_force_pushes": false,
    "allow_deletions": false
  }'
```

**GitHub CODEOWNERS File**:
```bash
# .github/CODEOWNERS
# Global owners
* @team-leads

# Frontend code
/frontend/** @frontend-team
/frontend/src/components/** @ui-team

# Backend code
/backend/** @backend-team
/backend/src/auth/** @security-team

# Infrastructure
/infrastructure/** @devops-team
/.github/workflows/** @devops-team

# Documentation
/docs/** @tech-writers
*.md @tech-writers

# Configuration
package.json @tech-leads
tsconfig.json @tech-leads
```

#### GitLab Branch Protection

**Protected Branches Configuration**:
```bash
# Via GitLab API
curl -X POST \
  -H "PRIVATE-TOKEN: ${GITLAB_TOKEN}" \
  "https://gitlab.com/api/v4/projects/PROJECT_ID/protected_branches?name=main&push_access_level=40&merge_access_level=30&unprotect_access_level=40"

# push_access_level: 40 (Maintainer)
# merge_access_level: 30 (Developer)
# unprotect_access_level: 40 (Maintainer)
```

#### Local Branch Protection

**Pre-Push Hook Protection**:
```bash
#!/bin/bash
# .git/hooks/pre-push

protected_branches=("main" "develop" "release/*")
current_branch=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')

for pattern in "${protected_branches[@]}"; do
  if [[ "$current_branch" == $pattern ]]; then
    echo "❌ Direct push to $current_branch is not allowed!"
    echo "Please create a feature branch and submit a pull request."
    exit 1
  fi
done
```

### 5. **Git Hooks Management**

#### Pre-Commit Hooks

**Quality Control Hook**:
```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "🔍 Running pre-commit checks..."

# 1. Lint staged files
echo "📝 Linting code..."
npm run lint:staged
if [ $? -ne 0 ]; then
  echo "❌ Linting failed. Please fix errors before committing."
  exit 1
fi

# 2. Type checking
echo "🔍 Type checking..."
npm run type-check
if [ $? -ne 0 ]; then
  echo "❌ Type checking failed. Please fix type errors."
  exit 1
fi

# 3. Run tests on changed files
echo "🧪 Running tests..."
npm run test:staged
if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Please fix failing tests."
  exit 1
fi

# 4. Check for secrets
echo "🔒 Checking for secrets..."
if git diff --cached | grep -iE '(api[_-]?key|password|secret|token|private[_-]?key).*='; then
  echo "❌ Potential secret detected! Please remove before committing."
  exit 1
fi

# 5. Check for debug statements
echo "🐛 Checking for debug statements..."
if git diff --cached | grep -E '(console\.log|debugger|console\.debug)'; then
  echo "⚠️  Warning: Debug statements detected. Remove before committing."
  echo "Continue anyway? (y/n)"
  read -r response
  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo "✅ Pre-commit checks passed!"
```

#### Commit-Msg Hook

**Conventional Commits Validation**:
```bash
#!/bin/bash
# .git/hooks/commit-msg

commit_msg_file=$1
commit_msg=$(cat "$commit_msg_file")

# Conventional commits pattern
pattern='^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9-]+\))?: .{1,100}'

if ! echo "$commit_msg" | grep -qE "$pattern"; then
  echo "❌ Invalid commit message format!"
  echo ""
  echo "Commit message must follow Conventional Commits:"
  echo "  <type>(<scope>): <subject>"
  echo ""
  echo "Examples:"
  echo "  feat(auth): add OAuth login"
  echo "  fix(api): resolve CORS issue"
  echo "  docs: update README"
  echo ""
  echo "Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert"
  exit 1
fi

# Check for ticket reference
if ! echo "$commit_msg" | grep -qE '\[([A-Z]+-[0-9]+|#[0-9]+)\]'; then
  echo "⚠️  Warning: No ticket reference found (e.g., [PROJ-123] or [#123])"
  echo "Continue anyway? (y/n)"
  read -r response < /dev/tty
  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo "✅ Commit message validated!"
```

#### Pre-Push Hook

**Test and Build Verification**:
```bash
#!/bin/bash
# .git/hooks/pre-push

echo "🚀 Running pre-push checks..."

# 1. Run full test suite
echo "🧪 Running full test suite..."
npm run test:ci
if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Fix before pushing."
  exit 1
fi

# 2. Build verification
echo "🔨 Verifying build..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed. Fix before pushing."
  exit 1
fi

# 3. Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "⚠️  Warning: You have uncommitted changes."
  echo "Continue pushing anyway? (y/n)"
  read -r response < /dev/tty
  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo "✅ Pre-push checks passed!"
```

#### Husky Integration

**Modern Git Hooks with Husky**:
```bash
# Install Husky
npm install --save-dev husky
npx husky install

# Add prepare script to package.json
npm pkg set scripts.prepare="husky install"

# Create pre-commit hook
npx husky add .husky/pre-commit "npm run lint:staged"
npx husky add .husky/pre-commit "npm run type-check"

# Create commit-msg hook
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'

# Create pre-push hook
npx husky add .husky/pre-push "npm run test:ci"
npx husky add .husky/pre-push "npm run build"
```

**Commitlint Configuration**:
```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Formatting
        'refactor', // Code restructuring
        'perf',     // Performance
        'test',     // Tests
        'build',    // Build system
        'ci',       // CI configuration
        'chore',    // Maintenance
        'revert'    // Revert commit
      ]
    ],
    'scope-case': [2, 'always', 'kebab-case'],
    'subject-case': [2, 'always', 'sentence-case'],
    'subject-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 150],
    'footer-max-line-length': [2, 'always', 150]
  }
};
```

### 6. **Advanced Git Operations**

#### Cherry-Pick Workflows

**Cherry-Pick Single Commit**:
```bash
# Pick commit from another branch
git cherry-pick abc123def

# Cherry-pick with custom message
git cherry-pick abc123def --edit

# Cherry-pick without committing (review changes first)
git cherry-pick abc123def --no-commit
git diff --cached
git commit
```

**Cherry-Pick Range**:
```bash
# Cherry-pick range of commits (exclusive start)
git cherry-pick abc123..def456

# Cherry-pick range (inclusive)
git cherry-pick abc123^..def456
```

**Handle Cherry-Pick Conflicts**:
```bash
# Conflicts during cherry-pick
git cherry-pick abc123def
# ... conflicts occur ...

# Resolve conflicts
git add <resolved-files>
git cherry-pick --continue

# Or abort
git cherry-pick --abort
```

#### Git Bisect for Bug Hunting

**Find Bug Introduction Commit**:
```bash
# Start bisect
git bisect start

# Mark current state as bad
git bisect bad

# Mark known good commit
git bisect good v1.4.0

# Git checks out middle commit, test it
npm test
# If tests pass:
git bisect good
# If tests fail:
git bisect bad

# Repeat until git finds the bad commit
# Git will report: "abc123def is the first bad commit"

# End bisect
git bisect reset
```

**Automated Bisect**:
```bash
# Run bisect with automated test
git bisect start HEAD v1.4.0
git bisect run npm test

# Git automatically finds bad commit
git bisect reset
```

#### Reflog Recovery

**Recover Lost Commits**:
```bash
# View reflog history
git reflog

# Find lost commit
git reflog show HEAD@{5}

# Recover commit
git checkout HEAD@{5}
git checkout -b recovery-branch

# Or reset to that state
git reset --hard HEAD@{5}
```

**Recover Deleted Branch**:
```bash
# Find branch in reflog
git reflog | grep "branch-name"

# Recreate branch
git checkout -b branch-name HEAD@{12}
```

#### Stash Advanced Usage

**Stash with Message**:
```bash
# Stash with descriptive message
git stash push -m "WIP: implementing new feature"

# Stash specific files
git stash push -m "WIP: auth changes" src/auth/**

# Stash including untracked files
git stash push -u -m "WIP: with new files"
```

**Stash Management**:
```bash
# List stashes
git stash list

# Apply specific stash
git stash apply stash@{2}

# Pop stash (apply and remove)
git stash pop

# Create branch from stash
git stash branch feature/from-stash stash@{1}

# Drop specific stash
git stash drop stash@{2}

# Clear all stashes
git stash clear
```

### 7. **Team Collaboration Patterns**

#### Code Review Workflow

**Request Code Review**:
```bash
# Create feature branch
git checkout -b feature/user-profile

# Push to remote
git push -u origin feature/user-profile

# Create PR via GitHub CLI
gh pr create \
  --title "feat: add user profile page" \
  --body "$(cat <<EOF
## Summary
Implements user profile page with avatar upload and bio editing.

## Changes
- Added ProfilePage component
- Integrated avatar upload with S3
- Added bio editing with validation

## Testing
- Unit tests for ProfilePage component
- E2E tests for profile workflow
- Manual testing on staging

## Screenshots
![Profile Page](https://example.com/screenshot.png)

Closes #123
EOF
)" \
  --reviewer @teammate1,@teammate2 \
  --label enhancement
```

**Address Review Comments**:
```bash
# Make requested changes
git add .
git commit -m "fix: address PR review comments"

# Request re-review
gh pr review --approve

# Add comment to PR
gh pr comment --body "Updated based on feedback. PTAL!"
```

#### Merge Strategies

**Squash Merge (Clean History)**:
```bash
# Squash all feature commits into one
git checkout main
git merge --squash feature/user-profile
git commit -m "feat: add user profile page

- Added ProfilePage component
- Integrated avatar upload
- Added bio editing

Closes #123"
```

**Rebase and Merge (Linear History)**:
```bash
# Rebase feature on latest main
git checkout feature/user-profile
git rebase main

# Merge with fast-forward
git checkout main
git merge --ff-only feature/user-profile
```

**Merge Commit (Preserve History)**:
```bash
# Create merge commit
git checkout main
git merge --no-ff feature/user-profile
```

#### Conflict Resolution

**Resolve Merge Conflicts**:
```bash
# Start merge
git merge feature/other-branch
# Conflicts occur

# Check conflict status
git status

# Use merge tool
git mergetool

# Or manually edit conflicts
# <<<<<<< HEAD
# Current changes
# =======
# Incoming changes
# >>>>>>> feature/other-branch

# Mark as resolved
git add <resolved-files>
git commit
```

**Rerere (Reuse Recorded Resolution)**:
```bash
# Enable rerere
git config --global rerere.enabled true

# Git remembers how you resolved conflicts
# Next time same conflict occurs, auto-applies resolution
```

## Implementation Scripts

### Fork Sync Script

```javascript
// scripts/fork-sync.js
const { execSync } = require('child_process');

function syncFork(options = {}) {
  const { branch = 'main', upstream = 'upstream' } = options;

  console.log('🔄 Syncing fork with upstream...\n');

  try {
    // Fetch upstream
    console.log('📥 Fetching upstream changes...');
    execSync(`git fetch ${upstream}`, { stdio: 'inherit' });

    // Checkout branch
    console.log(`\n🔀 Checking out ${branch}...`);
    execSync(`git checkout ${branch}`, { stdio: 'inherit' });

    // Merge upstream
    console.log(`\n⬇️  Merging ${upstream}/${branch}...`);
    execSync(`git merge ${upstream}/${branch}`, { stdio: 'inherit' });

    // Push to fork
    console.log('\n⬆️  Pushing to origin...');
    execSync(`git push origin ${branch}`, { stdio: 'inherit' });

    console.log('\n✅ Fork synced successfully!');
  } catch (error) {
    console.error('\n❌ Fork sync failed:', error.message);
    process.exit(1);
  }
}

module.exports = { syncFork };

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const branch = args[0] || 'main';
  syncFork({ branch });
}
```

### Release Branch Script

```javascript
// scripts/release-branch.js
const { execSync } = require('child_process');
const fs = require('fs');

function createRelease(version, options = {}) {
  const { changelog = true, tag = true } = options;

  console.log(`🚀 Creating release branch for v${version}\n`);

  try {
    // Create release branch
    console.log('🌿 Creating release branch...');
    execSync(`git checkout -b release/${version}`, { stdio: 'inherit' });

    // Update version in package.json
    console.log('\n📝 Updating version...');
    execSync(`npm version ${version} --no-git-tag-version`, { stdio: 'inherit' });

    // Update CHANGELOG if enabled
    if (changelog) {
      console.log('\n📋 Update CHANGELOG.md with release notes');
      // Pause for manual CHANGELOG update
      execSync('read -p "Press enter when CHANGELOG is updated..."', {
        stdio: 'inherit',
        shell: '/bin/bash'
      });
    }

    // Commit version bump
    console.log('\n💾 Committing version bump...');
    execSync('git add package.json package-lock.json CHANGELOG.md', { stdio: 'inherit' });
    execSync(`git commit -m "chore: release v${version}"`, { stdio: 'inherit' });

    // Tag release if enabled
    if (tag) {
      console.log('\n🏷️  Creating release tag...');
      execSync(`git tag -a v${version} -m "Release v${version}"`, { stdio: 'inherit' });
    }

    console.log(`\n✅ Release branch release/${version} created!`);
    console.log('\nNext steps:');
    console.log(`  1. Push branch: git push origin release/${version}`);
    if (tag) {
      console.log(`  2. Push tag: git push origin v${version}`);
    }
    console.log('  3. Create PR to main');
  } catch (error) {
    console.error('\n❌ Release creation failed:', error.message);
    process.exit(1);
  }
}

module.exports = { createRelease };

// CLI usage
if (require.main === module) {
  const version = process.argv[2];
  if (!version) {
    console.error('Usage: node release-branch.js <version>');
    process.exit(1);
  }
  createRelease(version);
}
```

### Git Hooks Setup Script

```javascript
// scripts/setup-git-hooks.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const hooks = {
  'pre-commit': `#!/bin/bash
echo "🔍 Running pre-commit checks..."

npm run lint:staged
if [ $? -ne 0 ]; then
  echo "❌ Linting failed"
  exit 1
fi

npm run type-check
if [ $? -ne 0 ]; then
  echo "❌ Type checking failed"
  exit 1
fi

echo "✅ Pre-commit checks passed!"
`,

  'commit-msg': `#!/bin/bash
commit_msg_file=$1
commit_msg=$(cat "$commit_msg_file")

pattern='^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\\([a-z0-9-]+\\))?: .{1,100}'

if ! echo "$commit_msg" | grep -qE "$pattern"; then
  echo "❌ Invalid commit message format!"
  echo "Use: <type>(<scope>): <subject>"
  exit 1
fi

echo "✅ Commit message validated!"
`,

  'pre-push': `#!/bin/bash
echo "🚀 Running pre-push checks..."

npm run test:ci
if [ $? -ne 0 ]; then
  echo "❌ Tests failed"
  exit 1
fi

npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi

echo "✅ Pre-push checks passed!"
`
};

function setupGitHooks() {
  console.log('🎣 Setting up git hooks...\n');

  const hooksDir = path.join(process.cwd(), '.git', 'hooks');

  for (const [hookName, hookContent] of Object.entries(hooks)) {
    const hookPath = path.join(hooksDir, hookName);

    console.log(`📝 Creating ${hookName}...`);
    fs.writeFileSync(hookPath, hookContent, { mode: 0o755 });
  }

  console.log('\n✅ Git hooks installed successfully!');
  console.log('\nInstalled hooks:');
  console.log('  - pre-commit: Lint and type-check');
  console.log('  - commit-msg: Validate conventional commits');
  console.log('  - pre-push: Run tests and build');
}

module.exports = { setupGitHooks };

if (require.main === module) {
  setupGitHooks();
}
```

## Configuration

### Advanced Git Config

```bash
# Enhanced git configuration
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Default branch name
git config --global init.defaultBranch main

# Rebase on pull
git config --global pull.rebase true

# Prune on fetch
git config --global fetch.prune true

# Rerere (reuse recorded resolution)
git config --global rerere.enabled true

# Auto-stash during rebase
git config --global rebase.autoStash true

# Show original in conflicts
git config --global merge.conflictStyle diff3

# Better diff algorithm
git config --global diff.algorithm histogram

# Colorful output
git config --global color.ui auto

# Aliases for common operations
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual 'log --oneline --graph --decorate --all'
```

### Project Git Config

```bash
# .gitconfig (project-specific)
[core]
    autocrlf = input
    safecrlf = warn
    excludesfile = ~/.gitignore_global

[branch]
    autosetupmerge = true
    autosetuprebase = always

[push]
    default = current
    followTags = true

[pull]
    rebase = true

[rebase]
    autoStash = true
    autoSquash = true

[merge]
    ff = false
    conflictStyle = diff3

[diff]
    algorithm = histogram
    colorMoved = zebra

[rerere]
    enabled = true
    autoUpdate = true
```

## Usage Examples

### Complete Fork Contribution Workflow

```bash
# 1. Fork repository on GitHub/GitLab

# 2. Clone your fork
git clone git@github.com:your-username/project.git
cd project

# 3. Add upstream remote
git remote add upstream git@github.com:original-org/project.git

# 4. Sync with upstream
advanced-git fork-sync

# 5. Create feature branch
git checkout -b feature/awesome-feature

# 6. Make changes and commit
git add .
git commit -m "feat: add awesome feature"

# 7. Keep branch updated
git fetch upstream
git rebase upstream/main

# 8. Push to your fork
git push origin feature/awesome-feature --force-with-lease

# 9. Create PR via GitHub CLI
gh pr create --fill

# 10. Address review feedback
git add .
git commit -m "fix: address review comments"
git push origin feature/awesome-feature
```

### Release Management Workflow

```bash
# 1. Create release branch
advanced-git release-branch --version 1.5.0

# 2. Update CHANGELOG.md
# Add release notes

# 3. Run final tests
npm run test:ci
npm run build

# 4. Push release branch
git push origin release/1.5.0
git push origin v1.5.0

# 5. Create PR to main
gh pr create --base main --head release/1.5.0 --title "Release v1.5.0"

# 6. Merge PR and deploy

# 7. Merge back to develop
git checkout develop
git merge main
git push origin develop
```

### Interactive Rebase Cleanup

```bash
# 1. Start interactive rebase
git rebase -i HEAD~10

# 2. In editor, organize commits:
pick abc123 feat: initial implementation
squash def456 fix: typo
squash ghi789 fix: linting
pick jkl012 test: add unit tests
fixup mno345 fix: test typo
pick pqr678 docs: update README
drop stu901 WIP: debugging

# 3. Save and exit editor

# 4. Edit commit messages as prompted

# 5. Force push to update PR
git push origin feature/branch --force-with-lease
```

## Integration with Development Workflow

### CI/CD Integration

```yaml
# .github/workflows/branch-protection.yml
name: Branch Protection

on:
  pull_request:
    branches: [main, develop]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Validate commit messages
        run: |
          git fetch origin ${{ github.base_ref }}
          npx commitlint --from origin/${{ github.base_ref }}

      - name: Run tests
        run: npm run test:ci

      - name: Build verification
        run: npm run build

      - name: Enforce branch naming
        run: |
          if [[ ! "${{ github.head_ref }}" =~ ^(feature|fix|hotfix|release)/.+ ]]; then
            echo "Invalid branch name. Use: feature/, fix/, hotfix/, or release/"
            exit 1
          fi
```

### Pre-Release Checklist

```markdown
## Pre-Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] No console.log or debugger statements
- [ ] No secrets in code
- [ ] Migration scripts tested
- [ ] Breaking changes documented
- [ ] Backward compatibility verified
- [ ] Performance benchmarks run
```

## Best Practices

### Fork Management
- Sync fork regularly (daily for active projects)
- Keep feature branches short-lived (< 1 week)
- Rebase on upstream before creating PRs
- Use `--force-with-lease` instead of `--force`

### Rebasing
- Never rebase public/shared branches
- Always rebase feature branches before merging
- Use `--autosquash` with fixup commits
- Test after every rebase

### Release Branches
- Maintain LTS releases with separate branches
- Cherry-pick fixes to release branches
- Tag all releases consistently
- Document release process

### Git Hooks
- Keep hooks fast (< 10 seconds)
- Make hooks skippable for emergencies
- Use Husky for cross-platform compatibility
- Test hooks before deploying to team

This command provides enterprise-grade git workflow management for teams handling complex repository structures and release processes.
