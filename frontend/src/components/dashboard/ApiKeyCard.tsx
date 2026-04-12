import type { ApiKeyFields } from '@/lib/apollo/operations'
import { cn } from '@/lib/utils'

interface ApiKeyCardProps {
  apiKey: ApiKeyFields
  onRevoke: (id: string) => void
  onCopyPrefix: (prefix: string) => void
}

export function ApiKeyCard({ apiKey, onRevoke, onCopyPrefix }: ApiKeyCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between',
        !apiKey.isActive && 'opacity-50',
      )}
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-white">{apiKey.name}</span>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs',
              apiKey.isActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/10 text-white/50',
            )}
          >
            {apiKey.isActive ? 'Active' : 'Revoked'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onCopyPrefix(apiKey.keyPrefix)}
          className="mt-1 font-mono text-sm text-clara-blue hover:underline"
        >
          {apiKey.keyPrefix}
        </button>
        <p className="mt-1 text-xs text-white/40">
          Created {new Date(apiKey.createdAt).toLocaleString()}
          {apiKey.lastUsed ? ` · Last used ${new Date(apiKey.lastUsed).toLocaleString()}` : ''}
        </p>
      </div>
      {apiKey.isActive && (
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined' && window.confirm('Revoke this API key?')) {
              onRevoke(apiKey.id)
            }
          }}
          className="rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-300 transition hover:bg-red-500/10"
        >
          Revoke
        </button>
      )}
    </div>
  )
}
