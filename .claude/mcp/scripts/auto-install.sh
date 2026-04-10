#!/bin/bash

###############################################################################
# MCP Auto-Installation Script
# Part of Claude Code Boilerplate v1.6.0
# 
# Automatically installs and configures essential MCP servers based on project
# context, PRD analysis, and intelligent detection of development needs.
###############################################################################

set -euo pipefail

# Script configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly MCP_ROOT="$(dirname "$SCRIPT_DIR")"
readonly PROJECT_ROOT="$(cd "$MCP_ROOT/../.." && pwd)"
readonly LOG_FILE="$MCP_ROOT/logs/auto-install.log"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        ERROR)   echo -e "${RED}[ERROR]${NC} $message" >&2 ;;
        WARN)    echo -e "${YELLOW}[WARN]${NC} $message" ;;
        INFO)    echo -e "${GREEN}[INFO]${NC} $message" ;;
        DEBUG)   echo -e "${BLUE}[DEBUG]${NC} $message" ;;
    esac
    
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

# Create required directories
setup_directories() {
    log INFO "Setting up MCP directory structure..."
    
    local dirs=(
        "$MCP_ROOT/config"
        "$MCP_ROOT/servers"
        "$MCP_ROOT/logs"
        "$MCP_ROOT/templates"
    )
    
    for dir in "${dirs[@]}"; do
        if [[ ! -d "$dir" ]]; then
            mkdir -p "$dir"
            log DEBUG "Created directory: $dir"
        fi
    done
}

# Check if Node.js and npm are available
check_dependencies() {
    log INFO "Checking system dependencies..."
    
    if ! command -v node &> /dev/null; then
        log ERROR "Node.js is required but not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log ERROR "npm is required but not installed. Please install npm first."
        exit 1
    fi
    
    local node_version=$(node --version | cut -d'v' -f2)
    local major_version=$(echo "$node_version" | cut -d'.' -f1)
    
    if [[ $major_version -lt 18 ]]; then
        log WARN "Node.js version $node_version detected. Version 18+ recommended."
    else
        log INFO "Node.js version $node_version ✓"
    fi
}

# Analyze project context for MCP server recommendations
analyze_project_context() {
    log INFO "Analyzing project context for server recommendations..."
    
    local recommendations=()
    
    # Check PRD.md
    if [[ -f "$PROJECT_ROOT/docs/PRD.md" ]]; then
        log INFO "Found PRD.md, analyzing content..."
        local prd_content=$(cat "$PROJECT_ROOT/docs/PRD.md" | tr '[:upper:]' '[:lower:]')
        
        if echo "$prd_content" | grep -q -E "(postgresql|database|sql|sequelize)"; then
            recommendations+=("database")
            log DEBUG "PRD analysis: Database server recommended"
        fi
        
        if echo "$prd_content" | grep -q -E "(aws|amplify|ec2|s3|lambda)"; then
            recommendations+=("aws")
            log DEBUG "PRD analysis: AWS server recommended"
        fi
        
        if echo "$prd_content" | grep -q -E "(api|rest|graphql|http)"; then
            recommendations+=("http")
            log DEBUG "PRD analysis: HTTP server recommended"
        fi
        
        if echo "$prd_content" | grep -q -E "(github|git|repository)"; then
            recommendations+=("github")
            log DEBUG "PRD analysis: GitHub server recommended"
        fi
    fi
    
    # Check package.json
    if [[ -f "$PROJECT_ROOT/package.json" ]]; then
        log INFO "Found package.json, analyzing dependencies..."
        local package_content=$(cat "$PROJECT_ROOT/package.json" | tr '[:upper:]' '[:lower:]')
        
        if echo "$package_content" | grep -q -E "(sequelize|prisma|pg|mysql|mongodb)"; then
            recommendations+=("database")
            log DEBUG "Package analysis: Database server recommended"
        fi
        
        if echo "$package_content" | grep -q -E "(jest|vitest|playwright|cypress|mocha)"; then
            recommendations+=("testing")
            log DEBUG "Package analysis: Testing server recommended"
        fi
        
        if echo "$package_content" | grep -q -E "(@aws-sdk|aws-amplify|@aws-cdk)"; then
            recommendations+=("aws")
            log DEBUG "Package analysis: AWS server recommended"
        fi
    fi
    
    # Check filesystem
    if [[ -d "$PROJECT_ROOT/.git" ]]; then
        recommendations+=("git")
        log DEBUG "Filesystem analysis: Git server recommended"
    fi
    
    if [[ -f "$PROJECT_ROOT/Dockerfile" ]] || [[ -f "$PROJECT_ROOT/docker-compose.yml" ]]; then
        recommendations+=("docker")
        log DEBUG "Filesystem analysis: Docker server recommended"
    fi
    
    if [[ -d "$PROJECT_ROOT/.github" ]]; then
        recommendations+=("github")
        log DEBUG "Filesystem analysis: GitHub server recommended"
    fi
    
    # Remove duplicates and add core servers
    local unique_recommendations=($(printf "%s\n" "filesystem" "git" "memory" "${recommendations[@]}" | sort -u))
    echo "${unique_recommendations[@]}"
}

