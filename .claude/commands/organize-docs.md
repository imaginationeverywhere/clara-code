--- Cursor Command: organize-docs.md ---
# organize-docs

**Purpose**: Maintain organized, consistent, and up-to-date documentation across the project

**Context**: This command analyzes, organizes, and validates all project documentation to ensure proper structure, consistency, cross-references, and completeness. It detects outdated content, missing files, broken links, and inconsistencies while generating documentation indexes and navigation aids.

## Command Usage

**Claude Code Commands**:
```bash
organize-docs                          # Full documentation organization and validation
organize-docs --check                  # Check documentation status without making changes
organize-docs --fix                    # Auto-fix common documentation issues
organize-docs --index                  # Generate documentation index and navigation
organize-docs --validate               # Validate documentation structure and links
organize-docs --sync                   # Sync documentation with code structure
```

**npm Scripts**:
```bash
npm run organize-docs                  # Full documentation organization
npm run organize-docs:check            # Status check only
npm run organize-docs:fix              # Auto-fix issues
npm run organize-docs:index            # Generate indexes
npm run organize-docs:validate         # Validation only
```

## Documentation Standards (MANDATORY)

### Root Directory Requirements
**ONLY these files are allowed in the project root directory:**
- `README.md` - Project overview and quick start
- `CHANGELOG.md` - Version history and changes
- `CLAUDE.md` - Main project instructions for Claude Code

**All other `.md` files MUST be moved to appropriate subdirectories:**
- Authentication guides → `docs/authentication/`
- Technical documentation → `docs/technical/`
- Plans and strategies → `docs/plans/`
- Reports → `docs/reports/`
- Integration guides → `docs/integrations/`

### Subdirectory Index Files
**CRITICAL:** All documentation subdirectories MUST use `README.md` as their index file, NOT `INDEX.md`.

**Correct:**
- `docs/README.md` ✅
- `docs/technical/README.md` ✅
- `.claude/commands/README.md` ✅
- `.claude/agents/README.md` ✅

**Incorrect:**
- `docs/INDEX.md` ❌
- `docs/technical/INDEX.md` ❌
- `.claude/commands/INDEX.md` ❌

**Why:** `README.md` is the universal standard that:
- Automatically displays on GitHub when viewing directories
- Follows developer expectations
- Provides better discoverability

## Core Functionality

### 1. **Documentation Structure Analysis**

Analyzes and organizes documentation into proper categories:

**Core Documentation (Root Level Only)**:
- `CLAUDE.md` - Main project instructions for Claude Code
- `README.md` - Project overview and quick start
- `CHANGELOG.md` - Version history and changes
- `docs/PRD.md` - Project Requirements Document (in docs/ subdirectory)

**Technical Documentation**:
- `docs/technical/` - Architecture, API, database schemas
- `docs/detailed/` - Modular detailed guides
- `docs/deployment/` - Deployment and infrastructure
- `infrastructure/README.md` - AWS CDK documentation

**Workflow Documentation**:
- `todo/README.md` - Todo system documentation
- `todo-summaries/README.md` - Summary system documentation
- `.claude/commands/*.md` - Command documentation
- `.claude/agents/README.md` - Agent documentation

**Template Documentation**:
- `docs/PRD-TEMPLATE.md` - PRD creation template
- `.claude/TEMPLATE_VARIABLES.md` - Template customization guide
- `docs/TEMPLATE_VARIABLES_GUIDE.md` - Complete variable guide

**Planning Documentation**:
- `docs/plans/README.md` - Development plans index (REQUIRED)
- `docs/plans/*/` - Feature-specific plan subdirectories
- Each subdirectory MUST have README.md index
- Plans linked to implementation reports

**Reporting Documentation**:
- `docs/reports/README.md` - Implementation reports index (REQUIRED)
- `docs/reports/*.md` - Completion reports, assessments, post-mortems
- Reports linked back to original plans

**User Journey Documentation**:
- `docs/user-journeys/README.md` - User journey documentation index (REQUIRED)
- `docs/user-journeys/profile/` - End-user journey guides (getting started, account management)
- `docs/user-journeys/admin/` - Admin user journey guides (setup, management)
- Interactive documentation with step-by-step guides
- Frontmatter metadata for frontend rendering

### 2. **Documentation Validation**

**Structure Validation**:
- Verify required documentation files exist
- Check documentation directory structure
- Validate markdown formatting and syntax
- Ensure proper heading hierarchy (H1 → H2 → H3)

**Content Validation**:
- Check for placeholder text (`[PLACEHOLDER]`, `TODO:`, `FIXME:`)
- Detect outdated version references
- Validate code examples and syntax
- Check for broken internal links

**Cross-Reference Validation**:
- Verify links between documentation files
- Check references to code files
- Validate command references
- Ensure agent references are accurate

**Consistency Validation**:
- Check terminology consistency
- Verify project name consistency
- Validate version number consistency
- Ensure template variable usage

**Planning & Reporting Validation**:
- Verify `docs/plans/README.md` exists (REQUIRED)
- Verify `docs/reports/README.md` exists (REQUIRED)
- Check all plan subdirectories have README.md
- Validate plan-to-report cross-references
- Ensure plans include agent designations
- Verify reports link back to original plans
- Check plan file naming conventions (kebab-case)
- Validate report naming conventions (type-feature-YYYY-MM-DD.md)

**User Journey Validation**:
- Verify `docs/user-journeys/README.md` exists (REQUIRED)
- Verify `docs/user-journeys/profile/` directory exists
- Verify `docs/user-journeys/admin/` directory exists
- Validate frontmatter metadata in all user journey files
- Check template variable placeholders ({{PROJECT_NAME}}, etc.)
- Validate step markers syntax (:::step ... :::)
- Ensure all action links are valid

### 3. **Documentation Organization**

**File Organization**:
```
docs/
├── PRD.md                           # Project Requirements Document
├── PRD-TEMPLATE.md                  # Template for new PRDs
├── TEMPLATE_VARIABLES_GUIDE.md      # Variable customization guide
├── technical/                       # Technical architecture
│   ├── ARCHITECTURE.md              # System architecture
│   ├── API-REFERENCE.md             # API documentation
│   ├── DATABASE-SCHEMA.md           # Database design
│   └── SECURITY.md                  # Security architecture
├── detailed/                        # Modular detailed docs
│   ├── PRP-FRAMEWORK.md             # PRP Framework details
│   ├── DEPLOYMENT.md                # Deployment guide
│   ├── UPDATE-SYSTEM.md             # Update system details
│   ├── WORKFLOW-EXAMPLES.md         # Workflow examples
│   └── TROUBLESHOOTING.md           # Troubleshooting guide
├── deployment/                      # Deployment documentation
│   ├── AWS-SETUP.md                 # AWS infrastructure setup
│   ├── AMPLIFY-DEPLOYMENT.md        # Amplify deployment
│   └── EC2-DEPLOYMENT.md            # EC2 backend deployment
├── plans/                           # Development plans (REQUIRED README.md)
│   ├── README.md                    # Plans index
│   ├── feature-plan.md              # Individual feature plans
│   └── domain/                      # Domain-specific plans subdirectory
│       └── README.md                # Domain plans index
├── reports/                         # Implementation reports (REQUIRED README.md)
│   ├── README.md                    # Reports index
│   ├── feature-implementation-complete.md  # Completion reports
│   └── readiness-assessment-YYYY-MM-DD.md  # Readiness assessments
└── guides/                          # User guides and tutorials
    ├── GETTING-STARTED.md           # Quick start guide
    ├── DEVELOPER-ONBOARDING.md      # Developer setup
    └── TEAM-SETUP.md                # Team coordination
```

