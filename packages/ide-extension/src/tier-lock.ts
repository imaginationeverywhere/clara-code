/**
 * 403 `tier_lock` body — mirror of `packages/cli/src/lib/tier-lock.ts` (prompt 15).
 */
export type TierLockPayload = {
	reason?: string;
	upgrade_url?: string;
	current_tier?: string;
	required_tier?: string;
};

export function formatTierLockMessage(p: TierLockPayload): string {
	const need = typeof p.required_tier === "string" && p.required_tier.length > 0 ? p.required_tier : "a higher tier";
	const have = typeof p.current_tier === "string" && p.current_tier.length > 0 ? p.current_tier : "your current plan";
	const up = typeof p.upgrade_url === "string" && p.upgrade_url.length > 0 ? p.upgrade_url : "";
	let msg = `This needs ${need}. You're on ${have}.`;
	if (up) {
		msg += `\nUpgrade: ${up}`;
	}
	return msg;
}
