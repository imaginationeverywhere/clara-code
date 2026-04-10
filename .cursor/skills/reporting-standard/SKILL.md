---
name: reporting-standard
description: Implement business reporting with sales analytics, CSV export, growth calculations, and report generation. Use when building admin reports, sales dashboards, export functionality, or analytics views. Triggers on requests for sales reports, CSV export, analytics dashboards, or business metrics.
---

# Reporting Standard

Production-grade business reporting patterns from DreamiHairCare implementation with sales analytics, CSV export to S3, growth calculations, and comprehensive report generation.

## Skill Metadata

- **Name:** reporting-standard
- **Version:** 1.0.0
- **Category:** Admin & Analytics
- **Source:** DreamiHairCare Production Implementation
- **Related Skills:** admin-dashboard-standard, analytics-tracking-standard

## When to Use This Skill

Use this skill when:
- Building sales analytics reporting systems
- Implementing CSV/Excel export functionality
- Creating report generation workflows
- Implementing growth calculations with NaN protection
- Building time-granular analytics (hour, day, week, month)
- Setting up S3-based file export with presigned URLs

## Core Patterns

### 1. Sales Analytics Resolvers

```typescript
// backend/src/graphql/resolvers/salesAnalyticsResolvers.ts
import { GraphQLError } from 'graphql';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { Op, fn, col, literal } from 'sequelize';

// CRITICAL: Safe number utility for GraphQL Float fields
function safeNumber(value: number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return num;
}

// Growth calculation with zero division protection
function calculateGrowthPercentage(current: number, previous: number): number {
  const curr = safeNumber(current);
  const prev = safeNumber(previous);

  if (prev === 0) {
    return curr > 0 ? 100 : 0;
  }

  const growth = ((curr - prev) / prev) * 100;
  return safeNumber(growth);
}

// Trend direction from growth percentage
function getTrendDirection(growth: number): 'UP' | 'DOWN' | 'NEUTRAL' {
  if (growth > 1) return 'UP';
  if (growth < -1) return 'DOWN';
  return 'NEUTRAL';
}

// Date range generator based on granularity
function getDateRangeAndGranularity(
  startDate: string,
  endDate: string,
  granularity: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
): { groupBy: string; dateFormat: string } {
  switch (granularity) {
    case 'hour':
      return {
        groupBy: "date_trunc('hour', \"createdAt\")",
        dateFormat: 'YYYY-MM-DD HH24:00',
      };
    case 'day':
      return {
        groupBy: "date_trunc('day', \"createdAt\")",
        dateFormat: 'YYYY-MM-DD',
      };
    case 'week':
      return {
        groupBy: "date_trunc('week', \"createdAt\")",
        dateFormat: 'YYYY-\"W\"IW',
      };
    case 'month':
      return {
        groupBy: "date_trunc('month', \"createdAt\")",
        dateFormat: 'YYYY-MM',
      };
    case 'quarter':
      return {
        groupBy: "date_trunc('quarter', \"createdAt\")",
        dateFormat: 'YYYY-\"Q\"Q',
      };
    case 'year':
      return {
        groupBy: "date_trunc('year', \"createdAt\")",
        dateFormat: 'YYYY',
      };
  }
}

export const salesAnalyticsResolvers = {
  Query: {
    /**
     * Comprehensive sales analytics with filters
     */
    salesAnalytics: async (
      _: any,
      args: {
        filters?: {
          startDate?: string;
          endDate?: string;
          granularity?: string;
          productIds?: string[];
          channelIds?: string[];
          status?: string[];
        };
      },
      context: any
    ) => {
      // CRITICAL: Authentication check
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const filters = args.filters || {};
      const granularity = (filters.granularity || 'day') as any;

      // Default to last 30 days
      const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
      const startDate = filters.startDate
        ? new Date(filters.startDate)
        : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Previous period for comparison
      const periodLength = endDate.getTime() - startDate.getTime();
      const prevEndDate = new Date(startDate.getTime() - 1);
      const prevStartDate = new Date(prevEndDate.getTime() - periodLength);

      // Build where clause
      const whereClause: any = {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
        status: {
          [Op.notIn]: ['CANCELLED', 'REFUNDED'],
        },
      };

      if (filters.productIds?.length) {
        whereClause['$items.productId$'] = { [Op.in]: filters.productIds };
      }

      if (filters.status?.length) {
        whereClause.status = { [Op.in]: filters.status };
      }

      // Calculate overview
      const overview = await calculateSalesOverview(
        whereClause,
        startDate,
        endDate,
        prevStartDate,
        prevEndDate
      );

      // Time series data
      const salesOverTime = await calculateSalesOverTime(
        whereClause,
        granularity
      );

      // Sales by channel
      const salesByChannel = await calculateSalesByChannel(whereClause);

      // Sales by product
      const salesByProduct = await calculateSalesByProduct(whereClause);

      return {
        overview,
        salesOverTime,
        salesByChannel,
        salesByProduct,
        filters: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          granularity,
        },
      };
    },

    /**
     * Export sales data to CSV
     */
    exportSalesData: async (
      _: any,
      args: {
        filters?: {
          startDate?: string;
          endDate?: string;
        };
        format?: string;
      },
      context: any
    ) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const filters = args.filters || {};
      const format = args.format || 'csv';
      const exportId = uuidv4();

      // Get sales data
      const salesData = await getSalesDataForExport(filters);

      // Generate CSV
      const csv = generateSalesCsv(salesData);

      // Upload to S3
      const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
      const bucket = process.env.AWS_S3_EXPORTS_BUCKET || 'exports';
      const key = `exports/sales/${exportId}.csv`;

      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: Buffer.from(csv, 'utf8'),
          ContentType: 'text/csv',
          ContentDisposition: `attachment; filename="sales-report-${new Date().toISOString().split('T')[0]}.csv"`,
        })
      );

      // Generate presigned URL (expires in 1 hour)
      const downloadUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: bucket, Key: key }),
        { expiresIn: 60 * 60 }
      );

      const now = new Date();
      return {
        id: exportId,
        format,
        status: 'READY',
        downloadUrl,
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
      };
    },
  },
};

/**
 * Calculate sales overview metrics
 */
async function calculateSalesOverview(
  whereClause: any,
  startDate: Date,
  endDate: Date,
  prevStartDate: Date,
  prevEndDate: Date
): Promise<{
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  averageOrderValue: number;
  aovGrowth: number;
  totalUnits: number;
  unitsGrowth: number;
  trendDirection: string;
}> {
  // Current period
  const currentOrders = await Order.findAll({
    where: whereClause,
    include: [{ model: OrderItem, as: 'items' }],
  });

  // Previous period
  const prevWhereClause = {
    ...whereClause,
    createdAt: { [Op.between]: [prevStartDate, prevEndDate] },
  };
  const previousOrders = await Order.findAll({
    where: prevWhereClause,
    include: [{ model: OrderItem, as: 'items' }],
  });

  // Current metrics
  const totalRevenue = currentOrders.reduce(
    (sum, o) => sum + safeNumber(o.total),
    0
  );
  const totalOrders = currentOrders.length;
  const totalUnits = currentOrders.reduce(
    (sum, o) => sum + (o.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0),
    0
  );
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Previous metrics
  const prevRevenue = previousOrders.reduce(
    (sum, o) => sum + safeNumber(o.total),
    0
  );
  const prevOrders = previousOrders.length;
  const prevUnits = previousOrders.reduce(
    (sum, o) => sum + (o.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0),
    0
  );
  const prevAOV = prevOrders > 0 ? prevRevenue / prevOrders : 0;

  // Calculate growth
  const revenueGrowth = calculateGrowthPercentage(totalRevenue, prevRevenue);
  const ordersGrowth = calculateGrowthPercentage(totalOrders, prevOrders);
  const aovGrowth = calculateGrowthPercentage(averageOrderValue, prevAOV);
  const unitsGrowth = calculateGrowthPercentage(totalUnits, prevUnits);

  return {
    totalRevenue: safeNumber(totalRevenue),
    revenueGrowth: safeNumber(revenueGrowth),
    totalOrders,
    ordersGrowth: safeNumber(ordersGrowth),
    averageOrderValue: safeNumber(averageOrderValue),
    aovGrowth: safeNumber(aovGrowth),
    totalUnits,
    unitsGrowth: safeNumber(unitsGrowth),
    trendDirection: getTrendDirection(revenueGrowth),
  };
}

/**
 * Calculate sales over time for charts
 */
async function calculateSalesOverTime(
  whereClause: any,
  granularity: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
): Promise<Array<{
  date: string;
  revenue: number;
  orders: number;
  units: number;
}>> {
  const { groupBy, dateFormat } = getDateRangeAndGranularity('', '', granularity);

  const results = await Order.findAll({
    where: whereClause,
    attributes: [
      [literal(`to_char(${groupBy}, '${dateFormat}')`), 'period'],
      [fn('SUM', col('total')), 'revenue'],
      [fn('COUNT', col('id')), 'orders'],
    ],
    group: [literal(groupBy)],
    order: [[literal(groupBy), 'ASC']],
    raw: true,
  });

  return results.map((row: any) => ({
    date: row.period,
    revenue: safeNumber(row.revenue),
    orders: parseInt(row.orders) || 0,
    units: 0, // Would need separate query with OrderItems
  }));
}

/**
 * Calculate sales by channel
 */
async function calculateSalesByChannel(
  whereClause: any
): Promise<Array<{
  channelId: string;
  channelName: string;
  revenue: number;
  orders: number;
  percentage: number;
}>> {
  const results = await Order.findAll({
    where: whereClause,
    attributes: [
      'channel',
      [fn('SUM', col('total')), 'revenue'],
      [fn('COUNT', col('id')), 'orders'],
    ],
    group: ['channel'],
    raw: true,
  });

  const totalRevenue = results.reduce(
    (sum: number, r: any) => sum + safeNumber(r.revenue),
    0
  );

  return results.map((row: any) => ({
    channelId: row.channel || 'direct',
    channelName: formatChannelName(row.channel),
    revenue: safeNumber(row.revenue),
    orders: parseInt(row.orders) || 0,
    percentage: totalRevenue > 0
      ? safeNumber((safeNumber(row.revenue) / totalRevenue) * 100)
      : 0,
  }));
}

/**
 * Calculate sales by product
 */
async function calculateSalesByProduct(
  whereClause: any
): Promise<Array<{
  productId: string;
  productName: string;
  revenue: number;
  units: number;
  percentage: number;
}>> {
  const results = await OrderItem.findAll({
    include: [
      {
        model: Order,
        as: 'order',
        where: whereClause,
        attributes: [],
      },
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'name'],
      },
    ],
    attributes: [
      'productId',
      [fn('SUM', literal('"OrderItem"."price" * "OrderItem"."quantity"')), 'revenue'],
      [fn('SUM', col('quantity')), 'units'],
    ],
    group: ['productId', 'product.id', 'product.name'],
    raw: true,
    nest: true,
  });

  const totalRevenue = results.reduce(
    (sum: number, r: any) => sum + safeNumber(r.revenue),
    0
  );

  return results.map((row: any) => ({
    productId: row.productId,
    productName: row.product?.name || 'Unknown Product',
    revenue: safeNumber(row.revenue),
    units: parseInt(row.units) || 0,
    percentage: totalRevenue > 0
      ? safeNumber((safeNumber(row.revenue) / totalRevenue) * 100)
      : 0,
  }));
}

/**
 * Generate CSV content from sales data
 */
function generateSalesCsv(data: {
  overview: any;
  salesOverTime: any[];
  salesByChannel: any[];
  salesByProduct: any[];
  filters: any;
}): string {
  const lines: string[] = [];

  // Header section
  lines.push('Sales Report');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Period: ${data.filters.startDate} to ${data.filters.endDate}`);
  lines.push('');

  // Overview section
  lines.push('OVERVIEW');
  lines.push('Metric,Value,Growth %');
  lines.push(`Total Revenue,$${data.overview.totalRevenue.toFixed(2)},${data.overview.revenueGrowth.toFixed(1)}%`);
  lines.push(`Total Orders,${data.overview.totalOrders},${data.overview.ordersGrowth.toFixed(1)}%`);
  lines.push(`Average Order Value,$${data.overview.averageOrderValue.toFixed(2)},${data.overview.aovGrowth.toFixed(1)}%`);
  lines.push(`Total Units,${data.overview.totalUnits},${data.overview.unitsGrowth.toFixed(1)}%`);
  lines.push('');

  // Sales over time
  lines.push('SALES OVER TIME');
  lines.push('Date,Revenue,Orders');
  data.salesOverTime.forEach((row) => {
    lines.push(`${row.date},$${row.revenue.toFixed(2)},${row.orders}`);
  });
  lines.push('');

  // Sales by channel
  lines.push('SALES BY CHANNEL');
  lines.push('Channel,Revenue,Orders,Percentage');
  data.salesByChannel.forEach((row) => {
    lines.push(`${row.channelName},$${row.revenue.toFixed(2)},${row.orders},${row.percentage.toFixed(1)}%`);
  });
  lines.push('');

  // Sales by product
  lines.push('SALES BY PRODUCT');
  lines.push('Product,Revenue,Units,Percentage');
  data.salesByProduct.forEach((row) => {
    lines.push(`"${row.productName}",$${row.revenue.toFixed(2)},${row.units},${row.percentage.toFixed(1)}%`);
  });

  return lines.join('\n');
}

