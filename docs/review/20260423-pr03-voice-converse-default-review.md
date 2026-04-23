# Code Review — 2026-04-23 · PR #03

**Branch:** `prompt/2026-04-23/03-cli-npm-clara-converse-default`
**Commit:** `c28d3b7a` — feat(desktop,web,ci): voice shell, site install, tag release
**Reviewer:** automated `/review-code`
**Files Changed:** ~40 (desktop, CLI, voice-client, frontend marketing, CI, docs)

---

## ❌ COVERAGE REQUIREMENT CHECK — REVIEW BLOCKED

**Status:** ❌ FAIL — code review cannot proceed as-is

| Suite | Tests Run | Tests Passed | Tests Failed | Coverage |
|-------|-----------|--------------|--------------|----------|
| `packages/cli` | 16 | 16 | 0 | — |
| `packages/clara-voice-client` | 3 | 3 | 0 | — |
| `frontend` | 8 | 8 | 0 | — |

**All tests pass — but critical new files have zero tests.**

### Per-File Coverage

| File | Tests | Status |
|------|-------|--------|
| `packages/cli/src/lib/canonical-greeting.ts` | **0** | ❌ FAIL — most critical new file |
| `packages/cli/src/voice-converse-app.tsx` | **0** | ❌ FAIL + `@ts-nocheck` |
| `frontend/src/app/(marketing)/components/VoiceGreeting.tsx` | **0** | ❌ FAIL |
| `desktop/src/shell-voice-converse.ts` | **0** | ⚠️ browser-only, E2E gap |
| `packages/cli/src/commands/greet.ts` | covered via existing greet tests | ✅ |
| `frontend/src/app/(marketing)/components/CliDemo.tsx` | static server component | ✅ exempt |
| `.github/workflows/release-on-tag.yml` | CI/CD, not unit-tested | ✅ exempt |

### Coverage Regression (C2)

This branch was cut **before PR #56 merged**. The baseline test counts are stale:

| Package | Tests on this branch | Tests after PR #56 | Regression |
|---------|---------------------|---------------------|------------|
| `clara-voice-client` | 3 | 13 | ❌ −10 tests |
| `frontend` | 8 | 10 | ❌ −2 tests |

