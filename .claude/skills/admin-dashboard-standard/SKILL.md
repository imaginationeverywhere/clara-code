---
name: admin-dashboard-standard
description: Implement admin dashboards with tab-based analytics, real-time metrics, and business intelligence interfaces. Use when building admin analytics views, metric cards, dashboard layouts, or KPI displays. Triggers on requests for admin dashboards, analytics panels, metric displays, or business intelligence.
---

# Admin Dashboard Standard

Production-grade admin dashboard patterns from DreamiHairCare implementation with tab-based analytics, real-time metrics, and comprehensive business intelligence interfaces.

## Skill Metadata

- **Name:** admin-dashboard-standard
- **Version:** 1.0.0
- **Category:** Admin & Analytics
- **Source:** DreamiHairCare Production Implementation
- **Related Skills:** analytics-tracking-standard, reporting-standard, admin-panel-standard

## When to Use This Skill

Use this skill when:
- Building admin dashboards with analytics views
- Implementing tab-based analytics interfaces
- Creating metric cards with growth indicators
- Building real-time dashboard components
- Implementing time range selectors
- Creating data visualization layouts

## Core Patterns

### 1. Tab-Based Analytics Dashboard

```typescript
// frontend/src/components/admin/AnalyticsDashboard.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Tab } from '@headlessui/react';
import {
  ChartBarIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  SignalIcon,
} from '@heroicons/react/24/outline';

interface AnalyticsDashboardProps {
  campaignId?: string;
  initialTab?: string;
}

const tabs = [
  { id: 'overview', name: 'Overview', icon: ChartBarIcon },
  { id: 'cart', name: 'Cart Analytics', icon: ShoppingCartIcon },
  { id: 'orders', name: 'Orders', icon: ClipboardDocumentListIcon },
  { id: 'customers', name: 'Customers', icon: UsersIcon },
  { id: 'seo', name: 'SEO & Traffic', icon: MagnifyingGlassIcon },
  { id: 'realtime', name: 'Real-Time', icon: SignalIcon },
];

const timeRanges = [
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last 90 days' },
  { id: '1y', label: 'Last year' },
];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  campaignId,
  initialTab = 'overview',
}) => {
  const [dateRange, setDateRange] = useState('30d');
  const [selectedIndex, setSelectedIndex] = useState(
    tabs.findIndex(t => t.id === initialTab) || 0
  );

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex items-center space-x-2">
          {timeRanges.map((range) => (
            <button
              key={range.id}
              onClick={() => setDateRange(range.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                dateRange === range.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                 ${selected
                   ? 'bg-white text-purple-700 shadow'
                   : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                 }`
              }
            >
              <div className="flex items-center justify-center">
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </div>
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="mt-6">
          <Tab.Panel><OverviewPanel dateRange={dateRange} /></Tab.Panel>
          <Tab.Panel><CartAnalyticsPanel dateRange={dateRange} /></Tab.Panel>
          <Tab.Panel><OrdersPanel dateRange={dateRange} /></Tab.Panel>
          <Tab.Panel><CustomersPanel dateRange={dateRange} /></Tab.Panel>
          <Tab.Panel><SEOPanel dateRange={dateRange} /></Tab.Panel>
          <Tab.Panel><RealTimePanel /></Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};
```

### 2. Metric Card Component

```typescript
// frontend/src/components/admin/MetricCard.tsx
import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  format?: 'number' | 'currency' | 'percent';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon: Icon,
  loading = false,
  format = 'number',
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(val);
      case 'percent':
        return `${val.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('en-US').format(val);
    }
  };

  const getTrendColor = (change: number): string => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const getTrendBg = (change: number): string => {
    if (change > 0) return 'bg-green-100';
    if (change < 0) return 'bg-red-100';
    return 'bg-gray-100';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        {Icon && (
          <div className="p-2 bg-purple-100 rounded-lg">
            <Icon className="h-5 w-5 text-purple-600" />
          </div>
        )}
      </div>

      <div className="text-3xl font-bold text-gray-900 mb-2">
        {formatValue(value)}
      </div>

      {change !== undefined && (
        <div className="flex items-center text-sm">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${getTrendBg(change)} ${getTrendColor(change)}`}>
            {change > 0 ? (
              <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
            ) : change < 0 ? (
              <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
            ) : null}
            {Math.abs(change).toFixed(1)}%
          </span>
          <span className="ml-2 text-gray-500">{changeLabel}</span>
        </div>
      )}
    </div>
  );
};
```

### 3. Dashboard Data Hooks

```typescript
// frontend/src/hooks/useDashboardData.ts
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const DASHBOARD_STATS_QUERY = gql`
  query DashboardStats {
    dashboardStats {
      totalRevenue
      revenueChange
      totalOrders
      ordersChange
      totalCustomers
      customersChange
      averageOrderValue
      aovChange
      conversionRate
      conversionChange
      returningCustomerRate
      returningCustomerChange
    }
  }
`;

