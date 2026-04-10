# [PROJECT_NAME] Jira Integration - Quick Start Guide

## How to Run Commands: Claude Code vs Terminal

### ✅ Correct: In Claude Code
These are **Claude Code custom commands** - run them by typing in Claude Code:

```
sync-jira --connect
```

Or ask Claude naturally:
```
"Can you run sync-jira --connect to set up our Jira integration?"
"Please sync-jira --configure-personal"
"Run sync-jira to sync our project"
```

### ❌ Incorrect: In Terminal
```bash
$ sync-jira --connect
# This will fail - these are not terminal commands!
```

## Quick Command Reference

### Initial Setup (First Time)
**In Claude Code:**
```
sync-jira --connect
```
This will guide you through:
- Connecting to your QAC Jira project
- Setting up API authentication
- Creating the enhanced directory structure
- Migrating your existing todos

### Personal Configuration
**In Claude Code:**
```
sync-jira --configure-personal
```
This sets up:
- Your personal filtering preferences
- Assignment detection
- Team coordination settings
- Notification preferences

### Daily Usage
**In Claude Code:**
```
process-todos
update-todos
```
These commands automatically detect Jira integration and enhance their behavior.

### Test Your Setup
**In Claude Code:**
```
sync-jira --test-connection
```
Verifies everything is working correctly.

## What Happens When You Run Commands

### When you type `sync-jira --connect` in Claude Code:
1. Claude reads the sync-jira.md command file
2. Claude sees you want the `--connect` option
3. Claude executes the connection setup workflow
4. Claude guides you through each step interactively
5. Claude creates all necessary configuration files

### When you type it in terminal:
1. Terminal looks for an executable file named `sync-jira`
2. No such file exists (because these are Claude Code commands)
3. Terminal returns "command not found" error

## Getting Help

If a command isn't working as expected:

**In Claude Code:**
```
"What options are available for sync-jira?"
"Can you show me how to use the Jira integration commands?"
"Help with sync-jira setup"
```

**Check command documentation:**
All commands are documented in `.claude/commands/` directory

## Troubleshooting

**Problem**: Command doesn't recognize parameters like `--connect`
**Solution**: The command file needs to be updated to handle parameters properly (like I just did with sync-jira.md)

**Problem**: "Command not found" in terminal  
**Solution**: These are Claude Code commands, not terminal commands. Use them in Claude Code instead.

**Problem**: Command shows documentation but doesn't execute
**Solution**: Ask Claude to run the command: "Can you run sync-jira --connect?"

## Next Steps

1. **Start with setup**: Run `sync-jira --connect` in Claude Code
2. **Configure personal filtering**: Run `sync-jira --configure-personal` 
3. **Test your workflow**: Try `process-todos` and `update-todos`
4. **Run simulations**: Use `demo-workflow-live` to see the full system in action

Remember: These commands work in **Claude Code only**, not in your terminal!