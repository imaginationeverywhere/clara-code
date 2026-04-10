---
name: git-commit-docs
description: Stage all changes, update documentation, generate commit message, and push to remote
---

# Git Commit with Documentation Updates

You are tasked with analyzing code changes and performing a complete git workflow with documentation updates for the [PROJECT_NAME] platform built with [TECH_STACK].

## Steps to follow:

1. **Analyze Changes**
   - Run `git status --porcelain` and `git diff --name-status` to see all changes
   - Run `git status` to see untracked files  
   - Identify what files were modified, added, or deleted
   - Understand the nature of changes (features, fixes, refactors, etc.)
   - Determine which documentation needs updates based on file changes

2. **Update Version Numbers (Before Documentation)**
   - **CRITICAL**: Always increment version before updating documentation
   - Check if `package.json` and `.boilerplate-manifest.json` exist
   - Determine version increment based on change type:
     - **feat**: Minor increment (1.2.0 → 1.3.0)
     - **fix**: Patch increment (1.2.0 → 1.2.1) 
     - **BREAKING CHANGE**: Major increment (1.2.0 → 2.0.0)
     - **docs/style/refactor**: Patch increment (1.2.0 → 1.2.1)
     - **chore**: No increment for internal changes
   - Update version in `package.json`
   - Update version in `.boilerplate-manifest.json` main version
   - Update all component versions in manifest to match main version
   - Update `lastUpdated` timestamp in manifest with current ISO date
   - **IMPORTANT**: This ensures other projects detect updates via automatic session startup system

3. **Update Technical Documentation (Before CHANGELOG.md)**
   - Check if any of these files need updates based on your changes:
     - `docs/technical/architecture.md` - for architectural changes
     - `docs/technical/api.md` - for API schema or endpoint changes
     - `docs/technical/database-schema.md` - for database changes
     - `docs/technical/deployment.md` - for deployment process changes
     - `docs/technical/deployment-setup.md` - for deployment configuration changes
     - `docs/technical/troubleshooting.md` - for new issues or solutions
   - Update code examples if APIs changed
   - Document new environment variables or configurations
   - Add new dependencies to setup instructions

4. **Update Business Documentation (Before CHANGELOG.md)**
   - Check if any of these files need updates:
     - `docs/business/prd.md` - for new features or requirements
     - `docs/business/requirements.md` - for business requirement changes
     - `docs/business/user-stories.md` - for new user stories or acceptance criteria
   - Focus on business value and impact
   - Update user personas if customer-facing features changed

5. **Update User Documentation (Before CHANGELOG.md)**
   - Check if any of these files need updates:
     - `README.md` - for major features or setup changes
     - `docs/git-commit-all.md` - for development process changes
     - Todo files in `todo/` directory - mark completed tasks, add new ones
   - Include:
     - Step-by-step instructions
     - Common use cases
     - Troubleshooting tips

6. **Update Project Planning Documents (Before CHANGELOG.md)**
   - Check if any of these need updates:
     - `todo/frontend-todos.md` - for frontend development progress
     - `todo/backend-todos.md` - for backend development progress  
     - `todo/deployment-todos.md` - for deployment milestones
     - `todo/business-todos.md` - for business planning progress

7. **Update Directory CHANGELOG.md Files (Before Root CHANGELOG.md)**
   - **DIRECTORY-SPECIFIC CHANGELOGS**: Update relevant directory changelogs based on file changes
   - Check which directories have changed files and update their CHANGELOG.md:
     - **Core Application:**
       - `frontend/CHANGELOG.md` - for any changes in frontend/ directory
       - `backend/CHANGELOG.md` - for any changes in backend/ directory
     - **Development & Operations:**
       - `scripts/CHANGELOG.md` - for any changes in scripts/ directory
       - `infrastructure/CHANGELOG.md` - for any changes in infrastructure/ directory
       - `docs/CHANGELOG.md` - for any changes in docs/ directory
     - **Testing & Quality Assurance:**
       - `playwright-tests/CHANGELOG.md` - for any changes in playwright-tests/ directory
       - `reports/CHANGELOG.md` - for any changes in reports/ directory
     - **Specialized Systems:**
       - `dreamie-notifications/CHANGELOG.md` - for any changes in dreamie-notifications/ directory
       - `frontend-investors/CHANGELOG.md` - for any changes in frontend-investors/ directory
       - `shared/CHANGELOG.md` - for any changes in shared/ directory
     - **Development Tools:**
       - `.github/CHANGELOG.md` - for any changes in .github/ directory
       - `.claude/CHANGELOG.md` - for any changes in .claude/ directory
       - `.claude/agents/CHANGELOG.md` - for any changes in .claude/agents/ directory
       - `.claude/commands/CHANGELOG.md` - for any changes in .claude/commands/ directory
   - **FORMAT**: Use same changelog format as root but focus on directory-specific changes
   - **SCOPE**: Only document changes relevant to that specific directory
   - **DETAIL LEVEL**: More technical detail since these are component-specific

