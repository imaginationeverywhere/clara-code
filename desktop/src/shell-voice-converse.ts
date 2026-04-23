// Unit tests: not applicable — this module uses browser-only APIs (MediaRecorder,
// getUserMedia, AudioContext, Audio). Covered by E2E testing in Tauri webview context.
// See docs/testing/desktop-voice-e2e-plan.md for planned test scenarios.
import {
	type ConverseResult,
	postVoiceConverse,
} from "@imaginationeverywhere/clara-voice-client/converse-browser";

const sessionId =
	typeof crypto !== "undefined" && "randomUUID" in crypto
		? crypto.randomUUID()
		: `clara-desk-${Date.now()}`;

function metaContent(name: string): string {
	const m = document.querySelector(`meta[name="${name}"]`);
	if (!m) {
		return "";
	}
	return (m.getAttribute("content") ?? "").trim();
}

function voiceBase(): string {
	return metaContent("clara-voice-base");
}

function voiceApiKey(): string | undefined {
	const c = metaContent("clara-voice-api-key");
	return c.length > 0 ? c : undefined;
}

function playBase64Audio(b64: string, mime: string) {
	const binary = atob(b64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	const header = mime.split(";")[0]?.trim() ?? "audio/mpeg";
	const blob = new Blob([bytes], { type: header });
	const url = URL.createObjectURL(blob);
	const a = new Audio();
	a.src = url;
	void a
		.play()
		.catch(() => {
			/* best-effort */
		})
		.finally(() => {
			URL.revokeObjectURL(url);
		});
}

function blobToBase64Padded(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const r = new FileReader();
		r.onloadend = () => {
			const s = r.result as string;
			const i = s.indexOf("base64,");
			resolve(i >= 0 ? s.slice(i + 7) : s);
		};
		r.onerror = () => {
			reject(new Error("readAsDataURL failed"));
		};
		r.readAsDataURL(blob);
	});
}

function getEl<T extends HTMLElement>(id: string): T | null {
	return document.getElementById(id) as T | null;
}

type Ui = {
	messages: HTMLElement;
	status: HTMLElement;
	mic: HTMLButtonElement;
	textInput: HTMLInputElement;
	send: HTMLButtonElement;
};

let ui: Ui;
let isRecording = false;
let isBusy = false;
let rec: MediaRecorder | null = null;
let chunks: Blob[] = [];
let stream: MediaStream | null = null;

function appendMessage(role: "user" | "clara", text: string) {
	const row = document.createElement("div");
	row.className = `clara-voice-msg clara-voice-msg--${role}`;
	row.textContent = `${role === "user" ? "You" : "Clara"}: ${text}`;
	ui.messages.appendChild(row);
	ui.messages.scrollTop = ui.messages.scrollHeight;
}

function setStatus(s: string) {
	ui.status.textContent = s;
}

async function runGreeting() {
	const base = voiceBase();
	if (!base) {
		setStatus("Set <meta name=\"clara-voice-base\" content=\"https://…\"> to your CLARA_VOICE_URL, then restart.");
		return;
	}
	setStatus("Loading greeting…");
	const res: ConverseResult = await postVoiceConverse(base, { text: "" }, { apiKey: voiceApiKey() });
	if (!res.ok) {
		const msg = res.offline ? `Offline: ${res.error}` : res.error;
		setStatus(`Greeting: ${msg}`);
		return;
	}
	if (typeof res.reply_text === "string" && res.reply_text.length > 0) {
		appendMessage("clara", res.reply_text);
	}
	if (typeof res.reply_audio_base64 === "string" && res.reply_audio_base64.length > 0) {
		const mime = res.mime_type && res.mime_type.length > 0 ? res.mime_type : "audio/mpeg";
		playBase64Audio(res.reply_audio_base64, mime);
	}
	setStatus("Click mic: record → click again: send. Space: toggle when input not focused. Type and Send for text.");
}

function stopStream() {
	if (stream) {
		for (const t of stream.getTracks()) {
			t.stop();
		}
		stream = null;
	}
}

