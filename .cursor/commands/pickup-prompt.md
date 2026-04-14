# /pickup-prompt — Find and Execute All Not-Started Prompts

**Named after the pattern:** Cursor agents on QCS1 pick up prompts from `prompts/<yyyy>/<Month>/<dd>/1-not-started/` and execute them in isolated git worktrees.

## What This Command Does

Resolves today's date, finds ALL prompts in `1-not-started/`, and processes them in a loop — one by one — until the queue is empty. For each prompt: creates a detached worktree, executes the prompt, creates a branch FROM the worktree when done, pushes the branch, opens a PR, moves the prompt to `3-completed/`, and removes the worktree. **You do not need to re-run this command.** It loops automatically until all prompts are done.

## Usage

```
/pickup-prompt                          # Process ALL not-started prompts for today (loops automatically)
/pickup-prompt 2026/April/12            # Specific date
/pickup-prompt --list                   # List all not-started prompts without executing
/pickup-prompt 01-cc-web-full.md        # Execute a specific prompt by filename only
/pickup-prompt --status                 # Show standards dashboard: what's implemented vs missing in this Heru
/pickup-prompt --requirements           # Discovery intake: collect Heru info, generate PRD/BRD/VRD
/pickup-prompt --all                    # List ALL Auset module prompts needed + queue missing ones

# Standards flags (can be stacked)
/pickup-prompt --clerk                  # Inject Clerk auth standard (ProfileWidget required on auth layouts)
/pickup-prompt --stripe                 # Inject Stripe standard (dynamic pricing, webhooks)
/pickup-prompt --graphql                # Inject GraphQL standard (DataLoader, auth guards, naming)
/pickup-prompt --migrations             # Inject DB migrations standard (up/down, all 3 envs)
/pickup-prompt --multi-tenant           # Inject multi-tenancy standard (tenant_id, PLATFORM/SITE_OWNER)
/pickup-prompt --testing                # Inject testing standard (80% coverage, error paths, no DB mocks)
/pickup-prompt --security               # Inject security standard (auth guards, rate limiting, CORS)
/pickup-prompt --desktop                # Inject desktop app standard (VS Code ext, Electron, SecretStorage)
/pickup-prompt --design                 # Inject design standard (Magic Patterns → web/desktop/CLI/mobile)
/pickup-prompt --design web             # Web surface only (Next.js App Router)
/pickup-prompt --design desktop         # Desktop surface only (VS Code webview / Electron)
/pickup-prompt --design cli             # CLI/TUI surface only (Ink + chalk)
/pickup-prompt --design mobile          # Mobile surface only (React Native + NativeWind)

# Integration flags
/pickup-prompt --twilio                 # Inject Twilio standard (SMS/Voice/Video, webhook sig validation)
/pickup-prompt --slack                  # Inject Slack standard (bot, slash commands, Block Kit)
/pickup-prompt --digital-pass           # Inject PassKit standard (Apple Wallet + Google Wallet bridge)
/pickup-prompt --push                   # Inject push notifications standard (APNs + FCM via expo-notifications)

# Mobile map flags (iOS = Apple Maps, Android = Mapbox — use both for cross-platform)
/pickup-prompt --apple-maps             # Apple Maps (iOS only, Platform.OS gate required)
/pickup-prompt --mapbox                 # Mapbox (Android only, Platform.OS gate required)

# Infrastructure flags
/pickup-prompt --eas                    # EAS builds on QCS1 (xcrun altool, EXPO_TOKEN, ASC issuer)
/pickup-prompt --neon                   # Neon PostgreSQL (provision prod + dev branches, pgbouncer)
/pickup-prompt --cf                     # Cloudflare Pages frontend (wrangler.toml, CF env vars, OpenNext)

# Commerce and business flags
/pickup-prompt --shipping                # Inject Shippo shipping standard
/pickup-prompt --analytics               # Inject GA4 analytics standard
/pickup-prompt --admin                   # Inject admin panel standard (RBAC, audit log, data tables)

# User and stack flags
/pickup-prompt --profile                 # Inject user profile + wallet standard (Clerk sync, wallet top-up, avatar S3)
/pickup-prompt --frontend                # Inject frontend stack standard (Next.js 16, TypeScript, Tailwind, Apollo, Clerk, Redux-Persist)
/pickup-prompt --backend                 # Inject backend stack standard (Node/Express, Sequelize, GraphQL/Apollo, TypeScript)
/pickup-prompt --mobile                  # Inject mobile stack standard (Expo SDK 52, Expo Router, NativeWind, Apollo, Clerk, Redux-Persist)

# App store submission flags
/pickup-prompt --apple                   # Apple App Store submission (xcrun altool, metadata, screenshots)
/pickup-prompt --google                  # Google Play Store submission (AAB, Play Console, staged rollout)

# Stack flags for complex prompts
/pickup-prompt --graphql --migrations --multi-tenant --security         # Full backend feature
/pickup-prompt --stripe --migrations --testing                          # Subscription with DB changes
/pickup-prompt --clerk --security --testing                             # Auth feature
/pickup-prompt --design web --testing --security                        # Full frontend feature with design
/pickup-prompt --mobile --push --eas --apple-maps --mapbox              # Full cross-platform mobile feature
/pickup-prompt --mobile --eas --apple                                   # iOS mobile + App Store
/pickup-prompt --mobile --eas --google                                  # Android mobile + Play Store
/pickup-prompt --mobile --push --eas --apple --google                   # Full mobile CI/CD pipeline
/pickup-prompt --apple-maps --mapbox --push --eas                       # Mobile maps + push (no full stack)
/pickup-prompt --neon --migrations --security                           # Database setup
/pickup-prompt --stripe --shipping --analytics --admin                  # Full commerce stack
/pickup-prompt --eas --apple                                            # iOS build + submit
/pickup-prompt --eas --google                                           # Android build + submit
/pickup-prompt --eas --apple --google                                   # Both stores
/pickup-prompt --frontend --clerk --profile                             # Full frontend auth + profile
/pickup-prompt --backend --graphql --security --migrations              # Full backend feature
/pickup-prompt --frontend --backend --clerk --profile                   # Full stack feature
```

## Flags

### `--clerk`

When this flag is present, the agent MUST read `.claude/standards/clerk-auth.md` before executing any prompt. The standard's rules become mandatory constraints for the entire execution — overriding any conflicting instruction in the prompt itself.

Use this flag for any prompt that involves:
- Sign-in pages
- Sign-up pages
- Auth layouts
- SSO/OAuth flows
- Clerk-protected routes
- Any authenticated navbar/header (ProfileWidget required)

```bash
# Detect --clerk flag
CLERK_STANDARD=""
if echo "$*" | grep -q "\-\-clerk"; then
  CLERK_STANDARD=$(cat .claude/standards/clerk-auth.md)
  echo "📋 Clerk Auth Standard loaded — applying mandatory constraints:"
  echo "   ❌ No <SignIn> or <SignUp> embedded components — hooks required"
  echo "   ✅ useSignIn() / useSignUp() hooks required"
  echo "   ✅ SSO callback route required"
  echo "   ✅ ProfileWidget required on every authenticated layout (navbar/header)"
  echo "   ✅ ProfileWidget: avatar, name, tier badge, wallet balance, sign-out"
  echo "   ✅ Provider order: ClerkProvider → AuthSetup → Apollo → Redux → PersistGate"
  echo "   ✅ Webhook: Svix signature verification required"
  echo "   ✅ RBAC via Clerk publicMetadata.role — never user-editable"
  echo "   ✅ docs/standards/clerk.md must be created/updated"
  echo ""
fi
```

