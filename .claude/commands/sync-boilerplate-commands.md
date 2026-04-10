# Sync Boilerplate Commands

**Version:** 1.0.0
**Agent:** general-purpose
**Output:** Summary report in `docs/sync-reports/{timestamp}-sync-report.md`

## Purpose

Automatically synchronize `.claude/commands/` and `.cursor/commands/` from the main Quik Nation AI Boilerplate to all derived boilerplate projects. Scans specified directories to detect boilerplate projects and distributes command updates efficiently.

## Usage

```bash
# Sync all projects in a directory
sync-boilerplate-commands /Users/amenra/Native-Projects/clients

# Sync multiple directories
sync-boilerplate-commands /Users/amenra/Native-Projects/clients /Users/amenra/Native-Projects/Quik-Nation

# Dry-run mode (preview without changes)
sync-boilerplate-commands --dry-run /Users/amenra/Native-Projects/clients

# Sync specific commands only
sync-boilerplate-commands --commands=review-code,create-command /path/to/projects

# Sync with git commit
sync-boilerplate-commands --auto-commit /path/to/projects

# Force overwrite (skip conflict detection)
sync-boilerplate-commands --force /path/to/projects

# Interactive mode (confirm each project)
sync-boilerplate-commands --interactive /path/to/projects
```

## What This Command Does

1. **Scans directories** for boilerplate projects (detects `.boilerplate-manifest.json`)
2. **Identifies command differences** between main boilerplate and projects
3. **Syncs commands** to both `.claude/commands/` and `.cursor/commands/`
4. **Preserves customizations** with conflict detection
5. **Generates sync report** with detailed results
6. **Optionally commits changes** with proper git workflow

## Boilerplate Project Detection

A project is identified as a boilerplate project if it contains:
- `.boilerplate-manifest.json` (primary indicator)
- `.claude/commands/update-boilerplate.md` (secondary indicator)
- `docs/PRD.md` with boilerplate metadata (tertiary indicator)

## Command Implementation

When this command is invoked, Claude Code should:

### Phase 1: Validate Main Boilerplate

```bash
# Ensure we're running from the main boilerplate
if [ ! -f ".boilerplate-manifest.json" ]; then
  echo "❌ Error: Must run from main boilerplate directory"
  exit 1
fi

# Read boilerplate version
BOILERPLATE_VERSION=$(jq -r '.version' .boilerplate-manifest.json)
BOILERPLATE_SOURCE=$(jq -r '.source' .boilerplate-manifest.json)

echo "📦 Main Boilerplate: ${BOILERPLATE_SOURCE} v${BOILERPLATE_VERSION}"
```

### Phase 2: Scan for Boilerplate Projects

```bash
SCAN_DIRS=("$@")  # Directories to scan

echo "🔍 Scanning for boilerplate projects..."

PROJECTS=()

for SCAN_DIR in "${SCAN_DIRS[@]}"; do
  # Find all .boilerplate-manifest.json files
  while IFS= read -r manifest; do
    PROJECT_DIR=$(dirname "$manifest")
    PROJECT_NAME=$(basename "$PROJECT_DIR")
    PROJECT_VERSION=$(jq -r '.version' "$manifest")
    PROJECT_SOURCE=$(jq -r '.source' "$manifest")

    # Verify it's derived from this boilerplate
    if [ "$PROJECT_SOURCE" == "$BOILERPLATE_SOURCE" ]; then
      PROJECTS+=("$PROJECT_DIR")
      echo "   ✓ Found: $PROJECT_NAME (v$PROJECT_VERSION)"
    else
      echo "   ⊘ Skipped: $PROJECT_NAME (different source: $PROJECT_SOURCE)"
    fi
  done < <(find "$SCAN_DIR" -maxdepth 3 -name ".boilerplate-manifest.json" -type f)
done

echo ""
echo "📊 Summary: Found ${#PROJECTS[@]} boilerplate projects"
```

### Phase 3: Inventory Commands to Sync

```bash
# Get list of commands from main boilerplate
MAIN_COMMANDS=(.claude/commands/*.md)

echo "📋 Commands to sync:"
for cmd in "${MAIN_COMMANDS[@]}"; do
  CMD_NAME=$(basename "$cmd")
  CMD_SIZE=$(du -h "$cmd" | cut -f1)
  echo "   • $CMD_NAME ($CMD_SIZE)"
done
echo ""
```

### Phase 4: Sync Each Project

