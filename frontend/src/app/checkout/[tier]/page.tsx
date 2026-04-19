'use client'

import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Header } from '@/components/marketing/Header'

const TIER_CONFIG = {
  basic: { label: 'Basic', price: '$39', slots: 3, period: '/mo' },
  pro: { label: 'Pro', price: '$59', slots: 6, period: '/mo' },
  max: { label: 'Max', price: '$99', slots: 9, period: '/mo' },
  business: { label: 'Small Business', price: '$299', slots: 24, period: '/mo' },
} as const

type Tier = keyof typeof TIER_CONFIG

function isTier(value: string): value is Tier {
  return Object.hasOwn(TIER_CONFIG, value)
}

export default function CheckoutTierPage() {
  const params = useParams()
  const router = useRouter()
  const raw = params.tier
  const tierParam = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : ''

  const { isLoaded, isSignedIn } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!tierParam || !isTier(tierParam)) {
      router.replace('/pricing')
    }
  }, [tierParam, router])

  useEffect(() => {
    if (!isLoaded || !tierParam || !isTier(tierParam)) return
    if (!isSignedIn) {
      router.replace(`/sign-up?redirect=${encodeURIComponent(`/checkout/${tierParam}`)}`)
    }
  }, [isLoaded, isSignedIn, tierParam, router])

  const startCheckout = useCallback(async () => {
    if (!tierParam || !isTier(tierParam)) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tierParam }),
      })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Failed to start checkout. Please try again.')
        return
      }
      window.location.href = data.url
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [tierParam])

  if (!tierParam || !isTier(tierParam)) {
    return null
  }

  const cfg = TIER_CONFIG[tierParam]

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-bg-base text-white">
        <Header />
        <div className="mx-auto max-w-lg px-6 pb-24 pt-28 text-center">
          <p className="text-text-muted text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-bg-base text-white">
      <Header />
      <div className="mx-auto max-w-lg px-6 pb-24 pt-28">
        <div className="rounded-2xl border border-white/8 bg-bg-raised p-8 text-center">
          <h1 className="text-2xl font-semibold text-white">Activate {cfg.label}</h1>
          <p className="mt-3 text-text-secondary">
            {cfg.slots} teammates. {cfg.price}
            {cfg.period}. Cancel anytime.
          </p>
          {error ? <p className="mt-4 text-sm text-amber-400">{error}</p> : null}
          <button
            type="button"
            onClick={() => void startCheckout()}
            disabled={loading}
            className="mt-8 w-full rounded-xl bg-brand-purple py-3 px-6 font-semibold text-white hover:bg-brand-purple-hover disabled:opacity-50"
          >
            {loading ? 'Redirecting…' : `Activate — ${cfg.price}${cfg.period}`}
          </button>
          <Link href="/pricing" className="mt-6 inline-block text-sm text-clara hover:underline">
            ← Back to pricing
          </Link>
        </div>
      </div>
    </div>
  )
}
