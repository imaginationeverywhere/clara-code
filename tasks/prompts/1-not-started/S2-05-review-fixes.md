# S2-05 — Fix All Code Review Issues (CRIT + HIGH)

**Sprint:** 2
**Owner:** Carruthers (Tech Lead)
**Branch:** `fix/s2-review-issues`
**Base:** `develop`
**Priority:** BLOCKER — CRIT-01 must be resolved before any production promotion
**Review source:** `docs/review/20260412-180043-code-review.md`

---

## Context

Carruthers ran a full code review of all 7 branches merged into develop during Sprint 1/2.
The review returned Grade B with 1 CRITICAL, 3 HIGH, 4 MEDIUM issues.

This prompt addresses only the **CRITICAL and HIGH** issues. Medium/Low issues are Sprint 3.

---

## Your Task

Fix all 4 issues below, in the order listed. Each is a discrete change — do not mix them.
Work on branch `fix/s2-review-issues` branched from `develop`.

---

## Issue 1 — CRIT-01: Remove Hardcoded Modal URL from Desktop Client

**File:** `desktop/src/voice-overlay.ts`
**Rule:** No Modal/server URLs in client-side code. All voice calls must go through Next.js API routes.

**What to change:**
1. Remove the `TTS_URL` constant (lines 3–4) entirely.
2. Find the `fetch(TTS_URL, ...)` call in the button click handler.
3. Replace it with a `fetch("/api/voice/tts", ...)` call posting the same JSON body (`{ text }`).
4. The response handling stays the same — you are only changing the URL.

**Do not change:** the response parsing logic, the audio playback code, the button behavior, or anything else in the file.

**Verify:** After your change, `grep -n "modal.run" desktop/src/voice-overlay.ts` must return zero results.

---

## Issue 2 — HIGH-01: Mobile API Base Must Use Env Var

**File:** `mobile/constants/api.ts`

**What to change:**
1. Change the `CLARA_API_BASE` constant so it reads from `process.env.EXPO_PUBLIC_CLARA_API_BASE` first, and falls back to the current dev ngrok URL if the env var is not set.

**Do not change:** the `chatUrl()`, `voiceSttUrl()`, `voiceTtsUrl()` functions. Only the constant assignment.

**Verify:** The constant line should read approximately:
```
EXPO_PUBLIC_CLARA_API_BASE ?? 'https://clara-code-backend-dev.ngrok.quiknation.com'
```

---

## Issue 3 — HIGH-03: Remove CLI Dist Artifacts from Git

**Files:** `packages/cli/dist/` (entire directory)

**What to change:**
1. Add the line `packages/cli/dist/` to the repo root `.gitignore` file.
2. Stage the `.gitignore` change.
3. Run `git rm -r --cached packages/cli/dist/` to untrack the dist directory without deleting the local files.
4. Stage the removal.

**Do not:** delete the local `packages/cli/dist/` directory from disk — the developer needs it for local testing. Only untrack it from git.

**Verify:** `git status` should show the dist files as untracked (not staged), and `.gitignore` should contain the new entry.

---

## Issue 4 — HIGH-02: Add Missing Branch Coverage Tests

**Files to add tests in:**
- `backend/src/__tests__/routes/keys.test.ts`
- `backend/src/__tests__/config/database.test.ts`
- `backend/src/__tests__/middleware/rate-limit.test.ts`

**Target:** Bring branch coverage from 70.49% to ≥ 80% overall.

Read each existing test file first to understand the testing patterns used. Then add tests for the uncovered branches only — do not rewrite existing tests.

### `keys.test.ts` — add tests for:
- `GET /api/keys/:id` where the key does not belong to the requesting user → expect 403
- `DELETE /api/keys/:id` where the key is not found → expect 404
- `POST /api/keys` with a name longer than the allowed max → expect 400

### `rate-limit.test.ts` — add a test for:
- Making requests past the rate limit threshold → expect HTTP 429 with a `Retry-After` header

### `database.test.ts` — add a test for:
- Simulating a failed `authenticate()` call (mock `sequelize.authenticate` to reject) → verify the function throws or logs the error

**Do not change** the implementation files. Tests only.

**Verify:** Run `npm test -- --coverage` in the `backend/` directory. Branch coverage must be ≥ 80%.

---

## Acceptance Criteria

- [ ] `grep -rn "modal.run" desktop/src/` returns zero results
- [ ] `mobile/constants/api.ts` uses `EXPO_PUBLIC_CLARA_API_BASE` env fallback
- [ ] `packages/cli/dist/` appears in `.gitignore` and is untracked
- [ ] `cd backend && npm test -- --coverage` exits 0 with branch coverage ≥ 80%
- [ ] All 77 existing backend tests still pass (zero regressions)
- [ ] Single PR to `develop` titled `fix(review): resolve CRIT-01 and HIGH-01/02/03 from sprint review`

---

## What NOT to Do

- Do not modify the implementation of any voice route or proxy
- Do not change `packages/web-ui` or `frontend/` files
- Do not touch ECS deploy configs or CI workflows
- Do not fix Medium or Low issues from the review (those are Sprint 3)
- Do not merge — open a PR and stop

---

## After You Finish

```bash
git push origin fix/s2-review-issues
# Open PR to develop with title: fix(review): resolve CRIT-01 and HIGH-01/02/03 from sprint review
```

Then post to the live feed:
```bash
echo "$(date '+%H:%M:%S') | clara-code | FIX COMPLETE | S2-05 | CRIT-01 + HIGH-01/02/03 resolved | PR open — awaiting Carruthers merge" >> ~/auset-brain/Swarms/live-feed.md
```
