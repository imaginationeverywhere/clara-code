# Code Review Command

**Version:** 3.0.0
**Agent:** code-quality-reviewer
**Output:** `docs/review/{timestamp}-code-review.md`

## Purpose

Automated code review that analyzes recent changes, identifies issues, and generates a comprehensive review document. **ENFORCES 80% MINIMUM TEST COVERAGE REQUIREMENT** - all code being reviewed must have passing unit tests with at least 80% coverage. Optimized for token efficiency by producing reusable review artifacts.

**Also auto-detects open prompt PRs** (from `/pickup-prompt`), reviews each one, merges passing PRs into develop, and deletes the prompt branches — no manual PR management needed.

## ⚠️ CRITICAL REQUIREMENT: Test Coverage

**All code submitted for review MUST:**
1. ✅ Have unit tests that cover the changed code
2. ✅ All tests must pass (zero failures)
3. ✅ Minimum 80% code coverage for changed files
4. ❌ Review will FAIL and BLOCK if coverage < 80%

**This is a HARD REQUIREMENT - no exceptions.**

## Usage

```bash
# Review current changes (git diff) - includes test execution
review-code

# Review specific files with coverage check
review-code path/to/file.ts path/to/another.ts

# Review with focus area (still requires 80% coverage)
review-code --focus=security
review-code --focus=performance
review-code --focus=accessibility

# Skip test execution (NOT RECOMMENDED - for edge cases only)
review-code --skip-tests

# Review pull request with full test suite
review-code --pr=123

# Review specific commit range
review-code --since=HEAD~5
```

## What Gets Reviewed

**Automatic Detection:**
- Git staged changes (`git diff --cached`)
- Unstaged changes (`git diff`)
- Recent commits if no changes (`git log -1`)

**Code Quality Dimensions (Priority Order):**
1. **Testing** - ⚠️ **CRITICAL** - 80% minimum coverage, all tests pass, test quality
2. **Security** - OWASP Top 10, auth patterns, data validation
3. **Performance** - N+1 queries, memory leaks, bundle size
4. **Type Safety** - TypeScript patterns, type coverage
5. **Maintainability** - Code smells, complexity, documentation
6. **Best Practices** - Framework patterns, enterprise standards
7. **Accessibility** - WCAG 2.1 AA compliance

**Testing is the #1 priority and a BLOCKING requirement.**

## Review Document Structure

```markdown
# Code Review - {Timestamp}

## ⚠️ COVERAGE REQUIREMENT CHECK

**Status:** ✅ PASS / ❌ FAIL (blocks review if FAIL)

- **Tests Run:** 145
- **Tests Passed:** 145
- **Tests Failed:** 0
- **Overall Coverage:** 87.3%
- **Changed Files Coverage:** 89.1%
- **Minimum Required:** 80.0%

### Per-File Coverage
| File | Coverage | Status |
|------|----------|--------|
| backend/src/routes/user.ts | 92.5% | ✅ PASS |
| backend/src/services/UserService.ts | 88.2% | ✅ PASS |
| frontend/src/components/UserProfile.tsx | 85.0% | ✅ PASS |

---

## Executive Summary
- **Files Reviewed:** 12
- **Test Coverage:** 89.1% (✅ above 80% threshold)
- **Tests Status:** ✅ All 145 tests passing
- **Issues Found:** 8 (3 critical, 2 high, 3 medium)
- **Lines Changed:** +234 -156
- **Overall Grade:** B+
- **Review Status:** ✅ APPROVED (coverage requirement met)

## Critical Issues
1. **[SECURITY]** SQL Injection vulnerability in search endpoint
   - File: `backend/src/routes/search.ts:45`
   - Impact: High - Allows arbitrary SQL execution
   - Fix: Use parameterized queries with Sequelize

## High Priority Issues
...

## Medium Priority Issues
...

## Test Quality Assessment
- **Coverage:** ✅ Exceeds 80% requirement (89.1%)
- **Test Organization:** Good - tests follow project structure
- **Assertions:** Strong - comprehensive assertions
- **Edge Cases:** Most edge cases covered
- **Mocking:** Proper use of mocks and stubs

## Best Practices Recommendations
...

## Positive Findings
...
```

**Example of FAILED review (coverage < 80%):**

