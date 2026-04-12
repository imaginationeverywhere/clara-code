'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { IconGithub } from '@/components/marketing/icons'
import { useVoiceMute } from '@/app/(marketing)/hooks/useVoiceMute'

const GITHUB_REPO = 'https://github.com/imaginationeverywhere/clara-code'

function SpeakerIcon({ muted }: { muted: boolean }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
			{muted ? (
				<>
					<path d="M11 5 6 9H3v6h3l5 4V5z" />
					<path d="m22 9-6 6M16 9l6 6" />
				</>
			) : (
				<>
					<path d="M11 5 6 9H3v6h3l5 4V5z" />
					<path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a9 9 0 0 1 0 14.14" />
				</>
			)}
		</svg>
	)
}

export function Header() {
	const [scrolled, setScrolled] = useState(false)
	const { isMuted, toggle } = useVoiceMute()

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 10)
		window.addEventListener('scroll', onScroll, { passive: true })
		return () => window.removeEventListener('scroll', onScroll)
	}, [])

	return (
		<header
			className={`fixed left-0 right-0 top-0 z-50 border-b transition-all duration-200 ${
				scrolled ? 'border-white/[0.07] bg-[#0D1117]/95 backdrop-blur-md' : 'border-transparent bg-transparent'
			}`}
		>
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
				<Link href="/" className="flex items-center gap-0.5">
					<span className="text-lg font-bold tracking-tight text-white">Clara</span>
					<span className="font-mono text-lg font-bold tracking-tight text-[#4F8EF7]">Code</span>
				</Link>

				<nav className="flex items-center gap-6 md:gap-8">
					<div className="hidden items-center gap-6 text-sm font-medium text-white/50 md:flex">
						<Link href="/docs" className="transition-colors hover:text-white">
							Docs
						</Link>
						<Link href="/#pricing" className="transition-colors hover:text-white">
							Pricing
						</Link>
						<a
							href={GITHUB_REPO}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-1.5 transition-colors hover:text-white"
						>
							<IconGithub className="h-4 w-4" />
							GitHub
						</a>
					</div>

					<button
						type="button"
						onClick={toggle}
						className="rounded-full border border-white/15 p-2 text-white/45 transition-colors hover:border-white/25 hover:text-white"
						aria-pressed={isMuted}
						aria-label={isMuted ? 'Unmute Clara voice' : 'Mute Clara voice'}
						title={isMuted ? 'Unmute voice' : 'Mute voice'}
					>
						<SpeakerIcon muted={isMuted} />
					</button>

					<a
						href={GITHUB_REPO}
						target="_blank"
						rel="noopener noreferrer"
						className="rounded-full bg-[#7C3AED] px-5 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] transition hover:bg-[#6D28D9]"
					>
						Get Early Access
					</a>
				</nav>
			</div>
		</header>
	)
}
