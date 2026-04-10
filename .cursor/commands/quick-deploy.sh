#!/bin/bash

# Quick Deploy Command - Automates changelog, commit, push, and deploy workflow
# Usage: ./quick-deploy.sh "Description of changes"

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if description is provided
if [ -z "$1" ]; then
    print_error "Usage: /quick-deploy \"Description of changes\""
    print_error "Example: /quick-deploy \"Fixed user roles modal useEffect import issue\""
    exit 1
fi

DESCRIPTION="$1"
TIMESTAMP=$(date '+%Y-%m-%d')

print_status "🚀 Starting Quick Deploy Workflow"
print_status "Description: $DESCRIPTION"

# 1. Detect current branch
CURRENT_BRANCH=$(git branch --show-current)
print_status "Current branch: $CURRENT_BRANCH"

# Analyze changed files to determine deployment targets
CHANGED_FILES_LIST=$(git diff --name-only HEAD 2>/dev/null || git diff --staged --name-only)
FRONTEND_CHANGES=""
BACKEND_CHANGES=""

# Check for frontend changes
if echo "$CHANGED_FILES_LIST" | grep -q "^frontend-investors/"; then
    FRONTEND_CHANGES="investors"
elif echo "$CHANGED_FILES_LIST" | grep -q "^frontend-main/"; then
    FRONTEND_CHANGES="main"
elif echo "$CHANGED_FILES_LIST" | grep -q "^frontend-admin/"; then
    FRONTEND_CHANGES="admin"
fi

# Check for backend changes (backend serves all frontends)
if echo "$CHANGED_FILES_LIST" | grep -q "^backend/"; then
    BACKEND_CHANGES="true"
fi

# If no frontend changes but backend changes, note it
if [ -z "$FRONTEND_CHANGES" ] && [ "$BACKEND_CHANGES" = "true" ]; then
    FRONTEND_CHANGES="backend-only"
fi

# Determine deployment target based on branch and frontend
case "$CURRENT_BRANCH" in
    "main")
        DEPLOY_TARGET="production"
        case "$FRONTEND_CHANGES" in
            "investors")
                AMPLIFY_APP_ID="d414osifrr0ov"
                TARGET_URL="https://investors.quiknation.com"
                ;;
            "main")
                print_warning "Frontend-main Amplify app not yet configured"
                AMPLIFY_APP_ID="TBD"
                TARGET_URL="https://quiknation.com"
                DEPLOY_TARGET="none"
                ;;
            "admin")
                print_warning "Frontend-admin Amplify app not yet configured"
                AMPLIFY_APP_ID="TBD"
                TARGET_URL="https://admin.quiknation.com"
                DEPLOY_TARGET="none"
                ;;
            "backend-only")
                DEPLOY_TARGET="none"
                print_status "Backend-only changes detected - will trigger GitHub Actions"
                ;;
            *)
                DEPLOY_TARGET="none"
                print_warning "No frontend changes detected"
                ;;
        esac
        ;;
    "develop")
        DEPLOY_TARGET="staging"
        case "$FRONTEND_CHANGES" in
            "investors")
                AMPLIFY_APP_ID="d414osifrr0ov"
                TARGET_URL="https://develop--d414osifrr0ov.amplifyapp.com"
                ;;
            "main")
                print_warning "Frontend-main Amplify app not yet configured"
                AMPLIFY_APP_ID="TBD"
                TARGET_URL="https://develop--main.quiknation.com"
                DEPLOY_TARGET="none"
                ;;
            "admin")
                print_warning "Frontend-admin Amplify app not yet configured"
                AMPLIFY_APP_ID="TBD"
                TARGET_URL="https://develop--admin.quiknation.com"
                DEPLOY_TARGET="none"
                ;;
            "backend-only")
                DEPLOY_TARGET="none"
                print_status "Backend-only changes detected - will trigger GitHub Actions"
                ;;
            *)
                DEPLOY_TARGET="none"
                print_warning "No frontend changes detected"
                ;;
        esac
        ;;
    *)
        DEPLOY_TARGET="none"
        print_warning "Branch '$CURRENT_BRANCH' - will commit and push only (no deployment)"
        ;;
esac

print_status "Frontend changes detected: $FRONTEND_CHANGES"

# 2. Check for changes
if git diff --quiet && git diff --staged --quiet; then
    print_warning "No changes detected. Nothing to commit."
    exit 0
fi

# 3. Get list of changed files (reuse the list we already gathered)
CHANGED_FILES="$CHANGED_FILES_LIST"
if [ -z "$CHANGED_FILES" ]; then
    CHANGED_FILES=$(git diff --name-only --staged)
fi

print_status "Changed files detected:"
echo "$CHANGED_FILES" | sed 's/^/  - /'

# 4. Determine commit type based on files changed
COMMIT_TYPE="feat"
if echo "$CHANGED_FILES" | grep -q "test\|spec"; then
    COMMIT_TYPE="test"
elif echo "$CHANGED_FILES" | grep -q "\.md$\|doc"; then
    COMMIT_TYPE="docs"
elif echo "$CHANGED_FILES" | grep -q "fix\|bug" || echo "$DESCRIPTION" | grep -qi "fix\|bug\|error\|issue"; then
    COMMIT_TYPE="fix"
elif echo "$DESCRIPTION" | grep -qi "refactor"; then
    COMMIT_TYPE="refactor"
fi

# 5. Update CHANGELOG.md
print_status "📝 Updating CHANGELOG.md..."

