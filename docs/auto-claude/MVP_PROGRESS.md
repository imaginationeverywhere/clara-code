# MVP Progress — Clara Code (claracode.ai)

> **Generated**: 2026-04-13
> **Sprint**: 2 of estimated 4
> **Status**: 🟡 At Risk — infrastructure solid, product surfaces gated by Stripe approval + Clerk wiring

---

## Phase Progress

| Phase | Status | Progress | Key Deliverable |
|-------|--------|----------|-----------------|
| **Phase 1: Infrastructure & Deploy** | ✅ Complete | 100% | CF Workers + ECS Fargate pipelines live |
| **Phase 2: Web UI (claracode.ai)** | 🟡 In Progress | 70% | All pages exist; Stripe + Clerk env not wired |
| **Phase 3: Backend API** | 🟡 In Progress | 75% | Keys/Waitlist/Voice routes live; Stripe webhook pending |
| **Phase 4: Voice Layer** | 🔄 In Progress | 60% | Hermes proxy live; IDE/TUI voice surfaces not dispatched |
| **Phase 5: IDE + CLI surfaces** | ⏳ Not Started | 10% | Packages exist (v0.66.1); prompts not yet executed |
| **Phase 6: Stripe & Auth activation** | 🚫 Blocked | 0% | Blocked on merchant account + Clerk keys in CF env |
| **Phase 7: Testing & QA** | 🔄 In Progress | 55% | Backend 81% branch / 98% line; frontend 3/3 Vitest |
| **Phase 8: Production launch** | ⏳ Not Started | 0% | — |

**Overall MVP Estimate: ~52% complete**

---

## Feature Completion Matrix

### Web Surface (claracode.ai)

| Feature | Priority | Status | Progress | Notes |
|---------|----------|--------|----------|-------|
| Homepage / Hero | Critical | ✅ | 100% | `HeroSection`, `Header`, `Footer` live |
| Pricing page | Critical | ✅ | 100% | $49 Starter / $99 Pro copy present |
| Sign-in / Sign-up (Clerk) | Critical | 🟡 | 80% | Pages exist; Clerk env vars not wired to CF Workers env |
| Dashboard — overview | High | 🔄 | 60% | UI built (localStorage mock); not wired to backend API |
| Dashboard — API keys | High | 🔄 | 60% | UI built (localStorage mock); backend route `/api/keys` ready |
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

## Sprint 2 Completed ✅

- S2-01: ECS backend deploy with CI/CD (Fargate dev cluster live)
- S2-02: Web UI dispatch — all pages scaffolded, VoiceBar, components
- S2-03: VoiceBar ↔ Hermes gateway wiring (`POST /api/voice/chat`)
- S2-04: Voice test fix — Vitest 3/3 passing
- S2-05: Security review — CRIT-01, HIGH-01, HIGH-02, HIGH-03 resolved
- CF Pages migration from `@cloudflare/next-on-pages` → `@opennextjs/cloudflare`
- Backend test suite — 85 tests, 98.14% lines, 81.18% branches

---

## Sprint 3 — Recommended Focus

| Priority | Task | Owner | Why Now |
|----------|------|-------|---------|
| 1 | Wire Clerk keys to CF Workers env | Mo / DevOps | Unblocks sign-in; nothing else works without it |
| 2 | Dispatch S2-IDE prompt to Cursor | Carruthers | IDE voice panel is the product's core differentiator |
| 3 | Dispatch S2-CLI/TUI prompt to Cursor | Carruthers | CLI is the install-first surface |
| 4 | Submit Stripe merchant account | Mo | 5-10 day approval window; start the clock now |
| 5 | Wire dashboard to `/api/keys` | Motley | Demo currently shows localStorage mock data |
| 6 | Add Svix webhook verification (HIGH-04) | Miles | Required before Stripe goes live |
| 7 | Set custom DNS for `develop.claracode.ai` | DevOps | Needed for Clerk OAuth redirect URIs |

---

## Demo Readiness (current)

| Flow | Status | Notes |
|------|--------|-------|
| Homepage load | ✅ Ready | `develop.clara-code.pages.dev` |
| Pricing page | ✅ Ready | Copy is accurate |
| VoiceBar voice interaction | ✅ Ready (limited) | Hermes proxy live; TTS works |
| Sign in / sign up | ❌ Broken in staging | Clerk not wired to CF env |
| Dashboard | ⚠️ Mock only | Shows localStorage data, not backend |
| API key creation | ⚠️ Mock only | Backend ready; frontend not wired |
| Checkout | ❌ Not ready | Placeholder page |

**Demo recommendation:** Show homepage, pricing, voice interaction demo. Do NOT demo sign-in or checkout until Clerk + Stripe are wired.
