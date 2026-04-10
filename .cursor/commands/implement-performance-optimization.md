# Implement Performance Optimization

Set up comprehensive performance optimization for frontend (Core Web Vitals, code splitting, image optimization) and backend (DataLoader, query optimization, caching) following DreamiHairCare's production-tested patterns.

## Command Usage

```
/implement-performance-optimization [options]
```

### Options
- `--full` - Complete optimization setup (default)
- `--frontend` - Frontend-only optimization
- `--backend` - Backend-only optimization
- `--audit` - Audit current performance
- `--lighthouse` - Run Lighthouse CI audit

### Focus Areas
- `--images` - Image optimization only
- `--bundle` - Bundle size optimization only
- `--queries` - Database query optimization only
- `--caching` - Caching setup only

## Pre-Implementation Checklist

### Requirements
- [ ] Next.js 16 frontend configured
- [ ] Express.js/Apollo backend configured
- [ ] PostgreSQL database accessible
- [ ] Node.js 18+ installed

### Dependencies

**Frontend:**
```bash
cd frontend
npm install web-vitals @tanstack/react-virtual
npm install -D @next/bundle-analyzer lighthouse
```

**Backend:**
```bash
cd backend
npm install dataloader ioredis lru-cache
npm install -D @types/ioredis
```

## Implementation Phases

### Phase 1: Frontend - Core Web Vitals Setup

#### 1.1 Web Vitals Tracking
```typescript
// frontend/src/lib/vitals.ts
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

export function reportWebVitals(metric: any): void {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    id: metric.id,
    page: window.location.pathname,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/vitals', body);
  } else {
    fetch('/api/vitals', { body, method: 'POST', keepalive: true });
  }
}

export function initWebVitals(): void {
  getCLS(reportWebVitals);
  getFID(reportWebVitals);
  getLCP(reportWebVitals);
  getFCP(reportWebVitals);
  getTTFB(reportWebVitals);
}
```

#### 1.2 Initialize in Layout
```typescript
// frontend/src/app/layout.tsx
'use client';

import { useEffect } from 'react';
import { initWebVitals } from '@/lib/vitals';

export default function RootLayout({ children }) {
  useEffect(() => {
    initWebVitals();
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Phase 2: Frontend - Image Optimization

#### 2.1 Create Optimized Image Component
```typescript
// frontend/src/components/ui/OptimizedImage.tsx
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className,
  sizes = '100vw',
}: OptimizedImageProps) {
  // Generate blur placeholder for local images
  const blurDataURL = src.startsWith('/')
    ? `data:image/svg+xml;base64,${Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect fill="#e2e8f0" width="8" height="8"/></svg>`
      ).toString('base64')}`
    : undefined;

  return (
    <Image
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      priority={priority}
      quality={85}
      placeholder={blurDataURL ? 'blur' : 'empty'}
      blurDataURL={blurDataURL}
      sizes={sizes}
      className={cn('object-cover', className)}
    />
  );
}
```

#### 2.2 Hero Image Pattern
```typescript
// frontend/src/components/HeroSection.tsx
import { OptimizedImage } from '@/components/ui/OptimizedImage';

export function HeroSection({ imageUrl, title }: Props) {
  return (
    <section className="relative h-[500px] w-full">
      <OptimizedImage
        src={imageUrl}
        alt={title}
        fill
        priority  // CRITICAL: Preload LCP image
        sizes="100vw"
        className="brightness-75"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-4xl font-bold text-white">{title}</h1>
      </div>
    </section>
  );
}
```

### Phase 3: Frontend - Code Splitting

#### 3.1 Dynamic Imports for Heavy Components
```typescript
// frontend/src/components/lazy/index.ts
import dynamic from 'next/dynamic';

// Heavy chart library
export const Chart = dynamic(
  () => import('@/components/charts/Chart'),
  {
    loading: () => <div className="h-64 animate-pulse bg-gray-200" />,
    ssr: false,
  }
);

// Admin dashboard (admin-only)
export const AdminDashboard = dynamic(
  () => import('@/components/admin/Dashboard'),
  {
    loading: () => <div className="h-screen animate-pulse bg-gray-100" />,
  }
);

// PDF generator
export const PDFGenerator = dynamic(
  () => import('@/components/pdf/Generator'),
  {
    ssr: false,
  }
);
```

#### 3.2 Route-Based Splitting (Automatic with App Router)
```
frontend/src/app/
├── page.tsx                    # Main bundle
├── products/
│   └── page.tsx               # Products chunk
├── admin/
│   ├── layout.tsx             # Admin layout chunk
│   └── page.tsx               # Admin chunk
└── checkout/
    └── page.tsx               # Checkout chunk
```

### Phase 4: Frontend - Bundle Analysis

#### 4.1 Configure Bundle Analyzer
```javascript
// frontend/next.config.mjs
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer({
  images: {
    remotePatterns: [
      { hostname: 'your-cdn.com' },
    ],
  },
  experimental: {
    optimizeCss: true,
  },
});
```

#### 4.2 Add npm Scripts
```json
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build",
    "lighthouse": "lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-report.json"
  }
}
```

### Phase 5: Backend - DataLoader Setup

