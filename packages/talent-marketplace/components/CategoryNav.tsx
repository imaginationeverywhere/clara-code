import Link from "next/link";

const CATEGORIES = [
	{ slug: "productivity", label: "Productivity" },
	{ slug: "developer-tools", label: "Developer Tools" },
	{ slug: "data", label: "Data" },
	{ slug: "communication", label: "Communication" },
	{ slug: "other", label: "Other" },
];

export default function CategoryNav() {
	return (
		<nav className="px-6 py-4 border-b border-border">
			<div className="max-w-7xl mx-auto flex gap-4 overflow-x-auto">
				{CATEGORIES.map((cat) => (
					<Link
						key={cat.slug}
						href={`/categories/${cat.slug}`}
						className="text-sm text-muted hover:text-white whitespace-nowrap transition px-3 py-1 rounded-full hover:bg-bg-elevated"
					>
						{cat.label}
					</Link>
				))}
			</div>
		</nav>
	);
}
