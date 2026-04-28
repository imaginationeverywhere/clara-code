#!/bin/bash

################################################################################
# Database Migration Runner - All Environments
#
# Purpose: Run pending migrations across local, development, and production
# databases for Neon PostgreSQL with Sequelize CLI
#
# Usage:
#   ./scripts/run-migrations-all-environments.sh            # Run migrations only
#   ./scripts/run-migrations-all-environments.sh --seed     # Run migrations + seeders
#   ./scripts/run-migrations-all-environments.sh --local    # Run local only
#   ./scripts/run-migrations-all-environments.sh --develop  # Run develop only
#
# Prerequisites:
#   - Node.js and npm installed
#   - sequelize-cli installed as dev dependency
#   - .env.local, .env.develop, .env.production configured with DATABASE_URL
#   - Database migrations in migrations/ directory
#   - (Optional) Seeders in seeders/ directory
#
# CRITICAL REQUIREMENT (from CLAUDE.md):
# Whenever migrations are run, they MUST be executed on:
#   1. Local database (backend/.env.local)
#   2. Development database (backend/.env.develop)
#   3. Production database (backend/.env.production)
#
# Supports:
#   - Multiple environment files (.env.local, .env.develop, .env.production)
#   - Sequelize CLI integration with proper NODE_ENV configuration
#   - Optional seeder execution
#   - Production safety confirmations
#   - Detailed colored output and logging
#   - Graceful error handling with exit codes
#
################################################################################

set -e  # Exit on error

# ============================================================================
# Color Configuration
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================================================
# Script Variables
# ============================================================================

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_NAME=$(basename "$(dirname "$BACKEND_DIR")")

# Default behavior
RUN_SEEDERS=false
RUN_LOCAL=true
RUN_DEVELOP=true
RUN_PRODUCTION=false

# ============================================================================
# Helper Functions
# ============================================================================

# Print error message
error() {
    echo -e "${RED}❌ Error: $1${NC}" >&2
}

# Print warning message
warning() {
    echo -e "${YELLOW}⚠️  Warning: $1${NC}"
}

