# Changelog

All notable changes to this monorepo are recorded here. Package-specific details may also appear under `packages/*/CHANGELOG.md`.

## [Unreleased] - 2026-04-27

### Security

- **Backend — harness Talents list** — `GET /api/harness-talents/agent/:agentId` now requires the agent to belong to the authenticated user (`listAgentTalentsForUser`); otherwise **404** (fixes cross-tenant disclosure). See **`backend/CHANGELOG.md`** and **`docs/backend-rest-api.md`**.

### Added

- **CLI — `clara login` and `clara doctor`** — Loopback callback on `127.0.0.1` (random port) + `https://claracode.ai/cli-auth?cli_port=…`; **keytar** OS keyring storage (`clara-code` / `default`); `agents-api` uses `pickBearerToken()`; hidden `clara auth login` alias. Prompt **`04-clara-login.md`** → `prompts/2026/April/27/3-completed/`. See **`packages/cli/CHANGELOG.md`**, **`packages/cli/README.md`**, **`docs/CHANGELOG.md`**, root **`README.md`**.

### Fixed

- **Backend — platform review follow-up (wallet, billing, abuse, voice, ejection)** — SQL `043`–`047` (wallet ledger, Stripe purchase uniqueness, non-negative wallet, default private catalog, `user_usage_history`); transactional Talent acquire/attach, idempotency, billing without arbitrary checkout redirects + origin check on mutating routes; operation-credit reserve/refund on voice; ejection cap from plan limits; full details in **`backend/CHANGELOG.md`**.

### Changed

- **Version bump** — root **`0.5.2` → `0.5.3`**, published **`clara` (packages/cli) `0.1.2` → `0.1.3`** (`clara login` / `clara doctor` / keytar; see **Added** above).

- **Version bump (prior)** — root **`0.5.1` → `0.5.2`**, **`@clara-code/backend`** **`1.3.1` → `1.3.2`**.

- **Version bump (prior)** — root **`0.5.0` → `0.5.1`**, **`@clara-code/backend`** **`1.3.0` → `1.3.1`**.

### Added

- **Customer brain — CLI, MCP example, and ship gate** — **`clara` `0.1.1` → `0.1.2`**: `clara the-brain` (tenant default `brain-api.claracode.ai`, blocks `quiknation` targets), `packages/cli/.claude/commands/the-brain-customer.md`, `mcp-brain-customer.example.json`; `scripts/verify-customer-brain-ship.mjs` blocks founder host and founder-only command marker; **`release-on-tag.yml`** and **`clara-code-ide.yml`** run the verifier (CLI dist and VSIX). Spec: **`docs/architecture/BRAIN_API_ACCESS_CONTROL.md`**. Prompt `02-clara-code-the-brain-customer-wrapper-and-build-gate.md` → `prompts/2026/April/27/3-completed/`. See **`packages/cli/CHANGELOG.md`**, **`.github/CHANGELOG.md`**, **`docs/CHANGELOG.md`** **\[Unreleased\] - 2026-04-27**.

- **Prompt queue (P0)** — related planning note: `17-clara-code-the-brain-customer-wrapper-and-build-gate.md` (April 26 queue) and the newer **`02-…`** prompt completed under `prompts/2026/April/27/3-completed/`. For the delivered behavior, use the **Customer brain** item above and **`docs/architecture/BRAIN_API_ACCESS_CONTROL.md`**.

- **Prompt queue bookkeeping** — `01-cursor-fix-clara-code-glm-union-blocks-ci.md` → `prompts/2026/April/27/3-completed/` (GLM model union already present on `main`/`develop`); `00-fix-platform-implementation-issues.md` → `prompts/2026/April/27/3-completed/` (platform follow-up: migrations `043`–`047` + services; see **Fixed** above and **`backend/CHANGELOG.md`**).

## [Unreleased] - 2026-04-25

### Changed

- **Monorepo version** — root `package.json` **`0.4.2` → `0.5.0`**. **`@clara-code/backend`** **`1.2.0` → `1.3.0`**. **`@clara/web-ui` / `frontend`** **`0.1.2` → `0.1.3`**. **`@claracode/sdk`** **`0.2.0` → `0.3.0`**. See **`backend/CHANGELOG.md`**, **`frontend/CHANGELOG.md`**, **`packages/sdk/CHANGELOG.md`**, **`docs/backend-rest-api.md`**, **`docs/CHANGELOG.md`**.

### Added

- **Usage telemetry, abuse preflight, operation credits, harness talents, optional Hermes inference router, Stripe billing + Clerk tier sync** — SQL `038`–`041`; `requireAbuseCheck` on authenticated REST; `POST /api/billing/*` + webhook alias; `/api/harness-talents`; SDK harness helpers; frontend billing BFF. Prompts **11**, **14**, **18**, **22** completed (see `prompts/` `3-completed/`). Details: **`backend/CHANGELOG.md`** (primary), **`frontend/CHANGELOG.md`**, **`packages/sdk/CHANGELOG.md`**.

- **Product prompt 14 (supersedes prior draft)** — `prompts/2026/April/23/1-not-started/14-talents-per-agent-tier-caps.md` replaces `14-skills-per-agent-and-voice-limits.md`. Scope: per-tier **Talents** attach caps, Talent Library inventory, wallet purchase; voice limits remain on tier ladder + abuse docs per pricing cross-links. See `docs/CHANGELOG.md` **\[Unreleased\] - 2026-04-25**.

