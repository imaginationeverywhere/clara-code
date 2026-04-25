# Routing Stack Confirmation — 2026-04-25

> **Jerry (Jerry Lawson):** "Mo asked for a sanity check on the canonical inference stack. I read `pricing/model-routing-strategy.md` end-to-end, walked the deployed code, and produced this divergence note + punch list."

## Canonical stack (as I understand it)

The Hermes harness routes ~80% of requests to **Gemma 4 27B** self-hosted on Modal A100, ~10-15% to **Kimi K2** on Modal H100 for reasoning/agent-build, ~3-5% to **DeepSeek V3 on Bedrock** (only when `taskType ∈ {reasoning, research, debug}` AND input >20k tokens, or for non-reasoning Enterprise tier), and <1% to **premium Claude/GPT via Bedrock** (Enterprise reasoning, or explicit user opt-in). User's own provider via the Deepest plugin short-circuits everything at $0 COGS. Voice always lands on Gemma 4 (Modal) for latency. Fallback chain on availability failure: Gemma → Kimi → DeepSeek → Premium, invisible to user, 3s SLA.

## Reference TS implementation (matches spec)

- `backend/src/services/model-router.service.ts` — `selectModel()` and `selectFallback()` align 1:1 with the decision tree at `pricing/model-routing-strategy.md` lines 64-108. Default returns `gemma_27b`. DeepSeek V3 only fires for reasoning/research/debug at >20k tokens, or non-reasoning Enterprise. Voice routes to Gemma. Fallback chain matches.
- `backend/src/services/hermes-client.service.ts` — invokes `modelRouter.selectFallback()` on retriable HTTP errors (5xx, 429, network). `ENABLE_PREMIUM_FALLBACK=0` correctly blocks bedrock_premium fallback for cost protection.

## Divergences spotted (docs/configs vs canonical)

### A. Stale `.cursor/pricing/` mirror still says "Gemma 3"

- `.cursor/pricing/model-routing-strategy.md:23` — "Primary — Gemma 3 27B"
- `.cursor/pricing/model-routing-strategy.md:105` — "Default: Gemma 3 handles it"
- `.cursor/pricing/cogs-and-unit-economics.md:17` — table row "Gemma 3 27B"
- `.cursor/pricing/cogs-and-unit-economics.md:43` — "Gemma 3 routing (default)"

The `pricing/` files (canonical, on `develop`) are correct at "Gemma 4 27B". The `.cursor/` mirror is stale.

### B. SDK runtime defaults claim "DeepSeek V3.2 default" — direct contradiction of canonical

These ship to developers and assert DeepSeek-as-primary in copy and exported constants:

- `packages/clara/src/index.ts:39-40` — `export const CLARA_DEFAULT_MODEL = "deepseek.v3.2"` and JSDoc "default model for Clara agents — DeepSeek V3.2 via AWS Bedrock"
- `packages/clara/src/index.ts:60` — JSDoc "Sets the Hermes default model (DeepSeek V3.2 via Bedrock)"
- `packages/mom/src/agent.ts:32` — comment "Default: DeepSeek V3.2 via Hermes → Bedrock when HERMES_GATEWAY_URL is set"
- `packages/mom/src/agent.ts:43` — log line "Model router: Clara Gateway (Hermes) — Bedrock DeepSeek V3.2"
- `packages/create-clara-app/src/cli.ts:107` — README scaffold ships "Default model: DeepSeek V3.2 via AWS Bedrock (Hermes router)"

These are misleading because the actual selection happens server-side in `model-router.service.ts` (Gemma 4 default). The SDK is just identifying the gateway endpoint, but the copy reads as a hardcoded model preference and contradicts the canonical routing.

### C. `/setup-bedrock` command + prompt template assume DeepSeek-primary

- `.claude/commands/setup-bedrock.md` (and `.cursor/` mirror) — entire command frames DeepSeek-R1 as "the primary default" via `BEDROCK_PRIMARY_MODEL=deepseek.r1-v1:0`
- `.claude/commands/prompts/setup/bedrock.md:15` — "Primary: DeepSeek-R1 on Bedrock"
- `.claude/commands/CHANGELOG.md:29` — describes the command as "DeepSeek default"

This is OK if scoped to Ra Intelligence in non-Clara Herus, but reads as platform-wide and will mislead any cp-team agent that reads it.

### D. Memory + plan files lock in pre-Hermes "DeepSeek V3.2 primary" decision

