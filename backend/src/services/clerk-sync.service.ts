import { createClerkClient } from "@clerk/backend";
import type { PlanTier } from "@/services/plan-limits";
import { logger } from "@/utils/logger";

const clerk = process.env.CLERK_SECRET_KEY ? createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY }) : null;

/**
 * Pushes subscription tier to Clerk `publicMetadata.tier` (merge, no wipe of other keys).
 * DB `subscriptions` remains the billing source of truth; this keeps the session/UI aligned.
 */
export async function syncClerkMetadata(userId: string, tier: PlanTier): Promise<void> {
	if (!clerk) {
		logger.warn("syncClerkMetadata: CLERK_SECRET_KEY not set, skipping");
		return;
	}
	try {
		const user = await clerk.users.getUser(userId);
		const pm = (user.publicMetadata ?? {}) as Record<string, unknown>;
		await clerk.users.updateUser(userId, {
			publicMetadata: { ...pm, tier },
		});
	} catch (err) {
		logger.error("syncClerkMetadata failed", { userId, tier, err });
		throw err;
	}
}
