# dispatch-cursor - Remote Control Cursor Agent from Claude Code

Dispatch tasks to Cursor Agent CLI without opening the IDE. Claude Code thinks, Cursor Agent builds. Save Max plan messages for architecture — let Cursor Ultra handle the scaffolding.

**Agent:** `cursor-orchestrator`
**Skill:** `cursor-orchestration`

**Why this matters:**
- Cursor Ultra = unlimited usage, Claude Max = hourly/weekly limits
- No IDE open = saves CPU/RAM (Cursor GUI eats ~1GB+ RAM)
- Claude Code orchestrates, Cursor Agent executes — parallel across Herus
- One brain (Opus), many hands (Cursor agents)

## Usage
```
/dispatch-cursor "Add CRUD resolvers for the booking feature"
/dispatch-cursor --heru quikcarrental "Scaffold the vehicle listing API"
/dispatch-cursor --all-herus "Add the auth middleware from .claude/plans/micro/16-auset-activation.md"
/dispatch-cursor --plan "What needs to change to add WebSocket support?"
/dispatch-cursor --model sonnet-4 "Generate test files for all resolvers"
/dispatch-cursor --parallel --herus quikcarrental,quikvibes,site962 "Add Clerk auth guards"
/dispatch-cursor --cloud "Heavy task that should run on Cursor's cloud VMs"
```

## Arguments
- `<prompt>` (required) — The task to send to Cursor Agent
- `--heru <name>` — Target a specific Heru project by name (fuzzy matched)
- `--herus <name1,name2,...>` — Target multiple specific Herus (comma-separated)
- `--all-herus` — Dispatch to ALL Heru projects (use with caution)
- `--plan` — Read-only mode: Cursor analyzes but makes no changes
- `--ask` — Q&A mode: Cursor answers questions about the codebase
- `--model <model>` — Cursor model to use (default: auto). **Both `auto` and `composer` are free with Cursor Ultra.** Only use premium models (sonnet-4, gpt-5.2) if explicitly requested.
- `--force` — Auto-approve all Cursor tool calls (no permission prompts)
- `--yolo` — Alias for --force
- `--parallel` — Run multiple Herus simultaneously (default for --all-herus)
- `--sequential` — Run Herus one at a time (safer, see output as it goes)
- `--context <file>` — Pass a file as additional context (e.g., a plan or spec)
- `--dry-run` — Show the command that would execute without running it
- `--background` — Run in background, report results when done
- `--cloud` — Run on Cursor's cloud VMs (zero local RAM, uses Cursor Ultra credits)
- `--auto-cloud` — Automatically switch to cloud when memory is low or agent limit hit
- `--test` — Shorthand: auto-enables `--cloud` + wraps prompt with test execution instructions
- `--test-smoke` — Run smoke tests on cloud (5-10 min)
- `--test-regression` — Run regression suite on cloud (20-30 min)
- `--test-e2e` — Run Playwright E2E tests on cloud
- `--test-unit` — Run unit tests on cloud
- `--test-all` — Run full test suite (type-check + lint + unit + E2E) on cloud
- `--max-parallel <n>` — Override max parallel agent limit (default: 4)
- `--skip-safety` — Bypass memory/agent safety checks (use at your own risk)

## CRITICAL: Memory Safety Checks (Prevents Kernel Panics)

**Before EVERY dispatch, you MUST run these checks. This is NON-NEGOTIABLE.**

### Pre-Flight Safety Check

Before dispatching any agent, run this check:

```bash
# 1. Get memory pressure
FREE_PCT=$(memory_pressure 2>/dev/null | grep "free percentage" | grep -o '[0-9]*')

# 2. Count running Cursor agents (local only, not cloud)
AGENT_COUNT=$(pgrep -fc "cursor.*agent" 2>/dev/null || echo "0")

# 3. Get max parallel limit (default 4)
MAX_AGENTS=${MAX_PARALLEL:-4}
```

### Decision Matrix

