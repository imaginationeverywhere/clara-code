import { logger } from "@/utils/logger";

export async function alertOps(
	event: string,
	payload: { userId?: string; ejectionId?: string; evidence?: unknown },
): Promise<void> {
	logger.error(`[ops_alert] ${event}`, payload);
}
