# Changelog

All notable changes to the Clara Code API (`backend/`) are recorded here. Cross-ref: root `CHANGELOG.md`.

## [Unreleased] - 2026-04-25

### Added

- **Agent-scoped persistent memory** — migration `migrations/007_user_memory.sql` creates `conversation_turns` and `agent_user_memory`; Sequelize models `ConversationTurn` / `AgentUserMemory`; `services/memory.service.ts` (get/save/touch, `buildHistory` for the voice proxy). `POST /api/voice/converse` accepts `text` without audio (e.g. greeting), merges `agent_id` / `session_id` / `surface`, forwards memory-backed `history` upstream, and best-effort saves turns after a successful round-trip. `GET /api/voice/memory?agent_id=` returns memory context for a user + agent pair. CLI: deterministic per-day `session_id` from config `userId` and `export buildSessionId`; greet/converse pass `agent_id: clara` and `surface: cli` through the voice client.

### Security

- **Agent IP firewall (server-side)** — `src/lib/ip-firewall.ts` defines forbidden patterns (model IDs, Modal/Hermes references, internal URLs, token-like strings), `detectForbidden`, `sanitize`, `AGENT_IP_WRAPPER`, `isIntrospectionQuery`, and `deflectionResponse` for use by agent and voice flows.
- **Voice response filtering** — `src/middleware/agent-output-filter.ts` provides `filterAgentOutput` and `filterConverseResponsePayload`. `POST /api/voice/converse` sanitizes string fields on the upstream JSON (`transcript`, `response_text`, `text`, `reply`, `message`) before the response is sent. Logs `[ip-firewall] output filter triggered` when content was modified.
- **Agent configuration helpers** — `src/services/agent-config.service.ts` (`sanitizeSoulMd`, `buildSystemPrompt` with `AGENT_IP_WRAPPER` prepended at call time).
- **Marketplace SOUL encryption** — `src/services/marketplace-soul-encryption.service.ts` (AES-256-CBC) using `SOUL_ENCRYPTION_KEY` (documented in `.env.example`).
- **Tests** — `src/__tests__/lib/ip-firewall.test.ts`; `src/__tests__/routes/voice.test.ts` mocks `logger.warn` and asserts filtered converse payloads.

### Changed

- `src/routes/voice.ts` — converse route applies `filterConverseResponsePayload` to proxied voice-server JSON.
