# VRD-001 — claracode.ai Visitor Voice Greeting

**Document Type:** Voice Requirements Document
**Product:** claracode.ai
**Author:** Mary (Dr. Mary McLeod Bethune), Product Owner
**Date:** 2026-04-10
**Status:** Draft v1.0
**Companion:** PRD-claracode-ai.md
**VRD Number:** 001 (first VRD for Clara Code)

---

## Why This Document Exists

claracode.ai is the front door to a **voice-first** AI coding assistant. If a developer lands on the homepage and hears nothing, the product's defining feature is invisible before they've seen a single line of code.

This document defines exactly what Clara says, when she says it, how it sounds, and how it gets delivered — on every page of claracode.ai where her voice matters.

---

## Voice Persona — Clara on the Web

Clara's voice on claracode.ai is **different from her in-session voice.** When she's inside a developer's editor, she's a peer — technical, direct, confident. On the marketing site, she's meeting a stranger for the first time.

**Persona for claracode.ai:**
- **Tone:** Warm, curious, a little playful — like a senior engineer who's excited about something and wants you to see it too
- **Pace:** Unhurried. Developers hate being rushed.
- **Register:** Conversational, not corporate. Never salesy. Never "Check out our amazing features!"
- **Personality markers:**
  - She's self-aware (knows she's an AI, doesn't pretend otherwise)
  - She respects the developer's intelligence
  - She has taste — she doesn't pad sentences
  - She references *code*, not *product* — she's a tool, not a salesperson

**Voice Profile (Technical):**
- Voice clone: Clara's trained voice (WAV source: `clara-villarosa-greeting.wav`, upload to Modal volume)
- Model: XTTS v2 via Modal voice server
- Endpoint: `POST /voice/tts` → `https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run/voice/tts`
- Backend proxy route: `POST /api/voice/tts` on `api.claracode.ai` (forwards to Modal, handles CORS)
- Format: MP3, 128kbps
- Max latency target: 3 seconds from click to first audio byte

---

## Trigger Behavior (Browser Policy Compliance)

**Browser autoplay policy prevents audio from playing without user gesture.**

claracode.ai MUST NOT attempt to auto-play audio. The experience instead:

1. **On page load (after 1.5s delay, first visit only):** A pulsing mic button appears in the hero section. Subtle animation. No sound yet.
2. **Label below the button:** "Clara is here — tap to hear her"
3. **On click:** Button transitions to a waveform animation. Clara's voice plays.
4. **Repeat visits:** The mic button is present but static (no pulse animation). Clara does not play automatically.
5. **Mute control:** A speaker icon in the nav header lets users mute/unmute across the session. State stored in `sessionStorage`.

**Session tracking (first visit detection):**
```js
const hasVisited = sessionStorage.getItem('clara-greeted');
if (!hasVisited) {
  // Show pulsing animation after 1.5s
  sessionStorage.setItem('clara-greeted', 'true');
}
```

---

## Voice Scripts by Page

### 1. Homepage (`/`) — THE PRIMARY GREETING

**Context:** Developer just landed. They came from Twitter, Hacker News, or Google. They have ~8 seconds before they decide to read more or bounce. Clara's first words need to earn the next 10 minutes.

**Script (First Visit):**
> "Hey. I'm Clara. I'm a coding assistant — but I work a little differently than what you've probably tried before. I live in your terminal, your editor, and right here. I can hear you. Talk to me like you'd talk to a senior engineer. Let's build something."

**Character notes:**
- "Hey." — Not "Hello" or "Hi there." Developers don't say hi like that.
- "I'm a coding assistant — but I work a little differently" — Acknowledges the crowded space. Doesn't oversell.
- "I can hear you." — This is the differentiator. Say it plainly.
- "Talk to me like you'd talk to a senior engineer." — Sets the interaction model immediately.
- "Let's build something." — Action-oriented. Ends on invitation, not pitch.

**Duration target:** ~12 seconds
**Word count:** 57 words

---

**Script (Return Visit, optional — on explicit click only):**
> "Welcome back. Where were we?"

**Character notes:**
- Two sentences. That's it. She remembers you. She doesn't re-pitch.
- This plays ONLY if user clicks the (non-pulsing) mic button on return visits.

---

### 2. Pricing Page (`/pricing`)

**Context:** Developer is evaluating. They've seen the product. Now they're deciding.

