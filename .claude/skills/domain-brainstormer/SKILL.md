---
name: domain-brainstormer
description: Generate creative domain name ideas, check availability across TLDs, analyze SEO value, and support domain sales for Quik Nation's domain marketplace. Use when brainstorming domains for new projects, helping clients find perfect domains, or managing domain inventory for resale.
---

# Domain Name Brainstormer

## Overview

Production-ready domain name generation and analysis tool for:
- **Creative brainstorming** - AI-powered domain name generation based on business context
- **Availability checking** - Real-time TLD availability verification
- **SEO analysis** - Keyword relevance and search value assessment
- **Pricing guidance** - Market value estimation for domain sales
- **Inventory management** - Track domains for Quik Nation marketplace

## Architecture Pattern

```
┌────────────────────────────────────────────────────────────────────┐
│                    DOMAIN BRAINSTORMER SYSTEM                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Name         │  │ Availability │  │ Value        │              │
│  │ Generator    │  │ Checker      │  │ Analyzer     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└────────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ Client        │   │ Quik Nation   │   │ Project       │
│ Suggestions   │   │ Inventory     │   │ Bootstrap     │
└───────────────┘   └───────────────┘   └───────────────┘
```

## Use Cases

### 1. New Project Bootstrap
When spinning up new client projects, generate domain options:
```
Input: "Hair salon booking platform for Atlanta"
Output:
  - atlantahairbook.com (available)
  - atlsalonpro.com (available)
  - bookmyhair.io (available)
  - atlantabeautybook.com (premium - $2,500)
```

### 2. Client Domain Consultation
Help clients find the perfect domain for their business:
```
Input: "Luxury car rental service targeting millennials"
Output:
  - luxerides.com (taken - suggest luxerides.io)
  - premiumwheels.co (available)
  - driveboujee.com (available - brandable)
  - eliterentals.ai (available - emerging TLD)
```

### 3. Domain Inventory for Resale
Generate valuable domains for Quik Nation's marketplace:
```
Input: "Generate 10 valuable domains in the AI/tech space"
Output:
  - promptcraft.ai (estimated value: $5,000-$15,000)
  - mlstartup.io (estimated value: $2,000-$8,000)
  - neuraldash.com (estimated value: $3,000-$10,000)
```

## Domain Generation Strategies

### Strategy 1: Keyword Combination
```typescript
interface KeywordStrategy {
  primary: string[];      // Core business keywords
  modifiers: string[];    // Action words (get, my, pro, hub)
  industry: string[];     // Industry-specific terms
  location?: string[];    // Geographic modifiers
}

// Example for ecommerce
const ecommerceKeywords: KeywordStrategy = {
  primary: ['shop', 'store', 'market', 'cart', 'buy'],
  modifiers: ['my', 'the', 'go', 'get', 'easy', 'quick'],
  industry: ['fashion', 'tech', 'home', 'beauty', 'food'],
  location: ['usa', 'nyc', 'la', 'atl'],
};

// Generates: myshop.com, gofashion.io, quickcart.co, etc.
```

### Strategy 2: Brandable Names
```typescript
interface BrandableStrategy {
  style: 'invented' | 'compound' | 'misspelling' | 'acronym';
  syllables: 2 | 3;
  endings: string[];  // Common brandable endings
}

// Invented words (like Spotify, Hulu)
const inventedStyle = {
  patterns: ['CVCV', 'CVCCV', 'VCVCV'],  // Consonant-Vowel patterns
  endings: ['ify', 'ly', 'io', 'oo', 'er', 'le'],
};

// Generates: Shopify-style names like Cartly, Vendoo, Buyler
```

### Strategy 3: Industry-Specific
```typescript
const industryTemplates = {
  saas: ['{keyword}hub.io', '{keyword}stack.com', 'get{keyword}.io'],
  ecommerce: ['{keyword}shop.com', 'buy{keyword}.com', '{keyword}store.co'],
  fintech: ['{keyword}pay.com', '{keyword}wallet.io', 'pay{keyword}.com'],
  healthtech: ['{keyword}health.com', 'my{keyword}doc.com', '{keyword}care.io'],
  edtech: ['learn{keyword}.com', '{keyword}academy.io', '{keyword}class.com'],
};
```

