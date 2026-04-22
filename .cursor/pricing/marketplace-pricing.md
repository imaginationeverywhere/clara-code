# Marketplace Pricing

Standalone products and revenue streams outside of Clara subscriptions.

## Clara Crawl (Sesheta)

Web crawling API — beats Firecrawl on every metric.

| Tier | Price | Crawls/mo | Duration |
|------|-------|----------|----------|
| **Free Trial** | $0 (card required) | 1,000 | 3 days, auto-charges day 3 |
| **Builder** | $9/mo | 10,000 | Monthly |
| **Pro** | $29/mo | 50,000 | Monthly |
| **Unlimited** | $79/mo | Unlimited, no throttle | Monthly |

- No free-forever tier. Card required at signup.
- Day 3: Stripe auto-charges selected tier.
- Margins: Builder 67%, Pro 48%, Unlimited 62%.

## Clara Voice Tones Marketplace

Music clips that play during AI thinking time. Buy, don't stream.

| Item | Price | Split |
|------|-------|-------|
| Premium tones | $0.99-$2.99 each (artist sets price) | Artist 70% / Clara 30% |
| Tone packs | 5 for $3.99 (curated by genre/mood) | Same split |
| Brand tones | $99-$999 one-time (for businesses) | Clara 30% |
| Shared tones | $0.02-$0.10 per share (artist-set rate) | Artist royalty + Clara $0.03 clearing fee |
| Free tier | $0 (ad-supported) | Advertiser pays CPM |

**Rules:**
- NO streaming. Buy the tone, own the tone. NON-NEGOTIABLE.
- Blockchain-verified ownership. On-chain receipt for every purchase.
- Secondary market: buy → curate → resell. AI Record Store model.
- Clara = clearing house only. We don't own the music.
- We collect our fees ($0.03/share, 30% on primary). That's it.

## AI Generations (via Cloudflare Workers AI)

| Feature | User Price | Our Cost | Margin |
|---------|-----------|----------|--------|
| AI Chat | FREE (included in all tiers) | ~$0.0001/conv | 95-99% |
| Image Generation | $0.25/image | ~$0.02-0.05 | 80-92% |
| Logo Generation | $0.75/logo | ~$0.05-0.15 | 80-93% |
| Video Generation | $2.00/video | ~$0.10-0.50 | 75-95% |

Powered by Workers AI FLUX (images), Gemini Pro Image (logos), Remotion (video).
