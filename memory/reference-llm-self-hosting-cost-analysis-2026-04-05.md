---
type: reference
date: 2026-04-05
topic: LLM Self-Hosting Cost Analysis — AWS vs Cloudflare vs Bedrock
status: active
tags: [cost, infrastructure, llm, self-hosting, cloudflare, aws, bedrock, agent-harness]
---

# LLM Self-Hosting Cost Analysis for Agent Harness

**Goal:** Run independent conversational voice agents for $200/mo or less.
**Use case:** 2-3 sentence voice responses, meeting notes, client calls — NOT coding.

## The Models (All Free Open Weights)

| Model | Total Params | Active Params | Architecture | License | Min Hardware (Full) |
|-------|-------------|---------------|-------------|---------|-------------------|
| **GLM-5** | 744B | 40B | MoE (256 experts, 8 active) | Open | 8x H100 (640GB VRAM) |
| **Kimi K2.5** | 1T | 32B | MoE (384 experts, 8 active) | Modified MIT | 8x H100+ |
| **DeepSeek V3.2** | 685B | 37B | MoE (256 experts, 9 active) | Open | 8x H200 (1.2TB VRAM) |

**Key insight:** These MoE models only activate 32-40B params per token. Smart architectures — massive knowledge, reasonable inference cost.

---

## OPTION 1: Self-Host Full Models on AWS

**Verdict: NOT feasible at $200/mo. Not even close.**

| Instance | GPUs | VRAM | On-Demand/mo | Spot/mo | Can Run |
|----------|------|------|-------------|---------|---------|
| p5.48xlarge | 8x H100 80GB | 640GB | $71,770 | ~$21,500 | GLM-5 (FP8), DeepSeek V3.2 (tight) |
| p5e.48xlarge | 8x H200 141GB | 1,128GB | ~$85,000+ | ~$25,000+ | All three comfortably |
| p4d.24xlarge | 8x A100 40GB | 320GB | $23,900 | ~$7,200 | None (insufficient VRAM) |

**Bottom line:** Full models need $20K+/mo minimum. These are enterprise-scale deployments.

---

## OPTION 2: Self-Host DISTILLED Models on AWS

**Smaller versions of the same models — 7B, 14B, 32B params. Quality is good for conversation.**

### DeepSeek-R1-Distill-Qwen-32B (Best distilled option)
- 32B params, single GPU, 30-38 tok/sec
- Quality: Outperforms GPT-4 on many benchmarks
- Perfect for conversational voice agents

| AWS Instance | GPU | VRAM | On-Demand/mo | Spot/mo | Fits $200? |
|-------------|-----|------|-------------|---------|-----------|
| **g6.xlarge** | 1x L4 24GB | 24GB | $587 | ~$303 | NO |
| **g6e.xlarge** | 1x L40S 48GB | 48GB | ~$700 | ~$350 | NO |
| **g5.xlarge** | 1x A10G 24GB | 24GB | $908 | ~$356 | NO |
| **inf2.xlarge** | 1x Inferentia2 | 32GB | $547 | **$55-204** | MAYBE (spot) |

**Inferentia2 caveat:** Requires AWS Neuron SDK compilation. Limited model support — DeepSeek distilled models may not be optimized for it yet.

### Smaller Distilled Models (14B, 7B)

| Model | GPU Needed | Instance | Spot/mo |
|-------|-----------|----------|---------|
| DeepSeek-R1-Distill-14B | 8GB VRAM | g6.xlarge | ~$303 |
| DeepSeek-R1-Distill-7B | 5GB VRAM | g6.xlarge | ~$303 |

Even the smallest models can't get under $200/mo on AWS GPU spot.

**Bottom line:** Self-hosting distilled models on AWS starts at ~$303/mo (spot). Close to budget but not under it. And spot instances can be interrupted.

---

## OPTION 3: Cloudflare Workers AI (WINNER for $200 budget)

**No GPU to manage. No instance to run. Pay per token. Models hosted on Cloudflare's edge.**

| Model | Input Price | Output Price | Per Voice Turn* | Turns at $200/mo |
|-------|-----------|-------------|----------------|------------------|
| **Qwen3-30B-A3B-FP8** | $0.051/M tok | $0.34/M tok | **$0.000113** | **1,770,000** |
| DeepSeek-R1-Distill-32B | $0.497/M tok | $4.88/M tok | $0.00049 | 408,000 |
| Llama 3.1 70B | $0.293/M tok | $2.25/M tok | $0.00026 | 770,000 |
| Llama 3.2 3B | $0.027/M tok | $0.20/M tok | $0.000061 | 3,280,000 |

*Voice turn = ~1,700 input tokens (brain context + user speech) + ~75 output tokens (2-3 spoken sentences)

**Plus:** 10,000 free neurons/day = ~100-300 free voice turns daily before you pay anything.

### Qwen3-30B Deep Dive (Recommended Primary)

- **MoE architecture:** 30B total, only 3B active per token — blazing fast
- **Quality:** Function calling, reasoning, structured outputs
- **Context:** 32K tokens (plenty for brain + conversation)
- **Monthly cost for heavy use:**
  - 100 voice turns/day × 30 days = 3,000 turns = **$0.34/mo**
  - 1,000 voice turns/day × 30 days = 30,000 turns = **$3.39/mo**
  - Even at insane usage (10K turns/day): **$33.90/mo**