## TLD Strategy & Recommendations

### TLD Selection Matrix

| TLD | Best For | Trust Level | Price Range | SEO Impact |
|-----|----------|-------------|-------------|------------|
| .com | Universal, any business | Highest | $10-15/yr | Highest |
| .io | Tech startups, SaaS | High | $30-50/yr | Good |
| .co | Startups, modern brands | Medium-High | $25-35/yr | Good |
| .ai | AI/ML products | High (in niche) | $80-100/yr | Good for AI |
| .dev | Developer tools | High (in niche) | $15-20/yr | Good for dev |
| .app | Mobile apps | Medium-High | $15-20/yr | Good for apps |
| .store | Ecommerce | Medium | $15-20/yr | Medium |
| .shop | Ecommerce | Medium | $30-40/yr | Medium |

### TLD Recommendation Logic

```typescript
function recommendTLD(businessType: string, budget: string): string[] {
  const recommendations: Record<string, string[]> = {
    'ecommerce': ['.com', '.store', '.shop', '.co'],
    'saas': ['.com', '.io', '.app', '.co'],
    'ai-product': ['.ai', '.com', '.io'],
    'developer-tool': ['.dev', '.io', '.com'],
    'local-service': ['.com', '.co', '.local-tld'],
    'startup': ['.io', '.co', '.com'],
    'enterprise': ['.com', '.io'],
  };

  return recommendations[businessType] || ['.com', '.io', '.co'];
}
```

## Domain Value Assessment

### Value Factors

```typescript
interface DomainValue {
  domain: string;
  factors: {
    length: number;           // Shorter = more valuable
    keywords: string[];       // High-value keywords present
    brandability: number;     // 1-10 score
    pronunciation: number;    // 1-10 ease of saying
    memorability: number;     // 1-10 score
    typoRisk: number;         // 1-10 (lower = better)
    tld: string;
    searchVolume?: number;    // Monthly searches for keywords
    competitorValue?: number; // What similar domains sold for
  };
  estimatedValue: {
    low: number;
    mid: number;
    high: number;
  };
  reasoning: string;
}

function assessDomainValue(domain: string): DomainValue {
  const name = domain.split('.')[0];
  const tld = '.' + domain.split('.').slice(1).join('.');

  // Length scoring (ideal: 4-8 characters)
  const lengthScore = name.length <= 4 ? 10 :
                      name.length <= 6 ? 9 :
                      name.length <= 8 ? 7 :
                      name.length <= 10 ? 5 :
                      name.length <= 12 ? 3 : 1;

  // TLD multiplier
  const tldMultiplier: Record<string, number> = {
    '.com': 1.0,
    '.io': 0.7,
    '.co': 0.5,
    '.ai': 0.8,
    '.dev': 0.4,
    '.app': 0.4,
  };

  // Base value calculation
  const baseValue = 500; // Minimum domain value
  const lengthBonus = lengthScore * 200;
  const multiplier = tldMultiplier[tld] || 0.3;

  const midValue = Math.round((baseValue + lengthBonus) / multiplier);

  return {
    domain,
    factors: {
      length: name.length,
      keywords: extractKeywords(name),
      brandability: assessBrandability(name),
      pronunciation: assessPronunciation(name),
      memorability: assessMemorability(name),
      typoRisk: assessTypoRisk(name),
      tld,
    },
    estimatedValue: {
      low: Math.round(midValue * 0.5),
      mid: midValue,
      high: Math.round(midValue * 2),
    },
    reasoning: generateValueReasoning(domain),
  };
}
```

### Premium Domain Indicators

