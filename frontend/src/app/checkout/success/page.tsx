import Link from 'next/link'
import { Header } from '@/components/marketing/Header'

export const runtime = 'edge'

export default async function CheckoutSuccessPage({
	searchParams,
}: {
	searchParams: Promise<{ plan?: string; session_id?: string }>
}) {
	const { plan, session_id: sessionId } = await searchParams

	return (
		<div className="min-h-screen bg-[#0D1117] text-white">
			<Header />
			<div className="mx-auto max-w-lg px-6 pb-24 pt-28 text-center">
				<h1 className="text-3xl font-bold text-[#10B981]">You&apos;re in.</h1>
				<p className="mt-4 text-white/55">
					Plan: {plan ?? 'unknown'}
					{sessionId ? ` · session ${sessionId.slice(0, 12)}…` : null}
				</p>
				<p className="mt-8">
					<Link href="/" className="text-sm text-[#7BCDD8] hover:underline">
						← Home
					</Link>
				</p>
			</div>
		</div>
	)
}
