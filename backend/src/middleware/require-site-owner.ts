import type { NextFunction, Request, Response } from "express";
import type { ApiKeyRequest } from "@/middleware/api-key-auth";
import { SiteAgentDeployment } from "@/models/SiteAgentDeployment";

type SiteOwnerRequest = ApiKeyRequest & Request & { deployment?: SiteAgentDeployment | null };

export async function requireSiteOwner(req: SiteOwnerRequest, res: Response, next: NextFunction): Promise<void> {
	const userId = req.claraUser?.userId;
	if (!userId) {
		res.status(401).json({ error: "unauthorized" });
		return;
	}
	const did = (req.params.deploymentId as string) ?? (req.body as { deployment_id?: string }).deployment_id;
	if (!did) {
		res.status(400).json({ error: "deploymentId_required" });
		return;
	}
	const deployment = await SiteAgentDeployment.findByPk(did);
	if (!deployment) {
		res.status(404).json({ error: "deployment_not_found" });
		return;
	}
	if (deployment.siteOwnerUserId !== userId) {
		res.status(403).json({ error: "not_site_owner" });
		return;
	}
	req.deployment = deployment;
	next();
}
