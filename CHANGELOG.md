# Changelog

All notable changes to this monorepo are recorded here. Package-specific details may also appear under `packages/*/CHANGELOG.md`.

## [0.1.0] - 2026-04-13

### Added

- **Stripe live payments** — Merchant account approved. Production Stripe keys stored in AWS SSM (`/clara-code/STRIPE_PUBLISHABLE_KEY`, `/clara-code/STRIPE_SECRET_KEY`, `/clara-code/prod/*`). `STRIPE_SECRET_KEY` wired as Wrangler runtime secret for `clara-code` (production) and `clara-code-preview`. Checkout build prompt queued at `prompts/2026/April/13/1-not-started/06-stripe-checkout-and-subscriptions.md`. BLK-01 fully resolved.
- **Custom domain routing** — `frontend/wrangler.toml` now declares explicit route patterns for `claracode.ai`, `www.claracode.ai` (production) and `develop.claracode.ai` (preview) as CF custom domains.
- **Cloudflare deployment docs** — Four new guides in `docs/cloudflare/`: Next.js 15→16 upgrade, Workers deployment reference, step-by-step walkthrough, and index README. See `docs/CHANGELOG.md` for details.
- **MVP tracking** — `docs/auto-claude/MVP_PROGRESS.md`, `MVP_SPRINT_PLAN.md`, `MVP_BLOCKERS.md` — three auto-Claude plan files capturing current sprint state (~52% MVP complete, two remaining hard blockers). See `docs/CHANGELOG.md`.
- **5-surface dispatch prompts** — Sequential Cursor agent prompts queued at `prompts/2026/April/13/1-not-started/01–06`: frontend dashboard wiring, backend Svix hardening, CLI/TUI end-to-end wire, IDE extension activation, API versioning + docs, and Stripe checkout.
- **`setup-email` boilerplate command** — Reusable `/setup-email` command added to Auset boilerplate and synced to all 55 Heru projects via `sync-herus --push`. Full SES + Cloudflare + Clerk email setup walkthrough.

### Changed

- Root `wrangler.toml` replaced with reference comments — `frontend/wrangler.toml` is the single deployment config for CF Workers.
- `frontend/.env.example` documents Stripe env vars with build-time vs. runtime notes.
- `.gitignore` extended to exclude `.open-next/` and `frontend/.open-next/` (OpenNext build artifacts).
- Monorepo version `0.0.5` → `0.1.0`.

### Fixed

- `frontend/CHANGELOG.md`, `docs/CHANGELOG.md` — cross-referenced here for component-level detail.

## [Unreleased] - 2026-04-12

### Added

- `docs/review/20260412-180043-code-review.md` — full Sprint 1/2 code review covering all 7 branches merged into develop (Grade B, 9 issues: 1 critical, 3 high, 4 medium, 1 low). Backend: 77/77 tests passing, 91% line coverage.
- `tasks/prompts/1-not-started/S2-05-review-fixes.md` — corrective Cursor agent prompt addressing CRIT-01 (desktop voice overlay IP protection), HIGH-01 (mobile API base env var), HIGH-02 (backend branch coverage), HIGH-03 (CLI dist in git). Blocks production promotion until resolved.
- Clara Code web UI routes and components (`@clara/web-ui`): dashboard, pricing, API keys, settings, Clerk sign-in/up, Apollo client wiring, and middleware.
- Root `CHANGELOG.md` for monorepo-level release notes.
- `prompts/2026/April/11/` — backend build and review follow-up prompts; `docs/review/` — three backend review write-ups (code review, corrective review, test suite review).

### Changed

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
