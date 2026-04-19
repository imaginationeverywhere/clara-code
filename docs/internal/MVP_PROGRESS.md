# MVP Progress — Clara Code

> **Generated:** 2026-04-19
> **Stage:** CLI-First MVP → Production Launch
> **Status:** 🟡 At Risk — Backend not publicly reachable, develop → main pending

---

## Dashboard

```
╔══════════════════════════════════════════════════════════════╗
║               CLARA CODE — MVP PROGRESS                      ║
╠══════════════════════════════════════════════════════════════╣
║  Target: CLI-First MVP  │  🟡 At Risk  │  ~88% Complete      ║
╠══════════════════════════════════════════════════════════════╣
║  SHIPPED: 4/4 CLI-MVP PRs  │  All tests green (245/245)      ║
║  STRIPE: Live prices created (basic/pro/max/business)        ║
║  FRONTEND: claracode.ai + develop.claracode.ai → 200 OK      ║
║  BACKEND: ECS running (1/1) — public URL not confirmed       ║
╠══════════════════════════════════════════════════════════════╣
║  BLOCKER: 276 commits in develop — NOT in main (production)  ║
║  BLOCKER: Backend public URL unreachable (api-dev.claracode) ║
║  PENDING: First live end-to-end voice test                   ║
╚══════════════════════════════════════════════════════════════╝
```

---

## CLI-First MVP Acceptance Criteria

| # | Criterion | Status | Commit |
|---|-----------|--------|--------|
| 1 | Backend `/api/voice/stt` + `/api/voice/tts` with dev stub | ✅ | `6caf84ab` |
| 2 | CLI voice loop: `Ctrl+Space` → sox → `/stt` → gateway → reply | ✅ | `6caf84ab` |
| 3 | Real Hermes/Modal wire-up (Option B auth, 150s timeout, cold-start UX) | ✅ | `ef9acde8` |
| 4 | TUI boots cleanly on React 19 / Node 20 (Ink 6 fix) | ✅ | `7319d57f` |
| 5 | First-run prompt links claracode.ai for token | ✅ | `6caf84ab` |
| 6 | `clara` with no args launches full-screen TUI | ✅ | `6caf84ab` |
| 7 | Session transcript written to `<cwd>/.clara/session-YYYY-MM-DD.log` | ✅ | `6caf84ab` |
| 8 | Cold-start "warming up…" UX (>4s threshold) | ✅ | `ef9acde8` |

**All 8 CLI-MVP acceptance criteria met in code.**

---

## Feature Completion Matrix

### Core Product

| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| CLI voice loop (Ctrl+Space → reply) | Critical | ✅ 100% | PR #2 + #3 |
| TUI full-screen mode (`clara`) | Critical | ✅ 100% | PR #4 Ink fix |
| Hermes/Modal voice proxy | Critical | ✅ 100% | PR #3, Option B auth |
| Backend voice dev stub | Critical | ✅ 100% | PR #1 |
| First-run token prompt | Critical | ✅ 100% | Links claracode.ai |
| `engines.node >=20.0.0` declared | High | ✅ 100% | PR #4 follow-up |

### Authentication & Identity

| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| Clerk auth (GitHub OAuth) | Critical | ✅ 100% | Middleware wired |
| Clerk webhook (`/api/webhooks/clerk`) | High | ✅ 100% | Svix + welcome email |
| API key management (`/api/keys`) | High | ✅ 100% | `sk-clara-` format |
| First-run email (SES) | High | ✅ 100% | Welcome + first-key emails |
| `requireClaraOrClerk` middleware | Critical | ✅ 100% | Both auth paths |

### Pricing & Checkout

| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| Pricing UI — vault tiers (no free tier) | Critical | ✅ 100% | Prompt 20 |
| Dynamic `/checkout/[tier]` route | Critical | ✅ 100% | Prompt 21 |
| Backend tier validation (basic/pro/max/business) | Critical | ✅ 100% | PR #51 |
| Stripe live prices (all 4 tiers) | Critical | ✅ 100% | Created today |
| Stripe checkout session creation | Critical | ✅ 100% | Dynamic by metadata |
| Stripe webhook handler | High | ✅ 100% | Subscription upsert |
| Subscription tier resolution | High | ✅ 100% | 27 test cases |

### Frontend / Marketing

| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| `claracode.ai` (prod) | Critical | ✅ 200 OK | CF Pages |
| `develop.claracode.ai` (preview) | High | ✅ 200 OK | CF Pages |
| Pricing section (5 tiers, correct prices) | Critical | ✅ 100% | 3 components fixed |
| Privacy + Terms pages | High | ✅ 100% | `dcae156f` |
| Onboarding: voice clone + team builder | Critical | ✅ 100% | `2cdedbbc` |
| `/onboarding/activate` (Basic $39) | Critical | ✅ 100% | Correct, untouched |
| Dashboard + API keys UI | High | ✅ 100% | App routes wired |
| `AppHeader` + `ProfileWidget` | High | ✅ 100% | Authenticated routes |

### Infrastructure

| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| Backend ECS service (dev) | Critical | ✅ Running | 1/1, cluster: quik-nation-dev |
| Backend CI/CD (`deploy-backend.yml`) | High | ✅ Working | All pushes to develop succeed |
| ECR image push | High | ✅ Working | SHA + `develop` tag |
| Stripe SSM secrets | Critical | ✅ Done | `/clara-code/STRIPE_SECRET_KEY` |
| HERMES_GATEWAY_URL in SSM | Critical | ✅ Done | `/clara-code/HERMES_GATEWAY_URL` |
| HERMES_API_KEY in SSM | Critical | ✅ Done | `/clara-code/HERMES_API_KEY` |

---

## Active Blockers

### BLK-06 — develop → main: 276 commits not in production

**Severity:** Critical
**Owner:** Mo (founder action)
**Description:** Everything shipped in this sprint (all 4 CLI MVP PRs, pricing fix, checkout fix, max tier fix, Stripe prices) lives in `develop`. Production (`main`) is 276 commits behind. No user-facing feature is live in production until this merge happens.
**Resolution:** `gh pr create --base main --head develop --title "CLI-First MVP v1.0 release"` then merge.

---

### BLK-07 — Backend public URL not confirmed

**Severity:** High
**Owner:** Carruthers / Mo
**Description:** `api-dev.claracode.ai` returns an HTML page (likely a Cloudflare/ngrok intercept page) rather than the backend JSON. The ECS service is running (1/1 on `quik-nation-dev`), but the backend task has no ALB and a private-only IP (`172.31.16.161`). The public routing layer (Cloudflare Tunnel or reverse proxy) is either not running or not pointed at the current task.
**Impact:** CLI voice loop will fail in real-user hands until the backend URL resolves correctly.
**Resolution options:**
1. Start `cloudflared` tunnel pointing at the ECS private IP (if that's the pattern)
2. Add an ALB in front of `clara-code-backend-dev`
3. Confirm the correct public URL and update `NEXT_PUBLIC_BACKEND_URL` in CF Pages env

---

### BLK-08 — Live end-to-end voice test not run

**Severity:** Medium
**Owner:** Mo (needs mic + sox locally, or a deployed backend)
**Description:** The voice loop has been dev-stub verified but never tested against real Modal/Whisper. First live hit will trigger a 60–120s cold start. Pre-warm Modal before any demo.
**Resolution:** Hit `POST /api/voice/tts` on the live backend once. Then run `clara` locally against the deployed backend with a real `sk-clara-` key.

---

## What Remains for Launch

```
Priority  Item                                      Owner    ETA
────────  ────────────────────────────────────────  ───────  ─────
🔴 CRIT   Merge develop → main (PR to production)  Mo       Today
🔴 HIGH   Confirm/fix backend public URL            Carru.   <1 day
🟡 MED    Live voice test against Modal             Mo       <1 day
🟡 MED    Stripe webhook URL → prod backend URL     Miles    <1 day
🟢 LOW    Pre-warm Modal before first demo          Mo       Before demo
🟢 LOW    `create-clara-app` npx scaffold           Claudia  V1.1
```

---

## Test Health

| Suite | Tests | Status |
|-------|-------|--------|
| Backend (Jest) | 230/230 | ✅ All green |
| CLI (node:test) | 16/16 | ✅ All green |
| **Total** | **246/246** | **✅ Zero failures** |

---

## Commits Ahead of Main

**276 commits** in `develop` not yet in `main`. Notable landmarks:
- `f739bc94` — fix: max tier in checkout (latest, today)
- `ef9acde8` — feat: Hermes/Modal voice wire-up (PR #3)
- `6caf84ab` — feat: CLI voice loop on stub (PR #2)
- `7e945a05` — feat: SES email + Clerk webhook
- `2cdedbbc` — feat: onboarding voice clone + team builder
- `dcae156f` — feat: privacy/terms pages
