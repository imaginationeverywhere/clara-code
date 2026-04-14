const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://api.claracode.ai";

export interface Talent {
	id: string;
	name: string;
	displayName: string;
	description: string | null;
	category: string | null;
	pricingType: "free" | "paid";
	priceMonthly: number | null;
	status: "pending" | "approved" | "rejected" | "suspended";
	installCount: number;
}

export interface DeveloperProgramStatus {
	enrolled: boolean;
	status: string | null;
	expiresAt: string | null;
}

async function withAuth(path: string, options: RequestInit = {}): Promise<Response> {
	const apiKey = typeof window !== "undefined" ? localStorage.getItem("clara_api_key") : null;
	if (!apiKey) {
		throw new Error("Not authenticated");
	}
	return fetch(`${API_BASE}${path}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options.headers,
			Authorization: `Bearer ${apiKey}`,
		},
	});
}

export async function getDeveloperTalents(): Promise<Talent[]> {
	const res = await withAuth("/api/talents");
	if (!res.ok) {
		throw new Error("Failed to fetch talents");
	}
	const data = (await res.json()) as { talents: Talent[] };
	return data.talents;
}

export async function submitTalent(data: {
	name: string;
	displayName: string;
	description?: string;
	category?: string;
	pricingType: "free" | "paid";
	priceCents?: number;
	subgraphUrl: string;
	voiceCommands?: { pattern: string; description: string; examples: string[] }[];
}): Promise<{ id: string; status: string }> {
	const res = await withAuth("/api/talents", {
		method: "POST",
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		const err = (await res.json()) as { message?: string };
		throw new Error(err.message ?? "Submission failed");
	}
	const result = (await res.json()) as { talent: { id: string; status: string } };
	return result.talent;
}

export async function getTalentAnalytics(talentId: string): Promise<{ installCount: number }> {
	const res = await withAuth(`/api/talents/${talentId}/analytics`);
	if (!res.ok) {
		throw new Error("Failed to fetch analytics");
	}
	const data = (await res.json()) as { analytics: { installCount: number } };
	return data.analytics;
}

export async function getDeveloperProgramStatus(): Promise<DeveloperProgramStatus> {
	const res = await withAuth("/api/developer-program/status");
	if (!res.ok) {
		throw new Error("Failed to fetch program status");
	}
	return (await res.json()) as DeveloperProgramStatus;
}

export async function enrollInDeveloperProgram(): Promise<{ checkoutUrl: string }> {
	const res = await withAuth("/api/developer-program/enroll", { method: "POST" });
	if (!res.ok) {
		const err = (await res.json()) as { message?: string };
		throw new Error(err.message ?? "Enrollment failed");
	}
	return (await res.json()) as { checkoutUrl: string };
}
