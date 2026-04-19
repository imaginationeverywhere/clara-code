# Mobile App Deployment Guide - React Native CLI

This guide covers deploying React Native mobile apps built with React Native CLI (without Expo) to both the Apple App Store and Google Play Store.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [iOS Deployment (Apple App Store)](#ios-deployment-apple-app-store)
4. [Android Deployment (Google Play Store)](#android-deployment-google-play-store)
5. [Code Signing & Certificates](#code-signing--certificates)
6. [Environment Variables & Build Configurations](#environment-variables--build-configurations)
7. [Continuous Deployment with Fastlane](#continuous-deployment-with-fastlane)
8. [Continuous Deployment with GitHub Actions](#continuous-deployment-with-github-actions)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

**For iOS (Apple App Store):**
- Apple Developer Account ($99/year) - https://developer.apple.com/programs/
- Apple ID with 2FA enabled
- **Mac computer required** (Xcode only runs on macOS)

**For Android (Google Play Store):**
- Google Play Console Account ($25 one-time) - https://play.google.com/console/signup
- Google Account

### Required Tools

**macOS (for iOS development):**
```bash
# Install Xcode from App Store (14.0 or later)
# Or download from: https://developer.apple.com/xcode/

# Install Xcode Command Line Tools
xcode-select --install

# Install CocoaPods (iOS dependency manager)
sudo gem install cocoapods

# Install Ruby (if not already installed)
# Recommended: Use rbenv or RVM
brew install rbenv
rbenv install 3.2.0
rbenv global 3.2.0

# Verify installations
xcode-select -p
pod --version
ruby --version
```

**For Android development (macOS/Linux/Windows):**
```bash
# Install Android Studio
# Download from: https://developer.android.com/studio

# Set up Android SDK
# Android Studio → Preferences → Appearance & Behavior → System Settings → Android SDK
# Install:
# - Android SDK Platform 33 (or latest)
# - Android SDK Build-Tools
# - Android Emulator
# - Android SDK Platform-Tools

# Set environment variables in ~/.zshrc or ~/.bashrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Reload shell
source ~/.zshrc  # or source ~/.bashrc

# Verify installation
adb --version
```

**Node.js and Dependencies:**
```bash
# Ensure Node.js 18+ is installed
node --version

# Navigate to your mobile project
cd mobile/

# Install dependencies
npm install  # or yarn install or pnpm install

# iOS: Install CocoaPods dependencies
cd ios/
pod install
cd ..
```

---

## Project Setup

### Update Project Configuration

#### iOS Configuration

```bash
# Edit ios/[YourApp]/Info.plist
# Update bundle identifier, version, permissions

cd ios/
open [YourApp].xcworkspace  # Open in Xcode
```

In Xcode:
1. Select project in navigator
2. Select target → General
3. Update:
   - **Display Name**: Your App Name
   - **Bundle Identifier**: com.yourcompany.yourapp
   - **Version**: 1.0.0
   - **Build**: 1

4. Signing & Capabilities:
   - Select your Team
   - Enable "Automatically manage signing"

#### Android Configuration

```bash
# Edit android/app/build.gradle
```

Update version information:
```gradle
android {
    defaultConfig {
        applicationId "com.yourcompany.yourapp"
        versionCode 1          // Increment for each release
        versionName "1.0.0"    // Semantic version
    }
}
```

---

## iOS Deployment (Apple App Store)

### Step 1: Configure App in Xcode

```bash
cd mobile/ios/
open [YourApp].xcworkspace  # Must use .xcworkspace, not .xcodeproj
```

**In Xcode:**

1. **General Tab**:
   - Bundle Identifier: `com.yourcompany.yourapp`
   - Version: `1.0.0`
   - Build: `1`
   - Deployment Target: iOS 13.0+ (or your minimum)

2. **Signing & Capabilities**:
   - Team: Select your Apple Developer Team
   - Automatically manage signing: ✅ Enabled
   - Provisioning Profile: Automatic

3. **Info Tab**:
   - Add privacy descriptions:
     - Privacy - Camera Usage Description
     - Privacy - Photo Library Usage Description
     - Privacy - Location When In Use Usage Description
     - Privacy - Microphone Usage Description

4. **Build Settings**:
   - Release configuration is optimized
   - Code Signing Identity: Apple Distribution
   - Provisioning Profile: Automatic

### Step 2: Create App Icons

```bash
# Required: App Icon set (1024x1024 PNG)
# Place in: ios/[YourApp]/Images.xcassets/AppIcon.appiconset/

# Use a tool to generate all sizes:
# - https://appicon.co/
# - https://makeappicon.com/
```

**Required Sizes**:
- 1024x1024 (App Store)
- 180x180 (iPhone @3x)
- 120x120 (iPhone @2x)
- 167x167 (iPad Pro @2x)
- 152x152 (iPad @2x)
- 76x76 (iPad)

Drag all generated images into AppIcon.appiconset in Xcode.

### Step 3: Create Launch Screen

```bash
# Edit: ios/[YourApp]/LaunchScreen.storyboard
# Or replace with your own launch screen
```

### Step 4: Build for Release

```bash
# Clean previous builds
cd mobile/ios/
xcodebuild clean -workspace [YourApp].xcworkspace -scheme [YourApp]

# Build archive for release
xcodebuild archive \
  -workspace [YourApp].xcworkspace \
  -scheme [YourApp] \
  -configuration Release \
  -archivePath build/[YourApp].xcarchive

# Export IPA for App Store
xcodebuild -exportArchive \
  -archivePath build/[YourApp].xcarchive \
  -exportPath build/ \
  -exportOptionsPlist ExportOptions.plist
```

**ExportOptions.plist** (create if not exists):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
</dict>
</plist>
```

### Step 5: Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com/
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform**: iOS
   - **Name**: Your App Name
   - **Primary Language**: English
   - **Bundle ID**: com.yourcompany.yourapp (must match Xcode)
   - **SKU**: Unique identifier (e.g., yourapp-001)
   - **User Access**: Full Access
4. Click **Create**

### Step 6: Upload Build

#### Option A: Using Xcode (Easiest)

1. In Xcode: **Product** → **Archive**
2. Wait for archive to complete
3. Organizer window opens
4. Select your archive → **Distribute App**
5. Select **App Store Connect** → **Upload**
6. Follow the prompts:
   - Select distribution certificate
   - Review .ipa content
   - Click **Upload**
7. Wait 5-15 minutes for processing

#### Option B: Using Transporter App

1. Download Transporter from App Store
2. Open Transporter
3. Sign in with Apple ID
4. Drag your `.ipa` file into Transporter
5. Click **Deliver**
6. Wait for upload and processing

#### Option C: Using Command Line (altool)

```bash
# Upload IPA to App Store Connect
xcrun altool --upload-app \
  --type ios \
  --file "build/[YourApp].ipa" \
  --username "your-apple-id@example.com" \
  --password "your-app-specific-password"

# Get app-specific password from:
# https://appleid.apple.com/account/manage → App-Specific Passwords
```

### Step 7: Complete App Information

In App Store Connect:

**App Information**:
- Subtitle (30 characters)
- Privacy Policy URL (required)
- Category (Primary and Secondary)
- Content Rights

**Pricing and Availability**:
- Price: Free or select tier
- Availability: All countries or select specific

**App Privacy**:
- Complete privacy questionnaire
- Describe data collection practices

**Prepare for Submission**:
1. Select your uploaded build (wait for processing)
2. Add screenshots (required for all device sizes):
   - iPhone 6.7" Display (1290 x 2796 or 1284 x 2778)
   - iPhone 6.5" Display (1242 x 2688 or 1284 x 2778)
   - iPhone 5.5" Display (1242 x 2208)
   - iPad Pro 12.9" (2048 x 2732)
3. Description (4000 characters)
4. Keywords (100 characters, comma-separated)
5. Support URL
6. Marketing URL (optional)
7. What's New in This Version

**App Review Information**:
- Contact information
- Phone number
- Email
- Demo account (if app requires login)
- Notes for reviewer

### Step 8: Submit for Review

1. Click **Add for Review**
2. Review all information
3. Submit advertising identifier questions
4. Click **Submit to App Review**
5. Wait for review (typically 24-48 hours)

**Review Process**:
- In Review: ~24-48 hours
- Approved: App goes live automatically (or scheduled)
- Rejected: Address issues and resubmit

### Step 9: TestFlight Beta Testing (Optional)

TestFlight allows beta testing before public release:

1. After build is uploaded, go to **TestFlight** tab
2. Add internal testers (up to 100):
   - Add emails
   - No review needed
   - Immediate access
3. Add external testers (unlimited):
   - Create group
   - Add emails
   - Requires Apple review (~24 hours)
4. Provide test information:
   - What to test
   - App description
   - Feedback email
5. Testers receive email with TestFlight link

---

## Android Deployment (Google Play Store)

### Step 1: Generate Release Keystore

**⚠️ Important**: Keep this keystore secure! If lost, you cannot update your app.

```bash
cd mobile/android/app/

# Generate keystore
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore my-release-key.keystore \
  -alias my-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# You'll be prompted for:
# - Keystore password (remember this!)
# - Key password (can be same as keystore password)
# - Your name, organization, city, state, country
```

**Backup your keystore**:
```bash
# Store securely:
# - In password manager
# - In encrypted cloud storage
# - In secure company vault

# NEVER commit to git!
```

### Step 2: Configure Gradle for Signing

```bash
# Create gradle.properties (if not exists)
# android/gradle.properties
```

Add signing configuration (or use environment variables):
```properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=your-keystore-password
MYAPP_RELEASE_KEY_PASSWORD=your-key-password
```

**⚠️ Security**: Add `gradle.properties` to `.gitignore`:
```bash
echo "android/gradle.properties" >> .gitignore
```

### Step 3: Update build.gradle

```gradle
// android/app/build.gradle

android {
    ...
    defaultConfig {
        applicationId "com.yourcompany.yourapp"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
    }
    
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 4: Create App Icons

```bash
# Required icon sizes in android/app/src/main/res/
mipmap-mdpi/ic_launcher.png       (48x48)
mipmap-hdpi/ic_launcher.png       (72x72)
mipmap-xhdpi/ic_launcher.png      (96x96)
mipmap-xxhdpi/ic_launcher.png     (144x144)
mipmap-xxxhdpi/ic_launcher.png    (192x192)

# Use Android Asset Studio:
# https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
```

### Step 5: Update AndroidManifest.xml

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- App permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    
    <application
        android:name=".MainApplication"
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:allowBackup="false"
        android:theme="@style/AppTheme">
        
        <activity
            android:name=".MainActivity"
            android:label="@string/app_name"
            android:configChanges="keyboard|keyboardHidden|orientation|screenSize|uiMode"
            android:launchMode="singleTask"
            android:windowSoftInputMode="adjustResize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

### Step 6: Build Release APK/AAB

```bash
cd mobile/

# Clean previous builds
cd android/
./gradlew clean
cd ..

# Build APK (for testing)
cd android/
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk

# Build AAB (for Play Store)
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### Step 7: Test Release Build

```bash
# Install APK on device/emulator
adb install android/app/build/outputs/apk/release/app-release.apk

# Or drag and drop APK onto emulator

# Test thoroughly:
# - All features work
# - Permissions are requested correctly
# - No crashes
# - Performance is good
```

### Step 8: Create App in Google Play Console

1. Go to https://play.google.com/console/
2. Click **Create app**
3. Fill in details:
   - **App name**: Your App Name
   - **Default language**: English
   - **App or game**: App
   - **Free or paid**: Free (or Paid)
4. Complete declarations:
   - Developer Program Policies
   - US export laws
5. Click **Create app**

### Step 9: Complete Store Listing

**Main store listing**:
- **App name**: Your App Name (30 characters)
- **Short description**: 80 characters
- **Full description**: 4000 characters
- **App icon**: 512 x 512 PNG (32-bit)
- **Feature graphic**: 1024 x 500 PNG
- **Phone screenshots**: At least 2 (16:9 or 9:16, 320-3840 pixels)
  - Recommended: 1080 x 1920 or 1080 x 2340
- **7-inch tablet screenshots**: Optional
- **10-inch tablet screenshots**: Optional

**Contact details**:
- Email (required)
- Website (optional)
- Phone (optional)

**Privacy Policy**:
- Privacy policy URL (required)

**App category**:
- Select primary category
- Add tags (optional)

### Step 10: Set Up Content Rating

1. Go to **Content rating** section
2. Click **Start questionnaire**
3. Answer questions about your app's content:
   - Violence
   - Sexual content
   - Language
   - Controlled substances
   - Gambling
   - User interaction
4. Submit questionnaire
5. Receive instant rating (ESRB, PEGI, etc.)

### Step 11: Select Target Audience & Content

1. **Target audience**:
   - Select age ranges
   - Confirm if appeals to children

2. **News apps**: Declare if news app

3. **COVID-19 contact tracing**: Declare if applicable

4. **Data safety**:
   - What data is collected
   - How data is used
   - Security practices

### Step 12: Create Production Release

1. Go to **Production** → **Create new release**

2. Upload AAB:
```bash
# Upload android/app/build/outputs/bundle/release/app-release.aab
```

3. **Release name**: 1.0.0 (or your version)

4. **Release notes** (per language):
```
English (United States):
- Initial release
- Feature 1
- Feature 2
- Feature 3
```

5. Review release summary

6. **Save** (don't submit yet)

### Step 13: Complete All Requirements

Check all sections have ✅:
- [ ] Store listing
- [ ] Content rating
- [ ] Target audience
- [ ] Privacy policy
- [ ] App content (ads, in-app purchases)
- [ ] Production release created

### Step 14: Submit for Review

1. Click **Send for review** (or **Start rollout to Production**)
2. Review warnings and fix issues
3. Confirm submission
4. Wait for Google review (1-7 days, typically 1-3 days)

**Review States**:
- **Pending publication**: Under review
- **Approved**: Live on Play Store
- **Rejected**: Address issues and resubmit

### Step 15: Internal Testing (Optional)

Before production, test with internal team:

1. Go to **Internal testing** → **Create new release**
2. Upload AAB
3. Add testers (by email)
4. Testers receive email invitation
5. No review needed
6. Get feedback before production release

---

## Code Signing & Certificates

### iOS Code Signing

**Automatic Signing (Recommended)**:
1. In Xcode: Select target → Signing & Capabilities
2. Enable "Automatically manage signing"
3. Select your Team
4. Xcode handles certificates and profiles

**Manual Signing**:
1. Go to https://developer.apple.com/account/
2. Certificates, Identifiers & Profiles
3. Create:
   - **App ID**: com.yourcompany.yourapp
   - **Distribution Certificate**: For App Store
   - **Provisioning Profile**: App Store profile
4. Download and install
5. In Xcode: Select manual signing and choose profiles

**Certificate Types**:
- **Development**: For testing on devices
- **Distribution**: For App Store and TestFlight
- **Ad Hoc**: For specific devices (beta testing)

### Android Code Signing

**Keystore Management**:
```bash
# List keys in keystore
keytool -list -v -keystore my-release-key.keystore

# Change keystore password
keytool -storepasswd -keystore my-release-key.keystore

# Change key password
keytool -keypasswd -keystore my-release-key.keystore -alias my-key-alias

# Export certificate (for Play App Signing)
keytool -export -rfc -keystore my-release-key.keystore -alias my-key-alias -file upload-certificate.pem
```

**Play App Signing (Recommended)**:
1. Google manages your app signing key
2. You upload with an upload key
3. Google signs releases with app signing key
4. Better security and key management

To enable:
1. Go to **Release** → **Setup** → **App signing**
2. Select **Use Play App Signing**
3. Upload your keystore or let Google generate
4. Download upload keystore
5. Use upload keystore for future builds

---

## Environment Variables & Build Configurations

### iOS Build Configurations

**Using Xcode Schemes**:
1. In Xcode: **Product** → **Scheme** → **Edit Scheme**
2. Create schemes for each environment:
   - **Debug**: Development
   - **Staging**: Pre-production
   - **Release**: Production

**Using xcconfig files**:
```bash
# ios/Config/Debug.xcconfig
API_URL = https:/$()/dev-api.yourapp.com

# ios/Config/Staging.xcconfig
API_URL = https:/$()/staging-api.yourapp.com

# ios/Config/Release.xcconfig
API_URL = https:/$()/api.yourapp.com
```

**Access in code**:
```swift
// ios/[YourApp]/Config.swift
enum Config {
    static let apiUrl = Bundle.main.object(forInfoDictionaryKey: "API_URL") as! String
}
```

### Android Build Configurations

**Using Gradle Product Flavors**:
```gradle
// android/app/build.gradle

android {
    ...
    flavorDimensions "environment"
    
    productFlavors {
        development {
            dimension "environment"
            applicationIdSuffix ".dev"
            versionNameSuffix "-dev"
            resValue "string", "app_name", "YourApp Dev"
            buildConfigField "String", "API_URL", "\"https://dev-api.yourapp.com\""
        }
        
        staging {
            dimension "environment"
            applicationIdSuffix ".staging"
            versionNameSuffix "-staging"
            resValue "string", "app_name", "YourApp Staging"
            buildConfigField "String", "API_URL", "\"https://staging-api.yourapp.com\""
        }
        
        production {
            dimension "environment"
            resValue "string", "app_name", "YourApp"
            buildConfigField "String", "API_URL", "\"https://api.yourapp.com\""
        }
    }
}
```

**Build specific flavor**:
```bash
# Development APK
./gradlew assembleDevelopmentRelease

# Staging APK
./gradlew assembleStagingRelease

# Production AAB
./gradlew bundleProductionRelease
```

**Access in code**:
```kotlin
// android/app/src/main/java/com/yourapp/Config.kt
import com.yourapp.BuildConfig

object Config {
    val apiUrl: String = BuildConfig.API_URL
}
```

### React Native Config

Using `react-native-config`:

```bash
# Install
npm install react-native-config

# Create .env files
.env.development
.env.staging
.env.production

# Example .env.production
API_URL=https://api.yourapp.com
STRIPE_KEY=pk_live_...
SENTRY_DSN=https://...
```

**iOS setup**:
```bash
# ios/Podfile
pod 'react-native-config', :path => '../node_modules/react-native-config'

cd ios && pod install
```

**Android setup**:
```gradle
// android/app/build.gradle
apply from: project(':react-native-config').projectDir.getPath() + "/dotenv.gradle"
```

**Access in JavaScript**:
```typescript
import Config from 'react-native-config';

console.log(Config.API_URL);
fetch(`${Config.API_URL}/users`);
```

---

## Continuous Deployment with Fastlane

Fastlane automates iOS and Android deployments.

### Install Fastlane

```bash
# Install Fastlane
sudo gem install fastlane -NV

# Or with Bundler (recommended)
cd mobile/
bundle init
# Add to Gemfile:
gem "fastlane"

bundle install
```

### Initialize Fastlane

```bash
cd mobile/

# iOS
cd ios/
fastlane init

# Android
cd android/
fastlane init
```

### iOS Fastfile Example

```ruby
# ios/fastlane/Fastfile

default_platform(:ios)

platform :ios do
  desc "Build and upload to TestFlight"
  lane :beta do
    increment_build_number(xcodeproj: "YourApp.xcodeproj")
    build_app(
      scheme: "YourApp",
      export_method: "app-store"
    )
    upload_to_testflight(
      skip_waiting_for_build_processing: true
    )
  end

  desc "Build and upload to App Store"
  lane :release do
    increment_build_number(xcodeproj: "YourApp.xcodeproj")
    build_app(
      scheme: "YourApp",
      export_method: "app-store"
    )
    upload_to_app_store(
      submit_for_review: true,
      automatic_release: false
    )
  end
end
```

### Android Fastfile Example

```ruby
# android/fastlane/Fastfile

default_platform(:android)

platform :android do
  desc "Build and upload to internal testing"
  lane :beta do
    gradle(
      task: "clean bundleRelease"
    )
    upload_to_play_store(
      track: 'internal',
      aab: 'app/build/outputs/bundle/release/app-release.aab'
    )
  end

  desc "Deploy to Play Store production"
  lane :release do
    gradle(
      task: "clean bundleRelease"
    )
    upload_to_play_store(
      track: 'production',
      aab: 'app/build/outputs/bundle/release/app-release.aab',
      skip_upload_metadata: false,
      skip_upload_images: false,
      skip_upload_screenshots: false
    )
  end
end
```

### Run Fastlane

```bash
# iOS TestFlight
cd mobile/ios/
fastlane beta

# iOS App Store
fastlane release

# Android Internal Testing
cd mobile/android/
fastlane beta

# Android Production
fastlane release
```

### Fastlane Match (iOS Code Signing)

```bash
# Initialize match
fastlane match init

# Generate/fetch certificates
fastlane match appstore
fastlane match development

# Use in Fastfile
lane :beta do
  match(type: "appstore")
  build_app(scheme: "YourApp")
  upload_to_testflight
end
```

---

## Continuous Deployment with GitHub Actions

### iOS GitHub Action

```yaml
# .github/workflows/deploy-ios.yml
name: Deploy iOS

on:
  push:
    branches:
      - main
    paths:
      - 'mobile/**'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: macos-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: cd mobile && npm install

      - name: Install CocoaPods
        run: cd mobile/ios && pod install

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: 3.2
          bundler-cache: true
          working-directory: mobile/ios

      - name: Install Fastlane
        run: cd mobile/ios && bundle install

      - name: Build and Deploy to TestFlight
        env:
          FASTLANE_USER: ${{ secrets.APPLE_ID }}
          FASTLANE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
          FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD: ${{ secrets.APP_SPECIFIC_PASSWORD }}
          MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
        run: cd mobile/ios && bundle exec fastlane beta
```

### Android GitHub Action

```yaml
# .github/workflows/deploy-android.yml
name: Deploy Android

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

      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Install dependencies
        run: cd mobile && npm install

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: 3.2
          bundler-cache: true
          working-directory: mobile/android

      - name: Install Fastlane
        run: cd mobile/android && bundle install

      - name: Decode Keystore
        env:
          KEYSTORE_BASE64: ${{ secrets.KEYSTORE_BASE64 }}
        run: |
          echo $KEYSTORE_BASE64 | base64 -d > mobile/android/app/my-release-key.keystore

      - name: Create gradle.properties
        env:
          KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
        run: |
          cat > mobile/android/gradle.properties << EOF
          MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
          MYAPP_RELEASE_KEY_ALIAS=$KEY_ALIAS
          MYAPP_RELEASE_STORE_PASSWORD=$KEYSTORE_PASSWORD
          MYAPP_RELEASE_KEY_PASSWORD=$KEY_PASSWORD
          EOF

      - name: Decode Google Service Account
        env:
          GOOGLE_SERVICE_ACCOUNT: ${{ secrets.GOOGLE_SERVICE_ACCOUNT }}
        run: |
          echo $GOOGLE_SERVICE_ACCOUNT | base64 -d > mobile/android/fastlane/service-account.json

      - name: Build and Deploy to Play Store
        run: cd mobile/android && bundle exec fastlane release
```

### Required GitHub Secrets

Add these secrets to your GitHub repository:

**iOS Secrets**:
- `APPLE_ID` - Your Apple ID
- `APPLE_PASSWORD` - Your Apple ID password
- `APP_SPECIFIC_PASSWORD` - App-specific password from appleid.apple.com
- `MATCH_PASSWORD` - Password for Fastlane Match git repo

**Android Secrets**:
- `KEYSTORE_BASE64` - Base64 encoded keystore file
- `KEYSTORE_PASSWORD` - Keystore password
- `KEY_ALIAS` - Key alias
- `KEY_PASSWORD` - Key password
- `GOOGLE_SERVICE_ACCOUNT` - Base64 encoded service account JSON

**Encode keystore for GitHub**:
```bash
# Encode keystore to base64
base64 -i my-release-key.keystore | pbcopy  # macOS
base64 -w 0 my-release-key.keystore          # Linux

# Paste into GitHub Secrets
```

---

## Troubleshooting

### iOS Issues

**Issue: "No provisioning profile found"**
```bash
# Solution 1: Enable automatic signing in Xcode
# Project → Target → Signing & Capabilities → Automatically manage signing

# Solution 2: Use Fastlane Match
fastlane match development
fastlane match appstore
```

**Issue: "Code signing error"**
```bash
# Clear derived data
rm -rf ~/Library/Developer/Xcode/DerivedData

# Reset code signing
# Xcode → Preferences → Accounts → Select Team → Download Manual Profiles
```

**Issue: "Build archive failed"**
```bash
# Clean build folder
# Xcode → Product → Clean Build Folder (Cmd+Shift+K)

# Update CocoaPods
cd ios/
pod deintegrate
pod install
```

**Issue: "App crashes on launch (release only)"**
```bash
# Common cause: Missing environment variables
# Check your Info.plist and xcconfig files

# Enable debugging:
# Edit scheme → Run → Info → Build Configuration → Release
# Test with release configuration
```

### Android Issues

**Issue: "Keystore password incorrect"**
```bash
# Verify password
keytool -list -v -keystore my-release-key.keystore

# If password is lost, you must create a new keystore
# Note: Cannot update existing app with new keystore
```

**Issue: "Duplicate resources"**
```bash
# Clean build
cd android/
./gradlew clean

# Check for duplicate dependencies in build.gradle
```

**Issue: "Gradle build failed"**
```bash
# Update Gradle wrapper
cd android/
./gradlew wrapper --gradle-version=8.0

# Invalidate caches (Android Studio)
# File → Invalidate Caches → Invalidate and Restart
```

**Issue: "APK not optimized for Play Store"**
```bash
# Use AAB instead of APK
./gradlew bundleRelease

# AAB benefits:
# - Smaller downloads
# - Dynamic feature delivery
# - Required for new apps on Play Store (since August 2021)
```

### Common Issues (Both Platforms)

**Issue: "Native module not found"**
```bash
# iOS: Reinstall pods
cd ios/ && pod install

# Android: Rebuild
cd android/ && ./gradlew clean && ./gradlew build

# Clean and reinstall
cd mobile/
rm -rf node_modules/
npm install
```

**Issue: "Metro bundler cache issues"**
```bash
# Reset cache
npm start -- --reset-cache

# Or
npx react-native start --reset-cache
```

**Issue: "App size too large"**
```bash
# Enable Hermes (if not already)
# Hermes reduces app size and improves performance

# iOS: ios/Podfile
# use_react_native!(:hermes_enabled => true)

# Android: android/app/build.gradle
# project.ext.react = [enableHermes: true]

# Rebuild after enabling
```

---

## Best Practices

### Version Management

```bash
# Semantic versioning: MAJOR.MINOR.PATCH
# 1.0.0 → Initial release
# 1.0.1 → Bug fix
# 1.1.0 → New features
# 2.0.0 → Breaking changes

# iOS: Update both CFBundleShortVersionString and CFBundleVersion
# Android: Update both versionName and versionCode

# Automate with Fastlane:
increment_build_number  # iOS
increment_version_code  # Android
```

### Release Checklist

- [ ] Test on physical devices (iOS and Android)
- [ ] Test all features in release build
- [ ] Update version numbers
- [ ] Update release notes/changelog
- [ ] Create app icons (all required sizes)
- [ ] Add/update screenshots for store listings
- [ ] Review and update app descriptions
- [ ] Test with production API
- [ ] Check all environment variables
- [ ] Verify code signing configuration
- [ ] Review permissions and privacy settings
- [ ] Test deep links and push notifications
- [ ] Performance testing (load times, memory)
- [ ] Accessibility testing
- [ ] Beta test with internal team

### Security Best Practices

- Never commit keystores, certificates, or passwords to git
- Use environment variables for secrets
- Enable code obfuscation (ProGuard/R8 for Android)
- Use app transport security (iOS)
- Validate SSL certificates
- Use secure storage for tokens (Keychain/Keystore)
- Implement certificate pinning for API calls
- Regular security audits
- Keep dependencies updated

---

## Additional Resources

**React Native**:
- Publishing to App Store: https://reactnative.dev/docs/publishing-to-app-store
- Signed APK Android: https://reactnative.dev/docs/signed-apk-android

**Apple**:
- App Store Connect: https://appstoreconnect.apple.com/
- Developer Portal: https://developer.apple.com/account/
- App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/

**Google**:
- Play Console: https://play.google.com/console/
- Launch Checklist: https://developer.android.com/distribute/best-practices/launch/launch-checklist

**Fastlane**:
- Documentation: https://docs.fastlane.tools/
- iOS Guide: https://docs.fastlane.tools/getting-started/ios/setup/
- Android Guide: https://docs.fastlane.tools/getting-started/android/setup/

---

**Need help?** Check the [troubleshooting section](#troubleshooting) or React Native documentation.

Happy shipping! 🚀
