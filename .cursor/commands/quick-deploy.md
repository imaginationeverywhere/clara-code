# Quick Deploy Command

Automates the complete workflow: update CHANGELOG.md, commit all changes, push, and intelligently deploy based on file changes detected.

## Usage
```bash
/quick-deploy "Your description of changes made"
/quick-deploy "Fixed backend auth issue" --backend-only
/quick-deploy "Updated frontend UI components" --frontend-only
/quick-deploy "Full stack feature implementation" --both
```

## Parameters
- `description` (required): Description of the changes you made
- `--backend-only` (optional): Force backend deployment only
- `--frontend-only` (optional): Force frontend deployment only  
- `--both` (optional): Force both frontend and backend deployment

## Smart Deployment Detection
1. **Analyzes changed files** to determine deployment type needed
2. **Backend changes** (backend/, server files) → GitHub Actions backend deployment
3. **Frontend changes** (frontend/, UI files) → AWS Amplify deployment
4. **Mixed changes** → Deploy both backend and frontend
5. **Documentation only** → Commit and push only (no deployment)

## What it does
1. **Detects current branch** (main → production, develop → staging)
2. **Analyzes file changes** to determine deployment strategy and affected directories
3. **Updates directory CHANGELOG.md files** based on changed directories:
   - **Core Application:**
     - `frontend/CHANGELOG.md` - for any frontend/ directory changes
     - `backend/CHANGELOG.md` - for any backend/ directory changes
   - **Development & Operations:**
     - `scripts/CHANGELOG.md` - for any scripts/ directory changes
     - `infrastructure/CHANGELOG.md` - for any infrastructure/ directory changes
     - `docs/CHANGELOG.md` - for any docs/ directory changes
   - **Testing & Quality Assurance:**
     - `playwright-tests/CHANGELOG.md` - for any playwright-tests/ directory changes
     - `reports/CHANGELOG.md` - for any reports/ directory changes
   - **Specialized Systems:**
     - `dreamie-notifications/CHANGELOG.md` - for any dreamie-notifications/ directory changes
     - `frontend-investors/CHANGELOG.md` - for any frontend-investors/ directory changes
     - `shared/CHANGELOG.md` - for any shared/ directory changes
   - **Development Tools:**
     - `.github/CHANGELOG.md` - for any .github/ directory changes
     - `.claude/CHANGELOG.md` - for any .claude/ directory changes
     - `.claude/agents/CHANGELOG.md` - for any .claude/agents/ directory changes
     - `.claude/commands/CHANGELOG.md` - for any .claude/commands/ directory changes
4. **Updates root CHANGELOG.md** with cross-references to updated directory changelogs
5. **Stages all files** (`git add -A`)
6. **Creates commit** with conventional commit message format
7. **Pushes to origin** 
8. **Deploys intelligently**:
   - Backend files → GitHub Actions backend workflow
   - Frontend files → AWS Amplify deployment
   - Both → Sequential deployment (backend first, then frontend)
   - Docs only → No deployment triggered
9. **Shows deployment status** and target URLs

## Examples
```bash
/quick-deploy "Fixed user roles modal useEffect import issue"
/quick-deploy "Enhanced shipping rate calculation with better error handling"
/quick-deploy "Added new product review system with database migrations"
```

## Branch Detection
- `main` branch → deploys to production (dreamihaircare.com)
- `develop` branch → deploys to staging (develop.dreamihaircare.com)
- Other branches → commits and pushes only (no deployment)

## Intelligent Deployment Features
- **Smart File Analysis**: Detects changes across all project directories:
  - `backend/`, `frontend/` → deployment-triggering changes
  - `shared/`, `dreamie-notifications/`, `frontend-investors/` → specialized system changes
  - `docs/`, `scripts/`, `infrastructure/` → operational changes
  - `playwright-tests/`, `reports/` → testing and analytics changes
  - `.github/`, `.claude/` → development tooling changes
- **Directory Changelog Management**: Automatically updates all 15 directory CHANGELOG.md files
- **Appropriate Deployment**: Triggers correct deployment workflow based on change impact
- **GitHub Actions Integration**: Uses backend deployment workflow for server-side changes
- **AWS Amplify Integration**: Uses Amplify for frontend-only changes
- **Sequential Deployment**: Backend deploys first, then frontend for mixed changes
- **Documentation Detection**: Skips deployment for documentation-only changes
- **Manual Overrides**: Command-line flags to force specific deployment types
- **Status Tracking**: Shows deployment job IDs and target URLs for verification
- **Pre-commit Validation**: Automatic code quality and type checking
- **Branch Intelligence**: Production/staging targeting based on git branch
- **Comprehensive Changelog System**: Root changelog with cross-references to all directory changelogs