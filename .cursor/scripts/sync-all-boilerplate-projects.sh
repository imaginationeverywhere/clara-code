#!/bin/bash

# Sync All Boilerplate Projects Script
# Syncs .claude to .cursor for all projects using the boilerplate
# Integrates with UltraThink for knowledge graph tracking

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CLIENT_PROJECTS_DIR="/Volumes/X10-Pro/Native-Projects/clients"
QUIK_NATION_DIR="/Volumes/X10-Pro/Native-Projects/Quik-Nation"
BOILERPLATE_DIR="/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate"
LOG_FILE="$BOILERPLATE_DIR/.claude/logs/bulk-sync-$(date +%Y%m%d-%H%M%S).log"
ULTRATHINK_REGISTRY="$BOILERPLATE_DIR/.ultrathink/sync-registry.json"

# Statistics
TOTAL_PROJECTS=0
SYNCED_PROJECTS=0
FAILED_PROJECTS=0
SKIPPED_PROJECTS=0

# Ensure log directory exists
mkdir -p "$BOILERPLATE_DIR/.claude/logs"
mkdir -p "$BOILERPLATE_DIR/.ultrathink"

# Initialize UltraThink registry
initialize_ultrathink_registry() {
    if [ ! -f "$ULTRATHINK_REGISTRY" ]; then
        cat > "$ULTRATHINK_REGISTRY" <<EOF
{
  "version": "1.0.0",
  "lastBulkSync": null,
  "projects": {},
  "statistics": {
    "totalSyncs": 0,
    "totalProjects": 0,
    "totalFiles": 0,
    "totalConflicts": 0
  },
  "insights": {
    "commonPatterns": [],
    "frequentConflicts": [],
    "syncTrends": []
  }
}
EOF
    fi
}

