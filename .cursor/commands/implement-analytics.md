# Implement Analytics

Implement production-grade Google Analytics 4 integration with rate limiting, circuit breaker patterns, caching, e-commerce tracking, and comprehensive reporting following DreamiHairCare's battle-tested patterns.

## Command Usage

```
/implement-analytics [options]
```

### Options
- `--full` - Complete analytics stack (GA4 + backend + frontend) (default)
- `--frontend-only` - Client-side tracking only
- `--backend-only` - Backend GA4 Data API integration only
- `--ecommerce` - E-commerce focused tracking
- `--audit` - Audit existing implementation against standards

### Feature Options
- `--with-realtime` - Include real-time analytics
- `--with-reports` - Include sales reporting
- `--with-export` - Include CSV/Excel export to S3
- `--with-dashboards` - Include admin dashboard integration

## Pre-Implementation Checklist

### Google Analytics Setup
- [ ] GA4 property created at https://analytics.google.com
- [ ] Measurement ID obtained (G-XXXXXXXXXX)
- [ ] Data Stream configured for your domain
- [ ] Enhanced measurement enabled

### For Backend Data API (Optional)
- [ ] Google Cloud project created
- [ ] Analytics Data API enabled
- [ ] Service account created with Viewer role
- [ ] Service account added to GA4 property
- [ ] Credentials JSON downloaded

### For Export to S3 (Optional)
- [ ] AWS account configured
- [ ] S3 bucket created for exports
- [ ] IAM credentials with S3 access

### Environment Variables
```bash
# Client-side tracking (required)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Backend Data API (optional)
GA4_PROPERTY_ID=123456789
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
# OR as JSON string
GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account",...}'

# Export to S3 (optional)
AWS_REGION=us-east-1
AWS_S3_EXPORTS_BUCKET=your-exports-bucket
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

## Implementation Phases

### Phase 1: Client-Side Tracking

#### 1.1 Analytics Library
```typescript
// frontend/src/lib/analytics.ts
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function initGA(): void { ... }
export function pageview(url: string): void { ... }
export function event(action: string, params?: object): void { ... }

// E-commerce events
export function viewItem(item): void { ... }
export function addToCart(item): void { ... }
export function beginCheckout(params): void { ... }
export function purchase(params): void { ... }
```

See **analytics-tracking-standard** skill for complete implementation.

#### 1.2 Analytics Provider
```typescript
// frontend/src/components/providers/AnalyticsProvider.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { initGA, pageview, GA_MEASUREMENT_ID } from '@/lib/analytics';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const url = searchParams?.size
        ? `${pathname}?${searchParams.toString()}`
        : pathname;
      pageview(url);
    }
  }, [pathname, searchParams]);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      {children}
    </>
  );
}
```

#### 1.3 Add Provider to Layout
```typescript
// frontend/src/app/layout.tsx
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
```

### Phase 2: E-Commerce Event Tracking

#### 2.1 Product Page Tracking
```typescript
// In product detail page
import { viewItem } from '@/lib/analytics';

useEffect(() => {
  if (product) {
    viewItem({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
    });
  }
}, [product]);
```

#### 2.2 Cart Operations
```typescript
// In add to cart handler
import { addToCart } from '@/lib/analytics';

const handleAddToCart = (product, quantity) => {
  // Add to cart logic...

  addToCart({
    id: product.id,
    name: product.name,
    price: product.price,
    quantity,
  });
};
```

#### 2.3 Checkout Flow
```typescript
// Begin checkout
import { beginCheckout } from '@/lib/analytics';