The loaded standard is prepended to the prompt context before execution. If the prompt says `<SignIn appearance={{...}} />` anywhere, the agent overrides it with the hook pattern from the standard. If an authenticated layout is missing a ProfileWidget, the agent adds one.

---

### `--stripe`

When this flag is present, the agent MUST read `.claude/standards/stripe.md` before executing any prompt. The standard's rules become mandatory constraints for the entire execution — overriding any conflicting instruction in the prompt itself.

Use this flag for any prompt that involves:
- Checkout flows or subscription creation
- Webhook handlers (`/api/webhooks/stripe`)
- Subscription tier resolution or upgrades/downgrades
- Price/plan lookup
- API key issuance tied to subscription status
- Any `stripe.` call anywhere in the codebase

```bash
# Detect --stripe flag
STRIPE_STANDARD=""
if echo "$*" | grep -q "\-\-stripe"; then
  STRIPE_STANDARD=$(cat .claude/standards/stripe.md)
  echo "💳 Stripe Standard loaded — applying mandatory constraints:"
  echo "   ❌ No STRIPE_PRICE_* env vars — dynamic pricing only"
  echo "   ✅ express.raw() required for webhook body parsing"
  echo "   ✅ STRIPE_WEBHOOK_SECRET from SSM — never hardcoded"
  echo "   ✅ Local ngrok webhook endpoint required: https://[project]-backend-dev.ngrok.quiknation.com/api/webhooks/stripe"
  echo "   ✅ Hosted Checkout (not Elements) for subscription flows"
  echo "   ✅ Price lookup via Stripe metadata tags (clara_tier, clara_type)"
  echo "   ✅ Platform fees: minimum 7%, passed to customer — never absorbed"
  echo "   ✅ Metadata required on every Stripe object (session, charge, price)"
  echo "   ✅ Disputes: charge.dispute.created + .closed events handled"
  echo "   ✅ Refunds: POST /api/stripe/refund endpoint + charge.refunded event"
  echo "   ✅ All 6 webhook events registered (checkout, subscription, dispute x2, refund)"
  echo ""
fi
```

The loaded standard is prepended to the prompt context before execution. Key overrides:
- If the prompt uses `process.env.STRIPE_PRICE_*` anywhere, the agent replaces it with `stripe.prices.list()` + metadata lookup
- If the webhook body is parsed with `express.json()`, the agent fixes it to `express.raw()`
- If no `/api/webhooks/stripe` endpoint exists, the agent creates one

---

### `--graphql`

Loads `.claude/standards/graphql.md`. Use for any prompt touching resolvers, schema, or federation.

```bash
GRAPHQL_STANDARD=""
if echo "$*" | grep -q "\-\-graphql"; then
  GRAPHQL_STANDARD=$(cat .claude/standards/graphql.md)
  echo "📊 GraphQL Standard loaded — applying mandatory constraints:"
  echo "   ❌ No resolver without DataLoader for relationships"
  echo "   ✅ Auth guard required: if (!ctx.auth?.userId) throw AuthenticationError"
  echo "   ✅ Naming: PascalCase types, camelCase fields/queries, SCREAMING_SNAKE enums"
  echo "   ✅ docs/standards/graphql.md must be created/updated"
  echo ""
fi
```

---

### `--migrations`

Loads `.claude/standards/migrations.md`. Use for any prompt creating or modifying DB schema.

```bash
MIGRATIONS_STANDARD=""
if echo "$*" | grep -q "\-\-migrations"; then
  MIGRATIONS_STANDARD=$(cat .claude/standards/migrations.md)
  echo "🗄️  Migrations Standard loaded — applying mandatory constraints:"
  echo "   ✅ Every migration needs up() AND down()"
  echo "   ❌ No DROP column — deprecate first, drop in next deploy"
  echo "   ✅ Run on .env.local → .env.develop → .env.production"
  echo "   ✅ Add index on every foreign key"
  echo "   ✅ docs/standards/migrations.md must be created/updated"
  echo ""
fi
```

---

### `--multi-tenant`

Loads `.claude/standards/multi-tenant.md`. Use for any prompt touching DB queries or data access.

```bash
MULTITENANT_STANDARD=""
if echo "$*" | grep -q "\-\-multi-tenant"; then
  MULTITENANT_STANDARD=$(cat .claude/standards/multi-tenant.md)
  echo "🏢 Multi-Tenancy Standard loaded — applying mandatory constraints:"
  echo "   ✅ Every DB query scoped to tenantId"
  echo "   ❌ No mixing PLATFORM_OWNER and SITE_OWNER concerns"
  echo "   ✅ All business tables have tenant_id column + index"
  echo "   ✅ docs/standards/multi-tenant.md must be created/updated"
  echo ""
fi
```

---

### `--testing`

Loads `.claude/standards/testing.md`. Use for any prompt that adds features (tests are required with the feature).

```bash
TESTING_STANDARD=""
if echo "$*" | grep -q "\-\-testing"; then
  TESTING_STANDARD=$(cat .claude/standards/testing.md)
  echo "🧪 Testing Standard loaded — applying mandatory constraints:"
  echo "   ✅ 80% line/statement coverage minimum on changed files"
  echo "   ✅ Error paths required: 401, 403, 404, 400, 500"
  echo "   ❌ No mocking internal services — test through HTTP layer"
  echo "   ✅ docs/standards/testing.md must be created/updated"
  echo ""
fi
```

---

### `--security`

Loads `.claude/standards/security.md`. Use for any prompt adding routes, file uploads, or auth logic.

```bash
SECURITY_STANDARD=""
if echo "$*" | grep -q "\-\-security"; then
  SECURITY_STANDARD=$(cat .claude/standards/security.md)
  echo "🔒 Security Standard loaded — applying mandatory constraints:"
  echo "   ✅ Auth check on every protected route"
  echo "   ✅ Parameterized queries (no string interpolation in SQL)"
  echo "   ✅ Rate limiting on all public endpoints"
  echo "   ✅ Helmet headers applied"
  echo "   ✅ docs/standards/security.md must be created/updated"
  echo ""
fi
```

---

### `--desktop`

Loads `.claude/standards/desktop.md`. Use for any prompt touching the VS Code extension, Electron app, or Tauri desktop.

```bash
DESKTOP_STANDARD=""
if echo "$*" | grep -q "\-\-desktop"; then
  DESKTOP_STANDARD=$(cat .claude/standards/desktop.md)
  echo "🖥️  Desktop Standard loaded — applying mandatory constraints:"
  echo "   ✅ Auth via PKCE + loopback — no web redirect flows"
  echo "   ✅ Secrets in SecretStorage — not settings.json or localStorage"
  echo "   ✅ IPC via contextBridge — never expose Node modules directly"
  echo "   ✅ Signed builds only (notarized macOS, Authenticode Windows)"
  echo "   ✅ docs/standards/desktop.md must be created/updated"
  echo ""
fi
```

---

### `--design`

Loads `.claude/standards/design.md`. Use for any prompt that converts Magic Patterns exports to production components, builds new UI surfaces, or establishes the design system. Accepts an optional surface variant: `web` (default), `desktop`, `cli`, or `mobile`.

