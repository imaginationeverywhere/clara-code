---
name: seo-standard
description: Implement comprehensive SEO for Next.js 15+ applications including sitemap, robots.txt, metadata, Open Graph, Twitter Cards, and JSON-LD structured data. Use when auditing SEO, implementing technical SEO, or optimizing search visibility. Triggers on requests for SEO setup, metadata configuration, sitemap generation, or structured data implementation.
---

# SEO Standard Implementation

Production-grade SEO implementation patterns for Next.js 15+ applications with App Router, including metadata management, structured data, and search engine optimization best practices.

## Skill Metadata

- **Name:** seo-standard
- **Version:** 1.0.0
- **Category:** Frontend & SEO
- **Source:** PPSV Charities Production Implementation
- **Related Skills:** nextjs-architecture-guide, analytics-tracking-standard, admin-dashboard-standard

## When to Use This Skill

Use this skill when:
- Auditing SEO readiness of a Next.js application
- Implementing sitemap.ts and robots.ts
- Configuring Open Graph and Twitter Card metadata
- Adding JSON-LD structured data
- Setting up per-page metadata for all routes
- Creating PWA manifest.json
- Optimizing Core Web Vitals for SEO

## Core Patterns

### 1. Root Layout Metadata Configuration

```typescript
// app/layout.tsx
import { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Site Name - Primary Keyword | Brand',
    template: '%s | Brand Name',
  },
  description: 'Compelling 155-160 character description with primary keywords.',
  keywords: ['keyword1', 'keyword2', 'keyword3', 'long-tail keyword'],
  authors: [{ name: 'Company Name' }],
  creator: 'Company Name',
  publisher: 'Company Name',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'Site Name',
    title: 'Site Name - Primary Keyword',
    description: 'Open Graph description (can be longer than meta description)',
    images: [
      {
        url: `${BASE_URL}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Descriptive alt text for OG image',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Site Name - Primary Keyword',
    description: 'Twitter card description',
    images: [`${BASE_URL}/images/og-image.png`],
    creator: '@twitterhandle',
    site: '@sitehandle',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/images/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/icon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/images/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    google: 'google-site-verification-code',
  },
};
```

### 2. Dynamic Sitemap Generation

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();

  // Define all public pages with their SEO priorities
  const publicPages = [
    { url: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { url: '/about', priority: 0.9, changeFrequency: 'monthly' as const },
    { url: '/services', priority: 0.9, changeFrequency: 'monthly' as const },
    { url: '/contact', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/blog', priority: 0.8, changeFrequency: 'daily' as const },
    { url: '/faq', priority: 0.7, changeFrequency: 'monthly' as const },
  ];

  // For dynamic routes, fetch from database
  // const posts = await db.posts.findMany({ where: { published: true } });
  // const dynamicPages = posts.map(post => ({
  //   url: `/blog/${post.slug}`,
  //   priority: 0.6,
  //   changeFrequency: 'weekly' as const,
  //   lastModified: post.updatedAt,
  // }));

  return publicPages.map((page) => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: currentDate,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
```

### 3. Robots.txt Configuration

```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/admin',
          '/api/',
          '/_next/',
          '/profile/',
          '/profile',
          '/signin',
          '/signup',
          '/confirmation',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

### 4. Per-Page Metadata (for client components)

When a page uses 'use client', create a separate layout.tsx for metadata:

```typescript
// app/contact/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Page-specific description with relevant keywords.',
  openGraph: {
    title: 'Contact Us | Brand Name',
    description: 'Contact page OG description',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

For pages that shouldn't be indexed:

```typescript
// app/admin/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Admin Dashboard',
    template: '%s | Admin',
  },
  description: 'Administration area.',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

### 5. JSON-LD Structured Data

```typescript
// In app/layout.tsx or as a component
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'Company Name',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/images/logo.png`,
        width: 600,
        height: 60,
      },
      sameAs: [
        'https://facebook.com/company',
        'https://twitter.com/company',
        'https://linkedin.com/company/company',
        'https://instagram.com/company',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-XXX-XXX-XXXX',
        contactType: 'customer service',
        availableLanguage: 'English',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      url: BASE_URL,
      name: 'Site Name',
      description: 'Site description',
      publisher: {
        '@id': `${BASE_URL}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    // Add business-specific schemas
    {
      '@type': 'LocalBusiness', // or NonprofitOrganization, etc.
      '@id': `${BASE_URL}/#localbusiness`,
      name: 'Business Name',
      url: BASE_URL,
      telephone: '+1-XXX-XXX-XXXX',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Main St',
        addressLocality: 'City',
        addressRegion: 'ST',
        postalCode: '12345',
        addressCountry: 'US',
      },
    },
  ],
};

