"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/marketing/Header";

export default function CheckoutBusinessPage() {
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		async function startCheckout() {
			try {
				const res = await fetch("/api/checkout/create-session", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ tier: "business" }),
				});
				const data = (await res.json()) as { url?: string; error?: string };
				if (!res.ok || !data.url) {
					setError(data.error ?? "Failed to start checkout. Please try again.");
					return;
				}
				window.location.href = data.url;
			} catch {
				setError("Network error. Please try again.");
			}
		}
		void startCheckout();
	}, []);

	if (error) {
		return (
			<div className="min-h-screen bg-bg-base text-white">
				<Header />
				<div className="mx-auto max-w-lg px-6 pb-24 pt-28 text-center">
					<p className="text-text-secondary">{error}</p>
					<button
						type="button"
						onClick={() => router.push("/pricing")}
						className="mt-6 text-sm text-clara hover:underline"
					>
						← Back to Pricing
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-bg-base text-white">
			<Header />
			<div className="mx-auto max-w-lg px-6 pb-24 pt-28 text-center">
				<p className="text-text-muted text-sm">Redirecting to secure checkout…</p>
			</div>
		</div>
	);
}
