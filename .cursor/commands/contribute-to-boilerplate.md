# Contribute to Boilerplate

**Version:** 1.0.0
**Agent:** general-purpose
**Output:** Pull request or contribution report in `docs/contributions/{timestamp}-contribution.md`

## Purpose

Contribute improvements, new commands, agents, or functionality from a derived boilerplate project back to the main Quik Nation AI Boilerplate. Enables bidirectional knowledge sharing across all boilerplate projects.

## Usage

```bash
# Interactive contribution wizard (recommended)
contribute-to-boilerplate

# Contribute specific commands
contribute-to-boilerplate --commands=custom-deploy,optimize-db

# Contribute agents
contribute-to-boilerplate --agents=custom-agent

# Contribute documentation
contribute-to-boilerplate --docs=docs/guides/advanced-deployment.md

# Contribute with automatic PR creation
contribute-to-boilerplate --create-pr --commands=custom-feature

# Preview contribution (dry-run)
contribute-to-boilerplate --dry-run --commands=custom-deploy

# Contribute entire feature set
contribute-to-boilerplate --feature=slack-integration
```

## What Can Be Contributed

### 1. Custom Commands
Commands you've created that would benefit all projects:
- Deployment workflows
- Integration patterns
- Development utilities
- Testing frameworks

### 2. Specialized Agents
New agent implementations:
- Technology-specific agents
- Integration agents
- Workflow agents

### 3. Documentation
Guides, patterns, and best practices:
- Implementation guides
- Architecture documentation
- Troubleshooting guides
- Best practices

### 4. Infrastructure Code
Reusable infrastructure patterns:
- AWS CDK constructs
- Docker configurations
- CI/CD workflows

### 5. Utilities & Scripts
Helper scripts and tools:
- Port management utilities
- Database migration helpers
- Deployment automation

### 6. MCP Server Configurations
MCP server setups:
- Custom MCP servers
- Integration configurations
- Server templates

## Command Implementation

When this command is invoked, Claude Code should:

### Phase 1: Validate Project Context

```bash
# Ensure we're in a boilerplate project
if [ ! -f ".boilerplate-manifest.json" ]; then
  echo "❌ Error: Not a boilerplate project"
  echo "💡 This command should run from a derived boilerplate project"
  exit 1
fi

# Read project metadata
PROJECT_NAME=$(jq -r '.project_name' .boilerplate-manifest.json)
PROJECT_VERSION=$(jq -r '.version' .boilerplate-manifest.json)
BOILERPLATE_SOURCE=$(jq -r '.source' .boilerplate-manifest.json)
MAIN_BOILERPLATE=$(jq -r '.main_boilerplate_path' .boilerplate-manifest.json)

echo "📦 Project: $PROJECT_NAME (v$PROJECT_VERSION)"
echo "🔗 Source: $BOILERPLATE_SOURCE"
echo "🎯 Main Boilerplate: $MAIN_BOILERPLATE"

# Validate main boilerplate path
if [ ! -d "$MAIN_BOILERPLATE" ]; then
  echo "❌ Error: Main boilerplate not found at $MAIN_BOILERPLATE"
  echo "💡 Update main_boilerplate_path in .boilerplate-manifest.json"
  exit 1
fi
```

### Phase 2: Interactive Selection

If no parameters provided, show interactive wizard:

```markdown
🎯 Contribute to Boilerplate

What would you like to contribute?

1. Custom Commands
2. Specialized Agents
3. Documentation
4. Infrastructure Code
5. Utilities & Scripts
6. MCP Server Configurations
7. Complete Feature Set

Select option [1-7]: _
```

Based on selection, scan for contributions:

