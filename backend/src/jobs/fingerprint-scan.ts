import cron from "node-cron";
import { ejectionService } from "@/services/ejection.service";
import { logger } from "@/utils/logger";

if (!process.env.JEST_WORKER_ID) {
	cron.schedule(
		"0 3 * * *",
		() => {
			void ejectionService
				.runFingerprintScan()
				.catch((err: unknown) => logger.error("fingerprint_scan job failed", err));
		},
		{ timezone: "UTC" },
	);
}