| Memory Free | Agents Running | Action |
|-------------|---------------|--------|
| >= 40% | < MAX_AGENTS | DISPATCH locally |
| >= 40% | >= MAX_AGENTS | BLOCK or switch to --cloud |
| 30-39% | < MAX_AGENTS | WARN + dispatch locally |
| 30-39% | >= MAX_AGENTS | BLOCK or switch to --cloud |
| < 30% | any | REFUSE local. Cloud only or wait. |

### Safety Check Implementation

```bash
# Run BEFORE every dispatch
if [ "$SKIP_SAFETY" != "true" ]; then
    FREE_PCT=$(memory_pressure 2>/dev/null | grep "free percentage" | grep -o '[0-9]*')
    AGENT_COUNT=$(pgrep -fc "cursor.*agent" 2>/dev/null || echo "0")
    MAX_AGENTS=${MAX_PARALLEL:-4}

    # REFUSE: Memory critical
    if [ -n "$FREE_PCT" ] && [ "$FREE_PCT" -lt 30 ]; then
        echo "BLOCKED: Memory at ${FREE_PCT}% free (critical). Cannot dispatch locally."
        echo "Options: --cloud (run on Cursor cloud VMs) or wait for agents to finish."
        echo "Running agents: ${AGENT_COUNT}"
        echo "Kill all agents: pkill -f 'cursor.*agent'"
        if [ "$AUTO_CLOUD" = "true" ] || [ "$CLOUD" = "true" ]; then
            echo "Auto-switching to CLOUD mode..."
            CLOUD=true
        else
            exit 1  # Block the dispatch
        fi
    fi

    # BLOCK: Too many agents
    if [ "$AGENT_COUNT" -ge "$MAX_AGENTS" ] && [ "$CLOUD" != "true" ]; then
        echo "BLOCKED: ${AGENT_COUNT} agents running (max: ${MAX_AGENTS})."
        echo "Options: --cloud, wait, or kill agents: pkill -f 'cursor.*agent'"
        if [ "$AUTO_CLOUD" = "true" ]; then
            echo "Auto-switching to CLOUD mode..."
            CLOUD=true
        else
            exit 1  # Block the dispatch
        fi
    fi

    # WARN: Memory getting low
    if [ -n "$FREE_PCT" ] && [ "$FREE_PCT" -lt 40 ]; then
        echo "WARNING: Memory at ${FREE_PCT}% free. Dispatching but monitor closely."
        echo "Running agents: ${AGENT_COUNT}/${MAX_AGENTS}"
    fi

    # INFO: Show status
    echo "Memory: ${FREE_PCT}% free | Agents: ${AGENT_COUNT}/${MAX_AGENTS} | Mode: $([ "$CLOUD" = "true" ] && echo "CLOUD" || echo "LOCAL")"
fi
```

### Safety Check Output Examples

```
# Healthy dispatch
Memory: 72% free | Agents: 1/4 | Mode: LOCAL
Dispatching to quikcarrental...

# Warning but allowed
WARNING: Memory at 35% free. Dispatching but monitor closely.
Running agents: 3/4
Memory: 35% free | Agents: 3/4 | Mode: LOCAL
Dispatching to quikcarrental...

# Blocked - too many agents
BLOCKED: 4 agents running (max: 4).
Options: --cloud, wait, or kill agents: pkill -f 'cursor.*agent'

# Blocked - memory critical (auto-cloud enabled)
BLOCKED: Memory at 22% free (critical). Cannot dispatch locally.
Auto-switching to CLOUD mode...
Memory: 22% free | Agents: 3/4 | Mode: CLOUD
Dispatching to quikcarrental (CLOUD)...

# Blocked - memory critical (no auto-cloud)
BLOCKED: Memory at 22% free (critical). Cannot dispatch locally.
Options: --cloud (run on Cursor cloud VMs) or wait for agents to finish.
Running agents: 5
Kill all agents: pkill -f 'cursor.*agent'
```

