# Clara AI Consumer Tier Ladder — CANONICAL

> **AUTHORITATIVE SOURCE** for Clara AI Personal pricing. All other pricing references defer to this file.

**Locked by Mo, 2026-04-24.**

## The Six Tiers

Each Clara AI Personal tier gives the user **1 Personal AI Assistant** with a set number of **Talents** (skills attached) and **Gears** (tools the Assistant can invoke):

| Tier | Monthly Price | Hours Included | Overage Rate | Hrs/day | Talents (per Assistant) | Gears (per Assistant) |
|------|---------------|----------------|--------------|---------|--------------------------|----------------------------|
| **Clara AI Starter** | **$9** | 90 | $2.00/hr | 3 | **3** | **2** |
| **Clara AI Lite** | **$19** | 180 | $1.00/hr | 6 | **5** | **4** |
| **Clara AI Standard** | **$29** | 360 | $0.50/hr | 12 | **7** | **6** |
| **Clara AI Plus** | **$39** | 480 | $0.25/hr | 16 | **10** | **10** |
| **Clara AI Pro** | **$49** | 600 | $0.15/hr | 20 | **12** | **15** |
| **Clara AI Elite** | **$59** | 750 | Hard cap (no overage) | 25 | **15** | **20** |

### Terminology (Clara-Specific)

- **Talents** = skills attached to an agent (e.g., `scheduling`, `email-triage`, `research`, `barbershop-ops`)
- **Gears** = tools the agent can invoke via MCP (e.g., Stripe, QuickBooks, Calendar, Google Docs, Slack)
- Counts grow with tier so heavier users can configure a more capable Assistant

### What The Talent + Gear Counts Mean In Practice

**Starter ($9, 3 Talents, 2 Gears)** — Your Assistant can be a focused helper with 3 skill modules (e.g., `personal-assistant`, `scheduling`, `note-taking`) and 2 integrations (e.g., Google Calendar + Email).

**Standard ($29, 7 Talents, 6 Gears)** — Your Assistant is now a proper general-purpose helper with 7 skill modules and 6 integrations. Enough to run most personal + light-business workflows.

**Elite ($59, 15 Talents, 20 Gears)** — Your Assistant is a full knowledge worker, configurable to cover most professional needs. 15 skills + 20 integrations = near-universal capability.

Users browse the Talent Agency to attach Talents and enable Gears to their Personal Assistant.

**Note the 750 number at the top tier.** It is deliberately 750, NOT 720 (24×30). 720 reads as "we're capping at 24/7 exactly" — feels like a gotcha. 750 is more than any month physically contains. Reads as "we're not counting — enjoy." Same price, better psychology.

## Overage Behavior Per Tier

Overage kicks in when a user exceeds their tier's included hours. Each hour past the cap is billed at the tier's overage rate — real-time, shown in the user's dashboard, no surprise.

**Hard overage ceiling per tier** (anti-surprise-bill protection):

| Tier | Max Monthly Overage | Account action at max |
|------|---------------------|-----------------------|
| Starter $9 | $18 | Flag + require upgrade |
| Lite $19 | $38 | Flag + require upgrade |
| Standard $29 | $58 | Flag + require upgrade |
| Plus $39 | $78 | Flag + require upgrade |
| Pro $49 | $98 | Flag + require upgrade |
| Elite $59 | No overage possible — 750 is hard cap |

A user can never be billed more than **3× their base subscription** in a month. Past that, their account flags for review; no more usage until they acknowledge + upgrade.

## Our Cost Math

Canonical COGS (from `pricing/cogs-and-unit-economics.md` + `project_voxtral_and_voice_unit_costs` memory): **$0.036/hour** for continuous voice all-in (self-hosted Voxtral + Gemma 4 on Modal).

### Margin at Maximum Included Usage