function formatChannelName(channel: string | null): string {
  const channelMap: Record<string, string> = {
    direct: 'Direct',
    organic: 'Organic Search',
    paid: 'Paid Advertising',
    social: 'Social Media',
    email: 'Email Marketing',
    referral: 'Referral',
  };
  return channelMap[channel || 'direct'] || channel || 'Direct';
}

async function getSalesDataForExport(filters: any) {
  // Implementation to fetch sales data with filters
  // Returns data structure for CSV generation
  return {
    overview: {},
    salesOverTime: [],
    salesByChannel: [],
    salesByProduct: [],
    filters,
  };
}
```

### 2. GraphQL Schema for Reporting

```graphql
# backend/src/graphql/schema/reporting.graphql

enum TrendDirection {
  UP
  DOWN
  NEUTRAL
}

enum TimeGranularity {
  hour
  day
  week
  month
  quarter
  year
}

enum ExportFormat {
  csv
  excel
  pdf
  json
}

enum ExportStatus {
  PENDING
  PROCESSING
  READY
  FAILED
  EXPIRED
}

type SalesOverview {
  totalRevenue: Float!
  revenueGrowth: Float!
  totalOrders: Int!
  ordersGrowth: Float!
  averageOrderValue: Float!
  aovGrowth: Float!
  totalUnits: Int!
  unitsGrowth: Float!
  trendDirection: TrendDirection!
}

