# Combined Pricing Examples

Real customer scenarios showing how Thinking + Voice + Product combine. Numbers reflect our actual self-hosted COGS and customer-facing prices.

## Example Customers

| Customer | Thinking | Voice | Product | Our COGS/mo | Customer Price |
|----------|----------|-------|---------|-------------|----------------|
| **Barbershop owner** | Fast | Premium Voice | Clara AI | ~$8-12 | $39/mo |
| **Freelance designer** | Balanced | Standard Voice | Clara Code Pro | ~$12-18 | $59/mo |
| **Developer (has CC sub)** | Deepest (their own) | Standard Voice | Clara Code Pro | ~$3-5 | $39-59/mo |
| **Real estate agent** | Fast | Premium Voice | Clara AI | ~$8-12 | $39/mo |
| **Small agency** | Balanced | Premium Voice | Clara Code Max | ~$25-35 | $99/mo |
| **Quik Nation Business** | Deep | Premium Voice | Clara Code Business | ~$80-120 | $299/mo |
| **Enterprise** | Deep | Premium Voice (custom clones) | Clara Code Enterprise | ~$800-1,500 | $4,000+/mo |

## Scenario Breakdowns

### Barbershop Owner — Fast Thinking + Premium Voice

Clara answers the phone, books appointments, sends confirmations. Doesn't need deep reasoning — just fast responses and a natural voice.

| Item | COGS to Us | Notes |
|------|-----------|-------|
| Thinking: Fast (DeepSeek small) | ~$3-5/mo | Bedrock token cost |
| Voice: Premium (XTTS priority routing on Modal) | ~$4-6/mo | GPU seconds + LiveKit minutes |
| Product: Clara AI base | Included | DB, API, fixed infra |
| **Total COGS** | **~$8-12/mo** | |
| **Customer pays** | **$39/mo (Basic)** | |
| **Gross margin** | **70-79%** | 🟢 |

### Developer — Deep Thinking + Standard Voice

Builds complex apps, needs deep reasoning, mostly types in the CLI. Voice is secondary.

| Item | COGS to Us | Notes |
|------|-----------|-------|
| Thinking: Deep (DeepSeek R1 with reasoning) | ~$10-14/mo | Higher token costs for thinking model |
| Voice: Standard (XTTS default settings on Modal) | ~$1-2/mo | Light voice usage |
| Product: Clara Code Pro | Included | |
| **Total COGS** | **~$12-18/mo** | |
| **Customer pays** | **$59/mo (Pro)** | |
| **Gross margin** | **70-80%** | 🟢 |

### Claude Code Plugin User — Deepest Thinking + Premium Voice

Already pays Anthropic for Claude Code. Clara adds vault + identity + voice. Our most profitable tier — they bring their own LLM.

| Item | COGS to Us | Notes |
|------|-----------|-------|
| Thinking: Deepest (their CC subscription) | $0 | They pay Anthropic directly |
| Voice: Premium (XTTS priority on Modal) | ~$4-6/mo | GPU seconds |
| Product: Clara Code Pro | Included | DB, API, fixed infra |
| Clara plugin overhead | ~$0.50-1/mo | Vault sync, memory, gateway |
| **Total COGS** | **~$5-8/mo** | |
| **Customer pays** | **$39-59/mo** | |
| **Gross margin** | **85-93%** | 🟢🟢 |

### Small Agency — Balanced Thinking + Premium Voice + Max Tier

Building client work at volume. 6 agents, voice-heavy demos to clients.

| Item | COGS to Us | Notes |
|------|-----------|-------|
| Thinking: Balanced (DeepSeek mid) | ~$10-14/mo | Mid-tier token costs |
| Voice: Premium (XTTS priority on Modal) | ~$8-12/mo | Higher voice volume |
| Product: Clara Code Max | Included | More agents = more parallel ops |
| Heavier code-gen volume | ~$5-8/mo | Real product builds |
| **Total COGS** | **~$25-35/mo** | |
| **Customer pays** | **$99/mo (Max)** | |
| **Gross margin** | **65-75%** | 🟢 |

### Small Business — Deep Thinking + Premium Voice + SMB Tier

Agency or product team that builds AND deploys runtime agents. The Small Business unlock.

| Item | COGS to Us | Notes |
|------|-----------|-------|
| Thinking: Deep (DeepSeek R1) | ~$25-40/mo | Heavier reasoning load |
| Voice: Premium (custom clones for client agents) | ~$15-25/mo | Multi-voice production |
| Product: Clara Code Business | Included | 24 agents + canBuildAgents |
| Code-gen + agent build volume | ~$30-45/mo | Active product team |
| Marketplace runtime (their published agents) | ~$10-15/mo | Net of 15% take rate |
| **Total COGS** | **~$80-120/mo** | |
| **Customer pays** | **$299/mo (SMB)** | |
| **Gross margin** | **60-73%** | 🟢 |

### Enterprise — Deep Thinking + Custom Voice Clones + Enterprise Tier

Full-company deployment. 360 agents, multiple teams, white-glove onboarding, custom voice cloning for brand.

| Item | COGS to Us | Notes |
|------|-----------|-------|
| Thinking: Deep + dedicated inference lane | ~$300-500/mo | Reserved Bedrock capacity |
| Voice: Premium + brand voice clones | ~$100-200/mo | Multi-clone, real-time priority |
| Product: Clara Code Enterprise | Included | Full team infra |
| Sustained code-gen + builds | ~$200-400/mo | Heavy workload |
| Dedicated account management | ~$200-400/mo | Internal labor allocation |
| **Total COGS** | **~$800-1,500/mo** | |
| **Customer pays** | **$4,000+/mo** | |
| **Gross margin** | **63-80%** | 🟢 |

## Founders & Internal

| Person | Thinking | Voice | Product | Price |
|--------|----------|-------|---------|-------|
| Amen Ra | Deep | Premium (custom clone) | Everything | Included |
| Quik | Deep | Premium (custom clone) | Everything | Included |
| Kashea | Balanced | Premium (custom clone) | Clara Code Business | Included |

## Related Files

- **`pricing/cogs-and-unit-economics.md`** — per-unit COGS sourcing for these tables
- **`pricing/overage-rates.md`** — per-unit overage if any of these customers exceed their cap
- **`pricing/customer-facing-page.md`** — what these tiers look like on the marketing site
