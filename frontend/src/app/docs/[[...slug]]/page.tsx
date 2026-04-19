export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { Header } from '@/components/marketing/Header'


type DocsPageProps = {
	params: Promise<{ slug?: string[] }>
}

export default async function DocsPage({ params }: DocsPageProps) {
	const { slug } = await params
	const path = slug?.join('/') ?? ''

	return (
		<div className="min-h-screen bg-bg-base text-white">
			<Header />
			<div className="mx-auto max-w-3xl px-6 pb-24 pt-28">
				<p className="font-mono text-[12px] text-white/30">Docs {path ? `/ ${path}` : ''}</p>
				<h1 className="mt-4 text-4xl font-bold tracking-tight">Documentation</h1>
				<p className="mt-4 text-[17px] leading-relaxed text-white/55">
					Developer reference for Clara Code — CLI, SDK, and voice. Full MDX navigation will land in a follow-up
					pass.
				</p>
				<div className="mt-10 rounded-2xl border border-white/8 bg-bg-overlay p-6">
					<h2 className="text-lg font-semibold">Quick start</h2>
					<p className="mt-2 font-mono text-sm text-white/45">
						See the repository README and packages for installation.{' '}
						<a
							href="https://github.com/imaginationeverywhere/clara-code"
							className="text-clara hover:underline"
						>
							GitHub →
						</a>
					</p>
				</div>
				<p className="mt-8 text-center">
					<Link href="/" className="text-sm text-clara hover:underline">
						← Back home
					</Link>
				</p>
			</div>
		</div>
	)
}
