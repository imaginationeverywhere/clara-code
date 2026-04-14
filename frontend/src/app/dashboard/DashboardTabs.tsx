'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import { ApolloProvider } from '@apollo/client/react'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiKeyCard } from '@/components/dashboard/ApiKeyCard'
import { CreateKeyModal } from '@/components/dashboard/CreateKeyModal'
import { getApolloClient } from '@/lib/apollo/client'
import {
	CREATE_API_KEY,
	GET_ME,
	MY_API_KEYS,
	REVOKE_API_KEY,
	type ApiKeyFields,
	type CreateApiKeyMutationData,
	type MeQueryData,
	type MyApiKeysQueryData,
	type PlanType,
	type RevokeApiKeyMutationData,
} from '@/lib/apollo/operations'
import { getRestApiOrigin } from '@/lib/rest-api'

type NavId = 'overview' | 'keys' | 'voice' | 'billing'

function planBadgeLabel(plan: PlanType): string {
	switch (plan) {
		case 'FREE':
			return 'Free'
		case 'PRO':
			return 'Pro'
		case 'BUSINESS':
			return 'Business'
		default:
			return 'Free'
	}
}

function maskKeyPrefix(prefix: string): string {
	const tail = prefix.length >= 4 ? prefix.slice(-4) : prefix
	return `sk_••••••••••••${tail}`
}

type VoiceUsageJson = {
	tier: string
	voice_exchanges: {
		used: number
		limit: number | null
		reset_date: string | null
		unlimited: boolean
	}
}