**Category Assignment**:
- Move misplaced documentation files
- Create missing category directories
- Standardize file naming conventions
- Remove duplicate documentation

### 4. **Index Generation**

**Documentation Index** (`docs/README.md`):
```markdown
# Documentation Index

## Quick Start
- [Getting Started](guides/GETTING-STARTED.md)
- [Developer Onboarding](guides/DEVELOPER-ONBOARDING.md)
- [PRD Template](PRD-TEMPLATE.md)

## Core Documentation
- [Project Requirements](PRD.md)
- [Architecture Overview](technical/ARCHITECTURE.md)
- [API Reference](technical/API-REFERENCE.md)

## Deployment
- [AWS Setup](deployment/AWS-SETUP.md)
- [Frontend Deployment](deployment/AMPLIFY-DEPLOYMENT.md)
- [Backend Deployment](deployment/EC2-DEPLOYMENT.md)

## Workflows
- [Daily Development](detailed/WORKFLOW-EXAMPLES.md)
- [PRP Framework](detailed/PRP-FRAMEWORK.md)
- [Troubleshooting](detailed/TROUBLESHOOTING.md)
```

**Command Index** (`.claude/commands/README.md`):
- Categorized list of all commands
- Usage examples and cross-references
- Command dependency mapping
- Already exists - update and maintain it

**Agent Index** (`.claude/agents/README.md`):
- Agent categorization and descriptions
- Agent collaboration patterns
- Technology mapping

### 5. **Link Management**

**Link Detection**:
- Scan all markdown files for links
- Identify internal vs external links
- Detect relative vs absolute paths
- Check anchor links

**Link Validation**:
- Verify internal file links exist
- Check external links are accessible
- Validate anchor targets exist
- Report broken links

**Link Correction**:
- Fix broken internal links
- Update moved file references
- Standardize link formats
- Generate link reports

### 6. **Content Analysis**

**Placeholder Detection**:
```
Found placeholders requiring attention:
  docs/PRD.md:15 - [PROJECT_NAME]
  docs/PRD.md:23 - [PROJECT_KEY]
  README.md:45 - [DESCRIPTION]
```

**Outdated Content Detection**:
```
Outdated version references:
  docs/technical/API.md:12 - References v1.5.0 (current: v1.8.0)
  README.md:89 - Old command syntax detected
```

**Missing Content Detection**:
```
Missing required sections:
  docs/PRD.md - Missing "Security Requirements"
  docs/technical/API.md - Missing "Error Codes"
```

### 7. **Code-Documentation Synchronization**

**Code Structure Mapping**:
- Detect new features requiring documentation
- Identify deprecated features to document
- Map code modules to documentation sections
- Check API documentation matches implementation

**Command Documentation Sync**:
- Verify all commands have documentation
- Check command examples are up-to-date
- Validate command parameters
- Ensure agent references are current

**Agent Documentation Sync**:
- Verify all agents are documented
- Check agent descriptions match implementation
- Validate agent usage examples
- Ensure technology mappings are accurate

## Implementation Details

### Documentation Scanner

```javascript
async function scanDocumentation() {
  const docs = {
    core: [],
    technical: [],
    workflow: [],
    templates: [],
    commands: [],
    agents: []
  };

  // Scan each documentation category
  docs.core = await scanDirectory(['CLAUDE.md', 'README.md', 'docs/PRD.md']);
  docs.technical = await scanDirectory('docs/technical/');
  docs.workflow = await scanDirectory(['todo/', 'todo-summaries/']);
  docs.templates = await scanDirectory('docs/*TEMPLATE*.md');
  docs.commands = await scanDirectory('.claude/commands/');
  docs.agents = await scanDirectory('.claude/agents/');

  return docs;
}
```

### Link Validator

```javascript
async function validateLinks(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const links = extractMarkdownLinks(content);
  const issues = [];

  for (const link of links) {
    if (link.type === 'internal') {
      if (!fs.existsSync(link.target)) {
        issues.push({
          type: 'broken-link',
          line: link.line,
          target: link.target,
          message: `Broken link to ${link.target}`
        });
      }
    } else if (link.type === 'anchor') {
      if (!hasAnchor(filePath, link.anchor)) {
        issues.push({
          type: 'broken-anchor',
          line: link.line,
          anchor: link.anchor,
          message: `Anchor #${link.anchor} not found`
        });
      }
    }
  }

  return issues;
}
```

### Placeholder Detector

```javascript
function detectPlaceholders(content, filePath) {
  const placeholderPatterns = [
    /\[([A-Z_]+)\]/g,           // [PLACEHOLDER]
    /TODO:/g,                    // TODO:
    /FIXME:/g,                   // FIXME:
    /XXX:/g,                     // XXX:
    /\[Insert .+?\]/g           // [Insert description]
  ];

  const placeholders = [];
  let lineNumber = 1;

  for (const line of content.split('\n')) {
    for (const pattern of placeholderPatterns) {
      const matches = line.matchAll(pattern);
      for (const match of matches) {
        placeholders.push({
          file: filePath,
          line: lineNumber,
          placeholder: match[0],
          context: line.trim()
        });
      }
    }
    lineNumber++;
  }

  return placeholders;
}
```

### Index Generator

```javascript
async function generateDocumentationIndex() {
  const docs = await scanDocumentation();

  const index = {
    quickStart: generateQuickStartSection(docs),
    core: generateCoreSection(docs),
    technical: generateTechnicalSection(docs),
    deployment: generateDeploymentSection(docs),
    workflows: generateWorkflowSection(docs),
    commands: generateCommandSection(docs),
    agents: generateAgentSection(docs)
  };

  const markdown = formatIndexMarkdown(index);
  await fs.writeFile('docs/README.md', markdown);

  return index;
}
```

## Interactive Organization Process

### 1. **Documentation Scan**
```
📚 Scanning Documentation Structure
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Project: quik-nation-ai-boilerplate
📋 Documentation root: docs/

Found 127 documentation files:
  ✅ Core documentation: 4 files
  ✅ Technical docs: 23 files
  ✅ Workflow docs: 15 files
  ✅ Commands: 52 files
  ✅ Agents: 22 files
  ⚠️  Uncategorized: 11 files
```

### 2. **Validation Report**
```
🔍 Validating Documentation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Structure Issues:
  ⚠️  docs/api-docs.md - Should be in docs/technical/
  ⚠️  setup-guide.md - Should be in docs/guides/

Content Issues:
  ❌ docs/PRD.md:15 - Placeholder [PROJECT_NAME]
  ❌ README.md:45 - Placeholder [DESCRIPTION]
  ⚠️  docs/API.md:12 - Outdated version reference

Link Issues:
  ❌ docs/DEPLOYMENT.md:89 - Broken link to setup-ec2.md
  ❌ CLAUDE.md:234 - Broken anchor #configuration

Total Issues: 7 (3 critical, 4 warnings)
```

### 3. **Auto-Fix Process**
```
🔧 Auto-Fixing Documentation Issues
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

File Organization:
  ✅ Moved docs/api-docs.md → docs/technical/API-REFERENCE.md
  ✅ Moved setup-guide.md → docs/guides/SETUP.md

Link Corrections:
  ✅ Fixed link in docs/DEPLOYMENT.md
  ✅ Updated anchor in CLAUDE.md

Manual Review Required:
  ⚠️  docs/PRD.md - 2 placeholders need values
  ⚠️  README.md - 1 placeholder needs value

Fixed: 4 issues
Remaining: 3 issues (manual review required)
```

### 4. **Index Generation**
```
📖 Generating Documentation Indexes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Created indexes:
  ✅ docs/README.md - Main documentation index
  ✅ .claude/commands/README.md - Command reference (updated)
  ✅ .claude/agents/README.md - Agent catalog
  ✅ docs/technical/README.md - Technical documentation

