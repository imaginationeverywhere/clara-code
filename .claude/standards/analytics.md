# Analytics Standard (Google Analytics 4)

**Version:** 1.0.0
**Enforced by:** `/pickup-prompt --analytics`

**Agent:** W.E.B. (web-dubois) — dispatch for implementation
**Reference implementation:** DreamiHairCare (salon booking + e-commerce analytics)

Covers: GA4 setup, event tracking, e-commerce funnel, server-side events, conversion tracking, and dashboard configuration.

---

## CRITICAL RULES

### 1. Measurement ID from SSM — never hardcoded in source

```typescript
// ✅ GA4 Measurement ID from environment
const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
// SSM: /[project]/GA4_MEASUREMENT_ID (plain text — not a secret, but env-specific)

// ✅ Dev uses a SEPARATE GA4 property from production
// /[project]/dev/GA4_MEASUREMENT_ID  → G-DEV...
// /[project]/prod/GA4_MEASUREMENT_ID → G-PROD...

// ❌ Hardcoded in source
const GA_ID = "G-ABC123HARDCODED";
```

**SSM paths:**
```
/[project]/dev/GA4_MEASUREMENT_ID      # Dev GA4 property (separate from prod)
/[project]/prod/GA4_MEASUREMENT_ID     # Production GA4 property
/[project]/GA4_API_SECRET              # For Measurement Protocol (server-side)
```

---

### 2. GA4 Script — load conditionally, respect consent

```typescript
// ✅ Next.js: load GA4 via next/script after consent
// app/layout.tsx
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

  return (
    <html>
      <body>
        {children}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                  send_page_view: true,
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}

// ❌ Loading GA4 via <script> in _document.tsx — blocks page render
// ❌ Loading GA4 before cookie consent (required in EU/GDPR jurisdictions)
```

---

### 3. Standard event library — use semantic event names

```typescript
// src/lib/analytics.ts
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", eventName, params);
}

// ✅ Standard events — use GA4 recommended event names (not custom)
export const Analytics = {
  // E-commerce (DreamiHairCare / any commerce Heru)
  viewItem: (item: AnalyticsItem) =>
    trackEvent("view_item", { items: [item] as unknown }),

  addToCart: (item: AnalyticsItem) =>
    trackEvent("add_to_cart", { currency: "USD", value: item.price, items: [item] as unknown }),

  beginCheckout: (items: AnalyticsItem[], value: number) =>
    trackEvent("begin_checkout", { currency: "USD", value, items: items as unknown }),

  purchase: (transactionId: string, value: number, items: AnalyticsItem[]) =>
    trackEvent("purchase", {
      transaction_id: transactionId,
      value,
      currency: "USD",
      items: items as unknown,
    }),

  // Booking (salon / service Herus — DreamiHairCare pattern)
  viewService: (serviceId: string, serviceName: string, price: number) =>
    trackEvent("view_item", {
      items: [{ item_id: serviceId, item_name: serviceName, price, item_category: "service" }] as unknown,
    }),

  bookingInitiated: (serviceId: string, serviceName: string) =>
    trackEvent("booking_initiated", { service_id: serviceId, service_name: serviceName }),

  bookingCompleted: (bookingId: string, serviceId: string, value: number) =>
    trackEvent("purchase", {
      transaction_id: bookingId,
      value,
      currency: "USD",
      items: [{ item_id: serviceId, quantity: 1 }] as unknown,
    }),

  // Auth
  signUp: (method: string) => trackEvent("sign_up", { method }),
  login: (method: string) => trackEvent("login", { method }),

  // Engagement
  search: (query: string) => trackEvent("search", { search_term: query }),
  share: (method: string, contentType: string) =>
    trackEvent("share", { method, content_type: contentType }),
};

// ❌ Custom event names instead of GA4 recommended names
trackEvent("user_booked_appointment"); // should be "purchase" with booking metadata
```

---

### 4. E-commerce funnel — all 4 stages required

