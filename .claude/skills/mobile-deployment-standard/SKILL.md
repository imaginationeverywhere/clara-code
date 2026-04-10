---
name: mobile-deployment-standard
description: Implement mobile app deployment for iOS App Store and Google Play with Fastlane, EAS Build, and CI/CD. Use when deploying mobile apps, setting up code signing, or automating releases. Triggers on requests for app store deployment, Fastlane setup, EAS Build, or mobile CI/CD.
---

# Mobile Deployment Standard Skill

Enterprise-grade mobile app deployment patterns for iOS App Store and Google Play Store. Includes CI/CD automation with GitHub Actions, Fastlane, EAS Build, code signing, and release management.

## Skill Metadata

```yaml
name: mobile-deployment-standard
version: 1.0.0
category: mobile
dependencies:
  - fastlane (iOS/Android automation)
  - eas-cli (Expo Application Services)
  - gradle (Android builds)
  - xcodebuild (iOS builds)
triggers:
  - mobile deployment
  - app store release
  - iOS deployment
  - Android deployment
  - mobile CI/CD
```

## Deployment Overview

### Release Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    Development                               │
│  Code → PR → Code Review → Merge to develop                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Testing/Staging                           │
│  develop branch → Internal Testing (TestFlight/Internal)    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Production Release                        │
│  main branch → App Store / Play Store                       │
└─────────────────────────────────────────────────────────────┘
```

## iOS Deployment

### App Store Connect Setup

1. **Prerequisites**
   - Apple Developer account ($99/year)
   - App Store Connect access
   - Valid bundle identifier
   - App ID registered in Developer Portal

2. **Certificates and Provisioning**
   - Development certificate
   - Distribution certificate
   - Provisioning profiles (Development, Ad Hoc, App Store)

### Fastlane Setup for iOS

```ruby
# mobile/ios/fastlane/Fastfile
default_platform(:ios)

platform :ios do
  desc "Push a new beta build to TestFlight"
  lane :beta do
    # Ensure we're on the right branch
    ensure_git_branch(branch: 'develop')

    # Increment build number
    increment_build_number(xcodeproj: "YourApp.xcodeproj")

    # Build the app
    build_app(
      workspace: "YourApp.xcworkspace",
      scheme: "YourApp",
      export_method: "app-store",
      export_options: {
        provisioningProfiles: {
          "com.yourcompany.yourapp" => "YourApp Distribution"
        }
      }
    )

    # Upload to TestFlight
    upload_to_testflight(
      skip_waiting_for_build_processing: true
    )

    # Clean up
    clean_build_artifacts

    # Notify team
    slack(
      message: "New iOS beta build uploaded to TestFlight!",
      channel: "#releases"
    )
  end

  desc "Push a new release build to the App Store"
  lane :release do
    # Ensure we're on the right branch
    ensure_git_branch(branch: 'main')

    # Increment version number
    increment_version_number(
      bump_type: "patch" # or "minor" or "major"
    )
    increment_build_number(xcodeproj: "YourApp.xcodeproj")

    # Build the app
    build_app(
      workspace: "YourApp.xcworkspace",
      scheme: "YourApp",
      export_method: "app-store"
    )

    # Upload to App Store
    upload_to_app_store(
      submit_for_review: false,
      automatic_release: false,
      force: true,
      precheck_include_in_app_purchases: false
    )

    # Create git tag
    add_git_tag(tag: "ios-v#{get_version_number}")
    push_to_git_remote

    # Notify team
    slack(
      message: "New iOS release uploaded to App Store Connect!",
      channel: "#releases"
    )
  end

  desc "Sync certificates and profiles with match"
  lane :sync_certs do
    match(
      type: "appstore",
      readonly: true
    )
    match(
      type: "development",
      readonly: true
    )
  end
