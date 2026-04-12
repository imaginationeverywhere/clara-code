import Link from 'next/link'

const GITHUB = 'https://github.com/imaginationeverywhere/clara-code'

export function Footer() {
	return (
		<footer className="border-t border-white/5 bg-[#0D1117] py-10 text-center">
			<p className="text-sm text-white/35">
				© {new Date().getFullYear()} Clara Code · Open source ·{' '}
				<a href={GITHUB} className="text-[#7BCDD8] hover:underline">
					GitHub
				</a>
				{' · '}
				<Link href="/docs" className="text-[#7BCDD8] hover:underline">
					Docs
				</Link>
			</p>
		</footer>
	)
}
