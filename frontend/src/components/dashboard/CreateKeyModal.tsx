'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface CreateKeyModalProps {
  open: boolean
  onClose: () => void
  onCreate: (name: string) => Promise<void>
}

export function CreateKeyModal({ open, onClose, onCreate }: CreateKeyModalProps) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)

  if (!open) return null

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    try {
      await onCreate(name.trim())
      setName('')
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal>
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-white">Create API key</h2>
        <p className="mt-1 text-sm text-white/50">Choose a label you will recognize later.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm text-white/70">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(
                'mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white',
                'focus:border-clara-blue focus:outline-none focus:ring-1 focus:ring-clara-blue',
              )}
              placeholder="e.g. CI / Laptop"
              autoFocus
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-white/70 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !name.trim()}
              className="rounded-lg bg-clara-blue px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {busy ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
