import Link from 'next/link'

export function SubscriptionSection({ planLabel }: { planLabel: string }) {
	return (
		<section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
			<h2 className="text-lg font-semibold text-white">Subscription</h2>
			<p className="text-sm text-white/60">
				Current plan: <span className="font-medium text-white">{planLabel}</span>
			</p>
			<p className="text-xs text-white/40">Billing dates and invoices will appear when Stripe is connected.</p>
			<Link
				href="/checkout/pro"
				className="inline-block rounded-lg border border-white/15 px-4 py-2 text-sm text-clara hover:bg-white/5"
			>
				Manage billing (placeholder)
			</Link>
		</section>
	)
}
