# EAS Build Standard

**Version:** 1.0.0
**Enforced by:** `/pickup-prompt --eas`

> ALL EAS builds happen on **QCS1** (Mac M4 Pro — ayoungboy@100.113.53.80). NEVER run EAS builds on Amen Ra's local machine (overheats under build load). NEVER use `eas submit` for TestFlight — it has a permanent 409 bug; use `xcrun altool` instead.

Covers: EAS Build configuration, QCS1 build workflow, TestFlight submission, and build environment.

---

## CRITICAL RULES

### 1. All builds run on QCS1 — not locally

```bash
# ✅ SSH to QCS1 first, then build
ssh -i ~/.ssh/quik-cloud ayoungboy@100.113.53.80
cd /path/to/project
EXPO_TOKEN=$(cat ~/.expo_token) eas build --platform ios --profile production

# ❌ Running eas build on Amen Ra's MacBook
# Local builds overheat the machine and tie up the dev environment
```

**QCS1 credentials:**
```
SSH key:    ~/.ssh/quik-cloud
Keychain:   ~/.agent-creds/keychain-password
EXPO_TOKEN: ~/.expo_token
ASC Issuer: 14c760ad-a824-4520-8f71-78efdda81029
```

---

### 2. Unlock keychain before ANY iOS build

```bash
# ✅ Step 1 — always unlock keychain on QCS1 before building
security unlock-keychain -p "$(cat ~/.agent-creds/keychain-password)" ~/Library/Keychains/login.keychain-db

# ✅ Step 2 — verify Expo auth
EXPO_TOKEN=$(cat ~/.expo_token) eas whoami

# ✅ Step 3 — verify ASC auth (correct issuer ID)
xcrun altool --list-providers --apiIssuer 14c760ad-a824-4520-8f71-78efdda81029 --apiKey $ASC_KEY_ID

# ❌ Starting a build without unlocking keychain first = codesign failure mid-build
```

---

### 3. TestFlight submission — use xcrun altool, NOT eas submit

```bash
# ✅ xcrun altool for TestFlight (reliable)
xcrun altool \
  --upload-app \
  --type ios \
  --file ./build.ipa \
  --apiIssuer "14c760ad-a824-4520-8f71-78efdda81029" \
  --apiKey "$ASC_KEY_ID" \
  --verbose

# ❌ NEVER use eas submit for TestFlight — permanent 409 error
# eas submit --platform ios  ← breaks every time
```

---

### 4. eas.json profiles — required structure

```json
// eas.json — at project root
{
  "cli": {
    "version": ">= 9.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m1-medium"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m1-medium",
        "buildConfiguration": "Release"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m1-medium",
        "buildConfiguration": "Release"
      },
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "[APP_STORE_CONNECT_APP_ID]",
        "appleTeamId": "[APPLE_TEAM_ID]"
      }
    }
  }
}
```

---

### 5. Build number — always higher than current TestFlight

```bash
# ✅ Before building, check the current TestFlight build number
# Then set a HIGHER build number in app.json/app.config.js

# Option A: Auto-increment via EAS (recommended)
# In app.config.js:
ios: {
  buildNumber: String(process.env.EAS_BUILD_NUMBER ?? "1"),
}
android: {
  versionCode: Number(process.env.EAS_BUILD_NUMBER ?? 1),
}

# Option B: Manual — check current, increment by 1
# Check: App Store Connect → My Apps → TestFlight tab
# Set: app.json ios.buildNumber = "currentBuildNumber + 1"

# ❌ Submitting a build number ≤ existing TestFlight build = rejected
```

---

### 6. No --clear-cache on FMO (Free Market Orders)

```bash
# ✅ Standard build (most projects)
EXPO_TOKEN=$(cat ~/.expo_token) eas build --platform ios --profile production

# ✅ Force clear cache ONLY when dependency conflicts persist after full clean
EXPO_TOKEN=$(cat ~/.expo_token) eas build --platform ios --profile production --clear-cache

# ❌ NEVER use --clear-cache on FMO without explicit authorization
# FMO's build cache is optimized — clearing it adds 15+ min to build time
# and can cause native dependency resolution issues
```

---

### 7. Local EAS build (when EAS cloud is unavailable)

```bash
# ✅ Local build on QCS1 (no cloud credits consumed)
EXPO_TOKEN=$(cat ~/.expo_token) eas build --platform ios --profile production --local

# Output: ./build-*.ipa
# Submit with xcrun altool after local build

# ❌ Local builds on Amen Ra's machine — see Rule 1
```

---

### 8. Environment secrets — use EAS Secrets, not .env files in builds

```bash
# ✅ Store secrets in EAS (synced from SSM)
eas secret:create --scope project --name STRIPE_SECRET_KEY --value "$(aws ssm get-parameter --name /[project]/prod/STRIPE_SECRET_KEY --with-decryption --query Parameter.Value --output text)"

# ✅ Reference in app.config.js
process.env.STRIPE_SECRET_KEY  // available at build time via EAS

# ❌ .env files committed to repo for EAS builds
# ❌ Passing secrets as --build-arg in eas.json
```

---

### Build Preflight Checklist (run before EVERY iOS build)

```bash
# 1. Unlock keychain
security unlock-keychain -p "$(cat ~/.agent-creds/keychain-password)" ~/Library/Keychains/login.keychain-db

# 2. Verify Expo auth
EXPO_TOKEN=$(cat ~/.expo_token) eas whoami

# 3. Verify ASC — correct issuer
xcrun altool --list-providers --apiIssuer 14c760ad-a824-4520-8f71-78efdda81029 --apiKey $ASC_KEY_ID

# 4. Check current TestFlight build number — set app.json HIGHER

# 5. Build
EXPO_TOKEN=$(cat ~/.expo_token) eas build --platform ios --profile production

# 6. Submit with xcrun altool (NOT eas submit)
xcrun altool --upload-app --type ios --file ./build.ipa \
  --apiIssuer "14c760ad-a824-4520-8f71-78efdda81029" \
  --apiKey "$ASC_KEY_ID"
```

---

### Heru-specific tech doc required

Each Heru using EAS MUST have `docs/standards/eas.md` documenting:
- App Store Connect App ID and bundle identifier
- Apple Team ID (stored in SSM)
- ASC API Key ID (stored in SSM at `/quik-nation/shared/ASC_KEY_ID`)
- Current TestFlight build number (track manually)
- Google Play service account location (for Android submissions)
- Any FMO-specific restrictions on `--clear-cache`

If `docs/standards/eas.md` does not exist, create it.
