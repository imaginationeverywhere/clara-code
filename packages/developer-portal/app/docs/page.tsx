export default function DocsPage() {
	const links = [
		{
			title: "Getting Started",
			desc: "Set up your development environment and register your first subgraph.",
			href: "https://docs.claracode.ai/talents/getting-started",
		},
		{
			title: "Voice Command Patterns",
			desc: "Learn how to write effective voice command manifests.",
			href: "https://docs.claracode.ai/talents/voice-commands",
		},
		{
			title: "GraphQL Subgraph Guide",
			desc: "Build a standards-compliant Apollo Federation subgraph.",
			href: "https://docs.claracode.ai/talents/subgraph",
		},
		{
			title: "@claracode/marketplace-sdk",
			desc: "SDK reference for token verification and manifest types.",
			href: "https://docs.claracode.ai/sdk/marketplace",
		},
		{
			title: "Submission Guidelines",
			desc: "What Clara reviews before approving your Talent.",
			href: "https://docs.claracode.ai/talents/guidelines",
		},
		{
			title: "Revenue & Billing",
			desc: "How payouts work, when you get paid, and how to set pricing.",
			href: "https://docs.claracode.ai/talents/billing",
		},
	];

	return (
		<div className="p-8 max-w-3xl">
			<h1 className="text-3xl font-bold mb-2">Documentation</h1>
			<p className="text-muted mb-8">Everything you need to build and publish Talents.</p>
			<div className="grid gap-4">
				{links.map((link) => (
					<a
						key={link.href}
						href={link.href}
						target="_blank"
						rel="noopener noreferrer"
						className="bg-bg-elevated border border-border rounded-xl p-5 hover:border-purple transition block"
					>
						<div className="font-semibold mb-1">{link.title}</div>
						<div className="text-muted text-sm">{link.desc}</div>
					</a>
				))}
			</div>
		</div>
	);
}
