# maat-test-all — Haiku Dispatches Cloud Test Agents Across All Herus

You are Claude Haiku, the Tier 2 Monitor. Dispatch Cursor CLOUD agents to ensure comprehensive test coverage across all 5 active Herus. Cloud agents are UNLIMITED — dispatch all 5 in parallel.

## TESTING STANDARD (Set by Architect — Do NOT Override)

| Test Type | Tool | Standard |
|-----------|------|----------|
| Unit Tests | Jest | 80% coverage minimum |
| Smoke Tests | Jest (code traces) + Maestro (mobile) | Critical path wiring verified |
| E2E Tests | Playwright (web) / Maestro (mobile) | Full user flows |
| Regression Tests | Jest + Playwright | Existing features still work |
| Type Check | tsc --noEmit / pnpm type-check | Zero errors |

## EXECUTE

### Step 1: Safety Check
```bash
AGENT_COUNT=$(ps aux | grep cursor-agent | grep -v grep | wc -l)
echo "Local agents running: $AGENT_COUNT"
```
Cloud agents do NOT count toward the 4 local limit. Dispatch freely.

### Step 2: Dispatch 5 Cloud Test Agents (Parallel)

#### Agent 1: QuikCarRental Tests
```bash
cursor agent --print --trust --force \
  --workspace /Volumes/X10-Pro/Native-Projects/Quik-Nation/quikcarrental \
  'You are a testing agent. Your ONLY job is tests. Do NOT modify application code.

PROJECT: QuikCarRental (car rental platform)
TECH: React Native (Expo), Next.js, Express + Apollo Server, PostgreSQL

TASKS:
1. Run existing tests: npm test 2>&1 | tail -50
2. Check coverage: npx jest --coverage 2>&1 | tail -30
3. If coverage < 80%, write unit tests for:
   - backend/graphql/resolvers/ (test each resolver)
   - frontend critical components (booking, checkout, vehicle browse)
4. Write smoke tests that verify:
   - API health check responds 200
   - GraphQL schema loads without errors
   - Critical mutations exist (createReservation, processPayment)
   - Auth middleware blocks unauthenticated requests
5. Write Playwright E2E tests (frontend/e2e/):
   - Homepage loads
   - Vehicle search returns results
   - Booking flow: search → select → checkout → confirmation
   - Login/Register flow
6. Write Maestro mobile tests (mobile/maestro/):
   - App launches without crash
   - Login flow
   - Vehicle browse and detail
   - Booking flow
7. Run ALL tests, fix failures
8. Commit test files: git add -A && git commit -m "test: comprehensive test suite — 80% coverage target, smoke, E2E, Maestro" && git push

Write results to /tmp/test-results-qcr.md with:
- Coverage percentage (before and after)
- Tests passing / failing / skipped
- What was written
- What still needs work' \
  > /tmp/cursor-cloud-test-qcr-$(date +%s).log 2>&1 &
```

#### Agent 2: FMO Tests
```bash
cursor agent --print --trust --force \
  --workspace /Volumes/X10-Pro/Native-Projects/clients/fmo \
  'You are a testing agent. Your ONLY job is tests. Do NOT modify application code.

PROJECT: FMO Fine Male Grooming (barbershop/salon booking)
TECH: React Native (Expo), Next.js, Express + Apollo Server, PostgreSQL

TASKS:
1. Run existing tests: npm test 2>&1 | tail -50
2. Check coverage: npx jest --coverage 2>&1 | tail -30
3. If coverage < 80%, write unit tests for:
   - backend/graphql/resolvers/ (appointments, booking, wallet, availability, voice-agent)
   - DataLoader N+1 prevention (verify loaders batch correctly)
   - Staff conflict detection (checkStaffConflict utility)
   - Wallet security (webhook validation, idempotency)
4. Write smoke tests:
   - API health responds 200
   - GraphQL schema loads
   - Critical mutations exist (createAppointment, processPayment, submitBooking)
   - Auth middleware blocks unauthenticated
   - staffAvailability requires auth (NEW — just added)
5. Write Playwright E2E tests (frontend/e2e/):
   - Homepage loads
   - Service listing
   - Booking flow: select service → pick time → confirm → pay
   - Membership signup
6. Write Maestro mobile tests (mobile/maestro/):
   - App launches
   - Role-based routing (customer vs staff vs admin)
   - Appointment booking flow
   - Voice booking button appears
7. Run ALL tests, fix failures
8. Commit and push

Write results to /tmp/test-results-fmo.md' \
  > /tmp/cursor-cloud-test-fmo-$(date +%s).log 2>&1 &
```

