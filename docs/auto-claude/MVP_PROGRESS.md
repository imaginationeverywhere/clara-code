# MVP Progress — Clara Code (claracode.ai)

> **Generated**: 2026-04-23
> **Status**: 🟡 At Risk — critical path blocked on PR #59 (tests + @ts-nocheck)
> **Goal**: `npm install -g clara@latest && clara` → voice greeting → voice conversation

---

## Phase Progress (Sprint 4 · 2026-04-23)

| Phase | Status | Progress | Notes |
|-------|--------|----------|-------|
| **1. Infrastructure & Auth** | ✅ Complete | 100% | Express, Clerk, DB, CI/CD, ECS Fargate live |
| **2. Backend Voice Routes** | ✅ Complete | 100% | /greet /speak /stt /tts /converse /health — PR #57 approved |
| **3. Voice Client SDK** | ✅ Complete | 100% | @imaginationeverywhere/clara-voice-client 0.1.0 — PR #56 approved |
| **4. CLI — greet + TUI** | 🔄 90% | 90% | greet wired; VoiceConverseApp exists but PR #59 blocked |
| **5. Frontend Marketing** | 🔄 80% | 80% | InstallSection, pricing, hero done; VoiceGreeting needs tests |
| **6. Desktop Tauri IDE** | 🔄 60% | 60% | Shell + voice JS written; .dmg CI build failing on PR #59 |
| **7. Distribution & Release** | 🔄 40% | 40% | release-on-tag.yml written; npm publish gated on PR #59 |
| **8. Frontend Voice Bar (web IDE)** | ⏳ 0% | 0% | Prompt 06 (Motley) queued, not started |

**Overall MVP: ~72% complete**

---

## Feature Matrix

| Feature | Priority | Status | PR | Notes |
|---------|----------|--------|----|-------|
| `clara` CLI entry point | Critical | ✅ | merged | bin wired, `clara` runs |
| Backend /api/voice/converse | Critical | ✅ | #57 ✅approved | usage tracking added |
| Backend /api/voice/health | Critical | ✅ | #57 ✅approved | no-auth probe |
| clara-voice-client SDK | Critical | ✅ | #56 ✅approved | postVoiceConverse + cache |
| Voice greeting on launch | Critical | 🔄 | #59 blocked | greet.ts → canonical-greeting.ts written, 0 tests |
| Push-to-talk converse (TUI) | Critical | 🔄 | #59 blocked | VoiceConverseApp, @ts-nocheck |
| `npm install -g clara@latest` | Critical | 🔄 | #59 blocked | release-on-tag.yml on blocked PR |
| Tauri .dmg desktop build | High | 🔴 | #59 blocked+CI fail | Desktop macOS CI FAILURE |
| VoiceGreeting (marketing site) | High | 🔄 | #59 blocked | written, 0 tests |
| claracode.ai install section | High | ✅ | merged | npm + beta from git |
| Voice bar (web IDE Ctrl+Space) | High | ⏳ | prompt 06 pending | Motley prompt not started |
| Clerk auth + API keys | High | ✅ | merged | |
| Stripe subscriptions | High | ✅ | merged | |
| Tag → release CI (npm + dmg) | High | 🔄 | #59 blocked | |

---

## Open PRs

| PR | Title | Status | Action |
|----|-------|--------|--------|
| #57 | backend /converse + /health (239 tests) | ✅ APPROVED | **Merge now** |
| #56 | voice client coverage + install copy | ✅ APPROVED | **Merge now** |
| #59 | voice shell, TUI, VoiceGreeting, release CI | ❌ BLOCKED | Execute prompt 07 |
| #61 | archive directive 02 | CI pass | Merge (housekeeping) |
| #58 | directive conversation | CI pass | Merge or close |
| #55, #54, #53 | older voice-client PRs (superseded) | — | Close |

---

## Today's Focus

### Ready to Ship Now (no work needed)
- Merge PR #57 (backend converse — approved, 239 tests)
- Merge PR #56 (voice client coverage — approved)
- Merge PR #61 (directive archive — housekeeping)

### Active Blocker: PR #59
Execute `prompts/2026/April/23/1-not-started/07-unblock-pr03-tests-and-ts.md`:
1. Wait for PR #56 to merge, then rebase PR #59 onto develop
2. Remove `// @ts-nocheck` from `voice-converse-app.tsx`, fix TS errors
3. Write 8 tests for `canonical-greeting.ts`
4. Write 4 Vitest tests for `VoiceGreeting.tsx`
5. Add E2E gap doc for `shell-voice-converse.ts`
6. Push → `/review-code` → merge

### Queued (next after PR #59 merges)
- `git tag v1.0.0-beta.1 && git push origin v1.0.0-beta.1` → release-on-tag.yml
- Prompt 06: Motley — voice bar in web IDE (Ctrl+Space → converse)

---

## Historical Sprints

| Sprint | Date | Output |
|--------|------|--------|
| Sprint 1 | 2026-04 | ECS Fargate backend, CF Pages frontend, DB migrations |
| Sprint 2 | 2026-04 | VoiceBar ↔ Hermes, CI/CD, 85 tests |
| Sprint 3 | 2026-04-14 | Dashboard real API, GA4, design tokens, 208 tests @ 90.79% |
| Sprint 4 | 2026-04-23 (current) | Voice client SDK, backend converse, CLI greet wiring |