**Script:**
> "The free tier gets you the CLI and the editor — full voice, no time limit, just rate-limited. Pro removes the limits and adds API access. Team adds SSO. That's it. No gotchas."

**Character notes:**
- She explains pricing like a friend who works there, not a salesperson
- "That's it. No gotchas." — Directly addresses developer skepticism about hidden fees

**Trigger:** Auto-trigger is OFF on pricing. User must click mic button.
**Duration target:** ~10 seconds

---

### 3. Docs Page (`/docs`)

**Context:** Developer is trying to get something done. They don't want to be interrupted.

**Script:**
> "Need help finding something? Just ask me. I know this documentation."

**Character notes:**
- Short. Respectful of context. She's offering to help, not performing.
- This surfaces as a **floating mic button** in the bottom-right of the docs layout
- Clicking it opens a voice input → Clara answers based on docs content (Phase 2 feature — for Phase 1, skip the interactive answer and just say the static line)

**Trigger:** User clicks floating mic.
**Duration target:** ~4 seconds

---

### 4. Sign-In / Sign-Up Pages (`/sign-in`, `/sign-up`)

**No voice on auth pages.**

Rationale: Auth flows require focus. An unexpected voice on a login page is disorienting. The CTA has already worked — the developer is converting. Don't interrupt the moment.

---

### 5. Dashboard (`/dashboard`) — Post-Auth Welcome (First Login Only)

**Context:** Developer just signed up for the first time. They're in. This is the moment to make them feel like they made the right call.

**Script:**
> "You're in. Your API key is right there — copy it into your CLI and we'll get started. If you want to hear how I sound in your terminal, just say 'clara hello' after you install."

**Character notes:**
- Practical. She tells them the next action immediately.
- "If you want to hear how I sound in your terminal" — bridges the web experience to the product they're about to use
- "just say 'clara hello'" — teaches the interaction model without documentation

**Trigger:** Fires once on first `/dashboard` visit post-signup. Uses `localStorage` flag `clara-dashboard-welcomed`.
**Duration target:** ~13 seconds

---

## Emotional Arc Across the Visit

| Stage | Page | Clara's Job | Emotional Target |
|-------|------|-------------|-----------------|
| Hook | `/` | Introduce herself | Curiosity → Interest |
| Demo | `/` (after greeting, user sees terminal demo) | (silence — the demo speaks) | Interest → "I want this" |
| Evaluate | `/pricing` | Answer the cost question honestly | Trust → Decision |
| Learn | `/docs` | Be available, not intrusive | Confidence |
| Convert | `/sign-up` → `/dashboard` | Welcome them in, give next action | Commitment |

---

## Technical Implementation

### Audio Delivery Flow

```
User clicks mic button on claracode.ai
        ↓
Frontend: POST /api/voice/greet { page: 'homepage', visit: 'first' }
        ↓
clara-code-backend (Express)
  → Looks up script by { page, visit }
  → POST https://[modal-url]/voice/tts
    { text: "Hey. I'm Clara...", voice: "clara", format: "mp3" }
        ↓
Modal Voice Server (XTTS v2)
  → Synthesizes audio using Clara's cloned voice
  → Returns MP3 binary
        ↓
Backend streams MP3 back to frontend
        ↓
Frontend: new Audio(blobURL).play()
```

### Backend Routes Required

```
POST /api/voice/greet
  Body: { page: string, visit: 'first' | 'return' }
  Returns: audio/mpeg (streamed)
  Auth: None (public)
  Rate limit: 5 req/IP/minute (prevents abuse)
```

### Script Registry (backend config — NOT frontend)

Scripts live in the backend, not the frontend. The frontend never holds the text — it just requests audio. This protects the voice IP.

```ts
// backend/src/config/voice-scripts.ts
export const VOICE_SCRIPTS = {
  homepage: {
    first: "Hey. I'm Clara. I'm a coding assistant — but I work a little differently than what you've probably tried before. I live in your terminal, your editor, and right here. I can hear you. Talk to me like you'd talk to a senior engineer. Let's build something.",
    return: "Welcome back. Where were we?"
  },
  pricing: {
    first: "The free tier gets you the CLI and the editor — full voice, no time limit, just rate-limited. Pro removes the limits and adds API access. Team adds SSO. That's it. No gotchas.",
  },
  docs: {
    first: "Need help finding something? Just ask me. I know this documentation."
  },
  dashboard: {
    first: "You're in. Your API key is right there — copy it into your CLI and we'll get started. If you want to hear how I sound in your terminal, just say 'clara hello' after you install."
  }
}
```