const handleBeginCheckout = () => {
  beginCheckout({
    value: cartTotal,
    items: cartItems.map(item => ({
      id: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
};
```

#### 2.4 Purchase Confirmation
```typescript
// After successful order
import { purchase } from '@/lib/analytics';

const handleOrderComplete = (order) => {
  purchase({
    transactionId: order.id,
    value: order.total,
    shipping: order.shippingCost,
    tax: order.tax,
    items: order.items.map(item => ({
      id: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
};
```

### Phase 3: Backend GA4 Data API

#### 3.1 Google Analytics Service
```typescript
// backend/src/services/GoogleAnalyticsService.ts
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export class GoogleAnalyticsService {
  private client: BetaAnalyticsDataClient | null = null;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private rateLimitState: RateLimitState;
  private circuitBreaker: CircuitBreakerState;

  // Rate limiting with sliding window
  private checkRateLimit(): boolean { ... }

  // Circuit breaker for API resilience
  private checkCircuitBreaker(): boolean { ... }

  // Caching with TTL
  private getCached<T>(key: string): T | null { ... }
  private setCache<T>(key: string, data: T): void { ... }

  // API methods
  async getOverviewMetrics(startDate, endDate): Promise<OverviewMetrics> { ... }
  async getTimeSeries(startDate, endDate, metric, granularity): Promise<TimeSeriesData[]> { ... }
  async getTopPages(startDate, endDate, limit): Promise<TopPage[]> { ... }
  async getRealTimeMetrics(): Promise<RealTimeMetrics> { ... }
}
```

See **analytics-tracking-standard** skill for complete implementation.

#### 3.2 GraphQL Resolvers
```typescript
// backend/src/graphql/resolvers/analyticsResolvers.ts
export const analyticsResolvers = {
  Query: {
    googleAnalyticsOverview: async (_, args, context) => {
      // CRITICAL: Authentication check
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required');
      }
      // ... implementation
    },
    googleAnalyticsTimeSeries: async (_, args, context) => { ... },
    googleAnalyticsTopPages: async (_, args, context) => { ... },
    googleAnalyticsRealTime: async (_, args, context) => { ... },
    googleAnalyticsEcommerce: async (_, args, context) => { ... },
  },
};
```

#### 3.3 GraphQL Schema
```graphql
type AnalyticsOverview {
  totalUsers: Int!
  newUsers: Int!
  sessions: Int!
  pageviews: Int!
  bounceRate: Float!
  sessionDuration: Float!
  conversions: Int!
  revenue: Float!
  period: String!
  startDate: String!
  endDate: String!
}

extend type Query {
  googleAnalyticsOverview(period: String): AnalyticsOverview! @auth
  googleAnalyticsTimeSeries(period: String, metric: String, granularity: String): TimeSeriesData! @auth
  googleAnalyticsTopPages(period: String, limit: Int): [TopPage!]! @auth
  googleAnalyticsRealTime: RealTimeMetrics! @auth
}
```

### Phase 4: Frontend Analytics Hooks

#### 4.1 Analytics Overview Hook
```typescript
// frontend/src/hooks/useGoogleAnalytics.ts
export function useAnalyticsOverview(period: string = '30days') {
  const { data, loading, error, refetch } = useQuery(GA_OVERVIEW_QUERY, {
    variables: { period },
    fetchPolicy: 'cache-and-network',
  });

  return { data: data?.googleAnalyticsOverview, loading, error, refetch };
}
```

#### 4.2 Time Series Hook
```typescript
export function useAnalyticsTimeSeries(options: {
  period?: string;
  metric?: string;
  granularity?: string;
}) {
  const { data, loading, error, refetch } = useQuery(GA_TIME_SERIES_QUERY, {
    variables: options,
    fetchPolicy: 'cache-and-network',
  });

  const chartData = useMemo(() => {
    // Transform data for charts
  }, [data]);

  return { data: chartData, loading, error, refetch };
}
```

### Phase 5: Sales Reporting (Optional)

#### 5.1 Sales Analytics Resolvers
See **reporting-standard** skill for:
- Sales overview with growth calculations
- Time series data with granularity
- Sales by channel/product
- CSV export to S3

#### 5.2 Report Generation UI
See **reporting-standard** skill for:
- Report type selection
- Date range picker
- Export format options
- Download with presigned URLs

## File Structure

```
frontend/src/
├── lib/
│   └── analytics.ts
├── components/providers/
│   └── AnalyticsProvider.tsx
└── hooks/
    ├── useGoogleAnalytics.ts
    └── useAnalyticsTransform.ts

backend/src/
├── services/
│   └── GoogleAnalyticsService.ts
└── graphql/
    ├── schema/
    │   └── analytics.graphql
    └── resolvers/
        └── analyticsResolvers.ts
```

## Verification Checklist

### Client-Side Tracking
- [ ] GA4 script loads correctly
- [ ] Page views tracked on navigation
- [ ] E-commerce events firing correctly
- [ ] Events visible in GA4 Realtime
- [ ] Debug mode working (gtag debug)

### Backend Integration
- [ ] Service account credentials configured
- [ ] GA4 Data API returning data
- [ ] Rate limiting preventing quota exhaustion
- [ ] Circuit breaker activating on failures
- [ ] Cache reducing API calls

### Data Quality
- [ ] User sessions tracking correctly
- [ ] E-commerce revenue accurate
- [ ] Conversion tracking working
- [ ] Custom events captured

### Security
- [ ] All resolvers require authentication
- [ ] Service account credentials secure
- [ ] No PII in event parameters
- [ ] GDPR consent handling (if applicable)

## Related Skills

- **analytics-tracking-standard** - Complete GA4 patterns
- **admin-dashboard-standard** - Dashboard integration
- **reporting-standard** - Sales reporting
- **google-analytics-implementation-specialist** - GA4 specialist agent

## Related Commands

- `/implement-admin-dashboard` - Admin dashboard setup
- `/implement-notifications` - Notification system