#### Agent 3: World Cup Ready Tests
```bash
cursor agent --print --trust --force \
  --workspace /Volumes/X10-Pro/Native-Projects/clients/world-cup-ready \
  'You are a testing agent. Your ONLY job is tests. Do NOT modify application code.

PROJECT: World Cup Ready (travel readiness platform)
TECH: React Native (Expo), Next.js, Express + Apollo Server, PostgreSQL

TASKS:
1. Run existing tests: npm test 2>&1 | tail -50
2. Check coverage: npx jest --coverage 2>&1 | tail -30
3. If coverage < 80%, write unit tests for:
   - backend/graphql/resolvers/ (shop, events, orders, passport)
   - Payment services (Stripe, Yapit dual payment router)
   - Communication services (Twilio SMS, SendGrid email)
4. Write smoke tests:
   - API health responds 200
   - GraphQL schema loads
   - Critical mutations exist (createOrder, processCheckout)
   - Dual payment router routes correctly
5. Write Playwright E2E tests (frontend/e2e/):
   - Homepage loads with countdown
   - Assessment v3 flow start to finish
   - Shop: browse → add to cart → checkout → success
   - Events page loads
6. Write Maestro mobile tests (mobile/maestro/):
   - App launches
   - Onboarding flow
   - Assessment flow
   - Shop browse and cart
7. Run ALL tests, fix failures
8. Commit and push

Write results to /tmp/test-results-wcr.md' \
  > /tmp/cursor-cloud-test-wcr-$(date +%s).log 2>&1 &
```

#### Agent 4: Site962 Tests
```bash
cursor agent --print --trust --force \
  --workspace /Volumes/X10-Pro/Native-Projects/Quik-Nation/site962 \
  'You are a testing agent. Your ONLY job is tests. Do NOT modify application code.

PROJECT: Site962 (multi-purpose facility — events, food court, barbershop)
TECH: Next.js 14, MongoDB + Mongoose, Express + Apollo (PostgreSQL scaffold)

TASKS:
1. Run existing tests: npm test 2>&1 | tail -50
2. Check coverage: npx jest --coverage 2>&1 | tail -30
3. If coverage < 80%, write unit tests for:
   - Server actions (app/actions/)
   - API routes (app/api/)
   - MongoDB models
   - POS system
4. Write smoke tests:
   - Homepage loads
   - Event listing works
   - API routes respond correctly
   - MongoDB connection works
   - Backend GraphQL health check (port 3050)
5. Write Playwright E2E tests (check if e2e/ or __tests__/e2e/ exists):
   - Homepage loads
   - Event discovery: browse → detail → purchase ticket
   - POS flow (if accessible)
   - Organizer dashboard loads (auth required)
6. Run ALL tests, fix failures
7. Commit and push

Write results to /tmp/test-results-site962.md' \
  > /tmp/cursor-cloud-test-site962-$(date +%s).log 2>&1 &
```

#### Agent 5: QuikCarry Tests
```bash
cursor agent --print --trust --force \
  --workspace /Volumes/X10-Pro/Native-Projects/Quik-Nation/quikcarry \
  'You are a testing agent. Your ONLY job is tests. Do NOT modify application code.

PROJECT: QuikCarry (delivery/courier platform)
TECH: React Native (Expo + bare), Next.js, Express + Apollo Server, PostgreSQL, pnpm monorepo

TASKS:
1. Run existing tests: pnpm test 2>&1 | tail -50
2. Check coverage: pnpm --filter backend jest --coverage 2>&1 | tail -30
3. If coverage < 80%, write unit tests for:
   - backend resolvers (trip, booking, corporate, partner, delivery, group)
   - Driver matching algorithm
   - Pricing engine (surge, multi-city)
   - Corporate/Partner auth (JWT validation)
4. Write smoke tests:
   - API health responds 200
   - GraphQL schema loads
   - Critical mutations exist (requestTrip, acceptTrip, completeTrip)
   - Corporate and Partner auth work
   - Group booking system
5. Write Playwright E2E tests (admin/ and business/):
   - Admin dashboard loads
   - Driver management page
   - Request management page
   - Business portal PO page
6. Write Maestro mobile tests:
   - Rider app launches
   - Driver app launches
   - Business app launches
   - Login flow per app
7. Run ALL tests, fix failures
8. Commit and push

Write results to /tmp/test-results-quikcarry.md' \
  > /tmp/cursor-cloud-test-quikcarry-$(date +%s).log 2>&1 &
```

### Step 3: Monitor Results
After dispatching all 5:
1. Wait 15 minutes
2. Check logs: `ls -la /tmp/cursor-cloud-test-*.log`
3. Check result files: `cat /tmp/test-results-*.md 2>/dev/null`
4. If any agent failed, re-dispatch with clearer instructions (max 2 re-dispatches per agent)
5. If an agent fails 3 times, mark it as BLOCKED and report to HQ — do not keep retrying

### Step 4: Quality Report
After all agents complete, write to `/tmp/haiku-test-quality-report.md` (this is the detailed file for Opus).

Then post a PLAIN ENGLISH summary to Slack. NO TABLES. Just say what passed and failed:

```
Test results:
- QCR: 47 passed, 3 failed (createReservation, vehicleSearch, paymentCapture)
- FMO: 52 passed, 0 failed
- Site962: 31 passed, 1 failed (eventPurchase timeout)
- QuikCarry: 38 passed, 2 failed (groupBooking, surgePrice)
- WCR: 44 passed, 0 failed

3 projects clean. Dispatching fixes for QCR and QuikCarry.
```

That's it. Numbers + names of what failed. No tables, no headers, no condition matrices.

## Rules
- You are the MONITOR — dispatch agents, do NOT write tests yourself
- Cloud agents are unlimited — dispatch all 5 in parallel
- ONE project per agent — focused task
- Do NOT modify application code — tests ONLY
- If a project has no test infrastructure (no jest.config.js), create it
- Commit test files separately from application code
- Report everything to the quality report
