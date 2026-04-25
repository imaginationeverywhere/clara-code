const GATEWAY_URL = "https://info-24346--hermes-gateway.modal.run";
const BACKEND_URL = "https://api.claracode.ai";

export async function fetchGreeting(userId = "visitor"): Promise<string> {
	const res = await fetch(GATEWAY_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ platform: "web", user: userId, message: "" }),
		signal: AbortSignal.timeout(8000),
	});
	if (!res.ok) {
		return "Hello, I'm Clara. Your voice coding team starts here.";
	}
	const data = (await res.json()) as Record<string, unknown>;
	return (
		(typeof data.reply === "string" ? data.reply : null) ?? "Hello, I'm Clara. Your voice coding team starts here."
	);
}

export async function speakText(text: string): Promise<void> {
	const res = await fetch(`${BACKEND_URL}/api/voice/tts`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ text }),
		signal: AbortSignal.timeout(15000),
	});
	if (!res.ok) {
		throw new Error("TTS failed");
	}
	const blob = await res.blob();
	const url = URL.createObjectURL(blob);
	const audio = new Audio(url);
	await new Promise<void>((resolve, reject) => {
		audio.onended = () => {
			URL.revokeObjectURL(url);
			resolve();
		};
		audio.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error("playback error"));
		};
		void audio.play().catch(reject);
	});
}
