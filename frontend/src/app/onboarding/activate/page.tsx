"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const INTRO =
	"Your team is ready. One last step — activate your plan and they'll be waiting for you inside.";

type AgentRow = {
	slotIndex: number;
	role: string;
	name: string;
	voiceId: string;
	modelTier: string;
};

export default function ActivatePage() {
	const router = useRouter();
	const [status, setStatus] = useState<"speaking" | "ready">("speaking");
	const [agents, setAgents] = useState<AgentRow[]>([]);
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState<string | null>(null);

	useEffect(() => {
		const raw = sessionStorage.getItem("onboarding-agents");
		if (!raw) {
			router.replace("/onboarding/voice-clone");
			return;
		}
		try {
			const parsed = JSON.parse(raw) as AgentRow[];
			setAgents(parsed);
		} catch {
			router.replace("/onboarding/voice-clone");
		}
	}, [router]);

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

	const activate = useCallback(async () => {
		setLoading(true);
		setErr(null);
		try {
			const res = await fetch("/api/checkout/create-session", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ tier: "basic" }),
			});
			const data = (await res.json()) as { url?: string; error?: string };
			if (data.url) {
				window.location.href = data.url;
				return;
			}
			setErr(data.error ?? "Failed to start checkout");
		} catch {
			setErr("Failed to start checkout");
		} finally {
			setLoading(false);
		}
	}, []);

	const tierLabel: Record<string, string> = {
		fast: "Fast",
		deep: "Deep",
		"high-effort": "Careful",
	};

	return (
		<div className="flex w-full max-w-lg flex-col items-center gap-8 text-center">
			<p className="text-sm text-text-muted">Step 3 of 3 — Activate</p>
			<h1 className="text-2xl font-semibold">Your Team</h1>
			<div className="w-full rounded-2xl border border-border bg-bg-overlay p-4 text-left text-sm">
				<ul className="space-y-2">
					{agents.map((a) => (
						<li key={a.slotIndex} className="flex justify-between gap-4 text-text-secondary">
							<span className="text-text-primary">{a.name}</span>
							<span>{a.role}</span>
							<span>{tierLabel[a.modelTier] ?? a.modelTier}</span>
							<span>{a.voiceId.includes("-custom") ? "Voice" : "Library"}</span>
						</li>
					))}
				</ul>
			</div>
			<div>
				<p className="text-lg font-semibold text-text-primary">Basic Plan</p>
				<p className="text-text-secondary">$39/month — activate to enable your team</p>
			</div>
			{err ? <p className="text-sm text-amber-400">{err}</p> : null}
			<button
				type="button"
				onClick={() => void activate()}
				disabled={loading || status !== "ready"}
				className="rounded-xl bg-brand-purple px-8 py-3 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:bg-brand-purple-hover disabled:opacity-50"
			>
				{loading ? "Redirecting to Stripe…" : "Activate My Team — $39/mo"}
			</button>
			<p className="text-xs text-text-muted">Powered by Stripe · Cancel anytime</p>
		</div>
	);
}
