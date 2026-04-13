# Changelog

## [Unreleased]

### Added

- `templates/` — OpenNext (`open-next.config.ts`), Cloudflare `wrangler.toml`, and `env.example` (Clerk + Hermes) for bundled publishes (`package.json` `files`).
- Full scaffold: `create-next-app@15`, `@clerk/nextjs`, `@opennextjs/cloudflare`, `wrangler`, `@claracode/sdk`. Bin entry `bin/index.js` → `dist/cli.js`. `initOpenNextCloudflareForDev` in `next.config.*` and scripts `pages:build` / `pages:deploy`. `.npmrc` with `legacy-peer-deps=true` for Clerk peer resolution.

### Changed

- README: usage (`npx` / monorepo `node` paths), numbered “What it does” scaffold steps, publish and build sections.
