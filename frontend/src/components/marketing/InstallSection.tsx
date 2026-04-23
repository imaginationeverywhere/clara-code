'use client'

import { useState } from 'react'
import {
	IconCheckCircle,
	IconCopy,
	IconGithub,
	IconMonitor,
	IconTerminal,
} from '@/components/marketing/icons'

const GITHUB_REPO = 'https://github.com/imaginationeverywhere/clara-code'

const NPM_GLOBAL = 'npm install -g clara@latest'

const DMG_HREF = process.env.NEXT_PUBLIC_CLARA_DESKTOP_DMG_URL?.trim() ?? ''

export function InstallSection() {
	const [copied, setCopied] = useState(false)
	const [copiedNpm, setCopiedNpm] = useState(false)
	const betaCmd = 'npx github:imaginationeverywhere/clara-code'

	const handleCopy = () => {
		void navigator.clipboard.writeText(betaCmd)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	const handleCopyNpm = () => {
		void navigator.clipboard.writeText(NPM_GLOBAL)
		setCopiedNpm(true)
		setTimeout(() => setCopiedNpm(false), 2000)
	}

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
							<div className="border-b border-white/[0.06] px-5 py-4">
								<div className="mb-3 font-mono text-[11px] uppercase tracking-wider text-white/30">npm (global)</div>
								<div className="mb-2 font-mono text-sm text-white/40">
									<span className="text-white/25"># </span>npm install -g clara@latest
									<p className="mt-1 text-[12px] text-white/30">After install, run: clara (default voice) or clara tui (full TUI)</p>
								</div>
								<div className="mt-2 flex items-center justify-between">
									<span className="font-mono text-sm text-white/25">Node.js 20+ recommended</span>
									<button
										type="button"
										onClick={handleCopyNpm}
										className="flex shrink-0 items-center gap-1.5 font-mono text-[12px] text-white/45 transition-colors hover:text-clara"
									>
										{copiedNpm ? (
											<>
												<IconCheckCircle className="h-4 w-4 text-brand-green" />
												<span className="text-brand-green">Copied</span>
											</>
										) : (
											<>
												<IconCopy className="h-4 w-4" />
												Copy install
											</>
										)}
									</button>
								</div>
							</div>

							<div className="px-5 py-4">
								<div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-white/30">Beta from Git (no global)</div>
								<div className="flex items-center justify-between">
									<div className="font-mono text-sm">
										<span className="text-white/25">$ </span>
										<span className="text-brand-green">{betaCmd}</span>
									</div>
									<button
										type="button"
										onClick={handleCopy}
										className="ml-3 flex shrink-0 items-center gap-1.5 transition-colors"
									>
										{copied ? (
											<>
												<IconCheckCircle className="h-4 w-4 text-brand-green" />
												<span className="font-mono text-[12px] text-brand-green">Copied!</span>
											</>
										) : (
											<>
												<IconCopy className="h-4 w-4 text-white/35 hover:text-white/60" />
												<span className="font-mono text-[12px] text-white/35 hover:text-white/60">Copy</span>
											</>
										)}
									</button>
								</div>
							</div>

							<div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3">
								<span className="font-mono text-[11px] text-white/25">Package: clara</span>
								<a
									href={GITHUB_REPO}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-1 font-mono text-[11px] text-clara hover:underline"
								>
									<IconGithub className="h-3 w-3" />
									Star us on GitHub →
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
								<div className="mb-4 flex items-center gap-2">
									<span className="text-[15px] font-semibold text-white">Clara Code IDE</span>
									{DMG_HREF ? null : (
										<span className="rounded-full border border-brand-purple/30 bg-brand-purple/20 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-brand-purple">
											Download soon
										</span>
									)}
								</div>

								{DMG_HREF ? (
									<a
										href={DMG_HREF}
										download
										className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-purple py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-colors hover:bg-brand-purple-hover"
									>
										<IconMonitor className="h-4 w-4" />
										Download for macOS (.dmg)
									</a>
								) : null}
								<a
									href={GITHUB_REPO}
									target="_blank"
									rel="noopener noreferrer"
									className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-white/80 transition-colors hover:border-white/20 hover:text-white"
								>
									<IconGithub className="h-4 w-4" />
									{DMG_HREF ? 'View source' : 'View on GitHub'}
								</a>
								<div className="mt-2 text-center font-mono text-[11px] text-white/30">
									{DMG_HREF
										? 'Mount the .dmg, drag the app to Applications, then open from the dock or Spotlight'
										: 'CI publishes a .dmg; this button appears once the public download URL is set for the build'}
								</div>
							</div>

							<div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3">
								<span className="font-mono text-[11px] text-white/25">MIT Licensed · Open Source</span>
								<a
									href={GITHUB_REPO}
									target="_blank"
									rel="noopener noreferrer"
									className="font-mono text-[11px] text-clara hover:underline"
								>
									View on GitHub →
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