8. **Update Root CHANGELOG.md (REQUIRED - MUST BE LAST)**
   - **CRITICAL**: Root CHANGELOG.md must be the final file updated before commit
   - **CROSS-REFERENCE**: Reference the directory changelogs that were updated
   - Add a new entry under "Unreleased" section (create if doesn't exist)
   - Format: `## [Unreleased] - YYYY-MM-DD`
   - Categorize changes:
     - ### Added - for new features and functionality
     - ### Changed - for changes in existing functionality
     - ### Deprecated - for soon-to-be removed features
     - ### Removed - for now removed features
     - ### Fixed - for any bug fixes
     - ### Security - for vulnerability fixes
   - Be specific and user-focused in descriptions
   - Include technical details about what was implemented
   - **Reference directory changelogs**: "See frontend/CHANGELOG.md for detailed frontend changes"

9. **Generate Commit Message**
   - Format:
     ```
     <type>(<scope>): <subject>
     
     <body>
     
     <footer>
     ```
   - Types: feat, fix, docs, style, refactor, test, chore, build
   - Scope: auth, payment, business, navigation, ui, config, etc.
   - Subject: imperative mood, lowercase, no period, max 50 chars
   - Body: explain what and why, wrap at 72 chars
   - Footer: breaking changes, issues closed

10. **Execute Git Commands (COMPREHENSIVE STAGING)**
   ```bash
   git add -A
   git commit -m "<generated message>"
   git push origin <current-branch>
   ```
   - **CRITICAL**: Use `git add -A` instead of `git add .` to ensure ALL changes are captured
   - This includes new files, modified files, and deleted files
   - Ensures nothing is missed in the commit

## Important Guidelines:

- **DIRECTORY CHANGELOGS FIRST**: Update directory-specific CHANGELOG.md files before root CHANGELOG.md
- **ROOT CHANGELOG.md MUST BE UPDATED LAST**: Always update root CHANGELOG.md as the final step before commit
- **CROSS-REFERENCE DIRECTORIES**: Root changelog should reference updated directory changelogs
- Always check the current git branch before pushing
- Use `git add -A` to ensure ALL file changes are captured (new, modified, deleted)
- Use Markdown formatting for all documentation
- Keep language clear and concise
- Focus on WHY changes were made, not just WHAT
- Update multiple documentation files if the change impacts different areas
- Ensure consistency across all documentation updates
- Directory changelogs provide technical detail, root changelog provides business overview

## Current Project File Structure:
```
dreamihaircare/
├── CHANGELOG.md                    # Root release notes (UPDATE LAST!)
├── README.md                       # Project overview
├── package.json                    # Monorepo dependencies
├── frontend/                       # Next.js application
│   ├── CHANGELOG.md               # Frontend-specific changes
│   ├── src/                       # Source code
│   ├── tests/                     # E2E and integration tests
│   └── package.json               # Frontend dependencies
├── backend/                        # Express.js API
│   ├── CHANGELOG.md               # Backend-specific changes
│   ├── src/                       # Source code
│   │   ├── graphql/               # GraphQL resolvers and schema
│   │   ├── models/                # Database models
│   │   ├── services/              # Business logic services
│   │   └── types/                 # TypeScript definitions
│   └── package.json               # Backend dependencies
├── shared/                         # Shared types and utilities
│   └── CHANGELOG.md               # Shared component changes
├── dreamie-notifications/          # Notification system
│   └── CHANGELOG.md               # Notification system changes
├── frontend-investors/             # Investor portal
│   └── CHANGELOG.md               # Investor portal changes
├── playwright-tests/               # E2E testing suite
│   └── CHANGELOG.md               # Testing changes
├── reports/                        # Analytics and reporting
│   └── CHANGELOG.md               # Reporting system changes
├── .github/                        # GitHub workflows and CI/CD
│   ├── CHANGELOG.md               # CI/CD and workflow changes
│   └── workflows/                 # GitHub Actions
├── docs/                          # Project documentation
│   ├── CHANGELOG.md               # Documentation changes
│   ├── architecture/              # Technical architecture
│   ├── implementation/            # Feature implementation guides
│   ├── internal/                  # Internal tooling documentation
│   ├── project-management/        # Planning and completed tasks
│   ├── mcp/                       # Model Context Protocol docs
│   └── stripe/                    # Payment system documentation
├── scripts/                       # Automation and utilities
│   ├── CHANGELOG.md               # Script and automation changes
│   └── [Various automation scripts]
├── infrastructure/                # DevOps and deployment
│   ├── CHANGELOG.md               # Infrastructure changes
│   └── [Deployment configurations]
└── .claude/                       # Claude Code configurations
    ├── CHANGELOG.md               # Claude tooling changes
    ├── agents/                    # AI agent configurations
    │   └── CHANGELOG.md           # Agent ecosystem changes
    ├── commands/                  # Custom commands
    │   └── CHANGELOG.md           # Command automation changes
    └── hooks/                     # Session hooks
```

## Example Commit Messages:

```
feat(checkout): implement shopping cart and checkout flow

### Summary:
- 3 files added, 5 modified, 0 deleted, 0 renamed
- Directory changelogs updated: frontend/CHANGELOG.md, shared/CHANGELOG.md, docs/CHANGELOG.md
- Root CHANGELOG.md updated with cross-references to detailed changes

### Key Changes:
- Added CartContext for state management across components
- Created CartSidebar component for cart interactions
- Implemented checkout page with form validation
- Updated Header component with cart icon and counter
- Added shared types for cart and payment interfaces

### Documentation Updated:
- frontend/CHANGELOG.md - detailed frontend component changes
- shared/CHANGELOG.md - new shared types and interfaces
- docs/technical/architecture.md - updated component structure
- docs/business/user-stories.md - marked checkout stories as completed
- docs/CHANGELOG.md - documentation change tracking
- CHANGELOG.md - comprehensive release notes with directory references

🚀 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

```
fix(config): update gitignore and fix file tracking

### Summary:
- 2 files added, 1 modified, 98 deleted, 0 renamed
- Directory changelogs updated: backend/CHANGELOG.md (if backend changes)
- Root CHANGELOG.md updated with comprehensive change documentation

### Key Changes:
- Updated .gitignore to exclude .next/ build artifacts
- Removed build cache files from git tracking
- Fixed git workflow to use comprehensive staging

### Documentation Updated:
- backend/CHANGELOG.md - build configuration changes (if applicable)
- docs/git-commit-all.md - updated with proper git commands
- docs/CHANGELOG.md - documentation change tracking
- CHANGELOG.md - added fix documentation with directory references

🚀 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Critical Workflow Requirements:

1. **Documentation Order**: Update all other documentation BEFORE any CHANGELOG.md files
2. **Directory Changelogs**: Update directory-specific CHANGELOG.md files based on changed files
3. **Root CHANGELOG.md Last**: Always update root CHANGELOG.md as the final step before commit
4. **Cross-Reference**: Root changelog should reference updated directory changelogs
5. **Comprehensive Staging**: Use `git add -A` to capture ALL changes (new, modified, deleted)
6. **Complete Documentation**: Ensure all relevant docs are updated to reflect current state

Remember: Directory CHANGELOG.md files provide technical detail for each component, while root CHANGELOG.md provides business overview with cross-references. Root CHANGELOG.md must be the last file modified before commit.