## Cloud Agents (Zero Local RAM)

Cursor Cloud Agents run on Cursor's cloud VMs instead of your local machine. With Cursor Ultra, the usage is covered by your plan.

### When Cloud Mode Activates
- `--cloud` flag is passed explicitly
- `--auto-cloud` is set AND memory < 30% OR agents >= MAX_AGENTS
- System detects critical memory pressure during pre-flight check

### Cloud Agent Requirements
- GitHub repo connected to Cursor (read-write permissions)
- Cursor Privacy Mode must be OFF
- Cursor Pro/Pro+/Ultra subscription

### Cloud Agent Behavior
- Runs in isolated Ubuntu VM on AWS (zero local RAM/CPU)
- Clones your repo from GitHub, works on a separate branch
- Pushes results as a branch/PR (not applied to local filesystem directly)
- Has internet access (can install packages, run tests)
- Uses Max Mode pricing (20% surcharge, covered by Ultra)

### Cloud Command Format
```bash
# Cloud dispatch (adds --cloud / -c flag)
cursor agent --cloud --print --trust --force --workspace "$PROJECT" "$ENHANCED_PROMPT"
```

### Cloud vs Local Comparison

| Aspect | Local Agent | Cloud Agent |
|--------|------------|-------------|
| RAM Usage | ~800MB-1.2GB each | Zero |
| Speed | Faster (no clone) | Slower (clones repo) |
| File Access | Direct local files | GitHub clone |
| Results | Applied locally | Pushed to branch |
| Internet | Your network | Cursor's network |
| Max Parallel | 4 (32GB limit) | 10+ (no local limit) |
| Best For | Quick fixes, small tasks | Heavy tasks, many parallel |

### Recommended Strategy
```
LOCAL agents (1-4):   Quick fixes, features, scaffolding, code changes
CLOUD agents (no limit): Testing (unit, regression, smoke, E2E), CI validation, linting
```

### Testing on Cloud (Primary Use Case)

Cloud agents are ideal for testing because:
- Tests are **long-running** (5-60+ minutes) — don't tie up your Mac
- Tests are **CPU/memory heavy** — offload to Cursor's VMs
- Tests are **read-only** — they validate code, not modify it
- Tests can run in **parallel** — 10+ test suites simultaneously across Herus
- Results come back as **logs/reports** — no local filesystem changes needed

```bash
# Run smoke tests on cloud (5-10 min, zero local impact)
/dispatch-cursor --cloud --heru quikcarrental "Run smoke tests: npm run test:smoke"

# Run full regression suite on cloud (20-30 min)
/dispatch-cursor --cloud --heru site962 "Run regression tests: npm run test:regression. Report all failures."

# Run E2E tests on cloud
/dispatch-cursor --cloud --heru dreamihaircare "Run Playwright E2E tests: npx playwright test. Report results."

# Run unit tests across ALL Herus simultaneously on cloud
/dispatch-cursor --cloud --all-herus "Run unit tests: npm test. Report pass/fail count and any failures."

# Run type-check + lint + test on cloud before deployment
/dispatch-cursor --cloud --heru quikcarrental \
  "Run full validation: npm run type-check && npm run lint && npm run test. Report all results."
```

### The Split: Local Builds, Cloud Tests
```
YOU (local):  /dispatch-cursor "Add the booking feature"     → Cursor agent writes code locally
CLOUD:        /dispatch-cursor --cloud "Run all tests"        → Cloud VM validates the code
YOU (local):  /dispatch-cursor "Fix the 3 test failures"     → Cursor agent fixes locally
CLOUD:        /dispatch-cursor --cloud "Re-run failed tests"  → Cloud VM confirms the fix
```

## How It Works

### Step 1: Pre-Flight Safety Check

**ALWAYS run the safety check first.** See "Memory Safety Checks" section above.

### Step 2: Resolve Target Project(s)

If `--heru <name>` is provided, fuzzy-match against discovered Heru projects.

