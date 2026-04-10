# Sync Cursor Command

> **Command:** `sync-cursor`
> **Version:** 1.0.0
> **Category:** Development Tools
> **Last Updated:** 2026-01-13

## Purpose

Bidirectional synchronization system between `.claude` and `.cursor` directories to enable seamless development across Claude Code and Cursor IDEs. Ensures all commands, agents, and skills are compatible and available in both environments.

## Usage

```bash
# Full sync from .claude to .cursor (default)
sync-cursor

# Sync specific components
sync-cursor --agents-only
sync-cursor --commands-only
sync-cursor --skills-only
sync-cursor --config-only

# Reverse sync from .cursor to .claude
sync-cursor --reverse

# Dry run to see what would change
sync-cursor --dry-run

# Force overwrite without prompts
sync-cursor --force

# Show sync status and differences
sync-cursor --status

# Validate compatibility
sync-cursor --validate
```

## Agent Orchestration

This command uses the `cursor-sync-manager` agent to:
1. **Analyze differences** between `.claude` and `.cursor` directories
2. **Transform content** for Cursor compatibility if needed
3. **Sync files** bidirectionally with conflict resolution
4. **Validate** synced content
5. **Generate reports** of changes made

## Workflow

### Standard Sync (.claude → .cursor)

```
1. Scan .claude directory structure
2. Identify missing/outdated files in .cursor
3. Transform Claude Code-specific syntax (if any)
4. Copy files to .cursor maintaining structure
5. Update .cursor/CLAUDE.md with sync metadata
6. Validate all synced files
7. Generate sync report
```

### Reverse Sync (.cursor → .claude)

```
1. Scan .cursor directory structure
2. Identify changes made in .cursor
3. Validate changes don't break Claude Code compatibility
4. Copy files back to .claude
5. Update .claude/CLAUDE.md with sync metadata
6. Generate sync report
```

### Conflict Resolution

When files differ in both directories:
- **Default:** Prompt user to choose which version to keep
- **--force:** Use source directory version
- **--merge:** Attempt intelligent merge
- **--skip:** Skip conflicting files

## File Categories

### 1. Agents (`.claude/agents/*.md` ↔ `.cursor/agents/*.md`)
- Specialized sub-agents
- Technology-specific patterns
- Integration guidelines
- **Status:** Fully compatible

### 2. Commands (`.claude/commands/*.md` ↔ `.cursor/commands/*.md`)
- Custom command definitions
- Workflow automation
- Project lifecycle management
- **Status:** Fully compatible

### 3. Skills (`.claude/skills/*` ↔ `.cursor/skills/*`)
- User-invocable skills
- Domain-specific patterns
- Implementation templates
- **Status:** Fully compatible

### 4. Configuration Files
- **Synced:** CLAUDE.md, README.md files
- **NOT Synced:** settings.json, *.local.json (IDE-specific)
- **Conditional:** config/*.json (validated before sync)

### 5. MCP Servers
- **NOT Synced:** MCP server installations are IDE-specific
- **Synced:** MCP documentation and setup guides

## Compatibility Transformations

### Currently No Transformations Needed
Both Claude Code and Cursor use the same markdown format for:
- Agent definitions
- Command definitions
- Skill definitions

### Future Compatibility Layer
If format differences emerge:
```javascript
// Example transformation
const transformForCursor = (content) => {
  // Convert Claude Code specific syntax
  // Add Cursor-specific metadata
  return content;
};
```

## Sync Metadata

Each sync updates metadata in both directories:

```markdown
<!-- .cursor/CLAUDE.md -->
## Last Sync
- **Date:** 2026-01-13 12:00:00
- **Direction:** .claude → .cursor
- **Files Synced:** 150
- **Changes:** 12 added, 8 updated, 0 deleted
- **Conflicts:** 0
```

## Directory Structure Preservation

```
.claude/                          .cursor/
├── agents/                  →    ├── agents/
│   ├── *.md                      │   ├── *.md
│   └── README.md                 │   └── README.md
├── commands/                →    ├── commands/
│   ├── *.md                      │   ├── *.md
│   └── CHANGELOG.md              │   └── CHANGELOG.md
├── skills/                  →    ├── skills/
│   └── */                        │   └── */
└── CLAUDE.md                →    └── CLAUDE.md