type SalesTimePoint {
  date: String!
  revenue: Float!
  orders: Int!
  units: Int!
}

type SalesByChannel {
  channelId: String!
  channelName: String!
  revenue: Float!
  orders: Int!
  percentage: Float!
}

type SalesByProduct {
  productId: String!
  productName: String!
  revenue: Float!
  units: Int!
  percentage: Float!
}

type SalesFilters {
  startDate: String!
  endDate: String!
  granularity: TimeGranularity!
}

type SalesAnalytics {
  overview: SalesOverview!
  salesOverTime: [SalesTimePoint!]!
  salesByChannel: [SalesByChannel!]!
  salesByProduct: [SalesByProduct!]!
  filters: SalesFilters!
}

input SalesFiltersInput {
  startDate: String
  endDate: String
  granularity: TimeGranularity
  productIds: [String!]
  channelIds: [String!]
  status: [String!]
}

type ExportResult {
  id: String!
  format: ExportFormat!
  status: ExportStatus!
  downloadUrl: String
  createdAt: DateTime!
  expiresAt: DateTime
  error: String
}

extend type Query {
  salesAnalytics(filters: SalesFiltersInput): SalesAnalytics! @auth
  exportSalesData(filters: SalesFiltersInput, format: ExportFormat): ExportResult! @auth
}
```

### 3. Report Generation UI Component

```typescript
// frontend/src/components/admin/ReportGenerator.tsx
'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  DocumentTextIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  PlayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const EXPORT_SALES_DATA = gql`
  mutation ExportSalesData($filters: SalesFiltersInput, $format: ExportFormat) {
    exportSalesData(filters: $filters, format: $format) {
      id
      format
      status
      downloadUrl
      createdAt
      expiresAt
      error
    }
  }
