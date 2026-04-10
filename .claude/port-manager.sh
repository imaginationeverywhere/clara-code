#!/bin/bash

# Global Port Management System for Quik Nation Boilerplate Projects
# Location: /Users/amenra/Projects/shared-ngrok/.claude/port-manager.sh
# Usage: ./port-manager.sh [command] [options]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REGISTRY_FILE="$SCRIPT_DIR/port-registry.json"
NGROK_CONFIG="/Users/amenra/Projects/shared-ngrok/ngrok.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() { echo -e "${BLUE}ℹ ${NC}$1"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }

# Function to check if port is available
is_port_available() {
    local port=$1
    if ! jq -e ".allocatedPorts.\"$port\"" "$REGISTRY_FILE" > /dev/null 2>&1; then
        return 0  # Port is available
    else
        return 1  # Port is occupied
    fi
}

# Function to find next available port
find_next_available_port() {
    local service_type=$1  # 'backend' or 'frontend'
    local start_port=$2

    if [ "$service_type" = "backend" ]; then
        # Backend uses odd numbers
        local port=$start_port
        if [ $((port % 2)) -eq 0 ]; then
            port=$((port + 1))
        fi

        while ! is_port_available "$port"; do
            port=$((port + 2))
        done
        echo "$port"
    else
        # Frontend uses even numbers
        local port=$start_port
        if [ $((port % 2)) -eq 1 ]; then
            port=$((port + 1))
        fi

        while ! is_port_available "$port"; do
            port=$((port + 2))
        done
        echo "$port"
    fi
}

# Function to allocate ports for a project
allocate_ports() {
    local project_name=$1
    local project_location=$2
    local backend_port=$3
    local frontend_port=$4

    print_info "Allocating ports for project: $project_name"

    # Validate backend port (should be odd)
    if [ -n "$backend_port" ]; then
        if [ $((backend_port % 2)) -eq 0 ]; then
            print_warning "Backend port $backend_port is EVEN. Best practice is to use ODD numbers."
            read -p "Continue anyway? (y/n): " confirm
            if [ "$confirm" != "y" ]; then
                backend_port=$(find_next_available_port "backend" "$backend_port")
                print_info "Suggesting backend port: $backend_port"
            fi
        fi

        if ! is_port_available "$backend_port"; then
            print_error "Backend port $backend_port is already allocated!"
            local suggested_port=$(find_next_available_port "backend" "$backend_port")
            print_info "Suggesting alternative backend port: $suggested_port"
            backend_port=$suggested_port
        fi
    else
        backend_port=$(jq -r '.nextAvailablePorts.backend' "$REGISTRY_FILE")
        print_info "Auto-assigning backend port: $backend_port"
    fi

    # Validate frontend port (should be even)
    if [ -n "$frontend_port" ]; then
        if [ $((frontend_port % 2)) -eq 1 ]; then
            print_warning "Frontend port $frontend_port is ODD. Best practice is to use EVEN numbers."
            read -p "Continue anyway? (y/n): " confirm
            if [ "$confirm" != "y" ]; then
                frontend_port=$(find_next_available_port "frontend" "$frontend_port")
                print_info "Suggesting frontend port: $frontend_port"
            fi
        fi

        if ! is_port_available "$frontend_port"; then
            print_error "Frontend port $frontend_port is already allocated!"
            local suggested_port=$(find_next_available_port "frontend" "$frontend_port")
            print_info "Suggesting alternative frontend port: $suggested_port"
            frontend_port=$suggested_port
        fi
    else
        frontend_port=$(jq -r '.nextAvailablePorts.frontend' "$REGISTRY_FILE")
        print_info "Auto-assigning frontend port: $frontend_port"
    fi

    # Register ports in registry
    local temp_file=$(mktemp)
    jq --arg project "$project_name" \
       --arg location "$project_location" \
       --arg backend_port "$backend_port" \
       --arg frontend_port "$frontend_port" \
       --arg timestamp "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
       '.lastUpdated = $timestamp |
        .allocatedPorts[$backend_port] = {
            "project": $project,
            "service": "backend",
            "location": $location,
            "status": "active",
            "ngrokSubdomain": ($project + "-backend-dev")
        } |
        .allocatedPorts[$frontend_port] = {
            "project": $project,
            "service": "frontend",
            "location": $location,
            "status": "active",
            "ngrokSubdomain": ($project + "-frontend-dev")
        }' "$REGISTRY_FILE" > "$temp_file"

    mv "$temp_file" "$REGISTRY_FILE"

    # Update next available ports
    local next_backend=$(find_next_available_port "backend" "$((backend_port + 2))")
    local next_frontend=$(find_next_available_port "frontend" "$((frontend_port + 2))")

    temp_file=$(mktemp)
    jq --arg next_backend "$next_backend" \
       --arg next_frontend "$next_frontend" \
       '.nextAvailablePorts.backend = ($next_backend | tonumber) |
        .nextAvailablePorts.frontend = ($next_frontend | tonumber)' "$REGISTRY_FILE" > "$temp_file"

    mv "$temp_file" "$REGISTRY_FILE"

    print_success "Ports allocated successfully!"
    echo ""
    echo "  Backend Port:  $backend_port ($([ $((backend_port % 2)) -eq 1 ] && echo "✓ ODD" || echo "⚠ EVEN"))"
    echo "  Frontend Port: $frontend_port ($([ $((frontend_port % 2)) -eq 0 ] && echo "✓ EVEN" || echo "⚠ ODD"))"
    echo ""

    # Return ports as JSON
    echo "{\"backend\":$backend_port,\"frontend\":$frontend_port}"
}

