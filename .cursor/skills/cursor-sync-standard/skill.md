# Cursor Sync Standard Skill

> **Skill ID:** `cursor-sync-standard`
> **Version:** 1.0.0
> **Category:** Development Tools
> **Last Updated:** 2026-01-13

## Description

Bidirectional synchronization between `.claude` and `.cursor` directories to enable seamless development across Claude Code and Cursor IDEs. This skill provides the implementation patterns and best practices for syncing commands, agents, and skills while maintaining compatibility.

## When to Use This Skill

Use this skill when:
- User requests syncing between Claude Code and Cursor
- User mentions "cursor sync", "sync with cursor", or ".cursor directory"
- User asks to make commands/agents available in Cursor
- User wants to use the same setup in both IDEs
- After creating new commands or agents that should be available in both IDEs

## Invocation Triggers

User mentions any of these phrases:
- "sync with cursor"
- "make this work in cursor"
- "cursor compatibility"
- "sync .claude to .cursor"
- ".cursor directory"
- "bidirectional sync"

## Core Capabilities

### 1. Directory Synchronization

**Forward Sync (.claude → .cursor)**
```javascript
// Sync all files from .claude to .cursor
const syncForward = async () => {
  const sourceDir = '.claude';
  const targetDir = '.cursor';

  // Scan source directory
  const agents = await scanDirectory(`${sourceDir}/agents`);
  const commands = await scanDirectory(`${sourceDir}/commands`);
  const skills = await scanDirectory(`${sourceDir}/skills`);

  // Sync each category
  await syncCategory(agents, 'agents', sourceDir, targetDir);
  await syncCategory(commands, 'commands', sourceDir, targetDir);
  await syncCategory(skills, 'skills', sourceDir, targetDir);

  // Update metadata
  await updateSyncMetadata(targetDir);
};
```

**Reverse Sync (.cursor → .claude)**
```javascript
// Sync changes back from .cursor to .claude
const syncReverse = async () => {
  // Validate safety
  if (!await confirmReverse()) {
    return;
  }

  const sourceDir = '.cursor';
  const targetDir = '.claude';

  // Identify changed files in .cursor
  const changedFiles = await findChangedFiles(sourceDir);

  // Validate compatibility
  const valid = await validateFiles(changedFiles);
  if (!valid) {
    throw new Error('Validation failed');
  }

  // Sync changes back
  await syncFiles(changedFiles, sourceDir, targetDir);
};
```

### 2. Conflict Detection & Resolution

```javascript
const detectConflicts = async (sourceDir, targetDir) => {
  const conflicts = [];

  // Get all files from both directories
  const sourceFiles = await getAllFiles(sourceDir);
  const targetFiles = await getAllFiles(targetDir);

  // Find files that exist in both
  const commonFiles = sourceFiles.filter(f =>
    targetFiles.includes(f)
  );

  // Check for conflicts
  for (const file of commonFiles) {
    const sourceContent = await readFile(`${sourceDir}/${file}`);
    const targetContent = await readFile(`${targetDir}/${file}`);
    const sourceHash = hash(sourceContent);
    const targetHash = hash(targetContent);

    if (sourceHash !== targetHash) {
      const sourceMtime = await getMtime(`${sourceDir}/${file}`);
      const targetMtime = await getMtime(`${targetDir}/${file}`);

      conflicts.push({
        file,
        sourceModified: sourceMtime,
        targetModified: targetMtime,
        diff: generateDiff(sourceContent, targetContent)
      });
    }
  }

  return conflicts;
};
```

### 3. File Validation

```javascript
const validateFile = async (filePath, content) => {
  const issues = [];

  // Check markdown syntax
  if (!content.startsWith('# ')) {
    issues.push('Missing title heading');
  }

  // Validate agent/command structure
  if (filePath.includes('/agents/')) {
    if (!content.includes('> **Agent ID:**')) {
      issues.push('Missing Agent ID metadata');
    }
    if (!content.includes('## Purpose')) {
      issues.push('Missing Purpose section');
    }
  }

  if (filePath.includes('/commands/')) {
    if (!content.includes('> **Command:**')) {
      issues.push('Missing Command metadata');
    }
    if (!content.includes('## Usage')) {
      issues.push('Missing Usage section');
    }
  }

  // Check for broken references
  const brokenLinks = await findBrokenLinks(content);
  issues.push(...brokenLinks);

  return issues;
};
```

### 4. Selective Sync

```bash
# Sync only specific categories
const syncCategory = async (category, sourceDir, targetDir) => {
  const validCategories = ['agents', 'commands', 'skills'];

  if (!validCategories.includes(category)) {
    throw new Error(`Invalid category: ${category}`);
  }

  const sourcePath = `${sourceDir}/${category}`;
  const targetPath = `${targetDir}/${category}`;

  // Create target directory if needed
  await ensureDir(targetPath);

  // Sync files
  const files = await scanDirectory(sourcePath);
  for (const file of files) {
    await copyFile(
      `${sourcePath}/${file}`,
      `${targetPath}/${file}`
    );
  }
};
```

