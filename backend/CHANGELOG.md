# Changelog

All notable changes to the Clara Code API (`backend/`) are recorded here. Cross-ref: root `CHANGELOG.md`.

## [Unreleased] - 2026-04-25

### Added

- **Agent-to-agent messaging, sprints, Clara scrum, builder/runtime phase** — SQL migrations `028_agent_messaging.sql` through `031_agent_phase.sql` (`agent_messages`, `sprints` / `sprint_tasks` / `standup_reports`, `user_profiles`, `agents.phase` + `industry_vertical`). Services: `agent-messaging.service.ts`, `sprint.service.ts`, `clara-scrum.service.ts`, `agent-phase.service.ts`, `agent-onboarding.service.ts`, `agent-skill.service.ts` (stub). REST: `/api/agents` (`POST /`, `POST /message`, `GET /inbox`, `GET /thread/:threadId`), `/api/sprints` (active sprint, tasks, standup, team standup, profile, velocity). `memory.service.ts` now layers phase prefix, `user_profiles`, inbox, and `[My Memory]` into `buildHistory`. Jest: `agent-messaging.service.test.ts`, `agent-phase.service.test.ts`; memory tests updated.
- **Agent lifecycle hooks** — `src/lib/hooks.ts` (six hook types + context), `src/services/hook-bus.service.ts` (`HookBus` with platform-first ordering), `src/hooks/platform-hooks.ts` (introspection deflection + output scrub via IP firewall; PreToolUse blocks `Bash` when `deploymentId` is set). `src/server.ts` imports platform hooks at boot. `POST /api/voice/converse` runs `SessionStart`, `UserPromptSubmit` (text path), and `Stop` on assistant text; optional `deployment_id` / `agent_name` on the request body. Jest: `src/__tests__/services/hook-bus.service.test.ts`.
- **MCP catalog and dispatch** — migration `migrations/027_mcp_connections.sql` (`mcp_servers`, `agent_mcp_connections` keyed to `agents.id`); models `McpServer`, `AgentMcpConnection`; `services/plan-limits.ts`, `mcp-credential-vault.service.ts` (AES envelope via `SOUL_ENCRYPTION_KEY`), `mcp-connection.service.ts`, `mcp-dispatcher.service.ts`; routes `src/routes/mcp.ts` mounted at `/api/mcp` (`GET /available`, `POST /connect`, `POST /register-custom`, `POST /dispatch`, `GET /:agentId/tools`); `src/seeds/mcp-servers.seed.ts` (seven curated servers, runs once when catalog empty). Jest: `src/__tests__/services/mcp-dispatcher.test.ts`. `jest.setup.js` sets `SOUL_ENCRYPTION_KEY` for tests.

- **Agent-scoped persistent memory** — migration `migrations/007_user_memory.sql` creates `conversation_turns` and `agent_user_memory`; Sequelize models `ConversationTurn` / `AgentUserMemory`; `services/memory.service.ts` (get/save/touch, `buildHistory` for the voice proxy). `POST /api/voice/converse` accepts `text` without audio (e.g. greeting), merges `agent_id` / `session_id` / `surface`, forwards memory-backed `history` upstream, and best-effort saves turns after a successful round-trip. `GET /api/voice/memory?agent_id=` returns memory context for a user + agent pair. CLI: deterministic per-day `session_id` from config `userId` and `export buildSessionId`; greet/converse pass `agent_id: clara` and `surface: cli` through the voice client.

### Security

- **Agent IP firewall (server-side)** — `src/lib/ip-firewall.ts` defines forbidden patterns (model IDs, Modal/Hermes references, internal URLs, token-like strings), `detectForbidden`, `sanitize`, `AGENT_IP_WRAPPER`, `isIntrospectionQuery`, and `deflectionResponse` for use by agent and voice flows.
- **Voice response filtering** — `src/middleware/agent-output-filter.ts` provides `filterAgentOutput` and `filterConverseResponsePayload`. `POST /api/voice/converse` sanitizes string fields on the upstream JSON (`transcript`, `response_text`, `text`, `reply`, `message`) before the response is sent. Logs `[ip-firewall] output filter triggered` when content was modified.
- **Agent configuration helpers** — `src/services/agent-config.service.ts` (`sanitizeSoulMd`, `buildSystemPrompt` with `AGENT_IP_WRAPPER` prepended at call time).
- **Marketplace SOUL encryption** — `src/services/marketplace-soul-encryption.service.ts` (AES-256-CBC) using `SOUL_ENCRYPTION_KEY` (documented in `.env.example`).
- **Tests** — `src/__tests__/lib/ip-firewall.test.ts`; `src/__tests__/routes/voice.test.ts` mocks `logger.warn` and asserts filtered converse payloads.

### Changed

- **Package version** — `1.0.3` → **`1.1.0`** (agent messaging, sprints, scrum, builder/runtime phase APIs; see **Added** above).
- `src/routes/voice.ts` — converse route applies `filterConverseResponsePayload` to proxied voice-server JSON.
