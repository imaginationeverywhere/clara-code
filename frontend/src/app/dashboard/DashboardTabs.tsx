'use client'

import { useQuery } from '@apollo/client/react'
import { ApolloProvider } from '@apollo/client/react'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiKeysInner } from '@/app/api-keys/ApiKeysContent'
import { getApolloClient } from '@/lib/apollo/client'
import { GET_ME, MY_API_KEYS, type ApiKeyFields, type MeQueryData, type MyApiKeysQueryData } from '@/lib/apollo/operations'
import { getRestApiOrigin } from '@/lib/rest-api'

type NavId = 'overview' | 'keys' | 'voice' | 'billing'

type UsageJson = {
  tier: string
  voice_exchanges: {
    used: number
    limit: number | null
    reset_date: string | null
    unlimited: boolean
  }
}

function planLabel(plan: string | undefined): string {
  switch (plan) {
    case 'PRO':
      return 'Pro'
    case 'BUSINESS':
      return 'Business'
    case 'FREE':
    default:
      return 'Free'
  }
}

function tierBadgeClass(tier: string): string {
  const t = tier.toLowerCase()
  if (t === 'pro' || t === 'business') return 'bg-emerald-500/20 text-emerald-300'
  if (t === 'developer') return 'bg-violet-500/20 text-violet-300'
  return 'bg-white/10 text-white/70'
}

function maskKeyPrefix(prefix: string): string {
  const last4 = prefix.length >= 4 ? prefix.slice(-4) : prefix
  return `sk_••••••••••••${last4}`
}

function DashboardTabsInner() {
  const { getToken } = useAuth()
  const [section, setSection] = useState<NavId>('overview')
  const [voiceCloneStatus, setVoiceCloneStatus] = useState<'none' | 'pending' | 'ready'>('none')
  const [usage, setUsage] = useState<UsageJson | null>(null)
  const [usageError, setUsageError] = useState<string | null>(null)

  const { data: meData } = useQuery<MeQueryData>(GET_ME, { fetchPolicy: 'cache-and-network' })
  const { data: keysData, loading: keysLoading } = useQuery<MyApiKeysQueryData>(MY_API_KEYS, {
    fetchPolicy: 'cache-and-network',
  })

  const keys: ApiKeyFields[] = keysData?.myApiKeys ?? []
  const activeKeys = keys.filter((k) => k.isActive)
  const primaryKey = activeKeys[0]

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const token = await getToken()
        if (!token) {
          setUsage(null)
          return
        }
        const res = await fetch(`${getRestApiOrigin()}/api/user/usage`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          if (!cancelled) setUsageError('Could not load usage')
          return
        }
        const json = (await res.json()) as UsageJson
        if (!cancelled) {
          setUsage(json)
          setUsageError(null)
        }
      } catch {
        if (!cancelled) setUsageError('Could not load usage')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [getToken])

  const nav = useMemo(
    () =>
      [
        { id: 'overview' as const, label: 'Overview' },
        { id: 'keys' as const, label: 'API Keys' },
        { id: 'voice' as const, label: 'Voice Settings' },
        { id: 'billing' as const, label: 'Billing' },
      ] as const,
    [],
  )

  const onCopyMasked = useCallback(() => {
    if (!primaryKey) return
    void navigator.clipboard.writeText(primaryKey.keyPrefix).catch(() => {})
  }, [primaryKey])

  return (
    <div className="flex min-h-screen bg-[#0a0a0b] text-white">
      <aside className="flex w-60 shrink-0 flex-col border-r border-white/10 bg-black/40">
        <div className="border-b border-white/10 px-5 py-4">
          <Link href="/" className="text-sm font-semibold text-clara hover:underline">
            Clara Code
          </Link>
          <p className="mt-1 text-xs text-white/45">Dashboard</p>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                section === item.id
                  ? 'bg-clara/15 font-medium text-clara'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 overflow-auto">
        <header className="flex flex-col gap-4 border-b border-white/10 px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold capitalize tracking-tight">
            {nav.find((n) => n.id === section)?.label}
          </h1>
          <nav className="flex flex-wrap gap-4 text-sm text-white/60">
            <Link href="/dashboard" className="hover:text-white">
              Dashboard
            </Link>
            <Link href="/api-keys" className="hover:text-white">
              API keys
            </Link>
            <Link href="/account" className="hover:text-white">
              Account
            </Link>
          </nav>
        </header>

        <div className="px-8 py-8">
          {section === 'overview' && (
            <div className="max-w-2xl space-y-6 text-white/80">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${tierBadgeClass(
                    usage?.tier ?? meData?.me?.plan?.toLowerCase() ?? 'free',
                  )}`}
                >
                  {planLabel(meData?.me?.plan)} tier
                </span>
                {keysLoading && <span className="text-xs text-white/40">Loading keys…</span>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs text-white/45">Active API keys</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{activeKeys.length}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs text-white/45">Voice exchanges (current period)</p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    {usage
                      ? usage.voice_exchanges.unlimited
                        ? 'Unlimited'
                        : `${usage.voice_exchanges.used}${usage.voice_exchanges.limit != null ? ` / ${usage.voice_exchanges.limit}` : ''}`
                      : usageError
                        ? '—'
                        : '…'}
                  </p>
                  <p className="mt-2 text-xs text-white/35">
                    Monthly API call totals are tracked server-side next; this shows voice usage from the
                    gateway.
                  </p>
                </div>
              </div>

              {primaryKey && (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs text-white/45">Primary key (masked)</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <code className="font-mono text-sm text-clara">{maskKeyPrefix(primaryKey.keyPrefix)}</code>
                    <button
                      type="button"
                      onClick={onCopyMasked}
                      className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/15"
                    >
                      Copy prefix
                    </button>
                  </div>
                </div>
              )}

              <p className="text-sm text-white/55">
                Welcome to your Clara workspace. Keys are stored on the server; manage them in the API Keys
                tab.
              </p>
            </div>
          )}

          {section === 'keys' && <ApiKeysInner embedded />}

          {section === 'voice' && (
            <div className="max-w-xl space-y-6">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-sm font-semibold text-white">Voice clone</h2>
                <p className="mt-2 text-sm text-white/55">
                  Status:{' '}
                  <span className="font-medium text-clara">
                    {voiceCloneStatus === 'none' && 'Not cloned'}
                    {voiceCloneStatus === 'pending' && 'Processing sample…'}
                    {voiceCloneStatus === 'ready' && 'Ready'}
                  </span>
                </p>
                <div className="mt-6">
                  <label className="inline-flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-white/20 px-4 py-3 text-sm hover:border-clara/50">
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={() => setVoiceCloneStatus('pending')}
                    />
                    <span className="rounded-md bg-white/10 px-3 py-1 text-xs font-medium">Upload sample</span>
                    <span className="text-white/45">WAV or MP3, ~30s clean speech</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {section === 'billing' && (
            <div className="max-w-xl space-y-4 text-white/70">
              <p>Billing is connected to your Clara org when you leave the waitlist.</p>
              <p className="text-sm text-white/45">
                Pro ($29/mo) and Business ($99/mo) will appear here with invoices and usage.
              </p>
              <Link href="/checkout/pro" className="inline-block text-sm text-clara hover:underline">
                Open checkout (placeholder)
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardTabs() {
  return (
    <ApolloProvider client={getApolloClient()}>
      <DashboardTabsInner />
    </ApolloProvider>
  )
}