`;

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  metrics: string[];
}

const reportTypes: ReportType[] = [
  {
    id: 'revenue',
    name: 'Revenue Report',
    description: 'Comprehensive revenue analytics and trends',
    icon: DocumentTextIcon,
    metrics: ['Total Revenue', 'Revenue by Product', 'Revenue Trends', 'Revenue Growth'],
  },
  {
    id: 'customer',
    name: 'Customer Analytics',
    description: 'Customer behavior, demographics, and lifecycle',
    icon: DocumentTextIcon,
    metrics: ['Customer Acquisition', 'Customer Retention', 'Customer LTV', 'Demographics'],
  },
  {
    id: 'product',
    name: 'Product Performance',
    description: 'Product sales, popularity, and inventory insights',
    icon: DocumentTextIcon,
    metrics: ['Top Products', 'Product Trends', 'Inventory Analysis', 'Product ROI'],
  },
];

export const ReportGenerator: React.FC = () => {
  const [selectedReportType, setSelectedReportType] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf' | 'json'>('csv');
  const [generatedReports, setGeneratedReports] = useState<any[]>([]);

  const [exportSalesData, { loading: isGenerating }] = useMutation(EXPORT_SALES_DATA, {
    onCompleted: (data) => {
      const report = data.exportSalesData;
      setGeneratedReports((prev) => [
        {
          ...report,
          name: `${reportTypes.find(t => t.id === selectedReportType)?.name} - ${new Date().toLocaleDateString()}`,
          type: selectedReportType,
        },
        ...prev,
      ]);

      // Reset form
      setSelectedReportType('');
      setDateRange({ start: '', end: '' });
    },
    onError: (error) => {
      console.error('Export error:', error);
      alert(`Failed to generate report: ${error.message}`);
    },
  });

  const handleGenerateReport = () => {
    if (!selectedReportType || !dateRange.start || !dateRange.end) {
      alert('Please select a report type and date range');
      return;
    }

    exportSalesData({
      variables: {
        filters: {
          startDate: dateRange.start,
          endDate: dateRange.end,
        },
        format: exportFormat,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Report Type Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Generate New Report</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Select Report Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reportTypes.map((type) => (
              <div
                key={type.id}
                onClick={() => setSelectedReportType(type.id)}
                className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                  selectedReportType === type.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-3">
                  <type.icon className="h-6 w-6 text-purple-600 mr-3" />
                  <h3 className="font-semibold text-gray-900">{type.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                <div className="flex flex-wrap gap-1">
                  {type.metrics.slice(0, 2).map((metric) => (
                    <span
                      key={metric}
                      className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                    >
                      {metric}
                    </span>
                  ))}
                  {type.metrics.length > 2 && (
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      +{type.metrics.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Date Range and Format */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 pl-10"
              />
              <CalendarIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 pl-10"
              />
              <CalendarIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="csv">CSV Data</option>
              <option value="excel">Excel Workbook</option>
              <option value="pdf">PDF Report</option>
              <option value="json">JSON Data</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateReport}
          disabled={isGenerating || !selectedReportType || !dateRange.start || !dateRange.end}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
        >
          {isGenerating ? (
            <>
              <ClockIcon className="h-5 w-5 mr-2 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <PlayIcon className="h-5 w-5 mr-2" />
              Generate Report
            </>
          )}
        </button>
      </div>

      {/* Generated Reports List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Reports</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Report Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Format</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {generatedReports.length > 0 ? (
                  generatedReports.map((report) => (
                    <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900">{report.name}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600 uppercase">{report.format}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          {report.status === 'READY' ? (
                            <>
                              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm text-green-600">Ready</span>
                            </>
                          ) : report.status === 'FAILED' ? (
                            <>
                              <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-2" />
                              <span className="text-sm text-red-600">Failed</span>
                            </>
                          ) : (
                            <>
                              <ClockIcon className="h-4 w-4 text-yellow-500 mr-2 animate-spin" />
                              <span className="text-sm text-yellow-600">Processing</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {new Date(report.createdAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        {report.status === 'READY' && report.downloadUrl && (
                          <a
                            href={report.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-700 flex items-center text-sm"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 px-4 text-center">
                      <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No reports generated yet</p>
                      <p className="text-gray-400 text-sm mt-1">
                        Create your first report using the form above
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 4. Report Generation Hook

```typescript
// frontend/src/hooks/useReportGenerator.ts
import { useState, useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

const EXPORT_SALES_DATA_MUTATION = gql`
  mutation ExportSalesData($filters: SalesFiltersInput, $format: ExportFormat) {
    exportSalesData(filters: $filters, format: $format) {
      id
      format
      status
      downloadUrl
      createdAt
      expiresAt
      error
    }
  }
`;

interface ExportFilters {
  startDate: string;
  endDate: string;
  productIds?: string[];
  channelIds?: string[];
}

interface ExportResult {
  id: string;
  format: string;
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED' | 'EXPIRED';
  downloadUrl?: string;
  createdAt: string;
  expiresAt?: string;
  error?: string;
}

export function useReportGenerator() {
  const [reports, setReports] = useState<ExportResult[]>([]);

  const [exportMutation, { loading }] = useMutation(EXPORT_SALES_DATA_MUTATION);

  const generateReport = useCallback(
    async (
      filters: ExportFilters,
      format: 'csv' | 'excel' | 'pdf' | 'json' = 'csv'
    ): Promise<ExportResult | null> => {
      try {
        const { data } = await exportMutation({
          variables: { filters, format },
        });

        const result = data?.exportSalesData;
        if (result) {
          setReports((prev) => [result, ...prev]);
          return result;
        }
        return null;
      } catch (error) {
        console.error('Report generation failed:', error);
        return null;
      }
    },
    [exportMutation]
  );

  const downloadReport = useCallback((report: ExportResult) => {
    if (report.downloadUrl && report.status === 'READY') {
      window.open(report.downloadUrl, '_blank');
    }
  }, []);

  const clearReports = useCallback(() => {
    setReports([]);
  }, []);

  return {
    reports,
    loading,
    generateReport,
    downloadReport,
    clearReports,
  };
}
```

## Environment Variables

```bash
# AWS S3 for exports
AWS_REGION=us-east-1
AWS_S3_EXPORTS_BUCKET=your-app-exports
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# Export settings
EXPORT_URL_EXPIRY_HOURS=1
MAX_EXPORT_ROWS=100000
```

## Implementation Checklist

### Backend
- [ ] Sales analytics resolvers with NaN protection
- [ ] Growth calculation functions
- [ ] Time granularity support (hour to year)
- [ ] CSV generation utility
- [ ] S3 export with presigned URLs
- [ ] GraphQL schema with proper types

### Frontend
- [ ] Report type selection UI
- [ ] Date range picker
- [ ] Export format selector
- [ ] Report generation status tracking
- [ ] Download functionality
- [ ] Report history display

### Infrastructure
- [ ] S3 bucket for exports
- [ ] IAM permissions for S3 access
- [ ] Presigned URL configuration
- [ ] Export cleanup policy (lifecycle rules)

## Related Commands

- `/implement-admin-dashboard` - Full admin dashboard with reporting
- `/implement-analytics` - Analytics tracking setup

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-15 | Initial release from DreamiHairCare patterns |
