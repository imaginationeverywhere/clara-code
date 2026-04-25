import Image from 'next/image'
import Link from 'next/link'
import { ClaraVoiceGreeting } from '@/components/marketing/ClaraVoiceGreeting'
import { HeroPrimaryCta } from '@/components/analytics/HeroPrimaryCta'

const WAVE_HEIGHTS_PX = [8, 14, 22, 28, 24, 18, 28, 20, 12, 26, 22, 16, 10, 24, 18, 12]

export function HeroSection() {
	return (
		<section className="relative overflow-hidden bg-[#0D1117] pb-20 pt-28 md:pt-36">
			{/* Dot grid */}
			<div
				className="pointer-events-none absolute inset-0 -z-0"
				style={{
					backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.08) 1.5px, transparent 1.5px)`,
					backgroundSize: '28px 28px',
				}}
				aria-hidden
			/>
			<div
				className="pointer-events-none absolute left-1/2 top-24 -z-0 h-[420px] w-[600px] -translate-x-1/2 bg-[#7C3AED]/15 blur-[100px]"
				aria-hidden
			/>
			<div
				className="pointer-events-none absolute bottom-0 right-0 -z-0 h-[400px] w-[400px]"
				style={{
					background: 'radial-gradient(circle at 80% 80%, rgba(79,142,247,0.12) 0%, transparent 70%)',
				}}
				aria-hidden
			/>
			<div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
				<div className="mb-6 inline-flex items-center rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/8 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.15em] text-[#7C3AED]">
					Now in Beta
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
					<HeroPrimaryCta />
					<a
						href="https://github.com/imaginationeverywhere/clara-code"
						target="_blank"
						rel="noopener noreferrer"
						className="rounded-full border border-white/15 px-8 py-4 text-[15px] text-white/70 transition hover:border-white/25 hover:text-white"
					>
						Star on GitHub
					</a>
				</div>

				<div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
					<ClaraVoiceGreeting />
					<span className="text-center text-xs text-white/20">No account needed to hear Clara</span>
				</div>

				<div className="mt-6 flex items-center justify-center gap-3">
					<div className="flex -space-x-2">
						{[1, 2, 3, 4, 5].map((i) => (
							<div
								key={i}
								className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0D1117] bg-gradient-to-br from-[#7C3AED] to-[#4F8EF7] text-xs font-bold text-white"
							>
								{['A', 'B', 'C', 'D', 'E'][i - 1]}
							</div>
						))}
					</div>
					<p className="text-sm text-white/50">
						Trusted by <span className="font-medium text-white/80">2,400+ developers</span>
					</p>
				</div>

				<p className="mt-4 text-[12px] text-white/25">Free forever · Open source · MIT licensed</p>

				<div className="mx-auto mt-14 max-w-md rounded-2xl border border-white/8 bg-[#0A0E14] p-6">
					<div className="flex items-end justify-center gap-1">
						{WAVE_HEIGHTS_PX.map((h, i) => (
							<div
								key={i}
								className="w-1 rounded-full bg-[#7C3AED] waveform-bar"
								style={{ height: `${h}px` }}
							/>
						))}
					</div>
					<p className="mt-3 font-mono text-xs text-[#22C55E]">
						▶ &apos;Add a loading skeleton to the dashboard&apos;
					</p>
				</div>
			</div>
		</section>
	)
}
