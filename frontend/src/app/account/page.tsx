import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AccountPageClient } from './AccountPageClient'

export default async function AccountPage() {
  const user = await currentUser()
  if (!user) {
    redirect('/sign-in')
  }

  const email = user.emailAddresses[0]?.emailAddress ?? ''
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || email || 'Account'

  return (
    <main className="min-h-screen bg-bg-base p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <AccountPageClient
          email={email}
          imageUrl={user.imageUrl}
          displayName={displayName}
        />
      </div>
    </main>
  )
}
