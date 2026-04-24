# Marketplace Pricing

Standalone products and revenue streams outside of Clara subscriptions.

## Built-Agent Marketplace (claraagents.com)

When a Vibe Professional builds an agent on Clara and lists it for hire:

| Transaction Type | Who Gets What |
|------------------|---------------|
| Customer hires agent (invocation) | Creator 85% / Clara 15% |
| One-time agent sale | Creator 85% / Clara 15% |
| Subscription to agent (recurring) | Creator 85% / Clara 15% |

### When the 15% fee applies

The fee is tied to **where the agent runs**, NOT where the customer came from:

- ✅ Agent hosted on Clara infrastructure → 15% applies to every invocation
- ✅ Customer found agent on claraagents.com → 15% applies (agent runs on Clara)
- ✅ Customer found agent on creator's own website → 15% applies (agent still runs on Clara)
- ✅ Customer found agent through affiliate funnel → 15% applies (agent still runs on Clara)
- ❌ Agent ejected to creator's own infra → Clara gets 0%, no tracking

**Stripe Connect** handles payouts regardless of discovery channel. Creator keeps 85% wherever the transaction happens, as long as the agent runs on Clara.

### Per-invocation floor pricing — DEFERRED to Phase 4

Minimum per-invocation pricing to guarantee Clara margin covers COGS will be set AFTER Phase 2 deployment across the Heru portfolio produces real usage data. Until then, built-agent pricing is set by the creator at their own risk; Clara collects 15% of whatever they charge.

## Clara Crawl (Sesheta)

Web crawling API — beats Firecrawl on every metric.

| Tier | Price | Crawls/mo | Duration |
|------|-------|----------|----------|
| **Builder** | $9/mo | 10,000 | Monthly |
| **Pro** | $29/mo | 50,000 | Monthly |
| **Unlimited** | $79/mo | Unlimited, no throttle | Monthly |

- No free tier. Card required at signup.
- Margins: Builder 67%, Pro 48%, Unlimited 62%.

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
