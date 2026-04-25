import { type Response, Router } from "express";
import { type ApiKeyRequest, requireClaraOrClerk } from "@/middleware/api-key-auth";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import { Ejection } from "@/models/Ejection";
import { ejectionService } from "@/services/ejection.service";

const router: ReturnType<typeof Router> = Router();

router.post(
	"/agents/:agentId/eject",
	requireClaraOrClerk,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		try {
			if (!req.claraUser) {
				res.status(401).json({ error: "unauthorized" });
				return;
			}
			const ejection = await ejectionService.requestEjection(
				req.claraUser.userId,
				req.claraUser.tier,
				req.params.agentId,
			);
			const downloadUrl = await ejectionService.getDownloadUrl(ejection);
			res.status(201).json({
				ejection,
				download_url: downloadUrl,
				attestation_required: true,
				attestation_upload_url: `/api/ejections/${ejection.id}/attestation`,
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : "error";
			if (message.startsWith("ejection_cap_reached")) {
				res.status(400).json({ error: message });
				return;
			}
			if (message === "ejection_not_available_on_tier") {
				res.status(403).json({ error: message });
				return;
			}
			if (message === "agent_not_found") {
				res.status(404).json({ error: message });
				return;
			}
			res.status(400).json({ error: message });
		}
	},
);

router.post(
	"/:id/attestation",
	requireClaraOrClerk,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		try {
			if (!req.claraUser) {
				res.status(401).json({ error: "unauthorized" });
				return;
			}
			const { signed_pdf_s3_key: signedKey } = req.body as { signed_pdf_s3_key?: string };
			if (!signedKey || typeof signedKey !== "string") {
				res.status(400).json({ error: "signed_pdf_s3_key_required" });
				return;
			}
			await ejectionService.recordAttestation(req.params.id, req.claraUser.userId, signedKey);
			res.json({ attested: true });
		} catch (err) {
			const message = err instanceof Error ? err.message : "error";
			if (message === "ejection_not_found") {
				res.status(404).json({ error: message });
				return;
			}
			res.status(400).json({ error: message });
		}
	},
);

router.get(
	"/",
	requireClaraOrClerk,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		if (!req.claraUser) {
			res.status(401).json({ error: "unauthorized" });
			return;
		}
		const rows = await Ejection.findAll({
			where: { userId: req.claraUser.userId },
			order: [["exportedAt", "DESC"]],
		});
		const ejections = await Promise.all(
			rows.map(async (e) => {
				const downloadUrl = await ejectionService.getDownloadUrl(e);
				return {
					id: e.id,
					userId: e.userId,
					userAgentId: e.userAgentId,
					monthKey: e.monthKey,
					fingerprintHash: e.fingerprintHash,
					s3Key: e.s3Key,
					attestationSignedAt: e.attestationSignedAt?.toISOString() ?? null,
					attestationS3Key: e.attestationS3Key,
					status: e.status,
					exportedAt: e.exportedAt.toISOString(),
					detectedDoubleHosting: e.detectedDoubleHosting,
					downloadUrl,
				};
			}),
		);
		res.json({ ejections });
	},
);

export default router;
