'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { IconMic } from '@/components/marketing/icons'

const CLARA_GREETING =
	"Hey. I'm Clara. You're on claracode.ai — welcome. I'm a voice-first AI coding assistant. I work in your terminal, in VS Code, and in your browser. And I can do something most coding tools can't: I can talk to you. Click install below — I'll be in your editor in under a minute."

type VoiceStatus = 'idle' | 'loading' | 'playing' | 'done' | 'error'

export function VoiceGreeting() {
	const [status, setStatus] = useState<VoiceStatus>('idle')
	const [hasGreetedBefore, setHasGreetedBefore] = useState(false)
	const [isMuted, setIsMuted] = useState(false)
	const [autoplayBlocked, setAutoplayBlocked] = useState(false)
	const autoplayAttempted = useRef(false)

	useEffect(() => {
		const sync = () => {
			setHasGreetedBefore(sessionStorage.getItem('clara-greeted') === '1')
			setIsMuted(sessionStorage.getItem('clara-muted') === '1')
		}
		sync()
		window.addEventListener('clara-muted-change', sync)
		return () => window.removeEventListener('clara-muted-change', sync)
	}, [])

	const playOnce = useCallback(async (isAutoplay: boolean) => {
		if (isMuted) {
			return
		}
		setStatus('loading')
		setAutoplayBlocked(false)
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
			setStatus('playing')
			const playP = audio.play()
			if (playP) {
				try {
					await playP
				} catch (e) {
					URL.revokeObjectURL(url)
					const err = e
					if (
						err &&
						typeof err === 'object' &&
						'name' in err &&
						(err as { name?: string }).name === 'NotAllowedError'
					) {
						if (isAutoplay) {
							setAutoplayBlocked(true)
							setStatus('idle')
							return
						}
					}
					setStatus('error')
					return
				}
			}
		} catch {
			setStatus('error')
		}
	}, [isMuted])

	useEffect(() => {
		if (autoplayAttempted.current) {
			return
		}
		if (typeof window === 'undefined') {
			return
		}
		if (sessionStorage.getItem('clara-muted') === '1') {
			return
		}
		if (sessionStorage.getItem('clara-greeted') === '1') {
			return
		}
		autoplayAttempted.current = true
		queueMicrotask(() => {
			void playOnce(true)
		})
	}, [playOnce])

	const onClick = () => {
		if (isMuted) {
			return
		}
		if (status === 'loading' || status === 'playing') {
			return
		}
		void playOnce(false)
	}

	const showPulse = !hasGreetedBefore && status === 'idle' && !isMuted

	let caption: string
	if (isMuted) {
		caption = 'Voice muted — unmute in the header to hear Clara'
	} else if (autoplayBlocked && !hasGreetedBefore) {
		caption = "Autoplay was blocked — tap to hear Clara's greeting"
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
							className="pointer-events-none absolute inset-0 scale-90 rounded-full bg-brand-purple/30 opacity-60 animate-[clara-pulse-ring_1.5s_ease-out_infinite]"
							aria-hidden
						/>
						<span
							className="pointer-events-none absolute inset-0 scale-90 rounded-full bg-brand-purple/20 opacity-60 animate-[clara-pulse-ring_1.5s_ease-out_infinite] [animation-delay:0.5s]"
							aria-hidden
						/>
					</>
				) : null}
				<button
					type="button"
					onClick={onClick}
					disabled={isMuted || status === 'loading' || status === 'playing'}
					className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-purple text-white shadow-[0_0_40px_rgba(124,58,237,0.45)] transition hover:bg-brand-purple-hover disabled:cursor-not-allowed disabled:opacity-70"
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
									className="w-1 rounded-sm bg-clara animate-[clara-waveform_0.8s_ease-in-out_infinite]"
									style={{ animationDelay: `${i * 0.1}s` }}
								/>
							))}
						</span>
					) : status === 'done' ? (
						<span className="text-2xl text-brand-green" aria-hidden>
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
