import InstallButton from "@/components/InstallButton";
import { getTalent } from "@/lib/api";
import { notFound } from "next/navigation";

interface Props {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
	const { id } = await params;
	const talent = await getTalent(id);
	if (!talent) {
		return { title: "Not Found" };
	}
	return { title: `${talent.displayName} — Clara Talent Agency` };
}

export default async function TalentDetail({ params }: Props) {
	const { id } = await params;
	const talent = await getTalent(id);
	if (!talent) {
		notFound();
	}

	return (
		<main className="min-h-screen bg-bg text-white">
			<div className="max-w-4xl mx-auto px-6 py-16">
				<div className="flex items-start justify-between mb-8">
					<div>
						<h1 className="text-4xl font-bold mb-2">{talent.displayName}</h1>
						<p className="text-muted capitalize">{talent.category ?? "Other"}</p>
					</div>
					<div className="text-right">
						<div className="text-2xl font-bold mb-1">
							{talent.pricingType === "free" ? "Free" : `$${talent.priceMonthly}/mo`}
						</div>
						<InstallButton talentId={talent.id} pricingType={talent.pricingType} />
					</div>
				</div>

				<p className="text-lg text-gray-300 mb-10">{talent.description}</p>

				{talent.voiceCommands && talent.voiceCommands.length > 0 && (
					<section>
						<h2 className="text-xl font-semibold mb-4">Voice Commands</h2>
						<div className="space-y-4">
							{talent.voiceCommands.map((cmd, i) => (
								<div key={i} className="bg-bg-elevated border border-border rounded-lg p-4">
									<code className="text-teal font-mono text-sm">&quot;{cmd.pattern}&quot;</code>
									<p className="text-muted text-sm mt-1">{cmd.description}</p>
									{cmd.examples.length > 0 && (
										<div className="mt-2 flex flex-wrap gap-2">
											{cmd.examples.map((ex, j) => (
												<span
													key={j}
													className="text-xs bg-bg border border-border px-2 py-1 rounded font-mono"
												>
													{ex}
												</span>
											))}
										</div>
									)}
								</div>
							))}
						</div>
					</section>
				)}

				<div className="mt-8 text-sm text-muted">
					{talent.installCount.toLocaleString()} installs
				</div>
			</div>
		</main>
	);
}
