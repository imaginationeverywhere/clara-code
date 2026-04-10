# generate-docs - Automatic Documentation Generator

## Overview
Automatically generates user-facing documentation from command and agent definitions, updates README.md with auto-linked table of contents, and maintains CHANGELOG.md files throughout the project.

## Usage
```bash
generate-docs [OPTIONS]
```

### Options
- `--commands-only` - Generate only command documentation
- `--agents-only` - Generate only agent documentation
- `--update-readme` - Update README.md with auto-linked TOC (default: true)
- `--update-changelog` - Update CHANGELOG.md files (default: true)
- `--dry-run` - Show what would be generated without creating files
- `--force` - Overwrite existing documentation (default: ask)
- `--specific [name]` - Generate docs for specific command/agent only

### Examples
```bash
# Generate all documentation
generate-docs

# Generate only command documentation
generate-docs --commands-only

# Generate docs for specific command
generate-docs --specific restore-functionality

# Dry run to preview changes
generate-docs --dry-run

# Force regeneration of all docs
generate-docs --force --update-readme --update-changelog
```

## What This Command Does

### 1. Scan for Definitions
```bash
# Scan .claude/ directories
.claude/commands/*.md    → List all command definitions
.claude/agents/*.md      → List all agent definitions

# Exclude CHANGELOG.md files from processing
Skip: .claude/commands/CHANGELOG.md
Skip: .claude/agents/CHANGELOG.md
```

### 2. Generate User Documentation
For each command/agent definition:

**Commands**: `.claude/commands/[name].md` → `docs/commands/[name].md`
**Agents**: `.claude/agents/[name].md` → `docs/agents/[name].md`

#### Documentation Enhancement
User-facing docs include additional sections:
- **Quick Start** - Minimal example to get started
- **Common Use Cases** - Real-world scenarios
- **Troubleshooting** - Common issues and solutions
- **Related Commands/Agents** - Links to related documentation
- **Examples** - Extended examples with explanations
- **Best Practices** - Tips for effective usage

#### Format Conversion
```markdown
# Source: .claude/commands/restore-functionality.md
## Overview
[Technical specification for Claude Code]

## Usage
[Command syntax]

## Command Workflow
[Detailed technical steps]

# Generated: docs/commands/restore-functionality.md
# restore-functionality

**Intelligent recovery of accidentally overwritten functionality**

## Quick Start
[Minimal example to get started immediately]

## What It Does
[User-friendly explanation]

## How to Use
[Step-by-step guide]

## Common Use Cases
[Real-world scenarios with examples]

## How It Works
[Technical workflow from source]

## Troubleshooting
[Common issues and solutions]

## Related Commands
- [git-commit-docs-command](git-commit-docs-command.md)
- [create-plan-todo](create-plan-todo.md)

## See Also
- [Technical specification](../../.claude/commands/restore-functionality.md)
- [Main README](../../README.md)
```

### 3. Auto-Link from README.md
Update README.md with dynamically generated tables:

#### Command Library Section
```markdown
## 🤖 Command Library (49 Commands)

### Task Management
- [create-plan-todo](docs/commands/create-plan-todo.md) - Generate structured task plans from PRD
- [process-todos](docs/commands/process-todos.md) - Work through task hierarchy
- [update-todos](docs/commands/update-todos.md) - Update completion status

### Functionality Recovery
- [restore-functionality](docs/commands/restore-functionality.md) - Intelligent code recovery
  - CHANGELOG.md analysis (intentional vs accidental removal)
  - 4 recovery strategies
  - Auto-backup and validation

[... auto-generated from .claude/commands/ ...]
```

#### Agent Library Section
```markdown
## 🤖 Agent Library (37 Agents)

### Frontend Enforcement
- [typescript-frontend-enforcer](docs/agents/typescript-frontend-enforcer.md) - TypeScript best practices
- [graphql-apollo-frontend](docs/agents/graphql-apollo-frontend.md) - Apollo Client patterns
- [redux-persist-state-manager](docs/agents/redux-persist-state-manager.md) - State management

[... auto-generated from .claude/agents/ ...]
```

### 4. Update CHANGELOG.md Files
Automatically update appropriate CHANGELOG.md files:

```bash
# If new command created
→ Update .claude/commands/CHANGELOG.md
→ Update main CHANGELOG.md

# If new agent created
→ Update .claude/agents/CHANGELOG.md
→ Update main CHANGELOG.md

# If command/agent modified
→ Update appropriate CHANGELOG.md under [Unreleased] → Changed
```

