# Voice Tiers

Pick how Clara sounds. Independent of thinking tier. Upgrade or downgrade anytime.

## Tiers

| Tier | Provider (INTERNAL ONLY) | Quality | Our Cost/mo | Use Case |
|------|--------------------------|---------|-------------|----------|
| **Standard Voice** | AWS Polly | Functional, clear | ~$1-2 | Developers, mostly-text users, internal tools |
| **Premium Voice** | ElevenLabs | Natural, conversational, human-quality | ~$10-15 | Customer-facing agents, phone calls, demos, sales |

## Included Minutes

| Tier | Included min/mo | Overage rate |
|------|----------------|--------------|
| Standard Voice | 500 min | $0.02/min |
| Premium Voice | 300 min | $0.05/min |

## Usage Notifications

- **At 90% usage:** Agent notifies user, offers upgrade or wallet top-up
- **At 100% usage:** Downgrade to Standard Voice until next billing cycle or wallet top-up

## Provider Secrecy (NON-NEGOTIABLE)

**Voice providers are TRADE SECRETS.** The customer NEVER sees "ElevenLabs" or "Polly" or "MiniMax."

| Customer Sees | Internal Provider |
|--------------|-------------------|
| "Standard Voice" | AWS Polly |
| "Premium Voice" | ElevenLabs |

Provider names appear ONLY in:
- Internal architecture docs
- Cost tracking (Jesse Blayton)
- This pricing directory

Provider names NEVER appear in:
- Customer-facing UI
- Marketing materials
- Pricing pages
- Reseller documentation

## Transport

All voice goes through **LiveKit** (open source, Apache 2.0):
- Development: Self-hosted on QCS1
- Production: LiveKit Cloud ($0.02/min)
- LiveKit plugs in ANY TTS provider — the transport is independent of the voice quality

## Internal Agent Voices (Our Own Use)

For our internal agents (Granville, Mary, etc.):
- **MiniMax** ($30/mo Standard plan) — voice cloning from 5-sec samples
- **v02 clones are approved** (mary02voiceclone, katherine02voice, etc.)
- All agent voices MUST sound Black American — NON-NEGOTIABLE
- Vault: `~/auset-brain/Agents/<Name>/characteristics.md` has approved voice IDs

## Key Principle

**A customer can have Fast Thinking (Haiku) + Premium Voice (ElevenLabs).** A barbershop owner booking appointments doesn't need deep reasoning — but their customers need to hear a natural voice on the phone. Voice and Thinking are independent purchases.
