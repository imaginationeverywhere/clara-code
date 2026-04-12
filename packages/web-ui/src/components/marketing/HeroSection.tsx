import Image from 'next/image'
import Link from 'next/link'
import { VoiceGreeting } from '@/app/(marketing)/components/VoiceGreeting'

const WAVE_HEIGHTS_PX = [8, 14, 22, 28, 24, 18, 28, 20, 12, 26, 22, 16, 10, 24, 18, 12]

export function HeroSection() {
	return (
		<section className="relative overflow-hidden bg-[#0D1117] pb-20 pt-28 md:pt-36">
			<div className="pointer-events-none absolute left-1/2 top-24 -z-0 h-[420px] w-[600px] -translate-x-1/2 bg-[#7C3AED]/15 blur-[100px]" aria-hidden />
			<div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
				<div className="mb-6 inline-flex items-center rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/8 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.15em] text-[#7C3AED]">
					Open source · MIT licensed
				</div>

				<div className="mx-auto mb-10 flex justify-center">
					<Image
						src="/logo-hero.png"
						alt="Clara Code"
						width={160}
						height={160}
						className="h-28 w-auto md:h-36"
						priority
					/>
				</div>

				<h1 className="text-[2.75rem] font-bold leading-none tracking-tight text-white md:text-[64px]">
					<span className="block">Your voice.</span>
					<span className="block">Your code.</span>
				</h1>

				<p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-white/55">
					Hold the mic. Say what you want built. Clara Code transcribes, interprets, and implements — while you
					think of the next thing.
				</p>

				<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
					<Link
						href="#install"
						className="rounded-full bg-[#7C3AED] px-8 py-4 text-[15px] font-semibold text-white shadow-[0_4px_30px_rgba(124,58,237,0.4)] transition hover:bg-[#6D28D9]"
					>
						Get started
					</Link>
					<a
						href="https://github.com/imaginationeverywhere/clara-code"
						target="_blank"
						rel="noopener noreferrer"
						className="rounded-full border border-white/15 px-8 py-4 text-[15px] text-white/70 transition hover:border-white/25 hover:text-white"
					>
						Star on GitHub
					</a>
				</div>

				<p className="mt-4 text-[12px] text-white/25">Free forever · Open source · MIT licensed</p>

				<div className="mx-auto mt-14 max-w-md rounded-2xl border border-white/8 bg-[#0A0E14] p-6">
					<VoiceGreeting />
					<div className="mt-8 flex items-end justify-center gap-1">
						{WAVE_HEIGHTS_PX.map((h, i) => (
							<div
								key={i}
								className="w-1 rounded-full bg-[#7C3AED] waveform-bar"
								style={{ height: `${h}px` }}
							/>
						))}
					</div>
					<p className="mt-3 font-mono text-xs text-[#10B981]">
						▶ &apos;Add a loading skeleton to the dashboard&apos;
					</p>
				</div>
			</div>
		</section>
	)
}