```markdown
# Code Review - {Timestamp}

## ❌ COVERAGE REQUIREMENT CHECK - REVIEW BLOCKED

**Status:** ❌ FAIL - Code review CANNOT proceed

- **Tests Run:** 45
- **Tests Passed:** 43
- **Tests Failed:** 2
- **Overall Coverage:** 62.1%
- **Changed Files Coverage:** 58.7%
- **Minimum Required:** 80.0%
- **Deficit:** -21.3% (BLOCKING)

### Per-File Coverage (INSUFFICIENT)
| File | Coverage | Status |
|------|----------|--------|
| backend/src/routes/user.ts | 45.2% | ❌ FAIL (-34.8%) |
| backend/src/services/UserService.ts | 68.9% | ❌ FAIL (-11.1%) |
| frontend/src/components/UserProfile.tsx | 72.3% | ❌ FAIL (-7.7%) |

### Failing Tests
1. ❌ User.test.ts - "should handle invalid email format"
2. ❌ UserService.test.ts - "should throw error on duplicate user"

---

## 🚫 REVIEW BLOCKED

**This code review cannot proceed until:**

1. ✅ All tests are passing (currently 2 failures)
2. ✅ Test coverage reaches minimum 80% (currently 62.1%)
3. ✅ Each changed file has ≥80% coverage

**Required Actions:**

1. **Fix failing tests:**
   - User.test.ts - "should handle invalid email format"
   - UserService.test.ts - "should throw error on duplicate user"

2. **Add tests to increase coverage:**
   - backend/src/routes/user.ts needs +34.8% coverage (+~45 lines)
   - backend/src/services/UserService.ts needs +11.1% coverage (~15 lines)
   - frontend/src/components/UserProfile.tsx needs +7.7% coverage (~10 lines)

3. **Re-run review after fixes:**
   ```bash
   # Fix tests and add coverage
   npm test

   # Verify coverage
   npm run test:coverage

   # Re-run review
   review-code
   ```

**NO CODE REVIEW WILL BE PERFORMED UNTIL THESE REQUIREMENTS ARE MET.**
```

## Command Implementation

When this command is invoked, Claude Code should:

### Phase 0: Git Pull + Auto-Detect Prompt PRs (NEW — RUNS FIRST)

**This phase always runs first, before any code review begins.**

```bash
echo "Pulling latest from remote..."
git pull origin $(git branch --show-current) 2>&1
echo ""

echo "Scanning for open prompt PRs..."
PROMPT_PRS=$(gh pr list --state open --json number,headRefName,title,url \
  --jq '.[] | select(.headRefName | startswith("prompt/"))' 2>/dev/null)

if [ -n "$PROMPT_PRS" ]; then
  echo "Found prompt PRs to review:"
  echo "$PROMPT_PRS" | jq -r '"  #\(.number): \(.headRefName) — \(.title)"'
  echo ""
  echo "These will be reviewed and merged (if passing) after code quality check."
else
  echo "No open prompt PRs found — reviewing current branch changes only."
fi
echo ""
```

**Store the list of prompt PRs** for use in Phase 6:
```bash
PROMPT_PR_NUMBERS=$(gh pr list --state open --json number,headRefName \
  --jq '.[] | select(.headRefName | startswith("prompt/")) | .number' 2>/dev/null)
PROMPT_PR_BRANCHES=$(gh pr list --state open --json number,headRefName \
  --jq '.[] | select(.headRefName | startswith("prompt/")) | .headRefName' 2>/dev/null)
```

### Phase 1: Collect Code Changes

```bash
# Get current git status
git status --porcelain

# Get staged changes
git diff --cached --name-only

# Get unstaged changes
git diff --name-only

# If specific files provided, use those instead
```

### Phase 2: Execute Tests and Validate Coverage (CRITICAL)

**This phase is MANDATORY unless --skip-tests is specified.**

