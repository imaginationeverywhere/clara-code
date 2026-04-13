# S2-04 — Test Suite Audit + Voice Routes Verification

**Repo:** `imaginationeverywhere/clara-code`
**Branch:** `fix/test-suite-clean`
**Owner:** Miles (Backend)
**Priority:** LOW — voice tests are currently passing; this is a full audit pass

---

## Context

The voice-routes test suite was flagged as having an import error
(`Cannot find module './voice'`). This has since been resolved — the test at
`backend/src/__tests__/routes/voice.test.ts` passes cleanly (5/5 tests, confirmed
locally). This prompt is a full test suite audit to verify all 7 suites are green
and address any remaining issues.

---

## Step 1: Run Full Test Suite

```bash
cd backend
npm test -- --coverage 2>&1 | tee /tmp/test-results.txt
cat /tmp/test-results.txt
```

Expected result: **7/7 test suites passing**, lines ≥80%, branches ≥65%, functions ≥80%.

---

## Step 2: Triage Any Failures

For each failing suite:

1. Read the error message carefully — is it a runtime error, import error, or test assertion?
2. Check if the source file the test imports still exists and hasn't been renamed
3. Check that Jest path aliases (`@/...`) resolve correctly via `moduleNameMapper` in `jest.config.ts`
4. If a test mocks a module that no longer exists, update the mock path

**Common issues to look for:**

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `Cannot find module './voice'` | Route file renamed or moved | Update import path in test |
| `Cannot find module '@/routes/voice'` | tsconfig path alias not in jest.config | Add to `moduleNameMapper` |
| `TypeError: xxx is not a function` | Mock not set up correctly | Fix `jest.mock()` factory |
| Coverage below threshold | New code added without tests | Add test cases |

---

## Step 3: Verify Voice Route Import Chain

Even though the test passes, confirm the import chain is correct:

```bash
# 1. Confirm voice.ts exists
ls backend/src/routes/voice.ts

# 2. Confirm routes/index.ts imports it correctly
grep -n "voice" backend/src/routes/index.ts

# 3. Confirm server.ts or app.ts registers /api routes
grep -rn "routes" backend/src/server.ts backend/src/app.ts 2>/dev/null | head -10
```

Expected: `routes/index.ts` imports `./voice` and mounts it under `/api`.

---

## Step 4: Confirm 80% Coverage Threshold Holds

```bash
npm test -- --coverage --coverageReporters=text-summary 2>&1 | tail -20
```

If coverage dips below 80% lines (possible if new source files were added in the
recent review-fix commits), add targeted test cases for:
- Any new utility functions in `backend/src/utils/`
- Any new middleware added in `backend/src/middleware/`
- The `waitlist` route if it lacks coverage

---

## Step 5: Fix Any Remaining Issues

For each issue found:
- Fix in the **same branch** (`fix/test-suite-clean`)
- Keep fixes minimal — don't refactor unrelated code
- Add a test if a code path has zero coverage

---

## Acceptance Criteria

- [ ] `npm test` reports 7/7 suites passing, 0 failures
- [ ] Line coverage ≥ 80% (`coverageThreshold` in jest.config.ts)
- [ ] Branch coverage ≥ 65%
- [ ] Function coverage ≥ 80%
- [ ] No `Cannot find module` errors in any suite
- [ ] `npx tsc --noEmit` clean in `backend/`

---

## Branch & PR

```bash
git checkout -b fix/test-suite-clean develop
# ... fixes if any ...
git push origin fix/test-suite-clean
gh pr create --base develop --head fix/test-suite-clean \
  --title "fix(backend): test suite audit — all 7 suites green" \
  --body "Full test suite verification. Voice import confirmed. Coverage at/above threshold."
```

If all tests already pass and no changes are needed, open a PR with a doc-only change
confirming the audit result:
```bash
echo "# Test Audit — $(date +%Y-%m-%d)\nAll 7 suites pass. Coverage above threshold." \
  >> backend/TEST-AUDIT.md
git add backend/TEST-AUDIT.md
git commit -m "docs(backend): record test suite audit — all green"
git push origin fix/test-suite-clean
```
