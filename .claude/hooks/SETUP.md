# Setting Up SessionStart Hook for Automatic Update Checking

## Important: User Configuration Required

The SessionStart hook for automatic update checking requires configuration in your Claude Code settings, not just in the project. Follow these steps:

## Step 1: Locate Your Claude Code Config Directory

The config directory location depends on your operating system:
- **macOS**: `~/Library/Application Support/Claude/`
- **Linux**: `~/.config/claude/`
- **Windows**: `%APPDATA%\Claude\`

## Step 2: Create the Hooks Directory

```bash
# macOS/Linux
mkdir -p ~/.config/claude/hooks

# Windows (in PowerShell)
New-Item -ItemType Directory -Force -Path "$env:APPDATA\Claude\hooks"
```

## Step 3: Create the SessionStart Hook

Create a file named `session_start.py` or `session_start.js` in the hooks directory:

### Option A: Python Version (`~/.config/claude/hooks/session_start.py`)

```python
#!/usr/bin/env python3
import os
import json
from pathlib import Path

def on_session_start(context):
    """Check if current project is a boilerplate project and signal update check"""
    cwd = Path(os.getcwd())
    
    # Check for boilerplate indicators
    indicators = [
        '.boilerplate-manifest.json',
        '.claude/commands/update-boilerplate.md',
        '.claude/session-hooks.json'
    ]
    
    is_boilerplate = any((cwd / indicator).exists() for indicator in indicators)
    
    if is_boilerplate:
        # Signal to invoke the boilerplate-update-manager agent
        return {
            "invoke_agent": "boilerplate-update-manager",
            "context": "session-startup",
            "message": "Checking for boilerplate updates..."
        }
    
    return None
```

### Option B: JavaScript Version (`~/.config/claude/hooks/session_start.js`)

```javascript
const fs = require('fs');
const path = require('path');

exports.onSessionStart = function(context) {
    // Check for boilerplate indicators
    const indicators = [
        '.boilerplate-manifest.json',
        '.claude/commands/update-boilerplate.md',
        '.claude/session-hooks.json'
    ];
    
    const cwd = process.cwd();
    const isBoilerplate = indicators.some(file => 
        fs.existsSync(path.join(cwd, file))
    );
    
    if (isBoilerplate) {
        // Signal to invoke the boilerplate-update-manager agent
        return {
            invoke_agent: 'boilerplate-update-manager',
            context: 'session-startup',
            message: 'Checking for boilerplate updates...'
        };
    }
    
    return null;
};
```

## Step 4: Configure Claude Code Settings

Add this to your Claude Code settings (`~/.claude/settings.json`):

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/SessionStart"
          }
        ]
      }
    ]
  }
}
```

## Step 5: Restart Claude Code

After setting up the hook, restart Claude Code for the changes to take effect.

## How It Works

1. When you start Claude Code in any directory, it runs the SessionStart hook
2. The hook checks if the current directory is a boilerplate project
3. If it is, the hook signals Claude Code to invoke the boilerplate-update-manager agent
4. The agent checks for updates and displays:
   - Update notification if updates are available
   - "✅ The Quik Nation AI Boilerplate by Quik Nation is up to date" if current

## Troubleshooting

### Hook Not Running
- Check that hooks are enabled in settings.json
- Verify the hook file has execute permissions: `chmod +x ~/.config/claude/hooks/session_start.py`
- Check Claude Code logs for hook execution errors

### Agent Not Invoked
- Ensure the boilerplate-update-manager agent is available in the project
- Verify the hook is returning the correct signal format
- Check that the project has boilerplate indicators

## Alternative: Manual Checking

If you prefer not to set up the global hook, you can manually check for updates:
- Start Claude Code in your boilerplate project
- Say: "Check for boilerplate updates"
- The boilerplate-update-manager agent will run the check

## Privacy Note

The SessionStart hook only detects project type and triggers the agent. All actual update checking and telemetry is handled by the boilerplate-update-manager agent according to its privacy settings.