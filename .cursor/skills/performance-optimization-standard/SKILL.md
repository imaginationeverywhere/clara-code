---
name: performance-optimization-standard
description: Implement performance optimization with Core Web Vitals, code splitting, SSR optimization, and runtime tuning. Use when optimizing load times, improving performance metrics, or fixing performance issues. Triggers on requests for performance optimization, Core Web Vitals, page speed, or load time improvement.
---

# Performance Optimization Standard Skill

Enterprise-grade frontend and backend performance optimization patterns extracted from DreamiHairCare production implementation. Focuses on Core Web Vitals, code splitting, SSR optimization, and runtime performance.

## Skill Metadata

```yaml
name: performance-optimization-standard
version: 1.0.0
category: performance
dependencies:
  - next/image
  - next/dynamic
  - react (useMemo, useCallback, memo)
triggers:
  - performance optimization
  - Core Web Vitals
  - LCP optimization
  - code splitting
  - bundle size reduction
  - slow page load
```

## Core Web Vitals Targets

### MANDATORY Performance Thresholds

| Metric | Target | Description |
|--------|--------|-------------|
| **LCP** | < 2.5s | Largest Contentful Paint |
| **FID** | < 100ms | First Input Delay |
| **CLS** | < 0.1 | Cumulative Layout Shift |
| **TTI** | < 3.0s | Time to Interactive |
| **Bundle Size** | < 200KB | Initial JavaScript bundle |

### Measurement Tools

```bash
# Lighthouse CI
npx lighthouse https://your-site.com --output=json

# Web Vitals in code
npm install web-vitals
```

```typescript
// frontend/src/lib/vitals.ts
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

export function reportWebVitals(metric: any): void {
  // Send to analytics
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    id: metric.id,
    page: window.location.pathname,
  });

  // Use sendBeacon for reliability
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/vitals', body);
  } else {
    fetch('/api/vitals', { body, method: 'POST', keepalive: true });
  }
}

// Initialize in _app.tsx or layout.tsx
export function initWebVitals(): void {
  getCLS(reportWebVitals);
  getFID(reportWebVitals);
  getLCP(reportWebVitals);
  getFCP(reportWebVitals);
  getTTFB(reportWebVitals);
}
```

## LCP Optimization (< 2.5s)

### 1. Image Optimization with next/image (MANDATORY)

```typescript
// ✅ CORRECT: Optimized hero image
import Image from 'next/image';

export function HeroSection() {
  return (
    <div className="relative h-[500px]">
      <Image
        src="/hero.jpg"
        alt="Hero image"
        fill
        priority                    // CRITICAL: Preload LCP image
        quality={85}                // Balance quality vs size
        placeholder="blur"          // Show blur while loading
        blurDataURL={blurDataUrl}  // Base64 blur placeholder
        sizes="100vw"              // Full viewport width
        className="object-cover"
      />
    </div>
  );
}

// ❌ WRONG: Regular img tag
<img src="/hero.jpg" alt="Hero" />  // No optimization
```

### 2. Critical CSS Inlining

```typescript
// next.config.mjs
export default {
  experimental: {
    optimizeCss: true,  // Enable CSS optimization
  },
};
```

### 3. Font Optimization

```typescript
// frontend/src/app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',        // Prevent FOIT (Flash of Invisible Text)
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

### 4. Preload Critical Resources

```typescript
// frontend/src/app/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  // Preload critical resources
  other: {
    'link': [
      { rel: 'preload', href: '/fonts/custom.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
      { rel: 'preconnect', href: 'https://api.example.com' },
      { rel: 'dns-prefetch', href: 'https://analytics.example.com' },
    ],
  },
};
```

## FID Optimization (< 100ms)

### 1. Code Splitting with Dynamic Imports

```typescript
import dynamic from 'next/dynamic';

// ✅ CORRECT: Lazy load heavy components
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,  // Skip server-side rendering for client-only components
});

const AdminDashboard = dynamic(
  () => import('@/components/admin/Dashboard'),
  {
    loading: () => <DashboardSkeleton />,
  }
);

