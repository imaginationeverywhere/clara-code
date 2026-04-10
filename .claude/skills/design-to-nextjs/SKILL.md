---
name: design-to-nextjs
description: Convert visual designs, mockups, and screenshots to production-ready Next.js 16 components with App Router patterns, Tailwind CSS styling, and ShadCN UI integration. Use when converting Magic Patterns exports, UI screenshots, wireframes, or any visual design to working Next.js code. Triggers on requests to convert design to code, implement mockup, build from screenshot, or create component from design.
---

# Design to Next.js Conversion

## Overview

Production-tested workflow for converting visual designs to Next.js components with:
- **Design analysis** - Extract colors, spacing, typography from visuals
- **Component architecture** - Break design into reusable components
- **Tailwind styling** - Pixel-perfect implementation with utility classes
- **ShadCN integration** - Use established components where appropriate
- **Responsive patterns** - Mobile-first responsive implementation

## Conversion Workflow

### Step 1: Analyze Design

Before writing code, analyze the design for:

```markdown
## Design Analysis Checklist

### Layout Structure
- [ ] Page layout type (sidebar, header, full-width)
- [ ] Grid system (columns, gaps)
- [ ] Section hierarchy
- [ ] Responsive breakpoints needed

### Components Identified
- [ ] Navigation elements
- [ ] Cards/containers
- [ ] Forms/inputs
- [ ] Tables/lists
- [ ] Modals/dialogs
- [ ] Buttons/actions

### Design Tokens
- [ ] Colors (primary, secondary, accent, semantic)
- [ ] Typography (headings, body, captions)
- [ ] Spacing (padding, margins, gaps)
- [ ] Border radius values
- [ ] Shadow styles

### Interactive Elements
- [ ] Hover states
- [ ] Active states
- [ ] Loading states
- [ ] Error states
```

### Step 2: Map to Component Architecture

```
Design Section → Component Mapping
├── Header Area → Header.tsx / Navigation.tsx
├── Sidebar → Sidebar.tsx / NavMenu.tsx
├── Content Cards → Card.tsx / ProductCard.tsx
├── Data Tables → DataTable.tsx (ShadCN)
├── Forms → Form components with react-hook-form
└── Modals → Dialog.tsx (ShadCN)
```

### Step 3: Extract Design Tokens

```typescript
// tailwind.config.ts - extend with design tokens
const config: Config = {
  theme: {
    extend: {
      colors: {
        // From design system
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // Brand colors from design
        brand: {
          purple: '#7c3aed',
          pink: '#ec4899',
        },
      },
      spacing: {
        // Custom spacing from design
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        // From design
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
};
```

### Step 4: Implement Components

#### Server Component (Default)

```typescript
// app/products/page.tsx - Server Component
import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/lib/api';

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

#### Client Component (Interactive)

```typescript
'use client';

// components/ProductCard.tsx - Client Component for interactivity
import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ShoppingCart, Heart } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
        >
          <Heart
            className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
        </button>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
        <p className="text-xl font-bold mt-3">${product.price.toFixed(2)}</p>
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-4 pt-0">
        <Button className="w-full">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
```

## Common Design Patterns

### Hero Section

```typescript
export function HeroSection() {
  return (
    <section className="relative min-h-[600px] flex items-center">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-500" />

      {/* Content */}
      <div className="relative container mx-auto px-4 text-white">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 max-w-2xl">
          Your Headline Here
        </h1>
        <p className="text-xl text-white/90 mb-8 max-w-xl">
          Supporting description text that explains the value proposition.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button size="lg" variant="secondary">
            Primary Action
          </Button>
          <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
            Secondary Action
          </Button>
        </div>
      </div>
    </section>
  );
}
```

### Feature Grid

```typescript
const features = [
  { icon: Zap, title: 'Fast', description: 'Lightning quick performance' },
  { icon: Shield, title: 'Secure', description: 'Enterprise-grade security' },
  { icon: Sparkles, title: 'Modern', description: 'Latest technologies' },
];

export function FeatureGrid() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Pricing Cards

