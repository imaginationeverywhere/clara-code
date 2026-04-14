import type { Talent } from "@/lib/api";
import Link from "next/link";

const STATUS_STYLES: Record<string, string> = {
	approved: "text-green bg-green/10",
	pending: "text-yellow-400 bg-yellow-400/10",
	rejected: "text-red-400 bg-red-400/10",
	suspended: "text-muted bg-muted/10",
};

export default function TalentRow({ talent }: { talent: Talent }) {
	return (
		<div className="bg-bg-elevated border border-border rounded-xl p-5 flex items-center justify-between">
			<div>
				<div className="flex items-center gap-3 mb-1">
					<span className="font-semibold">{talent.displayName}</span>
					<span
						className={`text-xs px-2 py-0.5 rounded capitalize ${STATUS_STYLES[talent.status] ?? "text-muted"}`}
					>
						{talent.status}
					</span>
				</div>
				<p className="text-sm text-muted">{talent.installCount.toLocaleString()} installs</p>
			</div>
			<Link
				href={`/talents/${talent.id}`}
				className="text-sm text-purple hover:text-purple-light transition"
			>
				View →
			</Link>
		</div>
	);
}