```bash
echo "🧪 Running tests and checking coverage..."
echo ""

# Determine test command based on project structure
if [ -f "package.json" ]; then
  # Check if test:coverage script exists
  if grep -q '"test:coverage"' package.json; then
    TEST_CMD="npm run test:coverage"
  elif grep -q '"test"' package.json; then
    TEST_CMD="npm test -- --coverage"
  else
    echo "❌ No test script found in package.json"
    exit 1
  fi
elif [ -f "pytest.ini" ] || [ -f "setup.py" ]; then
  TEST_CMD="pytest --cov --cov-report=term --cov-report=json"
else
  echo "❌ Unable to determine test framework"
  exit 1
fi

# Run tests with coverage
echo "Running: $TEST_CMD"
$TEST_CMD > test-output.txt 2>&1
TEST_EXIT_CODE=$?

# Parse test results
TESTS_RUN=$(grep -oE "[0-9]+ (tests?|passed)" test-output.txt | head -1 | grep -oE "[0-9]+")
TESTS_FAILED=$(grep -oE "[0-9]+ failed" test-output.txt | grep -oE "[0-9]+" || echo "0")
TESTS_PASSED=$((TESTS_RUN - TESTS_FAILED))

# Parse coverage from coverage report
if [ -f "coverage/coverage-summary.json" ]; then
  # JavaScript/TypeScript (Jest, Vitest)
  OVERALL_COVERAGE=$(jq '.total.lines.pct' coverage/coverage-summary.json)
elif [ -f "coverage.json" ]; then
  # Python (pytest-cov)
  OVERALL_COVERAGE=$(jq '.totals.percent_covered' coverage.json)
else
  echo "⚠️  Coverage report not found, parsing from terminal output"
  OVERALL_COVERAGE=$(grep -oE "[0-9]+\.[0-9]+%" test-output.txt | tail -1 | tr -d '%')
fi

# Get per-file coverage for changed files
declare -A FILE_COVERAGE

for file in $(git diff --cached --name-only); do
  # Skip non-source files
  if [[ ! "$file" =~ \.(ts|tsx|js|jsx|py)$ ]]; then
    continue
  fi

  # Get coverage for this specific file
  if [ -f "coverage/coverage-summary.json" ]; then
    COVERAGE=$(jq -r ".[\"$file\"].lines.pct // 0" coverage/coverage-summary.json)
  else
    COVERAGE="0"
  fi

  FILE_COVERAGE["$file"]=$COVERAGE
done

# Calculate average coverage for changed files
TOTAL=0
COUNT=0
for file in "${!FILE_COVERAGE[@]}"; do
  TOTAL=$(echo "$TOTAL + ${FILE_COVERAGE[$file]}" | bc)
  ((COUNT++))
done

if [ $COUNT -gt 0 ]; then
  CHANGED_FILES_COVERAGE=$(echo "scale=1; $TOTAL / $COUNT" | bc)
else
  CHANGED_FILES_COVERAGE=$OVERALL_COVERAGE
fi

echo ""
echo "📊 Test Results:"
echo "   Tests Run: $TESTS_RUN"
echo "   Tests Passed: $TESTS_PASSED"
echo "   Tests Failed: $TESTS_FAILED"
echo "   Overall Coverage: ${OVERALL_COVERAGE}%"
echo "   Changed Files Coverage: ${CHANGED_FILES_COVERAGE}%"
echo ""

# Validate coverage requirement
COVERAGE_THRESHOLD=80

if (( $(echo "$TESTS_FAILED > 0" | bc -l) )); then
  echo "❌ REVIEW BLOCKED: Tests are failing"
  echo ""
  echo "🚫 Fix the following failing tests before review:"
  grep -A 5 "FAIL" test-output.txt
  exit 1
fi

if (( $(echo "$CHANGED_FILES_COVERAGE < $COVERAGE_THRESHOLD" | bc -l) )); then
  echo "❌ REVIEW BLOCKED: Coverage below 80% threshold"
  echo ""
  echo "Current Coverage: ${CHANGED_FILES_COVERAGE}%"
  echo "Required Coverage: ${COVERAGE_THRESHOLD}%"
  echo "Deficit: $(echo "$COVERAGE_THRESHOLD - $CHANGED_FILES_COVERAGE" | bc)%"
  echo ""
  echo "📝 Files needing more tests:"

  for file in "${!FILE_COVERAGE[@]}"; do
    COV=${FILE_COVERAGE[$file]}
    if (( $(echo "$COV < $COVERAGE_THRESHOLD" | bc -l) )); then
      DEFICIT=$(echo "$COVERAGE_THRESHOLD - $COV" | bc)
      echo "   ❌ $file: ${COV}% (needs +${DEFICIT}%)"
    fi
  done

  echo ""
  echo "💡 Add tests to cover untested code paths, then run:"
  echo "   npm run test:coverage"
  echo "   review-code"
  exit 1
fi

echo "✅ Coverage requirement met: ${CHANGED_FILES_COVERAGE}% (≥80%)"
echo "✅ All tests passing: $TESTS_PASSED/$TESTS_RUN"
echo ""

# Store results for review document
export TEST_RESULTS_JSON=$(cat <<EOF
{
  "tests_run": $TESTS_RUN,
  "tests_passed": $TESTS_PASSED,
  "tests_failed": $TESTS_FAILED,
  "overall_coverage": $OVERALL_COVERAGE,
  "changed_files_coverage": $CHANGED_FILES_COVERAGE,
  "file_coverage": $(echo "${!FILE_COVERAGE[@]}" | jq -R 'split(" ") | map({(.): FILE_COVERAGE[.]}) | add')
}
EOF
)
```

**Coverage Validation Logic:**

1. **Test Execution** - All tests must pass (zero failures)
2. **Coverage Calculation** - Calculate coverage for changed files only
3. **Threshold Validation** - Changed files must have ≥80% coverage
4. **Blocking** - If coverage < 80% or tests fail, BLOCK review and exit
5. **Reporting** - Store results for inclusion in review document

### Phase 3: Invoke Code Quality Reviewer Agent

Use the **Task tool** with `subagent_type='code-quality-reviewer'`:

