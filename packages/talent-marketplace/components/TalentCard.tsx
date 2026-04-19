import type { PublicTalent } from "@/lib/api";
import Link from "next/link";

export default function TalentCard({ talent }: { talent: PublicTalent }) {
	return (
		<Link href={`/talent/${talent.id}`}>
			<div className="bg-bg-elevated border border-border rounded-xl p-6 hover:border-purple transition cursor-pointer h-full flex flex-col">
				<div className="flex items-start justify-between mb-3">
					<h3 className="text-lg font-semibold">{talent.displayName}</h3>
					<span
						className={`text-sm font-medium px-2 py-0.5 rounded ${
							talent.pricingType === "free" ? "text-green bg-green/10" : "text-teal bg-teal/10"
						}`}
					>
						{talent.pricingType === "free" ? "Free" : `$${talent.priceMonthly}/mo`}
					</span>
				</div>
				<p className="text-muted text-sm flex-1 line-clamp-3">{talent.description}</p>
				<div className="mt-4 text-xs text-muted">
					{talent.installCount.toLocaleString()} installs · {talent.category ?? "other"}
				</div>
			</div>
		</Link>
	);
}
