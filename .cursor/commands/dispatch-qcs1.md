# /dispatch-qcs1 — Run Cursor Agent on QCS1 (Mac M4 Pro)

**Target:** QCS1 — Mac M4 Pro at `ayoungboy@100.113.53.80` (Tailscale alias: `ssh quik-cloud`)
**Visibility:** Opens a c-swarm pane with a live SSH session — Mo watches the agent work in real-time
**Use for:** ALL sustained builds, iOS/Android, heavy scaffolding, parallel Heru work. This is the PRIMARY build machine.

---

## Usage

```
/dispatch-qcs1 "<prompt>" --heru <name>
/dispatch-qcs1 "<prompt>" --workspace /absolute/path/on/qcs1
/dispatch-qcs1 "<prompt>" --heru quikcarrental
/dispatch-qcs1 "<prompt>" --heru quiknation --parallel --heru site962
```

## Arguments
- `<prompt>` (required) — The task for Cursor Agent
- `--heru <name>` — Target Heru by name (path resolved on QCS1)
- `--workspace <path>` — Absolute path on QCS1 to the project
- `--parallel --heru <name2>` — Dispatch to multiple Herus simultaneously (each gets its own pane)
- `--dry-run` — Print the SSH + cursor command without executing

---

## QCS1 Connection Details

```
Host:     ayoungboy@100.113.53.80  (Tailscale)
Alias:    ssh quik-cloud
Key:      ~/.ssh/quik-cloud
Max agents: 6 concurrent Cursor agents
Has:      Xcode, EAS CLI, xcrun altool, git, node, npm, Cursor CLI
```

---

## How It Works

### Step 1: Resolve Project Path on QCS1

QCS1 mirrors the same external drive paths. The project paths are identical:
```
/Volumes/X10-Pro/Native-Projects/Quik-Nation/quiknation/
/Volumes/X10-Pro/Native-Projects/Quik-Nation/quikcarrental/
/Volumes/X10-Pro/Native-Projects/clients/world-cup-ready/
... (same as local)
```

### Step 2: Open a c-swarm Pane with SSH

```bash
# Find or create c-swarm window
WINDOW=$(tmux list-windows -t swarm -F "#{window_name}" 2>/dev/null | grep "c-swarm" | tail -1)
if [ -z "$WINDOW" ]; then
  tmux new-window -t swarm: -n "c-swarm-qcs1"
  WINDOW="c-swarm-qcs1"
fi

# Split a new pane
tmux split-window -t "swarm:$WINDOW" -h
PANE=$(tmux display-message -t "swarm:$WINDOW" -p "#{pane_id}")
```

### Step 3: SSH into QCS1 and Run Cursor Agent

The `-t` flag allocates a pseudo-TTY so Mo sees the output in real-time:

```bash
CMD="ssh -t quik-cloud 'cd \"$PROJECT\" && cursor agent -p --yolo --workspace \"$PROJECT\" \"$PROMPT\"'"
tmux send-keys -t "$PANE" "$CMD" Enter
```

### Step 4: Log to Live Feed

```bash
echo "$(date '+%H:%M:%S') | quik-nation-ai-boilerplate | DISPATCH-QCS1 | $(basename $PROJECT) | $PROMPT" \
  >> ~/auset-brain/Swarms/live-feed.md
```

---

## Parallel Dispatch (Multiple Herus)

For `--parallel`, each Heru gets its own pane. Max 6 concurrent agents on QCS1:

```bash
for PROJECT in $TARGET_PROJECTS; do
  tmux split-window -t "swarm:$WINDOW" -h
  PANE=$(tmux display-message -t "swarm:$WINDOW" -p "#{pane_id}")
  CMD="ssh -t quik-cloud 'cursor agent -p --yolo --workspace \"$PROJECT\" \"$PROMPT\"'"
  tmux send-keys -t "$PANE" "$CMD" Enter
done
tmux select-layout -t "swarm:$WINDOW" tiled
```

---

## Output

Mo sees the live SSH output in each c-swarm pane. Cursor agent prints its progress as it works — file changes, tool calls, summaries. Panes stay open after completion.

---

## Prompt File Dispatch

To dispatch using a saved prompt file:

```
/dispatch-qcs1 --heru quiknation --prompt-file /path/to/01-quik-nation-voice-studio.md
```

This reads the file and passes its content as the agent prompt.

---

## Related
- `/dispatch-local` — Quick tasks on Mo's machine
- `/dispatch-aws` — EC2 agents for deployments and infra
- `/dispatch-team` — Send directives to running Claude Code swarm sessions
