# MVP Blockers — Clara Code

> **Updated**: 2026-04-23

---

## Active Blockers

### BLK-PR59 — PR #59 BLOCKED: No tests + @ts-nocheck
**Severity**: Critical
**Affects**: Voice greeting, voice converse TUI, Tauri .dmg, npm release CI
**Owner**: Cursor agent executing prompt 07
**Resolution**: `prompts/2026/April/23/1-not-started/07-unblock-pr03-tests-and-ts.md`

PR #59 contains the most critical new logic but fails review gate:
- `canonical-greeting.ts` (~120 lines) — 0 tests (8 required)
- `voice-converse-app.tsx` — `// @ts-nocheck` at line 1 (all TS suppressed)
- `VoiceGreeting.tsx` — 0 tests (4 required)
- Branch predates PR #56 merge (-10 voice-client tests, -2 frontend tests regression)

Steps to unblock:
1. Merge PR #56 to develop first
2. Rebase PR #59 onto develop
3. Remove @ts-nocheck, fix TypeScript errors
4. Write 8 tests for canonical-greeting.ts
5. Write 4 Vitest tests for VoiceGreeting.tsx
6. Add E2E gap doc for shell-voice-converse.ts
7. Push → /review-code → merge

### BLK-TAURI — Desktop macOS CI Build Failing
**Severity**: High
**Affects**: .dmg distribution
**Depends on**: BLK-PR59 (likely TS errors causing build fail)
**Resolution**: Fix BLK-PR59 first, then investigate Tauri-specific errors

### BLK-NPM — npm publish `clara@latest` blocked
**Severity**: High
**Affects**: `npm install -g clara@latest` (primary MVP user flow)
**Resolution**: BLK-PR59 → merge → `git tag v1.0.0-beta.1` → release-on-tag.yml

---

## Resolved Today (2026-04-23)

| Blocker | Fix |
|---------|-----|
| /converse missing usage tracking (H1) | Fixed directly on PR #57 — 5 lines + 1 test |
| Pre-existing server.test.ts TS2739 | Confirmed pre-existing on develop, not blocking new work |

---

## Legacy Blockers (from Sprint 3 — for reference)

| ID | Status | Note |
|----|--------|------|
| BLK-01 (Stripe merchant) | Resolved | Live keys in SSM |
| BLK-02 (Clerk CF Workers env) | Resolved | Keys wired |
| BLK-03 (Svix webhook verification) | Resolved | HIGH-04 closed |
| BLK-05 (package-lock.json) | Closed | pnpm purity |
