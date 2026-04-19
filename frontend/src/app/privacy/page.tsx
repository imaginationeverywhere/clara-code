import Link from "next/link";
import { Footer } from "@/components/marketing/Footer";
import { Header } from "@/components/marketing/Header";

const LAST_UPDATED = "April 19, 2026";

export default function PrivacyPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-body">
			<Header />
			<main className="mx-auto max-w-3xl px-6 py-24 pt-28">
				<h1 className="text-3xl font-semibold text-text-primary">Privacy Policy</h1>
				<p className="mt-2 text-sm text-text-muted">Last updated: {LAST_UPDATED}</p>

				<section className="mt-10 space-y-4">
					<h2 className="text-xl font-semibold text-text-primary">What we collect</h2>
					<ul className="list-disc space-y-2 pl-5">
						<li>
							<strong className="text-text-secondary">Account information</strong> — name, email, and OAuth
							provider via Clerk for sign-in and account management.
						</li>
						<li>
							<strong className="text-text-secondary">Voice audio</strong> — sent to Clara&apos;s voice
							infrastructure for processing. Audio is handled ephemerally; we do not store voice recordings
							long-term and do not use your voice for model training.
						</li>
						<li>
							<strong className="text-text-secondary">API usage</strong> — request counts, subscription tier,
							and timestamps for billing, rate limiting, and abuse prevention.
						</li>
						<li>
							<strong className="text-text-secondary">Product telemetry</strong> — aggregated, anonymous usage
							and error metrics without personally identifying you.
						</li>
					</ul>
				</section>

				<section className="mt-10 space-y-4">
					<h2 className="text-xl font-semibold text-text-primary">How we use it</h2>
					<ul className="list-disc space-y-2 pl-5">
						<li>To provide the Clara Code service (voice-first AI coding assistant).</li>
						<li>To bill subscriptions through Stripe. Payment card data is processed by Stripe; Clara Code does not store full card numbers.</li>
						<li>To secure the service and detect fraud or misuse.</li>
					</ul>
				</section>

				<section className="mt-10 space-y-4">
					<h2 className="text-xl font-semibold text-text-primary">Sharing</h2>
					<p>
						We use service providers as needed to run the product: Clerk (authentication), Stripe (payments),
						and voice processing infrastructure for audio. We do not sell your personal information. We do not
						use advertising networks. Analytics beyond anonymous product telemetry is not used to profile you for
						ads.
					</p>
				</section>

				<section className="mt-10 space-y-4">
					<h2 className="text-xl font-semibold text-text-primary">Your rights</h2>
					<p>
						You may access, export, or delete your account data where applicable through your account settings,
						including account deletion from the{" "}
						<Link href="/account" className="text-clara hover:underline">
							/account
						</Link>{" "}
						area when signed in. For other privacy requests, contact{" "}
						<a href="mailto:legal@claracode.ai" className="text-clara hover:underline">
							legal@claracode.ai
						</a>
						.
					</p>
				</section>

				<section className="mt-10 space-y-4">
					<h2 className="text-xl font-semibold text-text-primary">Cookies</h2>
					<p>
						We use essential cookies (including Clerk session cookies) so you can stay signed in. Optional
						analytics may use cookies or similar technologies as described in our product settings and notices.
					</p>
				</section>

				<section className="mt-10 space-y-4">
					<h2 className="text-xl font-semibold text-text-primary">Contact</h2>
					<p>
						Questions about this policy:{" "}
						<a href="mailto:legal@claracode.ai" className="text-clara hover:underline">
							legal@claracode.ai
						</a>
					</p>
				</section>

				<p className="mt-12 text-sm text-text-muted">
					<Link href="/terms" className="text-clara hover:underline">
						Terms of Service
					</Link>
				</p>
			</main>
			<Footer />
		</div>
	);
}