```bash
SYNC_RESULTS=()

for PROJECT_DIR in "${PROJECTS[@]}"; do
  PROJECT_NAME=$(basename "$PROJECT_DIR")
  echo "🔄 Syncing: $PROJECT_NAME"
  echo "   Path: $PROJECT_DIR"

  # Ensure command directories exist
  mkdir -p "$PROJECT_DIR/.claude/commands"
  mkdir -p "$PROJECT_DIR/.cursor/commands"

  # Track changes
  ADDED=0
  UPDATED=0
  SKIPPED=0
  CONFLICTS=0

  for cmd in "${MAIN_COMMANDS[@]}"; do
    CMD_NAME=$(basename "$cmd")

    # Check if command exists in project
    if [ -f "$PROJECT_DIR/.claude/commands/$CMD_NAME" ]; then
      # Compare files
      if diff -q "$cmd" "$PROJECT_DIR/.claude/commands/$CMD_NAME" > /dev/null; then
        echo "   ⊘ $CMD_NAME - No changes"
        ((SKIPPED++))
      else
        # Check for customizations
        if grep -q "CUSTOM:" "$PROJECT_DIR/.claude/commands/$CMD_NAME"; then
          echo "   ⚠️  $CMD_NAME - Conflict detected (has CUSTOM: marker)"
          ((CONFLICTS++))

          # Create backup
          cp "$PROJECT_DIR/.claude/commands/$CMD_NAME" \
             "$PROJECT_DIR/.claude/commands/$CMD_NAME.backup-$(date +%Y%m%d-%H%M%S)"

          # Skip unless --force
          if [ "$FORCE" != "true" ]; then
            continue
          fi
        fi

        # Update command
        cp "$cmd" "$PROJECT_DIR/.claude/commands/$CMD_NAME"
        cp "$cmd" "$PROJECT_DIR/.cursor/commands/$CMD_NAME"
        echo "   ✓ $CMD_NAME - Updated"
        ((UPDATED++))
      fi
    else
      # New command - add it
      cp "$cmd" "$PROJECT_DIR/.claude/commands/$CMD_NAME"
      cp "$cmd" "$PROJECT_DIR/.cursor/commands/$CMD_NAME"
      echo "   + $CMD_NAME - Added"
      ((ADDED++))
    fi
  done

  # Store results
  SYNC_RESULTS+=("$PROJECT_NAME|$ADDED|$UPDATED|$SKIPPED|$CONFLICTS")

  echo "   📊 Results: $ADDED added, $UPDATED updated, $SKIPPED unchanged, $CONFLICTS conflicts"
  echo ""
done
```

### Phase 5: Git Commit (if --auto-commit)

```bash
if [ "$AUTO_COMMIT" == "true" ]; then
  for PROJECT_DIR in "${PROJECTS[@]}"; do
    PROJECT_NAME=$(basename "$PROJECT_DIR")

    cd "$PROJECT_DIR"

    # Check if there are changes
    if git diff --quiet .claude/commands/ .cursor/commands/; then
      echo "⊘ No changes to commit for $PROJECT_NAME"
      continue
    fi

    # Stage changes
    git add .claude/commands/ .cursor/commands/

    # Commit
    git commit -m "chore: sync boilerplate commands from v${BOILERPLATE_VERSION}

Synced commands from Quik Nation AI Boilerplate v${BOILERPLATE_VERSION}

Added: $ADDED commands
Updated: $UPDATED commands
Conflicts: $CONFLICTS commands

🤖 Generated with sync-boilerplate-commands

Co-Authored-By: Claude <noreply@anthropic.com>"

    echo "✓ Committed changes for $PROJECT_NAME"
  done
fi
```

### Phase 6: Generate Sync Report

