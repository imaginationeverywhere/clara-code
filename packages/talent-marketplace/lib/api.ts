const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://api.claracode.ai";

export interface PublicTalent {
	id: string;
	name: string;
	displayName: string;
	description: string | null;
	category: string | null;
	pricingType: "free" | "paid";
	priceMonthly: number | null;
	voiceCommands: { pattern: string; description: string; examples: string[] }[] | null;
	installCount: number;
}

export async function listTalents(category?: string): Promise<PublicTalent[]> {
	const url = category
		? `${API_BASE}/api/talents?category=${encodeURIComponent(category)}`
		: `${API_BASE}/api/talents`;
	const res = await fetch(url, { next: { revalidate: 60 } });
	if (!res.ok) {
		throw new Error("Failed to fetch talents");
	}
	const data = (await res.json()) as { talents: PublicTalent[] };
	return data.talents;
}

export async function getTalent(id: string): Promise<PublicTalent | null> {
	const res = await fetch(`${API_BASE}/api/talents/${id}`, { next: { revalidate: 60 } });
	if (res.status === 404) {
		return null;
	}
	if (!res.ok) {
		throw new Error("Failed to fetch talent");
	}
	const data = (await res.json()) as { talent: PublicTalent };
	return data.talent;
}

export async function installTalent(
	talentId: string,
	apiKey: string,
): Promise<{ success: boolean; checkoutUrl?: string }> {
	const res = await fetch(`${API_BASE}/api/talents/${talentId}/install`, {
		method: "POST",
		headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
	});
	if (res.status === 402) {
		const data = (await res.json()) as { checkoutUrl?: string };
		return { success: false, checkoutUrl: data.checkoutUrl };
	}
	if (!res.ok) {
		throw new Error("Failed to install talent");
	}
	return { success: true };
}

export async function uninstallTalent(talentId: string, apiKey: string): Promise<void> {
	const res = await fetch(`${API_BASE}/api/talents/${talentId}/install`, {
		method: "DELETE",
		headers: { Authorization: `Bearer ${apiKey}` },
	});
	if (!res.ok) {
		throw new Error("Failed to uninstall talent");
	}
}
