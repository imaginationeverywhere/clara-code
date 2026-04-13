export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { Header } from '@/components/marketing/Header'


export default function CheckoutProPage() {
	return (
		<div className="min-h-screen bg-[#0D1117] text-white">
			<Header />
			<div className="mx-auto max-w-lg px-6 pb-24 pt-28 text-center">
				<h1 className="text-3xl font-bold">Checkout — Pro</h1>
				<p className="mt-4 text-white/55">
					Embedded Stripe checkout (Elements) will mount here once billing keys are configured.
				</p>
				<p className="mt-8">
					<Link href="/#pricing" className="text-sm text-[#7BCDD8] hover:underline">
						← Pricing
					</Link>
				</p>
			</div>
		</div>
	)
}
