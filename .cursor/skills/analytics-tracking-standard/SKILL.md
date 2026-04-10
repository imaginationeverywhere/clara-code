---
name: analytics-tracking-standard
description: Implement Google Analytics 4 with rate limiting, circuit breaker fallbacks, caching, and e-commerce tracking. Use when setting up GA4, implementing e-commerce analytics, or building tracking systems. Triggers on requests for Google Analytics, GA4 setup, e-commerce tracking, or analytics implementation.
---

# Analytics Tracking Standard

Production-grade Google Analytics 4 integration patterns from DreamiHairCare implementation with rate limiting, circuit breaker fallbacks, caching, and comprehensive e-commerce tracking.

## Skill Metadata

- **Name:** analytics-tracking-standard
- **Version:** 1.0.0
- **Category:** Admin & Analytics
- **Source:** DreamiHairCare Production Implementation
- **Related Skills:** admin-dashboard-standard, reporting-standard, google-analytics-implementation-specialist

## When to Use This Skill

Use this skill when:
- Integrating Google Analytics 4 (GA4) with backend
- Implementing e-commerce event tracking
- Building analytics GraphQL resolvers
- Setting up rate limiting for API calls
- Implementing circuit breaker patterns for third-party APIs
- Creating caching layers for analytics data

## Core Patterns

### 1. Google Analytics Service with Rate Limiting

