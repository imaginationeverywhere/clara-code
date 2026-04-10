#!/bin/bash

# Claude Code Port Management System
# This script manages port allocations for shared EC2 backend deployments

set -e

# Configuration
EC2_HOST="[EC2_HOST_IP]"
SSH_KEY="~/.ssh/deploy_key"
PORT_REGISTRY_PATH="/home/ec2-user/.claude-port-registry.json"
PORT_RANGE_MIN=3030
PORT_RANGE_MAX=3100

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if we can connect to EC2
check_ec2_connection() {
    log_info "Testing EC2 connection..."
    if ssh -i "$SSH_KEY" -o ConnectTimeout=10 -o StrictHostKeyChecking=no ec2-user@"$EC2_HOST" "echo 'Connected'" >/dev/null 2>&1; then
        log_success "EC2 connection established"
        return 0
    else
        log_error "Cannot connect to EC2 instance $EC2_HOST"
        return 1
    fi
}

# Function to initialize port registry if it doesn't exist
init_port_registry() {
    log_info "Initializing port registry on EC2..."
    
    ssh -i "$SSH_KEY" ec2-user@"$EC2_HOST" << 'EOF'
        if [ ! -f "/home/ec2-user/.claude-port-registry.json" ]; then
            cat > /home/ec2-user/.claude-port-registry.json << 'REGISTRY_EOF'
{
  "metadata": {
    "version": "1.0.0",
    "lastUpdated": "",
    "ec2Instance": "[EC2_HOST_IP]",
    "portRange": {
      "min": 3030,
      "max": 3100
    },
    "description": "Port allocation registry for shared EC2 backend deployments"
  },
  "allocations": {},
  "reservedPorts": {
    "3030": "System reserved"
  },
  "nextAvailable": {
    "production": 3031,
    "staging": 3032
  }
}
REGISTRY_EOF
            echo "Port registry initialized"
        else
            echo "Port registry already exists"
        fi
EOF
}

# Function to scan current port usage on EC2
scan_live_ports() {
    log_info "Scanning live port usage on EC2..."
    
    ssh -i "$SSH_KEY" ec2-user@"$EC2_HOST" << 'EOF'
        echo "=== LIVE PORT SCAN ==="
        echo ""
        echo "🔍 Active applications on backend ports:"
        sudo netstat -tlnp | grep -E ":(30[3-9][0-9]|31[0-9][0-9])" | while read line; do
            port=$(echo "$line" | awk '{print $4}' | cut -d: -f2)
            pid=$(echo "$line" | awk '{print $7}' | cut -d/ -f1)
            if [ "$pid" != "-" ] && [ "$pid" != "" ]; then
                process=$(ps -p "$pid" -o comm= 2>/dev/null || echo "unknown")
                echo "  Port $port: $process (PID: $pid)"
            else
                echo "  Port $port: listening (no process info)"
            fi
        done
        
        echo ""
        echo "🔍 PM2 processes and their ports:"
        if command -v pm2 >/dev/null 2>&1; then
            pm2 list | grep -E "(online|stopped|errored)" || echo "  No PM2 processes found"
        else
            echo "  PM2 not installed"
        fi
        
        echo ""
        echo "🔍 Nginx configurations and proxy ports:"
        if [ -d "/etc/nginx/sites-enabled" ]; then
            for config in /etc/nginx/sites-enabled/*.conf; do
                if [ -f "$config" ]; then
                    domain=$(basename "$config" .conf)
                    ports=$(grep "proxy_pass.*localhost:" "$config" | sed 's/.*localhost:\([0-9]*\).*/\1/' | sort -u | tr '\n' ' ')
                    if [ -n "$ports" ]; then
                        echo "  $domain → ports: $ports"
                    fi
                fi
            done
        else
            echo "  No nginx configurations found"
        fi
        
        echo ""
        echo "🔍 Available ports in range 3030-3050:"
        for port in $(seq 3030 3050); do
            if ! sudo netstat -tln | grep -q ":$port "; then
                echo "  Port $port: AVAILABLE"
            fi
        done
EOF
}

