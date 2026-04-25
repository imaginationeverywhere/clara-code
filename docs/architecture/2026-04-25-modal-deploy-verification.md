# Modal Deploy Verification — 2026-04-25

> **Roy (Roy Clay Sr.):** "Jerry tagged me to confirm the Modal containers are built against Gemma 4 27B as canonical. They are not. Reporting actual deployed state with file:line evidence and a punch list."

## TL;DR — DRIFT (severe)

Two Modal apps are live. Neither serves Gemma 4 27B. Both route LLM inference to **AWS Bedrock `deepseek.v3.2`**. There is no Gemma container, no Kimi container, no Modal-hosted LLM at all today. Voxtral (Whisper + XTTS) IS deployed and healthy. The Modal deploys themselves are correct for voice — the drift is that the LLM never made it onto Modal.

## Repo + path of Modal deploy scripts

The Modal deploys do NOT live in `clara-platform/` (no such repo on this machine — the closest is `clara-platform-runtime`, which is a prompts-only L2 wrapper). The actual deploys live in two sibling repos:

| App (live on Modal) | Repo | Script |
|---|---|---|
| `hermes-clara-gateway` | `imaginationeverywhere/hermes-agent` (branch: `main`) | `/Volumes/X10-Pro/Native-Projects/AI/hermes-agent/modal_gateway.py` |
| `clara-voice-server` | `imaginationeverywhere/clara-voice` (branch: develop) | `/Volumes/X10-Pro/Native-Projects/AI/clara-voice/server/voice_server.py` |

`modal app list` confirms these are the only two `deployed` apps (App IDs `ap-w2aMNErvXy1V1GvY34wudo` and `ap-5QmJI91jXfyIbRo6hK9ZPa`, deployed 2026-04-09 and 2026-04-17 respectively).

## Exact model identifier currently deployed

| Container | LLM | STT | TTS | Source |
|---|---|---|---|---|
| `hermes-clara-gateway` | `bedrock/deepseek.v3.2` (LiteLLM → AWS Bedrock) | n/a | calls Voxtral via HTTP | `modal_gateway.py:82, 198, 210, 231` |
| `clara-voice-server` | `deepseek.v3.2` on AWS Bedrock (boto3 invoke) | `openai/whisper-large-v3` (HuggingFace) | `coqui/XTTS-v2` (HuggingFace) | `voice_server.py:154, 181, 633, 661, 731, 747` |

Live confirmation:
- `GET https://info-24346--hermes-health.modal.run` → `{"llm":"bedrock/deepseek.v3.2","voice":"voxtral-modal"}`
- `GET https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run/voice/health` → `{"gpu":"NVIDIA A10","tts_engine":"xtts_v2","stt_engine":"whisper-large-v3"}`

There is **no Gemma model anywhere** in either deployed image. `pip_install` lines (`modal_gateway.py:20-33`, `voice_server.py:54-75`) install LiteLLM/boto3/transformers/TTS but no `vllm`, no model weights, no Gemma snapshot.

## GPU type per container + scale-to-zero

| Container | GPU | Scaledown | Concurrency | Source |
|---|---|---|---|---|
| `hermes-clara-gateway` | none (CPU container, no GPU annotation) | default | `max_inputs=10` | `modal_gateway.py:136-145` |
| `clara-voice-server` | `A10G` (NOT A100 / NOT H100) | `scaledown_window=120` | `max_inputs=4` | `voice_server.py:122-133` |

Canonical called for `A100 80GB` for Gemma and `H100 80GB` for Kimi. Neither is provisioned.

## Drift findings (vs canonical)

