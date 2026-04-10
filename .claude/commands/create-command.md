# Create Command Automation

**Version:** 1.0.0
**Agent:** general-purpose
**Output:** `.claude/commands/{command-name}.md` + `.cursor/commands/{command-name}.md`

## Purpose

Automates the creation of new custom commands for both Claude Code and Cursor AI. Ensures consistent structure, proper documentation, and automatic synchronization across both AI development environments.

## Usage

```bash
# Interactive mode (recommended)
create-command

# Quick mode with inline parameters
create-command --name=deploy-staging --description="Deploy to staging environment"

# With full specification
create-command --name=security-audit \
  --description="Run comprehensive security audit" \
  --category=security \
  --agent=typescript-bug-fixer

# From template
create-command --template=agent-command --name=optimize-db
```

## Interactive Prompts

When run without parameters, the command will ask:

1. **Command Name** (required)
   - Kebab-case format (e.g., `review-code`, `deploy-staging`)
   - No spaces or special characters
   - Must be unique

2. **Command Description** (required)
   - One-line summary of what the command does
   - Used in command listings and help text

3. **Command Category** (optional)
   - Options: development, deployment, code-quality, testing, documentation, integration, infrastructure
   - Default: `development`

4. **Associated Agent** (optional)
   - Which specialized agent should this command use?
   - Options: code-quality-reviewer, nextjs-architecture-guide, express-backend-architect, etc.
   - Default: `general-purpose`

5. **Output Type** (optional)
   - `none` - No file output
   - `markdown_document` - Generates .md file
   - `json_data` - Generates .json file
   - `code_file` - Generates code file
   - Default: `none`

6. **Output Location** (optional)
   - Where should output files be saved?
   - Examples: `docs/review/`, `docs/plans/`, `infrastructure/`
   - Default: `./`

7. **UltraThink Integration** (optional)
   - Should this command update the UltraThink knowledge graph?
   - Default: `false`

## Command Implementation

When this command is invoked, Claude Code should:

### Phase 1: Gather Parameters

If interactive mode:
```typescript
const answers = await askQuestions([
  {
    question: "What is the command name? (kebab-case, e.g., 'deploy-staging')",
    header: "Command Name",
    options: [] // Free text input
  },
  {
    question: "Provide a one-line description of what this command does",
    header: "Description",
    options: [] // Free text input
  },
  {
    question: "Which category does this command belong to?",
    header: "Category",
    options: [
      { label: "Development", description: "Code development and implementation" },
      { label: "Deployment", description: "Deployment and operations" },
      { label: "Code Quality", description: "Testing, review, and quality assurance" },
      { label: "Documentation", description: "Documentation generation and management" },
      { label: "Integration", description: "Third-party service integration" },
      { label: "Infrastructure", description: "Infrastructure and DevOps" }
    ]
  },
  {
    question: "Which specialized agent should this command use?",
    header: "Agent",
    options: [
      { label: "general-purpose", description: "General-purpose agent for multi-step tasks" },
      { label: "code-quality-reviewer", description: "Code review and quality analysis" },
      { label: "nextjs-architecture-guide", description: "Next.js frontend development" },
      { label: "express-backend-architect", description: "Express.js backend development" },
      { label: "testing-automation-agent", description: "Automated testing" },
      { label: "aws-cloud-services-orchestrator", description: "AWS deployment and operations" }
    ]
  }
]);
```

### Phase 2: Generate Command Template

Create markdown file with this structure:

