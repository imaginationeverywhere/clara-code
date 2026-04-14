'use client'

import dynamic from 'next/dynamic'

const ApiKeysContent = dynamic(() => import('./ApiKeysContent'), {
  ssr: false,
  loading: () => (
    <main className="min-h-screen bg-bg-terminal p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">API keys</h1>
          <p className="mt-1 text-white/50">Loading...</p>
        </div>
      </div>
    </main>
  ),
})

export default function ApiKeysPage() {
  return <ApiKeysContent />
}
