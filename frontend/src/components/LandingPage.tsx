'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { VoiceButton } from '@/components/VoiceButton'

const FEATURES = [
  {
    title: 'Voice-first coding',
    description: 'Speak naturally; Clara turns intent into edits, tests, and refactors alongside your editor.',
  },
  {
    title: 'Multi-agent swarms',
    description: 'Spin up specialized agents for review, docs, and infra — coordinated, not chaotic.',
  },
  {
    title: 'Memory vault',
    description: 'Project context that persists across sessions so you never re-explain the stack.',
  },
  {
    title: 'Desktop + mobile',
    description: 'Same brain on your machine and on the go — pick up where you left off.',
  },
] as const

export function LandingPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [waitlistMessage, setWaitlistMessage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const installCommand = 'npx create-clara-app'

  async function submitWaitlist(e: FormEvent) {
    e.preventDefault()
    setWaitlistStatus('loading')
    setWaitlistMessage(null)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })
      const data = (await res.json()) as { success?: boolean; error?: string }
      if (!res.ok || !data.success) {
        setWaitlistStatus('error')
        setWaitlistMessage(data.error ?? 'Something went wrong')
        return
      }
      setWaitlistStatus('done')
      setWaitlistMessage("You're on the list. We'll be in touch.")
      setEmail('')
      setName('')
    } catch {
      setWaitlistStatus('error')
      setWaitlistMessage('Network error — try again.')
    }
  }

  async function copyInstall() {
    try {
      await navigator.clipboard.writeText(installCommand)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <header className="border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight text-clara">Clara Code</span>
          <nav className="flex items-center gap-6 text-sm text-white/70">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#install" className="hover:text-white">
              Install
            </a>
            <a href="#pricing" className="hover:text-white">
              Pricing
            </a>
            <Link href="/dashboard" className="rounded-lg px-3 py-1.5 text-clara hover:bg-white/5">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59,130,246,0.35), transparent)',
            }}
          />
          <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pb-24 pt-20 text-center md:pt-28">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-clara/90">
              claracode.ai
            </p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Clara Code — The AI that codes with you
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/60">
              Voice-first pair programming with memory, swarms, and a workflow that feels like your
              team — without the calendar Tetris.
            </p>
            <div className="mt-10">
              <VoiceButton />
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-2xl font-semibold md:text-3xl">Built for how you ship</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-white/55">
            Everything in one loop: talk, plan, generate, and verify — tuned for real repos.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl transition hover:border-clara/30"
              >
                <h3 className="text-lg font-semibold text-clara">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="install" className="border-y border-white/10 bg-white/[0.02] py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-2xl font-semibold md:text-3xl">Install</h2>
            <p className="mt-2 text-white/55">CLI scaffold — npm package listing coming soon.</p>
            <div className="mt-8 flex max-w-2xl flex-col gap-4">
              <div className="flex flex-wrap items-stretch gap-3 rounded-xl border border-white/10 bg-[#0f0f10] p-4 font-mono text-sm md:items-center">
                <code className="min-w-0 flex-1 break-all text-clara">{installCommand}</code>
                <button
                  type="button"
                  onClick={() => void copyInstall()}
                  className="shrink-0 rounded-lg bg-clara px-4 py-2 text-xs font-semibold text-white hover:bg-clara/90"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-2xl font-semibold md:text-3xl">Pricing</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-white/55">
            Start free. Scale when voice and reasoning tasks become your default.
          </p>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <h3 className="text-lg font-semibold">Free</h3>
              <p className="mt-4 text-3xl font-bold">$0</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-white/65">
                <li>Conversations unlimited</li>
                <li>1 reasoning task</li>
              </ul>
            </div>
            <div className="relative flex flex-col rounded-2xl border-2 border-clara bg-clara/5 p-8 shadow-lg shadow-clara/10">
              <span className="absolute right-4 top-4 rounded-full bg-clara px-2 py-0.5 text-xs font-medium text-white">
                Popular
              </span>
              <h3 className="text-lg font-semibold">Pro</h3>
              <p className="mt-4 text-3xl font-bold">
                $29<span className="text-lg font-normal text-white/50">/mo</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-white/65">
                <li>50 reasoning tasks</li>
                <li>Priority voice routing</li>
              </ul>
            </div>
            <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <h3 className="text-lg font-semibold">Business</h3>
              <p className="mt-4 text-3xl font-bold">
                $99<span className="text-lg font-normal text-white/50">/mo</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-white/65">
                <li>Unlimited reasoning tasks</li>
                <li>Org controls &amp; audit (roadmap)</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-gradient-to-b from-clara/10 to-transparent py-20">
          <div className="mx-auto max-w-lg px-6 text-center">
            <h2 className="text-2xl font-semibold">Join the waitlist</h2>
            <p className="mt-2 text-sm text-white/55">Early access for teams who want Clara in their repo.</p>
            <form onSubmit={(e) => void submitWaitlist(e)} className="mt-8 space-y-4 text-left">
              <div>
                <label htmlFor="waitlist-name" className="block text-xs font-medium text-white/50">
                  Name
                </label>
                <input
                  id="waitlist-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm outline-none ring-clara/50 focus:ring-2"
                  placeholder="Ada Lovelace"
                  autoComplete="name"
                />
              </div>
              <div>
                <label htmlFor="waitlist-email" className="block text-xs font-medium text-white/50">
                  Email
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm outline-none ring-clara/50 focus:ring-2"
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>
              <button
                type="submit"
                disabled={waitlistStatus === 'loading'}
                className="w-full rounded-lg bg-clara py-3 text-sm font-semibold text-white transition hover:bg-clara/90 disabled:opacity-60"
              >
                {waitlistStatus === 'loading' ? 'Submitting…' : 'Join the waitlist'}
              </button>
              {waitlistMessage ? (
                <p
                  className={
                    waitlistStatus === 'error' ? 'text-center text-sm text-red-400' : 'text-center text-sm text-emerald-400'
                  }
                >
                  {waitlistMessage}
                </p>
              ) : null}
            </form>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-white/40">
        Clara Code — The AI that codes with you
      </footer>
    </div>
  )
}
