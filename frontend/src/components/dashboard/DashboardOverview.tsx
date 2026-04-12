'use client'

import { useQuery } from '@apollo/client/react'
import Link from 'next/link'
import { GET_ME, type MeQueryData } from '@/lib/apollo/operations'
import { UsageBar } from '@/components/dashboard/UsageBar'

interface DashboardOverviewProps {
  displayName: string
}

export function DashboardOverview({ displayName }: DashboardOverviewProps) {
  const { data, loading, error } = useQuery<MeQueryData>(GET_ME, { fetchPolicy: 'network-only' })

  const plan = data?.me?.plan ?? 'FREE'
  const usageCap = plan === 'FREE' ? 100 : 1000
  const usageUsed = plan === 'FREE' ? 12 : 240

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-white/50">Welcome back, {displayName}</p>
      </div>

      {loading && <p className="text-sm text-white/40">Loading account…</p>}
      {error && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          GraphQL unavailable ({error.message}). Showing local session only until the API is online.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white/80">
          Plan: {plan}
        </span>
        <Link href="/settings" className="text-sm text-clara-blue hover:underline">
          Manage plan
        </Link>
        <Link href="/api-keys" className="text-sm text-clara-blue hover:underline">
          API keys
        </Link>
      </div>

      <UsageBar label="Voice exchanges (demo)" used={usageUsed} cap={usageCap} />

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-sm font-medium text-white">Quick actions</h2>
        <ul className="mt-3 space-y-2 text-sm text-white/60">
          <li>
            <Link href="/api-keys" className="text-clara-blue hover:underline">
              Create an API key
            </Link>
          </li>
          <li>
            <a
              href="https://github.com/imaginationeverywhere/clara-code"
              target="_blank"
              rel="noopener noreferrer"
              className="text-clara-blue hover:underline"
            >
              Open the repo
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}