#### CHANGELOG.md Entry Format
```markdown
## [Unreleased]

### Added
- **[command-name]**: Brief description
  - Key feature 1
  - Key feature 2
  - Documentation: docs/commands/[command-name].md

### Changed
- **[command-name]**: Updated functionality
  - What changed
  - Why it changed
  - Migration notes if breaking
```

### 5. Generate Documentation Index
Create `docs/INDEX.md` with complete listing:

```markdown
# Documentation Index

**Last Updated**: 2025-10-03 [auto-generated]
**Total Commands**: 49
**Total Agents**: 37

## Commands by Category

### Task Management (3)
- [create-plan-todo](commands/create-plan-todo.md)
- [process-todos](commands/process-todos.md)
- [update-todos](commands/update-todos.md)

### Functionality Recovery (1)
- [restore-functionality](commands/restore-functionality.md)

[... categorized listing ...]

## Agents by Category

### Frontend Enforcement (3)
- [typescript-frontend-enforcer](agents/typescript-frontend-enforcer.md)
- [graphql-apollo-frontend](agents/graphql-apollo-frontend.md)
- [redux-persist-state-manager](agents/redux-persist-state-manager.md)

[... categorized listing ...]

## Quick Reference

### Most Used Commands
1. create-plan-todo
2. process-todos
3. restore-functionality
4. git-commit-docs-command
5. update-todos

### Most Used Agents
1. app-troubleshooter
2. typescript-frontend-enforcer
3. graphql-backend-enforcer
4. multi-agent-orchestrator
5. clerk-auth-enforcer
```

## Command Workflow

### Phase 1: Discovery
```bash
1. Scan .claude/commands/ for command definitions
2. Scan .claude/agents/ for agent definitions
3. Exclude CHANGELOG.md files
4. Build list of items to process
5. Check for existing docs in docs/commands/ and docs/agents/
```

### Phase 2: Analysis
```bash
For each command/agent:
1. Parse definition file (markdown parsing)
2. Extract:
   - Name (from filename)
   - Overview/Description (from ## Overview section)
   - Usage (from ## Usage section)
   - Workflow (from ## Workflow section)
   - Examples (from ## Examples section)
3. Categorize based on content:
   - Task Management
   - Git & Documentation
   - Recovery
   - Integration (MCP, JIRA)
   - Infrastructure (Docker, AWS)
   - etc.
4. Identify related commands/agents (based on content analysis)
```

### Phase 3: Generation
```bash
For each item:
1. Create user-friendly documentation
2. Add Quick Start section
3. Add Common Use Cases
4. Add Troubleshooting section
5. Add Related items links
6. Add Best Practices
7. Write to docs/commands/[name].md or docs/agents/[name].md
```

### Phase 4: README.md Update
```bash
1. Parse current README.md
2. Find ## Command Library section
3. Replace with auto-generated categorized list
4. Find ## Agent Library section
5. Replace with auto-generated categorized list
6. Maintain other README.md sections unchanged
7. Write updated README.md
```

### Phase 5: CHANGELOG.md Update
```bash
For new items:
1. Add entry to .claude/commands/CHANGELOG.md or .claude/agents/CHANGELOG.md
2. Add entry to main CHANGELOG.md
3. Use [Unreleased] section
4. Categorize under Added

For modified items:
1. Add entry under [Unreleased] → Changed
2. Document what changed
3. Include migration notes if breaking
```

### Phase 6: Index Generation
```bash
1. Generate docs/INDEX.md with categorized listing
2. Include statistics (total commands, total agents)
3. Group by category
4. Add quick reference section
5. Update last modified timestamp
```

## Categorization Logic

### Commands
Auto-categorize based on filename patterns and content:
- `*-plan-todo*`, `*process-todo*` → Task Management
- `*-git-*`, `*-docs-*` → Git & Documentation
- `*-restore-*`, `*-recovery-*` → Functionality Recovery
- `*-mcp-*` → MCP Integration
- `*-jira-*` → JIRA Integration
- `*-docker-*` → Docker Management
- `*-deploy-*`, `*-amplify-*` → Deployment
- `*-session-*`, `*-init-*` → Session Management

### Agents
Auto-categorize based on filename patterns and content:
- `*-frontend-*`, `*-react-*`, `*-next-*` → Frontend Enforcement
- `*-backend-*`, `*-express-*`, `*-graphql-backend-*` → Backend Enforcement
- `*-auth-*`, `*-stripe-*`, `*-analytics-*`, `*-aws-*` → Service Integration
- `*-troubleshooter*`, `*-bug-*`, `*-test-*` → Quality & Debugging
- `*-orchestrator*`, `*-bridge*` → Orchestration
- `*-docker-*`, `*-port-*` → Infrastructure

