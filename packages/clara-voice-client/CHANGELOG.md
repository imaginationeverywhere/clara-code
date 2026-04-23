# Changelog

## [0.1.0] - 2026-04-24

### Added

- Initial release: `postVoiceConverse` and `resolveConverseUrl` for `POST {base}/voice/converse` with offline-safe error handling; Node `readGreetingFromCache` / `writeGreetingToCache` with XDG or `~/.cache/clara-code` layout. Consumed by `@clara/cli` `greet` (see `packages/cli/CHANGELOG.md`).

## [Unreleased]

### Fixed

- `postVoiceConverse` maps Hermes `reply` field to `reply_text` (with existing aliases); aligns with clara-voice / Hermes gateway responses.

### Added

- Test coverage: `converse` (4xx, `reply`, `replyText`, empty base, abort) and `greeting-cache` roundtrip and edge cases in `test/greeting-cache.test.ts`.
