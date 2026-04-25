# /setup-bedrock — AWS Bedrock + DeepSeek default for Ra Intelligence (non-Clara Herus)

> **Scope note (read first).** This command provisions Bedrock access for non-Clara Herus that use Bedrock for Ra Intelligence (FMO, TrackIt, WCR, KLS, PGCMC, ST, S962, QCarry, QN, QCR). Clara Platform's default routing is Gemma 4 27B on Modal; Clara only uses Bedrock for the heavy-reasoning fallback (~3-5% of traffic) and the premium Claude/GPT path (<1%). If you are wiring up Clara Code itself, do not use this command as a template for the platform-wide primary; see `pricing/model-routing-strategy.md` for the canonical Hermes routing decision tree.

**Automation:** run **`scripts/setup-bedrock.sh`** from the repo root (`--dry-run` prints intended AWS CLI usage without changing AWS resources). This file is the **operator runbook**; the script covers model discovery and `.env.example` hints — it does **not** write SSM secrets without you running `aws ssm put-parameter` yourself.

Configure **Amazon Bedrock** for the current Heru so **Ra Intelligence** routes LLM calls through Bedrock with **DeepSeek-R1** (or your chosen model) as the primary default, plus a documented fallback chain (Claude → Llama, etc.). Credentials stay in **SSM** or the instance **IAM role** — never in git.

**Canonical reference:** `docs/standards/AI-MODEL-ROUTING.md` · backend: `backend/src/config/bedrock.ts`, `backend/src/features/ai/bedrock/`.

### Script (quick start)

```bash
./scripts/setup-bedrock.sh --dry-run
./scripts/setup-bedrock.sh --region us-east-1 --model deepseek
```

---

## Usage

```
/setup-bedrock                          # Configure Bedrock, DeepSeek default
/setup-bedrock --model deepseek-r1     # Pin DeepSeek variant (must exist in account/region)
/setup-bedrock --model claude-sonnet-4  # Override primary to Claude on Bedrock
/setup-bedrock --model llama-3-3-70b   # Override primary to Llama on Bedrock
/setup-bedrock --fallback "deepseek.r1-v1:0,us.anthropic.claude-3-5-sonnet-20241022-v2:0,meta.llama3-3-70b-instruct-v1:0"
/setup-bedrock --dry-run               # Print aws bedrock list-foundation-models + planned env keys only
```

---

## Preconditions

- AWS CLI: `aws sts get-caller-identity` succeeds.
- Region: default **us-east-1** (many foundation models); override with `BEDROCK_REGION` if needed.
- **Model access:** In AWS Console → Bedrock → Model access, enable the models you need (some require one-click access).

---

## Steps

### 1 — Verify foundation models

```bash
aws bedrock list-foundation-models --region us-east-1 \
  --query 'modelSummaries[?contains(modelId, `deepseek`)].{id:modelId,name:modelName}' \
  --output table
```

Note the exact **model ID** for DeepSeek (e.g. `deepseek.r1-v1:0`). IDs differ by region and release.

### 2 — IAM

Prefer **IAM role** on App Runner/EC2/Lambda with `bedrock:InvokeModel` / `bedrock:InvokeModelWithResponseStream` on `arn:aws:bedrock:*::foundation-model/*` (scope per org policy).

Avoid long-lived access keys; if you must use keys for a dev laptop, store them only in **SSM** (see below), not `.env` committed files.

### 3 — SSM parameters (optional keys; prefer IAM)

Per Heru (replace `<heru>`):

```
/quik-nation/<heru>/bedrock/region
/quik-nation/<heru>/bedrock/primary-model
/quik-nation/<heru>/bedrock/fallback-models
```

If you use static keys (not recommended vs IAM): `access-key-id` / `secret-access-key` as **SecureString**, and inject at deploy time — **never** commit.

### 4 — Application env (non-secret model IDs)

Set in **runtime** (ECS/App Runner env, or load from SSM Parameter Store at boot):

| Variable | Example | Purpose |
|----------|---------|---------|
| `BEDROCK_PRIMARY_MODEL` | `deepseek.r1-v1:0` | Enables Bedrock path in `RaIntelligence` when set |
| `BEDROCK_REGION` | `us-east-1` | Bedrock client region |
| `BEDROCK_FALLBACK_MODELS` | comma-separated IDs | Tried in order after primary errors |
| `BEDROCK_STANDARD_MODEL` | optional | Preferred for standard/bulk before generic fallbacks |
| `BEDROCK_CRITICAL_MODEL` | optional | Preferred for critical tier (e.g. Opus-class on Bedrock) |

Copy keys into `backend/.env.example` (placeholders only).

### 5 — Validate

- `pnpm --filter backend run type-check`
- With `BEDROCK_PRIMARY_MODEL` set in a dev shell, run a smoke path that calls `RaIntelligence.invoke()` (or integration test when available).

### 6 — First-run “access pending”

If Bedrock returns `AccessDeniedException` or model-not-enabled, document for the operator: open **Bedrock model access** in console, request access, retry after approval.

---

## Related

- `/pickup-prompt --bedrock` / `/queue-prompt --bedrock` — prepend setup template for queued work.
- `docs/technical/AI_INTEGRATION.md` — Cloudflare AI Gateway remains supplementary; Bedrock is primary for backend Ra routing when configured (non-Clara Herus only — Clara Platform routes Gemma 4 first).
- Cost: align with pass-through + hard caps per platform billing decisions.
