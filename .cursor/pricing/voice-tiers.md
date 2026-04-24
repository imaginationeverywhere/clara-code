# Voice Tiers

Pick how Clara sounds. Independent of thinking tier and product tier. Upgrade or downgrade anytime.

## The Stack (INTERNAL)

Clara owns the entire voice stack. There is **NO** third-party voice provider. Everything runs on our infrastructure:

| Layer | Platform | Notes |
|-------|----------|-------|
| STT | Whisper on Modal A10G GPU | Self-hosted, open-source |
| TTS | XTTS on Modal A10G GPU | Self-hosted, open-source Coqui — clones unlimited voices from 5-sec samples |
| Transport | LiveKit (open source, Apache 2.0) | Self-hosted on QCS1 (dev) / LiveKit Cloud $0.02/min (prod) |
| Gateway | Hermes on Modal | Self-hosted orchestration |

**Why this matters:** No per-character TTS tax, no per-minute premium provider fee, unlimited voice cloning, full control over latency and quality. Voice COGS is GPU compute on Modal, not third-party rates.

## Customer-Facing Tiers

| Tier | Quality | Use Case |
|------|---------|----------|
| **Standard Voice** | Functional, clear, stock Clara voice | Developers, mostly-text users, internal tools |
| **Premium Voice** | Natural, conversational, custom voice cloning, faster response | Customer-facing agents, phone calls, demos, sales, brand voices |

### What "Premium" Actually Buys

Because we own the stack, "Premium Voice" is not a different vendor — it's a different routing path:

- **Higher-quality XTTS inference settings** (more denoising steps, larger model variant)
- **Priority GPU lane** (lower cold-start risk, faster response)
- **Custom voice cloning** (record a 5-second sample, get your own voice — unlimited clones)
- **Lower latency target** (sub-300ms response time vs sub-800ms on Standard)

## Included Minutes

| Tier | Included min/mo | Overage rate |
|------|----------------|--------------|
| Standard Voice | 500 min | $0.02/min |
| Premium Voice | 300 min | $0.05/min |

## Usage Notifications

- **At 90% usage:** Agent notifies user, offers upgrade or wallet top-up
- **At 100% usage:** Downgrade to Standard Voice until next billing cycle or wallet top-up

## Internal Naming Discipline (NON-NEGOTIABLE)

Even though we don't use any third-party voice provider, the internal stack names are still confidential:

| Customer Sees | Internal Reference |
|--------------|-------------------|
| "Standard Voice" | XTTS-v2 with default settings |
| "Premium Voice" | XTTS-v2 with priority routing + custom clones |
| "Voice cloning" | XTTS speaker embedding from 5-sec sample |

Names like Whisper, XTTS, Modal, Hermes appear ONLY in:
- Internal architecture docs
- Cost tracking (Jesse Blayton)
- This pricing directory

They NEVER appear in:
- Customer-facing UI
- Marketing materials
- Pricing pages
- Reseller documentation
- Agent responses (blocked by IP firewall — see `prompts/2026/April/23/1-not-started/13-agent-ip-firewall.md`)

## Internal Agent Voices

For Clara's own agents (Granville, Mary, Katherine, etc.):
- **All voices are XTTS clones** generated from 5-second samples
- v02 clones are approved (mary02voiceclone, katherine02voice, etc.)
- All agent voices MUST sound Black American — NON-NEGOTIABLE
- Vault: `~/auset-brain/Agents/<Name>/characteristics.md` has approved voice IDs
- Cost to us: GPU time only — no per-voice licensing

## Key Principle

**A customer can have Fast Thinking + Premium Voice.** A barbershop owner booking appointments doesn't need deep reasoning — but their customers need to hear a natural voice on the phone. Voice and Thinking are independent purchases.

## Related Files

- **`pricing/cogs-and-unit-economics.md`** — voice exchange COGS breakdown ($0.008/exchange)
- **`pricing/overage-rates.md`** — voice overage rate of $0.02/exchange
- **`pricing/customer-facing-page.md`** — how voice tiers display on the pricing page