async function endRecordingAndSend() {
	if (!rec) {
		return;
	}
	const m = rec;
	isRecording = false;
	ui.mic.classList.remove("listening");
	rec = null;
	if (m.state === "recording" && "requestData" in m && typeof m.requestData === "function") {
		m.requestData();
	}
	await new Promise<void>((r) => {
		m.addEventListener("stop", () => {
			r();
		}, { once: true });
		m.stop();
	});
	const blob = new Blob(chunks, { type: m.mimeType || "audio/webm" });
	chunks = [];
	stopStream();

	if (isBusy) {
		return;
	}
	const base = voiceBase();
	if (!base) {
		setStatus("clara-voice-base is not set.");
		return;
	}
	isBusy = true;
	setStatus("Sending to /voice/converse…");
	const b64 = await blobToBase64Padded(blob);
	const res = await postVoiceConverse(
		base,
		{
			session_id: sessionId,
			audio_base64: b64,
			mime_type: blob.type || m.mimeType || "audio/webm",
		},
		{ apiKey: voiceApiKey() },
	);
	isBusy = false;
	if (!res.ok) {
		const msg = res.offline ? `Offline: ${res.error}` : res.error;
		setStatus(`Converse: ${msg}`);
		return;
	}
	if (typeof res.reply_text === "string" && res.reply_text.length > 0) {
		appendMessage("clara", res.reply_text);
	}
	if (typeof res.reply_audio_base64 === "string" && res.reply_audio_base64.length > 0) {
		setStatus("Playing response…");
		const mime = res.mime_type && res.mime_type.length > 0 ? res.mime_type : "audio/mpeg";
		playBase64Audio(res.reply_audio_base64, mime);
	}
	setStatus("Click mic: record again, or use text.");
}

async function startRecording() {
	const base = voiceBase();
	if (!base) {
		setStatus("Set clara-voice-base in <meta> (same as CLARA_VOICE_URL).");
		return;
	}
	if (isBusy) {
		return;
	}
	try {
		stream = await navigator.mediaDevices.getUserMedia({ audio: true });
	} catch {
		setStatus("Microphone access denied or unavailable.");
		return;
	}
	const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
		? "audio/webm;codecs=opus"
		: "audio/webm";
	rec = new MediaRecorder(stream, { mimeType: mime });
	chunks = [];
	rec.addEventListener("dataavailable", (e) => {
		if (e.data.size > 0) {
			chunks.push(e.data);
		}
	});
	rec.addEventListener("error", () => {
		setStatus("Recording error.");
	});
	rec.start(100);
	isRecording = true;
	ui.mic.classList.add("listening");
	setStatus("Listening… click mic again to send to /voice/converse");
}

async function toggleMic() {
	if (isBusy) {
		return;
	}
	if (isRecording) {
		await endRecordingAndSend();
	} else {
		await startRecording();
	}
}

async function sendText() {
	const t = ui.textInput.value.trim();
	if (!t || isBusy) {
		return;
	}
	const base = voiceBase();
	if (!base) {
		setStatus("Set clara-voice-base first.");
		return;
	}
	ui.textInput.value = "";
	appendMessage("user", t);
	isBusy = true;
	setStatus("Sending text…");
	const res = await postVoiceConverse(
		base,
		{ session_id: sessionId, text: t },
		{ apiKey: voiceApiKey() },
	);
	isBusy = false;
	if (!res.ok) {
		const msg = res.offline ? `Offline: ${res.error}` : res.error;
		setStatus(`Converse: ${msg}`);
		return;
	}
	if (typeof res.reply_text === "string" && res.reply_text.length > 0) {
		appendMessage("clara", res.reply_text);
	}
	if (typeof res.reply_audio_base64 === "string" && res.reply_audio_base64.length > 0) {
		const mime = res.mime_type && res.mime_type.length > 0 ? res.mime_type : "audio/mpeg";
		playBase64Audio(res.reply_audio_base64, mime);
	}
	setStatus("Ready.");
}

function isTypingTarget(t: EventTarget | null) {
	if (!t || !(t instanceof HTMLElement)) {
		return false;
	}
	if (t.tagName === "TEXTAREA" || t.tagName === "INPUT") {
		return true;
	}
	return t.isContentEditable;
}

function init() {
	const messages = getEl<HTMLDivElement>("clara-messages");
	const status = getEl<HTMLDivElement>("clara-status");
	const mic = getEl<HTMLButtonElement>("clara-mic");
	const textInput = getEl<HTMLInputElement>("clara-text");
	const send = getEl<HTMLButtonElement>("clara-send");
	if (!messages || !status || !mic || !textInput || !send) {
		return;
	}
	ui = { messages, status, mic, textInput, send };

	mic.addEventListener("click", () => {
		toggleMic().catch(() => {
			setStatus("Error.");
		});
	});
	send.addEventListener("click", () => {
		sendText().catch(() => {
			setStatus("Error.");
		});
	});
	textInput.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			void sendText();
		}
	});
	document.addEventListener("keydown", (e) => {
		if (e.code !== "Space" || e.repeat) {
			return;
		}
		if (isTypingTarget(e.target)) {
			return;
		}
		e.preventDefault();
		toggleMic().catch(() => {
			setStatus("Error.");
		});
	});

	void runGreeting();
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init);
} else {
	init();
}