```typescript
// backend/src/services/GoogleAnalyticsService.ts
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { GraphQLError } from 'graphql';

interface RateLimitState {
  requests: number[];
  windowStart: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class GoogleAnalyticsService {
  private client: BetaAnalyticsDataClient | null = null;
  private propertyId: string;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private rateLimitState: RateLimitState = { requests: [], windowStart: Date.now() };
  private circuitBreaker = {
    failures: 0,
    lastFailure: 0,
    isOpen: false,
  };

  // Configuration
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  private readonly RATE_LIMIT_MAX_REQUESTS = 50; // requests per window
  private readonly CIRCUIT_BREAKER_THRESHOLD = 5;
  private readonly CIRCUIT_BREAKER_RESET_TIME = 60 * 1000;

  constructor() {
    this.propertyId = process.env.GA4_PROPERTY_ID || '';
    this.initializeClient();
  }

  private initializeClient(): void {
    try {
      const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
      if (credentials) {
        const parsed = JSON.parse(credentials);
        this.client = new BetaAnalyticsDataClient({ credentials: parsed });
        console.log('GA4 client initialized successfully');
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        this.client = new BetaAnalyticsDataClient();
        console.log('GA4 client initialized with file credentials');
      } else {
        console.warn('GA4 credentials not configured - using fallback data');
      }
    } catch (error) {
      console.error('Failed to initialize GA4 client:', error);
    }
  }

  /**
   * Rate limiting with sliding window
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    const windowStart = now - this.RATE_LIMIT_WINDOW;

    // Remove requests outside the window
    this.rateLimitState.requests = this.rateLimitState.requests.filter(
      (timestamp) => timestamp > windowStart
    );

    if (this.rateLimitState.requests.length >= this.RATE_LIMIT_MAX_REQUESTS) {
      console.warn('GA4 rate limit exceeded');
      return false;
    }

    this.rateLimitState.requests.push(now);
    return true;
  }

  /**
   * Circuit breaker pattern for API resilience
   */
  private checkCircuitBreaker(): boolean {
    if (!this.circuitBreaker.isOpen) return true;

    const timeSinceLastFailure = Date.now() - this.circuitBreaker.lastFailure;
    if (timeSinceLastFailure > this.CIRCUIT_BREAKER_RESET_TIME) {
      this.circuitBreaker.isOpen = false;
      this.circuitBreaker.failures = 0;
      console.log('GA4 circuit breaker reset');
      return true;
    }

    return false;
  }

  private recordFailure(): void {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailure = Date.now();

    if (this.circuitBreaker.failures >= this.CIRCUIT_BREAKER_THRESHOLD) {
      this.circuitBreaker.isOpen = true;
      console.error('GA4 circuit breaker opened due to repeated failures');
    }
  }

  private recordSuccess(): void {
    this.circuitBreaker.failures = 0;
  }

  /**
   * Caching layer with TTL
   */
  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Date range calculation helper
   */
  getDateRange(period: '7days' | '30days' | '90days' | 'year'): {
    startDate: string;
    endDate: string;
  } {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case '7days':
        start.setDate(end.getDate() - 7);
        break;
      case '30days':
        start.setDate(end.getDate() - 30);
        break;
      case '90days':
        start.setDate(end.getDate() - 90);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  }

  /**
   * Get overview metrics from GA4
   */
  async getOverviewMetrics(
    startDate: string,
    endDate: string
  ): Promise<{
    totalUsers: number;
    newUsers: number;
    sessions: number;
    pageviews: number;
    bounceRate: number;
    sessionDuration: number;
    conversions: number;
    revenue: number;
  }> {
    const cacheKey = `overview_${startDate}_${endDate}`;
    const cached = this.getCached<any>(cacheKey);
    if (cached) return cached;

    // Check circuit breaker and rate limit
    if (!this.checkCircuitBreaker() || !this.checkRateLimit()) {
      return this.getFallbackOverviewData();
    }

    if (!this.client) {
      return this.getFallbackOverviewData();
    }

    try {
      const [response] = await this.client.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'totalUsers' },
          { name: 'newUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
          { name: 'conversions' },
          { name: 'totalRevenue' },
        ],
      });

      const row = response.rows?.[0];
      const result = {
        totalUsers: parseInt(row?.metricValues?.[0]?.value || '0'),
        newUsers: parseInt(row?.metricValues?.[1]?.value || '0'),
        sessions: parseInt(row?.metricValues?.[2]?.value || '0'),
        pageviews: parseInt(row?.metricValues?.[3]?.value || '0'),
        bounceRate: parseFloat(row?.metricValues?.[4]?.value || '0') * 100,
        sessionDuration: parseFloat(row?.metricValues?.[5]?.value || '0'),
        conversions: parseInt(row?.metricValues?.[6]?.value || '0'),
        revenue: parseFloat(row?.metricValues?.[7]?.value || '0'),
      };

      this.setCache(cacheKey, result);
      this.recordSuccess();
      return result;
    } catch (error: any) {
      console.error('GA4 overview fetch error:', error.message);
      this.recordFailure();
      return this.getFallbackOverviewData();
    }
  }

  /**
   * Get time series data for charts
   */
  async getTimeSeries(
    startDate: string,
    endDate: string,
    metric: string = 'sessions',
    granularity: 'day' | 'week' | 'month' = 'day'
  ): Promise<Array<{ date: string; value: number }>> {
    const cacheKey = `timeseries_${metric}_${granularity}_${startDate}_${endDate}`;
    const cached = this.getCached<Array<{ date: string; value: number }>>(cacheKey);
    if (cached) return cached;

    if (!this.checkCircuitBreaker() || !this.checkRateLimit() || !this.client) {
      return this.getFallbackTimeSeriesData(startDate, endDate, granularity);
    }

    try {
      const [response] = await this.client.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: metric }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      });

      const result = (response.rows || []).map((row) => ({
        date: row.dimensionValues?.[0]?.value || '',
        value: parseInt(row.metricValues?.[0]?.value || '0'),
      }));

      this.setCache(cacheKey, result);
      this.recordSuccess();
      return result;
    } catch (error: any) {
      console.error('GA4 time series fetch error:', error.message);
      this.recordFailure();
      return this.getFallbackTimeSeriesData(startDate, endDate, granularity);
    }
  }

  /**
   * Get top pages
   */
  async getTopPages(
    startDate: string,
    endDate: string,
    limit: number = 10
  ): Promise<Array<{
    pagePath: string;
    pageTitle: string;
    pageviews: number;
    avgTimeOnPage: number;
    bounceRate: number;
  }>> {
    const cacheKey = `toppages_${startDate}_${endDate}_${limit}`;
    const cached = this.getCached<any>(cacheKey);
    if (cached) return cached;

    if (!this.checkCircuitBreaker() || !this.checkRateLimit() || !this.client) {
      return [];
    }

    try {
      const [response] = await this.client.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [
          { name: 'pagePath' },
          { name: 'pageTitle' },
        ],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' },
        ],
        orderBys: [
          { metric: { metricName: 'screenPageViews' }, desc: true },
        ],
        limit,
      });

      const result = (response.rows || []).map((row) => ({
        pagePath: row.dimensionValues?.[0]?.value || '',
        pageTitle: row.dimensionValues?.[1]?.value || '',
        pageviews: parseInt(row.metricValues?.[0]?.value || '0'),
        avgTimeOnPage: parseFloat(row.metricValues?.[1]?.value || '0'),
        bounceRate: parseFloat(row.metricValues?.[2]?.value || '0') * 100,
      }));

      this.setCache(cacheKey, result);
      this.recordSuccess();
      return result;
    } catch (error: any) {
      console.error('GA4 top pages fetch error:', error.message);
      this.recordFailure();
      return [];
    }
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics(): Promise<{
    activeUsers: number;
    activeUsersByCountry: Array<{ country: string; users: number }>;
    activeUsersByPage: Array<{ pagePath: string; pageTitle: string; users: number }>;
  }> {
    if (!this.checkCircuitBreaker() || !this.checkRateLimit() || !this.client) {
      return {
        activeUsers: 0,
        activeUsersByCountry: [],
        activeUsersByPage: [],
      };
    }

    try {
      const [response] = await this.client.runRealtimeReport({
        property: `properties/${this.propertyId}`,
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'activeUsers' }],
      });

      const activeUsersByCountry = (response.rows || [])
        .map((row) => ({
          country: row.dimensionValues?.[0]?.value || 'Unknown',
          users: parseInt(row.metricValues?.[0]?.value || '0'),
        }))
        .slice(0, 10);

      const totalActiveUsers = activeUsersByCountry.reduce(
        (sum, item) => sum + item.users,
        0
      );

      this.recordSuccess();
      return {
        activeUsers: totalActiveUsers,
        activeUsersByCountry,
        activeUsersByPage: [], // Requires separate request
      };
    } catch (error: any) {
      console.error('GA4 real-time fetch error:', error.message);
      this.recordFailure();
      return {
        activeUsers: 0,
        activeUsersByCountry: [],
        activeUsersByPage: [],
      };
    }
  }

  /**
   * Fallback data when GA4 is unavailable
   */
  private getFallbackOverviewData() {
    return {
      totalUsers: 0,
      newUsers: 0,
      sessions: 0,
      pageviews: 0,
      bounceRate: 0,
      sessionDuration: 0,
      conversions: 0,
      revenue: 0,
    };
  }

  private getFallbackTimeSeriesData(
    startDate: string,
    endDate: string,
    granularity: 'day' | 'week' | 'month'
  ): Array<{ date: string; value: number }> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const result: Array<{ date: string; value: number }> = [];

    let current = new Date(start);
    while (current <= end) {
      result.push({
        date: current.toISOString().split('T')[0],
        value: 0,
      });

      switch (granularity) {
        case 'week':
          current.setDate(current.getDate() + 7);
          break;
        case 'month':
          current.setMonth(current.getMonth() + 1);
          break;
        default:
          current.setDate(current.getDate() + 1);
      }
    }

    return result;
  }
}

// Singleton instance
export const googleAnalyticsService = new GoogleAnalyticsService();
```

