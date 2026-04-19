"use client";

import { useAuth } from "@/hooks/useAuth";
import { submitTalent } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewTalent() {
	const { loading } = useAuth();
	const router = useRouter();
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [form, setForm] = useState({
		name: "",
		displayName: "",
		description: "",
		category: "productivity",
		pricingType: "free" as "free" | "paid",
		priceMonthly: "",
		subgraphUrl: "",
		voiceCommandPattern: "",
		voiceCommandDescription: "",
		voiceCommandExamples: "",
	});

	if (loading) {
		return <div className="p-8 text-muted">Loading...</div>;
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		setError(null);
		try {
			const voiceCommands = form.voiceCommandPattern
				? [
						{
							pattern: form.voiceCommandPattern,
							description: form.voiceCommandDescription,
							examples: form.voiceCommandExamples
								.split(",")
								.map((s) => s.trim())
								.filter(Boolean),
						},
					]
				: [];

			await submitTalent({
				name: form.name,
				displayName: form.displayName,
				description: form.description,
				category: form.category,
				pricingType: form.pricingType,
				priceCents:
					form.pricingType === "paid" ? Math.round(parseFloat(form.priceMonthly) * 100) : undefined,
				subgraphUrl: form.subgraphUrl,
				voiceCommands,
			});
			router.push("/?submitted=true");
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Submission failed.";
			setError(message);
		} finally {
			setSubmitting(false);
		}
	};

	const input =
		"w-full bg-bg border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple";
	const label = "block text-sm font-medium text-muted mb-1";

	return (
		<div className="p-8 max-w-2xl">
			<h1 className="text-3xl font-bold mb-2">Submit a Talent</h1>
			<p className="text-muted mb-8">Your Talent will be reviewed before appearing in the marketplace.</p>

			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<label className={label} htmlFor="talent-name">
						Talent Name (slug)
					</label>
					<input
						id="talent-name"
						className={input}
						placeholder="github-prs"
						value={form.name}
						onChange={(e) =>
							setForm((f) => ({
								...f,
								name: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
							}))
						}
						required
					/>
					<p className="text-xs text-muted mt-1">Lowercase, hyphens only. e.g. &quot;github-prs&quot;</p>
				</div>

				<div>
					<label className={label} htmlFor="display-name">
						Display Name
					</label>
					<input
						id="display-name"
						className={input}
						placeholder="GitHub Pull Requests"
						value={form.displayName}
						onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
						required
					/>
				</div>

				<div>
					<label className={label} htmlFor="description">
						Description
					</label>
					<textarea
						id="description"
						className={`${input} h-24 resize-none`}
						placeholder="What does this Talent do? (160 chars max)"
						value={form.description}
						maxLength={160}
						onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
					/>
				</div>

				<div>
					<label className={label} htmlFor="category">
						Category
					</label>
					<select
						id="category"
						className={input}
						value={form.category}
						onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
					>
						<option value="productivity">Productivity</option>
						<option value="developer-tools">Developer Tools</option>
						<option value="data">Data</option>
						<option value="communication">Communication</option>
						<option value="other">Other</option>
					</select>
				</div>

				<div>
					<span className={label}>Pricing</span>
					<div className="flex gap-4">
						{["free", "paid"].map((type) => (
							<label key={type} className="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									name="pricing"
									value={type}
									checked={form.pricingType === type}
									onChange={() => setForm((f) => ({ ...f, pricingType: type as "free" | "paid" }))}
								/>
								<span className="capitalize">{type}</span>
							</label>
						))}
					</div>
					{form.pricingType === "paid" && (
						<input
							className={`${input} mt-2 w-32`}
							type="number"
							min="1"
							step="0.01"
							placeholder="$/month"
							value={form.priceMonthly}
							onChange={(e) => setForm((f) => ({ ...f, priceMonthly: e.target.value }))}
							required
						/>
					)}
				</div>

				<div>
					<label className={label} htmlFor="subgraph-url">
						GraphQL Subgraph URL
					</label>
					<input
						id="subgraph-url"
						className={input}
						type="url"
						placeholder="https://your-server.com/graphql"
						value={form.subgraphUrl}
						onChange={(e) => setForm((f) => ({ ...f, subgraphUrl: e.target.value }))}
						required
					/>
					<p className="text-xs text-muted mt-1">Your server endpoint. This URL is never shown publicly.</p>
				</div>

				<div className="border border-border rounded-xl p-5">
					<h3 className="text-sm font-semibold mb-4">Primary Voice Command</h3>
					<div className="space-y-3">
						<div>
							<label className={label} htmlFor="v-pattern">
								Pattern
							</label>
							<input
								id="v-pattern"
								className={input}
								placeholder="show my {resource}"
								value={form.voiceCommandPattern}
								onChange={(e) => setForm((f) => ({ ...f, voiceCommandPattern: e.target.value }))}
							/>
						</div>
						<div>
							<label className={label} htmlFor="v-desc">
								Description
							</label>
							<input
								id="v-desc"
								className={input}
								placeholder="Display a list of resources"
								value={form.voiceCommandDescription}
								onChange={(e) => setForm((f) => ({ ...f, voiceCommandDescription: e.target.value }))}
							/>
						</div>
						<div>
							<label className={label} htmlFor="v-ex">
								Example phrases (comma-separated)
							</label>
							<input
								id="v-ex"
								className={input}
								placeholder="show my PRs, show my open issues"
								value={form.voiceCommandExamples}
								onChange={(e) => setForm((f) => ({ ...f, voiceCommandExamples: e.target.value }))}
							/>
						</div>
					</div>
					<p className="text-xs text-muted mt-3">You can add more voice commands after approval.</p>
				</div>

				{error && <p className="text-red-400 text-sm">{error}</p>}

				<button
					type="submit"
					disabled={submitting}
					className="w-full bg-purple hover:bg-purple-light disabled:opacity-50 py-3 rounded-lg font-medium transition"
				>
					{submitting ? "Submitting for review..." : "Submit Talent for Review"}
				</button>
			</form>
		</div>
	);
}