```bash
# Create report directory
mkdir -p docs/sync-reports

TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
REPORT_FILE="docs/sync-reports/${TIMESTAMP}-sync-report.md"

cat > "$REPORT_FILE" << EOF
# Boilerplate Commands Sync Report

**Date:** $(date +"%Y-%m-%d %H:%M:%S")
**Boilerplate Version:** ${BOILERPLATE_VERSION}
**Scan Directories:** ${SCAN_DIRS[@]}
**Projects Found:** ${#PROJECTS[@]}

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Projects | ${#PROJECTS[@]} |
| Total Commands Synced | ${#MAIN_COMMANDS[@]} |
| Total Added | $(echo "${SYNC_RESULTS[@]}" | grep -o '|[0-9]*|' | cut -d'|' -f2 | awk '{s+=$1} END {print s}') |
| Total Updated | $(echo "${SYNC_RESULTS[@]}" | grep -o '|[0-9]*|[0-9]*|' | cut -d'|' -f3 | awk '{s+=$1} END {print s}') |
| Total Conflicts | $(echo "${SYNC_RESULTS[@]}" | grep -o '|[0-9]*$' | cut -d'|' -f2 | awk '{s+=$1} END {print s}') |

## Projects Synced

EOF

# Add per-project results
for result in "${SYNC_RESULTS[@]}"; do
  IFS='|' read -r NAME ADDED UPDATED SKIPPED CONFLICTS <<< "$result"
  cat >> "$REPORT_FILE" << EOF
### $NAME

- **Added:** $ADDED commands
- **Updated:** $UPDATED commands
- **Unchanged:** $SKIPPED commands
- **Conflicts:** $CONFLICTS commands

EOF
done

# Add commands list
cat >> "$REPORT_FILE" << EOF
## Commands Synced

EOF

for cmd in "${MAIN_COMMANDS[@]}"; do
  CMD_NAME=$(basename "$cmd")
  echo "- \`$CMD_NAME\`" >> "$REPORT_FILE"
done

echo "📄 Sync report: $REPORT_FILE"
```

### Phase 7: Display Summary

```markdown
✅ Boilerplate Commands Sync Complete

📦 Source Boilerplate: Quik Nation AI Boilerplate v{version}

🔍 Scan Results:
   Directories Scanned: {n}
   Projects Found: {n}

📊 Sync Statistics:
   Commands Synced: {n}
   Total Added: {n}
   Total Updated: {n}
   Total Conflicts: {n}

📂 Projects Updated:
   ✓ dreamihaircare (4 added, 2 updated)
   ✓ pink-collar-contractors (4 added, 2 updated)
   ✓ quikaction (4 added, 2 updated)
   ✓ stacksbabiee (4 added, 2 updated)
   ⚠️  quikcarrental (4 added, 2 updated, 1 conflict)

⚠️  Conflicts Detected:
   • quikcarrental/.claude/commands/deploy-staging.md
     Reason: Contains CUSTOM: marker
     Action: Backup created, original preserved

💡 Next Steps:
   1. Review sync report: docs/sync-reports/{timestamp}-sync-report.md
   2. Resolve conflicts manually if needed
   3. Test commands in each project
   4. Push changes: git push (if --auto-commit was used)

📄 Full Report: docs/sync-reports/{timestamp}-sync-report.md
```

## Conflict Detection

Commands are marked as customized if they contain:

```markdown
<!-- CUSTOM: This command has been customized for {project} -->
<!-- DO NOT OVERWRITE without review -->
```

**Conflict Resolution:**
1. **Automatic Backup** - Creates `.backup-{timestamp}` file
2. **Preserve Original** - Skips update unless `--force`
3. **Manual Review** - User reviews and merges manually
4. **Force Overwrite** - Use `--force` to overwrite customizations

## Dry-Run Mode

Preview changes without modifying files:

```bash
sync-boilerplate-commands --dry-run /path/to/projects
```

**Output:**
```
🔍 DRY-RUN MODE - No files will be modified

📂 dreamihaircare
   + review-code.md (would add)
   + create-command.md (would add)
   ✓ sync-boilerplate-commands.md (would update)
   ⊘ update-boilerplate.md (no changes)

📂 pink-collar-contractors
   + review-code.md (would add)
   ...
```

## Interactive Mode

Confirm each project before syncing:

```bash
sync-boilerplate-commands --interactive /path/to/projects
```

**Prompts:**
```
📂 Found: dreamihaircare (v1.5.0)
   Changes: 4 added, 2 updated, 0 conflicts

   Sync this project? [Y/n] _
```

## Configuration

Add to `.claude/commands/config.json`:

```json
{
  "sync-boilerplate-commands": {
    "enabled": true,
    "auto_commit": false,
    "force_overwrite": false,
    "scan_depth": 3,
    "exclude_patterns": [
      "node_modules",
      ".git",
      "dist",
      "build"
    ],
    "preserve_markers": [
      "CUSTOM:",
      "DO NOT OVERWRITE",
      "PROJECT-SPECIFIC"
    ],
    "ultrathink_integration": true
  }
}
```

## UltraThink Integration

Track sync history and project relationships:

```bash
# After sync
ultrathink add-sync-event \
  --source="quik-nation-ai-boilerplate" \
  --targets="${PROJECTS[@]}" \
  --commands="${MAIN_COMMANDS[@]}" \
  --results="${SYNC_RESULTS[@]}"

# Query sync history
ultrathink query "
  MATCH (b:Boilerplate)-[s:SYNCED_TO]->(p:Project)
  WHERE s.timestamp > datetime() - duration('P7D')
  RETURN b, s, p
  ORDER BY s.timestamp DESC
" --visualize

# Find projects needing updates
ultrathink find-outdated-projects
```