## Example Output

```
🔍 SCANNING: Discovering commands and agents...

📊 DISCOVERY COMPLETE
- Commands found: 49
- Agents found: 37
- Existing command docs: 3
- Existing agent docs: 0

📝 GENERATING DOCUMENTATION

Commands:
✓ restore-functionality.md (new)
✓ create-plan-todo.md (new)
✓ git-commit-docs-command.md (updated)
✓ process-todos.md (new)
... (45 more)

Agents:
✓ app-troubleshooter.md (new)
✓ typescript-frontend-enforcer.md (new)
✓ graphql-backend-enforcer.md (new)
... (34 more)

📋 UPDATING README.md
- Updated Command Library section (49 commands)
- Updated Agent Library section (37 agents)
- Maintained other sections

📜 UPDATING CHANGELOG.md
- Added 46 new commands to .claude/commands/CHANGELOG.md
- Added 37 new agents to .claude/agents/CHANGELOG.md
- Updated main CHANGELOG.md

📖 GENERATED INDEX
- Created docs/INDEX.md with categorized listing

✅ DOCUMENTATION GENERATION COMPLETE

Next steps:
- Review generated docs: ls docs/commands/ docs/agents/
- Check README.md updates: cat README.md
- Verify CHANGELOG.md entries
- Commit with: /git-commit-docs-command
```

## Template Structure

### User Documentation Template
Each generated doc follows this structure:

```markdown
# [Command/Agent Name]

**[One-line description]**

## Quick Start

[Minimal example to get started immediately]

## What It Does

[User-friendly explanation of purpose and benefits]

## How to Use

### Basic Usage
[Basic example with explanation]

### Advanced Usage
[Advanced examples]

## Common Use Cases

### Use Case 1: [Scenario]
[Example with explanation]

### Use Case 2: [Scenario]
[Example with explanation]

## How It Works

[Technical workflow - copied from source definition]

## Parameters/Options

[Detailed parameter documentation]

## Examples

### Example 1: [Title]
[Code example with detailed explanation]

### Example 2: [Title]
[Code example with detailed explanation]

## Troubleshooting

### Issue: [Common problem]
**Solution**: [How to fix]

### Issue: [Another problem]
**Solution**: [How to fix]

## Best Practices

- [Best practice 1]
- [Best practice 2]
- [Best practice 3]

## Related

### Commands
- [related-command-1](command-1.md) - Description
- [related-command-2](command-2.md) - Description

### Agents
- [related-agent-1](../agents/agent-1.md) - Description

## See Also

- [Technical Specification](../../.claude/commands/[name].md)
- [Main README](../../README.md)
- [CHANGELOG](../../.claude/commands/CHANGELOG.md)
```

## Relationship Detection

### Automatic Linking
Commands/agents are automatically linked based on:

1. **Explicit References**: Content mentions other commands/agents
2. **Category Overlap**: Similar categories or tags
3. **Workflow Sequences**: Commands that typically run together
4. **Technology Stack**: Agents for same technologies

### Example Relationships
```
restore-functionality →
  Related Commands:
    - git-commit-docs-command (commit restored code)
    - create-plan-todo (plan recovery workflow)
  Related Agents:
    - app-troubleshooter (analyze what was lost)
    - graphql-bug-fixer (if GraphQL code lost)
```

## Configuration

### Customizing Categories
Edit category mappings in this command or create `.claude/doc-config.json`:

```json
{
  "categories": {
    "commands": {
      "Task Management": ["*-todo*", "*-plan*"],
      "Recovery": ["*-restore*", "*-recover*"],
      "Git": ["*-git-*", "*-commit-*"]
    },
    "agents": {
      "Frontend": ["*-frontend-*", "*-react-*"],
      "Backend": ["*-backend-*", "*-express-*"]
    }
  },
  "relationships": {
    "auto-detect": true,
    "manual-links": {
      "restore-functionality": ["git-commit-docs-command", "app-troubleshooter"]
    }
  }
}
```

## Integration with git-commit-docs-command

This command integrates perfectly with `/git-commit-docs-command`:

```bash
# 1. Generate all documentation
generate-docs

# 2. Review changes
git diff docs/ README.md CHANGELOG.md

# 3. Commit with automatic documentation updates
git-commit-docs-command

# This will:
# - Stage all changes (docs/, README.md, CHANGELOG.md)
# - Generate comprehensive commit message
# - Update technical documentation
# - Push to remote
```

## Benefits

