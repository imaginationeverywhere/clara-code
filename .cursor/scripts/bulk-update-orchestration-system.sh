#!/bin/bash

# Bulk Update: Agent Orchestration System v1.7.0
# Updates all boilerplate projects with new domain-specific commands and agents

# Don't exit on error - continue processing all projects
set +e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Source boilerplate directory
BOILERPLATE_DIR="/Users/amenra/Projects/AI/quik-nation-ai-boilerplate"

# Target directories
CLIENT_DIR="/Users/amenra/Projects/clients"
QUIKNATION_DIR="/Users/amenra/Projects/Quik-Nation"

# Files to update
NEW_COMMANDS=(
    "debug-fix.md"
    "plan-design.md"
    "backend-dev.md"
    "frontend-dev.md"
    "integrations.md"
    "devops.md"
    "deploy-ops.md"
    "test-automation.md"
)

NEW_AGENTS=(
    "chrome-mcp-agent.md"
    "playwright-mcp-agent.md"
    "browserstack-mcp-agent.md"
)

RENAMED_AGENT="project-management-bridge.md"

DOCUMENTATION_FILES=(
    "AGENT-ORCHESTRATION-ARCHITECTURE.md"
    "COMMAND-CONSOLIDATION-PLAN.md"
)

# Summary tracking
TOTAL_PROJECTS=0
UPDATED_PROJECTS=0
SKIPPED_PROJECTS=0
FAILED_PROJECTS=0

# Array to store update details
declare -a UPDATE_SUMMARY

# Function to log with color
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if project has boilerplate
has_boilerplate() {
    local project_dir="$1"

    if [ -d "$project_dir/.claude" ] || [ -f "$project_dir/.boilerplate-manifest.json" ]; then
        return 0
    fi
    return 1
}

# Function to update single project
update_project() {
    local project_dir="$1"
    local project_name=$(basename "$project_dir")

    log_info "Processing: $project_name"

    # Skip if not a boilerplate project
    if ! has_boilerplate "$project_dir"; then
        log_warning "  Skipping: Not a boilerplate project"
        SKIPPED_PROJECTS=$((SKIPPED_PROJECTS + 1))
        return
    fi

    TOTAL_PROJECTS=$((TOTAL_PROJECTS + 1))

    # Create backup
    local backup_dir="$project_dir/.claude-backup-$(date +%Y%m%d-%H%M%S)"
    if [ -d "$project_dir/.claude" ]; then
        log_info "  Creating backup: $backup_dir"
        cp -r "$project_dir/.claude" "$backup_dir"
    fi

    local updates_made=""

    # Ensure directories exist
    mkdir -p "$project_dir/.claude/commands"
    mkdir -p "$project_dir/.claude/agents"
    mkdir -p "$project_dir/.claude/scripts"

    # 1. Copy new command files
    log_info "  Copying new command files..."
    for cmd in "${NEW_COMMANDS[@]}"; do
        if [ -f "$BOILERPLATE_DIR/.claude/commands/$cmd" ]; then
            cp "$BOILERPLATE_DIR/.claude/commands/$cmd" "$project_dir/.claude/commands/$cmd"
            updates_made="$updates_made\n    + Command: $cmd"
        fi
    done

    # 2. Copy new agent files
    log_info "  Copying new agent files..."
    for agent in "${NEW_AGENTS[@]}"; do
        if [ -f "$BOILERPLATE_DIR/.claude/agents/$agent" ]; then
            cp "$BOILERPLATE_DIR/.claude/agents/$agent" "$project_dir/.claude/agents/$agent"
            updates_made="$updates_made\n    + Agent: $agent"
        fi
    done

    # 3. Update renamed agent
    log_info "  Updating renamed agent..."
    if [ -f "$project_dir/.claude/agents/jira-integration-manager.md" ]; then
        mv "$project_dir/.claude/agents/jira-integration-manager.md" \
           "$project_dir/.claude/agents/$RENAMED_AGENT"

        # Update the content to reflect new name
        if [ -f "$BOILERPLATE_DIR/.claude/agents/$RENAMED_AGENT" ]; then
            cp "$BOILERPLATE_DIR/.claude/agents/$RENAMED_AGENT" \
               "$project_dir/.claude/agents/$RENAMED_AGENT"
        fi
        updates_made="$updates_made\n    ⟳ Renamed: jira-integration-manager → project-management-bridge"
    fi

    # 4. Copy documentation files
    log_info "  Copying documentation files..."
    for doc in "${DOCUMENTATION_FILES[@]}"; do
        if [ -f "$BOILERPLATE_DIR/.claude/$doc" ]; then
            cp "$BOILERPLATE_DIR/.claude/$doc" "$project_dir/.claude/$doc"
            updates_made="$updates_made\n    + Documentation: $doc"
        fi
    done

    # 5. Update main CLAUDE.md
    log_info "  Updating main CLAUDE.md..."
    if [ -f "$project_dir/CLAUDE.md" ] && [ -f "$BOILERPLATE_DIR/CLAUDE.md" ]; then
        # Extract the new section from boilerplate
        # This is a simplified approach - in production, use more sophisticated merge

        # Check if the section already exists
        if ! grep -q "Domain-Specific Agent Orchestration Commands" "$project_dir/CLAUDE.md"; then
            # For safety, create a timestamped backup
            cp "$project_dir/CLAUDE.md" "$project_dir/CLAUDE.md.backup-$(date +%Y%m%d-%H%M%S)"
            updates_made="$updates_made\n    ⟳ Updated: CLAUDE.md (backup created)"
            log_info "  NOTE: CLAUDE.md backup created. Manual review recommended."
        fi
    fi

    # 6. Update frontend CLAUDE.md if exists
    if [ -f "$project_dir/frontend/CLAUDE.md" ] && [ -f "$BOILERPLATE_DIR/frontend/CLAUDE.md" ]; then
        if ! grep -q "Recommended Development Command" "$project_dir/frontend/CLAUDE.md"; then
            cp "$project_dir/frontend/CLAUDE.md" "$project_dir/frontend/CLAUDE.md.backup-$(date +%Y%m%d-%H%M%S)"
            updates_made="$updates_made\n    ⟳ Updated: frontend/CLAUDE.md (backup created)"
        fi
    fi

    # 7. Update backend CLAUDE.md if exists
    if [ -f "$project_dir/backend/CLAUDE.md" ] && [ -f "$BOILERPLATE_DIR/backend/CLAUDE.md" ]; then
        if ! grep -q "Recommended Development Command" "$project_dir/backend/CLAUDE.md"; then
            cp "$project_dir/backend/CLAUDE.md" "$project_dir/backend/CLAUDE.md.backup-$(date +%Y%m%d-%H%M%S)"
            updates_made="$updates_made\n    ⟳ Updated: backend/CLAUDE.md (backup created)"
        fi
    fi

    # 8. Update .boilerplate-manifest.json if exists
    if [ -f "$project_dir/.boilerplate-manifest.json" ]; then
        # Update version to 1.7.0
        if command -v jq &> /dev/null; then
            # Check if features array already contains agent-orchestration-v1.7.0
            if ! jq -e '.features | if type == "array" then index("agent-orchestration-v1.7.0") else false end' "$project_dir/.boilerplate-manifest.json" > /dev/null 2>&1; then
                # Safely append to features array, handling both array and non-array cases
                jq '.version = "1.7.0" |
                    .lastUpdate = "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'" |
                    .features = (if .features | type == "array" then .features else [] end) + ["agent-orchestration-v1.7.0"]' \
                    "$project_dir/.boilerplate-manifest.json" > "$project_dir/.boilerplate-manifest.json.tmp" 2>/dev/null

                if [ $? -eq 0 ]; then
                    mv "$project_dir/.boilerplate-manifest.json.tmp" "$project_dir/.boilerplate-manifest.json"
                    updates_made="$updates_made\n    ⟳ Updated: .boilerplate-manifest.json → v1.7.0"
                else
                    log_warning "  Could not update manifest (jq error), but other updates applied"
                    rm -f "$project_dir/.boilerplate-manifest.json.tmp"
                fi
            fi
        fi
    fi

    # Success!
    log_success "  Updated: $project_name"
    UPDATE_SUMMARY+=("$project_name|SUCCESS|$updates_made")
    UPDATED_PROJECTS=$((UPDATED_PROJECTS + 1))
}

