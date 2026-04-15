# MVP Progress — Clara Code (claracode.ai)

> **Generated**: 2026-04-14
> **Sprint**: 3 complete / Sprint 4 starting
> **Status**: 🟢 On Track — 4 prompt PRs merged today, BLK-05 resolved, 208 tests at 90.79% coverage

---

## Phase Progress

| Phase | Status | Progress | Key Deliverable |
|-------|--------|----------|-----------------|
| **Phase 1: Infrastructure & Deploy** | ✅ Complete | 100% | CF Workers + ECS Fargate pipelines live |
| **Phase 2: Web UI (claracode.ai)** | 🟡 In Progress | 90% | Dashboard wired (PR #30), GA4 (PR #31), design tokens (PR #32) |
| **Phase 3: Backend API** | 🟡 In Progress | 80% | Keys/Waitlist/Voice routes live; Stripe webhook pending |
| **Phase 4: Voice Layer** | 🔄 In Progress | 65% | Hermes proxy live; IDE/TUI voice surfaces not dispatched |
| **Phase 5: IDE + CLI surfaces** | 🔄 In Progress | 40% | SecretStorage wired (PR #29); prompts 03-04 queued for QCS1 |
| **Phase 6: Stripe & Auth activation** | 🚫 Blocked | 10% | BLK-01 resolved (live keys in SSM); BLK-02 still needs Mo action |
| **Phase 7: Testing & QA** | ✅ Strong | 90% | 208 tests, 90.79% stmt, 91.83% line coverage |
| **Phase 8: Production launch** | ⏳ Not Started | 0% | Develop 220 commits ahead of main; release PR needed |

**Overall MVP Estimate: ~83% complete** *(+31% from yesterday — Sprint 3 output)*

---

## Feature Completion Matrix

### Web Surface (claracode.ai)

| Feature | Priority | Status | Progress | Notes |
|---------|----------|--------|----------|-------|
| Homepage / Hero | Critical | ✅ | 100% | `HeroSection`, `Header`, `Footer` live |
| Pricing page | Critical | ✅ | 100% | $49 Starter / $99 Pro copy present |
| Sign-in / Sign-up (Clerk) | Critical | 🟡 | 80% | Pages exist; Clerk env vars not wired to CF Workers env |
| Dashboard — overview | High | ✅ | 95% | Apollo `useQuery(MY_API_KEYS)` wired; server component shell (PR #30) |
| Dashboard — API keys | High | ✅ | 95% | Real API; localStorage removed (PR #30) |
| Dashboard — voice | Medium | 🔄 | 50% | `PostOAuthVoice` component exists; Hermes proxy working |
| Dashboard — billing | Medium | ⏳ | 5% | Checkout page is placeholder; no Stripe Elements mounted |
| Checkout (Stripe) | Critical | 🚫 | 0% | Blocked — merchant account pending approval |
| Checkout success | Low | ⏳ | 20% | Page exists; no Stripe session handling |
| Docs section | Low | ✅ | 100% | Dynamic `[[...slug]]` route live |
| Settings page | Medium | ⏳ | 30% | Page exists; no real functionality |
| API Keys page | High | 🔄 | 60% | `/api-keys` page exists; needs backend wiring |
| VoiceBar | High | ✅ | 90% | `VoiceBar.tsx` wired to Hermes; ARIA complete |
| Install CTA | Medium | ✅ | 100% | `InstallSection` component live |
| Waitlist capture | High | ✅ | 100% | `/api/waitlist` → backend route live |

### Backend API (ECS Fargate)

| Feature | Priority | Status | Progress | Notes |
|---------|----------|--------|----------|-------|
| `/health` endpoint | Critical | ✅ | 100% | Live on dev ECS |
| Clerk JWT middleware | Critical | ✅ | 100% | `requireAuth()` on all protected routes |
| `/api/keys` CRUD | Critical | ✅ | 100% | Create/list/delete with masking |
| `/api/waitlist` | Critical | ✅ | 100% | findOrCreate, email validation |
| `/api/voice/greet` | High | ✅ | 100% | Proxies to Modal clara-voice-server |
| `/api/voice/speak` | High | ✅ | 100% | TTS proxy with auth |
| Stripe checkout session | Critical | 🚫 | 0% | Blocked on merchant approval |
| Stripe webhook handler | Critical | 🚫 | 0% | Route scaffolded; no Svix verification (HIGH-04 open) |
| Agent provisioning on purchase | Critical | 🚫 | 0% | Blocked — needs Stripe first |
| Neon PostgreSQL (migrations) | Critical | ✅ | 100% | User, ApiKey, WaitlistEntry models live |
| Rate limiting | Critical | ✅ | 100% | IP + per-route limiters |

### Voice / Hermes Layer

| Feature | Priority | Status | Progress | Notes |
|---------|----------|--------|----------|-------|
| Hermes gateway proxy (web) | Critical | ✅ | 100% | `/api/voice/chat` — IP rate limit, fallback |
| `/api/voice/greet` (web) | High | ✅ | 100% | TTS for greeting |
| `/api/voice/tts` (web) | High | ✅ | 100% | TTS route live |
| Modal clara-voice-server | Critical | ✅ | 100% | SSM URL stored, endpoint verified |
| Hermes gateway (Modal) | Critical | ✅ | 100% | `https://info-24346--hermes-gateway.modal.run` live |
| IDE voice panel | High | ⏳ | 10% | Package exists; prompt S2-IDE not dispatched |
| CLI/TUI voice | High | ⏳ | 10% | `packages/tui` v0.66.1; prompt S2-CLI not dispatched |
| Desktop (Tauri) voice | Medium | ⏳ | 5% | `desktop/` scaffolded; not built |

### Infrastructure & DevOps

| Feature | Priority | Status | Progress | Notes |
|---------|----------|--------|----------|-------|
| CF Workers deployment | Critical | ✅ | 100% | Git integration live; `develop.clara-code.pages.dev` |
| Custom domain DNS | High | ⏳ | 20% | Wrangler.toml configured; DNS not yet set at registrar |
| ECS Fargate dev cluster | Critical | ✅ | 100% | `clara-code-backend-dev` service live |
| ECS Fargate prod cluster | High | ⏳ | 50% | Workflow ready; deploy-to-main not yet triggered |
| GitHub Actions CI | Critical | ✅ | 100% | `ci.yml` — lint, typecheck, test |
| Clerk env in CF Workers | Critical | 🚫 | 0% | Keys not set in CF dashboard — sign-in broken in prod |

---

## Active Blockers

| ID | Blocker | Severity | Impact | Resolution |
|----|---------|----------|--------|------------|
| **BLK-01** | Stripe merchant account not approved | Critical | Blocks checkout, subscriptions, agent provisioning | Submit merchant account — requires business docs |
| **BLK-02** | Clerk publishable/secret keys not wired to CF Workers env | Critical | Sign-in/sign-up broken in staging; Clerk is passthrough middleware | Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` in CF Workers dashboard |
| **BLK-03** | Stripe webhook HIGH-04 (no Svix verification) | High | Security gap in production webhook handler | Add Svix signature verification to `backend/src/routes/webhooks.ts` before going live |
| **BLK-04** | IDE/CLI/Desktop voice surfaces not dispatched | High | These are core product differentiators for the IDE pitch | Queue and dispatch S2-IDE, S2-CLI, S2-Desktop prompts to Cursor |
| **BLK-05** | `frontend/package-lock.json` decision pending | Low | Could cause CF Workers build discrepancies | Decide: keep for reproducible builds or delete for pnpm purity |

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Stripe approval takes 5-10 business days | High | High | Submit asap; use test mode for Stripe dev work while waiting |
| CF Workers build breaks again on next dep change | Medium | High | Pin `@opennextjs/cloudflare` and `next` versions; don't bump without testing |
| Dashboard not connected to backend → demo shows fake data | High | Medium | Wire dashboard API calls to `/api/keys` before first demo |
| IDE/TUI surfaces ship late → voice pitch weak | Medium | High | Dispatch IDE + TUI prompts this sprint |

---

## Sprint 3 Completed ✅ (2026-04-14)

**25 prompt PRs merged this sprint across 4 feature tracks:**

| PR | Feature | Grade |
|----|---------|-------|
| PR #29 | Desktop Secure Storage v3 — gateway URL in `context.secrets` | A- |
| PR #30 | Profile Dashboard Real API v3 — localStorage → Apollo, `/account` page, delete account | A |
| PR #31 | Analytics GA4 Install Funnel v2 — server-side Measurement Protocol, sign_up/purchase/first_api_call | A |
| PR #32 | Design System Tokens v1 — sculpt/text/border/syntax tokens, 26 files of hardcoded hex replaced | A- |

**Stale PRs closed:** #25, #26, #27, #28 (v1/v2 duplicates superseded by v3)

**Test suite:** 208 tests, 90.79% statements, 91.83% lines, 71.65% branches (pre-existing gap, accepted)

**Standards gaps closed:** `--desktop`, `--profile`, `--analytics`, `--design` (all 4 previously open)

---

## Sprint 2 Completed ✅

- S2-01: ECS backend deploy with CI/CD (Fargate dev cluster live)
- S2-02: Web UI dispatch — all pages scaffolded, VoiceBar, components
- S2-03: VoiceBar ↔ Hermes gateway wiring (`POST /api/voice/chat`)
- S2-04: Voice test fix — Vitest 3/3 passing
- S2-05: Security review — CRIT-01, HIGH-01, HIGH-02, HIGH-03 resolved
- CF Pages migration from `@cloudflare/next-on-pages` → `@opennextjs/cloudflare`
- Backend test suite — 85 tests, 98.14% lines, 81.18% branches

---

## Sprint 4 — Recommended Focus

| Priority | Task | Owner | Why Now |
|----------|------|-------|---------|
| 1 | Wire Clerk keys to CF Workers env (BLK-02) | Mo | Unblocks sign-in; everything else is ready |
| 2 | Create develop → main release PR (220 commits) | Carruthers | Ship Sprint 1-3 output to production |
| 3 | Dispatch S2-IDE prompt to Cursor on QCS1 | Carruthers | IDE voice panel is the product's core differentiator |
| 4 | Dispatch S2-CLI/TUI prompt to Cursor on QCS1 | Carruthers | CLI is the install-first surface |
| 5 | Build Stripe checkout flow (prompt 06 queued) | Miles | BLK-01 resolved, live keys in SSM — start the clock |
| 6 | Add Svix webhook verification (BLK-03) | Miles | Required before Stripe webhooks go live |
| 7 | Verify sculpt scale 400–100 against `mockups/app/src/index.css` | Motley | PR #32 only has 5 stops (900-500); spec said 900-100 |

---

## Demo Readiness (current)

| Flow | Status | Notes |
|------|--------|-------|
| Homepage load | ✅ Ready | `develop.clara-code.pages.dev` |
| Pricing page | ✅ Ready | Copy is accurate |
| VoiceBar voice interaction | ✅ Ready (limited) | Hermes proxy live; TTS works |
| Sign in / sign up | ❌ Broken in staging | Clerk not wired to CF env (BLK-02 — Mo action) |
| Dashboard | ✅ Real data | localStorage removed; Apollo `useQuery` wired (PR #30) |
| API key creation | ✅ Real API | `POST /api/keys` from dashboard (PR #30) |
| Checkout | ❌ Not ready | Placeholder page |

**Demo recommendation:** Show homepage, pricing, voice interaction demo. Do NOT demo sign-in or checkout until Clerk + Stripe are wired.
