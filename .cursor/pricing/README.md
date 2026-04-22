# Clara Platform — Pricing Baseline

> **AUTHORITATIVE SOURCE** — All other pricing references in memory, plans, commands, or agent files defer to this directory.

This directory contains the complete pricing architecture for the Clara Platform. It is the single source of truth for all pricing decisions.

## Core Principle

Clara pricing is built on **THREE INDEPENDENT AXES**. They are NOT bundled.

| Axis | What It Is | What It Controls |
|------|-----------|-----------------|
| **Thinking** | The LLM model | How deep Clara reasons |
| **Voice** | The TTS provider | How Clara sounds when she speaks |
| **Product** | Clara AI / Clara Code / Business / Enterprise | What Clara can DO for you |

**Clara IS the brain** — the vault, identity, memory, context, relationships. The model is just how hard she thinks. The voice is just how she sounds. These are independent knobs a customer turns separately.

## Directory Structure

```
pricing/
├── README.md                    # This file — overview and principles
├── thinking-tiers.md            # LLM model tiers, interactions, overage, upsell
├── voice-tiers.md               # TTS tiers, minutes, overage, provider details
├── product-tiers.md             # Clara AI → Code → Business → Enterprise
├── reseller-pricing.md          # Branded vs White Label, wholesale, volume
├── transaction-fees.md          # Heru commerce fees, Stripe, tech fee, platform fee
├── communication-costs.md       # SES, SNS, FCM, Twilio voice-only
├── marketplace-pricing.md       # Clara Crawl, Voice Tones, generations
├── wallet-and-upsell.md         # Per-request upgrades, wallet model
├── vault-and-blockchain.md      # User vault architecture and tiers
├── combined-examples.md         # Real customer scenarios with total pricing
└── internal-and-founders.md     # Founder access, internal team, cost tracking
```

## Key Rules

1. **Voice and Thinking are SEPARATE.** A customer can have Haiku + Premium Voice. Never bundle them.
2. **Nothing is free.** All costs passed to customers. We got bills to pay.
3. **Voice providers are trade secrets.** Customer sees "Standard" and "Premium." Never "ElevenLabs" or "Polly."
4. **Resellers always undercut our direct price.** We set the ceiling. They offer the deal.
5. **Clara = the brain.** Models = thinking. These are different things.
6. **Site owners keep 100%** of their listed price. All fees to the customer.

## Last Updated

**April 4, 2026** | Approved by Amen Ra (CTO) | Authored by Mary (Product Owner)

## How to Use

- When building pricing UI → reference `product-tiers.md` + `thinking-tiers.md` + `voice-tiers.md`
- When setting up Stripe → reference `transaction-fees.md` + `wallet-and-upsell.md`
- When onboarding a reseller → reference `reseller-pricing.md`
- When quoting a client → reference `combined-examples.md`
- When running `/clean pricing` → audit against this directory
