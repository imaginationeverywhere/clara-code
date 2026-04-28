/**
 * Clara backend `POST /api/v1/run` — optional `clara doctor` probe until dispatch ships.
 * Set `CLARA_FEATURE_INTENT_DISPATCH=1` or `true` to enable.
 */
export function intentDispatchProbeEnabled(): boolean {
	const v = process.env.CLARA_FEATURE_INTENT_DISPATCH?.trim().toLowerCase();
	return v === "1" || v === "true";
}
