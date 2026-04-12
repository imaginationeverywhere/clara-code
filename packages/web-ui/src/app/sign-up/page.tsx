import Link from 'next/link'
import { Header } from '@/components/marketing/Header'

export default function SignUpPage() {
	return (
		<div className="min-h-screen bg-[#0D1117] text-white">
			<Header />
			<div className="mx-auto max-w-lg px-6 pb-24 pt-28 text-center">
				<h1 className="text-3xl font-bold">Create an account</h1>
				<p className="mt-4 text-white/55">
					Clerk-powered sign-up will mount here. For now, track progress on{' '}
					<a
						href="https://github.com/imaginationeverywhere/clara-code"
						className="text-[#7BCDD8] hover:underline"
					>
						GitHub
					</a>
					.
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