Merging this branch without rebasing onto develop (post-PR #56) will drop coverage.

---

## 🚫 REVIEW BLOCKED

This PR cannot be merged until:

1. ❌ Tests written for `canonical-greeting.ts` (C1)
2. ❌ Tests written for `VoiceGreeting.tsx` (H1)
3. ❌ `@ts-nocheck` removed from `voice-converse-app.tsx` (C3)
4. ❌ Branch rebased onto `develop` after PR #56 merges (C2)
5. ❌ TypeScript type errors fixed in `voice-converse-app.tsx` revealed by (3) (C3)

---

## Executive Summary

- **Files Reviewed:** 40 changed files, 9 logic-bearing files read
- **Test Coverage:** ❌ critical new files at 0% coverage
- **Issues Found:** 3 critical, 2 high, 2 medium
- **Overall Grade:** D+ (blocked on C1+C3; strong CI and backend work)
- **Review Status:** ❌ BLOCKED

This PR delivers real product value — the tag-release CI pipeline, the Tauri desktop voice shell, the `VoiceGreeting` marketing component, and the `canonical-greeting.ts` architecture are all the right ideas. The implementation quality is good where it exists. The blocking problems are missing tests for the most important new code and a suppressed TypeScript compiler.

---

## Critical Issues

### C1 — `canonical-greeting.ts` has zero tests (BLOCKING)

**File:** `packages/cli/src/lib/canonical-greeting.ts`
**Lines:** ~120

This is the most critical new file in the entire PR. It contains:
- Cache read/write logic (`readGreetingFromCache`, `writeGreetingToCache`) using XDG paths
- Primary call to `postVoiceConverse` to get `reply_audio_base64`
- Fallback branch to legacy `/voice/respond` endpoint
- Temp-file decode + audio playback via `playAudioFile`
- Full error/fallback/result union return type

Every `greet` command invocation flows through this function. It has **zero tests**.

**Required:** At minimum 8 tests:
1. Cache hit path (cache exists, no network call)
2. Cache miss → `postVoiceConverse` success → audio played → cache written
3. `postVoiceConverse` returns no `reply_audio_base64` → fallback to `/voice/respond`
4. Both upstream calls fail → `{ ok: false, message }` returned
5. `CLARA_VOICE_URL` not set → immediate `{ ok: false }` without network call
6. Cache write failure is non-fatal (audio still plays)
7. `--refresh` flag bypasses cache (if that flag is wired)
8. `playAudioFile` error is caught and returned as `{ ok: false }`

All of these are mockable with `jest.mock('fs')` + `jest.mock('../services/voice-usage.service')` — no real filesystem or network needed.

### C2 — Coverage regression: branch predates PR #56 (BLOCKING)

**Root cause:** This branch was cut from `develop` before PR #56 (13-test voice-client coverage + 2-test frontend additions) was merged.

Merging PR #03 as-is would silently drop:
- 10 voice-client tests (`postVoiceConverse`, cache utils, converse-browser re-exports, discriminated union typing)
- 2 frontend tests (InstallSection copy-button behavior)

**Required:** Rebase `prompt/2026-04-23/03-cli-npm-clara-converse-default` onto `develop` after PR #56 merges. Resolve conflicts — the main expected conflict is `InstallSection.tsx` (PR #56 changed "18+ required" to "20+ required"; PR #03 has "20+ recommended"). Keep "20+ recommended" from this branch.

### C3 — `@ts-nocheck` in `voice-converse-app.tsx` (BLOCKING)

**File:** `packages/cli/src/voice-converse-app.tsx`
**Line:** 1 — `// @ts-nocheck`

This is the main voice TUI component. Suppressing TypeScript for it means:
- All prop type errors, wrong `useState` generics, and incorrect hook signatures are invisible
- Any future regression involving type mismatches will not be caught at compile time
- CI's `tsc --noEmit` step passes even if the component has fundamental type errors

**Required:** Remove `// @ts-nocheck`. Fix the TypeScript errors it was hiding (likely: Ink component prop types, `useInput` callback signature, `Buffer.from` vs `Uint8Array`). Use `// @ts-expect-error` with a comment on specific lines if a third-party type is genuinely wrong — not a blanket nocheck.

---

## High Priority Issues

### H1 — `VoiceGreeting.tsx` has zero tests (HIGH)

**File:** `frontend/src/app/(marketing)/components/VoiceGreeting.tsx`
**Lines:** ~130

This component has real logic that needs coverage:
- `autoplayAttempted.current` ref prevents double-invocation on React 18 strict mode double-mount
- `sessionStorage` gate prevents re-playing on same-session navigation
- `NotAllowedError` catch branch (browser autoplay policy blocked)
- Four `VoiceStatus` state phases: `idle → loading → playing → done/error`
- Hardcoded `CLARA_GREETING` constant used as TTS input

**Required:** 4 Vitest + JSDOM tests:
1. Does not call `/api/voice/tts` when `sessionStorage` key is already set
2. Sets `sessionStorage` key after successful playback
3. Catches `NotAllowedError` → transitions to `error` status without throwing
4. `autoplayAttempted.current` prevents second call on re-render

### H2 — `shell-voice-converse.ts` explicitly untestable in unit context (HIGH — gap acknowledgment)

**File:** `desktop/src/shell-voice-converse.ts`
**Lines:** ~300

This file uses `MediaRecorder`, `getUserMedia`, `AudioContext`, and `Audio` — all browser-only APIs with no Node.js equivalent. Unit testing is not feasible.

**Required:** Add a comment block at the top of the file:
```typescript
// Unit tests: not applicable (MediaRecorder + getUserMedia are browser-only).
// Covered by E2E: docs/testing/desktop-voice-e2e-plan.md (to be written).
```

And create `docs/testing/desktop-voice-e2e-plan.md` with a stub outlining:
- Tauri E2E test setup (WebDriver or custom IPC test harness)
- Test scenarios: push-to-talk toggles recording state, audio sent to backend, reply plays
- Timeframe: before GA, not required for beta

### H3 — Legacy `/voice/respond` fallback still present (HIGH)

**File:** `packages/cli/src/lib/canonical-greeting.ts`

The fallback to `/voice/respond` in `playCanonicalGreeting()` means the system can silently regress to the old non-converse endpoint if `postVoiceConverse` returns no audio. This is a hidden state that makes it harder to detect when the new backend route is misconfigured.

**Required:** Either:
- Remove the fallback and let a missing `reply_audio_base64` return `{ ok: false, message: "Voice service returned no audio" }` — forces the backend to be correct, makes failures visible
- OR keep the fallback but log `logger.warn("postVoiceConverse returned no audio; falling back to /voice/respond")` so it's observable

---

## Medium Priority Issues

### M1 — API key in `<meta>` tag is visible to all page scripts

**File:** `desktop/shell/index.html`
```html
<meta name="clara-voice-api-key" content="" />
```

`shell-voice-converse.ts` reads this at runtime. In a local Tauri context this is acceptable — no cross-origin threat, no remote content. But:
- Any injected content in the webview can read `document.querySelector('meta[name="clara-voice-api-key"]').content`
- If the key is injected by Tauri init code, it will briefly appear in the DOM before the first request

**Recommended:** Inject the key via Tauri's IPC bridge (`invoke('get_voice_api_key')`) rather than a meta tag. The key never appears in DOM. Lower priority for beta; should be resolved before GA.

### M2 — `CLARA_GREETING` hardcoded constant

**File:** `frontend/src/app/(marketing)/components/VoiceGreeting.tsx`

The greeting text is hardcoded. If the copy changes, a deploy is required. Low priority now; consider making it a `NEXT_PUBLIC_CLARA_GREETING_TEXT` env var before GA so marketing can update it without a code change.

---

## Positive Findings

**Tag-release CI (`release-on-tag.yml`) — well structured:**
- Pinned action hashes (not floating tags) — supply chain safe
- Proper `NPM_TOKEN` guard (`if: env.NPM_TOKEN != ''`) — graceful degradation when secret not set
- pnpm `9.15.4` pinned — reproducible installs
- macOS-latest for Tauri `.dmg` — correct platform
- Voice-client built before CLI (correct dependency order)

**Backend route (`/api/voice/converse` from PR #57 / session prompt):**
- Tested: 26/26 backend tests pass
- Correct `requireClaraOrClerk` + `voiceLimiter` + `voiceLimitMiddleware` chain
- Env var fallback chain (`VOICE_SERVER_URL` → `HERMES_GATEWAY_URL`) is clean
- `HERMES_TIMEOUT_MS = 150_000` correctly applied for Modal cold starts

**`CliDemo.tsx` — correctly a static server component:**
- No client-side logic, no useEffect, no state
- Zero runtime risk — exempt from coverage requirement

**`converse-browser.ts` (from PR #56, already reviewed):**
- Pure re-exports, no Node.js `fs` dependency — correct browser entry point pattern

---

## Required Actions Before Merge

```bash
# 1. Wait for PR #56 to merge to develop
# 2. Rebase this branch
git fetch origin
git rebase origin/develop
# Resolve conflict in InstallSection.tsx — keep "20+ recommended"

# 3. Remove @ts-nocheck from voice-converse-app.tsx
# Fix the TypeScript errors it was hiding

# 4. Add tests for canonical-greeting.ts
# packages/cli/src/__tests__/lib/canonical-greeting.test.ts
# Minimum 8 tests listed in C1 above

# 5. Add Vitest tests for VoiceGreeting.tsx
# frontend/src/app/(marketing)/components/VoiceGreeting.test.tsx
# Minimum 4 tests listed in H1 above

# 6. Add untestable file comment + E2E gap doc for shell-voice-converse.ts

# 7. Re-run all test suites
cd packages/cli && npm test       # Must include canonical-greeting.test.ts
cd packages/clara-voice-client && npm test  # Must have 13 tests after rebase
cd frontend && npm test           # Must include VoiceGreeting.test.tsx

# 8. Re-run review-code
```

---

## Unblock Prompt

See: `prompts/2026/April/23/1-not-started/07-unblock-pr03-tests-and-ts.md` (to be written)

---

**Review Status: ❌ BLOCKED**
**Next Action:** Write unblock prompt, then merge PR #56, then execute unblock prompt on rebased branch.
