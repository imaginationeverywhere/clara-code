# Automatic Update Checking Without Global Hooks

If you cannot or prefer not to configure global hooks, the boilerplate still provides automatic update checking through proactive agent behavior.

## How It Works (Without Hooks)

The `boilerplate-update-manager` agent is configured as a **PROACTIVE AGENT** that Claude Code should automatically invoke when:

1. **Session Start Detection**: Claude Code detects you're in a boilerplate project
2. **Project Indicators**: Any of these files exist:
   - `.boilerplate-manifest.json`
   - `.claude/commands/update-boilerplate.md`
   - `.claude/session-hooks.json`

## Expected Behavior

When you start Claude Code in a boilerplate project:

### Automatic (Ideal)
Claude Code should immediately:
1. Detect the boilerplate project
2. Invoke the boilerplate-update-manager agent
3. Display either:
   - "✅ The Quik Nation AI Boilerplate by Quik Nation is up to date"
   - An update notification with version details

### Semi-Automatic (Common)
If automatic detection doesn't happen immediately:
1. Send your first message (e.g., "Hi", "Let's start", or any work-related message)
2. Claude Code will detect the project and check for updates
3. You'll see the update status message

### Manual Fallback (Always Works)
Simply ask directly:
- "Check for boilerplate updates"
- "Are there any updates available?"
- "Check if the boilerplate is up to date"

## Improving Automatic Detection

To help Claude Code detect your boilerplate project more reliably:

### 1. Ensure Project Indicators Exist
```bash
# Check that at least one of these exists:
ls -la .boilerplate-manifest.json
ls -la .claude/commands/update-boilerplate.md
ls -la .claude/session-hooks.json
```

### 2. Create/Update Manifest
If missing, create `.boilerplate-manifest.json`:
```json
{
  "version": "1.3.6",
  "projectType": "boilerplate",
  "lastUpdateCheck": null
}
```

### 3. Start Claude Code in Project Root
Always start Claude Code from the project root directory where `.claude/` folder exists.

## Why Automatic Detection May Not Trigger

1. **First Session**: Claude Code may need to learn your project structure
2. **Context Loading**: Large projects may delay detection
3. **Agent Loading**: Agents may need initialization time
4. **System Resources**: High system load may delay proactive checks

## Best Practices

### For Developers
1. **First Time Setup**: Manually check once: "Check for boilerplate updates"
2. **Daily Workflow**: Include in your greeting: "Hi, check for updates"
3. **Team Coordination**: Add to team onboarding docs

### For Team Leads
1. **Document the Process**: Include update checking in your workflow docs
2. **Regular Reminders**: Remind team to check for updates weekly
3. **Consider Global Hooks**: See `SETUP.md` for organization-wide setup

## Telemetry and Privacy

Even without hooks, when the agent runs it will:
- Check version against remote repository
- Collect anonymous usage statistics
- Report telemetry for boilerplate improvement
- **Never** transmit personal or project data

## Troubleshooting

### Agent Not Running Automatically

**Quick Fix**: Just ask "Check for boilerplate updates"

**Permanent Fix**: Configure global hooks (see `SETUP.md`)

### Update Check Fails

**Check SSH Access**:
```bash
ssh -T git@github.com
```

**Check Repository Access**:
```bash
git ls-remote git@github.com:imaginationeverywhere/quik-nation-ai-boilerplate.git
```

### Version Mismatch

**Update Manifest**:
```bash
# Check package.json version
cat package.json | grep version

# Update manifest to match
echo '{"version": "1.3.6"}' > .boilerplate-manifest.json
```

## Alternative Solutions

### 1. Local Script
Create a local check script:
```bash
#!/bin/bash
echo "Checking for boilerplate updates..."
node .claude/hooks/session-start.js
```

### 2. Git Alias
Add to `.git/config`:
```
[alias]
    check-updates = !echo "Check for boilerplate updates"
```

### 3. VS Code Task
If using VS Code, add to `.vscode/tasks.json`:
```json
{
  "label": "Check Boilerplate Updates",
  "type": "shell",
  "command": "echo 'Check for boilerplate updates'",
  "problemMatcher": []
}
```

## Summary

While global hooks provide the best automatic experience, the boilerplate is designed to work without them through:

1. **Proactive agent behavior** (when Claude Code detects the project)
2. **Simple manual triggers** (just ask for update check)
3. **Multiple fallback methods** (scripts, aliases, tasks)

The key is that update checking is always available - it just might require a simple prompt on your first message of the session.