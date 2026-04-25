# Clara Code backend — REST surface (agent platform)

This document summarizes **non-GraphQL** HTTP routes on the Clara Code API (`backend/`) that support multi-agent workflows. All routes require **Clerk session** or **Clara API key** (`Authorization: Bearer sk-clara-*` or `cc_live_*`) unless noted.

## Migrations (run per environment)

| File | Purpose |
|------|---------|
| `backend/migrations/028_agent_messaging.sql` | `agent_messages` — async agent-to-agent inbox |
| `backend/migrations/029_sprints_and_standups.sql` | `sprints`, `sprint_tasks`, `standup_reports` |
| `backend/migrations/030_user_profile.sql` | `user_profiles` — global context for all agents |
| `backend/migrations/031_agent_phase.sql` | `agents.phase` (`builder` \| `runtime`), `industry_vertical` |
| `backend/migrations/032_agent_templates.sql` | `agent_templates` — catalog for `/config-agent` |
| `backend/migrations/033_user_agents.sql` | `user_agents` — VP-configured harness agents from templates |
| `backend/migrations/034_agent_templates_expand.sql` | Additional public templates (20+ total with 032) |
| `backend/migrations/035_site_owner_interactions.sql` | `site_agent_deployments`, `site_owner_instructions`, `site_owner_change_log` |
| `backend/migrations/036_mobile_update_queue.sql` | `mobile_update_requests` — voice notes for next app release |
| `backend/migrations/037_ejections.sql` | `ejections` — export ZIP, fingerprint, attestation metadata |
| `backend/migrations/038_user_usage_and_usage_events.sql` | `user_usage`, `usage_events` — abuse preflight + usage telemetry |
| `backend/migrations/039_operation_credits.sql` | `operation_credits` — weighted operation budgets per tier |
| `backend/migrations/040_harness_talent_catalog_and_wallet.sql` | `user_wallets`, `agent_talent_catalog`, `user_talent_library`, `agent_talent_purchases`, `agent_talent_attachments` |
| `backend/migrations/041_subscription_billing_columns.sql` | `subscriptions` trial/cancel/enterprise fields + `user_subscriptions` view |

Apply with `psql $DATABASE_URL -f <file>` (or your standard migration process). Template + site-owner + ejections SQL can be reapplied via `npm run seed:templates` in `backend/` (executes 032, 034, 035, 036, 037). Harness catalog: `pnpm -C backend run seed:talents` (idempotent).

## `/api/agents`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/templates` | List public `agent_templates`. Optional query: `category`, `industry_vertical`. |
| `GET` | `/` | List active `user_agents` (template-based harness team members) for the user. |
| `POST` | `/configure` | Create a `user_agent`. Body: `template_id`, `name`, `voice` (`{ source: "library", voiceId }` or `{ source: "clone", audioBase64 }`), `skill_ids[]`, optional `personality_tweaks`. Enforces `PLAN_LIMITS` harness + per-agent skill caps. |
| `DELETE` | `/:id` | Retire a `user_agent` (`is_active = false`). |
| `POST` | `/` | Create harness agent. Body: `name`, `soul` (or `soul_md`), optional `phase` (`builder` default), `industry_vertical`, `skills[]`. **Runtime** agents require **Business/Enterprise** tier. |
| `POST` | `/message` | Send message. Body: `from_agent_id`, `to_agent_id`, `content`, optional `message_type`, `thread_id`, `metadata`. Only `clara` may send to `to_agent_id: "all"`. |
| `GET` | `/inbox?agent_id=` | List unread for agent; marks read. |
| `GET` | `/thread/:threadId` | Thread history **scoped to authenticated user**. |

## `/api/sprints`

Register order lists **static** paths before `/:sprintId` routes.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/active` | Current active sprint (includes tasks). |
| `GET` | `/velocity` | `avgTurnsPerSprint`, `sprintsCompleted`. |
| `GET` | `/profile` | Global `user_profiles` row for the user. |
| `GET` | `/standup/agent?agent_id=` | Agent memory summary (Clara “read any agent”). |
| `POST` | `/standup/team` | Full team standup; returns `report` and voice `prompt` text. |
| `POST` | `/` | Create sprint; body: `goal`. |
| `POST` | `/:sprintId/tasks` | Add task; body: `agent_id`, `title`, `description?`. |
| `PATCH` | `/tasks/:taskId` | Update task; body: `status`, `blocker?`. |
| `POST` | `/:sprintId/standup` | Per-agent standup report for a sprint. |

## `/api/site-owner`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/deployments` | `site_agent_deployments` where the caller is `site_owner_user_id` and `deployment_status=active`. |
| `POST` | `/deployments/:deploymentId/instruct` | SITE_OWNER text instruction. Body: `instruction`, optional `category`. `PlatformStandardsService` + IP sanitize; rejected rows are stored with `approved_by_platform=false`. |
| `GET` | `/deployments/:deploymentId/instructions` | Approved instructions (newest first). |
| `POST` | `/deployments/:deploymentId/revert/:instructionId` | Sets instruction inactive (`approved_by_platform=false`, reason reverted). |
| `GET` | `/deployments/:deploymentId/report?metric=&period=` | Placeholder report response (agent wiring later). |