```typescript
// ✅ Every commerce/booking Heru MUST track the full funnel:
// Stage 1: view_item (product/service page)
// Stage 2: begin_checkout (checkout initiated)
// Stage 3: add_payment_info (payment step reached)
// Stage 4: purchase (confirmed transaction)

// Stage 1 — on product/service page
useEffect(() => {
  Analytics.viewItem({ item_id: service.id, item_name: service.name, price: service.price });
}, [service.id]);

// Stage 2 — when checkout button clicked
<button onClick={() => {
  Analytics.beginCheckout([{ item_id: service.id, item_name: service.name, price: service.price }], service.price);
  router.push("/checkout");
}}>Book Now</button>

// Stage 3 — on payment page mount
useEffect(() => {
  trackEvent("add_payment_info", { currency: "USD", value: totalAmount });
}, []);

// Stage 4 — on success page (after Stripe webhook confirms)
useEffect(() => {
  if (sessionId) {
    Analytics.purchase(sessionId, totalAmount, cartItems);
  }
}, [sessionId]);

// ❌ Only tracking the final purchase — no funnel visibility, can't identify drop-off
```

---

### 5. Server-side events — Measurement Protocol for server confirmations

```typescript
// ✅ Server-side purchase event via Measurement Protocol (more reliable than client)
// Fired from the Stripe webhook handler after checkout.session.completed

export async function sendGA4ServerEvent(
  clientId: string, // from GA4 cookie: _ga=GA1.1.<clientId>
  eventName: string,
  params: Record<string, unknown>
): Promise<void> {
  const measurementId = process.env.GA4_MEASUREMENT_ID;
  const apiSecret     = process.env.GA4_API_SECRET;
  if (!measurementId || !apiSecret) return;

  await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
    {
      method: "POST",
      body: JSON.stringify({
        client_id: clientId,
        events: [{ name: eventName, params }],
      }),
    }
  );
}

// In Stripe webhook:
case "checkout.session.completed": {
  const session = event.data.object as Stripe.Checkout.Session;
  const clientId = session.metadata?.ga_client_id;

  if (clientId) {
    await sendGA4ServerEvent(clientId, "purchase", {
      transaction_id: session.id,
      value: (session.amount_total ?? 0) / 100,
      currency: session.currency?.toUpperCase() ?? "USD",
    });
  }
}

// Pass ga_client_id from frontend to checkout metadata:
metadata: {
  ga_client_id: getCookie("_ga")?.split(".").slice(-2).join(".") ?? "",
}
```

---

### 6. Custom dimensions — register in GA4 console

```typescript
// ✅ Custom dimensions to register in GA4 Admin → Custom Definitions:
// user_type: "free" | "pro" | "business" (subscription tier)
// heru_slug: project slug (for multi-property dashboards)
// booking_type: "appointment" | "class" | "package" (for service Herus)

gtag("config", gaId, {
  custom_map: {
    dimension1: "user_type",
    dimension2: "heru_slug",
  },
});

// Set user properties on auth
trackEvent("set", {
  user_properties: {
    user_type: subscriptionTier,
    heru_slug: process.env.NEXT_PUBLIC_HERU_SLUG,
  },
});

// ❌ Tracking without user properties — no segmentation possible
```

---

### 7. No PII in GA4 events

```typescript
// ❌ Never send PII to GA4
trackEvent("user_identified", { email: "john@example.com", phone: "+15555551234" });

// ✅ Use anonymized identifiers only
trackEvent("login", { method: "google", user_tier: subscriptionTier });
```

---

### Heru-specific tech doc required

Each Heru using GA4 MUST have `docs/standards/analytics.md` documenting:
- GA4 Measurement IDs (dev and prod — non-secret, just the G-xxx IDs)
- Custom events tracked beyond the standard library
- Custom dimensions registered in GA4 console
- Conversion events configured in GA4 (which events are marked as conversions)
- Server-side Measurement Protocol: enabled or client-only
- DreamiHairCare reference: salon booking funnel = view_item → booking_initiated → begin_checkout → purchase

If `docs/standards/analytics.md` does not exist, create it.