```typescript
const premiumIndicators = {
  // Single-word dictionary domains
  singleWord: (name: string) => isDictionaryWord(name),

  // Very short (3-4 chars)
  ultraShort: (name: string) => name.length <= 4,

  // High-value keywords
  premiumKeywords: ['ai', 'crypto', 'nft', 'meta', 'cloud', 'pay', 'bank', 'health'],

  // Numeric patterns
  numericPatterns: ['000', '123', '888', '777'],

  // Category killers
  categoryDomains: (name: string) =>
    name.match(/^(buy|get|my|the|best|top)[a-z]+$/i),
};
```

## Availability Checking

### API Integration Pattern

```typescript
// services/DomainAvailabilityService.ts
import Stripe from 'stripe';

interface AvailabilityResult {
  domain: string;
  available: boolean;
  premium: boolean;
  price?: {
    registration: number;
    renewal: number;
    currency: string;
  };
  registrar?: string;
  suggestions?: string[];
}

export class DomainAvailabilityService {
  private registrarAPIs: Map<string, RegistrarAPI>;

  constructor() {
    // Initialize registrar API connections
    this.registrarAPIs = new Map([
      ['namecheap', new NamecheapAPI(process.env.NAMECHEAP_API_KEY)],
      ['godaddy', new GoDaddyAPI(process.env.GODADDY_API_KEY)],
      ['cloudflare', new CloudflareAPI(process.env.CLOUDFLARE_API_TOKEN)],
    ]);
  }

  /**
   * Check domain availability across registrars
   */
  async checkAvailability(domain: string): Promise<AvailabilityResult> {
    const results = await Promise.all(
      Array.from(this.registrarAPIs.entries()).map(async ([name, api]) => {
        try {
          return { registrar: name, result: await api.check(domain) };
        } catch (error) {
          console.error(`${name} check failed:`, error);
          return null;
        }
      })
    );

    // Aggregate results
    const validResults = results.filter(Boolean);
    const available = validResults.some(r => r?.result.available);
    const lowestPrice = validResults
      .filter(r => r?.result.available)
      .sort((a, b) => (a?.result.price || 0) - (b?.result.price || 0))[0];

    return {
      domain,
      available,
      premium: lowestPrice?.result.premium || false,
      price: lowestPrice?.result.price,
      registrar: lowestPrice?.registrar,
    };
  }

  /**
   * Bulk check multiple domains
   */
  async bulkCheck(domains: string[]): Promise<AvailabilityResult[]> {
    // Rate limit: 10 domains per second
    const results: AvailabilityResult[] = [];

    for (let i = 0; i < domains.length; i += 10) {
      const batch = domains.slice(i, i + 10);
      const batchResults = await Promise.all(
        batch.map(domain => this.checkAvailability(domain))
      );
      results.push(...batchResults);

      if (i + 10 < domains.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Generate alternatives for taken domains
   */
  async suggestAlternatives(
    takenDomain: string,
    count: number = 5
  ): Promise<AvailabilityResult[]> {
    const name = takenDomain.split('.')[0];
    const alternatives = [
      `${name}.io`,
      `${name}.co`,
      `${name}app.com`,
      `get${name}.com`,
      `${name}hq.com`,
      `my${name}.com`,
      `${name}pro.com`,
      `the${name}.com`,
      `${name}.ai`,
      `${name}.dev`,
    ];

    const results = await this.bulkCheck(alternatives);
    return results.filter(r => r.available).slice(0, count);
  }
}
```

### WHOIS Integration

