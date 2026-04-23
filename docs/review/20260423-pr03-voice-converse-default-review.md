# Code Review — 2026-04-23 · PR #03

**Branch:** `prompt/2026-04-23/03-cli-npm-clara-converse-default`
**Commit:** `c28d3b7a` — feat(desktop,web,ci): voice shell, site install, tag release
**Reviewer:** automated `/review-code`
**Files Changed:** ~40 (desktop, CLI, voice-client, frontend marketing, CI, docs)

---

## ❌ COVERAGE REQUIREMENT CHECK — REVIEW BLOCKED

**Status:** ❌ FAIL — code review cannot proceed as-is

| Suite | Tests Run | Tests Passed | Tests Failed |
|-------|-----------|--------------|--------------|
| `packages/cli` | 16 | 16 | 0 |
| `packages/clara-voice-client` | 3 | 3 | 0 |
| `frontend` | 8 | 8 | 0 |

All tests pass — but critical new files have zero tests, and coverage regressed from PR #56.

### Per-File Coverage

| File | Tests | Status |
|------|-------|--------|
| `packages/cli/src/lib/canonical-greeting.ts` | 0 | ❌ FAIL — most critical new file |
| `packages/cli/src/voice-converse-app.tsx` | 0 | ❌ FAIL + `@ts-nocheck` |
| `frontend/src/app/(marketing)/components/VoiceGreeting.tsx` | 0 | ❌ FAIL |
| `desktop/src/shell-voice-converse.ts` | 0 | ⚠️ browser-only, E2E gap |
| `packages/cli/src/commands/greet.ts` | covered via existing tests | ✅ |
| `frontend/src/app/(marketing)/components/CliDemo.tsx` | static server component | ✅ exempt |
| `.github/workflows/release-on-tag.yml` | CI/CD | ✅ exempt |

### Coverage Regression (C2)

Branch cut before PR #56 merged. Stale baselines:

| Package | Tests on this branch | Tests after PR #56 | Regression |
|---------|---------------------|---------------------|------------|
| `clara-voice-client` | 3 | 13 | ❌ −10 tests |
| `frontend` | 8 | 10 | ❌ −2 tests |

---

## 🚫 REVIEW BLOCKED

Cannot merge until:

1. ❌ Tests written for `canonical-greeting.ts` (C1)
2. ❌ Branch rebased onto `develop` after PR #56 merges (C2)
3. ❌ `@ts-nocheck` removed from `voice-converse-app.tsx` + TS errors fixed (C3)
4. ❌ Tests written for `VoiceGreeting.tsx` (H1)
5. ❌ E2E gap doc for `shell-voice-converse.ts` (H2)

---

## Executive Summary

- **Files Reviewed:** 40 changed, 9 logic-bearing files read
- **Issues Found:** 3 critical, 2 high, 2 medium
- **Overall Grade:** D+ (blocked; CI and backend work is solid)
- **Review Status:** ❌ BLOCKED

Unblock prompt: `prompts/2026/April/23/1-not-started/07-unblock-pr03-tests-and-ts.md`

---

## Critical Issues

### C1 — `canonical-greeting.ts` — 0 tests (BLOCKING)

**File:** `packages/cli/src/lib/canonical-greeting.ts` (~120 lines)

Every `greet` command invocation flows through this file. It contains cache read/write,
the `postVoiceConverse` call, the `/voice/respond` fallback, temp-file decode, and audio
playback. Zero tests. Eight required — see unblock prompt for exact spec.

### C2 — Coverage regression: branch predates PR #56 (BLOCKING)

Merging drops 10 voice-client tests and 2 frontend tests silently. Must rebase onto
`develop` after PR #56 merges. Expected conflict: `InstallSection.tsx` — keep PR #03
wording "20+ recommended".

### C3 — `@ts-nocheck` in `voice-converse-app.tsx` (BLOCKING)

**File:** `packages/cli/src/voice-converse-app.tsx` line 1

Main voice TUI with all TypeScript suppressed. CI's `tsc --noEmit` passes even with
fundamental type errors in this component. Remove, fix the underlying errors (prop types,
`useInput` Key import, `ConverseResult` discriminated union).

---

## High Priority Issues

### H1 — `VoiceGreeting.tsx` — 0 tests

**File:** `frontend/src/app/(marketing)/components/VoiceGreeting.tsx` (~130 lines)

Complex autoplay logic: `autoplayAttempted.current` ref, `sessionStorage` gate,
`NotAllowedError` catch, four `VoiceStatus` phases. Four Vitest + JSDOM tests required —
see unblock prompt for exact code.

### H2 — `shell-voice-converse.ts` — E2E gap undocumented

**File:** `desktop/src/shell-voice-converse.ts` (~300 lines)

Browser-only APIs (MediaRecorder, getUserMedia, AudioContext) — unit testing not feasible.
Needs an explicit comment stating this and a stub E2E plan doc so the gap is intentional,
not an oversight.

---

## Medium Priority Issues

### M1 — API key in `<meta>` tag visible to page scripts

`desktop/shell/index.html` injects `clara-voice-api-key` into a meta tag. Acceptable for
local Tauri beta; before GA, inject via Tauri IPC (`invoke('get_voice_api_key')`) so the
key never appears in the DOM.

### M2 — `CLARA_GREETING` hardcoded in `VoiceGreeting.tsx`

Copy changes require a deploy. Consider `NEXT_PUBLIC_CLARA_GREETING_TEXT` env var before GA.

---

## Positive Findings

- **`release-on-tag.yml`** — pinned action hashes, proper `NPM_TOKEN` guard, pnpm pinned,
  macOS-latest for Tauri, correct voice-client → CLI build order. Well structured.
- **Backend `/api/voice/converse`** (PR #57) — 26/26 tests, correct middleware chain,
  clean env var fallback, `HERMES_TIMEOUT_MS` applied correctly.
- **`CliDemo.tsx`** — pure static server component, correctly exempt from coverage.
- **`converse-browser.ts`** — pure re-exports, no Node.js `fs` dependency. Correct.

---

**Review Status: ❌ BLOCKED**
**Unblock:** `prompts/2026/April/23/1-not-started/07-unblock-pr03-tests-and-ts.md`
**Merge order:** PR #56 → rebase PR #03 → prompt 07 → re-review → merge PR #03
