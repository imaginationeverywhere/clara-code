# Prompt 05 — Desktop: Main Window Layout

**Status:** Delivered for **Tauri v2** (this repo has no Electron/`forge.config.ts`). Static shell: `desktop/shell/index.html` (`data-clara-desktop-shell` skips the injected voice FAB). `src-tauri/tauri.conf.json` uses `http://localhost:1420` in dev (`npm run shell:serve`) and `frontendDist: ../shell` for release builds. Window size set to 800×600 (min 600×500).

**TARGET REPO:** `/Volumes/X10-Pro/Native-Projects/AI/clara-code`  
_(Auto-classified 2026-04-15. If wrong, edit this line before dispatch.)_
**Author:** Matthew Henson (Mobile/Desktop Engineer, Clara Agents Team)
**Task:** Desktop app main window
**Machine:** QCS1 (Mac M4 Pro — dispatch via Cursor agents)
**Priority:** P1 — Ships after web is live

---

## Context

Build the main Electron app window for Clara Desktop. The desktop app lives at `desktop/`. It uses:
- Electron + Webpack (via `forge.config.ts`)
- TypeScript
- `desktop/src/renderer.ts` — main renderer process entry
- `desktop/src/index.html` — the HTML shell

This is the voice-first desktop experience. Reference: `~/auset-brain/Projects/clara-desktop-voice-requirements.md`

---

## What to Build

The desktop app should feel like a premium macOS native app. Dark, minimal, focused on voice.

### Main Window Layout