// Use in component
export function AnalyticsPage() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyChart data={data} />
    </Suspense>
  );
}
```

### 2. Route-Based Code Splitting (Automatic in App Router)

```
frontend/src/app/
├── page.tsx                    # Main bundle
├── products/
│   └── page.tsx               # Separate chunk
├── admin/
│   └── page.tsx               # Admin-only chunk
└── checkout/
    └── page.tsx               # Checkout chunk
```

### 3. Defer Non-Critical JavaScript

```typescript
// frontend/src/app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}

        {/* Analytics - load after page is interactive */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_ID"
          strategy="afterInteractive"
        />

        {/* Third-party widgets - load when idle */}
        <Script
          src="https://widget.example.com/embed.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
```

### 4. Web Workers for Heavy Computation

```typescript
// frontend/src/workers/dataProcessor.worker.ts
self.onmessage = (event) => {
  const { data, operation } = event.data;

  let result;
  switch (operation) {
    case 'sort':
      result = data.sort((a, b) => a.value - b.value);
      break;
    case 'filter':
      result = data.filter(item => item.active);
      break;
    case 'aggregate':
      result = aggregateData(data);
      break;
  }

  self.postMessage(result);
};

// Usage in component
function useWorker() {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/dataProcessor.worker.ts', import.meta.url)
    );

    return () => workerRef.current?.terminate();
  }, []);

  const processData = useCallback((data: any[], operation: string) => {
    return new Promise((resolve) => {
      if (!workerRef.current) return;

      workerRef.current.onmessage = (e) => resolve(e.data);
      workerRef.current.postMessage({ data, operation });
    });
  }, []);

  return { processData };
}
```

## CLS Optimization (< 0.1)

### 1. Reserve Space for Dynamic Content

```typescript
// ✅ CORRECT: Fixed aspect ratio for images
<div className="relative aspect-video">
  <Image
    src={imageUrl}
    alt="Product"
    fill
    className="object-cover"
  />
</div>

// ✅ CORRECT: Skeleton with fixed dimensions
function ProductCardSkeleton() {
  return (
    <div className="w-full h-[300px] bg-gray-200 animate-pulse rounded-lg" />
  );
}

// ❌ WRONG: No dimensions specified
<img src={imageUrl} alt="Product" />
```

### 2. Font Loading Strategy

```typescript
// Prevent layout shift from font loading
const font = Inter({
  subsets: ['latin'],
  display: 'swap',           // Use fallback immediately
  adjustFontFallback: true,  // Adjust metrics of fallback font
});
```

### 3. Ad and Embed Containers

```typescript
// Reserve space for ads/embeds
function AdContainer({ width, height }: { width: number; height: number }) {
  return (
    <div
      style={{ width, height, minHeight: height }}
      className="bg-gray-100"
    >
      <AdComponent />
    </div>
  );
}
```

## React Performance Patterns

### 1. useMemo for Expensive Calculations

```typescript
// ✅ CORRECT: Memoize expensive calculations
function ProductList({ products, filters }: Props) {
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => filters.category ? p.category === filters.category : true)
      .filter(p => filters.minPrice ? p.price >= filters.minPrice : true)
      .filter(p => filters.maxPrice ? p.price <= filters.maxPrice : true)
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'price-asc': return a.price - b.price;
          case 'price-desc': return b.price - a.price;
          case 'name': return a.name.localeCompare(b.name);
          default: return 0;
        }
      });
  }, [products, filters]);

  return <ProductGrid products={filteredProducts} />;
}

// ❌ WRONG: Recalculating on every render
function ProductList({ products, filters }) {
  const filteredProducts = products.filter(...).sort(...);  // Runs every render!
}
```

### 2. useCallback for Stable References

```typescript
// ✅ CORRECT: Stable callback reference
function SearchForm({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('');

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    onSearch(query);
  }, [query, onSearch]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <input value={query} onChange={handleChange} />
      <button type="submit">Search</button>
    </form>
  );
}
```

### 3. React.memo for Component Memoization

```typescript
// ✅ CORRECT: Memoize component that receives stable props
const ProductCard = memo(function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  return (
    <div className="product-card">
      <Image src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => onAddToCart(product.id)}>Add to Cart</button>
    </div>
  );
});

