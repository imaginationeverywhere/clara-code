import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

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
  priceNote: string
  subnote?: string
  highlight: boolean
  children: ReactNode
  cta: string
  href: string
}) {
  const inner = (
    <>
      <p
        className={cn(
          'mb-4 text-sm uppercase tracking-wide',
          highlight ? 'text-brand-purple' : 'text-white/50',
        )}
      >
        {name}
      </p>
      <p className="text-white">
        <span className="text-[44px] font-bold">{price}</span>
        <span className="ml-1 text-base text-white/45">{priceNote}</span>
      </p>
      {subnote ? <p className="mt-1 text-xs text-white/30">{subnote}</p> : null}
      <div
        className={cn('my-6 border-t', highlight ? 'border-brand-purple/15' : 'border-white/8')}
      />
      <ul className="space-y-3 text-sm text-white/70">{children}</ul>
      {href.startsWith('mailto:') ? (
        <a
          href={href}
          className={cn(
            'mt-6 block w-full rounded-xl py-3 text-center text-sm font-semibold transition',
            highlight
              ? 'bg-brand-purple text-white shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:bg-brand-purple-hover'
              : 'border border-white/15 text-white/60 hover:border-white/30 hover:text-white',
          )}
        >
          {cta}
        </a>
      ) : (
        <Link
          href={href}
          className={cn(
            'mt-6 block w-full rounded-xl py-3 text-center text-sm font-semibold transition',
            highlight
              ? 'bg-brand-purple text-white shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:bg-brand-purple-hover'
              : 'border border-white/15 text-white/60 hover:border-white/30 hover:text-white',
          )}
        >
          {cta}
        </Link>
      )}
    </>
  )

  if (highlight) {
    return (
      <div className="relative rounded-2xl border border-brand-purple/30 bg-gradient-to-b from-brand-purple/8 to-bg-overlay p-7 shadow-[0_0_60px_rgba(124,58,237,0.15)] ring-1 ring-brand-purple/40">
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-purple px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
          Most Popular
        </div>
        {inner}
      </div>
    )
  }

  return <div className="rounded-2xl border border-white/8 bg-bg-overlay p-7">{inner}</div>
}

export function PricingSection() {
  return (
    <section id="pricing" className="bg-bg-base py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-16 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/30">Pricing</p>
          <h2 className="mt-3 text-[36px] font-bold text-white md:text-[40px]">
            Build your team. Ship with voice.
          </h2>
          <p className="mt-3 text-[17px] text-white/45">
            Talk to Clara for free. $39 activates your team.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-3">
          <TierCard
            name="Basic"
            price="$39"
            priceNote="/month"
            highlight
            cta="Talk to Clara"
            href="/sign-up"
          >
            <li>✓ 3 agent slots</li>
            <li>✓ Voice + memory vault</li>
            <li>✓ CLI access</li>
            <li>✓ Community support</li>
          </TierCard>

          <TierCard name="Pro" price="$59" priceNote="/month" highlight={false} cta="Get Pro" href="/sign-up?plan=pro">
            <li>✓ 6 agent slots</li>
            <li>✓ Everything in Basic</li>
            <li>✓ API access</li>
            <li>✓ Priority support</li>
          </TierCard>

          <TierCard name="Max" price="$99" priceNote="/month" highlight={false} cta="Get Max" href="/sign-up?plan=max">
            <li>✓ 9 agent slots</li>
            <li>✓ Everything in Pro</li>
            <li>✓ Higher throughput</li>
            <li>✓ Success coverage</li>
          </TierCard>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <TierCard
            name="Small Business"
            price="$299"
            priceNote="/month"
            highlight={false}
            cta="Get Business"
            href="/sign-up?plan=business"
          >
            <li>✓ 24 agent slots</li>
            <li>✓ Team workflows</li>
            <li>✓ Admin dashboard</li>
            <li>✓ Shared vault</li>
          </TierCard>

          <TierCard
            name="Enterprise"
            price="$4,000"
            priceNote="/month"
            subnote="360 agent slots · list + controls"
            highlight={false}
            cta="Contact Sales"
            href="mailto:team@claracode.ai"
          >
            <li>✓ 360 agent slots</li>
            <li>✓ SSO + audit</li>
            <li>✓ SLA</li>
            <li>✓ Custom integrations</li>
          </TierCard>
        </div>

        <p className="mt-12 text-center text-[12px] text-white/25">
          All plans include CLI access · Prices in USD · Cancel anytime
        </p>
      </div>
    </section>
  )
}
