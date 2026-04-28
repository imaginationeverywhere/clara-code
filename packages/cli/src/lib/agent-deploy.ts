import { NETWORK_FAILURE_MESSAGE } from "./http-errors.js";
import { type RunIntentUnifiedOverrides, tryRunIntentUnified, type UnifiedRunPayload } from "./intent-dispatch.js";

export type AgentDeployUnifiedFirstResult =
	| { kind: "unified"; payload: UnifiedRunPayload }
	| { kind: "legacy"; response: Response; bodyText: string };

/**
 * Try **`POST ${gateway}/v1/run`** with intent **`deploy`** and `{ agent_name }`.
 * On unavailable (**404** / **501** / `intent_gateway_pending`) or gateway network failure, falls back to **`POST ${backend}/api/agents/:name/deploy`**.
 */
export async function runAgentDeployUnifiedFirst(
	agentName: string,
	bearer: string,
	backendBaseUrl: string,
	overrides?: RunIntentUnifiedOverrides,
): Promise<AgentDeployUnifiedFirstResult> {
	try {
		const u = await tryRunIntentUnified("deploy", { agent_name: agentName }, false, { ...overrides, token: bearer });
		if (u !== null) {
			return { kind: "unified", payload: u };
		}
	} catch (e) {
		if (!(e instanceof Error && e.message === NETWORK_FAILURE_MESSAGE)) {
			throw e;
		}
	}

	const base = backendBaseUrl.replace(/\/$/, "");
	const deployUrl = `${base}/api/agents/${encodeURIComponent(agentName)}/deploy`;
	const fetchImpl = overrides?.fetch ?? globalThis.fetch;
	const response = await fetchImpl(deployUrl, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${bearer}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({}),
	});
	const bodyText = await response.text().catch(() => "");
	return { kind: "legacy", response, bodyText };
}