```typescript
export function PricingCard({ plan, highlighted = false }: PricingCardProps) {
  return (
    <Card className={`relative ${highlighted ? 'border-primary shadow-lg scale-105' : ''}`}>
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge>Most Popular</Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">${plan.price}</span>
          <span className="text-gray-500">/month</span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant={highlighted ? 'default' : 'outline'}>
          Get Started
        </Button>
      </CardFooter>
    </Card>
  );
}
```

## Responsive Implementation

### Breakpoint Reference

```typescript
// Tailwind breakpoints
// sm: 640px   - Small tablets
// md: 768px   - Tablets
// lg: 1024px  - Laptops
// xl: 1280px  - Desktops
// 2xl: 1536px - Large screens

// Mobile-first approach
<div className="
  grid
  grid-cols-1        // Mobile: 1 column
  sm:grid-cols-2     // 640px+: 2 columns
  lg:grid-cols-3     // 1024px+: 3 columns
  xl:grid-cols-4     // 1280px+: 4 columns
  gap-4 sm:gap-6     // Responsive gaps
">
```

### Container Pattern

```typescript
// Standard container with responsive padding
<div className="container mx-auto px-4 sm:px-6 lg:px-8">

// Full-width on mobile, contained on larger screens
<div className="w-full lg:container lg:mx-auto lg:px-8">
```

## Magic Patterns Integration

When converting from Magic Patterns Vite/React exports:

### 1. Update Imports

```typescript
// Before (Vite/React)
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// After (Next.js)
// Remove React import (automatic in Next.js)
// Remove router imports (use Next.js routing)
import Link from 'next/link';
import Image from 'next/image';
```

### 2. Convert Router

```typescript
// Before
<Link to="/products">Products</Link>

// After
<Link href="/products">Products</Link>
```

### 3. Convert Images

```typescript
// Before
<img src="/image.jpg" alt="..." />

// After
<Image src="/image.jpg" alt="..." width={400} height={300} />
```

### 4. Add 'use client' Where Needed

```typescript
// Add to components using:
// - useState, useEffect, useRef
// - onClick, onChange, onSubmit
// - Browser APIs (window, document)

'use client';

import { useState } from 'react';
```

## Quality Checklist

Before completing conversion:

- [ ] All components properly typed with TypeScript
- [ ] Responsive design tested at all breakpoints
- [ ] Images use Next.js Image component with proper sizing
- [ ] Links use Next.js Link component
- [ ] Interactive components marked with 'use client'
- [ ] ShadCN components used where appropriate
- [ ] Tailwind classes organized (layout → spacing → typography → colors)
- [ ] Accessibility: proper alt texts, aria labels, semantic HTML
- [ ] Loading states for async content
- [ ] Error boundaries for client components

## Chrome Browser Verification

Use Claude-in-Chrome MCP tools to verify converted components:

### Visual Verification Workflow
1. **Navigate** to the implemented component in local development
2. **Take screenshots** to compare against original mockup/design
3. **Resize window** to test all responsive breakpoints
4. **Inspect accessibility tree** to verify semantic HTML and ARIA
5. **Compare across environments** (local, develop, production)

### Available Chrome MCP Tools
- `tabs_context_mcp` - Get browser tab context
- `navigate` - Navigate to component URL
- `computer` - Take screenshots for visual comparison
- `read_page` - Inspect DOM and accessibility tree
- `resize_window` - Test responsive breakpoints (sm, md, lg, xl, 2xl)
- `javascript_tool` - Measure Core Web Vitals (LCP, CLS, FID)
- `read_network_requests` - Verify image optimization and bundle sizes
- `gif_creator` - Record interaction demonstrations

### Conversion Verification Commands
```bash
# After converting design to Next.js, verify in browser:
# 1. Visual comparison against original mockup
# 2. Responsive layout at 640px, 768px, 1024px, 1280px
# 3. Image loading and Next.js Image optimization
# 4. Interactive elements (hover, click, focus states)
# 5. Accessibility tree inspection
# 6. Core Web Vitals measurement
```

### Environment Comparison
```bash
# Compare implementation across environments:
# Local:      http://localhost:3000/component-path
# Develop:    https://develop.xxx.amplifyapp.com/component-path
# Production: https://example.com/component-path
```

## Resources

### references/
- `tailwind-patterns.md` - Common Tailwind patterns
- `shadcn-components.md` - ShadCN component reference

### assets/
- `templates/` - Copy-ready component templates