function DashboardTabsInner({
	displayName,
	userId: _userId,
}: {
	displayName: string
	userId: string
}) {
	void _userId
	const [section, setSection] = useState<NavId>('overview')
	const [voiceCloneStatus, setVoiceCloneStatus] = useState<'none' | 'pending' | 'ready'>('none')
	const [modalOpen, setModalOpen] = useState(false)
	const { getToken } = useAuth()

	const { data: meData, loading: meLoading } = useQuery<MeQueryData>(GET_ME, {
		fetchPolicy: 'network-only',
	})
	const { data: keysData, loading: keysLoading, refetch: refetchKeys } = useQuery<MyApiKeysQueryData>(
		MY_API_KEYS,
		{ fetchPolicy: 'network-only' },
	)
	const [createKey] = useMutation<CreateApiKeyMutationData>(CREATE_API_KEY)
	const [revokeKey] = useMutation<RevokeApiKeyMutationData>(REVOKE_API_KEY)

	const [usageJson, setUsageJson] = useState<VoiceUsageJson | null>(null)
	const [usageError, setUsageError] = useState<string | null>(null)

	useEffect(() => {
		let cancelled = false
		const load = async () => {
			try {
				const token = await getToken().catch(() => null)
				if (!token) {
					setUsageJson(null)
					return
				}
				const res = await fetch(`${getRestApiOrigin()}/api/user/usage`, {
					headers: { Authorization: `Bearer ${token}` },
				})
				if (!res.ok) {
					if (!cancelled) setUsageError(`Usage HTTP ${res.status}`)
					return
				}
				const json = (await res.json()) as VoiceUsageJson
				if (!cancelled) {
					setUsageError(null)
					setUsageJson(json)
				}
			} catch {
				if (!cancelled) setUsageError('Could not load usage')
			}
		}
		void load()
		return () => {
			cancelled = true
		}
	}, [getToken])

	const keys: ApiKeyFields[] = keysData?.myApiKeys ?? []
	const activeKeys = keys.filter((k) => k.isActive)
	const plan = meData?.me?.plan ?? 'FREE'
	const primaryKey = activeKeys[0]

	const onCreate = useCallback(
		async (name: string) => {
			await createKey({ variables: { name } })
			await refetchKeys()
		},
		[createKey, refetchKeys],
	)

	const onRevoke = useCallback(
		async (id: string) => {
			await revokeKey({ variables: { id } })
			await refetchKeys()
		},
		[refetchKeys, revokeKey],
	)

	const onCopyPrefix = useCallback((prefix: string) => {
		void navigator.clipboard.writeText(prefix).catch(() => {})
	}, [])

	const onCopyMasked = useCallback(() => {
		if (!primaryKey) return
		void navigator.clipboard.writeText(maskKeyPrefix(primaryKey.keyPrefix)).catch(() => {})
	}, [primaryKey])

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
				<div className="mt-auto border-t border-white/10 p-3 text-xs text-white/45">
					<Link href="/account" className="block rounded-lg px-3 py-2 text-clara hover:bg-white/5">
						Account
					</Link>
					<Link href="/settings" className="block rounded-lg px-3 py-2 text-clara hover:bg-white/5">
						Settings
					</Link>
					<Link href="/api-keys" className="block rounded-lg px-3 py-2 text-clara hover:bg-white/5">
						API keys
					</Link>
				</div>
			</aside>

			<div className="min-w-0 flex-1 overflow-auto">
				<header className="border-b border-white/10 px-8 py-6">
					<h1 className="text-2xl font-semibold capitalize tracking-tight">
						{nav.find((n) => n.id === section)?.label}
					</h1>
				</header>

				<div className="px-8 py-8">
					{section === 'overview' && (
						<div className="max-w-2xl space-y-6 text-white/80">
							<p>Welcome back, {displayName}</p>

							{meLoading && <p className="text-sm text-white/40">Loading account…</p>}

							<div className="flex flex-wrap items-center gap-3">
								<span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white/90">
									{planBadgeLabel(plan)}
								</span>
								<span className="text-sm text-white/50">Subscription tier</span>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
									<p className="text-xs font-medium uppercase tracking-wide text-white/45">
										Active API keys
									</p>
									<p className="mt-2 text-2xl font-semibold text-white">
										{keysLoading ? '…' : activeKeys.length}
									</p>
								</div>
								<div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
									<p className="text-xs font-medium uppercase tracking-wide text-white/45">
										Voice exchanges (this month)
									</p>
									<p className="mt-2 text-2xl font-semibold text-white">
										{usageJson
											? usageJson.voice_exchanges.unlimited
												? `${usageJson.voice_exchanges.used} (unlimited)`
												: `${usageJson.voice_exchanges.used} / ${usageJson.voice_exchanges.limit ?? '—'}`
											: usageError
												? '—'
												: '…'}
									</p>
									{usageError && (
										<p className="mt-1 text-xs text-amber-200/90">{usageError}</p>
									)}
								</div>
							</div>

							<div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
								<p className="text-sm font-medium text-white">Primary key (masked)</p>
								{primaryKey ? (
									<div className="mt-3 flex flex-wrap items-center gap-3">
										<code className="rounded bg-black/40 px-2 py-1 font-mono text-sm text-clara">
											{maskKeyPrefix(primaryKey.keyPrefix)}
										</code>
										<button
											type="button"
											onClick={onCopyMasked}
											className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/15"
										>
											Copy masked
										</button>
									</div>
								) : (
									<p className="mt-2 text-sm text-white/45">No active keys yet. Create one in the Keys tab.</p>
								)}
							</div>

							<p className="text-xs text-white/40">
								Aggregate Clara API request counts per month will appear here when billing analytics ships.
							</p>
						</div>
					)}

					{section === 'keys' && (
						<div className="max-w-3xl space-y-8">
							<button
								type="button"
								onClick={() => setModalOpen(true)}
								className="rounded-lg bg-clara px-4 py-2 text-sm font-semibold text-white hover:bg-clara/90"
							>
								Create new key
							</button>

							{keysLoading && <p className="text-sm text-white/40">Loading keys…</p>}

							<div className="space-y-4">
								{keys.length === 0 && !keysLoading && (
									<p className="text-sm text-white/40">No keys yet. Create one to use the Clara API.</p>
								)}
								{keys.map((k) => (
									<ApiKeyCard key={k.id} apiKey={k} onRevoke={onRevoke} onCopyPrefix={onCopyPrefix} />
								))}
							</div>

							<CreateKeyModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={onCreate} />
						</div>
					)}

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
										<span className="rounded-md bg-white/10 px-3 py-1 text-xs font-medium">
											Upload sample
										</span>
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
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export function DashboardTabs({ displayName, userId }: { displayName: string; userId: string }) {
	return (
		<ApolloProvider client={getApolloClient()}>
			<DashboardTabsInner displayName={displayName} userId={userId} />
		</ApolloProvider>
	)
}
