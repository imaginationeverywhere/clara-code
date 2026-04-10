# update-boilerplate

**Purpose**: Intelligently update projects with latest Claude Code boilerplate features while preserving customizations

**Context**: This command provides a smart update system for projects using the Claude Code boilerplate. It handles version tracking, conflict resolution, and selective updates while preserving project-specific customizations.

**v2.0 Update**: Now uses **git worktrees** by default for zero-risk updates. Updates are applied and tested in an isolated worktree before merging to the main branch.

## Command Usage

### Worktree-Based Updates (Default - RECOMMENDED)

```bash
update-boilerplate                    # Interactive worktree-based update (safe)
update-boilerplate --preview          # Apply updates in worktree, show diff only
update-boilerplate --test             # Apply updates in worktree, run full validation
update-boilerplate --apply            # Merge validated worktree changes to main branch
update-boilerplate --abort            # Discard worktree and all pending updates
```

### Legacy Direct Updates (Use with Caution)

```bash
update-boilerplate --direct           # Skip worktree, apply updates directly (legacy)
update-boilerplate --direct --check   # Check for updates without worktree
```

### Standard Options

```bash
update-boilerplate --check           # Check for available updates without applying
update-boilerplate --commands-only   # Update only Claude Code commands
update-boilerplate --docs-only       # Update only documentation files
update-boilerplate --infrastructure  # Update infrastructure files (Docker, CDK, etc.)
update-boilerplate --cleanup         # Enable automatic cleanup of unnecessary files
update-boilerplate --cleanup-only    # Only perform cleanup, no updates
update-boilerplate --no-cleanup      # Disable automatic cleanup (default: enabled)
update-boilerplate --all-projects    # Scan and update all projects in workspace
update-boilerplate --dry-run         # Preview all changes without applying
update-boilerplate --force-version [version]  # Update to specific version
update-boilerplate --rollback        # Rollback to previous version
update-boilerplate --init            # Initialize project for boilerplate updates
update-boilerplate --https           # Force HTTPS access (default: SSH with HTTPS fallback)
update-boilerplate --verbose         # Enable detailed logging and progress information
update-boilerplate --non-interactive # Skip interactive prompts (use defaults)
```

## Core Functionality

### 0. **Git Worktree-Based Update System (v2.0)**

The update system now uses git worktrees to provide zero-risk updates:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Git Worktree Update Workflow                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐                                                        │
│  │  Main Branch    │ ← Your working directory (NEVER touched during update) │
│  │  (Untouched)    │                                                        │
│  └────────┬────────┘                                                        │
│           │                                                                 │
│           │ git worktree add .worktree-update                               │
│           ▼                                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  .worktree-update/  (Isolated Update Environment)               │        │
│  ├─────────────────────────────────────────────────────────────────┤        │
│  │                                                                 │        │
│  │  Phase 1: Apply boilerplate updates                             │        │
│  │     └── Copy new/changed files from boilerplate                 │        │
│  │                                                                 │        │
│  │  Phase 2: Run validation suite                                  │        │
│  │     ├── TypeScript compilation check                            │        │
│  │     ├── ESLint/Prettier validation                              │        │
│  │     ├── Package dependency resolution                           │        │
│  │     ├── Build test (if applicable)                              │        │
│  │     └── Unit tests (if available)                               │        │
│  │                                                                 │        │
│  │  Phase 3: Show results to user                                  │        │
│  │     ├── List all changes applied                                │        │
│  │     ├── Show test results                                       │        │
│  │     └── Provide merge/abort options                             │        │
│  │                                                                 │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│           │                                                                 │
│           │ If validated → git merge                                        │
│           │ If failed   → git worktree remove (no harm done)               │
│           ▼                                                                 │
│  ┌─────────────────┐                                                        │
│  │  Main Branch    │ ← Only updated if validation passes                    │
│  │  (Now Updated)  │                                                        │
│  └─────────────────┘                                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key Benefits of Worktree Approach:**
- **Zero Risk**: Main working directory is never touched until explicitly approved
- **Parallel Development**: Developer can continue working while updates are tested
- **Pre-Apply Testing**: Full validation suite runs before any changes affect the project
- **Three-Way Merge**: Git's native merge handles conflicts properly
- **Easy Rollback**: Just delete the worktree - no backup restoration needed
- **Preserved Customizations**: Merge strategy respects local changes