```markdown
Please perform a comprehensive code review of the following changes:

**Context:**
- Project: {project_name from docs/PRD.md}
- Branch: {current_branch}
- Review Scope: {files_or_commits}

**Test Coverage Status (MANDATORY VALIDATION):**
- Tests Run: {tests_run}
- Tests Passed: {tests_passed}
- Tests Failed: {tests_failed}
- Overall Coverage: {overall_coverage}%
- Changed Files Coverage: {changed_files_coverage}%
- Coverage Requirement: ✅ MET (≥80%)

**Per-File Coverage:**
{table of file coverage for changed files}

**Focus Areas:**
{--focus parameter or "all areas"}

**Files to Review:**
{list of changed files with diff snippets}

**Requirements:**
1. **TEST COVERAGE** - ✅ Already validated: {changed_files_coverage}% (≥80%)
   - Assess test quality, edge cases, mocking patterns
   - Verify test organization and maintainability
   - Check for flaky tests or brittle assertions
2. **Security** - Identify vulnerabilities (OWASP Top 10, auth patterns, data validation)
3. **Performance** - Check for issues (N+1 queries, memory leaks, bundle size)
4. **Type Safety** - Validate TypeScript patterns and type coverage
5. **Maintainability** - Assess code smells, complexity, documentation
6. **Best Practices** - Check framework patterns and enterprise standards
7. **Accessibility** - Validate WCAG 2.1 AA compliance (if UI code)

**Output Format:**
Generate a structured review document with:
- Coverage requirement check (MUST BE FIRST SECTION)
- Executive summary with metrics including test coverage
- Test quality assessment
- Issues grouped by severity (critical/high/medium/low)
- Specific file locations and line numbers
- Actionable fix recommendations
- Positive findings to reinforce good patterns
```

### Phase 4: Generate Review Document

1. **Create review directory** if it doesn't exist:
   ```bash
   mkdir -p docs/review
   ```

2. **Generate filename** with timestamp:
   ```bash
   TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
   REVIEW_FILE="docs/review/${TIMESTAMP}-code-review.md"
   ```

3. **Write review document** using the agent's output

4. **Add to git** (optional):
   ```bash
   git add docs/review/${TIMESTAMP}-code-review.md
   ```

### Phase 4b: Generate Corrective Prompt (if issues found)

**When the review finds CRITICAL, HIGH, or unresolved MEDIUM issues**, the reviewer MUST write a corrective prompt and queue it for a Cursor agent to execute. This is NON-NEGOTIABLE — a review that identifies issues is not done until the corrective prompt is saved.

**Trigger:** Any review with grade below A-, OR any review with 1+ CRITICAL or HIGH issues.

**Step 1 — Determine the next available prompt number:**
```bash
YEAR=$(date +%Y)
MONTH=$(date +%B)
DAY=$(date +%-d)
QUEUE_DIR="prompts/${YEAR}/${MONTH}/${DAY}/1-not-started"
mkdir -p "$QUEUE_DIR"

# Auto-number: count existing prompts and add 1
NEXT_NUM=$(ls "$QUEUE_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')
NEXT_NUM=$(printf "%02d" $((NEXT_NUM + 1)))
```

**Step 2 — Write the corrective prompt file:**

The prompt must be a complete, self-contained Cursor agent task. Write it to:
```
prompts/${YEAR}/${MONTH}/${DAY}/1-not-started/${NEXT_NUM}-fix-<short-description>.md
```

**Corrective prompt format:**
```markdown
# Fix: <Short description from review>

**Source:** Code review `docs/review/<timestamp>-code-review.md`
**Grade received:** <grade>
**Issues to fix:** <count> critical, <count> high, <count> medium

## Context

<1-2 sentences describing what was reviewed and what the overall problem is>

## Required Fixes

### CRITICAL Issues (fix first)

1. **[SECURITY/PERF/TYPE]** <Issue title>
   - **File:** `<path/to/file.ts>:<line>`
   - **Problem:** <Exact description from review>
   - **Fix:** <Specific actionable fix the Cursor agent should make>

2. ...

### HIGH Issues

1. **[category]** <Issue title>
   - **File:** `<path/to/file.ts>:<line>`
   - **Problem:** <description>
   - **Fix:** <specific fix>

### MEDIUM Issues (fix if time allows)

<same format>

## Acceptance Criteria

- [ ] All CRITICAL issues resolved
- [ ] All HIGH issues resolved
- [ ] `npm run type-check` passes (zero errors)
- [ ] `npm test` passes (zero failures)
- [ ] Re-run `/review-code` — grade must be A or A-

## Do NOT

- Do not refactor code unrelated to these issues
- Do not add new features
- Fix only what the review identified
```

**Step 3 — Post to live feed:**
```bash
echo "$(date '+%H:%M:%S') | $(basename $(pwd)) | CORRECTIVE PROMPT QUEUED | ${NEXT_NUM}-fix-<slug>.md | ${COUNT_CRITICAL} critical, ${COUNT_HIGH} high issues | Cursor agent: run /pickup-prompt" >> ~/auset-brain/Swarms/live-feed.md
```

**Step 3b — Push prompt to GitHub** so QCS1 and all sessions can see it:
```bash
BRANCH=$(git branch --show-current)
git add "prompts/"
git commit -m "feat(prompts): queue corrective prompt ${NEXT_NUM}-fix-<slug>.md — ${COUNT_CRITICAL} critical, ${COUNT_HIGH} high issues"
git push origin "$BRANCH"
echo "✓ Corrective prompt pushed to GitHub: $BRANCH"
```

