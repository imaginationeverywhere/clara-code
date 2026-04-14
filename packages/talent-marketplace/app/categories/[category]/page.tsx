import TalentCard from "@/components/TalentCard";
import { listTalents } from "@/lib/api";

const VALID_CATEGORIES = ["productivity", "data", "communication", "developer-tools", "other"];

interface Props {
	params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: Props) {
	const { category } = await params;
	if (!VALID_CATEGORIES.includes(category)) {
		return (
			<main className="min-h-screen bg-bg text-white px-6 py-16 text-center">
				<p className="text-muted">Category not found.</p>
			</main>
		);
	}

	const talents = await listTalents(category);
	const title = category.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());

	return (
		<main className="min-h-screen bg-bg text-white">
			<div className="max-w-7xl mx-auto px-6 py-16">
				<h1 className="text-3xl font-bold mb-8">{title}</h1>
				{talents.length === 0 ? (
					<p className="text-muted">No Talents in this category yet.</p>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{talents.map((talent) => (
							<TalentCard key={talent.id} talent={talent} />
						))}
					</div>
				)}
			</div>
		</main>
	);
}
