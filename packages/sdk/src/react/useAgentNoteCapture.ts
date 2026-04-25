import { useCallback } from "react";

export type NoteCaptureResult = { request: unknown; agent_response: string };

/**
 * Queues a voice-derived transcript as a **mobile** update (next app store release), not a live code change.
 */
export function useAgentNoteCapture(
	claraBaseUrl: string,
	getAccessToken: () => Promise<string> | string,
	deploymentId: string,
) {
	const captureVoiceNote = useCallback(
		async (transcript: string, platform: "ios" | "android"): Promise<NoteCaptureResult> => {
			const token = await Promise.resolve(getAccessToken());
			const base = claraBaseUrl.replace(/\/$/, "");
			const r = await fetch(`${base}/mobile-updates/capture`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ deployment_id: deploymentId, platform, transcript }),
			});
			const j = (await r.json()) as NoteCaptureResult & { error?: string };
			if (!r.ok) {
				throw new Error(j.error ?? `http_${r.status}`);
			}
			return j;
		},
		[claraBaseUrl, deploymentId, getAccessToken],
	);
	return { captureVoiceNote };
}
