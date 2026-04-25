'use client'

import Link from 'next/link'
import { IconGithub } from '@/components/marketing/icons'

const GITHUB_REPO = 'https://github.com/imaginationeverywhere/clara-code'

export function Header() {
	return (
		<header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#0D1117]/85 backdrop-blur-md">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
				<Link href="/" className="flex items-center gap-0.5">
					<span className="text-lg font-bold tracking-tight text-white">Clara</span>
					<span className="font-mono text-lg font-bold tracking-tight text-brand-blue">Code</span>
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

					<a
						href={GITHUB_REPO}
						target="_blank"
						rel="noopener noreferrer"
						className="rounded-full bg-brand-purple px-5 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] transition hover:bg-brand-purple-hover"
					>
						Get Early Access
					</a>
				</nav>
			</div>
		</header>
	)
}