```bash
DESIGN_STANDARD=""
DESIGN_SURFACE="web"  # default
if echo "$*" | grep -q "\-\-design"; then
  DESIGN_STANDARD=$(cat .claude/standards/design.md)
  # Detect optional surface variant
  if echo "$*" | grep -q "\-\-design desktop"; then DESIGN_SURFACE="desktop"
  elif echo "$*" | grep -q "\-\-design cli"; then DESIGN_SURFACE="cli"
  elif echo "$*" | grep -q "\-\-design mobile"; then DESIGN_SURFACE="mobile"
  fi
  echo "🎨 Design Standard loaded (surface: ${DESIGN_SURFACE}) — applying mandatory constraints:"
  echo "   ✅ Read docs/design-system.md before writing any component"
  echo "   ✅ Read mockups/${DESIGN_SURFACE}/ Magic Patterns export as the spec"
  echo "   ✅ Extract design tokens into tailwind.config.ts — no hardcoded hex"
  if [ "$DESIGN_SURFACE" = "web" ]; then
    echo "   ✅ Next.js App Router: remove React imports, convert router, convert <img>"
    echo "   ✅ Add 'use client' only for components using hooks/events"
    echo "   ✅ 4 interactive states required: default, hover, active, disabled"
    echo "   ✅ Mobile-first responsive (grid-cols-1 md:grid-cols-2)"
  elif [ "$DESIGN_SURFACE" = "desktop" ]; then
    echo "   ✅ VS Code CSS tokens: var(--vscode-editor-background) — never hex"
    echo "   ✅ Webview CSP required: no unsafe-inline in production scripts"
    echo "   ✅ JetBrains Mono for all code/terminal/path content"
  elif [ "$DESIGN_SURFACE" = "cli" ]; then
    echo "   ✅ Ink components only — not browser React"
    echo "   ✅ Box-drawing layout: waveform top / chat middle / input bar bottom"
    echo "   ✅ 16-color fallback: design must work with FORCE_COLOR=0"
  elif [ "$DESIGN_SURFACE" = "mobile" ]; then
    echo "   ✅ React Native: View/Text/Image/TouchableOpacity — no HTML elements"
    echo "   ✅ SafeAreaView on every screen root"
    echo "   ✅ 44pt minimum touch targets (iOS HIG)"
    echo "   ✅ Platform.OS tokens for iOS/Android differences"
  fi
  echo "   ✅ docs/design-system.md must be created/updated"
  echo ""
fi
```

The loaded standard is prepended to the prompt context before execution. Key overrides:
- If the prompt uses hardcoded hex colors (`#09090F`), the agent extracts them as Tailwind tokens first
- If converting from Magic Patterns (Vite/React), the agent applies surface-specific conversion rules
- If no `docs/design-system.md` exists, the agent creates it using the template in the standard
- All 4 interactive states (default/hover/active/disabled) are required for every interactive component

---

### `--twilio`

Loads `.claude/standards/twilio.md`. Use for any prompt involving SMS, Voice, Video, or WhatsApp via Twilio.

```bash
TWILIO_STANDARD=""
if echo "$*" | grep -q "\-\-twilio"; then
  TWILIO_STANDARD=$(cat .claude/standards/twilio.md)
  echo "📱 Twilio Standard loaded — applying mandatory constraints:"
  echo "   ✅ Credentials from SSM: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER"
  echo "   ✅ Webhook: X-Twilio-Signature validated on every endpoint"
  echo "   ✅ Body parser: express.urlencoded() — NOT express.json() for Twilio webhooks"
  echo "   ✅ Rate limiting on SMS send: 5/min/IP"
  echo "   ❌ No phone numbers in logs — log messageSid only"
  echo "   ✅ getTwilioClient() singleton"
  echo "   ✅ statusCallback URL required on all SMS creates"
  echo "   ✅ docs/standards/twilio.md must be created/updated"
  echo ""
fi
```

---

### `--slack`

Loads `.claude/standards/slack.md`. Use for any prompt adding Slack notifications, slash commands, or event handlers.

```bash
SLACK_STANDARD=""
if echo "$*" | grep -q "\-\-slack"; then
  SLACK_STANDARD=$(cat .claude/standards/slack.md)
  echo "💬 Slack Standard loaded — applying mandatory constraints:"
  echo "   ✅ Bot token and channel IDs from SSM"
  echo "   ✅ Slash commands / events: validate X-Slack-Signature on every request"
  echo "   ✅ getSlackClient() singleton"
  echo "   ✅ Block Kit for structured messages"
  echo "   ✅ Rate limiting: max 2 concurrent Slack calls (Tier 3 = 50/min)"
  echo "   ❌ No PII in Slack messages — reference IDs + admin panel links only"
  echo "   ✅ docs/standards/slack.md must be created/updated"
  echo ""
fi
```

---

### `--digital-pass`

Loads `.claude/standards/digital-pass.md`. Use for any prompt implementing Apple Wallet or Google Wallet passes. This is the bridge implementation — the native wallet is future work.

```bash
DIGITALPASS_STANDARD=""
if echo "$*" | grep -q "\-\-digital-pass"; then
  DIGITALPASS_STANDARD=$(cat .claude/standards/digital-pass.md)
  echo "💳 Digital Pass Standard loaded (PassKit bridge) — applying mandatory constraints:"
  echo "   ⚠️  BRIDGE implementation — native wallet is future work"
  echo "   ✅ Pass signing certificates from SSM — never in git"
  echo "   ✅ Use passkit-generator (node) — never manual zip"
  echo "   ✅ Content-Type: application/vnd.apple.pkpass for delivery"
  echo "   ✅ Register device tokens for push pass updates"
  echo "   ✅ Google Wallet: JWT signed with service account from SSM"
  echo "   ✅ docs/standards/digital-pass.md must be created/updated"
  echo ""
fi
```

---

### `--apple-maps`

Loads `.claude/standards/apple-maps.md`. Use for any iOS map prompt. **iOS only — must be gated behind `Platform.OS === 'ios'`.**

```bash
APPLEMAPS_STANDARD=""
if echo "$*" | grep -q "\-\-apple-maps"; then
  APPLEMAPS_STANDARD=$(cat .claude/standards/apple-maps.md)
  echo "🗺️  Apple Maps Standard loaded (iOS only) — applying mandatory constraints:"
  echo "   ✅ Platform.OS === 'ios' gate required on every map component"
  echo "   ✅ PROVIDER_DEFAULT for react-native-maps on iOS"
  echo "   ✅ NSLocationWhenInUseUsageDescription in Info.plist"
  echo "   ✅ MapKit JS token from SSM — not in client bundle"
  echo "   ✅ Clustering required for >50 markers"
  echo "   ✅ Navigation: deep link to Apple Maps — don't reimplement"
  echo "   ✅ docs/standards/apple-maps.md must be created/updated"
  echo ""
fi
```

---

### `--mapbox`

Loads `.claude/standards/mapbox.md`. Use for any Android map prompt. **Android only — must be gated behind `Platform.OS === 'android'`.**

```bash
MAPBOX_STANDARD=""
if echo "$*" | grep -q "\-\-mapbox"; then
  MAPBOX_STANDARD=$(cat .claude/standards/mapbox.md)
  echo "🗺️  Mapbox Standard loaded (Android only) — applying mandatory constraints:"
  echo "   ✅ Platform.OS === 'android' gate required on every Mapbox component"
  echo "   ✅ Access token from SSM — never hardcoded"
  echo "   ✅ Mapbox.setAccessToken() once at app root — not per component"
  echo "   ✅ ACCESS_FINE_LOCATION in AndroidManifest.xml"
  echo "   ✅ ShapeSource + cluster for >50 points"
  echo "   ✅ Navigation: deep link to Google Maps — don't reimplement"
  echo "   ✅ docs/standards/mapbox.md must be created/updated"
  echo ""
fi
```

---

### `--eas`

Loads `.claude/standards/eas.md`. Use for any prompt involving mobile app builds or TestFlight/Play Store submissions.

