# Changelog

All notable changes to this monorepo are recorded here. Package-specific details may also appear under `packages/*/CHANGELOG.md`.

## [Unreleased] - 2026-04-16

### Added

- **Voice Coding and VRD attribution** — Root `README.md` reframed as the canonical public record for **Voice Coding** and **VRD** (Voice Requirements Document), with attribution to Amen Ra (April 2026). Added `VRD-TEMPLATE.md` plus companion drafts `linkedin-article.md` and `x-thread.md` for distribution.
- **`/branch-cleanup`** — Replaces `/git-sweep` and `/merge-all`; `.claude/commands/branch-cleanup.md` + `.claude/scripts/branch-cleanup.sh` (mirrored under `.cursor/`). See `.claude/commands/CHANGELOG.md` and `.cursor/commands/CHANGELOG.md` **[1.35.2]**.
- **Prompt queue** — `prompts/2026/April/16/1-not-started/` — QCS1 voice, desktop, CLI, and Hermes backlog prompts.

### Changed

- **Security** — Removed hardcoded Modal/Hermes deployment URLs from app source; voice and gateway endpoints require `CLARA_VOICE_URL` / `HERMES_GATEWAY_URL` (see `backend/.env.example`, `frontend/.env.example`). CLI, IDE extension, and TUI resolve gateways from env or user config only.
- **`sync-herus`** — Comment now references `/branch-cleanup` instead of `/git-sweep` when listing shell scripts copied to Herus.
- Monorepo root version `0.1.2` → `0.1.3`.
- **Directory changelogs** — `docs/CHANGELOG.md`, `frontend/CHANGELOG.md`, `.claude/CHANGELOG.md` updated; command-level notes in `.claude/commands/CHANGELOG.md` and `.cursor/commands/CHANGELOG.md` **[1.35.2]**.

### Removed

- **`/git-sweep` and `/merge-all`** — Commands and scripts removed; workflow superseded by `/branch-cleanup`. Details in `.claude/commands/CHANGELOG.md` **[1.35.2]**.

### Fixed

- **Tests** — Formatting-only updates in `backend/src/__tests__/routes/webhooks-stripe-tier-resolution.test.ts` and `frontend/src/__tests__/middleware.test.ts` (expect call wrapping, Vitest import order).

## [0.1.0] - 2026-04-13

### Added

- **Stripe live payments** — Merchant account approved. Production Stripe keys stored in AWS SSM (`/clara-code/STRIPE_PUBLISHABLE_KEY`, `/clara-code/STRIPE_SECRET_KEY`, `/clara-code/prod/*`). `STRIPE_SECRET_KEY` wired as Wrangler runtime secret for `clara-code` (production) and `clara-code-preview`. Checkout build prompt queued at `prompts/2026/April/13/1-not-started/06-stripe-checkout-and-subscriptions.md`. BLK-01 fully resolved.
- **Custom domain routing** — `frontend/wrangler.toml` now declares explicit route patterns for `claracode.ai`, `www.claracode.ai` (production) and `develop.claracode.ai` (preview) as CF custom domains.
- **Cloudflare deployment docs** — Four new guides in `docs/cloudflare/`: Next.js 15→16 upgrade, Workers deployment reference, step-by-step walkthrough, and index README. See `docs/CHANGELOG.md` for details.
- **MVP tracking** — `docs/internal/MVP_PROGRESS.md`, `MVP_SPRINT_PLAN.md`, `MVP_BLOCKERS.md` — three internal plan files capturing current sprint state (~52% MVP complete, two remaining hard blockers). See `docs/CHANGELOG.md`.
- **5-surface dispatch prompts** — Sequential Cursor agent prompts queued at `prompts/2026/April/13/1-not-started/01–06`: frontend dashboard wiring, backend Svix hardening, CLI/TUI end-to-end wire, IDE extension activation, API versioning + docs, and Stripe checkout.
- **`setup-email` boilerplate command** — Reusable `/setup-email` command added to Auset boilerplate and synced to all 55 Heru projects via `sync-herus --push`. Full SES + Cloudflare + Clerk email setup walkthrough.

### Changed

- Root `wrangler.toml` replaced with reference comments — `frontend/wrangler.toml` is the single deployment config for CF Workers.
- `frontend/.env.example` documents Stripe env vars with build-time vs. runtime notes.
- `.gitignore` extended to exclude `.open-next/` and `frontend/.open-next/` (OpenNext build artifacts).
- Monorepo version `0.0.5` → `0.1.0`.

### Fixed

- `frontend/CHANGELOG.md`, `docs/CHANGELOG.md` — cross-referenced here for component-level detail.

## [Unreleased] - 2026-04-13

### Added

- **`create-clara-app` publish templates** — `packages/create-clara-app/templates/` (OpenNext config, Cloudflare `wrangler.toml`, `env.example` for Clerk + Hermes) plus package `CHANGELOG.md`, `.gitignore` for local `bin/index.js` shim. Package version `0.1.0` → `0.1.1`. See `packages/create-clara-app/CHANGELOG.md` and `docs/CHANGELOG.md`.

### Changed

- **`create-clara-app` `0.1.1` → `0.1.2`** — README documents full usage and scaffold steps; package changelog records README changes. See `packages/create-clara-app/CHANGELOG.md` and `docs/CHANGELOG.md`.

