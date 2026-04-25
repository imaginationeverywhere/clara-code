# Template: AWS Bedrock + DeepSeek default (`--bedrock`)

When **`--bedrock`** is passed to `/pickup-prompt` or `/queue-prompt`, prepend this block so the executor wires **Amazon Bedrock** for Ra Intelligence with **DeepSeek-R1** (or env override) as the default primary model.

## Mandatory actions

1. Follow **`.claude/commands/setup-bedrock.md`** (or `/setup-bedrock`) for AWS verification, IAM, and SSM paths.
2. Read **`docs/standards/AI-MODEL-ROUTING.md`** before changing routing.
3. Backend integration lives under `backend/src/features/ai/bedrock/` and `backend/src/config/bedrock.ts`; extend **`RaIntelligence`** only through the existing Bedrock invoke path.
4. **Never** commit AWS secrets. Document SSM paths under `/quik-nation/<heru>/bedrock/*`.
5. Preserve **Cloudflare AI Gateway** and **Anthropic SDK** as fallbacks when Bedrock is unset or all models in the chain fail.

## Default policy

- **Primary:** Bedrock model used by non-Clara Herus for Ra Intelligence — DeepSeek-R1 on Bedrock (`deepseek.r1-v1:0` or region-specific ID from `list-foundation-models`). Clara Platform routes Gemma 4 27B (Modal) first; Bedrock is only the heavy-reasoning fallback there.
- **Fallback chain:** DeepSeek → Claude (Sonnet class on Bedrock) → Llama — configurable via `BEDROCK_FALLBACK_MODELS`.
- **Complexity:** `simple` / `standard` / `bulk` / `critical` map to ordered model lists in `modelRegistry.ts`.

## Tenant / billing

Scope usage and cost tracking per tenant where the product charges for AI; align with pass-through cost decisions.