## Implementation Patterns

### Pattern 1: Full Sync with Dry Run

```javascript
const fullSync = async (dryRun = false) => {
  console.log('Starting full sync...');

  // Analyze directories
  const analysis = await analyzeDiff('.claude', '.cursor');

  console.log(`
Files to add: ${analysis.toAdd.length}
Files to update: ${analysis.toUpdate.length}
Files to delete: ${analysis.toDelete.length}
Conflicts: ${analysis.conflicts.length}
  `);

  if (dryRun) {
    console.log('Dry run complete. No changes made.');
    return analysis;
  }

  // Handle conflicts first
  if (analysis.conflicts.length > 0) {
    await resolveConflicts(analysis.conflicts);
  }

  // Execute sync
  await copyFiles(analysis.toAdd, '.claude', '.cursor');
  await updateFiles(analysis.toUpdate, '.claude', '.cursor');

  console.log('✅ Sync completed successfully');
};
```

### Pattern 2: Incremental Sync

```javascript
const incrementalSync = async (lastSyncTime) => {
  // Only sync files modified since last sync
  const modifiedFiles = await findModifiedFiles(
    '.claude',
    lastSyncTime
  );

  console.log(`Found ${modifiedFiles.length} modified files`);

  for (const file of modifiedFiles) {
    await syncFile(file, '.claude', '.cursor');
  }

  // Update last sync timestamp
  await updateSyncMetadata({
    timestamp: new Date().toISOString(),
    fileCount: modifiedFiles.length
  });
};
```

### Pattern 3: Watch Mode

```javascript
const watchSync = async () => {
  const chokidar = require('chokidar');

  const watcher = chokidar.watch('.claude', {
    ignored: [
      '**/.*.json',        // Runtime files
      '**/settings*.json', // IDE-specific
      '**/mcp/servers/**'  // MCP installations
    ],
    persistent: true
  });

  watcher.on('change', async (path) => {
    console.log(`File changed: ${path}`);

    // Convert .claude path to .cursor path
    const cursorPath = path.replace('.claude', '.cursor');

    // Sync the changed file
    await copyFile(path, cursorPath);

    console.log(`✅ Synced to ${cursorPath}`);
  });

  console.log('Watching for changes in .claude/...');
};
```

## File Categories and Rules

### Always Sync

```javascript
const ALWAYS_SYNC = [
  'agents/**/*.md',
  'commands/**/*.md',
  'skills/**/*',
  'CLAUDE.md',
  'agents/README.md',
  'commands/CHANGELOG.md'
];
```

### Never Sync

```javascript
const NEVER_SYNC = [
  'settings.json',
  'settings.local.json',
  'session-hooks.json',
  '.telemetry-cache.json',
  '.session-count',
  '*.log',
  'mcp/servers/**',
  'tmp/**',
  'cache/**'
];
```

### Conditional Sync

```javascript
const CONDITIONAL_SYNC = {
  'config/*.json': async (file) => {
    // Validate before syncing
    const content = await readFile(file);
    return !containsIDESpecific(content);
  },
  'mcp/docs/**': () => true, // Always sync docs
  'mcp/config/**': async (file) => {
    // Check if config is portable
    return await isPortableConfig(file);
  }
};
```

## Error Handling Patterns

### Pattern: Graceful Degradation

```javascript
const syncWithFallback = async (file, source, target) => {
  try {
    await copyFile(`${source}/${file}`, `${target}/${file}`);
    return { success: true, file };
  } catch (error) {
    console.warn(`Failed to sync ${file}: ${error.message}`);

    // Try alternative approaches
    if (error.code === 'EACCES') {
      // Permission issue - try with sudo prompt
      await requestPermission(file);
    } else if (error.code === 'ENOSPC') {
      // Disk full - skip this file
      return { success: false, file, reason: 'disk_full' };
    }

    // Log and continue
    return { success: false, file, error: error.message };
  }
};
```

### Pattern: Transaction-like Sync

```javascript
const atomicSync = async (files, source, target) => {
  const tempDir = `${target}/.sync-temp`;

  try {
    // Stage changes in temp directory
    await ensureDir(tempDir);

    for (const file of files) {
      await copyFile(
        `${source}/${file}`,
        `${tempDir}/${file}`
      );
    }

    // Validate all staged files
    const valid = await validateDirectory(tempDir);
    if (!valid) {
      throw new Error('Validation failed');
    }

    // Commit changes atomically
    await moveDirectory(tempDir, target);

    return { success: true, fileCount: files.length };
  } catch (error) {
    // Rollback on error
    await removeDirectory(tempDir);
    throw error;
  }
};
```

## Sync Metadata Management

### Metadata Structure

