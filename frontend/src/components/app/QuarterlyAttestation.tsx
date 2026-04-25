"use client";

import { useQuarterlyAttestation } from "@/hooks/useQuarterlyAttestation";

/**
 * Shown once per quarter for users who have any agent ejections on file.
 * Confirms they are not double-hosting on competing platforms while on Clara.
 */
export function QuarterlyAttestation() {
	const { needsAttestation, confirm, loading } = useQuarterlyAttestation();
	if (loading || !needsAttestation) {
		return null;
	}

	return (
		<div
			className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
			role="dialog"
			aria-modal="true"
			aria-labelledby="quarterly-attest-title"
		>
			<div className="max-w-md rounded-lg border border-border bg-background p-6 text-foreground shadow-xl">
				<h2 id="quarterly-attest-title" className="text-lg font-semibold">
					Quarterly attestation
				</h2>
				<p className="mt-3 text-sm text-muted-foreground">
					I confirm that no agents I have exported are currently running on a competing AI platform (for example
					Anthropic or OpenAI) while I maintain active Clara hosting of the same agent.
				</p>
				<button
					type="button"
					className="mt-6 w-full rounded-md bg-brand-purple px-4 py-2 text-sm font-medium text-white hover:opacity-90"
					onClick={confirm}
				>
					I confirm
				</button>
			</div>
		</div>
	);
}