**For Commands:**
```bash
# Find custom commands (not in main boilerplate)
CUSTOM_COMMANDS=()

for cmd in .claude/commands/*.md; do
  CMD_NAME=$(basename "$cmd")

  # Check if exists in main boilerplate
  if [ ! -f "$MAIN_BOILERPLATE/.claude/commands/$CMD_NAME" ]; then
    CUSTOM_COMMANDS+=("$CMD_NAME")
  elif ! diff -q "$cmd" "$MAIN_BOILERPLATE/.claude/commands/$CMD_NAME" > /dev/null; then
    # Command exists but is different
    if grep -q "CUSTOM:" "$cmd"; then
      CUSTOM_COMMANDS+=("$CMD_NAME (modified)")
    fi
  fi
done

# Display found commands
echo "📋 Custom commands found:"
for cmd in "${CUSTOM_COMMANDS[@]}"; do
  echo "   ☐ $cmd"
done

# Let user select
echo ""
echo "Select commands to contribute (comma-separated):"
read -r SELECTED_COMMANDS
```

### Phase 3: Analyze Contribution

```bash
echo "🔍 Analyzing contribution..."

# Check for dependencies
echo "   Checking dependencies..."

for cmd in $SELECTED_COMMANDS; do
  # Check if command references other files
  DEPENDENCIES=$(grep -h "source.*/" ".claude/commands/$cmd" | grep -o '[^/]*.md' || true)

  if [ -n "$DEPENDENCIES" ]; then
    echo "   📎 $cmd depends on:"
    for dep in $DEPENDENCIES; do
      echo "      - $dep"
    done
  fi
done

# Check for agents
echo "   Checking for required agents..."

REQUIRED_AGENTS=$(grep -h "subagent_type=" ".claude/commands/$cmd" | grep -o "'[^']*'" | tr -d "'" || true)

if [ -n "$REQUIRED_AGENTS" ]; then
  echo "   🤖 Required agents:"
  for agent in $REQUIRED_AGENTS; do
    if [ -f ".claude/agents/$agent.md" ]; then
      echo "      ✓ $agent (available)"
    else
      echo "      ⚠️  $agent (not found - may need to contribute)"
    fi
  done
fi

# Check for MCP servers
echo "   Checking for MCP server dependencies..."

MCP_SERVERS=$(grep -h "mcp__" ".claude/commands/$cmd" | grep -o 'mcp__[a-zA-Z0-9_-]*' | sort -u || true)

if [ -n "$MCP_SERVERS" ]; then
  echo "   📡 MCP servers used:"
  for server in $MCP_SERVERS; do
    echo "      • $server"
  done
fi
```

### Phase 4: Package Contribution

```bash
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
CONTRIBUTION_DIR="docs/contributions/${TIMESTAMP}-${PROJECT_NAME}-contribution"

mkdir -p "$CONTRIBUTION_DIR"

echo "📦 Packaging contribution..."

# Copy commands
mkdir -p "$CONTRIBUTION_DIR/commands"
for cmd in $SELECTED_COMMANDS; do
  cp ".claude/commands/$cmd" "$CONTRIBUTION_DIR/commands/"
  echo "   ✓ Copied $cmd"
done

# Copy agents if needed
if [ -n "$REQUIRED_AGENTS" ]; then
  mkdir -p "$CONTRIBUTION_DIR/agents"
  for agent in $REQUIRED_AGENTS; do
    if [ -f ".claude/agents/$agent.md" ]; then
      cp ".claude/agents/$agent.md" "$CONTRIBUTION_DIR/agents/"
      echo "   ✓ Copied agent: $agent"
    fi
  done
fi

# Copy MCP configurations if needed
if [ -n "$MCP_SERVERS" ]; then
  mkdir -p "$CONTRIBUTION_DIR/mcp"
  # Copy relevant MCP configs
  echo "   ✓ Copied MCP configurations"
fi

# Generate contribution manifest
cat > "$CONTRIBUTION_DIR/CONTRIBUTION_MANIFEST.json" << EOF
{
  "contribution_id": "${TIMESTAMP}-${PROJECT_NAME}",
  "source_project": "$PROJECT_NAME",
  "source_version": "$PROJECT_VERSION",
  "contributed_by": "$(git config user.name)",
  "contributed_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "contribution_type": "commands",
  "items": [
$(printf '    "%s"' "${SELECTED_COMMANDS[@]}" | paste -sd ',' -)
  ],
  "dependencies": {
    "agents": [
$(printf '      "%s"' "$REQUIRED_AGENTS" | paste -sd ',' -)
    ],
    "mcp_servers": [
$(printf '      "%s"' "$MCP_SERVERS" | paste -sd ',' -)
    ]
  }
}
EOF
```