### Frontend Components Required

| Component | Location | Purpose |
|-----------|----------|---------|
| `VoiceMicButton` | `packages/web-ui/src/components/voice/VoiceMicButton.tsx` | Pulsing mic CTA — homepage hero |
| `VoiceBar` | `packages/web-ui/src/components/voice/VoiceBar.tsx` | Waveform animation during playback |
| `VoiceMuteToggle` | `packages/web-ui/src/components/nav/VoiceMuteToggle.tsx` | Speaker icon in header |
| `VoiceFloating` | `packages/web-ui/src/components/voice/VoiceFloating.tsx` | Floating mic button for /docs |
| `useVoiceGreeting` | `packages/web-ui/src/hooks/useVoiceGreeting.ts` | First-visit detection, session state, audio loading |

### SSM Parameters Required

```
/clara-code/production/VOICE_ENABLED = true
/clara-code/develop/VOICE_ENABLED = true
/clara-code/production/MODAL_VOICE_URL = https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run
/clara-code/develop/MODAL_VOICE_URL = https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run
```

---

## Accessibility Requirements

- All voice greetings have a visible text transcript available on demand (click "Read instead" link below mic button)
- Mute toggle is keyboard accessible (Tab + Enter)
- If audio fails to load (network error, Modal cold start), the page degrades gracefully — no error shown to user
- `aria-label="Hear Clara's greeting"` on the mic button
- `prefers-reduced-motion` respected — pulse animation disabled, mic button is static

---

## Cold Start Handling

Modal voice server has a ~110s cold start when sleeping. claracode.ai must handle this gracefully.

**Strategy:**
1. Frontend shows "Waking Clara up..." spinner (friendly, not scary) for up to 15 seconds
2. If response takes > 15s, show fallback: "Clara's warming up. Here's what she'd say:" + text version of the greeting
3. Backend pre-warms the Modal server on a schedule (ping `/voice/health` every 10 minutes via cron) — prevents cold starts during business hours

---

## Voice Clone Requirements

**Clara's voice must be cloned before this feature ships.**

| Requirement | Detail |
|-------------|--------|
| Source WAV | 2-5 minutes of clean speech, single speaker, no background noise |
| Speaker | To be determined by founding team — Clara Villarosa's voice, or a voice that represents Clara's character |
| Upload target | Modal volume: `clara-voice-clones` (same volume as agent voices) |
| Voice ID | `clara` |
| Test phrase | "Hey. I'm Clara. Let's build something." |
| Accept criteria | <3s generation time on warm server, no artifacts, matches persona |

**Note:** Until the real Clara voice is cloned, use a placeholder voice for development (any voice in the current Modal volume is acceptable for testing).

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Voice demo plays (homepage) | >40% of first-time visitors |
| Audio loads within 3s (warm server) | >90% of plays |
| Mute rate | <15% (if higher, revisit script — something is annoying people) |
| Sign-up rate, users who heard greeting vs. didn't | >2x lift |
| Zero autoplay policy violations | 100% — never auto-play without gesture |

---

## Out of Scope (Phase 1)

- Interactive voice Q&A on docs (Phase 2)
- Clara responding to typed questions via voice on the marketing site (Phase 2)
- Per-user voice personalization on the marketing site (only in the actual product)
- Voice on auth pages

---

## Dependencies

- [ ] Clara's voice WAV sourced and uploaded to Modal volume
- [ ] Modal voice server running with `/voice/tts` endpoint (✅ LIVE)
- [ ] Backend proxy route `/api/voice/greet` implemented (Miles)
- [ ] Frontend components built (Motley)
- [ ] SSM parameters set for MODAL_VOICE_URL
- [ ] Accessibility audit (Claudia — part of docs/onboarding review)

---

## Approvals

| Role | Name | Status |
|------|------|--------|
| Product Owner | Mary (Dr. Mary McLeod Bethune) | ✅ Approved |
| Tech Lead | Carruthers (George Carruthers) | Pending |
| Dev Relations | Claudia (Claudia Jones) | Pending |
| Founder | Amen Ra Mendel | Pending |
