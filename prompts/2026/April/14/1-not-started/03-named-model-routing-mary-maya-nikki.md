# Named Model Routing — Mary, Maya, and Nikki

**Source:** `docs/auto-claude/PRODUCT_PRD.md` — read this document before writing any code.
**Depends on:** Prompt 01 must be merged first (`api_keys` table with `tier` field must exist)
**Branch:** `prompt/2026-04-14/03-named-model-routing-mary-maya-nikki`
**Scope:** `backend/src/` only — no frontend changes

---

## Context

Clara Code brands its AI models under human names. See `docs/auto-claude/PRODUCT_PRD.md` for the full model table. The underlying inference providers are not disclosed in the product — only the brand names are exposed to developers.

## Model Definitions (from PRD)

| Brand Name | Character | Available On |
|---|---|---|
| `maya` | Fast, directed | All tiers (free, pro, business) |
| `mary` | Deep reasoning | Pro + Business only |
| `nikki` | Versatile, multilingual | Pro + Business only |

Free tier users: requests specifying `mary` or `nikki` must be rejected with HTTP 403.

## Required Work

### 1. Model Registry

Create `backend/src/config/models.ts`:

```typescript
export type ClaraModelName = "mary" | "maya" | "nikki";

export interface ModelConfig {
  name: ClaraModelName;
  displayName: string;
  inferenceBackend: string;   // internal routing key — NOT exposed to developers
  thinking: boolean;
  requiredTier: "free" | "pro" | "business";
}

export const MODELS: Record<ClaraModelName, ModelConfig> = {
  maya: {
    name: "maya",
    displayName: "Maya",
    inferenceBackend: process.env.MAYA_BACKEND_URL ?? "",
    thinking: false,
    requiredTier: "free",
  },
  mary: {
    name: "mary",
    displayName: "Mary",
    inferenceBackend: process.env.MARY_BACKEND_URL ?? "",
    thinking: true,
    requiredTier: "pro",
  },
  nikki: {
    name: "nikki",
    displayName: "Nikki",
    inferenceBackend: process.env.NIKKI_BACKEND_URL ?? "",
    thinking: false,
    requiredTier: "pro",
  },
};

export const DEFAULT_MODEL: ClaraModelName = "maya";

export function resolveModel(
  requested: string | undefined,
  tier: "free" | "pro" | "business"
): ModelConfig {
  const modelName = (requested ?? DEFAULT_MODEL) as ClaraModelName;
  const model = MODELS[modelName];
  if (!model) return MODELS[DEFAULT_MODEL];

  // Tier enforcement
  const tierRank = { free: 0, pro: 1, business: 2 };
  if (tierRank[tier] < tierRank[model.requiredTier]) {
    throw new ModelTierError(modelName, model.requiredTier, tier);
  }
  return model;
}

export class ModelTierError extends Error {
  constructor(
    public readonly model: ClaraModelName,
    public readonly requiredTier: string,
    public readonly userTier: string
  ) {
    super(`Model "${model}" requires ${requiredTier} tier (current: ${userTier})`);
    this.name = "ModelTierError";
  }
}
```

### 2. Model Tier Enforcement in Routes

In all voice and agent routes that accept a `model` parameter:

1. Call `resolveModel(req.body.model, req.claraUser.tier)`
2. If `ModelTierError` is thrown, return:
```json
HTTP 403 Forbidden
{
  "error": "model_tier_required",
  "message": "Model \"mary\" requires a Pro subscription.",
  "model": "mary",
  "required_tier": "pro",
  "current_tier": "free",
  "upgrade_url": "https://claracode.ai/pricing"
}
```
3. Use `model.inferenceBackend` for the actual inference call — never pass the brand name to the inference layer

### 3. Environment Variables

Add to `backend/.env.example`:
```
# Model backend URLs — internal only, never exposed to developers
MAYA_BACKEND_URL=
MARY_BACKEND_URL=
NIKKI_BACKEND_URL=
```

These will be populated by cp-team (Modal infrastructure). For now, stub them with the existing Hermes URL: `MAYA_BACKEND_URL=${HERMES_URL}` as default so existing voice calls continue working.

### 4. Models List Endpoint

`GET /api/models`
- Public endpoint (no auth required)
- Returns models available to the caller based on their tier
- Unauthenticated or free tier: only `maya`
- Pro/Business: all three models
- Response:
```json
{
  "models": [
    { "name": "maya", "displayName": "Maya", "thinking": false },
    { "name": "mary", "displayName": "Mary", "thinking": true },
    { "name": "nikki", "displayName": "Nikki", "thinking": false }
  ],
  "default": "maya"
}
```
- Do NOT expose `inferenceBackend` in this response

## Tests Required

Add `backend/src/__tests__/models.test.ts`:
- `resolveModel("maya", "free")` → returns maya config
- `resolveModel("mary", "free")` → throws ModelTierError
- `resolveModel("nikki", "free")` → throws ModelTierError
- `resolveModel("mary", "pro")` → returns mary config
- `resolveModel("nikki", "business")` → returns nikki config
- `resolveModel(undefined, "free")` → returns default (maya)
- `resolveModel("invalid", "pro")` → returns default (maya), no throw
- `GET /api/models` with free auth → returns maya only
- `GET /api/models` with pro auth → returns all three
- Voice route with `model: "mary"` on free tier → HTTP 403 with correct error shape

All tests must pass. Backend coverage must remain ≥ 80%.

## Acceptance Criteria

- [ ] `maya` works for all tiers including free
- [ ] `mary` and `nikki` return HTTP 403 for free tier users
- [ ] `GET /api/models` returns tier-appropriate model list
- [ ] `inferenceBackend` is never exposed in any API response
- [ ] Existing voice calls with no `model` field continue working (default to maya)
- [ ] `npm test` passes — zero failures
- [ ] Coverage remains ≥ 80%

## Do NOT

- Do not expose inference backend URLs in any API response
- Do not hard-code model names as strings outside of `models.ts` — use the `ClaraModelName` type
- Do not block existing voice calls that omit the `model` field — default to maya silently
