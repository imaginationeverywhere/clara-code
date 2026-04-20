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
Binary:   ~/.local/bin/cursor-agent  (also: ~/.local/bin/agent symlink)
```

---

## Keychain Prerequisite (AUTOMATIC — non-negotiable)

QCS1's macOS **login keychain auto-locks after idle time**. Non-interactive SSH sessions start with a locked keychain, which makes `cursor-agent` fail immediately with:

```
Error: Your macOS login keychain is locked.
Run security unlock-keychain and try again.
```

**Every dispatch MUST unlock the keychain inline within the same SSH session that runs cursor-agent** — unlock state does NOT persist across separate SSH sessions (each is a new security context on macOS).

### Prerequisites (run once at dispatch start)

```bash
# Fetch QCS1 login password from SSM (local machine only — QCS1 has no AWS CLI)
QC1_PASS=$(aws ssm get-parameter \
  --name "/quik-nation/quik-cloud/login-password" \
  --with-decryption \
  --query 'Parameter.Value' \
  --output text \
  --region us-east-1)

if [ -z "$QC1_PASS" ]; then
  echo "ERROR: Failed to fetch QCS1 password from SSM. Check /quik-nation/quik-cloud/login-password exists."
  exit 1
fi
```

### Build the composite SSH command

Every `cursor-agent` invocation must be prefixed with `security unlock-keychain` **in the same SSH payload**:

```bash
UNLOCK="security unlock-keychain -p '$QC1_PASS' ~/Library/Keychains/login.keychain-db 2>/dev/null"
PARTITION="security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k '$QC1_PASS' ~/Library/Keychains/login.keychain-db 2>/dev/null"
AGENT_CMD="$UNLOCK && $PARTITION && cd '$PROJECT' && ~/.local/bin/cursor-agent -p --force --trust $MODEL_FLAG $WORKTREE_FLAGS '$PROMPT'"
```

The `set-key-partition-list` step prevents `errSecInternalComponent` on any codesign operations the agent may trigger (matters for mobile builds). Harmless overhead for non-mobile tasks.

**Never** run `security unlock-keychain` in a separate SSH session expecting it to persist — it will not. Bundle it with the cursor-agent command every time.

### Reference
- Full context: `~/auset-brain/Feedback/feedback-qc1-keychain-partition-list.md`
- Password SSM key: `/quik-nation/quik-cloud/login-password` (SecureString, us-east-1)

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

The `-t` flag allocates a pseudo-TTY so Mo sees the output in real-time. **The keychain unlock MUST be bundled into the same SSH payload** (see Keychain Prerequisite section above):

```bash
# Fetch password once per dispatch batch
QC1_PASS=$(aws ssm get-parameter --name "/quik-nation/quik-cloud/login-password" \
  --with-decryption --query 'Parameter.Value' --output text --region us-east-1)

# Compose the remote command: unlock → cd → cursor-agent
REMOTE="security unlock-keychain -p '$QC1_PASS' ~/Library/Keychains/login.keychain-db 2>/dev/null && \
security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k '$QC1_PASS' ~/Library/Keychains/login.keychain-db 2>/dev/null && \
cd '$PROJECT' && \
~/.local/bin/cursor-agent -p --force --trust --model $MODEL --worktree $WORKTREE_NAME --worktree-base $BASE_BRANCH '$PROMPT'"

# Send to the tmux pane (Mo watches it run)
CMD="ssh -t quik-cloud \"$REMOTE\""
tmux send-keys -t "$PANE" "$CMD" Enter
```

**Default model:** `--model auto` (Cursor Ultra unlimited pool). Use named models (`claude-4.6-sonnet-medium`, `claude-opus-4-7-high`, etc.) only when the task specifically needs a premium model.

**Binary path:** Always `~/.local/bin/cursor-agent` (non-interactive SSH does not load `~/.zshrc`, so bare `cursor-agent` will not be in PATH).

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