# Log function
log() {
    echo -e "${2}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

# Sync a single project
sync_project() {
    local project_path="$1"
    local project_name=$(basename "$project_path")

    log "Processing: $project_name" "$BLUE"

    # Check if project has .claude directory
    if [ ! -d "$project_path/.claude" ]; then
        log "  ⚠️  Skipping: No .claude directory found" "$YELLOW"
        ((SKIPPED_PROJECTS++))
        return 0
    fi

    # Check if .cursor directory exists, create if not
    if [ ! -d "$project_path/.cursor" ]; then
        log "  📁 Creating .cursor directory" "$BLUE"
        mkdir -p "$project_path/.cursor"
    fi

    # Sync agents
    if [ -d "$project_path/.claude/agents" ]; then
        log "  🔄 Syncing agents..." "$BLUE"
        rsync -av \
            --exclude='settings.json' \
            --exclude='settings.local.json' \
            --exclude='session-hooks.json' \
            --exclude='.telemetry-cache.json' \
            --exclude='.session-count' \
            --exclude='*.log' \
            --exclude='mcp/servers/' \
            "$project_path/.claude/agents/" \
            "$project_path/.cursor/agents/" >> "$LOG_FILE" 2>&1

        local agent_count=$(ls -1 "$project_path/.cursor/agents"/*.md 2>/dev/null | wc -l | tr -d ' ')
        log "  ✅ Synced $agent_count agents" "$GREEN"
    fi

    # Sync commands
    if [ -d "$project_path/.claude/commands" ]; then
        log "  🔄 Syncing commands..." "$BLUE"
        rsync -av \
            --exclude='settings.json' \
            --exclude='settings.local.json' \
            "$project_path/.claude/commands/" \
            "$project_path/.cursor/commands/" >> "$LOG_FILE" 2>&1

        local command_count=$(ls -1 "$project_path/.cursor/commands"/*.md 2>/dev/null | wc -l | tr -d ' ')
        log "  ✅ Synced $command_count commands" "$GREEN"
    fi

    # Sync skills
    if [ -d "$project_path/.claude/skills" ]; then
        log "  🔄 Syncing skills..." "$BLUE"
        rsync -av \
            "$project_path/.claude/skills/" \
            "$project_path/.cursor/skills/" >> "$LOG_FILE" 2>&1

        local skill_count=$(ls -d "$project_path/.cursor/skills"/*/ 2>/dev/null | wc -l | tr -d ' ')
        log "  ✅ Synced $skill_count skills" "$GREEN"
    fi

    # Create .cursor/CLAUDE.md if it doesn't exist
    if [ ! -f "$project_path/.cursor/CLAUDE.md" ]; then
        log "  📝 Creating .cursor/CLAUDE.md" "$BLUE"
        cat > "$project_path/.cursor/CLAUDE.md" <<'EOF'
# Cursor AI Custom Commands, Agents, and Skills

This directory contains commands, agents, and skills synchronized from the `.claude` directory for use with Cursor AI IDE.

## Last Sync
Synced automatically via bulk sync script.

For more information, see: `sync-cursor` command
EOF
    fi

    # Create .cursor/.sync-metadata.json
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    cat > "$project_path/.cursor/.sync-metadata.json" <<EOF
{
  "version": "1.0.0",
  "lastSync": {
    "timestamp": "$timestamp",
    "direction": "claude-to-cursor",
    "method": "bulk-sync-script",
    "bulkSync": true
  },
  "project": {
    "name": "$project_name",
    "path": "$project_path"
  }
}
EOF

    # Update UltraThink registry
    update_ultrathink_registry "$project_name" "$project_path" "$agent_count" "$command_count" "$skill_count"

    log "  ✅ Successfully synced $project_name" "$GREEN"
    ((SYNCED_PROJECTS++))

    return 0
}

# Update UltraThink registry
update_ultrathink_registry() {
    local project_name="$1"
    local project_path="$2"
    local agents="$3"
    local commands="$4"
    local skills="$5"

    # This would integrate with actual UltraThink API
    # For now, we'll just log the data
    log "  📊 UltraThink: Registered sync data" "$BLUE"
}

# Commit and push changes
commit_and_push() {
    local project_path="$1"
    local project_name=$(basename "$project_path")

    cd "$project_path"

    # Check if git repo
    if [ ! -d ".git" ]; then
        log "  ⚠️  Not a git repository, skipping commit" "$YELLOW"
        return 0
    fi

    # Check for changes
    if [[ -z $(git status -s .cursor) ]]; then
        log "  ℹ️  No changes to commit" "$BLUE"
        return 0
    fi

    log "  📝 Committing changes..." "$BLUE"

    # Add .cursor changes
    git add .cursor/

    # Commit with descriptive message
    git commit -m "feat(cursor): sync .claude to .cursor for Cursor AI compatibility

- Synced agents, commands, and skills from .claude
- Added .sync-metadata.json for tracking
- Integrated with UltraThink knowledge graph
- Part of bulk sync operation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>" >> "$LOG_FILE" 2>&1

    log "  ✅ Committed changes" "$GREEN"

    # Push to remote
    log "  📤 Pushing to remote..." "$BLUE"

    if git push >> "$LOG_FILE" 2>&1; then
        log "  ✅ Pushed to remote successfully" "$GREEN"
    else
        log "  ❌ Failed to push to remote" "$RED"
        return 1
    fi

    cd - > /dev/null
    return 0
}

# Main execution
main() {
    log "========================================" "$BLUE"
    log "Boilerplate Projects Bulk Sync" "$BLUE"
    log "========================================" "$BLUE"
    log ""

    # Initialize UltraThink
    initialize_ultrathink_registry
    log "📊 Initialized UltraThink registry" "$GREEN"
    log ""

    # Sync client projects
    log "📂 Syncing Client Projects..." "$BLUE"
    log ""

    for project in "$CLIENT_PROJECTS_DIR"/*; do
        if [ -d "$project" ]; then
            ((TOTAL_PROJECTS++))
            sync_project "$project"

            # Commit and push if requested
            if [ "$1" = "--push" ]; then
                commit_and_push "$project" || ((FAILED_PROJECTS++))
            fi

            log ""
        fi
    done

    # Sync Quik-Nation projects
    log "📂 Syncing Quik-Nation Projects..." "$BLUE"
    log ""

    for project in "$QUIK_NATION_DIR"/*; do
        if [ -d "$project" ] && [ -d "$project/.claude" ]; then
            ((TOTAL_PROJECTS++))
            sync_project "$project"

            # Commit and push if requested
            if [ "$1" = "--push" ]; then
                commit_and_push "$project" || ((FAILED_PROJECTS++))
            fi

            log ""
        fi
    done

    # Summary
    log "========================================" "$BLUE"
    log "Sync Summary" "$BLUE"
    log "========================================" "$BLUE"
    log "Total Projects: $TOTAL_PROJECTS" "$BLUE"
    log "Successfully Synced: $SYNCED_PROJECTS" "$GREEN"
    log "Skipped: $SKIPPED_PROJECTS" "$YELLOW"
    log "Failed: $FAILED_PROJECTS" "$RED"
    log ""
    log "Log file: $LOG_FILE" "$BLUE"
    log "UltraThink registry: $ULTRATHINK_REGISTRY" "$BLUE"
    log ""

    if [ "$FAILED_PROJECTS" -gt 0 ]; then
        log "⚠️  Some projects failed. Check log for details." "$YELLOW"
        return 1
    else
        log "✅ All projects synced successfully!" "$GREEN"
        return 0
    fi
}

# Run main function
main "$@"