end
```

### Match for Certificate Management

```ruby
# mobile/ios/fastlane/Matchfile
git_url("git@github.com:yourcompany/certificates.git")
storage_mode("git")
type("appstore") # or "development", "adhoc"
app_identifier(["com.yourcompany.yourapp"])
username("your@email.com")
```

### iOS Build Configuration

```ruby
# mobile/ios/fastlane/Appfile
app_identifier("com.yourcompany.yourapp")
apple_id("your@email.com")
itc_team_id("123456789") # App Store Connect Team ID
team_id("ABCD123456") # Developer Portal Team ID
```

## Android Deployment

### Google Play Console Setup

1. **Prerequisites**
   - Google Play Developer account ($25 one-time)
   - Google Play Console access
   - Service account with appropriate permissions
   - Signing key stored securely

2. **Keystore Management**
   ```bash
   # Generate release keystore (once, keep secure!)
   keytool -genkey -v -keystore release.keystore -alias release \
     -keyalg RSA -keysize 2048 -validity 10000
   ```

### Fastlane Setup for Android

```ruby
# mobile/android/fastlane/Fastfile
default_platform(:android)

platform :android do
  desc "Build and upload to internal testing"
  lane :beta do
    # Ensure we're on the right branch
    ensure_git_branch(branch: 'develop')

    # Increment version code
    increment_version_code(
      gradle_file_path: "app/build.gradle"
    )

    # Build release bundle
    gradle(
      task: "clean bundleRelease",
      properties: {
        "android.injected.signing.store.file" => ENV["KEYSTORE_PATH"],
        "android.injected.signing.store.password" => ENV["KEYSTORE_PASSWORD"],
        "android.injected.signing.key.alias" => ENV["KEY_ALIAS"],
        "android.injected.signing.key.password" => ENV["KEY_PASSWORD"]
      }
    )

    # Upload to internal testing track
    upload_to_play_store(
      track: "internal",
      release_status: "completed",
      aab: "app/build/outputs/bundle/release/app-release.aab"
    )

    # Notify team
    slack(
      message: "New Android beta build uploaded to internal testing!",
      channel: "#releases"
    )
  end

  desc "Deploy a new version to the Google Play Store"
  lane :release do
    # Ensure we're on the right branch
    ensure_git_branch(branch: 'main')

    # Increment version
    increment_version_code(
      gradle_file_path: "app/build.gradle"
    )
    increment_version_name(
      gradle_file_path: "app/build.gradle",
      bump_type: "patch"
    )

    # Build release bundle
    gradle(
      task: "clean bundleRelease",
      properties: {
        "android.injected.signing.store.file" => ENV["KEYSTORE_PATH"],
        "android.injected.signing.store.password" => ENV["KEYSTORE_PASSWORD"],
        "android.injected.signing.key.alias" => ENV["KEY_ALIAS"],
        "android.injected.signing.key.password" => ENV["KEY_PASSWORD"]
      }
    )

    # Upload to production track
    upload_to_play_store(
      track: "production",
      release_status: "completed",
      aab: "app/build/outputs/bundle/release/app-release.aab"
    )

    # Create git tag
    version_name = get_version_name(gradle_file_path: "app/build.gradle")
    add_git_tag(tag: "android-v#{version_name}")
    push_to_git_remote

    # Notify team
    slack(
      message: "New Android release uploaded to Play Store!",
      channel: "#releases"
    )
  end
end
```

### Android Build Configuration

```ruby
# mobile/android/fastlane/Appfile
json_key_file("path/to/google-play-service-account.json")
package_name("com.yourcompany.yourapp")
```

## GitHub Actions CI/CD

### iOS Build Workflow

```yaml
# .github/workflows/ios-deploy.yml
name: iOS Deploy

on:
  push:
    branches: [develop, main]
    paths:
      - 'mobile/**'
  workflow_dispatch:
    inputs:
      lane:
        description: 'Fastlane lane to run'
        required: true
        default: 'beta'
        type: choice
        options:
          - beta
          - release