**Step 4 — Report to the reviewer:**
```
📋 Corrective prompt queued:
   prompts/${YEAR}/${MONTH}/${DAY}/1-not-started/${NEXT_NUM}-fix-<slug>.md

   Issues captured: X critical, Y high, Z medium
   QCS1 Cursor agent: run /pickup-prompt to execute fixes
   GitHub: pushed to $BRANCH ✓
```

**When NOT to write a corrective prompt:**
- Review passes with grade A or A- and zero CRITICAL/HIGH issues → archive, no corrective needed
- Only LOW/informational findings → note them in the review doc, no corrective prompt
- Review is BLOCKED (coverage < 80%) → do NOT write a corrective prompt; the agent must fix tests first using the existing blocking message

### Phase 5: Display Summary

Show concise summary to user:
```
✅ Code Review Complete

🧪 Test Coverage Status:
   Tests Run: 145
   Tests Passed: 145 ✅
   Tests Failed: 0
   Overall Coverage: 87.3% ✅
   Changed Files Coverage: 89.1% ✅ (exceeds 80% requirement)

📊 Code Quality Summary:
   Files Reviewed: 12
   Issues Found: 8 (3 critical, 2 high, 3 medium)
   Overall Grade: B+
   Review Status: ✅ APPROVED (coverage requirement met)

📝 Review Document: docs/review/20251120-143022-code-review.md

🔴 Critical Issues:
   1. SQL Injection vulnerability in backend/src/routes/search.ts:45
   2. Missing authentication check in backend/src/routes/admin.ts:23
   3. XSS vulnerability in frontend/src/components/UserProfile.tsx:67

💡 Next Steps:
   1. Fix critical security issues immediately
   2. Run security tests: npm run test:security
   3. Re-run review after fixes: review-code
```

**Example of BLOCKED review (coverage < 80%):**

```
❌ Code Review BLOCKED

🧪 Test Coverage Status:
   Tests Run: 45
   Tests Passed: 43
   Tests Failed: 2 ❌
   Overall Coverage: 62.1%
   Changed Files Coverage: 58.7% ❌ (below 80% requirement)
   Deficit: -21.3%

🚫 Review Cannot Proceed:
   ❌ 2 tests failing
   ❌ Coverage below 80% threshold

📝 Files Needing Tests:
   ❌ backend/src/routes/user.ts: 45.2% (needs +34.8%)
   ❌ backend/src/services/UserService.ts: 68.9% (needs +11.1%)
   ❌ frontend/src/components/UserProfile.tsx: 72.3% (needs +7.7%)

💡 Required Actions:
   1. Fix failing tests:
      - User.test.ts - "should handle invalid email format"
      - UserService.test.ts - "should throw error on duplicate user"

   2. Add tests to reach 80% coverage:
      npm run test:coverage

   3. Re-run review when ready:
      review-code

⚠️  NO CODE REVIEW WILL BE PERFORMED UNTIL REQUIREMENTS ARE MET
```

## Phase 6: Merge Prompt PRs and Delete Branches (NEW — RUNS AFTER REVIEW)

**Runs after each passing review. For each prompt PR detected in Phase 0:**

```bash
# Loop over each prompt PR found in Phase 0
for PR_NUMBER in $PROMPT_PR_NUMBERS; do
  PR_INFO=$(gh pr view "$PR_NUMBER" --json headRefName,title,mergeable 2>/dev/null)
  BRANCH=$(echo "$PR_INFO" | jq -r '.headRefName')
  TITLE=$(echo "$PR_INFO" | jq -r '.title')
  MERGEABLE=$(echo "$PR_INFO" | jq -r '.mergeable')

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "MERGING PROMPT PR: #${PR_NUMBER} — ${TITLE}"
  echo "Branch: ${BRANCH}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  if [ "$MERGEABLE" = "CONFLICTING" ]; then
    echo "⚠️  PR #${PR_NUMBER} has merge conflicts — skipping auto-merge"
    echo "   Resolve conflicts manually, then re-run /review-code"
    continue
  fi

  # Merge the PR into develop (squash merge for clean history)
  gh pr merge "$PR_NUMBER" \
    --squash \
    --delete-branch \
    --subject "feat: ${TITLE}" \
    2>&1

  if [ $? -eq 0 ]; then
    echo "✅ Merged: #${PR_NUMBER} → develop"
    echo "✅ Branch deleted: ${BRANCH}"

    # Also delete local branch if it exists
    git branch -d "$BRANCH" 2>/dev/null || git branch -D "$BRANCH" 2>/dev/null || true

    echo "$(date '+%H:%M:%S') | $(basename $(pwd)) | PR MERGED | #${PR_NUMBER} | ${BRANCH} → develop | branch deleted" >> ~/auset-brain/Swarms/live-feed.md
  else
    echo "⚠️  Merge failed for #${PR_NUMBER} — check GitHub for details"
  fi
done

# Pull develop to get the merged commits locally
if [ -n "$PROMPT_PR_NUMBERS" ]; then
  echo ""
  echo "Pulling merged commits..."
  git pull origin $(git branch --show-current) 2>&1
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✅ All prompt PRs merged and branches cleaned up."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi
```

