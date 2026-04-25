# Changelog

## [0.1.0] - 2026-04-24

### Added

- Initial release: `postVoiceConverse` and `resolveConverseUrl` for `POST {base}/voice/converse` with offline-safe error handling; Node `readGreetingFromCache` / `writeGreetingToCache` with XDG or `~/.cache/clara-code` layout. Consumed by the `clara` package `greet` and default voice entry (see `packages/cli/CHANGELOG.md`).

## [Unreleased]

### Added

- `ConverseRequestBody` — optional `agent_id` and `surface` (session-scoped agent + surface) for Clara backend memory routing.

### Fixed

- `postVoiceConverse` maps Hermes `reply` field to `reply_text` (with existing aliases); aligns with clara-voice / Hermes gateway responses.

### Added

- `converse-browser` subpath export: `postVoiceConverse` and types only, for Tauri `webview` and other browser bundles that must not import Node `fs` (greeting cache remains on the main entry).
- Test coverage: `converse` (4xx, `reply`, `replyText`, empty base, abort) and `greeting-cache` roundtrip and edge cases in `test/greeting-cache.test.ts`.
