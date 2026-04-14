# Apple App Store Submission Standard

**Version:** 1.0.0
**Enforced by:** `/pickup-prompt --apple`

> All submissions happen on **QCS1** via `xcrun altool`. NEVER use `eas submit` (permanent 409 bug). NEVER submit from Amen Ra's local machine.

Covers: App Store Connect prep, metadata, screenshots, review guidelines compliance, and submission workflow.

---

## CRITICAL RULES

### 1. Build pipeline — QCS1 only, xcrun altool only

```bash
# ✅ Full submission workflow on QCS1
ssh -i ~/.ssh/quik-cloud ayoungboy@100.113.53.80

# Step 1: Unlock keychain
security unlock-keychain -p "$(cat ~/.agent-creds/keychain-password)" ~/Library/Keychains/login.keychain-db

# Step 2: Build production IPA
EXPO_TOKEN=$(cat ~/.expo_token) eas build --platform ios --profile production --local
# → produces ./build-*.ipa

# Step 3: Validate before upload (catches metadata errors early)
xcrun altool \
  --validate-app \
  --type ios \
  --file ./build-*.ipa \
  --apiIssuer "14c760ad-a824-4520-8f71-78efdda81029" \
  --apiKey "$ASC_KEY_ID" \
  --verbose

# Step 4: Upload to App Store Connect
xcrun altool \
  --upload-app \
  --type ios \
  --file ./build-*.ipa \
  --apiIssuer "14c760ad-a824-4520-8f71-78efdda81029" \
  --apiKey "$ASC_KEY_ID" \
  --verbose

# ❌ NEVER: eas submit --platform ios (permanent 409 error)
# ❌ NEVER: submit from local machine
```

---

### 2. Build number — must be higher than ALL previous TestFlight + App Store builds

```bash
# ✅ Before building, check App Store Connect for the highest build number
# App Store Connect → My Apps → [App] → TestFlight → All Builds
# Set app.json ios.buildNumber HIGHER than the max

# In app.config.js:
ios: {
  buildNumber: process.env.IOS_BUILD_NUMBER ?? "1",
  // Set IOS_BUILD_NUMBER in EAS secrets before building
}

# ❌ Reusing a build number = immediate rejection by App Store Connect
```

---

### 3. App Store metadata checklist (REQUIRED before submission)

```bash
# All fields must be filled in App Store Connect before submitting for review:

# App Information
✅ App name (max 30 chars)
✅ Subtitle (max 30 chars)
✅ Privacy Policy URL — must be live and accessible
✅ Support URL — must be live
✅ Category (primary + optional secondary)
✅ Age Rating questionnaire completed

# Version Information
✅ What's New text (for updates; skip for 1.0)
✅ Description (max 4000 chars)
✅ Keywords (max 100 chars — comma separated)
✅ Promotional Text (max 170 chars — can be updated without resubmission)

# Screenshots — REQUIRED SIZES (all must be provided):
✅ iPhone 6.9" (1320x2868 or 1290x2796) — iPhone 16 Pro Max
✅ iPhone 6.5" (1242x2688 or 1284x2778) — iPhone 14 Plus / 11 Pro Max
✅ iPad Pro 12.9" (2048x2732) — required if iPad supported

# Review Information
✅ Demo account credentials (if app requires sign-in)
✅ Notes for reviewer (explain any complex flows)
✅ Contact email/phone for reviewer
```

---

### 4. App Review Guidelines — common rejection reasons to fix before submitting

```typescript
// ✅ Guideline 2.1 — App Completeness
// All features must work. Remove any "coming soon" buttons or placeholder screens.
// If a feature requires sign-in, provide demo credentials in review notes.

// ✅ Guideline 3.1.1 — In-App Purchase
// Digital goods and subscriptions MUST use Apple IAP — not Stripe, not external links.
// Physical goods (shipping, services) = Stripe checkout is allowed.
// Guideline: if user CONSUMES the content in the app → IAP required
// If app is ordering something delivered physically → Stripe allowed

// ✅ Guideline 5.1.1 — Privacy
// All data collected must be disclosed in App Privacy section (Data Types)
// Location data, contacts, health data = require explicit justification

// ✅ Guideline 4.0 — Design
// Must follow iOS Human Interface Guidelines
// All touch targets ≥ 44×44pt
// No broken navigation or blank screens
// Dark mode tested (even if not officially supported)

// ❌ Common rejections:
// - Login required with no demo account in review notes
// - Missing privacy policy URL
// - Crashes on reviewer's device (test on real hardware before submitting)
// - External payment links for digital content (violates 3.1.1)
```

---

### 5. App Privacy — Data Types (fill in App Store Connect)

```bash
# App Store Connect → App Privacy → Privacy Nutrition Label
# Declare ALL data you collect. Under-declaring = rejection.

# Minimum declarations for most Quik Nation apps:
✅ Contact Info: Email Address (collected, linked to user, used for account)
✅ Identifiers: User ID (collected, linked to user)
✅ Usage Data: Product Interaction (collected, linked to user, analytics)
✅ Diagnostics: Crash Data (collected, not linked to user)

# If collecting location:
✅ Location: Precise Location or Coarse Location (declare usage + purpose)

# If collecting payment info:
✅ Financial Info: Payment Info (collected, linked to user)
# Note: if using Stripe Hosted Checkout, Stripe collects — you still declare it
```

---

### 6. TestFlight beta before production submission

```bash
# ✅ ALWAYS run TestFlight QA before submitting to App Store Review
# 1. Upload to TestFlight (same xcrun altool command)
# 2. Add internal testers (Amen Ra, Quik, QA team)
# 3. Minimum 24-48 hour TestFlight soak on production build
# 4. Verify: auth, payments, push notifications, deep links, crash-free
# 5. THEN submit to App Store Review from App Store Connect

# ✅ TestFlight upload command (same as production — just don't submit for review yet)
xcrun altool --upload-app --type ios --file ./build-*.ipa \
  --apiIssuer "14c760ad-a824-4520-8f71-78efdda81029" \
  --apiKey "$ASC_KEY_ID"

# After upload appears in TestFlight → test → then:
# App Store Connect → [version] → Submit for Review
```

---

### 7. Phased release (for updates)

```bash
# ✅ Use phased release for all updates after v1.0
# Rolls out to 1% → 2% → 5% → 10% → 20% → 50% → 100% over 7 days
# Pause rollout if crash rate spikes

# In App Store Connect → Version → [version] → Phased Release → Enable
# ❌ Full immediate release for major updates — too risky
```

---

### Heru-specific tech doc required

Each Heru submitting to the App Store MUST have `docs/standards/apple-store.md` documenting:
- Apple Team ID and Bundle Identifier
- App Store Connect App ID (numeric)
- ASC Key ID (stored in SSM)
- Current App Store version and build number
- TestFlight internal testers list
- IAP items (if any) — or explicit note that no IAP is used (physical goods = Stripe)
- Screenshots dimensions generated and where they're stored

If `docs/standards/apple-store.md` does not exist, create it.
