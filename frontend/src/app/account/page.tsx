import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AccountHeader } from '@/components/account/AccountHeader'
import { DangerZone } from '@/components/account/DangerZone'
import { PersonalInfoSection } from '@/components/account/PersonalInfoSection'
import { SubscriptionSection } from '@/components/account/SubscriptionSection'
import type { PlanType } from '@/lib/apollo/operations'

export const dynamic = 'force-dynamic'

function planFromMetadata(raw: unknown): PlanType {
	if (raw === 'PRO' || raw === 'BUSINESS' || raw === 'FREE') return raw
	return 'FREE'
}

function planLabel(plan: PlanType): string {
	switch (plan) {
		case 'FREE':
			return 'Free'
		case 'PRO':
			return 'Pro'
		case 'BUSINESS':
			return 'Business'
		default:
			return 'Free'
	}
}

export default async function AccountPage() {
	const user = await currentUser()
	if (!user) redirect('/sign-in')

	const plan = planFromMetadata(user.publicMetadata?.plan)
	const label = planLabel(plan)

	return (
		<main className="min-h-screen bg-[#09090F] p-8">
			<div className="mx-auto max-w-2xl space-y-8">
				<div className="flex flex-wrap justify-between gap-4">
					<Link href="/dashboard" className="text-sm text-clara-blue hover:underline">
						Dashboard
					</Link>
					<div className="flex gap-4">
						<Link href="/api-keys" className="text-sm text-clara-blue hover:underline">
							API keys
						</Link>
						<Link href="/settings" className="text-sm text-clara-blue hover:underline">
							Settings
						</Link>
					</div>
				</div>

				<AccountHeader
					imageUrl={user.imageUrl}
					firstName={user.firstName}
					lastName={user.lastName}
					email={user.primaryEmailAddress?.emailAddress ?? ''}
					planLabel={label}
				/>
				<PersonalInfoSection />
				<SubscriptionSection planLabel={label} />
				<DangerZone />
			</div>
		</main>
	)
}
