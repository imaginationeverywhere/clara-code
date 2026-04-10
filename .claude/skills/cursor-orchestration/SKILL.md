---
name: cursor-orchestration
description: Patterns for orchestrating Cursor Agent CLI from Claude Code. Prompt engineering, parallel dispatch, result collection, and review workflows.
---

# Cursor Orchestration Skill

Reusable patterns for dispatching work to Cursor Agent CLI, collecting results, and reviewing output.

## Cursor Agent CLI Reference

```bash
# Basic non-interactive dispatch
cursor agent --print --trust --force --workspace <path> "<prompt>"

# Plan mode (read-only, no changes)
cursor agent --print --trust --mode plan --workspace <path> "<prompt>"

# Ask mode (Q&A, no changes)
cursor agent --print --trust --mode ask --workspace <path> "<prompt>"

# With specific model
cursor agent --print --trust --force --model sonnet-4 --workspace <path> "<prompt>"

# Resume previous session
cursor agent --print --trust --continue --workspace <path>
```

### Key Flags
| Flag | Purpose |
|------|---------|
| `--print` | Non-interactive output (required for scripting) |
| `--trust` | Trust workspace without prompting |
| `--force` / `--yolo` | Auto-approve all tool calls |
| `--mode plan` | Read-only analysis |
| `--mode ask` | Q&A, no file changes |
| `--model <m>` | Choose model (auto, sonnet-4, gpt-5.2, gpt-5.3-codex) |
| `--workspace <p>` | Target project directory |

### Available Models
- `auto` — Cursor picks the best model (default)
- `sonnet-4` — Claude Sonnet 4
- `gpt-5.2` — GPT-5.2
- `gpt-5.3-codex` — GPT-5.3 Codex (best for code gen)
- `gpt-5.3-codex-high` — Higher quality, slower

## Prompt Templates

### Scaffold Feature
```
Scaffold a {FEATURE_NAME} feature for this project.

Create:
1. GraphQL schema types and mutations in backend/src/graphql/
2. Resolvers with auth guards in backend/src/resolvers/
3. Service class with business logic in backend/src/services/
4. Database migration if new tables needed

Follow the existing patterns in this project. Use TypeScript strictly.
List all files created when done.
```

### Add API Endpoint
```
Add a {METHOD} {PATH} endpoint that {DESCRIPTION}.

Requirements:
- Add route handler in backend/src/routes/
- Add validation using the project's validation patterns
- Add auth middleware if this endpoint requires authentication
- Add TypeScript types for request/response
- Follow existing error handling patterns
```

### Fix From Review
```
Fix the following code review issues:

{REVIEW_ISSUES}

Only modify the files mentioned. Do not refactor surrounding code.
List each fix applied.
```

### Mass Update Pattern
```
In this project, find all files matching {PATTERN} and update them to {CHANGE}.

Examples of what to change:
- Before: {BEFORE_EXAMPLE}
- After: {AFTER_EXAMPLE}

Do not modify files in .claude/, .cursor/, or node_modules/.
List all files modified.
```

## Parallel Dispatch Patterns

### Same Task, Multiple Herus
```bash
PROMPT="Add health check endpoint at GET /api/health"
HERUS=("quikcarrental" "quikvibes" "site962")

for HERU in "${HERUS[@]}"; do
  PROJECT=$(find /Volumes/X10-Pro/Native-Projects -maxdepth 3 -type d -name "$HERU" | head -1)
  cursor agent --print --trust --force --workspace "$PROJECT" "$PROMPT" \
    > "/tmp/dispatch-$HERU.log" 2>&1 &
done
wait

# Collect results
for HERU in "${HERUS[@]}"; do
  echo "=== $HERU ==="
  tail -20 "/tmp/dispatch-$HERU.log"
done
```

### Different Tasks, Different Herus
```bash
declare -A TASKS
TASKS["quikcarrental"]="Add vehicle image upload endpoint"
TASKS["site962"]="Add event check-in QR code generator"
TASKS["quikvibes"]="Add playlist sharing feature"

for HERU in "${!TASKS[@]}"; do
  PROJECT=$(find /Volumes/X10-Pro/Native-Projects -maxdepth 3 -type d -name "$HERU" | head -1)
  cursor agent --print --trust --force --workspace "$PROJECT" "${TASKS[$HERU]}" \
    > "/tmp/dispatch-$HERU.log" 2>&1 &
done
wait
```

### Sequential Tasks, Same Project
```bash
PROJECT="/Volumes/X10-Pro/Native-Projects/Quik-Nation/quikcarrental"

cursor agent --print --trust --force --workspace "$PROJECT" \
  "Step 1: Create the database migration for bookings table"

cursor agent --print --trust --force --workspace "$PROJECT" \
  "Step 2: Create the GraphQL schema and resolvers for bookings"

cursor agent --print --trust --force --workspace "$PROJECT" \
  "Step 3: Add the booking service with business logic"
```

## Result Collection Pattern

```bash
# After parallel dispatch completes
for LOG in /tmp/dispatch-*.log; do
  HERU=$(basename "$LOG" .log | sed 's/dispatch-//')
  EXIT_CODE=$(grep -c "Error\|error\|FAILED\|failed" "$LOG")

  if [ "$EXIT_CODE" -eq 0 ]; then
    echo "$HERU: SUCCESS"
  else
    echo "$HERU: ISSUES DETECTED — review needed"
  fi
done
```

## Review After Dispatch

```bash
# Show what changed in each project
for PROJECT in "${TARGET_PROJECTS[@]}"; do
  HERU=$(basename "$PROJECT")
  echo "=== $HERU ==="
  cd "$PROJECT"
  git diff --stat
  echo ""
done
```

## Cost Comparison

| Approach | Claude Max Messages | Cursor Ultra | Total Time |
|----------|-------------------|--------------|------------|
| Everything in Claude Code | 10-15 per feature | 0 | Serial |
| Claude plans + Cursor builds | 2-3 per feature | Unlimited | Parallel |
| **Savings** | **70-80% fewer messages** | **$0 extra** | **3-5x faster** |
