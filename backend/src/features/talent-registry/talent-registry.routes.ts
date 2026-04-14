import { type Response, Router } from "express";

import { adminOnly } from "@/middleware/admin-only";
import { type ApiKeyRequest, requireApiKey } from "@/middleware/api-key-auth";
import type { TalentRegistryService } from "./talent-registry.service";
import type { TalentStatus } from "./talent-registry.types";

export function createTalentRegistryRouter(service: TalentRegistryService): Router {
	const router = Router();

	router.get("/me/installed", requireApiKey, async (req: ApiKeyRequest, res: Response) => {
		try {
			const userId = req.claraUser?.userId;
			if (!userId) {
				res.status(401).json({ error: "unauthorized" });
				return;
			}
			const talents = await service.getUserInstalls(userId);
			res.json({ talents });
		} catch {
			res.status(500).json({ error: "internal_error" });
		}
	});

	router.post("/", requireApiKey, async (req: ApiKeyRequest, res: Response) => {
		try {
			const userId = req.claraUser?.userId;
			if (!userId) {
				res.status(401).json({ error: "unauthorized" });
				return;
			}
			const hasProgram = await service.hasDeveloperProgram(userId);
			if (!hasProgram) {
				res.status(403).json({
					error: "developer_program_required",
					message: "Submitting a Talent requires an active Developer Program membership ($99/year).",
					enrollUrl: "/api/developer-program/enroll",
				});
				return;
			}
			const { name, displayName, description, category, pricingType, priceCents, subgraphUrl, voiceCommands } =
				req.body as Record<string, unknown>;
			if (
				typeof name !== "string" ||
				typeof displayName !== "string" ||
				typeof subgraphUrl !== "string" ||
				(pricingType !== "free" && pricingType !== "paid")
			) {
				res.status(400).json({
					error: "missing_required_fields",
					required: ["name", "displayName", "subgraphUrl", "pricingType"],
				});
				return;
			}
			const payload: Parameters<TalentRegistryService["submitTalent"]>[1] = {
				name,
				displayName,
				pricingType,
				subgraphUrl,
			};
			if (typeof description === "string") payload.description = description;
			if (typeof category === "string") payload.category = category;
			if (typeof priceCents === "number") payload.priceCents = priceCents;
			if (Array.isArray(voiceCommands)) payload.voiceCommands = voiceCommands;
			const talent = await service.submitTalent(userId, payload);
			res.status(201).json({ talent: { id: talent.id, name: talent.name, status: talent.status } });
		} catch (err: unknown) {
			const e = err as { code?: string };
			if (e.code === "23505") {
				res.status(409).json({ error: "talent_name_taken" });
				return;
			}
			res.status(500).json({ error: "internal_error" });
		}
	});

	router.get("/", async (req, res: Response) => {
		try {
			const category = typeof req.query.category === "string" ? req.query.category : undefined;
			const talents = await service.listApprovedTalents(category);
			res.json({ talents });
		} catch {
			res.status(500).json({ error: "internal_error" });
		}
	});

	router.get("/:id/analytics", requireApiKey, async (req: ApiKeyRequest, res: Response) => {
		try {
			const userId = req.claraUser?.userId;
			if (!userId) {
				res.status(401).json({ error: "unauthorized" });
				return;
			}
			const analytics = await service.getTalentAnalytics(req.params.id, userId);
			if (!analytics) {
				res.status(404).json({ error: "talent_not_found" });
				return;
			}
			res.json({ analytics });
		} catch {
			res.status(500).json({ error: "internal_error" });
		}
	});

	router.put("/:id", requireApiKey, async (req: ApiKeyRequest, res: Response) => {
		try {
			const userId = req.claraUser?.userId;
			if (!userId) {
				res.status(401).json({ error: "unauthorized" });
				return;
			}
			const body = req.body as {
				displayName?: string;
				description?: string;
				category?: string;
				voiceCommands?: unknown[];
			};
			const updates: Parameters<TalentRegistryService["updateTalent"]>[2] = {};
			if (body.displayName !== undefined) updates.displayName = body.displayName;
			if (body.description !== undefined) updates.description = body.description;
			if (body.category !== undefined) updates.category = body.category;
			if (body.voiceCommands !== undefined) updates.voiceCommands = body.voiceCommands;
			const talent = await service.updateTalent(req.params.id, userId, updates);
			if (!talent) {
				res.status(404).json({ error: "talent_not_found" });
				return;
			}
			res.json({ talent: { id: talent.id, status: talent.status } });
		} catch {
			res.status(500).json({ error: "internal_error" });
		}
	});

	router.post("/:id/install", requireApiKey, async (req: ApiKeyRequest, res: Response) => {
		try {
			const userId = req.claraUser?.userId;
			if (!userId) {
				res.status(401).json({ error: "unauthorized" });
				return;
			}
			const talent = await service.getTalentPublic(req.params.id);
			if (!talent) {
				res.status(404).json({ error: "talent_not_found" });
				return;
			}

			if (talent.pricingType === "paid") {
				res.status(402).json({
					error: "payment_required",
					message: "This Talent requires a paid subscription.",
					checkoutUrl: null,
				});
				return;
			}

			await service.installTalent(userId, req.params.id);
			res.json({ success: true });
		} catch {
			res.status(500).json({ error: "internal_error" });
		}
	});

	router.delete("/:id/install", requireApiKey, async (req: ApiKeyRequest, res: Response) => {
		try {
			const userId = req.claraUser?.userId;
			if (!userId) {
				res.status(401).json({ error: "unauthorized" });
				return;
			}
			await service.uninstallTalent(userId, req.params.id);
			res.json({ success: true });
		} catch {
			res.status(500).json({ error: "internal_error" });
		}
	});

	router.get("/:id", async (req, res: Response) => {
		try {
			const talent = await service.getTalentPublic(req.params.id);
			if (!talent) {
				res.status(404).json({ error: "talent_not_found" });
				return;
			}
			res.json({ talent });
		} catch {
			res.status(500).json({ error: "internal_error" });
		}
	});

	return router;
}

export function createTalentAdminRouter(service: TalentRegistryService): Router {
	const router = Router();
	router.patch("/:id/status", requireApiKey, adminOnly, async (req: ApiKeyRequest, res: Response) => {
		try {
			const { status } = req.body as { status?: string };
			const validStatuses: TalentStatus[] = ["approved", "rejected", "suspended", "pending"];
			if (!status || !validStatuses.includes(status as TalentStatus)) {
				res.status(400).json({ error: "invalid_status", valid: validStatuses });
				return;
			}
			await service.setTalentStatus(req.params.id, status as TalentStatus);
			res.json({ success: true, status });
		} catch {
			res.status(500).json({ error: "internal_error" });
		}
	});
	return router;
}
