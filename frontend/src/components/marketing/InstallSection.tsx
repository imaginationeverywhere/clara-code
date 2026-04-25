'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IconGithub, IconMonitor, IconTerminal } from '@/components/marketing/icons'
import { InstallCommandCopyButton } from '@/components/marketing/InstallCommandCopyButton'
import { MARKETING_GITHUB_REPO } from '@/lib/marketing-install-constants'

const DMG_HREF = process.env.NEXT_PUBLIC_CLARA_DESKTOP_DMG_URL?.trim() ?? ''

const RELEASES = 'https://github.com/imaginationeverywhere/clara-code/releases/latest'

export function InstallSection() {
	const [activeTab, setActiveTab] = useState<'npm' | 'pnpm' | 'brew'>('npm')

	const commands = {
		npm: 'npm install -g claracode',
		pnpm: 'pnpm add -g claracode',
		brew: 'brew install claracode',
	} as const
	const line = commands[activeTab]

	return (
		<section id="install" className="bg-bg-sunken py-24">
			<div className="mx-auto max-w-3xl px-6 text-center">
				<div className="mb-12">
					<div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/30">Get started</div>
					<h2 className="mt-3 text-[32px] font-bold tracking-tight text-white md:text-[40px]">Two ways in.</h2>
					<p className="mt-3 font-mono text-[17px] text-white/45">CLI for terminal purists. IDE for everyone else.</p>
				</div>

				<div className="grid grid-cols-1 gap-6 text-left md:grid-cols-2">
					<div>
						<div className="mb-4 flex items-center gap-2">
							<IconTerminal className="h-4 w-4 text-clara" />
							<span className="font-mono text-[13px] font-semibold text-white">Command Line</span>
							<span className="font-mono text-[13px] text-white/30">· for terminal purists</span>
						</div>

						<div className="overflow-hidden rounded-xl border border-white/[0.08] bg-bg-sunken">
							<div className="px-5 py-4">
								<div className="mb-0 font-mono text-[11px] uppercase tracking-wider text-white/30">Install</div>
								<div className="mt-3">
									<div className="mb-3 flex gap-1 border-b border-white/10">
										{(['npm', 'pnpm', 'brew'] as const).map((tab) => (
											<button
												key={tab}
												type="button"
												onClick={() => setActiveTab(tab)}
												className={`px-3 py-1.5 font-mono text-xs transition-colors ${
													activeTab === tab
														? 'border-b-2 border-[#7BC8D8] -mb-px text-[#7BC8D8]'
														: 'text-white/40 hover:text-white/60'
												}`}
											>
												{tab}
											</button>
										))}
									</div>
									<div className="flex items-center justify-between gap-3 rounded-lg bg-[#070A0F] px-4 py-3">
										<code className="min-w-0 break-all font-mono text-sm text-white/90">{line}</code>
										<InstallCommandCopyButton text={line} />
									</div>
									<p className="mt-2 text-xs text-white/30">
										Node.js 20+ required ·{' '}
										<Link href="/docs" className="text-[#7BC8D8] hover:underline">
											docs →
										</Link>
									</p>
								</div>
							</div>

							<div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3">
								<span className="font-mono text-[11px] text-white/25">Package: claracode</span>
								<a
									href={MARKETING_GITHUB_REPO}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-1 font-mono text-[11px] text-clara hover:underline"
								>
									<IconGithub className="h-3 w-3" />
									Star us on GitHub &rarr;
								</a>
							</div>
						</div>
					</div>

					<div>
						<div className="mb-4 flex items-center gap-2">
							<IconMonitor className="h-4 w-4 text-brand-purple" />
							<span className="font-mono text-[13px] font-semibold text-white">Desktop IDE</span>
							<span className="font-mono text-[13px] text-white/30">· VS Code, voice-first</span>
						</div>

						<div className="overflow-hidden rounded-xl border border-white/[0.08] bg-bg-overlay">
							<div className="p-5">
								<div className="mb-4 flex flex-wrap items-center gap-2">
									<span className="text-[15px] font-semibold text-white">Clara Code IDE</span>
									<span className="font-mono text-xs text-white/30">v1.0.0 · Stable</span>
								</div>

								{DMG_HREF ? (
									<a
										href={DMG_HREF}
										download
										className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#7C3AED] py-3 text-sm font-medium text-white transition-colors hover:bg-[#6D28D9]"
									>
										<svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
											<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
										</svg>
										Download for macOS
									</a>
								) : (
									<a
										href={RELEASES}
										target="_blank"
										rel="noopener noreferrer"
										className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#7C3AED] py-3 text-sm font-medium text-white transition-colors hover:bg-[#6D28D9]"
									>
										<svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
											<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
										</svg>
										Download for macOS
									</a>
								)}
								<p className="mt-1 text-center text-xs text-white/30">Universal Binary · Apple Silicon + Intel</p>

								<div className="mt-4 flex gap-3">
									{[
										{ label: 'Linux', ext: '.AppImage', href: RELEASES },
										{ label: 'Windows', ext: '.exe', href: RELEASES },
										{ label: 'Source', ext: '', href: MARKETING_GITHUB_REPO },
									].map(({ label, ext, href }) => (
										<a
											key={label}
											href={href}
											target="_blank"
											rel="noopener noreferrer"
											className="flex-1 rounded-lg border border-white/10 py-2 text-center text-xs text-white/40 transition-colors hover:border-white/20 hover:text-white/70"
										>
											{label}
											{ext ? <span className="text-white/20"> {ext}</span> : null}
										</a>
									))}
								</div>
							</div>

							<div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3">
								<span className="font-mono text-[11px] text-white/25">MIT Licensed · Open Source</span>
								<a
									href={MARKETING_GITHUB_REPO}
									target="_blank"
									rel="noopener noreferrer"
									className="font-mono text-[11px] text-clara hover:underline"
								>
									View on GitHub &rarr;
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
