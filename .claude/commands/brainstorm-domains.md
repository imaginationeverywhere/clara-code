# Brainstorm Domains

Generate creative domain name ideas, check availability, and manage Quik Nation's domain marketplace.

## Command Usage

```
/brainstorm-domains [options]
```

### Options
- `--generate` - Generate domain ideas from business description (default)
- `--check <domain>` - Check availability of specific domain
- `--bulk-check <file>` - Check availability of domains from file
- `--inventory` - Manage Quik Nation domain inventory
- `--value <domain>` - Estimate market value of a domain
- `--alternatives <domain>` - Find alternatives for taken domain
- `--expiring` - Find expiring domains to acquire

## Quick Start Examples

### Generate Domain Ideas
```
/brainstorm-domains --generate

> Describe your business: "Subscription coffee box for artisanal coffee lovers"
> Style preference: Brandable

Results:
  1. brewbox.io (available) - Est. $2,000-$5,000
  2. roasterclub.com (premium $1,200) - Est. $3,000-$8,000
  3. coffeecrafter.co (available) - Est. $800-$2,000
  4. beanjourney.com (available) - Est. $500-$1,500
  5. siphoncrate.com (available) - Est. $400-$1,200
```

### Check Specific Domain
```
/brainstorm-domains --check luxuryrides.com

Result:
  Domain: luxuryrides.com
  Status: TAKEN
  Registrar: GoDaddy
  Expires: 2026-03-15

  Alternatives:
  - luxuryrides.io (available) - $45/yr
  - luxuryrides.co (available) - $35/yr
  - getluxuryrides.com (available) - $12/yr
  - luxuryrideapp.com (available) - $12/yr
```

### Estimate Domain Value
```
/brainstorm-domains --value ai.com

Analysis:
  Domain: ai.com
  Category: PREMIUM (2-letter .com)

  Value Factors:
  - Length: 2 chars (10/10)
  - Keyword: "AI" - extremely high value
  - TLD: .com (highest trust)
  - Brandability: 10/10
  - Industry: Tech/AI (booming)

  Estimated Value: $5,000,000 - $15,000,000+
  Comparable Sales:
  - ml.com sold for $2.5M (2019)
  - data.com sold for $1.2M (2021)
```

## Naming Strategies

### 1. Brandable Names
AI-generated invented words that are memorable and unique.

**Patterns:**
- CVCV (Hulu, Miro, Domo)
- CVCCV (Slack, Trello)
- Compound words (Snapchat, Facebook)

**Best for:** Tech startups, consumer apps, SaaS products

### 2. Keyword-Rich
Domains that include relevant search keywords.

**Patterns:**
- `{action}{noun}.com` (BuyShoes, GetFlowers)
- `{adjective}{noun}.com` (FastDelivery, EasyLoans)
- `{location}{service}.com` (AtlantaPlumber, NYCLawyer)

**Best for:** Local businesses, SEO-focused sites, service businesses

### 3. Short & Punchy
Ultra-short domains (3-5 characters).

**Patterns:**
- Acronyms (CNN, IBM)
- Short words (Box, Zoom)
- Letter combinations (XYZ, ABC)

**Best for:** Premium branding, enterprise companies

### 4. Descriptive
Clear, self-explanatory domain names.

**Patterns:**
- `{what-you-do}.com` (Booking, Hotels)
- `{your-product}.io` (Analytics, Dashboard)

**Best for:** B2B services, enterprise products

## TLD Selection Guide

| TLD | Cost/yr | Best For | Trust Level |
|-----|---------|----------|-------------|
| .com | $12-15 | Universal | ★★★★★ |
| .io | $40-60 | Tech/SaaS | ★★★★☆ |
| .co | $30-40 | Startups | ★★★★☆ |
| .ai | $80-100 | AI Products | ★★★★☆ |
| .dev | $15-20 | Dev Tools | ★★★☆☆ |
| .app | $15-20 | Mobile Apps | ★★★☆☆ |
| .store | $15-20 | Ecommerce | ★★★☆☆ |

## Domain Valuation Factors

