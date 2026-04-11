# Changelog

All notable changes to this monorepo are recorded here. Package-specific details may also appear under `packages/*/CHANGELOG.md`.

## [Unreleased] - 2026-04-11

### Added

- Clara Code web UI routes and components (`@clara/web-ui`): dashboard, pricing, API keys, settings, Clerk sign-in/up, Apollo client wiring, and middleware.
- Root `CHANGELOG.md` for monorepo-level release notes.

### Changed

- Regenerated `package-lock.json` so workspace installs resolve cleanly (fixes missing CLI dev tools such as `tsup` on disk).
- Pinned monorepo-wide `react` and `react-dom` to `19.2.5` via root `devDependencies` and `overrides` so Next.js and peers resolve a single React version.
- Refreshed `packages/ai/src/models.generated.ts` from the model-generation script.

### Fixed

- `@clara/cli`: removed a duplicate `tui` command registration that referenced `render`/`React`/`App` without imports; TUI remains registered from `commands/tui.tsx`.
- `@clara/cli`: duplicate `@types/react` devDependency entry in `package.json`.
- `@clara/web-ui`: declared `@apollo/client` and `@clerk/nextjs`; aligned `check` script to run lint and TypeScript.

### Documentation

- Directory changelogs updated: `packages/cli/CHANGELOG.md`, `packages/web-ui/CHANGELOG.md`, `packages/ai/CHANGELOG.md`, `docs/CHANGELOG.md` (see those files for package-scoped detail).