const ANALYTICS_METRICS_QUERY = gql`
  query AnalyticsMetrics($dateRange: String!) {
    googleAnalyticsOverview(period: $dateRange) {
      totalUsers
      newUsers
      sessions
      pageviews
      bounceRate
      sessionDuration
      conversions
      revenue
    }
  }
`;

interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalCustomers: number;
  customersChange: number;
  averageOrderValue: number;
  aovChange: number;
  conversionRate: number;
  conversionChange: number;
  returningCustomerRate: number;
  returningCustomerChange: number;
}

export function useDashboardData(campaignId?: string, enabled: boolean = true) {
  const { data, loading, error, refetch } = useQuery(DASHBOARD_STATS_QUERY, {
    skip: !enabled,
    fetchPolicy: 'cache-and-network',
    pollInterval: 60000, // Refresh every minute
  });

  return {
    data: data?.dashboardStats as DashboardStats | undefined,
    loading,
    error,
    refetch,
  };
}

export function useAnalyticsMetrics(
  campaignId: string,
  options: { dateRange: string }
) {
  const { data, loading, error, refetch } = useQuery(ANALYTICS_METRICS_QUERY, {
    variables: { dateRange: options.dateRange },
    skip: !campaignId,
    fetchPolicy: 'cache-and-network',
  });

  return {
    data: data?.googleAnalyticsOverview,
    loading,
    error,
    refetch,
  };
}
```

### 4. Analytics Transform Hook

```typescript
// frontend/src/hooks/useAnalyticsTransform.ts
import { useMemo } from 'react';

interface EcommerceMetrics {
  revenue: number;
  transactions: number;
  averageOrderValue: number;
  conversionRate: number;
}

interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export function useAnalyticsTransform() {
  const transformToEcommerceMetrics = useMemo(() => {
    return (rawData: any): EcommerceMetrics => {
      if (!rawData) {
        return {
          revenue: 0,
          transactions: 0,
          averageOrderValue: 0,
          conversionRate: 0,
        };
      }

      const revenue = Number(rawData.revenue) || 0;
      const transactions = Number(rawData.transactions) || 0;
      const sessions = Number(rawData.sessions) || 1;

      return {
        revenue,
        transactions,
        averageOrderValue: transactions > 0 ? revenue / transactions : 0,
        conversionRate: (transactions / sessions) * 100,
      };
    };
  }, []);

  const transformToChartData = useMemo(() => {
    return (
      timeSeries: Array<{ date: string; value: number }>,
      format: 'daily' | 'weekly' | 'monthly' = 'daily'
    ): ChartDataPoint[] => {
      if (!timeSeries?.length) return [];

      return timeSeries.map((point) => ({
        date: formatDateForChart(point.date, format),
        value: Number(point.value) || 0,
        label: formatDateLabel(point.date, format),
      }));
    };
  }, []);

  return {
    transformToEcommerceMetrics,
    transformToChartData,
  };
}

function formatDateForChart(
  dateStr: string,
  format: 'daily' | 'weekly' | 'monthly'
): string {
  const date = new Date(dateStr);
  switch (format) {
    case 'monthly':
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    case 'weekly':
      return `Week ${getWeekNumber(date)}`;
    default:
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

function formatDateLabel(
  dateStr: string,
  format: 'daily' | 'weekly' | 'monthly'
): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: format === 'daily' ? 'short' : undefined,
    month: 'short',
    day: 'numeric',
    year: format === 'monthly' ? 'numeric' : undefined,
  });
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
```

### 5. Overview Panel Component

```typescript
// frontend/src/components/admin/panels/OverviewPanel.tsx
import React from 'react';
import { MetricCard } from '../MetricCard';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ReceiptPercentIcon,
} from '@heroicons/react/24/outline';

interface OverviewPanelProps {
  dateRange: string;
}

