"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type AgentRole = "frontend" | "backend" | "devops";
type ModelTier = "fast" | "deep" | "high-effort";

const INTRO =
	"Here's your team. Three agents, three roles. Name them. Give them a voice. Pick how they think. They're yours.";

type Slot = {
	slotIndex: 0 | 1 | 2;
	role: AgentRole;
	name: string;
	voiceSource: "clone" | "library";
	modelTier: ModelTier;
};

const DEFAULTS: Slot[] = [
	{ slotIndex: 0, role: "frontend", name: "Nannie", voiceSource: "clone", modelTier: "fast" },
	{ slotIndex: 1, role: "backend", name: "Daniel", voiceSource: "library", modelTier: "deep" },
	{ slotIndex: 2, role: "devops", name: "Robert", voiceSource: "library", modelTier: "high-effort" },
];

export default function TeamBuilderPage() {
	const router = useRouter();
	const [status, setStatus] = useState<"speaking" | "ready">("speaking");
	const [slots, setSlots] = useState<Slot[]>(DEFAULTS);
	const [error, setError] = useState<string | null>(null);
	const [hasClone, setHasClone] = useState(false);

	// After mount, align defaults with sessionStorage (no voice clone → all Library).
	useEffect(() => {
		queueMicrotask(() => {
			const id = sessionStorage.getItem("onboarding-voice-id");
			const has = id !== null;
			setHasClone(has);
			if (!has) {
				setSlots((prev) => prev.map((s) => ({ ...s, voiceSource: "library" })));
			}
		});
	}, []);

	useEffect(() => {
		let cancelled = false;
		async function intro() {
			try {
				const res = await fetch("/api/voice/tts", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ text: INTRO, voice: "clara" }),
				});
				if (!res.ok || cancelled) {
					setStatus("ready");
					return;
				}
				const blob = await res.blob();
				const url = URL.createObjectURL(blob);
				const audio = new Audio(url);
				audio.onended = () => {
					URL.revokeObjectURL(url);
					if (!cancelled) setStatus("ready");
				};
				audio.onerror = () => {
					URL.revokeObjectURL(url);
					if (!cancelled) setStatus("ready");
				};
				await audio.play();
			} catch {
				if (!cancelled) setStatus("ready");
			}
		}
		void intro();
		return () => {
			cancelled = true;
		};
	}, []);

	const updateSlot = (index: number, patch: Partial<Slot>) => {
		setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
	};

	const submit = useCallback(async () => {
		setError(null);
		const cloneId = sessionStorage.getItem("onboarding-voice-id");
		const usesClone = slots.some((s) => s.voiceSource === "clone");
		if (cloneId && !usesClone) {
			setError("Select “Your voice” for at least one agent.");
			return;
		}
		for (const s of slots) {
			const t = s.name.trim();
			if (!/^[a-zA-Z0-9 \-]{1,40}$/.test(t)) {
				setError("Each name must be 1–40 characters (letters, numbers, spaces, hyphen).");
				return;
			}
		}

		const payload = {
			agents: slots.map((s) => {
				const voiceId =
					s.voiceSource === "clone" ? (cloneId ?? "granville") : "granville";
				return {
					slotIndex: s.slotIndex,
					role: s.role,
					name: s.name.trim(),
					voiceId,
					modelTier: s.modelTier,
				};
			}),
		};

		const res = await fetch("/api/onboarding/team", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});
		if (!res.ok) {
			setError("Could not save your team. Try again.");
			return;
		}
		sessionStorage.setItem("onboarding-agents", JSON.stringify(payload.agents));
		router.push("/onboarding/activate");
	}, [router, slots]);

	const labels: Record<AgentRole, string> = {
		frontend: "Frontend",
		backend: "Backend",
		devops: "DevOps",
	};

	return (
		<div className="flex w-full max-w-5xl flex-col gap-8">
			<p className="text-center text-sm text-text-muted">Step 2 of 3 — Team Builder</p>
			{status === "speaking" ? (
				<p className="text-center text-text-secondary">Clara is speaking…</p>
			) : null}
			<div className="grid gap-4 md:grid-cols-3">
				{slots.map((s, i) => (
					<div
						key={s.slotIndex}
						className="rounded-2xl border border-border bg-bg-overlay p-4 text-left shadow-sm"
					>
						<p className="text-xs font-semibold uppercase text-text-muted">{labels[s.role]}</p>
						<label className="mt-3 block text-sm text-text-secondary" htmlFor={`name-${i}`}>
							Name
						</label>
						<input
							id={`name-${i}`}
							className="mt-1 w-full rounded-lg border border-border bg-bg-sunken px-3 py-2 text-sm text-text-primary"
							value={s.name}
							onChange={(e) => updateSlot(i, { name: e.target.value })}
							maxLength={40}
						/>
						<p className="mt-4 text-xs text-text-muted">Voice</p>
						<div className="mt-2 flex flex-col gap-2">
							<label className="flex cursor-pointer items-center gap-2 text-sm">
								<input
									type="radio"
									name={`voice-${i}`}
									checked={s.voiceSource === "clone"}
									disabled={!hasClone}
									onChange={() => updateSlot(i, { voiceSource: "clone" })}
								/>
								Your voice
							</label>
							<label className="flex cursor-pointer items-center gap-2 text-sm">
								<input
									type="radio"
									name={`voice-${i}`}
									checked={s.voiceSource === "library"}
									onChange={() => updateSlot(i, { voiceSource: "library" })}
								/>
								Library
							</label>
						</div>
						<p className="mt-4 text-xs text-text-muted">Thinks</p>
						<div className="mt-2 flex flex-col gap-2">
							{(
								[
									["fast", "Fast"],
									["deep", "Deep"],
									["high-effort", "Careful"],
								] as const
							).map(([value, label]) => (
								<label key={value} className="flex cursor-pointer items-center gap-2 text-sm">
									<input
										type="radio"
										name={`tier-${i}`}
										checked={s.modelTier === value}
										onChange={() => updateSlot(i, { modelTier: value })}
									/>
									{label}
								</label>
							))}
						</div>
					</div>
				))}
			</div>
			{error ? <p className="text-center text-sm text-amber-400">{error}</p> : null}
			<button
				type="button"
				onClick={() => void submit()}
				disabled={status !== "ready"}
				className="mx-auto rounded-xl border border-border px-8 py-3 text-sm font-semibold text-text-primary enabled:bg-brand-purple enabled:text-white enabled:border-brand-purple disabled:opacity-40"
			>
				Continue
			</button>
		</div>
	);
}