jobs:
  deploy-ios:
    runs-on: macos-latest
    timeout-minutes: 60

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true
          working-directory: mobile/ios

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: mobile/package-lock.json

      - name: Install dependencies
        run: |
          cd mobile
          npm ci
          cd ios
          pod install

      - name: Setup certificates
        env:
          MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
          MATCH_GIT_BASIC_AUTHORIZATION: ${{ secrets.MATCH_GIT_BASIC_AUTHORIZATION }}
        run: |
          cd mobile/ios
          bundle exec fastlane sync_certs

      - name: Determine lane
        id: lane
        run: |
          if [ "${{ github.event_name }}" == "workflow_dispatch" ]; then
            echo "lane=${{ github.event.inputs.lane }}" >> $GITHUB_OUTPUT
          elif [ "${{ github.ref }}" == "refs/heads/main" ]; then
            echo "lane=release" >> $GITHUB_OUTPUT
          else
            echo "lane=beta" >> $GITHUB_OUTPUT
          fi

      - name: Build and deploy
        env:
          APP_STORE_CONNECT_API_KEY_KEY_ID: ${{ secrets.APP_STORE_CONNECT_API_KEY_KEY_ID }}
          APP_STORE_CONNECT_API_KEY_ISSUER_ID: ${{ secrets.APP_STORE_CONNECT_API_KEY_ISSUER_ID }}
          APP_STORE_CONNECT_API_KEY_KEY: ${{ secrets.APP_STORE_CONNECT_API_KEY_KEY }}
          SLACK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        run: |
          cd mobile/ios
          bundle exec fastlane ${{ steps.lane.outputs.lane }}

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: ios-build-artifacts
          path: |
            mobile/ios/build/
            mobile/ios/fastlane/report.xml
```

### Android Build Workflow

```yaml
# .github/workflows/android-deploy.yml
name: Android Deploy

on:
  push:
    branches: [develop, main]
    paths:
      - 'mobile/**'
  workflow_dispatch:
    inputs:
      lane:
        description: 'Fastlane lane to run'
        required: true
        default: 'beta'
        type: choice
        options:
          - beta
          - release

jobs:
  deploy-android:
    runs-on: ubuntu-latest
    timeout-minutes: 45

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true
          working-directory: mobile/android

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: mobile/package-lock.json

      - name: Install dependencies
        run: |
          cd mobile
          npm ci

      - name: Decode keystore
        env:
          KEYSTORE_BASE64: ${{ secrets.ANDROID_KEYSTORE_BASE64 }}
        run: |
          echo "$KEYSTORE_BASE64" | base64 --decode > mobile/android/app/release.keystore

      - name: Decode service account
        env:
          SERVICE_ACCOUNT_BASE64: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT_BASE64 }}
        run: |
          echo "$SERVICE_ACCOUNT_BASE64" | base64 --decode > mobile/android/fastlane/service-account.json

      - name: Determine lane
        id: lane
        run: |
          if [ "${{ github.event_name }}" == "workflow_dispatch" ]; then
            echo "lane=${{ github.event.inputs.lane }}" >> $GITHUB_OUTPUT
          elif [ "${{ github.ref }}" == "refs/heads/main" ]; then
            echo "lane=release" >> $GITHUB_OUTPUT
          else
            echo "lane=beta" >> $GITHUB_OUTPUT
          fi

      - name: Build and deploy
        env:
          KEYSTORE_PATH: ${{ github.workspace }}/mobile/android/app/release.keystore
          KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
          SLACK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        run: |
          cd mobile/android
          bundle exec fastlane ${{ steps.lane.outputs.lane }}

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: android-build-artifacts
          path: |
            mobile/android/app/build/outputs/
            mobile/android/fastlane/report.xml
```

## EAS Build (Expo)

### EAS Configuration

```json
// mobile/eas.json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m1-medium"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m1-large"
      },
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "123456789",
        "appleTeamId": "ABCD123456"
      },
      "android": {
        "serviceAccountKeyPath": "./google-services.json",
        "track": "production"
      }
    }
  }
}
```

### EAS Build Commands

```bash
# Build for development
eas build --profile development --platform all

# Build for internal testing
eas build --profile preview --platform all

# Build for production
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## Version Management

### Semantic Versioning

```bash
# Version format: MAJOR.MINOR.PATCH (e.g., 1.2.3)
# - MAJOR: Breaking changes
# - MINOR: New features (backwards compatible)
# - PATCH: Bug fixes

# Build number: Auto-incrementing (e.g., 42)
# - Unique per build
# - Always increases
```

