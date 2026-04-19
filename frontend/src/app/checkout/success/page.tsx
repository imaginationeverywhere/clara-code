"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Header } from "@/components/marketing/Header";

const ONBOARDING_LINE = "I told you. Whether you've done it before or not.";

function DefaultSuccess() {
	return (
		<div className="min-h-screen bg-bg-base text-white">
			<Header />
			<div className="mx-auto max-w-lg px-6 pb-24 pt-28 text-center">
				<h1 className="text-3xl font-bold">You&apos;re in.</h1>
				<p className="mt-4 text-text-secondary">
					Your Clara Code subscription is active. Your API key is ready in the dashboard.
				</p>
				<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
					<Link
						href="/dashboard"
						className="rounded-lg bg-clara px-6 py-3 text-sm font-semibold text-white hover:bg-clara/90"
					>
						Go to Dashboard
					</Link>
					<Link
						href="/docs"
						className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-text-secondary hover:border-border-hover"
					>
						Read the Docs
					</Link>
				</div>
			</div>
		</div>
	);
}

function OnboardingSuccess() {
	const router = useRouter();
	const [phase, setPhase] = useState<"working" | "done">("working");

	useEffect(() => {
		let cancelled = false;
		let timer: ReturnType<typeof setTimeout> | undefined;

		async function run() {
			try {
				await fetch("/api/onboarding/activate", { method: "POST" });
			} catch {
				/* non-fatal */
			}
			try {
				const res = await fetch("/api/voice/tts", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ text: ONBOARDING_LINE, voice: "clara" }),
				});
				if (res.ok && !cancelled) {
					const blob = await res.blob();
					const url = URL.createObjectURL(blob);
					const audio = new Audio(url);
					await new Promise<void>((resolve) => {
						audio.onended = () => {
							URL.revokeObjectURL(url);
							resolve();
						};
						audio.onerror = () => {
							URL.revokeObjectURL(url);
							resolve();
						};
						void audio.play();
					});
				}
			} catch {
				/* ignore */
			}
			if (!cancelled) setPhase("done");
			timer = setTimeout(() => {
				if (!cancelled) router.replace("/dashboard");
			}, 3000);
		}

		void run();
		return () => {
			cancelled = true;
			if (timer) clearTimeout(timer);
		};
	}, [router]);

	return (
		<div className="min-h-screen bg-bg-base text-white">
			<Header />
			<div className="mx-auto max-w-lg px-6 pb-24 pt-28 text-center">
				<h1 className="text-3xl font-bold">Your team is live</h1>
				<p className="mt-4 text-text-secondary">
					{phase === "working" ? "Finishing setup…" : "Taking you to your dashboard…"}
				</p>
			</div>
		</div>
	);
}

function CheckoutSuccessInner() {
	const params = useSearchParams();
	const onboarding = params.get("onboarding") === "1";
	if (!onboarding) {
		return <DefaultSuccess />;
	}
	return <OnboardingSuccess />;
}

export default function CheckoutSuccessPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-bg-base text-white">
					<Header />
					<div className="mx-auto max-w-lg px-6 pb-24 pt-28 text-center">
						<p className="text-text-secondary">Loading…</p>
					</div>
				</div>
			}
		>
			<CheckoutSuccessInner />
		</Suspense>
	);
}