**Worktree Lifecycle:**
1. `update-boilerplate` → Creates `.worktree-update/` branch
2. Updates applied in worktree → Validation runs
3. `update-boilerplate --apply` → Merges worktree to main
4. OR `update-boilerplate --abort` → Deletes worktree (no changes)

### 1. **Project Detection & Validation**
- Detect if current directory is a Claude Code boilerplate project
- Check for `.boilerplate-manifest.json` or create if missing
- Validate project structure and workspace configuration
- Identify project type (frontend-only, backend-only, full-monorepo)
- Check for existing update worktree (resume or clean up stale)

### 2. **Version Management**
- Compare current project version with latest boilerplate release
- Show semantic versioning with changelog and breaking changes
- Support updating to specific versions or latest
- Track update history and rollback capabilities

### 3. **Smart File Categorization**
The system categorizes files into update strategies:

**Always Safe to Update** (Auto-apply):
- `.claude/commands/**/*.md` - Claude Code commands
- `scripts/**/*.{js,sh}` - Utility scripts
- `docs/TEMPLATE_VARIABLES_GUIDE.md` - Template documentation
- `docs/technical/**/*.md` - Technical documentation

**Merge Required** (Show diff, user choice):
- `CLAUDE.md` - Main project documentation
- `README.md` - Project readme with customizations
- `package.json` - Workspace scripts and dependencies
- Infrastructure configuration files

**Never Update** (Always preserve):
- `docs/PRD.md` - Project-specific requirements
- `*.env*` - Environment configurations
- `*config.json` - Personal configurations
- `todo/jira-config/**/*` - JIRA credentials
- Project-specific customizations

**Conditional Update** (User opt-in required):
- `infrastructure/**/*` - AWS CDK infrastructure
- `docker-compose.yml` - Docker development environment
- `pnpm-workspace.yaml` - Workspace configuration
- `.gitignore` - Git ignore patterns

### 4. **Interactive Update Workflow**

#### Worktree-Based Update (Default)

```
🔄 Claude Code Boilerplate Update System v2.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Project: [PROJECT_NAME]
📍 Current Version: 1.0.0
🆕 Latest Version: 1.1.0

🌳 Update Mode: Git Worktree (Safe)
   └── Updates will be applied to .worktree-update/
   └── Your main branch remains untouched until you approve

📈 Available Updates:
✅ 12 safe updates (commands, scripts, docs)
⚠️  3 merge required (CLAUDE.md, README.md, package.json)
🚫 2 conflicts detected (custom modifications found)
🔧 5 infrastructure updates (opt-in)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Worktree Update Options:
[1] Create worktree and apply all safe updates
[2] Create worktree and preview changes (--preview)
[3] Create worktree, apply updates, run tests (--test)
[4] Commands only (safe, recommended)
[5] Documentation only
[6] Infrastructure updates (Docker, CDK)
[7] Custom selection
[8] Show detailed changelog
[9] Use legacy direct update mode (--direct)
[0] Exit without changes

Choose option [0-9]:
```

#### Pending Worktree Status

When an update worktree exists from a previous session:

```
🔄 Claude Code Boilerplate Update System v2.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏳ Pending Update Detected!

📋 Project: [PROJECT_NAME]
🌳 Worktree: .worktree-update/
📅 Created: 2025-12-23 14:30:00
🆕 Target Version: 1.1.0

📊 Validation Status:
   ✅ TypeScript compilation: PASSED
   ✅ ESLint validation: PASSED
   ✅ Dependency resolution: PASSED
   ✅ Build test: PASSED
   ⏭️ Unit tests: SKIPPED (no tests found)

📝 Changes Ready to Merge:
   - 12 files added
   - 8 files modified
   - 2 files removed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Pending Worktree Options:
[1] Review changes (git diff)
[2] Apply updates to main branch (--apply)
[3] Abort and discard worktree (--abort)
[4] Re-run validation tests
[5] Continue editing in worktree

Choose option [1-5]:
```