# Function to scan for active Docker containers
scan_active_ports() {
    print_info "Scanning for active Docker containers..."

    docker ps --format "{{.Names}}\t{{.Ports}}" | while IFS=$'\t' read -r name ports; do
        echo "  $name: $ports"
    done
}

# Function to display port registry
show_registry() {
    print_info "Current Port Registry:"
    echo ""

    jq -r '.allocatedPorts | to_entries[] |
        "\(.key): \(.value.project) - \(.value.service) (\(.value.status))"' "$REGISTRY_FILE" | \
        sort -n -t: -k1

    echo ""
    print_info "Next Available Ports:"
    echo "  Backend:  $(jq -r '.nextAvailablePorts.backend' "$REGISTRY_FILE")"
    echo "  Frontend: $(jq -r '.nextAvailablePorts.frontend' "$REGISTRY_FILE")"
}

# Function to update ngrok configuration
update_ngrok_config() {
    local project_name=$1
    local backend_port=$2
    local frontend_port=$3

    print_info "Updating ngrok configuration..."

    # Backup existing config
    cp "$NGROK_CONFIG" "$NGROK_CONFIG.backup"

    # Add new tunnels to ngrok.yml
    cat >> "$NGROK_CONFIG" <<EOF

  # $project_name tunnels
  ${project_name}-backend:
    addr: host.docker.internal:${backend_port}
    proto: http
    subdomain: ${project_name}-backend-dev
    inspect: true

  ${project_name}-frontend:
    addr: host.docker.internal:${frontend_port}
    proto: http
    subdomain: ${project_name}-frontend-dev
    inspect: true
EOF

    print_success "Ngrok configuration updated!"
    print_info "Restart ngrok to apply changes: cd /Users/amenra/Projects/shared-ngrok && docker-compose restart"
}

# Function to check port conflicts
check_conflicts() {
    print_info "Checking for port conflicts..."

    local conflicts=0

    # Check each allocated port
    while IFS= read -r port; do
        if lsof -i ":$port" > /dev/null 2>&1; then
            local process=$(lsof -i ":$port" | tail -n 1 | awk '{print $1}')
            local project=$(jq -r ".allocatedPorts.\"$port\".project" "$REGISTRY_FILE")
            echo "  Port $port: CONFLICT - Used by $process (registered to $project)"
            conflicts=$((conflicts + 1))
        fi
    done < <(jq -r '.allocatedPorts | keys[]' "$REGISTRY_FILE")

    if [ $conflicts -eq 0 ]; then
        print_success "No port conflicts detected!"
    else
        print_warning "Found $conflicts port conflict(s)"
    fi
}

# Main command handler
case "${1:-}" in
    allocate)
        allocate_ports "$2" "$3" "$4" "$5"
        ;;
    scan)
        scan_active_ports
        ;;
    show)
        show_registry
        ;;
    conflicts)
        check_conflicts
        ;;
    update-ngrok)
        update_ngrok_config "$2" "$3" "$4"
        ;;
    *)
        echo "Global Port Management System"
        echo ""
        echo "Usage: $0 [command] [options]"
        echo ""
        echo "Commands:"
        echo "  allocate <project_name> <project_location> [backend_port] [frontend_port]"
        echo "    Allocate ports for a new project"
        echo ""
        echo "  scan"
        echo "    Scan for active Docker containers and their ports"
        echo ""
        echo "  show"
        echo "    Display current port registry"
        echo ""
        echo "  conflicts"
        echo "    Check for port conflicts"
        echo ""
        echo "  update-ngrok <project_name> <backend_port> <frontend_port>"
        echo "    Update ngrok configuration with new tunnels"
        echo ""
        echo "Examples:"
        echo "  $0 allocate empresss-eats /Users/amenra/Projects/clients/empresss-eats 3025 3026"
        echo "  $0 show"
        echo "  $0 conflicts"
        ;;
esac