```typescript
// services/WhoisService.ts
interface WhoisData {
  domain: string;
  registrar: string;
  createdDate: Date;
  expirationDate: Date;
  updatedDate: Date;
  status: string[];
  nameServers: string[];
  registrant?: {
    organization?: string;
    country?: string;
  };
}

export class WhoisService {
  async lookup(domain: string): Promise<WhoisData> {
    // Use WHOIS API service
    const response = await fetch(
      `https://whois.whoisxmlapi.com/api/v1?apiKey=${process.env.WHOIS_API_KEY}&domainName=${domain}`
    );

    const data = await response.json();

    return {
      domain,
      registrar: data.registrarName,
      createdDate: new Date(data.createdDate),
      expirationDate: new Date(data.expiresDate),
      updatedDate: new Date(data.updatedDate),
      status: data.status,
      nameServers: data.nameServers?.hostNames || [],
      registrant: {
        organization: data.registrant?.organization,
        country: data.registrant?.country,
      },
    };
  }

  /**
   * Check if domain is expiring soon (opportunity for purchase)
   */
  async findExpiringDomains(domains: string[]): Promise<WhoisData[]> {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const results = await Promise.all(
      domains.map(d => this.lookup(d).catch(() => null))
    );

    return results
      .filter((r): r is WhoisData => r !== null)
      .filter(r => r.expirationDate <= thirtyDaysFromNow);
  }
}
```

## Quik Nation Domain Marketplace Integration

### Domain Inventory Model

```typescript
// models/DomainInventory.ts
import { Model, DataTypes } from 'sequelize';

export enum DomainStatus {
  AVAILABLE = 'available',      // Listed for sale
  RESERVED = 'reserved',        // Reserved for client
  SOLD = 'sold',               // Completed sale
  PARKED = 'parked',           // Owned but not listed
  PENDING_TRANSFER = 'pending_transfer',
}

export enum DomainCategory {
  PREMIUM = 'premium',          // High-value domains
  BRANDABLE = 'brandable',      // Made-up brandable names
  KEYWORD = 'keyword',          // Keyword-rich domains
  GEO = 'geo',                  // Location-based
  INDUSTRY = 'industry',        // Industry-specific
}

class DomainInventory extends Model {
  declare id: string;
  declare domain: string;
  declare tld: string;
  declare status: DomainStatus;
  declare category: DomainCategory;
  declare purchasePrice: number;
  declare listingPrice: number;
  declare minimumOffer: number;
  declare purchaseDate: Date;
  declare expirationDate: Date;
  declare registrarAccountId: string;
  declare seoMetrics: {
    domainAuthority?: number;
    backlinks?: number;
    monthlySearchVolume?: number;
    keywordRelevance?: string[];
  };
  declare metadata: {
    keywords?: string[];
    industry?: string;
    targetAudience?: string;
    suggestedUses?: string[];
  };
}

DomainInventory.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  tld: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(...Object.values(DomainStatus)),
    allowNull: false,
    defaultValue: DomainStatus.AVAILABLE,
  },
  category: {
    type: DataTypes.ENUM(...Object.values(DomainCategory)),
    allowNull: false,
  },
  purchasePrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Price paid in cents',
  },
  listingPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Sale price in cents',
  },
  minimumOffer: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Minimum acceptable offer in cents',
  },
  purchaseDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  expirationDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  registrarAccountId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  seoMetrics: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
}, {
  sequelize,
  tableName: 'domain_inventory',
  timestamps: true,
  indexes: [
    { fields: ['domain'], unique: true },
    { fields: ['status'] },
    { fields: ['category'] },
    { fields: ['tld'] },
    { fields: ['expirationDate'] },
    { fields: ['listingPrice'] },
  ],
});
```

### GraphQL Schema

```graphql
# schema/domain.graphql

enum DomainStatus {
  AVAILABLE
  RESERVED
  SOLD
  PARKED
  PENDING_TRANSFER
}

enum DomainCategory {
  PREMIUM
  BRANDABLE
  KEYWORD
  GEO
  INDUSTRY
}

type Domain {
  id: ID!
  domain: String!
  tld: String!
  status: DomainStatus!
  category: DomainCategory!
  listingPrice: Int!
  minimumOffer: Int
  expirationDate: DateTime!
  seoMetrics: SEOMetrics
  metadata: DomainMetadata
}

type SEOMetrics {
  domainAuthority: Int
  backlinks: Int
  monthlySearchVolume: Int
  keywordRelevance: [String!]
}