1. **No Gemma 4 27B container exists.** Canonical: 80% of traffic to Gemma on A100. Reality: 0% — every LLM call hits Bedrock DeepSeek V3.2. (`modal_gateway.py:82`, `voice_server.py:633`)
2. **No Kimi K2 container exists.** Canonical: 10-15% reasoning to Kimi on H100. Reality: 0%. No app, no image, no weights.
3. **DeepSeek is the universal default**, not the >20k-token reasoning fallback. The TS router at `backend/src/services/model-router.service.ts` (per Jerry's note) selects Gemma — but the gateway it calls just hardcodes `deepseek.v3.2` and ignores any model hint. (`modal_gateway.py:81-91` — `_call_bedrock_deepseek` takes no model parameter; the router-selected model name is dropped on the floor.)
4. **Voice server LLM also hardcodes DeepSeek** at `voice_server.py:633` (`modelId="deepseek.v3.2"`). Voice was supposed to land on Gemma 4 for latency. It lands on Bedrock instead — a US-east-1 round-trip from a Modal A10G container, every voice turn.
5. **GPU class wrong for the canonical plan.** A10G is correct for Voxtral STT+TTS only; once Gemma 4 27B is added, that container needs A100 80GB (Gemma 27B in fp16 is ~54GB, won't fit on A10G's 24GB). Kimi K2 needs H100 80GB.
6. **Voxtral is healthy and on-spec.** Whisper-large-v3 + XTTS v2 on A10G, scale-to-zero 120s, 26 voices loaded. This part matches `project_voxtral_and_voice_unit_costs.md`.

## Cost implication of the drift

Mo's $17/mo Voxtral target stands — that's voice infra only. But the canonical "Gemma primary" gives Mo the 37× cost moat over DeepSeek. Today every conversation pays full Bedrock token rates. At scale, this is the difference between $0.003/hr and ~$0.10/hr per active user. The TS router pretending to choose Gemma while the Python gateway forces DeepSeek makes the cost narrative in `pricing/cogs-and-unit-economics.md` aspirational, not actual.

## Action items — what needs to be re-deployed and where

| # | Action | Owner | Repo |
|---|---|---|---|
| 1 | Add a new Modal app `hermes-gemma-27b` with vLLM + `google/gemma-2-27b-it` (or whichever HF ID is canonical for "Gemma 4 27B" — see Q below) on `gpu="A100-80GB"`, scale-to-zero 300s | Roy + Jerry | `hermes-agent` (new file `modal_gemma.py`) |
| 2 | Add `hermes-kimi-k2` Modal app on `gpu="H100"` with the canonical Kimi K2 weights | Roy + Jerry | `hermes-agent` (new file `modal_kimi.py`) |
| 3 | Refactor `modal_gateway.py:_call_bedrock_deepseek` → `_call_llm(model: str, ...)` that dispatches to the correct Modal container endpoint OR Bedrock based on the routing decision passed in by the TS router | Skip | `hermes-agent/modal_gateway.py:75-91` |
| 4 | Same refactor in `voice_server.py:_respond` — accept a `model` field and dispatch to Gemma Modal endpoint by default | Skip | `clara-voice/server/voice_server.py:460-662` |
| 5 | Pin Gemma container's HuggingFace model ID in a single SSM param (`/quik-nation/clara/HERMES_GEMMA_MODEL_ID`) so swaps don't require a redeploy of caller code | Roy | SSM (us-east-1) |
| 6 | Re-deploy both apps; smoke test via `/voice/health` + `/hermes-health` reporting the new models | Roy | `modal deploy modal_gateway.py && modal deploy server/voice_server.py` |

## Open question — "Gemma 4" model ID

There is no `google/gemma-4-27b` on HuggingFace today. The canonical doc says "Gemma 4 27B" but the available 27B Gemma is `google/gemma-2-27b-it`. Jerry's stale-mirror note already showed `.cursor/pricing/` was using "Gemma 3 27B." Mo needs to confirm the exact intended HF repo ID before I deploy. Likely candidates:
- `google/gemma-2-27b-it` (real, available)
- `google/gemma-3-27b-it` (real, multimodal)
- `google/gemma-4-...` (does not exist on HF as of 2026-04-25)

I'm not going to deploy speculatively. **Need Mo to confirm the HF model ID.**

## What I needed and got

- Modal CLI: authenticated locally (`modal app list` works). Confirmed.
- `hermes-agent` repo: present at `/Volumes/X10-Pro/Native-Projects/AI/hermes-agent` on `main`, contains `modal_gateway.py`. Confirmed.
- `clara-voice` repo: present at `/Volumes/X10-Pro/Native-Projects/AI/clara-voice` on develop, contains `server/voice_server.py` + `modal.toml`. Confirmed.
- Live HTTP probes against both Modal endpoints. Confirmed.

## What I did NOT do

- Did not modify any Modal config or push any deploy.
- Did not authenticate or rotate any token.
- Did not commit to a specific Gemma HF ID without Mo's confirmation.

— Roy
