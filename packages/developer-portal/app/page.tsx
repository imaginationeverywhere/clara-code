"use client";

import TalentRow from "@/components/TalentRow";
import { useAuth } from "@/hooks/useAuth";
import type { DeveloperProgramStatus, Talent } from "@/lib/api";
import { getDeveloperProgramStatus, getDeveloperTalents } from "@/lib/api";
import { useEffect, useState } from "react";

export default function Dashboard() {
	const { loading } = useAuth();
	const [talents, setTalents] = useState<Talent[]>([]);
	const [programStatus, setProgramStatus] = useState<DeveloperProgramStatus | null>(null);

	useEffect(() => {
		if (loading) {
			return;
		}
		getDeveloperTalents().then(setTalents).catch(console.error);
		getDeveloperProgramStatus().then(setProgramStatus).catch(console.error);
	}, [loading]);

	if (loading) {
		return <div className="p-8 text-muted">Loading...</div>;
	}

	return (
		<div className="p-8 max-w-5xl">
			<h1 className="text-3xl font-bold mb-8">Dashboard</h1>

			{programStatus && !programStatus.enrolled && (
				<div className="bg-purple/10 border border-purple rounded-xl p-6 mb-8 flex items-center justify-between">
					<div>
						<p className="font-semibold">Become a Clara Developer</p>
						<p className="text-muted text-sm mt-1">
							Enroll in the Developer Program ($99/year) to submit Talents and track your revenue.
						</p>
					</div>
					<a
						href="/program"
						className="bg-purple px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-light transition"
					>
						Enroll Now
					</a>
				</div>
			)}

			<section>
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold">Your Talents</h2>
					<a
						href="/talents/new"
						className="bg-purple hover:bg-purple-light px-4 py-2 rounded-lg text-sm font-medium transition"
					>
						+ Submit New Talent
					</a>
				</div>

				{talents.length === 0 ? (
					<div className="bg-bg-elevated border border-border rounded-xl p-8 text-center">
						<p className="text-muted">No Talents submitted yet.</p>
						<a
							href="/talents/new"
							className="text-purple text-sm mt-2 inline-block hover:text-purple-light"
						>
							Submit your first Talent →
						</a>
					</div>
				) : (
					<div className="space-y-3">
						{talents.map((talent) => (
							<TalentRow key={talent.id} talent={talent} />
						))}
					</div>
				)}
			</section>
		</div>
	);
}