```bash
EAS_STANDARD=""
if echo "$*" | grep -q "\-\-eas"; then
  EAS_STANDARD=$(cat .claude/standards/eas.md)
  echo "📦 EAS Build Standard loaded — applying mandatory constraints:"
  echo "   ✅ ALL builds on QCS1 (M4 Pro) — never local"
  echo "   ✅ Unlock keychain BEFORE build: security unlock-keychain"
  echo "   ✅ EXPO_TOKEN from ~/.expo_token"
  echo "   ✅ ASC Issuer: 14c760ad-a824-4520-8f71-78efdda81029 (NOT 69a6de96...)"
  echo "   ✅ TestFlight: xcrun altool — NOT eas submit (permanent 409 bug)"
  echo "   ✅ Build number must be HIGHER than current TestFlight"
  echo "   ❌ No --clear-cache on FMO without explicit authorization"
  echo "   ✅ docs/standards/eas.md must be created/updated"
  echo ""
fi
```

---

### `--push`

Loads `.claude/standards/push.md`. Use for any prompt adding push notifications (iOS APNs or Android FCM).

```bash
PUSH_STANDARD=""
if echo "$*" | grep -q "\-\-push"; then
  PUSH_STANDARD=$(cat .claude/standards/push.md)
  echo "🔔 Push Notifications Standard loaded — applying mandatory constraints:"
  echo "   ✅ APNs .p8 key from SSM — never in source or git"
  echo "   ✅ FCM service account JSON from SSM"
  echo "   ✅ Notifications.setNotificationHandler() at app root before render"
  echo "   ✅ POST /api/notifications/register for device token storage"
  echo "   ✅ DELETE /api/notifications/register on logout"
  echo "   ✅ expo-server-sdk for delivery (handles APNs + FCM routing)"
  echo "   ✅ Receipt processing: remove DeviceNotRegistered tokens"
  echo "   ✅ docs/standards/push.md must be created/updated"
  echo ""
fi
```

---

### `--neon`

Loads `.claude/standards/neon.md`. Use for any prompt setting up or migrating a Neon PostgreSQL database.

```bash
NEON_STANDARD=""
if echo "$*" | grep -q "\-\-neon"; then
  NEON_STANDARD=$(cat .claude/standards/neon.md)
  echo "🐘 Neon Standard loaded — applying mandatory constraints:"
  echo "   ✅ Connection strings from SSM — never hardcoded"
  echo "   ✅ Two branches required: main (prod) + dev"
  echo "   ✅ App uses pooler URL (pgbouncer) — never the direct URL"
  echo "   ✅ Migrations use direct URL — NOT the pooler"
  echo "   ✅ SSL required: ssl: { rejectUnauthorized: false }"
  echo "   ✅ Serverless: use @neondatabase/serverless driver (not pg Pool)"
  echo "   ✅ docs/standards/neon.md must be created/updated"
  echo ""
fi
```

---

### `--cf`

Loads `.claude/standards/cf.md`. Use for any prompt deploying or configuring the frontend on Cloudflare Pages. (Not the AI gateway — use `/setup-ai-gateway` for that.)

```bash
CF_STANDARD=""
if echo "$*" | grep -q "\-\-cf"; then
  CF_STANDARD=$(cat .claude/standards/cf.md)
  echo "☁️  Cloudflare Pages Standard loaded — applying mandatory constraints:"
  echo "   ✅ frontend/wrangler.toml is the deployment config (root deprecated)"
  echo "   ✅ Build: opennextjs-cloudflare build (not next export)"
  echo "   ✅ Secrets in CF dashboard — NOT in wrangler.toml"
  echo "   ✅ NEXT_PUBLIC_* vars pulled from SSM BEFORE build"
  echo "   ✅ Production: main branch → custom domain"
  echo "   ✅ Preview: develop branch → develop.* subdomain"
  echo "   ✅ Clerk vars (PUBLISHABLE_KEY + SECRET_KEY) set in CF dashboard for both envs"
  echo "   ✅ docs/standards/cf.md must be created/updated"
  echo ""
fi
```

---

### `--shipping`

Loads `.claude/standards/shipping.md`. Use for any prompt adding shipping rate calculation, label generation, or tracking.

```bash
SHIPPING_STANDARD=""
if echo "$*" | grep -q "\-\-shipping"; then
  SHIPPING_STANDARD=$(cat .claude/standards/shipping.md)
  echo "📦 Shipping Standard loaded (Shippo) — applying mandatory constraints:"
  echo "   ✅ SHIPPO_API_KEY from SSM (test: shippo_test_... / live: shippo_live_...)"
  echo "   ✅ getShippo() singleton"
  echo "   ✅ Live rate calculation at checkout — never hardcoded shipping prices"
  echo "   ✅ Address validation before label purchase"
  echo "   ✅ Label via transaction.label_url — correct MIME type in response"
  echo "   ✅ track_updated webhook registered and handled"
  echo "   ✅ Parcel templates in config — not inline per-request"
  echo "   ✅ docs/standards/shipping.md must be created/updated"
  echo ""
fi
```

---

### `--analytics`

Loads `.claude/standards/analytics.md`. Use for any prompt adding GA4 tracking, event instrumentation, or conversion funnels. Reference implementation: DreamiHairCare (salon booking + e-commerce funnel).

```bash
ANALYTICS_STANDARD=""
if echo "$*" | grep -q "\-\-analytics"; then
  ANALYTICS_STANDARD=$(cat .claude/standards/analytics.md)
  echo "📊 Analytics Standard loaded (GA4) — applying mandatory constraints:"
  echo "   ✅ GA4_MEASUREMENT_ID from SSM — separate dev + prod properties"
  echo "   ✅ Script loaded via next/script afterInteractive — not blocking"
  echo "   ✅ GA4 recommended event names (purchase, begin_checkout, view_item, etc.)"
  echo "   ✅ Full 4-stage funnel: view_item → begin_checkout → add_payment_info → purchase"
  echo "   ✅ Server-side Measurement Protocol for purchase confirmation (Stripe webhook)"
  echo "   ❌ No PII in GA4 events (no email, phone, name)"
  echo "   ✅ DreamiHairCare pattern: booking_initiated + purchase for service bookings"
  echo "   ✅ docs/standards/analytics.md must be created/updated"
  echo ""
fi
```

---

### `--apple`

Loads `.claude/standards/apple-store.md`. Use when preparing an iOS app for App Store submission. Covers metadata, screenshots, review guidelines, and xcrun altool upload.

```bash
APPLE_STANDARD=""
if echo "$*" | grep -q "\-\-apple"; then
  APPLE_STANDARD=$(cat .claude/standards/apple-store.md)
  echo "🍎 Apple App Store Standard loaded — applying mandatory constraints:"
  echo "   ✅ Build + submit on QCS1 only — xcrun altool (NOT eas submit)"
  echo "   ✅ ASC Issuer: 14c760ad-a824-4520-8f71-78efdda81029"
  echo "   ✅ Build number higher than ALL previous TestFlight + App Store builds"
  echo "   ✅ xcrun altool --validate-app before --upload-app"
  echo "   ✅ TestFlight 24-48hr soak before submitting for review"
  echo "   ✅ Privacy policy URL live and linked in App Store Connect"
  echo "   ✅ App Privacy (data types) declared in App Store Connect"
  echo "   ✅ Screenshots: iPhone 6.9\" + 6.5\" required; iPad 12.9\" if tablet supported"
  echo "   ✅ Physical goods = Stripe OK; digital in-app content = Apple IAP required"
  echo "   ✅ docs/standards/apple-store.md must be created/updated"
  echo ""
fi
```

---

### `--google`

Loads `.claude/standards/google-play.md`. Use when preparing an Android app for Google Play Store submission. Covers AAB generation, Play Console, staged rollout, and Play Billing rules.