### Phase 5: Generate Contribution Documentation

```bash
CONTRIB_DOC="$CONTRIBUTION_DIR/CONTRIBUTION.md"

cat > "$CONTRIB_DOC" << EOF
# Contribution from $PROJECT_NAME

**Date:** $(date +"%Y-%m-%d %H:%M:%S")
**Contributor:** $(git config user.name) <$(git config user.email)>
**Project:** $PROJECT_NAME v$PROJECT_VERSION

## Summary

This contribution includes improvements and custom functionality developed in the $PROJECT_NAME project that would benefit the entire Quik Nation AI Boilerplate ecosystem.

## What's Included

### Commands (${#SELECTED_COMMANDS[@]})

EOF

for cmd in $SELECTED_COMMANDS; do
  # Extract description from command file
  DESCRIPTION=$(grep -m 1 "^##.*Purpose" -A 2 ".claude/commands/$cmd" | tail -n 1 || echo "No description available")

  cat >> "$CONTRIB_DOC" << EOF
#### \`$cmd\`

$DESCRIPTION

**Usage:**
\`\`\`bash
${cmd%.md}
\`\`\`

EOF
done

if [ -n "$REQUIRED_AGENTS" ]; then
  cat >> "$CONTRIB_DOC" << EOF

### Required Agents

EOF

  for agent in $REQUIRED_AGENTS; do
    echo "- \`$agent\`" >> "$CONTRIB_DOC"
  done
fi

cat >> "$CONTRIB_DOC" << EOF

## Use Cases

This functionality was developed to solve the following real-world problems in $PROJECT_NAME:

1. **[Use Case 1]** - [Description of problem and solution]
2. **[Use Case 2]** - [Description of problem and solution]

## Benefits to Other Projects

- **[Benefit 1]** - How other projects can use this
- **[Benefit 2]** - Productivity improvements
- **[Benefit 3]** - Best practices enforced

## Testing

This functionality has been tested in $PROJECT_NAME with:

- **Production Usage:** [Duration] in production
- **Projects Using:** $PROJECT_NAME
- **Test Coverage:** [Coverage %]
- **Known Issues:** [Any known limitations]

## Integration Instructions

### For Main Boilerplate

1. Review contribution files in \`$CONTRIBUTION_DIR\`
2. Copy commands to \`.claude/commands/\`
3. Copy agents to \`.claude/agents/\` (if applicable)
4. Update command registry in \`.claude/commands/README.md\`
5. Test commands in main boilerplate
6. Run \`sync-boilerplate-commands\` to distribute to all projects

### For Individual Projects

If accepted into main boilerplate, all projects can receive this via:
\`\`\`bash
update-boilerplate --check
update-boilerplate --apply
\`\`\`

## Dependencies

### Agents Required

EOF

if [ -n "$REQUIRED_AGENTS" ]; then
  for agent in $REQUIRED_AGENTS; do
    echo "- \`$agent\` - [Purpose]" >> "$CONTRIB_DOC"
  done
else
  echo "None" >> "$CONTRIB_DOC"
fi

cat >> "$CONTRIB_DOC" << EOF

### MCP Servers Required

EOF

if [ -n "$MCP_SERVERS" ]; then
  for server in $MCP_SERVERS; do
    echo "- \`$server\` - [Purpose]" >> "$CONTRIB_DOC"
  done
else
  echo "None" >> "$CONTRIB_DOC"
fi

cat >> "$CONTRIB_DOC" << EOF

### NPM Packages Required

[List any new NPM packages needed]

## Notes

[Any additional notes for integration]

## Contact

**Contributor:** $(git config user.name)
**Email:** $(git config user.email)
**Project:** $PROJECT_NAME
**Available for questions:** Yes/No

---

🤖 Generated with contribute-to-boilerplate command
EOF

echo "   ✓ Generated contribution documentation"
```

### Phase 6: Create Pull Request (if --create-pr)

