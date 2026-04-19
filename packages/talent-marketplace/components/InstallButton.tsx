"use client";

import { installTalent } from "@/lib/api";
import { useState } from "react";

interface Props {
	talentId: string;
	pricingType: "free" | "paid";
}

export default function InstallButton({ talentId, pricingType }: Props) {
	const [loading, setLoading] = useState(false);
	const [installed, setInstalled] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleInstall = async () => {
		const apiKey = localStorage.getItem("clara_api_key");
		if (!apiKey) {
			setError("Sign in to install Talents.");
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const result = await installTalent(talentId, apiKey);
			if (result.checkoutUrl) {
				window.location.href = result.checkoutUrl;
				return;
			}
			setInstalled(true);
		} catch {
			setError("Install failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	if (installed) {
		return (
			<span className="bg-green/10 text-green px-6 py-2 rounded-lg font-medium">Installed</span>
		);
	}

	return (
		<div>
			<button
				type="button"
				onClick={handleInstall}
				disabled={loading}
				className="bg-purple hover:bg-purple-light disabled:opacity-50 px-6 py-2 rounded-lg font-medium transition"
			>
				{loading ? "Installing..." : pricingType === "free" ? "Install Free" : "Subscribe & Install"}
			</button>
			{error && <p className="text-red-400 text-xs mt-1">{error}</p>}
		</div>
	);
}
