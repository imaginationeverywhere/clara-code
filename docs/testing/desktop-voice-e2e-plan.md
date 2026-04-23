# Desktop Voice E2E Test Plan

Module: `desktop/src/shell-voice-converse.ts`  
Status: Planned — required before GA, not blocking beta.

## Scenarios

1. Space keydown starts MediaRecorder (recording state)
2. Space keyup stops recording, sends audio to /api/voice/converse
3. `reply_audio_base64` decoded and played via HTMLAudioElement
4. Backend 503 -> error shown in desktop UI (no crash)
5. getUserMedia denied -> graceful degradation

## Setup

Tauri webdriver integration: https://tauri.app/v1/guides/testing/webdriver/ (v2 equivalent when adopted)
