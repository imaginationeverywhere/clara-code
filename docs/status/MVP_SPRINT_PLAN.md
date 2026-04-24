# Sprint 4 Plan — Clara Code

> **Sprint Dates**: 2026-04-23 onward
> **Sprint Goal**: Ship voice converse end-to-end — merge #56 + #57, unblock #59, tag beta

---

## Priority 1 — Merge Today (no code work)

| Task | How | Status |
|------|-----|--------|
| Merge PR #57 (backend converse, 239 tests) | `gh pr merge 57 --squash` | ✅ APPROVED |
| Merge PR #56 (voice client, 13 tests) | `gh pr merge 56 --squash` | ✅ APPROVED |
| Merge PR #61 (directive archive) | `gh pr merge 61 --squash` | CI pass |

## Priority 2 — Unblock PR #59

| Task | Prompt | Status |
|------|--------|--------|
| Rebase #59 onto develop (after #56 merges) | manual | ⏳ after P1 |
| Remove @ts-nocheck + fix TS | `07-unblock-pr03-tests-and-ts.md` | ⏳ |
| 8 tests for canonical-greeting.ts | `07-unblock-pr03-tests-and-ts.md` | ⏳ |
| 4 Vitest tests for VoiceGreeting.tsx | `07-unblock-pr03-tests-and-ts.md` | ⏳ |
| E2E gap doc for shell-voice-converse.ts | `07-unblock-pr03-tests-and-ts.md` | ⏳ |
| /review-code → merge PR #59 | `/review-code` | ⏳ after above |

## Priority 3 — Ship Beta

| Task | Notes | Status |
|------|-------|--------|
| `git tag v1.0.0-beta.1` | Triggers release-on-tag.yml → npm + .dmg | ⏳ after #59 |
| Smoke test: `npm install -g clara@latest && clara` | Manual | ⏳ |
| Execute prompt 06 (Motley voice bar) | `06-motley-wire-voice-bar-frontend.md` | ⏳ |

---

## Critical Path

```
Merge PR #56 + #57 (10 min)
       ↓
Rebase PR #59 + execute prompt 07 (60-90 min)
       ↓
/review-code on rebased PR #59
       ↓
Merge PR #59
       ↓
git tag v1.0.0-beta.1 → release-on-tag.yml
       ↓
npm install -g clara@latest && clara  ← MVP SHIPPED
       ↓
Prompt 06 (Motley): Ctrl+Space voice bar in web IDE
```

---

## Next Sprint Preview

| Task | Prompt | Priority |
|------|--------|----------|
| Voice bar in web IDE | `06-motley-wire-voice-bar-frontend.md` | High |
| Shim tests (packages/clara) | from pr56/06-unblock | Medium |
| Tauri IPC for API key (vs meta tag) | before GA | Medium |
| server.test.ts TS2739 fix (pre-existing) | standalone | Low |