### 2. Analytics GraphQL Resolvers

```typescript
// backend/src/graphql/resolvers/analyticsResolvers.ts
import { GraphQLError } from 'graphql';
import { googleAnalyticsService } from '../../services/GoogleAnalyticsService';

export const analyticsResolvers = {
  Query: {
    /**
     * Overview metrics with authentication
     */
    googleAnalyticsOverview: async (
      _: any,
      args: { period?: string },
      context: any
    ) => {
      // CRITICAL: Authentication check
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const period = (args.period || '30days') as '7days' | '30days' | '90days' | 'year';
      const { startDate, endDate } = googleAnalyticsService.getDateRange(period);
      const metrics = await googleAnalyticsService.getOverviewMetrics(startDate, endDate);

      return {
        ...metrics,
        period,
        startDate,
        endDate,
      };
    },

    /**
     * Time series data for charts
     */
    googleAnalyticsTimeSeries: async (
      _: any,
      args: { period?: string; metric?: string; granularity?: string },
      context: any
    ) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const period = (args.period || '30days') as '7days' | '30days' | '90days' | 'year';
      const metric = args.metric || 'sessions';
      const granularity = (args.granularity || 'day') as 'day' | 'week' | 'month';

      const { startDate, endDate } = googleAnalyticsService.getDateRange(period);
      const data = await googleAnalyticsService.getTimeSeries(
        startDate,
        endDate,
        metric,
        granularity
      );

      return {
        data,
        metric,
        granularity,
        startDate,
        endDate,
      };
    },

    /**
     * Top performing pages
     */
    googleAnalyticsTopPages: async (
      _: any,
      args: { period?: string; limit?: number },
      context: any
    ) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const period = (args.period || '30days') as '7days' | '30days' | '90days' | 'year';
      const limit = args.limit || 10;

      const { startDate, endDate } = googleAnalyticsService.getDateRange(period);
      return googleAnalyticsService.getTopPages(startDate, endDate, limit);
    },

    /**
     * Real-time metrics
     */
    googleAnalyticsRealTime: async (_: any, __: any, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return googleAnalyticsService.getRealTimeMetrics();
    },

    /**
     * E-commerce metrics
     */
    googleAnalyticsEcommerce: async (
      _: any,
      args: { period?: string },
      context: any
    ) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const period = (args.period || '30days') as '7days' | '30days' | '90days' | 'year';
      const { startDate, endDate } = googleAnalyticsService.getDateRange(period);
      const metrics = await googleAnalyticsService.getOverviewMetrics(startDate, endDate);

      // Calculate e-commerce specific metrics
      const conversionRate = metrics.sessions > 0
        ? (metrics.conversions / metrics.sessions) * 100
        : 0;

      const averageOrderValue = metrics.conversions > 0
        ? metrics.revenue / metrics.conversions
        : 0;

      return {
        transactions: metrics.conversions,
        revenue: metrics.revenue,
        averageOrderValue: safeNumber(averageOrderValue),
        conversionRate: safeNumber(conversionRate),
        period,
        startDate,
        endDate,
      };
    },
  },
};

// CRITICAL: Safe number utility for GraphQL Float fields
function safeNumber(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}
```

