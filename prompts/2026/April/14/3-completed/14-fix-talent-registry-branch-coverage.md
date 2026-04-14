# Fix: Talent Registry + Clara Core Branch Coverage

**Source:** Code review `docs/review/20260414-review-prompts-11-12-13.md`
**Grade received:** A-
**Issues to fix:** 0 critical, 0 high, 1 medium (branch coverage threshold)

## Context

The global Jest branch coverage (63.1%) is below the 65% threshold in `backend/jest.config.js`. This pre-dates the current PRs — it was introduced by prompts 06-09 (talent registry and Clara Core GraphQL). All three failing-threshold files are in backend source code and need additional branch tests.

## Required Fixes

### MEDIUM — Branch coverage for talent registry routes

1. **`src/features/talent-registry/talent-registry.routes.ts`** (28.1% branch)
   - **File:** `backend/src/features/talent-registry/talent-registry.routes.ts`
   - **Missing branches:** 404 when talent not found, 400 validation error on submit, authorization check (user does not own talent)
   - **Fix:** Add to `backend/src/__tests__/talent-registry.test.ts` (or create it):
     - `GET /api/talents/:id` with non-existent id → 404
     - `POST /api/talents` with missing required fields → 400
     - `PATCH /api/talents/:id` where req user does not own the talent → 403

2. **`src/features/talent-registry/developer-program.routes.ts`** (22.2% branch)
   - **File:** `backend/src/features/talent-registry/developer-program.routes.ts`
   - **Missing branches:** Already-enrolled guard, Stripe checkout failure, cancellation webhook with missing subscription
   - **Fix:** Add to `backend/src/__tests__/developer-program.test.ts`:
     - `POST /api/developer-program/enroll` when already enrolled → 409 or redirect
     - Mock Stripe checkout creation failure → 500
     - Subscription deletion webhook where no subscription row exists (no-op path)

3. **`src/graphql/clara-core/resolvers.ts`** (13.0% branch)
   - **File:** `backend/src/graphql/clara-core/resolvers.ts`
   - **Missing branches:** Resolver error paths, missing context guards, model not found fallback
   - **Fix:** Extend `backend/src/__tests__/graphql/resolvers.test.ts`:
     - Query with invalid model name → returns default model
     - Query with pro model on free tier → returns tier error shape
     - Missing auth context → free tier fallback

## Acceptance Criteria

- [ ] `npm test -- --coverage` in `backend/` exits with code 0 (all thresholds met)
- [ ] Global branch coverage ≥ 65%
- [ ] `talent-registry.routes.ts` branch coverage ≥ 70%
- [ ] `developer-program.routes.ts` branch coverage ≥ 70%
- [ ] `clara-core/resolvers.ts` branch coverage ≥ 70%
- [ ] All existing tests still pass (zero regressions)
- [ ] Re-run `/review-code` — grade must be A or A-

## Do NOT

- Do not refactor the route or resolver implementations
- Do not add new features
- Do not change the Jest threshold configuration
- Fix only what was identified — add tests only
