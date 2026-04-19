# Changelog

## [Unreleased]

### Changed

- Public config: optional `gatewayUrl` (default `https://api.claracode.ai`) replaces required `hermesUrl`; error strings and URLs use Clara branding only on the public SDK surface.

### Added

- Initial `@claracode/sdk` release: `createClient`, Bearer-auth requests to the Clara API gateway, `ask`, SSE `stream`, `startVoice` / `VoiceSession`, `createAgent` with agent-scoped `ask`/`stream`; dual ESM (`.mjs`) + CJS (`.js`), declarations; `scripts/hermes-stub.mjs` and `test/ask.test.ts` for local verification.
