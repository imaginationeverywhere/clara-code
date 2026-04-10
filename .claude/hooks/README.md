# Claude Code Hooks

This directory contains hook templates and setup instructions for Claude Code's session lifecycle integration.

## ⚠️ Important: User Configuration Required

**The hooks in this directory are templates only.** Claude Code hooks must be installed in your Claude Code configuration directory, not in the project. 

**See `SETUP.md` for complete installation instructions.**

## SessionStart — automatic resume (this repo)

**Project-local:** `.claude/settings.json` registers **`session-resume.sh`** on **SessionStart**. It injects `memory/session-checkpoint.md`, optional `memory/agent-checkpoints/<agent>.md` when `SWARM_RESUME_AGENT` is set (per-agent tmux windows), plus live-feed / Daily / `git log` tails — so sessions **resume in place** without a long re-intro.

## SessionStart Hook (legacy / reference)

The `session-start.js` file in this directory is a reference implementation that demonstrates how to detect boilerplate projects and trigger update checks. It is **not** merged into `session-resume.sh`; add a second SessionStart hook entry in `settings.json` if you want both behaviors.

### How It Works

1. **Detection**: Hook checks for boilerplate indicators (.boilerplate-manifest.json, etc.)
2. **Signal**: Sends signal to Claude Code to invoke boilerplate-update-manager agent
3. **Agent Execution**: The agent performs the actual update check against remote repository
4. **Update Check**: Agent uses SSH to check `git@github.com:imaginationeverywhere/quik-nation-ai-boilerplate.git`
5. **User Notification**: Agent displays update notification if updates are available

### Remote Repository

All update checks are performed against:
```
git@github.com:imaginationeverywhere/quik-nation-ai-boilerplate.git
```

The agent will:
- Use `git ls-remote` to check latest tags via SSH
- Fall back to GitHub API if SSH is unavailable
- Compare versions semantically
- Report available updates to user

### Testing

Test the hook manually:
```bash
node .claude/hooks/session-start.js
```

Expected output:
```
INVOKE_AGENT:boilerplate-update-manager
CONTEXT:session-startup
ACTION:check-updates
REPOSITORY:git@github.com:imaginationeverywhere/quik-nation-ai-boilerplate.git
```

### Privacy

- No local paths are used or transmitted
- All data is relative to current working directory
- Telemetry is anonymized before transmission
- No personal information is collected