# Print info message
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Print success message
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Print section header
section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Load environment variables from .env file safely
load_env_file() {
    local env_file=$1

    while IFS= read -r line || [ -n "$line" ]; do
        # Skip empty lines
        [[ -z "$line" ]] && continue

        # Skip comment lines
        [[ "$line" =~ ^[[:space:]]*# ]] && continue

        # Remove inline comments (everything after # that's not part of a quoted string)
        local processed_line="$line"
        processed_line=$(echo "$processed_line" | sed -E 's/(^|[^"'"'"'])#.*$/\1/')

        # Only process lines that contain an equals sign
        if [[ "$processed_line" =~ = ]]; then
            # Split on first = sign
            local key="${processed_line%%=*}"
            local value="${processed_line#*=}"

            # Remove leading/trailing whitespace from key
            key=$(echo "$key" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

            # Remove leading/trailing whitespace from value
            value=$(echo "$value" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

            # Remove surrounding quotes if present (both single and double)
            if [[ "$value" =~ ^\".*\"$ ]]; then
                value="${value:1:-1}"
            elif [[ "$value" =~ ^\'.*\'$ ]]; then
                value="${value:1:-1}"
            fi

            # Export the variable safely
            if [ -n "$key" ]; then
                eval "$(printf "export %s=%q" "$key" "$value")"
            fi
        fi
    done < "$env_file"
}

# Validate database URL format
validate_database_url() {
    local url=$1
    if [[ ! $url =~ ^postgresql:// ]]; then
        return 1
    fi
    return 0
}

# Get database name from connection string
get_database_name() {
    local url=$1
    echo "$url" | sed 's/.*\/\([^?]*\).*/\1/'
}

# ============================================================================
# Main Migration Function
# ============================================================================

run_migration() {
    local env_name=$1
    local env_file=$2
    local run_seeders=${3:-false}

    section "📦 Environment: ${env_name}"

    # Check if .env file exists
    if [ ! -f "$env_file" ]; then
        warning "${env_file} not found. Skipping ${env_name} environment."
        echo ""
        return 1
    fi

    info "Loading environment variables from ${env_file}..."

    # Load environment variables from file
    load_env_file "$env_file"

    # Validate and set DATABASE_URL
    if [ -n "$DATABASE_URL" ]; then
        success "DATABASE_URL loaded"
    else
        # Check for common alternative names
        if [ -n "$DB_URL" ]; then
            info "Found DB_URL, using it as DATABASE_URL"
            export DATABASE_URL="$DB_URL"
        elif [ -n "$POSTGRES_URL" ]; then
            info "Found POSTGRES_URL, using it as DATABASE_URL"
            export DATABASE_URL="$POSTGRES_URL"
        else
            error "DATABASE_URL not found in ${env_file}"
            echo -e "${RED}   Please ensure ${env_file} contains: DATABASE_URL=postgresql://...${NC}"
            echo ""
            return 1
        fi
    fi

    # Validate database URL format
    if ! validate_database_url "$DATABASE_URL"; then
        error "Invalid DATABASE_URL format. Expected: postgresql://..."
        echo ""
        return 1
    fi

    local db_name=$(get_database_name "$DATABASE_URL")
    info "Database: ${db_name}"

    # Set NODE_ENV based on environment
    if [ "$env_name" = "production" ]; then
        export NODE_ENV=production
    else
        export NODE_ENV=development
    fi

    echo ""

    # Show migration status before running
    info "Checking migration status..."
    npx sequelize-cli db:migrate:status --env "$env_name" 2>/dev/null || info "No previous migrations found"
    echo ""

    # Run migrations
    info "Running database migrations..."
    if npx sequelize-cli db:migrate --env "$env_name"; then
        echo ""
        success "${env_name} migration completed successfully!"

        # Run seeders if requested
        if [ "$run_seeders" = "true" ]; then
            echo ""
            info "Running seeders..."

            # Find and run all seeders in the seeders directory
            SEEDERS_DIR="seeders"
            if [ -d "$SEEDERS_DIR" ]; then
                SEEDER_COUNT=$(find "$SEEDERS_DIR" -name "*seeder*.js" -o -name "*seed*.js" | wc -l)
                if [ "$SEEDER_COUNT" -gt 0 ]; then
                    if npx sequelize-cli db:seed:all --env "$env_name" 2>/dev/null; then
                        success "Seeders completed successfully!"
                    else
                        warning "Some seeders were skipped (may already exist or have errors)"
                    fi
                else
                    info "No seeders found in ${SEEDERS_DIR}"
                fi
            else
                info "No seeders directory found"
            fi
        fi

        echo ""
        return 0
    else
        echo ""
        error "${env_name} migration failed!"
        echo ""
        return 1
    fi
}

# ============================================================================
# Validation and Setup
# ============================================================================

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    error "This script must be run from the backend directory"
    exit 1
fi

# Check if sequelize-cli is installed
if ! npm list sequelize-cli > /dev/null 2>&1; then
    error "sequelize-cli is not installed. Please install it with: npm install --save-dev sequelize-cli"
    exit 1
fi

# ============================================================================
# Parse Command Line Arguments
# ============================================================================

while [ $# -gt 0 ]; do
    case "$1" in
        --seed|-s)
            RUN_SEEDERS=true
            shift
            ;;
        --local)
            RUN_LOCAL=true
            RUN_DEVELOP=false
            RUN_PRODUCTION=false
            shift
            ;;
        --develop)
            RUN_LOCAL=false
            RUN_DEVELOP=true
            RUN_PRODUCTION=false
            shift
            ;;
        --production)
            RUN_LOCAL=false
            RUN_DEVELOP=false
            RUN_PRODUCTION=true
            shift
            ;;
        --all)
            RUN_LOCAL=true
            RUN_DEVELOP=true
            RUN_PRODUCTION=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# ============================================================================
# Show Help Function
# ============================================================================

show_help() {
    cat << EOF
${BLUE}Database Migration Runner - All Environments${NC}

${CYAN}Usage:${NC}
  ./scripts/run-migrations-all-environments.sh [OPTIONS]

${CYAN}Options:${NC}
  --seed, -s              Run seeders after migrations
  --local                 Run migrations on local database only
  --develop               Run migrations on develop database only
  --production            Run migrations on production database only
  --all                   Run migrations on all databases (including production)
  -h, --help              Show this help message

${CYAN}Examples:${NC}
  # Run migrations on local and develop (default)
  ./scripts/run-migrations-all-environments.sh

  # Run migrations and seeders on all databases
  ./scripts/run-migrations-all-environments.sh --all --seed

  # Run migrations on local database only
  ./scripts/run-migrations-all-environments.sh --local

  # Run migrations on production only
  ./scripts/run-migrations-all-environments.sh --production

${CYAN}Environment Files Required:${NC}
  .env.local              - Local development database
  .env.develop            - Development/staging database
  .env.production         - Production database

Each file must contain: DATABASE_URL=postgresql://...

${CYAN}Documentation:${NC}
  See backend/CLAUDE.md section "Database Migrations" for complete details

EOF
}

# ============================================================================
# Main Execution
# ============================================================================

section "🗄️  Database Migration Runner"
info "Project: ${PROJECT_NAME}"
info "Backend Directory: ${BACKEND_DIR}"

if [ "$RUN_SEEDERS" = "true" ]; then
    info "Seeders: Enabled (will run after migrations)"
fi

# Track results
local_result=0
develop_result=0
production_result=0

# Run migrations on local database
if [ "$RUN_LOCAL" = "true" ]; then
    section "1️⃣  LOCAL DATABASE"
    if run_migration "local" ".env.local" "$RUN_SEEDERS"; then
        local_result=1
    fi
fi

# Run migrations on development database
if [ "$RUN_DEVELOP" = "true" ]; then
    section "2️⃣  DEVELOPMENT DATABASE"
    if run_migration "develop" ".env.develop" "$RUN_SEEDERS"; then
        develop_result=1
    fi
fi

# Run migrations on production database
if [ "$RUN_PRODUCTION" = "true" ]; then
    section "3️⃣  PRODUCTION DATABASE"
    warning "You are about to run migrations on PRODUCTION!"
    echo ""
    read -p "Continue with production migration? (yes/no): " -r
    echo ""
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        if run_migration "production" ".env.production" "$RUN_SEEDERS"; then
            production_result=1
        fi
    else
        warning "Skipping production migration"
        echo ""
    fi
fi

# ============================================================================
# Summary Report
# ============================================================================

section "📊 Migration Summary"

if [ "$RUN_LOCAL" = "true" ]; then
    if [ $local_result -eq 1 ]; then
        success "Local: Success"
    else
        error "Local: Failed or Skipped"
    fi
fi

if [ "$RUN_DEVELOP" = "true" ]; then
    if [ $develop_result -eq 1 ]; then
        success "Development: Success"
    else
        error "Development: Failed or Skipped"
    fi
fi

if [ "$RUN_PRODUCTION" = "true" ]; then
    if [ $production_result -eq 1 ]; then
        success "Production: Success"
    else
        warning "Production: Skipped"
    fi
fi

echo ""
section "Next Steps"

echo "1. Verify migrations were applied:"
if [ "$RUN_LOCAL" = "true" ]; then
    echo "   npx sequelize-cli db:migrate:status --env local"
fi
if [ "$RUN_DEVELOP" = "true" ]; then
    echo "   npx sequelize-cli db:migrate:status --env develop"
fi
if [ "$RUN_PRODUCTION" = "true" ]; then
    echo "   npx sequelize-cli db:migrate:status --env production"
fi

if [ "$RUN_SEEDERS" = "false" ]; then
    echo ""
    echo "2. Run seeders (optional):"
    echo "   ./scripts/run-migrations-all-environments.sh --seed"
    echo ""
    echo "3. Test your application to ensure everything works correctly"
else
    echo ""
    echo "2. Test your application to ensure everything works correctly"
fi

echo ""

# Exit with error if any required migration failed
if [ "$RUN_LOCAL" = "true" ] && [ $local_result -eq 0 ]; then
    error "Local migration failed. Please review the output above."
    exit 1
fi

if [ "$RUN_DEVELOP" = "true" ] && [ $develop_result -eq 0 ]; then
    error "Development migration failed. Please review the output above."
    exit 1
fi

success "Migration process completed!"
echo ""