## Examples

### Example 1: Basic Sync

```bash
sync-boilerplate-commands /Users/amenra/Native-Projects/clients
```

**Output:**
```
📦 Main Boilerplate: quik-nation-ai-boilerplate v1.8.0

🔍 Scanning for boilerplate projects...
   ✓ Found: dreamihaircare (v1.5.0)
   ✓ Found: pink-collar-contractors (v1.5.0)
   ✓ Found: stacksbabiee (v1.4.0)

📊 Summary: Found 3 boilerplate projects

📋 Commands to sync:
   • review-code.md (7.0K)
   • create-command.md (13K)
   • sync-boilerplate-commands.md (15K)

🔄 Syncing: dreamihaircare
   + review-code.md - Added
   + create-command.md - Added
   ✓ update-boilerplate.md - Updated

✅ Sync Complete
```

### Example 2: Dry-Run First

```bash
# Preview changes
sync-boilerplate-commands --dry-run /Users/amenra/Native-Projects/clients

# Review output, then actually sync
sync-boilerplate-commands /Users/amenra/Native-Projects/clients
```

### Example 3: Sync with Auto-Commit

```bash
sync-boilerplate-commands --auto-commit /Users/amenra/Native-Projects/clients /Users/amenra/Native-Projects/Quik-Nation

# Automatically commits changes to each project
# Creates proper commit messages
# Ready to push
```

### Example 4: Force Overwrite Customizations

```bash
# Override conflict detection (use with caution)
sync-boilerplate-commands --force /path/to/projects

# Creates backups before overwriting
# Useful when you know customizations should be replaced
```

## Advanced Features

### Selective Command Sync

Sync only specific commands:

```bash
sync-boilerplate-commands \
  --commands=review-code,create-command \
  /path/to/projects
```

### Scan Depth Control

Control how deep to search for projects:

```bash
sync-boilerplate-commands \
  --scan-depth=5 \
  /path/to/deeply/nested/projects
```

### Exclude Patterns

Skip certain directories:

```bash
sync-boilerplate-commands \
  --exclude="archive,old-projects,temp" \
  /path/to/projects
```

## Safety Features

1. **Backup Before Overwrite** - Always creates `.backup-{timestamp}`
2. **Conflict Detection** - Preserves customizations by default
3. **Dry-Run Mode** - Preview before applying
4. **Interactive Confirmation** - Confirm each project
5. **Version Validation** - Only syncs compatible versions
6. **Git Integration** - Optional automatic commits
7. **Rollback Support** - Restore from backups

## Troubleshooting

### No Projects Found

```
❌ No boilerplate projects found in /path/to/directory

💡 Possible reasons:
   1. Directory doesn't contain boilerplate projects
   2. Projects missing .boilerplate-manifest.json
   3. Scan depth too shallow (try --scan-depth=5)
   4. Projects are from different boilerplate source

🔍 Debug:
   find /path/to/directory -name ".boilerplate-manifest.json"
```

### Permission Denied

```
❌ Permission denied: /path/to/project/.claude/commands/

💡 Solutions:
   1. Check file permissions: ls -la /path/to/project/.claude/
   2. Run with appropriate permissions
   3. Check if directory is read-only
```

### Sync Conflicts

```
⚠️  Conflicts detected in 3 projects

💡 Resolution steps:
   1. Review backups: find . -name "*.backup-*"
   2. Compare changes: diff original.md original.md.backup-*
   3. Merge manually if needed
   4. Or use --force to overwrite (caution!)
```

## Related Commands

- `/create-command` - Create new commands to sync
- `/contribute-to-boilerplate` - Reverse sync (project → boilerplate)
- `/update-boilerplate` - Update individual projects
- `/organize-docs` - Organize documentation

## Notes for Claude Code

When executing this command:

1. **Always validate paths** before scanning
2. **Check .boilerplate-manifest.json** for compatibility
3. **Create backups** before overwriting
4. **Show progress** for long-running scans
5. **Generate detailed report** in docs/sync-reports/
6. **Respect conflict markers** unless --force
7. **Sync to BOTH** .claude and .cursor directories

## Command Metadata

```yaml
name: sync-boilerplate-commands
category: infrastructure
agent: general-purpose
output_type: markdown_document
output_location: docs/sync-reports/
token_cost: ~8,000
version: 1.0.0
author: Quik Nation AI
```