- **Review** — `docs/review/20260425-014844-code-review.md` (UltraThink: QCS1 prompt waves, pricing documentation consistency, prompt queue). Cross-ref: `docs/CHANGELOG.md` **\[Unreleased\] - 2026-04-25**.

- **Backend + CLI — `/config-agent` harness agents** — SQL `032`–`034` (`agent_templates` ≥20 rows, `user_agents`); `GET/POST/DELETE` on `/api/agents` for template catalog and `user_agents`; `clara config-agent`. See **`backend/CHANGELOG.md`**, **`packages/cli/CHANGELOG.md`**. Prompts **`19-config-agent-command`**, **`20-agent-template-library`** → `prompts/2026/April/25/3-completed/`.

- **Backend + SDK — SITE_OWNER interactions + mobile update queue** — Migrations `035`–`036` (`site_agent_deployments`, `site_owner_*`, `mobile_update_requests`); `platform-standards.service`, `require-site-owner` middleware, `/api/site-owner/*` and `/api/mobile-updates/*` routes, `buildSiteOwnerAgentSystemPrompt`, `mobile-note-capture.service` + `voice-spec-interpreter`. **`@claracode/sdk/react`**: `SiteOwnerPanel`, `useAgentNoteCapture`, `MOBILE_CAPTURE_MODE_PROMPT`. See **`backend/CHANGELOG.md`**, **`packages/sdk/CHANGELOG.md`**, **`docs/backend-rest-api.md`**. Prompts **`23-site-owner-agent-interaction`**, **`24-mobile-agent-notes-capture`** → `prompts/2026/April/25/3-completed/`.

- **Backend + Web — agent ejection exports** — Migration `037` (`ejections`); `/api/ejections` (ZIP export, attestation, list with pre-signed URLs); `ejection.service`, S3 helper, anti-double-hosting scan scaffold; **`frontend`**: `QuarterlyAttestation` + `useQuarterlyAttestation` on app layout. See **`backend/CHANGELOG.md`**, **`docs/backend-rest-api.md`**, **`frontend/CHANGELOG.md`**. Prompt **`25-ejection-export-system`** → `prompts/2026/April/25/3-completed/`.

- **Backend — agent messaging, sprints, team standup, global profile, builder vs runtime** — SQL `028`–`031`; REST `/api/agents` and `/api/sprints`; `memory.service` layers phase, `user_profiles`, inbox, and `[My Memory]` for voice. Runtime agents gated to Business/Enterprise (`plan-limits.tierCanBuildRuntimeAgents`). **`docs/backend-rest-api.md`** summarizes routes and migrations. Prompts **`08-agent-to-agent-messaging`**, **`09-standup-and-sprint-engine`**, **`10-clara-as-scrum-master`**, **`15-builder-vs-runtime-agents`** moved to `prompts/2026/April/23/3-completed/`. See **`backend/CHANGELOG.md`**, **`docs/CHANGELOG.md`**.

- **Backend — agent lifecycle hooks + MCP** — `HookBus` (`backend/src/services/hook-bus.service.ts`), six hook types (`backend/src/lib/hooks.ts`), platform hooks for introspection deflection, output scrub, and deployed-agent Bash gate (`backend/src/hooks/platform-hooks.ts`); `POST /api/voice/converse` runs hooks (optional `deployment_id` / `agent_name`). MCP: migration `backend/migrations/027_mcp_connections.sql`, models, tier helpers, encrypted per-connection credentials, `/api/mcp/*` routes, dispatcher + Hermes notes in `docs/mcp-hermes-integration.md`, curated catalog seed. **`@claracode/sdk`** — `registerHook` stub and hook types. Tests: `hook-bus.service.test.ts`, `mcp-dispatcher.test.ts`. Prompts `26-agent-lifecycle-hooks.md` and `27-mcp-tool-extension.md` completed under `prompts/2026/April/23/3-completed/`. See **`backend/CHANGELOG.md`**, **`packages/sdk/CHANGELOG.md`**, **`docs/CHANGELOG.md`**.

- **Backend — agent-scoped persistent memory (voice)** — SQL migration `backend/migrations/007_user_memory.sql` (`conversation_turns`, `agent_user_memory`); Sequelize models and `memory.service.ts`; `POST /api/voice/converse` loads memory per `(user, agent_id)`, supports `text` without audio, forwards `history` to Hermes, best-effort turn persistence; `GET /api/voice/memory?agent_id=`. **CLI** — per-day `session_id` from `~/.clara` `userId` + `buildSessionId`, passes `agent_id` / `surface` via `@imaginationeverywhere/clara-voice-client`. Tests: `memory.service.test.ts`, extended `voice.test.ts`. Prompt `00-persistent-memory-foundation` completed under `prompts/2026/April/23/3-completed/`. See **`backend/CHANGELOG.md`**, **`packages/cli/CHANGELOG.md`**, **`packages/clara-voice-client/CHANGELOG.md`**, and **`docs/CHANGELOG.md`**.

### Changed

- **Customer-facing pricing (copy)** — `customer-facing-page.md` revised in `pricing/` and mirroring `.cursor/pricing/`. See `docs/CHANGELOG.md` **\[Unreleased\] - 2026-04-25**.