- **`@claracode/sdk`** (`packages/sdk/`) — TypeScript client for Hermes-compatible HTTP APIs: `createClient`, `ask`, SSE `stream`, voice sessions, and agents; ESM+CJS builds, local `hermes-stub`, Vitest integration test. Root `npm run build` now includes `pnpm -C packages/sdk run build`. See `packages/sdk/README.md` and `packages/sdk/CHANGELOG.md`.
- **Clara Code IDE** (`ide/clara-code/`): VSCodium-oriented scaffold — `clara-voice` VS Code extension (Clara Dark theme, status bar voice control, Code Lens), `product.json` merge tooling and defaults (Hermes/Copilot-off), build scripts, and GitHub Actions workflow `clara-code-ide.yml` to produce per-OS VSIX artifacts. See `ide/clara-code/README.md`, `ide/clara-code/CHANGELOG.md`, `.github/CHANGELOG.md`, and `docs/CHANGELOG.md`.
- `docs/review/20260413-164741-code-review.md` — code review for `3ee542a5` (queue-prompt + review-code GitHub push step addition). Grade **A-**; 2 medium issues (broad `git add`, no push-fail handler). Backend: 85/85 pass. No corrective prompt — grade A-.
- `docs/review/20260413-162351-code-review.md` — code review for 5 recent commits: IDE scaffold, `@claracode/sdk`, backend health fix, `create-clara-app` templates. Grade **B+**; 0 critical, 2 high, 3 medium, 4 low. Backend: 85/85 tests passing, 98% statement coverage. See `docs/CHANGELOG.md`.
- `prompts/2026/April/13/1-not-started/01-fix-voice-session-and-health-handler.md` — corrective Cursor agent prompt for H1 (VoiceSession `ready` promise must reject on init failure), H2 (Express 4 async health handler needs try/catch → 503), M2 (agent stream missing `Accept: text/event-stream`). Blocks production promotion until resolved.
- `docs/review/20260412-180043-code-review.md` — full Sprint 1/2 code review covering all 7 branches merged into develop (Grade B, 9 issues: 1 critical, 3 high, 4 medium, 1 low). Backend: 77/77 tests passing, 91% line coverage.
- `tasks/prompts/1-not-started/S2-05-review-fixes.md` — corrective Cursor agent prompt addressing CRIT-01 (desktop voice overlay IP protection), HIGH-01 (mobile API base env var), HIGH-02 (backend branch coverage), HIGH-03 (CLI dist in git). Blocks production promotion until resolved.
- Clara Code web UI routes and components (`@clara/web-ui`): dashboard, pricing, API keys, settings, Clerk sign-in/up, Apollo client wiring, and middleware.
- Root `CHANGELOG.md` for monorepo-level release notes.
- `prompts/2026/April/11/` — backend build and review follow-up prompts; `docs/review/` — three backend review write-ups (code review, corrective review, test suite review).

### Changed

- Monorepo root version `0.1.1` → `0.1.2` (`create-clara-app` template bundle and docs).
- Monorepo root version `0.1.0` → `0.1.1` (new `@claracode/sdk` workspace package and build step).
- Regenerated `package-lock.json` so workspace installs resolve cleanly (fixes missing CLI dev tools such as `tsup` on disk).
- Pinned monorepo-wide `react` and `react-dom` to `19.2.5` via root `devDependencies` and `overrides` so Next.js and peers resolve a single React version.
- Refreshed `packages/ai/src/models.generated.ts` from the model-generation script.
- Monorepo root version `0.0.4` → `0.0.5`; `@clara-code/backend` `1.0.0` → `1.0.1` (test maintenance).
- Prompt archive: removed dated `prompts/2026/April/10/` and `prompts/magic-patterns/` tree in favor of consolidated April 11 prompts.
- `.gitignore`: ignore `graphify-out/`, local `.wrangler/` and `packages/web-ui` Cloudflare/Vercel output dirs; stop tracking `memory/session-checkpoint.md` (local-only).
- `packages/web-ui/next-env.d.ts`: include generated `routes.d.ts` reference for App Router types.

### Fixed

- `@clara/cli`: removed a duplicate `tui` command registration that referenced `render`/`React`/`App` without imports; TUI remains registered from `commands/tui.tsx`.
- `@clara/cli`: duplicate `@types/react` devDependency entry in `package.json`.
- `@clara/web-ui`: declared `@apollo/client` and `@clerk/nextjs`; aligned `check` script to run lint and TypeScript.
- `backend` Jest tests: adjust `as never` placement on mocked `req.auth` return values for stricter TypeScript in middleware and route tests (`api-key-auth`, `clerk-auth`, `rate-limit`, `index`, `voice`, `waitlist`).
- Husky `pre-commit`: skip `git add` restaging for paths matched by `.gitignore` (avoids failure when a deleted tracked file still exists on disk as an ignored file).
- `frontend`: ESLint flat config loads Next.js 16 `eslint-config-next/core-web-vitals` via `createRequire`; dashboard localStorage hydration documents `react-hooks/set-state-in-effect` suppression.

### Documentation

- `CLAUDE.md`: graphify knowledge-graph workflow (`graphify-out/`, rebuild command).
- Directory changelogs updated: `packages/web-ui/CHANGELOG.md`, `docs/CHANGELOG.md` (see those files for package-scoped detail).
