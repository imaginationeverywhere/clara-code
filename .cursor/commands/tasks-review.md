# /tasks-review - Quality Review for Tasks

Review completed tasks to ensure quality before final approval.

## Usage

```
/tasks-review                       # Review all pending reviews
/tasks-review --task=<id>           # Review specific task
/tasks-review --completed           # Review recently completed
/tasks-review --in-progress         # Review in-progress tasks
/tasks-review --quality-gate        # Strict quality enforcement
/tasks-review --auto                # Automatic review (spawn agent)
```

## Implementation

### Step 1: Identify Tasks to Review

**Default:** Find tasks where:
- `status = "completed"` AND `review.status = "pending"`
- OR `review.required = true` AND not yet reviewed

**--in-progress:** Find tasks where:
- `status = "in_progress"`
- Check progress and quality mid-flight

### Step 2: Review Process

For each task to review:

#### A. Load Task Context
```javascript
const task = tasks.find(t => t.id === taskId);
const acceptance = task.acceptanceCriteria || [];
const changes = getGitChangesForTask(task);
```

#### B. Acceptance Criteria Check
```
For each criterion in task.acceptanceCriteria:
  - Verify implementation
  - Mark as ✅ PASS or ❌ FAIL
```

#### C. Code Quality Check
```
1. TypeScript compilation: npx tsc --noEmit
2. Linting: npm run lint
3. Tests: npm run test
4. Coverage: Check coverage threshold
```

#### D. Security Check
```
- No hardcoded secrets (scan for API keys, passwords)
- Input validation present
- Auth checks where needed
- No SQL injection vectors
```

#### E. Pattern Compliance
```
- Follows project architecture
- Uses established patterns
- Consistent naming
- Proper error handling
```

### Step 3: Generate Review Report

```markdown
## Task Review: #5 "Payment Integration"

### Acceptance Criteria
| Criterion | Status | Notes |
|-----------|--------|-------|
| Stripe checkout flow works | ✅ PASS | Tested with test keys |
| Webhook handles events | ✅ PASS | All event types covered |
| Order status updates | ✅ PASS | Real-time updates working |
| Error handling | ⚠️ PARTIAL | Missing retry logic |

### Code Quality
| Check | Status | Details |
|-------|--------|---------|
| TypeScript | ✅ PASS | No errors |
| ESLint | ✅ PASS | No warnings |
| Tests | ✅ PASS | 15/15 passed |
| Coverage | ⚠️ 72% | Target: 80% |

### Security
| Check | Status |
|-------|--------|
| No hardcoded secrets | ✅ PASS |
| Input validation | ✅ PASS |
| Auth checks | ✅ PASS |

### Verdict: NEEDS_CHANGES

**Required Changes:**
1. Add retry logic for failed webhook deliveries
2. Increase test coverage to 80%

**Recommended (optional):**
- Add logging for payment events
- Consider adding payment analytics
```

### Step 4: Update Task Status

Based on review outcome:

**APPROVED:**
```json
{
  "status": "completed",
  "review": {
    "required": true,
    "status": "approved",
    "reviewedAt": "2025-01-31T15:30:00Z",
    "reviewer": "claude-orchestrator",
    "notes": "All criteria met"
  }
}
```

**NEEDS_CHANGES:**
```json
{
  "status": "in_progress",
  "review": {
    "required": true,
    "status": "changes_requested",
    "reviewedAt": "2025-01-31T15:30:00Z",
    "reviewer": "claude-orchestrator",
    "notes": "See review report for required changes",
    "requiredChanges": [
      "Add retry logic for webhooks",
      "Increase test coverage to 80%"
    ]
  }
}
```

## Quality Gate Mode (--quality-gate)

Strict enforcement with automatic blocking:

```
Quality Gate Configuration:
  - Test coverage: >= 80%
  - TypeScript errors: 0
  - ESLint errors: 0
  - Security scan: PASS
  - All acceptance criteria: PASS

If ANY check fails:
  - Task cannot be marked complete
  - Detailed failure report generated
  - Task reverted to in_progress
```

## Auto Review Mode (--auto)

Spawn a review agent for each pending task:

```javascript
Task({
  subagent_type: "code-quality-reviewer",
  description: `Review task: ${task.subject}`,
  prompt: `
    Review Task #${task.id}: "${task.subject}"

    **Acceptance Criteria:**
    ${task.acceptanceCriteria.map(c => `- ${c}`).join('\n')}

    **Review Checklist:**
    1. Check each acceptance criterion
    2. Run: npx tsc --noEmit
    3. Run: npm run lint
    4. Run: npm run test
    5. Check for security issues
    6. Verify project patterns

    **Output:**
    - APPROVED: All checks pass
    - NEEDS_CHANGES: List specific issues
    - BLOCKED: Critical issues found

    Update .claude/project-tasks/tasks.json with review results.
  `
});
```

## Output Examples

### Interactive Review
```
🔍 Task Review: #5 "Payment Integration"

Loading task context...
  Files changed: 8
  Lines added: 342
  Lines removed: 45

Running checks...
  ✅ TypeScript compilation passed
  ✅ ESLint passed
  ✅ Tests passed (15/15)
  ⚠️ Coverage: 72% (target: 80%)

Checking acceptance criteria...
  ✅ Stripe checkout flow works
  ✅ Webhook handles payment events
  ✅ Order status updates correctly
  ⚠️ Error handling (partial)

Security scan...
  ✅ No hardcoded secrets
  ✅ Input validation present
  ✅ Auth checks in place

═══════════════════════════════════════

VERDICT: NEEDS_CHANGES

Required before approval:
  1. Add retry logic for failed webhooks
  2. Increase test coverage to 80%

Task #5 status updated to: IN_PROGRESS
Review saved to tasks.json
```

### Batch Review
```
🔍 Batch Review: 3 tasks pending

Task #4 "Authentication flow"
  ✅ All checks passed
  → APPROVED

Task #5 "Payment integration"
  ⚠️ Coverage below threshold
  → NEEDS_CHANGES (1 issue)

Task #6 "User dashboard"
  ✅ All checks passed
  → APPROVED

Summary:
  Approved: 2
  Needs Changes: 1

Updated tasks.json with review results.
```

## Integration

- Updates `.claude/project-tasks/tasks.json`
- Can spawn `code-quality-reviewer` agent
- Works with `/tasks-orchestrate` and `/tasks-monitor`
- Integrates with JIRA for status updates
