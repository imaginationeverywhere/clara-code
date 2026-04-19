"use client";

import { useAuth } from "@/hooks/useAuth";
import { getTalentAnalytics } from "@/lib/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function TalentDetailPage() {
	const { loading } = useAuth();
	const params = useParams();
	const id = typeof params.id === "string" ? params.id : "";
	const [installCount, setInstallCount] = useState<number | null>(null);

	useEffect(() => {
		if (loading || !id) {
			return;
		}
		getTalentAnalytics(id)
			.then((a) => setInstallCount(a.installCount))
			.catch(console.error);
	}, [loading, id]);

	if (loading) {
		return <div className="p-8 text-muted">Loading...</div>;
	}

	return (
		<div className="p-8 max-w-2xl">
			<h1 className="text-2xl font-bold mb-4">Talent</h1>
			<p className="text-muted text-sm mb-2">Talent ID: {id}</p>
			<p className="text-muted">
				{installCount !== null ? `${installCount.toLocaleString()} installs` : "Loading analytics…"}
			</p>
		</div>
	);
}
