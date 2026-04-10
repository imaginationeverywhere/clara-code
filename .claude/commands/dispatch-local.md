# /dispatch-local — Run Cursor Agent on This Machine

**Target:** Mo's local Mac (current machine)
**Visibility:** Opens a c-swarm pane — Mo watches the agent work in real-time
**Use for:** Quick local tasks, frontend work, prototypes. NOTE: local machine overheats under heavy agent load — use `/dispatch-qcs1` for sustained builds.

---

## Usage

```
/dispatch-local "<prompt>" --heru <name>
/dispatch-local "<prompt>" --workspace /absolute/path/to/project
/dispatch-local "<prompt>" --heru quiknation
/dispatch-local "<prompt>" --heru quiknation --dry-run
```

## Arguments
- `<prompt>` (required) — The task for Cursor Agent
- `--heru <name>` — Target Heru by name (fuzzy-matched against known paths)
- `--workspace <path>` — Absolute path to the project (use instead of --heru for exact paths)
- `--dry-run` — Print the command without executing
- `--yolo` — Auto-approve all Cursor tool calls (default: on)

---

## How It Works

### Step 1: Resolve Project Path

If `--heru` is given, fuzzy-match against Heru registry:
```bash
HERUS=$(cat ~/auset-brain/Swarms/team-registry.md | grep "Project path" | sed 's/.*: //')
PROJECT=$(echo "$HERUS" | grep -i "$HERU_NAME" | head -1)
```

If `--workspace` is given, use it directly.

### Step 2: Open a c-swarm Pane

Find the next available c-swarm window in the swarm tmux session, or create one:
```bash
# Find or create c-swarm window
WINDOW=$(tmux list-windows -t swarm -F "#{window_name}" 2>/dev/null | grep "c-swarm" | tail -1)
if [ -z "$WINDOW" ]; then
  tmux new-window -t swarm: -n "c-swarm-dispatch"
  WINDOW="c-swarm-dispatch"
fi

# Split a new pane for this agent
tmux split-window -t "swarm:$WINDOW" -h
PANE=$(tmux display-message -t "swarm:$WINDOW" -p "#{pane_id}")
```

### Step 3: Build and Run Cursor Command

```bash
CMD="cursor agent -p --yolo --workspace \"$PROJECT\" \"$PROMPT\""

# Run it in the visible pane
tmux send-keys -t "$PANE" "$CMD" Enter
```

### Step 4: Log to Live Feed

```bash
echo "$(date '+%H:%M:%S') | quik-nation-ai-boilerplate | DISPATCH-LOCAL | $(basename $PROJECT) | $PROMPT" \
  >> ~/auset-brain/Swarms/live-feed.md
```

---

## Output

Mo sees the Cursor agent output in real-time in the c-swarm pane. When it finishes, the pane stays open with the summary.

---

## Related
- `/dispatch-qcs1` — PRIMARY build target (Mac M4 Pro, unlimited capacity)
- `/dispatch-aws` — EC2 agents (deployments, server tasks, infra work)
- `/dispatch-team` — Send directives to running Claude Code swarm sessions
