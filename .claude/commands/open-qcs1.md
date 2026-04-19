# /open-qcs1 — Open a New tmux Tab SSHed to QCS1

Open a new window in the local `swarm` tmux session, SSH into QCS1, and `cd` to the specified project path. The window is named and ready for Cursor agent dispatch.

## Usage
```
/open-qcs1 --name <tab-name> --path <qcs1-path>
/open-qcs1 --name clara-cli --path ~/projects/clara-code/packages/create-clara-app
/open-qcs1 --name clara-sdk --path ~/projects/clara-code/packages/clara
/open-qcs1 --name wcr --path ~/projects/world-cup-ready
/open-qcs1 --split                    # Split current window instead of new tab
/open-qcs1 --list                     # List all current swarm windows
```

## Arguments

| Flag | Required | Description |
|------|----------|-------------|
| `--name <name>` | Yes | Tab name shown in tmux window list |
| `--path <path>` | Yes | Path on QCS1 to cd into (relative to ~ or absolute) |
| `--split` | No | Split the current pane horizontally instead of creating a new window |
| `--vertical` | No | Use vertical split (with --split) |
| `--list` | No | List all windows in the swarm session |
| `--close <name>` | No | Close a named window |

## Execution

### Step 1: Validate swarm session exists
```bash
tmux has-session -t swarm 2>/dev/null || {
  echo "ERROR: No 'swarm' tmux session found. Run /session-start or 'tmux new-session -s swarm' first."
  exit 1
}
```

### Step 2: --list mode
```bash
if [ "$MODE" = "list" ]; then
  tmux list-windows -t swarm
  exit 0
fi
```

### Step 3: --close mode
```bash
if [ -n "$CLOSE_NAME" ]; then
  tmux kill-window -t "swarm:$CLOSE_NAME" 2>/dev/null && echo "Closed: $CLOSE_NAME" || echo "Window not found: $CLOSE_NAME"
  exit 0
fi
```

### Step 4: Create window or split
```bash
NAME="<--name value>"
QCS1_PATH="<--path value>"
QCS1_HOST="quik-cloud"

if [ "$SPLIT" = true ]; then
  SPLIT_FLAG="-h"  # horizontal split (side by side)
  [ "$VERTICAL" = true ] && SPLIT_FLAG="-v"
  tmux split-window $SPLIT_FLAG -t swarm
  TARGET=$(tmux display-message -p '#I.#P')
  tmux select-pane -t swarm:$TARGET -T "QCS1: $NAME"
else
  tmux new-window -t swarm -n "$NAME"
fi
```

### Step 5: SSH to QCS1 at the specified path
```bash
tmux send-keys -t "swarm:$NAME" \
  "ssh $QCS1_HOST -t 'cd $QCS1_PATH && exec \$SHELL'" \
  Enter
```

### Step 6: Confirm
```bash
echo "✓ Tab '$NAME' opened → QCS1:$QCS1_PATH"
echo "  Run: cursor agent   (after keychain unlock)"
tmux list-windows -t swarm
```

## Common QCS1 Paths

| Project | Path |
|---------|------|
| clara-code (root) | `~/projects/clara-code` |
| clara-code IDE | `~/projects/clara-code/ide/clara-code` |
| create-clara-app (CLI) | `~/projects/clara-code/packages/create-clara-app` |
| clara SDK | `~/projects/clara-code/packages/clara` |
| claraagents | `~/projects/claraagents` |
| quiknation | `~/projects/quiknation` |
| world-cup-ready | `~/projects/world-cup-ready` |
| quikcarrental | `~/projects/quikcarrental` |
| fmo | `~/projects/fmo` |
| boilerplate | `~/projects/quik-nation-ai-boilerplate` |

## After Opening

Once the tab is open and SSHed to QCS1:

1. **Unlock keychain** (if needed): `security unlock-keychain ~/Library/Keychains/login.keychain-db`
2. **Start Cursor agent**: `cursor agent`
3. **Paste your prompt** when the agent is ready

## Notes

- The `swarm` session must exist (created by `/session-start` or `tmux new-session -s swarm`)
- QCS1 SSH alias is `quik-cloud` (Tailscale: `ayoungboy@100.113.53.80`)
- Max 6 concurrent Cursor agents on QCS1 (Ultra plan)
- Tab names should match the project they're working on for clarity
- Use `--list` to see what's already running before opening more

## Related Commands
- `/open-tabs` — Ad-hoc multiple Claude Code + local/QCS1 Cursor tabs or panes in the **current** tmux session (`.claude/scripts/open-tabs.sh`)
- `/session-start` — Initialize the swarm session
- `/dispatch-cursor` — Dispatch a Cursor agent prompt to an existing tab
- `/sync-herus` — Sync platform files across all Herus