#### Legacy Direct Update

```
🔄 Claude Code Boilerplate Update System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Project: [PROJECT_NAME]
📍 Current Version: 1.0.0
🆕 Latest Version: 1.1.0

⚠️  Mode: Direct Update (Legacy)
   └── Updates will be applied directly to your project
   └── Backup created at .boilerplate-backups/

📈 Available Updates:
✅ 12 safe updates (commands, scripts, docs)
⚠️  3 merge required (CLAUDE.md, README.md, package.json)
🚫 2 conflicts detected (custom modifications found)
🔧 5 infrastructure updates (opt-in)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Update Options:
[1] Apply all safe updates automatically
[2] Review and apply individual changes
[3] Commands only (safe, recommended)
[4] Documentation only
[5] Infrastructure updates (Docker, CDK)
[6] Custom selection
[7] Show detailed changelog
[8] Exit without changes

Choose option [1-8]:
```

### 5. **Conflict Resolution System**

When conflicts are detected:

```
⚠️  Conflict Detected: CLAUDE.md

Your version (modified 2 days ago):
+ Custom project documentation
+ Specific workflow adjustments

Boilerplate version (new features):
+ Enhanced command documentation  
+ New deployment workflows
+ Updated troubleshooting section

🔧 Resolution Options:
[1] Keep your version (skip update)
[2] Use boilerplate version (lose customizations)
[3] Show detailed diff
[4] Manual merge (open in editor)
[5] Smart merge (preserve custom sections)

Choose option [1-5]:
```

### 6. **Intelligent Cleanup System**

The update system includes automatic cleanup of unnecessary files to keep projects lean and efficient:

```
🧹 Cleanup Analysis:
   847 unnecessary files found
   2.4 GB disk space to reclaim
   
   - 623 build artifacts (node_modules, dist, .next)
   - 45 log files (*.log, logs/)
   - 12 temporary files (.tmp, .cache)
   - 167 backup directories (*-backup, *-old)
   - 3 development files (.DS_Store, .vscode/settings.json)
   
   Run with --cleanup-only to remove these files
```

**Cleanup Categories:**
- **Build Artifacts**: `node_modules/`, `dist/`, `.next/`, `build/`, `out/`
- **Log Files**: `logs/`, `*.log`, `npm-debug.log*`, `yarn-error.log*`
- **Temporary Files**: `.tmp/`, `.cache/`, `.parcel-cache/`, `.vite/`
- **Backup Directories**: `*-backup/`, `*-old/`, `backup-*/`, `old-*/`
- **Development Files**: `.DS_Store`, `Thumbs.db`, `.vscode/settings.json`

**Cleanup Options:**
```bash
update-boilerplate --cleanup-only    # Only cleanup, no updates
update-boilerplate --cleanup         # Enable cleanup during updates
update-boilerplate --no-cleanup      # Disable cleanup (default: enabled)
update-boilerplate --dry-run         # Preview cleanup without removing files
```

### 7. **Multi-Project Management**

```bash
# Scan workspace for boilerplate projects
update-boilerplate --scan /Users/amenra/Projects

# Found Projects:
# ├── quikaction (v1.0.0 → v1.1.0 available)
# ├── dreamihaircare (v1.0.0 → v1.1.0 available)  
# ├── pink-collar-contractors (v1.0.0 → v1.1.0 available)
# └── quik-nation-ai-boilerplate (v1.1.0 - source)

update-boilerplate --bulk-update
# Updates all projects with safe updates only
```

## Implementation Details

### Prerequisites Check
1. **Environment Validation**:
   - Verify Claude Code is available
   - Check Node.js and pnpm versions
   - Validate internet connectivity for remote updates
   - Check write permissions for project files

