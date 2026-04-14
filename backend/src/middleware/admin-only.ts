import type { NextFunction, Request, Response } from "express";

import type { ApiKeyRequest } from "@/middleware/api-key-auth";

export function adminOnly(req: Request, res: Response, next: NextFunction): void {
	const user = (req as ApiKeyRequest).claraUser;
	if (!user || user.role !== "admin") {
		res.status(403).json({ error: "admin_required" });
		return;
	}
	next();
}
