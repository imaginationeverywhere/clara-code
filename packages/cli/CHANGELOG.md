# Changelog

## [Unreleased]

### Fixed

- Removed duplicate `tui` subcommand in `src/index.ts` that called Ink `render`/`React`/`App` without imports; `registerTuiCommand` in `commands/tui.tsx` is the single registration.
- Removed duplicate `@types/react` key in `package.json` devDependencies.

### Changed

- Build no longer fails on `tsup: command not found` when the monorepo lockfile and `npm install` are in sync (see root `CHANGELOG.md`).
