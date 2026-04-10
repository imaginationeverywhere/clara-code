# Implement Admin Dashboard

Implement production-grade admin dashboard with tab-based analytics, real-time metrics, and comprehensive business intelligence interfaces following DreamiHairCare's battle-tested patterns.

## Command Usage

```
/implement-admin-dashboard [options]
```

### Options
- `--full` - Complete admin dashboard with all panels (default)
- `--overview-only` - Overview panel with key metrics only
- `--analytics-only` - Analytics-focused dashboard
- `--minimal` - Minimal dashboard with basic stats
- `--audit` - Audit existing implementation against standards

### Feature Options
- `--with-realtime` - Include real-time metrics panel
- `--with-charts` - Include chart visualizations
- `--with-reports` - Include report generation
- `--with-export` - Include data export functionality

## Pre-Implementation Checklist

### Required Infrastructure
- [ ] GraphQL backend configured with Apollo Server
- [ ] Authentication system (Clerk recommended)
- [ ] Database with orders, customers, products tables
- [ ] Frontend with Next.js 16 App Router

### Environment Variables
```bash
# Analytics (optional but recommended)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
GA4_PROPERTY_ID=123456789

# Export (if using S3)
AWS_REGION=us-east-1
AWS_S3_EXPORTS_BUCKET=your-exports-bucket
```

## Implementation Phases

### Phase 1: Core Dashboard Layout

#### 1.1 Dashboard Page Structure
```typescript
// frontend/src/app/admin/dashboard/page.tsx
import { Suspense } from 'react';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { DashboardSkeleton } from '@/components/admin/DashboardSkeleton';

export default function AdminDashboardPage() {
  return (
    <div className="p-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <AnalyticsDashboard />
      </Suspense>
    </div>
  );
}
```

#### 1.2 Tab-Based Dashboard Component
See **admin-dashboard-standard** skill for complete implementation:
- Tab navigation with Headless UI
- Time range selector (7d, 30d, 90d, 1y)
- Panel components for each tab
- Loading states and error handling

### Phase 2: Metric Cards System

#### 2.1 MetricCard Component
See **admin-dashboard-standard** skill for:
- Growth indicators with trend arrows
- Currency, percentage, number formatting
- Loading skeleton states
- Responsive design patterns

#### 2.2 Metrics Grid Layout
```typescript
// Grid layout for metric cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <MetricCard title="Total Revenue" value={revenue} change={revenueGrowth} format="currency" />
  <MetricCard title="Total Orders" value={orders} change={ordersGrowth} format="number" />
  <MetricCard title="Conversion Rate" value={conversionRate} change={conversionGrowth} format="percent" />
</div>
```

### Phase 3: Data Hooks

#### 3.1 Dashboard Data Hook
```typescript
// frontend/src/hooks/useDashboardData.ts
export function useDashboardData(enabled: boolean = true) {
  return useQuery(DASHBOARD_STATS_QUERY, {
    skip: !enabled,
    fetchPolicy: 'cache-and-network',
    pollInterval: 60000, // Refresh every minute
  });
}
```

#### 3.2 Analytics Transform Hook
```typescript
// frontend/src/hooks/useAnalyticsTransform.ts
export function useAnalyticsTransform() {
  const transformToEcommerceMetrics = useMemo(() => {...});
  const transformToChartData = useMemo(() => {...});
  return { transformToEcommerceMetrics, transformToChartData };
}
```

### Phase 4: GraphQL Backend

#### 4.1 Dashboard Stats Resolver
```typescript
// backend/src/graphql/resolvers/dashboardResolvers.ts
dashboardStats: async (_, __, context) => {
  // CRITICAL: Authentication check
  if (!context.auth?.userId) {
    throw new GraphQLError('Authentication required');
  }

  // Calculate metrics with NaN protection
  return {
    totalRevenue: safeNumber(revenue),
    revenueChange: calculateGrowthPercentage(current, previous),
    // ... more metrics
  };
}
```

#### 4.2 GraphQL Schema
```graphql
type DashboardStats {
  totalRevenue: Float!
  revenueChange: Float!
  totalOrders: Int!
  ordersChange: Float!
  averageOrderValue: Float!
  aovChange: Float!
}

extend type Query {
  dashboardStats: DashboardStats! @auth
}
```

### Phase 5: Real-Time Panel (Optional)

#### 5.1 Real-Time Metrics Component
See **admin-dashboard-standard** skill for:
- Active users display
- Auto-refresh with polling
- Country/page/source breakdowns
- Recent events stream

### Phase 6: Dashboard Panels

#### Available Panels
1. **Overview Panel** - Key business metrics with growth indicators
2. **Cart Analytics Panel** - Abandoned cart tracking, recovery rates
3. **Orders Panel** - Order status distribution, fulfillment metrics
4. **Customers Panel** - Customer acquisition, retention, LTV
5. **SEO Panel** - Traffic sources, keyword rankings (requires GA4)
6. **Real-Time Panel** - Live visitor tracking (requires GA4)

## File Structure

```
frontend/src/
├── app/admin/
│   ├── dashboard/
│   │   └── page.tsx
│   └── analytics/
│       └── page.tsx
├── components/admin/
│   ├── AnalyticsDashboard.tsx
│   ├── DashboardSkeleton.tsx
│   ├── MetricCard.tsx
│   └── panels/
│       ├── OverviewPanel.tsx
│       ├── CartAnalyticsPanel.tsx
│       ├── OrdersPanel.tsx
│       ├── CustomersPanel.tsx
│       ├── SEOPanel.tsx
│       └── RealTimePanel.tsx
└── hooks/
    ├── useDashboardData.ts
    ├── useAnalyticsMetrics.ts
    └── useAnalyticsTransform.ts

backend/src/graphql/
├── schema/
│   └── dashboard.graphql
└── resolvers/
    └── dashboardResolvers.ts
```

## Verification Checklist

### UI Components
- [ ] Tab navigation working correctly
- [ ] Time range selector updates all panels
- [ ] Metric cards display with proper formatting
- [ ] Growth indicators show correct trend direction
- [ ] Loading skeletons display during data fetch
- [ ] Error states handled gracefully

### Data Integration
- [ ] GraphQL queries return expected data
- [ ] Authentication required on all resolvers
- [ ] NaN protection in place for all calculations
- [ ] Polling/refresh working for real-time data
- [ ] Cache invalidation on data updates

### Responsiveness
- [ ] Mobile layout with stacked cards
- [ ] Tablet layout with 2-column grid
- [ ] Desktop layout with 3-column grid
- [ ] Tab navigation scrollable on mobile

### Performance
- [ ] Lazy loading for inactive panels
- [ ] Memoized transform functions
- [ ] Appropriate cache policies
- [ ] No unnecessary re-renders

## Related Skills

- **admin-dashboard-standard** - Complete dashboard patterns
- **analytics-tracking-standard** - GA4 integration
- **reporting-standard** - Report generation
- **shadcn-ui-specialist** - UI component patterns

## Related Commands

- `/implement-analytics` - Analytics tracking setup
- `/implement-notifications` - Notification system