### 3. GraphQL Schema for Analytics

```graphql
# backend/src/graphql/schema/analytics.graphql

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

type TimeSeriesData {
  data: [TimeSeriesPoint!]!
  metric: String!
  granularity: String!
  startDate: String!
  endDate: String!
}

type TimeSeriesPoint {
  date: String!
  value: Float!
}

type TopPage {
  pagePath: String!
  pageTitle: String!
  pageviews: Int!
  avgTimeOnPage: Float!
  bounceRate: Float!
}

type RealTimeMetrics {
  activeUsers: Int!
  activeUsersByCountry: [CountryUsers!]!
  activeUsersByPage: [PageUsers!]!
}

type CountryUsers {
  country: String!
  users: Int!
}

type PageUsers {
  pagePath: String!
  pageTitle: String
  users: Int!
}

type EcommerceMetrics {
  transactions: Int!
  revenue: Float!
  averageOrderValue: Float!
  conversionRate: Float!
  period: String!
  startDate: String!
  endDate: String!
}

extend type Query {
  googleAnalyticsOverview(period: String): AnalyticsOverview! @auth
  googleAnalyticsTimeSeries(
    period: String
    metric: String
    granularity: String
  ): TimeSeriesData! @auth
  googleAnalyticsTopPages(period: String, limit: Int): [TopPage!]! @auth
  googleAnalyticsRealTime: RealTimeMetrics! @auth
  googleAnalyticsEcommerce(period: String): EcommerceMetrics! @auth
}
```

### 4. Frontend Analytics Hook

```typescript
// frontend/src/hooks/useGoogleAnalytics.ts
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useMemo } from 'react';

const GA_OVERVIEW_QUERY = gql`
  query GoogleAnalyticsOverview($period: String) {
    googleAnalyticsOverview(period: $period) {
      totalUsers
      newUsers
      sessions
      pageviews
      bounceRate
      sessionDuration
      conversions
      revenue
      period
      startDate
      endDate
    }
  }
`;

const GA_TIME_SERIES_QUERY = gql`
  query GoogleAnalyticsTimeSeries(
    $period: String
    $metric: String
    $granularity: String
  ) {
    googleAnalyticsTimeSeries(
      period: $period
      metric: $metric
      granularity: $granularity
    ) {
      data {
        date
        value
      }
      metric
      granularity
      startDate
      endDate
    }
  }
`;

const GA_REALTIME_QUERY = gql`
  query GoogleAnalyticsRealTime {
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
    }
  }