**CRITICAL: Only discover ROOT-LEVEL `.claude/` directories.** Filter out nested `.claude/` dirs (e.g., `frontend/.claude/`, `mobile/.claude/`) by checking that the `.claude` parent matches the git root:
```bash
# Discover all Herus (root-level .claude only)
HERUS=$(find /Volumes/X10-Pro/Native-Projects -maxdepth 4 -name ".claude" -type d 2>/dev/null \
  | grep -v node_modules | grep -v ".git/" | grep -v quik-nation-ai-boilerplate \
  | while read DIR; do
    P=$(dirname "$DIR"); GR=$(cd "$P" && git rev-parse --show-toplevel 2>/dev/null)
    [ -n "$GR" ] && [ "$P" = "$GR" ] && echo "$DIR"
  done)

# Fuzzy match: "quikcar" matches "quikcarrental"
MATCH=$(echo "$HERUS" | grep -i "$HERU_NAME" | head -1)
PROJECT=$(dirname "$MATCH")
```

If no `--heru` flag, use the current working directory.

### Step 3: Handle Test Flags (Auto-Cloud)

Any `--test*` flag automatically enables cloud mode since tests are long-running:

```bash
# Test flags auto-enable cloud mode
if [ "$TEST" = "true" ] || [ -n "$TEST_TYPE" ]; then
  CLOUD=true

  # Build test-specific prompt wrapper
  case "$TEST_TYPE" in
    smoke)      TEST_CMD="npm run test:smoke" ;;
    regression) TEST_CMD="npm run test:regression" ;;
    e2e)        TEST_CMD="npx playwright test" ;;
    unit)       TEST_CMD="npm test" ;;
    all)        TEST_CMD="npm run type-check && npm run lint && npm test && npx playwright test" ;;
    *)          TEST_CMD="npm test" ;;
  esac

  # Wrap the prompt with test execution instructions
  ENHANCED_PROMPT="Run the following tests and report results:
Command: ${TEST_CMD}
${PROMPT:+Additional context: $PROMPT}

Report format:
- Total tests: X
- Passed: X
- Failed: X (list each failure with file and reason)
- Skipped: X
- Duration: X seconds
If tests fail, analyze the failures and suggest fixes."
fi
```

### Step 4: Build the Cursor Agent Command

```bash
# Base command
CMD="cursor agent --print --trust"

# Add cloud flag if cloud mode is active
if [ "$CLOUD" = "true" ]; then
  CMD="$CMD --cloud"
fi

# Add workspace
CMD="$CMD --workspace $PROJECT"

# Both auto and composer are free with Cursor Ultra — default to auto
# Only premium models (sonnet-4, gpt-5.2) cost extra
MODEL="${MODEL:-auto}"
CMD="$CMD --model $MODEL"

# Add mode if specified
if [ "$MODE" = "plan" ]; then
  CMD="$CMD --mode plan"
elif [ "$MODE" = "ask" ]; then
  CMD="$CMD --mode ask"
fi

# Add force if specified
if [ "$FORCE" = true ]; then
  CMD="$CMD --force"
fi

# Add the prompt
CMD="$CMD \"$PROMPT\""
```

### Step 3: Enhance the Prompt

Before dispatching, Claude Code enhances the raw prompt with context:

```
You are working on the {HERU_NAME} project, a Heru born from the Auset Platform.

TASK: {USER_PROMPT}

CONTEXT:
- This project uses the Quik Nation AI Boilerplate conventions
- Read CLAUDE.md for project-specific instructions
- Read .claude/commands/ for available workflows
- Follow Kemetic naming conventions (see CLAUDE.md)
{OPTIONAL: Contents of --context file}

CONSTRAINTS:
- Only modify files relevant to the task
- Follow existing code patterns in the project
- Do not modify .claude/ or .cursor/ directories (those are synced from boilerplate)
```

### Step 5: Execute