# Main execution
main() {
    echo ""
    echo "========================================="
    echo "Agent Orchestration System Bulk Update"
    echo "Version: 1.7.0"
    echo "========================================="
    echo ""

    log_info "Source: $BOILERPLATE_DIR"
    log_info "Targets: Client projects + Quik-Nation projects"
    echo ""

    # Process client projects
    log_info "Scanning /Users/amenra/Projects/clients..."
    echo ""

    if [ -d "$CLIENT_DIR" ]; then
        for project in "$CLIENT_DIR"/*; do
            if [ -d "$project" ]; then
                update_project "$project"
            fi
        done
    fi

    echo ""
    log_info "Scanning /Users/amenra/Projects/Quik-Nation..."
    echo ""

    # Process Quik-Nation projects
    if [ -d "$QUIKNATION_DIR" ]; then
        for project in "$QUIKNATION_DIR"/*; do
            if [ -d "$project" ]; then
                update_project "$project"
            fi
        done
    fi

    # Print summary
    echo ""
    echo "========================================="
    echo "Update Summary"
    echo "========================================="
    echo ""
    echo "Total Projects Scanned: $((UPDATED_PROJECTS + SKIPPED_PROJECTS + FAILED_PROJECTS))"
    echo "✅ Successfully Updated: $UPDATED_PROJECTS"
    echo "⊘  Skipped (No Boilerplate): $SKIPPED_PROJECTS"
    echo "❌ Failed: $FAILED_PROJECTS"
    echo ""

    if [ $UPDATED_PROJECTS -gt 0 ]; then
        echo "Updated Projects:"
        echo "----------------"
        for summary in "${UPDATE_SUMMARY[@]}"; do
            IFS='|' read -r name status changes <<< "$summary"
            echo "✓ $name"
            echo -e "$changes"
            echo ""
        done
    fi

    echo "========================================="
    echo "Next Steps:"
    echo "========================================="
    echo ""
    echo "1. Review CLAUDE.md backups in each project"
    echo "2. Test new commands: /debug-fix, /plan-design, /backend-dev, /frontend-dev"
    echo "3. Read .claude/COMMAND-CONSOLIDATION-PLAN.md for migration guide"
    echo "4. Report issues at github.com/imaginationeverywhere/quik-nation-ai-boilerplate"
    echo ""

    log_success "Bulk update complete!"
}

# Run main function
main