2. **Remote Repository Access**:
   - **Primary**: SSH access `git@github.com:imaginationeverywhere/quik-nation-ai-boilerplate.git`
   - **Fallback**: HTTPS access `https://github.com/imaginationeverywhere/quik-nation-ai-boilerplate.git`
   - **Auto-detection**: Attempts SSH first, falls back to HTTPS automatically
   - **Manual Override**: Use `--https` flag to force HTTPS access

### Core Update Logic (Worktree-Based)

```javascript
// Pseudo-code for worktree-based update logic
async function updateBoilerplate(options) {
  // 1. Validate project and environment
  const project = await validateProject();
  const manifest = await loadOrCreateManifest(project);

  // 2. Check for existing update worktree
  const existingWorktree = await checkExistingWorktree();
  if (existingWorktree) {
    return await handlePendingWorktree(existingWorktree, options);
  }

  // 3. Fetch latest boilerplate version
  const latestVersion = await fetchLatestVersion();
  const updatePlan = await generateUpdatePlan(manifest.version, latestVersion);

  // 4. Categorize and filter updates
  const safeUpdates = updatePlan.filter(f => isSafeToUpdate(f));
  const mergeUpdates = updatePlan.filter(f => requiresMerge(f));
  const conflicts = updatePlan.filter(f => hasConflicts(f));

  // 5. Create update worktree (unless --direct mode)
  if (!options.direct) {
    const worktree = await createUpdateWorktree(latestVersion);

    // 6. Apply updates in worktree
    await applyUpdatesInWorktree(worktree, userChoices);

    // 7. Run validation suite
    const validationResults = await runValidationSuite(worktree);

    // 8. Present results and options
    await presentWorktreeResults(worktree, validationResults);

    // 9. Wait for user decision (--apply or --abort)
    // OR if --non-interactive and all tests pass, auto-apply
    if (options.nonInteractive && validationResults.allPassed) {
      await mergeWorktree(worktree);
    }
  } else {
    // Legacy direct mode
    const userChoices = await presentUpdateOptions(safeUpdates, mergeUpdates, conflicts);
    await applyUpdatesDirect(userChoices, options);
  }

  // 10. Update manifest
  await updateManifest(project, latestVersion);
}

// Worktree management functions
async function createUpdateWorktree(version) {
  const branchName = `boilerplate-update-v${version}-${Date.now()}`;
  const worktreePath = '.worktree-update';

  // Ensure no stale worktree exists
  await cleanupStaleWorktree(worktreePath);

  // Create new branch and worktree
  await exec(`git checkout -b ${branchName}`);
  await exec(`git checkout -`); // Go back to original branch
  await exec(`git worktree add ${worktreePath} ${branchName}`);

  return { branchName, worktreePath, version, createdAt: new Date() };
}

async function mergeWorktree(worktree) {
  // Merge the update branch into main
  await exec(`git merge ${worktree.branchName} --no-ff -m "chore: boilerplate update to v${worktree.version}"`);

  // Clean up worktree and branch
  await exec(`git worktree remove ${worktree.worktreePath}`);
  await exec(`git branch -D ${worktree.branchName}`);
}

async function abortWorktree(worktree) {
  // Simply remove the worktree and branch - no changes to main
  await exec(`git worktree remove ${worktree.worktreePath} --force`);
  await exec(`git branch -D ${worktree.branchName}`);
}

async function runValidationSuite(worktree) {
  const results = {
    typescript: { status: 'pending', output: '' },
    eslint: { status: 'pending', output: '' },
    dependencies: { status: 'pending', output: '' },
    build: { status: 'pending', output: '' },
    tests: { status: 'pending', output: '' },
    allPassed: false
  };

  // Run validations in worktree directory
  const cwd = worktree.worktreePath;

  // TypeScript check
  results.typescript = await runValidation('npx tsc --noEmit', cwd);

  // ESLint check
  results.eslint = await runValidation('npx eslint . --max-warnings=0', cwd);

  // Dependency resolution
  results.dependencies = await runValidation('pnpm install --frozen-lockfile', cwd);

  // Build test (if build script exists)
  results.build = await runValidation('pnpm run build', cwd);

  // Unit tests (optional)
  results.tests = await runValidation('pnpm run test', cwd, { optional: true });

  results.allPassed = Object.values(results)
    .filter(r => typeof r === 'object' && r.status !== 'skipped')
    .every(r => r.status === 'passed');

  return results;
}
```