# Function to display current port registry
show_port_registry() {
    log_info "Current port registry:"
    
    ssh -i "$SSH_KEY" ec2-user@"$EC2_HOST" << 'EOF'
        if [ -f "/home/ec2-user/.claude-port-registry.json" ]; then
            echo "=== PORT REGISTRY ==="
            echo ""
            
            # Extract and display allocations
            if command -v jq >/dev/null 2>&1; then
                echo "📋 Project Allocations:"
                jq -r '.allocations | to_entries[] | "  \(.key): \(.value.projectName) (Prod: \(.value.productionPort), Staging: \(.value.stagingPort))"' /home/ec2-user/.claude-port-registry.json
                
                echo ""
                echo "🔒 Reserved Ports:"
                jq -r '.reservedPorts | to_entries[] | "  Port \(.key): \(.value)"' /home/ec2-user/.claude-port-registry.json
                
                echo ""
                echo "🆆 Next Available Ports:"
                jq -r '"  Production: " + (.nextAvailable.production | tostring) + ", Staging: " + (.nextAvailable.staging | tostring)' /home/ec2-user/.claude-port-registry.json
            else
                echo "Registry file exists but jq not available for parsing. Installing jq..."
                sudo yum install -y jq || sudo apt-get install -y jq
                cat /home/ec2-user/.claude-port-registry.json
            fi
        else
            echo "❌ Port registry not found. Run: init_port_registry"
        fi
EOF
}

# Function to allocate ports for a new project
allocate_ports() {
    local project_key="$1"
    local project_name="$2"
    local production_domain="$3"
    local staging_domain="$4"
    
    if [ -z "$project_key" ] || [ -z "$project_name" ] || [ -z "$production_domain" ] || [ -z "$staging_domain" ]; then
        log_error "Usage: allocate_ports <project_key> <project_name> <production_domain> <staging_domain>"
        return 1
    fi
    
    log_info "Allocating ports for project: $project_name"
    
    # Get next available ports from registry
    PORTS=$(ssh -i "$SSH_KEY" ec2-user@"$EC2_HOST" << EOF
        if [ -f "$PORT_REGISTRY_PATH" ] && command -v jq >/dev/null 2>&1; then
            PROD_PORT=\$(jq -r '.nextAvailable.production' "$PORT_REGISTRY_PATH")
            STAGING_PORT=\$(jq -r '.nextAvailable.staging' "$PORT_REGISTRY_PATH")
            
            # Verify ports are actually available
            while sudo netstat -tln | grep -q ":\$PROD_PORT "; do
                PROD_PORT=\$((PROD_PORT + 2))
            done
            
            while sudo netstat -tln | grep -q ":\$STAGING_PORT "; do
                STAGING_PORT=\$((STAGING_PORT + 2))
            done
            
            echo "\$PROD_PORT \$STAGING_PORT"
        else
            # Fallback: scan for available ports
            for port in \$(seq 3031 3050); do
                if ! sudo netstat -tln | grep -q ":\$port "; then
                    PROD_PORT=\$port
                    break
                fi
            done
            
            for port in \$(seq \$((PROD_PORT + 1)) 3051); do
                if ! sudo netstat -tln | grep -q ":\$port "; then
                    STAGING_PORT=\$port
                    break
                fi
            done
            
            echo "\$PROD_PORT \$STAGING_PORT"
        fi
EOF
    )
    
    PROD_PORT=$(echo $PORTS | cut -d' ' -f1)
    STAGING_PORT=$(echo $PORTS | cut -d' ' -f2)
    
    if [ -z "$PROD_PORT" ] || [ -z "$STAGING_PORT" ]; then
        log_error "Could not allocate ports"
        return 1
    fi
    
    log_info "Allocated ports - Production: $PROD_PORT, Staging: $STAGING_PORT"
    
    # Update the registry
    ssh -i "$SSH_KEY" ec2-user@"$EC2_HOST" << EOF
        if command -v jq >/dev/null 2>&1; then
            # Create temporary file with updated registry
            jq --arg key "$project_key" \
               --arg name "$project_name" \
               --arg prod_port "$PROD_PORT" \
               --arg staging_port "$STAGING_PORT" \
               --arg prod_domain "$production_domain" \
               --arg staging_domain "$staging_domain" \
               --arg timestamp "\$(date -u +%Y-%m-%dT%H:%M:%S.000Z)" \
               '.allocations[\$key] = {
                   "projectName": \$name,
                   "productionPort": (\$prod_port | tonumber),
                   "stagingPort": (\$staging_port | tonumber),
                   "productionDomain": \$prod_domain,
                   "stagingDomain": \$staging_domain,
                   "dateAllocated": \$timestamp,
                   "status": "active",
                   "notes": "Auto-allocated by setup-project-api-deployment"
               } |
               .nextAvailable.production = ((\$prod_port | tonumber) + 2) |
               .nextAvailable.staging = ((\$staging_port | tonumber) + 2) |
               .metadata.lastUpdated = \$timestamp' \
               "$PORT_REGISTRY_PATH" > /tmp/port-registry-update.json
            
            mv /tmp/port-registry-update.json "$PORT_REGISTRY_PATH"
            echo "Port registry updated"
        else
            echo "jq not available - cannot update registry automatically"
        fi
