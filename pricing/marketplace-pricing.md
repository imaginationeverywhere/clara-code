# Marketplace Pricing

Standalone products and revenue streams outside of Clara subscriptions.

## Built-Agent Deployment Economics

Two deployment channels, two economic models. Which applies depends on **where the agent is distributed from**, not where it runs.

### Channel A — Self-Deploy (VP's own website or mobile app)

The VP's Clara Code subscription covers both BUILDING AND DEPLOYING to their own properties. No extra runtime fees. The trade-off: **mandatory Stripe Connect gate** on every transaction.

| Fee | Amount | Paid By | Goes To |
|-----|--------|---------|---------|
| Listed price | VP sets | Customer | VP (100%) |
| **Platform fee** | **7%** (auditor-adjustable per industry) | Customer (passed through) | Clara |
| Processing fee | 2.9% + $0.30 | Customer (passed through) | Stripe |

Example — customer books a $35 haircut on pookey-barbers.com:

```
Haircut                           $35.00
Platform fee (7%)                  $2.45   ← to Clara
Processing fee (2.9% + $0.30)      $1.32   ← to Stripe
─────────────────────────────────────────
Customer pays                     $38.77

Pookey receives: $35.00 (100% of listed price)
Clara receives:   $2.45
Stripe receives:  $1.32
```

**If the agent does NOT process transactions** (internal scheduler, lead-gen bot, back-office helper) — no Stripe Connect trigger, no platform fee. The VP's subscription alone pays for everything.

**Enforcement**: Clara SDK checks for a valid Stripe Connect account ID at agent init. Agents configured to process payments without the gate are rejected at deployment.

### Channel B — Clara Agents Distribution (Clara AI mobile app + other mobile SDK embeds)

When the VP lists the agent on the Clara AI mobile app (claraagents.com) OR allows it to be embedded in another app via the Clara SDK — Clara provides full distribution, discovery, and user acquisition. The split is higher.

| Transaction | Split |
|-------------|-------|
| Agent hired (subscription, one-time, or per-invocation) | **Creator 85% / Clara 15%** |

Stripe Connect handles payouts. Creator sets the price; Clara collects from the hirer and pays 85% to the creator.

### Summary Table

| Channel | Who Pays Clara | How Much |
|---------|----------------|----------|
| VP's own site/app (transactional) | VP's customer (passed through) | 7% per transaction |
| VP's own site/app (no transactions) | Nobody extra (just subscription) | $0 |
| Clara AI mobile app (distributed by Clara) | End-user hiring the agent | 15% of revenue |
| Other mobile apps via Clara SDK (embedded) | End-user hiring the agent | 15% of revenue |
| Agent ejected to VP's own infrastructure | Nobody | 0% |

### The 7% Is Auditor-Adjustable

Clara's auditors observe fraud rate, chargeback rate, compute cost, and industry risk to adjust the 7% up or down per industry or per merchant class. Starting rate is 7%; final rate is set by audit and published in each VP's merchant agreement.

### Per-invocation floor pricing on Channel B — DEFERRED to Phase 4

Minimum per-invocation pricing for the 15% distribution channel will be set AFTER Phase 2 deployment across the Heru portfolio produces real usage data. Until then, VPs set their own prices; Clara collects 15% of whatever they charge.

## Clara Crawl (Sesheta)

Web crawling API — beats Firecrawl on every metric.

| Tier | Price | Crawls/mo | Duration |
|------|-------|----------|----------|
| **Builder** | $9/mo | 10,000 | Monthly |
| **Pro** | $29/mo | 50,000 | Monthly |
| **Scale** | $79/mo | 500,000+ crawls, no throttle | Monthly |

- No free tier. Card required at signup.
- Margins: Builder 67%, Pro 48%, Scale 62%.

## Clara Voice Tones Marketplace

Music clips that play during AI thinking time. Buy, don't stream.

| Item | Price | Split |
|------|-------|-------|
| Premium tones | $0.99-$2.99 each (artist sets price) | Artist 85% / Clara 15% |
| Tone packs | 5 for $3.99 (curated by genre/mood) | Same split |
| Brand tones | $99-$999 one-time (for businesses) | Clara 15% |
| Shared tones | $0.02-$0.10 per share (artist-set rate) | Artist royalty + Clara $0.03 clearing fee |

**Rules:**
- NO streaming. Buy the tone, own the tone. NON-NEGOTIABLE.
- Blockchain-verified ownership. On-chain receipt for every purchase.
- Secondary market: buy → curate → resell. AI Record Store model.
- Clara = clearing house only. We don't own the music.
- We collect our fees ($0.03/share, 15% on primary). That's it.

## AI Generations (via Cloudflare Workers AI)

| Feature | User Price | Our Cost | Margin |
|---------|-----------|----------|--------|
| AI Chat | Included in all paid subscriptions | ~$0.0001/conv | 95-99% |
| Image Generation | $0.25/image | ~$0.02-0.05 | 80-92% |
| Logo Generation | $0.75/logo | ~$0.05-0.15 | 80-93% |
| Video Generation | $2.00/video | ~$0.10-0.50 | 75-95% |

Powered by Workers AI FLUX (images), Gemini Pro Image (logos), Remotion (video).