### Backup and Rollback System
- Create `.boilerplate-backups/` directory with timestamped backups
- Store file hashes for integrity verification
- Support rolling back to previous version
- Automatic cleanup of old backups (keep last 5)

### Smart Merge Algorithm
1. **Preserve Custom Sections**: Identify project-specific content patterns
2. **Section-based Merging**: Merge by logical document sections
3. **Comment Preservation**: Keep custom comments and annotations
4. **Template Variable Handling**: Preserve filled template variables

## Error Handling

### Common Scenarios
1. **Network Issues**: Graceful fallback to cached versions
2. **Permission Errors**: Clear error messages with resolution steps
3. **Corrupted Files**: File integrity verification and restoration
4. **Version Conflicts**: Smart conflict resolution with user guidance
5. **Incomplete Updates**: Automatic rollback on critical failures

### Recovery Options
- Automatic backup restoration
- Manual conflict resolution assistance
- Skip problematic updates and continue
- Reset to known good state

## Integration with Existing Workflow

### JIRA Integration
- Track update tasks in JIRA if project has sync enabled
- Create update stories for major version changes
- Preserve JIRA configuration during updates

### Git Integration
- Create update commits with clear messages
- Tag versions for easy rollback
- Respect `.gitignore` patterns
- Handle merge conflicts in version control

## Security Considerations

1. **File Validation**: Verify file integrity and signatures
2. **Permission Checking**: Ensure safe file operations
3. **Backup Encryption**: Encrypt sensitive backup data
4. **Audit Logging**: Track all update operations
5. **Credential Protection**: Never update files containing secrets

## Usage Examples

### Worktree-Based Update Workflow (Recommended)
```bash
# Check what updates are available
update-boilerplate --check

# Create worktree and preview changes (safe, no changes to main)
update-boilerplate --preview

# Create worktree, apply updates, and run full validation
update-boilerplate --test

# After reviewing/testing, apply changes to main branch
update-boilerplate --apply

# If something looks wrong, discard the worktree
update-boilerplate --abort

# Non-interactive: auto-apply if all validations pass
update-boilerplate --test --non-interactive
```

### Standard Update Workflow
```bash
# Check what updates are available (includes cleanup analysis)
update-boilerplate --check

# Interactive worktree-based update with review
update-boilerplate

# Safe updates only (recommended for automation)
update-boilerplate --commands-only

# Full update including infrastructure
update-boilerplate --infrastructure
```

### Legacy Direct Updates (Use with Caution)
```bash
# Skip worktree safety and apply directly (not recommended)
update-boilerplate --direct

# Direct mode with commands only
update-boilerplate --direct --commands-only
```

### Cleanup Operations
```bash
# Preview cleanup without removing files
update-boilerplate --cleanup-only --dry-run

# Clean up unnecessary files only
update-boilerplate --cleanup-only

# Update with cleanup enabled (default)
update-boilerplate

# Update without cleanup
update-boilerplate --no-cleanup
```

### Multi-Project Scenarios
```bash
# Update all projects in workspace
cd /Users/amenra/Projects
update-boilerplate --all-projects

# Bulk update with safe changes only
update-boilerplate --bulk-update --commands-only

# Check status across all projects
update-boilerplate --scan --check
```

### Emergency Operations
```bash
# Rollback if something went wrong
update-boilerplate --rollback

# Force update to specific version
update-boilerplate --force-version 1.0.0

# Reset project to clean boilerplate state
update-boilerplate --reset --backup-first
```

## Troubleshooting

### Worktree-Specific Issues

