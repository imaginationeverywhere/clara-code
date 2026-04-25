import Link from 'next/link'
import { cn } from '@/lib/utils'

const tiers = [
	{
		name: 'Basic',
		price: '$39',
		period: '/mo',
		features: ['3 agent slots', 'Talk to Clara — conversation on us', 'Voice + project memory', 'CLI access'],
		cta: 'Talk to Clara',
		href: '/sign-up',
		highlight: true,
	},
	{
		name: 'Pro',
		price: '$59',
		period: '/mo',
		features: ['6 agent slots', 'Everything in Basic', 'API access', 'Priority support'],
		cta: 'Get Pro',
		href: '/sign-up?plan=pro',
		highlight: false,
	},
	{
		name: 'Max',
		price: '$99',
		period: '/mo',
		features: ['9 agent slots', 'Everything in Pro', 'Higher throughput', 'Dedicated success'],
		cta: 'Get Max',
		href: '/sign-up?plan=max',
		highlight: false,
	},
	{
		name: 'Small Business',
		price: '$299',
		period: '/mo',
		features: ['24 agent slots', 'Team workflows', 'Admin controls', 'Shared vault'],
		cta: 'Get Business',
		href: '/sign-up?plan=business',
		highlight: false,
	},
	{
		name: 'Enterprise',
		priceLine: 'Contact us',
		period: '',
		sub: 'We scale with you',
		features: ['360 agent slots', 'SSO + audit', 'SLA', 'Custom integrations'],
		cta: 'Contact Sales',
		href: 'mailto:team@claracode.ai',
		highlight: false,
	},
] as const

function Check() {
	return (
		<svg
			className="mt-0.5 h-4 w-4 shrink-0 text-[#22C55E]"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			strokeWidth={2.5}
			aria-hidden
		>
			<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
		</svg>
	)
}

export function PricingCards() {
	return (
		<section id="pricing" className="border-t border-white/5 py-20">
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<div className="text-center">
					<p className="font-mono text-xs uppercase tracking-wider text-white/30">PRICING</p>
					<h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
						<span className="block">Simple pricing.</span>
						<span className="mt-1 block bg-gradient-to-r from-[#7C3AED] to-[#4F8EF7] bg-clip-text text-transparent sm:text-4xl">
							Scale as you grow.
						</span>
					</h2>
					<p className="mx-auto mt-3 max-w-xl text-center text-sm text-white/50">Cancel anytime. No hidden fees.</p>
				</div>
				<div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
					{tiers.map((tier) => {
						const isEnt = 'priceLine' in tier
						return (
							<div
								key={tier.name}
								className={cn(
									'relative flex flex-col gap-4 rounded-2xl border p-6',
									tier.highlight
										? 'border-[#7C3AED]/40 bg-[#111827] ring-1 ring-[#7C3AED]/40'
										: 'border-white/10 bg-[#111827]',
								)}
							>
								{tier.highlight && (
									<span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#7C3AED] px-3 py-1 text-xs font-medium text-white">
										Most Popular
									</span>
								)}
								{tier.highlight && (
									<div
										className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-[#7C3AED]/[0.07] to-transparent"
										aria-hidden
									/>
								)}
								<div className="relative z-10 flex h-full min-h-0 flex-col gap-4">
									<div>
										<h3
											className={cn('text-sm uppercase tracking-wide', tier.highlight ? 'text-[#7C3AED]' : 'text-white/50')}
										>
											{tier.name}
										</h3>
										{isEnt ? (
											<div>
												<p className="text-4xl font-bold text-white">{tier.priceLine}</p>
												<p className="mt-1 text-sm text-white/40">{(tier as { sub: string }).sub}</p>
											</div>
										) : (
											<div className="mt-1 flex items-end gap-1 text-white">
												<span className="text-4xl font-bold">{(tier as { price: string }).price}</span>
												<span className="mb-1 text-sm text-white/40">{(tier as { period: string }).period}</span>
											</div>
										)}
									</div>
									<ul className="flex flex-1 flex-col gap-3 text-sm text-white/70">
										{tier.features.map((f) => (
											<li key={f} className="flex items-start gap-2">
												<Check />
												<span>{f}</span>
											</li>
										))}
									</ul>
									{tier.href.startsWith('mailto:') ? (
										<a
											href={tier.href}
											className={cn(
												'mt-auto w-full rounded-lg py-2.5 text-center text-sm font-medium transition-colors',
												tier.highlight
													? 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
													: 'border border-white/20 bg-transparent text-white/80 hover:border-white/40 hover:text-white',
											)}
										>
											{tier.cta}
										</a>
									) : (
										<Link
											href={tier.href}
											className={cn(
												'mt-auto w-full rounded-lg py-2.5 text-center text-sm font-medium transition-colors',
												tier.highlight
													? 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
													: 'border border-white/20 bg-transparent text-white/80 hover:border-white/40 hover:text-white',
											)}
										>
											{tier.cta}
										</Link>
									)}
								</div>
							</div>
						)
					})}
				</div>
				<p className="mt-8 text-center text-xs text-white/30">
					All plans include CLI access &middot; Prices in USD &middot; Cancel anytime
				</p>
			</div>
		</section>
	)
}
