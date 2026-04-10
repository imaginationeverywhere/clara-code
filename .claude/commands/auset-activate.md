---
description: "Activate an Ausar feature module in the current project"
---

# Auset Activate — Ptah Shapes a Feature Into Being

## Usage
/auset-activate \<feature-name\> [--dry-run] [--force]

## Executable Command Flow

When the user runs `/auset-activate <feature-name>`:

1. **Parse arguments**: feature name (required), `--dry-run` (show what would happen), `--force` (activate even with missing env vars).

2. **Run the activation script** from the project root:
   ```bash
   cd backend && npx ts-node -r tsconfig-paths/register scripts/auset-activate.ts <feature-name> [--dry-run] [--force]
   ```
   This script:
   - Initializes Ausar Engine and discovers features
   - Verifies the feature exists and runs Maat validation on its config
   - Checks for missing env vars (blocks unless `--force`); payment features check Stripe (STRIPE_SECRET_KEY, etc.) and Yapit (YAPIT_API_KEY, YAPIT_MERCHANT_ID, YAPIT_ENVIRONMENT, YAPIT_WEBHOOK_SECRET)
   - Resolves dependencies
   - Runs feature migrations (Story 16.4) for the feature
   - Calls the activation service to persist and activate in the engine
   - Reports success with Kemetic framing

3. **If using API instead of script**: Call GraphQL `activateFeature(name: String!, forceMissingEnv: Boolean)` or REST `POST /api/features/:name/activate` with body `{ "forceMissingEnv": true }` if needed. Only SITE_OWNER or ADMIN can activate.

4. **After activation**: Dynamic GraphQL (Story 16.2) and dynamic routes (Story 16.3) will include this feature on next server start. Restart the backend to load new schema/routes.

5. **Error handling**: On failure, report clear messages (feature not found, Maat unworthy, missing env, migration errors).

## Available Features (by category)

- **Core:** auth, payments, notifications, crm, file-storage, analytics, search, reviews, webhooks
- **Commerce:** product-catalog, checkout, shipping, marketplace, subscriptions, accounting
- **Services:** booking, delivery, document-signatures, insurance, escrow
- **Engagement:** social-media, messaging, video-conferencing, live-streaming, gamification
- **Logistics:** tracking, maps, nfc, mobile-wallet, qr-codes, vehicle-management
- **AI:** chat, content-generation, recommendations, fraud-detection, prompt-caching
- **Enterprise:** white-label, multi-tenant, compliance, reporting, investor-portal
- **Integrations:** travel, music, google-workspace, social-oauth, phone-validation

## Example Output

```
Dependencies: file-storage, notifications
Migrations applied: 001_create_docusign_tables.ts
Activated: document-signatures | Dependencies: file-storage, notifications
Maat has weighed; Heru feature document-signatures is active.
```
