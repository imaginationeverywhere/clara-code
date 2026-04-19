"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type CloneStatus =
	| "clara-speaking"
	| "idle"
	| "recording"
	| "processing"
	| "done"
	| "error";

const CLARA_LINE =
	"Welcome. I'm Clara. Before I introduce you to your team, I want to hear your voice. Tap the mic and say something — anything. I'll do the rest.";

export default function VoiceClonePage() {
	const router = useRouter();
	const [status, setStatus] = useState<CloneStatus>("clara-speaking");
	const [countdown, setCountdown] = useState(5);
	const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const clearTick = () => {
		if (tickRef.current) {
			clearInterval(tickRef.current);
			tickRef.current = null;
		}
	};

	useEffect(() => {
		let cancelled = false;
		async function greet() {
			try {
				const res = await fetch("/api/voice/tts", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ text: CLARA_LINE, voice: "clara" }),
				});
				if (!res.ok || cancelled) {
					setStatus("idle");
					return;
				}
				const blob = await res.blob();
				const url = URL.createObjectURL(blob);
				const audio = new Audio(url);
				audio.onended = () => {
					URL.revokeObjectURL(url);
					if (!cancelled) setStatus("idle");
				};
				audio.onerror = () => {
					URL.revokeObjectURL(url);
					if (!cancelled) setStatus("idle");
				};
				await audio.play();
			} catch {
				if (!cancelled) setStatus("idle");
			}
		}
		void greet();
		return () => {
			cancelled = true;
		};
	}, []);

	const startRecording = useCallback(async () => {
		if (status !== "idle" && status !== "error") return;

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
				? "audio/webm;codecs=opus"
				: "audio/webm";
			const chunks: Blob[] = [];
			const rec = new MediaRecorder(stream, { mimeType: mime });
			rec.ondataavailable = (ev: BlobEvent) => {
				if (ev.data.size > 0) chunks.push(ev.data);
			};
			rec.onstop = () => {
				stream.getTracks().forEach((t) => t.stop());
				clearTick();
				void (async () => {
					setStatus("processing");
					const blob = new Blob(chunks, { type: mime });
					const reader = new FileReader();
					reader.onloadend = async () => {
						const dataUrl = reader.result;
						if (typeof dataUrl !== "string") {
							setStatus("error");
							return;
						}
						const base64 = dataUrl.split(",")[1] ?? "";
						try {
							const res = await fetch("/api/voice/clone", {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({ audioBase64: base64 }),
							});
							const payload = (await res.json()) as {
								voiceId?: string;
								playbackUrl?: string;
							};
							if (!res.ok || !payload.voiceId || !payload.playbackUrl) {
								setStatus("error");
								return;
							}
							sessionStorage.setItem("onboarding-voice-id", payload.voiceId);
							sessionStorage.setItem("onboarding-playback-url", payload.playbackUrl);
							const play = new Audio(payload.playbackUrl);
							await play.play();
							setStatus("done");
						} catch {
							setStatus("error");
						}
					};
					reader.readAsDataURL(blob);
				})();
			};

			setStatus("recording");
			setCountdown(5);
			tickRef.current = setInterval(() => {
				setCountdown((c) => (c <= 1 ? 1 : c - 1));
			}, 1000);
			rec.start();
			setTimeout(() => {
				if (rec.state !== "inactive") rec.stop();
			}, 5000);
		} catch {
			setStatus("error");
		}
	}, [status]);

	useEffect(() => () => clearTick(), []);

	const caption = (() => {
		if (status === "clara-speaking") return "Clara is speaking…";
		if (status === "idle") return "Tap to record (5 seconds)";
		if (status === "recording") return `Recording… ${countdown}`;
		if (status === "processing") return "Cloning your voice…";
		if (status === "done") return "That sounded just like you.";
		if (status === "error") return "Couldn't clone — try again";
		return "";
	})();

	return (
		<div className="flex w-full max-w-lg flex-col items-center gap-8 text-center">
			<p className="text-sm text-text-muted">Step 1 of 3 — Your Voice</p>
			<h1 className="text-2xl font-semibold text-text-primary">Before you meet your team, we need your voice.</h1>
			<button
				type="button"
				onClick={() => void startRecording()}
				disabled={
					status === "clara-speaking" ||
					status === "recording" ||
					status === "processing" ||
					status === "done"
				}
				className="relative flex h-24 w-24 items-center justify-center rounded-full bg-brand-purple text-white shadow-[0_0_40px_rgba(124,58,237,0.5)] transition hover:bg-brand-purple-hover disabled:cursor-not-allowed disabled:opacity-60"
				aria-label="Record voice sample"
			>
				<span className="text-3xl">🎤</span>
			</button>
			<p className="text-text-secondary">{caption}</p>
			<button
				type="button"
				onClick={() => router.push("/onboarding/team-builder")}
				disabled={status !== "done"}
				className="rounded-xl border border-border px-6 py-3 text-sm font-medium text-text-primary enabled:bg-clara enabled:text-white enabled:border-clara disabled:opacity-40"
			>
				Next: Meet Your Team
			</button>
		</div>
	);
}
