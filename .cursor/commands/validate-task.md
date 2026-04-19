# validate-task — Validate Agent Work Against Acceptance Criteria

**Agent:** Fannie Lou (Fannie Lou Hamer — "I'm sick and tired of being sick and tired")

Validates that a dispatched agent's work matches the task prompt's acceptance criteria. Reads the original prompt, reads the PR diff, checks every criterion, runs quality gates, and reports PASS/FAIL.

## Usage
```
/validate-task --pr 142
/validate-task --prompt tasks/prompts/PROMPT-FMO-A1.md --branch fix/booking-flow-resolver
/validate-task --diff HEAD~1 --prompt tasks/prompts/PROMPT-FMO-A1.md
/validate-task --last   # validates the most recent PR on current repo
```

## Arguments
- `--pr <number>` — GitHub PR number to validate
- `--prompt <path>` — Path to the original task prompt file
- `--branch <name>` — Branch to diff against develop
- `--diff <ref>` — Git diff reference (e.g. HEAD~1, develop..feature-branch)
- `--last` — Validate the most recently created PR
- `--heru <name>` — Target Heru project (for remote validation)
- `--strict` — Fail on any NEEDS VERIFY (default: only fail on FAIL)
- `--slack` — Post results to #maat-agents
- `--re-dispatch` — Automatically re-dispatch failed tasks via Nikki

## Behavior (NON-NEGOTIABLE)

### Step 1: Resolve Inputs
- Find the task prompt (from `--prompt`, or extract from PR description, or find matching `tasks/prompts/PROMPT-*.md`)
- Get the diff (from `--pr` via `gh pr diff`, or `--branch` via `git diff develop..<branch>`, or `--diff`)

### Step 2: Extract Acceptance Criteria
Parse the task prompt for the `## ACCEPTANCE CRITERIA` section. Each `- [ ]` line is a criterion.

### Step 3: Validate Each Criterion
For each criterion:
1. **Code-checkable** (file exists, function added, type exported, component renders) → search the diff
2. **Build-checkable** (tsc passes, build succeeds, lint clean) → run the command via Bash
3. **Runtime-checkable** (payment works, booking completes, data appears) → mark NEEDS VERIFY

### Step 4: Run Quality Gate
Execute the quality gate commands from the prompt (typically at the bottom):
```bash
pnpm run type-check    # or npx tsc --noEmit
pnpm run build
pnpm run lint
pnpm run test
pnpm run graphql:validate   # if backend
```

### Step 5: Generate Report
Output structured validation report with PASS/FAIL/NEEDS VERIFY per criterion.

### Step 6: Act on Results
- **ALL PASS:** Report success. Gary can review.
- **ANY FAIL:** If `--re-dispatch`, hand back to Nikki with error context. Otherwise, report and stop.
- **NEEDS VERIFY:** Flag for manual testing by Vision/Quik.

### Step 7: Slack (if --slack)
Post summary to #maat-agents in plain language.

## Example Output
```
VALIDATION REPORT — PROMPT-FMO-A1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agent: Cheikh
Branch: fix/booking-flow-resolver

ACCEPTANCE CRITERIA:
  [PASS] createFmoBooking mutation resolves successfully
  [PASS] Frontend booking flow completes
  [FAIL] Confirmation page shows order details
  [NEEDS VERIFY] Stripe payment works

QUALITY GATE:
  [PASS] TypeScript
  [PASS] Build
  [PASS] Lint

RESULT: FAIL (1/10 criteria not met)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Related Commands
- `/dispatch-agent` — Dispatch agents (Fannie Lou validates their output)
- `/review-code` — Gary's code quality review (comes AFTER Fannie Lou)
- `/nikki` — Re-dispatch failed tasks