- **Monorepo version** — root `package.json` `0.4.0` → **`0.4.1`** (docs-only: `customer-facing-page` + `docs/review/20260425-014844-code-review.md`); `0.4.1` → **`0.4.2`** (prompt 14 Talents/tier-caps spec; planning-only).

- **Version bump (this release)** — root **`0.3.0` → `0.4.0`**. **`@clara-code/backend`** `1.1.0` → **`1.2.0`**. **`@claracode/sdk`** `0.1.1` → **`0.2.0`**. **CLI** (`packages/cli`) `0.1.0` → **`0.1.1`**. **`@clara/web-ui` / `frontend`** `0.1.1` → **`0.1.2`**. See **Added** in this **\[Unreleased\] - 2026-04-25** block: `/config-agent`, SITE_OWNER + mobile update queue, agent ejection, quarterly attestation.

- **Monorepo version** — root `package.json` `0.2.8` → **`0.3.0`** (backend agent platform: messaging, sprints, scrum, builder/runtime phase; see **Added** above). **`backend`** `1.0.3` → **`1.1.0`**.

- **Monorepo version** — root `package.json` `0.2.7` → **`0.2.8`** (agent lifecycle hooks, MCP extension, SDK hook types; see **Added** above). **`backend`** `1.0.2` → **`1.0.3`**. **`@claracode/sdk`** `0.1.0` → **`0.1.1`**.

- **Monorepo version** — root `package.json` `0.2.6` → **`0.2.7`** (agent-scoped voice memory; see **Added** above and **`docs/voice-dev-stub.md`**).

### Security

- **Backend — agent IP firewall** — Server-side forbidden-pattern list (`backend/src/lib/ip-firewall.ts`), `filterConverseResponsePayload` on `POST /api/voice/converse` responses, `agentConfigService` for future SOUL/system-prompt wrapping, AES-256-CBC helpers for marketplace SOUL at rest (`SOUL_ENCRYPTION_KEY` in `backend/.env.example`). Jest coverage in `backend/src/__tests__/lib/ip-firewall.test.ts` and the voice route suite. See **`backend/CHANGELOG.md`**, **`docs/CHANGELOG.md`**, and `backend/.env.example`.

### Added

- **Marketing (web)** — `frontend` Clara voice hook/component and design polish (`Header`, `Hero`, `InstallSection`, `Pricing*`, tokens). See **`frontend/CHANGELOG.md`**.
- **`@ie/clara` shim** — `packages/clara/bin/clara.mjs` + `test/shim.test.mjs`; see **`packages/clara/CHANGELOG.md`**.

- **Clara AI pricing runbooks** — new `clara-ai-tier-ladder.md`, `clara-ai-business-tier-ladder.md`, `clara-ai-reseller-rates.md`, and `clara-ai-vp-business-economics.md` under `pricing/` with `.cursor/pricing/` mirrors.
- **Pricing and platform policy docs** — `pricing/` and mirroring `.cursor/pricing/`: new `abuse-protection.md`, `cogs-and-unit-economics.md`, `customer-facing-page.md`, `ip-ownership-and-ejection.md`, `model-routing-strategy.md`. Updated `combined-examples.md`, `marketplace-pricing.md`, `voice-tiers.md`; removed `reseller-pricing.md`.
- **MVP and product under `docs/status/`** — content relocated from `docs/auto-claude/` (removed): `MVP_*.md`, `PRODUCT_PRD.md`, `CLARA_TALENT_AGENCY*.md` now live under `docs/status/`.
- **Product prompts (April 23)** — `prompts/2026/April/23/1-not-started/` expanded with roadmap and platform stubs (agent messaging, standup, usage limits, IP firewall, model routing, billing, ejection, etc.); `03-thin-client-non-negotiable-ip-hygiene.md` completed under `3-completed/`. Older duplicate prompt paths under April 19/21 removed in favor of the April 23 tree.
- **Mockups site assets** — `mockups/site/public/clara-ai-icon-1024-cyan.png`, `final2-v3-wavy-voice-v3.png`; `mockups/site/package-lock.json` for reproducible install.

### Changed

- **Pricing playbooks (iteration)** — `abuse-protection`, `cogs-and-unit-economics`, `communication-costs`, `customer-facing-page`, `ip-ownership-and-ejection`, `marketplace-pricing`, `model-routing-strategy`, `product-tiers`, `thinking-tiers`, and `voice-tiers` updated in `pricing/` and `.cursor/pricing/`. See `docs/CHANGELOG.md` **\[Unreleased\] - 2026-04-25**.
- **Marketing mockup app (`mockups/site/`)** — `App` shell and `HeroSection`, `Header`, `InstallSection`, `FeaturesSection`, `PricingSection`, auth and checkout pages refreshed; `ClaraLogo` and global styles in `index.css` (dropped `clara-brand-tokens.css`). Replaced 2D/3D clara-code logos with new art direction.
- **TypeScript base** — `tsconfig.base.json`, root `tsconfig.json`, and `packages/sdk/tsconfig.json` use `ES2023` instead of `ES2024` for `target` / `lib` to align with supported runtimes. See `packages/sdk/CHANGELOG.md` for SDK.
- **Monorepo version** — root `package.json` `0.2.2` → **`0.2.3`** (voxtral doc merge); `0.2.3` → **`0.2.4`** (pricing and prompts; docs only); `0.2.4` → **`0.2.5`** (IP firewall, marketing voice, CLI/shim, prompt queue moves); `0.2.5` → **`0.2.6`** (marketing home + install + pricing + tokens; see **`frontend/CHANGELOG.md`**).
- **Product prompts (April 23)** — `01-hero-section-design-fixes`, `02-install-section-design-fixes`, `03-pricing-section-visual-polish`, `04-design-tokens-and-header-polish`, and `21-website-redesign-match-claraagents` completed under `prompts/2026/April/23/3-completed/`.

