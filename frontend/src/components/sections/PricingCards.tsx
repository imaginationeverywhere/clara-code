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
    price: '$4,000',
    period: '/mo',
    features: ['360 agent slots', 'SSO + audit', 'SLA', 'Custom integrations'],
    cta: 'Contact Sales',
    href: 'mailto:team@claracode.ai',
    highlight: false,
  },
]

export function PricingCards() {
  return (
    <section id="pricing" className="border-t border-white/5 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-semibold text-white sm:text-3xl">Pricing</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-white/50">
          Talk to Clara. Build your team. Activate for $39.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                'relative flex flex-col rounded-2xl border p-6',
                tier.highlight
                  ? 'border-clara-blue bg-clara-surface shadow-[0_0_0_1px_rgba(59,130,246,0.35)]'
                  : 'border-white/5 bg-bg-raised',
              )}
            >
              {tier.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-clara-blue px-3 py-0.5 text-xs font-medium text-white">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{tier.price}</span>
                <span className="text-white/50">{tier.period}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-white/60">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-clara-blue">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              {tier.href.startsWith('mailto:') ? (
                <a
                  href={tier.href}
                  className={cn(
                    'mt-8 block rounded-lg py-2.5 text-center text-sm font-semibold transition',
                    tier.highlight
                      ? 'bg-clara-blue text-white hover:bg-blue-600'
                      : 'border border-white/10 text-white hover:bg-white/5',
                  )}
                >
                  {tier.cta}
                </a>
              ) : (
                <Link
                  href={tier.href}
                  className={cn(
                    'mt-8 block rounded-lg py-2.5 text-center text-sm font-semibold transition',
                    tier.highlight
                      ? 'bg-clara-blue text-white hover:bg-blue-600'
                      : 'border border-white/10 text-white hover:bg-white/5',
                  )}
                >
                  {tier.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