export const OverviewPanel: React.FC<OverviewPanelProps> = ({ dateRange }) => {
  const { data, loading, error, refetch } = useDashboardData(undefined, true);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium">Error loading dashboard</h3>
        <p className="text-red-600 text-sm mt-1">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Revenue',
      value: data?.totalRevenue ?? 0,
      change: data?.revenueChange,
      icon: CurrencyDollarIcon,
      format: 'currency' as const,
    },
    {
      title: 'Total Orders',
      value: data?.totalOrders ?? 0,
      change: data?.ordersChange,
      icon: ShoppingBagIcon,
      format: 'number' as const,
    },
    {
      title: 'Total Customers',
      value: data?.totalCustomers ?? 0,
      change: data?.customersChange,
      icon: UsersIcon,
      format: 'number' as const,
    },
    {
      title: 'Average Order Value',
      value: data?.averageOrderValue ?? 0,
      change: data?.aovChange,
      icon: ChartBarIcon,
      format: 'currency' as const,
    },
    {
      title: 'Conversion Rate',
      value: data?.conversionRate ?? 0,
      change: data?.conversionChange,
      icon: ReceiptPercentIcon,
      format: 'percent' as const,
    },
    {
      title: 'Returning Customers',
      value: data?.returningCustomerRate ?? 0,
      change: data?.returningCustomerChange,
      icon: ArrowPathIcon,
      format: 'percent' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            icon={metric.icon}
            loading={loading}
            format={metric.format}
          />
        ))}
      </div>

      {/* Additional dashboard widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart dateRange={dateRange} />
        <TopProductsWidget />
      </div>
    </div>
  );
};
```

### 6. Real-Time Dashboard Panel

```typescript
// frontend/src/components/admin/panels/RealTimePanel.tsx
import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { SignalIcon, UserIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const REALTIME_METRICS_QUERY = gql`
  query RealTimeMetrics {
    googleAnalyticsRealTime {
      activeUsers
      activeUsersByCountry {
        country
        users
      }
      activeUsersByPage {
        pagePath
        pageTitle
        users
      }
      activeUsersBySource {
        source
        medium
        users
      }
      recentEvents {
        eventName
        count
        timestamp
      }
    }
  }
`;

export const RealTimePanel: React.FC = () => {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const { data, loading, error, refetch } = useQuery(REALTIME_METRICS_QUERY, {
    pollInterval: 30000, // Update every 30 seconds
    fetchPolicy: 'network-only',
    onCompleted: () => setLastUpdated(new Date()),
  });

  const realTimeData = data?.googleAnalyticsRealTime;

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <SignalIcon className="h-5 w-5 text-green-500 mr-2 animate-pulse" />
          <span className="text-sm text-gray-600">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
        <button
          onClick={() => refetch()}
          className="text-sm text-purple-600 hover:text-purple-700"
        >
          Refresh now
        </button>
      </div>

      {/* Active Users Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-center">
          <UserIcon className="h-16 w-16 opacity-50 mr-4" />
          <div className="text-center">
            <div className="text-6xl font-bold">
              {loading ? '...' : realTimeData?.activeUsers ?? 0}
            </div>
            <div className="text-purple-200 mt-2">Active users right now</div>
          </div>
        </div>
      </div>

      {/* Real-time Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* By Country */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <GlobeAltIcon className="h-5 w-5 mr-2 text-gray-400" />
            By Country
          </h3>
          <div className="space-y-3">
            {realTimeData?.activeUsersByCountry?.slice(0, 5).map((item: any) => (
              <div key={item.country} className="flex items-center justify-between">
                <span className="text-gray-600">{item.country}</span>
                <span className="font-medium">{item.users}</span>
              </div>
            )) ?? (
              <div className="text-gray-400 text-sm">No data available</div>
            )}
          </div>
        </div>

        {/* By Page */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Active Pages</h3>
          <div className="space-y-3">
            {realTimeData?.activeUsersByPage?.slice(0, 5).map((item: any) => (
              <div key={item.pagePath} className="flex items-center justify-between">
                <span className="text-gray-600 truncate max-w-[150px]" title={item.pageTitle}>
                  {item.pageTitle || item.pagePath}
                </span>
                <span className="font-medium">{item.users}</span>
              </div>
            )) ?? (
              <div className="text-gray-400 text-sm">No data available</div>
            )}
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Events</h3>
          <div className="space-y-3">
            {realTimeData?.recentEvents?.slice(0, 5).map((event: any, idx: number) => (
              <div key={`${event.eventName}-${idx}`} className="flex items-center justify-between">
                <span className="text-gray-600">{event.eventName}</span>
                <span className="font-medium">{event.count}</span>
              </div>
            )) ?? (
              <div className="text-gray-400 text-sm">No events recorded</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 7. GraphQL Schema for Dashboard

```graphql
# backend/src/graphql/schema/dashboard.graphql

type DashboardStats {
  totalRevenue: Float!
  revenueChange: Float!
  totalOrders: Int!
  ordersChange: Float!
  totalCustomers: Int!
  customersChange: Float!
  averageOrderValue: Float!
  aovChange: Float!
  conversionRate: Float!
  conversionChange: Float!
  returningCustomerRate: Float!
  returningCustomerChange: Float!
}

type RealTimeMetrics {
  activeUsers: Int!
  activeUsersByCountry: [CountryMetric!]!
  activeUsersByPage: [PageMetric!]!
  activeUsersBySource: [SourceMetric!]!
  recentEvents: [EventMetric!]!
}

type CountryMetric {
  country: String!
  users: Int!
}

type PageMetric {
  pagePath: String!
  pageTitle: String
  users: Int!
}

type SourceMetric {
  source: String!
  medium: String!
  users: Int!
}

type EventMetric {
  eventName: String!
  count: Int!
  timestamp: DateTime!
}

extend type Query {
  dashboardStats: DashboardStats! @auth
  realTimeMetrics: RealTimeMetrics! @auth
}
```

### 8. Dashboard Stats Resolver

```typescript
// backend/src/graphql/resolvers/dashboardResolvers.ts
import { GraphQLError } from 'graphql';
import { Op } from 'sequelize';

export const dashboardResolvers = {
  Query: {
    dashboardStats: async (_: any, __: any, context: any) => {
      // CRITICAL: Authentication check
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Current period stats
      const currentOrders = await Order.findAll({
        where: {
          createdAt: { [Op.gte]: thirtyDaysAgo },
          status: { [Op.notIn]: ['CANCELLED', 'REFUNDED'] },
        },
      });

      // Previous period stats
      const previousOrders = await Order.findAll({
        where: {
          createdAt: { [Op.between]: [sixtyDaysAgo, thirtyDaysAgo] },
          status: { [Op.notIn]: ['CANCELLED', 'REFUNDED'] },
        },
      });

      // Calculate metrics
      const currentRevenue = currentOrders.reduce((sum, o) => sum + Number(o.total), 0);
      const previousRevenue = previousOrders.reduce((sum, o) => sum + Number(o.total), 0);
      const revenueChange = calculateGrowthPercentage(currentRevenue, previousRevenue);

      const currentOrderCount = currentOrders.length;
      const previousOrderCount = previousOrders.length;
      const ordersChange = calculateGrowthPercentage(currentOrderCount, previousOrderCount);

      // Customer metrics
      const currentCustomers = await User.count({
        where: { createdAt: { [Op.gte]: thirtyDaysAgo } },
      });
      const previousCustomers = await User.count({
        where: { createdAt: { [Op.between]: [sixtyDaysAgo, thirtyDaysAgo] } },
      });
      const customersChange = calculateGrowthPercentage(currentCustomers, previousCustomers);

      // Average Order Value
      const currentAOV = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;
      const previousAOV = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0;
      const aovChange = calculateGrowthPercentage(currentAOV, previousAOV);

      return {
        totalRevenue: currentRevenue,
        revenueChange,
        totalOrders: currentOrderCount,
        ordersChange,
        totalCustomers: currentCustomers,
        customersChange,
        averageOrderValue: currentAOV,
        aovChange,
        conversionRate: 0, // From GA4 integration
        conversionChange: 0,
        returningCustomerRate: 0, // Calculated from order history
        returningCustomerChange: 0,
      };
    },
  },
};

// CRITICAL: Safe number calculation for GraphQL Float fields
function calculateGrowthPercentage(current: number, previous: number): number {
  const curr = Number.isFinite(current) ? current : 0;
  const prev = Number.isFinite(previous) ? previous : 0;

  if (prev === 0) {
    return curr > 0 ? 100 : 0;
  }

  const growth = ((curr - prev) / prev) * 100;
  return Number.isFinite(growth) ? growth : 0;
}
```

## Implementation Checklist

### Frontend Components
- [ ] Tab-based analytics dashboard with Headless UI
- [ ] Metric cards with growth indicators
- [ ] Time range selector (7d, 30d, 90d, 1y)
- [ ] Real-time metrics panel with auto-refresh
- [ ] Error boundaries with retry functionality
- [ ] Loading skeletons for all components

### Data Hooks
- [ ] useDashboardData with polling
- [ ] useAnalyticsMetrics with date range
- [ ] useAnalyticsTransform for data normalization
- [ ] Error handling and refetch capabilities

### GraphQL Integration
- [ ] Dashboard stats query
- [ ] Real-time metrics query
- [ ] Authentication on all resolvers
- [ ] NaN-safe number calculations

### Performance
- [ ] Cache-and-network fetch policy
- [ ] Poll intervals for real-time updates
- [ ] Lazy loading for tab panels
- [ ] Memoized transform functions

## Related Commands

- `/implement-admin-dashboard` - Full admin dashboard implementation
- `/implement-analytics` - Analytics tracking setup

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-15 | Initial release from DreamiHairCare patterns |
