'use client'

export const dynamic = 'force-dynamic'


import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'clara-dashboard-api-keys'

type ApiKeyRecord = {
  id: string
  name: string
  prefix: string
  secret: string
  createdAt: string
}

type NavId = 'overview' | 'keys' | 'voice' | 'billing'

function randomId(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function generateSecret(): string {
  return `sk_${randomId()}`
}

function loadKeys(): ApiKeyRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (k): k is ApiKeyRecord =>
        typeof k === 'object' &&
        k !== null &&
        typeof (k as ApiKeyRecord).id === 'string' &&
        typeof (k as ApiKeyRecord).secret === 'string',
    )
  } catch {
    return []
  }
}

function saveKeys(keys: ApiKeyRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
}

export default function DashboardPage() {
  const [section, setSection] = useState<NavId>('overview')
  const [keys, setKeys] = useState<ApiKeyRecord[]>([])
  const [newKeyName, setNewKeyName] = useState('Development')
  const [voiceCloneStatus, setVoiceCloneStatus] = useState<'none' | 'pending' | 'ready'>('none')

  useEffect(() => {
    // Hydrate from localStorage after mount (browser-only).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time sync from external store
    setKeys(loadKeys())
  }, [])

  const persist = useCallback((next: ApiKeyRecord[]) => {
    setKeys(next)
    saveKeys(next)
  }, [])

  const createKey = useCallback(() => {
    const secret = generateSecret()
    const prefix = secret.slice(0, 12)
    const record: ApiKeyRecord = {
      id: randomId(),
      name: newKeyName.trim() || 'API key',
      prefix,
      secret,
      createdAt: new Date().toISOString(),
    }
    persist([...keys, record])
    setNewKeyName('Development')
  }, [keys, newKeyName, persist])

  const revokeKey = useCallback(
    (id: string) => {
      persist(keys.filter((k) => k.id !== id))
    },
    [keys, persist],
  )

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
      </aside>

      <div className="min-w-0 flex-1 overflow-auto">
        <header className="border-b border-white/10 px-8 py-6">
          <h1 className="text-2xl font-semibold capitalize tracking-tight">
            {nav.find((n) => n.id === section)?.label}
          </h1>
        </header>

        <div className="px-8 py-8">
          {section === 'overview' && (
            <div className="max-w-2xl space-y-4 text-white/70">
              <p>
                Welcome to your Clara workspace. Connect API keys for automation, tune voice for demos,
                and manage billing when you upgrade.
              </p>
              <ul className="list-inside list-disc space-y-2 text-sm">
                <li>Voice-first sessions sync with your editor and mobile clients.</li>
                <li>Keys are stored locally in this browser until backend provisioning ships.</li>
              </ul>
            </div>
          )}

          {section === 'keys' && (
            <div className="max-w-3xl space-y-8">
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label htmlFor="key-name" className="block text-xs text-white/50">
                    Label
                  </label>
                  <input
                    id="key-name"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="mt-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm outline-none ring-clara/40 focus:ring-2"
                  />
                </div>
                <button
                  type="button"
                  onClick={createKey}
                  className="rounded-lg bg-clara px-4 py-2 text-sm font-semibold text-white hover:bg-clara/90"
                >
                  Create new key
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-white/10">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/[0.04] text-white/50">
                    <tr>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Key</th>
                      <th className="px-4 py-3 font-medium">Created</th>
                      <th className="px-4 py-3 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {keys.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-white/45">
                          No keys yet. Create one to use with the Clara API (local preview).
                        </td>
                      </tr>
                    ) : (
                      keys.map((k) => (
                        <tr key={k.id} className="border-t border-white/10">
                          <td className="px-4 py-3">{k.name}</td>
                          <td className="px-4 py-3 font-mono text-xs text-clara/90">{k.prefix}…</td>
                          <td className="px-4 py-3 text-white/55">
                            {new Date(k.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => revokeKey(k.id)}
                              className="text-xs font-medium text-red-400 hover:text-red-300"
                            >
                              Revoke
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-white/40">
                Full secret is shown only once at creation (stored in localStorage for this demo).
                Revoke if this browser is shared.
              </p>
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