**Issue**: "Worktree already exists"
**Solution**: An update is pending. Use `update-boilerplate --apply` to merge or `update-boilerplate --abort` to discard.

**Issue**: "Stale worktree detected"
**Solution**: A previous update was interrupted. The system will auto-cleanup. If manual cleanup needed:
```bash
git worktree remove .worktree-update --force
git branch -D boilerplate-update-v*
```

**Issue**: "Merge conflicts during --apply"
**Solution**: Git merge conflicts need manual resolution:
```bash
# View conflicts
git status

# Resolve conflicts in files, then:
git add .
git commit -m "chore: resolve boilerplate update conflicts"

# Clean up worktree
git worktree remove .worktree-update
```

**Issue**: "Validation failed in worktree"
**Solution**: Review the validation output. You can:
1. Fix issues in the worktree directory
2. Re-run validation: `update-boilerplate --test`
3. Apply despite failures: `update-boilerplate --apply --force`
4. Abort update: `update-boilerplate --abort`

**Issue**: "Cannot create worktree - uncommitted changes"
**Solution**: Commit or stash your changes first:
```bash
git stash
update-boilerplate
git stash pop
```

### Common Issues

**Issue**: "Project not recognized as boilerplate"
**Solution**: Run `update-boilerplate --init` to initialize tracking

**Issue**: "Version conflict detected"
**Solution**: Use `--force-version` or resolve conflicts manually

**Issue**: "Network timeout during update"
**Solution**: Use `--offline` mode with local boilerplate copy

**Issue**: "Permission denied on file operations"
**Solution**: Check file ownership and run with appropriate permissions

### Debug Mode
```bash
update-boilerplate --debug --verbose
# Provides detailed logging and operation tracking

# Worktree-specific debugging
git worktree list                    # Show all worktrees
git branch -a | grep boilerplate     # Show update branches
ls -la .worktree-update/             # Check worktree contents
```

## Advanced Configuration

### Custom Update Policies
Create `.boilerplate-config.json` to customize update behavior:

```json
{
  "updatePolicy": {
    "autoApplySafe": true,
    "skipInfrastructure": false,
    "preserveCustomizations": true,
    "backupBeforeUpdate": true,
    "maxBackups": 5
  },
  "worktreeSettings": {
    "enabled": true,
    "autoCleanupStale": true,
    "staleThresholdHours": 24,
    "worktreePath": ".worktree-update",
    "branchPrefix": "boilerplate-update-v"
  },
  "validation": {
    "runTypeScript": true,
    "runEslint": true,
    "runBuild": true,
    "runTests": false,
    "failOnWarnings": false,
    "autoApplyOnPass": false
  },
  "customIgnorePatterns": [
    "src/custom/**/*",
    "config/local/**/*"
  ],
  "mergeStrategies": {
    "CLAUDE.md": "smart-merge",
    "README.md": "manual-review",
    "package.json": "script-merge"
  }
}
```

### Worktree Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `worktreeSettings.enabled` | `true` | Use worktree-based updates (false = legacy direct mode) |
| `worktreeSettings.autoCleanupStale` | `true` | Auto-remove stale worktrees older than threshold |
| `worktreeSettings.staleThresholdHours` | `24` | Hours before a worktree is considered stale |
| `worktreeSettings.worktreePath` | `.worktree-update` | Directory for update worktree |
| `validation.runTypeScript` | `true` | Run TypeScript compilation check |
| `validation.runEslint` | `true` | Run ESLint validation |
| `validation.runBuild` | `true` | Run build process |
| `validation.runTests` | `false` | Run unit tests (can be slow) |
| `validation.autoApplyOnPass` | `false` | Auto-merge when all validations pass |

### Disabling Worktree Updates

To use legacy direct mode by default:

```json
{
  "worktreeSettings": {
    "enabled": false
  }
}
```

Or use the `--direct` flag for individual updates.

This command provides a comprehensive, intelligent update system that maintains the benefits of the boilerplate while respecting project customizations and providing safe, reversible operations through git worktrees.