# /dispatch-aws — Run Agent on AWS EC2

**Target:** AWS EC2 instances — dev or prod backends, infra tasks
**Visibility:** Opens a c-swarm pane with a live SSH/SSM session — Mo watches the agent work in real-time
**Use for:** Backend deployments, database migrations, EC2 config, tasks that need to run close to the AWS infrastructure.

---

## Usage

```
/dispatch-aws "<task>" --heru <name>
/dispatch-aws "<task>" --heru fmo
/dispatch-aws "<task>" --instance i-0abc123 --region us-east-1
/dispatch-aws "<task>" --heru wcr --env prod
```

## Arguments
- `<task>` (required) — What to do on the EC2 instance
- `--heru <name>` — Target Heru (looks up its EC2 instance from SSM or registry)
- `--instance <id>` — EC2 instance ID directly
- `--env dev|prod` — Environment (default: dev)
- `--region <region>` — AWS region (default: us-east-1)
- `--dry-run` — Print the SSH command without executing

---

## Heru → EC2 Instance Registry

Instance IDs stored in SSM at `/quik-nation/<heru>/EC2_INSTANCE_ID`:

| Heru | SSM Path | Env |
|------|----------|-----|
| FMO | `/quik-nation/fmo/EC2_INSTANCE_ID` | dev/prod |
| WCR | `/quik-nation/wcr/EC2_INSTANCE_ID` | dev/prod |
| QCR | `/quik-nation/qcr/EC2_INSTANCE_ID` | dev/prod |
| QN | `/quik-nation/qn/EC2_INSTANCE_ID` | dev/prod |

---

## How It Works

### Step 1: Resolve Instance ID

```bash
# Look up instance from SSM
INSTANCE_ID=$(aws ssm get-parameter \
  --name "/quik-nation/$HERU/EC2_INSTANCE_ID" \
  --query 'Parameter.Value' --output text --region "$REGION")
```

### Step 2: Open a c-swarm Pane

```bash
# Find or create c-swarm window
WINDOW=$(tmux list-windows -t swarm -F "#{window_name}" 2>/dev/null | grep "c-swarm" | tail -1)
if [ -z "$WINDOW" ]; then
  tmux new-window -t swarm: -n "c-swarm-aws"
  WINDOW="c-swarm-aws"
fi

# Split a new pane
tmux split-window -t "swarm:$WINDOW" -h
PANE=$(tmux display-message -t "swarm:$WINDOW" -p "#{pane_id}")
```

### Step 3: SSH into EC2 via SSM (No Bastion Needed)

```bash
# Primary: AWS SSM Session Manager (no SSH key required, works from any machine)
CMD="aws ssm start-session --target $INSTANCE_ID --region $REGION"
tmux send-keys -t "$PANE" "$CMD" Enter

# After session opens, run the task:
sleep 2
tmux send-keys -t "$PANE" "cd /app && $TASK" Enter
```

**Alternative: Direct SSH** (if SSM is unavailable):
```bash
# Get public IP from EC2
IP=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
CMD="ssh -t ec2-user@$IP '$TASK'"
tmux send-keys -t "$PANE" "$CMD" Enter
```

### Step 4: Log to Live Feed

```bash
echo "$(date '+%H:%M:%S') | quik-nation-ai-boilerplate | DISPATCH-AWS | $HERU ($ENV) | $INSTANCE_ID | $TASK" \
  >> ~/auset-brain/Swarms/live-feed.md
```

---

## Common AWS Task Patterns

### Run database migration:
```
/dispatch-aws "cd /app && npm run db:migrate" --heru fmo --env dev
```

### Restart a service:
```
/dispatch-aws "pm2 restart fmo-backend" --heru fmo --env prod
```

### Pull latest deploy and restart:
```
/dispatch-aws "cd /app && git pull && npm run build && pm2 restart all" --heru wcr --env dev
```

### Check logs:
```
/dispatch-aws "pm2 logs --lines 100" --heru fmo --env prod
```

---

## Output

Mo sees the live SSM/SSH session output in the c-swarm pane. The session stays open after the task completes — Mo can run follow-up commands manually if needed.

---

## Related
- `/dispatch-local` — Quick tasks on Mo's machine
- `/dispatch-qcs1` — PRIMARY build target (Cursor agents, iOS/Android, heavy builds)
- `/dispatch-team` — Send directives to running Claude Code swarm sessions