### Fixed

- **`create-clara-app` repository hygiene** — `packages/create-clara-app/.gitignore` now includes `bin/` so optional local shims (not in npm `package.json` `files`) are not left untracked. See `packages/create-clara-app/CHANGELOG.md` and `docs/CHANGELOG.md` **\[Unreleased\] - 2026-04-25**.

### Added

- **Clara — desktop, marketing, and release** — Tauri `desktop/` two-column shell with voice side panel (bundled `converse-browser`, `/voice/converse` greeting + PTT; `docs/distribution-pipeline.md` and `.github/workflows/*`). Marketing: `VoiceGreeting` TTS autoplay with tap-to-play on autoplay block; `InstallSection` `npm install -g clara@latest`, `NEXT_PUBLIC_CLARA_DESKTOP_DMG_URL` for the macOS download CTA (`frontend/CHANGELOG.md`, `frontend/.env.example`). `packages/clara-voice-client`: `./converse-browser` export for webview-only builds.

### Changed

- **Monorepo version** — root `package.json` `0.2.1` → **`0.2.2`**.

- **Review** — `docs/review/20260421-pr55-clara-distribution-review.md` (PR #55 clara-distribution: coverage findings, `InstallSection` beta path, `packages/clara/bin/clara.mjs` shim). Cross-ref: `docs/CHANGELOG.md` **\[Unreleased\] - 2026-04-25**.

### Added (cross-reference: directory changelogs)

- See **`frontend/CHANGELOG.md`**, **`packages/clara-voice-client/CHANGELOG.md`**, **`docs/CHANGELOG.md`**, **`.github/CHANGELOG.md`**, and **`desktop/CHANGELOG.md`**.

### Added (prompts)

- **`05-unblock-pr54-pr55.md`** — `prompts/2026/April/21/1-not-started/05-unblock-pr54-pr55.md` to execute fixes and tests so PRs #54 (voice) and #55 (distribution) can land.

### Changed

- **Monorepo version** — root `package.json` `0.2.0` → **`0.2.1`** (docs + planning artifacts; no app code in this commit).

## [Unreleased] - 2026-04-24

### Added

- **`@imaginationeverywhere/clara-voice-client` (workspace `packages/clara-voice-client/`)** — HTTP client for `POST /voice/converse` (`postVoiceConverse`, `resolveConverseUrl`); **greeting cache** for Node: `readGreetingFromCache` / `writeGreetingToCache` (XDG `~/.cache` or `~/.cache/clara-code`). `node:test` coverage; see `packages/clara-voice-client/CHANGELOG.md` and `README.md`.
- **CLI** — `clara greet` uses the shared voice client and cache; declares `workspace:*` on `@imaginationeverywhere/clara-voice-client`. See `packages/cli/CHANGELOG.md`.
- **Monorepo version** — root `package.json` `0.1.8` → **`0.2.0`** (new package + published surface area; lockstep for workspace consumers).

### Added (docs / prompts / review)

- **Review** — `docs/review/20260421-pr54-clara-voice-client-review.md` (PR #54 pickup).
- **Prompts** — `prompts/2026/April/21/1-not-started/` (CLI / desktop / website / distribution around voice; four stubs). See `docs/CHANGELOG.md` cross-ref.

## [Unreleased] - 2026-04-23

### Fixed

- **IDE extension — packaged `.vsix`** — `packages/ide-extension/.gitignore` now ignores `*.vsix` so `vsce`/local packaging output is not left as an untracked binary in the worktree.
- **Stray merge markers** — Removed `<<<<<<<` / `=======` / `>>>>>>>` blocks accidentally left in `package.json` (broke pnpm/JSON), `.claude/commands/CHANGELOG.md`, `.cursor/commands/CHANGELOG.md`, `queue-prompt.md`, and `branch-cleanup.md`. Reconciled `1.35.3` (commands bundle) with `1.35.2` (preserve remote branch named `origin` in `/branch-cleanup`); `package.json` `version` stays `0.1.4`.
- **Backend — Clara Core subgraph** — `createClaraCoreSubgraph` in `backend/src/graphql/clara-core/server.ts` now declares an explicit `Promise<RequestHandler>` return type so `tsc` does not emit `TS2742` (inferred type depending on `@types/qs`).
- **Backend — express `tsgo` (TS2742)** — `export const app` in `server.ts` is typed as `Application`; all `const router` route modules use `ReturnType<typeof Router>` so the root `tsgo` check does not require naming inferred types from `@types/express-serve-static-core`.

### Added

- **Claude / Cursor commands** — `/hotfix-to-main` (Mo-gated emergency merge to `main` + backport); shared **`.claude/commands/prompts/`** (and Cursor mirror) for setup and product-page prompt stubs; `node:test` **contract tests** in `.claude/commands/__tests__/session-start.contract.test.mjs` to guard `session-start.md` content. See `.claude/commands/CHANGELOG.md` and `.cursor/commands/CHANGELOG.md` **[1.35.3]**; directory notes in `.claude/CHANGELOG.md` **[1.35.3]**.

### Changed

- **Auto Claude + platform command docs** — Task JSON examples in `ac-*.md` use **`.internal/tasks.json`** instead of `.auto-claude/tasks.json` (aligns with `.internal/plans/` and planning-task paths). **`/review-code` v3.0.0** pulls first and auto-detects open `prompt/*` PRs. Mirrored updates under `.claude/commands/` and `.cursor/commands/` (sync, merge, migrations, project lifecycle, design, and pickup/dispatch). Cross-ref: `docs/CHANGELOG.md` **\[Unreleased\] - 2026-04-23**.

## [Unreleased] - 2026-04-19

### Fixed

- **`npm run check` / root `tsgo`** — Root `tsconfig.json` no longer typechecks `backend/**` with the monorepo compiler (dependencies were not resolvable; backend uses CommonJS + package-local `paths`). `backend` is added to the pnpm workspace; `pnpm -C backend run type-check` runs after `tsgo`. Optional Anthropic sandbox example is excluded from root `tsgo` (`packages/coding-agent/examples/extensions/sandbox/**`). See `pnpm-workspace.yaml` and root `package.json` `check` script.
- **`@mariozechner/pi-ai` — OpenRouter test model ids** — `context-overflow.test.ts` and `total-tokens.test.ts` cast `meta-llama/llama-4-maverick` to `keyof typeof MODELS.openrouter` for `getModel` because TypeScript’s inferred catalog union omits some OpenRouter keys (`TS2345`). Details: `packages/ai/CHANGELOG.md`.
- **`@mariozechner/pi-ai` — Bedrock build on pnpm / CI** — Added `@smithy/node-http-handler` as a direct dependency so TypeScript resolves the dynamic imports in `amazon-bedrock.ts` (proxy agents and `AWS_BEDROCK_FORCE_HTTP1`) under pnpm’s isolated `node_modules`. Fixes `TS2307` during `npm run build` in GitHub Actions. Details: `packages/ai/CHANGELOG.md`.
- **`@mariozechner/pi-agent-core` and `@mariozechner/pi-coding-agent` — TypeBox on pnpm / CI** — Declared `@sinclair/typebox` as a direct dependency in both packages so TypeScript resolves schema and tool types that were previously only reachable transitively via `@mariozechner/pi-ai`. Fixes `TS2307` in `packages/agent` and pre-empts the same failure in `packages/coding-agent`. Details: `packages/agent/CHANGELOG.md`, `packages/coding-agent/CHANGELOG.md`.
- **`create-clara-app` — bin path matches build output** — `package.json` `bin` and the post-build `chmod` now target `dist/cli.js` (TypeScript emits to `dist/` per `tsconfig.build.json`). Removes the broken `bin/index.js` assumption that caused `npm run build` to fail in CI. Obsolete `bin/create-clara-app.js` stub removed; `files` no longer lists `bin`. Package `0.1.2` → `0.1.3`. Details: `packages/create-clara-app/CHANGELOG.md`.
- **CLI — Ink upgrade unblocks TUI boot (PR #4 of CLI-first MVP)** — `packages/cli` bumps `ink` `^5.0.1` → `^6.8.0` and `react` `^19.0.0` → `^19.2.0`. Fixes the `Cannot read properties of undefined (reading 'ReactCurrentOwner')` crash that `react-reconciler@0.29.x` (shipped with Ink 5) hit on React 19 at boot. Verified with `tmux`: `FirstRunPrompt` now renders cleanly, 16/16 CLI unit tests green, 17/17 backend voice tests green. Ink 7 was rejected because it requires Node 22 — that would break `npx claracode@latest` for every Node 20 user; Ink 6 keeps `engines: node >= 20`. Closes the last in-our-court blocker on the CLI-first MVP acceptance criteria (`npx claracode@latest installs and runs clara in fullscreen TUI mode`).
- **CLI — `engines.node` in package manifest (PR #4 review follow-up)** — `packages/cli/package.json` declares `engines.node` `>=20.0.0` so npm/npx surfaces an engine warning on Node 18 and below before obscure runtime failures. Doc touch: `docs/cli-voice-loop.md`. Details: `packages/cli/CHANGELOG.md`.

### Added

- **Docs — PR #4 review artifact and prompt queue** — `docs/review/20260419-035221-pr4-ink6-review.md`; new prompt drafts `prompts/2026/April/19/1-not-started/20-pricing-ui-vault-sync.md` and `21-checkout-routes-fix.md`. See `docs/CHANGELOG.md`.
- **Backend — Hermes/Modal voice wire-up (PR #3 of CLI-first MVP)** — `backend/src/routes/voice.ts` now proxies `/api/voice/stt` → `${HERMES_GATEWAY_URL}/voice/stt` and `/api/voice/tts` → `${HERMES_GATEWAY_URL}/voice/tts` with `Authorization: Bearer ${HERMES_API_KEY}` (Option B auth per cp-team handoff 2026-04-19: edge validates Clerk JWT / sk-clara key, then swaps in the internal key; Modal never sees user tokens). 150 s axios timeout accommodates the Modal A10G cold-start (60–120 s Whisper + XTTS load). Refuses to call Modal when `HERMES_API_KEY` is missing (503 instead of anonymous proxy). SSM source: `/clara-code/HERMES_GATEWAY_URL` (String) + `/clara-code/HERMES_API_KEY` (SecureString). `CLARA_VOICE_DEV_STUB=1` still short-circuits the proxy for offline local dev. Tests: `backend/src/__tests__/routes/voice.test.ts` +3 cases for path, bearer header, timeout, and missing-key 503 — 17/17 voice tests green.
- **CLI — Cold-start warm-up UX (PR #3)** — `packages/cli/src/hooks/useVoice.ts` now exposes `warming: boolean`. If `/api/voice/stt` hasn't responded within 4 s, the input bar flips to `warming up Clara's voice model (cold start, up to ~2m)…` so the first call after idle doesn't look frozen. `Escape` still aborts. No new env vars — purely a UX upgrade. 16/16 CLI tests green.
- **Docs — Voice auth scheme (PR #3)** — `docs/clara-platform/voice-auth-scheme.md` (edge-side summary of the Option B contract, pointing at the full spec in the `claraagents` repo), updated `docs/voice-dev-stub.md` and `docs/cli-voice-loop.md` for the final wire-up + cold-start behaviour, and `backend/.env.example` documents `HERMES_API_KEY` and the SSM source for both params.
- **CLI — Voice loop on dev stub (PR #2 of CLI-first MVP)** — `packages/cli` now has a working speech→transcript→gateway loop: `src/lib/stt-client.ts` (POST `/api/voice/stt`, base64 audio, Bearer token, `x-clara-stub-text` passthrough), `src/lib/audio-capture.ts` (spawns `sox`/`rec` when installed; noop fallback so the dev-stub loop still closes without a mic), `src/lib/session-log.ts` (append-only `<cwd>/.clara/session-YYYY-MM-DD.log`), `src/lib/backend.ts` (`CLARA_BACKEND_URL` resolution), and `src/components/FirstRunPrompt.tsx` (token prompt linking `https://claracode.ai`). `src/hooks/useVoice.ts` rewritten with `startListening` / `stopAndSend` / `cancel` phases and `AbortController` support. `src/tui.tsx` wired to `Ctrl+Space` (primary, `Ctrl+M` alias) and `Escape` (cancel). `src/index.ts` default action launches the TUI so `clara` with no args runs the full experience. New `@clara/cli` test script (`node --test` + `tsx`) with 16 passing cases in `packages/cli/test/`. Docs: `docs/cli-voice-loop.md`.
- **Backend — Voice dev stub (PR #1 of CLI-first MVP)** — `POST /api/voice/stt` and `POST /api/voice/tts` in `backend/src/routes/voice.ts`. When `CLARA_VOICE_DEV_STUB=1`, `/stt` returns a mock transcript (`x-clara-stub-text` header, `body.stubText`, or default) without calling Modal, and `/tts` returns a 1-second silence WAV via `backend/src/utils/silence-wav.ts`. Real mode proxies to `HERMES_GATEWAY_URL` (fallback `CLARA_VOICE_URL`) and 503s when neither is set. Unblocks CLI voice loop (PR #2) while `cp-team` finalizes the Modal URL. Docs: `docs/voice-dev-stub.md`. Tests: `backend/src/__tests__/routes/voice.test.ts` (+9 cases: dev stub + real mode + 503 path).
- **Backend — AWS SES email** — `backend/src/services/email.service.ts`, templates under `backend/src/emails/` (welcome + first API key), HTML escaping for user-controlled fragments. **Clerk webhook** `POST /api/webhooks/clerk` (raw body, Svix `CLERK_WEBHOOK_SIGNING_SECRET` / `CLERK_WEBHOOK_SECRET`). Welcome email on `user.created`. **First key email** after successful `POST /api/keys` when the user had no prior keys and `CLERK_SECRET_KEY` is set. Jest coverage in `backend/src/__tests__/email.service.test.ts`; keys route tests updated.
- **Prompt queue** — April 19 batch prompts `10`–`17` moved from `prompts/2026/April/19/1-not-started/` to `prompts/2026/April/19/3-completed/`.

### Changed

- **`@clara-code/backend`** — `1.0.1` → `1.0.2`. `backend/.env.example` documents Clerk, webhook signing secret, SES, existing voice URL notes, and the new `HERMES_GATEWAY_URL` / `HERMES_API_KEY` / `CLARA_VOICE_DEV_STUB` flags. Real-mode STT/TTS now targets `/voice/stt` and `/voice/tts` (was `/stt` and `/tts`) and injects `Bearer HERMES_API_KEY`; timeout bumped from 30 s to 150 s for Modal cold-starts.
- **mom (Clara Gateway)** — `HERMES_GATEWAY_URL` optional; `createHermesFromEnv()`; Hermes-free Anthropic streaming when unset; startup logs; `packages/mom/README.md` and `.env.example` no longer embed a default Modal gateway URL. Details: `packages/mom/CHANGELOG.md`.
- **`@clara/cli`** — CLI voice loop wired to `/api/voice/stt` with `Ctrl+Space` / `Escape` keybindings, first-run token prompt, and project-local session logs. Details: `packages/cli/CHANGELOG.md`.
- Monorepo root version `0.1.3` → `0.1.4` → `0.1.5` → `0.1.6` → `0.1.7` → `0.1.8` (patch: pi-ai OpenRouter test `getModel` typing for `tsgo`).
- **Directory changelogs** — `docs/CHANGELOG.md`, `packages/ai/CHANGELOG.md`, `packages/agent/CHANGELOG.md`, `packages/coding-agent/CHANGELOG.md`, `packages/cli/CHANGELOG.md`, `packages/mom/CHANGELOG.md` updated; see sections above (including PR #4 `engines.node` follow-up).

## [Unreleased] - 2026-04-16

### Added

- **Voice Coding and VRD attribution** — Root `README.md` reframed as the canonical public record for **Voice Coding** and **VRD** (Voice Requirements Document), with attribution to Amen Ra (April 2026). Added `VRD-TEMPLATE.md` plus companion drafts `linkedin-article.md` and `x-thread.md` for distribution.
- **`/branch-cleanup`** — Replaces `/git-sweep` and `/merge-all`; `.claude/commands/branch-cleanup.md` + `.claude/scripts/branch-cleanup.sh` (mirrored under `.cursor/`). See `.claude/commands/CHANGELOG.md` and `.cursor/commands/CHANGELOG.md` **[1.35.2]**.
- **Prompt queue** — `prompts/2026/April/16/1-not-started/` — QCS1 voice, desktop, CLI, and Hermes backlog prompts.

### Changed

- **Security** — Removed hardcoded Modal/Hermes deployment URLs from app source; voice and gateway endpoints require `CLARA_VOICE_URL` / `HERMES_GATEWAY_URL` (see `backend/.env.example`, `frontend/.env.example`). CLI, IDE extension, and TUI resolve gateways from env or user config only.
- **`sync-herus`** — Comment now references `/branch-cleanup` instead of `/git-sweep` when listing shell scripts copied to Herus.
- Monorepo root version `0.1.2` → `0.1.3`.
- **Directory changelogs** — `docs/CHANGELOG.md`, `frontend/CHANGELOG.md`, `.claude/CHANGELOG.md` updated; command-level notes in `.claude/commands/CHANGELOG.md` and `.cursor/commands/CHANGELOG.md` **[1.35.2]**.

### Removed

- **`/git-sweep` and `/merge-all`** — Commands and scripts removed; workflow superseded by `/branch-cleanup`. Details in `.claude/commands/CHANGELOG.md` **[1.35.2]**.

### Fixed

- **Tests** — Formatting-only updates in `backend/src/__tests__/routes/webhooks-stripe-tier-resolution.test.ts` and `frontend/src/__tests__/middleware.test.ts` (expect call wrapping, Vitest import order).

## [0.1.0] - 2026-04-13

### Added

- **Stripe live payments** — Merchant account approved. Production Stripe keys stored in AWS SSM (`/clara-code/STRIPE_PUBLISHABLE_KEY`, `/clara-code/STRIPE_SECRET_KEY`, `/clara-code/prod/*`). `STRIPE_SECRET_KEY` wired as Wrangler runtime secret for `clara-code` (production) and `clara-code-preview`. Checkout build prompt queued at `prompts/2026/April/13/1-not-started/06-stripe-checkout-and-subscriptions.md`. BLK-01 fully resolved.
- **Custom domain routing** — `frontend/wrangler.toml` now declares explicit route patterns for `claracode.ai`, `www.claracode.ai` (production) and `develop.claracode.ai` (preview) as CF custom domains.
- **Cloudflare deployment docs** — Four new guides in `docs/cloudflare/`: Next.js 15→16 upgrade, Workers deployment reference, step-by-step walkthrough, and index README. See `docs/CHANGELOG.md` for details.
- **MVP tracking** — `docs/internal/MVP_PROGRESS.md`, `MVP_SPRINT_PLAN.md`, `MVP_BLOCKERS.md` — three internal plan files capturing current sprint state (~52% MVP complete, two remaining hard blockers). See `docs/CHANGELOG.md`.
- **5-surface dispatch prompts** — Sequential Cursor agent prompts queued at `prompts/2026/April/13/1-not-started/01–06`: frontend dashboard wiring, backend Svix hardening, CLI/TUI end-to-end wire, IDE extension activation, API versioning + docs, and Stripe checkout.
- **`setup-email` boilerplate command** — Reusable `/setup-email` command added to Auset boilerplate and synced to all 55 Heru projects via `sync-herus --push`. Full SES + Cloudflare + Clerk email setup walkthrough.

### Changed

- Root `wrangler.toml` replaced with reference comments — `frontend/wrangler.toml` is the single deployment config for CF Workers.
- `frontend/.env.example` documents Stripe env vars with build-time vs. runtime notes.
- `.gitignore` extended to exclude `.open-next/` and `frontend/.open-next/` (OpenNext build artifacts).
- Monorepo version `0.0.5` → `0.1.0`.

### Fixed

- `frontend/CHANGELOG.md`, `docs/CHANGELOG.md` — cross-referenced here for component-level detail.

## [Unreleased] - 2026-04-13

### Added

- **`create-clara-app` publish templates** — `packages/create-clara-app/templates/` (OpenNext config, Cloudflare `wrangler.toml`, `env.example` for Clerk + Hermes) plus package `CHANGELOG.md`, `.gitignore` for local `bin/index.js` shim. Package version `0.1.0` → `0.1.1`. See `packages/create-clara-app/CHANGELOG.md` and `docs/CHANGELOG.md`.

### Changed

- **`create-clara-app` `0.1.1` → `0.1.2`** — README documents full usage and scaffold steps; package changelog records README changes. See `packages/create-clara-app/CHANGELOG.md` and `docs/CHANGELOG.md`.

- **`@claracode/sdk`** (`packages/sdk/`) — TypeScript client for Hermes-compatible HTTP APIs: `createClient`, `ask`, SSE `stream`, voice sessions, and agents; ESM+CJS builds, local `hermes-stub`, Vitest integration test. Root `npm run build` now includes `pnpm -C packages/sdk run build`. See `packages/sdk/README.md` and `packages/sdk/CHANGELOG.md`.
- **Clara Code IDE** (`ide/clara-code/`): VSCodium-oriented scaffold — `clara-voice` VS Code extension (Clara Dark theme, status bar voice control, Code Lens), `product.json` merge tooling and defaults (Hermes/Copilot-off), build scripts, and GitHub Actions workflow `clara-code-ide.yml` to produce per-OS VSIX artifacts. See `ide/clara-code/README.md`, `ide/clara-code/CHANGELOG.md`, `.github/CHANGELOG.md`, and `docs/CHANGELOG.md`.
- `docs/review/20260413-164741-code-review.md` — code review for `3ee542a5` (queue-prompt + review-code GitHub push step addition). Grade **A-**; 2 medium issues (broad `git add`, no push-fail handler). Backend: 85/85 pass. No corrective prompt — grade A-.
- `docs/review/20260413-162351-code-review.md` — code review for 5 recent commits: IDE scaffold, `@claracode/sdk`, backend health fix, `create-clara-app` templates. Grade **B+**; 0 critical, 2 high, 3 medium, 4 low. Backend: 85/85 tests passing, 98% statement coverage. See `docs/CHANGELOG.md`.
- `prompts/2026/April/13/1-not-started/01-fix-voice-session-and-health-handler.md` — corrective Cursor agent prompt for H1 (VoiceSession `ready` promise must reject on init failure), H2 (Express 4 async health handler needs try/catch → 503), M2 (agent stream missing `Accept: text/event-stream`). Blocks production promotion until resolved.
- `docs/review/20260412-180043-code-review.md` — full Sprint 1/2 code review covering all 7 branches merged into develop (Grade B, 9 issues: 1 critical, 3 high, 4 medium, 1 low). Backend: 77/77 tests passing, 91% line coverage.
- `tasks/prompts/1-not-started/S2-05-review-fixes.md` — corrective Cursor agent prompt addressing CRIT-01 (desktop voice overlay IP protection), HIGH-01 (mobile API base env var), HIGH-02 (backend branch coverage), HIGH-03 (CLI dist in git). Blocks production promotion until resolved.
- Clara Code web UI routes and components (`@clara/web-ui`): dashboard, pricing, API keys, settings, Clerk sign-in/up, Apollo client wiring, and middleware.
- Root `CHANGELOG.md` for monorepo-level release notes.
- `prompts/2026/April/11/` — backend build and review follow-up prompts; `docs/review/` — three backend review write-ups (code review, corrective review, test suite review).

### Changed

- Monorepo root version `0.1.1` → `0.1.2` (`create-clara-app` template bundle and docs).
- Monorepo root version `0.1.0` → `0.1.1` (new `@claracode/sdk` workspace package and build step).
- Regenerated `package-lock.json` so workspace installs resolve cleanly (fixes missing CLI dev tools such as `tsup` on disk).
- Pinned monorepo-wide `react` and `react-dom` to `19.2.5` via root `devDependencies` and `overrides` so Next.js and peers resolve a single React version.
- Refreshed `packages/ai/src/models.generated.ts` from the model-generation script.
- Monorepo root version `0.0.4` → `0.0.5`; `@clara-code/backend` `1.0.0` → `1.0.1` (test maintenance).
- Prompt archive: removed dated `prompts/2026/April/10/` and `prompts/magic-patterns/` tree in favor of consolidated April 11 prompts.
- `.gitignore`: ignore `graphify-out/`, local `.wrangler/` and `packages/web-ui` Cloudflare/Vercel output dirs; stop tracking `memory/session-checkpoint.md` (local-only).
- `packages/web-ui/next-env.d.ts`: include generated `routes.d.ts` reference for App Router types.

### Fixed

- `@clara/cli`: removed a duplicate `tui` command registration that referenced `render`/`React`/`App` without imports; TUI remains registered from `commands/tui.tsx`.
- `@clara/cli`: duplicate `@types/react` devDependency entry in `package.json`.
- `@clara/web-ui`: declared `@apollo/client` and `@clerk/nextjs`; aligned `check` script to run lint and TypeScript.
- `backend` Jest tests: adjust `as never` placement on mocked `req.auth` return values for stricter TypeScript in middleware and route tests (`api-key-auth`, `clerk-auth`, `rate-limit`, `index`, `voice`, `waitlist`).
- Husky `pre-commit`: skip `git add` restaging for paths matched by `.gitignore` (avoids failure when a deleted tracked file still exists on disk as an ignored file).
- `frontend`: ESLint flat config loads Next.js 16 `eslint-config-next/core-web-vitals` via `createRequire`; dashboard localStorage hydration documents `react-hooks/set-state-in-effect` suppression.

### Documentation

- `CLAUDE.md`: graphify knowledge-graph workflow (`graphify-out/`, rebuild command).
- Directory changelogs updated: `packages/web-ui/CHANGELOG.md`, `docs/CHANGELOG.md` (see those files for package-scoped detail).
