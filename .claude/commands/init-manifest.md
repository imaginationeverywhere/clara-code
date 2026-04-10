# init-manifest

**Purpose**: Initialize boilerplate manifest for existing projects to enable intelligent update tracking

**Context**: This command creates `.boilerplate-manifest.json` for existing Claude Code boilerplate projects that don't have update tracking enabled. It scans the project structure, identifies file origins, and sets up the foundation for intelligent updates.

## Command Usage

**Claude Code Commands**:
```bash
init-manifest                         # Initialize manifest in current project
init-manifest --force                 # Overwrite existing manifest
init-manifest --verbose               # Show detailed scanning process
```

**npm Scripts**:
```bash
npm run init-manifest                 # Initialize manifest tracking
npm run init-manifest -- --force      # Force overwrite existing manifest
npm run init-manifest -- --verbose    # Detailed initialization process
```

## Core Functionality

### 1. **Project Structure Analysis**
- Detect project type (monorepo, frontend-only, backend-only, full-monorepo)
- Identify workspace configuration (pnpm workspaces, package.json structure)
- Scan for boilerplate indicators (.claude/commands, todo/, docs/ directories)
- Extract project information from PRD.md and package.json

### 2. **File Origin Detection**
The system categorizes all project files by origin:

**Boilerplate Files**:
- `.claude/commands/**/*.md` - Claude Code commands
- `scripts/**/*.{js,sh}` - Utility scripts
- `docs/TEMPLATE_VARIABLES_GUIDE.md` - Template documentation
- `docs/technical/**/*.md` - Technical guides
- `docs/detailed/**/*.md` - Modular documentation
- `infrastructure/README.md` - Infrastructure docs

**Project-Specific Files**:
- `docs/PRD.md` - Project Requirements Document
- `*.env*` - Environment configurations
- `*config.json` - Configuration files with credentials
- `todo/jira-config/**/*` - JIRA integration settings

**Customized Files** (modified from boilerplate):
- `CLAUDE.md` - Main project documentation
- `README.md` - Project readme
- `package.json` - Workspace configuration
- Custom modifications to boilerplate files

**Unknown Files**:
- Files not matching any category patterns
- New files created outside boilerplate structure

### 3. **Customization Detection**
- **Template Variables**: Detect filled template placeholders
- **Custom Sections**: Identify project-specific content in documentation
- **Configuration Changes**: Track modifications to standard boilerplate configs
- **File Hashes**: Generate SHA256 checksums for integrity tracking

### 4. **Manifest Generation**

```json
{
  "$schema": "https://raw.githubusercontent.com/imaginationeverywhere/quik-nation-ai-boilerplate/main/schemas/manifest.schema.json",
  "version": "1.0.0",
  "projectType": "monorepo",
  "projectName": "your-project",
  "projectKey": "PROJ",
  "boilerplateSource": {
    "type": "github-ssh",
    "remote": "git@github.com:imaginationeverywhere/quik-nation-ai-boilerplate.git",
    "branch": "main"
  },
  "customizations": {
    "files": {
      "CLAUDE.md": {
        "type": "customized",
        "description": "Project-specific CLAUDE configuration",
        "mergeStrategy": "smart-merge"
      }
    }
  },
  "files": {
    "CLAUDE.md": {
      "category": "merge",
      "origin": "customized",
      "hash": "abc123def456",
      "lastModified": "2025-01-10T12:00:00Z"
    }
  }
}
```

## Interactive Initialization Process

### 1. **Project Detection**
```
🔧 Initializing Boilerplate Manifest
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Project path: /Users/amenra/Projects/your-project
📋 Detected project: your-project (monorepo)
✅ Project structure validated
```

### 2. **File Scanning**
```
📁 Scanning project structure...
   Analyzed 247 files
   Boilerplate files: 89
   Project-specific files: 34
   Merge required files: 8
   Conditional update files: 12
```

### 3. **Customization Analysis**
```
🔧 Detecting customizations...
   Found custom sections in README.md
   Detected template variables in PRD.md
   Identified JIRA configuration files
   Protected environment files located
```

### 4. **Manifest Creation**
```
📋 Created new project manifest
📄 Saved to: .boilerplate-manifest.json
🎯 Project ready for boilerplate updates

Next steps:
  1. Review the generated manifest
  2. Run: npm run update-boilerplate:check
  3. Run: npm run update-boilerplate
```

## Implementation Details

