# Changelog

## [Unreleased] - 2026-04-27

### Security (cross-reference)

- **`docs/backend-rest-api.md`** — `/api/harness-talents/agent/:agentId` documents the ownership check and **404**; attach/detach body fields corrected to `agent_id` / `talent_id`. Implementation: **`backend/CHANGELOG.md`**, root **`CHANGELOG.md`**.

### Added (cross-reference)

- **Architecture — tenant vs founder brain** — **`docs/architecture/BRAIN_API_ACCESS_CONTROL.md`**: default customer brain host, forbidden founder endpoints, MCP/CLI ship gates, alignment with `clara the-brain` and IDE VSIX. Implementation: **`packages/cli/CHANGELOG.md`**, **`.github/CHANGELOG.md`**, `scripts/verify-customer-brain-ship.mjs`, root `CHANGELOG.md` **\[Unreleased\] - 2026-04-27**.

- **Prompt 17 (completed)** — `02-clara-code-the-brain-customer-wrapper-and-build-gate.md` in `prompts/2026/April/27/3-completed/`: `clara the-brain`, `.claude/commands/the-brain-customer.md`, `mcp-brain-customer.example.json`, release `verify-customer-brain-ship` on CLI and VSIX (`release-on-tag.yml`, `clara-code-ide.yml`). See **`docs/architecture/BRAIN_API_ACCESS_CONTROL.md`**, root `CHANGELOG.md` **\[Unreleased\] - 2026-04-27**.

## [Unreleased] - 2026-04-25

### Added (cross-reference)

- **`docs/backend-rest-api.md`** — Migrations `038`–`041`, `/api/harness-talents`, `/api/billing`, abuse preflight + `routing-distribution-daily` job. Implementation: **`backend/CHANGELOG.md`**, **`frontend/CHANGELOG.md`**, **`packages/sdk/CHANGELOG.md`**, root **`CHANGELOG.md`**. Completed prompts **11**, **14**, **18**, **22** (see `prompts/2026/April/23/3-completed/` and `prompts/2026/April/25/3-completed/`).

### Changed (cross-reference)

- **Prompt 14 (not started)** — `14-skills-per-agent-and-voice-limits.md` removed; replaced by **`14-talents-per-agent-tier-caps.md`** (Talents per agent, tier caps, Talent Library, wallet purchase flow; supersedes Skills + combined voice-limits draft). See root `CHANGELOG.md` **\[Unreleased\] - 2026-04-25**.

### Added (cross-reference)

- **`docs/review/20260425-014844-code-review.md`** — UltraThink session review (QCS1 prompt execution, pricing doc consistency, prompt queue status, documentation-focused coverage posture). See root `CHANGELOG.md` **\[Unreleased\] - 2026-04-25**.

### Changed (cross-reference)

- **Customer-facing pricing** — `customer-facing-page.md` updated in `pricing/` and `.cursor/pricing/`. See root `CHANGELOG.md` **\[Unreleased\] - 2026-04-25**.

### Added (cross-reference)

- **Backend REST — harness agents, site owner, mobile updates, ejection** — `docs/backend-rest-api.md` now includes `/api/agents` (templates + `user_agents` + configure), `/api/site-owner/*`, `/api/mobile-updates/*`, `/api/ejections` (migrations `032`–`037`); `backend/.env.example` adds `EJECTION_S3_BUCKET`. Implementation: `backend/CHANGELOG.md`, `frontend/CHANGELOG.md` (quarterly attestation), `packages/sdk/CHANGELOG.md`, `packages/cli/CHANGELOG.md`, root `CHANGELOG.md` **\[Unreleased\] - 2026-04-25**. Prompts **19–20, 23–25** under `prompts/2026/April/25/3-completed/`.

### Added (cross-reference)

- **Backend REST — agent messaging, sprints, Clara scrum, builder/runtime phase** — `docs/backend-rest-api.md` documents `/api/agents`, `/api/sprints`, migrations `028`–`031`, and voice memory layering. Implementation: `backend/CHANGELOG.md` **\[Unreleased\]**, root `CHANGELOG.md` **\[Unreleased\]**. Prompts `08`, `09`, `10`, `15` completed under `prompts/2026/April/23/3-completed/`.

### Added (cross-reference)