**When NOT to merge:**
- Review **fails** (coverage < 80%, CRITICAL issues blocking) → do NOT merge. Write corrective prompt and queue in `1-not-started/`.
- PR has merge conflicts (`CONFLICTING` state) → skip with warning. Human must resolve.
- No prompt PRs found in Phase 0 → Phase 6 is a no-op.

## Integration with UltraThink

After generating review document, optionally update UltraThink knowledge graph:

```bash
# Add review to knowledge graph
ultrathink add-review docs/review/${TIMESTAMP}-code-review.md

# Extract code quality insights
ultrathink extract-insights --type=code-review
```

## Token Optimization Benefits

**Why This Saves Tokens:**

1. **Persistent Review Artifacts** - Review once, reference many times
2. **Async Review Process** - No need to re-review in main conversation
3. **Structured Output** - Predictable format, easy to parse
4. **Historical Context** - Track quality trends over time
5. **Shareable Reviews** - Team members can read without AI assistance

**Estimated Savings:**
- Without command: ~50,000 tokens per review discussion
- With command: ~10,000 tokens (review generation) + 0 tokens (future references)
- **80% token reduction** when referencing reviews

## Examples

### Example 1: Test-First Pre-Commit Review (Recommended Workflow)
```bash
# 1. Write code
# backend/src/routes/user.ts

# 2. Write tests FIRST
# backend/src/routes/user.test.ts

# 3. Run tests to verify 80% coverage
npm run test:coverage

# 4. Stage changes
git add .

# 5. Review before committing (includes automatic test execution)
review-code

# Output:
# ✅ Code Review Complete
# 🧪 Test Coverage Status:
#    Tests Run: 145
#    Tests Passed: 145 ✅
#    Changed Files Coverage: 89.1% ✅

# 6. Fix any issues found, then commit
git commit -m "feat: add user authentication with 89% test coverage"
```

### Example 2: Failed Coverage (Learning from Mistakes)
```bash
# Stage changes without sufficient tests
git add backend/src/routes/order.ts

# Try to review
review-code

# Output:
# ❌ Code Review BLOCKED
# 🧪 Test Coverage Status:
#    Changed Files Coverage: 45.2% ❌ (below 80% requirement)
#    Deficit: -34.8%
#
# 📝 Files Needing Tests:
#    ❌ backend/src/routes/order.ts: 45.2% (needs +34.8%)

# Fix by adding tests
# Create backend/src/routes/order.test.ts

# Re-run tests
npm run test:coverage

# Verify coverage
# Coverage: 87.3% ✅

# Re-run review
review-code

# Output:
# ✅ Code Review Complete
# 🧪 Test Coverage Status:
#    Changed Files Coverage: 87.3% ✅
```

### Example 3: Security-Focused Review (Still Requires Tests)
```bash
# Review with security focus
review-code --focus=security

# Even with --focus=security, tests still run first:
# 🧪 Running tests and checking coverage...
# ✅ Coverage requirement met: 89.1% (≥80%)
#
# Then performs security review:
# Generates docs/review/20251120-143022-code-review.md
# with emphasis on:
# - Auth patterns
# - Data validation
# - SQL injection prevention
# - XSS prevention
# - CSRF protection
```

### Example 4: Performance Review with Full Test Suite
```bash
# Review specific performance-critical files
review-code backend/src/graphql/resolvers/*.ts --focus=performance

# First validates tests:
# ✅ All 145 tests passing
# ✅ Coverage: 89.1%
#
# Then checks for performance issues:
# - N+1 query patterns
# - DataLoader usage
# - Database query optimization
# - Memory leaks
# - Bundle size impact
```

### Example 5: Complete Development Workflow
```bash
# 1. Create feature branch
git checkout -b feature/user-profile

# 2. Write implementation
# frontend/src/components/UserProfile.tsx

# 3. Write comprehensive tests (TDD approach)
# frontend/src/components/UserProfile.test.tsx

# 4. Run tests locally
npm test UserProfile.test.tsx

# 5. Check coverage
npm run test:coverage

# Output: UserProfile.tsx - 92.5% coverage ✅

# 6. Stage all changes
git add .

# 7. Run review-code (includes test execution)
review-code

# Output:
# ✅ Code Review Complete
# 🧪 Test Coverage: 92.5% ✅
# 📊 Issues Found: 2 (1 medium, 1 low)
#
# Medium Priority:
# - Consider memoizing expensive calculations in UserProfile.tsx:45

# 8. Fix medium priority issue
# Add useMemo to expensive calculation

# 9. Re-test
npm test

# 10. Re-review
review-code

# Output:
# ✅ Code Review Complete
# 🧪 Test Coverage: 92.5% ✅
# 📊 Issues Found: 0
# Overall Grade: A

# 11. Commit
git commit -m "feat: add user profile component with 92.5% test coverage"

# 12. Push
git push origin feature/user-profile
```

