# Phase 2 — Clara Code Mobile Scaffold
# Agent: motley-mobile | Workspace: ~/projects/clara-code-mobile-wt

Scaffold a React Native (Expo) mobile companion app for Clara Code.

## What to build
Create a `mobile/` directory in the project root with a full Expo SDK 52 setup.

## App structure
- `mobile/app/(tabs)/voice.tsx` — Voice conversation screen. Large centered mic button (clara-blue #7BC8D8). Waveform animation when Clara is speaking. Transcript appears below.
- `mobile/app/(tabs)/code.tsx` — Code review screen. Syntax-highlighted code display, Clara's inline comments, voice playback button.
- `mobile/app/(tabs)/files.tsx` — File browser. Tree view of open project, tap file to get Clara's summary.
- `mobile/app/_layout.tsx` — Tab layout with voice, code, files tabs.
- `mobile/components/VoiceMicButton.tsx` — Reusable pulsing mic component.
- `mobile/components/VoiceWaveform.tsx` — Animated waveform.

## Brand
- Background: `#0D1117`
- Accent: `#7BC8D8` (clara-blue)
- Text: `#E8F4F8`
- Font: Inter

## Setup
1. `npx create-expo-app@latest mobile --template tabs`
2. Install: `expo-av` (audio), `expo-file-system`
3. Replace default screens with the structure above
4. Configure `eas.json` with development + production profiles
5. Update `app.json`: icon from `../../assets/brand/clara-code-logo-voice-v3.png`

## Do NOT implement
- Actual voice API calls (backend not ready yet — stub them)
- Authentication (Phase 2 full implementation)
- Real file system access (scaffold UI only)

Create a PR to the `phase2-mobile-qcs1` branch when complete.
