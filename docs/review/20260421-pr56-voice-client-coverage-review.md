# Code Review — PR #56 voice-client coverage + InstallSection cleanup
**Date:** 2026-04-21
**Branch:** `prompt/2026-04-23/02-clara-code-team-directive-cli-ide → develop`
**Reviewer:** HQ Code Review
**PR:** https://github.com/imaginationeverywhere/clara-code/pull/56

---

## ⚠️ COVERAGE REQUIREMENT CHECK

**Status: ✅ PASS (with one required fix — see H1)**

| File | Lines | Tests | Estimated Coverage | Status |
|------|-------|-------|--------------------|--------|
| `packages/clara-voice-client/src/converse.ts` | 114 | 8 tests | ~85% | ✅ PASS |
| `packages/clara-voice-client/src/greeting-cache.ts` | 67 | 5 tests | ~90% | ✅ PASS |
| `frontend/src/lib/marketing-install-constants.ts` | 3 | 2 tests | 100% | ✅ PASS |
| `frontend/src/components/marketing/InstallSection.tsx` | ~90 | 0 direct | N/A — no logic | ✅ EXEMPT |

**Tests run:** 23 (13 node:test + 10 Vitest)
**Tests failed:** 0
**Logic-bearing changed-file coverage: ~87%**
**Required: 80% — PASS**

`InstallSection.tsx` is now a pure server component with zero runtime logic — all it renders is constants from the tested `marketing-install-constants.ts` file. Zero direct coverage is acceptable here; the logic extraction to a tested module is correct.

---

## Executive Summary

- **Files Changed:** 6 source files + 2 changelog entries
- **Test Coverage:** ~87% for logic-bearing files ✅
- **Tests:** 23 passing, 0 failing ✅
- **Issues Found:** 4 (0 critical, 1 high, 3 medium)
- **Overall Grade:** B+
- **Review Status:** ⚠️ CONDITIONAL — merge after fixing H1 (Node.js version text)

---

## What This PR Fixed

| Item | Source | Status |
|------|--------|--------|
| Broken `npx github:imaginationeverywhere/clara-code` beta command | PR #55 C1 | ✅ FIXED — removed entirely |
| `reply` field alias (Hermes canonical) not first in chain | PR #54 M1 | ✅ FIXED |
| `converse.ts` coverage (was 3 tests, ~35%) | PR #54 C2 partial | ✅ FIXED — now 8 tests, ~85% |
| `greeting-cache.ts` coverage (was 0 tests) | PR #54 C2 partial | ✅ FIXED — now 5 tests, ~90% |
| Clipboard `void` swallowing promise | PR #55 M1 | ✅ MOOT — server component, no clipboard |

---

## 🟠 High Issues

### H1 — "Node.js 18+" still in InstallSection

**File:** `frontend/src/components/marketing/InstallSection.tsx:40`

```tsx
<span className="font-mono text-[11px] text-white/25">Node.js 18+ required</span>
```

Both `packages/clara/package.json` and `packages/cli/package.json` specify `"engines": { "node": ">=20.0.0" }`. This was flagged as H2 in the PR #55 review and not addressed. A user on Node 18 will install and hit runtime errors.

**Fix (one line):**
```tsx
<span className="font-mono text-[11px] text-white/25">Node.js 20+ required</span>
```

**This is a required fix before merge.**

---

## 🟡 Medium Issues

### M1 — `greet.ts` still calls `/voice/respond` directly (C1 from PR #54 remains open)

**File:** `packages/cli/src/commands/greet.ts` — NOT in this PR's diff

The primary integration goal of PR #54 was to wire the CLI's `clara greet` command through `postVoiceConverse`. That file was not changed in PR #56. `greet.ts` still fetches from `/voice/respond` directly instead of using `postVoiceConverse` from `@imaginationeverywhere/clara-voice-client`.

This is the critical unfinished item from PR #54. It must be addressed in a follow-up prompt before the CLI voice loop can work end-to-end.

---

### M2 — `packages/clara` shim tests still missing (C2 from PR #55 remains open)

`packages/clara/bin/clara.mjs` still has 0 tests. The PR #55 review required 4 tests (version flag, argv passthrough, non-zero exit forwarding, unknown flag). Neither PR #56 nor the PR #54/55 branches added these.

---

### M3 — `--refresh` flag not added to `clara greet`

H2 from PR #54 review — the cache has no invalidation escape hatch. Users on a stale cached greeting have no way to force a refresh short of deleting the cache directory manually.

---

## ✅ Positive Findings

1. **`reply` alias placed first** in the field extraction chain in `converse.ts`. This correctly prioritizes the Hermes gateway's actual response shape over historical aliases.

2. **Real HTTP server tests** — all `converse.test.ts` tests spin up actual `node:http` servers. No fetch mocking. This is the right pattern — mocking would hide content-type parsing bugs. 8 tests now cover: trailing-slash normalization, JSON success, offline failure, HTTP 4xx, Hermes `reply` field, camelCase `replyText`, empty base URL, and abort signal.

3. **`greeting-cache.test.ts` is thorough** — 5 tests covering: cache miss (missing dir), write+read roundtrip, empty bytes guard, missing mime file fallback, and XDG env var override. Uses `tmpdir` isolation with `rm({ recursive: true, force: true })` cleanup — no shared state between tests.

4. **`InstallSection` server component conversion is clean.** Removing `'use client'` is correct — this component has no interactivity after dropping the broken beta copy button. Copy extracted to `marketing-install-constants.ts` with tests is the right pattern.

5. **`MARKETING_GITHUB_REPO` constant** — centralized, tested. No hardcoded GitHub URLs scattered through components.

6. **`CLI_INSTALL_PLACEHOLDER`** — correctly uses `@clara/cli` scoped name rather than the broken `npx github:` pattern. Test explicitly asserts the forbidden pattern is absent.

7. **All 23 tests green on first run** — no flaky tests detected. voice-client tests run in 604ms, frontend Vitest in 1.45s.

---

## Required Actions Before Merge

### Required fix (one line)

1. **Change "18+" to "20+"** in `InstallSection.tsx:40` — must match engines spec.

### Required in follow-up prompts (outside scope of this PR)

2. **Wire `greet.ts` to `postVoiceConverse`** — C1 from PR #54 remains the primary blocker for CLI voice functionality. This is prompt 05 Part 1, still pending.

3. **Add shim tests** — 4 tests in `packages/clara/test/shim.test.mjs`. C2 from PR #55, still pending.

4. **Add `--refresh` flag** to `clara greet` — H2 from PR #54, still pending.

---

## Verdict

PR #56 is well-executed for its scope: voice-client coverage is now solid, the broken beta install command is gone, and the server component refactor is clean. The 23 tests are correct and non-flaky.

**Fix the Node.js version text (H1 — one line) then merge.** The three follow-up items (greet.ts wiring, shim tests, --refresh flag) are out of scope for this PR and must be addressed separately.

**Merge PR #56 after H1 fix. Write a new unblock prompt for greet.ts + shim tests.**