## Configuration

Add to `.claude/commands/config.json`:

```json
{
  "review-code": {
    "enabled": true,
    "default_focus": "all",
    "min_severity": "medium",
    "auto_ultrathink": true,
    "test_coverage": {
      "enabled": true,
      "minimum_coverage": 80,
      "require_passing_tests": true,
      "block_on_failure": true,
      "coverage_scope": "changed_files",
      "test_frameworks": {
        "jest": true,
        "vitest": true,
        "pytest": true,
        "playwright": true
      }
    },
    "exclude_patterns": [
      "*.test.ts",
      "*.spec.ts",
      "*.test.js",
      "*.spec.js",
      "__tests__/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**"
    ]
  }
}
```

**Configuration Options:**

- `test_coverage.enabled` - Enable/disable coverage enforcement (default: `true`)
- `test_coverage.minimum_coverage` - Minimum coverage percentage (default: `80`)
- `test_coverage.require_passing_tests` - Block if tests fail (default: `true`)
- `test_coverage.block_on_failure` - Block review on coverage failure (default: `true`)
- `test_coverage.coverage_scope` - `changed_files` or `overall` (default: `changed_files`)

**Adjusting Coverage Threshold:**

To set a different threshold (e.g., 90%):
```json
{
  "review-code": {
    "test_coverage": {
      "minimum_coverage": 90
    }
  }
}
```

**Disabling Coverage Enforcement (NOT RECOMMENDED):**
```json
{
  "review-code": {
    "test_coverage": {
      "enabled": false
    }
  }
}
```

## Related Commands

- `/debug-fix` - Fix issues found in reviews
- `/test-automation` - Generate tests for reviewed code
- `/git-commit-docs` - Commit with review documentation
- `/organize-docs` - Organize review documents

## Test Coverage Best Practices

### Writing Tests for 80% Coverage

**1. Test Structure**
```typescript
// user.test.ts
describe('User Routes', () => {
  describe('POST /api/users', () => {
    it('should create user with valid data', async () => {
      // Happy path - covers main flow
    });

    it('should reject invalid email format', async () => {
      // Error handling - covers validation
    });

    it('should reject duplicate email', async () => {
      // Error handling - covers uniqueness constraint
    });

    it('should hash password before saving', async () => {
      // Security - covers critical functionality
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by ID', async () => {
      // Happy path
    });

    it('should return 404 for non-existent user', async () => {
      // Error handling
    });

    it('should require authentication', async () => {
      // Security
    });
  });
});
```

**2. Coverage Goals**
- **Happy Paths:** Cover main success scenarios (30%)
- **Error Handling:** Cover validation and error cases (30%)
- **Edge Cases:** Cover boundary conditions (20%)
- **Security:** Cover auth, validation, sanitization (20%)

**3. What 80% Means**
- 80% of **statements** executed
- 80% of **branches** covered (if/else, switch)
- 80% of **functions** called
- 80% of **lines** executed

**4. Excluded from Coverage**
- Test files themselves
- Configuration files
- Type definitions
- Generated code

### Common Coverage Mistakes

❌ **Insufficient Error Handling Tests**
```typescript
// Only tests happy path - 50% coverage
it('should create user', async () => {
  const user = await createUser({ email: 'test@test.com' });
  expect(user).toBeDefined();
});
```

✅ **Comprehensive Error Testing**
```typescript
// Tests happy path + errors - 90% coverage
it('should create user with valid data', async () => {
  const user = await createUser({ email: 'test@test.com' });
  expect(user).toBeDefined();
});

it('should reject invalid email', async () => {
  await expect(createUser({ email: 'invalid' }))
    .rejects.toThrow('Invalid email');
});

it('should reject missing fields', async () => {
  await expect(createUser({}))
    .rejects.toThrow('Email required');
});
```

## Notes for Claude Code

When executing this command:

1. **CRITICAL: Execute tests FIRST** - Coverage validation is mandatory
2. **BLOCK if coverage < 80%** - Do not proceed with code review
3. **BLOCK if tests fail** - All tests must pass before review
4. **Always use code-quality-reviewer agent** via Task tool
5. **Include test coverage metrics** in review document
6. **Generate timestamp-based filenames** for uniqueness
7. **Create docs/review/ directory** if missing
8. **Show concise summary** including test status
9. **Reference review document** for detailed findings
10. **Suggest fixes** but don't auto-apply (user decision)
11. **Enforce test-first culture** - Emphasize testing in all reviews