- **Backend — agent-scoped voice memory** — `007_user_memory.sql`, `GET /api/voice/memory`, `POST /api/voice/converse` memory + `text`-only; CLI session id + `agent_id`/`surface` on the voice client. See `docs/voice-dev-stub.md`, `backend/CHANGELOG.md`, `packages/cli/CHANGELOG.md`, `packages/clara-voice-client/CHANGELOG.md`, and root `CHANGELOG.md` **\[Unreleased\] - 2026-04-25**.

### Security (cross-reference)

- **Backend — agent IP firewall** — Forbidden-pattern registry, voice response sanitization for `POST /api/voice/converse`, optional `SOUL_ENCRYPTION_KEY` for marketplace SOUL encryption. See `backend/CHANGELOG.md`, `backend/.env.example`, and root `CHANGELOG.md` **\[Unreleased\] - 2026-04-25**.

### Added (cross-reference)

- **Clara AI pricing extensions** — `clara-ai-tier-ladder.md`, `clara-ai-business-tier-ladder.md`, `clara-ai-reseller-rates.md`, `clara-ai-vp-business-economics.md`; iteration on tier, marketplace, and voice playbooks. See `pricing/`, `.cursor/pricing/`, and root `CHANGELOG.md` **\[Unreleased\] - 2026-04-25**.
- **Prompts 26-27 (completed)** — `26-agent-lifecycle-hooks.md`, `27-mcp-tool-extension.md` under `prompts/2026/April/23/3-completed/`. Implementation: backend hook bus + voice wiring; MCP tables, services, `/api/mcp/*`, Hermes sketch in `docs/mcp-hermes-integration.md`. See root `CHANGELOG.md` **\[Unreleased\] - 2026-04-25**, `backend/CHANGELOG.md`, `packages/sdk/CHANGELOG.md`.
- **`docs/status/`** — MVP sprint, blockers, demo checklist, product PRD, and Clara talent agency docs (moved from `docs/auto-claude/`; those paths removed). See root `CHANGELOG.md` **\[Unreleased\] - 2026-04-25**.
- **Pricing and `.cursor` mirrors** — `abuse-protection.md`, `cogs-and-unit-economics.md`, `customer-facing-page.md`, `ip-ownership-and-ejection.md`, `model-routing-strategy.md` under `pricing/` and `.cursor/pricing/`; `reseller-pricing.md` removed. Cross-ref: root `CHANGELOG.md` **\[Unreleased\] - 2026-04-25**.
- **Prompts** — `prompts/2026/April/23/1-not-started/` (and `3-completed/`) as the active tree; April 19/21 duplicate paths removed. See root `CHANGELOG.md` **\[Unreleased\] - 2026-04-25**.

### Fixed (cross-reference)

- **`create-clara-app` gitignore** — `packages/create-clara-app/bin/` ignored; publish surface remains `dist/` + `templates/`. See `packages/create-clara-app/CHANGELOG.md` and root `CHANGELOG.md` **\[Unreleased\] - 2026-04-25**.

### Added (cross-reference)

- **`docs/distribution-pipeline.md`** — tag-based releases: npm (`clara` + `clara-voice-client`), desktop `.dmg`, optional R2, Cloudflare; secret names; rollback. Cross-ref: root `CHANGELOG.md` **\[Unreleased\] - 2026-04-25**, `.github/CHANGELOG.md`, `desktop/CHANGELOG.md`.
- **`.github/workflows/desktop-macos-dmg.yml`**, **`.github/workflows/release-on-tag.yml`** — see `.github/CHANGELOG.md`.
- **`docs/review/20260421-pr55-clara-distribution-review.md`** — code review for PR #55 (clara-distribution / marketing install). See root `CHANGELOG.md` **\[Unreleased\] - 2026-04-25**.
- **`prompts/2026/April/21/1-not-started/05-unblock-pr54-pr55.md`** — work prompt to unblock PR #54 and #55 (tests, `reply` alias, install path fixes, etc.).

## [Unreleased] - 2026-04-24

### Added (cross-reference)

- **`@imaginationeverywhere/clara-voice-client` + `clara greet`** — new workspace package and CLI integration. See `packages/clara-voice-client/CHANGELOG.md`, `packages/cli/CHANGELOG.md`, and root `CHANGELOG.md` **\[Unreleased\] - 2026-04-24**.
- **`docs/review/20260421-pr54-clara-voice-client-review.md`** — code review for PR #54.
- **Prompts** — `prompts/2026/April/21/1-not-started/` (four voice-related stubs).

## [Unreleased] - 2026-04-23

