# build-mobile — Local EAS Build on QC1

Run a local EAS build on QC1 (Mac M4 Pro). NEVER uses EAS cloud — builds are free on our hardware.

**Agent:** `lewis-mobile-builder` (Lewis — Lewis Howard Latimer)
**Skills:** `mobile-deployment-standard`, `react-native-standard`
**Dispatch:** Via `/dispatch-cursor` to QC1

## Usage
```
/build-mobile --project quikcarrental
/build-mobile --project quikcarrental --profile production
/build-mobile --all-nightly
/build-mobile --project fmo --platform android
```

## Arguments
- `--project <name>` (required unless --all-nightly) — Project name on QC1
- `--profile develop|production|preview` — EAS profile (default: develop)
- `--platform ios|android|all` — Build platform (default: ios)
- `--all-nightly` — Build all apps in the nightly manifest
- `--skip-preflight` — Skip pre-build checks (use with caution)

## What This Command Does

1. SSH into QC1
2. Unlock keychain
3. Lewis runs pre-build checklist (Heru Feedback gate, deps, icons, disk space)
4. `export FASTLANE_XCODEBUILD_SETTINGS_TIMEOUT=30`
5. `export FASTLANE_XCODEBUILD_SETTINGS_RETRIES=6`
6. `eas build -p ios --profile develop --local`
7. On success → submit to TestFlight
8. Post to Slack #maat-agents

## CRITICAL: Always --local
QC1 has M4 Pro + Xcode. Local builds are FREE. Cloud builds cost money. Lewis ALWAYS uses `--local`.
