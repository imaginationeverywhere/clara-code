import { type Response, Router } from "express";
import { type ApiKeyRequest, requireClaraOrClerk } from "@/middleware/api-key-auth";
import type { AuthenticatedRequest } from "@/middleware/clerk-auth";
import { mobileNoteCapture } from "@/services/mobile-note-capture.service";

const router: ReturnType<typeof Router> = Router();

router.post(
	"/capture",
	requireClaraOrClerk,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const userId = req.claraUser?.userId;
		if (!userId) {
			res.status(401).json({ error: "unauthorized" });
			return;
		}
		try {
			const body = req.body as {
				deployment_id?: string;
				platform?: "ios" | "android" | "both";
				transcript?: string;
			};
			if (!body.deployment_id || !body.transcript) {
				res.status(400).json({ error: "deployment_id_and_transcript_required" });
				return;
			}
			if (body.platform !== "ios" && body.platform !== "android" && body.platform !== "both") {
				res.status(400).json({ error: "invalid_platform" });
				return;
			}
			const result = await mobileNoteCapture.captureFromVoice({
				deploymentId: body.deployment_id,
				siteOwnerUserId: userId,
				platform: body.platform,
				rawVoiceTranscript: body.transcript,
			});
			const agentResponse = `Got it. "${result.agentInterpretation}" — queued for your next release. Review in your dashboard.`;
			res.status(201).json({ request: result, agent_response: agentResponse });
		} catch (err) {
			const message = err instanceof Error ? err.message : "error";
			res.status(400).json({ error: message });
		}
	},
);

router.get(
	"/pending",
	requireClaraOrClerk,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const userId = req.claraUser?.userId;
		if (!userId) {
			res.status(401).json({ error: "unauthorized" });
			return;
		}
		const pending = await mobileNoteCapture.listPendingForOwner(userId);
		res.json({ pending });
	},
);

router.post(
	"/:id/approve",
	requireClaraOrClerk,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const userId = req.claraUser?.userId;
		if (!userId) {
			res.status(401).json({ error: "unauthorized" });
			return;
		}
		const tr = (req.body as { target_release?: string }).target_release;
		try {
			await mobileNoteCapture.approve(req.params.id, userId, tr ?? null);
			res.json({ approved: true });
		} catch {
			res.status(404).json({ error: "not_found" });
		}
	},
);

router.post(
	"/:id/reject",
	requireClaraOrClerk,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const userId = req.claraUser?.userId;
		if (!userId) {
			res.status(401).json({ error: "unauthorized" });
			return;
		}
		const reason = (req.body as { reason?: string }).reason ?? "rejected";
		try {
			await mobileNoteCapture.reject(req.params.id, userId, reason);
			res.json({ rejected: true });
		} catch {
			res.status(404).json({ error: "not_found" });
		}
	},
);

router.post(
	"/:id/shipped",
	requireClaraOrClerk,
	async (req: AuthenticatedRequest & ApiKeyRequest, res: Response): Promise<void> => {
		const userId = req.claraUser?.userId;
		if (!userId) {
			res.status(401).json({ error: "unauthorized" });
			return;
		}
		try {
			await mobileNoteCapture.markShipped(req.params.id, userId);
			res.json({ marked_shipped: true });
		} catch {
			res.status(404).json({ error: "not_found" });
		}
	},
);

export default router;