NOT SYNCED:
├── settings.json (IDE-specific)
├── session-hooks.json (Claude Code only)
├── mcp/servers/ (IDE-specific installations)
└── .telemetry-cache.json (Claude Code only)
```

## Example Sessions

### Initial Sync Setup

```bash
User: sync-cursor

Agent:
1. Scans .claude directory
   - 76 agents
   - 138 commands
   - 72 skills
2. Scans .cursor directory
   - 20 agents (56 missing)
   - 20 commands (118 missing)
   - 2 skills (70 missing)
3. Prepares sync plan
4. Shows differences

📊 Sync Plan:
- Add: 244 files
- Update: 0 files
- Delete: 0 files

Proceed with sync? (yes/no)

User: yes

Agent:
✅ Synced 244 files successfully
✅ Validated all files
✅ Updated .cursor/CLAUDE.md

Summary:
- 56 agents synced
- 118 commands synced
- 70 skills synced
- 0 conflicts
```

### Checking Sync Status

```bash
User: sync-cursor --status

Agent:
📊 Sync Status:

Last Sync: 2026-01-13 12:00:00 (.claude → .cursor)

Current State:
✅ Agents: 76 in sync
✅ Commands: 138 in sync
✅ Skills: 72 in sync

Recent Changes:
- .claude/agents/new-agent.md (not in .cursor)
- .cursor/commands/custom-cmd.md (modified)

Recommendations:
- Run sync-cursor to update .cursor with new-agent.md
- Consider reverse sync for custom-cmd.md changes
```

### Handling Conflicts

```bash
User: sync-cursor

Agent:
⚠️ Conflicts detected:

1. .claude/agents/clerk-auth-enforcer.md vs .cursor/agents/clerk-auth-enforcer.md
   - .claude: Modified 2026-01-13 10:00
   - .cursor: Modified 2026-01-13 11:00
   - Diff: Added validation section

Resolution options:
1. Keep .claude version (source)
2. Keep .cursor version
3. View diff and decide
4. Skip this file

Choose resolution for each file:
```

## Integration with Other Systems

### Git Integration
```bash
# .gitignore already configured
.claude/.telemetry-cache.json
.claude/settings.local.json
.cursor/settings.local.json
```

### CI/CD Integration
```yaml
# Optional: Validate sync in CI
- name: Validate .cursor sync
  run: |
    # Check if .cursor is out of sync with .claude
    # Fail if manual sync needed
```

### Pre-commit Hook
```bash
# Optional: Auto-sync before commits
#!/bin/bash
if [ -d ".claude" ] && [ -d ".cursor" ]; then
  sync-cursor --dry-run
  if [ $? -ne 0 ]; then
    echo "Warning: .cursor out of sync with .claude"
    echo "Run 'sync-cursor' to synchronize"
  fi
fi
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Directory not found | Missing .claude or .cursor | Create missing directory |
| Permission denied | Insufficient file permissions | Check file permissions |
| Invalid markdown | Malformed agent/command file | Validate and fix markdown syntax |
| Circular dependency | Conflicting bidirectional changes | Manual resolution required |
| Git conflict | Uncommitted changes | Commit or stash changes first |

## Best Practices

1. **Sync regularly** - Run after adding new commands/agents
2. **Check status** - Use `--status` to see differences
3. **Dry run first** - Use `--dry-run` before major syncs
4. **Commit changes** - Commit .claude changes before syncing
5. **Validate after sync** - Use `--validate` to ensure compatibility
6. **Document custom changes** - Add comments if modifying .cursor files

## Performance

- **Typical sync time:** 2-5 seconds for 300 files
- **Incremental sync:** Only copies changed files
- **Validation:** Fast markdown syntax checking

## Related Commands

- `create-command` - Create new commands (auto-syncs)
- `create-agent` - Create new agents (auto-syncs)
- `update-boilerplate` - May include sync updates
- `organize-docs` - Maintains documentation consistency

## Related Agents

- **cursor-sync-manager** - Primary sync orchestration agent
- **claude-context-documenter** - CLAUDE.md maintenance
- **code-quality-reviewer** - Validates synced files

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-13 | Initial release with bidirectional sync |

## Future Enhancements

- **Automatic sync on file changes** (watch mode)
- **Sync profiles** (custom sync rules per project)
- **Conflict resolution UI** (interactive merge tool)
- **Sync analytics** (track sync patterns)
- **Remote sync** (sync across machines)