### Added (cross-reference)

- **Clara Code boilerplate commands** — `/hotfix-to-main`, `commands/prompts/` template library, `session-start` contract test. No `docs/*` rewrites in that batch; see root `CHANGELOG.md` **\[Unreleased\] - 2026-04-23** and `.claude/commands/CHANGELOG.md` **[1.35.3]**.

## [Unreleased] - 2026-04-19

### Fixed

- **`@mariozechner/pi-ai` OpenRouter tests (cross-reference)** — `getModel("openrouter", …)` uses `keyof typeof MODELS.openrouter` assertion for `meta-llama/llama-4-maverick` to satisfy `tsgo`. See `packages/ai/CHANGELOG.md` and root `CHANGELOG.md`.

- **Root TypeScript check (cross-reference)** — `backend` is a pnpm workspace package; root `tsgo` excludes `backend/**` and `check` runs `pnpm -C backend run type-check`. Excludes optional sandbox example from root `tsgo`. See root `CHANGELOG.md`.

- **`@mariozechner/pi-agent-core` / `@mariozechner/pi-coding-agent` (cross-reference)** — declared `@sinclair/typebox` as a direct dependency so TypeScript resolves imports under pnpm (fixes CI `TS2307`). See `packages/agent/CHANGELOG.md`, `packages/coding-agent/CHANGELOG.md`, and root `CHANGELOG.md`.

- **`@mariozechner/pi-ai` (cross-reference)** — declared `@smithy/node-http-handler` as a direct dependency so `packages/ai` TypeScript resolves Bedrock proxy / HTTP/1.1 handler imports under pnpm (fixes CI `TS2307`). See `packages/ai/CHANGELOG.md` and root `CHANGELOG.md`.

- **`create-clara-app` (cross-reference)** — build/bin alignment and `0.1.3` release notes; see `packages/create-clara-app/CHANGELOG.md` and root `CHANGELOG.md`.

### Added

- **`docs/review/20260419-035221-pr4-ink6-review.md`** — Code review for PR #4 (Ink 5→6, TUI boot fix); records approval and the `engines.node` follow-up now addressed in `packages/cli/package.json`.
- **Prompt drafts** — `prompts/2026/April/19/1-not-started/20-pricing-ui-vault-sync.md`, `21-checkout-routes-fix.md` (checkout routing and pricing UI work queued from vault).
- **`docs/clara-platform/voice-auth-scheme.md`** — Edge-side summary of the Option B auth contract ratified by cp-team 2026-04-19: CLI/IDE ships Clerk JWT or `sk-clara-` key, the clara-code edge validates it and swaps in `HERMES_API_KEY` as Bearer before calling `${HERMES_GATEWAY_URL}/voice/{stt,tts}`. Points at the full spec in the `claraagents` repo. Documents SSM sources (`/clara-code/HERMES_GATEWAY_URL`, `/clara-code/HERMES_API_KEY`), cold-start expectation (60–120 s), and the exact test cases that guard the contract.
- **`docs/voice-dev-stub.md`** — Reference for the backend voice surface. Covers both the `CLARA_VOICE_DEV_STUB=1` path (used locally to bypass Modal) and the PR #3 real-mode wire-up (Modal paths `/voice/stt` and `/voice/tts`, `Bearer HERMES_API_KEY`, 150 s cold-start timeout, 503 when the key is missing). Includes the 6-case real-mode test inventory.
- **`docs/cli-voice-loop.md`** — CLI-side reference for PR #2 + PR #3 + PR #4: diagram of the `Ctrl+Space → sox → /stt → gateway` loop, key-binding table, first-run prompt UX, session transcript format (`.clara/session-YYYY-MM-DD.log`), env knobs (`CLARA_BACKEND_URL`, `CLARA_VOICE_DEV_STUB`, backend-only `HERMES_GATEWAY_URL` / `HERMES_API_KEY`), zero-hardware local recipe, cold-start "warming up…" UX, and Ink 6 / Node 20 versioning rationale (PR #4 replaces the earlier Ink 5 known-issue section).
- **Backend (SES + Clerk)** — `POST /api/webhooks/clerk` with Svix verification; welcome email on `user.created`; first-API-key confirmation email after `POST /api/keys` when Clerk is configured; tests in `backend/src/__tests__/email.service.test.ts` and extended keys tests. See root `CHANGELOG.md` and `@clara-code/backend` `1.0.1` → `1.0.2`.
- **mom / Hermes** — Optional `HERMES_GATEWAY_URL`; no implicit default gateway URL; startup routing logs. See `packages/mom/CHANGELOG.md`.