// Render in layout
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

### 6. PWA Manifest

```json
// public/manifest.json
{
  "name": "Full Application Name",
  "short_name": "Short Name",
  "description": "Application description",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#007AFF",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/images/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/images/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### 7. SEO Config Utility

```typescript
// lib/seo-config.ts
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export const seoConfig = {
  siteName: 'Site Name',
  siteDescription: 'Default site description',
  baseUrl: BASE_URL,
  defaultOgImage: `${BASE_URL}/images/og-image.png`,
  twitterHandle: '@twitterhandle',
  locale: 'en_US',
};

export function generatePageMetadata(
  title: string,
  description: string,
  path: string = '',
  options?: {
    noIndex?: boolean;
    ogImage?: string;
  }
) {
  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${seoConfig.siteName}`,
      description,
      url: `${seoConfig.baseUrl}${path}`,
      images: [options?.ogImage || seoConfig.defaultOgImage],
    },
    twitter: {
      title: `${title} | ${seoConfig.siteName}`,
      description,
    },
    robots: options?.noIndex ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: `${seoConfig.baseUrl}${path}`,
    },
  };
}
```

## SEO Audit Checklist

### Essential Elements
- [ ] Root layout metadata configured
- [ ] metadataBase set for absolute URLs
- [ ] Title template for consistent branding
- [ ] Meta description (155-160 chars)
- [ ] Keywords array defined
- [ ] Open Graph tags complete
- [ ] Twitter Card tags complete
- [ ] robots.txt blocking admin routes
- [ ] sitemap.xml generated
- [ ] JSON-LD structured data
- [ ] manifest.json for PWA
- [ ] Canonical URLs configured
- [ ] lang attribute on html

### Per-Page Requirements
- [ ] Each page has unique title
- [ ] Each page has unique description
- [ ] Admin/auth pages have noIndex
- [ ] Dynamic routes have proper metadata
- [ ] Confirmation pages excluded from index

### Image Assets Needed
- [ ] og-image.png (1200x630)
- [ ] icon-16.png
- [ ] icon-32.png
- [ ] icon-192.png
- [ ] icon-512.png
- [ ] apple-touch-icon.png (180x180)
- [ ] favicon.ico

### Google Search Console Setup
- [ ] Domain verified
- [ ] Sitemap submitted
- [ ] Index coverage monitored
- [ ] Performance alerts configured

## Page Inventory Template

Track all pages in `docs/seo/pages/README.md`:

```markdown
# Pages & SEO Inventory

| Path | Title | SEO | Loading | Indexed |
|------|-------|-----|---------|---------|
| `/` | Home | layout.tsx | Global | Yes |
| `/about` | About | layout.tsx | Global | Yes |
| `/admin` | Admin | layout.tsx | Global | No (noIndex) |
```

## Validation Commands

```bash
# Test sitemap generation
curl https://example.com/sitemap.xml

# Test robots.txt
curl https://example.com/robots.txt

# Validate structured data
# Use Google Rich Results Test: https://search.google.com/test/rich-results

# Check meta tags (in browser console)
document.querySelector('meta[property="og:title"]')?.content
document.querySelector('meta[name="description"]')?.content
```

## Common Issues and Solutions

### Issue: Metadata not appearing
**Cause:** Page uses 'use client' and exports metadata
**Solution:** Create separate layout.tsx for metadata

### Issue: Duplicate titles
**Cause:** Missing title template or manual title concatenation
**Solution:** Use title.template in root layout

### Issue: Missing canonical URLs
**Cause:** metadataBase not configured
**Solution:** Set metadataBase in root layout

### Issue: Social sharing shows wrong image
**Cause:** OG image URL is relative
**Solution:** Use absolute URLs with metadataBase

## Integration with Analytics

Link SEO implementation with Google Analytics:
- Track organic search traffic in GA4
- Monitor keyword performance
- Set up search console integration
- Track Core Web Vitals impact

See `analytics-tracking-standard` skill for GA4 integration patterns.