Navigation aids:
  ✅ Added table of contents to long documents
  ✅ Generated cross-reference links
  ✅ Created quick-start navigation
```

### 5. **Final Report**
```
✨ Documentation Organization Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary:
  📁 Organized: 127 files
  🔧 Auto-fixed: 4 issues
  ⚠️  Manual review: 3 issues
  📖 Generated: 4 indexes
  ✅ Validation: 95% pass rate

Next Steps:
  1. Review and fill placeholders in docs/PRD.md
  2. Update description in README.md
  3. Run: organize-docs --validate to verify fixes
```

## Usage Examples

### Check Documentation Status
```bash
# Check documentation without making changes
organize-docs --check

# Output shows:
# - Missing required files
# - Broken links
# - Placeholders
# - Structural issues
```

### Fix Documentation Issues
```bash
# Auto-fix common issues
organize-docs --fix

# Fixes:
# - Moves misplaced files
# - Corrects broken links
# - Standardizes naming
# - Updates references
```

### Generate Navigation Indexes
```bash
# Create documentation indexes
organize-docs --index

# Generates:
# - docs/README.md
# - Updates .claude/commands/README.md
# - .claude/agents/README.md
# - Category-specific indexes
```

### Validate Documentation
```bash
# Comprehensive validation
organize-docs --validate

# Checks:
# - File structure
# - Link integrity
# - Content completeness
# - Consistency
```

### Sync with Code Changes
```bash
# Synchronize documentation with code
organize-docs --sync

# Actions:
# - Detect new commands needing docs
# - Identify deprecated features
# - Update API documentation
# - Refresh examples
```

## Integration with Development Workflow

### Pre-Commit Hook Integration
```bash
# Add to .git/hooks/pre-commit
npm run organize-docs:check
if [ $? -ne 0 ]; then
  echo "Documentation issues detected. Run: organize-docs --fix"
  exit 1
fi
```

### CI/CD Integration
```yaml
# GitHub Actions workflow
- name: Validate Documentation
  run: npm run organize-docs:validate

- name: Check for Broken Links
  run: npm run organize-docs:check
```

### Documentation Review Workflow
```bash
# Before pull request
organize-docs --validate
organize-docs --index

# Fix any issues
organize-docs --fix