**Single Heru (local):**
```bash
cursor agent --print --trust --force --workspace "$PROJECT" "$ENHANCED_PROMPT"
```

**Single Heru (cloud):**
```bash
cursor agent --cloud --print --trust --force --workspace "$PROJECT" "$ENHANCED_PROMPT"
```

**Multiple Herus (parallel — respects MAX_AGENTS limit):**
```bash
MAX_AGENTS=${MAX_PARALLEL:-4}
DISPATCHED=0

for PROJECT in $TARGET_PROJECTS; do
  # Re-check agent count before each dispatch
  AGENT_COUNT=$(pgrep -fc "cursor.*agent" 2>/dev/null || echo "0")

  if [ "$CLOUD" = "true" ]; then
    # Cloud mode: no local limit
    cursor agent --cloud --print --trust --force --workspace "$PROJECT" "$ENHANCED_PROMPT" \
      > "/tmp/dispatch-$(basename $PROJECT).log" 2>&1 &
    DISPATCHED=$((DISPATCHED + 1))
  elif [ "$AGENT_COUNT" -lt "$MAX_AGENTS" ]; then
    # Local mode: respect agent limit
    cursor agent --print --trust --force --workspace "$PROJECT" "$ENHANCED_PROMPT" \
      > "/tmp/dispatch-$(basename $PROJECT).log" 2>&1 &
    DISPATCHED=$((DISPATCHED + 1))
  else
    echo "QUEUED: $(basename $PROJECT) — waiting for agent slot (${AGENT_COUNT}/${MAX_AGENTS} running)"
    # Wait for any agent to finish, then dispatch
    wait -n 2>/dev/null
    cursor agent --print --trust --force --workspace "$PROJECT" "$ENHANCED_PROMPT" \
      > "/tmp/dispatch-$(basename $PROJECT).log" 2>&1 &
    DISPATCHED=$((DISPATCHED + 1))
  fi
done
wait
echo "All ${DISPATCHED} agents completed."
```

**Multiple Herus (sequential):**
```bash
for PROJECT in $TARGET_PROJECTS; do
  echo "=== Dispatching to $(basename $PROJECT) ==="
  if [ "$CLOUD" = "true" ]; then
    cursor agent --cloud --print --trust --force --workspace "$PROJECT" "$ENHANCED_PROMPT"
  else
    cursor agent --print --trust --force --workspace "$PROJECT" "$ENHANCED_PROMPT"
  fi
done
```

### Step 5: Collect and Report Results + Slack Notification

After EVERY agent completes, post to #maat-agents using the notify script:

```bash
# On dispatch:
bash .claude/scripts/notify-agent-done.sh "<Project Name>" "working" "<what the agent is doing>"

# On completion:
bash .claude/scripts/notify-agent-done.sh "<Project Name>" "done" "<what was accomplished>"

# On failure:
bash .claude/scripts/notify-agent-done.sh "<Project Name>" "failed" "<what went wrong>"
```

**Messages must be SHORT and PLAIN ENGLISH. No jargon, no file paths, no PIDs.**

Good: `✅ QuikCarRental — Booking API added, pushed to develop`
Bad: `✅ DISPATCH RESULTS: 12 files modified, 3 created, model: auto, mode: agent`

**If your mom can't understand the Slack message, rewrite it.**

## Workflow Patterns

### Pattern 1: Claude Plans, Cursor Builds
```bash
# 1. Claude Code creates the plan
/plan-design "Add real-time notifications to quikevents"

# 2. Dispatch each story to Cursor Agent
/dispatch-cursor --heru quikevents --context .claude/plans/notifications-plan.md \
  "Implement Story 1: WebSocket server setup"

/dispatch-cursor --heru quikevents --context .claude/plans/notifications-plan.md \
  "Implement Story 2: Notification GraphQL subscriptions"

# 3. Claude Code reviews
/review-code
```

