import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SettingsProfile } from '@/components/settings/SettingsProfile'

export const runtime = 'edge'

export default async function SettingsPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  return (
    <main className="min-h-screen bg-[#09090F] p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="mt-1 text-white/50">Plan and profile</p>
          </div>
          <Link href="/dashboard" className="text-sm text-clara-blue hover:underline">
            Dashboard
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="mb-4 text-sm text-white/50">
            Billing and plan changes will connect to Stripe in a later phase. For now, manage your
            profile below.
          </p>
          <div className="flex justify-center">
            <SettingsProfile />
          </div>
        </div>
      </div>
    </main>
  )
}
