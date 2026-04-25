import { joinGatewayUrl } from "./url.js";

const DEFAULT_GATEWAY = "https://api.claracode.ai";

export type HarnessTalentsConfig = {
	/** `sk-clara-…` or `cc_live_…` API key */
	apiKey: string;
	/**
	 * Backend base URL (same as other REST calls). Defaults to https://api.claracode.ai
	 * (must be the app that serves `/api/harness-talents` — not the /v1 gateway for ask/stream).
	 */
	backendBaseUrl?: string;
};

export type HarnessTalentListItem = {
	id: string;
	displayName: string;
	description: string;
	category: string;
	owned: boolean;
	canAttach: boolean;
} & Record<string, unknown>;

async function readJson(res: Response): Promise<unknown> {
	return res.json() as Promise<unknown>;
}

export async function listHarnessTalentInventory(
	config: HarnessTalentsConfig,
	query?: { category?: string; domain?: string; industry?: string },
): Promise<{ talents: HarnessTalentListItem[] }> {
	const base = (config.backendBaseUrl ?? DEFAULT_GATEWAY).replace(/\/$/, "");
	const u = new URL("/api/harness-talents", `${base}/`);
	if (query?.category) u.searchParams.set("category", query.category);
	if (query?.domain) u.searchParams.set("domain", query.domain);
	if (query?.industry) u.searchParams.set("industry", query.industry);
	const res = await fetch(u, {
		headers: { Authorization: `Bearer ${config.apiKey}` },
	});
	if (!res.ok) {
		const t = await res.text();
		throw new Error(`harness-talents list failed (${res.status}): ${t.slice(0, 500)}`);
	}
	const data = (await readJson(res)) as { talents?: unknown };
	if (!data || !Array.isArray(data.talents)) {
		throw new Error("harness-talents: invalid list response");
	}
	return { talents: data.talents as HarnessTalentListItem[] };
}

export async function acquireHarnessTalent(
	config: HarnessTalentsConfig,
	talentId: string,
): Promise<Record<string, unknown>> {
	const url = joinGatewayUrl(config.backendBaseUrl ?? DEFAULT_GATEWAY, "/api/harness-talents/acquire");
	const res = await fetch(url, {
		method: "POST",
		headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
		body: JSON.stringify({ talent_id: talentId }),
	});
	if (!res.ok) {
		const t = await res.text();
		throw new Error(`harness-talents acquire failed (${res.status}): ${t.slice(0, 500)}`);
	}
	return (await readJson(res)) as Record<string, unknown>;
}

export async function attachHarnessTalent(
	config: HarnessTalentsConfig,
	agentId: string,
	talentId: string,
): Promise<{ attached: boolean }> {
	const url = joinGatewayUrl(config.backendBaseUrl ?? DEFAULT_GATEWAY, "/api/harness-talents/attach");
	const res = await fetch(url, {
		method: "POST",
		headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
		body: JSON.stringify({ agent_id: agentId, talent_id: talentId }),
	});
	if (!res.ok) {
		const t = await res.text();
		throw new Error(`harness-talents attach failed (${res.status}): ${t.slice(0, 500)}`);
	}
	return (await readJson(res)) as { attached: boolean };
}
