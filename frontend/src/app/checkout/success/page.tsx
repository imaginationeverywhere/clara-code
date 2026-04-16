import Link from "next/link";
import { Header } from "@/components/marketing/Header";

export const dynamic = "force-dynamic";

export default function CheckoutSuccessPage() {
	return (
		<div className="min-h-screen bg-bg-base text-white">
			<Header />
			<div className="mx-auto max-w-lg px-6 pb-24 pt-28 text-center">
				<h1 className="text-3xl font-bold">You&apos;re in.</h1>
				<p className="mt-4 text-text-secondary">
					Your Clara Code subscription is active. Your API key is ready in the dashboard.
				</p>
				<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
					<Link
						href="/dashboard"
						className="rounded-lg bg-clara px-6 py-3 text-sm font-semibold text-white hover:bg-clara/90"
					>
						Go to Dashboard
					</Link>
					<Link
						href="/docs"
						className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-text-secondary hover:border-border-hover"
					>
						Read the Docs
					</Link>
				</div>
			</div>
		</div>
	);
}
