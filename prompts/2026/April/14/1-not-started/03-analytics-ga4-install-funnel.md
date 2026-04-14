# Analytics: GA4 Install Funnel + Trial → Paid Conversion Tracking

**Flag:** `/pickup-prompt --analytics`
**Project:** clara-code
**Files:** `frontend/src/app/layout.tsx`, `frontend/src/app/(marketing)/`, `backend/src/routes/webhooks-stripe.ts`

## Context

Clara Code has zero analytics instrumentation. For a developer tool with a free trial → paid subscription model, we need to track:
1. **Marketing funnel**: land → sign-up → first API key → first API call
2. **Trial conversion**: who converts, at what point, what plan
3. **Feature usage**: which IDE features are used (voice, explain, panel mode)

## What Needs to Change

### 1. Install GA4 script in Next.js layout

Get the GA4 Measurement ID from SSM:
```
/clara-code/GA4_MEASUREMENT_ID  (dev: G-XXXXXXXX, prod: G-YYYYYYYY)
```

Add to `frontend/src/app/layout.tsx`:
```typescript
import Script from 'next/script'

// In layout:
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}`}
  strategy="afterInteractive"
/>
<Script id="ga4-init" strategy="afterInteractive">{`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}', {
    send_page_view: true
  });
`}</Script>
```

Add to `frontend/.env.local` (pull from SSM):
```
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

Also add to Cloudflare Pages environment variables (both production and preview).

### 2. Create a `useAnalytics` hook

```typescript
// frontend/src/hooks/useAnalytics.ts
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function useAnalytics() {
  const track = (eventName: string, params?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, params);
    }
  };

  return { track };
}
```

### 3. Track the install/signup funnel events

**Event: `sign_up`** — fire on successful Clerk sign-up completion.
Find the sign-up success redirect or the Clerk webhook `user.created` event. Fire from:
- `frontend/src/app/sign-up/` — after successful sign-up, fire `sign_up` with `{ method: 'email' | 'github' }`

**Event: `first_api_key_created`** — fire when a user creates their first API key.
In `frontend/src/app/api-keys/ApiKeysContent.tsx`, in the `onCreate` callback:
```typescript
const onCreate = useCallback(async (name: string) => {
  await createKey({ variables: { name } });
  if (keys.length === 0) {
    track('first_api_key_created');
  }
  await refetch();
}, [createKey, refetch, keys.length, track]);
```

**Event: `first_api_call`** — fire server-side via GA4 Measurement Protocol.
In `backend/src/middleware/api-key-auth.ts`, after a successful auth on the FIRST ever API call for a user:
```typescript
// If user.apiCallCount === 0 (before incrementing), fire Measurement Protocol event
// backend/.env: GA4_MEASUREMENT_ID, GA4_API_SECRET (from SSM)
if (user.apiCallCount === 0) {
  sendGA4ServerEvent(userId, 'first_api_call');
}
```

### 4. GA4 Measurement Protocol helper (server-side)

```typescript
// backend/src/utils/analytics.ts
import fetch from 'node-fetch';

const GA4_ENDPOINT = 'https://www.google-analytics.com/mp/collect';

export async function sendGA4ServerEvent(
  clientId: string,
  eventName: string,
  params: Record<string, unknown> = {}
): Promise<void> {
  const measurementId = process.env.GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;
  if (!measurementId || !apiSecret) return; // fail silently

  try {
    await fetch(`${GA4_ENDPOINT}?measurement_id=${measurementId}&api_secret=${apiSecret}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        events: [{ name: eventName, params }],
      }),
    });
  } catch {
    // never throw — analytics must not break the app
  }
}
```

Add `GA4_MEASUREMENT_ID` and `GA4_API_SECRET` to backend `.env.local`, `.env.develop`, `.env.production` (pull values from SSM).

### 5. Track trial → paid conversion in Stripe webhook

In `backend/src/routes/webhooks-stripe.ts`, in the `checkout.session.completed` handler:

```typescript
case 'checkout.session.completed': {
  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.metadata?.userId ?? session.client_reference_id ?? '';
  const planName = session.metadata?.planName ?? 'unknown';

  await sendGA4ServerEvent(userId, 'purchase', {
    currency: 'USD',
    value: (session.amount_total ?? 0) / 100,
    items: [{ item_name: planName }],
  });
  // ... existing subscription activation logic
}
```

### 6. Track key marketing page views

On the pricing page (`frontend/src/app/pricing/page.tsx` or `(marketing)/pricing/`):
```typescript
// Fire when pricing page loads
track('view_item_list', { item_list_name: 'pricing_plans' });
```

On the landing page CTA clicks (`(marketing)/page.tsx`):
```typescript
// Fire on "Get started" / "Download" button click
track('select_content', { content_type: 'cta', item_id: 'hero_cta' });
```

## SSM Parameters to Create

```
/clara-code/GA4_MEASUREMENT_ID        (dev measurement ID)
/clara-code/prod/GA4_MEASUREMENT_ID   (prod measurement ID)
/clara-code/GA4_API_SECRET            (from GA4 → Admin → Data Streams → Measurement Protocol API secrets)
/clara-code/prod/GA4_API_SECRET
```

## Acceptance Criteria

- [ ] GA4 script loads via `next/script` with `strategy="afterInteractive"` in layout
- [ ] `useAnalytics` hook exported from `frontend/src/hooks/useAnalytics.ts`
- [ ] `sign_up` event fires on successful Clerk sign-up
- [ ] `first_api_key_created` event fires when user creates their first key
- [ ] `first_api_call` event fires server-side via Measurement Protocol
- [ ] `purchase` event fires in Stripe webhook on `checkout.session.completed`
- [ ] GA4_MEASUREMENT_ID and GA4_API_SECRET added to all 3 backend env files
- [ ] NEXT_PUBLIC_GA4_MEASUREMENT_ID added to frontend env files + CF Pages env
- [ ] No PII in any GA4 events (no email, no API key values, no names)
- [ ] `npm run type-check` passes

## Do NOT

- Do not add Google Tag Manager — GA4 direct script only
- Do not track every page view manually — `send_page_view: true` in config handles it
- Do not add analytics to the voice gateway or IDE extension — web only for now
- Do not throw errors if GA4 calls fail — always silent fail
