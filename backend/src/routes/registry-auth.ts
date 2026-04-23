import { requireAuth } from "@clerk/express";
import { type Response, Router } from "express";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import { Subscription } from "@/models/Subscription";
import { logger } from "@/utils/logger";
import { fetchNpmTokenFromVerdaccio } from "@/utils/registry-token";

const router: ReturnType<typeof Router> = Router();
router.use(requireAuth());

type RegistryPackage = "@claracode/sdk" | "@claracode/marketplace-sdk";

function pricingUrl(): string {
	if (process.env.FRONTEND_URL) {
		return `${process.env.FRONTEND_URL.replace(/\/$/, "")}/pricing`;
	}
	return "https://claracode.ai/pricing";
}

function isAllowedPackage(pkg: unknown): pkg is RegistryPackage {
	return pkg === "@claracode/sdk" || pkg === "@claracode/marketplace-sdk";
}

function hasRegistryAccess(tier: string): boolean {
	const t = tier.toLowerCase();
	return t === "pro" || t === "business";
}

router.post("/token", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
	try {
		const auth = await (req.auth?.() ?? null);
		if (!auth?.userId) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		const pkg = (req.body as { package?: unknown }).package;
		if (!isAllowedPackage(pkg)) {
			res.status(400).json({ error: "invalid_package" });
			return;
		}

		const sub = await Subscription.findOne({ where: { userId: auth.userId } });
		const tier = sub?.tier ?? "free";
		if (!hasRegistryAccess(tier)) {
			const message =
				pkg === "@claracode/sdk"
					? "@claracode/sdk requires an active Pro or Business subscription."
					: "@claracode/marketplace-sdk requires an active Pro or Business subscription (developer program enforcement is upcoming).";
			res.status(403).json({
				error: "package_access_denied",
				message,
				package: pkg,
				upgrade_url: pricingUrl(),
			});
			return;
		}

		const token = await fetchNpmTokenFromVerdaccio();
		const registry = process.env.REGISTRY_PUBLIC_URL ?? "https://registry.claracode.ai";
		res.json({
			token,
			registry,
			expires_in: 3600,
		});
	} catch (error) {
		logger.error("POST /api/registry/token error:", error);
		res.status(500).json({ error: "Failed to create registry token" });
	}
});

export default router;