EOF
    
    echo "$PROD_PORT $STAGING_PORT"
}

# Function to check for port conflicts
check_port_conflicts() {
    local prod_port="$1"
    local staging_port="$2"
    
    log_info "Checking for port conflicts..."
    
    CONFLICTS=$(ssh -i "$SSH_KEY" ec2-user@"$EC2_HOST" << EOF
        CONFLICTS=""
        
        if sudo netstat -tln | grep -q ":$prod_port "; then
            CONFLICTS="\$CONFLICTS Production port $prod_port is in use. "
        fi
        
        if sudo netstat -tln | grep -q ":$staging_port "; then
            CONFLICTS="\$CONFLICTS Staging port $staging_port is in use. "
        fi
        
        echo "\$CONFLICTS"
EOF
    )
    
    if [ -n "$CONFLICTS" ]; then
        log_error "Port conflicts detected: $CONFLICTS"
        return 1
    else
        log_success "No port conflicts detected"
        return 0
    fi
}

# Function to show port management help
show_help() {
    echo "Claude Code Port Management System"
    echo ""
    echo "Usage: $0 <command> [arguments]"
    echo ""
    echo "Commands:"
    echo "  scan                                    - Scan live port usage"
    echo "  show                                    - Show current port registry"
    echo "  init                                    - Initialize port registry"
    echo "  allocate <key> <name> <prod_domain> <staging_domain> - Allocate ports for project"
    echo "  check <prod_port> <staging_port>        - Check for port conflicts"
    echo "  help                                    - Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 scan"
    echo "  $0 allocate myproject \"My Project\" api.example.com api-dev.example.com"
    echo "  $0 check 3033 3034"
}

# Main command handling
case "${1:-help}" in
    "scan")
        check_ec2_connection && scan_live_ports
        ;;
    "show")
        check_ec2_connection && show_port_registry
        ;;
    "init")
        check_ec2_connection && init_port_registry
        ;;
    "allocate")
        if [ $# -ne 5 ]; then
            log_error "Invalid arguments for allocate command"
            show_help
            exit 1
        fi
        check_ec2_connection && allocate_ports "$2" "$3" "$4" "$5"
        ;;
    "check")
        if [ $# -ne 3 ]; then
            log_error "Invalid arguments for check command"
            show_help
            exit 1
        fi
        check_ec2_connection && check_port_conflicts "$2" "$3"
        ;;
    "help"|*)
        show_help
        ;;
esac