# Install individual MCP server
install_server() {
    local server_name="$1"
    local server_path="$MCP_ROOT/servers/$server_name"
    
    log INFO "Installing MCP server: $server_name"
    
    # Create server directory
    mkdir -p "$server_path"
    
    # Server-specific installation logic
    case "$server_name" in
        "filesystem")
            local package="@modelcontextprotocol/server-filesystem"
            ;;
        "git")
            local package="@modelcontextprotocol/server-git"
            ;;
        "memory")
            local package="@modelcontextprotocol/server-memory"
            ;;
        "database")
            local package="@modelcontextprotocol/server-postgres"
            ;;
        "http")
            local package="@modelcontextprotocol/server-fetch"
            ;;
        "aws")
            local package="@modelcontextprotocol/server-aws"
            ;;
        "github")
            local package="@modelcontextprotocol/server-github"
            ;;
        "docker")
            local package="@modelcontextprotocol/server-docker"
            ;;
        "testing")
            local package="@modelcontextprotocol/server-testing"
            ;;
        *)
            log WARN "Unknown server: $server_name, skipping..."
            return 1
            ;;
    esac
    
    # Install with npm
    log DEBUG "Installing package: $package"
    if (cd "$server_path" && npm install "$package" &> /dev/null); then
        log INFO "✓ Installed $server_name server successfully"
        
        # Create basic configuration
        create_server_config "$server_name" "$server_path"
        return 0
    else
        log ERROR "✗ Failed to install $server_name server"
        return 1
    fi
}

# Create server configuration file
create_server_config() {
    local server_name="$1"
    local server_path="$2"
    local config_file="$server_path/config.json"
    
    log DEBUG "Creating configuration for $server_name"
    
    cat > "$config_file" << EOF
{
  "serverId": "$server_name",
  "name": "$server_name",
  "version": "latest",
  "autoActivate": true,
  "enabled": true,
  "installDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "security": {
    "allowedPaths": ["$PROJECT_ROOT"],
    "deniedPaths": ["node_modules", ".git/objects", ".env*", "*.key", "*.pem"]
  },
  "environment": {},
  "customSettings": {}
}
EOF
    
    # Server-specific configuration
    case "$server_name" in
        "filesystem")
            cat >> "$config_file" << EOF
,
  "filesystem": {
    "allowedPaths": ["$PROJECT_ROOT"],
    "deniedPaths": ["node_modules", ".git", ".env*", "secrets/", ".claude/.session*"],
    "maxFileSize": "10MB",
    "watchDirectories": true
  }
