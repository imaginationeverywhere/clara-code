'use client'

import { useQuery } from '@apollo/client/react'
import { ApolloProvider } from '@apollo/client/react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { getApolloClient } from '@/lib/apollo/client'
import { GET_ME, type MeQueryData } from '@/lib/apollo/operations'

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

function AccountBody({
  email,
  imageUrl,
  displayName,
}: {
  email: string
  imageUrl: string | null
  displayName: string
}) {
  const { user, isLoaded } = useUser()
  const { data: meData } = useQuery<MeQueryData>(GET_ME, { fetchPolicy: 'cache-and-network' })
  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const onSaveProfile = useCallback(async () => {
    if (!user) return
    setSaving(true)
    try {
      await user.update({ firstName: firstName.trim() || undefined, lastName: lastName.trim() || undefined })
    } finally {
      setSaving(false)
    }
  }, [user, firstName, lastName])

  const onDelete = useCallback(async () => {
    if (!user) return
    setDeleteBusy(true)
    try {
      await user.delete()
    } finally {
      setDeleteBusy(false)
      setDeleteOpen(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    setFirstName(user.firstName ?? '')
    setLastName(user.lastName ?? '')
  }, [user])

  return (
    <>
      <header className="flex flex-col gap-4 border-b border-white/10 pb-8 sm:flex-row sm:items-center">
        <div className="h-16 w-16 overflow-hidden rounded-full bg-white/10">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- Clerk avatar URLs are dynamic
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xl text-white/50">?</span>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">{displayName}</h1>
          <p className="text-sm text-white/50">{email}</p>
          <span className="mt-2 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
            {planLabel(meData?.me?.plan)} plan
          </span>
        </div>
      </header>

      <section className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-sm font-semibold text-white">Personal info</h2>
        <p className="text-xs text-white/45">Email is managed by Clerk and is read-only here.</p>
        <label className="block text-xs text-white/45">
          Email
          <input
            readOnly
            value={email}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/70"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs text-white/45">
            First name
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={!isLoaded || !user}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block text-xs text-white/45">
            Last name
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={!isLoaded || !user}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={() => void onSaveProfile()}
          disabled={saving || !user}
          className="rounded-lg bg-clara px-4 py-2 text-sm font-medium text-white hover:bg-clara/90 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save name'}
        </button>
      </section>

      <section className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-sm font-semibold text-white">Subscription</h2>
        <p className="text-sm text-white/60">
          Current plan: <strong className="text-white">{planLabel(meData?.me?.plan)}</strong>
        </p>
        <p className="text-xs text-white/40">Next billing date appears when Stripe billing is connected.</p>
        <Link
          href="/checkout/pro"
          className="inline-block text-sm text-clara hover:underline"
        >
          Manage billing (placeholder)
        </Link>
      </section>

      <section className="space-y-3 rounded-xl border border-red-500/20 bg-red-500/5 p-6">
        <h2 className="text-sm font-semibold text-red-200">Danger zone</h2>
        <p className="text-xs text-white/50">Permanently delete your Clerk account and associated data.</p>
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-500/20"
        >
          Delete account
        </button>
      </section>

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-w-md rounded-xl border border-white/10 bg-[#12121a] p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white">Delete account?</h3>
            <p className="mt-2 text-sm text-white/60">This cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                className="rounded-lg px-4 py-2 text-sm text-white/70 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void onDelete()}
                disabled={deleteBusy}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
              >
                {deleteBusy ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function AccountPageClient({
  email,
  imageUrl,
  displayName,
}: {
  email: string
  imageUrl: string | null
  displayName: string
}) {
  return (
    <ApolloProvider client={getApolloClient()}>
      <nav className="mb-8 flex flex-wrap gap-4 text-sm text-white/55">
        <Link href="/dashboard" className="hover:text-white">
          Dashboard
        </Link>
        <Link href="/api-keys" className="hover:text-white">
          API keys
        </Link>
        <span className="text-white">Account</span>
      </nav>
      <AccountBody email={email} imageUrl={imageUrl} displayName={displayName} />
    </ApolloProvider>
  )
}
