'use client'

import { useState } from 'react'

type InstallCommandCopyButtonProps = {
	text: string
}

export function InstallCommandCopyButton({ text }: InstallCommandCopyButtonProps) {
	const [copied, setCopied] = useState(false)

	return (
		<button
			type="button"
			onClick={async () => {
				try {
					await navigator.clipboard.writeText(text)
					setCopied(true)
					window.setTimeout(() => setCopied(false), 2000)
				} catch {
					/* ignore */
				}
			}}
			className="shrink-0 rounded-md border border-white/10 px-2.5 py-1 font-mono text-[11px] text-white/60 transition-colors hover:border-white/20 hover:text-white/90"
		>
			{copied ? 'Copied' : 'Copy'}
		</button>
	)
}