### Version Script

```javascript
// mobile/scripts/bump-version.js
const fs = require('fs');
const path = require('path');

const bumpType = process.argv[2] || 'patch'; // patch, minor, major

// Read current version
const packagePath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const [major, minor, patch] = packageJson.version.split('.').map(Number);

// Calculate new version
let newVersion;
switch (bumpType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
  default:
    newVersion = `${major}.${minor}.${patch + 1}`;
}

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

// Update iOS (Info.plist)
const infoPlistPath = path.join(__dirname, '../ios/YourApp/Info.plist');
// Update CFBundleShortVersionString

// Update Android (build.gradle)
const buildGradlePath = path.join(__dirname, '../android/app/build.gradle');
// Update versionName

console.log(`Version bumped to ${newVersion}`);
```

## Release Checklist

### Pre-Release Checklist

```markdown
## Pre-Release Checklist

### Code Quality
- [ ] All tests passing
- [ ] Code review completed
- [ ] No critical bugs in backlog
- [ ] Performance benchmarks met

### App Store Requirements
- [ ] App icons (all required sizes)
- [ ] Screenshots (all required devices)
- [ ] App description updated
- [ ] What's New text prepared
- [ ] Privacy policy URL valid
- [ ] Support URL valid

### iOS Specific
- [ ] App Store Connect app record complete
- [ ] Certificates and profiles valid (not expiring soon)
- [ ] No private API usage
- [ ] NSAppTransportSecurity configured
- [ ] Required device capabilities correct

### Android Specific
- [ ] Play Console app record complete
- [ ] Signing key backed up
- [ ] Content rating questionnaire complete
- [ ] Data safety form complete
- [ ] Target SDK version requirements met

### Testing
- [ ] Internal testing completed
- [ ] Beta testing feedback addressed
- [ ] Crash-free rate > 99%
- [ ] No ANR issues (Android)

### Final Steps
- [ ] Changelog/release notes written
- [ ] Marketing assets ready
- [ ] Support team briefed
- [ ] Rollout strategy defined
```

## Secrets Management

### Required GitHub Secrets

```yaml
# iOS Secrets
APP_STORE_CONNECT_API_KEY_KEY_ID      # App Store Connect API Key ID
APP_STORE_CONNECT_API_KEY_ISSUER_ID   # App Store Connect Issuer ID
APP_STORE_CONNECT_API_KEY_KEY         # App Store Connect API Key (base64)
MATCH_PASSWORD                         # Fastlane Match password
MATCH_GIT_BASIC_AUTHORIZATION         # Git auth for certificates repo

# Android Secrets
ANDROID_KEYSTORE_BASE64               # Release keystore (base64)
ANDROID_KEYSTORE_PASSWORD             # Keystore password
ANDROID_KEY_ALIAS                     # Key alias
ANDROID_KEY_PASSWORD                  # Key password
GOOGLE_PLAY_SERVICE_ACCOUNT_BASE64    # Service account JSON (base64)

# Shared
SLACK_WEBHOOK_URL                     # Slack notifications
```

### Encoding Secrets

```bash
# Encode keystore to base64
base64 -i release.keystore -o keystore.base64

# Encode service account to base64
base64 -i google-services.json -o service-account.base64
```

## Troubleshooting

### Common iOS Issues

```bash
# Code signing issues
# 1. Revoke and regenerate certificates
fastlane match nuke development
fastlane match nuke distribution
fastlane match development
fastlane match appstore

# 2. Clean Xcode cache
rm -rf ~/Library/Developer/Xcode/DerivedData
```

### Common Android Issues

```bash
# Gradle issues
# Clean and rebuild
cd android
./gradlew clean
./gradlew bundleRelease

# Check signing configuration
./gradlew signingReport
```

## Related Skills

- **react-native-standard** - React Native development patterns
- **offline-first-standard** - Offline-first architecture
- **ci-cd-pipeline-standard** - CI/CD patterns

## Related Commands

- `/implement-mobile-app` - Set up mobile application
