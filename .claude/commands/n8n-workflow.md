# /n8n-workflow — Build & Deploy n8n Workflows from Natural Language

## Usage

```
/n8n-workflow "<description of the automation you want>"
```

### Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--activate` | Auto-activate the workflow after import | Off (imported as inactive) |
| `--project <name>` | Tag the workflow with a project name (e.g., `qcr`, `wcr`, `fmo`) | None |
| `--dry-run` | Generate and display the workflow JSON without importing to QCS1 | Off |

### Examples

```
/n8n-workflow "When a GitHub PR is opened on QCR, run tests and post result to Slack"
/n8n-workflow "Every morning at 9am ET, check farm-1 and farm-2 health and post summary to #maat-agents" --activate
/n8n-workflow "When a webhook receives a Heru Feedback report, save to S3 and notify #maat-discuss" --project quiknation
/n8n-workflow "Cron every 5 min: check pending tasks in tasks/pending/, dispatch to build farm" --dry-run
```

---

## Execution Steps

### Step 1: Parse the Request

Extract from the user's natural language description:
- **Trigger type** — Webhook, Cron/Schedule, GitHub event, Manual, or other
- **Actions** — What happens (HTTP calls, code execution, Slack posts, file ops, etc.)
- **Conditions** — Any branching logic (IF/Switch nodes)
- **Error handling** — What to do on failure (default: post to Slack #maat-agents)
- **Project tag** — From `--project` flag or inferred from description

### Step 2: Load Skill Knowledge

Read the n8n automation skill for node schemas, credential patterns, and best practices:

```bash
cat /Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate/.claude/skills/n8n-automation/SKILL.md
```

### Step 3: Build the Workflow JSON

Construct a valid n8n workflow JSON following these rules:

1. **Every workflow MUST have an Error Trigger node** that posts failures to Slack #maat-agents
2. **Credentials are referenced by name** — NEVER embed secrets in the JSON
3. **Use descriptive node names** — `Check PR Status` not `HTTP Request 1`
4. **Set retry on failure** for all HTTP Request nodes (3 retries, 5s wait)
5. **Include workflow-level settings**: `executionOrder: "v1"`, `timezone: "America/New_York"`
6. **Tag with project name** if `--project` flag is set or project is mentioned

Apply the workflow name format: `[Project] Description` (e.g., `[QCR] PR Test Runner`)

### Step 4: Validate the JSON

Before importing, validate:
- [ ] All node `type` values are valid n8n node types
- [ ] All connections reference existing node names
- [ ] Trigger node exists (exactly one entry point)
- [ ] Error Trigger node exists with Slack notification
- [ ] No hardcoded secrets or tokens in the JSON
- [ ] Credential references match expected credential names on QCS1

### Step 5: Write to Temp File

```bash
WORKFLOW_FILE="/tmp/n8n-workflow-$(date +%s).json"
cat > "$WORKFLOW_FILE" << 'WORKFLOW_EOF'
<generated JSON here>
WORKFLOW_EOF
```

### Step 6: Handle --dry-run

If `--dry-run` is set:
- Display the full workflow JSON with syntax highlighting
- Show a summary: node count, trigger type, actions, error handling
- Print the command that WOULD be run to import
- **STOP HERE** — do not SSH or import

### Step 7: Import to QCS1

Fetch the SSH key and import:

```bash
# Fetch SSH key from SSM (NEVER use local keys)
QC_KEY_CONTENT=$(aws ssm get-parameter \
  --name "/quik-nation/quik-cloud/ssh-key" \
  --with-decryption \
  --query 'Parameter.Value' \
  --output text \
  --region us-east-1)

# Write key to temp file
QC_KEY_FILE="/tmp/qc-ssh-key-$(date +%s).pem"
echo "$QC_KEY_CONTENT" > "$QC_KEY_FILE"
chmod 600 "$QC_KEY_FILE"

# Copy workflow JSON to QCS1
scp -i "$QC_KEY_FILE" -o StrictHostKeyChecking=no \
  "$WORKFLOW_FILE" ayoungboy@100.113.53.80:/tmp/

# Import the workflow
ssh -i "$QC_KEY_FILE" -o StrictHostKeyChecking=no \
  ayoungboy@100.113.53.80 \
  "cd /tmp && n8n import:workflow --input=$(basename $WORKFLOW_FILE)"

# Clean up local temp files
rm -f "$QC_KEY_FILE" "$WORKFLOW_FILE"
```

### Step 8: Handle --activate

If `--activate` is set, activate the workflow after import:

```bash
# Get the workflow ID from import output or list
ssh -i "$QC_KEY_FILE" -o StrictHostKeyChecking=no \
  ayoungboy@100.113.53.80 \
  "n8n update:workflow --id=<WORKFLOW_ID> --active=true"
```

If the workflow ID cannot be determined from import output, list recent workflows:

```bash
ssh -i "$QC_KEY_FILE" -o StrictHostKeyChecking=no \
  ayoungboy@100.113.53.80 \
  "n8n list:workflow"
```

### Step 9: Confirm

Print a summary to the user:

```
n8n Workflow Deployed to QCS1

  Name:       [QCR] PR Test Runner
  Trigger:    GitHub PR Opened
  Nodes:      5 (Trigger -> Check -> Run Tests -> IF Pass -> Slack)
  Error:      Failures post to #maat-agents
  Status:     Imported (inactive)  OR  Active
  Project:    qcr

  To activate later:
    ssh quik-cloud "n8n update:workflow --id=<ID> --active=true"

  To test manually:
    ssh quik-cloud "n8n execute:workflow --id=<ID>"

  To view executions:
    ssh quik-cloud "n8n list:workflow"
    Or open: http://100.113.53.80:5678
```

---

## QCS1 Connection Reference

| Field | Value |
|-------|-------|
| Host | `ayoungboy@100.113.53.80` (Tailscale) |
| SSH Key | SSM `/quik-nation/quik-cloud/ssh-key` |
| n8n URL | `http://100.113.53.80:5678` |
| n8n CLI | `/usr/local/bin/n8n` or `npx n8n` |
| Timezone | `America/New_York` |

## Credential Names on QCS1

When building workflows, reference these credential names (must be pre-configured in n8n):

| Credential Name | Service | Notes |
|----------------|---------|-------|
| `github-quiknation` | GitHub | Quik Nation org PAT |
| `slack-maat-bot` | Slack | Maat bot token |
| `aws-quiknation` | AWS | Platform AWS credentials |
| `ssh-farm-1` | SSH | Build farm 1 access |
| `ssh-farm-2` | SSH | Build farm 2 access |

> If a credential doesn't exist yet, tell the user to create it in the n8n UI at `http://100.113.53.80:5678` before activating the workflow.

## Error Handling

- If SSM parameter fetch fails: check AWS CLI auth (`aws sts get-caller-identity`)
- If SSH connection fails: verify Tailscale is connected (`tailscale status`)
- If n8n import fails: check n8n is running on QCS1 (`ssh quik-cloud "pgrep -f n8n"`)
- If workflow JSON is invalid: re-read the skill knowledge and fix schema issues
