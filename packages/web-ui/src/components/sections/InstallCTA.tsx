'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type Tab = 'npm' | 'pnpm' | 'brew' | 'vscode'

const snippets: Record<Tab, string> = {
  npm: 'npx install claracode@latest\nclara',
  pnpm: 'pnpm dlx install claracode@latest\nclara',
  brew: 'brew install claracode && clara',
  vscode: 'Search “Clara Code” in the VS Code marketplace (link coming soon).',
}

const VS_MARKETPLACE = 'https://marketplace.visualstudio.com/'

export function InstallCTA() {
  const [tab, setTab] = useState<Tab>('npm')

  return (
    <section className="border-t border-white/5 bg-[#07070c] py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-semibold text-white sm:text-3xl">Install</h2>
        <p className="mt-2 text-center text-white/50">Pick your package manager or grab the extension.</p>

        <div className="mt-8 overflow-hidden rounded-xl border border-white/10 bg-[#0a0a12] shadow-card">
          <div className="flex flex-wrap gap-1 border-b border-white/5 p-2">
            {(['npm', 'pnpm', 'brew', 'vscode'] as const).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition sm:text-sm',
                  tab === id ? 'bg-white/10 text-white' : 'text-white/45 hover:bg-white/5 hover:text-white',
                )}
              >
                {id === 'vscode' ? 'VS Code' : id}
              </button>
            ))}
          </div>
          <div className="p-4 sm:p-6">
            {tab === 'vscode' ? (
              <div className="space-y-4">
                <p className="text-sm text-white/60">{snippets.vscode}</p>
                <a
                  href={VS_MARKETPLACE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-lg bg-clara-blue px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
                >
                  Open Marketplace
                </a>
              </div>
            ) : (
              <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-emerald-300/90">
                {snippets[tab]}
              </pre>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
