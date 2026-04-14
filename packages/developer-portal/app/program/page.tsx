"use client";

import { useAuth } from "@/hooks/useAuth";
import type { DeveloperProgramStatus } from "@/lib/api";
import { enrollInDeveloperProgram, getDeveloperProgramStatus } from "@/lib/api";
import { useEffect, useState } from "react";

export default function ProgramPage() {
	const { loading } = useAuth();
	const [status, setStatus] = useState<DeveloperProgramStatus | null>(null);
	const [enrolling, setEnrolling] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!loading) {
			getDeveloperProgramStatus().then(setStatus).catch(console.error);
		}
	}, [loading]);

	if (loading || !status) {
		return <div className="p-8 text-muted">Loading...</div>;
	}

	const handleEnroll = async () => {
		setEnrolling(true);
		setError(null);
		try {
			const { checkoutUrl } = await enrollInDeveloperProgram();
			window.location.href = checkoutUrl;
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Enrollment failed.";
			setError(message);
			setEnrolling(false);
		}
	};

	return (
		<div className="p-8 max-w-2xl">
			<h1 className="text-3xl font-bold mb-2">Developer Program</h1>
			<p className="text-muted mb-8">Submit Talents to the Clara Talent Agency and earn revenue.</p>

			<div className="bg-bg-elevated border border-border rounded-xl p-8 mb-8">
				<div className="flex items-center justify-between mb-6">
					<div>
						<div className="text-4xl font-bold">
							$99 <span className="text-xl font-normal text-muted">/year</span>
						</div>
						<p className="text-muted text-sm mt-1">Billed annually</p>
					</div>
					<div
						className={`px-3 py-1 rounded-full text-sm font-medium ${
							status.enrolled ? "bg-green/10 text-green" : "bg-muted/10 text-muted"
						}`}
					>
						{status.enrolled ? "Active" : "Not enrolled"}
					</div>
				</div>

				<ul className="space-y-3 text-sm mb-8">
					{[
						"Submit Talents for marketplace listing",
						"Access to @claracode/marketplace-sdk",
						"Install analytics and revenue dashboard",
						"Developer support",
						"Clara Developer badge",
					].map((feature) => (
						<li key={feature} className="flex items-center gap-2">
							<span className="text-green">✓</span>
							<span>{feature}</span>
						</li>
					))}
				</ul>

				{status.enrolled ? (
					<div>
						<p className="text-sm text-muted">
							Renews: {status.expiresAt ? new Date(status.expiresAt).toLocaleDateString() : "—"}
						</p>
					</div>
				) : (
					<button
						type="button"
						onClick={handleEnroll}
						disabled={enrolling}
						className="w-full bg-purple hover:bg-purple-light disabled:opacity-50 py-3 rounded-lg font-medium transition"
					>
						{enrolling ? "Redirecting to payment..." : "Enroll — $99/year"}
					</button>
				)}
				{error && <p className="text-red-400 text-sm mt-3">{error}</p>}
			</div>

			<p className="text-xs text-muted">
				Clara takes 15% on paid Talent revenue. You keep 85%. Free Talents are always free for everyone.
			</p>
		</div>
	);
}