```bash
if [ "$CREATE_PR" == "true" ]; then
  echo "🔀 Creating pull request..."

  # Copy files to main boilerplate
  cd "$MAIN_BOILERPLATE"

  # Create feature branch
  BRANCH_NAME="contrib/${PROJECT_NAME}/${TIMESTAMP}"
  git checkout -b "$BRANCH_NAME"

  # Copy contribution files
  cp -r "$CONTRIBUTION_DIR/commands/"* .claude/commands/
  cp -r "$CONTRIBUTION_DIR/commands/"* .cursor/commands/

  if [ -d "$CONTRIBUTION_DIR/agents" ]; then
    cp -r "$CONTRIBUTION_DIR/agents/"* .claude/agents/
  fi

  # Stage changes
  git add .claude/commands/ .cursor/commands/

  if [ -d "$CONTRIBUTION_DIR/agents" ]; then
    git add .claude/agents/
  fi

  # Commit
  git commit -m "feat: contribution from $PROJECT_NAME

Contributed by: $(git config user.name)
Source Project: $PROJECT_NAME v$PROJECT_VERSION

Commands Added:
$(printf '- %s\n' "${SELECTED_COMMANDS[@]}")

See CONTRIBUTION.md for full details and integration instructions.

🤖 Generated with contribute-to-boilerplate

Co-Authored-By: Claude <noreply@anthropic.com>"

  # Push branch
  git push -u origin "$BRANCH_NAME"

  # Create PR using GitHub CLI
  gh pr create \
    --title "feat: Contribution from $PROJECT_NAME - ${SELECTED_COMMANDS[0]}" \
    --body "$(cat $CONTRIB_DOC)" \
    --label "contribution,enhancement" \
    --assignee "@me"

  PR_URL=$(gh pr view --json url -q .url)

  echo "   ✓ Pull request created: $PR_URL"

  # Return to project
  cd -
fi
```

### Phase 7: Display Summary

```markdown
✅ Contribution Prepared Successfully

📦 Contribution Package:
   ID: {timestamp}-{project_name}
   From: {project_name} v{version}
   Type: Commands

📋 Items Contributed:
   Commands: {n}
   ✓ custom-deploy.md
   ✓ optimize-db.md
   ✓ slack-integration.md

   Agents: {n}
   ✓ slack-integration-agent.md

   MCP Servers: {n}
   • slack-mcp

📂 Package Location:
   {contribution_dir}

📄 Documentation:
   {contribution_dir}/CONTRIBUTION.md

🔀 Pull Request:
   {pr_url} (if --create-pr was used)

💡 Next Steps:

   **If you created a PR:**
   1. Wait for review from boilerplate maintainers
   2. Address any feedback
   3. Once merged, all projects can receive via update-boilerplate

   **If manual integration:**
   1. Share contribution directory with boilerplate maintainers
   2. Or manually copy to main boilerplate:
      cp -r {contribution_dir}/commands/* {main_boilerplate}/.claude/commands/
   3. Run sync-boilerplate-commands to distribute

🌟 Thank you for contributing to the Quik Nation AI Boilerplate ecosystem!
```

## Contribution Quality Checklist

Before contributing, ensure:

- [ ] **Documentation is complete** - All commands have proper documentation
- [ ] **Examples are included** - Usage examples for all functionality
- [ ] **Dependencies are documented** - Agents, MCP servers, NPM packages listed
- [ ] **Tested in production** - Functionality has been battle-tested
- [ ] **No sensitive data** - No API keys, secrets, or project-specific data
- [ ] **Generic and reusable** - Can be used by other projects with minimal changes
- [ ] **Follows boilerplate patterns** - Consistent with existing commands/agents
- [ ] **UltraThink integration** - Includes knowledge graph metadata

## Types of Contributions

### High-Value Contributions

1. **Deployment Workflows** - Proven production deployment patterns
2. **Integration Patterns** - Third-party service integrations (Stripe, Twilio, etc.)
3. **Security Improvements** - Security scanning, vulnerability detection
4. **Performance Optimization** - Database query optimization, bundle size reduction
5. **Testing Frameworks** - Comprehensive testing strategies
6. **Developer Experience** - Tools that improve productivity

### Medium-Value Contributions

