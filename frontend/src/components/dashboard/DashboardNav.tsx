'use client'

import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

export function DashboardNav() {
  return (
    <div className="mx-auto mb-8 flex max-w-4xl items-center justify-between">
      <Link href="/" className="text-sm text-white/50 hover:text-white">
        claracode.ai
      </Link>
      <UserButton />
    </div>
  )
}