`buildSiteOwnerAgentSystemPrompt(deploymentId)` in `site-owner-prompt.service.ts` merges `AGENT_IP_WRAPPER`, `user_agents.soul_md`, and approved `site_owner_instructions` (for use at inference time).

## `/api/mobile-updates`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/capture` | Mobile-only queue: `deployment_id`, `platform` (`ios` \| `android` \| `both`), `transcript`. Uses `interpretTranscriptToMobileSpec` (Anthropic when `ANTHROPIC_API_KEY` is set) + `platformStandards` on `description`. |
| `GET` | `/pending` | `pending_review` requests for the authenticated owner. |
| `POST` | `/:id/approve` | Body: optional `target_release`. |
| `POST` | `/:id/reject` | Body: `reason`. |
| `POST` | `/:id/shipped` | Owner marks `shipped` (same auth model as approval). |

## `/api/ejections`

Requires `EJECTION_S3_BUCKET` + AWS credentials in the API environment. Exports a VP-owned `user_agent` as a **ZIP** (sanitized `soul.md`, configuration JSON, conversation history JSON, attestation text). Tier caps per calendar month: **free 0**, **basic 1**, **pro 3**, **max 6**, **business 12**, **enterprise** = custom (uncapped in code). Pre-signed download URLs are refreshed on list and create (24h).

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/agents/:agentId/eject` | Create export; returns `ejection`, `download_url`, `attestation_required`, `attestation_upload_url`. |
| `GET` | `/` | List caller’s ejections (includes fresh `downloadUrl` per row). |
| `POST` | `/:id/attestation` | Body: `signed_pdf_s3_key` — S3 key where the signed attestation PDF was stored. Sets `status=attested`. |

Nightly (03:00 UTC) job `fingerprint-scan` runs stubbed marketplace fingerprint scanners; `Subscription` must be `active` or `trialing` for double-hosting follow-up. See `ejection.service.ts`, `fingerprint-scanners.ts`.

## `/api/harness-talents`

Curated first-party **Talents** (distinct from the marketplace router at `server.ts` `GET/POST /api/talents`). Clerk session or Clara API key. Enforces wallet + per-agent attach caps from `PLAN_LIMITS` / `TALENTS_PER_AGENT_BY_TIER`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Catalog + wallet summary + library for the user. |
| `POST` | `/acquire` | Body: `talent_id` — purchase with wallet credits. |
| `POST` | `/attach` | Body: `talent_id`, `user_agent_id` — attach talent to a harness agent. |
| `POST` | `/detach` | Body: `talent_id`, `user_agent_id`. |

## `/api/billing` (Clerk session)

Stripe Checkout and lifecycle (metadata `clara_tier` on recurring prices; no `STRIPE_PRICE_*` env vars). Webhook handler is shared with `POST /api/webhooks/stripe` and **`POST /api/billing/webhook`** (raw JSON body, `Stripe-Signature`).

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/checkout` | Body: `tier` (`basic` \| `pro` \| `max` \| `business`), optional `success_url`, `cancel_url`. Returns `checkout_url` / `url`. |
| `POST` | `/cancel` | `cancel_at_period_end` on the Stripe subscription. |
| `POST` | `/upgrade` | Body: `newTier` — proration `always_invoice`. |
| `POST` | `/downgrade` | Body: `newTier` — `proration_behavior: none` (next invoice). |
| `POST` | `/refund` | Trial: cancel without charge; else refund first paid period within 7 days of `current_period_start`. |

Enterprise is **not** self-serve: `npm run provision:enterprise -- --user=<clerk_id> [--seats=…]` in `backend/`.

## Abuse preflight and jobs

Most authenticated `/api/*` routes use `requireAbuseCheck` (Redis-backed preflight; fail-open if Redis down). Nightly **02:00 UTC** job `routing-distribution-daily` aggregates `usage_events` by `model_used` (Hermes routing telemetry).

## Voice memory integration

`GET /api/voice/...` continues to use `memory.service.ts`. After these changes, `getMemoryContext` / `buildHistory` prepend (when present): **phase prefix** (UUID agents with a row in `agents`), **global user profile**, **inbox messages**, then **`[My Memory]`** summary, then recent turns.

See `backend/CHANGELOG.md` and root `CHANGELOG.md` for release notes.