EOF
            ;;
        "database")
            if [[ -f "$PROJECT_ROOT/.env" ]] && grep -q "DATABASE_URL" "$PROJECT_ROOT/.env"; then
                log INFO "Found DATABASE_URL in .env file"
            else
                log WARN "DATABASE_URL not found in .env - manual configuration needed"
            fi
            ;;
        "github")
            if [[ -f "$PROJECT_ROOT/.env" ]] && grep -q "GITHUB_PERSONAL_ACCESS_TOKEN" "$PROJECT_ROOT/.env"; then
                log INFO "Found GitHub token in .env file"
            else
                log WARN "GITHUB_PERSONAL_ACCESS_TOKEN not found - manual configuration needed"
            fi
            ;;
    esac
}

# Update Claude Code configuration to include MCP servers
update_claude_config() {
    log INFO "Updating Claude Code configuration..."
    
    local claude_config="$PROJECT_ROOT/.claude/settings.local.json"
    
    if [[ ! -f "$claude_config" ]]; then
        log INFO "Creating new Claude Code settings file..."
        cat > "$claude_config" << 'EOF'
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/${USER}/Projects"],
      "env": {}
    },
    "git": {
      "command": "npx", 
      "args": ["-y", "@modelcontextprotocol/server-git"],
      "env": {}
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"], 
      "env": {}
    }
  }
}
EOF
    else
        log DEBUG "Claude Code settings file exists, manual integration may be required"
    fi
}

# Create initialization script that runs on boilerplate setup
create_init_script() {
    local init_script="$MCP_ROOT/scripts/mcp-init.sh"
    
    cat > "$init_script" << 'EOF'
#!/bin/bash
# MCP Initialization Script - Run during boilerplate setup

# Auto-install and configure MCP servers
echo "🤖 Initializing MCP servers for Claude Code..."
node "$1/.claude/mcp/scripts/server-manager.js" init
echo "✅ MCP server initialization complete"
EOF
    
    chmod +x "$init_script"
    log INFO "Created MCP initialization script"
}

# Main installation function
main() {
    log INFO "Starting MCP auto-installation for Claude Code Boilerplate..."
    log INFO "Project root: $PROJECT_ROOT"
    
    # Setup
    setup_directories
    check_dependencies
    
    # Analyze project and get server recommendations
    local recommended_servers
    read -ra recommended_servers <<< "$(analyze_project_context)"
    
    log INFO "Recommended servers based on project analysis: ${recommended_servers[*]}"
    
    # Install recommended servers
    local installed_count=0
    local failed_count=0
    
    for server in "${recommended_servers[@]}"; do
        if install_server "$server"; then
            ((installed_count++))
        else
            ((failed_count++))
        fi
    done
    
    # Update configurations
    update_claude_config
    create_init_script
    
    # Installation summary
    log INFO "MCP Auto-installation Summary:"
    log INFO "  Successfully installed: $installed_count servers"
    
    if [[ $failed_count -gt 0 ]]; then
        log WARN "  Failed installations: $failed_count servers"
    fi
    
    log INFO "  Configuration files created in: $MCP_ROOT/config/"
    log INFO "  Server installations in: $MCP_ROOT/servers/"
    log INFO "  Logs available in: $LOG_FILE"
    
    # Next steps
    echo
    echo -e "${GREEN}🎉 MCP Auto-installation Complete!${NC}"
    echo
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Configure environment variables (see warnings above)"
    echo "2. Start Claude Code to automatically load MCP servers"
    echo "3. Run 'mcp-status' to verify server status"
    echo "4. Use 'mcp-enable [server]' to enable additional servers"
    echo
    echo -e "${BLUE}Available Commands:${NC}"
    echo "• mcp-status              - View server status"
    echo "• mcp-enable [server]     - Enable additional servers"
    echo "• mcp-disable [server]    - Disable servers"
    echo "• mcp-configure [server]  - Configure server settings"
    echo
    
    log INFO "MCP auto-installation completed successfully"
}

# Error handling
trap 'log ERROR "Script failed on line $LINENO"' ERR

# Run main function
main "$@"