| Tier | Price | Max Hours | COGS at Max | Margin at Max |
|------|-------|-----------|-------------|----------------|
| Starter $9 | $9 | 90 | $3.24 | 64% 🟢 |
| Lite $19 | $19 | 180 | $6.48 | 66% 🟢 |
| Standard $29 | $29 | 360 | $12.96 | 55% 🟢 |
| Plus $39 | $39 | 480 | $17.28 | 56% 🟢 |
| Pro $49 | $49 | 600 | $21.60 | 56% 🟢 |
| Elite $59 | $59 | 750 | $27.00 | 54% 🟢 |

**All tiers hold 54%+ gross margin even at maximum included usage.**

### Margin at Typical Usage (30-50% of cap)

Most users consume 30-50% of their tier's allowance. At 40% utilization:

| Tier | Typical Hours | COGS | Margin |
|------|---------------|------|--------|
| Starter $9 | 36 | $1.30 | **86%** |
| Lite $19 | 72 | $2.59 | **86%** |
| Standard $29 | 144 | $5.18 | **82%** |
| Plus $39 | 192 | $6.91 | **82%** |
| Pro $49 | 240 | $8.64 | **82%** |
| Elite $59 | 300 | $10.80 | **82%** |

**Blended margin across the user base ≈ 80-85%** — very healthy SaaS economics.

## Margin on Overage

Overage rates are all well above COGS, so every overage hour is additional margin:

| Tier | Overage Rate | COGS/hr | Overage Margin |
|------|--------------|---------|-----------------|
| Starter $9 | $2.00/hr | $0.036 | **98%** |
| Lite $19 | $1.00/hr | $0.036 | **96%** |
| Standard $29 | $0.50/hr | $0.036 | **93%** |
| Plus $39 | $0.25/hr | $0.036 | **86%** |
| Pro $49 | $0.15/hr | $0.036 | **76%** |

Heavy users who opt for overage are the most profitable users per incremental hour.

## Upgrade Breakeven Math

Each tier's breakeven (where upgrading the tier is CHEAPER than paying overage on the current tier):

| Current → Next | Upgrade cheaper past... |
|----------------|------------------------|
| Starter → Lite | 95 hrs |
| Lite → Standard | 190 hrs |
| Standard → Plus | 380 hrs |
| Plus → Pro | 520 hrs |
| Pro → Elite | 667 hrs |

UX: At those thresholds, the dashboard auto-suggests the upgrade with the saving amount.

## Competitive Comparison — The Marketing Headline

| Platform | Cost for 480 hrs of voice (16 hr/day) |
|----------|----------------------------------------|
| Vapi (~$0.05/min) | **$1,440/mo** |
| ElevenLabs (~$0.02/min equiv) | **$576/mo** |
| Retell (~$0.10/min) | **$2,880/mo** |
| **Clara AI Plus** | **$39/mo** |

**Clara is 15-74× cheaper than metered voice providers at heavy usage.** Because we self-host Voxtral on Modal ($17/mo flat) + Gemma 4 batched on Modal.

## Why This Ladder Works

1. **Doubling pattern**: Each tier roughly doubles hours for +$10. Easy to understand.
2. **Descending overage**: Higher tier = cheaper overage. Rewards heavy users for upgrading.
3. **750 psychology**: Top tier covers any realistic human usage without literally being 24/7.
4. **Hard overage caps**: Users can't surprise themselves with a $500 bill.
5. **All tiers hold 54%+ gross margin** at max included use; 80%+ at typical use.
6. **Overage rates are 75-98% margin**: Every power user makes us more money.

## What This Replaces

- Earlier proposals of Clara AI at single $29 price
- "Unlimited voice" as a blanket marketing promise (replaced with explicit hour-tier ladder)
- Clara AI Small Business as a separate SKU (still TBD — this file covers Personal only)

## Related Files

- `pricing/clara-ai-reseller-rates.md` — wholesale rates for white label + Clara branded resellers
- `pricing/cogs-and-unit-economics.md` — the underlying $0.036/hr canonical number
- `pricing/abuse-protection.md` — hard cap + review-trigger logic per tier
- `pricing/marketplace-pricing.md` — transactional economics when licensed agents run
- `memory/project_voxtral_and_voice_unit_costs.md` — canonical voice COGS anchors
