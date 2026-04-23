# Changelog

## [Unreleased]

### Fixed

- **Git ignore** — `bin/` is ignored in the worktree. The published npm `bin` is `./dist/cli.js` only; a stray `bin/index.js` shim (e.g. from local experiments) is not part of the package `files` field and must not be committed.

### Added

- `templates/` — OpenNext (`open-next.config.ts`), Cloudflare `wrangler.toml`, and `env.example` (Clerk + Hermes) for bundled publishes (`package.json` `files`).
- Full scaffold: `create-next-app@15`, `@clerk/nextjs`, `@opennextjs/cloudflare`, `wrangler`, `@claracode/sdk`. `initOpenNextCloudflareForDev` in `next.config.*` and scripts `pages:build` / `pages:deploy`. `.npmrc` with `legacy-peer-deps=true` for Clerk peer resolution.

### Fixed

- `package.json` `bin` and build `chmod` now use `dist/cli.js` (matches `tsconfig.build.json` `outDir`), fixing CI failure where `bin/index.js` was never emitted.

### Changed

- Version `0.1.2` → `0.1.3`.
- README: usage (`npx` / monorepo `node` paths), numbered “What it does” scaffold steps, publish and build sections.
