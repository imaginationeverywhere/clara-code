# Analytics (GA4) — Clara Code

- **Public measurement ID:** `NEXT_PUBLIC_GA4_MEASUREMENT_ID` (frontend build / Cloudflare Pages).
- **Measurement Protocol:** `GA4_MEASUREMENT_ID` + `GA4_API_SECRET` on the backend (never in client bundles).
- Scripts load via `next/script` with `afterInteractive`; server events fail silently if env is missing.
- Do not send PII in event params (use Clerk `user_id` only in hashed `client_id` on the server).
