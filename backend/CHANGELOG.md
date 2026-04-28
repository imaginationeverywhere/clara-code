# Changelog

All notable changes to the Clara Code API (`backend/`) are recorded here. Cross-ref: root `CHANGELOG.md`.

## [Unreleased] - 2026-04-25

### Changed

- **Package version** — **`1.4.0` → `1.4.1`** — **`GET /api/v1/tier-status`**, **`POST /api/v1/run`** stub (see **Added** below).

### Added

- **`GET /api/v1/tier-status`** — Authenticated (Clerk session or Clara API key); returns `{ tier, minutes_remaining: null, billing_cycle_end }` from subscription when present.
- **`POST /api/v1/run`** — Authenticated placeholder returning **501** `intent_gateway_pending` until Hermes intent dispatch is wired.

### Changed

- **Clara gateway edge env (SSM migration)** — Server-to-server voice proxy and Hermes inference client read `CLARA_GATEWAY_URL` and `CLARA_GATEWAY_API_KEY` first; `HERMES_GATEWAY_URL` and `HERMES_API_KEY` remain as deprecated fallbacks until infra renames parameters. See `src/routes/voice.ts` and `src/services/hermes-client.service.ts`.

### Added

- **`POST /api/agents/init`** — `agent-init.service.ts`: validates agent name, Business+ tier (`canBuildAgents`), loads `User` (Clerk id or internal id), `deriveVpHandle` + `{handle}-{name}` repo name, GitHub template API (`GITHUB_TOKEN` + `GITHUB_AGENT_*` envs). Returns `{ cloneUrl, repoUrl, repository }` or 403 `reason: tier_lock`, 503 if GitHub not configured, 409 on name conflict.

### Changed

- **Package version** — `1.3.2` → **`1.4.0`** (`POST /api/agents/init` + Jest `agent-init.service.test.ts`; see **Added** above).

### Security

- **Harness Talents — `GET /api/harness-talents/agent/:agentId` ownership** — `talent.service` adds `listAgentTalentsForUser(userId, agentId)` (requires a `user_agents` row for `(id, userId)`). Route returns **404** for other users’ agent IDs; stops cross-tenant listing of attached Talents. Jest: `harness-talents.test.ts`.

### Fixed

- **Platform review follow-up (code review 2026-04-25)** — Wallet ledger (`wallet_transactions` + `WalletTransaction` model) with SHA-256 idempotency; `acquire`/`attach` in Sequelize transactions; `GET /api/billing/checkout` no longer accepts arbitrary `success_url`/`cancel_url` (rejects `custom_redirects_not_allowed`); billing POSTs use `Origin` host check; operation credits use `reserveOperationCredits` + `refundOperationCredits` on the voice path; ejection monthly cap reads `PLAN_LIMITS.runtimeAgentBuildsPerMonth`; `UsageEvent` persistence is awaited with Redis `dlq:usage_events` fallback; `user_usage` month rollover copies to `user_usage_history`; `classifyOperation` documents Hermes `intent_class` preference; `pricingUrl` exported from `config/models`. SQL migrations `043`–`047`. Jest: wallet/talent/voice/operation-credit/billing/abuse updates.

### Added

- **Subscription billing (Stripe + Clerk + plan enforcement)** — SQL `041_subscription_billing_columns.sql` (trial, cancel_at_period_end, `enterprise_contract`, `user_subscriptions` view, indexes). `clerk-sync.service` merges `publicMetadata.tier` from the billing DB. `lib/stripe-prices.ts` centralizes `getRecurringPriceIdForTier` (Stripe `clara_tier` metadata, no `STRIPE_PRICE_*` envs). `POST /api/billing/*` (checkout, cancel, upgrade, downgrade, refund) + `POST /api/billing/webhook` alias; checkout sessions include 7-day trial. `webhooks-stripe` handles Basic/Pro/Max/Business checkout, `subscription.updated`/`deleted`, `invoice.payment_failed`, Clerk sync + API key issuance for all paid checkout tiers. `src/scripts/provision-enterprise.ts` + `npm run provision:enterprise`. Frontend BFF: `app/api/billing/[[...path]]/route.ts`. Jest: `billing.test`, webhooks + tier-resolution (Clerk mock).