```markdown
# {Command Name}

**Version:** 1.0.0
**Agent:** {agent_name}
**Output:** {output_location}/{output_type}

## Purpose

{Detailed description of what this command does and when to use it}

## Usage

\`\`\`bash
# Basic usage
{command-name}

# With parameters
{command-name} --param=value

# Advanced usage
{command-name} --param1=value1 --param2=value2
\`\`\`

## What This Command Does

1. **Step 1** - {Description}
2. **Step 2** - {Description}
3. **Step 3** - {Description}

## Command Implementation

When this command is invoked, Claude Code should:

### Phase 1: {Phase Name}

{Implementation details}

### Phase 2: {Phase Name}

{Implementation details}

## Examples

### Example 1: {Use Case}
\`\`\`bash
{command-name} --example=1
\`\`\`

**Expected Output:**
\`\`\`
{Sample output}
\`\`\`

## Configuration

Add to \`.claude/commands/config.json\`:

\`\`\`json
{
  "{command-name}": {
    "enabled": true,
    "default_param": "value"
  }
}
\`\`\`

## Integration with UltraThink

{If enabled, describe UltraThink integration}

## Related Commands

- \`/related-command-1\` - {Description}
- \`/related-command-2\` - {Description}

## Notes for Claude Code

{Important notes for Claude when executing this command}

## Command Metadata

\`\`\`yaml
name: {command-name}
category: {category}
agent: {agent_name}
output_type: {output_type}
output_location: {output_location}
version: 1.0.0
author: {user_or_team}
\`\`\`
```

### Phase 3: Write to Both Directories

1. **Ensure directories exist:**
   ```bash
   mkdir -p .claude/commands
   mkdir -p .cursor/commands
   ```

2. **Write command file to .claude:**
   ```bash
   cat > .claude/commands/{command-name}.md << 'EOF'
   {generated_template}
   EOF
   ```

3. **Write command file to .cursor:**
   ```bash
   cat > .cursor/commands/{command-name}.md << 'EOF'
   {generated_template}
   EOF
   ```

### Phase 4: Update Command Registry

Update `.claude/commands/README.md`:

```markdown
## Available Commands

...existing commands...

### {Category}

- **`{command-name}`** - {description}
  - Agent: {agent_name}
  - Output: {output_location}
  - Version: 1.0.0
```

Update `.cursor/commands/README.md` similarly.

### Phase 5: UltraThink Integration (if enabled)

```bash
# Add command to UltraThink knowledge graph
ultrathink add-command .claude/commands/{command-name}.md

# Generate command relationship graph
ultrathink analyze-commands

# Update command documentation index
ultrathink index-docs --type=commands
```

### Phase 6: Git Integration

```bash
# Stage new command files
git add .claude/commands/{command-name}.md
git add .cursor/commands/{command-name}.md
git add .claude/commands/README.md
git add .cursor/commands/README.md

# Show what was created
git status
```

### Phase 7: Display Success Message

```
✅ Command Created Successfully

📝 Command Details:
   Name: {command-name}
   Description: {description}
   Category: {category}
   Agent: {agent_name}

📂 Files Created:
   ✓ .claude/commands/{command-name}.md
   ✓ .cursor/commands/{command-name}.md
   ✓ Updated command registries

🚀 Next Steps:
   1. Review and customize the command template
   2. Test the command: {command-name}
   3. Commit changes: git commit -m "feat: add {command-name} command"

💡 Usage:
   Run the command in Claude Code or Cursor:
   {command-name}
```

## Command Templates

### Template: agent-command

For commands that use specialized agents:

```markdown
# {Command Name}

**Agent:** {agent_name}

## Command Implementation

When this command is invoked, use the **Task tool** with \`subagent_type='{agent_name}'\`:

\`\`\`markdown
Please {task_description}

**Context:**
- Project: {project_name}
- Workspace: {workspace}

**Requirements:**
{requirements_list}

**Output:**
{expected_output}
\`\`\`
```

### Template: deployment-command

For deployment-related commands:

```markdown
# {Command Name}

**Category:** deployment

## Pre-Deployment Checks

1. **Environment validation**
2. **Build verification**
3. **Test execution**

## Deployment Steps

1. **Build artifacts**
2. **Deploy to target**
3. **Health check validation**

## Rollback Procedure

{Rollback steps}
```

### Template: documentation-command

For documentation generation commands:

```markdown
# {Command Name}

**Output:** {docs_location}

## Documentation Structure

\`\`\`markdown
# {Document Title}

## {Section 1}
{content}

## {Section 2}
{content}
\`\`\`

## Auto-Update Integration

This document auto-updates when:
- {trigger_1}
- {trigger_2}
```

## Advanced Features

### Multi-File Commands

Create commands that generate multiple files:

```bash
create-command --name=init-feature \
  --template=feature-scaffold \
  --outputs="frontend/src/components,backend/src/routes,docs/features"
```

### Command Chains

Create commands that invoke other commands:

```bash
create-command --name=full-deploy \
  --chain="review-code,test-automation,deploy-staging,deploy-production"
```

### Workspace-Specific Commands

```bash
create-command --name=frontend-build \
  --workspace=frontend \
  --cwd="frontend/"
```

## Configuration

Add to `.claude/commands/config.json`:

```json
{
  "create-command": {
    "enabled": true,
    "default_category": "development",
    "default_agent": "general-purpose",
    "auto_ultrathink": true,
    "auto_git_add": true,
    "templates_dir": ".claude/commands/templates/",
    "validation": {
      "require_description": true,
      "min_description_length": 20,
      "allowed_categories": [
        "development",
        "deployment",
        "code-quality",
        "testing",
        "documentation",
        "integration",
        "infrastructure"
      ]
    }
  }
}
```

## Validation Rules

Before creating command, validate:

1. **Name is unique** - Check if command already exists
2. **Name is kebab-case** - Must match `/^[a-z0-9-]+$/`
3. **Description is meaningful** - Min 20 characters
4. **Category is valid** - Must be in allowed list
5. **Agent exists** - Validate agent name if specified

## UltraThink Knowledge Graph Integration

When `auto_ultrathink: true`:

```bash
# After command creation
ultrathink add-entity \
  --type=command \
  --name={command-name} \
  --metadata='{"category":"{category}","agent":"{agent}"}' \
  --relationships='["uses:{agent}","category:{category}"]'

# Generate command relationship graph
ultrathink query \
  "MATCH (c:Command)-[:USES]->(a:Agent) RETURN c, a" \
  --visualize
```

### Knowledge Graph Benefits

1. **Command Discovery** - Find related commands by category/agent
2. **Dependency Tracking** - See which commands use which agents
3. **Usage Analytics** - Track command usage patterns
4. **Auto-Documentation** - Generate command maps automatically

## Examples

### Example 1: Create Simple Command

```bash
create-command --name=hello-world --description="Say hello to the world"
```

**Generated:**
- `.claude/commands/hello-world.md`
- `.cursor/commands/hello-world.md`

### Example 2: Create Agent-Based Command

```bash
create-command \
  --name=optimize-performance \
  --description="Analyze and optimize application performance" \
  --category=code-quality \
  --agent=code-quality-reviewer \
  --output-type=markdown_document \
  --output-location=docs/performance/
```

### Example 3: Create Deployment Command

```bash
create-command \
  --name=deploy-to-production \
  --description="Deploy application to production environment" \
  --category=deployment \
  --agent=aws-cloud-services-orchestrator \
  --ultrathink=true
```

## Related Commands

- `/organize-docs` - Organize documentation including commands
- `/review-code` - Review generated command code
- `/advanced-git` - Commit command changes with proper workflow

## Notes for Claude Code

When executing this command:

1. **Always validate inputs** before creating files
2. **Check for existing commands** to avoid duplicates
3. **Create both .claude and .cursor versions** for compatibility
4. **Update command registries** in both directories
5. **Show clear success message** with next steps
6. **Don't auto-commit** - let user review first

## Command Metadata

```yaml
name: create-command
category: development
agent: general-purpose
output_type: markdown_document
output_location: .claude/commands/ + .cursor/commands/
token_cost: ~5,000
version: 1.0.0
author: Quik Nation AI
```

## Troubleshooting

### Command Already Exists

```
❌ Error: Command 'review-code' already exists

💡 Solutions:
   1. Use different name: create-command --name=review-code-v2
   2. Update existing: edit .claude/commands/review-code.md
   3. Delete existing: rm .claude/commands/review-code.md
```

### Invalid Category

```
❌ Error: Category 'random' is not valid

✅ Valid categories:
   - development
   - deployment
   - code-quality
   - testing
   - documentation
   - integration
   - infrastructure
```

### Missing .cursor Directory

```
ℹ️  .cursor/commands directory doesn't exist
✅ Creating .cursor/commands/
✅ Command created in both directories
```
