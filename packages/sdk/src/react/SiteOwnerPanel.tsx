import React, { useCallback, useState } from "react";

export type SiteOwnerPanelProps = {
	/** `GET/POST` base, e.g. `https://api.claracode.ai/api` (no trailing slash) */
	baseUrl: string;
	deploymentId: string;
	agentName: string;
	/** `Authorization: Bearer <token>` value without the `Bearer` prefix, or a factory. */
	getAccessToken: (() => Promise<string> | string) | string;
	category?: string;
};

/**
 * Embeddable (Heru admin) — text instruction to a deployed agent with SITE_OWNER privilege.
 * Voice capture stays in the host app; this panel posts to `/api/site-owner/deployments/:id/instruct`.
 */
export function SiteOwnerPanel({ baseUrl, deploymentId, agentName, getAccessToken, category = "behavior" }: SiteOwnerPanelProps) {
	const [text, setText] = useState("");
	const [status, setStatus] = useState<string | null>(null);
	const onSend = useCallback(async () => {
		const token = typeof getAccessToken === "string" ? getAccessToken : await getAccessToken();
		const root = baseUrl.replace(/\/$/, "");
		const r = await fetch(`${root}/site-owner/deployments/${encodeURIComponent(deploymentId)}/instruct`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ instruction: text, category }),
		});
		if (!r.ok) {
			const j = (await r.json().catch(() => ({}))) as { reason?: string; error?: string };
			setStatus(j.reason ?? j.error ?? `HTTP ${r.status}`);
			return;
		}
		setStatus("Saved.");
		setText("");
	}, [baseUrl, category, deploymentId, getAccessToken, text]);
	return (
		<section className="clara-site-owner-panel" data-agent={agentName}>
			<h2>Site owner — {agentName}</h2>
			<textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} style={{ width: "100%" }} />
			<button type="button" onClick={onSend}>
				Send instruction
			</button>
			{status ? <p role="status">{status}</p> : null}
		</section>
	);
}
