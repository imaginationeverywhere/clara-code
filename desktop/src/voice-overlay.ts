import cssText from "./voice-overlay.css";

const DEFAULT_TTS_TEXT = "Hey, I am Clara. How can I help with your code today?";

function isClaraDesktopSurface(): boolean {
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

function micIconSvg(): string {
	return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
  <line x1="12" y1="19" x2="12" y2="23"/>
  <line x1="8" y1="23" x2="16" y2="23"/>
</svg>`.trim();
}

export function mountClaraVoiceOverlay(): void {
	if (!isClaraDesktopSurface()) {
		return;
	}
	if (document.getElementById("clara-voice-overlay-root")) {
		return;
	}

	const style = document.createElement("style");
	style.setAttribute("data-clara-voice-overlay", "");
	style.textContent = cssText;
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
				const response = await fetch("/api/voice/tts", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						text: DEFAULT_TTS_TEXT,
					}),
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
					{ once: true },
				);
				audio.addEventListener(
					"error",
					() => {
						URL.revokeObjectURL(objectUrl);
					},
					{ once: true },
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
