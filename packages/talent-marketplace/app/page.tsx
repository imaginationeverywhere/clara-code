import CategoryNav from "@/components/CategoryNav";
import TalentCard from "@/components/TalentCard";
import { listTalents } from "@/lib/api";

export default async function Home() {
	const talents = await listTalents();
	const featured = talents.slice(0, 6);

	return (
		<main className="min-h-screen bg-bg text-white">
			<section className="px-6 py-20 text-center max-w-4xl mx-auto">
				<h1 className="text-5xl font-bold mb-4">The Clara Talent Agency</h1>
				<p className="text-xl text-muted mb-8">
					Voice-native capabilities for your Clara agents. Install once, speak naturally.
				</p>
				<a
					href="#browse"
					className="bg-purple hover:bg-purple-light px-8 py-3 rounded-lg font-medium transition"
				>
					Browse Talents
				</a>
			</section>

			<CategoryNav />

			<section id="browse" className="px-6 py-12 max-w-7xl mx-auto">
				<h2 className="text-2xl font-semibold mb-8">Featured Talents</h2>
				{talents.length === 0 ? (
					<p className="text-muted">No Talents available yet. Check back soon.</p>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{featured.map((talent) => (
							<TalentCard key={talent.id} talent={talent} />
						))}
					</div>
				)}
			</section>
		</main>
	);
}