1. **Consistency** - All documentation follows same structure
2. **Completeness** - Every command/agent has user docs
3. **Discoverability** - README.md auto-linked table of contents
4. **Maintainability** - Single source of truth (.claude/ definitions)
5. **Automation** - Run once, generate everything
6. **CHANGELOG Integration** - Automatic change tracking
7. **Relationship Awareness** - Auto-discovered links between items

## User Journey Documentation Generation

### Overview
This command also generates user journey documentation from templates in `docs/user-journeys/`.

### User Journey Types
- **Profile Journeys** (`docs/user-journeys/profile/`) - Documentation for end users with profiles
- **Admin Journeys** (`docs/user-journeys/admin/`) - Documentation for admin panel users

### User Journey Template Variables
Templates support these placeholder variables that get replaced with project-specific values:
- `{{PROJECT_NAME}}` - Project display name
- `{{SUPPORT_EMAIL}}` - Support email address
- `{{SUPPORT_PHONE}}` - Support phone number

### Interactive Documentation Components
User journey documents support special markdown syntax for interactive guides:

```markdown
:::step number=1 title="Step Title" icon="IconName"
Step content with:
- [ ] Checklist items
- [ ] That users can complete

**Action:** [Link Text](/path)
:::
```

### User Journey Workflow

```bash
1. Scan docs/user-journeys/profile/ and docs/user-journeys/admin/
2. Process template variables ({{PROJECT_NAME}}, etc.)
3. Validate frontmatter metadata (type, category, journey_type, etc.)
4. Generate navigation index for frontend consumption
5. Optionally sync to admin panel database via sync-docs-to-admin
```

### Integration with Admin Panel

User journey documentation can be synced to the admin panel database for:
- Interactive progress tracking
- User completion analytics
- Admin editing and management
- Version control and history

**Sync Command:**
```bash
# After generating user journey docs, sync to admin panel
sync-docs-to-admin --type=INTERACTIVE
```

**See:** `.claude/commands/sync-docs-to-admin.md` for complete sync documentation.

---

## Admin Panel Documentation Sync

### Overview
Generated documentation can be synchronized to the admin panel database for viewing and editing in the web interface.

### Sync Options
```bash
# Sync all generated documentation to admin panel
generate-docs && sync-docs-to-admin

# Generate and sync only user journey documentation
generate-docs --user-journeys && sync-docs-to-admin --type=INTERACTIVE

# Generate docs and sync with dry run
generate-docs && sync-docs-to-admin --dry-run
```

### Documentation Types for Admin Panel
| Type | Source | Admin Panel Behavior |
|------|--------|---------------------|
| BUSINESS | `docs/user-journeys/` | Editable in admin |
| DEVELOPER | `docs/technical/` | Read-only in admin |
| INTERACTIVE | `docs/user-journeys/` | Interactive guides |

### Bidirectional Sync
After generating docs, run `sync-docs-to-admin` to:
1. Create new documents in database
2. Update existing documents with file changes
3. Track version history
4. Enable admin panel editing

**Reverse Sync:** Use `sync-docs-to-admin --reverse` to export admin panel edits back to files.

---

## Future Enhancements

1. **Search Index** - Generate search index for docs
2. **Version Control** - Track documentation versions
3. **Examples Repository** - Pull real-world examples from usage
4. **Interactive Docs** - Generate interactive tutorials
5. **API Documentation** - Generate API docs for code-based commands
6. **Metrics** - Track most viewed/used docs to prioritize updates
7. **Admin Panel Integration** - Automatic sync after generation

## Error Handling

```bash
# Missing source file
⚠️  Warning: .claude/commands/missing-command.md not found
→ Skipping missing-command

# Invalid markdown
⚠️  Warning: Could not parse .claude/agents/broken-agent.md
→ Skipping broken-agent (manual review needed)

# README.md not found
❌ Error: README.md not found in project root
→ Cannot update auto-linked TOC

# Permission issues
❌ Error: Cannot write to docs/commands/
→ Check file permissions
```

## Best Practices

1. **Run regularly** - After adding/modifying commands or agents
2. **Review generated docs** - Auto-generated docs may need manual touch-ups
3. **Commit together** - Use `/git-commit-docs-command` for atomic commits
4. **Keep source updated** - Maintain .claude/ definitions as source of truth
5. **Test examples** - Ensure examples in generated docs actually work

## Contributing

When adding new documentation features:
1. Update template structure in this command
2. Test with various command/agent types
3. Update this command's documentation
4. Add entry to .claude/commands/CHANGELOG.md
5. Run `/generate-docs` to regenerate all docs
6. Commit with `/git-commit-docs-command`

---

**This command is the cornerstone of the documentation system.** It ensures all commands and agents have comprehensive, user-friendly documentation that's automatically maintained and linked throughout the project.
