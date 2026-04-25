import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

function CheckIcon() {
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

function TierCard({
	name,
	price,
	priceNote,
	subnote,
	highlight,
	children,
	cta,
	href,
}: {
	name: string
  price: string
  priceNote?: string
  subnote?: string
	highlight: boolean
	children: ReactNode
	cta: string
	href: string
}) {
	const inner = (
		<div className="relative z-10 flex h-full flex-col gap-4">
			<div>
				<p
					className={cn(
						'mb-1 text-sm uppercase tracking-wide',
						highlight ? 'text-brand-purple' : 'text-white/50',
					)}
				>
					{name}
				</p>
				{price === 'Contact us' ? (
					<div className="text-white">
						<span className="text-4xl font-bold">Contact us</span>
						<p className="mt-1 text-sm text-white/40">We scale with you</p>
					</div>
				) : (
					<div className="flex items-end gap-1 text-white">
						<span className="text-4xl font-bold">{price}</span>
						<span className="mb-1 text-sm text-white/40">/mo</span>
						<span className="sr-only">per month</span>
					</div>
				)}
				{subnote && price !== 'Contact us' ? <p className="mt-1 text-xs text-white/30">{subnote}</p> : null}
			</div>
			<ul className="flex flex-1 flex-col gap-3 text-sm text-white/70">{children}</ul>
			{href.startsWith('mailto:') ? (
				<a
					href={href}
					className={cn(
						'mt-auto w-full rounded-lg py-2.5 text-center text-sm font-medium transition-colors',
						highlight
							? 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
							: 'border border-white/20 bg-transparent text-white/80 hover:border-white/40 hover:text-white',
					)}
				>
					{cta}
				</a>
			) : (
				<Link
					href={href}
					className={cn(
						'mt-auto w-full rounded-lg py-2.5 text-center text-sm font-medium transition-colors',
						highlight
							? 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
							: 'border border-white/20 bg-transparent text-white/80 hover:border-white/40 hover:text-white',
					)}
				>
					{cta}
				</Link>
			)}
		</div>
	)

	if (highlight) {
		return (
			<div className="relative flex flex-col rounded-2xl border border-[#7C3AED]/40 bg-[#111827] p-6 ring-1 ring-[#7C3AED]/40">
				<div
					className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-[#7C3AED]/[0.07] to-transparent"
					aria-hidden
				/>
				<span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#7C3AED] px-3 py-1 text-xs font-medium text-white">
					Most Popular
				</span>
				{inner}
			</div>
		)
	}

	return (
		<div className="relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#111827] p-6">{inner}</div>
	)
}

function Feat({ children }: { children: string }) {
	return (
		<li className="flex items-start gap-2">
			<CheckIcon />
			<span>{children.replace(/^\s*✓\s*/, '')}</span>
		</li>
	)
}

export function PricingSection() {
	return (
		<section id="pricing" className="bg-bg-base py-28">
			<div className="mx-auto max-w-5xl px-6">
				<div className="mb-16 text-center">
					<p className="font-mono text-xs uppercase tracking-wider text-white/30">PRICING</p>
					<h2 className="mt-3 text-[36px] font-bold md:text-[40px]">
						<span className="block text-white">Simple pricing.</span>
						<span className="mt-1 block bg-gradient-to-r from-[#7C3AED] to-[#4F8EF7] bg-clip-text text-transparent">
							Scale as you grow.
						</span>
					</h2>
					<p className="mt-3 text-[17px] text-white/45">Cancel anytime. No hidden fees.</p>
				</div>

				<div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-3">
					<TierCard
						name="Basic"
						price="$39"
						priceNote="/month"
						highlight
						cta="Configure your team"
						href="/sign-up"
					>
						<Feat>3 AI hires on your team</Feat>
						<Feat>1 new voice agent / month</Feat>
						<Feat>Premium voice + memory</Feat>
						<Feat>CLI access</Feat>
					</TierCard>

					<TierCard
						name="Pro"
						price="$69"
						priceNote="/month"
						highlight={false}
						cta="Configure your team"
						href="/sign-up?plan=pro"
					>
						<Feat>6 AI hires on your team</Feat>
						<Feat>3 new voice agents / month</Feat>
						<Feat>Everything in Basic</Feat>
						<Feat>Priority support</Feat>
					</TierCard>

					<TierCard
						name="Max"
						price="$99"
						priceNote="/month"
						highlight={false}
						cta="Configure your team"
						href="/sign-up?plan=max"
					>
						<Feat>9 AI hires on your team</Feat>
						<Feat>6 new voice agents / month</Feat>
						<Feat>Everything in Pro</Feat>
						<Feat>Higher throughput</Feat>
					</TierCard>
				</div>

				<div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
					<TierCard
						name="Business"
						price="$299"
						priceNote="/month"
						highlight={false}
						cta="Configure your team"
						href="/sign-up?plan=business"
					>
						<Feat>24 AI hires on your team</Feat>
						<Feat>12 new voice agents / month</Feat>
						<Feat>Marketplace publishing + payouts</Feat>
						<Feat>Admin controls + shared vault</Feat>
					</TierCard>

					<TierCard
						name="Enterprise"
						price="Contact us"
						highlight={false}
						cta="Talk to us"
						href="mailto:team@claracode.ai"
					>
						<Feat>350 AI hires (per contract)</Feat>
						<Feat>New voice agents: Custom (per contract)</Feat>
						<Feat>SSO + audit + SLA</Feat>
						<Feat>Dedicated support + integrations</Feat>
					</TierCard>
				</div>

				<p className="mt-8 text-center text-xs text-white/30">
					All plans include CLI access · Prices in USD · Cancel anytime
				</p>
			</div>
		</section>
	)
}
