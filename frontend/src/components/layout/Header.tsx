'use client'

import Link from 'next/link'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { cn } from '@/lib/utils'

const GITHUB_URL = 'https://github.com/imaginationeverywhere/clara-code'

export function Header() {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-white/5 bg-[#09090F]/80 backdrop-blur-md',
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-white">
          Clara Code
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          <Link href="/docs" className="text-sm text-white/60 transition hover:text-white">
            Docs
          </Link>
          <Link href="/pricing" className="text-sm text-white/60 transition hover:text-white">
            Pricing
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/60 transition hover:text-white"
          >
            GitHub
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <SignInButton mode="modal">
            <button
              type="button"
              className="rounded-lg px-3 py-1.5 text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
            >
              Sign in
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button
              type="button"
              className="rounded-lg bg-clara-blue px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600"
            >
              Sign up
            </button>
          </SignUpButton>
        </div>
      </div>
    </header>
  )
}