# Read current changelog header
CHANGELOG_HEADER=$(head -10 CHANGELOG.md | grep -A 10 "## \[Unreleased\]" | head -3)

# Create new changelog entry
NEW_ENTRY="- **$DESCRIPTION**: $(date '+%Y-%m-%d %H:%M:%S')
  - Files Modified: $(echo "$CHANGED_FILES" | wc -l | tr -d ' ') files
  - Branch: $CURRENT_BRANCH  
  - Deployment: $DEPLOY_TARGET"

# Backup and update changelog  
cp CHANGELOG.md CHANGELOG.md.backup
awk -v entry="$NEW_ENTRY" '
/^### Fixed/ && !inserted {
    print $0
    print entry
    inserted=1
    next
}
/^### Added/ && !inserted {
    print "### Fixed"
    print entry
    print ""
    print $0
    inserted=1
    next
}
{print}
' CHANGELOG.md > CHANGELOG.md.tmp && mv CHANGELOG.md.tmp CHANGELOG.md

print_success "CHANGELOG.md updated"

# 6. Stage all files
print_status "📦 Staging all files..."
git add -A
print_success "All files staged"

# 7. Create commit
COMMIT_MSG="${COMMIT_TYPE}: ${DESCRIPTION}

Automated deployment from ${CURRENT_BRANCH} branch

Changes:
$(echo "$CHANGED_FILES" | sed 's/^/• /')

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

print_status "💾 Creating commit..."
git commit -m "$COMMIT_MSG"
print_success "Commit created: $COMMIT_TYPE: $DESCRIPTION"

# 8. Push to origin
print_status "⬆️ Pushing to origin/$CURRENT_BRANCH..."
git push origin "$CURRENT_BRANCH"
print_success "Pushed to origin/$CURRENT_BRANCH"

# 9. Deploy to Amplify (if applicable)
if [ "$DEPLOY_TARGET" != "none" ] && [ -n "$AMPLIFY_APP_ID" ] && [ "$AMPLIFY_APP_ID" != "TBD" ]; then
    print_status "🚀 Deploying to Amplify ($DEPLOY_TARGET)..."
    
    DEPLOY_RESULT=$(aws amplify start-job \
        --app-id "$AMPLIFY_APP_ID" \
        --branch-name "$CURRENT_BRANCH" \
        --job-type RELEASE \
        --commit-message "Quick deploy: $DESCRIPTION" \
        --output json)
    
    JOB_ID=$(echo "$DEPLOY_RESULT" | jq -r '.jobSummary.jobId')
    JOB_STATUS=$(echo "$DEPLOY_RESULT" | jq -r '.jobSummary.status')
    
    print_success "Frontend deployment initiated!"
    echo "  Job ID: $JOB_ID"
    echo "  Status: $JOB_STATUS"
    echo "  Target URL: $TARGET_URL"
    echo "  App ID: $AMPLIFY_APP_ID"
    echo "  Frontend: $FRONTEND_CHANGES"
    
    print_status "🔗 Monitor deployment: https://console.aws.amazon.com/amplify/apps/$AMPLIFY_APP_ID"
fi

# 10. Trigger Backend Deployment (if applicable)
if [ "$BACKEND_CHANGES" = "true" ]; then
    print_status "🎯 Triggering backend deployment via GitHub Actions..."
    
    # Trigger GitHub Actions workflow for backend deployment
    if command -v gh >/dev/null 2>&1; then
        ENVIRONMENT="staging"
        if [ "$CURRENT_BRANCH" = "main" ]; then
            ENVIRONMENT="production"
        fi
        
        print_status "Triggering backend deployment to $ENVIRONMENT environment..."
        WORKFLOW_RESULT=$(gh workflow run deploy-backend.yml \
            --field environment="$ENVIRONMENT" \
            --field force_deploy=false 2>&1)
        
        if [ $? -eq 0 ]; then
            print_success "Backend deployment workflow triggered!"
            print_status "🔗 Monitor workflow: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions/workflows/deploy-backend.yml"
        else
            print_warning "Failed to trigger backend deployment: $WORKFLOW_RESULT"
        fi
    else
        print_warning "GitHub CLI (gh) not available - cannot trigger backend deployment"
        print_status "Backend changes detected but deployment must be triggered manually"
    fi
fi

if [ "$DEPLOY_TARGET" = "none" ] && [ "$BACKEND_CHANGES" != "true" ]; then
    print_success "Commit and push completed (no deployments needed)"
fi

print_success "✨ Quick Deploy Workflow Complete!"
echo ""
echo "Summary:"
echo "  Description: $DESCRIPTION"
echo "  Branch: $CURRENT_BRANCH"
echo "  Frontend Changes: $FRONTEND_CHANGES"
echo "  Backend Changes: ${BACKEND_CHANGES:-false}"
echo "  Commit Type: $COMMIT_TYPE"
echo "  Files Changed: $(echo "$CHANGED_FILES" | wc -l | tr -d ' ')"

# Frontend deployment info
if [ "$DEPLOY_TARGET" != "none" ] && [ -n "$JOB_ID" ]; then
    echo "  Frontend Deployment: $DEPLOY_TARGET ($TARGET_URL)"
    echo "  Amplify Job ID: $JOB_ID"
fi

# Backend deployment info
if [ "$BACKEND_CHANGES" = "true" ]; then
    if [ "$CURRENT_BRANCH" = "main" ]; then
        echo "  Backend Deployment: Production (triggered via GitHub Actions)"
    else
        echo "  Backend Deployment: Staging (triggered via GitHub Actions)"
    fi
fi