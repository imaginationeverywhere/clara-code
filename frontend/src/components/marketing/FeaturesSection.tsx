import { IconCode2, IconKeyboard, IconMic, IconSparkles } from '@/components/marketing/icons'

export function FeaturesSection() {
	return (
		<section id="features" className="bg-bg-sunken py-28">
			<div className="mx-auto max-w-5xl px-6">
				<div className="mb-20 text-center">
					<p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/30">Why Clara Code</p>
					<h2 className="mt-3 text-[32px] font-bold leading-tight text-white md:text-[40px]">
						Built for how developers actually think.
					</h2>
					<h2 className="mt-1 bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-[32px] font-bold text-transparent md:text-[40px]">
						Not how they type.
					</h2>
				</div>

				<div className="grid grid-cols-12 gap-4">
					<div className="relative col-span-12 overflow-hidden rounded-2xl border border-white/8 bg-bg-base p-8 md:col-span-7 md:row-span-2">
						<div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-brand-purple/10 blur-3xl" aria-hidden />
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-purple/15">
							<IconMic className="h-5 w-5 text-brand-purple" />
						</div>
						<h3 className="mt-4 text-xl font-semibold text-white">Speak. Don&apos;t type.</h3>
						<p className="mt-2 text-sm leading-relaxed text-white/55">
							Hold the mic button, say what you want built, and Clara turns it into edits across your repo.
						</p>
						<div className="mt-6 rounded-xl border border-white/5 bg-bg-sunken p-4">
							<div className="flex h-10 items-end gap-1">
								{[12, 18, 24, 28, 20, 14, 22, 16, 26, 18, 12, 20, 24, 16, 10, 22].map((h, i) => (
									<div key={i} className="w-1 rounded-full bg-brand-purple" style={{ height: `${h}px` }} />
								))}
							</div>
							<p className="mt-3 font-mono text-xs text-brand-green">
								▶ &apos;Refactor auth to use middleware&apos;
							</p>
						</div>
					</div>

					<div className="col-span-12 rounded-2xl border border-white/8 bg-bg-base p-6 md:col-span-5">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green/10">
							<IconSparkles className="h-5 w-5 text-brand-green" />
						</div>
						<h3 className="mt-3 text-lg font-semibold text-white">Knows your codebase.</h3>
						<div className="mt-4 space-y-1 font-mono text-xs text-white/40">
							<p>📁 src/</p>
							<p>
								&nbsp;&nbsp;📄 <span className="text-brand-green">components/UserCard.tsx</span>
							</p>
							<p>
								&nbsp;&nbsp;📄 lib/auth.ts
							</p>
							<p>
								&nbsp;&nbsp;📄 app/page.tsx
							</p>
						</div>
					</div>

					<div className="col-span-12 rounded-2xl border border-white/8 bg-bg-base p-6 md:col-span-5">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue/10">
							<IconCode2 className="h-5 w-5 text-brand-blue" />
						</div>
						<h3 className="mt-3 text-lg font-semibold text-white">MIT licensed.</h3>
						<div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50">
							<span aria-hidden>⭐</span> 2.4k stars on GitHub
						</div>
					</div>

					<div className="col-span-12 flex flex-col items-stretch justify-between gap-8 rounded-2xl border border-white/8 bg-gradient-to-r from-bg-base to-bg-overlay p-8 md:flex-row md:items-center">
						<div className="max-w-md">
							<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-purple/10">
								<IconKeyboard className="h-5 w-5 text-brand-purple" />
							</div>
							<h3 className="mt-3 text-lg font-semibold text-white">Voice is the default. Text is the escape hatch.</h3>
							<p className="mt-2 text-sm text-white/55">
								Switch modes when you need precision typing — Clara keeps context either way.
							</p>
						</div>
						<div className="flex shrink-0 gap-1 rounded-xl border border-white/8 bg-bg-sunken p-1">
							<button
								type="button"
								className="flex items-center gap-2 rounded-lg bg-brand-purple px-4 py-2 text-sm font-medium text-white"
							>
								<IconMic className="h-4 w-4" />
								Voice
							</button>
							<button
								type="button"
								className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white/40"
							>
								<IconKeyboard className="h-4 w-4" />
								Text
							</button>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