# Commit documentation updates
git add docs/ .claude/
git commit -m "docs: organize and validate documentation"
```

## Configuration

### Documentation Config (`.docconfig.json`)

```json
{
  "structure": {
    "requiredFiles": [
      "CLAUDE.md",
      "README.md",
      "docs/PRD.md",
      "CHANGELOG.md"
    ],
    "requiredDirectories": [
      "docs/technical",
      "docs/detailed",
      "docs/deployment"
    ]
  },
  "validation": {
    "checkPlaceholders": true,
    "checkBrokenLinks": true,
    "checkOutdatedVersions": true,
    "strictMode": false
  },
  "organization": {
    "autoFix": true,
    "autoMove": true,
    "createMissingDirs": true,
    "standardizeNaming": true
  },
  "indexGeneration": {
    "enabled": true,
    "tableOfContents": true,
    "crossReferences": true,
    "commandIndex": true,
    "agentIndex": true
  }
}
```

## Error Handling

### Common Issues

**Issue**: "Required documentation file missing: docs/PRD.md"
**Solution**: Copy `docs/PRD-TEMPLATE.md` to `docs/PRD.md` and fill in details

**Issue**: "Broken link detected in CLAUDE.md:234"
**Solution**: Run `organize-docs --fix` to auto-correct or manually update link

**Issue**: "Uncategorized files found in docs/"
**Solution**: Review files and move to appropriate category or add to `.docconfig.json`

**Issue**: "Placeholder text detected in production documentation"
**Solution**: Fill in placeholder values or run `organize-docs --check` for details

## Best Practices

### Regular Maintenance
- Run `organize-docs --check` daily during development
- Generate indexes weekly or after significant changes
- Validate documentation before releases
- Keep documentation synchronized with code changes

### Team Coordination
- Use documentation validation in CI/CD pipeline
- Review documentation changes in pull requests
- Maintain documentation style guide
- Schedule regular documentation audits

### Version Control
- Track documentation changes in CHANGELOG.md
- Use semantic versioning for major documentation updates
- Tag documentation releases with code releases
- Maintain documentation branches for major versions

This command ensures your project documentation remains organized, accurate, and helpful throughout the development lifecycle.

--- End Command ---

# organize-docs

**Purpose**: Maintain organized, consistent, and up-to-date documentation across the project

**Context**: This command analyzes, organizes, and validates all project documentation to ensure proper structure, consistency, cross-references, and completeness. It detects outdated content, missing files, broken links, and inconsistencies while generating documentation indexes and navigation aids.

## Command Usage

**Claude Code Commands**:
```bash
organize-docs                          # Full documentation organization and validation
organize-docs --check                  # Check documentation status without making changes
organize-docs --fix                    # Auto-fix common documentation issues
organize-docs --index                  # Generate documentation index and navigation
organize-docs --validate               # Validate documentation structure and links
organize-docs --sync                   # Sync documentation with code structure
```

**npm Scripts**:
```bash
npm run organize-docs                  # Full documentation organization
npm run organize-docs:check            # Status check only
npm run organize-docs:fix              # Auto-fix issues
npm run organize-docs:index            # Generate indexes
npm run organize-docs:validate         # Validation only
```

## Documentation Standards (MANDATORY)

### Root Directory Requirements
**ONLY these files are allowed in the project root directory:**
- `README.md` - Project overview and quick start
- `CHANGELOG.md` - Version history and changes
- `CLAUDE.md` - Main project instructions for Claude Code

**All other `.md` files MUST be moved to appropriate subdirectories:**
- Authentication guides → `docs/authentication/`
- Technical documentation → `docs/technical/`
- Plans and strategies → `docs/plans/`
- Reports → `docs/reports/`
- Integration guides → `docs/integrations/`

### Subdirectory Index Files
**CRITICAL:** All documentation subdirectories MUST use `README.md` as their index file, NOT `INDEX.md`.

**Correct:**
- `docs/README.md` ✅
- `docs/technical/README.md` ✅
- `.claude/commands/README.md` ✅
- `.claude/agents/README.md` ✅

**Incorrect:**
- `docs/INDEX.md` ❌
- `docs/technical/INDEX.md` ❌
- `.claude/commands/INDEX.md` ❌

**Why:** `README.md` is the universal standard that:
- Automatically displays on GitHub when viewing directories
- Follows developer expectations
- Provides better discoverability

## Core Functionality

### 1. **Documentation Structure Analysis**

Analyzes and organizes documentation into proper categories:

**Core Documentation (Root Level Only)**:
- `CLAUDE.md` - Main project instructions for Claude Code
- `README.md` - Project overview and quick start
- `CHANGELOG.md` - Version history and changes
- `docs/PRD.md` - Project Requirements Document (in docs/ subdirectory)

**Technical Documentation**:
- `docs/technical/` - Architecture, API, database schemas
- `docs/detailed/` - Modular detailed guides
- `docs/deployment/` - Deployment and infrastructure
- `infrastructure/README.md` - AWS CDK documentation

**Workflow Documentation**:
- `todo/README.md` - Todo system documentation
- `todo-summaries/README.md` - Summary system documentation
- `.claude/commands/*.md` - Command documentation
- `.claude/agents/README.md` - Agent documentation

**Template Documentation**:
- `docs/PRD-TEMPLATE.md` - PRD creation template
- `.claude/TEMPLATE_VARIABLES.md` - Template customization guide
- `docs/TEMPLATE_VARIABLES_GUIDE.md` - Complete variable guide

**Planning Documentation**:
- `docs/plans/README.md` - Development plans index (REQUIRED)
- `docs/plans/*/` - Feature-specific plan subdirectories
- Each subdirectory MUST have README.md index
- Plans linked to implementation reports

**Reporting Documentation**:
- `docs/reports/README.md` - Implementation reports index (REQUIRED)
- `docs/reports/*.md` - Completion reports, assessments, post-mortems
- Reports linked back to original plans

**User Journey Documentation**:
- `docs/user-journeys/README.md` - User journey documentation index (REQUIRED)
- `docs/user-journeys/profile/` - End-user journey guides (getting started, account management)
- `docs/user-journeys/admin/` - Admin user journey guides (setup, management)
- Interactive documentation with step-by-step guides
- Frontmatter metadata for frontend rendering

### 2. **Documentation Validation**

**Structure Validation**:
- Verify required documentation files exist
- Check documentation directory structure
- Validate markdown formatting and syntax
- Ensure proper heading hierarchy (H1 → H2 → H3)

**Content Validation**:
- Check for placeholder text (`[PLACEHOLDER]`, `TODO:`, `FIXME:`)
- Detect outdated version references
- Validate code examples and syntax
- Check for broken internal links

**Cross-Reference Validation**:
- Verify links between documentation files
- Check references to code files
- Validate command references
- Ensure agent references are accurate

**Consistency Validation**:
- Check terminology consistency
- Verify project name consistency
- Validate version number consistency
- Ensure template variable usage

**Planning & Reporting Validation**:
- Verify `docs/plans/README.md` exists (REQUIRED)
- Verify `docs/reports/README.md` exists (REQUIRED)
- Check all plan subdirectories have README.md
- Validate plan-to-report cross-references
- Ensure plans include agent designations
- Verify reports link back to original plans
- Check plan file naming conventions (kebab-case)
- Validate report naming conventions (type-feature-YYYY-MM-DD.md)

**User Journey Validation**:
- Verify `docs/user-journeys/README.md` exists (REQUIRED)
- Verify `docs/user-journeys/profile/` directory exists
- Verify `docs/user-journeys/admin/` directory exists
- Validate frontmatter metadata in all user journey files
- Check template variable placeholders ({{PROJECT_NAME}}, etc.)
- Validate step markers syntax (:::step ... :::)
- Ensure all action links are valid

### 3. **Documentation Organization**

**File Organization**:
```
docs/
├── PRD.md                           # Project Requirements Document
├── PRD-TEMPLATE.md                  # Template for new PRDs
├── TEMPLATE_VARIABLES_GUIDE.md      # Variable customization guide
├── technical/                       # Technical architecture
│   ├── ARCHITECTURE.md              # System architecture
│   ├── API-REFERENCE.md             # API documentation
│   ├── DATABASE-SCHEMA.md           # Database design
│   └── SECURITY.md                  # Security architecture
├── detailed/                        # Modular detailed docs
│   ├── PRP-FRAMEWORK.md             # PRP Framework details
│   ├── DEPLOYMENT.md                # Deployment guide
│   ├── UPDATE-SYSTEM.md             # Update system details
│   ├── WORKFLOW-EXAMPLES.md         # Workflow examples
│   └── TROUBLESHOOTING.md           # Troubleshooting guide
├── deployment/                      # Deployment documentation
│   ├── AWS-SETUP.md                 # AWS infrastructure setup
│   ├── AMPLIFY-DEPLOYMENT.md        # Amplify deployment
│   └── EC2-DEPLOYMENT.md            # EC2 backend deployment
├── plans/                           # Development plans (REQUIRED README.md)
│   ├── README.md                    # Plans index
│   ├── feature-plan.md              # Individual feature plans
│   └── domain/                      # Domain-specific plans subdirectory
│       └── README.md                # Domain plans index
├── reports/                         # Implementation reports (REQUIRED README.md)
│   ├── README.md                    # Reports index
│   ├── feature-implementation-complete.md  # Completion reports
│   └── readiness-assessment-YYYY-MM-DD.md  # Readiness assessments
└── guides/                          # User guides and tutorials
    ├── GETTING-STARTED.md           # Quick start guide
    ├── DEVELOPER-ONBOARDING.md      # Developer setup
    └── TEAM-SETUP.md                # Team coordination
```

**Category Assignment**:
- Move misplaced documentation files
- Create missing category directories
- Standardize file naming conventions
- Remove duplicate documentation

### 4. **Index Generation**

**Documentation Index** (`docs/README.md`):
```markdown
# Documentation Index

## Quick Start
- [Getting Started](guides/GETTING-STARTED.md)
- [Developer Onboarding](guides/DEVELOPER-ONBOARDING.md)
- [PRD Template](PRD-TEMPLATE.md)

## Core Documentation
- [Project Requirements](PRD.md)
- [Architecture Overview](technical/ARCHITECTURE.md)
- [API Reference](technical/API-REFERENCE.md)

## Deployment
- [AWS Setup](deployment/AWS-SETUP.md)
- [Frontend Deployment](deployment/AMPLIFY-DEPLOYMENT.md)
- [Backend Deployment](deployment/EC2-DEPLOYMENT.md)

## Workflows
- [Daily Development](detailed/WORKFLOW-EXAMPLES.md)
- [PRP Framework](detailed/PRP-FRAMEWORK.md)
- [Troubleshooting](detailed/TROUBLESHOOTING.md)
```

**Command Index** (`.claude/commands/README.md`):
- Categorized list of all commands
- Usage examples and cross-references
- Command dependency mapping
- Already exists - update and maintain it

**Agent Index** (`.claude/agents/README.md`):
- Agent categorization and descriptions
- Agent collaboration patterns
- Technology mapping

### 5. **Link Management**

**Link Detection**:
- Scan all markdown files for links
- Identify internal vs external links
- Detect relative vs absolute paths
- Check anchor links

**Link Validation**:
- Verify internal file links exist
- Check external links are accessible
- Validate anchor targets exist
- Report broken links

**Link Correction**:
- Fix broken internal links
- Update moved file references
- Standardize link formats
- Generate link reports

### 6. **Content Analysis**

**Placeholder Detection**:
```
Found placeholders requiring attention:
  docs/PRD.md:15 - [PROJECT_NAME]
  docs/PRD.md:23 - [PROJECT_KEY]
  README.md:45 - [DESCRIPTION]
```

**Outdated Content Detection**:
```
Outdated version references:
  docs/technical/API.md:12 - References v1.5.0 (current: v1.8.0)
  README.md:89 - Old command syntax detected
```

**Missing Content Detection**:
```
Missing required sections:
  docs/PRD.md - Missing "Security Requirements"
  docs/technical/API.md - Missing "Error Codes"
```

### 7. **Code-Documentation Synchronization**

**Code Structure Mapping**:
- Detect new features requiring documentation
- Identify deprecated features to document
- Map code modules to documentation sections
- Check API documentation matches implementation

**Command Documentation Sync**:
- Verify all commands have documentation
- Check command examples are up-to-date
- Validate command parameters
- Ensure agent references are current

**Agent Documentation Sync**:
- Verify all agents are documented
- Check agent descriptions match implementation
- Validate agent usage examples
- Ensure technology mappings are accurate

## Implementation Details

### Documentation Scanner

```javascript
async function scanDocumentation() {
  const docs = {
    core: [],
    technical: [],
    workflow: [],
    templates: [],
    commands: [],
    agents: []
  };

  // Scan each documentation category
  docs.core = await scanDirectory(['CLAUDE.md', 'README.md', 'docs/PRD.md']);
  docs.technical = await scanDirectory('docs/technical/');
  docs.workflow = await scanDirectory(['todo/', 'todo-summaries/']);
  docs.templates = await scanDirectory('docs/*TEMPLATE*.md');
  docs.commands = await scanDirectory('.claude/commands/');
  docs.agents = await scanDirectory('.claude/agents/');

  return docs;
}
```

### Link Validator

```javascript
async function validateLinks(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const links = extractMarkdownLinks(content);
  const issues = [];

  for (const link of links) {
    if (link.type === 'internal') {
      if (!fs.existsSync(link.target)) {
        issues.push({
          type: 'broken-link',
          line: link.line,
          target: link.target,
          message: `Broken link to ${link.target}`
        });
      }
    } else if (link.type === 'anchor') {
      if (!hasAnchor(filePath, link.anchor)) {
        issues.push({
          type: 'broken-anchor',
          line: link.line,
          anchor: link.anchor,
          message: `Anchor #${link.anchor} not found`
        });
      }
    }
  }

  return issues;
}
```

### Placeholder Detector

```javascript
function detectPlaceholders(content, filePath) {
  const placeholderPatterns = [
    /\[([A-Z_]+)\]/g,           // [PLACEHOLDER]
    /TODO:/g,                    // TODO:
    /FIXME:/g,                   // FIXME:
    /XXX:/g,                     // XXX:
    /\[Insert .+?\]/g           // [Insert description]
  ];

  const placeholders = [];
  let lineNumber = 1;

  for (const line of content.split('\n')) {
    for (const pattern of placeholderPatterns) {
      const matches = line.matchAll(pattern);
      for (const match of matches) {
        placeholders.push({
          file: filePath,
          line: lineNumber,
          placeholder: match[0],
          context: line.trim()
        });
      }
    }
    lineNumber++;
  }

  return placeholders;
}
```

### Index Generator

```javascript
async function generateDocumentationIndex() {
  const docs = await scanDocumentation();

  const index = {
    quickStart: generateQuickStartSection(docs),
    core: generateCoreSection(docs),
    technical: generateTechnicalSection(docs),
    deployment: generateDeploymentSection(docs),
    workflows: generateWorkflowSection(docs),
    commands: generateCommandSection(docs),
    agents: generateAgentSection(docs)
  };

  const markdown = formatIndexMarkdown(index);
  await fs.writeFile('docs/README.md', markdown);

  return index;
}
```

## Interactive Organization Process

### 1. **Documentation Scan**
```
📚 Scanning Documentation Structure
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Project: claude-boilerplate
📋 Documentation root: docs/

Found 127 documentation files:
  ✅ Core documentation: 4 files
  ✅ Technical docs: 23 files
  ✅ Workflow docs: 15 files
  ✅ Commands: 52 files
  ✅ Agents: 22 files
  ⚠️  Uncategorized: 11 files
```

### 2. **Validation Report**
```
🔍 Validating Documentation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Structure Issues:
  ⚠️  docs/api-docs.md - Should be in docs/technical/
  ⚠️  setup-guide.md - Should be in docs/guides/

Content Issues:
  ❌ docs/PRD.md:15 - Placeholder [PROJECT_NAME]
  ❌ README.md:45 - Placeholder [DESCRIPTION]
  ⚠️  docs/API.md:12 - Outdated version reference

Link Issues:
  ❌ docs/DEPLOYMENT.md:89 - Broken link to setup-ec2.md
  ❌ CLAUDE.md:234 - Broken anchor #configuration

Total Issues: 7 (3 critical, 4 warnings)
```

### 3. **Auto-Fix Process**
```
🔧 Auto-Fixing Documentation Issues
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

File Organization:
  ✅ Moved docs/api-docs.md → docs/technical/API-REFERENCE.md
  ✅ Moved setup-guide.md → docs/guides/SETUP.md

Link Corrections:
  ✅ Fixed link in docs/DEPLOYMENT.md
  ✅ Updated anchor in CLAUDE.md

Manual Review Required:
  ⚠️  docs/PRD.md - 2 placeholders need values
  ⚠️  README.md - 1 placeholder needs value

Fixed: 4 issues
Remaining: 3 issues (manual review required)
```

### 4. **Index Generation**
```
📖 Generating Documentation Indexes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Created indexes:
  ✅ docs/README.md - Main documentation index
  ✅ .claude/commands/README.md - Command reference (updated)
  ✅ .claude/agents/README.md - Agent catalog
  ✅ docs/technical/README.md - Technical documentation

Navigation aids:
  ✅ Added table of contents to long documents
  ✅ Generated cross-reference links
  ✅ Created quick-start navigation
```

### 5. **Final Report**
```
✨ Documentation Organization Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary:
  📁 Organized: 127 files
  🔧 Auto-fixed: 4 issues
  ⚠️  Manual review: 3 issues
  📖 Generated: 4 indexes
  ✅ Validation: 95% pass rate

Next Steps:
  1. Review and fill placeholders in docs/PRD.md
  2. Update description in README.md
  3. Run: organize-docs --validate to verify fixes
```

## Usage Examples

### Check Documentation Status
```bash
# Check documentation without making changes
organize-docs --check

# Output shows:
# - Missing required files
# - Broken links
# - Placeholders
# - Structural issues
```

### Fix Documentation Issues
```bash
# Auto-fix common issues
organize-docs --fix

# Fixes:
# - Moves misplaced files
# - Corrects broken links
# - Standardizes naming
# - Updates references
```

### Generate Navigation Indexes
```bash
# Create documentation indexes
organize-docs --index

# Generates:
# - docs/README.md
# - Updates .claude/commands/README.md
# - .claude/agents/README.md
# - Category-specific indexes
```

### Validate Documentation
```bash
# Comprehensive validation
organize-docs --validate

# Checks:
# - File structure
# - Link integrity
# - Content completeness
# - Consistency
```

### Sync with Code Changes
```bash
# Synchronize documentation with code
organize-docs --sync

# Actions:
# - Detect new commands needing docs
# - Identify deprecated features
# - Update API documentation
# - Refresh examples
```

## Integration with Development Workflow

### Pre-Commit Hook Integration
```bash
# Add to .git/hooks/pre-commit
npm run organize-docs:check
if [ $? -ne 0 ]; then
  echo "Documentation issues detected. Run: organize-docs --fix"
  exit 1
fi
```

### CI/CD Integration
```yaml
# GitHub Actions workflow
- name: Validate Documentation
  run: npm run organize-docs:validate

- name: Check for Broken Links
  run: npm run organize-docs:check
```

### Documentation Review Workflow
```bash
# Before pull request
organize-docs --validate
organize-docs --index

# Fix any issues
organize-docs --fix

# Commit documentation updates
git add docs/ .claude/
git commit -m "docs: organize and validate documentation"
```

## Configuration

### Documentation Config (`.docconfig.json`)

```json
{
  "structure": {
    "requiredFiles": [
      "CLAUDE.md",
      "README.md",
      "docs/PRD.md",
      "CHANGELOG.md"
    ],
    "requiredDirectories": [
      "docs/technical",
      "docs/detailed",
      "docs/deployment"
    ]
  },
  "validation": {
    "checkPlaceholders": true,
    "checkBrokenLinks": true,
    "checkOutdatedVersions": true,
    "strictMode": false
  },
  "organization": {
    "autoFix": true,
    "autoMove": true,
    "createMissingDirs": true,
    "standardizeNaming": true
  },
  "indexGeneration": {
    "enabled": true,
    "tableOfContents": true,
    "crossReferences": true,
    "commandIndex": true,
    "agentIndex": true
  }
}
```

## Error Handling

### Common Issues

**Issue**: "Required documentation file missing: docs/PRD.md"
**Solution**: Copy `docs/PRD-TEMPLATE.md` to `docs/PRD.md` and fill in details

**Issue**: "Broken link detected in CLAUDE.md:234"
**Solution**: Run `organize-docs --fix` to auto-correct or manually update link

**Issue**: "Uncategorized files found in docs/"
**Solution**: Review files and move to appropriate category or add to `.docconfig.json`

**Issue**: "Placeholder text detected in production documentation"
**Solution**: Fill in placeholder values or run `organize-docs --check` for details

## Best Practices

### Regular Maintenance
- Run `organize-docs --check` daily during development
- Generate indexes weekly or after significant changes
- Validate documentation before releases
- Keep documentation synchronized with code changes

### Team Coordination
- Use documentation validation in CI/CD pipeline
- Review documentation changes in pull requests
- Maintain documentation style guide
- Schedule regular documentation audits

### Version Control
- Track documentation changes in CHANGELOG.md
- Use semantic versioning for major documentation updates
- Tag documentation releases with code releases
- Maintain documentation branches for major versions

This command ensures your project documentation remains organized, accurate, and helpful throughout the development lifecycle.

---

## 🆕 CLAUDE.md Generation & Maintenance (CRITICAL)

### Purpose

**CRITICAL**: Every documentation subdirectory MUST have a `CLAUDE.md` file that provides guidance to Claude Code about that directory's documentation.

**Why this matters**:
- Claude can quickly understand what documentation exists in each directory
- Claude knows when to reference which docs
- Claude understands the purpose and context of each doc
- Maintains application awareness of documentation state
- Prevents "I don't know about that documentation" scenarios

### CLAUDE.md Requirements

**Every major docs subdirectory MUST have**:
- `docs/CLAUDE.md` - Guidance for docs/ directory
- `docs/validation/CLAUDE.md` - Guidance for validation documentation
- `docs/testing/CLAUDE.md` - Guidance for testing documentation
- `docs/workflows/CLAUDE.md` - Guidance for workflow documentation
- `docs/deployment/CLAUDE.md` - Guidance for deployment documentation
- `docs/git-hooks/CLAUDE.md` - Guidance for git hooks documentation
- And any other major subdirectories

### MANDATORY: Complete Documentation Triad

**CRITICAL**: Every subdirectory that has a `CLAUDE.md` file MUST also have:
1. **`README.md`** - Index file for the directory contents
2. **`CHANGELOG.md`** - Change history for that directory's documentation
3. **`CLAUDE.md`** - Guidance for Claude Code about the directory

**Why this triad is mandatory**:
- **README.md**: Provides human-readable index and navigation
- **CHANGELOG.md**: Tracks documentation changes and evolution
- **CLAUDE.md**: Provides Claude Code with context and guidance
- **Together**: Ensures complete documentation awareness for both humans and AI

**Example structure**:
```
docs/technical/
├── README.md        # ✅ Required - Directory index
├── CHANGELOG.md     # ✅ Required - Change history
└── CLAUDE.md        # ✅ Required - Claude guidance
```

### CLAUDE.md Template

```markdown
# CLAUDE.md - [Directory Name] Documentation

This file provides guidance to Claude Code when working with [directory purpose] documentation.

---

## Purpose of This Directory

This directory contains **[description of what's here]**

**Created in response to**: [if applicable]

---

## Files in This Directory

### [FILE_NAME.md]
**[Brief description]**

**Contains**:
- [What's in this file]
- [Key sections]

**When Claude should reference this**:
- [Scenario 1]
- [Scenario 2]

---

### [ANOTHER_FILE.md]
**[Brief description]**

**When Claude should reference this**:
- [Scenarios when relevant]

---

## When Claude Works on This Directory

### Adding New Documentation
1. [Steps for adding docs]
2. Update README.md index
3. Update this CLAUDE.md if new patterns
4. Update ../CHANGELOG.md

### Updating Documentation
1. [Update process]
2. Update cross-references
3. Update CHANGELOG.md

---

## Integration with Other Systems

### With git-commit-docs-command
- [How docs in this directory relate to commits]

### With organize-docs Command
- [How organization affects this directory]

---

## Quick Reference for Claude

**User asks X** → Reference [FILE.md]
**User needs Y** → Point to [OTHER_FILE.md]

---

## Related Documentation

- [Links to related directories]

---

**[One-sentence summary of directory purpose]**
```

### When to Generate/Update CLAUDE.md Files

**organize-docs command MUST**:
1. Check if CLAUDE.md exists in each major subdirectory
2. If missing, generate from template with directory-specific content
3. If exists, verify it's up-to-date with current files in directory
4. Update if new documentation files added
5. Report any CLAUDE.md files that need attention

**git-commit-docs-command MUST**:
1. Check if affected directories have CLAUDE.md
2. Update CLAUDE.md if documentation in that directory changed
3. Ensure CLAUDE.md reflects current state before committing

---

## 🆕 docs/CHANGELOG.md Maintenance (CRITICAL)

### Purpose

**CRITICAL**: `docs/CHANGELOG.md` tracks ALL documentation changes to maintain awareness.

**Why this matters**:
- Team knows what documentation was added/changed
- Historical record of documentation evolution
- Helps identify when documentation became outdated
- Audit trail for documentation decisions

### CHANGELOG Requirements

**File Location**: `docs/CHANGELOG.md`

**Must Record**:
- New documentation files (Added)
- Updated documentation files (Updated)
- Moved documentation files (Moved)
- Removed documentation files (Removed)
- Organizational changes

**Format**:
```markdown
## [YYYY-MM-DD] - Brief Description

### Added
- `path/to/file.md` - Purpose and description

### Updated  
- `path/to/file.md` - What changed and why

### Moved
- From: `old/path.md` → To: `new/path.md`

### Removed
- `path/to/file.md` - Reason for removal
```

### When to Update docs/CHANGELOG.md

**organize-docs command MUST**:
1. Record all moves made to organize files
2. Record all new index files created
3. Record all CLAUDE.md files created/updated
4. Add entry with current date
5. Commit CHANGELOG with other changes

**git-commit-docs-command MUST**:
1. Check what documentation files are being committed
2. Add entry to docs/CHANGELOG.md with details
3. Include CHANGELOG in the commit
4. Use CHANGELOG info to improve commit message

**Manual Updates**:
- When manually adding documentation
- When manually updating documentation  
- When archiving documentation

---

## organize-docs Enhanced Workflow

### Step 1: Scan Documentation Structure
- Find all .md files in project
- Categorize by location
- Identify misplaced files (anything in root except README, CLAUDE, CHANGELOG)

### Step 2: Move Misplaced Files
- Move files from root to appropriate docs/ subdirectories
- Use topic-based organization (validation, testing, workflows, etc.)
- Create directories if needed
- Record moves for CHANGELOG

### Step 3: Generate/Update CLAUDE.md Files
- For each major docs subdirectory:
  - Check if CLAUDE.md exists
  - If missing, generate from template
  - If exists, verify it lists all current files
  - Update if files added/removed
  - Record changes for CHANGELOG

### Step 4: Update Index Files
- Update docs/README.md with all files
- Update subdirectory README.md files
- Ensure all indexes are current
- Record updates for CHANGELOG

### Step 5: Update Cross-References
- Scan all .md files for links
- Update links pointing to moved files
- Verify all internal links work
- Fix broken links

### Step 6: Update docs/CHANGELOG.md
- Add new entry with current date
- List all files added
- List all files updated
- List all files moved
- List all organizational changes

### Step 7: Validation Report
- Report any remaining issues
- List files that need manual review
- Suggest improvements
- Confirm organization complete

---

## Integration with git-commit-docs-command

**CRITICAL**: `git-commit-docs-command` MUST call `organize-docs` BEFORE committing.

### Enhanced Workflow

**Before Commit**:
1. Run `organize-docs --fix` to organize all documentation
2. Generate/update CLAUDE.md files for affected directories
3. Update docs/CHANGELOG.md with changes
4. Stage all documentation changes (including CLAUDE.md and CHANGELOG)

**During Commit**:
1. Use CHANGELOG entries to create detailed commit message
2. Reference specific documentation files changed
3. Include organizational improvements made

**After Commit**:
1. Verify CLAUDE.md files committed
2. Verify docs/CHANGELOG.md committed
3. Verify all cross-references still work

### Example Integration

```markdown
When running git-commit-docs-command:

1. Detect documentation changes (git diff)
2. Run organize-docs --fix
3. Check affected directories for CLAUDE.md
4. Update CLAUDE.md if needed
5. Update docs/CHANGELOG.md with entries
6. Stage all changes
7. Create commit message from CHANGELOG
8. Commit

Result:
- All docs organized ✅
- CLAUDE.md files current ✅
- CHANGELOG updated ✅
- Everything committed together ✅
```

---

## Root Directory Cleanup Process

**CRITICAL**: Ensure ONLY 3 .md files in root.

### Automated Cleanup

**organize-docs MUST**:
1. List all .md files in project root
2. Identify files that are NOT:
   - README.md
   - CLAUDE.md
   - CHANGELOG.md
3. Categorize each file by topic:
   - Validation → `docs/validation/`
   - Testing → `docs/testing/`
   - Workflows → `docs/workflows/`
   - Guides → `docs/guides/`
   - Fixes → `docs/fixes/`
   - Reports → `docs/reports/`
4. Move files to appropriate directories
5. Update all references to moved files
6. Update indexes
7. Update CLAUDE.md files
8. Update docs/CHANGELOG.md with moves
9. Report completion

### Verification

After running organize-docs, verify:
```bash
# Should return ONLY 3 files
ls *.md

# Expected output:
# CHANGELOG.md
# CLAUDE.md
# README.md

# If more files present, organize-docs failed
```

---

## organize-docs Execution Checklist

When Claude runs `organize-docs` command:

- [ ] Scan all .md files in project
- [ ] Identify files in root (besides README, CLAUDE, CHANGELOG)
- [ ] Move misplaced files to docs/ subdirectories
- [ ] Check each docs subdirectory for CLAUDE.md
- [ ] **MANDATORY**: Verify complete documentation triad for each subdirectory with CLAUDE.md:
  - [ ] README.md exists (directory index)
  - [ ] CHANGELOG.md exists (change history)
  - [ ] CLAUDE.md exists (Claude guidance)
- [ ] Generate missing files in the triad if any are missing
- [ ] Update CLAUDE.md if files added/removed
- [ ] Update docs/README.md index
- [ ] Update subdirectory README.md indexes
- [ ] Update subdirectory CHANGELOG.md files with changes
- [ ] Update all cross-references in moved files
- [ ] Add entry to docs/CHANGELOG.md
- [ ] Update root CLAUDE.md references (if structure changed)
- [ ] Verify only 3 .md files remain in root
- [ ] Report completion with summary

---

## Expected organize-docs Output

```
📚 organize-docs - Documentation Organization
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: Scanning documentation structure...
  Found 7 files in root directory
  ✅ README.md (keep in root)
  ✅ CLAUDE.md (keep in root)
  ✅ CHANGELOG.md (keep in root)
  ⚠️  VALIDATION_QUICK_START.md (needs moving)
  ⚠️  START_HERE.md (needs moving)
  ... (other files)

Step 2: Moving misplaced files...
  ✅ Moved VALIDATION_QUICK_START.md → docs/guides/
  ✅ Moved START_HERE.md → docs/guides/
  ... (other moves)

Step 3: Checking CLAUDE.md files and documentation triads...
  ✅ docs/CLAUDE.md exists
  ✅ docs/validation/CLAUDE.md exists
  ⚠️  docs/deployment/CLAUDE.md missing
  Creating docs/deployment/CLAUDE.md...
  ✅ Created docs/deployment/CLAUDE.md
  
  🔍 Validating documentation triads...
  ✅ docs/technical/ - Complete triad (README.md, CHANGELOG.md, CLAUDE.md)
  ✅ docs/business/ - Complete triad (README.md, CHANGELOG.md, CLAUDE.md)
  ✅ docs/plans/ - Complete triad (README.md, CHANGELOG.md, CLAUDE.md)
  ⚠️  docs/validation/ - Missing CHANGELOG.md
  Creating docs/validation/CHANGELOG.md...
  ✅ Created docs/validation/CHANGELOG.md

Step 4: Updating indexes...
  ✅ Updated docs/README.md
  ✅ Updated docs/validation/README.md
  ✅ Updated docs/workflows/README.md

Step 5: Updating cross-references...
  ✅ Updated 15 links in validation docs
  ✅ Updated 8 links in testing docs

Step 6: Updating CHANGELOG...
  ✅ Added entry to docs/CHANGELOG.md
  Dated: 2025-10-20
  Moved: 7 files
  Created: 2 CLAUDE.md files
  Updated: 3 indexes

Step 7: Validation...
  ✅ Root directory: 3 files (compliant)
  ✅ All subdirectories have README.md
  ✅ All major subdirectories have CLAUDE.md
  ✅ All indexes up-to-date
  ✅ No broken internal links

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Documentation organization complete!

Root directory: ✅ Compliant (3 files)
CLAUDE.md files: ✅ All current
Indexes: ✅ All updated
CHANGELOG: ✅ Updated
Cross-references: ✅ Fixed

Next: Review docs/CHANGELOG.md for summary
```

---

## organize-docs Command Summary

**Purpose**: Keep documentation properly organized with CLAUDE.md files for awareness

**What it does**:
1. ✅ Moves misplaced .md files to correct locations
2. ✅ Generates/updates CLAUDE.md for subdirectories
3. ✅ Updates all indexes (README.md files)
4. ✅ Fixes cross-references
5. ✅ Updates docs/CHANGELOG.md
6. ✅ Ensures root has only 3 .md files
7. ✅ Validates organization complete

**When to run**:
- After adding new documentation
- When files accumulate in root
- Before committing documentation
- Weekly maintenance

**Integration**:
- Called by `git-commit-docs-command` automatically
- Can be run standalone with `/organize-docs`
- Ensures application always aware of documentation

---

**This enhancement ensures documentation stays organized and Claude always has context.**

---

## 🔄 Directory Cleanliness Standards (UPDATED)

### Project Root Directory
**ONLY 3 files allowed**:
1. `README.md` - Project overview
2. `CLAUDE.md` - Project guidelines
3. `CHANGELOG.md` - Project history

**All other `.md` files** → Move to `docs/` subdirectories

---

### docs/ Root Directory (MIRRORS PROJECT ROOT)
**ONLY 5 files allowed**:
1. `README.md` - Documentation index
2. `CLAUDE.md` - Documentation guidance
3. `CHANGELOG.md` - Documentation change history
4. `PRD.md` - Product Requirements Document
5. `PRD-TEMPLATE.md` - PRD template

**All other `.md` files in docs/** → Move to appropriate subdirectories:
- Validation → `docs/validation/`
- Workflows → `docs/workflows/`
- Testing → `docs/testing/`
- Guides → `docs/guides/`
- Reports → `docs/reports/`
- Fixes → `docs/fixes/`
- etc.

---

## Enhanced organize-docs Workflow

### Step 1: Clean Project Root
```bash
# Find all .md files in project root
# Keep ONLY: README.md, CLAUDE.md, CHANGELOG.md
# Move all others to appropriate docs/ subdirectories
```

### Step 2: Clean docs/ Root
```bash
# Find all .md files in docs/ root
# Keep ONLY: README.md, CLAUDE.md, CHANGELOG.md, PRD.md, PRD-TEMPLATE.md
# Move all others to appropriate docs/ subdirectories
```

### Step 3: Generate/Update CLAUDE.md Files
```bash
# For each major subdirectory in docs/:
# - Check if CLAUDE.md exists
# - Generate if missing
# - Update if files changed
```

### Step 4: Update Indexes
```bash
# Update docs/README.md
# Update subdirectory README.md files
```

### Step 5: Update CHANGELOG
```bash
# Add entry to docs/CHANGELOG.md
# Include all moves, additions, updates
```

### Verification
```bash
# Verify project root
ls *.md | wc -l
# Expected: 3

# Verify docs/ root
ls docs/*.md | wc -l
# Expected: 5 (README, CLAUDE, CHANGELOG, PRD, PRD-TEMPLATE)
```

---

## organize-docs Expected Output (Updated)

```
📚 organize-docs - Documentation Organization
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: Cleaning project root directory...
  Found 3 .md files in project root
  ✅ README.md (keep)
  ✅ CLAUDE.md (keep)
  ✅ CHANGELOG.md (keep)
  ✅ Project root: COMPLIANT (3 files)

Step 2: Cleaning docs/ root directory...
  Found 9 .md files in docs/ root
  ✅ README.md (keep)
  ✅ CLAUDE.md (keep)
  ✅ CHANGELOG.md (keep)
  ✅ PRD.md (keep)
  ✅ PRD-TEMPLATE.md (keep)
  ⚠️  VALIDATION_SYSTEM_GUIDE.md → docs/guides/
  ⚠️  ORGANIZATION_COMPLETE.md → docs/guides/
  ⚠️  README_VALIDATION.md → docs/guides/
  ⚠️  FINAL_VERIFICATION.md → docs/guides/
  ✅ Moved 4 files to subdirectories

Step 3: Checking CLAUDE.md files and documentation triads...
  ✅ docs/CLAUDE.md - current
  ✅ docs/validation/CLAUDE.md - current
  ✅ docs/testing/CLAUDE.md - current
  ✅ docs/workflows/CLAUDE.md - current
  
  🔍 Validating documentation triads...
  ✅ docs/technical/ - Complete triad (README.md, CHANGELOG.md, CLAUDE.md)
  ✅ docs/business/ - Complete triad (README.md, CHANGELOG.md, CLAUDE.md)
  ✅ docs/plans/ - Complete triad (README.md, CHANGELOG.md, CLAUDE.md)
  ✅ docs/reports/ - Complete triad (README.md, CHANGELOG.md, CLAUDE.md)
  ✅ docs/testing/ - Complete triad (README.md, CHANGELOG.md, CLAUDE.md)
  ✅ docs/fixes/ - Complete triad (README.md, CHANGELOG.md, CLAUDE.md)
  ✅ docs/integrations/ - Complete triad (README.md, CHANGELOG.md, CLAUDE.md)
  ✅ docs/guides/ - Complete triad (README.md, CHANGELOG.md, CLAUDE.md)
  ✅ docs/deployment/ - Complete triad (README.md, CHANGELOG.md, CLAUDE.md)

Step 4: Updating indexes...
  ✅ docs/README.md updated
  ✅ docs/validation/README.md updated
  ✅ docs/testing/README.md updated
  ✅ docs/workflows/README.md updated

Step 5: Updating CHANGELOG...
  ✅ Added entry to docs/CHANGELOG.md
  Date: 2025-10-20
  Moved: 4 files from docs/ root
  Updated: 4 indexes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Documentation organization complete!

Project root: ✅ 3 files (compliant)
docs/ root: ✅ 5 files (compliant)
CLAUDE.md files: ✅ All current
Indexes: ✅ All updated
CHANGELOG: ✅ Updated
```

---

**This ensures both root directories stay clean and organized.**

---

## User Journey Documentation Organization

### Overview
The `docs/user-journeys/` directory contains interactive documentation that guides users through tasks step-by-step.

### Directory Structure
```
docs/user-journeys/
├── README.md                    # Index and overview
├── profile/                     # End-user documentation
│   ├── getting-started.md       # Onboarding guide
│   ├── manage-bookings.md       # User task guide
│   └── ...
└── admin/                       # Admin user documentation
    ├── initial-setup.md         # Admin setup guide
    ├── staff-setup.md           # Staff configuration
    ├── content-management.md    # Content management
    └── ...
```

### Frontmatter Requirements
All user journey documents MUST include frontmatter:

```yaml
---
title: Getting Started Guide
type: interactive
category: Guides
description: Step-by-step guide for new users
journey_type: profile  # or admin
target_users: customer  # or admin
difficulty: beginner
estimated_time: "10-15 minutes"
prerequisites:
  - Account created
published: true
featured: true
order: 1
icon: Sparkles
color: primary
animation_component: GettingStartedAnimatedGuide
frontend_path: /getting-started
---
```

### Template Variables
Documents support template variables for project customization:
- `{{PROJECT_NAME}}` - Project display name
- `{{SUPPORT_EMAIL}}` - Support email address
- `{{SUPPORT_PHONE}}` - Support phone number

### organize-docs User Journey Actions

When running `organize-docs`, the command will:

1. **Validate Structure**
   - Check `docs/user-journeys/README.md` exists
   - Verify `profile/` and `admin/` directories exist
   - Ensure each has at least one document

2. **Validate Frontmatter**
   - All user journey files have required frontmatter fields
   - `journey_type` matches directory (profile/admin)
   - `frontend_path` is unique across all documents

3. **Validate Content**
   - Step markers are properly formatted (:::step ... :::)
   - Checklist items exist within steps
   - Action links are valid

4. **Generate Index**
   - Update `docs/user-journeys/README.md` with document listing
   - Group by journey type (profile/admin)
   - Include metadata summary

---

## Admin Panel Documentation Sync Integration

### Overview
After organizing documentation, changes can be synchronized to the admin panel database for web-based viewing and editing.

### Integration Workflow

```bash
# 1. Organize all documentation
organize-docs

# 2. Sync organized docs to admin panel
sync-docs-to-admin

# Or run both in sequence
organize-docs && sync-docs-to-admin
```

### Automatic Sync After Organization

The organize-docs command can optionally trigger sync:

```bash
# Organize and sync in one command
organize-docs --sync-admin

# Organize with dry-run sync preview
organize-docs --sync-admin --dry-run
```

### What Gets Synced

| Directory | Type | Admin Behavior |
|-----------|------|----------------|
| `docs/user-journeys/profile/` | INTERACTIVE | Editable, progress tracking |
| `docs/user-journeys/admin/` | INTERACTIVE | Editable, admin-only |
| `docs/technical/` | DEVELOPER | Read-only |
| `docs/guides/` | BUSINESS | Editable |

### Sync Status Report

After organizing, the command shows sync status:

```
📊 Admin Panel Sync Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User Journey Documents:
  ✅ 3 profile docs ready for sync
  ✅ 4 admin docs ready for sync

To sync to admin panel:
  Run: sync-docs-to-admin

Or sync automatically:
  Run: organize-docs --sync-admin
```

### Bidirectional Sync

After admin panel edits, sync back to files:

```bash
# Export admin changes to files
sync-docs-to-admin --reverse

# Then re-organize
organize-docs
```

---

## Related Commands

- **`sync-docs-to-admin`** - Bidirectional documentation sync with admin panel
- **`generate-docs`** - Generate user-facing documentation from definitions
- **`git-commit-docs-command`** - Commit documentation changes

---

## See Also

- `.claude/commands/sync-docs-to-admin.md` - Admin panel sync documentation
- `.claude/commands/generate-docs.md` - Documentation generation
- `.claude/agents/documentation-sync-manager.md` - Sync agent
- `docs/user-journeys/README.md` - User journey documentation index