type DomainMetadata {
  keywords: [String!]
  industry: String
  targetAudience: String
  suggestedUses: [String!]
}

type DomainSuggestion {
  domain: String!
  available: Boolean!
  premium: Boolean!
  estimatedValue: PriceRange
  reasoning: String!
  tldRecommendation: String
}

type PriceRange {
  low: Int!
  mid: Int!
  high: Int!
}

type AvailabilityResult {
  domain: String!
  available: Boolean!
  premium: Boolean!
  price: DomainPrice
  alternatives: [DomainSuggestion!]
}

type DomainPrice {
  registration: Int!
  renewal: Int!
  currency: String!
}

input BrainstormInput {
  businessDescription: String!
  keywords: [String!]
  preferredTLDs: [String!]
  maxLength: Int
  style: DomainStyle
  count: Int
}

enum DomainStyle {
  BRANDABLE
  KEYWORD_RICH
  SHORT
  DESCRIPTIVE
}

input DomainSearchInput {
  query: String
  category: DomainCategory
  tld: String
  minPrice: Int
  maxPrice: Int
  status: DomainStatus
}

type Query {
  # Marketplace queries
  searchDomains(input: DomainSearchInput!): [Domain!]!
  getDomain(domain: String!): Domain
  featuredDomains(limit: Int): [Domain!]!

  # Availability checking
  checkAvailability(domain: String!): AvailabilityResult!
  bulkCheckAvailability(domains: [String!]!): [AvailabilityResult!]!
}

type Mutation {
  # Brainstorming
  brainstormDomains(input: BrainstormInput!): [DomainSuggestion!]!

  # Inventory management (admin)
  addToInventory(domain: String!, purchasePrice: Int!, category: DomainCategory!): Domain!
  updateListing(id: ID!, listingPrice: Int, status: DomainStatus): Domain!

  # Sales
  makeOffer(domainId: ID!, offerAmount: Int!, contactEmail: String!): OfferResult!
  purchaseDomain(domainId: ID!, paymentMethodId: String!): PurchaseResult!
}
```

## Frontend Components

### Domain Search Component

```typescript
// components/domains/DomainSearch.tsx
'use client';

import { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Check, X, Loader2 } from 'lucide-react';
import { gql } from '@apollo/client';

const CHECK_AVAILABILITY = gql`
  query CheckAvailability($domain: String!) {
    checkAvailability(domain: $domain) {
      domain
      available
      premium
      price {
        registration
        renewal
        currency
      }
      alternatives {
        domain
        available
        estimatedValue {
          low
          mid
          high
        }
        reasoning
      }
    }
  }
`;

