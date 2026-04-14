'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DangerZone() {
	const { signOut } = useAuth()
	const router = useRouter()
	const [open, setOpen] = useState(false)
	const [busy, setBusy] = useState(false)
	const [err, setErr] = useState<string | null>(null)

	const onDelete = async () => {
		setBusy(true)
		setErr(null)
		try {
			const res = await fetch('/api/account/delete', { method: 'POST' })
			if (!res.ok) {
				const body = (await res.json().catch(() => ({}))) as { error?: string }
				setErr(body.error ?? `Request failed (${res.status})`)
				return
			}
			await signOut()
			router.push('/sign-in')
		} catch {
			setErr('Could not delete account.')
		} finally {
			setBusy(false)
			setOpen(false)
		}
	}

	return (
		<section className="space-y-4 rounded-2xl border border-red-500/25 bg-red-500/5 p-6">
			<h2 className="text-lg font-semibold text-red-200">Danger zone</h2>
			<p className="text-sm text-white/55">
				Permanently delete your Clara Code account. This cannot be undone.
			</p>
			{err && <p className="text-sm text-amber-200">{err}</p>}
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="rounded-lg border border-red-400/40 bg-red-500/15 px-4 py-2 text-sm font-medium text-red-100 hover:bg-red-500/25"
			>
				Delete account…
			</button>

			{open && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
					<div className="w-full max-w-md rounded-xl border border-white/10 bg-[#12121a] p-6 shadow-xl">
						<p className="text-sm text-white/80">
							Delete your account permanently? You will be signed out and must create a new account to
							return.
						</p>
						<div className="mt-6 flex justify-end gap-2">
							<button
								type="button"
								onClick={() => setOpen(false)}
								className="rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5"
							>
								Cancel
							</button>
							<button
								type="button"
								disabled={busy}
								onClick={() => void onDelete()}
								className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
							>
								{busy ? 'Deleting…' : 'Delete account'}
							</button>
						</div>
					</div>
				</div>
			)}
		</section>
	)
}