### Project Type Detection
```javascript
async function detectProjectType() {
  const hasMonorepoConfig = fs.existsSync('pnpm-workspace.yaml');
  const hasFrontend = fs.existsSync('frontend/');
  const hasBackend = fs.existsSync('backend/');
  const hasMobile = fs.existsSync('mobile/');

  if (hasMonorepoConfig && hasFrontend && hasBackend && hasMobile) {
    return 'full-monorepo';
  } else if (hasMonorepoConfig && hasFrontend && hasBackend) {
    return 'web-monorepo';
  } else if (hasFrontend) {
    return 'frontend-only';
  } else if (hasBackend) {
    return 'backend-only';
  }
  
  return 'unknown';
}
```

### File Categorization Algorithm
```javascript
function categorizeFile(filePath) {
  // Check against file category patterns
  const categories = {
    'boilerplate': ['.claude/commands/**/*.md', 'scripts/**/*.js'],
    'project': ['docs/PRD.md', '*.env*', '*config.json'],
    'merge': ['CLAUDE.md', 'README.md', 'package.json'],
    'conditional': ['infrastructure/**/*', 'docker-compose.yml']
  };

  for (const [category, patterns] of Object.entries(categories)) {
    if (matchesPatterns(filePath, patterns)) {
      return category;
    }
  }
  
  return 'unknown';
}
```

### Project Information Extraction
```javascript
async function extractProjectInfo() {
  // Extract from package.json
  const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
  const projectName = packageJson.name;
  
  // Extract from PRD.md if exists
  if (fs.existsSync('docs/PRD.md')) {
    const prdContent = await fs.readFile('docs/PRD.md', 'utf8');
    const projectKey = extractProjectKey(prdContent);
    const mockupTemplate = extractMockupTemplate(prdContent);
    
    return { projectName, projectKey, mockupTemplate };
  }
  
  return { projectName, projectKey: 'PROJ', mockupTemplate: 'retail' };
}
```

## Error Handling

### Common Scenarios
1. **Not a Boilerplate Project**: Check for required directories and guide user
2. **Permission Issues**: Clear error messages with resolution steps
3. **Corrupted Files**: Skip problematic files and continue initialization
4. **Existing Manifest**: Prompt for overwrite or merge options

### Validation Checks
- Verify project has basic boilerplate structure
- Check for write permissions in project directory
- Validate package.json format and workspace configuration
- Ensure required directories exist

## Integration with Update System

### Post-Initialization
Once manifest is created, projects can:
- Check for boilerplate updates: `npm run update-boilerplate:check`
- Apply safe updates: `npm run update-boilerplate:commands`
- Interactive updates: `npm run update-boilerplate`
- Manage multi-project workflows

### Manifest Maintenance
- Automatic updates during boilerplate updates
- File tracking for all subsequent changes
- Customization preservation across updates
- Version history and audit trail

## Usage Examples

### Standard Initialization
```bash
# Initialize existing project
cd /path/to/your-project
init-manifest

# Review generated manifest
cat .boilerplate-manifest.json

# Check for available updates
npm run update-boilerplate:check
```

### Force Initialization
```bash
# Overwrite existing manifest
init-manifest --force

# Initialize with detailed output
init-manifest --verbose --force
```

### Team Onboarding
```bash
# Clone existing boilerplate project
git clone your-project-repo
cd your-project

# Initialize if manifest missing
npm run init-manifest

# Get latest updates
npm run update-boilerplate:commands
```

## Troubleshooting

### Common Issues

**Issue**: "Not in a valid project directory (no package.json found)"  
**Solution**: Ensure you're in a directory with package.json

**Issue**: "Missing boilerplate directories: .claude/commands, todo, docs"  
**Solution**: This may not be a boilerplate-based project. Copy boilerplate structure first.

**Issue**: "Permission denied writing manifest file"  
**Solution**: Check directory write permissions or run with appropriate privileges

**Issue**: "Cannot determine project type"  
**Solution**: Ensure project has proper workspace configuration or package.json

### Advanced Configuration

#### Custom File Patterns
Create `.boilerplate-config.json` to customize categorization:

```json
{
  "fileCategories": {
    "customIgnorePatterns": [
      "src/custom/**/*",
      "config/local/**/*"
    ],
    "additionalSafeFiles": [
      "docs/custom/**/*.md"
    ],
    "additionalProtectedFiles": [
      "config/production.json"
    ]
  }
}
```

This command provides the foundation for intelligent boilerplate updates by creating comprehensive tracking and categorization of project files while preserving customizations and project-specific configurations.