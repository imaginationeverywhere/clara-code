'use client'

import { useCallback, useEffect, useState } from 'react'
import { IconMic } from '@/components/marketing/icons'

const CLARA_GREETING =
	"Hey. I'm Clara. You're on claracode.ai — welcome. I'm a voice-first AI coding assistant. I work in your terminal, in VS Code, and in your browser. And I can do something most coding tools can't: I can talk to you. Click install below — I'll be in your editor in under a minute."

type VoiceStatus = 'idle' | 'loading' | 'playing' | 'done' | 'error'

export function VoiceGreeting() {
	const [status, setStatus] = useState<VoiceStatus>('idle')
	const [hasGreetedBefore, setHasGreetedBefore] = useState(false)
	const [isMuted, setIsMuted] = useState(false)

	useEffect(() => {
		const sync = () => {
			setHasGreetedBefore(sessionStorage.getItem('clara-greeted') === '1')
			setIsMuted(sessionStorage.getItem('clara-muted') === '1')
		}
		sync()
		window.addEventListener('clara-muted-change', sync)
		return () => window.removeEventListener('clara-muted-change', sync)
	}, [])

	const playTts = useCallback(async () => {
		setStatus('loading')
		try {
			const response = await fetch('/api/voice/tts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text: CLARA_GREETING, voice: 'clara' }),
			})
			if (!response.ok) {
				setStatus('error')
				return
			}
			const blob = await response.blob()
			const url = URL.createObjectURL(blob)
			const audio = new Audio(url)
			setStatus('playing')
			audio.onended = () => {
				URL.revokeObjectURL(url)
				sessionStorage.setItem('clara-greeted', '1')
				setHasGreetedBefore(true)
				setStatus('done')
			}
			audio.onerror = () => {
				URL.revokeObjectURL(url)
				setStatus('error')
			}
			await audio.play()
		} catch {
			setStatus('error')
		}
	}, [])

	const onClick = () => {
		if (isMuted) return
		if (status === 'loading' || status === 'playing') return
		void playTts()
	}

	const showPulse = !hasGreetedBefore && status === 'idle'

	let caption: string
	if (isMuted) {
		caption = 'Voice muted — unmute in the header to hear Clara'
	} else if (status === 'idle' && !hasGreetedBefore) {
		caption = 'Clara is here — tap to hear her'
	} else if (status === 'idle') {
		caption = "Hear Clara's greeting"
	} else if (status === 'loading') {
		caption = 'One moment...'
	} else if (status === 'playing') {
		caption = 'Clara is speaking...'
	} else if (status === 'done') {
		caption = '↓ Install Clara below'
	} else {
		caption = 'Voice unavailable — check the docs'
	}

	return (
		<div className="flex flex-col items-center gap-3">
			<div className="relative">
				{showPulse ? (
					<>
						<span
							className="pointer-events-none absolute inset-0 scale-90 rounded-full bg-[#7C3AED]/30 opacity-60 animate-[clara-pulse-ring_1.5s_ease-out_infinite]"
							aria-hidden
						/>
						<span
							className="pointer-events-none absolute inset-0 scale-90 rounded-full bg-[#7C3AED]/20 opacity-60 animate-[clara-pulse-ring_1.5s_ease-out_infinite] [animation-delay:0.5s]"
							aria-hidden
						/>
					</>
				) : null}
				<button
					type="button"
					onClick={onClick}
					disabled={isMuted || status === 'loading' || status === 'playing'}
					className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#7C3AED] text-white shadow-[0_0_40px_rgba(124,58,237,0.45)] transition hover:bg-[#6D28D9] disabled:cursor-not-allowed disabled:opacity-70"
					aria-label={isMuted ? 'Voice muted' : 'Play Clara greeting'}
				>
					{status === 'loading' ? (
						<span className="flex h-6 items-end gap-0.5">
							{[0, 1, 2, 3, 4].map((i) => (
								<span
									key={i}
									className="w-1 rounded-sm bg-white/90 animate-[clara-waveform_0.8s_ease-in-out_infinite]"
									style={{ animationDelay: `${i * 0.1}s`, height: 10 + (i % 3) * 4 }}
								/>
							))}
						</span>
					) : status === 'playing' ? (
						<span className="flex h-7 items-end gap-0.5">
							{[0, 1, 2, 3, 4].map((i) => (
								<span
									key={i}
									className="w-1 rounded-sm bg-[#7BCDD8] animate-[clara-waveform_0.8s_ease-in-out_infinite]"
									style={{ animationDelay: `${i * 0.1}s` }}
								/>
							))}
						</span>
					) : status === 'done' ? (
						<span className="text-2xl text-[#10B981]" aria-hidden>
							✓
						</span>
					) : status === 'error' ? (
						<span className="text-xl text-amber-400" aria-hidden>
							!
						</span>
					) : (
						<IconMic className="h-7 w-7" />
					)}
				</button>
			</div>
			<p className="max-w-sm text-center text-sm text-white/45">{caption}</p>
		</div>
	)
}
