# Setup Google Analytics Command

## Overview
Complete Google Analytics 4 setup including property creation, tracking code implementation, and initial configuration with comprehensive e-commerce tracking and remarketing capabilities.

## Prerequisites

⚠️ **REQUIRED**:
- Google account with analytics access
- Admin access to project codebase
- Project must have `docs/PRD.md` with business requirements
- Next.js or React project structure

## Command Usage

**In Claude Code:**
```
setup-google-analytics
```

Or ask Claude naturally:
```
"Set up Google Analytics 4 for my project"
"Configure comprehensive GA4 tracking with e-commerce"
```

## Step-by-Step Implementation

### Step 1: GA4 Property Creation
```
1. Access Google Analytics
   - Go to analytics.google.com
   - Sign in with your Google account
   - Click "Admin" in the bottom left

2. Create New Property
   - Click "Create Property"
   - Enter property name: [PROJECT_NAME] - Website
   - Select appropriate reporting time zone and currency
   - Choose "Web" as platform

3. Configure Data Stream
   - Enter website URL: https://[PROJECT_DOMAIN]
   - Enter stream name: [PROJECT_NAME] Website
   - Enable "Enhanced measurement" for automatic event tracking

4. Get Tracking Information
   - Copy the Measurement ID (format: G-XXXXXXXXXX)
   - Copy the Property ID (format: 123456789)
   - Save both IDs for implementation
```

### Step 2: Environment Configuration
```bash
# Add to .env.local or .env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GA_PROPERTY_ID=123456789
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Step 3: Frontend Implementation
```typescript
// src/app/layout.tsx - Add Google Analytics
import Script from 'next/script'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}

// src/lib/analytics.ts - Analytics utility functions
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

export const trackPurchase = (transactionId: string, items: any[], value: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: 'USD',
      items: items
    });
  }
};

export const trackAddToCart = (item: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'USD',
      value: item.price,
      items: [item]
    });
  }
};
```

### Step 4: E-commerce Configuration
```
1. Enable Enhanced E-commerce in GA4
   - Go to GA4 → Configure → Events
   - Verify these auto-tracked events are enabled:
     - purchase
     - add_to_cart
     - view_item
     - begin_checkout

2. Set Up Conversion Events
   - Go to GA4 → Configure → Conversions
   - Mark these events as conversions:
     - purchase (primary conversion)
     - add_to_cart
     - begin_checkout
```

### Step 5: Remarketing Audiences Setup
```
1. Create Audiences in GA4
   - Go to GA4 → Configure → Audiences
   - Click "Create Custom Audience"

2. Cart Abandoners Audience
   - Name: "Cart Abandoners - 30 Days"
   - Include users who: add_to_cart event AND did NOT complete purchase
   - Membership duration: 30 days

3. Product Viewers Audience
   - Name: "Product Viewers - No Cart Add"
   - Include users who: view_item event AND did NOT fire add_to_cart
   - Membership duration: 30 days

4. High-Value Prospects
   - Name: "Engaged Non-Buyers"
   - Include users who: Session duration > 2 minutes AND pages viewed > 3
   - Membership duration: 60 days
```

### Step 6: Privacy Compliance Setup
```typescript
// COPPA Compliance (if applicable)
gtag('config', 'G-XXXXXXXXXX', {
  allow_google_signals: false,
  allow_ad_personalization_signals: false,
  restricted_data_processing: true,
  cookie_expires: 63072000 // 2 years maximum
});

// Consent Management
export const setAnalyticsConsent = (consent: boolean) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: consent ? 'granted' : 'denied',
      ad_storage: consent ? 'granted' : 'denied',
    });
  }
};
```

### Step 7: Verification and Testing
```
1. Real-time Testing
   - Visit your website
   - Go to GA4 → Reports → Real-time
   - Verify you see active users (should show 1 user - you)

2. Debug with Chrome Extension
   - Install "GA Debugger" Chrome extension
   - Enable the extension and visit your site
   - Check console for analytics events

3. Event Testing
   - Test e-commerce events (add to cart, purchase)
   - Verify custom events are firing
   - Check DebugView in GA4 for real-time validation
```

## Template Variables

When configuring this command for your project, replace:
- `[PROJECT_NAME]` → Your project name
- `[PROJECT_DOMAIN]` → Your project's primary domain
- `G-XXXXXXXXXX` → Your actual GA4 Measurement ID
- `123456789` → Your actual GA4 Property ID

## Admin Dashboard Integration

After setup, the admin panel will include 16 analytics tools:
1. Overview Tab - Key metrics summary
2. Real-time Tab - Live activity monitoring  
3. Audience Tab - User demographics & behavior
4. Demographics Tab - Age, gender, location analytics
5. Acquisition Tab - Traffic sources & marketing channels
6. Attribution Tab - Multi-channel attribution modeling
7. Behavior Tab - Site content & navigation flow
8. Cohorts Tab - User retention analysis
9. E-commerce Tab - Sales reports & product performance
10. Abandoned Cart Tab - Cart abandonment analysis
11. Conversions Tab - Goal completion tracking
12. Goals Tab - Custom goal setup
13. Events Tab - Custom event tracking
14. Custom Events Tab - Industry-specific tracking
15. Exit Tracking Tab - Exit behavior insights
16. Experiments Tab - A/B testing setup

## Success Criteria

✅ **Setup Complete When**:
- GA4 property created and configured
- Tracking code implemented and verified
- Real-time data showing in GA4
- E-commerce events tracking properly
- Remarketing audiences created and populating
- Privacy compliance measures implemented
- Admin dashboard showing comprehensive analytics data

## Next Steps

After initial setup, run these additional commands:
- `setup-ga-backend-integration` - Server-side tracking and database
- `setup-ga-remarketing` - Advanced remarketing and audience export
- `setup-ga-privacy-compliance` - Enhanced privacy controls
- `optimize-ga-performance` - Performance optimization and validation