export function DomainSearch() {
  const [query, setQuery] = useState('');
  const [checkAvailability, { data, loading }] = useLazyQuery(CHECK_AVAILABILITY);

  const handleSearch = () => {
    if (query.includes('.')) {
      checkAvailability({ variables: { domain: query } });
    } else {
      // Add .com by default
      checkAvailability({ variables: { domain: `${query}.com` } });
    }
  };

  const result = data?.checkAvailability;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          placeholder="Search for a domain name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="text-lg"
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Search />}
          Search
        </Button>
      </div>

      {result && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {result.available ? (
                  <Check className="h-6 w-6 text-green-500" />
                ) : (
                  <X className="h-6 w-6 text-red-500" />
                )}
                <span className="text-2xl font-bold">{result.domain}</span>
                {result.premium && (
                  <Badge variant="secondary">Premium</Badge>
                )}
              </div>
              {result.available && result.price && (
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    ${(result.price.registration / 100).toFixed(2)}/yr
                  </p>
                  <Button className="mt-2">Register Now</Button>
                </div>
              )}
            </div>

            {!result.available && result.alternatives?.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Available Alternatives</h3>
                <div className="grid gap-2">
                  {result.alternatives.map((alt: any) => (
                    <div
                      key={alt.domain}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <span className="font-medium">{alt.domain}</span>
                        <p className="text-sm text-muted-foreground">
                          {alt.reasoning}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          Est. ${(alt.estimatedValue.mid / 100).toFixed(0)}
                        </p>
                        <Button size="sm" variant="outline">
                          Select
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### Domain Brainstorm Component

```typescript
// components/domains/DomainBrainstorm.tsx
'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Check, Crown } from 'lucide-react';
import { gql } from '@apollo/client';

const BRAINSTORM_DOMAINS = gql`
  mutation BrainstormDomains($input: BrainstormInput!) {
    brainstormDomains(input: $input) {
      domain
      available
      premium
      estimatedValue {
        low
        mid
        high
      }
      reasoning
      tldRecommendation
    }
  }
`;

export function DomainBrainstorm() {
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('BRANDABLE');
  const [brainstorm, { data, loading }] = useMutation(BRAINSTORM_DOMAINS);

  const handleBrainstorm = () => {
    brainstorm({
      variables: {
        input: {
          businessDescription: description,
          style,
          count: 10,
        },
      },
    });
  };

  const suggestions = data?.brainstormDomains || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Domain Brainstormer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe your business or project. For example: 'A subscription box service for artisanal coffee lovers who want to discover new roasters'"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />

          <div className="flex gap-4">
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRANDABLE">Brandable Names</SelectItem>
                <SelectItem value="KEYWORD_RICH">Keyword Rich</SelectItem>
                <SelectItem value="SHORT">Short & Punchy</SelectItem>
                <SelectItem value="DESCRIPTIVE">Descriptive</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleBrainstorm} disabled={loading || !description}>
              {loading ? 'Generating...' : 'Generate Ideas'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {suggestions.map((suggestion: any, index: number) => (
            <Card key={suggestion.domain} className={index === 0 ? 'border-primary' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{suggestion.domain}</span>
                      {suggestion.available ? (
                        <Badge variant="default" className="bg-green-500">
                          <Check className="h-3 w-3 mr-1" /> Available
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Taken</Badge>
                      )}
                      {suggestion.premium && (
                        <Badge variant="outline">
                          <Crown className="h-3 w-3 mr-1" /> Premium
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {suggestion.reasoning}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ${(suggestion.estimatedValue.mid / 100).toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">est. value</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Environment Variables

```env
# Domain Registrar APIs
NAMECHEAP_API_KEY=xxx
NAMECHEAP_API_USER=xxx
GODADDY_API_KEY=xxx
GODADDY_API_SECRET=xxx
CLOUDFLARE_API_TOKEN=xxx

# WHOIS API
WHOIS_API_KEY=xxx

# SEO Analysis
MOZ_API_KEY=xxx
AHREFS_API_KEY=xxx
```

## Quality Checklist

Before deployment:

- [ ] Domain availability API integration tested
- [ ] Bulk checking rate limits implemented
- [ ] Value estimation algorithm validated
- [ ] Inventory model migrated
- [ ] GraphQL resolvers tested
- [ ] Frontend components responsive
- [ ] Search functionality works
- [ ] Brainstorm generates quality suggestions
- [ ] Payment integration for domain purchases
- [ ] Domain transfer workflow documented

## Integration with Bootstrap Project

This skill integrates with the `bootstrap-project` command:

```typescript
// During project inception, prompt for domain selection
const domainStep = {
  name: 'domain-selection',
  prompt: 'What domain would you like for this project?',
  action: async (projectContext: ProjectContext) => {
    const suggestions = await brainstormDomains({
      businessDescription: projectContext.prd.description,
      keywords: projectContext.prd.keywords,
      style: 'BRANDABLE',
    });

    return displayDomainOptions(suggestions);
  },
};
```

## Resources

### references/
- `tld-guide.md` - Complete TLD selection guide
- `valuation-methods.md` - Domain valuation methodologies
- `registrar-comparison.md` - API comparison across registrars

### scripts/
- `check-availability.ts` - Standalone availability checker
- `bulk-import.ts` - Import domains to inventory