// With custom comparison
const ProductCard = memo(
  function ProductCard({ product, onAddToCart }) {
    // ...
  },
  (prevProps, nextProps) => {
    // Only re-render if product ID or price changes
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.product.price === nextProps.product.price
    );
  }
);
```

### 4. Virtualization for Long Lists

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedProductList({ products }: { products: Product[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,  // Estimated row height
    overscan: 5,              // Render extra items for smooth scrolling
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ProductCard product={products[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Server-Side Optimization

### 1. Incremental Static Regeneration (ISR)

```typescript
// frontend/src/app/products/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds

export default async function ProductsPage() {
  const products = await getProducts();

  return <ProductList products={products} />;
}

// For dynamic routes
// frontend/src/app/products/[id]/page.tsx
export async function generateStaticParams() {
  const products = await getPopularProducts();
  return products.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.id);
  return <ProductDetail product={product} />;
}
```

### 2. Streaming with Suspense

```typescript
// frontend/src/app/dashboard/page.tsx
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <div>
      {/* Critical content renders immediately */}
      <DashboardHeader />

      {/* Non-critical content streams in */}
      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <RecentOrders />
      </Suspense>
    </div>
  );
}

// Each component fetches its own data
async function DashboardStats() {
  const stats = await fetchStats();  // Server component
  return <StatsDisplay stats={stats} />;
}
```

### 3. Server Actions for Mutations

```typescript
// frontend/src/app/actions/cart.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function addToCart(productId: string, quantity: number) {
  const session = await getSession();

  await db.cartItem.create({
    data: {
      userId: session.userId,
      productId,
      quantity,
    },
  });

  revalidatePath('/cart');
}

// Usage in component
function AddToCartButton({ productId }: { productId: string }) {
  return (
    <form action={addToCart.bind(null, productId, 1)}>
      <button type="submit">Add to Cart</button>
    </form>
  );
}
```

## Bundle Optimization

### 1. Analyze Bundle Size

```bash
# Install bundle analyzer
npm install @next/bundle-analyzer

# next.config.mjs
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer({
  // config
});

# Run analysis
ANALYZE=true npm run build
```

### 2. Tree Shaking

```typescript
// ✅ CORRECT: Named imports enable tree shaking
import { Button, Input } from '@/components/ui';
import { format } from 'date-fns';

// ❌ WRONG: Importing entire library
import * as Components from '@/components/ui';
import dateFns from 'date-fns';
```

### 3. Dynamic Imports for Large Libraries

```typescript
// ✅ CORRECT: Load heavy libraries only when needed
async function generatePDF(data: ReportData) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  // Generate PDF
}

async function processExcel(file: File) {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(await file.arrayBuffer());
  // Process Excel
}
```

## Performance Monitoring

### Lighthouse CI Configuration

```yaml
# lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/", "http://localhost:3000/products"],
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
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### GitHub Actions Workflow

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

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          configPath: './lighthouserc.json'
          uploadArtifacts: true
          temporaryPublicStorage: true
```

## Checklist

### Pre-Deployment Performance Checklist

- [ ] All images use next/image with proper sizing
- [ ] LCP image has `priority` attribute
- [ ] Fonts use `display: swap`
- [ ] Heavy components are dynamically imported
- [ ] Lists with >50 items use virtualization
- [ ] useMemo/useCallback used for expensive operations
- [ ] Bundle size < 200KB (initial load)
- [ ] Lighthouse performance score > 90
- [ ] CLS < 0.1 (no layout shifts)
- [ ] LCP < 2.5s
- [ ] FID < 100ms

## Related Skills

- **caching-standard** - Server-side caching patterns
- **database-query-optimization-standard** - Query performance
- **nextjs-architecture-guide** - Next.js patterns

## Related Commands

- `/implement-performance-optimization` - Full optimization setup
- `/implement-caching` - Caching infrastructure