```bash
GOOGLE_STANDARD=""
if echo "$*" | grep -q "\-\-google"; then
  GOOGLE_STANDARD=$(cat .claude/standards/google-play.md)
  echo "🤖 Google Play Standard loaded — applying mandatory constraints:"
  echo "   ✅ Build signed AAB via EAS on QCS1: eas build --platform android --profile production"
  echo "   ✅ versionCode must increment with every release"
  echo "   ✅ Data Safety form filled in Play Console"
  echo "   ✅ Internal testing track → production staged rollout (start at 10%)"
  echo "   ✅ targetSdkVersion ≥ 34 (Google 2025 requirement)"
  echo "   ✅ Play App Signing enrolled — managed by Google"
  echo "   ✅ Physical goods = Stripe OK; digital subscriptions/consumables = Play Billing required"
  echo "   ✅ docs/standards/google-play.md must be created/updated"
  echo ""
fi
```

---

### `--admin`

Loads `.claude/standards/admin.md`. Use for any prompt building admin dashboards, admin-only routes, user management, or internal tooling.

```bash
ADMIN_STANDARD=""
if echo "$*" | grep -q "\-\-admin"; then
  ADMIN_STANDARD=$(cat .claude/standards/admin.md)
  echo "🔐 Admin Panel Standard loaded — applying mandatory constraints:"
  echo "   ✅ Double-gated: requireAuth middleware + role === 'admin' check"
  echo "   ✅ All admin routes under /api/admin/* with shared requireAdmin middleware"
  echo "   ✅ Admin role set via Clerk publicMetadata — never user-editable"
  echo "   ✅ Server-side pagination on all data tables (max 100 rows/page)"
  echo "   ✅ AuditLog entry on every destructive action"
  echo "   ✅ Standard pages: /admin (dashboard), /admin/users, /admin/orders, /admin/settings"
  echo "   ✅ ShadCN DataTable pattern for admin lists"
  echo "   ✅ docs/standards/admin.md must be created/updated"
  echo ""
fi
```

---

### `--profile`

Loads `.claude/standards/profile.md`. Use for any prompt building user profiles, profile editing, or wallet features (balance, top-up, transaction history).

```bash
PROFILE_STANDARD=""
if echo "$*" | grep -q "\-\-profile"; then
  PROFILE_STANDARD=$(cat .claude/standards/profile.md)
  echo "👤 User Profile Standard loaded — applying mandatory constraints:"
  echo "   ✅ Clerk is source of truth for identity — DB extends it"
  echo "   ✅ User table: clerkId (unique), email, name, role, walletBalance (denormalized)"
  echo "   ✅ WalletTransaction table: type, amount, balanceAfter, referenceId"
  echo "   ✅ Wallet top-up via Stripe Checkout (not Elements)"
  echo "   ✅ Top-up credited in checkout.session.completed webhook only"
  echo "   ✅ Avatar upload via S3 presigned POST — never through backend"
  echo "   ✅ Profile page sections: header, personal info, wallet summary, notification prefs, danger zone"
  echo "   ✅ WalletSummaryCard component with Add funds button + transaction list"
  echo "   ✅ PATCH /api/profile must never accept role or clerkId update"
  echo "   ✅ docs/standards/profile.md must be created/updated"
  echo ""
fi
```

---

### `--frontend`

Loads `.claude/standards/frontend.md`. Use for any prompt scaffolding a new frontend, adding pages, or setting up the frontend stack. Enforces the exact stack — no substitutions.

```bash
FRONTEND_STANDARD=""
if echo "$*" | grep -q "\-\-frontend"; then
  FRONTEND_STANDARD=$(cat .claude/standards/frontend.md)
  echo "⚛️  Frontend Stack Standard loaded — applying mandatory constraints:"
  echo "   ✅ Next.js 16 (App Router only — no Pages Router)"
  echo "   ✅ React 19 + TypeScript strict mode"
  echo "   ✅ Tailwind CSS with brand tokens (bg-brand-bg, text-brand-purple, etc.)"
  echo "   ✅ Apollo Client @3.11 — no React Query"
  echo "   ✅ @clerk/nextjs @6 — no other auth providers"
  echo "   ✅ Redux Toolkit @2.3 + Redux-Persist @6 — no Zustand/MobX"
  echo "   ✅ ShadCN UI — no Chakra/Material UI"
  echo "   ✅ Server components by default — 'use client' only when needed"
  echo "   ✅ Provider order: ClerkProvider → AuthSetup → ApolloProvider → Redux → PersistGate"
  echo "   ✅ Redux-Persist: whitelist cart/preferences, blacklist auth"
  echo "   ❌ No hardcoded hex colors in className — use brand-* tokens"
  echo "   ✅ docs/standards/frontend.md must be created/updated"
  echo ""
fi
```

The loaded standard is prepended to the prompt context before execution. Key overrides:
- If the prompt uses `useState` + `useEffect` for data fetching in a page component, the agent refactors to a server component with async/await
- If any `bg-[#09090F]` hardcoded color appears, the agent replaces with `bg-brand-bg` and ensures the token is in `tailwind.config.ts`
- If React Query or Zustand appear, the agent replaces with Apollo Client and Redux Toolkit

---

### `--mobile`

Loads `.claude/standards/mobile.md`. Use for any prompt building a React Native screen, component, or feature. Enforces the exact Expo stack — no substitutions. Stack with `--push`, `--eas`, `--apple-maps`, `--mapbox` for specific capabilities.

```bash
MOBILE_STANDARD=""
if echo "$*" | grep -q "\-\-mobile"; then
  MOBILE_STANDARD=$(cat .claude/standards/mobile.md)
  echo "📱 Mobile Stack Standard loaded — applying mandatory constraints:"
  echo "   ✅ Expo SDK 52 + Expo Router (file-based — no React Navigation manual setup)"
  echo "   ✅ NativeWind — no StyleSheet.create(), no inline style objects"
  echo "   ✅ Brand tokens: bg-brand-bg, text-brand-purple, text-brand-teal, etc."
  echo "   ✅ SafeAreaView on EVERY screen root — no exceptions"
  echo "   ✅ FlashList for all lists — no ScrollView + .map()"
  echo "   ✅ expo-image — not react-native Image"
  echo "   ✅ Min touch target: min-h-11 (44pt iOS) on all Pressable elements"
  echo "   ✅ accessibilityRole + accessibilityLabel on every interactive element"
  echo "   ✅ Clerk via @clerk/clerk-expo + SecureStore token cache (not AsyncStorage)"
  echo "   ✅ Redux-Persist with AsyncStorage (not localStorage)"
  echo "   ✅ Provider order: GestureHandler → SafeArea → Clerk → AuthSetup → Apollo → Redux → PersistGate"
  echo "   ✅ EXPO_PUBLIC_* prefix for env vars (not NEXT_PUBLIC_*)"
  echo "   ✅ Platform.OS gates required for iOS/Android differences"
  echo "   ✅ Haptic feedback (expo-haptics) on primary actions"
  echo "   ✅ Deep link scheme in app.json (required for Clerk OAuth)"
  echo "   ✅ Apollo Client: cache-and-network policy for offline reads"
  echo "   ❌ No React Navigation manual setup — Expo Router only"
  echo "   ❌ No StyleSheet.create() — NativeWind only"
  echo "   ❌ No TouchableHighlight — always Pressable"
  echo "   ✅ docs/standards/mobile.md must be created/updated"
  echo ""
fi
```

The loaded standard is prepended to the prompt context before execution. Key overrides:
- If the prompt uses `StyleSheet.create()`, the agent refactors to NativeWind `className`
- If `react-native Image` is imported, the agent replaces with `expo-image`
- If `ScrollView` + `.map()` is used for a list, the agent replaces with `FlashList`
- If any `Pressable` lacks `accessibilityRole`, the agent adds it
- If a screen root is a bare `View`, the agent wraps it in `SafeAreaView`

