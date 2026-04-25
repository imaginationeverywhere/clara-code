import { type Response, Router } from "express";
import { requireAbuseCheck } from "@/middleware/abuse-protection";
import { type ApiKeyRequest, requireClaraOrClerk } from "@/middleware/api-key-auth";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import { requireSiteOwner } from "@/middleware/require-site-owner";
import { SiteAgentDeployment } from "@/models/SiteAgentDeployment";
import { SiteOwnerInstruction } from "@/models/SiteOwnerInstruction";
import { platformStandards } from "@/services/platform-standards.service";

const router: ReturnType<typeof Router> = Router();

router.get(
	"/deployments",
	requireClaraOrClerk,
	requireAbuseCheck,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const userId = req.claraUser?.userId;
		if (!userId) {
			res.status(401).json({ error: "unauthorized" });
			return;
		}
		const deployments = await SiteAgentDeployment.findAll({
			where: { siteOwnerUserId: userId, deploymentStatus: "active" },
		});
		res.json({ deployments });
	},
);

router.post(
	"/deployments/:deploymentId/instruct",
	requireClaraOrClerk,
	requireAbuseCheck,
	requireSiteOwner,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const d = req.deployment;
		if (!d) {
			res.status(500).json({ error: "server_error" });
			return;
		}
		const body = req.body as { instruction?: string; category?: string };
		const instruction = body.instruction;
		const category = body.category ?? "behavior";
		if (typeof instruction !== "string" || instruction.length === 0) {
			res.status(400).json({ error: "instruction_required" });
			return;
		}

		const validation = await platformStandards.validate(instruction, category);
		if (!validation.approved) {
			await SiteOwnerInstruction.create({
				deploymentId: d.id,
				instruction,
				category,
				approvedByPlatform: false,
				platformRejectionReason: validation.rejectionReason ?? "rejected",
			});
			res.status(400).json({ error: "platform_rejected", reason: validation.rejectionReason });
			return;
		}
		const saved = await SiteOwnerInstruction.create({
			deploymentId: d.id,
			instruction: validation.sanitizedInstruction!,
			category,
			approvedByPlatform: true,
			effectiveAt: new Date(),
		});
		res.status(201).json({ instruction: saved });
	},
);

router.get(
	"/deployments/:deploymentId/instructions",
	requireClaraOrClerk,
	requireAbuseCheck,
	requireSiteOwner,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const d = req.deployment;
		if (!d) {
			res.status(500).json({ error: "server_error" });
			return;
		}
		const instructions = await SiteOwnerInstruction.findAll({
			where: { deploymentId: d.id, approvedByPlatform: true },
			order: [["createdAt", "DESC"]],
		});
		res.json({ instructions });
	},
);

router.post(
	"/deployments/:deploymentId/revert/:instructionId",
	requireClaraOrClerk,
	requireAbuseCheck,
	requireSiteOwner,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const d = req.deployment;
		if (!d) {
			res.status(500).json({ error: "server_error" });
			return;
		}
		const { instructionId } = req.params;
		const [affected] = await SiteOwnerInstruction.update(
			{ approvedByPlatform: false, platformRejectionReason: "reverted by site owner" },
			{ where: { id: instructionId, deploymentId: d.id } },
		);
		if (affected === 0) {
			res.status(404).json({ error: "not_found" });
			return;
		}
		res.json({ reverted: true });
	},
);

router.get(
	"/deployments/:deploymentId/report",
	requireClaraOrClerk,
	requireAbuseCheck,
	requireSiteOwner,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const d = req.deployment;
		if (!d) {
			res.status(500).json({ error: "server_error" });
			return;
		}
		const { metric, period } = req.query;
		res.json({
			report: "placeholder: wire deployed agent to generate a report (metric/period)",
			metric: typeof metric === "string" ? metric : null,
			period: typeof period === "string" ? period : null,
			heru_slug: d.heruSlug,
		});
	},
);

export default router;