- `memory/decision-deepseek-v3-primary-llm-2026-04-05.md` — full "Primary LLM = Bedrock DeepSeek V3.2" decision
- `memory/MEMORY.md:7,22` — surfaces this decision as canonical
- `memory/project-clara-code-team-sprint1.md:16,31` — "Bedrock DeepSeek V3.2 via Hermes router (default)"
- `.claude/plans/2026-04-05-paperclip-voice-full-plan.md:194,442,527` and `.cursor/` mirror — Clara default agent = DeepSeek V3.2
- `.claude/plans/2026-04-06-hermes-syncthing-integration.md:360,376` and `.cursor/` mirror — same

These predate the Gemma-primary decision but are still in the active memory layer, which is what fresh agent sessions read.

### E. Catalog files (NOT a divergence — informational)

- `packages/ai/src/models.generated.ts` lists `gemma-3-27b-it`, `gemma-3-4b-it`, `gemma-3-12b-it` — these are upstream provider model IDs in the catalog, not our routing choice. Leave alone.
- `.venv-transcribe/.../ctranslate2/.../transformers.py` "Gemma3" loaders — third-party library code, irrelevant.

### F. Modal deployment — could not verify

No `modal_deploy*.py` and no `hermes/` directory found in this repo. The Hermes gateway lives in a sibling repo (likely `clara-platform/`) — a Roy/Skip task to confirm the Modal container points at Gemma 4, not Gemma 3. I cannot confirm from clara-code alone.

## Punch list (correct on next pass — no refactor today)

1. `packages/clara/src/index.ts` — drop the hardcoded `CLARA_DEFAULT_MODEL = "deepseek.v3.2"` constant or rename to `CLARA_HERMES_GATEWAY_HINT` and update JSDoc to "Hermes harness selects the model per request. Default route: Gemma 4 27B (Modal). Fallback: Kimi K2, DeepSeek V3, premium."
2. `packages/mom/src/agent.ts:32,43` — replace "DeepSeek V3.2 default" comment + log with "Hermes router (Gemma 4 default, Kimi/DeepSeek/Premium fallback)".
3. `packages/create-clara-app/src/cli.ts:107` — README scaffold should say "Default model: Hermes router — Gemma 4 27B primary, with smart fallback".
4. `.cursor/pricing/model-routing-strategy.md` and `.cursor/pricing/cogs-and-unit-economics.md` — `Gemma 3` → `Gemma 4 27B` (mirror the `pricing/` patch Mo already applied).
5. `.claude/commands/setup-bedrock.md`, `.cursor/commands/setup-bedrock.md`, `.claude/commands/prompts/setup/bedrock.md`, `.cursor/commands/prompts/setup/bedrock.md`, `.claude/commands/CHANGELOG.md:29`, `.claude/commands/pickup-prompt.md:86,216`, `.cursor/commands/pickup-prompt.md` — clarify these target Ra Intelligence in non-Clara Herus, NOT the Clara Code platform routing. Or add a `> NOTE: Clara Code uses Gemma 4 primary via Hermes; this template is for non-Clara Herus only.` banner.
6. `memory/decision-deepseek-v3-primary-llm-2026-04-05.md` + `memory/MEMORY.md:7,22` + `memory/project-clara-code-team-sprint1.md:16,31` — append a `SUPERSEDED 2026-04-25` block pointing to `pricing/model-routing-strategy.md` as the canonical source. Don't delete (auset-brain pattern).
7. `.claude/plans/2026-04-05-paperclip-voice-full-plan.md` and `.claude/plans/2026-04-06-hermes-syncthing-integration.md` (and `.cursor/` mirrors) — add a banner noting "DeepSeek V3.2 default" is superseded by Gemma-4-primary routing.
8. **Roy:** verify the Modal Hermes container in `clara-platform/` (or wherever the gateway lives) is built against Gemma 4 27B, not Gemma 3.
9. **Skip:** confirm the actual Hermes Python `smart_model_routing.py` decision tree mirrors the TS reference at `backend/src/services/model-router.service.ts`.
10. **Annie:** no roadmap action required — this is a doc/config alignment pass.

## Bottom line

Reference TS routing (in `clara-code` `develop`) is **canonical-correct**. The damage is in SDK copy (`packages/clara`, `packages/mom`, `create-clara-app`), the `/setup-bedrock` command, the `.cursor/` pricing mirror, and the memory/plan layer — all of which still preach "DeepSeek V3.2 primary." Fresh cp-team agents reading those files will build against the wrong target. None of it is in a runtime hot path that would force DeepSeek selection (the server-side router still picks Gemma), but the docs/copy will mislead developers and undermine the 37× cost moat narrative.

— Jerry
