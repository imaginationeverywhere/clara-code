# Changelog

All notable changes to this monorepo are recorded here. Package-specific details may also appear under `packages/*/CHANGELOG.md`.

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
