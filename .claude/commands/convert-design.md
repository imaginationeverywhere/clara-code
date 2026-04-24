# Convert Design to Next.js

**COMMAND AUTHORITY**: This command converts visual designs, mockups, and screenshots to production-ready Next.js 16 components using the `design-to-nextjs` skill.

## Command Purpose

Convert visual designs to working Next.js code with:
- **Design analysis** - Extract colors, spacing, typography, layout
- **Component architecture** - Break down into reusable components
- **Tailwind CSS styling** - Pixel-perfect implementation
- **ShadCN integration** - Use established components where appropriate
- **Responsive patterns** - Mobile-first responsive design

## Supported Input Types

| Type | Source | Example |
|------|--------|---------|
| Screenshots | Local files | `/path/to/screenshot.png` |
| Magic Patterns | Vite/React export | `mockup/magic-patterns/` |
| Wireframes | Image files | `/path/to/wireframe.jpg` |
| Custom mockups | Local directory | `mockup/custom/` |
| URL screenshots | Web pages | `https://example.com` |

## Usage

```bash
# Interactive mode - guided conversion
/convert-design

# Convert specific file
/convert-design --input="/path/to/design.png"

# Convert Magic Patterns export
/convert-design --magic-patterns="mockup/magic-patterns/"

# Convert custom mockup directory
/convert-design --mockup="mockup/custom/"

# Specify output location
/convert-design --input="design.png" --output="src/components/Landing"

# Full page conversion
/convert-design --input="homepage.png" --type="page" --route="/"
```

## Command Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--input` | Path to design file or URL | - |
| `--magic-patterns` | Magic Patterns export directory | - |
| `--mockup` | Custom mockup directory | - |
| `--output` | Output directory for components | `src/components` |
| `--type` | Type: `component`, `page`, `layout` | `component` |
| `--route` | Route path for pages | - |
| `--responsive` | Generate responsive variants | `true` |
| `--dark-mode` | Include dark mode styling | `false` |

## Execution Steps

### Step 1: Analyze Design

Before writing code, analyze the design for:

**Layout Structure**:
- Page layout type (sidebar, header, full-width)
- Grid system (columns, gaps)
- Section hierarchy
- Responsive breakpoints needed

**Components Identified**:
- Navigation elements
- Cards/containers
- Forms/inputs
- Tables/lists
- Modals/dialogs
- Buttons/actions

**Design Tokens**:
- Colors (primary, secondary, accent, semantic)
- Typography (headings, body, captions)
- Spacing (padding, margins, gaps)
- Border radius values
- Shadow styles

**Interactive Elements**:
- Hover states
- Active states
- Loading states
- Error states

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

Update `tailwind.config.ts` with extracted tokens:

```typescript
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
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
};
```

### Step 4: Generate Components

**Server Component (Default)**:

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

**Client Component (Interactive)**:

```typescript
'use client';

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
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white"
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
        <p className="text-xl font-bold mt-3">${product.price.toFixed(2)}</p>
      </CardContent>

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

### Step 5: Common Design Patterns

**Hero Section**:

```typescript
export function HeroSection() {
  return (
    <section className="relative min-h-[600px] flex items-center">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-500" />
      <div className="relative container mx-auto px-4 text-white">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 max-w-2xl">
          Your Headline Here
        </h1>
        <p className="text-xl text-white/90 mb-8 max-w-xl">
          Supporting description text.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button size="lg" variant="secondary">Primary Action</Button>
          <Button size="lg" variant="outline" className="text-white border-white">
            Secondary Action
          </Button>
        </div>
      </div>
    </section>
  );
}
```

**Feature Grid**:

```typescript
const features = [
  { icon: Zap, title: 'Fast', description: 'Lightning quick' },
  { icon: Shield, title: 'Secure', description: 'Enterprise-grade' },
  { icon: Sparkles, title: 'Modern', description: 'Latest tech' },
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

### Step 6: Magic Patterns Conversion

When converting from Magic Patterns Vite/React exports:

**Update Imports**:
```typescript
// Before (Vite/React)
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// After (Next.js)
import Link from 'next/link';
import Image from 'next/image';
```

**Convert Router**:
```typescript
// Before
<Link to="/products">Products</Link>

// After
<Link href="/products">Products</Link>
```

**Convert Images**:
```typescript
// Before
<img src="/image.jpg" alt="..." />

// After
<Image src="/image.jpg" alt="..." width={400} height={300} />
```

**Add 'use client' Where Needed**:
```typescript
// Add to components using:
// - useState, useEffect, useRef
// - onClick, onChange, onSubmit
// - Browser APIs (window, document)

'use client';
import { useState } from 'react';
```

### Step 7: Responsive Implementation

**Breakpoint Reference**:
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

**Container Pattern**:
```typescript
// Standard container with responsive padding
<div className="container mx-auto px-4 sm:px-6 lg:px-8">

// Full-width on mobile, contained on larger screens
<div className="w-full lg:container lg:mx-auto lg:px-8">
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

## Output Structure

After running this command:

```
frontend/src/
├── components/
│   ├── [ComponentName]/
│   │   ├── index.tsx           # Main component
│   │   ├── [SubComponent].tsx  # Sub-components
│   │   └── types.ts            # TypeScript types
│   └── ui/                     # ShadCN components
├── app/
│   └── [route]/
│       └── page.tsx            # If --type="page"
└── styles/
    └── design-tokens.css       # Custom CSS variables
```

## Success Criteria

- ✅ Visual fidelity matches design (pixel-perfect)
- ✅ All components are properly typed
- ✅ Responsive at all breakpoints
- ✅ Accessible (WCAG 2.1 AA)
- ✅ Uses Next.js best practices
- ✅ ShadCN components where appropriate
- ✅ Interactive states work correctly

## Related Commands

- `/implement-admin-panel` - Create admin-specific pages
- `/frontend-dev` - General frontend development
- `/implement-clerk-standard` - Add authentication

## Skill Reference

This command uses the `design-to-nextjs` skill located at:
`.claude/skills/design-to-nextjs/SKILL.md`

---

**Version**: 1.0.0
**Last Updated**: 2025-12-15
