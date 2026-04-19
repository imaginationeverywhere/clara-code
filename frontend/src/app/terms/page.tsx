import Link from "next/link";
import { Footer } from "@/components/marketing/Footer";
import { Header } from "@/components/marketing/Header";

const LAST_UPDATED = "April 19, 2026";

export default function TermsPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-body">
			<Header />
			<main className="mx-auto max-w-3xl px-6 py-24 pt-28">
				<h1 className="text-3xl font-semibold text-text-primary">Terms of Service</h1>
				<p className="mt-2 text-sm text-text-muted">Last updated: {LAST_UPDATED}</p>

				<section className="mt-10 space-y-4">
					<h2 className="text-xl font-semibold text-text-primary">Service</h2>
					<p>
						Clara Code is a voice-first AI coding assistant, available through the web app, CLI, IDE-related
						workflows, and related surfaces we provide. Features may change as we improve the product.
					</p>
				</section>

				<section className="mt-10 space-y-4">
					<h2 className="text-xl font-semibold text-text-primary">Subscriptions and plans</h2>
					<ul className="list-disc space-y-2 pl-5">
						<li>
							<strong className="text-text-secondary">Free</strong> — limited API usage per month and feature
							limits as published in the product.
						</li>
						<li>
							<strong className="text-text-secondary">Pro ($49/month)</strong> — expanded voice and API limits
							for individual use.
						</li>
						<li>
							<strong className="text-text-secondary">Business ($99/month)</strong> — team-oriented features and
							priority support as described at checkout and in-product.
						</li>
						<li>
							<strong className="text-text-secondary">Developer Program ($99/year)</strong> — participation in
							the Clara talent marketplace and related benefits, subject to separate program terms where
							applicable.
						</li>
					</ul>
					<p>API access and usage limits depend on your active subscription tier.</p>
				</section>

				<section className="mt-10 space-y-4">
					<h2 className="text-xl font-semibold text-text-primary">Acceptable use</h2>
					<ul className="list-disc space-y-2 pl-5">
						<li>You must not use Clara Code to generate malware, conduct attacks, or violate applicable law.</li>
						<li>You must not circumvent authentication, rate limits, or billing controls.</li>
						<li>You must not reverse engineer or redistribute the Clara API or desktop components except as allowed by applicable open-source licenses for components we publish under those licenses.</li>
					</ul>
				</section>

				<section className="mt-10 space-y-4">
					<h2 className="text-xl font-semibold text-text-primary">Intellectual property</h2>
					<p>
						Clara Code and the platform (Imagination Everywhere Inc.) retain rights in the service, branding, and
						software we provide. You retain ownership of your code and content you create; you are responsible for
						how you use model output.
					</p>
				</section>

				<section className="mt-10 space-y-4">
					<h2 className="text-xl font-semibold text-text-primary">Developer Program</h2>
					<p>
						Talent listings and submissions may be reviewed before publication. We may reject or remove listings
						that violate policies. Pricing for marketplace offerings is set by developers where applicable, with
						platform fees as disclosed in the program.
					</p>
				</section>

				<section className="mt-10 space-y-4">
					<h2 className="text-xl font-semibold text-text-primary">Suspension and termination</h2>
					<p>
						We may suspend or terminate access for violations of these terms, risk to the service, or as required by
						law.
					</p>
				</section>

				<section className="mt-10 space-y-4">
					<h2 className="text-xl font-semibold text-text-primary">Disclaimer</h2>
					<p>
						AI-generated suggestions may be incorrect or incomplete. You are responsible for reviewing and testing
						code before production use.
					</p>
				</section>

				<section className="mt-10 space-y-4">
					<h2 className="text-xl font-semibold text-text-primary">Governing law</h2>
					<p>These terms are governed by the laws of the State of Delaware, USA, without regard to conflict-of-law rules.</p>
				</section>

				<section className="mt-10 space-y-4">
					<h2 className="text-xl font-semibold text-text-primary">Contact</h2>
					<p>
						<a href="mailto:legal@claracode.ai" className="text-clara hover:underline">
							legal@claracode.ai
						</a>
					</p>
				</section>

				<p className="mt-12 text-sm text-text-muted">
					<Link href="/privacy" className="text-clara hover:underline">
						Privacy Policy
					</Link>
				</p>
			</main>
			<Footer />
		</div>
	);
}
