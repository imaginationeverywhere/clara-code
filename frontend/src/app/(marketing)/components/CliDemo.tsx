/**
 * Marketing mockup: install flow + running Clara TUI (prompt 12-cli-terminal.md).
 * Static server component — no runtime terminal.
 */
export function CliDemo() {
	const waveHeightsPx = [4, 8, 16, 24, 28, 20, 12, 28, 24, 16, 28, 20, 8, 24, 12, 4];

	return (
		<div className="relative mx-auto mt-8 max-w-5xl px-4">
			<div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 bg-brand-purple/8 blur-[80px]" />

			<div className="flex flex-wrap items-start justify-center gap-4">
				{/* Window 1 — install */}
				<div
					className="w-[420px] min-w-[300px] overflow-hidden rounded-2xl border border-white/8 bg-bg-terminal shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
					aria-hidden
				>
					<div className="flex h-10 items-center border-b border-white/6 bg-chrome-titlebar px-4">
						<div className="flex gap-1.5">
							<span className="h-2.5 w-2.5 rounded-full bg-mac-red" />
							<span className="h-2.5 w-2.5 rounded-full bg-mac-yellow" />
							<span className="h-2.5 w-2.5 rounded-full bg-mac-green" />
						</div>
						<span className="flex-1 text-center font-mono text-[12px] text-white/35">Terminal — zsh</span>
						<span className="rounded-full bg-white/6 px-2 py-0.5 font-mono text-[10px] text-white/30">zsh</span>
					</div>
					<div className="p-5 font-mono text-[13px] leading-7 text-white/85">
						<p>
							<span className="text-white/35">amenray@macbook ~ % </span>
							<span className="text-white/85">npx install claracode@latest</span>
						</p>
						<p className="h-7" />
						<p>
							<span className="text-brand-purple">⠹ </span>
							<span className="text-white/45">Downloading @clara/cli@1.0.0...</span>
						</p>
						<p className="text-white/30">  + @clara/core@1.0.0</p>
						<p className="text-white/30">  + @clara/voice@1.0.0</p>
						<p className="text-white/30">  + @clara/sdk@1.0.0</p>
						<p className="text-white/30">  + @clara/vault@1.0.0</p>
						<p className="h-7" />
						<p>
							<span className="text-brand-green">✓ </span>
							<span className="text-white/70">claracode@1.0.0 installed</span>
						</p>
						<p className="h-7" />
						<pre className="text-white/20">{`┌─────────────────────────────────┐
│  Run `}<span className="text-clara">clara</span>{` to get started      │
│  Docs: claracode.ai/docs        │
└─────────────────────────────────┘`}</pre>
						<p className="h-7" />
						<p>
							<span className="text-white/35">amenray@macbook ~ % </span>
							<span className="text-white/85">clara</span>
						</p>
						<p>
							<span className="animate-pulse text-brand-purple">█</span>
						</p>
					</div>
				</div>

				{/* Window 2 — TUI */}
				<div
					className="w-[580px] min-w-[320px] overflow-hidden rounded-2xl border border-white/8 bg-bg-terminal shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
					aria-hidden
				>
					<div className="flex h-9 items-center justify-between border-b border-white/8 bg-bg-overlay px-4">
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-4">
								<span className="text-clara">◆</span>
								<span className="font-mono text-[13px] font-semibold text-clara">Clara</span>
								<span className="font-mono text-[13px] text-white/35">Code</span>
							</div>
							<span className="text-[11px] font-mono text-white/20">v1.0.0</span>
						</div>
						<div className="flex items-center gap-4">
							<span className="font-mono text-[12px] text-white/35">amenray2k</span>
							<span className="text-white/20">·</span>
							<span className="rounded-md border border-brand-purple/20 bg-brand-purple/10 px-1.5 py-0.5 font-mono text-[11px] text-brand-purple">
								Pro
							</span>
							<span className="text-white/20">·</span>
							<span className="font-mono text-[11px] text-white/25">claude-sonnet-4-6</span>
						</div>
					</div>
					<div className="relative min-h-[320px] bg-bg-terminal p-0 pb-8 font-mono text-[13px] leading-7">
						<div className="p-5">
							<div className="mb-1 flex h-8 items-end gap-[3px]">
								{waveHeightsPx.map((h, i) => (
									<div
										key={i}
										className="w-1 rounded-sm bg-brand-purple"
										style={{ height: `${h}px` }}
									/>
								))}
								<span className="ml-1 inline text-[12px] text-brand-purple">Listening...</span>
							</div>
							<p className="h-7" />
							<p>
								<span className="text-brand-purple">▶ </span>
								<span className="text-brand-green">&apos;Create a loading skeleton for the dashboard&apos;</span>
							</p>
							<p className="h-7" />
							<p>
								<span className="text-white/40"> </span>
								<span className="animate-pulse text-brand-purple">●</span>
								<span className="text-white/40"> Analyzing project structure...</span>
							</p>
							<p className="text-white/30">  src/</p>
							<p className="text-white/30">    components/</p>
							<p>
								<span className="text-white/30">    </span>
								<span className="text-brand-green">✓ </span>
								<span className="text-white/50">dashboard/</span>
								<span className="text-white/20">  ← writing here</span>
							</p>
							<p className="h-7" />
							<div className="text-[13px] leading-7 text-white/20">
								<p>┌─ DashboardSkeleton.tsx ─────────────────────┐</p>
								<p>
									│ <span className="text-brand-purple">import</span>{" "}
									<span className="text-white/45">{"{ "}</span>
									<span className="text-brand-blue">Skeleton</span>
									<span className="text-white/45">{" } "}</span>
									<span className="text-brand-purple">from</span>{" "}
									<span className="text-brand-green">&apos;./ui/skeleton&apos;</span> │
								</p>
								<p>│ │</p>
								<p>
									│ <span className="text-brand-purple">export default</span> <span className="text-brand-purple">function</span>{" "}
									<span className="text-white/85">DashboardSkeleton</span>
									<span className="text-syntax-function">()</span>{" "}
									<span className="text-white/45">{"{"}</span> │
								</p>
								<p>
									│ <span className="text-white/45"> </span>
									<span className="text-brand-purple">return</span> <span className="text-white/45">(</span> │
								</p>
								<p>
									│ <span className="text-clara">&lt;div</span> <span className="text-syntax-attribute">className</span>
									<span className="text-white/85">=</span>
									<span className="text-brand-green">&apos;space-y-4&apos;</span>
									<span className="text-white/45">&gt;</span> │
								</p>
								<p>
									│ <span className="text-white/45"> </span>
									<span className="text-clara">&lt;Skeleton</span> <span className="text-syntax-attribute">className</span>
									<span className="text-white/85">=</span>
									<span className="text-brand-green">&apos;h-8 w-48&apos;</span> <span className="text-white/45">/&gt;</span> │
								</p>
								<p>
									│ <span className="text-white/45"> </span>
									<span className="text-clara">&lt;Skeleton</span> <span className="text-syntax-attribute">className</span>
									<span className="text-white/85">=</span>
									<span className="text-brand-green">&apos;h-32 w-full&apos;</span> <span className="text-white/45">/&gt;</span> │
								</p>
								<p>
									│ <span className="text-white/45"> </span>
									<span className="text-clara">&lt;/div&gt;</span> │
								</p>
								<p>
									│ <span className="text-white/45">)</span> │
								</p>
								<p>
									│ <span className="text-white/45">{"}"}</span> │
								</p>
								<p>└────────────────────────────────────────────┘</p>
							</div>
							<p className="h-7" />
							<p>
								<span className="text-brand-green">✓ </span>
								<span className="text-white/70">DashboardSkeleton.tsx</span>
								<span className="text-white/40"> created in </span>
								<span className="text-brand-green">./src/components/</span>
							</p>
							<p className="h-7" />
							<p>
								<span className="text-white/50">  Apply to project? </span>
								<span className="text-brand-green">[Y]es</span>
								<span className="text-white/20"> / </span>
								<span className="text-white/30">[n]o</span>
								<span className="text-white/20"> / </span>
								<span className="text-white/30">[e]dit</span>
							</p>
						</div>
						<div className="absolute bottom-0 flex h-8 w-full items-center gap-6 border-t border-white/6 bg-chrome-dock px-4">
							<span className="rounded-md bg-brand-purple/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-purple">
								VOICE
							</span>
							<span className="text-white/20">·</span>
							<span className="font-mono text-[11px] text-white/30">[Space] Voice</span>
							<span className="font-mono text-[11px] text-white/30">[/] Command</span>
							<span className="font-mono text-[11px] text-white/30">[?] Help</span>
							<span className="font-mono text-[11px] text-white/30">[q] Quit</span>
							<span className="ml-auto font-mono text-[11px] text-white/20">claracode.ai/docs</span>
						</div>
					</div>
				</div>
			</div>

			<div className="mt-6 text-center font-mono text-[13px] leading-relaxed">
				<p>
					<span className="text-white/30">$ npx install claracode@latest</span>
					<span className="text-white/20"> → </span>
					<span className="text-clara">$ clara</span>
				</p>
				<p className="mt-2 font-mono text-[14px] text-white/40">Voice-first. Terminal-native. No GUI required.</p>
			</div>
		</div>
	);
}