#### 5.1 Create DataLoaders
```typescript
// backend/src/graphql/loaders/index.ts
import DataLoader from 'dataloader';
import { Op } from 'sequelize';
import { User, Product, Order } from '@/models';

export function createUserLoader() {
  return new DataLoader<string, User | null>(async (ids) => {
    const users = await User.findAll({
      where: { id: { [Op.in]: ids as string[] } },
    });
    const userMap = new Map(users.map(u => [u.id, u]));
    return ids.map(id => userMap.get(id) || null);
  });
}

export function createProductLoader() {
  return new DataLoader<string, Product | null>(async (ids) => {
    const products = await Product.findAll({
      where: { id: { [Op.in]: ids as string[] } },
    });
    const productMap = new Map(products.map(p => [p.id, p]));
    return ids.map(id => productMap.get(id) || null);
  });
}

export function createOrdersByUserLoader() {
  return new DataLoader<string, Order[]>(async (userIds) => {
    const orders = await Order.findAll({
      where: { user_id: { [Op.in]: userIds as string[] } },
      order: [['created_at', 'DESC']],
    });

    const ordersByUser = new Map<string, Order[]>();
    for (const order of orders) {
      const userOrders = ordersByUser.get(order.user_id) || [];
      userOrders.push(order);
      ordersByUser.set(order.user_id, userOrders);
    }

    return userIds.map(id => ordersByUser.get(id) || []);
  });
}
```

#### 5.2 Add to GraphQL Context
```typescript
// backend/src/graphql/context.ts
import { createUserLoader, createProductLoader, createOrdersByUserLoader } from './loaders';

export function createContext({ req }) {
  return {
    auth: extractAuth(req),
    loaders: {
      users: createUserLoader(),
      products: createProductLoader(),
      ordersByUser: createOrdersByUserLoader(),
    },
  };
}
```

#### 5.3 Use in Resolvers
```typescript
// backend/src/graphql/resolvers/Order.ts
export const OrderResolvers = {
  Order: {
    user: (parent, _, context) => context.loaders.users.load(parent.user_id),
  },
  User: {
    orders: (parent, _, context) => context.loaders.ordersByUser.load(parent.id),
  },
};
```

### Phase 6: Backend - Query Complexity

#### 6.1 Add Complexity Limits
```typescript
// backend/src/graphql/complexity.ts
import { createComplexityRule, simpleEstimator } from 'graphql-query-complexity';

export const complexityRule = createComplexityRule({
  maximumComplexity: 1000,
  estimators: [
    simpleEstimator({ defaultComplexity: 1 }),
  ],
  onComplete: (complexity) => {
    console.log('Query Complexity:', complexity);
  },
});
```

### Phase 7: Backend - Database Indexes

#### 7.1 Create Index Migration
```bash
cd backend
npx sequelize-cli migration:generate --name add-performance-indexes
```

#### 7.2 Add Essential Indexes
```javascript
// backend/migrations/YYYYMMDD-add-performance-indexes.js
module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Tenant isolation indexes
      await queryInterface.addIndex('users', ['tenant_id'], { transaction });
      await queryInterface.addIndex('orders', ['tenant_id', 'user_id'], { transaction });
      await queryInterface.addIndex('products', ['tenant_id', 'category_id'], { transaction });

      // Status and date indexes
      await queryInterface.addIndex('orders', ['tenant_id', 'status', 'created_at'], { transaction });

      // Search indexes
      await queryInterface.addIndex('products', ['name'], { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('users', ['tenant_id']);
    await queryInterface.removeIndex('orders', ['tenant_id', 'user_id']);
    await queryInterface.removeIndex('products', ['tenant_id', 'category_id']);
    await queryInterface.removeIndex('orders', ['tenant_id', 'status', 'created_at']);
    await queryInterface.removeIndex('products', ['name']);
  },
};
```

### Phase 8: Lighthouse CI Setup

#### 8.1 Create Lighthouse Config
```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/products"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }]
      }
    }
  }
}
```

#### 8.2 GitHub Actions Workflow
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
    branches: [main, develop]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install and build
        run: |
          npm ci
          npm run build

      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v10
        with:
          configPath: './lighthouserc.json'
          uploadArtifacts: true
```

## Verification Checklist

### Frontend
- [ ] Web Vitals tracking configured
- [ ] LCP < 2.5s on key pages
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] All images use next/image
- [ ] Hero images have priority attribute
- [ ] Heavy components dynamically imported
- [ ] Bundle size < 200KB initial
- [ ] Lighthouse score > 90

### Backend
- [ ] DataLoaders created for all relations
- [ ] No N+1 queries in resolvers
- [ ] Query complexity limits configured
- [ ] Essential indexes added
- [ ] Caching layer configured
- [ ] Slow query logging enabled

### Monitoring
- [ ] Web Vitals reported to analytics
- [ ] Lighthouse CI in GitHub Actions
- [ ] Cache hit rate monitored
- [ ] Query performance logged

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| LCP | < 2.5s | Lighthouse |
| FID | < 100ms | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| TTI | < 3.0s | Lighthouse |
| Bundle Size | < 200KB | Bundle Analyzer |
| API Response | < 200ms | Server logs |
| Cache Hit Rate | > 80% | Cache stats |
| Query Time | < 100ms | Query logs |

## Troubleshooting

### High LCP
- Check hero image has `priority` attribute
- Verify fonts use `display: swap`
- Check for blocking resources
- Use Lighthouse to identify specific issues

### High CLS
- Add width/height to images
- Reserve space for dynamic content
- Check font loading strategy
- Use skeleton loaders

### Large Bundle
- Run bundle analyzer
- Check for unnecessary imports
- Verify tree shaking works
- Use dynamic imports for heavy libraries

### Slow Queries
- Check EXPLAIN ANALYZE output
- Verify indexes exist
- Use DataLoaders for relations
- Consider caching frequently accessed data

## Related Skills

- **performance-optimization-standard** - Detailed optimization patterns
- **caching-standard** - Caching implementation
- **database-query-optimization-standard** - Query patterns

## Related Commands

- `/implement-caching` - Set up caching
- `/implement-migrations` - Add indexes
