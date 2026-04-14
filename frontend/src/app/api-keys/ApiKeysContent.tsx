'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import { ApolloProvider } from '@apollo/client/react'
import { getApolloClient } from '@/lib/apollo/client'
import Link from 'next/link'
import {
  CREATE_API_KEY,
  MY_API_KEYS,
  REVOKE_API_KEY,
  type ApiKeyFields,
  type MyApiKeysQueryData,
  type CreateApiKeyMutationData,
  type RevokeApiKeyMutationData,
} from '@/lib/apollo/operations'
import { ApiKeyCard } from '@/components/dashboard/ApiKeyCard'
import { CreateKeyModal } from '@/components/dashboard/CreateKeyModal'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useState, useCallback } from 'react'

export default function ApiKeysContent() {
  return (
    <ApolloProvider client={getApolloClient()}>
      <ApiKeysInner />
    </ApolloProvider>
  )
}

function ApiKeysInner() {
  const [modalOpen, setModalOpen] = useState(false)
  const { track } = useAnalytics()
  const { data, loading, error, refetch } = useQuery<MyApiKeysQueryData>(MY_API_KEYS, {
    fetchPolicy: 'network-only',
  })
  const [createKey] = useMutation<CreateApiKeyMutationData>(CREATE_API_KEY)
  const [revokeKey] = useMutation<RevokeApiKeyMutationData>(REVOKE_API_KEY)

  const keys: ApiKeyFields[] = data?.myApiKeys ?? []

  const onCreate = useCallback(
    async (name: string) => {
      const wasEmpty = keys.length === 0
      await createKey({ variables: { name } })
      if (wasEmpty) {
        track('first_api_key_created')
      }
      await refetch()
    },
    [createKey, keys.length, refetch, track],
  )

  const onRevoke = useCallback(
    async (id: string) => {
      await revokeKey({ variables: { id } })
      await refetch()
    },
    [refetch, revokeKey],
  )

  const onCopyPrefix = useCallback((prefix: string) => {
    void navigator.clipboard.writeText(prefix).catch(() => {})
  }, [])

  return (
    <main className="min-h-screen bg-[#09090F] p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">API keys</h1>
            <p className="mt-1 text-white/50">Create and revoke keys for the Clara Code API.</p>
          </div>
          <Link href="/dashboard" className="text-sm text-clara-blue hover:underline">
            Back to dashboard
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="mb-8 rounded-lg bg-clara-blue px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          Create new key
        </button>

        {loading && <p className="text-sm text-white/40">Loading keys…</p>}
        {error && (
          <p className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Could not reach GraphQL ({error.message}). Keys will appear here when the backend is available.
          </p>
        )}

        <div className="space-y-4">
          {keys.length === 0 && !loading && (
            <p className="text-sm text-white/40">No keys yet. Create one to get started.</p>
          )}
          {keys.map((k) => (
            <ApiKeyCard key={k.id} apiKey={k} onRevoke={onRevoke} onCopyPrefix={onCopyPrefix} />
          ))}
        </div>
      </div>

      <CreateKeyModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={onCreate} />
    </main>
  )
}
