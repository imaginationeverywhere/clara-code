# MVP Progress — Clara Code (claracode.ai)

> **Updated**: 2026-04-23 (Sprint 5 check-in)
> **Status**: 🟢 On Track — PR03 merged, 265 tests green, thin-client gate live
> **Goal**: `npm install -g clara@latest && clara` → voice greeting → voice conversation

---

## Phase Progress (Sprint 5 · 2026-04-23)

| Phase | Status | Progress | Notes |
|-------|--------|----------|-------|
| **1. Infrastructure & Auth** | ✅ Complete | 100% | Express, Clerk, DB, CI/CD, ECS Fargate live |
| **2. Backend Voice Routes** | ✅ Complete | 100% | /greet /speak /stt /tts /converse /health — merged to develop |
| **3. Voice Client SDK** | ✅ Complete | 100% | @imaginationeverywhere/clara-voice-client 0.1.0 — merged |
| **4. CLI — greet + TUI** | ✅ Complete | 100% | PR03 merged; @ts-nocheck removed; 265 tests green; canonical-greeting.ts routes through clara-voice-client |
| **5. Frontend Marketing** | 🔄 75% | 75% | InstallSection done; hero/install/pricing/design-token UI polish queued (4 prompts) |
| **6. Desktop Tauri IDE** | 🔄 75% | 75% | Voice shell written and merged; .dmg CI blocker resolved with PR03 |
| **7. Distribution & Release** | 🔄 65% | 65% | release-on-tag.yml live + npm publish restored; NPM_TOKEN secret unverified; v0.1.0 not tagged |
| **8. Frontend Voice Bar (web IDE)** | ⏳ 0% | 0% | Prompt 06 (Motley) queued, not started |
| **9. Security / IP Gate** | ✅ Complete | 100% | Thin-client gate CI workflow blocks forbidden markers; self-audit CLEAN |

**Overall MVP: ~85% complete** (was 72% at sprint 4)

---

## Feature Matrix

| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| `clara` CLI entry point | Critical | ✅ | bin wired, `clara` runs |
| Backend /api/voice/converse | Critical | ✅ | usage tracking added, 265 tests |
| Backend /api/voice/health | Critical | ✅ | no-auth probe |
| clara-voice-client SDK | Critical | ✅ | postVoiceConverse + greeting cache |
| Voice greeting on launch | Critical | ✅ | canonical-greeting.ts → postVoiceConverse (thin-client compliant) |
| Push-to-talk converse (TUI) | Critical | ✅ | VoiceConverseApp merged; @ts-nocheck removed |
| `npm install -g clara@latest` | Critical | 🔄 | release-on-tag.yml ready; NPM_TOKEN secret + v0.1.0 tag needed |
| Tauri .dmg desktop build | High | 🔄 | PR03 blocker resolved; tag needed to trigger dmg CI |
| VoiceGreeting (marketing site) | High | ✅ | written and merged with PR03 |
| claracode.ai install section | High | ✅ | npm + beta from git |
| Thin-client IP gate | High | ✅ | CI blocks Hermes/Modal/persona markers in client source |
| Voice bar (web IDE Ctrl+Space) | High | ⏳ | Prompt (Motley) in 1-not-started, not started |
| Clerk auth + API keys | High | ✅ | merged |
| Stripe subscriptions | High | ✅ | merged |
| Tag → release CI (npm + dmg) | High | 🔄 | CI ready; tag v0.1.0 needed |

---

## Open PRs (as of 2026-04-23)

| PR | Title | State | Action |
|----|-------|-------|--------|
| #61 | chore(prompts): archive team directive 02 | OPEN | Merge (housekeeping) |
| #60 | chore(prompts): pickup 02 team directive | OPEN | Merge or close |
| #58 | feat: 02-clara-code-team-directive | OPEN | Merge or close |
| #57 | chore(prompts): queue voice prompts 05+06 | OPEN | Merge (housekeeping) |
| #56 | feat: Hermes reply, voice tests, install copy | OPEN | **Code committed to develop** — close or merge |
| #55 | feat: clara npm shim, distribution docs | OPEN | Review — may be superseded |
| #54 | feat: clara-voice-client + greet cache | OPEN | Likely superseded by PR03 — close |
| #53 | feat: clara-voice-client + greet cache (dup) | OPEN | Close (duplicate of #54) |

> **Note**: PRs #56 and #57 content was committed directly to develop (merge commits in git log). May be safe to close without merging on GitHub.

---

## Active Blockers

### BLK-NPM — v0.1.0 tag not pushed
**Severity**: High
**Blocks**: `npm install -g clara@latest`, .dmg release
**Steps**:
1. `gh secret list --repo imaginationeverywhere/clara-code | grep NPM_TOKEN`
2. If missing: add NPM_TOKEN to repo secrets
3. `git tag v0.1.0 && git push origin v0.1.0`
4. Monitor release-on-tag.yml → npm + .dmg artifacts

### BLK-PROMPT01 — cli-voice-on-launch thin-client conflict
**Severity**: High
**Blocks**: QCS1 execution of prompt 01 (will be caught by thin-client gate CI)
**Problem**: `01-cli-voice-on-launch.md` references `https://info-24346--hermes-gateway.modal.run` directly — violates thin-client rule
**Fix**: Rewrite prompt 01 to route through `api.claracode.ai/api/voice/*` instead of direct Hermes URL

### BLK-BRAIN — brain API 500
**Severity**: Low (degraded mode only; vault grep fallback working)
**Ongoing since**: 2026-04-24 session

---

## Sprint 5 Focus

### Immediate (do now)
1. Verify `NPM_TOKEN` repo secret → tag `v0.1.0` → smoke test `npm install -g clara@latest && clara`
2. Rewrite `01-cli-voice-on-launch.md` — replace direct Hermes URL with `api.claracode.ai`
3. Close superseded PRs (#53, #54 — duplicates; #55 may be superseded too)

### This Sprint (QCS1 Cursor agents)
- 4 UI/design prompts: hero, install, pricing, design-tokens/header polish
- 2 website prompts: greeting on load, Clara greeting integration
- 1 distribution pipeline prompt
- 1 desktop IDE voice panel prompt
- Prompt 01 (after rewrite) — wire voice greeting properly through api.claracode.ai

### Stretch
- Prompt 06 (Motley) — voice bar in web IDE (Ctrl+Space → converse)
- Investigate brain API 500

---

## Historical Sprints

| Sprint | Date | Output | Tests |
|--------|------|--------|-------|
| Sprint 1 | 2026-04 | ECS Fargate backend, CF Pages frontend, DB migrations | — |
| Sprint 2 | 2026-04 | VoiceBar ↔ Hermes, CI/CD | 85 |
| Sprint 3 | 2026-04-14 | Dashboard real API, GA4, design tokens | 208 @ 90.79% |
| Sprint 4 | 2026-04-23 | Voice client SDK, backend converse, CLI greet wiring | 265 |
| Sprint 5 | 2026-04-23 | PR03 merged, @ts-nocheck cleaned, thin-client gate, npm publish restored | 265 |