---

### `--backend`

Loads `.claude/standards/backend.md`. Use for any prompt scaffolding a new backend, adding routes, or setting up the backend stack. Enforces the exact stack — no substitutions.

```bash
BACKEND_STANDARD=""
if echo "$*" | grep -q "\-\-backend"; then
  BACKEND_STANDARD=$(cat .claude/standards/backend.md)
  echo "🖥️  Backend Stack Standard loaded — applying mandatory constraints:"
  echo "   ✅ Node.js 20 + Express @4 + TypeScript strict mode"
  echo "   ✅ Apollo Server @4 for GraphQL — no REST-only APIs"
  echo "   ✅ Sequelize @6 + PostgreSQL — no TypeORM/Prisma/Mongoose"
  echo "   ✅ Middleware order: helmet → cors → compression → morgan → raw(Stripe) → json → rateLimit"
  echo "   ✅ express.raw() for /api/webhooks/stripe — MUST come before express.json()"
  echo "   ✅ Clerk JWT verification in auth middleware (requireAuth)"
  echo "   ✅ GraphQL context: buildContext() wires userId + role + dataloaders"
  echo "   ✅ requireAuthCtx() + requireAdminCtx() helpers — never trust args.userId"
  echo "   ✅ DataLoader per request — no direct DB calls in resolvers"
  echo "   ✅ DB env vars: backend/.env.local + .env.develop + .env.production"
  echo "   ❌ No NestJS, TypeORM, Prisma, Mongoose"
  echo "   ✅ docs/standards/backend.md must be created/updated"
  echo ""
fi
```

The loaded standard is prepended to the prompt context before execution. Key overrides:
- If NestJS decorators appear, the agent refactors to Express
- If Prisma schema or TypeORM entities appear, the agent replaces with Sequelize models
- If resolvers query the DB directly without DataLoader, the agent refactors to use DataLoader
- If Stripe webhook body is parsed with `express.json()`, the agent fixes it to `express.raw()`

---

### `--status`

Shows a dashboard of which standards are implemented in this Heru and which tech docs are missing.

```bash
if echo "$*" | grep -q "\-\-status"; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  STANDARDS STATUS — $(basename $(pwd))"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  printf "  %-18s %-14s %-12s %s\n" "Standard" "Implemented" "Tech Doc" "Run with"
  echo "  ──────────────────────────────────────────────────────────────"

  check_standard() {
    local name=$1; local pattern=$2; local flag=$3
    local impl="❌ Missing"; local doc="❌ Missing"
    if eval "$pattern" 2>/dev/null | grep -q .; then impl="✅ Found"; fi
    if [ -f "docs/standards/${name}.md" ]; then doc="✅ Found"; fi
    printf "  %-18s %-14s %-12s %s\n" "$name" "$impl" "$doc" "$flag"
  }

  check_standard "clerk"       "grep -rl 'clerkMiddleware\|requireApiKey' src/ 2>/dev/null"     "--clerk"
  check_standard "stripe"      "grep -rl 'webhooks/stripe\|constructEvent' backend/src/ 2>/dev/null" "--stripe"
  check_standard "graphql"     "grep -rl 'typeDefs\|ApolloServer\|resolvers' src/ 2>/dev/null" "--graphql"
  check_standard "migrations"  "ls migrations/*.js 2>/dev/null || ls backend/src/migrations/*.ts 2>/dev/null" "--migrations"
  check_standard "multi-tenant" "grep -rl 'tenantId\|tenant_id' src/ 2>/dev/null"              "--multi-tenant"
  check_standard "testing"     "ls src/__tests__/**/*.test.ts 2>/dev/null || ls __tests__/**/*.test.ts 2>/dev/null" "--testing"
  check_standard "security"    "grep -rl 'helmet\|rateLimit' src/ backend/src/ 2>/dev/null"     "--security"
  check_standard "desktop"     "grep -rl 'SecretStorage\|contextBridge\|ipcMain' src/ 2>/dev/null" "--desktop"
  check_standard "design"      "ls mockups/ 2>/dev/null && ls docs/design-system.md 2>/dev/null" "--design"
  check_standard "twilio"      "grep -rl 'twilio\|getTwilioClient' src/ backend/src/ 2>/dev/null"  "--twilio"
  check_standard "slack"       "grep -rl 'WebClient\|getSlackClient\|slack' src/ backend/src/ 2>/dev/null" "--slack"
  check_standard "digital-pass" "grep -rl 'pkpass\|passkit\|PKPass\|GoogleWallet' src/ backend/src/ 2>/dev/null" "--digital-pass"
  check_standard "apple-maps"  "grep -rl 'PROVIDER_DEFAULT\|MapKit\|apple-maps' src/ 2>/dev/null"  "--apple-maps"
  check_standard "mapbox"      "grep -rl '@rnmapbox\|Mapbox\.' src/ 2>/dev/null"                   "--mapbox"
  check_standard "eas"         "ls eas.json 2>/dev/null"                                            "--eas"
  check_standard "push"        "grep -rl 'expo-notifications\|Notifications\.' src/ 2>/dev/null"   "--push"
  check_standard "neon"        "grep -rl 'neon\|@neondatabase\|neon.tech' backend/src/ 2>/dev/null" "--neon"
  check_standard "cf"          "ls frontend/wrangler.toml 2>/dev/null"                             "--cf"
  check_standard "shipping"    "grep -rl 'shippo\|getShippo\|SHIPPO' src/ backend/src/ 2>/dev/null" "--shipping"
  check_standard "analytics"   "grep -rl 'GA4\|gtag\|MEASUREMENT_ID' src/ frontend/src/ 2>/dev/null" "--analytics"
  check_standard "apple-store" "ls docs/standards/apple-store.md 2>/dev/null"                       "--apple"
  check_standard "google-play" "ls docs/standards/google-play.md 2>/dev/null"                       "--google"
  check_standard "admin"       "grep -rl 'requireAdmin\|/api/admin' src/ backend/src/ 2>/dev/null"  "--admin"
  check_standard "profile"     "grep -rl 'walletBalance\|WalletTransaction\|/api/profile' src/ backend/src/ 2>/dev/null" "--profile"
  check_standard "frontend"    "grep -rl 'redux-persist\|@apollo/client\|@clerk/nextjs' frontend/src/ 2>/dev/null"       "--frontend"
  check_standard "backend"     "grep -rl '@apollo/server\|sequelize\|requireAuth' backend/src/ 2>/dev/null"              "--backend"
  check_standard "mobile"      "ls mobile/app/_layout.tsx 2>/dev/null || ls app/_layout.tsx 2>/dev/null"                "--mobile"

  echo "  ──────────────────────────────────────────────────────────────"
  echo ""
  echo "  Missing tech docs can be created with: /pickup-prompt --<name> on any prompt"
  echo "  Tech docs live in: docs/standards/<name>.md (Heru-specific config)"
  echo ""
  exit 0
fi
```

---

### `--requirements`

Discovery intake for NEW Herus or MIGRATIONS from existing projects. Collects business requirements and generates PRD/BRD/VRD documents. Use BEFORE running `--all` or `/bootstrap-project`.

