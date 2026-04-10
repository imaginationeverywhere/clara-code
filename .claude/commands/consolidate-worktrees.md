# consolidate-worktrees

Consolidate changes from multiple git worktrees into a single feature branch with integrated code review

## Usage

```bash
./scripts/consolidate-worktrees.sh [OPTIONS] WORKTREE_NAMES...
```

## Options

- `--branch=NAME` - Target branch name (default: feature/consolidation)
- `--review` - Run /review-code command after consolidation
- `--review-only` - Only run code review, skip consolidation
- `--no-commit` - Consolidate changes but don't create commit
- `--help` - Show help message

## Examples

### Consolidate three worktrees
```bash
./scripts/consolidate-worktrees.sh UtAlz qQApC Gf2TX
```

### Consolidate with code review
```bash
./scripts/consolidate-worktrees.sh --review UtAlz qQApC Gf2TX
```

### Consolidate into custom branch
```bash
./scripts/consolidate-worktrees.sh --branch=feature/my-feature UtAlz qQApC
```

### Review only (skip consolidation)
```bash
./scripts/consolidate-worktrees.sh --review-only
```

### Consolidate without creating commit
```bash
./scripts/consolidate-worktrees.sh --no-commit UtAlz qQApC Gf2TX
```

## Features

### Automatic Worktree Discovery
- Searches multiple common locations:
  - `~/.cursor/worktrees/[project]/[worktree-name]`
  - `../[worktree-name]` (relative to main repo)
  - `./[worktree-name]` (in repo root)

### Cherry-Pick Integration
- Automatically cherry-picks commits from worktrees
- Preserves commit history and messages
- Handles merge conflicts gracefully

### Code Review Integration
- Optional `/review-code` command execution
- Review-only mode for analyzing consolidations
- Integrated with Claude Code agent system

### Smart Branch Management
- Creates branch if it doesn't exist
- Switches to existing branch if present
- Shows comprehensive change summary

### Consolidated Commit
- Automatic commit creation with worktree references
- Lists all processed worktrees in commit message
- Optional `--no-commit` flag for manual control

## How It Works

### Step 1: Branch Preparation
- Creates or switches to target branch
- Validates branch status

### Step 2: Worktree Processing
For each worktree:
1. Locates worktree directory
2. Checks for commits not in main
3. Cherry-picks commits into target branch
4. Shows progress and handles conflicts

### Step 3: Consolidation
- Creates consolidated commit with all worktree info
- Shows summary of changes
- Lists modified files

### Step 4: Code Review (Optional)
- Runs `/review-code` command if requested
- Analyzes consolidated changes
- Integrates with Claude Code analysis

## Workflow Example

```bash
# 1. Consolidate parallel worktree development
./scripts/consolidate-worktrees.sh UtAlz qQApC Gf2TX

# 2. Review consolidated changes
./scripts/consolidate-worktrees.sh --review-only

# 3. Run migrations
./scripts/run-migrations-all-environments.sh --seed

# 4. Test changes
pnpm test

# 5. Push consolidated branch
git push origin feature/consolidation
```

## Integration with Code Review

The `--review` option automatically runs the `/review-code` command after consolidation. This command:

- Analyzes code quality across all files
- Identifies potential issues
- Provides improvement suggestions
- Integrates with Claude Code agents

**Setup Code Review Command:**

The `/review-code` command needs to be configured in your Claude Code environment. See `.claude/commands/review-code.md` for setup instructions.

## Requirements

- Bash shell (macOS/Linux)
- Git with worktree support
- Valid git repository with worktrees
- Optional: `/review-code` command for integrated review

## Troubleshooting

### "Worktree not found"

The script searches in these locations:
```
~/.cursor/worktrees/[project-name]/[worktree-name]
../[worktree-name]
./[worktree-name]
```

**Solution:** Make sure worktree name matches exactly:
```bash
# List available worktrees
git worktree list

# Use exact worktree identifier
./scripts/consolidate-worktrees.sh UtAlz qQApC Gf2TX
```

### Cherry-pick conflicts

**Problem:** "Conflict when cherry-picking"

**Solution:** Script automatically handles this by:
1. Detecting the conflict
2. Aborting the conflicting cherry-pick
3. Continuing with other commits

You can manually resolve and cherry-pick later:
```bash
git cherry-pick [commit-hash]
# ... resolve conflicts ...
git cherry-pick --continue
```

### "/review-code not found"

**Problem:** "command not found" when using `--review`

**Solution:** The `/review-code` command needs to be configured. For now, use `--review-only` to run review separately:

```bash
./scripts/consolidate-worktrees.sh UtAlz qQApC Gf2TX
./scripts/consolidate-worktrees.sh --review-only
```

## Best Practices

### 1. Backup Before Consolidation
```bash
git branch backup-$(date +%Y%m%d-%H%M%S)
```

### 2. Review Target Branch
```bash
# See what's already on the branch
git log --oneline main..feature/consolidation
```

### 3. Consolidate in Order
- Consolidate oldest worktrees first
- Run migrations after consolidation
- Run tests before pushing

### 4. Use Descriptive Branch Names
```bash
./scripts/consolidate-worktrees.sh \
  --branch=feature/fee-transparency \
  UtAlz qQApC Gf2TX
```

### 5. Review Before Committing
```bash
./scripts/consolidate-worktrees.sh --no-commit UtAlz qQApC
# Review changes
git diff
# Then commit manually if satisfied
git commit -m "..."
```

## Common Patterns

### Consolidate All Parallel Feature Work
```bash
./scripts/consolidate-worktrees.sh \
  --branch=feature/complete \
  --review \
  UtAlz qQApC Gf2TX
```

### Review Consolidation Before Committing
```bash
./scripts/consolidate-worktrees.sh \
  --no-commit \
  UtAlz qQApC Gf2TX

# Review changes
git status
git diff

# Create commit manually with review notes
git commit -m "feat: consolidate worktrees

Review: [paste /review-code output]
"
```

### Consolidate to Custom Branch
```bash
./scripts/consolidate-worktrees.sh \
  --branch=feature/holiday-menu \
  holiday-ui holiday-api holiday-db
```

## Related Commands

- `./scripts/run-migrations-all-environments.sh` - Run database migrations after consolidation
- `git worktree list` - List available worktrees
- `git cherry-pick` - Manual cherry-picking for conflicts
- `/review-code` - Integrated code analysis (when configured)

## Notes

- Script uses `/review-code` command if available
- Cherry-picks are non-destructive to source worktrees
- Consolidation creates new commits in target branch
- Use `--no-commit` for manual control over commit creation
- All output is color-coded for easy reading

## Location

**Boilerplate:** `/scripts/consolidate-worktrees.sh`

**Usage:** Copy to your project's `scripts/` directory or use from boilerplate

---

For more information, see the script's inline help:
```bash
./scripts/consolidate-worktrees.sh --help
```
