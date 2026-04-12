import Link from 'next/link'

const GITHUB = 'https://github.com/imaginationeverywhere/clara-code'

export function PricingSection() {
	return (
		<section id="pricing" className="bg-[#0D1117] py-28">
			<div className="mx-auto max-w-4xl px-6">
				<div className="mb-16 text-center">
					<p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/30">Pricing</p>
					<h2 className="mt-3 text-[36px] font-bold text-white md:text-[40px]">Start free. Scale when ready.</h2>
					<p className="mt-3 text-[17px] text-white/45">No credit card required. Open source forever.</p>
				</div>

				<div className="grid grid-cols-1 items-start gap-5 md:grid-cols-3">
					<div className="rounded-2xl border border-white/8 bg-[#0A0E14] p-7">
						<p className="mb-4 text-sm uppercase tracking-wide text-white/50">Free</p>
						<p className="text-white">
							<span className="text-[44px] font-bold">$0</span>
							<span className="ml-1 text-sm text-white/35">forever</span>
						</p>
						<div className="my-6 border-t border-white/8" />
						<ul className="space-y-3 text-sm text-white/70">
							<li>✓ Full CLI access</li>
							<li>✓ Voice input local</li>
							<li>✓ MIT Licensed</li>
							<li>✓ Self-hostable</li>
							<li className="text-white/25 line-through">Cloud sync</li>
							<li className="text-white/25 line-through">Agent personas</li>
							<li className="text-white/25 line-through">Team vault</li>
						</ul>
						<Link
							href="/sign-up"
							className="mt-6 block w-full rounded-xl border border-white/15 py-3 text-center text-sm text-white/60 transition hover:border-white/30 hover:text-white"
						>
							Download CLI
						</Link>
					</div>

					<div className="relative rounded-2xl border border-[#7C3AED]/30 bg-gradient-to-b from-[#7C3AED]/8 to-[#0A0E14] p-7 shadow-[0_0_60px_rgba(124,58,237,0.15)] ring-1 ring-[#7C3AED]/40">
						<div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#7C3AED] px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
							Most Popular
						</div>
						<p className="mb-4 text-sm uppercase tracking-wide text-[#7C3AED]">Pro</p>
						<p className="text-white">
							<span className="text-[44px] font-bold">$20</span>
							<span className="ml-1 text-base text-white/45">/month</span>
						</p>
						<div className="my-6 border-t border-[#7C3AED]/15" />
						<ul className="space-y-3 text-sm text-white/70">
							<li>✓ Everything in Free</li>
							<li>✓ Voice + cloud sync</li>
							<li>✓ Clara vault (encrypted)</li>
							<li>✓ 1 custom agent persona</li>
							<li>✓ Voice clone (1 included)</li>
							<li>✓ Priority support</li>
							<li className="text-white/25 line-through">Team vault</li>
						</ul>
						<Link
							href="/checkout/pro"
							className="mt-6 block w-full rounded-xl bg-[#7C3AED] py-3 text-center text-sm font-semibold text-white shadow-[0_4px_20px_rgba(124,58,237,0.4)] transition hover:bg-[#6D28D9]"
						>
							Start Free Trial
						</Link>
					</div>

					<div className="rounded-2xl border border-white/8 bg-[#0A0E14] p-7">
						<p className="mb-4 text-sm uppercase tracking-wide text-white/50">Team</p>
						<p className="text-white">
							<span className="text-[44px] font-bold">$99</span>
							<span className="ml-1 text-sm text-white/35">/month</span>
						</p>
						<p className="mt-1 text-xs text-white/30">per team · up to 8 members</p>
						<div className="my-6 border-t border-white/8" />
						<ul className="space-y-3 text-sm text-white/70">
							<li>✓ Everything in Pro</li>
							<li>✓ Shared team vault</li>
							<li>✓ Up to 6 agent personas</li>
							<li>✓ Admin dashboard</li>
							<li>✓ SSO (Clerk teams)</li>
							<li>✓ SLA + dedicated support</li>
						</ul>
						<a
							href="mailto:team@claracode.ai"
							className="mt-6 block w-full rounded-xl border border-white/15 py-3 text-center text-sm text-white/60 transition hover:border-white/30 hover:text-white"
						>
							Contact Sales
						</a>
					</div>
				</div>

				<p className="mt-12 text-center text-[12px] text-white/25">
					All plans include CLI access · Prices in USD · Cancel anytime ·{' '}
					<a href={GITHUB} className="text-[#7BCDD8]/80 hover:underline">
						Source on GitHub
					</a>
				</p>
			</div>
		</section>
	)
}