```json
{
  "version": "1.0.0",
  "lastSync": {
    "timestamp": "2026-01-13T12:00:00Z",
    "direction": "claude-to-cursor",
    "filesChanged": 12,
    "conflicts": 0,
    "duration": 3200
  },
  "syncHistory": [
    {
      "timestamp": "2026-01-13T12:00:00Z",
      "stats": {
        "added": 56,
        "updated": 12,
        "deleted": 0,
        "conflicts": 0
      }
    }
  ],
  "fileIndex": {
    "agents/clerk-auth-enforcer.md": {
      "hash": "abc123...",
      "lastSynced": "2026-01-13T12:00:00Z",
      "size": 15360
    }
  }
}
```

### Update Metadata

```javascript
const updateSyncMetadata = async (targetDir, stats) => {
  const metadataPath = `${targetDir}/.sync-metadata.json`;
  let metadata = {};

  // Load existing metadata
  if (await fileExists(metadataPath)) {
    metadata = JSON.parse(await readFile(metadataPath));
  }

  // Update with new sync
  metadata.lastSync = {
    timestamp: new Date().toISOString(),
    direction: 'claude-to-cursor',
    filesChanged: stats.added + stats.updated,
    conflicts: stats.conflicts,
    duration: stats.duration
  };

  // Add to history
  if (!metadata.syncHistory) {
    metadata.syncHistory = [];
  }
  metadata.syncHistory.push({
    timestamp: metadata.lastSync.timestamp,
    stats
  });

  // Keep only last 10 syncs
  if (metadata.syncHistory.length > 10) {
    metadata.syncHistory = metadata.syncHistory.slice(-10);
  }

  // Save metadata
  await writeFile(metadataPath, JSON.stringify(metadata, null, 2));
};
```

## Integration with Git

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check if .claude and .cursor are in sync
if [ -d ".claude" ] && [ -d ".cursor" ]; then
  echo "Checking .claude/.cursor sync status..."

  # Run sync check
  node -e "
    const { checkSyncStatus } = require('./.claude/scripts/sync-utils');
    const status = checkSyncStatus();
    if (!status.inSync) {
      console.error('❌ .claude and .cursor are out of sync');
      console.error('Run: sync-cursor');
      process.exit(1);
    }
  "
fi
```

### Post-merge Hook

```bash
#!/bin/bash
# .git/hooks/post-merge

# Auto-sync after pulling changes
if [ -d ".claude" ] && [ -d ".cursor" ]; then
  echo "Auto-syncing .claude → .cursor after merge..."
  sync-cursor --quiet
fi
```

## Best Practices

### 1. Regular Sync Schedule
```javascript
// Sync daily or after significant changes
const syncSchedule = {
  daily: '0 9 * * *', // 9 AM daily
  afterChanges: 'on-commit',
  beforeDeploy: 'on-push'
};
```

### 2. Validation Before Sync
```javascript
const validateBeforeSync = async () => {
  // Check git status
  const gitStatus = await execCommand('git status --porcelain');
  if (gitStatus.includes('.claude/')) {
    console.warn('Uncommitted changes in .claude/');
    const proceed = await confirm('Continue anyway?');
    if (!proceed) return false;
  }

  // Validate markdown
  const invalidFiles = await validateAllMarkdown('.claude');
  if (invalidFiles.length > 0) {
    console.error('Invalid markdown files:', invalidFiles);
    return false;
  }

  return true;
};
```

### 3. Backup Before Reverse Sync
```javascript
const backupBeforeReverse = async () => {
  const backupDir = `.claude-backup-${Date.now()}`;
  await copyDirectory('.claude', backupDir);
  console.log(`Backup created: ${backupDir}`);
  return backupDir;
};
```

## Testing Patterns

### Unit Tests

```javascript
describe('cursor-sync', () => {
  test('syncs agents correctly', async () => {
    await syncCategory('agents', '.claude', '.cursor');
    const agentsMatch = await compareDirectories(
      '.claude/agents',
      '.cursor/agents'
    );
    expect(agentsMatch).toBe(true);
  });

  test('handles conflicts correctly', async () => {
    const conflicts = await detectConflicts('.claude', '.cursor');
    expect(conflicts).toHaveLength(2);
  });

  test('validates files before sync', async () => {
    const invalid = await validateFile(
      'agents/test.md',
      '# Missing metadata'
    );
    expect(invalid).toHaveLength(1);
  });
});
```

### Integration Tests

```javascript
describe('cursor-sync integration', () => {
  test('full sync workflow', async () => {
    // Create test file in .claude
    await writeFile('.claude/agents/test-agent.md', '# Test Agent...');

    // Run sync
    await fullSync();

    // Verify file exists in .cursor
    const exists = await fileExists('.cursor/agents/test-agent.md');
    expect(exists).toBe(true);

    // Cleanup
    await removeFile('.claude/agents/test-agent.md');
    await removeFile('.cursor/agents/test-agent.md');
  });
});
```

## Related Commands

- **sync-cursor** - Primary sync command
- **create-command** - Auto-syncs after creation
- **create-agent** - Auto-syncs after creation

## Related Agents

- **cursor-sync-manager** - Sync orchestration agent
- **claude-context-documenter** - Documentation updates
- **code-quality-reviewer** - Validation

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-13 | Initial release |
