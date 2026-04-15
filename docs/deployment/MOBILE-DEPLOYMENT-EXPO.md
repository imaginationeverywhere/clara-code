# Mobile App Deployment Guide - Expo

This guide covers deploying React Native mobile apps built with Expo to both the Apple App Store and Google Play Store.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Expo Setup](#expo-setup)
3. [App Configuration](#app-configuration)
4. [Building for iOS (Apple App Store)](#building-for-ios-apple-app-store)
5. [Building for Android (Google Play Store)](#building-for-android-google-play-store)
6. [Submitting to Apple App Store](#submitting-to-apple-app-store)
7. [Submitting to Google Play Store](#submitting-to-google-play-store)
8. [Over-the-Air (OTA) Updates](#over-the-air-ota-updates)
9. [Environment Variables & Secrets](#environment-variables--secrets)
10. [Continuous Deployment with GitHub Actions](#continuous-deployment-with-github-actions)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

**For iOS (Apple App Store):**
- Apple Developer Account ($99/year)
  - Sign up at: https://developer.apple.com/programs/
- Apple ID with 2FA enabled
- Access to a Mac (for some signing operations)

**For Android (Google Play Store):**
- Google Play Console Account ($25 one-time fee)
  - Sign up at: https://play.google.com/console/signup
- Google Account

**For Expo:**
- Expo Account (free)
  - Sign up at: https://expo.dev/signup
- EAS CLI installed globally

### Required Tools

```bash
# Install Expo CLI
npm install -g expo-cli

# Install EAS CLI (Expo Application Services)
npm install -g eas-cli

# Verify installations
expo --version
eas --version
```

---

## Expo Setup

### 1. Initialize Expo in Your Project

If your mobile app isn't already using Expo:

```bash
cd mobile/

# Initialize Expo
expo init .

# Or if you have an existing React Native project, install Expo
npx install-expo-modules@latest
```

### 2. Login to Expo

```bash
# Login to your Expo account
expo login
# or
eas login

# Verify login
expo whoami
```

### 3. Configure EAS

```bash
cd mobile/

# Initialize EAS
eas build:configure

# This creates:
# - eas.json (build configuration)
```

---

## App Configuration

### 1. Update `app.json`

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0,
      "url": "https://u.expo.dev/[your-project-id]"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.yourapp",
      "buildNumber": "1.0.0",
      "infoPlist": {
        "NSCameraUsageDescription": "This app uses the camera to...",
        "NSPhotoLibraryUsageDescription": "This app accesses your photos to...",
        "NSLocationWhenInUseUsageDescription": "This app uses your location to..."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourcompany.yourapp",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "ACCESS_FINE_LOCATION"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    },
    "owner": "your-expo-username"
  }
}
```

### 2. Configure `eas.json`

```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false,
        "buildType": "adhoc"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "ios": {
        "buildType": "archive"
      },
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-asc-app-id",
        "appleTeamId": "your-team-id"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

### 3. Create Required Assets

```bash
# iOS icon (1024x1024 PNG)
mobile/assets/icon.png

# iOS splash screen (at least 2048x2048 PNG)
mobile/assets/splash.png

# Android adaptive icon (1024x1024 PNG with transparency)
mobile/assets/adaptive-icon.png

# Favicon (for web builds)
mobile/assets/favicon.png
```

**Tip**: Use https://www.appicon.co/ to generate all required icon sizes.

---

## Building for iOS (Apple App Store)

### Step 1: Prepare iOS Credentials

#### Option A: Let EAS Handle Credentials (Recommended)
```bash
# EAS will automatically create and manage your credentials
eas build --platform ios
```

#### Option B: Provide Your Own Credentials
```bash
# Generate credentials manually
eas credentials

# Select iOS → Production
# Upload:
# - Distribution certificate (.p12)
# - Provisioning profile (.mobileprovision)
```

### Step 2: Build for iOS Production

```bash
cd mobile/

# Build for production (App Store)
eas build --platform ios --profile production

# Build will run in Expo's cloud
# Wait 10-30 minutes for build to complete
```

**Output**: You'll get a `.ipa` file download URL.

### Step 3: Download the Build

```bash
# Download the .ipa file
eas build:download --platform ios --profile production

# Or download from the Expo dashboard:
# https://expo.dev/accounts/[your-account]/projects/[your-project]/builds
```

### Step 4: Verify the Build Locally (Optional)

```bash
# Install on iOS Simulator (development builds only)
eas build --platform ios --profile development
# Then install the .app file on simulator

# Install on physical device via TestFlight (see submission section)
```

---

## Building for Android (Google Play Store)

### Step 1: Prepare Android Credentials

#### Option A: Let EAS Handle Credentials (Recommended)
```bash
# EAS will automatically create a keystore
eas build --platform android
```

#### Option B: Provide Your Own Keystore
```bash
# Generate keystore manually
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore my-app-key.keystore \
  -alias my-app-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Upload to EAS
eas credentials
# Select Android → Production → Keystore
# Upload my-app-key.keystore
```

### Step 2: Build for Android Production

```bash
cd mobile/

# Build AAB (Android App Bundle) for Play Store
eas build --platform android --profile production

# Or build APK for direct distribution (testing)
eas build --platform android --profile preview

# Wait 10-20 minutes for build to complete
```

**Output**: You'll get either:
- `.aab` file (for Play Store)
- `.apk` file (for direct installation/testing)

### Step 3: Download the Build

```bash
# Download the .aab file
eas build:download --platform android --profile production

# Or download from Expo dashboard:
# https://expo.dev/accounts/[your-account]/projects/[your-project]/builds
```

### Step 4: Test the APK Locally (Optional)

```bash
# Build APK for testing
eas build --platform android --profile preview

# Install on emulator or physical device
adb install path/to/your-app.apk

# Or drag and drop APK onto emulator
```

---

## Submitting to Apple App Store

### Step 1: Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com/
2. Click **My Apps** → **+** → **New App**
3. Fill in details:
   - **Platform**: iOS
   - **Name**: Your app name
   - **Primary Language**: English
   - **Bundle ID**: Must match `ios.bundleIdentifier` in app.json
   - **SKU**: Unique identifier (e.g., your-app-sku-001)
4. Click **Create**

### Step 2: Prepare App Information

In App Store Connect, fill out:

**App Information**:
- Privacy Policy URL
- Category
- Content Rights

**Pricing and Availability**:
- Price tier (Free or Paid)
- Availability by country

**App Privacy**:
- Data collection practices
- Privacy policy

### Step 3: Submit Build Using EAS

```bash
cd mobile/

# Automatic submission (easiest)
eas submit --platform ios --profile production

# EAS will:
# 1. Upload your .ipa to App Store Connect
# 2. Link it to your app
# 3. Make it available for TestFlight

# Follow prompts:
# - Enter Apple ID
# - Enter App-Specific Password (generate at appleid.apple.com)
# - Select app from list
```

### Step 4: Manual Submission (Alternative)

If you prefer manual submission:

```bash
# 1. Download .ipa file
eas build:download --platform ios --profile production

# 2. Upload to App Store Connect using Transporter app
# Download Transporter: https://apps.apple.com/us/app/transporter/id1450874784
# Drag .ipa file into Transporter and deliver
```

### Step 5: Prepare for Review

In App Store Connect:

1. **Screenshots**: Upload screenshots for all required device sizes
   - iPhone 6.7" (required)
   - iPhone 6.5" (required)
   - iPad Pro 12.9" (if tablet support)

2. **App Description**:
   - Description
   - Keywords
   - Support URL
   - Marketing URL (optional)

3. **Version Information**:
   - What's New in This Version
   - Promotional Text (optional)

4. **Build**: Select the build you uploaded

5. **App Review Information**:
   - Contact information
   - Demo account credentials (if login required)
   - Notes for reviewer

6. **Version Release**: Choose when to release after approval

### Step 6: Submit for Review

1. Click **Submit for Review**
2. Wait for Apple review (typically 24-48 hours)
3. Check email for status updates

### TestFlight Distribution (Optional)

TestFlight allows beta testing before App Store release:

```bash
# Build is automatically available in TestFlight after submission
# In App Store Connect:
# 1. Go to TestFlight tab
# 2. Add internal testers (up to 100, no review needed)
# 3. Add external testers (unlimited, requires review)
# 4. Testers receive email invitation
```

---

## Submitting to Google Play Store

### Step 1: Create App in Google Play Console

1. Go to https://play.google.com/console/
2. Click **Create app**
3. Fill in details:
   - **App name**: Your app name
   - **Default language**: English
   - **App or game**: Select type
   - **Free or paid**: Select pricing
4. Accept declarations
5. Click **Create app**

### Step 2: Complete Store Listing

In Google Play Console, complete:

**Main store listing**:
- App name
- Short description (80 characters)
- Full description (4000 characters)
- App icon (512x512 PNG)
- Feature graphic (1024x500 PNG)
- Screenshots (at least 2 per device type):
  - Phone: 16:9 or 9:16 ratio
  - 7-inch tablet (optional)
  - 10-inch tablet (optional)

**Contact details**:
- Email address
- Website (optional)
- Phone number (optional)

**Privacy Policy**:
- Privacy policy URL (required)

**App category**:
- Category
- Tags (optional)

### Step 3: Set Up Content Rating

1. Go to **Content rating** section
2. Start questionnaire
3. Answer questions about your app's content
4. Submit for rating (instant)

### Step 4: Set Up Target Audience

1. Go to **Target audience** section
2. Select target age range
3. Confirm if app appeals to children
4. Save

### Step 5: Create Production Release

```bash
cd mobile/

# Automatic submission (easiest)
eas submit --platform android --profile production

# EAS will:
# 1. Upload your .aab to Google Play Console
# 2. Create a production release
# 3. Associate it with your app

# Follow prompts:
# - Select your app from list
# - Confirm submission
```

### Step 6: Manual Submission (Alternative)

If you prefer manual submission:

1. Download .aab file:
```bash
eas build:download --platform android --profile production
```

2. In Google Play Console:
   - Go to **Production** → **Create new release**
   - Click **Upload** and select your `.aab` file
   - Add release notes
   - Review release
   - Click **Start rollout to Production**

### Step 7: Service Account for Automated Submission

For automated submissions, create a service account:

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable **Google Play Android Developer API**
4. Create Service Account:
   - Go to **IAM & Admin** → **Service Accounts**
   - Click **Create Service Account**
   - Name: `expo-play-upload`
   - Grant role: **Service Account User**
   - Click **Create Key** → **JSON**
   - Download `google-service-account.json`

5. In Google Play Console:
   - Go to **Setup** → **API access**
   - Click **Link** next to your service account
   - Grant **Release Manager** permissions

6. Add to your project:
```bash
# Place in mobile/
mobile/google-service-account.json

# Add to .gitignore
echo "google-service-account.json" >> .gitignore

# Update eas.json with path
"submit": {
  "production": {
    "android": {
      "serviceAccountKeyPath": "./google-service-account.json"
    }
  }
}
```

### Step 8: Complete Review and Publish

1. Review all sections in Google Play Console
2. Fix any issues marked with ⚠️
3. Click **Send for review**
4. Wait for Google review (typically 1-3 days)
5. Once approved, app will be live on Play Store

---

## Over-the-Air (OTA) Updates

Expo allows pushing updates without going through app store reviews for JavaScript and asset changes.

### Setup EAS Update

```bash
cd mobile/

# Configure updates
eas update:configure

# Publish an update
eas update --branch production --message "Fix user profile bug"

# Update specific platform
eas update --branch production --platform ios --message "iOS fix"
```

### Update Configuration in app.json

```json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/[your-project-id]",
      "enabled": true,
      "checkAutomatically": "ON_LOAD",
      "fallbackToCacheTimeout": 0
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    }
  }
}
```

### Publishing Updates

```bash
# Production update
eas update --branch production --message "Bug fixes and improvements"

# Preview/Staging update
eas update --branch preview --message "Testing new feature"

# View update history
eas update:list --branch production
```

### Important OTA Limitations

**Can be updated via OTA**:
- ✅ JavaScript code changes
- ✅ Asset updates (images, fonts)
- ✅ Bug fixes
- ✅ UI tweaks

**Cannot be updated via OTA (requires new build)**:
- ❌ Native code changes (Swift, Kotlin)
- ❌ New native dependencies
- ❌ Permission changes (camera, location)
- ❌ app.json configuration changes (bundle ID, version)
- ❌ Expo SDK version upgrades

---

## Environment Variables & Secrets

### Using Expo Environment Variables

```bash
# Create .env files
mobile/.env.development
mobile/.env.production

# Example .env.production:
API_URL=https://api.yourapp.com
STRIPE_PUBLISHABLE_KEY=pk_live_...
SENTRY_DSN=https://...
```

### Configure in app.config.js

Replace `app.json` with `app.config.js`:

```javascript
// mobile/app.config.js
import 'dotenv/config';

export default {
  expo: {
    name: process.env.APP_NAME || 'Your App',
    slug: 'your-app-slug',
    version: '1.0.0',
    extra: {
      apiUrl: process.env.API_URL,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      sentryDsn: process.env.SENTRY_DSN,
      eas: {
        projectId: process.env.EAS_PROJECT_ID
      }
    }
  }
};
```

### Access in Your App

```typescript
// src/config/env.ts
import Constants from 'expo-constants';

export const config = {
  apiUrl: Constants.expoConfig?.extra?.apiUrl,
  stripePublishableKey: Constants.expoConfig?.extra?.stripePublishableKey,
  sentryDsn: Constants.expoConfig?.extra?.sentryDsn,
};

// Usage in app:
import { config } from './config/env';
fetch(`${config.apiUrl}/users`);
```

### EAS Secrets

Store sensitive values in EAS:

```bash
# Add secrets to EAS
eas secret:create --scope project --name STRIPE_SECRET_KEY --value sk_live_...
eas secret:create --scope project --name DATABASE_URL --value postgresql://...

# List secrets
eas secret:list

# Use in builds (automatically injected as environment variables)
# Access via process.env.STRIPE_SECRET_KEY in build scripts
```

---

## Continuous Deployment with GitHub Actions

### GitHub Actions Workflow for iOS

```yaml
# .github/workflows/deploy-ios.yml
name: Deploy iOS to TestFlight

on:
  push:
    branches:
      - main
    paths:
      - 'mobile/**'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: cd mobile && npm install

      - name: Build iOS
        run: cd mobile && eas build --platform ios --profile production --non-interactive --no-wait

      - name: Submit to TestFlight
        run: cd mobile && eas submit --platform ios --profile production --latest --non-interactive
```

### GitHub Actions Workflow for Android

```yaml
# .github/workflows/deploy-android.yml
name: Deploy Android to Play Store

on:
  push:
    branches:
      - main
    paths:
      - 'mobile/**'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: cd mobile && npm install

      - name: Build Android
        run: cd mobile && eas build --platform android --profile production --non-interactive --no-wait

      - name: Submit to Play Store
        run: cd mobile && eas submit --platform android --profile production --latest --non-interactive
```

### Required GitHub Secrets

Add these secrets to your GitHub repository:

```bash
# Go to GitHub repo → Settings → Secrets → Actions

# Add these secrets:
EXPO_TOKEN                    # Get from: expo login && eas whoami
APPLE_APP_SPECIFIC_PASSWORD   # Generate at appleid.apple.com
GOOGLE_SERVICE_ACCOUNT_KEY    # Content of google-service-account.json
```

---

## Troubleshooting

### iOS Build Issues

**Issue: "Invalid Bundle Identifier"**
```bash
# Ensure bundle ID matches Apple Developer account
# Check app.json:
"ios": {
  "bundleIdentifier": "com.yourcompany.yourapp"
}

# Must match App ID in Apple Developer Portal
```

**Issue: "Provisioning Profile Error"**
```bash
# Reset credentials
eas credentials

# Delete and recreate provisioning profile
# Select iOS → Production → Provisioning Profile → Remove
# Then rebuild: eas build --platform ios
```

**Issue: "Build Timeout"**
```bash
# Reduce app size:
# - Remove unused dependencies
# - Optimize images (use compression)
# - Check for large node_modules

# Or upgrade EAS plan for more build time
```

### Android Build Issues

**Issue: "Duplicate Resources"**
```bash
# Clean build
cd mobile/android
./gradlew clean

# Or use EAS clean build
eas build --platform android --clear-cache
```

**Issue: "Keystore Password Error"**
```bash
# Reset keystore
eas credentials
# Select Android → Production → Keystore → Remove
# Rebuild to generate new keystore
```

**Issue: "AAB vs APK Confusion"**
```bash
# For Play Store, use AAB:
eas build --platform android --profile production

# For direct install/testing, use APK:
eas build --platform android --profile preview
```

### Submission Issues

**Issue: "App Store Connect Upload Failed"**
```bash
# Check Apple ID and app-specific password
eas submit --platform ios --profile production

# Generate new app-specific password at:
# https://appleid.apple.com/account/manage → App-Specific Passwords
```

**Issue: "Google Play Service Account Error"**
```bash
# Verify service account has correct permissions:
# 1. Go to Google Play Console → Setup → API access
# 2. Check service account has "Release Manager" role
# 3. Ensure API is enabled in Google Cloud Console

# Re-download and replace google-service-account.json
```

**Issue: "Rejected for Missing Information"**
```bash
# iOS: Check App Store Connect for required screenshots/descriptions
# Android: Complete all sections in Google Play Console:
#   - Store listing
#   - Content rating
#   - Target audience
#   - Privacy policy
```

### OTA Update Issues

**Issue: "Update Not Downloading"**
```bash
# Check update configuration in app.json
"updates": {
  "enabled": true,
  "checkAutomatically": "ON_LOAD"
}

# Force check for updates in app:
import * as Updates from 'expo-updates';
await Updates.fetchUpdateAsync();
```

**Issue: "Runtime Version Mismatch"**
```bash
# Ensure app was built with updates enabled
# Check eas.json has correct update configuration

# Rebuild app if updates weren't enabled during initial build
eas build --platform all --profile production
```

---

## Best Practices

### Version Management

```bash
# Increment version for each release
# iOS: Update both version and buildNumber in app.json
"ios": {
  "buildNumber": "1.0.1"  # Increment for each build
}

# Android: Update both version and versionCode
"android": {
  "versionCode": 2  # Must be integer, increment by 1
}

# Semantic versioning recommended: MAJOR.MINOR.PATCH
"version": "1.2.3"
```

### Release Checklist

- [ ] Test on both iOS and Android devices
- [ ] Update version numbers in app.json
- [ ] Update release notes/changelogs
- [ ] Test with production API
- [ ] Verify all environment variables are correct
- [ ] Check app icons and splash screens
- [ ] Review permissions and privacy settings
- [ ] Test OTA updates (if implemented)
- [ ] Screenshot new features for store listing
- [ ] Update store descriptions if needed

### Security Best Practices

- Use EAS Secrets for sensitive values
- Never commit credentials or API keys
- Use app-specific passwords for Apple submissions
- Rotate service account keys periodically
- Enable 2FA on all accounts
- Use separate staging/production credentials

---

## Additional Resources

**Expo Documentation**:
- EAS Build: https://docs.expo.dev/build/introduction/
- EAS Submit: https://docs.expo.dev/submit/introduction/
- EAS Update: https://docs.expo.dev/eas-update/introduction/

**App Store Resources**:
- App Store Connect: https://appstoreconnect.apple.com/
- App Store Guidelines: https://developer.apple.com/app-store/review/guidelines/
- TestFlight: https://developer.apple.com/testflight/

**Google Play Resources**:
- Google Play Console: https://play.google.com/console/
- Launch Checklist: https://developer.android.com/distribute/best-practices/launch/launch-checklist
- App Content Policy: https://play.google.com/about/developer-content-policy/

---

**Need help?** Check the [troubleshooting section](#troubleshooting) or refer to Expo's support: https://expo.dev/support

Happy shipping! 🚀