### Changed

- **`backend/.env.example`** — documents `HERMES_GATEWAY_URL` + `HERMES_API_KEY` (both sourced from SSM under `/clara-code/*`, the key as `SecureString`), the cold-start heads-up, `CLARA_VOICE_URL` fallback, and `CLARA_VOICE_DEV_STUB=1` with the NEVER-in-prod warning.
- **`docs/cli-voice-loop.md`** — documents that `packages/cli/package.json` declares `engines.node` `>=20.0.0` (PR #4 review follow-up).
- Monorepo root version `0.1.3` → `0.1.8` (includes `0.1.4` CLI/Ink through `0.1.8` pi-ai OpenRouter test typing; see root `CHANGELOG.md`).

## [Unreleased] - 2026-04-16

### Added

- **Voice Coding / VRD** — Root `README.md` documents the public attribution record for Voice Coding and VRD; `VRD-TEMPLATE.md` at repo root for voice-first product specs. See root `CHANGELOG.md` **[Unreleased] - 2026-04-16**.

### Changed

- **`sync-herus` command docs** — `.claude/commands/sync-herus.md` and `.cursor/commands/sync-herus.md`: comment lists `/branch-cleanup` instead of `/git-sweep` for script copy guidance.

## [Unreleased] - 2026-04-13

### Added

- `review/20260413-164741-code-review.md` — code review for commit `3ee542a5` (queue-prompt + review-code GitHub push steps). Grade **A-**; 0 critical, 0 high, 2 medium (broad `git add`, no push error handling), 1 low. Backend regression: 85/85 pass.
- `review/20260413-162351-code-review.md` — code review for 5 commits (IDE scaffold, `@claracode/sdk`, backend health fix, `create-clara-app` templates). Grade **B+**; 2 high issues (VoiceSession silent error, Express 4 async health handler), 3 medium, 4 low. Backend: 85/85 tests, 98% coverage.

- **`create-clara-app` templates** — `packages/create-clara-app/templates/` (`open-next.config.ts`, `wrangler.toml`, `env.example`) documented in `packages/create-clara-app/README.md` and `packages/create-clara-app/CHANGELOG.md`.

### Changed

- **`create-clara-app`** — README expanded (usage, scaffold behavior, publish, build); package `0.1.1` → `0.1.2`. See `packages/create-clara-app/CHANGELOG.md`.

- **`@claracode/sdk`** — pointer: Hermes client package lives at `packages/sdk/` with README examples (`ask`, `stream`, voice). See root `CHANGELOG.md` and `packages/sdk/CHANGELOG.md`.
- `cloudflare/NEXTJS-15-TO-16-UPGRADE-GUIDE.md` — step-by-step guide for upgrading from Next.js 15 to 16 in the CF Workers deployment context.
- `cloudflare/NEXTJS-16-CLOUDFLARE-WORKERS-DEPLOYMENT.md` — complete deployment reference for Next.js 16 on Cloudflare Workers using `@opennextjs/cloudflare`.
- `cloudflare/README.md` — Cloudflare docs index with links to all deployment and email setup guides.
- `cloudflare/STEP-BY-STEP-DEPLOYMENT-GUIDE.md` — end-to-end deployment walkthrough for claracode.ai.
- `agent/MVP_PROGRESS.md` — Clara Code MVP progress tracker (~52% complete); feature matrix covering web surface, backend API, voice layer, infrastructure.
- `agent/MVP_SPRINT_PLAN.md` — Sprint 3 backlog with prioritized tasks, owners, and sprint risks.
- `agent/MVP_BLOCKERS.md` — Active blockers register; BLK-01 (Stripe) resolved 2026-04-13.

## [Unreleased]

### Added

- Clara Code IDE documentation pointer: see `ide/clara-code/README.md` for VSCodium-based editor scaffold, Clara Voice extension, and `product.json` merge workflow.
- `review/20260411-011808-web-ui-code-review.md` — web UI code review notes.
- `review/20260411-080058-backend-code-review.md` — backend directory code review (coverage, structure, security).
- `review/20260411-082334-backend-corrective-review.md` — follow-up corrective review for backend tests and routes.
- `review/20260411-084952-backend-test-suite-review.md` — backend Jest suite and middleware/route test review.
