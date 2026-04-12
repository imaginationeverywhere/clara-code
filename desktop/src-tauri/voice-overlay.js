"use strict";
(() => {
  // src/voice-overlay.css
  var voice_overlay_default = "#clara-voice-overlay-root {\n	position: fixed;\n	z-index: 2147483646;\n	inset: 0;\n	pointer-events: none;\n}\n\n#clara-voice-overlay-root .clara-voice-fab {\n	pointer-events: auto;\n	position: fixed;\n	right: 24px;\n	bottom: 24px;\n	width: 56px;\n	height: 56px;\n	padding: 0;\n	border: none;\n	border-radius: 9999px;\n	cursor: pointer;\n	display: flex;\n	align-items: center;\n	justify-content: center;\n	background: linear-gradient(145deg, #6366f1 0%, #4f46e5 55%, #4338ca 100%);\n	color: #f8fafc;\n	box-shadow:\n		0 10px 25px rgba(15, 23, 42, 0.35),\n		0 0 0 1px rgba(255, 255, 255, 0.08) inset;\n	transition: transform 0.15s ease, box-shadow 0.15s ease;\n}\n\n#clara-voice-overlay-root .clara-voice-fab:hover {\n	transform: scale(1.05);\n	box-shadow:\n		0 14px 32px rgba(15, 23, 42, 0.45),\n		0 0 0 1px rgba(255, 255, 255, 0.12) inset;\n}\n\n#clara-voice-overlay-root .clara-voice-fab:focus-visible {\n	outline: 2px solid #a5b4fc;\n	outline-offset: 3px;\n}\n\n#clara-voice-overlay-root .clara-voice-fab:disabled {\n	opacity: 0.65;\n	cursor: not-allowed;\n	transform: none;\n}\n\n#clara-voice-overlay-root .clara-voice-fab svg {\n	width: 26px;\n	height: 26px;\n	flex-shrink: 0;\n}\n\n@keyframes clara-voice-pulse {\n	0%,\n	100% {\n		box-shadow:\n			0 10px 25px rgba(15, 23, 42, 0.35),\n			0 0 0 0 rgba(99, 102, 241, 0.55);\n	}\n	50% {\n		box-shadow:\n			0 14px 32px rgba(15, 23, 42, 0.45),\n			0 0 0 12px rgba(99, 102, 241, 0);\n	}\n}\n\n#clara-voice-overlay-root .clara-voice-fab--pulse {\n	animation: clara-voice-pulse 1.4s ease-in-out infinite;\n}\n";

  // src/voice-overlay.ts
  var TTS_URL = "https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run/voice/tts";
  var DEFAULT_TTS_TEXT = "Hey, I am Clara. How can I help with your code today?";
  function isClaraDesktopSurface() {
    const { hostname } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return true;
    }
    if (hostname === "claracode.ai") {
      return true;
    }
    if (hostname.endsWith(".claracode.ai")) {
      return true;
    }
    return false;
  }
  function micIconSvg() {
    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
  <line x1="12" y1="19" x2="12" y2="23"/>
  <line x1="8" y1="23" x2="16" y2="23"/>
</svg>`.trim();
  }
  function mountClaraVoiceOverlay() {
    if (!isClaraDesktopSurface()) {
      return;
    }
    if (document.getElementById("clara-voice-overlay-root")) {
      return;
    }
    const style = document.createElement("style");
    style.setAttribute("data-clara-voice-overlay", "");
    style.textContent = voice_overlay_default;
    document.documentElement.appendChild(style);
    const root = document.createElement("div");
    root.id = "clara-voice-overlay-root";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "clara-voice-fab";
    button.setAttribute("aria-label", "Clara voice");
    button.innerHTML = micIconSvg();
    let busy = false;
    button.addEventListener("click", () => {
      void (async () => {
        if (busy) {
          return;
        }
        busy = true;
        button.disabled = true;
        button.classList.add("clara-voice-fab--pulse");
        try {
          const response = await fetch(TTS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: DEFAULT_TTS_TEXT,
              voice_id: "default"
            })
          });
          if (!response.ok) {
            throw new Error(`TTS request failed: ${response.status}`);
          }
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          const audio = new Audio(objectUrl);
          audio.addEventListener(
            "ended",
            () => {
              URL.revokeObjectURL(objectUrl);
            },
            { once: true }
          );
          audio.addEventListener(
            "error",
            () => {
              URL.revokeObjectURL(objectUrl);
            },
            { once: true }
          );
          await audio.play();
        } catch (err) {
          console.error("[clara voice overlay]", err);
        } finally {
          busy = false;
          button.disabled = false;
          button.classList.remove("clara-voice-fab--pulse");
        }
      })();
    });
    root.appendChild(button);
    document.documentElement.appendChild(root);
  }

  // src/main.ts
  mountClaraVoiceOverlay();
})();
