import Link from 'next/link'
import { cn } from '@/lib/utils'

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    features: ['100 voice exchanges/mo', '1 agent', 'CLI access', 'Community support'],
    cta: 'Start Free',
    href: '/sign-up',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/mo',
    features: [
      'Unlimited exchanges',
      '5 agents',
      'API access',
      'Vault memory',
      'Priority support',
    ],
    cta: 'Get Pro',
    href: '/checkout/pro',
    highlight: true,
  },
  {
    name: 'Business',
    price: '$99',
    period: '/mo',
    features: [
      'Unlimited everything',
      '25 agents',
      'SSO',
      'Audit logs',
      'SLA',
      'Custom voice',
    ],
    cta: 'Get Business',
    href: '/checkout/business',
    highlight: false,
  },
]

export function PricingCards() {
  return (
    <section id="pricing" className="border-t border-white/5 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-semibold text-white sm:text-3xl">Pricing</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-white/50">
          Start free. Upgrade when you need more agents, API access, and memory.
        </p>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
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
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