### High-Value Indicators
- **Length:** 3-6 characters dramatically increases value
- **Dictionary words:** Single real words are premium
- **Industry keywords:** AI, crypto, health, finance add value
- **.com TLD:** Worth 2-10x other TLDs
- **Brandability:** Easy to pronounce and remember
- **Search volume:** Keywords people actually search

### Value Multipliers
```
Base Value × Length Multiplier × TLD Multiplier × Keyword Multiplier

Length Multipliers:
  3 chars: 10x
  4 chars: 5x
  5 chars: 3x
  6 chars: 2x
  7-10 chars: 1x
  11+ chars: 0.5x

TLD Multipliers:
  .com: 1.0x
  .io: 0.7x
  .ai: 0.8x (for AI-related)
  .co: 0.5x
  Other: 0.3x
```

## Inventory Management

### Add Domain to Inventory
```
/brainstorm-domains --inventory add

> Domain: techstartup.io
> Purchase Price: $45
> Category: BRANDABLE
> Industry: Technology
> Suggested Uses: SaaS, startup accelerator, tech blog

Added to inventory with listing price: $2,500
```

### List Inventory
```
/brainstorm-domains --inventory list

Quik Nation Domain Inventory (47 domains)

PREMIUM (5):
  - datastack.com - Listed: $15,000 - Acquired: $500
  - cloudpay.io - Listed: $8,000 - Acquired: $200
  ...

BRANDABLE (20):
  - Synthly.io - Listed: $3,000 - Acquired: $45
  - Craftbase.co - Listed: $2,500 - Acquired: $35
  ...

Total Inventory Value: $142,500
Total Acquisition Cost: $3,200
Potential Profit: $139,300 (4,353% ROI)
```

### Find Expiring Domains
```
/brainstorm-domains --expiring

Domains Expiring in 30 Days (opportunity to acquire):

  1. aiplatform.io
     Expires: 2024-01-15
     Est. Value: $5,000-$10,000
     Backorder Cost: ~$70

  2. cloudservices.co
     Expires: 2024-01-22
     Est. Value: $2,000-$4,000
     Backorder Cost: ~$50
```

## Integration with Project Bootstrap

When running `/bootstrap-project`, domain selection is automatically offered:

```
Phase 1: Project Inception
  Step 3: Domain Selection

  Based on your PRD, here are suggested domains:

  For "DreamiHairCare - Salon Booking Platform":
    1. dreamihaircare.com (your brand - available!)
    2. atlsalonbook.com (keyword-rich)
    3. bookahair.io (brandable)
    4. salonpro.app (app-focused)

  Select domain or enter custom: _
```

## API Integration Requirements

To enable real-time availability checking, configure these API keys:

```env
# Domain Registrar APIs (choose one or more)
NAMECHEAP_API_KEY=xxx
NAMECHEAP_API_USER=xxx
GODADDY_API_KEY=xxx
GODADDY_API_SECRET=xxx
CLOUDFLARE_API_TOKEN=xxx

# WHOIS for expiration checking
WHOIS_API_KEY=xxx

# SEO metrics (optional)
MOZ_API_KEY=xxx
```

## Output Formats

### JSON Export
```
/brainstorm-domains --generate --output json > domains.json
```

### CSV Export
```
/brainstorm-domains --inventory list --output csv > inventory.csv
```

### Markdown Report
```
/brainstorm-domains --generate --output markdown > domain-report.md
```

## Related Commands

- **`/bootstrap-project`** - Integrates domain selection in project inception
- **`/implement-stripe-standard`** - Payment processing for domain purchases
- **`/implement-admin-dashboard`** - Domain inventory management UI

## Related Skills

- **domain-brainstormer** - Core skill for domain generation
- **stripe-connect-standard** - Payment processing for marketplace
- **admin-panel-standard** - Inventory management interface

## Quik Nation Domain Marketplace

This command supports Quik Nation's domain resale business:

1. **Acquisition:** Find undervalued domains to purchase
2. **Valuation:** Accurately price domains for resale
3. **Listing:** Add domains to marketplace inventory
4. **Sales:** Process domain purchases through Stripe
5. **Transfer:** Manage domain transfer to buyers

For full marketplace implementation, see:
- `.claude/skills/domain-brainstormer/SKILL.md`
- `docs/technical/domain-marketplace-architecture.md` (to be created)