`;

export function useAnalyticsOverview(period: string = '30days') {
  const { data, loading, error, refetch } = useQuery(GA_OVERVIEW_QUERY, {
    variables: { period },
    fetchPolicy: 'cache-and-network',
  });

  return {
    data: data?.googleAnalyticsOverview,
    loading,
    error,
    refetch,
  };
}

export function useAnalyticsTimeSeries(options: {
  period?: string;
  metric?: string;
  granularity?: string;
}) {
  const { period = '30days', metric = 'sessions', granularity = 'day' } = options;

  const { data, loading, error, refetch } = useQuery(GA_TIME_SERIES_QUERY, {
    variables: { period, metric, granularity },
    fetchPolicy: 'cache-and-network',
  });

  const chartData = useMemo(() => {
    if (!data?.googleAnalyticsTimeSeries?.data) return [];
    return data.googleAnalyticsTimeSeries.data.map((point: any) => ({
      date: formatChartDate(point.date, granularity),
      value: point.value,
    }));
  }, [data, granularity]);

  return {
    data: chartData,
    rawData: data?.googleAnalyticsTimeSeries,
    loading,
    error,
    refetch,
  };
}

export function useRealTimeAnalytics() {
  const { data, loading, error, refetch } = useQuery(GA_REALTIME_QUERY, {
    pollInterval: 30000, // Update every 30 seconds
    fetchPolicy: 'network-only',
  });

  return {
    data: data?.googleAnalyticsRealTime,
    loading,
    error,
    refetch,
  };
}

function formatChartDate(dateStr: string, granularity: string): string {
  const date = new Date(dateStr);
  switch (granularity) {
    case 'month':
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    case 'week':
      return `W${getWeekNumber(date)}`;
    default:
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

function getWeekNumber(date: Date): number {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - firstDay.getTime()) / 86400000);
  return Math.ceil((days + firstDay.getDay() + 1) / 7);
}
```

### 5. Client-Side Event Tracking

```typescript
// frontend/src/lib/analytics.ts

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Initialize Google Analytics
 */
export function initGA(): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
  });
}

/**
 * Track page views
 */
export function pageview(url: string): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
}

/**
 * Track custom events
 */
export function event(
  action: string,
  params?: {
    category?: string;
    label?: string;
    value?: number;
    [key: string]: any;
  }
): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return;

  window.gtag('event', action, params);
}

/**
 * E-commerce: View item
 */
export function viewItem(item: {
  id: string;
  name: string;
  category?: string;
  price: number;
  currency?: string;
}): void {
  event('view_item', {
    currency: item.currency || 'USD',
    value: item.price,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
      },
    ],
  });
}

/**
 * E-commerce: Add to cart
 */
export function addToCart(item: {
  id: string;
  name: string;
  category?: string;
  price: number;
  quantity: number;
  currency?: string;
}): void {
  event('add_to_cart', {
    currency: item.currency || 'USD',
    value: item.price * item.quantity,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: item.quantity,
      },
    ],
  });
}

/**
 * E-commerce: Begin checkout
 */
export function beginCheckout(params: {
  value: number;
  currency?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}): void {
  event('begin_checkout', {
    currency: params.currency || 'USD',
    value: params.value,
    items: params.items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
}

/**
 * E-commerce: Purchase
 */
export function purchase(params: {
  transactionId: string;
  value: number;
  currency?: string;
  shipping?: number;
  tax?: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}): void {
  event('purchase', {
    transaction_id: params.transactionId,
    currency: params.currency || 'USD',
    value: params.value,
    shipping: params.shipping || 0,
    tax: params.tax || 0,
    items: params.items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
}

/**
 * Track search
 */
export function search(searchTerm: string): void {
  event('search', {
    search_term: searchTerm,
  });
}

/**
 * Track user sign up
 */
export function signUp(method: string = 'email'): void {
  event('sign_up', {
    method,
  });
}

/**
 * Track user login
 */
export function login(method: string = 'email'): void {
  event('login', {
    method,
  });
}
```

### 6. Analytics Provider Component

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
    initGA();
  }, []);

  useEffect(() => {
    if (pathname) {
      const url = searchParams?.size
        ? `${pathname}?${searchParams.toString()}`
        : pathname;
      pageview(url);
    }
  }, [pathname, searchParams]);

  if (!GA_MEASUREMENT_ID) {
    return <>{children}</>;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      {children}
    </>
  );
}
```

## Environment Variables

```bash
# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
GA4_PROPERTY_ID=123456789

# Service Account (for Data API)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
# OR as JSON string
GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account",...}'
```

## Implementation Checklist

### Backend
- [ ] GoogleAnalyticsService with rate limiting
- [ ] Circuit breaker for API resilience
- [ ] Caching layer with TTL
- [ ] GraphQL resolvers with authentication
- [ ] Safe number calculations for Float fields
- [ ] Fallback data when GA4 unavailable

### Frontend
- [ ] Analytics provider component
- [ ] Page view tracking on route change
- [ ] E-commerce event tracking functions
- [ ] Custom hooks for analytics data
- [ ] Chart data transformation utilities

### Configuration
- [ ] GA4 property setup
- [ ] Service account credentials
- [ ] Data API access enabled
- [ ] Environment variables configured

## Related Commands

- `/implement-analytics` - Full analytics implementation
- `/implement-admin-dashboard` - Dashboard with analytics integration

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-15 | Initial release from DreamiHairCare patterns |