```
┌────────────────────────────────────────────────────┐
│  ● ● ●    [Clara logo]            [●] Online       │
├────────────────────────────────────────────────────┤
│                                                    │
│                                                    │
│           ┌──────────────────────┐                │
│           │                      │                │
│           │   [Large animated    │                │
│           │    mic circle]       │                │
│           │                      │                │
│           │   Clara is ready     │                │
│           │                      │                │
│           └──────────────────────┘                │
│                                                    │
│   ┌────────────────────────────────────────────┐  │
│   │  Say something or type here...           ↵ │  │
│   └────────────────────────────────────────────┘  │
│                                                    │
│   Recent:                                         │
│   "What's on my schedule today?" — 2 min ago      │
│   "Draft an email to the team" — 15 min ago       │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Implementation

**`desktop/src/index.html`** — Replace/rebuild with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Clara</title>
  <style>
    /* Inline CSS — no external deps for desktop */
    :root {
      --bg: #0A0A0A;
      --card: #151515;
      --border: #1A2A2E;
      --clara-blue: #7BC8D8;
      --text: #FFFFFF;
      --muted: #888888;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    /* Traffic lights area + title bar */
    .titlebar {
      height: 40px;
      -webkit-app-region: drag;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 80px 0 80px; /* space for traffic lights */
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }
    /* Main content */
    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      gap: 32px;
    }
    /* Animated mic circle */
    .mic-container {
      position: relative;
      width: 200px;
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .mic-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: var(--clara-blue);
      opacity: 0.15;
      animation: ping 3s ease-in-out infinite;
    }
    .mic-circle {
      width: 160px;
      height: 160px;
      border-radius: 50%;
      background: var(--clara-blue);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s;
      box-shadow: 0 0 60px rgba(123,200,216,0.2);
      position: relative;
      z-index: 1;
    }
    .mic-circle:hover { transform: scale(1.05); }
    .mic-circle.listening {
      animation: pulse 1s ease-in-out infinite;
      background: linear-gradient(135deg, var(--clara-blue), #A8DDE8);
    }
    .mic-icon { width: 64px; height: 64px; color: #0A0A0A; }
    @keyframes ping {
      0%, 100% { transform: scale(1); opacity: 0.15; }
      50% { transform: scale(1.2); opacity: 0.05; }
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 30px rgba(123,200,216,0.4); }
      50% { box-shadow: 0 0 80px rgba(123,200,216,0.6); }
    }
    /* Status text */
    .status-text {
      color: var(--muted);
      font-size: 14px;
      text-align: center;
    }
    .status-text.listening { color: var(--clara-blue); }
    /* Input area */
    .input-area {
      width: 100%;
      max-width: 600px;
      display: flex;
      gap: 8px;
    }
    .text-input {
      flex: 1;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 16px;
      color: var(--text);
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    .text-input:focus { border-color: var(--clara-blue); }
    .text-input::placeholder { color: var(--muted); }
    .send-btn {
      background: linear-gradient(135deg, var(--clara-blue), #A8DDE8);
      border: none;
      border-radius: 12px;
      padding: 12px 20px;
      color: #0A0A0A;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      transition: transform 0.2s;
    }
    .send-btn:hover { transform: scale(1.03); }
    /* Recent conversations */
    .recent {
      width: 100%;
      max-width: 600px;
    }
    .recent-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--muted);
      margin-bottom: 8px;
    }
    .recent-item {
      padding: 8px 12px;
      border-radius: 8px;
      background: var(--card);
      border: 1px solid var(--border);
      font-size: 13px;
      color: var(--muted);
      margin-bottom: 4px;
      cursor: pointer;
      transition: border-color 0.2s;
    }
    .recent-item:hover { border-color: var(--clara-blue); color: var(--text); }
  </style>
</head>
<body>
  <!-- Title bar -->
  <div class="titlebar">
    <span style="font-size: 13px; font-weight: 600; color: #888">Clara</span>
  </div>

  <!-- Main content -->
  <div class="main">
    <!-- Mic circle -->
    <div class="mic-container">
      <div class="mic-ring" id="micRing"></div>
      <div class="mic-circle" id="micCircle" onclick="toggleListening()">
        <svg class="mic-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"/>
        </svg>
      </div>
    </div>

    <p class="status-text" id="statusText">Tap to talk to Clara</p>

    <!-- Text input -->
    <div class="input-area">
      <input type="text" class="text-input" id="messageInput"
             placeholder="Ask Clara anything..." onkeydown="handleKeyDown(event)"/>
      <button class="send-btn" onclick="sendMessage()">Send</button>
    </div>

    <!-- Recent conversations -->
    <div class="recent">
      <div class="recent-label">Recent</div>
      <div class="recent-item">"What's on my schedule today?" — 2 min ago</div>
      <div class="recent-item">"Draft a reply to Daysha's message" — 15 min ago</div>
      <div class="recent-item">"Remind me about the QCR launch at 3pm" — 1 hr ago</div>
    </div>
  </div>

  <script>
    let isListening = false;

    function toggleListening() {
      isListening = !isListening;
      const circle = document.getElementById('micCircle');
      const status = document.getElementById('statusText');
      if (isListening) {
        circle.classList.add('listening');
        status.textContent = 'Clara is listening...';
        status.classList.add('listening');
        // Auto-stop after 8 seconds (mock)
        setTimeout(() => { if (isListening) toggleListening(); }, 8000);
      } else {
        circle.classList.remove('listening');
        status.textContent = 'Tap to talk to Clara';
        status.classList.remove('listening');
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Enter') sendMessage();
    }

    function sendMessage() {
      const input = document.getElementById('messageInput');
      const text = input.value.trim();
      if (!text) return;
      console.log('Sending message:', text);
      input.value = '';
      // TODO: wire to Clara gateway in next sprint
    }
  </script>
</body>
</html>
```

---

## `desktop/src/index.ts` (Main process)

```typescript
// Keep existing main process code
// Ensure window is created with:
// - width: 800, height: 600
// - minWidth: 600, minHeight: 500
// - titleBarStyle: 'hiddenInset' (macOS — shows traffic lights)
// - backgroundColor: '#0A0A0A'
// - webPreferences: { nodeIntegration: false, contextIsolation: true }
```

---

## `forge.config.ts` — CSP Fix

Add to devContentSecurityPolicy (allows localhost for development):
```
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:* https://*.modal.run
```

---

## Acceptance Criteria

- [ ] `npm start` (or `npm run start`) launches Electron window
- [ ] Window shows dark background, animated mic circle
- [ ] Clicking mic circle toggles listening state (visual only)
- [ ] Text input accepts text, Enter key triggers send (console.log for now)
- [ ] Recent conversations list shows 3 placeholder items
- [ ] Window has proper title bar with traffic light buttons (macOS)
- [ ] No CSP errors in DevTools console
- [ ] `npm run build` completes without errors