```bash
if echo "$*" | grep -q "\-\-requirements"; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  REQUIREMENTS INTAKE — $(basename $(pwd))"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  # Claude: ask the user for the following, then generate docs
  echo "  Collecting business requirements. Answer each prompt:"
  echo ""
  echo "  1. Heru name (e.g., 'DreamiHairCare', 'QuikCarRental')"
  echo "  2. Business type (e.g., 'salon booking', 'car rental marketplace')"
  echo "  3. Existing website URL (or 'none')"
  echo "  4. Target users (e.g., 'salon owners + their customers')"
  echo "  5. Key features needed (bullet list)"
  echo "  6. Is this a new project or migrating an existing one?"
  echo "  7. Any existing tech stack to preserve?"
  echo "  8. Notes / constraints / business goals"
  echo ""
  # Claude: gather answers, then:
  # 1. Fetch and analyze existing website if URL provided
  # 2. Run /analyze, /critically-think, /facts on the requirements
  # 3. Generate docs/PRD.md (product requirements)
  # 4. Generate docs/BRD.md (business requirements, if enough business context)
  # 5. Generate docs/VRD.md (visual requirements, if enough design context or existing site)
  # 6. Commit: feat(docs): generate PRD/BRD/VRD from requirements intake
  # 7. Tell user: "Run /pickup-prompt --all to generate implementation prompts"
  exit 0
fi
```

---

### `--all`

Lists every Auset platform module and shows which are implemented vs missing. Queues missing modules as prompts. Use after `--requirements` on new/migrated projects.

```bash
if echo "$*" | grep -q "\-\-all"; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  AUSET PLATFORM — FULL MODULE CHECKLIST"
  echo "  $(basename $(pwd))"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  # Claude: check for each Auset Standard Module and output status:
  # ✅ = implemented  ❌ = missing  ⚠️  = partial
  #
  # Core Platform
  # [ ] Clerk auth (sign-in, sign-up, middleware, webhook sync)
  # [ ] Stripe subscriptions (checkout, webhook, tier management)
  # [ ] User profile widget
  # [ ] Admin dashboard
  # [ ] CMS (content management)
  # [ ] CRM (customer management)
  #
  # Commerce
  # [ ] Shopping cart
  # [ ] Checkout flow
  # [ ] Order management
  # [ ] Product catalog
  #
  # Communications
  # [ ] Email notifications (SendGrid)
  # [ ] SMS notifications (Twilio)
  # [ ] Push notifications
  #
  # Infrastructure
  # [ ] Onboarding flow
  # [ ] GA4 analytics
  # [ ] Heru Feedback SDK
  # [ ] S3 file storage
  # [ ] Search
  # [ ] i18n (internationalization)
  # [ ] n8n automation workflows
  # [ ] CI/CD pipeline
  #
  # After listing, ask: "Queue all missing modules as prompts? (y/n)"
  # If y: generate prompt files in prompts/<date>/1-not-started/ for each missing module
  exit 0
fi

## Execution

### Step 0 — Pull latest + clean up merged prompt branches

Before looking for prompts, pull the latest and delete any prompt branches whose PRs have been merged (cleanup from the last run):

```bash
echo "Pulling latest from remote..."
git pull origin $(git branch --show-current) 2>&1
echo ""

echo "Cleaning up merged prompt branches from last run..."
gh pr list --state merged --json headRefName --jq '.[].headRefName' 2>/dev/null \
  | grep '^prompt/' \
  | while read BRANCH; do
      git branch -d "$BRANCH" 2>/dev/null || git branch -D "$BRANCH" 2>/dev/null
      git push origin --delete "$BRANCH" 2>/dev/null || true
      echo "  🗑️  Deleted merged branch: $BRANCH"
    done
echo ""
```

If the pull fails (merge conflict, dirty worktree), stop and report before proceeding.

### Step 1 — Resolve the prompt directory

```bash
YEAR=$(date +%Y)
MONTH=$(date +%B)    # Full month name: January, February, ...
DAY=$(date +%-d)     # Day without leading zero
PROMPT_DIR="prompts/${YEAR}/${MONTH}/${DAY}/1-not-started"

