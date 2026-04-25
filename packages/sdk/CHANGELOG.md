# Changelog

## [Unreleased]

### Added

- **`registerHook` stub** — `src/hooks.ts` + `src/hooks-types.ts` export `HookType` / `HookHandler`; `registerHook` rejects until a server-side registration API exists. Re-exported from `src/index.ts`.

### Changed

- **TypeScript** — `tsconfig.json` `lib` uses `ES2023` instead of `ES2024` to match the monorepo `tsconfig.base.json` target. See root `CHANGELOG.md` **\[Unreleased\] - 2026-04-25** (cross-ref).
- Public config: optional `gatewayUrl` (default `https://api.claracode.ai`) replaces required `hermesUrl`; error strings and URLs use Clara branding only on the public SDK surface.

### Added

- Initial `@claracode/sdk` release: `createClient`, Bearer-auth requests to the Clara API gateway, `ask`, SSE `stream`, `startVoice` / `VoiceSession`, `createAgent` with agent-scoped `ask`/`stream`; dual ESM (`.mjs`) + CJS (`.js`), declarations; `scripts/hermes-stub.mjs` and `test/ask.test.ts` for local verification.