### Test Enforcement Checklist

Before invoking code-quality-reviewer agent:

- ✅ Tests executed successfully
- ✅ Zero test failures
- ✅ Changed files coverage ≥ 80%
- ✅ Test results stored in environment variables
- ✅ Per-file coverage calculated
- ❌ If any check fails → BLOCK and exit

## After a Passing Review: Archive Completed Prompts (NON-NEGOTIABLE)

When a code review **passes** (grade A, A-, B+, or any result where the reviewer approves the
work), you MUST archive the prompt(s) that produced this code to the HQ completed directory.

This is the closing step of the Cursor agent prompt lifecycle:
```
1-not-started/ → 2-in-progress/ → [code written] → review-code passes → 3-completed/ (HQ)
```

### Step 1 — Identify the prompt source

Find prompts that were executed and need archiving. Check in priority order:

```bash
YEAR=$(date +%Y)
MONTH=$(date +%B)    # Full month name: April, May, etc.
DAY=$(date +%-d)     # Day without leading zero

# 1. Local repo 3-done/ (pickup-prompt moves here after execution)
LOCAL_DONE="prompts/${YEAR}/${MONTH}/${DAY}/3-done"

# 2. Local repo 2-in-progress/ (currently running)
LOCAL_WIP="prompts/${YEAR}/${MONTH}/${DAY}/2-in-progress"

ls "$LOCAL_DONE"/*.md 2>/dev/null
ls "$LOCAL_WIP"/*.md 2>/dev/null
```

### Step 2 — Archive to HQ (quik-nation-ai-boilerplate)

The canonical archive destination is the boilerplate's `3-completed/` directory:

```bash
HQ_DIR="/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate/prompts/${YEAR}/${MONTH}/${DAY}/3-completed"

# On QCS1, HQ path is:
# HQ_DIR="/Users/ayoungboy/Projects/quik-nation-ai-boilerplate/prompts/${YEAR}/${MONTH}/${DAY}/3-completed"

mkdir -p "$HQ_DIR"

# Archive from 3-done/ (preferred — already executed by pickup-prompt)
for f in "$LOCAL_DONE"/*.md 2>/dev/null; do
  [ -f "$f" ] || continue
  cp "$f" "$HQ_DIR/"
  echo "✅ Archived: $(basename $f) → HQ/3-completed/"
done

# Archive from tasks/prompts/1-not-started/ (team prompts, if review covered them)
for f in "$LOCAL_QUEUE"/*.md 2>/dev/null; do
  [ -f "$f" ] || continue
  cp "$f" "$HQ_DIR/"
  mv "$f" "$(dirname $f)/../3-done/$(basename $f)" 2>/dev/null || true
  echo "✅ Archived + moved to 3-done: $(basename $f)"
done
```

### Step 3 — Post to live feed

```bash
COUNT=$(ls "$HQ_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')
echo "$(date '+%H:%M:%S') | $(basename $(pwd)) | PROMPTS ARCHIVED | ${COUNT} prompt(s) moved to HQ 3-completed/ after passing review" >> ~/auset-brain/Swarms/live-feed.md
```

### When NOT to archive

- Review **fails** (C grade, CRITICAL issues, coverage below 80%) → do NOT archive. Write a
  corrective prompt (Phase 4b) and queue it in `1-not-started/`. The original prompt stays in
  `3-done/` as a record; the corrective prompt is the new work item.
- A prompt is from a **prior day** and already in HQ → skip (check with `ls $HQ_DIR` first).
- No prompts found in any source directory → skip silently (some reviews target ad-hoc diffs,
  not prompt-driven work).

### HQ Directory Structure

```
quik-nation-ai-boilerplate/
└── prompts/
    └── 2026/
        └── April/
            └── 12/
                ├── 1-not-started/    ← New work queued by teams
                ├── 2-in-progress/    ← Currently executing
                ├── 3-done/           ← Execution complete (local heru repo)
                └── 3-completed/      ← Review PASSED — final archive (HQ)
```

---

## Command Metadata

```yaml
name: review-code
category: code-quality
agent: code-quality-reviewer
output_type: markdown_document
output_location: docs/review/
token_cost: ~15,000 (includes test execution)
token_savings: ~40,000 (per future reference)
version: 2.1.0
test_coverage_required: true
minimum_coverage: 80%
blocks_on_failure: true
author: Quik Nation AI
changelog:
  - v3.0.0: Phase 0 (git pull + auto-detect prompt PRs) + Phase 6 (merge passing PRs into develop + delete branches)
  - v2.2.0: Phase 4b — corrective prompt auto-generated to 1-not-started/ when review finds CRITICAL/HIGH issues
  - v2.1.0: Added post-review prompt archival to HQ 3-completed/ (NON-NEGOTIABLE)
  - v2.0.0: Added mandatory 80% test coverage requirement
  - v1.0.0: Initial release with code quality review
```