- **You will NEVER hit $200/mo on Cloudflare.** The budget is essentially unlimited for voice agents.

---

## OPTION 4: AWS Bedrock Managed API (Backup/Fallback)

**Per-token pricing, no GPU management. Good as a fallback if Cloudflare is down.**

| Model | Input Price | Output Price | Per Voice Turn* | Turns at $200/mo |
|-------|-----------|-------------|----------------|------------------|
| **DeepSeek V3.2** | $0.62/M tok | $1.85/M tok | $0.00119 | 168,000 |
| DeepSeek V3 | $0.58/M tok | $1.68/M tok | $0.00111 | 180,000 |
| Haiku 4.5 | $1.00/M tok | $5.00/M tok | $0.00208 | 96,000 |

*Same voice turn assumption: 1,700 input + 75 output tokens

---

## RECOMMENDATION: Cloudflare Primary + Bedrock Haiku Backup

```
Voice input → Voxtral Realtime STT (self-hosted, $0)
  → Cloudflare Qwen3-30B (primary — ~$3-5/mo for normal use)
    ├── If Cloudflare fails → Bedrock DeepSeek V3.2 (fallback 1 — $0.62/M in)
    └── If Bedrock fails → Bedrock Haiku 4.5 (fallback 2 — $1.00/M in)
  → Voxtral TTS (self-hosted, $0)
→ User hears agent response
```

### Why This Wins

| Factor | Self-Host Full (AWS) | Self-Host Distilled (AWS) | Cloudflare Workers AI | Bedrock Managed |
|--------|---------------------|--------------------------|----------------------|----------------|
| Monthly cost | $21,000+ | $303+ (spot) | **$3-34** | $50-200 |
| Fits $200 budget | NO | BARELY (spot, risky) | **YES (by 50-100x)** | YES |
| GPU management | You manage 8 GPUs | You manage 1 GPU | **None** | None |
| Uptime | You handle failover | Spot can be interrupted | **99.9% Cloudflare SLA** | 99.9% AWS SLA |
| Model quality | Best (full 685B-1T) | Good (32B distilled) | **Good (30B MoE)** | Great (685B / Haiku) |
| Latency | Lowest (your hardware) | Low (~30-38 tok/sec) | **Low (edge, <100ms)** | Low (Bedrock) |
| Scale | Fixed capacity | Fixed capacity | **Auto-scales infinitely** | Auto-scales |
| Self-hosted Voxtral | Same GPU can't run both | Same GPU can't run both | **Separate concern** | Separate |

### Cost Breakdown (Recommended Stack)

| Item | Monthly Cost | Notes |
|------|-------------|-------|
| Cloudflare Qwen3-30B (primary LLM) | ~$5 | 1,000 turns/day |
| Bedrock DeepSeek V3.2 (fallback) | ~$10 (reserve) | Only fires if CF is down |
| Bedrock Haiku 4.5 (emergency fallback) | ~$5 (reserve) | Last resort |
| Voxtral STT (self-hosted on QCS1) | $0 | Open weights, runs on M4 Pro |
| Voxtral TTS (self-hosted on QCS1) | $0 | Open weights, runs on M4 Pro |
| Paperclip server | ~$20 | Self-hosted |
| **Total** | **~$40/mo** | |
| **Budget remaining** | **$160/mo** | For future scaling |

**Compared to original $200 Bedrock Haiku cap: This is 80% cheaper and uses BETTER models.**

---

## OPTION 5: Hybrid — Cloudflare + One AWS GPU (Future Premium Tier)

If you eventually want to self-host a larger model for client-facing "premium" conversations:

| Setup | Monthly | What You Get |
|-------|---------|-------------|
| g6.xlarge spot (DeepSeek-R1-32B) + Cloudflare (Qwen3) | ~$343 | Premium: self-hosted 32B. Standard: Cloudflare Qwen3. |
| g6.xlarge reserved 3yr (DeepSeek-R1-32B) | ~$235/mo | Dedicated GPU, no interruption, 32B always-on |

This exceeds $200/mo but could be the "Enterprise" voice tier that clients pay $4,000+/mo for.

---

## Voice Turn Cost Comparison (Final)

**One voice conversation turn = agent hears user, thinks, responds in 2-3 sentences**

| Provider + Model | Cost Per Turn | Turns for $1 | Winner? |
|-----------------|-------------|-------------|---------|
| **Cloudflare Qwen3-30B** | **$0.000113** | **8,850** | **BEST** |
| Cloudflare Llama 3.1 70B | $0.000260 | 3,846 | |
| Bedrock DeepSeek V3.2 | $0.001190 | 840 | GOOD FALLBACK |
| Bedrock Haiku 4.5 | $0.002080 | 481 | EMERGENCY |
| Self-host 32B (spot amortized) | ~$0.001000 | ~1,000 | NOT WORTH IT |

---

## Self-Hosting Voxtral on QCS1 (Separate from LLM)

Both Voxtral models run independently from the LLM:
- **Voxtral STT (4B params):** Fits on M4 Pro with 24GB unified memory
- **Voxtral TTS (4B params):** Fits on M4 Pro with 24GB unified memory
- **Can run both simultaneously** — Apple Silicon handles this well
- **Cost: $0/mo** — open weights, your hardware

This eliminates the ~$45/mo Mistral API cost from the previous plan.