### Pattern 2: Mass Scaffolding
```bash
# Scaffold the same feature across all Herus
/dispatch-cursor --all-herus --force \
  "Add the standard health check endpoint at GET /api/health that returns { status: 'ok', timestamp: Date.now() }"
```

### Pattern 3: Analysis Without Changes
```bash
# Ask Cursor to analyze without touching code
/dispatch-cursor --heru quikcarrental --plan \
  "What would need to change to add Yapit as a second payment provider alongside Stripe?"
```

### Pattern 4: Parallel Feature Sprint
```bash
# Different tasks to different Herus simultaneously
/dispatch-cursor --heru quikcarrental "Add vehicle image upload with S3" &
/dispatch-cursor --heru quikvibes "Add playlist sharing feature" &
/dispatch-cursor --heru site962 "Add event check-in QR code generator" &
# Wait for all to complete
```

### Pattern 5: Review and Fix Cycle
```bash
# 1. Cursor builds
/dispatch-cursor --heru dreamihaircare "Add the appointment booking flow"

# 2. Claude reviews (saves Max messages for the important stuff)
/review-code --workspace /path/to/dreamihaircare

# 3. Cursor fixes based on review
/dispatch-cursor --heru dreamihaircare "Fix the issues from the code review: [paste review]"
```

## Token Economics

| Action | Claude Max Cost | Cursor Ultra Cost |
|--------|----------------|-------------------|
| Planning & architecture | 1 message | $0 |
| Scaffolding 10 files | 0 messages | $0 (unlimited) |
| Code review | 1 message | $0 |
| Fix review issues | 0 messages | $0 (unlimited) |
| **Total per feature** | **2 messages** | **$0** |

vs. doing everything in Claude Code: **~8-15 messages per feature**

## Safety

- `--plan` and `--ask` modes are read-only — safe for exploration
- Without `--force`, Cursor Agent will prompt for each tool call (but you won't see it in --print mode, so use --force for non-interactive)
- `--all-herus` always requires confirmation before executing
- Changes are NOT auto-committed — review with `git diff` first
- Use `--dry-run` to preview the exact command before executing
- **Memory safety checks run before EVERY dispatch** — prevents kernel panics
- **Max 4 local agents** by default (override with `--max-parallel`)
- **Auto-cloud fallback** with `--auto-cloud` when memory is low or agents maxed
- Cloud agents push to branches — review PRs before merging

### Memory Aliases (in ~/.zshrc)
```bash
memwatch    # Start background memory monitor (checks every 30s, alerts via macOS notifications)
memstop     # Stop the memory monitor
memstatus   # Show watchdog status + current memory/agent info
memcheck    # Quick one-time check (memory % + agent count)
memagents   # Show running Cursor agent count
memkill     # Kill ALL running Cursor agents immediately
```

### Cloud Agent Workflow Patterns

**Pattern 6: Auto-Cloud When Busy**
```bash
# Dispatches locally if safe, auto-switches to cloud if memory low or agents maxed
/dispatch-cursor --auto-cloud --all-herus "Add health check endpoints"
```

**Pattern 7: Cloud-Only Heavy Sprint**
```bash
# Run 10+ agents in parallel with zero local RAM impact
/dispatch-cursor --cloud --parallel --all-herus "Scaffold the notification system"
# All work happens on Cursor's cloud VMs — your Mac stays cool
```

**Pattern 8: Hybrid Local + Cloud**
```bash
# Quick local fixes (fast, direct filesystem)
/dispatch-cursor --heru quikcarrental "Fix the login bug"

# Heavy scaffolding on cloud (no RAM impact)
/dispatch-cursor --cloud --herus site962,quikvibes,quikevents "Add full CRUD for events"
```

## Related Commands
- `/sync-herus` — Push platform files to all Herus (file sync, not code generation)
- `/plan-design` — Create plans that Cursor Agent can execute
- `/review-code` — Review what Cursor Agent built
- `/gap-analysis` — Check what's done vs. what's planned
- `/progress` — Quick progress dashboard
