import Link from 'next/link'

const GITHUB = 'https://github.com/imaginationeverywhere/clara-code'

export function Footer() {
	return (
		<footer className="border-t border-white/5 bg-bg-base py-10 text-center">
			<p className="text-sm text-white/35">
				© {new Date().getFullYear()} Clara Code · Open source ·{' '}
				<a href={GITHUB} className="text-clara hover:underline">
					GitHub
				</a>
				{' · '}
				<Link href="/docs" className="text-clara hover:underline">
					Docs
				</Link>
				{' · '}
				<Link href="/privacy" className="text-sm text-text-muted hover:text-text-secondary">
					Privacy
				</Link>
				{' · '}
				<Link href="/terms" className="text-sm text-text-muted hover:text-text-secondary">
					Terms
				</Link>
			</p>
		</footer>
	)
}