1. **Utility Commands** - Helpful development utilities
2. **Documentation Improvements** - Better guides and explanations
3. **Code Quality Tools** - Linting, formatting, standards enforcement
4. **Monitoring & Observability** - Logging, metrics, alerting

### Review Requirements

Contributions will be reviewed for:

1. **Code Quality** - Clean, maintainable code
2. **Documentation** - Clear, comprehensive documentation
3. **Testing** - Adequate test coverage
4. **Security** - No security vulnerabilities
5. **Performance** - No performance regressions
6. **Compatibility** - Works across all boilerplate projects

## Configuration

Add to `.boilerplate-manifest.json`:

```json
{
  "project_name": "dreamihaircare",
  "version": "1.5.0",
  "source": "quik-nation-ai-boilerplate",
  "main_boilerplate_path": "/Users/amenra/Native-Projects/AI/quik-nation-ai-boilerplate",
  "contributions": {
    "enabled": true,
    "auto_pr": false,
    "contributor_name": "DreamiHairCare Team",
    "contributor_email": "dev@dreamihaircare.com"
  }
}
```

## Examples

### Example 1: Contribute Custom Deployment Command

```bash
# Interactive mode
contribute-to-boilerplate

# Select "1. Custom Commands"
# Select "custom-deploy.md"
# Review and confirm

# Result: Contribution package created with PR
```

### Example 2: Contribute Integration Feature

```bash
# Contribute entire Slack integration feature
contribute-to-boilerplate --feature=slack-integration

# Includes:
# - Commands: slack-notify.md, slack-setup.md
# - Agents: slack-integration-agent.md
# - MCP: slack-mcp configuration
# - Docs: Slack integration guide
```

### Example 3: Preview Before Contributing

```bash
# Dry-run to see what would be contributed
contribute-to-boilerplate --dry-run --commands=custom-deploy

# Review output
# Actually contribute if satisfied
contribute-to-boilerplate --commands=custom-deploy --create-pr
```

## UltraThink Integration

Track contribution history:

```bash
# After contribution
ultrathink add-contribution \
  --project="$PROJECT_NAME" \
  --items="${SELECTED_COMMANDS[@]}" \
  --type="commands" \
  --pr="$PR_URL"

# Query contribution history
ultrathink query "
  MATCH (p:Project)-[c:CONTRIBUTED]->(b:Boilerplate)
  RETURN p.name, count(c) as contributions
  ORDER BY contributions DESC
" --visualize

# Find most valuable contributions
ultrathink analyze-contributions --by-usage
```

## Related Commands

- `/sync-boilerplate-commands` - Distribute updates to all projects
- `/create-command` - Create new commands to contribute
- `/review-code` - Review code before contributing
- `/update-boilerplate` - Receive contributions from main boilerplate

## Notes for Claude Code

When executing this command:

1. **Validate project context** - Must be in a derived boilerplate project
2. **Check main boilerplate path** - Verify path in .boilerplate-manifest.json
3. **Analyze dependencies** - Include all required agents/MCP servers
4. **Generate comprehensive docs** - CONTRIBUTION.md with all details
5. **Create clean PR** - Professional PR with proper description
6. **Preserve customizations** - Don't include project-specific details
7. **Package everything** - Commands, agents, configs, docs

## Command Metadata

```yaml
name: contribute-to-boilerplate
category: infrastructure
agent: general-purpose
output_type: markdown_document + pull_request
output_location: docs/contributions/
token_cost: ~10,000
version: 1.0.0
author: Quik Nation AI
```

## Contribution License

By contributing to the Quik Nation AI Boilerplate:

1. You grant permission for the contribution to be distributed under the boilerplate's license
2. Your authorship will be preserved in git history and CONTRIBUTORS.md
3. Your contribution may be modified to fit boilerplate standards
4. You warrant that you have the right to contribute the code

## Recognition

Contributors will be recognized in:

1. **CONTRIBUTORS.md** - Listed in main boilerplate
2. **Git History** - Co-authored commits
3. **Release Notes** - Mentioned in version releases
4. **Documentation** - Credited in relevant docs

Thank you for making the Quik Nation AI Boilerplate better for everyone! 🌟
