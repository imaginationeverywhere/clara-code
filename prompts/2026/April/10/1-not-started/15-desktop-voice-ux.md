## CURSOR AGENT — MCP NOTE
**Figma MCP**: Skip if unavailable. Do NOT wait for it or ask about it. This prompt does NOT require Figma MCP. Proceed immediately with the implementation below.
**Secrets**: All keys are in AWS SSM. Pull with: `aws ssm get-parameter --name '/quik-nation/shared/<KEY_NAME>' --with-decryption --query 'Parameter.Value' --output text`

---

# Cursor Agent Prompt — Desktop Voice UX (Sprint 1 Item 7)

**Files to create/modify:**
- `packages/web-ui/src/components/VoiceButton.ts` (new — mic button component)
- `packages/web-ui/src/components/ClaraRadio.ts` (new — radio player)
- `packages/web-ui/src/app/app.css` (add keyframe animations)
- Locate and modify the main app shell (likely `packages/web-ui/src/app/page.tsx` or the chat panel component) to wire in the voice button

---

## Context

You are working in `imaginationeverywhere/clara-code`, a fork of `badlogic/pi-mono`. The web-ui (`packages/web-ui/`) is the in-browser interface for Clara Code — the panel that opens inside the IDE or at `localhost:PORT` when running locally.

This is the DESKTOP voice UX — meaning the chat/coding interface, not the marketing site. Three behaviors to implement:

1. **Mic button** — click to record voice input, send to STT, populate the chat input
2. **Enter to mute** — when audio is playing, pressing Enter mutes/unmutes it
3. **S for Clara Radio** — pressing `S` while focused on the chat toggles Clara Radio (background music/ambient sound)

---

## 1. Mic Button: `VoiceButton.ts`

A LitElement or vanilla TS web component (match the pattern used by other components in `packages/web-ui/src/components/`).

**Visual:**
- Circle button, 40px, positioned to the RIGHT of the chat input field
- Idle: microphone SVG icon, bg `#161B22`, border `1px solid #30363D`
- Recording: pulsing red ring, red dot icon (`●`), bg `#1a0a0a`
- Processing: spinning indicator, icon becomes `⋯`

**Behavior:**
1. Click → request `getUserMedia({ audio: true })`
2. Record using `MediaRecorder` API (webm/opus or mp4/aac, whichever browser supports)
3. On click again (or after 30s max) → stop recording
4. POST blob to `/api/voice/stt` (or `process.env.CLARA_VOICE_URL/voice/stt`):
   ```ts
   const formData = new FormData();
   formData.append('audio', blob, 'recording.webm');
   const res = await fetch('/api/voice/stt', { method: 'POST', body: formData });
   const { text } = await res.json();
   ```
5. Emit custom event `voice-transcript` with `detail: { text }` — the parent chat input listens and populates itself
6. On error: show brief error state (red ✕ for 2s), reset to idle

---

## 2. Enter to Mute

In the main chat panel component (wherever `keydown` events are handled for the Enter key to submit):

Add a secondary handler:
```ts
if (event.key === 'Enter' && audioContext?.state === 'running') {
  // Audio is currently playing
  event.preventDefault(); // don't submit the form
  toggleMute();
  return;
}
```

`toggleMute()` implementation:
- Check if there is a playing `HTMLAudioElement` stored on a module-level ref
- If playing: `audio.muted = !audio.muted`
- Show a brief toast/indicator: "🔇 Muted" or "🔊 Unmuted" (disappears after 1.5s)

The toast is a `<div>` absolutely positioned at bottom-center of the chat panel, fades in/out via CSS transition.

---

## 3. S Key — Clara Radio: `ClaraRadio.ts`

Clara Radio is a background ambient audio player. Pressing `S` while the chat input is focused toggles it on/off.

**Behavior:**
1. Detect `keydown` with `key === 's'` on the chat input (or document when chat is focused)
2. If radio is OFF → start playback
3. If radio is ON → stop playback
4. Show a small pill badge in the corner of the chat panel: "♫ Clara Radio" (when on), disappears when off

**Audio source:**
```ts
// Ambient track — use a royalty-free lo-fi stream or a static MP3
// Default: silence/placeholder until a real track is configured
const RADIO_STREAM_URL = process.env.CLARA_RADIO_URL || '';

// If no URL configured, show a toast: "Clara Radio not configured — set CLARA_RADIO_URL"
```

**Player implementation:**
```ts
let radioAudio: HTMLAudioElement | null = null;

function startRadio() {
  if (!RADIO_STREAM_URL) {
    showToast('Set CLARA_RADIO_URL to enable Clara Radio');
    return;
  }
  radioAudio = new Audio(RADIO_STREAM_URL);
  radioAudio.loop = true;
  radioAudio.volume = 0.3;
  radioAudio.play();
  showRadioBadge(true);
}

function stopRadio() {
  radioAudio?.pause();
  radioAudio = null;
  showRadioBadge(false);
}
```

**Radio badge:**
- Small pill: `♫ Clara Radio` — bottom-left of chat panel
- Purple bg (`#7C3AED`), white text, 12px, rounded-full
- Fades in on start, fades out on stop

---

## Wiring into the App Shell

Find the chat input component in `packages/web-ui/src/` (likely `ChatPanel.ts`, `Messages.ts`, or `Input.ts`).

1. Import and add `<voice-button>` to the right of the `<textarea>` or `<input>` in the chat toolbar
2. Add the `keydown` listener for Enter-to-mute and S-for-radio
3. Listen for `voice-transcript` events to populate the chat input:
   ```ts
   document.addEventListener('voice-transcript', (e: CustomEvent) => {
     chatInput.value = e.detail.text;
     chatInput.focus();
   });
   ```

---

## Acceptance Criteria

- [ ] Mic button renders to the right of the chat input
- [ ] Click → starts recording with visual feedback (red pulse)
- [ ] Second click → stops recording, calls STT, populates input with transcript
- [ ] Enter key mutes/unmutes audio when audio is playing (does NOT submit form while audio is active)
- [ ] S key toggles Clara Radio on/off with pill badge
- [ ] All three behaviors work without page reload
- [ ] `npm run build` passes clean
- [ ] No `any` in TypeScript