- **Model routing pipeline (Hermes + cache + optional text `/converse` path)** — `model-router.service` (Gemma → Kimi → DeepSeek → premium rubric, Deepest plugin → `user_deepest`); `hermes-client.service` (POST `HERMES_GATEWAY_URL/inference`, fallback on 5xx/429, `ENABLE_PREMIUM_FALLBACK=0` skips last hop); `inference-cache.service` (Redis, `ENABLE_INFERENCE_CACHE`); `AbuseModelUsed` + `abuseModelFromModelChoice` + `user_deepest` ($0 COGS). Opt-in: `POST /api/voice/converse` with **text only** + `ENABLE_INFERENCE_ROUTER=1` + `HERMES_*` (optional body: `agent_soul_md`, `explicit_premium`, `deepest_plugin`); falls back to full voice proxy on error. Job `routing-distribution-daily` (02:00 UTC) aggregates `usage_events` by `model_used`. Jest: model-router, hermes, inference-cache, routing-distribution, abuse `user_deepest`.
- **Harness Talent catalog, wallet, per-agent attach caps, Memory layer 0** — SQL `040_harness_talent_catalog_and_wallet.sql` (`user_wallets`, `agent_talent_catalog`, `user_talent_library`, `agent_talent_purchases`, `agent_talent_attachments`); models + `talent-catalog.ts` (`TALENTS_PER_AGENT_BY_TIER`, `ALL_CURATED_TALENTS`); `talent.service` + `wallet.service`; **REST** `GET/POST` at `/api/harness-talents` (acquire, attach, detach, list by agent) — **not** the marketplace router at `GET/POST` `/api/talents` in `server.ts`; `memory.service` `talentLayer0` for UUID harness agents; `npm run seed:talents` idempotent catalog seed. Jest: `talent.service.test`, `harness-talents.test` plus memory/voice `talentLayer0` test fixtures.
- **Agent capability scope (operation weights + credit budgets + free conversion)** — SQL `039_operation_credits.sql` (`operation_credits` with per-weight counters); `OperationCredits` model; `operation-weights.ts` (`classifyOperation`, per-tier `CREDIT_BUDGETS`); `operation-credit.service.ts` (`canUse` pre-check, `apply` after successful voice work); `clara-conversion.service.ts` (`buildConversionPrompt` for free at 100 monthly voice exchanges); `agent-slot.service.ts` (`DEFAULT_AGENT_BUNDLES` for basic/pro/max); `POST /api/voice/converse` runs free monthly cap, credit gate, then applies credits after success; Jest: `operation-weights`, `operation-credit.service`, `clara-conversion.service` tests, voice + voice-usage updates. Run migration: `psql $DATABASE_URL -f backend/migrations/039_operation_credits.sql`.
- **Plan limits + invisible abuse protection (unlimited product usage)** — SQL `038_user_usage_and_usage_events.sql` (`user_usage`, `usage_events`); models `UserUsage`, `UsageEvent`; `PLAN_LIMITS` + `UNIVERSAL_INCLUSIONS` in `plan-limits.ts` (Basic $39/1 agent through Enterprise $4k+); `lib/redis.ts` (IORedis or in-memory when `REDIS_URL` unset); `abuse-protection.service.ts` (120 req/min preflight, 300 “active hours”/mo review flag, per-tier hard COGS freeze); `requireAbuseCheck` on authenticated API routes; voice routes call `recordUsage` after successful upstream work; `voice-usage` no longer blocks on monthly exchange count; `GET /api/user/usage` returns `unlimited_usage` without user-facing caps. Jest: `abuse-protection.service.test.ts`. Run migration: `psql $DATABASE_URL -f backend/migrations/038_user_usage_and_usage_events.sql`.
- **Agent ejection (export ZIP + fingerprint + attestation)** — `037_ejections.sql` (`ejections`); `Ejection` model; `ejection.service.ts` (tier caps, SHA-512 fingerprint, S3 upload via `lib/s3.ts`, `archiver`); `/api/ejections` routes (`POST /agents/:agentId/eject`, `GET /`, `POST /:id/attestation`); `fingerprint-scanners.ts` stubs + nightly `fingerprint-scan` job (`node-cron`, 03:00 UTC) calling `ejectionService.runFingerprintScan` + `alert-ops.service`. Jest: `ejection.service.test.ts`. Env: `EJECTION_S3_BUCKET`, `AWS_REGION`.
- **SITE_OWNER + mobile update queue** — `035_site_owner_interactions.sql`, `036_mobile_update_queue.sql`; models + `platform-standards.service` (forbidden instruction patterns, restricted categories, `sanitize`); `require-site-owner` middleware; `/api/site-owner/*` routes; `buildSiteOwnerAgentSystemPrompt`; `/api/mobile-updates/*` + `mobile-note-capture.service` + `voice-spec-interpreter` (Anthropic with env fallback). Jest: `platform-standards.service.test.ts`, `mobile-note-capture.service.test.ts`.
- **`/config-agent` (harness agents from templates)** — SQL `032_agent_templates.sql`, `033_user_agents.sql`, `034_agent_templates_expand.sql` (20+ public templates). Models `AgentTemplate`, `UserAgent`; `PLAN_LIMITS.harnessAgentSlots` / `skillsPerAgent`; `services/config-agent.service.ts`, `services/voice-clone.service.ts`. REST on `/api/agents`: `GET /templates`, `GET /` (lists `user_agents`), `POST /configure`, `DELETE /:id`. CLI: `clara config-agent` (`packages/cli`), `captureVoiceSample`, `packages/cli/src/voice/config-agent-flow.ts` (voice addendum). `npm run seed:templates` reapplies template SQL. Jest: `config-agent.service.test.ts`.
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

- **Package version** — `1.3.1` → **`1.3.2`** (platform review follow-up: wallet ledger, billing hardening, operation credits, abuse/voice/ejection; see **Fixed** above).

- **Package version** — `1.3.0` → **`1.3.1`** (harness agent talent list ownership check; see **Security** above).

- **Package version** — `1.2.0` → **`1.3.0`** (usage + abuse preflight, operation credits, harness talents catalog, optional inference router, Stripe billing routes + Clerk tier sync, migrations `038`–`041`; see **Added** above).

- **Package version** — `1.1.0` → **`1.2.0`** (harness `config-agent`, SITE_OWNER + mobile update queue, agent ejection, new migrations `032`–`037`; see **Added** above).

- **Package version** — `1.0.3` → **`1.1.0`** (agent messaging, sprints, scrum, builder/runtime phase APIs; see **Added** above).
- `src/routes/voice.ts` — converse route applies `filterConverseResponsePayload` to proxied voice-server JSON.