echo "Looking in: ${PROMPT_DIR}"
ls "${PROMPT_DIR}" 2>/dev/null || echo "No prompts directory found at ${PROMPT_DIR}"
```

### Step 2 — Loop: process every prompt until the queue is empty

**This is the main loop. Do NOT stop after one prompt. Do NOT ask the user to run the command again.**

```bash
while true; do
  # ── Find next prompt ──────────────────────────────────────────────────────
  if [ -n "$SPECIFIC_PROMPT" ]; then
    # Specific file requested (from ARGUMENTS)
    TARGET="${PROMPT_DIR}/${SPECIFIC_PROMPT}"
    [[ "$SPECIFIC_PROMPT" != *.md ]] && TARGET="${TARGET}.md"
    SPECIFIC_PROMPT=""  # only run specific once
  else
    TARGET=$(ls "${PROMPT_DIR}"/*.md 2>/dev/null | sort | head -1)
  fi

  if [ -z "$TARGET" ] || [ ! -f "$TARGET" ]; then
    echo ""
    echo "✅ Queue empty — all prompts processed for ${YEAR}/${MONTH}/${DAY}"
    echo "$(date '+%H:%M:%S') | $(basename $(pwd)) | QUEUE EMPTY | All prompts complete for ${YEAR}/${MONTH}/${DAY}" >> ~/auset-brain/Swarms/live-feed.md
    break
  fi

  PROMPT_NAME=$(basename "$TARGET" .md)

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "PICKING UP PROMPT: $(basename $TARGET)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # ── Move to in-progress ───────────────────────────────────────────────────
  IN_PROGRESS_DIR="prompts/${YEAR}/${MONTH}/${DAY}/2-in-progress"
  mkdir -p "$IN_PROGRESS_DIR"
  mv "$TARGET" "$IN_PROGRESS_DIR/"
  INPROGRESS_FILE="${IN_PROGRESS_DIR}/$(basename $TARGET)"
  echo "📋 Moved to: ${INPROGRESS_FILE}"

  # ── Read the prompt ───────────────────────────────────────────────────────
  cat "$INPROGRESS_FILE"
  echo ""

  # ── Create a DETACHED worktree (no branch yet) ────────────────────────────
  WORKTREE_PATH="/tmp/worktrees/${PROMPT_NAME}"
  mkdir -p "/tmp/worktrees"

  # Remove stale worktree if it exists from a prior interrupted run
  git worktree remove "$WORKTREE_PATH" --force 2>/dev/null || true
  rm -rf "$WORKTREE_PATH" 2>/dev/null || true

  # Create worktree detached from current HEAD (develop)
  git worktree add --detach "$WORKTREE_PATH" 2>/dev/null || {
    echo "ERROR: Could not create worktree at $WORKTREE_PATH"
    # Move prompt back to not-started on failure
    mv "$INPROGRESS_FILE" "$TARGET"
    break
  }

  echo "🌿 Detached worktree created: $WORKTREE_PATH"
  echo "All changes happen inside the worktree — not in the main checkout."
  echo ""

  # ── EXECUTE THE PROMPT ────────────────────────────────────────────────────
  # Read the prompt from 2-in-progress/ and follow ALL instructions in it.
  # All file edits happen inside $WORKTREE_PATH.
  # [Cursor agent: execute the prompt content shown above inside $WORKTREE_PATH]

  # ── Create branch FROM the worktree (after work is done) ─────────────────
  BRANCH_NAME="prompt/${YEAR}-$(date +%m)-$(date +%d)/${PROMPT_NAME}"
  BRANCH_NAME=$(echo "$BRANCH_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9\/\-]/-/g' | sed 's/-\+/-/g')

  cd "$WORKTREE_PATH"

  # Create the branch here (from the worktree's current state)
  git checkout -b "$BRANCH_NAME" 2>/dev/null || {
    echo "ERROR: Could not create branch $BRANCH_NAME in worktree"
    cd - > /dev/null
    git worktree remove "$WORKTREE_PATH" --force 2>/dev/null
    mv "$INPROGRESS_FILE" "$TARGET"
    break
  }

  echo "🌿 Branch created from worktree: $BRANCH_NAME"

  # ── Commit the work ───────────────────────────────────────────────────────
  git add -A

  COMMIT_MSG="feat: execute prompt ${PROMPT_NAME}

Prompt source: prompts/${YEAR}/${MONTH}/${DAY}/2-in-progress/$(basename $INPROGRESS_FILE)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

  git commit -m "$COMMIT_MSG" 2>/dev/null || echo "(nothing to commit — prompt may have been docs-only)"

  # ── Push the branch to GitHub ─────────────────────────────────────────────
  REMOTE=$(git remote | head -1)
  if [ -z "$REMOTE" ]; then
    echo "⚠️  No git remote found — skipping push and PR"
  else
    git push "$REMOTE" "$BRANCH_NAME" 2>&1
    echo ""
    echo "🚀 Pushed branch: $BRANCH_NAME → $REMOTE"

    # ── Create a PR on that branch ────────────────────────────────────────
    PR_TITLE="feat: ${PROMPT_NAME}"
    PR_BODY="## Prompt Execution

**Prompt:** \`${PROMPT_NAME}\`
**Date:** ${YEAR}/${MONTH}/${DAY}
**Source:** \`prompts/${YEAR}/${MONTH}/${DAY}/3-completed/$(basename $INPROGRESS_FILE)\`

## Summary
Executed by Cursor agent via \`/pickup-prompt\`. See prompt file for full task description.

## Review
Run \`/review-code\` to auto-detect this PR, review it, merge into develop, and delete the branch.

🤖 Generated with [Claude Code](https://claude.com/claude-code)"

    gh pr create \
      --title "$PR_TITLE" \
      --body "$PR_BODY" \
      --base develop \
      --head "$BRANCH_NAME" 2>&1

    PR_URL=$(gh pr list --head "$BRANCH_NAME" --json url --jq '.[0].url' 2>/dev/null)
    echo ""
    echo "📬 PR created: $PR_URL"
  fi

  # ── Return to main repo ───────────────────────────────────────────────────
  cd - > /dev/null

  # ── Move prompt to 3-completed ────────────────────────────────────────────
  COMPLETED_DIR="prompts/${YEAR}/${MONTH}/${DAY}/3-completed"
  mkdir -p "$COMPLETED_DIR"
  mv "$INPROGRESS_FILE" "$COMPLETED_DIR/"
  echo ""
  echo "✅ Prompt complete. Moved to: ${COMPLETED_DIR}/$(basename $INPROGRESS_FILE)"

  # ── Remove the worktree (branch stays in git history) ─────────────────────
  git worktree remove "$WORKTREE_PATH" --force 2>/dev/null
  echo "🧹 Worktree cleaned up: $WORKTREE_PATH"

  # ── Post progress to live feed ────────────────────────────────────────────
  echo "$(date '+%H:%M:%S') | $(basename $(pwd)) | PROMPT COMPLETE | ${PROMPT_NAME} | Branch: ${BRANCH_NAME} | PR: ${PR_URL:-N/A}" >> ~/auset-brain/Swarms/live-feed.md

  # ── Count remaining ───────────────────────────────────────────────────────
  REMAINING=$(ls "${PROMPT_DIR}"/*.md 2>/dev/null | wc -l | tr -d ' ')
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  if [ "$REMAINING" -gt 0 ]; then
    echo "📋 ${REMAINING} prompt(s) remaining — picking up next..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
  else
    echo "📋 0 prompts remaining — queue clear."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  fi

  # Loop continues automatically to the next prompt

done
```

## Directory Convention

```
prompts/
└── 2026/
    └── April/
        └── 12/
            ├── 1-not-started/     ← All prompts queue here
            │   ├── 01-web-navbar.md
            │   ├── 02-ecs-deploy.md
            │   └── 03-test-fix.md
            ├── 2-in-progress/     ← Moved here when agent starts (one at a time)
            └── 3-completed/       ← Moved here when work is done + PR opened
```

## Worktree Convention

```
/tmp/worktrees/
└── 01-web-navbar/       ← Detached worktree, cleaned up after PR is created

Branch created INSIDE the worktree (after work is done):
  prompt/2026-04-12/01-web-navbar

PR base:  develop
PR head:  prompt/2026-04-12/01-web-navbar
```

## Full Lifecycle Summary

```
Step 0: git pull + delete merged prompt branches from last run
    ↓
1-not-started/ → [pick up] → 2-in-progress/
    ↓
[create DETACHED worktree at /tmp/worktrees/<name>]
    ↓
[execute prompt — all edits inside worktree]
    ↓
[git checkout -b <branch> inside worktree]
[git commit]
[git push origin <branch>]
[gh pr create --base develop --head <branch>]
    ↓
3-completed/
[worktree removed]
    ↓
[LOOP — pick up next prompt automatically]
    ↓
[when 1-not-started/ is empty → post to live feed → done]
```

## Key Rules

- **Never stop after one prompt.** Loop until `1-not-started/` is empty.
- **Worktree is created DETACHED** — no branch at creation time.
- **Branch is created FROM the worktree AFTER work is done** — `git checkout -b` inside the worktree.
- **Worktree is deleted after the PR is opened** — the branch lives in GitHub.
- **On next run, Step 0 cleans up merged PR branches** — `git pull` + delete merged `prompt/*` branches.
- **All edits happen inside `$WORKTREE_PATH`** — never in the main checkout.
- Prompts are numbered (01-, 02-) — lower number = higher priority.
- If a worktree creation fails, the prompt is moved back to `1-not-started/` and the loop stops.

## Notes

- The worktree branch stays in GitHub as a record of what was done
- PR base is always `develop`
- Run `/review-code` after prompts complete — it auto-detects open prompt PRs, reviews, merges, and deletes the branches
- If `1-not-started/` is empty at start, posts "QUEUE EMPTY" to live feed and exits

## Command Metadata

```yaml
name: pickup-prompt
version: 3.7.0
changelog:
  - v3.7.0: Added --mobile flag (Expo SDK 52, Expo Router, NativeWind, Apollo, Clerk/expo, Redux-Persist/AsyncStorage, FlashList, expo-image, accessibility, deep linking, Platform.OS patterns)
  - v3.6.0: Added --profile (user profile + wallet), --frontend (Next.js 16 stack), --backend (Node/Express/Sequelize/Apollo stack); updated --clerk with ProfileWidget requirement; created clerk-auth.md standard (was missing)
  - v3.5.0: Added --shipping (Shippo), --analytics (GA4), --apple (App Store), --google (Play Store), --admin (admin panel) flags; updated --stripe with platform fees (min 7%), disputes, refunds, metadata requirements
  - v3.4.0: Added --twilio, --slack, --digital-pass, --apple-maps, --mapbox, --eas, --push, --neon, --cf flags (9 new integration standards)
  - v3.3.0: Added --design flag with surface variants (web/desktop/cli/mobile)
  - v3.2.0: Added --graphql, --migrations, --multi-tenant, --testing, --security, --desktop flags; added --status dashboard; added --requirements intake; added --all Auset module checklist
  - v3.1.0: Added --stripe flag; Stripe standard enforces dynamic pricing, webhook pattern, ngrok URL convention, SSM secrets
  - v3.0.0: Auto-loop all prompts; worktree detached then branch; gh pr create; cleanup merged branches on Step 0
  - v2.1.0: Added Step 0 git pull
  - v2.0.0: Worktree lifecycle (create → execute → push → cleanup)
  - v1.0.0: Initial release
```
