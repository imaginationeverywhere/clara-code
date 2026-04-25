'use client'

import { useState } from 'react'
import { fetchGreeting, speakText } from '@/lib/clara-voice'

type Phase = 'idle' | 'loading' | 'speaking' | 'done' | 'error'

export function ClaraVoiceGreeting() {
	const [phase, setPhase] = useState<Phase>('idle')

	const handleClick = async () => {
		if (phase !== 'idle' && phase !== 'error') {
			return
		}
		setPhase('loading')
		try {
			const text = await fetchGreeting()
			setPhase('speaking')
			await speakText(text)
			setPhase('done')
		} catch {
			setPhase('error')
		}
	}

	const label: Record<Phase, string> = {
		idle: 'Hear Clara',
		loading: 'Connecting...',
		speaking: 'Speaking...',
		done: 'Talk to Clara',
		error: 'Try again',
	}

	const isActive = phase === 'speaking'

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={phase === 'loading' || phase === 'speaking'}
			className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
				isActive
					? 'animate-pulse bg-[#7C3AED] text-white'
					: 'border border-white/10 bg-white/[0.08] text-white/70 hover:bg-white/12 hover:text-white'
			} `}
			aria-label={label[phase]}
		>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
				<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
				<path
					d="M19 10v2a7 7 0 0 1-14 0v-2"
					stroke="currentColor"
					strokeWidth="2"
					fill="none"
					strokeLinecap="round"
				/>
				<line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
				<line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
			</svg>
			{label[phase]}
		</button>
	)
}
